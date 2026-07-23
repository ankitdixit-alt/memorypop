# Phase 3: RLS Testing Checklist

**Purpose:** Verify that enabling RLS has zero impact on application functionality.

**Expected Result:** All flows work identically to Phase 2 because all database operations use service role (which bypasses RLS).

---

## Pre-Migration Verification

### ✅ Before running migration, confirm:
- [ ] Phase 1 complete (service role client exists)
- [ ] Phase 2 complete (zero browser database operations)
- [ ] Current working directory: `/Users/adixit/Downloads/MemoryPop/memorypop`
- [ ] Environment variable `SUPABASE_SERVICE_ROLE_KEY` is set
- [ ] Application builds successfully: `npm run build`
- [ ] All tests pass: `npm test`
- [ ] Dev server starts: `npm run dev`

---

## Migration Steps

### Step 1: Apply RLS Migration

1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `.pipeline/phase3-rls-migration.sql`
3. Paste into SQL Editor
4. Click "Run"
5. Verify: "Success. No rows returned"

### Step 2: Verify RLS Enabled

Run verification queries in Supabase SQL Editor:

```sql
-- Check RLS is enabled on all tables
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('memorypops', 'memories', 'memorypop_reactions');
```

**Expected result:**
```
tablename              | rowsecurity
-----------------------|-------------
memorypops             | true
memories               | true
memorypop_reactions    | true
```

### Step 3: Verify Policies Exist

```sql
-- Check blocking policies exist
SELECT tablename, policyname, roles
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('memorypops', 'memories', 'memorypop_reactions');
```

**Expected result:** 3 policies, all with `roles = {anon}`

---

## Post-Migration Testing

### Test 1: Create MemoryPop Flow

**Goal:** Verify service role can create MemoryPops despite RLS

1. Navigate to: `http://localhost:3000/create`
2. Fill in form:
   - Recipient Name: "Test User"
   - Occasion: "Birthday"
   - Story: "Test celebration"
   - Tone: "Warm"
   - Celebration Date: (future date)
   - Cover Style: (any)
3. Click "Create MemoryPop"
4. **Expected:** Success page with management token
5. **Expected:** Dashboard URL displayed
6. **Verify:** No console errors
7. **Verify:** Database insert succeeded (check Supabase table editor)

**Status:** ⬜ Pass / ⬜ Fail

---

### Test 2: Contribute Memory Flow

**Goal:** Verify service role can insert memories and upload photos

1. Copy contribute link from success page
2. Open in new incognito/private window
3. Fill in form:
   - Your Name: "Test Contributor"
   - Message: "Test memory message"
   - Upload photo: (optional)
4. Click "Add Memory"
5. **Expected:** Success screen with progress message
6. **Expected:** Memory count displayed
7. **Verify:** No console errors
8. **Verify:** Photo uploaded to storage (if provided)
9. **Verify:** Memory inserted in database

**Status:** ⬜ Pass / ⬜ Fail

---

### Test 3: Dashboard Access Flow

**Goal:** Verify service role can query memorypops and memories

1. Navigate to dashboard using management token link
2. **Expected:** Dashboard loads with:
   - MemoryPop details
   - Memory count
   - Contributor list
   - Share buttons
3. **Verify:** No console errors
4. **Verify:** Data displayed correctly

**Status:** ⬜ Pass / ⬜ Fail

---

### Test 4: Prepare Reveal Flow

**Goal:** Verify service role can update status

1. From dashboard, click "Prepare the Reveal"
2. Confirm in modal
3. **Expected:** Status changes to "ready"
4. **Expected:** Reveal link section appears
5. **Verify:** No console errors
6. **Verify:** Database status updated to 'ready'

**Status:** ⬜ Pass / ⬜ Fail

---

### Test 5: Reveal Experience Flow

**Goal:** Verify service role can query memories and reactions

1. Copy reveal link from dashboard
2. Open in new incognito/private window
3. Click through reveal experience
4. **Expected:** Welcome screen loads
5. **Expected:** All memories display
6. **Expected:** Final celebration screen appears
7. **Verify:** No console errors
8. **Verify:** Photos load correctly

**Status:** ⬜ Pass / ⬜ Fail

---

### Test 6: Reaction Submission Flow

**Goal:** Verify service role can insert reactions

