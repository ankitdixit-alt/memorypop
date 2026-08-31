-- ROLLBACK for Migration 011: Secure RLS - Service Role Only Access
-- Date: 2026-08-28
--
-- USE ONLY IF: Migration 011 breaks legitimate MemoryPop functionality
--
-- THIS SCRIPT RESTORES THE PREVIOUS PERMISSIVE POLICIES
-- (The ones that allowed unrestricted anon access and triggered Supabase warning)
--
-- WHEN TO USE:
-- - API routes fail after migration
-- - MemoryPop pages fail to load
-- - Cannot create/view memories
-- - Service role appears blocked
--
-- EXECUTE TIME: ~30 seconds
--
-- ============================================================================

-- ============================================================================
-- TABLE: memorypops
-- ============================================================================

-- Remove restrictive policy
DROP POLICY IF EXISTS "Service role only - all operations" ON memorypops;

-- Restore previous permissive policies (from migration 009)
CREATE POLICY "Anyone can create memorypops"
  ON memorypops
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public read via share_code"
  ON memorypops
  FOR SELECT
  USING (true);

CREATE POLICY "No direct updates from client"
  ON memorypops
  FOR UPDATE
  USING (false);

CREATE POLICY "No direct deletes from client"
  ON memorypops
  FOR DELETE
  USING (false);

-- ============================================================================
-- TABLE: memories
-- ============================================================================

-- Remove restrictive policy
DROP POLICY IF EXISTS "Service role only - all operations" ON memories;

-- Restore previous permissive policies (from migration 009)
CREATE POLICY "Anyone can insert memories"
  ON memories
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can read memories"
  ON memories
  FOR SELECT
  USING (true);

CREATE POLICY "No direct updates from client"
  ON memories
  FOR UPDATE
  USING (false);

CREATE POLICY "No direct deletes from client"
  ON memories
  FOR DELETE
  USING (false);

-- ============================================================================
-- TABLE: memorypop_reactions
-- ============================================================================

-- Remove restrictive policy
DROP POLICY IF EXISTS "Service role only - all operations" ON memorypop_reactions;

-- Restore previous permissive policies (from migration 001)
CREATE POLICY "Anyone can insert reactions"
  ON memorypop_reactions
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can read reactions"
  ON memorypop_reactions
  FOR SELECT
  USING (true);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- List all policies (should show 10 total: 4 + 4 + 2)
SELECT
  tablename,
  policyname,
  cmd as operations
FROM pg_policies
WHERE tablename IN ('memorypops', 'memories', 'memorypop_reactions')
ORDER BY tablename, policyname;

-- Expected output after rollback:
-- memorypops          | Anyone can create memorypops         | INSERT
-- memorypops          | No direct deletes from client        | DELETE
-- memorypops          | No direct updates from client        | UPDATE
-- memorypops          | Public read via share_code           | SELECT
-- memories            | Anyone can insert memories           | INSERT
-- memories            | Anyone can read memories             | SELECT
-- memories            | No direct deletes from client        | DELETE
-- memories            | No direct updates from client        | UPDATE
-- memorypop_reactions | Anyone can insert reactions          | INSERT
-- memorypop_reactions | Anyone can read reactions            | SELECT

-- ============================================================================
-- POST-ROLLBACK STATE
-- ============================================================================

-- After running this rollback:
-- ⚠️  Anon key can enumerate ALL MemoryPops again (security exposure returns)
-- ⚠️  Anon key can insert spam memories again
-- ⚠️  Supabase security warning will reappear
-- ✅  All MemoryPop functionality continues working
-- ✅  API routes continue working
-- ✅  Existing share links continue working

-- ============================================================================
-- NEXT STEPS AFTER ROLLBACK
-- ============================================================================

-- If you needed to rollback:
-- 1. Document what broke (API route? Page? Flow?)
-- 2. Verify service_role key is correct in .env.local
-- 3. Verify API routes use supabaseServer (not supabase client)
-- 4. Check application logs for RLS policy errors
-- 5. Report issue for investigation

-- ============================================================================
