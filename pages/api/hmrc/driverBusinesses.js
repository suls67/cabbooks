import { resolveDriverSession } from '../../../lib/hmrc/session';
import { getSupabaseAdmin } from '../../../lib/supabaseAdmin';

// Manual property types the driver can enable/disable by hand (needed because
// the sandbox business list only returns self-employment).
const MANUAL_TYPES = ['uk-property', 'foreign-property'];

// Read the driver's stored businesses, or add/remove a manually enabled
// property type. Self-employment is not manually toggleable — it comes from
// HMRC via /api/hmrc/syncBusinesses.
export default async function handler(req, res) {
  if (!['GET', 'POST', 'DELETE'].includes(req.method)) {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { currentDriver } = await resolveDriverSession(req);
    const admin = getSupabaseAdmin();

    if (req.method === 'GET') {
      const { data, error } = await admin
        .from('driver_businesses')
        .select('id, business_id, type_of_business, trading_name, source')
        .eq('driver_id', currentDriver.id)
        .order('type_of_business', { ascending: true });
      if (error) throw new Error(error.message);
      return res.status(200).json({ businesses: data || [] });
    }

    const type = req.body?.typeOfBusiness;
    if (!MANUAL_TYPES.includes(type)) {
      return res.status(400).json({
        error: `typeOfBusiness must be one of: ${MANUAL_TYPES.join(', ')}.`
      });
    }

    if (req.method === 'POST') {
      const businessId = req.body?.businessId || null;

      // Only add a manual row if this type isn't already present (from HMRC or a
      // previous manual toggle), so enabling twice is a no-op.
      const { data: existing, error: existingError } = await admin
        .from('driver_businesses')
        .select('id')
        .eq('driver_id', currentDriver.id)
        .eq('type_of_business', type)
        .limit(1);
      if (existingError) throw new Error(existingError.message);

      if (!existing || existing.length === 0) {
        const { error } = await admin.from('driver_businesses').insert({
          driver_id: currentDriver.id,
          business_id: businessId,
          type_of_business: type,
          source: 'manual',
          updated_at: new Date().toISOString()
        });
        if (error) throw new Error(error.message);
      }

      return res.status(200).json({ success: true, typeOfBusiness: type });
    }

    // DELETE — remove the manual row(s) for this type. Never touches HMRC rows.
    const { error } = await admin
      .from('driver_businesses')
      .delete()
      .eq('driver_id', currentDriver.id)
      .eq('type_of_business', type)
      .eq('source', 'manual');
    if (error) throw new Error(error.message);
    return res.status(200).json({ success: true, typeOfBusiness: type });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
