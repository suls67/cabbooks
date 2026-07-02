import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { getCurrentDriver } from '../lib/driverAuth'
import { supabase } from '../supabaseClient'
import styles from '../styles/hmrc-property-bsas.module.css'

const DEFAULT_TAX_YEAR = '2025-26'
const TAX_YEAR_PATTERN = /^2[0-9]{3}-[0-9]{2}$/

// Property type → HMRC typeOfBusiness + the retrieve scenario that returns real
// sandbox figures (DEFAULT returns "no data" for property, like the SE flow).
const TYPES = {
  uk: { typeOfBusiness: 'uk-property', label: 'UK property', retrieveScenario: 'UK_PROPERTY_PROFIT' },
  foreign: { typeOfBusiness: 'foreign-property', label: 'Foreign property', retrieveScenario: 'FOREIGN_PROPERTY_PROFIT' }
}

// Adjustable income fields differ slightly between UK and foreign; expenses match.
const UK_INCOME = [
  { key: 'totalRentsReceived', label: 'Total rents received' },
  { key: 'premiumsOfLeaseGrant', label: 'Premiums of lease grant' },
  { key: 'reversePremiums', label: 'Reverse premiums' },
  { key: 'otherPropertyIncome', label: 'Other property income' }
]
const FOREIGN_INCOME = [
  { key: 'totalRentsReceived', label: 'Total rents received' },
  { key: 'premiumsOfLeaseGrant', label: 'Premiums of lease grant' },
  { key: 'otherPropertyIncome', label: 'Other property income' }
]
const EXPENSES = [
  { key: 'premisesRunningCosts', label: 'Premises running costs' },
  { key: 'repairsAndMaintenance', label: 'Repairs & maintenance' },
  { key: 'financialCosts', label: 'Financial costs' },
  { key: 'professionalFees', label: 'Professional fees' },
  { key: 'costOfServices', label: 'Cost of services' },
  { key: 'residentialFinancialCost', label: 'Residential financial cost' },
  { key: 'other', label: 'Other expenses' },
  { key: 'travelCosts', label: 'Travel costs' }
]

const emptyValues = (fields) => Object.fromEntries(fields.map((f) => [f.key, '']))

// Keeps only filled, numeric fields.
function buildGroup(fields, values) {
  const out = {}
  for (const { key } of fields) {
    const raw = values[key]
    if (raw === '' || raw === undefined || raw === null) continue
    const num = Number(raw)
    if (Number.isFinite(num)) out[key] = num
  }
  return out
}

