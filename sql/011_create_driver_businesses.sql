-- Stores the HMRC business income sources linked to each driver, so the app can
-- show only the HMRC features relevant to their business type(s).
--
-- type_of_business mirrors the HMRC "typeOfBusiness" value from the List All
-- Businesses endpoint. source distinguishes HMRC-detected rows (replaced on
-- re-sync) from manually enabled ones (never wiped by a re-sync) — needed
-- because the sandbox DEFAULT business list only ever returns self-employment,
-- so property must be enabled by hand for testing.

CREATE TABLE IF NOT EXISTS driver_businesses (
  id BIGSERIAL PRIMARY KEY,
  driver_id BIGINT NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  business_id TEXT,                       -- nullable: a manual property may have no ID in sandbox
  type_of_business TEXT NOT NULL CHECK (type_of_business IN ('self-employment', 'uk-property', 'foreign-property')),
  trading_name TEXT,
  source TEXT NOT NULL DEFAULT 'hmrc' CHECK (source IN ('hmrc', 'manual')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- One row per (driver, type, business_id). COALESCE keeps the uniqueness working
-- when business_id is NULL (manual property with no ID yet).
CREATE UNIQUE INDEX IF NOT EXISTS idx_driver_businesses_unique
  ON driver_businesses(driver_id, type_of_business, COALESCE(business_id, ''));

CREATE INDEX IF NOT EXISTS idx_driver_businesses_driver_id ON driver_businesses(driver_id);

ALTER TABLE driver_businesses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "drivers can manage own businesses"
  ON driver_businesses FOR ALL
  USING (
    driver_id IN (
      SELECT id FROM drivers WHERE auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    driver_id IN (
      SELECT id FROM drivers WHERE auth_user_id = auth.uid()
    )
  );
