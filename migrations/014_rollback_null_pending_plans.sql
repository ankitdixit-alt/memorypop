-- Rollback Migration 014: Restore NOT NULL constraints
-- Date: 2026-09-19
-- Description: Restore NOT NULL constraints (requires cleaning pending plans first)

-- Note: This will fail if there are NULL values
-- Clean up pending plans first: DELETE FROM ai_reveal_plans WHERE plan IS NULL;

ALTER TABLE ai_reveal_plans
  ALTER COLUMN plan SET NOT NULL;

ALTER TABLE ai_reveal_plans
  ALTER COLUMN input_snapshot SET NOT NULL;

ALTER TABLE ai_reveal_plans
  ALTER COLUMN input_hash SET NOT NULL;

-- Verification
SELECT column_name, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'ai_reveal_plans'
  AND column_name IN ('plan', 'input_snapshot', 'input_hash');

-- Expected: All should be NO