export default function HmrcPropertyBsas() {
  const router = useRouter()
  const [driver, setDriver] = useState(null)
  const [type, setType] = useState('uk')
  const [taxYear, setTaxYear] = useState(DEFAULT_TAX_YEAR)
  const [businessId, setBusinessId] = useState('')
  const [calculationId, setCalculationId] = useState('')
  const [summary, setSummary] = useState(null)
  const [summaries, setSummaries] = useState(null)

  const [adjustMode, setAdjustMode] = useState('itemised') // itemised | consolidated | zero
  const [countryCode, setCountryCode] = useState('FRA')
  const [income, setIncome] = useState(emptyValues(UK_INCOME))
  const [expenses, setExpenses] = useState(emptyValues(EXPENSES))
  const [consolidatedExpenses, setConsolidatedExpenses] = useState('')

  const [status, setStatus] = useState({ type: '', text: '' })
  const [busy, setBusy] = useState('')

  const incomeFields = type === 'uk' ? UK_INCOME : FOREIGN_INCOME

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

  async function callBsas(body) {
    const { data: sessionData } = await supabase.auth.getSession()
    const accessToken = sessionData.session?.access_token
    if (!accessToken) throw new Error('You need to be signed in to talk to HMRC.')
    const response = await fetch('/api/hmrc/bsas', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'HMRC request failed.')
    return data
  }

  function validate() {
    if (!TAX_YEAR_PATTERN.test(taxYear) || Number(taxYear.slice(0, 4)) < 2025) {
      setStatus({ type: 'error', text: 'Enter a tax year of 2025-26 or later.' })
      return false
    }
    return true
  }

  async function handleList() {
    setStatus({ type: '', text: '' })
    if (!validate()) return
    setBusy('list')
    try {
      const data = await callBsas({
        action: 'list',
        taxYear,
        typeOfBusiness: TYPES[type].typeOfBusiness,
        businessId: businessId || undefined
      })
      setSummaries(data.businessSources || [])
      setStatus({ type: 'success', text: `Found ${data.businessSources?.length || 0} business source(s).` })
    } catch (error) {
      setStatus({ type: 'error', text: error.message })
    } finally {
      setBusy('')
    }
  }

  async function handleTrigger() {
    setStatus({ type: '', text: '' })
    if (!validate()) return
    setBusy('trigger')
    try {
      const data = await callBsas({
        action: 'trigger',
        taxYear,
        typeOfBusiness: TYPES[type].typeOfBusiness,
        businessId: businessId || undefined
      })
      setCalculationId(data.calculationId)
      if (data.businessId) setBusinessId(data.businessId)
      setStatus({ type: 'success', text: `Summary triggered. Calculation ID: ${data.calculationId}` })
    } catch (error) {
      setStatus({ type: 'error', text: error.message })
    } finally {
      setBusy('')
    }
  }

  async function handleRetrieve() {
    setStatus({ type: '', text: '' })
    if (!validate()) return
    if (!calculationId) {
      setStatus({ type: 'error', text: 'Trigger a summary first, or paste a calculation ID.' })
      return
    }
    setBusy('retrieve')
    try {
      const data = await callBsas({
        action: 'retrieve',
        taxYear,
        typeOfBusiness: TYPES[type].typeOfBusiness,
        calculationId,
        scenario: TYPES[type].retrieveScenario
      })
      setSummary(data.summary)
      setStatus({ type: 'success', text: 'Retrieved the adjustable summary from HMRC.' })
    } catch (error) {
      setStatus({ type: 'error', text: error.message })
    } finally {
      setBusy('')
    }
  }

  // Assemble the type-specific adjustments body from the form state.
  function buildPayload() {
    if (adjustMode === 'zero') {
      return type === 'uk'
        ? { ukProperty: { zeroAdjustments: true } }
        : { foreignProperty: { zeroAdjustments: true } }
    }

    const incomeGroup = buildGroup(incomeFields, income)
    const expensesGroup =
      adjustMode === 'consolidated'
        ? (consolidatedExpenses !== '' && Number.isFinite(Number(consolidatedExpenses))
            ? { consolidatedExpenses: Number(consolidatedExpenses) }
            : {})
        : buildGroup(EXPENSES, expenses)

    if (Object.keys(incomeGroup).length === 0 && Object.keys(expensesGroup).length === 0) return null

    if (type === 'uk') {
      const ukProperty = {}
      if (Object.keys(incomeGroup).length) ukProperty.income = incomeGroup
      if (Object.keys(expensesGroup).length) ukProperty.expenses = expensesGroup
      return { ukProperty }
    }

    const country = { countryCode }
    if (Object.keys(incomeGroup).length) country.income = incomeGroup
    if (Object.keys(expensesGroup).length) country.expenses = expensesGroup
    return { foreignProperty: { countryLevelDetail: [country] } }
  }

  async function handleSubmit() {
    setStatus({ type: '', text: '' })
    if (!validate()) return
    if (!calculationId) {
      setStatus({ type: 'error', text: 'Trigger a summary first, or paste a calculation ID.' })
      return
    }
    if (type === 'foreign' && adjustMode !== 'zero' && !/^[A-Z]{3}$/.test(countryCode)) {
      setStatus({ type: 'error', text: 'Enter a 3-letter country code, e.g. FRA.' })
      return
    }

    const payload = buildPayload()
    if (!payload) {
      setStatus({ type: 'error', text: 'Enter at least one income or expense adjustment.' })
      return
    }

    setBusy('submit')
    try {
      const data = await callBsas({
        action: 'submit',
        taxYear,
        typeOfBusiness: TYPES[type].typeOfBusiness,
        calculationId,
        businessId: businessId || undefined,
        payload
      })
      setStatus({
        type: 'success',
        text: `Adjustments submitted to HMRC${data.correlationId ? ` (ref ${data.correlationId})` : ''}.`
      })
    } catch (error) {
      setStatus({ type: 'error', text: error.message })
    } finally {
      setBusy('')
    }
  }

  const money = (n) => (typeof n === 'number' ? `£${n.toLocaleString('en-GB', { minimumFractionDigits: 2 })}` : '—')
  const calc = summary?.adjustableSummaryCalculation

  return (
    <div className={styles.container}>
      <div className={styles.shell}>
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>HMRC property BSAS</p>
            <h1>Property accounting adjustments</h1>
            <p className={styles.subtitle}>
              For property income: generate a Business Source Adjustable Summary, review the figures
              HMRC calculated, and submit end-of-year accounting adjustments (2025-26 onwards).
            </p>
          </div>
          <Link href="/hmrc" className={styles.backLink}>Back to HMRC</Link>
        </div>

        <div className={styles.card}>
          <div className={styles.choiceRow}>
            {Object.entries(TYPES).map(([key, cfg]) => (
              <button
                key={key}
                type="button"
                className={`${styles.choice} ${type === key ? styles.choiceActive : ''}`}
                onClick={() => { setType(key); setSummary(null) }}
              >
                {cfg.label}
              </button>
            ))}
          </div>

          <div className={styles.topRow}>
            <label className={styles.field}>
              <span className={styles.label}>Tax year</span>
              <input className={styles.input} value={taxYear} onChange={(e) => setTaxYear(e.target.value.trim())} placeholder="2025-26" />
            </label>
            <label className={styles.field}>
              <span className={styles.label}>Property business ID</span>
              <input className={styles.input} value={businessId} onChange={(e) => setBusinessId(e.target.value.trim())} placeholder="Auto-detected, or enter manually" />
            </label>
          </div>

          <p className={styles.hint}>
            Property businesses have their own business ID, separate from self-employment. Enter it
            here if HMRC does not detect it automatically.
          </p>

          {status.text && (
            <div className={status.type === 'error' ? styles.error : styles.success}>{status.text}</div>
          )}

          {/* Step 1 — trigger + list */}
          <section className={styles.section}>
            <p className={styles.sectionEyebrow}>Step 1</p>
            <h2 className={styles.sectionTitle}>Generate a summary</h2>
            <div className={styles.btnRow}>
              <button type="button" className={styles.primaryBtn} onClick={handleTrigger} disabled={busy === 'trigger' || !driver?.nino}>
                {busy === 'trigger' ? 'Triggering...' : 'Trigger summary'}
              </button>
              <button type="button" className={styles.secondaryBtn} onClick={handleList} disabled={busy === 'list' || !driver?.nino}>
                {busy === 'list' ? 'Loading...' : 'List existing summaries'}
              </button>
            </div>

            <label className={styles.field}>
              <span className={styles.label}>Calculation ID</span>
              <input className={styles.input} value={calculationId} onChange={(e) => setCalculationId(e.target.value.trim())} placeholder="From trigger, or paste one" />
            </label>

            {summaries && summaries.length > 0 && (
              <div className={styles.summaryList}>
                {summaries.map((bs) => (
                  <div key={bs.businessId} className={styles.summaryListCard}>
                    <div><span className={styles.label}>{bs.typeOfBusiness}</span><strong>{bs.businessId}</strong></div>
                    {(bs.summaries || []).map((s) => (
                      <button key={s.calculationId} type="button" className={styles.calcPick} onClick={() => setCalculationId(s.calculationId)}>
                        Use {s.calculationId.slice(0, 8)}… ({s.summaryStatus})
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Step 2 — retrieve */}
          <section className={styles.section}>
            <p className={styles.sectionEyebrow}>Step 2</p>
            <h2 className={styles.sectionTitle}>Review the summary</h2>
            <button type="button" className={styles.primaryBtn} onClick={handleRetrieve} disabled={busy === 'retrieve' || !driver?.nino}>
              {busy === 'retrieve' ? 'Retrieving...' : 'Retrieve summary'}
            </button>
            <p className={styles.sandboxNote}>Sandbox returns canned figures via the {TYPES[type].retrieveScenario} scenario.</p>

            {calc && (
              <div className={styles.summaryGrid}>
                <div className={styles.summaryItem}><span className={styles.label}>Total income</span><strong>{money(calc.totalIncome)}</strong></div>
                <div className={styles.summaryItem}><span className={styles.label}>Total expenses</span><strong>{money(calc.totalExpenses)}</strong></div>
                <div className={styles.summaryItem}><span className={styles.label}>Net profit</span><strong>{money(calc.netProfit)}</strong></div>
                <div className={styles.summaryItem}><span className={styles.label}>Taxable profit</span><strong>{money(calc.taxableProfit)}</strong></div>
              </div>
            )}
          </section>

          {/* Step 3 — submit adjustments */}
          <section className={styles.section}>
            <p className={styles.sectionEyebrow}>Step 3</p>
            <h2 className={styles.sectionTitle}>Submit adjustments</h2>

            <div className={styles.choiceRow}>
              {[['itemised', 'Itemised expenses'], ['consolidated', 'Consolidated expenses'], ['zero', 'No adjustments']].map(([mode, lbl]) => (
                <button key={mode} type="button" className={`${styles.choice} ${adjustMode === mode ? styles.choiceActive : ''}`} onClick={() => setAdjustMode(mode)}>
                  {lbl}
                </button>
              ))}
            </div>

            {adjustMode === 'zero' ? (
              <p className={styles.hint}>Declares that no accounting adjustments are needed for this summary.</p>
            ) : (
              <>
                {type === 'foreign' && (
                  <label className={styles.field}>
                    <span className={styles.label}>Country code</span>
                    <input className={styles.input} value={countryCode} onChange={(e) => setCountryCode(e.target.value.trim().toUpperCase())} placeholder="FRA" maxLength={3} />
                  </label>
                )}

                <div className={styles.twoCol}>
                  <div>
                    <h3 className={styles.groupTitle}>Income adjustments</h3>
                    {incomeFields.map(({ key, label }) => (
                      <label key={key} className={styles.moneyField}>
                        <span className={styles.moneyLabel}>{label}</span>
                        <input type="number" step="0.01" className={styles.input} value={income[key]} onChange={(e) => setIncome((p) => ({ ...p, [key]: e.target.value }))} placeholder="0.00" />
                      </label>
                    ))}
                  </div>
                  <div>
                    <h3 className={styles.groupTitle}>Expense adjustments</h3>
                    {adjustMode === 'consolidated' ? (
                      <label className={styles.moneyField}>
                        <span className={styles.moneyLabel}>Consolidated expenses</span>
                        <input type="number" step="0.01" className={styles.input} value={consolidatedExpenses} onChange={(e) => setConsolidatedExpenses(e.target.value)} placeholder="0.00" />
                      </label>
                    ) : (
                      EXPENSES.map(({ key, label }) => (
                        <label key={key} className={styles.moneyField}>
                          <span className={styles.moneyLabel}>{label}</span>
                          <input type="number" step="0.01" className={styles.input} value={expenses[key]} onChange={(e) => setExpenses((p) => ({ ...p, [key]: e.target.value }))} placeholder="0.00" />
                        </label>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}

            <button type="button" className={styles.saveBtn} onClick={handleSubmit} disabled={busy === 'submit' || !driver?.nino}>
              {busy === 'submit' ? 'Submitting...' : 'Submit adjustments'}
            </button>
          </section>
        </div>
      </div>
    </div>
  )
}
