import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { getCurrentDriver } from '../lib/driverAuth'
import { supabase } from '../supabaseClient'
import styles from '../styles/hmrc-losses.module.css'

const DEFAULT_TAX_YEAR = '2026-27'
const TAX_YEAR_PATTERN = /^2[0-9]{3}-[0-9]{2}$/

// The three amounts inside carryBackLossesDecrease.
const AMOUNT_FIELDS = [
  { key: 'incomeTax', label: 'Income Tax decrease' },
  { key: 'class4', label: 'Class 4 NIC decrease' },
  { key: 'capitalGainsTax', label: 'Capital Gains Tax decrease' }
]

const emptyValues = () => Object.fromEntries(AMOUNT_FIELDS.map((f) => [f.key, '']))

export default function HmrcTaxAdjustments() {
  const router = useRouter()
  const [driver, setDriver] = useState(null)
  const [taxYear, setTaxYear] = useState(DEFAULT_TAX_YEAR)
  const [values, setValues] = useState(emptyValues())
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
      setStatus({ type: 'error', text: 'The Tax Liability Adjustments API only supports 2026-27 onwards.' })
      return false
    }
    return true
  }

  function applyLoaded(carryBack = {}) {
    const next = emptyValues()
    for (const { key } of AMOUNT_FIELDS) {
      const v = carryBack?.[key]
      next[key] = v === undefined || v === null ? '' : v
    }
    setValues(next)
  }

  async function handleLoad() {
    setStatus({ type: '', text: '' })
    if (!validate()) return
    setBusy('load')
    try {
      const response = await authFetch(`/api/hmrc/taxLiabilityAdjustments?taxYear=${taxYear}`)
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Could not load tax liability adjustments.')

      if (data.noData) {
        applyLoaded({})
        setStatus({ type: 'success', text: 'No adjustments held yet for this year — enter them below.' })
      } else {
        applyLoaded(data.carryBackLossesDecrease)
        setStatus({ type: 'success', text: 'Loaded the latest adjustments from HMRC.' })
      }
    } catch (error) {
      setStatus({ type: 'error', text: error instanceof Error ? error.message : 'Could not load from HMRC.' })
    } finally {
      setBusy('')
    }
  }

  // Build the carryBackLossesDecrease object from filled fields only.
  function buildCarryBack() {
    const out = {}
    for (const { key } of AMOUNT_FIELDS) {
      const raw = values[key]
      if (raw === '' || raw === undefined || raw === null) continue
      const num = Number(raw)
      if (!Number.isFinite(num)) continue
      out[key] = num
    }
    return out
  }

  async function handleSave() {
    setStatus({ type: '', text: '' })
    if (!validate()) return

    const carryBack = buildCarryBack()
    if (Object.keys(carryBack).length === 0) {
      setStatus({ type: 'error', text: 'Enter at least one adjustment amount before submitting.' })
      return
    }

    setBusy('save')
    try {
      const response = await authFetch('/api/hmrc/taxLiabilityAdjustments', {
        method: 'PUT',
        body: JSON.stringify({
          taxYear,
          suspendTemporalValidations: suspendValidations,
          carryBackLossesDecrease: carryBack
        })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'HMRC rejected the submission.')
      setStatus({ type: 'success', text: 'Tax liability adjustments submitted to HMRC.' })
    } catch (error) {
      setStatus({ type: 'error', text: error instanceof Error ? error.message : 'Could not submit to HMRC.' })
    } finally {
      setBusy('')
    }
  }

  async function handleDelete() {
    setStatus({ type: '', text: '' })
    if (!validate()) return
    if (!window.confirm(`Delete all tax liability adjustments held by HMRC for ${taxYear}? This cannot be undone.`)) {
      return
    }

    setBusy('delete')
    try {
      const response = await authFetch('/api/hmrc/taxLiabilityAdjustments', {
        method: 'DELETE',
        body: JSON.stringify({ taxYear })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Could not delete adjustments.')
      applyLoaded({})
      setStatus({ type: 'success', text: 'Tax liability adjustments deleted from HMRC.' })
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
            <p className={styles.eyebrow}>HMRC tax liability adjustments</p>
            <h1>Tax liability adjustments</h1>
            <p className={styles.subtitle}>
              Reduce this year&apos;s tax liability where current-year losses are carried back to an
              earlier year (2026-27 onwards).
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
            <button type="button" className={styles.primaryBtn} onClick={handleLoad} disabled={busy === 'load' || !driver?.nino}>
              {busy === 'load' ? 'Loading...' : 'Load adjustments'}
            </button>
          </div>

          <p className={styles.hint}>
            These adjustments apply at your individual (NINO) level, not to a single business. When
            you claim a carry-back-losses decrease here, submit the matching loss in the losses &amp;
            claims screen before your final declaration.
          </p>

          {status.text && (
            <div className={status.type === 'error' ? styles.error : styles.success}>{status.text}</div>
          )}

          {/* Carry-back losses decrease */}
          <section className={styles.section}>
            <p className={styles.sectionEyebrow}>Carry-back losses decrease</p>
            <h2 className={styles.sectionTitle}>Amounts to reduce liability by</h2>
            <div className={styles.twoCol}>
              {AMOUNT_FIELDS.map(({ key, label }) => (
                <label key={key} className={styles.moneyField}>
                  <span className={styles.moneyLabel}>{label}</span>
                  <input type="number" step="0.01" className={styles.input} value={values[key]} onChange={(e) => setField(key, e.target.value)} placeholder="0.00" />
                </label>
              ))}
            </div>
          </section>

          <label className={styles.checkboxRow}>
            <input type="checkbox" checked={suspendValidations} onChange={(e) => setSuspendValidations(e.target.checked)} />
            <span>
              Relax tax-year-ended validation (sandbox only). Adjustments are an end-of-year
              submission; keep this ticked to test before the current tax year has ended. Ignored in
              production.
            </span>
          </label>

          <div className={styles.actionsRow}>
            <button type="button" className={styles.saveBtn} onClick={handleSave} disabled={busy === 'save'}>
              {busy === 'save' ? 'Submitting...' : 'Submit adjustments'}
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
