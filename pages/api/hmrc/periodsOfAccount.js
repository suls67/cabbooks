import {
  resolveDriverSession,
  resolveBusinessId,
  readHmrcBody,
  HMRC_BASE,
  BUSINESS_ID_PATTERN,
  TAX_YEAR_PATTERN
} from '../../../lib/hmrc/session';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// Periods of Account (self-employment only)
//   GET /individuals/business/details/{nino}/{businessId}/{taxYear}/periods-of-account
//   PUT /individuals/business/details/{nino}/{businessId}/{taxYear}/periods-of-account
// Must be declared before final declaration. Most sole-trader drivers have none
// (periodsOfAccount = false), in which case periodsOfAccountDates is omitted.
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

    // Validate + build the PUT payload before any HMRC calls, so bad input never
    // burns the (rate-limited) businessId lookup.
    let putPayload = null;
    if (req.method === 'PUT') {
      const periodsOfAccount = req.body?.periodsOfAccount;
      if (typeof periodsOfAccount !== 'boolean') {
        return res.status(400).json({ error: 'periodsOfAccount is required and must be true or false.' });
      }

      putPayload = { periodsOfAccount };

      if (periodsOfAccount) {
        const dates = req.body?.periodsOfAccountDates;
        if (!Array.isArray(dates) || dates.length === 0) {
          return res.status(400).json({
            error: 'periodsOfAccountDates is required when periodsOfAccount is true.'
          });
        }

        for (const entry of dates) {
          if (!DATE_PATTERN.test(entry?.startDate) || !DATE_PATTERN.test(entry?.endDate)) {
            return res.status(400).json({
              error: 'Each period must have a startDate and endDate in the format YYYY-MM-DD.'
            });
          }
        }

        putPayload.periodsOfAccountDates = dates.map(({ startDate, endDate }) => ({ startDate, endDate }));
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

    const url = `${HMRC_BASE}/individuals/business/details/${nino}/${businessId}/${taxYear}/periods-of-account`;

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
        return res.status(200).json({ businessId, taxYear, notSubmitted: true });
      }

      const data = await readHmrcBody(response);

      if (!response.ok) {
        return res.status(response.status).json({
          error: data?.message || 'Could not retrieve periods of account from HMRC.',
          details: data
        });
      }

      return res.status(200).json({ businessId, taxYear, ...data });
    }

    // PUT — declare whether the customer has periods of account (validated above).
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${hmrcToken}`,
        Accept: 'application/vnd.hmrc.2.0+json',
        'Content-Type': 'application/json',
        'Gov-Test-Scenario': scenario
      },
      body: JSON.stringify(putPayload)
    });

    const data = await readHmrcBody(response);

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.message || 'HMRC rejected the periods of account submission.',
        details: data
      });
    }

    return res.status(200).json({
      success: true,
      businessId,
      taxYear,
      ...putPayload,
      correlationId: response.headers.get('x-correlationid') || null
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
