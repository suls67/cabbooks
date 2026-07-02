import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { getCurrentDriver } from '../lib/driverAuth'
import { supabase } from '../supabaseClient'
import styles from '../styles/hmrc-assist.module.css'

function getClientHeaders(driver) {
  if (typeof window === 'undefined') return {}

  const existingDeviceId = window.localStorage.getItem('hmrcDeviceId')
  const deviceId = existingDeviceId || window.crypto?.randomUUID?.() || `device-${Date.now()}`

  if (!existingDeviceId) {
    window.localStorage.setItem('hmrcDeviceId', deviceId)
  }

  const timezoneOffsetMinutes = -new Date().getTimezoneOffset()
  const sign = timezoneOffsetMinutes >= 0 ? '+' : '-'
  const hours = String(Math.floor(Math.abs(timezoneOffsetMinutes) / 60)).padStart(2, '0')
  const minutes = String(Math.abs(timezoneOffsetMinutes) % 60).padStart(2, '0')

  return {
    'x-hmrc-device-id': deviceId,
    'x-hmrc-browser-user-agent': window.navigator.userAgent,
    'x-hmrc-timezone': `${sign}${hours}:${minutes}`,
    'x-hmrc-window-size': `width=${window.innerWidth}&height=${window.innerHeight}`,
    'x-hmrc-screens': `width=${window.screen.width}&height=${window.screen.height}&scaling-factor=${window.devicePixelRatio || 1}&colour-depth=${window.screen.colorDepth || 24}`,
    'x-hmrc-user-id': driver?.email || driver?.id || 'unknown-user'
  }
}

