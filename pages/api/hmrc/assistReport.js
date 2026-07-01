import { getAccessTokenFromRequest, getDriverFromAccessToken } from '../../../lib/driverAuth';
import { getHmrcFraudPreventionHeaders } from '../../../lib/hmrc/fraudHeaders';
import { refreshToken } from '../../../lib/hmrc/refreshToken';
import { supabase } from '../../../supabaseClient';

// HMRC Self Assessment Assist API.
// Produce:     POST .../assist/reports/{nino}/{taxYear}/{calculationId}
//                -> 200 with report (reportId, messages, correlationId) OR 204 (no messages)
// Acknowledge: POST .../assist/reports/acknowledge/{nino}/{reportId}/{correlationId}
//                -> 204 (confirms the report was displayed in full to the user)
// Both use Accept: application/vnd.hmrc.1.0+json and the read/write:self-assessment-assist scopes.
const ASSIST_ACCEPT = 'application/vnd.hmrc.1.0+json';

// Sandbox: scenario that drives the produce response. DEFAULT may return 204
// (no messages). Override per-request via body.scenario while we find the
// scenario that returns a 200 report in the sandbox.
const SANDBOX_PRODUCE_SCENARIO = 'DEFAULT';

function parseJsonSafely(response) {
  if (response.status === 204) return Promise.resolve(null);
  return response.json().catch(() => null);
}

function getHmrcMeta(response) {
  return {
    hmrcStatusCode: response.status,
    correlationId: response.headers.get('x-correlationid') || null
  };
}

async function getHmrcContext(req) {
  const appAccessToken = getAccessTokenFromRequest(req);
  const currentDriver = await getDriverFromAccessToken(supabase, appAccessToken);

  const { data: driver, error: driverError } = await supabase
    .from('drivers')
    .select('id, email, nino')
    .eq('id', currentDriver.id)
    .maybeSingle();

  if (driverError || !driver) {
    throw new Error('Driver not found');
  }

  const { data: tokenData, error: tokenError } = await supabase
    .from('hmrc_tokens')
    .select('*')
    .eq('driver_id', currentDriver.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (tokenError || !tokenData) {
    throw new Error('HMRC token not found');
  }

  let hmrcAccessToken = tokenData.access_token;

  if (!tokenData.expires_at || new Date(tokenData.expires_at) < new Date()) {
    hmrcAccessToken = await refreshToken(tokenData, currentDriver.id, supabase);
  }

  return {
    driver,
    hmrcAccessToken,
    fraudHeaders: getHmrcFraudPreventionHeaders({
      ...req,
      headers: {
        ...req.headers,
        'x-hmrc-user-id': driver.email || String(driver.id)
      }
    })
  };
}

async function hmrcFetch(url, options, context, attempt = 0) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${context.hmrcAccessToken}`,
      ...context.fraudHeaders
    }
  });

  if (response.status === 401 && attempt === 0) {
    const { data: tokenData } = await supabase
      .from('hmrc_tokens')
      .select('*')
      .eq('driver_id', context.driver.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!tokenData) {
      throw new Error('HMRC token not found');
    }

    context.hmrcAccessToken = await refreshToken(tokenData, context.driver.id, supabase);
    return hmrcFetch(url, options, context, attempt + 1);
  }

  return response;
}

async function produceReport(req, res, context) {
  const { taxYear, calculationId, scenario } = req.body || {};

  if (!taxYear || !calculationId) {
    return res.status(400).json({ error: 'taxYear and calculationId are required' });
  }

  const response = await hmrcFetch(
    `https://test-api.service.hmrc.gov.uk/individuals/self-assessment/assist/reports/${context.driver.nino}/${taxYear}/${calculationId}`,
    {
      method: 'POST',
      headers: {
        Accept: ASSIST_ACCEPT,
        'Gov-Test-Scenario': scenario || SANDBOX_PRODUCE_SCENARIO
      }
    },
    context
  );

  // 404 = the tax calculation has not finished generating yet (HMRC guidance).
  if (response.status === 404) {
    const payload = await parseJsonSafely(response);
    return res.status(200).json({
      status: 'calculation-pending',
      message:
        'The tax calculation is still being generated. Wait for the calculation to complete, then request the Assist report again.',
      details: payload,
      ...getHmrcMeta(response)
    });
  }

  // 204 = no messages for this calculation.
  if (response.status === 204) {
    return res.status(200).json({
      status: 'no-messages',
      taxYear,
      calculationId,
      messages: [],
      ...getHmrcMeta(response)
    });
  }

  const payload = await parseJsonSafely(response);

  if (!response.ok) {
    return res.status(response.status).json({
      error: payload?.message || payload?.error || 'Could not produce the HMRC Assist report.',
      details: payload,
      ...getHmrcMeta(response)
    });
  }

  // 200 = a report with messages.
  return res.status(200).json({
    status: 'has-messages',
    reportId: payload?.reportId || null,
    // correlationId for acknowledge comes from the body, not the header
    correlationId: payload?.correlationId || response.headers.get('x-correlationid') || null,
    nino: payload?.nino || context.driver.nino,
    taxYear: payload?.taxYear || taxYear,
    calculationId: payload?.calculationId || calculationId,
    messages: Array.isArray(payload?.messages) ? payload.messages : [],
    hmrcStatusCode: response.status
  });
}

async function acknowledgeReport(req, res, context) {
  const { reportId, correlationId } = req.body || {};

  if (!reportId || !correlationId) {
    return res.status(400).json({ error: 'reportId and correlationId are required' });
  }

  const response = await hmrcFetch(
    `https://test-api.service.hmrc.gov.uk/individuals/self-assessment/assist/reports/acknowledge/${context.driver.nino}/${reportId}/${correlationId}`,
    {
      method: 'POST',
      headers: {
        Accept: ASSIST_ACCEPT
      }
    },
    context
  );

  if (response.status === 204) {
    return res.status(200).json({
      status: 'acknowledged',
      reportId,
      acknowledgedAt: new Date().toISOString(),
      ...getHmrcMeta(response)
    });
  }

  const payload = await parseJsonSafely(response);

  return res.status(response.status).json({
    error: payload?.message || payload?.error || 'Could not acknowledge the HMRC Assist report.',
    details: payload,
    ...getHmrcMeta(response)
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const context = await getHmrcContext(req);
    const action = (req.body && req.body.action) || 'produce';

    if (action === 'acknowledge') {
      return acknowledgeReport(req, res, context);
    }

    return produceReport(req, res, context);
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Could not process the HMRC Assist report.'
    });
  }
}
