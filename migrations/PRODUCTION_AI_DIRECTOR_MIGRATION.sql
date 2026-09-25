-- PRODUCTION MIGRATION: AI Director for MemoryPop Plus
-- Date: 2026-09-25
-- Description: Consolidated migration 012-015 for production deployment
-- Run this in Supabase SQL Editor for production database

-- SAFETY CHECKS:
-- 1. This creates NEW tables/columns only (non-destructive)
-- 2. Does NOT modify existing customer data
-- 3. RLS enabled and restricted to service_role only
-- 4. Can be safely rolled back if needed

BEGIN;

-- =====================================================
-- Migration 012: Create ai_reveal_plans table
-- =====================================================

-- Table to store AI-generated reveal plans
CREATE TABLE IF NOT EXISTS ai_reveal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memorypop_id UUID NOT NULL REFERENCES memorypops(id) ON DELETE CASCADE,

  -- Plan content (validated RevealPlan JSON)
  plan JSONB,

  -- Generation metadata
  model_name TEXT NOT NULL,
  model_provider TEXT NOT NULL,
  schema_version TEXT NOT NULL DEFAULT 'v1',
  prompt_version TEXT NOT NULL DEFAULT 'v1',

  -- Input snapshot (to detect stale plans)
  input_snapshot JSONB,
  input_hash TEXT,

  -- Generation status
  generation_source TEXT NOT NULL,
  generation_error TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  -- Constraints
  CONSTRAINT valid_generation_source CHECK (generation_source IN ('ai_generated', 'deterministic_fallback'))
);

-- Indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_ai_reveal_plans_memorypop_id ON ai_reveal_plans(memorypop_id);
CREATE INDEX IF NOT EXISTS idx_ai_reveal_plans_input_hash ON ai_reveal_plans(input_hash);
CREATE INDEX IF NOT EXISTS idx_ai_reveal_plans_created_at ON ai_reveal_plans(created_at);

-- Only one plan per MemoryPop
CREATE UNIQUE INDEX IF NOT EXISTS idx_ai_reveal_plans_unique_memorypop ON ai_reveal_plans(memorypop_id);

-- RLS: Service role only
ALTER TABLE ai_reveal_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role only - all operations" ON ai_reveal_plans;
CREATE POLICY "Service role only - all operations"
  ON ai_reveal_plans
  FOR ALL
  USING (auth.role() = 'service_role');

-- Comments for documentation
COMMENT ON TABLE ai_reveal_plans IS 'AI-generated reveal plans for MemoryPop Plus experiences';
COMMENT ON COLUMN ai_reveal_plans.plan IS 'Validated RevealPlan JSON (NULL if generation pending)';
COMMENT ON COLUMN ai_reveal_plans.input_snapshot IS 'Input data used for generation (NULL if pending)';
COMMENT ON COLUMN ai_reveal_plans.input_hash IS 'SHA-256 hash of input (empty if pending)';
COMMENT ON COLUMN ai_reveal_plans.generation_source IS 'Whether plan came from AI or deterministic fallback';
COMMENT ON COLUMN ai_reveal_plans.generation_error IS 'Error message if AI generation failed and fallback was used';

-- =====================================================
-- Migration 013: Add concurrency protection
-- =====================================================

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ai_reveal_plans' AND column_name = 'generation_version'
  ) THEN
    ALTER TABLE ai_reveal_plans
      ADD COLUMN generation_version INTEGER NOT NULL DEFAULT 1,
      ADD COLUMN generation_lock_holder TEXT,
      ADD COLUMN generation_lock_acquired_at TIMESTAMP WITH TIME ZONE,
      ADD COLUMN generation_lock_expires_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Index for lock expiration cleanup
CREATE INDEX IF NOT EXISTS idx_ai_reveal_plans_lock_expires ON ai_reveal_plans(generation_lock_expires_at)
  WHERE generation_lock_expires_at IS NOT NULL;

-- Comments
COMMENT ON COLUMN ai_reveal_plans.generation_version IS 'Increment on each generation attempt; prevents stale writes';
COMMENT ON COLUMN ai_reveal_plans.generation_lock_holder IS 'Worker ID that currently holds generation lock';
COMMENT ON COLUMN ai_reveal_plans.generation_lock_acquired_at IS 'When current worker acquired the lock';
COMMENT ON COLUMN ai_reveal_plans.generation_lock_expires_at IS 'When current lock expires (crashed worker protection)';

