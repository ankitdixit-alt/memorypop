-- MemoryPop Test Database Setup - Final Corrected Version
-- Target: memorypop-test project only
-- Date: 2026-09-22
--
-- This script includes:
-- 1. Complete schema from migrations 000-015
-- 2. Explicit permissions for service_role with restrictions
-- 3. Security hardening for built-in functions
-- 4. Comprehensive verification queries
--
-- IMPORTANT: Only execute in memorypop-test project

BEGIN;

-- =============================================================================
-- PART 1: OPTIONAL SECURITY HARDENING
-- =============================================================================
-- Restrict execution of Supabase's built-in rls_auto_enable function
-- This function is part of Supabase's "Automatic RLS" feature but is not
-- used by our application (we explicitly enable RLS and create policies).

DO $$
BEGIN
  -- Only revoke if function exists
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'rls_auto_enable'
  ) THEN
    EXECUTE 'REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC';
    EXECUTE 'REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM authenticated';
    EXECUTE 'REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM anon';
    RAISE NOTICE 'Restricted rls_auto_enable function execution';
  END IF;
END $$;

-- =============================================================================
-- PART 2: APPLICATION SCHEMA
-- =============================================================================

-- Migration 000: Base schema
CREATE TABLE IF NOT EXISTS memorypops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_code TEXT UNIQUE NOT NULL,
  occasion TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  celebration_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  -- Migration 002: Premium features
  is_premium BOOLEAN DEFAULT FALSE NOT NULL,
  upgraded_at TIMESTAMP WITH TIME ZONE,
  stripe_payment_id TEXT,
  stripe_customer_id TEXT,

  -- Migration 003: Celebration date
  celebration_date DATE,

  -- Migration 004: Cover style
  cover_style TEXT DEFAULT 'none' NOT NULL,

  -- Migration 005-008: Creator identity system
  creator_email TEXT,
  email_sent_at TIMESTAMP WITH TIME ZONE,
  creator_email_verified_at TIMESTAMP WITH TIME ZONE,
  verification_token_hash TEXT,
  verification_token_expires_at TIMESTAMP WITH TIME ZONE,
  verification_attempts INTEGER DEFAULT 0,
  management_token_hash TEXT NOT NULL,
  pending_creator_email TEXT,
  verification_sent_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memorypop_id UUID REFERENCES memorypops(id) ON DELETE CASCADE NOT NULL,
  contributor_name TEXT NOT NULL,
  message TEXT NOT NULL,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  -- Migration 010: Standard multimedia
  photos JSONB DEFAULT '[]'::jsonb NOT NULL,
  gifs JSONB DEFAULT '[]'::jsonb NOT NULL,
  video JSONB
);

CREATE TABLE IF NOT EXISTS memorypop_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memorypop_id UUID REFERENCES memorypops(id) ON DELETE CASCADE NOT NULL,
  payment_intent_id TEXT NOT NULL,
  reaction_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Migration 012-014: AI Reveal Plans Table
CREATE TABLE IF NOT EXISTS ai_reveal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memorypop_id UUID REFERENCES memorypops(id) ON DELETE CASCADE NOT NULL UNIQUE,

  -- Plan content (NULL if generation pending - Migration 014)
  plan JSONB,

  -- Generation metadata
  model_name TEXT NOT NULL DEFAULT 'pending',
  model_provider TEXT NOT NULL DEFAULT 'pending',
  schema_version TEXT NOT NULL DEFAULT 'v1',
  prompt_version TEXT NOT NULL DEFAULT 'v1',

  -- Input snapshot (NULL if pending - Migration 014)
  input_snapshot JSONB,
  input_hash TEXT NOT NULL DEFAULT '',

  -- Generation status
  generation_source TEXT NOT NULL,
  generation_error TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  -- Migration 013: Concurrency protection
  generation_version INTEGER DEFAULT 1 NOT NULL,
  generation_lock_holder TEXT,
  generation_lock_acquired_at TIMESTAMP WITH TIME ZONE,
  generation_lock_expires_at TIMESTAMP WITH TIME ZONE
);

-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_memories_memorypop_id ON memories(memorypop_id);
CREATE INDEX IF NOT EXISTS idx_memories_created_at ON memories(created_at);
CREATE INDEX IF NOT EXISTS idx_memorypop_reactions_memorypop_id ON memorypop_reactions(memorypop_id);

