-- MemoryPop Test Database Initialization
-- Run this in Supabase SQL Editor for a fresh test project
-- DO NOT run on production database

-- This script combines:
-- - Base schema (memorypops, memories)
-- - Migration 001: memorypop_reactions
-- - Migrations 012-015: AI Director features

-- ======================
-- BASE SCHEMA
-- ======================

-- Create memorypops table
CREATE TABLE IF NOT EXISTS memorypops (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_name TEXT NOT NULL,
  occasion TEXT NOT NULL,
  story TEXT,
  mood TEXT,
  tone TEXT,
  status TEXT DEFAULT 'collecting' NOT NULL,
  share_code TEXT UNIQUE NOT NULL,
  creator_token TEXT,
  management_token_hash TEXT,
  celebration_date DATE,
  cover_style TEXT DEFAULT 'simple' NOT NULL,
  is_premium BOOLEAN DEFAULT FALSE NOT NULL,
  upgraded_at TIMESTAMP WITH TIME ZONE,
  stripe_payment_id TEXT,
  stripe_customer_id TEXT,
  creator_email TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  email_verification_token TEXT,
  email_verification_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  CONSTRAINT valid_status CHECK (status IN ('collecting', 'ready', 'revealed'))
);

-- Create memories table
CREATE TABLE IF NOT EXISTS memories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  memorypop_id UUID NOT NULL REFERENCES memorypops(id) ON DELETE CASCADE,
  contributor_name TEXT NOT NULL,
  contributor_relationship TEXT,
  message TEXT NOT NULL,
  photo_url TEXT,
  photos TEXT[],
  gifs TEXT[],
  video JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Base indexes
CREATE INDEX IF NOT EXISTS idx_memorypops_share_code ON memorypops(share_code);
CREATE INDEX IF NOT EXISTS idx_memorypops_creator_token ON memorypops(creator_token);
CREATE INDEX IF NOT EXISTS idx_memorypops_management_token_hash ON memorypops(management_token_hash);
CREATE INDEX IF NOT EXISTS idx_memorypops_is_premium ON memorypops(is_premium);
CREATE INDEX IF NOT EXISTS idx_memorypops_stripe_payment_id ON memorypops(stripe_payment_id);
CREATE INDEX IF NOT EXISTS idx_memorypops_creator_email ON memorypops(creator_email);
CREATE INDEX IF NOT EXISTS idx_memories_memorypop_id ON memories(memorypop_id);
CREATE INDEX IF NOT EXISTS idx_memories_created_at ON memories(created_at DESC);

-- Enable RLS
ALTER TABLE memorypops ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (permissive for testing)
DROP POLICY IF EXISTS "Anyone can read memorypops" ON memorypops;
CREATE POLICY "Anyone can read memorypops"
  ON memorypops FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert memorypops" ON memorypops;
CREATE POLICY "Anyone can insert memorypops"
  ON memorypops FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update memorypops" ON memorypops;
CREATE POLICY "Anyone can update memorypops"
  ON memorypops FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Anyone can read memories" ON memories;
CREATE POLICY "Anyone can read memories"
  ON memories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert memories" ON memories;
CREATE POLICY "Anyone can insert memories"
  ON memories FOR INSERT WITH CHECK (true);

-- ======================
-- MIGRATION 001: REACTIONS
-- ======================

