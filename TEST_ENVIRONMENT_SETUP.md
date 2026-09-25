# ⚠️ OBSOLETE - DO NOT USE

**This guide is superseded by TEST_SETUP_FINAL.md**

**Problems with this guide:**
- Contains instructions to overwrite .env.local (unsafe)
- Verbose and duplicative
- Missing mock AI provider configuration

**Use instead:** `TEST_SETUP_FINAL.md`

---

## MemoryPop AI Director - Test Environment Setup & Verification

**Purpose**: Complete integration testing using a hosted Supabase test project
**Date**: 2026-09-21
**Status**: OBSOLETE - Use TEST_SETUP_FINAL.md

---

## Prerequisites

- [ ] Supabase account
- [ ] Available free project slot (check: supabase.com/dashboard)
- [ ] No Docker, Colima, or local PostgreSQL required

---

## Phase 1: Create Test Project (Supabase Dashboard)

### Step 1: Create New Project

1. Go to: https://supabase.com/dashboard
2. Click "New Project"
3. Settings:
   - **Name**: `memorypop-test` (or similar)
   - **Database Password**: [Generate and save securely]
   - **Region**: Choose closest region
   - **Pricing**: Free plan
4. Click "Create new project"
5. Wait for project initialization (~2 minutes)

### Step 2: Get API Credentials

1. In project dashboard, go to: **Settings → API**
2. Copy these values:
   - **Project URL**: `https://[project-ref].supabase.co`
   - **Project Ref**: `[project-ref]` (from URL)
   - **anon public key**: `eyJhbGc...` (under "Project API keys")
   - **service_role key**: `eyJhbGc...` (under "Project API keys" - click reveal)

⚠️ **IMPORTANT**: The service_role key bypasses RLS. Keep it private.

---

## Phase 2: Initialize Test Database (SQL Editor)

### Step 3: Run Initialization Script

1. In project dashboard, go to: **SQL Editor**
2. Click "New query"
3. Open file: `~/Downloads/MemoryPop/memorypop/test-db-init.sql`
4. Copy entire contents
5. Paste into SQL Editor
6. Click "Run" (or Cmd+Enter)

**Expected output**:
```
Success. No rows returned
Success. No rows returned
...
[Verification query shows 4 tables exist]
[Function exists]
```

If errors occur, check:
- All commands ran completely
- No partial execution
- Refresh and try again if timeout

---

## Phase 3: Configure Test Environment (Local)

### Step 4: Create Test Configuration

1. Copy template:
   ```bash
   cd ~/Downloads/MemoryPop/memorypop
   cp .env.test.template .env.test
   ```

2. Edit `.env.test` with credentials from Step 2:
   ```bash
   # Use nano, vim, VS Code, or any editor
   nano .env.test
   ```

3. Fill in these values:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://[your-project-ref].supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
   SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]
   TEST_PROJECT_REF=[your-project-ref]
   ```

4. Keep other values as-is (already configured for testing)

5. Save and close

**Security note**: `.env.test` is in `.gitignore`. Do not commit it.

---

## Phase 4: Database Function Verification

### Step 5: Run Database Tests

```bash
# Load test environment
export NEXT_PUBLIC_SUPABASE_URL=$(grep NEXT_PUBLIC_SUPABASE_URL .env.test | cut -d '=' -f2)
export SUPABASE_SERVICE_ROLE_KEY=$(grep SUPABASE_SERVICE_ROLE_KEY .env.test | cut -d '=' -f2)
export TEST_PROJECT_REF=$(grep TEST_PROJECT_REF .env.test | cut -d '=' -f2)

# Run database verification
npm run test:verify-db
```

**Expected output**:
```
========================================
Database Function Verification
========================================
Target: https://[project-ref].supabase.co
✅ Targeting test project: [project-ref]

🧪 Test 1: Version Mismatch (Stale Write Prevention)
   Cleaned up test-version-mismatch-...
   ✅ Correctly rejected stale write
   Cleaned up test-version-mismatch-...

🧪 Test 2: Expired Lock Rejection
   Cleaned up test-lock-expired-...
   ✅ Correctly rejected expired lock
   Cleaned up test-lock-expired-...

🧪 Test 3: Input Change Detection
   Cleaned up test-input-changed-...
   ✅ Correctly detected input change
   Cleaned up test-input-changed-...

🧪 Test 4: Successful Publish
   Cleaned up test-success-...
   ✅ Successfully published and released lock
   Cleaned up test-success-...

🧪 Test 5: Function Permissions
   ✅ Function exists

========================================
Verification Complete
========================================
```

If any test fails:
- Check that `test-db-init.sql` ran completely
- Verify credentials in `.env.test`
- Check Supabase project is active (not paused)

---

## Phase 5: Seed Test Data

### Step 6: Create Test Gifts

```bash
# Seed test data (uses same environment from Step 5)
npm run test:seed
```

**Expected output**:
```
🌱 Seeding test data...
Target: https://[project-ref].supabase.co

