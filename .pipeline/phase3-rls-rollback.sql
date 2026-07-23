/**
 * Phase 3: RLS Rollback
 *
 * This script safely rolls back Phase 3 RLS changes if needed.
 *
 * USE ONLY IF:
 * - Service role operations are failing
 * - Unexpected RLS behavior is observed
 * - Need to debug RLS policies
 *
 * HOW TO APPLY:
 * 1. Go to Supabase Dashboard → SQL Editor
 * 2. Copy this entire file
 * 3. Run as a single transaction
 * 4. Verify "Success. No rows returned"
 *
 * WHAT THIS DOES:
 * - Drops all blocking policies
 * - Disables RLS on all tables
 * - Restores Phase 2 state (no RLS)
 */

-- ============================================================================
-- STEP 1: Drop all blocking policies
-- ============================================================================

-- Drop policy on memorypops
DROP POLICY IF EXISTS "Block anonymous access to memorypops" ON memorypops;

-- Drop policy on memories
DROP POLICY IF EXISTS "Block anonymous access to memories" ON memories;

-- Drop policy on memorypop_reactions
DROP POLICY IF EXISTS "Block anonymous access to memorypop_reactions" ON memorypop_reactions;

-- ============================================================================
-- STEP 2: Disable Row Level Security
-- ============================================================================

-- Disable RLS on memorypops table
ALTER TABLE memorypops DISABLE ROW LEVEL SECURITY;

-- Disable RLS on memories table
ALTER TABLE memories DISABLE ROW LEVEL SECURITY;

-- Disable RLS on memorypop_reactions table
ALTER TABLE memorypop_reactions DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- VERIFICATION QUERIES (optional - run separately to verify)
-- ============================================================================

/*
-- Check RLS is disabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('memorypops', 'memories', 'memorypop_reactions');
-- Expected: All tables show rowsecurity = false

-- Check policies are gone
SELECT tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('memorypops', 'memories', 'memorypop_reactions');
-- Expected: 0 rows (no policies)
*/
