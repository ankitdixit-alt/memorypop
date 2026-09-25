-- Rollback Migration 013: Remove Concurrency Protection
-- Date: 2026-09-19
-- Description: Remove concurrency control fields

-- Drop index
DROP INDEX IF EXISTS idx_ai_reveal_plans_lock_expires;

-- Remove columns
ALTER TABLE ai_reveal_plans
  DROP COLUMN IF EXISTS generation_version,
  DROP COLUMN IF EXISTS generation_lock_holder,
  DROP COLUMN IF EXISTS generation_lock_acquired_at,
  DROP COLUMN IF EXISTS generation_lock_expires_at;

-- Verification
SELECT column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'ai_reveal_plans'
  AND column_name IN ('generation_version', 'generation_lock_holder', 'generation_lock_acquired_at', 'generation_lock_expires_at');

-- Expected: (no rows)
