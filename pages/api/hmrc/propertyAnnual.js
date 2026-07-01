import {
  resolveDriverSession,
  resolveBusinessIdByType,
  readHmrcBody,
  HMRC_BASE,
  BUSINESS_ID_PATTERN,
  TAX_YEAR_PATTERN
} from '../../../lib/hmrc/session';

// Property type → path segment, business type, and the allowed annual payload keys.
const PROPERTY_TYPES = {
  uk: { segment: 'uk', businessTypes: ['uk-property'], keys: ['ukFhlProperty', 'ukProperty'] },
  foreign: { segment: 'foreign', businessTypes: ['foreign-property'], keys: ['foreignFhlEea', 'foreignProperty'] }
};

// Property Business Annual Submission (adjustments & allowances).
//   GET    /individuals/business/property/{uk|foreign}/{nino}/{businessId}/annual/{taxYear}
//   PUT    (create or amend) same URL
//   DELETE /individuals/business/property/{nino}/{businessId}/annual/{taxYear}  (no uk/foreign segment)
export default async function handler(req, res) {
  if (!['GET', 'PUT', 'DELETE'].includes(req.method)) {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const source = req.method === 'GET' ? req.query : req.body;
    const type = source?.type;
    const taxYear = source?.taxYear;
    const scenario = source?.scenario || 'DEFAULT';

    const config = PROPERTY_TYPES[type];
    if (!config) {
      return res.status(400).json({ error: 'type is required and must be "uk" or "foreign".' });
    }

    if (!taxYear || !TAX_YEAR_PATTERN.test(taxYear)) {
      return res.status(400).json({ error: 'taxYear is required in the format YYYY-YY.' });
    }

    // Validate the PUT body before any HMRC call.
    let putPayload = null;
    if (req.method === 'PUT') {
      putPayload = {};
      for (const key of config.keys) {
        if (req.body?.[key] !== undefined) putPayload[key] = req.body[key];
      }
      if (Object.keys(putPayload).length === 0) {
        return res.status(400).json({
          error: `Provide at least one of: ${config.keys.join(', ')}.`
        });
      }
    }

    const { nino, hmrcToken } = await resolveDriverSession(req);

    let businessId = source?.businessId;
    if (businessId && !BUSINESS_ID_PATTERN.test(businessId)) {
      return res.status(400).json({ error: 'businessId is not in the expected format.' });
    }
    if (!businessId) {
      businessId = await resolveBusinessIdByType(nino, hmrcToken, config.businessTypes, scenario);
    }

    // DELETE uses the generic property path (no uk/foreign segment).
    const url =
      req.method === 'DELETE'
        ? `${HMRC_BASE}/individuals/business/property/${nino}/${businessId}/annual/${taxYear}`
        : `${HMRC_BASE}/individuals/business/property/${config.segment}/${nino}/${businessId}/annual/${taxYear}`;

    if (req.method === 'GET') {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${hmrcToken}`,
          Accept: 'application/vnd.hmrc.6.0+json',
          'Gov-Test-Scenario': scenario
        }
      });

      if (response.status === 404) {
        return res.status(200).json({ businessId, taxYear, type, noData: true });
      }

      const data = await readHmrcBody(response);

      if (!response.ok) {
        return res.status(response.status).json({
          error: data?.message || 'Could not retrieve the property annual submission from HMRC.',
          details: data
        });
      }

      return res.status(200).json({ businessId, taxYear, type, ...data });
    }

    if (req.method === 'DELETE') {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${hmrcToken}`,
          Accept: 'application/vnd.hmrc.6.0+json',
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
        type,
        correlationId: response.headers.get('x-correlationid') || null
      });
    }

    // PUT — create or amend the annual submission.
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${hmrcToken}`,
        Accept: 'application/vnd.hmrc.6.0+json',
        'Content-Type': 'application/json',
        'Gov-Test-Scenario': scenario
      },
      body: JSON.stringify(putPayload)
    });

    const data = await readHmrcBody(response);

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.message || 'HMRC rejected the property annual submission.',
        details: data
      });
    }

    return res.status(200).json({
      success: true,
      businessId,
      taxYear,
      type,
      correlationId: response.headers.get('x-correlationid') || null,
      ...data
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
