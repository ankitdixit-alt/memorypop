-- ============================================================
-- CORRECT Beta Code Permissions Fix
-- ============================================================
-- Run this in Supabase SQL Editor for memorypop-test
--
-- This script:
-- 1. Keeps RLS enabled on both tables
-- 2. Grants service_role only the required table operations
-- 3. Creates proper RLS policies for service_role access
-- 4. Removes any unsafe grants to authenticated/anon/public
-- 5. Works idempotently (safe to run multiple times)
-- ============================================================

-- Step 1: Remove any existing unsafe policies
DROP POLICY IF EXISTS "Allow authenticated access to beta_codes" ON beta_codes;
DROP POLICY IF EXISTS "Allow authenticated access to beta_code_redemptions" ON beta_code_redemptions;
DROP POLICY IF EXISTS "Service role full access to beta_codes" ON beta_codes;
DROP POLICY IF EXISTS "Service role full access to beta_code_redemptions" ON beta_code_redemptions;
DROP POLICY IF EXISTS "Allow server access to beta_codes" ON beta_codes;
DROP POLICY IF EXISTS "Allow server access to beta_code_redemptions" ON beta_code_redemptions;

-- Step 2: Revoke unsafe grants (if they exist)
REVOKE ALL ON TABLE beta_codes FROM authenticated;
REVOKE ALL ON TABLE beta_codes FROM anon;
REVOKE ALL ON TABLE beta_codes FROM public;

REVOKE ALL ON TABLE beta_code_redemptions FROM authenticated;
REVOKE ALL ON TABLE beta_code_redemptions FROM anon;
REVOKE ALL ON TABLE beta_code_redemptions FROM public;

-- Step 3: Revoke broad sequence grants (safe to revoke if not needed)
-- Only revoke from authenticated since that was the unsafe grant
DO $$
DECLARE
    seq_record RECORD;
BEGIN
    FOR seq_record IN
        SELECT sequence_name
        FROM information_schema.sequences
        WHERE sequence_schema = 'public'
    LOOP
        BEGIN
            EXECUTE format('REVOKE ALL ON SEQUENCE %I FROM authenticated', seq_record.sequence_name);
        EXCEPTION WHEN OTHERS THEN
            -- Ignore if grant didn't exist
            NULL;
        END;
    END LOOP;
END $$;

-- Step 4: Enable RLS (in case it was disabled)
ALTER TABLE beta_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE beta_code_redemptions ENABLE ROW LEVEL SECURITY;

-- Step 5: Grant table privileges to service_role
-- Based on operations in redeem-beta-code/route.ts:
-- beta_codes: SELECT (line 107-112), UPDATE (line 178-185, 205-210)
-- beta_code_redemptions: SELECT (line 161-166), INSERT (line 196-201), DELETE (line 231-234)

GRANT SELECT, UPDATE ON TABLE beta_codes TO service_role;
GRANT SELECT, INSERT, DELETE ON TABLE beta_code_redemptions TO service_role;

-- Step 6: Grant sequence access to service_role (only for these tables' sequences if they exist)
-- These tables use UUID primary keys, so no sequences expected, but grant for safety
DO $$
DECLARE
    seq_record RECORD;
BEGIN
    -- Only sequences owned by our two tables
    FOR seq_record IN
        SELECT s.sequence_name
        FROM information_schema.sequences s
        WHERE s.sequence_schema = 'public'
        AND EXISTS (
            SELECT 1
            FROM pg_depend d
            JOIN pg_class c ON d.objid = c.oid
            JOIN pg_class t ON d.refobjid = t.oid
            WHERE c.relname = s.sequence_name
            AND t.relname IN ('beta_codes', 'beta_code_redemptions')
        )
    LOOP
        EXECUTE format('GRANT USAGE, SELECT ON SEQUENCE %I TO service_role', seq_record.sequence_name);
    END LOOP;
END $$;

-- Step 7: Create RLS policies for service_role
CREATE POLICY "service_role can manage beta_codes"
  ON beta_codes
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "service_role can manage beta_code_redemptions"
  ON beta_code_redemptions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- Verification Queries
-- ============================================================

-- Verify policies exist for service_role only
SELECT 'Policies:' as check;
SELECT tablename, policyname, roles
FROM pg_policies
WHERE tablename IN ('beta_codes', 'beta_code_redemptions')
ORDER BY tablename, policyname;

-- Verify RLS is enabled
SELECT 'RLS Status:' as check;
SELECT tablename, rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN ('beta_codes', 'beta_code_redemptions')
AND schemaname = 'public';

-- Verify table privileges for service_role
SELECT 'Table Privileges for service_role:' as check;
SELECT
    table_name,
    string_agg(privilege_type, ', ' ORDER BY privilege_type) as privileges
FROM information_schema.table_privileges
WHERE grantee = 'service_role'
AND table_name IN ('beta_codes', 'beta_code_redemptions')
GROUP BY table_name
ORDER BY table_name;

-- Test service role can access beta_codes
SELECT 'Beta Code Access Test:' as check;
SELECT id, campaign_name, active, current_redemptions, total_redemption_limit, expires_at
FROM beta_codes
WHERE campaign_name = 'test_2026';

-- Verify authenticated/anon have no direct access (should show no privileges)
SELECT 'Unsafe Grants Check (should be empty):' as check;
SELECT grantee, table_name, privilege_type
FROM information_schema.table_privileges
WHERE table_name IN ('beta_codes', 'beta_code_redemptions')
AND grantee IN ('authenticated', 'anon', 'public')
ORDER BY grantee, table_name;