-- =====================================================
-- Migration 015: Add atomic publish function
-- =====================================================

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
  p_generation_error TEXT
) RETURNS TEXT AS $$
DECLARE
  v_current_version INTEGER;
  v_current_lock_holder TEXT;
  v_current_lock_expiry TIMESTAMPTZ;
  v_current_input_hash TEXT;
  v_rows_updated INTEGER;
BEGIN
  -- Get current state atomically
  SELECT
    generation_version,
    generation_lock_holder,
    generation_lock_expires_at,
    input_hash
  INTO
    v_current_version,
    v_current_lock_holder,
    v_current_lock_expiry,
    v_current_input_hash
  FROM ai_reveal_plans
  WHERE memorypop_id = p_memorypop_id
  FOR UPDATE;

  -- Check 1: Version must match
  IF v_current_version IS NULL OR v_current_version != p_expected_version THEN
    RETURN 'version_mismatch';
  END IF;

  -- Check 2: We must still hold the lock
  IF v_current_lock_holder IS NULL OR v_current_lock_holder != p_worker_id THEN
    RETURN 'lock_lost';
  END IF;

  -- Check 3: Lock must not have expired
  IF v_current_lock_expiry IS NOT NULL AND v_current_lock_expiry < NOW() THEN
    RETURN 'lock_expired';
  END IF;

  -- Check 4: Input must match expected
  IF v_current_input_hash IS NOT NULL
     AND v_current_input_hash != ''
     AND v_current_input_hash != p_expected_input_hash THEN
    RETURN 'input_changed';
  END IF;

  -- Publish the plan
  UPDATE ai_reveal_plans
  SET
    plan = p_plan,
    model_name = p_model_name,
    model_provider = p_model_provider,
    schema_version = 'v1',
    prompt_version = 'v1',
    input_snapshot = p_input_snapshot,
    input_hash = p_input_hash,
    generation_source = p_generation_source,
    generation_error = p_generation_error,
    updated_at = NOW(),
    generation_lock_holder = NULL,
    generation_lock_acquired_at = NULL,
    generation_lock_expires_at = NULL
  WHERE memorypop_id = p_memorypop_id;

  GET DIAGNOSTICS v_rows_updated = ROW_COUNT;

  IF v_rows_updated = 1 THEN
    RETURN 'success';
  ELSE
    RETURN 'no_rows_updated';
  END IF;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

COMMENT ON FUNCTION publish_reveal_plan IS 'Atomically publish reveal plan with version, lock, expiry, and input freshness checks';

-- Security: Revoke default public execute permissions
REVOKE ALL ON FUNCTION publish_reveal_plan(UUID, TEXT, INTEGER, TEXT, JSONB, TEXT, TEXT, JSONB, TEXT, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION publish_reveal_plan(UUID, TEXT, INTEGER, TEXT, JSONB, TEXT, TEXT, JSONB, TEXT, TEXT, TEXT) FROM anon;
REVOKE ALL ON FUNCTION publish_reveal_plan(UUID, TEXT, INTEGER, TEXT, JSONB, TEXT, TEXT, JSONB, TEXT, TEXT, TEXT) FROM authenticated;

-- Grant execute to service role only (RLS on table restricts actual access)
GRANT EXECUTE ON FUNCTION publish_reveal_plan(UUID, TEXT, INTEGER, TEXT, JSONB, TEXT, TEXT, JSONB, TEXT, TEXT, TEXT) TO service_role;

-- =====================================================
-- Verification Queries
-- =====================================================

-- Verify table exists with RLS enabled
SELECT
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'ai_reveal_plans';

-- Verify required columns exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'ai_reveal_plans'
ORDER BY ordinal_position;

-- Verify function exists
SELECT proname, prosrc FROM pg_proc WHERE proname = 'publish_reveal_plan' LIMIT 1;

COMMIT;

-- Expected verification results:
-- 1. ai_reveal_plans table exists with rls_enabled = true
-- 2. All columns present (id, memorypop_id, plan, model_name, etc.)
-- 3. publish_reveal_plan function exists
