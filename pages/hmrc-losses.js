import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { getCurrentDriver } from '../lib/driverAuth'
import { supabase } from '../supabaseClient'
import styles from '../styles/hmrc-losses.module.css'

const DEFAULT_TAX_YEAR = '2026-27'
const TAX_YEAR_PATTERN = /^2[0-9]{3}-[0-9]{2}$/

// Every numeric field, keyed by its full path in the HMRC body.
const CLAIM_FIELDS = [
  { key: 'claims.carryBack.previousYearGeneralIncome', label: 'Carry back — previous year general income' },
  { key: 'claims.carryBack.earlyYearLosses', label: 'Carry back — early year losses' },
  { key: 'claims.carrySideways.currentYearGeneralIncome', label: 'Carry sideways — current year general income' },
  { key: 'claims.carryForward.currentYearLosses', label: 'Carry forward — current year losses' },
  { key: 'claims.carryForward.previousYearsLosses', label: "Carry forward — previous years' losses" }
]
const LOSS_FIELDS = [
  { key: 'losses.broughtForwardLosses', label: 'Brought forward losses' }
]
const ALL_FIELDS = [...CLAIM_FIELDS, ...LOSS_FIELDS]

const APPLY_FIRST_OPTIONS = [
  { value: '', label: 'Not set' },
  { value: 'carry-sideways', label: 'Carry sideways' },
  { value: 'carry-forward', label: 'Carry forward' }
]

// Read/write a value at a dotted path within a nested object.
function getDeep(obj, path) {
  return path.split('.').reduce((cur, key) => (cur == null ? undefined : cur[key]), obj)
}
function setDeep(obj, path, value) {
  const parts = path.split('.')
  let cur = obj
  for (let i = 0; i < parts.length - 1; i += 1) {
    cur[parts[i]] = cur[parts[i]] || {}
    cur = cur[parts[i]]
  }
  cur[parts[parts.length - 1]] = value
}

const emptyValues = () => Object.fromEntries(ALL_FIELDS.map((f) => [f.key, '']))

