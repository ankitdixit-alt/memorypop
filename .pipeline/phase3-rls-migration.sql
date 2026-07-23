/**
 * Phase 3: Enable Row Level Security (RLS)
 *
 * This migration enables RLS on all tables and blocks anonymous database access.
 *
 * SAFETY:
 * - All database operations now use service role (Phase 1 & 2)
 * - Service role bypasses RLS automatically
 * - No application code changes required
 * - Zero expected impact on functionality
 *
 * TABLES AFFECTED:
 * - memorypops
 * - memories
 * - memorypop_reactions
 *
 * HOW TO APPLY:
 * 1. Go to Supabase Dashboard → SQL Editor
 * 2. Copy this entire file
 * 3. Run as a single transaction
 * 4. Verify "Success. No rows returned"
 *
 * HOW TO ROLLBACK:
 * See phase3-rls-rollback.sql
 */

-- ============================================================================
-- STEP 1: Enable Row Level Security on all tables
-- ============================================================================

-- Enable RLS on memorypops table
ALTER TABLE memorypops ENABLE ROW LEVEL SECURITY;

-- Enable RLS on memories table
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;

-- Enable RLS on memorypop_reactions table
ALTER TABLE memorypop_reactions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 2: Create blocking policies for anonymous role
-- ============================================================================

-- Block all anonymous access to memorypops
CREATE POLICY "Block anonymous access to memorypops"
  ON memorypops
  FOR ALL
  TO anon
  USING (false);

-- Block all anonymous access to memories
CREATE POLICY "Block anonymous access to memories"
  ON memories
  FOR ALL
  TO anon
  USING (false);

-- Block all anonymous access to memorypop_reactions
CREATE POLICY "Block anonymous access to memorypop_reactions"
  ON memorypop_reactions
  FOR ALL
  TO anon
  USING (false);

-- ============================================================================
-- VERIFICATION QUERIES (optional - run separately to verify)
-- ============================================================================

/*
-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('memorypops', 'memories', 'memorypop_reactions');
-- Expected: All tables show rowsecurity = true

-- Check policies exist
SELECT tablename, policyname, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('memorypops', 'memories', 'memorypop_reactions');
-- Expected: 3 policies, all blocking anon role

-- Test anonymous access (should return 0 rows)
SET ROLE anon;
SELECT COUNT(*) FROM memorypops;  -- Expected: 0
SELECT COUNT(*) FROM memories;    -- Expected: 0
SELECT COUNT(*) FROM memorypop_reactions;  -- Expected: 0
RESET ROLE;

-- Test service role access (should work normally)
-- Service role bypasses RLS, so this will work in your application
*/
