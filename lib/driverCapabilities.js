// Business-type constants shared across the capabilities layer.
export const BUSINESS_TYPES = {
  SELF_EMPLOYMENT: 'self-employment',
  UK_PROPERTY: 'uk-property',
  FOREIGN_PROPERTY: 'foreign-property'
}

// Derives what HMRC features a driver should see from their stored
// driver_businesses rows. Pure — no I/O — so it can be used on the client
// (nav/cards) and, if ever needed, on the server.
//
// Safe default: a driver with no rows yet (fresh, pre-sync) is treated as
// self-employment only. Taxi drivers are self-employment-first, so the core
// flow is never hidden while detection catches up.
export function deriveCapabilities(rows) {
  const businesses = Array.isArray(rows) ? rows : []
  const hasType = (type) => businesses.some((b) => b.type_of_business === type)

  const hasSelfEmployment = businesses.length === 0 || hasType(BUSINESS_TYPES.SELF_EMPLOYMENT)
  const hasUkProperty = hasType(BUSINESS_TYPES.UK_PROPERTY)
  const hasForeignProperty = hasType(BUSINESS_TYPES.FOREIGN_PROPERTY)

  return {
    hasSelfEmployment,
    hasUkProperty,
    hasForeignProperty,
    hasProperty: hasUkProperty || hasForeignProperty,
    businesses
  }
}
