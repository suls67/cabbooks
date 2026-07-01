import {
  resolveDriverSession,
  resolveBusinessId,
  readHmrcBody,
  HMRC_BASE,
  BUSINESS_ID_PATTERN,
  TAX_YEAR_PATTERN
} from '../../../lib/hmrc/session';

// The Individual Losses API only supports 2026-27 onwards.
const MIN_TAX_YEAR_START = 2026;

// The two top-level objects HMRC accepts in the loss-claims body.
const PAYLOAD_KEYS = ['claims', 'losses'];

// Validates a YYYY-YY tax year: correct format, end year exactly one after the
// start (no spanning/gaps like 2026-28), and no earlier than the API minimum.
function validateTaxYear(taxYear) {
  if (!taxYear || !TAX_YEAR_PATTERN.test(taxYear)) {
    return 'taxYear is required in the format YYYY-YY, e.g. 2026-27.';
  }
  const startYear = Number(taxYear.slice(0, 4));
  const endYear = Number(taxYear.slice(5));
  if (endYear !== (startYear + 1) % 100) {
    return 'taxYear must span a single year, e.g. 2026-27 (2026-28 is not valid).';
  }
  if (startYear < MIN_TAX_YEAR_START) {
    return `The Individual Losses API only supports ${MIN_TAX_YEAR_START}-${String(MIN_TAX_YEAR_START + 1).slice(2)} onwards.`;
  }
  return null;
}

// Individual Losses (MTD) — Retrieve / Create-or-Amend / Delete losses and claims.
//   GET    /individuals/losses/{nino}/businesses/{businessId}/loss-claims/{taxYear}
//   PUT    (create or amend) same URL
//   DELETE same URL
export default async function handler(req, res) {
  if (!['GET', 'PUT', 'DELETE'].includes(req.method)) {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const source = req.method === 'GET' ? req.query : req.body;
    const taxYear = source?.taxYear;
    const scenario = source?.scenario || 'DEFAULT';

    const taxYearError = validateTaxYear(taxYear);
    if (taxYearError) {
      return res.status(400).json({ error: taxYearError });
    }

    // Validate the PUT body before any HMRC call (saves a businessId lookup on
    // bad input — the sandbox rate-limits the business list quickly).
    let putPayload = null;
    if (req.method === 'PUT') {
      putPayload = {};
      for (const key of PAYLOAD_KEYS) {
        if (req.body?.[key] !== undefined) putPayload[key] = req.body[key];
      }
      if (Object.keys(putPayload).length === 0) {
        return res.status(400).json({
          error: `Provide at least one of: ${PAYLOAD_KEYS.join(', ')}.`
        });
      }
    }

    const { nino, hmrcToken } = await resolveDriverSession(req);

    let businessId = source?.businessId;
    if (businessId && !BUSINESS_ID_PATTERN.test(businessId)) {
      return res.status(400).json({ error: 'businessId is not in the expected format.' });
    }
    if (!businessId) {
      businessId = await resolveBusinessId(nino, hmrcToken, scenario);
    }

    const url = `${HMRC_BASE}/individuals/losses/${nino}/businesses/${businessId}/loss-claims/${taxYear}`;
    const accept = 'application/vnd.hmrc.7.0+json';

    if (req.method === 'GET') {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${hmrcToken}`,
          Accept: accept,
          'Gov-Test-Scenario': scenario
        }
      });

      if (response.status === 404) {
        return res.status(200).json({ businessId, taxYear, noData: true });
      }

      const data = await readHmrcBody(response);

      if (!response.ok) {
        return res.status(response.status).json({
          error: data?.message || 'Could not retrieve losses and claims from HMRC.',
          details: data
        });
      }

      return res.status(200).json({ businessId, taxYear, ...data });
    }

    if (req.method === 'DELETE') {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${hmrcToken}`,
          Accept: accept,
          'Gov-Test-Scenario': scenario
        }
      });

      const data = await readHmrcBody(response);

      if (!response.ok) {
        return res.status(response.status).json({
          error: data?.message || 'HMRC rejected the delete request.',
          details: data
        });
      }

      return res.status(200).json({
        success: true,
        businessId,
        taxYear,
        correlationId: response.headers.get('x-correlationid') || null
      });
    }

    // PUT — create or amend losses and claims.
    const headers = {
      Authorization: `Bearer ${hmrcToken}`,
      Accept: accept,
      'Content-Type': 'application/json',
      'Gov-Test-Scenario': scenario
    };

    // Losses are an end-of-year submission. In the sandbox the current tax year
    // has not ended, so an in-year PUT is rejected with RULE_TAX_YEAR_NOT_ENDED
    // unless this header relaxes the check. Ignored in production.
    if (source?.suspendTemporalValidations) {
      headers['suspend-temporal-validations'] = 'true';
    }

    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify(putPayload)
    });

    const data = await readHmrcBody(response);

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.message || 'HMRC rejected the losses and claims submission.',
        details: data
      });
    }

    return res.status(200).json({
      success: true,
      businessId,
      taxYear,
      correlationId: response.headers.get('x-correlationid') || null,
      ...data
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
