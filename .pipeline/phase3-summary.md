# Phase 3: Enable Row Level Security (RLS)

**Status:** Ready to Apply
**Type:** Database Migration Only (No Code Changes)
**Risk Level:** VERY LOW
**Rollback:** Easy (see phase3-rls-rollback.sql)

---

## Overview

Phase 3 enables PostgreSQL Row Level Security (RLS) on all database tables and blocks anonymous access. This completes the security model by ensuring the anonymous key cannot query or modify the database.

**Why this is safe:**
- All database operations already use service role (Phase 1 & 2)
- Service role bypasses RLS automatically (PostgreSQL feature)
- No application code changes required
- Zero expected functionality impact
- Easy rollback if issues arise

---

## What Changes

### Database Changes (3 tables)

**Tables with RLS enabled:**
1. `memorypops` - Main MemoryPop records
2. `memories` - Memory contributions
3. `memorypop_reactions` - Recipient reactions

**Policies created:**
- Block anonymous access to memorypops (all operations)
- Block anonymous access to memories (all operations)
- Block anonymous access to memorypop_reactions (all operations)

### Code Changes

**NONE** - Phase 3 is database-only.

All code changes were completed in Phase 1 & 2:
- Phase 1: Server-side code uses service role
- Phase 2: Client-side database operations removed

---

## Service Role vs Anonymous Role

### Before Phase 3 (No RLS)
```
Anonymous Role:
  ✅ Can query all tables
  ✅ Can insert into memories, memorypop_reactions
  ✅ Can update memorypops status

Service Role:
  ✅ Can query all tables
  ✅ Can insert into all tables
  ✅ Can update all tables
```

### After Phase 3 (RLS Enabled)
```
Anonymous Role:
  ❌ BLOCKED from all database operations
  ✅ Can still upload to storage (separate permissions)

Service Role:
  ✅ Can query all tables (bypasses RLS)
  ✅ Can insert into all tables (bypasses RLS)
  ✅ Can update all tables (bypasses RLS)
```

**Key Point:** Service role operations are completely unchanged because PostgreSQL service roles bypass RLS by default.

---

## Files in This Phase

### Migration Files
- `phase3-rls-migration.sql` - Enables RLS and creates blocking policies
- `phase3-rls-rollback.sql` - Disables RLS and drops policies (emergency use)

### Documentation
- `phase3-testing-checklist.md` - Comprehensive testing guide (9 tests)
- `phase3-summary.md` - This file

---

## How to Apply Phase 3

### Step 1: Pre-Migration Checklist

Verify these conditions before applying migration:

```bash
# Current working directory
cd /Users/adixit/Downloads/MemoryPop/memorypop

# Verify Phase 1 & 2 complete
git log --oneline -5
# Should show: Phase 2 commit (068f761) and Phase 1 commit (95dbe31)

# Verify service role key is set
echo $SUPABASE_SERVICE_ROLE_KEY
# Should output your service role key (not anon key)

# Verify application works
npm run dev
# Should start without errors
```

### Step 2: Apply Migration

1. Open Supabase Dashboard in browser
2. Navigate to: **SQL Editor**
3. Create a new query
4. Copy entire contents of `.pipeline/phase3-rls-migration.sql`
5. Paste into SQL Editor
6. Click **Run**
7. Wait for: "Success. No rows returned"

**If you see an error:** Stop and report the error message. Do not proceed.

### Step 3: Verify Migration Applied

Run verification queries in SQL Editor:

```sql
-- Check RLS enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('memorypops', 'memories', 'memorypop_reactions');
```

**Expected output:**
```
tablename              | rowsecurity
-----------------------|-------------
memorypops             | true
memories               | true
memorypop_reactions    | true
```

```sql
-- Check policies exist
SELECT tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('memorypops', 'memories', 'memorypop_reactions');
```

**Expected output:** 3 rows (one policy per table)

### Step 4: Test Application

Follow the comprehensive testing guide in `phase3-testing-checklist.md`.

**Minimum tests (5-10 minutes):**
1. ✅ Create a new MemoryPop
2. ✅ Add a memory with photo
3. ✅ View dashboard
4. ✅ Prepare reveal
5. ✅ View reveal experience
6. ✅ Submit a reaction

**Expected result:** All flows work identically to before.

---

## Expected Results

### What Should Work (Unchanged)

✅ **Create MemoryPop flow**
✅ **Contribute memory flow (including photo upload)**
✅ **Dashboard view**
✅ **Prepare reveal**
✅ **Reveal experience**
✅ **Reaction submission**
✅ **Storage uploads (photos)**
✅ **All API routes**
✅ **All Server Components**

### What Should Be Blocked

❌ **Anonymous database queries** (Supabase SQL Editor with anon role)
❌ **Anonymous database inserts** (Direct Supabase client with anon key)
❌ **Anonymous database updates** (Direct Supabase client with anon key)

**Note:** Browser still has anon key for storage uploads, but RLS blocks database access.

---

## Troubleshooting

### Problem: Application errors after migration

**Symptoms:**
- Console errors mentioning "new row violates row-level security policy"
- API routes returning 500 errors
- Pages failing to load

**Diagnosis:**
Some code is still using anon key instead of service role.

**Solution:**
1. Check browser console for specific error
2. Identify which operation is failing
3. Verify that operation uses service role (not anon key)
4. If using anon key, this is a Phase 2 issue (should have been fixed)

**Emergency Rollback:**
Run `phase3-rls-rollback.sql` in Supabase SQL Editor to restore Phase 2 state.

---

### Problem: Service role operations failing

**Symptoms:**
- API routes fail with RLS errors
- Server Components fail to query database

