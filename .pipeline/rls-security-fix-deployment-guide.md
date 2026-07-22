# RLS Security Fix - Deployment Guide

**Date:** 2026-07-22
**Migration:** 009_enable_rls_memorypops_memories.sql
**Risk Level:** LOW (no breaking changes expected)
**Deployment Time:** ~5 minutes

---

## Pre-Deployment Checklist

- [ ] Backup production database (Supabase Dashboard > Database > Backups)
- [ ] Review migration SQL: `migrations/009_enable_rls_memorypops_memories.sql`
- [ ] Confirm current RLS status:
  ```sql
  SELECT tablename, rowsecurity
  FROM pg_tables
  WHERE schemaname = 'public'
  AND tablename IN ('memorypops', 'memories', 'memorypop_reactions');
  ```
  Expected: `memorypop_reactions` = true, others = false

---

## Deployment Steps

### Step 1: Apply Migration via Supabase Dashboard

1. Go to **Supabase Dashboard** → Your Project
2. Navigate to **SQL Editor**
3. Click **New query**
4. Copy entire contents of `migrations/009_enable_rls_memorypops_memories.sql`
5. Paste into SQL Editor
6. Click **Run** (or Cmd+Enter)

### Step 2: Verify Migration Success

Run validation queries (included at bottom of migration file):

```sql
-- Expected output:
-- memorypops | true
-- memories | true

SELECT tablename, rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('memorypops', 'memories')
ORDER BY tablename;
```

```sql
-- Expected output: 8 rows (4 policies per table)

SELECT tablename, policyname, cmd as operation
FROM pg_policies
WHERE tablename IN ('memorypops', 'memories')
ORDER BY tablename, policyname;
```

Expected policies:

**memorypops:**
- Anyone can create memorypops (INSERT)
- Public read via share_code (SELECT)
- No direct updates from client (UPDATE)
- No direct deletes from client (DELETE)

**memories:**
- Anyone can insert memories (INSERT)
- Anyone can read memories (SELECT)
- No direct updates from client (UPDATE)
- No direct deletes from client (DELETE)

### Step 3: Configure Storage Bucket Policies (Manual)

1. Go to **Storage** → **memory-photos** bucket
2. Click **Policies** tab
3. Click **New policy**

**Policy 1: Anyone can upload photos**
- Policy name: `Anyone can upload photos`
- Allowed operation: `INSERT`
- Policy definition:
  ```sql
  WITH CHECK (bucket_id = 'memory-photos')
  ```
- Target roles: `public`

**Policy 2: Anyone can read photos**
- Policy name: `Anyone can read photos`
- Allowed operation: `SELECT`
- Policy definition:
  ```sql
  USING (bucket_id = 'memory-photos')
  ```
- Target roles: `public`

**Policy 3: No deletes from client**
- Policy name: `No deletes from client`
- Allowed operation: `DELETE`
- Policy definition:
  ```sql
  USING (false)
  ```
- Target roles: `public`

---

## Post-Deployment Testing

### Test 1: Create New MemoryPop (Public Creation)

1. Go to `https://memorypop.app/create`
2. Fill in recipient, occasion, story
3. Click "Create My MemoryPop"
4. **Expected:** Success, redirects to `/success?shareCode=...`
5. **If fails:** Check browser console, verify INSERT policy exists

### Test 2: Contribute Memory (Public Contribution)

1. Use contributor link: `https://memorypop.app/m/{shareCode}/contribute`
2. Enter name, message, upload photo
3. Click "Add My Memory"
4. **Expected:** Success, sees "Your memory was added!"
5. **If fails:** Check INSERT policy on `memories` table and storage bucket

### Test 3: View Dashboard (Creator Authorization)

1. Go to `https://memorypop.app/dashboard/{shareCode}`
2. **Expected:** Dashboard loads, shows memory count
3. **If fails:** Check SELECT policy on `memorypops` and `memories`

### Test 4: Reveal MemoryPop (Public Reveal)

1. Go to `https://memorypop.app/m/{shareCode}/reveal`
2. **Expected:** Reveal experience loads with all memories
3. **If fails:** Check SELECT policies

### Test 5: Send Creator Email (If Enabled)

1. On success page, enter email
2. Click "Email me these details"
3. **Expected:** Success message, email received
4. **If fails:** Check that API route can UPDATE `verification_sent_at`

### Test 6: Verify Unauthorized Operations Are Blocked

