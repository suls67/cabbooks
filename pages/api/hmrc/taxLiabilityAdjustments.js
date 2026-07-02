import { resolveDriverSession, readHmrcBody, HMRC_BASE, TAX_YEAR_PATTERN } from '../../../lib/hmrc/session';

// The Tax Liability Adjustments API only supports 2026-27 onwards.
const MIN_TAX_YEAR_START = 2026;

// The single top-level object HMRC accepts in the adjustments body, and the
// three amounts it may contain.
const CARRY_BACK_KEY = 'carryBackLossesDecrease';
const AMOUNT_KEYS = ['incomeTax', 'class4', 'capitalGainsTax'];

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
    return `The Tax Liability Adjustments API only supports ${MIN_TAX_YEAR_START}-${String(MIN_TAX_YEAR_START + 1).slice(2)} onwards.`;
  }
  return null;
}

// Individuals Tax Liability Adjustments (MTD) — Retrieve / Create-or-Amend / Delete.
//   GET    /individuals/tax-liability/adjustments/{nino}/{taxYear}
//   PUT    (create or amend) same URL
//   DELETE same URL
// No businessId — adjustments are held at the individual (NINO) level.
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

    // Validate the PUT body before any HMRC call.
    let putPayload = null;
    if (req.method === 'PUT') {
      const carryBack = req.body?.[CARRY_BACK_KEY];
      const cleaned = {};
      if (carryBack && typeof carryBack === 'object') {
        for (const key of AMOUNT_KEYS) {
          if (carryBack[key] !== undefined) cleaned[key] = carryBack[key];
        }
      }
      if (Object.keys(cleaned).length === 0) {
        return res.status(400).json({
          error: `${CARRY_BACK_KEY} must include at least one of: ${AMOUNT_KEYS.join(', ')}.`
        });
      }
      putPayload = { [CARRY_BACK_KEY]: cleaned };
    }

    const { nino, hmrcToken } = await resolveDriverSession(req);

    const url = `${HMRC_BASE}/individuals/tax-liability/adjustments/${nino}/${taxYear}`;
    const accept = 'application/vnd.hmrc.1.0+json';

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
        return res.status(200).json({ taxYear, noData: true });
      }

      const data = await readHmrcBody(response);

      if (!response.ok) {
        return res.status(response.status).json({
          error: data?.message || 'Could not retrieve tax liability adjustments from HMRC.',
          details: data
        });
      }

      return res.status(200).json({ taxYear, ...data });
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
        taxYear,
        correlationId: response.headers.get('x-correlationid') || null
      });
    }

    // PUT — create or amend tax liability adjustments.
    const headers = {
      Authorization: `Bearer ${hmrcToken}`,
      Accept: accept,
      'Content-Type': 'application/json',
      'Gov-Test-Scenario': scenario
    };

    // Adjustments are an end-of-year submission. In the sandbox the current tax
    // year has not ended, so an in-year PUT is rejected with
    // RULE_TAX_YEAR_NOT_ENDED unless this header relaxes the check. Ignored in
    // production.
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
        error: data?.message || 'HMRC rejected the tax liability adjustments submission.',
        details: data
      });
    }

    return res.status(200).json({
      success: true,
      taxYear,
      correlationId: response.headers.get('x-correlationid') || null,
      ...data
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