**Diagnosis:**
Service role should bypass RLS. This indicates:
- Wrong key being used (anon instead of service role)
- Environment variable misconfiguration

**Solution:**
1. Check `.env.local` for `SUPABASE_SERVICE_ROLE_KEY`
2. Verify it matches Supabase Dashboard → Settings → API → service_role key
3. Restart dev server: `npm run dev`

**Emergency Rollback:**
Run `phase3-rls-rollback.sql` if problem persists.

---

### Problem: Storage uploads failing

**Symptoms:**
- Photo uploads fail in contribute form
- Storage-related errors in console

**Diagnosis:**
Storage permissions are separate from database RLS. This is unrelated to Phase 3.

**Solution:**
1. Check Supabase Dashboard → Storage → Policies
2. Verify anon role can INSERT into `memory-photos` bucket
3. Verify anon role can SELECT from `memory-photos` bucket

**Note:** This should not happen in Phase 3 (storage unchanged).

---

## Rollback Procedure

### When to Rollback

Only rollback if:
- Application is broken after migration
- Service role operations are failing
- Cannot complete Phase 3 testing checklist

### How to Rollback

1. Open Supabase Dashboard → SQL Editor
2. Copy entire contents of `.pipeline/phase3-rls-rollback.sql`
3. Paste into SQL Editor
4. Click **Run**
5. Verify: "Success. No rows returned"
6. Test application (should work like Phase 2)
7. Report issue before re-attempting Phase 3

### Verify Rollback Success

```sql
-- All tables should show rowsecurity = false
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('memorypops', 'memories', 'memorypop_reactions');
```

---

## Security Impact

### Before Phase 3
```
Browser (anon key) → Supabase → Database ❌ EXPOSED
Browser (anon key) → Supabase → Storage ✅ ALLOWED

Server (service role) → Supabase → Database ✅ ALLOWED
Server (service role) → Supabase → Storage ✅ ALLOWED
```

**Problem:** Anon key has database access (even though Phase 2 removed DB operations from client).

### After Phase 3
```
Browser (anon key) → Supabase → Database ✅ BLOCKED BY RLS
Browser (anon key) → Supabase → Storage ✅ ALLOWED

Server (service role) → Supabase → Database ✅ ALLOWED (bypasses RLS)
Server (service role) → Supabase → Storage ✅ ALLOWED
```

**Result:** Defense-in-depth security. Even if client code tried to query database, RLS would block it.

---

## Next Steps After Phase 3

Once Phase 3 is complete and tested:

### Optional: Phase 4 - Storage Hardening

If you want maximum security:
- Move storage uploads to API route (like database operations)
- Remove anon key from client entirely
- Block anon role from storage operations

**Trade-offs:**
- Pro: Zero client credentials
- Con: Extra API route for uploads
- Con: Server must handle multipart/form-data
- Con: Slightly higher latency for uploads

**Recommendation:** Phase 4 is optional. Phase 3 provides production-grade security.

---

## Success Criteria

Phase 3 is complete when:
- ✅ RLS enabled on all tables
- ✅ Blocking policies created
- ✅ All tests in checklist pass
- ✅ Zero functionality changes observed
- ✅ No console errors
- ✅ Documentation committed

---

## Questions & Answers

**Q: Why doesn't service role need policy updates?**
A: PostgreSQL service roles bypass RLS by default. This is a built-in PostgreSQL feature.

**Q: Can anon key still upload photos?**
A: Yes. Storage permissions are separate from database RLS. Phase 2 removed database operations but kept storage uploads client-side.

**Q: What if I want to allow some anon database access?**
A: Replace `USING (false)` policies with granular policies (e.g., allow SELECT on specific columns). This is advanced and not needed for MemoryPop.

**Q: Is this the final security state?**
A: Yes, unless you want Phase 4 (storage hardening). Phase 3 provides production-grade security.

**Q: How do I verify anonymous access is blocked?**
A: See Test 8 in `phase3-testing-checklist.md`. Run queries with `SET ROLE anon` in SQL Editor.

---

## Commit Message

After successful testing, commit with:

```bash
git add .pipeline/phase3-*.sql .pipeline/phase3-*.md
git commit -m "Phase 3: Enable RLS and block anonymous database access

PHASE 3: Enable Row Level Security (RLS Preparation Complete)

This is the third milestone of the 4-phase server-first architecture migration.
Phase 3 enables PostgreSQL RLS on all tables and blocks anonymous database
access. All application operations use service role (which bypasses RLS).
Zero code changes, database-only migration.

WHY THIS CHANGE:
- Phases 1 & 2 moved all operations to service role
- Phase 3 enforces security at database level (defense-in-depth)
- Blocks anon key from database access (even if client tried)
- Storage uploads still use anon key (separate permissions)

DATABASE CHANGES:
- Enable RLS on: memorypops, memories, memorypop_reactions
- Create blocking policies: USING (false) for anon role
- Service role bypasses RLS (PostgreSQL default behavior)

FILES ADDED:
- .pipeline/phase3-rls-migration.sql (apply RLS)
- .pipeline/phase3-rls-rollback.sql (emergency rollback)
- .pipeline/phase3-testing-checklist.md (9 comprehensive tests)
- .pipeline/phase3-summary.md (implementation guide)

CODE CHANGES:
NONE - Phase 3 is database-only

TESTING:
- All user flows work identically
- Service role operations unchanged
- Anonymous database access blocked
- Storage uploads still work

SAFETY:
- Zero expected impact (all ops already use service role)
- Easy rollback (run rollback.sql)
- Service role bypasses RLS automatically
- No application code changes

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```