**Test via Browser Console:**

1. Open browser console on any page
2. Extract anon key from Network tab or source code
3. Attempt unauthorized operation:

```javascript
// This should FAIL (policy blocks client UPDATE)
const { data, error } = await supabase
  .from('memorypops')
  .update({ status: 'revealed' })
  .eq('share_code', 'TEST_CODE');

console.log(error); // Expected: "new row violates row-level security policy"
```

```javascript
// This should FAIL (policy blocks client DELETE)
const { data, error } = await supabase
  .from('memories')
  .delete()
  .eq('id', 'some-uuid');

console.log(error); // Expected: "new row violates row-level security policy"
```

---

## Rollback Instructions (If Needed)

If any tests fail, rollback immediately:

```sql
-- Disable RLS
ALTER TABLE memorypops DISABLE ROW LEVEL SECURITY;
ALTER TABLE memories DISABLE ROW LEVEL SECURITY;

-- Drop policies
DROP POLICY IF EXISTS "Anyone can create memorypops" ON memorypops;
DROP POLICY IF EXISTS "Public read via share_code" ON memorypops;
DROP POLICY IF EXISTS "No direct updates from client" ON memorypops;
DROP POLICY IF EXISTS "No direct deletes from client" ON memorypops;

DROP POLICY IF EXISTS "Anyone can insert memories" ON memories;
DROP POLICY IF EXISTS "Anyone can read memories" ON memories;
DROP POLICY IF EXISTS "No direct updates from client" ON memories;
DROP POLICY IF EXISTS "No direct deletes from client" ON memories;
```

Then investigate issue before re-attempting.

---

## Expected Outcomes

### ✅ What Should Work:

- Public MemoryPop creation
- Public contribution flow
- Public reveal flow
- Creator dashboard access
- Creator email sending
- Photo uploads
- Sitemap generation

### ❌ What Should Be Blocked:

- Direct client UPDATE operations on `memorypops`
- Direct client DELETE operations on `memorypops`
- Direct client UPDATE operations on `memories`
- Direct client DELETE operations on `memories`
- Direct client DELETE operations on storage files

### 🔄 What Changes:

**Before:** Anyone with anon key could modify/delete ANY data
**After:** Modifications must go through authenticated API routes

---

## Monitoring After Deployment

Check for errors in:

1. **Vercel Logs** (Runtime errors)
   - Look for "row-level security policy" errors
   - Check API route failures

2. **Supabase Logs** (Database errors)
   - Go to Supabase Dashboard → Logs → Database
   - Look for RLS policy violations

3. **Sentry** (Application errors)
   - Check for new error patterns
   - Look for Supabase permission errors

---

## Security Improvements Delivered

### Before Migration:
- ❌ Anyone could bulk query all MemoryPops
- ❌ Anyone could modify ANY MemoryPop (change status, delete)
- ❌ Anyone could delete ANY memory
- ❌ Anyone could delete storage files
- ❌ Management token hashes exposed via direct queries
- ❌ Creator emails exposed (when feature enabled)
- ❌ Stripe payment IDs exposed

### After Migration:
- ✅ Bulk queries still possible BUT modifications blocked
- ✅ No client-side UPDATE/DELETE operations
- ✅ Storage files protected from deletion
- ⚠️ Sensitive fields still readable (Phase 2 hardening needed)

---

## Phase 2 Hardening (Future)

**Not included in this migration:**

1. **Column-level security:**
   - Create Postgres views that exclude sensitive columns
   - Grant policies on views instead of base tables
   - Requires: Application code refactoring

2. **Rate limiting:**
   - Prevent bulk scraping of share_codes
   - Implement: Cloudflare rate limiting or Supabase Edge Functions

3. **Supabase Edge Functions:**
   - Move sensitive queries server-side
   - Return only sanitized data to client
   - Requires: New Edge Function deployment

---

## Questions or Issues?

If you encounter errors during deployment:

1. Check validation queries output
2. Review Supabase logs for specific error messages
3. Verify RLS status: `SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'memorypops';`
4. Check policy count: `SELECT COUNT(*) FROM pg_policies WHERE tablename = 'memorypops';`
5. If stuck, rollback and investigate before retry

---

**Migration Status:** Ready for deployment
**Approval:** Founder approved Option 1 (2026-07-22)
**Next Step:** Apply migration via Supabase Dashboard SQL Editor