1. From reveal experience, select a reaction (❤️, 🥹, or 😂)
2. **Expected:** Thank you screen appears
3. **Expected:** Reaction saved
4. **Verify:** No console errors
5. **Verify:** Database insert succeeded
6. Reload reveal page
7. **Expected:** Skips reaction prompt (shows thank you directly)

**Status:** ⬜ Pass / ⬜ Fail

---

### Test 7: API Routes Direct Test

**Goal:** Verify all API routes work with RLS enabled

#### Test 7a: POST /api/memories
```bash
curl -X POST http://localhost:3000/api/memories \
  -H "Content-Type: application/json" \
  -d '{
    "shareCode": "YOUR_SHARE_CODE",
    "contributorName": "API Test",
    "message": "Test memory via API"
  }'
```

**Expected:** `{"success": true, "memorypopId": "...", "memoryCount": N}`

**Status:** ⬜ Pass / ⬜ Fail

#### Test 7b: POST /api/reactions
```bash
curl -X POST http://localhost:3000/api/reactions \
  -H "Content-Type: application/json" \
  -d '{
    "memorypopId": "YOUR_MEMORYPOP_ID",
    "reactionType": "loved_it"
  }'
```

**Expected:** `{"success": true, "duplicate": false}`

**Status:** ⬜ Pass / ⬜ Fail

#### Test 7c: PATCH /api/memorypops/[id]/status
```bash
curl -X PATCH http://localhost:3000/api/memorypops/YOUR_MEMORYPOP_ID/status \
  -H "Content-Type: application/json" \
  -d '{"status": "ready"}'
```

**Expected:** `{"success": true, "status": "ready"}`

**Status:** ⬜ Pass / ⬜ Fail

---

### Test 8: Anonymous Access Blocked

**Goal:** Verify anon key cannot access database (only storage)

#### Test 8a: Verify anon key is blocked from database

In Supabase SQL Editor:
```sql
SET ROLE anon;
SELECT COUNT(*) FROM memorypops;
-- Expected: ERROR or 0 rows (policy blocks access)

SELECT COUNT(*) FROM memories;
-- Expected: ERROR or 0 rows (policy blocks access)

SELECT COUNT(*) FROM memorypop_reactions;
-- Expected: ERROR or 0 rows (policy blocks access)

RESET ROLE;
```

**Status:** ⬜ Pass / ⬜ Fail

#### Test 8b: Verify storage uploads still work

1. Navigate to contribute page
2. Upload photo
3. **Expected:** Upload succeeds
4. **Expected:** Photo displays in form
5. **Verify:** Photo saved to Supabase Storage

**Status:** ⬜ Pass / ⬜ Fail

---

### Test 9: Build and Test Suite

**Goal:** Verify no regressions in automated tests

```bash
# Type checking
npx tsc --noEmit

# Test suite
npm test

# Production build (may fail at "Collecting page data" due to missing env vars)
npm run build
```

**Expected:**
- TypeScript: ✅ No errors
- Tests: ✅ All pass
- Build: ⚠️ May fail at page data collection (env vars), but compilation should succeed

**Status:** ⬜ Pass / ⬜ Fail

---

## Rollback Procedure

### If any test fails:

1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `.pipeline/phase3-rls-rollback.sql`
3. Paste into SQL Editor
4. Click "Run"
5. Verify: "Success. No rows returned"
6. Re-run failed test
7. Report failure details to team

### Verify rollback successful:
```sql
-- Check RLS is disabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('memorypops', 'memories', 'memorypop_reactions');
```

**Expected after rollback:** All `rowsecurity = false`

---

## Success Criteria

Phase 3 is complete when:
- ✅ All 9 tests pass
- ✅ RLS enabled on all tables
- ✅ Anonymous database access blocked
- ✅ Service role operations unchanged
- ✅ Zero functionality impact
- ✅ No console errors
- ✅ No user-facing changes

---

## Notes

- **Service role bypasses RLS:** This is PostgreSQL behavior, not a bug
- **Anon key only for storage:** This is by design (Phase 2 removed DB access)
- **Zero code changes:** Phase 3 is database-only
- **Easy rollback:** Run rollback.sql if needed
- **Production ready:** After all tests pass, safe to deploy

---

## Completion Checklist

After completing all tests:
- [ ] All tests marked as "Pass"
- [ ] No rollback performed (or rollback + fix + re-test)
- [ ] Documentation updated
- [ ] Commit Phase 3 changes
- [ ] Notify team of completion
