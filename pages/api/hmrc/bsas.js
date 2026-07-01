import {
  resolveDriverSession,
  resolveBusinessId,
  resolveBusinessIdByType,
  readHmrcBody,
  HMRC_BASE,
  BUSINESS_ID_PATTERN,
  TAX_YEAR_PATTERN
} from '../../../lib/hmrc/session';
import { getSupabaseAdmin } from '../../../lib/supabaseAdmin';

// Business Source Adjustable Summary (BSAS) API v7.0 — unified route covering
// all business types (2025-26 onwards; FHL types abolished from 2025-26).
//   action=list     GET  .../adjustable-summary/{nino}/{taxYear}[?typeOfBusiness&businessId]
//   action=trigger  POST .../adjustable-summary/{nino}/trigger
//   action=retrieve GET  .../adjustable-summary/{nino}/{typeSegment}/{calculationId}/{taxYear}
//   action=submit   POST .../adjustable-summary/{nino}/{typeSegment}/{calculationId}/adjust/{taxYear}
//
// The older self-employment-only flow in adjustments.js is left in place for the
// existing /hmrc-adjustments page; this route generalises to property too.

const ACCEPT = 'application/vnd.hmrc.7.0+json';
const BASE = (nino) => `${HMRC_BASE}/individuals/self-assessment/adjustable-summary/${nino}`;

// typeOfBusiness → the URL path segment used by retrieve/submit.
const TYPE_SEGMENTS = {
  'self-employment': 'self-employment',
  'uk-property': 'uk-property',
  'foreign-property': 'foreign-property'
};
const VALID_TYPES = Object.keys(TYPE_SEGMENTS);