export default function HmrcLosses() {
  const router = useRouter()
  const [driver, setDriver] = useState(null)
  const [taxYear, setTaxYear] = useState(DEFAULT_TAX_YEAR)
  const [businessId, setBusinessId] = useState('')
  const [values, setValues] = useState(emptyValues())
  const [applyFirst, setApplyFirst] = useState('')
  const [suspendValidations, setSuspendValidations] = useState(true)
  const [status, setStatus] = useState({ type: '', text: '' })
  const [busy, setBusy] = useState('')

  useEffect(() => {
    async function loadDriver() {
      try {
        setDriver(await getCurrentDriver(supabase))
      } catch (error) {
        const text = error instanceof Error ? error.message : 'Could not load your driver profile.'
        setStatus({ type: 'error', text })
        if (text === 'No signed-in user was found') router.push('/login')
      }
    }
    loadDriver()
  }, [router])

  async function authFetch(url, options = {}) {
    const { data: sessionData } = await supabase.auth.getSession()
    const accessToken = sessionData.session?.access_token
    if (!accessToken) throw new Error('You need to be signed in to talk to HMRC.')
    return fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers
      }
    })
  }

  function validate() {
    if (!TAX_YEAR_PATTERN.test(taxYear)) {
      setStatus({ type: 'error', text: 'Enter a tax year in the format YYYY-YY, e.g. 2026-27.' })
      return false
    }
    if (Number(taxYear.slice(0, 4)) < 2026) {
      setStatus({ type: 'error', text: 'The Individual Losses API only supports 2026-27 onwards.' })
      return false
    }
    return true
  }

  function idParam() {
    return businessId ? `&businessId=${businessId}` : ''
  }

  // Assemble the { claims, losses } payload from the flat state, keeping only
  // the fields the driver actually filled in.
  function buildPayload() {
    const root = {}
    for (const { key } of ALL_FIELDS) {
      const raw = values[key]
      if (raw === '' || raw === undefined || raw === null) continue
      const num = Number(raw)
      if (!Number.isFinite(num)) continue
      setDeep(root, key, num)
    }
    if (applyFirst) setDeep(root, 'claims.preferenceOrder.applyFirst', applyFirst)
    return root
  }

  function applyLoaded(data) {
    const next = emptyValues()
    for (const { key } of ALL_FIELDS) {
      const v = getDeep(data, key)
      next[key] = v === undefined || v === null ? '' : v
    }
    setValues(next)
    setApplyFirst(getDeep(data, 'claims.preferenceOrder.applyFirst') || '')
  }

  async function handleLoad() {
    setStatus({ type: '', text: '' })
    if (!validate()) return
    setBusy('load')
    try {
      const response = await authFetch(`/api/hmrc/losses?taxYear=${taxYear}${idParam()}`)
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Could not load losses and claims.')

      if (data.businessId) setBusinessId(data.businessId)

      if (data.noData) {
        applyLoaded({})
        setStatus({ type: 'success', text: 'No losses or claims held yet for this year — enter them below.' })
      } else {
        applyLoaded(data)
        setStatus({ type: 'success', text: 'Loaded the latest losses and claims from HMRC.' })
      }
    } catch (error) {
      setStatus({ type: 'error', text: error instanceof Error ? error.message : 'Could not load from HMRC.' })
    } finally {
      setBusy('')
    }
  }

  async function handleSave() {
    setStatus({ type: '', text: '' })
    if (!validate()) return

    const payload = buildPayload()
    if (!payload.claims && !payload.losses) {
      setStatus({ type: 'error', text: 'Enter at least one claim or loss figure before submitting.' })
      return
    }

    setBusy('save')
    try {
      const response = await authFetch('/api/hmrc/losses', {
        method: 'PUT',
        body: JSON.stringify({
          taxYear,
          businessId: businessId || undefined,
          suspendTemporalValidations: suspendValidations,
          ...payload
        })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'HMRC rejected the submission.')
      setStatus({ type: 'success', text: 'Losses and claims submitted to HMRC.' })
    } catch (error) {
      setStatus({ type: 'error', text: error instanceof Error ? error.message : 'Could not submit to HMRC.' })
    } finally {
      setBusy('')
    }
  }

  async function handleDelete() {
    setStatus({ type: '', text: '' })
    if (!validate()) return
    if (!window.confirm(`Delete all losses and claims held by HMRC for ${taxYear}? This cannot be undone.`)) {
      return
    }

    setBusy('delete')
    try {
      const response = await authFetch('/api/hmrc/losses', {
        method: 'DELETE',
        body: JSON.stringify({ taxYear, businessId: businessId || undefined })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Could not delete losses and claims.')
      applyLoaded({})
      setStatus({ type: 'success', text: 'Losses and claims deleted from HMRC.' })
    } catch (error) {
      setStatus({ type: 'error', text: error instanceof Error ? error.message : 'Could not delete from HMRC.' })
    } finally {
      setBusy('')
    }
  }

  function setField(key, value) {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className={styles.container}>
      <div className={styles.shell}>
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>HMRC individual losses</p>
            <h1>Losses &amp; claims</h1>
            <p className={styles.subtitle}>
              Record trading losses and how you want them relieved — carried back, set sideways
              against other income, or carried forward to future years (2026-27 onwards).
            </p>
          </div>
          <Link href="/hmrc" className={styles.backLink}>Back to HMRC</Link>
        </div>

        <div className={styles.card}>
          <div className={styles.topRow}>
            <label className={styles.field}>
              <span className={styles.label}>Tax year</span>
              <input className={styles.input} value={taxYear} onChange={(e) => setTaxYear(e.target.value.trim())} placeholder="2026-27" />
            </label>
            <label className={styles.field}>
              <span className={styles.label}>Business ID</span>
              <input className={styles.input} value={businessId} onChange={(e) => setBusinessId(e.target.value.trim())} placeholder="Auto-detected, or enter manually" />
            </label>
            <button type="button" className={styles.primaryBtn} onClick={handleLoad} disabled={busy === 'load' || !driver?.nino}>
              {busy === 'load' ? 'Loading...' : 'Load losses'}
            </button>
          </div>

          <p className={styles.hint}>
            Losses attach to a specific business income source. The business is detected
            automatically; override the ID above if you have more than one.
          </p>

          {status.text && (
            <div className={status.type === 'error' ? styles.error : styles.success}>{status.text}</div>
          )}

          {/* Brought forward losses */}
          <section className={styles.section}>
            <p className={styles.sectionEyebrow}>Losses</p>
            <h2 className={styles.sectionTitle}>Brought forward losses</h2>
            <p className={styles.hint}>
              Unused losses from earlier years carried into this year to set against current profits.
            </p>
            {LOSS_FIELDS.map(({ key, label }) => (
              <label key={key} className={styles.moneyField}>
                <span className={styles.moneyLabel}>{label}</span>
                <input type="number" step="0.01" className={styles.input} value={values[key]} onChange={(e) => setField(key, e.target.value)} placeholder="0.00" />
              </label>
            ))}
          </section>

          {/* Claims */}
          <section className={styles.section}>
            <p className={styles.sectionEyebrow}>Claims</p>
            <h2 className={styles.sectionTitle}>How to relieve this year&apos;s loss</h2>
            <div className={styles.twoCol}>
              {CLAIM_FIELDS.map(({ key, label }) => (
                <label key={key} className={styles.moneyField}>
                  <span className={styles.moneyLabel}>{label}</span>
                  <input type="number" step="0.01" className={styles.input} value={values[key]} onChange={(e) => setField(key, e.target.value)} placeholder="0.00" />
                </label>
              ))}
            </div>

            <label className={styles.field}>
              <span className={styles.label}>Apply first (preference order)</span>
              <select className={styles.input} value={applyFirst} onChange={(e) => setApplyFirst(e.target.value)}>
                {APPLY_FIRST_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </label>
          </section>

          <label className={styles.checkboxRow}>
            <input type="checkbox" checked={suspendValidations} onChange={(e) => setSuspendValidations(e.target.checked)} />
            <span>
              Relax tax-year-ended validation (sandbox only). Losses are an end-of-year submission;
              keep this ticked to test before the current tax year has ended. Ignored in production.
            </span>
          </label>

          <div className={styles.actionsRow}>
            <button type="button" className={styles.saveBtn} onClick={handleSave} disabled={busy === 'save'}>
              {busy === 'save' ? 'Submitting...' : 'Submit losses & claims'}
            </button>
            <button type="button" className={styles.deleteBtn} onClick={handleDelete} disabled={busy === 'delete'}>
              {busy === 'delete' ? 'Deleting...' : 'Delete for this year'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
