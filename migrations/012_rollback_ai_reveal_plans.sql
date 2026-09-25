-- Rollback Migration 012: Remove AI Reveal Plans
-- Date: 2026-09-19

-- Drop the table (CASCADE will drop indexes and policies)
DROP TABLE IF EXISTS ai_reveal_plans CASCADE;

-- Verification: Table should no longer exist
SELECT
  tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'ai_reveal_plans';

-- Expected: (no rows)
