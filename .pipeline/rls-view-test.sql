-- PostgreSQL RLS + Views Behavior Test
-- Purpose: Verify whether views bypass or inherit base table RLS policies

-- Test Setup
-- ============================================================================

-- Create test table
CREATE TABLE IF NOT EXISTS test_rls_table (
  id SERIAL PRIMARY KEY,
  public_field TEXT,
  sensitive_field TEXT
);

-- Insert test data
INSERT INTO test_rls_table (public_field, sensitive_field)
VALUES
  ('Public Data 1', 'Sensitive Data 1'),
  ('Public Data 2', 'Sensitive Data 2');

-- Enable RLS and block anon access
ALTER TABLE test_rls_table ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Block anon access"
  ON test_rls_table
  FOR SELECT
  TO anon
  USING (false);

-- Create view with only public fields
CREATE VIEW test_rls_view AS
SELECT id, public_field
FROM test_rls_table;

-- Grant SELECT on view to anon
GRANT SELECT ON test_rls_view TO anon;

-- Test Queries
-- ============================================================================

-- Test 1: Can service role query base table? (Should succeed)
-- Run as superuser/service role:
SELECT * FROM test_rls_table;
-- Expected: Returns all rows with both columns

-- Test 2: Can anon query base table? (Should fail)
SET ROLE anon;
SELECT * FROM test_rls_table;
-- Expected: Returns 0 rows (blocked by RLS policy)

-- Test 3: Can anon query view? (KEY QUESTION)
SET ROLE anon;
SELECT * FROM test_rls_view;
-- Expected: ???
-- - If views INHERIT RLS: Returns 0 rows (blocked)
-- - If views BYPASS RLS: Returns rows with public_field only

RESET ROLE;

-- Cleanup
-- ============================================================================
DROP VIEW IF EXISTS test_rls_view;
DROP TABLE IF EXISTS test_rls_table;

-- Alternative Test: SECURITY DEFINER Function
-- ============================================================================

-- Recreate table
CREATE TABLE IF NOT EXISTS test_rls_table (
  id SERIAL PRIMARY KEY,
  public_field TEXT,
  sensitive_field TEXT
);

INSERT INTO test_rls_table (public_field, sensitive_field)
VALUES ('Public Data 1', 'Sensitive Data 1');

ALTER TABLE test_rls_table ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Block anon access"
  ON test_rls_table
  FOR SELECT
  TO anon
  USING (false);

-- Create SECURITY DEFINER function
CREATE OR REPLACE FUNCTION get_public_data()
RETURNS TABLE (
  id INTEGER,
  public_field TEXT
)
SECURITY DEFINER -- Runs with function owner's privileges (bypasses RLS)
LANGUAGE SQL
AS $$
  SELECT id, public_field
  FROM test_rls_table;
$$;

-- Grant execute to anon
GRANT EXECUTE ON FUNCTION get_public_data() TO anon;

-- Test SECURITY DEFINER function
SET ROLE anon;
SELECT * FROM get_public_data();
-- Expected: Should return rows (bypasses RLS)

RESET ROLE;

-- Cleanup
DROP FUNCTION IF EXISTS get_public_data();
DROP TABLE IF EXISTS test_rls_table;
