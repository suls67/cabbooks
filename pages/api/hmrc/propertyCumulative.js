import {
  resolveDriverSession,
  resolveBusinessIdByType,
  readHmrcBody,
  HMRC_BASE,
  BUSINESS_ID_PATTERN,
  TAX_YEAR_PATTERN
} from '../../../lib/hmrc/session';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// Property type → path segment, business type, and the payload key HMRC expects.
const PROPERTY_TYPES = {
  uk: { segment: 'uk', businessTypes: ['uk-property'], payloadKey: 'ukProperty' },
  foreign: { segment: 'foreign', businessTypes: ['foreign-property'], payloadKey: 'foreignProperty' }
};

// Cumulative Period Summary (UK / Foreign property) — tax year 2025-26 onwards only.
//   GET /individuals/business/property/{uk|foreign}/{nino}/{businessId}/cumulative/{taxYear}
//   PUT (create or amend) same URL
// Mirrors the self-employment cumulative model: year-to-date income & expenses.
export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'PUT') {
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
    if (Number(taxYear.slice(0, 4)) < 2025) {
      return res.status(400).json({ error: 'The cumulative endpoint only supports tax year 2025-26 onwards.' });
    }

    // Validate the PUT body before any HMRC call, so bad input never burns the
    // (rate-limited) businessId lookup.
    let putPayload = null;
    if (req.method === 'PUT') {
      const propertyData = req.body?.[config.payloadKey];

      if (config.payloadKey === 'ukProperty') {
        if (!propertyData || typeof propertyData !== 'object' || Array.isArray(propertyData)) {
          return res.status(400).json({ error: 'ukProperty object is required with income and/or expenses.' });
        }
      } else if (!Array.isArray(propertyData) || propertyData.length === 0) {
        return res.status(400).json({ error: 'foreignProperty must be a non-empty array.' });
      }

      const { fromDate, toDate } = req.body || {};
      if (fromDate && !DATE_PATTERN.test(fromDate)) {
        return res.status(400).json({ error: 'fromDate must be in the format YYYY-MM-DD.' });
      }
      if (toDate && !DATE_PATTERN.test(toDate)) {
        return res.status(400).json({ error: 'toDate must be in the format YYYY-MM-DD.' });
      }

      putPayload = {};
      if (fromDate) putPayload.fromDate = fromDate;
      if (toDate) putPayload.toDate = toDate;
      putPayload[config.payloadKey] = propertyData;
    }

    const { nino, hmrcToken } = await resolveDriverSession(req);

    let businessId = source?.businessId;
    if (businessId && !BUSINESS_ID_PATTERN.test(businessId)) {
      return res.status(400).json({ error: 'businessId is not in the expected format.' });
    }
    if (!businessId) {
      businessId = await resolveBusinessIdByType(nino, hmrcToken, config.businessTypes, scenario);
    }

    const url = `${HMRC_BASE}/individuals/business/property/${config.segment}/${nino}/${businessId}/cumulative/${taxYear}`;

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
          error: data?.message || 'Could not retrieve the property cumulative summary from HMRC.',
          details: data
        });
      }

      return res.status(200).json({ businessId, taxYear, type, ...data });
    }

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
        error: data?.message || 'HMRC rejected the property cumulative submission.',
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
