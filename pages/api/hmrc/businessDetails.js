import {
  resolveDriverSession,
  resolveBusinessId,
  readHmrcBody,
  HMRC_BASE,
  BUSINESS_ID_PATTERN
} from '../../../lib/hmrc/session';

// Retrieve Business Details — GET /individuals/business/details/{nino}/{businessId}
// Returns additional detail for a single business income source (trading name,
// accounting periods, commencement/cessation dates, business address, etc.).
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { nino, hmrcToken } = await resolveDriverSession(req);
    const scenario = req.query.scenario || 'DEFAULT';

    let businessId = req.query.businessId;
    if (businessId && !BUSINESS_ID_PATTERN.test(businessId)) {
      return res.status(400).json({ error: 'businessId is not in the expected format.' });
    }
    if (!businessId) {
      businessId = await resolveBusinessId(nino, hmrcToken, scenario);
    }

    const response = await fetch(
      `${HMRC_BASE}/individuals/business/details/${nino}/${businessId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${hmrcToken}`,
          Accept: 'application/vnd.hmrc.2.0+json',
          'Gov-Test-Scenario': scenario
        }
      }
    );

    const data = await readHmrcBody(response);

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.message || 'Could not retrieve business details from HMRC.',
        details: data
      });
    }

    return res.status(200).json({ businessId, ...data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
