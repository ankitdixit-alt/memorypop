-- MemoryPop Test Database Initialization
-- Complete schema including migrations 001-015
-- For hosted Supabase test project only
-- Date: 2026-09-21

-- =============================================================================
-- BASE SCHEMA (from 000_init_base_schema.sql)
-- =============================================================================

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

-- =============================================================================
-- MIGRATION 012: AI Reveal Plans Table
-- =============================================================================

CREATE TABLE IF NOT EXISTS ai_reveal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memorypop_id UUID REFERENCES memorypops(id) ON DELETE CASCADE NOT NULL UNIQUE,
  plan JSONB,
  input_hash TEXT NOT NULL DEFAULT '',
  model_name TEXT NOT NULL DEFAULT 'pending',
  model_provider TEXT NOT NULL DEFAULT 'pending',
  input_snapshot JSONB,
  generation_source TEXT NOT NULL,
  generation_error TEXT,
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

-- Base indexes
CREATE INDEX IF NOT EXISTS idx_memories_memorypop_id ON memories(memorypop_id);
CREATE INDEX IF NOT EXISTS idx_memories_created_at ON memories(created_at);
CREATE INDEX IF NOT EXISTS idx_memorypop_reactions_memorypop_id ON memorypop_reactions(memorypop_id);

-- Migration 005-008 indexes
CREATE INDEX IF NOT EXISTS idx_memorypops_creator_email
  ON memorypops(creator_email)
  WHERE creator_email IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_memorypops_verification_token_hash
  ON memorypops(verification_token_hash)
  WHERE verification_token_hash IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_memorypops_management_token_hash
  ON memorypops(management_token_hash);

-- Migration 010 indexes
CREATE INDEX IF NOT EXISTS idx_memories_photos ON memories USING GIN (photos);
CREATE INDEX IF NOT EXISTS idx_memories_gifs ON memories USING GIN (gifs);
CREATE INDEX IF NOT EXISTS idx_memories_video_exists ON memories ((video IS NOT NULL));

-- Migration 012-013 indexes
CREATE INDEX IF NOT EXISTS idx_ai_reveal_plans_memorypop_id ON ai_reveal_plans(memorypop_id);

-- =============================================================================
-- CONSTRAINTS
-- =============================================================================

-- Migration 010: Multimedia constraints
ALTER TABLE memories
ADD CONSTRAINT IF NOT EXISTS photos_is_array CHECK (jsonb_typeof(photos) = 'array');

ALTER TABLE memories
ADD CONSTRAINT IF NOT EXISTS gifs_is_array CHECK (jsonb_typeof(gifs) = 'array');

ALTER TABLE memories
ADD CONSTRAINT IF NOT EXISTS video_is_object_or_null CHECK (
  video IS NULL OR jsonb_typeof(video) = 'object'
);

ALTER TABLE memories
ADD CONSTRAINT IF NOT EXISTS photos_max_count CHECK (jsonb_array_length(photos) <= 10);

ALTER TABLE memories
ADD CONSTRAINT IF NOT EXISTS gifs_max_count CHECK (jsonb_array_length(gifs) <= 3);

-- =============================================================================
-- MIGRATION 009 + 011: ROW LEVEL SECURITY (Service Role Only)
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
-- These policies block all anon and authenticated access
-- Service role automatically bypasses RLS

-- Memorypops: Service role only
CREATE POLICY memorypops_insert_policy ON memorypops
  FOR INSERT
  WITH CHECK (false);

CREATE POLICY memorypops_select_policy ON memorypops
  FOR SELECT
  USING (false);

CREATE POLICY memorypops_update_policy ON memorypops
  FOR UPDATE
  USING (false);

CREATE POLICY memorypops_delete_policy ON memorypops
  FOR DELETE
  USING (false);

-- Memories: Service role only
CREATE POLICY memories_insert_policy ON memories
  FOR INSERT
  WITH CHECK (false);

CREATE POLICY memories_select_policy ON memories
  FOR SELECT
  USING (false);

CREATE POLICY memories_update_policy ON memories
  FOR UPDATE
  USING (false);

CREATE POLICY memories_delete_policy ON memories
  FOR DELETE
  USING (false);

-- Reactions: Service role only
CREATE POLICY reactions_insert_policy ON memorypop_reactions
  FOR INSERT
  WITH CHECK (false);

CREATE POLICY reactions_select_policy ON memorypop_reactions
  FOR SELECT
  USING (false);

CREATE POLICY reactions_update_policy ON memorypop_reactions
  FOR UPDATE
  USING (false);

CREATE POLICY reactions_delete_policy ON memorypop_reactions
  FOR DELETE
  USING (false);

-- AI Reveal Plans: Service role only
CREATE POLICY ai_plans_insert_policy ON ai_reveal_plans
  FOR INSERT
  WITH CHECK (false);

CREATE POLICY ai_plans_select_policy ON ai_reveal_plans
  FOR SELECT
  USING (false);

CREATE POLICY ai_plans_update_policy ON ai_reveal_plans
  FOR UPDATE
  USING (false);

CREATE POLICY ai_plans_delete_policy ON ai_reveal_plans
  FOR DELETE
  USING (false);

-- =============================================================================
-- MIGRATION 015: Atomic Publish Function
-- =============================================================================

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
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_row RECORD;
BEGIN
  -- Atomic SELECT FOR UPDATE to lock the row
  SELECT
    generation_version,
    generation_lock_holder,
    generation_lock_expires_at,
    input_hash
  INTO v_row
  FROM ai_reveal_plans
  WHERE memorypop_id = p_memorypop_id
  FOR UPDATE;

  -- Check 1: Version mismatch (stale write)
  IF v_row.generation_version != p_expected_version THEN
    RETURN 'version_mismatch';
  END IF;

  -- Check 2: Wrong lock holder
  IF v_row.generation_lock_holder != p_worker_id THEN
    RETURN 'wrong_lock_holder';
  END IF;

  -- Check 3: Lock expired (use database time, not client time)
  IF v_row.generation_lock_expires_at < NOW() THEN
    RETURN 'lock_expired';
  END IF;

  -- Check 4: Input changed during generation
  IF v_row.input_hash != p_expected_input_hash THEN
    RETURN 'input_changed';
  END IF;

  -- All checks passed: publish plan and release lock
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
$$;

-- Grant execute permission to service_role only
GRANT EXECUTE ON FUNCTION publish_reveal_plan TO service_role;

-- =============================================================================
-- VERIFICATION QUERY
-- =============================================================================

-- Verify tables exist
SELECT
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_name IN ('memorypops', 'memories', 'memorypop_reactions', 'ai_reveal_plans')
ORDER BY table_name;

-- Verify function exists
SELECT proname, prokind, prosecdef
FROM pg_proc
WHERE proname = 'publish_reveal_plan';

-- Verify RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('memorypops', 'memories', 'memorypop_reactions', 'ai_reveal_plans')
ORDER BY tablename;
