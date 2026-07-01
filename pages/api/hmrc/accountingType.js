import {
  resolveDriverSession,
  resolveBusinessId,
  readHmrcBody,
  HMRC_BASE,
  BUSINESS_ID_PATTERN,
  TAX_YEAR_PATTERN
} from '../../../lib/hmrc/session';

const ACCOUNTING_TYPES = ['CASH', 'ACCRUAL'];

// Accounting Type
//   GET  /individuals/business/details/{nino}/{businessId}/{taxYear}/accounting-type
//   PUT  /individuals/business/details/{nino}/{businessId}/{taxYear}/accounting-type
// CASH  = money actually received/paid in the year.
// ACCRUAL = revenue/expenses recorded when incurred, regardless of cash movement.
export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const source = req.method === 'GET' ? req.query : req.body;
    const taxYear = source?.taxYear;
    const scenario = source?.scenario || 'DEFAULT';

    if (!taxYear || !TAX_YEAR_PATTERN.test(taxYear)) {
      return res.status(400).json({ error: 'taxYear is required in the format YYYY-YY.' });
    }

    // Validate the PUT body before making any HMRC calls, so bad input never
    // burns the (rate-limited) businessId lookup.
    if (req.method === 'PUT' && !ACCOUNTING_TYPES.includes(req.body?.accountingType)) {
      return res.status(400).json({ error: 'accountingType must be exactly "CASH" or "ACCRUAL".' });
    }

    const { nino, hmrcToken } = await resolveDriverSession(req);

    let businessId = source?.businessId;
    if (businessId && !BUSINESS_ID_PATTERN.test(businessId)) {
      return res.status(400).json({ error: 'businessId is not in the expected format.' });
    }
    if (!businessId) {
      businessId = await resolveBusinessId(nino, hmrcToken, scenario);
    }

    const url = `${HMRC_BASE}/individuals/business/details/${nino}/${businessId}/${taxYear}/accounting-type`;

    if (req.method === 'GET') {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${hmrcToken}`,
          Accept: 'application/vnd.hmrc.2.0+json',
          'Gov-Test-Scenario': scenario
        }
      });

      if (response.status === 404) {
        return res.status(200).json({ businessId, taxYear, notFound: true });
      }

      const data = await readHmrcBody(response);

      if (!response.ok) {
        return res.status(response.status).json({
          error: data?.message || 'Could not retrieve the accounting type from HMRC.',
          details: data
        });
      }

      return res.status(200).json({ businessId, taxYear, ...data });
    }

    // PUT — update the accounting type on record.
    const accountingType = req.body.accountingType;

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${hmrcToken}`,
        Accept: 'application/vnd.hmrc.2.0+json',
        'Content-Type': 'application/json',
        'Gov-Test-Scenario': scenario
      },
      body: JSON.stringify({ accountingType })
    });

    const data = await readHmrcBody(response);

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.message || 'HMRC rejected the accounting type update.',
        details: data
      });
    }

    return res.status(200).json({
      success: true,
      businessId,
      taxYear,
      accountingType,
      correlationId: response.headers.get('x-correlationid') || null
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
