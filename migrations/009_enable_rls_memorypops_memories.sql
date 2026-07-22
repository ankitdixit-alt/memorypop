-- Migration: Enable Row Level Security for memorypops and memories
-- Date: 2026-07-22
-- Description: Add RLS policies to prevent unauthorized direct database access via anon key
-- Security Impact: Blocks unauthorized UPDATE/DELETE operations while maintaining public read access
-- Breaking Changes: None (all current application flows continue to work)

-- ============================================================================
-- TABLE: memorypops
-- ============================================================================

-- Enable Row Level Security
ALTER TABLE memorypops ENABLE ROW LEVEL SECURITY;

-- Policy 1: Anyone can create MemoryPops (public creation flow)
-- Required for: /api/memorypops/create
CREATE POLICY "Anyone can create memorypops"
  ON memorypops
  FOR INSERT
  WITH CHECK (true);

-- Policy 2: Public read access (contributors and recipients need celebration data)
-- Required for: /m/{shareCode}/contribute, /m/{shareCode}/reveal, /dashboard/{shareCode}
-- NOTE: This allows reading ALL columns including sensitive ones
-- Mitigation: Sensitive fields should only be queried via authenticated API routes
-- Trade-off: share_code acts as URL secret (security through obscurity)
CREATE POLICY "Public read via share_code"
  ON memorypops
  FOR SELECT
  USING (true);

-- Policy 3: Block direct client updates (must go through API routes)
-- Security: All updates must be validated by server-side API routes
-- Affected routes: /api/send-creator-email, /api/verify-payment
CREATE POLICY "No direct updates from client"
  ON memorypops
  FOR UPDATE
  USING (false);

-- Policy 4: Block direct client deletes
-- Security: Prevents malicious deletion of MemoryPops
CREATE POLICY "No direct deletes from client"
  ON memorypops
  FOR DELETE
  USING (false);

-- ============================================================================
-- TABLE: memories
-- ============================================================================

-- Enable Row Level Security
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;

-- Policy 1: Anyone can insert memories (public contribution flow)
-- Required for: /m/{shareCode}/contribute
CREATE POLICY "Anyone can insert memories"
  ON memories
  FOR INSERT
  WITH CHECK (true);

-- Policy 2: Anyone can read memories (for reveal page)
-- Required for: /m/{shareCode}/reveal, /dashboard/{shareCode}
CREATE POLICY "Anyone can read memories"
  ON memories
  FOR SELECT
  USING (true);

-- Policy 3: Block direct client updates
-- Security: Memories are immutable after creation
CREATE POLICY "No direct updates from client"
  ON memories
  FOR UPDATE
  USING (false);

-- Policy 4: Block direct client deletes
-- Security: Prevents malicious deletion of memories
CREATE POLICY "No direct deletes from client"
  ON memories
  FOR DELETE
  USING (false);

-- ============================================================================
-- VALIDATION QUERIES
-- ============================================================================

-- Verify RLS is enabled
SELECT
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('memorypops', 'memories')
ORDER BY tablename;

-- List all policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd as operation,
  CASE
    WHEN qual IS NOT NULL THEN 'USING clause present'
    ELSE 'No USING clause'
  END as using_clause,
  CASE
    WHEN with_check IS NOT NULL THEN 'WITH CHECK clause present'
    ELSE 'No WITH CHECK clause'
  END as with_check_clause
FROM pg_policies
WHERE tablename IN ('memorypops', 'memories')
ORDER BY tablename, policyname;

-- Count policies per table
SELECT
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE tablename IN ('memorypops', 'memories')
GROUP BY tablename;

-- Expected output:
-- memorypops: 4 policies (INSERT, SELECT, UPDATE, DELETE)
-- memories: 4 policies (INSERT, SELECT, UPDATE, DELETE)

-- ============================================================================
-- ROLLBACK SCRIPT (if needed)
-- ============================================================================

-- Uncomment and run if you need to revert this migration:

-- ALTER TABLE memorypops DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE memories DISABLE ROW LEVEL SECURITY;

-- DROP POLICY IF EXISTS "Anyone can create memorypops" ON memorypops;
-- DROP POLICY IF EXISTS "Public read via share_code" ON memorypops;
-- DROP POLICY IF EXISTS "No direct updates from client" ON memorypops;
-- DROP POLICY IF EXISTS "No direct deletes from client" ON memorypops;

-- DROP POLICY IF EXISTS "Anyone can insert memories" ON memories;
-- DROP POLICY IF EXISTS "Anyone can read memories" ON memories;
-- DROP POLICY IF EXISTS "No direct updates from client" ON memories;
-- DROP POLICY IF EXISTS "No direct deletes from client" ON memories;

-- ============================================================================
-- STORAGE: memory-photos bucket (Manual Configuration Required)
-- ============================================================================

-- Storage policies must be configured via Supabase Dashboard:
--
-- 1. Go to Storage > memory-photos bucket > Policies
-- 2. Create policy: "Anyone can upload photos"
--    Operation: INSERT
--    Policy: WITH CHECK (bucket_id = 'memory-photos')
--
-- 3. Create policy: "Anyone can read photos"
--    Operation: SELECT
--    Policy: USING (bucket_id = 'memory-photos')
--
-- 4. Create policy: "No deletes from client"
--    Operation: DELETE
--    Policy: USING (false)
