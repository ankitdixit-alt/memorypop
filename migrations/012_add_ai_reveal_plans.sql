-- Migration 012: Add AI Reveal Plans
-- Date: 2026-09-19
-- Description: Store AI-generated reveal plans for MemoryPop Plus

-- Table to store AI-generated reveal plans
CREATE TABLE ai_reveal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memorypop_id UUID NOT NULL REFERENCES memorypops(id) ON DELETE CASCADE,

  -- Plan content (validated RevealPlan JSON)
  plan JSONB NOT NULL,

  -- Generation metadata
  model_name TEXT NOT NULL, -- e.g., 'openai/gpt-oss-120b'
  model_provider TEXT NOT NULL, -- e.g., 'groq'
  schema_version TEXT NOT NULL DEFAULT 'v1', -- Track schema evolution
  prompt_version TEXT NOT NULL DEFAULT 'v1', -- Track prompt changes

  -- Input snapshot (to detect stale plans)
  input_snapshot JSONB NOT NULL, -- Occasion, mood, memory IDs, messages
  input_hash TEXT NOT NULL, -- Quick comparison for staleness

  -- Generation status
  generation_source TEXT NOT NULL, -- 'ai_generated' | 'deterministic_fallback'
  generation_error TEXT, -- Store error if fallback was used

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  -- Constraints
  CONSTRAINT valid_generation_source CHECK (generation_source IN ('ai_generated', 'deterministic_fallback'))
);

-- Indexes for efficient lookups
CREATE INDEX idx_ai_reveal_plans_memorypop_id ON ai_reveal_plans(memorypop_id);
CREATE INDEX idx_ai_reveal_plans_input_hash ON ai_reveal_plans(input_hash);
CREATE INDEX idx_ai_reveal_plans_created_at ON ai_reveal_plans(created_at);

-- Only one plan per MemoryPop (replace on regeneration)
CREATE UNIQUE INDEX idx_ai_reveal_plans_unique_memorypop ON ai_reveal_plans(memorypop_id);

-- RLS: Service role only (consistent with existing security model)
ALTER TABLE ai_reveal_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only - all operations"
  ON ai_reveal_plans
  FOR ALL
  USING (auth.role() = 'service_role');

-- Comments for documentation
COMMENT ON TABLE ai_reveal_plans IS 'AI-generated reveal plans for MemoryPop Plus experiences';
COMMENT ON COLUMN ai_reveal_plans.plan IS 'Validated RevealPlan JSON (chapters, finale, highlights, transitions)';
COMMENT ON COLUMN ai_reveal_plans.input_snapshot IS 'Input data used for generation (occasion, memory IDs, messages)';
COMMENT ON COLUMN ai_reveal_plans.input_hash IS 'SHA-256 hash of input snapshot for quick staleness detection';
COMMENT ON COLUMN ai_reveal_plans.generation_source IS 'Whether plan came from AI or deterministic fallback';
COMMENT ON COLUMN ai_reveal_plans.generation_error IS 'Error message if AI generation failed and fallback was used';

-- Verification query
SELECT
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'ai_reveal_plans';

-- Expected: ai_reveal_plans | true
