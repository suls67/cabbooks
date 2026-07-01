import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { getCurrentDriver } from '../lib/driverAuth'
import { supabase } from '../supabaseClient'
import styles from '../styles/hmrc-property.module.css'

const DEFAULT_TAX_YEAR = '2025-26'
const TAX_YEAR_PATTERN = /^2[0-9]{3}-[0-9]{2}$/

// UK property (non-FHL) cumulative fields. Dotted keys map to nested HMRC shape.
const INCOME_FIELDS = [
  { key: 'periodAmount', label: 'Rental income' },
  { key: 'premiumsOfLeaseGrant', label: 'Premiums of lease grant' },
  { key: 'reversePremiums', label: 'Reverse premiums' },
  { key: 'otherIncome', label: 'Other property income' },
  { key: 'taxDeducted', label: 'Tax deducted at source' },
  { key: 'rentARoom.rentsReceived', label: 'Rent-a-room rents received' }
]
const EXPENSE_FIELDS = [
  { key: 'premisesRunningCosts', label: 'Premises running costs' },
  { key: 'repairsAndMaintenance', label: 'Repairs & maintenance' },
  { key: 'financialCosts', label: 'Financial costs (mortgage interest)' },
  { key: 'professionalFees', label: 'Professional / legal fees' },
  { key: 'costOfServices', label: 'Cost of services' },
  { key: 'travelCosts', label: 'Travel costs' },
  { key: 'residentialFinancialCost', label: 'Residential financial cost' },
  { key: 'other', label: 'Other allowable expenses' },
  { key: 'rentARoom.amountClaimed', label: 'Rent-a-room amount claimed' }
]

// Build a nested { income, expenses } object from the flat dotted-key state,
// including only fields the user actually filled in.
function buildGroup(fields, values) {
  const out = {}
  for (const { key } of fields) {
    const raw = values[key]
    if (raw === '' || raw === undefined || raw === null) continue
    const num = Number(raw)
    if (!Number.isFinite(num)) continue
    if (key.includes('.')) {
      const [parent, child] = key.split('.')
      out[parent] = { ...(out[parent] || {}), [child]: num }
    } else {
      out[key] = num
    }
  }
  return out
}

// Flatten a nested HMRC group back into the flat dotted-key state for editing.
function flattenGroup(fields, group = {}) {
  const out = {}
  for (const { key } of fields) {
    if (key.includes('.')) {
      const [parent, child] = key.split('.')
      out[key] = group?.[parent]?.[child] ?? ''
    } else {
      out[key] = group?.[key] ?? ''
    }
  }
  return out
}

const emptyValues = (fields) => Object.fromEntries(fields.map((f) => [f.key, '']))

