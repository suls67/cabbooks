import { resolveDriverSession, HMRC_BASE } from '../../../lib/hmrc/session';
import { getSupabaseAdmin } from '../../../lib/supabaseAdmin';

const VALID_TYPES = ['self-employment', 'uk-property', 'foreign-property'];

// Syncs the driver's HMRC business income sources into driver_businesses.
// Replaces the source='hmrc' rows with a fresh snapshot from the HMRC business
// list; leaves source='manual' rows untouched (a manually enabled property
// isn't wiped when the sandbox list — self-employment only — is re-fetched).
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { currentDriver, nino, hmrcToken } = await resolveDriverSession(req);
    const scenario = req.body?.scenario || 'DEFAULT';

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
      return res.status(response.status).json({
        error: data?.message || 'Could not load business details from HMRC.',
        details: data
      });
    }

    const list = data?.listOfBusinesses || [];
    const rows = list
      .filter((b) => VALID_TYPES.includes(b.typeOfBusiness))
      .map((b) => ({
        driver_id: currentDriver.id,
        business_id: b.businessId || null,
        type_of_business: b.typeOfBusiness,
        trading_name: b.tradingName || b.businessName || null,
        source: 'hmrc',
        updated_at: new Date().toISOString()
      }));

    const admin = getSupabaseAdmin();

    // Replace the HMRC-sourced snapshot; manual rows are left alone.
    const { error: deleteError } = await admin
      .from('driver_businesses')
      .delete()
      .eq('driver_id', currentDriver.id)
      .eq('source', 'hmrc');
    if (deleteError) throw new Error(deleteError.message);

    if (rows.length > 0) {
      const { error: insertError } = await admin.from('driver_businesses').insert(rows);
      if (insertError) throw new Error(insertError.message);
    }

    // Return the full merged set (hmrc + manual) for the caller to use directly.
    const { data: merged, error: readError } = await admin
      .from('driver_businesses')
      .select('id, business_id, type_of_business, trading_name, source')
      .eq('driver_id', currentDriver.id)
      .order('type_of_business', { ascending: true });
    if (readError) throw new Error(readError.message);

    return res.status(200).json({ synced: rows.length, businesses: merged || [] });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
