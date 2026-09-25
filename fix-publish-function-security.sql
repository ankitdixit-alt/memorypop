-- Fix publish_reveal_plan security
-- Run ONCE in production Supabase SQL Editor

-- Set search_path to prevent function search path mutable warning
ALTER FUNCTION publish_reveal_plan(
  UUID, TEXT, INTEGER, TEXT, JSONB, TEXT, TEXT, JSONB, TEXT, TEXT, TEXT
) SET search_path = public;

-- Revoke public execute permissions
REVOKE ALL ON FUNCTION publish_reveal_plan(
  UUID, TEXT, INTEGER, TEXT, JSONB, TEXT, TEXT, JSONB, TEXT, TEXT, TEXT
) FROM PUBLIC;

REVOKE ALL ON FUNCTION publish_reveal_plan(
  UUID, TEXT, INTEGER, TEXT, JSONB, TEXT, TEXT, JSONB, TEXT, TEXT, TEXT
) FROM anon;

REVOKE ALL ON FUNCTION publish_reveal_plan(
  UUID, TEXT, INTEGER, TEXT, JSONB, TEXT, TEXT, JSONB, TEXT, TEXT, TEXT
) FROM authenticated;

-- Ensure service_role has execute (should already exist, but explicit)
GRANT EXECUTE ON FUNCTION publish_reveal_plan(
  UUID, TEXT, INTEGER, TEXT, JSONB, TEXT, TEXT, JSONB, TEXT, TEXT, TEXT
) TO service_role;
