/**
 * Phase 4: Optional Storage Policies
 *
 * This migration blocks anonymous storage access (defense-in-depth).
 *
 * IMPORTANT: These policies are OPTIONAL.
 * After Phase 4, the client no longer has the anon key, so these policies
 * provide defense-in-depth only (extra security layer).
 *
 * WHY OPTIONAL:
 * - Phase 4 removes anon key from client
 * - Client cannot access storage even without policies
 * - These policies add extra safety if anon key were to leak
 *
 * APPLY ONLY IF:
 * - You want maximum security paranoia
 * - You want defense-in-depth at storage layer
 * - You don't plan to use anon key for other features
 *
 * DO NOT APPLY IF:
 * - You plan to add Supabase Auth (needs anon key)
 * - You plan to add Realtime subscriptions (needs anon key)
 * - You want to keep anon key as fallback
 *
 * HOW TO APPLY:
 * 1. Go to Supabase Dashboard → Storage → memory-photos → Policies
 * 2. Delete existing policies (if any)
 * 3. Copy the policies below
 * 4. Apply via Supabase Dashboard (Storage has different policy UI than Database)
 *
 * HOW TO ROLLBACK:
 * See phase4-storage-policies-rollback.sql
 */

-- ============================================================================
-- STORAGE POLICIES (Apply via Supabase Dashboard → Storage → Policies)
-- ============================================================================

-- NOTE: Storage policies use a different syntax and are applied via Dashboard
-- You cannot run these directly in SQL Editor
-- Go to: Dashboard → Storage → memory-photos → Policies

-- ============================================================================
-- Policy 1: Block Anonymous Uploads
-- ============================================================================

-- Policy Name: Block anonymous uploads to memory-photos
-- Allowed operation: INSERT
-- Target roles: anon
-- Policy definition:
false

-- This blocks all anonymous uploads
-- Service role bypasses this policy automatically

-- ============================================================================
-- Policy 2: Block Anonymous Reads
-- ============================================================================

-- Policy Name: Block anonymous reads from memory-photos
-- Allowed operation: SELECT
-- Target roles: anon
-- Policy definition:
false

-- This blocks all anonymous reads
-- Service role bypasses this policy automatically
-- Public URLs still work (they don't use auth)

-- ============================================================================
-- Policy 3: Block Anonymous Updates
-- ============================================================================

-- Policy Name: Block anonymous updates to memory-photos
-- Allowed operation: UPDATE
-- Target roles: anon
-- Policy definition:
false

-- ============================================================================
-- Policy 4: Block Anonymous Deletes
-- ============================================================================

-- Policy Name: Block anonymous deletes from memory-photos
-- Allowed operation: DELETE
-- Target roles: anon
-- Policy definition:
false

-- ============================================================================
-- VERIFICATION (After applying policies)
-- ============================================================================

-- Go to: Dashboard → Storage → memory-photos → Policies
-- You should see 4 policies, all blocking anon role

-- Test service role still works:
-- 1. Navigate to contribute page
-- 2. Upload a photo
-- 3. Should work (API route uses service role)

-- ============================================================================
-- NOTES
-- ============================================================================

-- 1. Public URLs still work:
--    - getPublicUrl() returns URL that works without auth
--    - These policies don't affect public URL access
--    - They only block direct storage operations via Supabase client

-- 2. Service role bypasses policies:
--    - API route uploads use service role
--    - Service role operations continue to work
--    - No application changes needed

-- 3. If you need to allow anon access in future:
--    - Delete these policies via Dashboard
--    - Or replace `false` with granular rules
--    - Example: USING (auth.role() = 'authenticated')