export default function HmrcAssist() {
  const router = useRouter()
  const [driver, setDriver] = useState(null)
  const [taxYear, setTaxYear] = useState('2025-26')
  const [calculations, setCalculations] = useState([])
  const [calculationId, setCalculationId] = useState('')
  const [report, setReport] = useState(null)
  const [acknowledged, setAcknowledged] = useState(false)
  const [status, setStatus] = useState({ type: '', text: '' })
  const [isProducing, setIsProducing] = useState(false)
  const [isAcknowledging, setIsAcknowledging] = useState(false)

  useEffect(() => {
    async function loadDriver() {
      try {
        const currentDriver = await getCurrentDriver(supabase)
        setDriver(currentDriver)

        // Pull the calculation IDs the app has already saved so the driver can
        // pick the one they want an Assist report for.
        const { data: rows } = await supabase
          .from('hmrc_calculations')
          .select('calculation_id, tax_year, calculation_type, status, submission_date')
          .eq('driver_id', currentDriver.id)
          .not('calculation_id', 'is', null)
          .order('submission_date', { ascending: false })

        const seen = new Set()
        const unique = (rows || []).filter((row) => {
          if (!row.calculation_id || seen.has(row.calculation_id)) return false
          seen.add(row.calculation_id)
          return true
        })

        setCalculations(unique)
        if (unique.length) {
          setCalculationId(unique[0].calculation_id)
          if (unique[0].tax_year) setTaxYear(unique[0].tax_year)
        }
      } catch (error) {
        const text = error instanceof Error ? error.message : 'Could not load your driver profile.'
        setStatus({ type: 'error', text })
        if (text === 'No signed-in user was found') {
          router.push('/login')
        }
      }
    }

    loadDriver()
  }, [router])

  async function getAccessToken() {
    const { data: sessionData } = await supabase.auth.getSession()
    return sessionData.session?.access_token || null
  }

  async function handleProduce(event) {
    event.preventDefault()
    setStatus({ type: '', text: '' })
    setReport(null)
    setAcknowledged(false)

    if (!calculationId.trim()) {
      setStatus({ type: 'error', text: 'Enter or select a calculation ID first.' })
      return
    }

    setIsProducing(true)

    const accessToken = await getAccessToken()
    if (!accessToken) {
      setStatus({ type: 'error', text: 'You need to be signed in before requesting an Assist report.' })
      setIsProducing(false)
      return
    }

    try {
      const response = await fetch('/api/hmrc/assistReport', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
          ...getClientHeaders(driver)
        },
        body: JSON.stringify({
          action: 'produce',
          taxYear,
          calculationId: calculationId.trim()
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setStatus({ type: 'error', text: data.error || 'Could not produce the Assist report.' })
        setIsProducing(false)
        return
      }

      if (data.status === 'calculation-pending') {
        setStatus({ type: 'info', text: data.message })
        setIsProducing(false)
        return
      }

      if (data.status === 'no-messages') {
        setReport({ messages: [] })
        setStatus({
          type: 'success',
          text: 'HMRC has no messages for this calculation. Nothing to review.'
        })
        setIsProducing(false)
        return
      }

      // has-messages
      setReport(data)
      setStatus({
        type: 'success',
        text: `HMRC returned ${data.messages.length} message${data.messages.length === 1 ? '' : 's'} for this calculation.`
      })
    } catch (error) {
      setStatus({
        type: 'error',
        text: error instanceof Error ? error.message : 'Could not produce the Assist report.'
      })
    }

    setIsProducing(false)
  }

  async function handleAcknowledge() {
    if (!report?.reportId || !report?.correlationId) {
      setStatus({ type: 'error', text: 'No report is available to acknowledge.' })
      return
    }

    setStatus({ type: '', text: '' })
    setIsAcknowledging(true)

    const accessToken = await getAccessToken()
    if (!accessToken) {
      setStatus({ type: 'error', text: 'You need to be signed in before acknowledging a report.' })
      setIsAcknowledging(false)
      return
    }

    try {
      const response = await fetch('/api/hmrc/assistReport', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
          ...getClientHeaders(driver)
        },
        body: JSON.stringify({
          action: 'acknowledge',
          reportId: report.reportId,
          correlationId: report.correlationId
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setStatus({ type: 'error', text: data.error || 'Could not acknowledge the report.' })
        setIsAcknowledging(false)
        return
      }

      setAcknowledged(true)
      setStatus({ type: 'success', text: 'Report acknowledged with HMRC. Thank you.' })
    } catch (error) {
      setStatus({
        type: 'error',
        text: error instanceof Error ? error.message : 'Could not acknowledge the report.'
      })
    }

    setIsAcknowledging(false)
  }

  const hasMessages = report && Array.isArray(report.messages) && report.messages.length > 0
  const noMessages = report && Array.isArray(report.messages) && report.messages.length === 0

  return (
    <div className={styles.container}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>HMRC Self Assessment Assist</p>
            <h1>Assist report</h1>
            <p className={styles.subtitle}>
              Ask HMRC whether it has any targeted feedback on your tax calculation. If there are
              messages, review them in full and then acknowledge that you have seen them.
            </p>
          </div>
          <Link href="/hmrc" className={styles.backLink}>
            ← Back to Income Tax
          </Link>
        </header>

        <section className={styles.card}>
          <p className={styles.sandboxNote}>
            Run this after a tax calculation has finished generating — requesting it too early
            returns a “calculation still generating” response.
          </p>

          {status.text ? <div className={styles[status.type] || styles.info}>{status.text}</div> : null}

          <form className={styles.form} onSubmit={handleProduce}>
            <div className={styles.field}>
              <label htmlFor="taxYear">Tax year</label>
              <input
                id="taxYear"
                type="text"
                value={taxYear}
                onChange={(event) => setTaxYear(event.target.value)}
                placeholder="2025-26"
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="calculationId">Calculation</label>
              {calculations.length ? (
                <select
                  id="calculationId"
                  value={calculationId}
                  onChange={(event) => setCalculationId(event.target.value)}
                >
                  {calculations.map((row) => (
                    <option key={row.calculation_id} value={row.calculation_id}>
                      {row.tax_year || '—'} · {row.calculation_type || 'calculation'} · {row.calculation_id}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id="calculationId"
                  type="text"
                  value={calculationId}
                  onChange={(event) => setCalculationId(event.target.value)}
                  placeholder="Paste a calculation ID"
                />
              )}
            </div>

            <div className={styles.actions}>
              <button type="submit" className={styles.primaryBtn} disabled={isProducing}>
                {isProducing ? 'Requesting…' : 'Request Assist report'}
              </button>
            </div>
          </form>
        </section>

        {noMessages ? (
          <section className={styles.card}>
            <h2 className={styles.sectionTitle}>No messages</h2>
            <p className={styles.subtitle}>
              HMRC has no targeted feedback for this calculation. There is nothing for you to review
              or acknowledge.
            </p>
          </section>
        ) : null}

        {hasMessages ? (
          <section className={styles.card}>
            <h2 className={styles.sectionTitle}>
              {report.messages.length} message{report.messages.length === 1 ? '' : 's'} from HMRC
            </h2>
            <p className={styles.subtitle}>
              Read each message in full. When you have presented them, acknowledge the report so HMRC
              can improve how it targets future messages.
            </p>

            <div className={styles.messageList}>
              {report.messages.map((message, index) => (
                <article className={styles.messageCard} key={message.title || index}>
                  {message.title ? <h3 className={styles.messageTitle}>{message.title}</h3> : null}
                  {message.body ? <p className={styles.messageBody}>{message.body}</p> : null}
                  {message.action ? (
                    <>
                      <p className={styles.messageActionLabel}>What you can do</p>
                      <p className={styles.messageAction}>{message.action}</p>
                    </>
                  ) : null}
                  {Array.isArray(message.links) && message.links.length ? (
                    <ul className={styles.messageLinks}>
                      {message.links.map((link, linkIndex) => (
                        <li key={link.url || linkIndex}>
                          <a href={link.url} target="_blank" rel="noopener noreferrer">
                            {link.title || link.url}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </article>
              ))}
            </div>

            <div className={styles.ackBar}>
              <p className={styles.ackHint}>
                Only acknowledge once these messages have actually been shown to the customer.
              </p>
              <button
                type="button"
                className={styles.primaryBtn}
                onClick={handleAcknowledge}
                disabled={isAcknowledging || acknowledged}
              >
                {acknowledged ? '✓ Acknowledged' : isAcknowledging ? 'Acknowledging…' : 'Acknowledge report'}
              </button>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  )
}