// Resolves the businessId for a type: explicit (validated) wins; otherwise ask
// HMRC. Property businesses aren't in the sandbox DEFAULT list, so callers pass
// businessId explicitly for those.
async function resolveId({ type, explicitId, nino, hmrcToken, scenario }) {
  if (explicitId) {
    if (!BUSINESS_ID_PATTERN.test(explicitId)) {
      throw Object.assign(new Error('businessId is not in the expected format.'), { statusCode: 400 });
    }
    return explicitId;
  }
  if (type === 'self-employment') {
    return resolveBusinessId(nino, hmrcToken, scenario);
  }
  return resolveBusinessIdByType(nino, hmrcToken, [type], scenario);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, taxYear, typeOfBusiness, calculationId, payload } = req.body || {};
    const explicitId = req.body?.businessId;
    const scenario = req.body?.scenario || 'DEFAULT';

    if (!['list', 'trigger', 'retrieve', 'submit'].includes(action)) {
      return res.status(400).json({ error: 'action must be one of: list, trigger, retrieve, submit.' });
    }
    if (!taxYear || !TAX_YEAR_PATTERN.test(taxYear)) {
      return res.status(400).json({ error: 'taxYear is required in the format YYYY-YY.' });
    }
    if (Number(taxYear.slice(0, 4)) < 2025) {
      return res.status(400).json({ error: 'This route supports 2025-26 onwards only.' });
    }
    // Type is required for everything except list (where it is an optional filter).
    if (action !== 'list' && !VALID_TYPES.includes(typeOfBusiness)) {
      return res.status(400).json({ error: `typeOfBusiness must be one of: ${VALID_TYPES.join(', ')}.` });
    }
    if ((action === 'retrieve' || action === 'submit') && !calculationId) {
      return res.status(400).json({ error: 'calculationId is required for retrieve and submit.' });
    }
    if (action === 'submit' && (!payload || typeof payload !== 'object' || Array.isArray(payload) || Object.keys(payload).length === 0)) {
      return res.status(400).json({ error: 'payload (the adjustments body) is required for submit.' });
    }

    const { currentDriver, nino, hmrcToken } = await resolveDriverSession(req);

    // ---- LIST ----
    if (action === 'list') {
      const params = new URLSearchParams();
      if (typeOfBusiness) {
        if (!VALID_TYPES.includes(typeOfBusiness)) {
          return res.status(400).json({ error: `typeOfBusiness filter must be one of: ${VALID_TYPES.join(', ')}.` });
        }
        params.set('typeOfBusiness', typeOfBusiness);
      }
      if (explicitId) {
        if (!BUSINESS_ID_PATTERN.test(explicitId)) {
          return res.status(400).json({ error: 'businessId is not in the expected format.' });
        }
        params.set('businessId', explicitId);
      }
      const qs = params.toString();
      const url = `${BASE(nino)}/${taxYear}${qs ? `?${qs}` : ''}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { Authorization: `Bearer ${hmrcToken}`, Accept: ACCEPT, 'Gov-Test-Scenario': scenario }
      });
      if (response.status === 404) {
        return res.status(200).json({ taxYear, businessSources: [], noData: true });
      }
      const data = await readHmrcBody(response);
      if (!response.ok) {
        return res.status(response.status).json({ error: data?.message || 'Could not list adjustable summaries.', details: data });
      }
      return res.status(200).json({ taxYear, businessSources: data?.businessSources || [] });
    }

    // ---- TRIGGER ----
    if (action === 'trigger') {
      const businessId = await resolveId({ type: typeOfBusiness, explicitId, nino, hmrcToken, scenario });
      const startYear = Number(taxYear.slice(0, 4));
      const accountingPeriod = { startDate: `${startYear}-04-06`, endDate: `${startYear + 1}-04-05` };

      const response = await fetch(`${BASE(nino)}/trigger`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${hmrcToken}`, Accept: ACCEPT, 'Content-Type': 'application/json', 'Gov-Test-Scenario': scenario },
        body: JSON.stringify({ typeOfBusiness, businessId, accountingPeriod })
      });
      const data = await readHmrcBody(response);
      if (!response.ok || !data?.calculationId) {
        return res.status(response.ok ? 502 : response.status).json({
          error: data?.message || 'Could not trigger a business source adjustable summary.',
          details: data
        });
      }
      return res.status(200).json({ success: true, taxYear, typeOfBusiness, businessId, calculationId: data.calculationId });
    }

    const segment = TYPE_SEGMENTS[typeOfBusiness];

    // ---- RETRIEVE ----
    if (action === 'retrieve') {
      const response = await fetch(`${BASE(nino)}/${segment}/${calculationId}/${taxYear}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${hmrcToken}`, Accept: ACCEPT, 'Gov-Test-Scenario': scenario }
      });
      const data = await readHmrcBody(response);
      if (!response.ok) {
        return res.status(response.status).json({ error: data?.message || 'Could not retrieve the adjustable summary.', details: data });
      }
      return res.status(200).json({ success: true, taxYear, typeOfBusiness, calculationId, summary: data });
    }

    // ---- SUBMIT ----
    // payload is the exact adjustments body per type:
    //   self-employment  { income, expenses, additions } | { zeroAdjustments: true }
    //   uk-property      { ukProperty: { income, expenses } | { zeroAdjustments: true } }
    //   foreign-property { foreignProperty: { countryLevelDetail: [...] } | { zeroAdjustments: true } }
    const businessId = await resolveId({ type: typeOfBusiness, explicitId, nino, hmrcToken, scenario });
    const response = await fetch(`${BASE(nino)}/${segment}/${calculationId}/adjust/${taxYear}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${hmrcToken}`, Accept: ACCEPT, 'Content-Type': 'application/json', 'Gov-Test-Scenario': scenario },
      body: JSON.stringify(payload)
    });
    const data = await readHmrcBody(response);
    if (!response.ok) {
      return res.status(response.status).json({ error: data?.message || 'HMRC rejected the accounting adjustments.', details: data });
    }

    // Save to the shared adjustment history table (best-effort — don't fail the
    // request if history write fails, since HMRC already accepted it).
    let historyWarning = null;
    try {
      const { error: saveError } = await getSupabaseAdmin()
        .from('hmrc_adjustments')
        .insert([{
          driver_id: currentDriver.id,
          business_id: businessId,
          tax_year: taxYear,
          calculation_id: calculationId,
          adjustment_payload: payload,
          hmrc_response: data
        }]);
      if (saveError) historyWarning = saveError.message;
    } catch (e) {
      historyWarning = e.message;
    }

    return res.status(200).json({
      success: true,
      taxYear,
      typeOfBusiness,
      businessId,
      calculationId,
      correlationId: response.headers.get('x-correlationid') || null,
      response: data || {},
      ...(historyWarning ? { historyWarning } : {})
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ error: err.message });
  }
}