📦 Creating Standard gift...
✅ Created Standard gift: [uuid]
✅ Added 3 memories to Standard gift

✨ Creating Plus gift...
✅ Created Plus gift: [uuid]
✅ Added 6 memories to Plus gift

========================================
✅ Test Data Seeded Successfully
========================================

📦 Standard Gift:
   ID: [uuid]
   Share Code: test-standard-[timestamp]
   Creator Token: token-standard-[timestamp]
   Reveal: http://localhost:3000/m/[share-code]/reveal
   Dashboard: http://localhost:3000/dashboard/[share-code]

✨ Plus Gift:
   ID: [uuid]
   Share Code: test-plus-[timestamp]
   Creator Token: token-plus-[timestamp]
   Reveal: http://localhost:3000/m/[share-code]/reveal
   Dashboard: http://localhost:3000/dashboard/[share-code]

========================================
Next Steps:
========================================
1. Start dev server: npm run test:dev
2. Open Standard reveal to verify experience
3. Open Plus dashboard to trigger preparation
4. Open Plus reveal to verify cached playback
```

**⚠️ SAVE THESE URLs** - You'll need them for browser testing.

---

## Phase 6: Start Test Server

### Step 7: Run Development Server with Test Database

```bash
# Copy test config to active config
cp .env.test .env.local

# Start server
npm run dev

# Server starts at: http://localhost:3000
```

**Verification**:
- Server should start without errors
- Check console for database connection
- No errors about missing environment variables

---

## Phase 7: Automated Tests

### Step 8: Run Test Suite

```bash
# In a new terminal (keep dev server running)
cd ~/Downloads/MemoryPop/memorypop

# Run all tests
npm test
```

**Expected**:
- ✅ 171+ tests passing
- ❌ 7 tests failing (celebrationExperience - pre-existing, unrelated to AI Director)

```bash
# Run AI Director tests specifically
npm test -- --testPathPattern="prepareRevealPlan|concurrent|timeout|revealPlanService"
```

**Expected**:
- ✅ All 35 AI Director tests pass

---

## Phase 8: Manual Browser Verification

### Test A: Standard Reveal (No AI)

1. Open Standard reveal URL from Step 6 output
2. **Verify**:
   - ✅ Standard reveal experience loads
   - ✅ Memories display in chronological order
   - ✅ No chapter navigation
   - ✅ GlobalCinematicController used
   - ✅ No AI preparation triggered

**Check Database** (Supabase Dashboard → Table Editor):
- `ai_reveal_plans` table: **No row** for this memorypop_id

---

### Test B: Plus Creator Preparation

1. Open Plus dashboard URL from Step 6 output:
   ```
   http://localhost:3000/dashboard/[plus-share-code]
   ```

2. Click "Mark as Ready" (or status change button)

3. **Verify**:
   - ✅ Status changes to "ready"
   - ✅ Preparation completes within 5 seconds
   - ✅ No errors in browser console
   - ✅ No errors in terminal

4. **Check Database** (Supabase Dashboard):
   - Go to: **Table Editor → ai_reveal_plans**
   - Find row where `memorypop_id` matches Plus gift ID
   - **Verify**:
     - `plan`: Not null (full JSON object)
     - `generation_version`: 1
     - `input_hash`: Not empty
     - `model_name`: NOT 'pending'
     - `generation_lock_holder`: NULL (released)
     - `generation_source`: 'deterministic_fallback' (since ENABLE_AI_DIRECTOR=false)

---

### Test C: Plus Recipient Playback (Cached)

1. Open Plus reveal URL from Step 6 output:
   ```
   http://localhost:3000/m/[plus-share-code]/reveal
   ```

2. **Verify**:
   - ✅ Plus cinematic experience loads
   - ✅ Opening title displays
   - ✅ Chapters navigation works
   - ✅ Highlight memories shown correctly
   - ✅ Finale memory displays
   - ✅ Smooth transitions

3. **Check Network Tab** (Browser DevTools):
   - ✅ No call to `/api/generate-reveal-plan`
   - ✅ No external AI provider requests
   - ✅ Plan loaded from database

4. **Refresh page and replay**:
   - ✅ Same experience (uses cached plan)
   - ✅ No regeneration

---

### Test D: Unauthorized Access Prevention

1. Try to access Plus reveal API without authorization:
   ```bash
   curl -X POST http://localhost:3000/api/generate-reveal-plan \
     -H "Content-Type: application/json" \
     -d '{"memorypopId": "[plus-gift-id]", "creatorToken": "wrong-token"}'
   ```

2. **Expected**:
   - Response: `{"success": false, "error": "Unauthorized..."}`
   - Status: 403 or 401

3. Try to access Standard gift's non-existent plan:
   ```bash
   curl http://localhost:3000/api/generate-reveal-plan?id=[standard-gift-id]
   ```

4. **Expected**: No plan exists, fallback to deterministic

---

### Test E: Concurrent Request Handling

This test requires simulating concurrent requests. We'll use curl in separate terminals.

**Terminal 1**:
```bash
# Prepare environment
export PLUS_ID="[plus-gift-id from seed output]"
export CREATOR_TOKEN="[plus-creator-token from seed output]"