export default function HmrcProperty() {
  const router = useRouter()
  const [driver, setDriver] = useState(null)
  const [taxYear, setTaxYear] = useState(DEFAULT_TAX_YEAR)
  const [businessId, setBusinessId] = useState('')
  const [fromDate, setFromDate] = useState(`${DEFAULT_TAX_YEAR.slice(0, 4)}-04-06`)
  const [toDate, setToDate] = useState('')
  const [income, setIncome] = useState(emptyValues(INCOME_FIELDS))
  const [expenses, setExpenses] = useState(emptyValues(EXPENSE_FIELDS))
  const [allowance, setAllowance] = useState('')
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
      setStatus({ type: 'error', text: 'Enter a tax year in the format YYYY-YY, e.g. 2025-26.' })
      return false
    }
    if (Number(taxYear.slice(0, 4)) < 2025) {
      setStatus({ type: 'error', text: 'The cumulative property endpoint only supports 2025-26 onwards.' })
      return false
    }
    return true
  }

  function idParam() {
    return businessId ? `&businessId=${businessId}` : ''
  }

  async function handleLoad() {
    setStatus({ type: '', text: '' })
    if (!validate()) return
    setBusy('load')
    try {
      const [cumRes, annualRes] = await Promise.all([
        authFetch(`/api/hmrc/propertyCumulative?type=uk&taxYear=${taxYear}${idParam()}`),
        authFetch(`/api/hmrc/propertyAnnual?type=uk&taxYear=${taxYear}${idParam()}`)
      ])
      const cum = await cumRes.json()
      const annual = await annualRes.json()

      if (!cumRes.ok) throw new Error(cum.error || 'Could not load property figures.')

      if (cum.businessId) setBusinessId(cum.businessId)
      if (cum.fromDate) setFromDate(cum.fromDate)
      if (cum.toDate) setToDate(cum.toDate)
      setIncome({ ...emptyValues(INCOME_FIELDS), ...flattenGroup(INCOME_FIELDS, cum.ukProperty?.income) })
      setExpenses({ ...emptyValues(EXPENSE_FIELDS), ...flattenGroup(EXPENSE_FIELDS, cum.ukProperty?.expenses) })

      if (annualRes.ok && !annual.noData) {
        setAllowance(annual.ukProperty?.allowances?.propertyIncomeAllowance ?? '')
      }

      setStatus({
        type: 'success',
        text: cum.noData
          ? 'No cumulative figures held yet for this year — enter them below.'
          : 'Loaded the latest property figures from HMRC.'
      })
    } catch (error) {
      setStatus({ type: 'error', text: error instanceof Error ? error.message : 'Could not load from HMRC.' })
    } finally {
      setBusy('')
    }
  }

  async function handleSubmitCumulative() {
    setStatus({ type: '', text: '' })
    if (!validate()) return

    const incomeGroup = buildGroup(INCOME_FIELDS, income)
    const expensesGroup = buildGroup(EXPENSE_FIELDS, expenses)
    if (Object.keys(incomeGroup).length === 0 && Object.keys(expensesGroup).length === 0) {
      setStatus({ type: 'error', text: 'Enter at least one income or expense figure before submitting.' })
      return
    }

    const ukProperty = {}
    if (Object.keys(incomeGroup).length) ukProperty.income = incomeGroup
    if (Object.keys(expensesGroup).length) ukProperty.expenses = expensesGroup

    setBusy('cumulative')
    try {
      const response = await authFetch('/api/hmrc/propertyCumulative', {
        method: 'PUT',
        body: JSON.stringify({
          type: 'uk',
          taxYear,
          businessId: businessId || undefined,
          fromDate: fromDate || undefined,
          toDate: toDate || undefined,
          ukProperty
        })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'HMRC rejected the submission.')
      setStatus({ type: 'success', text: 'Property income & expenses submitted to HMRC.' })
    } catch (error) {
      setStatus({ type: 'error', text: error instanceof Error ? error.message : 'Could not submit to HMRC.' })
    } finally {
      setBusy('')
    }
  }

  async function handleSaveAllowance() {
    setStatus({ type: '', text: '' })
    if (!validate()) return
    const num = Number(allowance)
    if (allowance === '' || !Number.isFinite(num) || num < 0) {
      setStatus({ type: 'error', text: 'Enter a valid property income allowance (0 or more).' })
      return
    }
    setBusy('allowance')
    try {
      const response = await authFetch('/api/hmrc/propertyAnnual', {
        method: 'PUT',
        body: JSON.stringify({
          type: 'uk',
          taxYear,
          businessId: businessId || undefined,
          ukProperty: { allowances: { propertyIncomeAllowance: num } }
        })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Could not save the allowance.')
      setStatus({ type: 'success', text: 'Property income allowance saved.' })
    } catch (error) {
      setStatus({ type: 'error', text: error instanceof Error ? error.message : 'Could not save the allowance.' })
    } finally {
      setBusy('')
    }
  }

  function setIncomeField(key, value) {
    setIncome((prev) => ({ ...prev, [key]: value }))
  }
  function setExpenseField(key, value) {
    setExpenses((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className={styles.container}>
      <div className={styles.shell}>
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>HMRC property business</p>
            <h1>UK property income</h1>
            <p className={styles.subtitle}>
              For drivers who also let out a UK property. Submit your year-to-date rental income and
              expenses (2025-26 onwards) and set your annual property income allowance.
            </p>
          </div>
          <Link href="/hmrc" className={styles.backLink}>Back to HMRC</Link>
        </div>

        <div className={styles.card}>
          <div className={styles.topRow}>
            <label className={styles.field}>
              <span className={styles.label}>Tax year</span>
              <input className={styles.input} value={taxYear} onChange={(e) => setTaxYear(e.target.value.trim())} placeholder="2025-26" />
            </label>
            <label className={styles.field}>
              <span className={styles.label}>Property business ID</span>
              <input className={styles.input} value={businessId} onChange={(e) => setBusinessId(e.target.value.trim())} placeholder="Auto-detected, or enter manually" />
            </label>
            <button type="button" className={styles.primaryBtn} onClick={handleLoad} disabled={busy === 'load' || !driver?.nino}>
              {busy === 'load' ? 'Loading...' : 'Load figures'}
            </button>
          </div>

          <p className={styles.hint}>
            The property business ID is separate from your self-employment one. If you have a UK
            property registered with HMRC it is detected automatically; otherwise enter it here.
          </p>

          {status.text && (
            <div className={status.type === 'error' ? styles.error : styles.success}>{status.text}</div>
          )}

          {/* Cumulative income & expenses */}
          <section className={styles.section}>
            <p className={styles.sectionEyebrow}>Cumulative period</p>
            <h2 className={styles.sectionTitle}>Year-to-date income &amp; expenses</h2>

            <div className={styles.dateRow}>
              <label className={styles.field}>
                <span className={styles.label}>From date</span>
                <input type="date" className={styles.input} value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
              </label>
              <label className={styles.field}>
                <span className={styles.label}>To date</span>
                <input type="date" className={styles.input} value={toDate} onChange={(e) => setToDate(e.target.value)} />
              </label>
            </div>

            <div className={styles.twoCol}>
              <div>
                <h3 className={styles.groupTitle}>Income</h3>
                {INCOME_FIELDS.map(({ key, label }) => (
                  <label key={key} className={styles.moneyField}>
                    <span className={styles.moneyLabel}>{label}</span>
                    <input type="number" step="0.01" className={styles.input} value={income[key]} onChange={(e) => setIncomeField(key, e.target.value)} placeholder="0.00" />
                  </label>
                ))}
              </div>
              <div>
                <h3 className={styles.groupTitle}>Expenses</h3>
                {EXPENSE_FIELDS.map(({ key, label }) => (
                  <label key={key} className={styles.moneyField}>
                    <span className={styles.moneyLabel}>{label}</span>
                    <input type="number" step="0.01" className={styles.input} value={expenses[key]} onChange={(e) => setExpenseField(key, e.target.value)} placeholder="0.00" />
                  </label>
                ))}
              </div>
            </div>

            <button type="button" className={styles.saveBtn} onClick={handleSubmitCumulative} disabled={busy === 'cumulative'}>
              {busy === 'cumulative' ? 'Submitting...' : 'Submit income & expenses'}
            </button>
          </section>

          {/* Annual allowance */}
          <section className={styles.section}>
            <p className={styles.sectionEyebrow}>Annual</p>
            <h2 className={styles.sectionTitle}>Property income allowance</h2>
            <p className={styles.hint}>
              The £1,000 property allowance can be claimed instead of deducting actual expenses.
              Leave your expenses blank above if you claim this.
            </p>
            <div className={styles.allowanceRow}>
              <label className={styles.field}>
                <span className={styles.label}>Allowance (£)</span>
                <input type="number" step="0.01" className={styles.input} value={allowance} onChange={(e) => setAllowance(e.target.value)} placeholder="1000.00" />
              </label>
              <button type="button" className={styles.saveBtn} onClick={handleSaveAllowance} disabled={busy === 'allowance'}>
                {busy === 'allowance' ? 'Saving...' : 'Save allowance'}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