CREATE INDEX IF NOT EXISTS idx_memorypops_creator_email
  ON memorypops(creator_email)
  WHERE creator_email IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_memorypops_verification_token_hash
  ON memorypops(verification_token_hash)
  WHERE verification_token_hash IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_memorypops_management_token_hash
  ON memorypops(management_token_hash);

CREATE INDEX IF NOT EXISTS idx_ai_reveal_plans_memorypop_id ON ai_reveal_plans(memorypop_id);
CREATE INDEX IF NOT EXISTS idx_ai_reveal_plans_lock ON ai_reveal_plans(generation_lock_holder, generation_lock_expires_at)
  WHERE generation_lock_holder IS NOT NULL;

-- =============================================================================
-- CONSTRAINTS (Migration 010)
-- =============================================================================
-- Use rerunnable constraint creation via catalog checks

-- photos_is_array constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'photos_is_array'
      AND conrelid = 'public.memories'::regclass
  ) THEN
    ALTER TABLE memories
      ADD CONSTRAINT photos_is_array CHECK (jsonb_typeof(photos) = 'array');
  END IF;
END $$;

-- gifs_is_array constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'gifs_is_array'
      AND conrelid = 'public.memories'::regclass
  ) THEN
    ALTER TABLE memories
      ADD CONSTRAINT gifs_is_array CHECK (jsonb_typeof(gifs) = 'array');
  END IF;
END $$;

-- video_is_object_or_null constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'video_is_object_or_null'
      AND conrelid = 'public.memories'::regclass
  ) THEN
    ALTER TABLE memories
      ADD CONSTRAINT video_is_object_or_null CHECK (
        video IS NULL OR jsonb_typeof(video) = 'object'
      );
  END IF;
END $$;

-- photos_max_count constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'photos_max_count'
      AND conrelid = 'public.memories'::regclass
  ) THEN
    ALTER TABLE memories
      ADD CONSTRAINT photos_max_count CHECK (jsonb_array_length(photos) <= 10);
  END IF;
END $$;

-- gifs_max_count constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'gifs_max_count'
      AND conrelid = 'public.memories'::regclass
  ) THEN
    ALTER TABLE memories
      ADD CONSTRAINT gifs_max_count CHECK (jsonb_array_length(gifs) <= 3);
  END IF;
END $$;

-- =============================================================================
-- ROW LEVEL SECURITY (Migration 009, 011: Service Role Only)
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE memorypops ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE memorypop_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_reveal_plans ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies first
DROP POLICY IF EXISTS memorypops_insert_policy ON memorypops;
DROP POLICY IF EXISTS memorypops_select_policy ON memorypops;
DROP POLICY IF EXISTS memorypops_update_policy ON memorypops;
DROP POLICY IF EXISTS memorypops_delete_policy ON memorypops;

DROP POLICY IF EXISTS memories_insert_policy ON memories;
DROP POLICY IF EXISTS memories_select_policy ON memories;
DROP POLICY IF EXISTS memories_update_policy ON memories;
DROP POLICY IF EXISTS memories_delete_policy ON memories;

DROP POLICY IF EXISTS reactions_insert_policy ON memorypop_reactions;
DROP POLICY IF EXISTS reactions_select_policy ON memorypop_reactions;
DROP POLICY IF EXISTS reactions_update_policy ON memorypop_reactions;
DROP POLICY IF EXISTS reactions_delete_policy ON memorypop_reactions;

DROP POLICY IF EXISTS ai_plans_insert_policy ON ai_reveal_plans;
DROP POLICY IF EXISTS ai_plans_select_policy ON ai_reveal_plans;
DROP POLICY IF EXISTS ai_plans_update_policy ON ai_reveal_plans;
DROP POLICY IF EXISTS ai_plans_delete_policy ON ai_reveal_plans;

-- Create restrictive policies (service_role bypass only)
-- All policies return false - blocks anon and authenticated
-- Service role automatically bypasses RLS

-- Memorypops
CREATE POLICY memorypops_insert_policy ON memorypops FOR INSERT WITH CHECK (false);
CREATE POLICY memorypops_select_policy ON memorypops FOR SELECT USING (false);
CREATE POLICY memorypops_update_policy ON memorypops FOR UPDATE USING (false);
CREATE POLICY memorypops_delete_policy ON memorypops FOR DELETE USING (false);