# Force regeneration request 1
curl -X PATCH "http://localhost:3000/api/memorypops/${PLUS_ID}/status" \
  -H "Content-Type: application/json" \
  -d "{\"status\": \"ready\", \"creatorToken\": \"${CREATOR_TOKEN}\", \"forceRegenerate\": true}"
```

**Terminal 2** (run immediately after Terminal 1):
```bash
# Force regeneration request 2
curl -X PATCH "http://localhost:3000/api/memorypops/${PLUS_ID}/status" \
  -H "Content-Type: application/json" \
  -d "{\"status\": \"ready\", \"creatorToken\": \"${CREATOR_TOKEN}\", \"forceRegenerate\": true}"
```

**Expected behavior**:
- One request acquires lock
- Second request either:
  - Waits and reuses first result, OR
  - Returns quickly with "already in progress"
- Only ONE actual generation occurs
- Check `generation_version` in database: incremented by 1

**Verify in Database**:
```sql
SELECT generation_version, generation_lock_holder, input_hash
FROM ai_reveal_plans
WHERE memorypop_id = '[plus-gift-id]';
```

---

### Test F: Timeout & Error Fallback

1. Temporarily break AI generation:
   - In `.env.local`, set `ENABLE_AI_DIRECTOR=true` (if not already)
   - Set `GROQ_API_KEY=invalid_key_for_testing`

2. Restart dev server:
   ```bash
   npm run dev
   ```

3. Create a new Plus gift or force regeneration

4. **Expected**:
   - Generation times out or fails
   - Fallback to deterministic planner
   - Full Plus experience still delivered
   - `generation_source`: 'deterministic_fallback'
   - `generation_error`: Contains error message

5. **Restore** `.env.local`:
   ```bash
   cp .env.test .env.local
   ```

---

## Phase 9: Build Verification

### Step 9: Production Build

```bash
# Ensure .env.local has test config
npm run build
```

**Expected**:
```
✓ Compiled successfully in 3-4s
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization

Route (app)
...
✓ 44/44 routes generated
```

**Exit code**: 0

---

## Phase 10: Cleanup & Results

### Step 10: Document Results

Create a summary of your test results:

**Tests Executed**:
- [ ] Database function verification (5 tests)
- [ ] Unit test suite (171+ tests)
- [ ] Standard reveal (manual)
- [ ] Plus creator preparation (manual)
- [ ] Plus recipient playback (manual)
- [ ] Unauthorized access prevention (manual)
- [ ] Concurrent request handling (manual)
- [ ] Timeout/error fallback (manual)
- [ ] Production build (automated)

**Results**:
- Database function tests: [PASS/FAIL]
- Unit tests: [171/187 or similar]
- Standard reveal: [PASS/FAIL]
- Plus preparation: [PASS/FAIL]
- Plus playback: [PASS/FAIL]
- Unauthorized prevention: [PASS/FAIL]
- Concurrent handling: [PASS/FAIL]
- Timeout fallback: [PASS/FAIL]
- Production build: [PASS/FAIL]

### Step 11: Restore Production Config

```bash
# When done testing, restore production environment
cp .env.local.production .env.local

# Or delete test config
rm .env.local

# Test project can remain for future testing
```

---

## Troubleshooting

### Error: "Missing environment variables"
- Check `.env.test` has all required values
- Ensure environment is exported before running scripts
- Try: `source .env.test` (bash) or load manually

### Error: "Safety check failed"
- Verify `TEST_PROJECT_REF` matches your test project
- Check URL is correct test project, not production
- Ensure not using production URL

### Error: "Function does not exist"
- Re-run `test-db-init.sql` in Supabase SQL Editor
- Check for SQL errors in execution
- Verify project is active (not paused)

### Database connection fails
- Check Supabase project is running (not paused)
- Verify API keys are correct
- Check network connectivity

### Tests timeout
- Increase timeout in test config
- Check Supabase project region (latency)
- Verify no rate limiting

---

## Notes

- **Test data**: All fictional names and Unsplash photos
- **No live AI calls**: ENABLE_AI_DIRECTOR=false
- **No payments**: Stripe keys are dummy values
- **No emails**: Sentry/Mixpanel disabled
- **Reusable**: Test project can be reset and reused

---

## Summary

This setup provides:
- ✅ Zero-cost hosted test database
- ✅ Isolated from production
- ✅ Complete integration testing
- ✅ Automated + manual verification
- ✅ Reusable test environment
- ✅ No Docker or local database required

**Ready for production?** After all tests pass, migrations 012-015 can be applied to production database with feature flag disabled.