CREATE TABLE IF NOT EXISTS memorypop_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  memorypop_id UUID NOT NULL REFERENCES memorypops(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('loved_it', 'made_me_emotional', 'made_me_laugh')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_one_reaction_per_memorypop
  ON memorypop_reactions(memorypop_id);
CREATE INDEX IF NOT EXISTS idx_reactions_by_memorypop
  ON memorypop_reactions(memorypop_id);
CREATE INDEX IF NOT EXISTS idx_reactions_by_created_at
  ON memorypop_reactions(created_at DESC);

ALTER TABLE memorypop_reactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert reactions" ON memorypop_reactions;
CREATE POLICY "Anyone can insert reactions"
  ON memorypop_reactions FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can read reactions" ON memorypop_reactions;
CREATE POLICY "Anyone can read reactions"
  ON memorypop_reactions FOR SELECT USING (true);

-- ======================
-- MIGRATION 012: AI REVEAL PLANS
-- ======================

CREATE TABLE IF NOT EXISTS ai_reveal_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  memorypop_id UUID NOT NULL UNIQUE REFERENCES memorypops(id) ON DELETE CASCADE,
  plan JSONB,
  model_name TEXT NOT NULL,
  model_provider TEXT NOT NULL,
  schema_version TEXT DEFAULT 'v1' NOT NULL,
  prompt_version TEXT DEFAULT 'v1' NOT NULL,
  input_snapshot JSONB,
  input_hash TEXT,
  generation_source TEXT,
  generation_error TEXT,
  generation_version INTEGER NOT NULL DEFAULT 1,
  generation_lock_holder TEXT,
  generation_lock_acquired_at TIMESTAMP WITH TIME ZONE,
  generation_lock_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ai_reveal_plans_memorypop_id
  ON ai_reveal_plans(memorypop_id);
CREATE INDEX IF NOT EXISTS idx_ai_reveal_plans_input_hash
  ON ai_reveal_plans(input_hash);
CREATE INDEX IF NOT EXISTS idx_ai_reveal_plans_lock_holder
  ON ai_reveal_plans(generation_lock_holder);
CREATE INDEX IF NOT EXISTS idx_ai_reveal_plans_lock_expires
  ON ai_reveal_plans(generation_lock_expires_at);

ALTER TABLE ai_reveal_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access to ai_reveal_plans" ON ai_reveal_plans;
CREATE POLICY "Service role full access to ai_reveal_plans"
  ON ai_reveal_plans
  FOR ALL
  USING (true);

-- ======================
-- MIGRATION 015: ATOMIC PUBLISH FUNCTION
-- ======================

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
  FOR UPDATE; -- Lock row for atomic check-and-set

  -- Check 1: Version must match (prevents stale writes)
  IF v_current_version IS NULL OR v_current_version != p_expected_version THEN
    RETURN 'version_mismatch';
  END IF;

  -- Check 2: We must still hold the lock
  IF v_current_lock_holder IS NULL OR v_current_lock_holder != p_worker_id THEN
    RETURN 'lock_lost';
  END IF;

  -- Check 3: Lock must not have expired (using database time)
  IF v_current_lock_expiry IS NOT NULL AND v_current_lock_expiry < NOW() THEN
    RETURN 'lock_expired';
  END IF;

  -- Check 4: Input must match expected (content freshness)
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

  GET DIAGNOSTICS v_rows_updated = ROW_COUNT;

  IF v_rows_updated = 1 THEN
    RETURN 'success';
  ELSE
    RETURN 'no_rows_updated';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION publish_reveal_plan TO service_role;
GRANT EXECUTE ON FUNCTION publish_reveal_plan TO authenticated;
GRANT EXECUTE ON FUNCTION publish_reveal_plan TO anon;

-- ======================
-- VERIFICATION
-- ======================

-- Verify tables exist
SELECT
  'memorypops' as table_name,
  COUNT(*) as exists
FROM pg_tables
WHERE tablename = 'memorypops'
UNION ALL
SELECT
  'memories',
  COUNT(*)
FROM pg_tables
WHERE tablename = 'memories'
UNION ALL
SELECT
  'ai_reveal_plans',
  COUNT(*)
FROM pg_tables
WHERE tablename = 'ai_reveal_plans'
UNION ALL
SELECT
  'memorypop_reactions',
  COUNT(*)
FROM pg_tables
WHERE tablename = 'memorypop_reactions';

-- Verify function exists
SELECT
  proname as function_name,
  'exists' as status
FROM pg_proc
WHERE proname = 'publish_reveal_plan';