-- Memories
CREATE POLICY memories_insert_policy ON memories FOR INSERT WITH CHECK (false);
CREATE POLICY memories_select_policy ON memories FOR SELECT USING (false);
CREATE POLICY memories_update_policy ON memories FOR UPDATE USING (false);
CREATE POLICY memories_delete_policy ON memories FOR DELETE USING (false);

-- Reactions
CREATE POLICY reactions_insert_policy ON memorypop_reactions FOR INSERT WITH CHECK (false);
CREATE POLICY reactions_select_policy ON memorypop_reactions FOR SELECT USING (false);
CREATE POLICY reactions_update_policy ON memorypop_reactions FOR UPDATE USING (false);
CREATE POLICY reactions_delete_policy ON memorypop_reactions FOR DELETE USING (false);

-- AI Plans
CREATE POLICY ai_plans_insert_policy ON ai_reveal_plans FOR INSERT WITH CHECK (false);
CREATE POLICY ai_plans_select_policy ON ai_reveal_plans FOR SELECT USING (false);
CREATE POLICY ai_plans_update_policy ON ai_reveal_plans FOR UPDATE USING (false);
CREATE POLICY ai_plans_delete_policy ON ai_reveal_plans FOR DELETE USING (false);

-- =============================================================================
-- TABLE PERMISSIONS
-- =============================================================================
-- Explicit grants for service_role (automatic table exposure is disabled)

-- Grant all privileges on tables to service_role
GRANT ALL ON TABLE memorypops TO service_role;
GRANT ALL ON TABLE memories TO service_role;
GRANT ALL ON TABLE memorypop_reactions TO service_role;
GRANT ALL ON TABLE ai_reveal_plans TO service_role;

-- Grant sequence usage for service_role (for id generation)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Revoke from PUBLIC, anon, authenticated (defense in depth with RLS)
REVOKE ALL ON TABLE memorypops FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE memories FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE memorypop_reactions FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE ai_reveal_plans FROM PUBLIC, anon, authenticated;

-- =============================================================================
-- MIGRATION 015: ATOMIC PUBLISH FUNCTION
-- =============================================================================
-- Based on actual migration 015 with NULL checks and late-response protection

