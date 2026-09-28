-- ============================================================
-- PRODUCTION RELEASE: MemoryPop Plus Full Schema
-- ============================================================
-- Adds upgrade tracking and beta code redemption schema
-- Safe to run: All operations are idempotent with existence checks
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
-- 4. Create ai_reveal_plans table (already exists in test)
-- ============================================================

CREATE TABLE IF NOT EXISTS ai_reveal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memorypop_id UUID NOT NULL REFERENCES memorypops(id) ON DELETE CASCADE,

  -- Generated plan (JSONB for flexible schema)
  plan JSONB,

  -- Model metadata
  model_name TEXT NOT NULL DEFAULT 'deterministic',
  model_provider TEXT NOT NULL DEFAULT 'internal',

  -- Input tracking (for cache invalidation)
  input_snapshot JSONB,
  input_hash TEXT NOT NULL DEFAULT '',

  -- Generation metadata
  generation_source TEXT NOT NULL DEFAULT 'deterministic_fallback',
  generation_error TEXT,
  generation_version INTEGER NOT NULL DEFAULT 1,

  -- Concurrency protection
  generation_lock_holder TEXT,
  generation_lock_acquired_at TIMESTAMP WITH TIME ZONE,
  generation_lock_expires_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  -- One plan per memorypop
  CONSTRAINT unique_plan_per_memorypop UNIQUE (memorypop_id)
);

-- Index for plan lookups
CREATE INDEX IF NOT EXISTS idx_ai_plans_memorypop ON ai_reveal_plans(memorypop_id);

-- Index for input hash (cache checks)
CREATE INDEX IF NOT EXISTS idx_ai_plans_input_hash ON ai_reveal_plans(input_hash);

COMMENT ON TABLE ai_reveal_plans IS 'AI-generated reveal plans for Plus experiences';

-- ============================================================
-- 5. Create publish_reveal_plan function
-- ============================================================

CREATE OR REPLACE FUNCTION publish_reveal_plan(
  p_memorypop_id UUID,
  p_worker_id TEXT,
  p_expected_version INTEGER,
  p_expected_input_hash TEXT,
  p_plan JSONB,
  p_model_name TEXT,
  p_model_provider TEXT,
  p_input_snapshot JSONB,
  p_input_hash TEXT,
  p_generation_source TEXT,
  p_generation_error TEXT DEFAULT NULL
) RETURNS TEXT AS $$
DECLARE
  v_current_version INTEGER;
  v_current_lock_holder TEXT;
  v_current_lock_expires TIMESTAMP WITH TIME ZONE;
  v_current_input_hash TEXT;
BEGIN
  -- Fetch current state
  SELECT
    generation_version,
    generation_lock_holder,
    generation_lock_expires_at,
    input_hash
  INTO
    v_current_version,
    v_current_lock_holder,
    v_current_lock_expires,
    v_current_input_hash
  FROM ai_reveal_plans
  WHERE memorypop_id = p_memorypop_id;

  -- Check 1: Version must match (prevents race conditions)
  IF v_current_version IS NOT NULL AND v_current_version != p_expected_version THEN
    RETURN 'version_mismatch';
  END IF;

  -- Check 2: Must hold the lock
  IF v_current_lock_holder IS NULL OR v_current_lock_holder != p_worker_id THEN
    RETURN 'lock_lost';
  END IF;

  -- Check 3: Lock must not be expired (use database NOW() for consistency)
  IF v_current_lock_expires IS NULL OR v_current_lock_expires < NOW() THEN
    RETURN 'lock_expired';
  END IF;

  -- Check 4: Input hash must match (prevents stale writes)
  IF v_current_input_hash IS NOT NULL AND v_current_input_hash != p_expected_input_hash THEN
    RETURN 'input_changed';
  END IF;

  -- All checks passed - publish the plan
  UPDATE ai_reveal_plans
  SET
    plan = p_plan,
    model_name = p_model_name,
    model_provider = p_model_provider,
    input_snapshot = p_input_snapshot,
    input_hash = p_input_hash,
    generation_source = p_generation_source,
    generation_error = p_generation_error,
    generation_lock_holder = NULL,
    generation_lock_acquired_at = NULL,
    generation_lock_expires_at = NULL,
    updated_at = NOW()
  WHERE memorypop_id = p_memorypop_id;

  RETURN 'success';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp;

COMMENT ON FUNCTION publish_reveal_plan IS 'Atomically publish a reveal plan with concurrency and staleness checks';

-- ============================================================
-- 6. Row Level Security (RLS)
-- ============================================================

-- Enable RLS on new tables
ALTER TABLE beta_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE beta_code_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_reveal_plans ENABLE ROW LEVEL SECURITY;

-- Beta codes: read-only via service role
CREATE POLICY beta_codes_service_role ON beta_codes
  FOR ALL
  USING (auth.role() = 'service_role');

-- Beta redemptions: service role only
CREATE POLICY beta_redemptions_service_role ON beta_code_redemptions
  FOR ALL
  USING (auth.role() = 'service_role');

-- AI plans: service role only
CREATE POLICY ai_plans_service_role ON ai_reveal_plans
  FOR ALL
  USING (auth.role() = 'service_role');

COMMIT;

-- ============================================================
-- Verification Queries
-- ============================================================

-- Check all Plus columns exist
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

-- Check beta code tables
SELECT
  table_name,
  COUNT(*) as column_count
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('beta_codes', 'beta_code_redemptions', 'ai_reveal_plans')
GROUP BY table_name
ORDER BY table_name;

-- Expected output:
-- table_name              | column_count
-- ------------------------+--------------
-- ai_reveal_plans         | 16
-- beta_code_redemptions   | 4
-- beta_codes              | 8

-- Check function exists
SELECT
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'publish_reveal_plan';

-- Expected output:
-- routine_name         | routine_type
-- ---------------------+-------------
-- publish_reveal_plan  | FUNCTION
