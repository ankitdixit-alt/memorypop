-- Migration 011: Secure RLS - Service Role Only Access
-- Date: 2026-08-28
-- Security Model: Simple server-only architecture
--
-- WHAT THIS DOES:
-- - Removes permissive anon/authenticated policies that allow unrestricted access
-- - Blocks ALL direct anon/authenticated database access (SELECT, INSERT, UPDATE, DELETE)
-- - Preserves service_role access (bypasses RLS automatically)
-- - RLS remains ENABLED on all tables
--
-- WHY THIS IS SAFE:
-- - All legitimate database access goes through Next.js API/Server Components
-- - API/Server code uses supabaseServer (service role key)
-- - Service role automatically bypasses RLS (Supabase built-in behavior)
-- - No application code changes required
--
-- WHAT THIS PREVENTS:
-- - Anon key data enumeration (reading ALL MemoryPops, emails, messages)
-- - Unauthorized memory injection (inserting spam to any MemoryPop)
-- - Share code discovery (listing all share codes)
-- - Creator email harvesting
--
-- WHAT THIS PRESERVES:
-- - All existing MemoryPop share links continue working
-- - Frictionless sharing (no login required for contributors/recipients)
-- - Current UX completely unchanged
-- - API routes continue working identically
--
-- ROLLBACK:
-- See: 011_rollback_secure_rls.sql
--
-- ============================================================================

-- ============================================================================
-- TABLE: memorypops
-- ============================================================================

-- Remove existing permissive policies
DROP POLICY IF EXISTS "Anyone can create memorypops" ON memorypops;
DROP POLICY IF EXISTS "Public read via share_code" ON memorypops;
DROP POLICY IF EXISTS "No direct updates from client" ON memorypops;
DROP POLICY IF EXISTS "No direct deletes from client" ON memorypops;

-- Create single restrictive policy: service role only for all operations
CREATE POLICY "Service role only - all operations"
  ON memorypops
  FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================================
-- TABLE: memories
-- ============================================================================

-- Remove existing permissive policies
DROP POLICY IF EXISTS "Anyone can insert memories" ON memories;
DROP POLICY IF EXISTS "Anyone can read memories" ON memories;
DROP POLICY IF EXISTS "No direct updates from client" ON memories;
DROP POLICY IF EXISTS "No direct deletes from client" ON memories;

-- Create single restrictive policy: service role only for all operations
CREATE POLICY "Service role only - all operations"
  ON memories
  FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================================
-- TABLE: memorypop_reactions
-- ============================================================================

-- Remove existing permissive policies
DROP POLICY IF EXISTS "Anyone can insert reactions" ON memorypop_reactions;
DROP POLICY IF EXISTS "Anyone can read reactions" ON memorypop_reactions;

-- Create single restrictive policy: service role only for all operations
CREATE POLICY "Service role only - all operations"
  ON memorypop_reactions
  FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify RLS is still enabled on all tables
SELECT
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('memorypops', 'memories', 'memorypop_reactions')
ORDER BY tablename;

-- Expected output (all should show rls_enabled = true):
-- memorypops          | true
-- memories            | true
-- memorypop_reactions | true

-- List all policies (should show exactly 3: one per table)
SELECT
  tablename,
  policyname,
  cmd as operations
FROM pg_policies
WHERE tablename IN ('memorypops', 'memories', 'memorypop_reactions')
ORDER BY tablename;

-- Expected output:
-- memorypops          | Service role only - all operations | ALL
-- memories            | Service role only - all operations | ALL
-- memorypop_reactions | Service role only - all operations | ALL

-- ============================================================================
-- POST-MIGRATION TEST
-- ============================================================================

-- These queries should ALL work when run with service_role key:
-- (This is what Next.js API routes will do)

-- Test 1: Read MemoryPops by share_code
-- SELECT * FROM memorypops WHERE share_code = 'test-share-code' LIMIT 1;

-- Test 2: Read memories by memorypop_id
-- SELECT * FROM memories WHERE memorypop_id = 'test-uuid' LIMIT 5;

-- Test 3: Insert new memory
-- INSERT INTO memories (memorypop_id, contributor_name, message, photos, gifs, video)
-- VALUES ('test-uuid', 'Test Contributor', 'Test message', '[]', '[]', NULL);

-- Test 4: Insert reaction
-- INSERT INTO memorypop_reactions (memorypop_id, reaction_type)
-- VALUES ('test-uuid', 'loved_it');

-- All above should succeed with service_role.
-- All above should FAIL with anon key (intended behavior).

-- ============================================================================
-- SUCCESS CRITERIA
-- ============================================================================

-- After running this migration:
-- ✅ RLS enabled on all 3 tables
-- ✅ 3 policies total (one per table)
-- ✅ All policies restrict to service_role only
-- ✅ Anon key cannot query any table
-- ✅ API routes continue working (service_role bypasses RLS)
-- ✅ Existing MemoryPops continue working
-- ✅ Supabase security warning disappears

-- ============================================================================
