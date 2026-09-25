-- Migration 013: Add Concurrency Protection
-- Date: 2026-09-19
-- Description: Add fields for database-backed concurrency coordination

-- Add concurrency control fields
ALTER TABLE ai_reveal_plans
  ADD COLUMN generation_version INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN generation_lock_holder TEXT,
  ADD COLUMN generation_lock_acquired_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN generation_lock_expires_at TIMESTAMP WITH TIME ZONE;

-- Index for lock expiration cleanup
CREATE INDEX idx_ai_reveal_plans_lock_expires ON ai_reveal_plans(generation_lock_expires_at)
  WHERE generation_lock_expires_at IS NOT NULL;

-- Comments
COMMENT ON COLUMN ai_reveal_plans.generation_version IS 'Increment on each generation attempt; prevents stale writes';
COMMENT ON COLUMN ai_reveal_plans.generation_lock_holder IS 'Worker ID that currently holds generation lock';
COMMENT ON COLUMN ai_reveal_plans.generation_lock_acquired_at IS 'When current worker acquired the lock';
COMMENT ON COLUMN ai_reveal_plans.generation_lock_expires_at IS 'When current lock expires (crashed worker protection)';

-- Verification
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'ai_reveal_plans'
  AND column_name IN ('generation_version', 'generation_lock_holder', 'generation_lock_acquired_at', 'generation_lock_expires_at');
