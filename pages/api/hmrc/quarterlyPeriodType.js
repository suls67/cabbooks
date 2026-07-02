import {
  resolveDriverSession,
  resolveBusinessId,
  readHmrcBody,
  HMRC_BASE,
  BUSINESS_ID_PATTERN,
  TAX_YEAR_PATTERN
} from '../../../lib/hmrc/session';

const QUARTERLY_PERIOD_TYPES = ['standard', 'calendar'];

// Create and Amend Quarterly Period Type for a Business
//   PUT /individuals/business/details/{nino}/{businessId}/{taxYear}
// standard = first quarter starts 6 April. calendar = first quarter starts 1 April.
// Locked for the year once the first quarterly update is submitted.
export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { taxYear, quarterlyPeriodType } = req.body || {};
    const scenario = req.body?.scenario || 'DEFAULT';

    if (!taxYear || !TAX_YEAR_PATTERN.test(taxYear)) {
      return res.status(400).json({ error: 'taxYear is required in the format YYYY-YY.' });
    }

    if (!QUARTERLY_PERIOD_TYPES.includes(quarterlyPeriodType)) {
      return res.status(400).json({
        error: 'quarterlyPeriodType must be exactly "standard" or "calendar".'
      });
    }

    const { nino, hmrcToken } = await resolveDriverSession(req);

    let businessId = req.body?.businessId;
    if (businessId && !BUSINESS_ID_PATTERN.test(businessId)) {
      return res.status(400).json({ error: 'businessId is not in the expected format.' });
    }
    if (!businessId) {
      businessId = await resolveBusinessId(nino, hmrcToken, scenario);
    }

    const response = await fetch(
      `${HMRC_BASE}/individuals/business/details/${nino}/${businessId}/${taxYear}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${hmrcToken}`,
          Accept: 'application/vnd.hmrc.2.0+json',
          'Content-Type': 'application/json',
          'Gov-Test-Scenario': scenario
        },
        body: JSON.stringify({ quarterlyPeriodType })
      }
    );

    const data = await readHmrcBody(response);

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.message || 'HMRC rejected the quarterly period type.',
        details: data
      });
    }

    return res.status(200).json({
      success: true,
      businessId,
      taxYear,
      quarterlyPeriodType,
      correlationId: response.headers.get('x-correlationid') || null
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