CREATE OR REPLACE FUNCTION public.publish_reveal_plan(
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
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_current_version INTEGER;
  v_current_lock_holder TEXT;
  v_current_lock_expiry TIMESTAMPTZ;
  v_current_input_hash TEXT;
  v_rows_updated INTEGER;
BEGIN
  -- Validate required arguments (reject NULL worker/version)
  IF p_memorypop_id IS NULL OR p_worker_id IS NULL OR p_expected_version IS NULL THEN
    RETURN 'invalid_arguments';
  END IF;

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
  FOR UPDATE; -- Lock row for atomic check-and-set

  -- Check 1: Row must exist
  IF NOT FOUND THEN
    RETURN 'no_row_found';
  END IF;

  -- Check 2: Version must match and be non-NULL (prevents stale writes)
  IF v_current_version IS NULL OR v_current_version != p_expected_version THEN
    RETURN 'version_mismatch';
  END IF;

  -- Check 3: We must still hold the lock (reject NULL or wrong holder)
  -- This prevents late responses after lock is released
  IF v_current_lock_holder IS NULL OR v_current_lock_holder != p_worker_id THEN
    RETURN 'lock_lost';
  END IF;

  -- Check 4: Lock must not have expired (using database time)
  -- NULL expiry should not happen with valid lock holder, but check defensively
  IF v_current_lock_expiry IS NULL OR v_current_lock_expiry < NOW() THEN
    RETURN 'lock_expired';
  END IF;

  -- Check 5: Input must match expected (content freshness)
  -- Allow empty current hash (initial state) or matching hash
  IF v_current_input_hash IS NOT NULL
     AND v_current_input_hash != ''
     AND v_current_input_hash != p_expected_input_hash THEN
    RETURN 'input_changed';
  END IF;

  -- All checks passed - publish the plan
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

  -- Verify exactly one row was updated
  GET DIAGNOSTICS v_rows_updated = ROW_COUNT;

  IF v_rows_updated = 1 THEN
    RETURN 'success';
  ELSE
    -- Should not happen given FOR UPDATE lock, but handle defensively
    RETURN 'no_rows_updated';
  END IF;
END;
$$;

-- Function metadata
COMMENT ON FUNCTION public.publish_reveal_plan IS 'Atomically publish reveal plan with version, lock, expiry, and input freshness checks. SECURITY DEFINER with NULL-safe late-response protection.';

-- =============================================================================
-- FUNCTION PERMISSIONS
-- =============================================================================
-- Restrict function execution to service_role only

-- Revoke all existing grants first
REVOKE ALL ON FUNCTION public.publish_reveal_plan(UUID, TEXT, INTEGER, TEXT, JSONB, TEXT, TEXT, JSONB, TEXT, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.publish_reveal_plan(UUID, TEXT, INTEGER, TEXT, JSONB, TEXT, TEXT, JSONB, TEXT, TEXT, TEXT) FROM anon;
REVOKE ALL ON FUNCTION public.publish_reveal_plan(UUID, TEXT, INTEGER, TEXT, JSONB, TEXT, TEXT, JSONB, TEXT, TEXT, TEXT) FROM authenticated;

-- Grant execute to service_role only
GRANT EXECUTE ON FUNCTION public.publish_reveal_plan(UUID, TEXT, INTEGER, TEXT, JSONB, TEXT, TEXT, JSONB, TEXT, TEXT, TEXT) TO service_role;

COMMIT;

-- =============================================================================
-- PART 3: VERIFICATION QUERIES
-- =============================================================================
-- These run outside the transaction to show final state

-- Verify tables exist with expected column counts
DO $$
DECLARE
  v_memorypops_cols INTEGER;
  v_memories_cols INTEGER;
  v_reactions_cols INTEGER;
  v_ai_plans_cols INTEGER;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== TABLE VERIFICATION ===';

  SELECT COUNT(*) INTO v_memorypops_cols
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'memorypops';

  SELECT COUNT(*) INTO v_memories_cols
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'memories';

  SELECT COUNT(*) INTO v_reactions_cols
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'memorypop_reactions';

  SELECT COUNT(*) INTO v_ai_plans_cols
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'ai_reveal_plans';

  -- Expected counts based on migrations 000-014
  IF v_memorypops_cols >= 19 THEN
    RAISE NOTICE 'memorypops: % columns ✓', v_memorypops_cols;
  ELSE
    RAISE WARNING 'memorypops: % columns (expected >= 19)', v_memorypops_cols;
  END IF;

  IF v_memories_cols >= 9 THEN
    RAISE NOTICE 'memories: % columns ✓', v_memories_cols;
  ELSE
    RAISE WARNING 'memories: % columns (expected >= 9)', v_memories_cols;
  END IF;

  IF v_reactions_cols >= 5 THEN
    RAISE NOTICE 'memorypop_reactions: % columns ✓', v_reactions_cols;
  ELSE
    RAISE WARNING 'memorypop_reactions: % columns (expected >= 5)', v_reactions_cols;
  END IF;

  IF v_ai_plans_cols >= 18 THEN
    RAISE NOTICE 'ai_reveal_plans: % columns ✓', v_ai_plans_cols;
  ELSE
    RAISE WARNING 'ai_reveal_plans: % columns (expected >= 18)', v_ai_plans_cols;
  END IF;
END $$;

-- Verify critical columns exist
DO $$
DECLARE
  v_missing_cols TEXT[];
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== CRITICAL COLUMNS CHECK ===';

  -- Check for schema_version and prompt_version (migration 012)
  SELECT ARRAY_AGG(column_name) INTO v_missing_cols
  FROM (
    VALUES ('schema_version'), ('prompt_version')
  ) AS required(column_name)
  WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'ai_reveal_plans'
      AND information_schema.columns.column_name = required.column_name
  );

  IF v_missing_cols IS NULL OR array_length(v_missing_cols, 1) IS NULL THEN
    RAISE NOTICE 'ai_reveal_plans critical columns: present ✓';
  ELSE
    RAISE WARNING 'ai_reveal_plans missing columns: %', array_to_string(v_missing_cols, ', ');
  END IF;
END $$;

-- Verify function exists
DO $$
DECLARE
  v_func_exists BOOLEAN;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== FUNCTION VERIFICATION ===';

  SELECT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
      AND p.proname = 'publish_reveal_plan'
      AND p.pronargs = 11
  ) INTO v_func_exists;

  IF v_func_exists THEN
    RAISE NOTICE 'publish_reveal_plan: EXISTS ✓';
  ELSE
    RAISE WARNING 'publish_reveal_plan: MISSING or wrong signature';
  END IF;
