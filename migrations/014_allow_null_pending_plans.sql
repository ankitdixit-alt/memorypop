-- Migration 014: Allow NULL for pending plans
-- Date: 2026-09-19
-- Description: Allow NULL plan and input_snapshot to distinguish pending from completed

-- Allow NULL for plan (pending generation)
ALTER TABLE ai_reveal_plans
  ALTER COLUMN plan DROP NOT NULL;

-- Allow NULL for input_snapshot (pending generation)
ALTER TABLE ai_reveal_plans
  ALTER COLUMN input_snapshot DROP NOT NULL;

-- Allow empty input_hash for pending
ALTER TABLE ai_reveal_plans
  ALTER COLUMN input_hash DROP NOT NULL;

-- Comments
COMMENT ON COLUMN ai_reveal_plans.plan IS 'Validated RevealPlan JSON (NULL if generation pending)';
COMMENT ON COLUMN ai_reveal_plans.input_snapshot IS 'Input data used for generation (NULL if pending)';
COMMENT ON COLUMN ai_reveal_plans.input_hash IS 'SHA-256 hash of input (empty if pending)';

-- Verification
SELECT column_name, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'ai_reveal_plans'
  AND column_name IN ('plan', 'input_snapshot', 'input_hash');

-- Expected: All should be YES
