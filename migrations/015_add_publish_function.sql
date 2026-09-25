-- Migration 015: Add atomic publish function
-- Date: 2026-09-20
-- Description: Atomic plan publication with database-time expiry and input freshness checks

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
  -- Allow empty current hash (initial state) or matching hash
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

-- Comments
COMMENT ON FUNCTION publish_reveal_plan IS 'Atomically publish reveal plan with version, lock, expiry, and input freshness checks';

-- Grant execute to service role
GRANT EXECUTE ON FUNCTION publish_reveal_plan TO service_role;
GRANT EXECUTE ON FUNCTION publish_reveal_plan TO authenticated;
GRANT EXECUTE ON FUNCTION publish_reveal_plan TO anon;

-- Verification
SELECT proname, prosrc FROM pg_proc WHERE proname = 'publish_reveal_plan';