END $$;

-- Verify RLS is enabled
DO $$
DECLARE
  v_rls_enabled INTEGER;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== RLS VERIFICATION ===';

  SELECT COUNT(*) INTO v_rls_enabled
  FROM pg_tables
  WHERE schemaname = 'public'
    AND tablename IN ('memorypops', 'memories', 'memorypop_reactions', 'ai_reveal_plans')
    AND rowsecurity = true;

  IF v_rls_enabled = 4 THEN
    RAISE NOTICE 'RLS enabled on all 4 tables ✓';
  ELSE
    RAISE WARNING 'RLS enabled on % of 4 tables', v_rls_enabled;
  END IF;
END $$;

-- Verify function permissions
DO $$
DECLARE
  v_public_can_execute BOOLEAN;
  v_anon_can_execute BOOLEAN;
  v_auth_can_execute BOOLEAN;
  v_service_can_execute BOOLEAN;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== FUNCTION PERMISSIONS ===';

  -- Check if PUBLIC has execute (should be false)
  SELECT has_function_privilege('PUBLIC', 'public.publish_reveal_plan(uuid,text,integer,text,jsonb,text,text,jsonb,text,text,text)', 'EXECUTE')
  INTO v_public_can_execute;

  -- Check specific roles
  SELECT has_function_privilege('anon', 'public.publish_reveal_plan(uuid,text,integer,text,jsonb,text,text,jsonb,text,text,text)', 'EXECUTE')
  INTO v_anon_can_execute;

  SELECT has_function_privilege('authenticated', 'public.publish_reveal_plan(uuid,text,integer,text,jsonb,text,text,jsonb,text,text,text)', 'EXECUTE')
  INTO v_auth_can_execute;

  SELECT has_function_privilege('service_role', 'public.publish_reveal_plan(uuid,text,integer,text,jsonb,text,text,jsonb,text,text,text)', 'EXECUTE')
  INTO v_service_can_execute;

  IF NOT v_public_can_execute THEN
    RAISE NOTICE 'PUBLIC: cannot execute ✓';
  ELSE
    RAISE WARNING 'PUBLIC: can execute (security issue)';
  END IF;

  IF NOT v_anon_can_execute THEN
    RAISE NOTICE 'anon: cannot execute ✓';
  ELSE
    RAISE WARNING 'anon: can execute (security issue)';
  END IF;

  IF NOT v_auth_can_execute THEN
    RAISE NOTICE 'authenticated: cannot execute ✓';
  ELSE
    RAISE WARNING 'authenticated: can execute (security issue)';
  END IF;

  IF v_service_can_execute THEN
    RAISE NOTICE 'service_role: can execute ✓';
  ELSE
    RAISE WARNING 'service_role: cannot execute (application will fail)';
  END IF;
END $$;

-- Verify rls_auto_enable restrictions (if function exists)
DO $$
DECLARE
  v_func_exists BOOLEAN;
  v_public_can_execute BOOLEAN;
  v_auth_can_execute BOOLEAN;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== SECURITY HARDENING (rls_auto_enable) ===';

  SELECT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'rls_auto_enable'
  ) INTO v_func_exists;

  IF NOT v_func_exists THEN
    RAISE NOTICE 'rls_auto_enable: not present (OK)';
    RETURN;
  END IF;

  SELECT has_function_privilege('PUBLIC', 'public.rls_auto_enable()', 'EXECUTE')
  INTO v_public_can_execute;

  SELECT has_function_privilege('authenticated', 'public.rls_auto_enable()', 'EXECUTE')
  INTO v_auth_can_execute;

  IF NOT v_public_can_execute THEN
    RAISE NOTICE 'PUBLIC: cannot execute rls_auto_enable ✓';
  ELSE
    RAISE WARNING 'PUBLIC: can execute rls_auto_enable';
  END IF;

  IF NOT v_auth_can_execute THEN
    RAISE NOTICE 'authenticated: cannot execute rls_auto_enable ✓';
  ELSE
    RAISE WARNING 'authenticated: can execute rls_auto_enable';
  END IF;
END $$;

-- Final summary
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== SETUP COMPLETE ===';
  RAISE NOTICE 'Database schema initialized successfully';
  RAISE NOTICE 'Review verification output above for any warnings';
END $$;
