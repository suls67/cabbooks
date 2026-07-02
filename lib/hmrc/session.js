import { getAccessTokenFromRequest, getDriverFromAccessToken } from '../driverAuth';
import { supabase } from '../../supabaseClient';
import { refreshToken } from './refreshToken';

export const HMRC_BASE = 'https://test-api.service.hmrc.gov.uk';

// A unique identifier for a business income source.
export const BUSINESS_ID_PATTERN = /^X[A-Z0-9]IS[0-9]{11}$/;

// Tax year in the format YYYY-YY, e.g. 2025-26.
export const TAX_YEAR_PATTERN = /^2[0-9]{3}-[0-9]{2}$/;

// Resolves the signed-in driver, their NINO, and a valid (auto-refreshed) HMRC
// access token. Centralises the driver + token boilerplate that the older HMRC
// routes each copy inline, so new routes stay short and consistent.
export async function resolveDriverSession(req) {
  const accessToken = getAccessTokenFromRequest(req);
  const currentDriver = await getDriverFromAccessToken(supabase, accessToken);

  const { data: driver, error: driverError } = await supabase
    .from('drivers')
    .select('nino')
    .eq('id', currentDriver.id)
    .maybeSingle();

  if (driverError || !driver) throw new Error('Driver not found');
  if (!driver.nino) throw new Error('This driver has no NINO saved');

  const { data: tokenData, error: tokenError } = await supabase
    .from('hmrc_tokens')
    .select('*')
    .eq('driver_id', currentDriver.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (tokenError || !tokenData) throw new Error('HMRC token not found');

  let hmrcToken = tokenData.access_token;
  if (!tokenData.expires_at || new Date(tokenData.expires_at) < new Date()) {
    hmrcToken = await refreshToken(tokenData, currentDriver.id, supabase);
  }

  return { currentDriver, nino: driver.nino, hmrcToken };
}

// Safely reads an HMRC response body. HMRC is inconsistent — some success
// responses are 204 (no body), others are 200 with an empty body — so calling
// response.json() directly throws "Unexpected end of JSON input". Returns {} for
// an empty body, the parsed object for JSON, or { raw } for non-JSON text.
export async function readHmrcBody(response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

async function fetchBusinessList(nino, hmrcToken, scenario) {
  const response = await fetch(`${HMRC_BASE}/individuals/business/details/${nino}/list`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${hmrcToken}`,
      Accept: 'application/vnd.hmrc.2.0+json',
      'Gov-Test-Scenario': scenario
    }
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message || 'Could not load business details from HMRC');
  }

  return data?.listOfBusinesses || [];
}

// Resolves the first business income source ID that HMRC holds for this driver.
export async function resolveBusinessId(nino, hmrcToken, scenario = 'DEFAULT') {
  const list = await fetchBusinessList(nino, hmrcToken, scenario);
  const businessId = list[0]?.businessId;
  if (!businessId) throw new Error('No business found for this driver');
  return businessId;
}

// Resolves the first business ID whose typeOfBusiness matches one of allowedTypes,
// e.g. ['uk-property'] or ['foreign-property']. Property businesses have their own
// business ID, separate from the self-employment one.
export async function resolveBusinessIdByType(nino, hmrcToken, allowedTypes, scenario = 'DEFAULT') {
  const list = await fetchBusinessList(nino, hmrcToken, scenario);
  const match = list.find((b) => allowedTypes.includes(b.typeOfBusiness));
  if (!match?.businessId) {
    throw new Error(`No ${allowedTypes.join(' or ')} business is registered for this driver`);
  }
  return match.businessId;
}
