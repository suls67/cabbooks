import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { getCurrentDriver } from '../lib/driverAuth'
import { supabase } from '../supabaseClient'
import styles from '../styles/hmrc-business-details.module.css'

const DEFAULT_TAX_YEAR = '2025-26'
const TAX_YEAR_PATTERN = /^2[0-9]{3}-[0-9]{2}$/

export default function HmrcBusinessDetails() {
  const router = useRouter()
  const [driver, setDriver] = useState(null)
  const [taxYear, setTaxYear] = useState(DEFAULT_TAX_YEAR)
  const [status, setStatus] = useState({ type: '', text: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)

  const [details, setDetails] = useState(null)
  const [accountingType, setAccountingType] = useState(null)
  const [businessId, setBusinessId] = useState(null)

  // Editable form state
  const [chosenAccountingType, setChosenAccountingType] = useState('CASH')
  const [chosenQuarterlyType, setChosenQuarterlyType] = useState('standard')
  const [poaHas, setPoaHas] = useState(false)
  const [poaDates, setPoaDates] = useState([{ startDate: '', endDate: '' }])

  const [savingAccounting, setSavingAccounting] = useState(false)
  const [savingQuarterly, setSavingQuarterly] = useState(false)
  const [savingPoa, setSavingPoa] = useState(false)

  // Soft-lock: once HMRC holds an accounting type, keep it read-only until the
  // driver explicitly chooses to change it (guards against accidental resets).
  const [accountingUnlocked, setAccountingUnlocked] = useState(false)

  useEffect(() => {
    async function loadDriver() {
      try {
        const currentDriver = await getCurrentDriver(supabase)
        setDriver(currentDriver)
      } catch (error) {
        const text = error instanceof Error ? error.message : 'Could not load your driver profile.'
        setStatus({ type: 'error', text })
        if (text === 'No signed-in user was found') router.push('/login')
      }
    }
    loadDriver()
  }, [router])

  async function getAccessToken() {
    const { data: sessionData } = await supabase.auth.getSession()
    return sessionData.session?.access_token || null
  }

  async function authFetch(url, options = {}) {
    const accessToken = await getAccessToken()
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

  async function handleLoad() {
    setStatus({ type: '', text: '' })

    if (!TAX_YEAR_PATTERN.test(taxYear)) {
      setStatus({ type: 'error', text: 'Enter a tax year in the format YYYY-YY, e.g. 2025-26.' })
      return
    }

    setIsLoading(true)

    try {
      // Resolve business details (and the businessId) first, then reuse that
      // businessId for the follow-up reads so we don't repeat the HMRC business
      // list lookup on every call (which quickly hits the sandbox rate limit).
      const detailsRes = await authFetch('/api/hmrc/businessDetails')
      const detailsData = await detailsRes.json()
      if (!detailsRes.ok) throw new Error(detailsData.error || 'Could not load business details.')

      const resolvedBusinessId = detailsData.businessId
      setBusinessId(resolvedBusinessId)
      const idParam = resolvedBusinessId ? `&businessId=${resolvedBusinessId}` : ''

      const [accountingRes, poaRes] = await Promise.all([
        authFetch(`/api/hmrc/accountingType?taxYear=${taxYear}${idParam}`),
        authFetch(`/api/hmrc/periodsOfAccount?taxYear=${taxYear}${idParam}`)
      ])

      const accountingData = await accountingRes.json()
      const poaData = await poaRes.json()

      setDetails(detailsData)
      setAccountingType(accountingRes.ok ? accountingData : null)

      // Seed the editable fields from what HMRC currently holds.
      if (accountingRes.ok && accountingData.accountingType) {
        setChosenAccountingType(accountingData.accountingType)
      }
      // A freshly loaded record starts locked when HMRC already holds a value.
      setAccountingUnlocked(false)
      if (detailsData?.quarterlyTypeChoice?.quarterlyPeriodType) {
        setChosenQuarterlyType(detailsData.quarterlyTypeChoice.quarterlyPeriodType)
      }
      if (poaRes.ok && poaData.periodsOfAccount) {
        setPoaHas(true)
        if (Array.isArray(poaData.periodsOfAccountDates) && poaData.periodsOfAccountDates.length > 0) {
          setPoaDates(poaData.periodsOfAccountDates.map(({ startDate, endDate }) => ({ startDate, endDate })))
        }
      } else {
        setPoaHas(false)
      }

      setHasLoaded(true)
      setStatus({ type: 'success', text: 'Loaded the latest business record from HMRC.' })
    } catch (error) {
      setStatus({ type: 'error', text: error instanceof Error ? error.message : 'Could not load from HMRC.' })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSaveAccountingType() {
    setStatus({ type: '', text: '' })
    setSavingAccounting(true)
    try {
      const response = await authFetch('/api/hmrc/accountingType', {
        method: 'PUT',
        body: JSON.stringify({ taxYear, accountingType: chosenAccountingType, businessId })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Could not update the accounting type.')
      setAccountingType({ ...(accountingType || {}), accountingType: chosenAccountingType, taxYear })
      setAccountingUnlocked(false)
      setStatus({ type: 'success', text: `Accounting type saved as ${chosenAccountingType}.` })
    } catch (error) {
      setStatus({ type: 'error', text: error instanceof Error ? error.message : 'Could not update the accounting type.' })
    } finally {
      setSavingAccounting(false)
    }
  }

  async function handleSaveQuarterlyType() {
    setStatus({ type: '', text: '' })
    setSavingQuarterly(true)
    try {
      const response = await authFetch('/api/hmrc/quarterlyPeriodType', {
        method: 'PUT',
        body: JSON.stringify({ taxYear, quarterlyPeriodType: chosenQuarterlyType, businessId })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Could not set the quarterly period type.')
      setStatus({
        type: 'success',
        text: `Quarterly period type set to ${chosenQuarterlyType} for ${taxYear}.`
      })
    } catch (error) {
      setStatus({ type: 'error', text: error instanceof Error ? error.message : 'Could not set the quarterly period type.' })
    } finally {
      setSavingQuarterly(false)
    }
  }

  async function handleSavePeriodsOfAccount() {
    setStatus({ type: '', text: '' })
    setSavingPoa(true)
    try {
      const payload = { taxYear, periodsOfAccount: poaHas, businessId }
      if (poaHas) {
        const cleaned = poaDates.filter((d) => d.startDate && d.endDate)
        if (cleaned.length === 0) {
          throw new Error('Add at least one period with a start and end date.')
        }
        payload.periodsOfAccountDates = cleaned
      }

      const response = await authFetch('/api/hmrc/periodsOfAccount', {
        method: 'PUT',
        body: JSON.stringify(payload)
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Could not save periods of account.')

      setStatus({ type: 'success', text: 'Periods of account saved.' })
    } catch (error) {
      setStatus({ type: 'error', text: error instanceof Error ? error.message : 'Could not save periods of account.' })
    } finally {
      setSavingPoa(false)
    }
  }

  function updatePoaDate(index, field, value) {
    setPoaDates((prev) => prev.map((d, i) => (i === index ? { ...d, [field]: value } : d)))
  }

  function addPoaRow() {
    setPoaDates((prev) => [...prev, { startDate: '', endDate: '' }])
  }

  function removePoaRow(index) {
    setPoaDates((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev))
  }

  const businessAddress = details
    ? [
        details.businessAddressLineOne,
        details.businessAddressLineTwo,
        details.businessAddressLineThree,
        details.businessAddressLineFour,
        details.businessAddressPostcode
      ]
        .filter(Boolean)
        .join(', ')
    : ''

  return (
    <div className={styles.container}>
      <div className={styles.shell}>
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>HMRC business details</p>
            <h1>Business record</h1>
            <p className={styles.subtitle}>
              Review the details HMRC holds for your business and set your accounting type,
              quarterly period type, and periods of account for the year.
            </p>
          </div>
          <Link href="/hmrc" className={styles.backLink}>Back to HMRC</Link>
        </div>

        <div className={styles.card}>
          <div className={styles.summary}>
            <div>
              <span className={styles.label}>Driver</span>
              <strong>{driver?.name || 'Loading...'}</strong>
            </div>
            <div>
              <span className={styles.label}>NINO</span>
              <strong>{driver?.nino || 'Missing'}</strong>
            </div>
          </div>

          <div className={styles.loadRow}>
            <label className={styles.field}>
              <span className={styles.label}>Tax year</span>
              <input
                className={styles.input}
                value={taxYear}
                onChange={(e) => setTaxYear(e.target.value.trim())}
                placeholder="2025-26"
              />
            </label>
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={handleLoad}
              disabled={isLoading || !driver?.nino}
            >
              {isLoading ? 'Loading...' : 'Load business record'}
            </button>
          </div>

          {status.text && (
            <div className={status.type === 'error' ? styles.error : styles.success}>{status.text}</div>
          )}

          {hasLoaded && details && (
            <>
              {/* Business details */}
              <section className={styles.section}>
                <p className={styles.sectionEyebrow}>Details</p>
                <h2 className={styles.sectionTitle}>What HMRC holds</h2>
                <div className={styles.detailGrid}>
                  <div><span className={styles.label}>Business ID</span><strong>{details.businessId || '—'}</strong></div>
                  <div><span className={styles.label}>Type</span><strong>{details.typeOfBusiness || '—'}</strong></div>
                  <div><span className={styles.label}>Trading name</span><strong>{details.tradingName || '—'}</strong></div>
                  <div><span className={styles.label}>Commencement</span><strong>{details.commencementDate || '—'}</strong></div>
                  {details.cessationDate && (
                    <div><span className={styles.label}>Cessation</span><strong>{details.cessationDate}</strong></div>
                  )}
                  {businessAddress && (
                    <div className={styles.detailWide}><span className={styles.label}>Address</span><strong>{businessAddress}</strong></div>
                  )}
                  {Array.isArray(details.accountingPeriods) && details.accountingPeriods.length > 0 && (
                    <div className={styles.detailWide}>
                      <span className={styles.label}>Accounting period</span>
                      <strong>{details.accountingPeriods[0].start} to {details.accountingPeriods[0].end}</strong>
                    </div>
                  )}
                </div>
              </section>

              {/* Accounting type */}
              <section className={styles.section}>
                <p className={styles.sectionEyebrow}>Accounting type</p>
                <h2 className={styles.sectionTitle}>How you record income</h2>
                <p className={styles.help}>
                  <strong>Cash</strong> — count money when it actually comes in or goes out.{' '}
                  <strong>Accrual</strong> — count income and expenses when they happen, even if unpaid.
                  Most taxi drivers use Cash. This can be changed after the tax year ends, before final declaration.
                </p>
                {accountingType?.accountingType && !accountingUnlocked ? (
                  <div className={styles.lockedRow}>
                    <div>
                      <span className={styles.label}>Current setting</span>
                      <strong>
                        {accountingType.accountingType === 'CASH' ? 'Cash basis' : 'Accrual (traditional)'}
                      </strong>
                    </div>
                    <button
                      type="button"
                      className={styles.changeBtn}
                      onClick={() => {
                        if (
                          window.confirm(
                            'Your accounting type is already set. Only change it if you picked the wrong option — it should not be switched back and forth mid-year. Continue?'
                          )
                        ) {
                          setAccountingUnlocked(true)
                        }
                      }}
                    >
                      Change accounting type
                    </button>
                  </div>
                ) : (
                  <>
                    <div className={styles.choiceRow}>
                      {['CASH', 'ACCRUAL'].map((type) => (
                        <button
                          key={type}
                          type="button"
                          className={`${styles.choice} ${chosenAccountingType === type ? styles.choiceActive : ''}`}
                          onClick={() => setChosenAccountingType(type)}
                        >
                          {type === 'CASH' ? 'Cash basis' : 'Accrual (traditional)'}
                        </button>
                      ))}
                    </div>
                    <div className={styles.choiceRow}>
                      <button
                        type="button"
                        className={styles.saveBtn}
                        onClick={handleSaveAccountingType}
                        disabled={savingAccounting}
                      >
                        {savingAccounting ? 'Saving...' : 'Save accounting type'}
                      </button>
                      {accountingType?.accountingType && (
                        <button
                          type="button"
                          className={styles.cancelBtn}
                          onClick={() => {
                            setChosenAccountingType(accountingType.accountingType)
                            setAccountingUnlocked(false)
                          }}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </>
                )}
              </section>

              {/* Quarterly period type */}
              <section className={styles.section}>
                <p className={styles.sectionEyebrow}>Quarterly period type</p>
                <h2 className={styles.sectionTitle}>When your quarters start</h2>
                <p className={styles.help}>
                  <strong>Standard</strong> — quarters start 6 April. <strong>Calendar</strong> — quarters start 1 April.
                  This locks for the year once your first quarterly update is submitted.
                </p>
                <div className={styles.choiceRow}>
                  {['standard', 'calendar'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      className={`${styles.choice} ${chosenQuarterlyType === type ? styles.choiceActive : ''}`}
                      onClick={() => setChosenQuarterlyType(type)}
                    >
                      {type === 'standard' ? 'Standard (6 April)' : 'Calendar (1 April)'}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className={styles.saveBtn}
                  onClick={handleSaveQuarterlyType}
                  disabled={savingQuarterly}
                >
                  {savingQuarterly ? 'Saving...' : 'Save quarterly period type'}
                </button>
              </section>

              {/* Periods of account */}
              <section className={styles.section}>
                <p className={styles.sectionEyebrow}>Periods of account</p>
                <h2 className={styles.sectionTitle}>Declare before final declaration</h2>
                <p className={styles.help}>
                  Most sole-trader drivers do not have periods of account — leave this set to “No”.
                  Only choose “Yes” if your accounting period differs from the standard tax year.
                </p>
                <div className={styles.choiceRow}>
                  <button
                    type="button"
                    className={`${styles.choice} ${!poaHas ? styles.choiceActive : ''}`}
                    onClick={() => setPoaHas(false)}
                  >
                    No periods of account
                  </button>
                  <button
                    type="button"
                    className={`${styles.choice} ${poaHas ? styles.choiceActive : ''}`}
                    onClick={() => setPoaHas(true)}
                  >
                    I have periods of account
                  </button>
                </div>

                {poaHas && (
                  <div className={styles.poaDates}>
                    {poaDates.map((entry, index) => (
                      <div key={index} className={styles.poaRow}>
                        <label className={styles.field}>
                          <span className={styles.label}>Start date</span>
                          <input
                            type="date"
                            className={styles.input}
                            value={entry.startDate}
                            onChange={(e) => updatePoaDate(index, 'startDate', e.target.value)}
                          />
                        </label>
                        <label className={styles.field}>
                          <span className={styles.label}>End date</span>
                          <input
                            type="date"
                            className={styles.input}
                            value={entry.endDate}
                            onChange={(e) => updatePoaDate(index, 'endDate', e.target.value)}
                          />
                        </label>
                        {poaDates.length > 1 && (
                          <button type="button" className={styles.removeBtn} onClick={() => removePoaRow(index)}>
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                    <button type="button" className={styles.addBtn} onClick={addPoaRow}>
                      + Add another period
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  className={styles.saveBtn}
                  onClick={handleSavePeriodsOfAccount}
                  disabled={savingPoa}
                >
                  {savingPoa ? 'Saving...' : 'Save periods of account'}
                </button>
              </section>

              <div className={styles.nextStep}>
                <p className={styles.nextStepText}>
                  Once your business record looks right, review your obligations for the year.
                </p>
                <Link href="/hmrc-obligations" className={styles.nextStepLink}>View obligations</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
