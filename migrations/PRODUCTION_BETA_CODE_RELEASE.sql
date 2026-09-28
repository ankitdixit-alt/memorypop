-- ============================================================
-- PRODUCTION RELEASE: Beta Code System Only
-- ============================================================
-- Adds beta code redemption system for Plus upgrades
-- Assumes ai_reveal_plans, publish_reveal_plan, and is_premium already exist
--
-- Run in: Supabase SQL Editor for production project gvfpgawbvuttglfscngg
-- Link: https://supabase.com/dashboard/project/gvfpgawbvuttglfscngg/sql
-- ============================================================

BEGIN;

-- ============================================================
-- 1. Add upgrade tracking columns to memorypops
-- ============================================================

-- upgraded_at: timestamp of Plus activation
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'memorypops'
    AND column_name = 'upgraded_at'
  ) THEN
    ALTER TABLE memorypops
    ADD COLUMN upgraded_at TIMESTAMP WITH TIME ZONE;

    COMMENT ON COLUMN memorypops.upgraded_at IS 'Timestamp when gift was upgraded to Plus';

    RAISE NOTICE 'Added upgraded_at column';
  ELSE
    RAISE NOTICE 'Column upgraded_at already exists';
  END IF;
END $$;

-- upgrade_source: 'beta_code' or 'stripe' (future)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'memorypops'
    AND column_name = 'upgrade_source'
  ) THEN
    ALTER TABLE memorypops
    ADD COLUMN upgrade_source TEXT CHECK (upgrade_source IN ('beta_code', 'stripe'));

    COMMENT ON COLUMN memorypops.upgrade_source IS 'Source of Plus upgrade: beta_code or stripe';

    RAISE NOTICE 'Added upgrade_source column';
  ELSE
    RAISE NOTICE 'Column upgrade_source already exists';
  END IF;
END $$;

-- ============================================================
-- 2. Create beta_codes table
-- ============================================================

-- IMPORTANT: CREATE TABLE IF NOT EXISTS will not update existing tables.
-- If beta_codes already exists with different columns, this will skip creation.
-- Drop and recreate manually if schema changes are needed.

CREATE TABLE IF NOT EXISTS beta_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, -- Human-readable name (e.g., "Launch Week 2024")
  code_hash TEXT NOT NULL UNIQUE, -- SHA-256 hash of actual code
  active BOOLEAN NOT NULL DEFAULT TRUE,
  total_redemption_limit INTEGER NOT NULL DEFAULT 1,
  current_redemptions INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_redemptions CHECK (current_redemptions <= total_redemption_limit),
  CONSTRAINT valid_expiry CHECK (expires_at > created_at)
);

-- Index for code lookup (primary operation)
CREATE INDEX IF NOT EXISTS idx_beta_codes_hash ON beta_codes(code_hash);

-- Index for active code queries
CREATE INDEX IF NOT EXISTS idx_beta_codes_active ON beta_codes(active) WHERE active = TRUE;

COMMENT ON TABLE beta_codes IS 'Beta access codes for Plus upgrades during early access period';

-- ============================================================
-- 3. Create beta_code_redemptions table
-- ============================================================

CREATE TABLE IF NOT EXISTS beta_code_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beta_code_id UUID NOT NULL REFERENCES beta_codes(id) ON DELETE CASCADE,
  memorypop_id UUID NOT NULL REFERENCES memorypops(id) ON DELETE CASCADE,
  redeemed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  -- One redemption per memorypop per code
  CONSTRAINT unique_redemption UNIQUE (beta_code_id, memorypop_id)
);

-- Index for redemption lookups
CREATE INDEX IF NOT EXISTS idx_beta_redemptions_memorypop ON beta_code_redemptions(memorypop_id);
CREATE INDEX IF NOT EXISTS idx_beta_redemptions_code ON beta_code_redemptions(beta_code_id);

COMMENT ON TABLE beta_code_redemptions IS 'Tracks which MemoryPops have redeemed which beta codes';

-- ============================================================
-- 4. Row Level Security (RLS)
-- ============================================================

-- Enable RLS on new tables
ALTER TABLE beta_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE beta_code_redemptions ENABLE ROW LEVEL SECURITY;

-- Beta codes: Service role only (API validates codes server-side)
DROP POLICY IF EXISTS beta_codes_service_role ON beta_codes;
CREATE POLICY beta_codes_service_role ON beta_codes
  FOR ALL
  USING (auth.role() = 'service_role');

-- Beta redemptions: Service role only
DROP POLICY IF EXISTS beta_redemptions_service_role ON beta_code_redemptions;
CREATE POLICY beta_redemptions_service_role ON beta_code_redemptions
  FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================
-- 5. Explicit Permissions
-- ============================================================

-- Revoke public/anon/authenticated access to beta tables
REVOKE ALL ON TABLE beta_codes FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE beta_code_redemptions FROM PUBLIC, anon, authenticated;

-- Grant service_role explicit permissions for API operations
-- beta_codes: SELECT (code lookup), UPDATE (increment redemptions)
GRANT SELECT, UPDATE ON TABLE beta_codes TO service_role;

-- beta_code_redemptions: SELECT (check existing), INSERT (record redemption), DELETE (rollback)
GRANT SELECT, INSERT, DELETE ON TABLE beta_code_redemptions TO service_role;

-- Note: memorypops table permissions are not modified here.
-- The API requires SELECT and UPDATE on memorypops, which should already be granted.

COMMIT;

-- ============================================================
-- Verification Queries
-- ============================================================

-- Check upgrade tracking columns exist
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'memorypops'
  AND column_name IN ('is_premium', 'upgraded_at', 'upgrade_source')
ORDER BY column_name;

-- Expected output:
-- column_name    | data_type | is_nullable | column_default
-- ---------------+-----------+-------------+----------------
-- is_premium     | boolean   | NO          | false
-- upgraded_at    | timestamp | YES         | NULL
-- upgrade_source | text      | YES         | NULL

-- Check beta code tables exist with RLS
SELECT
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('beta_codes', 'beta_code_redemptions')
ORDER BY tablename;

-- Expected output:
-- tablename              | rls_enabled
-- -----------------------+-------------
-- beta_code_redemptions  | t
-- beta_codes             | t

-- Check beta code table structure
SELECT
  table_name,
  COUNT(*) as column_count
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('beta_codes', 'beta_code_redemptions')
GROUP BY table_name
ORDER BY table_name;

-- Expected output:
-- table_name              | column_count
-- ------------------------+--------------
-- beta_code_redemptions   | 4
-- beta_codes              | 9

-- Verify RLS policies
SELECT
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('beta_codes', 'beta_code_redemptions')
ORDER BY tablename, policyname;

-- Expected: One policy per table, both service_role only

-- Verify table permissions
SELECT
  grantee,
  table_name,
  privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public'
  AND table_name IN ('beta_codes', 'beta_code_redemptions')
  AND grantee IN ('PUBLIC', 'anon', 'authenticated', 'service_role')
ORDER BY table_name, grantee, privilege_type;

-- Expected: Only service_role should have privileges on beta tables
-- PUBLIC, anon, authenticated should have no privileges
