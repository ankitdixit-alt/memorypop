-- Rollback Migration 015: Remove atomic publish function
-- Date: 2026-09-20

DROP FUNCTION IF EXISTS publish_reveal_plan(
  UUID,
  TEXT,
  INTEGER,
  TEXT,
  JSONB,
  TEXT,
  TEXT,
  JSONB,
  TEXT,
  TEXT,
  TEXT
);

-- Verification
SELECT proname FROM pg_proc WHERE proname = 'publish_reveal_plan';
-- Should return 0 rows
