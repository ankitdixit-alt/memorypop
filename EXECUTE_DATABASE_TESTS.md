# Execute Database Tests - Ready Now

**Date**: 2026-09-22
**Status**: All local checks complete, proceed to database setup

---

## Completed Locally ✅

### Test Results (Exit Code 0)
```
AI Director tests:    59/59 pass
- Timeout integration: 5 tests (30s real timeout verified)
- Mock provider: 19 tests (environment validation)
- Other AI Director: 35 tests

Build:                Success
```

### Security Enforcement
- URL parsing with exact hostname matching
- Production hostname blocking
- TEST_PROJECT_REF validation
- Malformed URL rejection
- Late response cannot replace fallback

### Permission Tests Enhanced
- Service role: Must succeed with valid inputs
- Anonymous: Must be denied (permission error only)
- Authenticated: Real test user created and verified
- False positives removed (no "not found" or PGRST202 as pass)

---

## Setup Supabase Test Project (5 minutes)

### 1. Create Project (2 min)
```
https://supabase.com/dashboard → New Project
Name: memorypop-test
Plan: Free
Region: Any
Wait for initialization
```

### 2. Get Credentials (1 min)
```
Settings → API → Copy:
- Project URL: https://[ref].supabase.co
- Project Ref: [ref]
- anon key: ey...
- service_role key: ey... (click Reveal)
```

### 3. Initialize Database (1 min)
```
SQL Editor → New query
Paste entire contents of: test-db-init-complete.sql
Run → Verify: 4 tables, 1 function, RLS enabled
```

### 4. Configure Environment (1 min)
```bash
cd ~/Downloads/MemoryPop/memorypop
nano .env.test

# Paste credentials:
NEXT_PUBLIC_SUPABASE_URL=https://[your-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]
TEST_PROJECT_REF=[your-ref]

# Already configured:
TEST_AI_PROVIDER=mock
TEST_SCENARIO=success
ENABLE_AI_DIRECTOR=false
```

Save and exit.

---

## Execute Database Tests

```bash
# Verify database functions (5 tests + authenticated user)
npm run test:verify-db
```

**Expected output**:
```
🧪 Test 1: Version Mismatch → ✅ Correctly rejected stale write
🧪 Test 2: Expired Lock → ✅ Correctly rejected expired lock
🧪 Test 3: Input Change → ✅ Correctly detected input change
🧪 Test 4: Successful Publish → ✅ Successfully published and released lock
🧪 Test 5: Permissions
   ✅ Service role can execute function
   ✅ Anonymous access correctly blocked (permission denied)
   ✅ Authenticated user access correctly blocked (permission denied)
   Cleaned up test user

Exit code: 0
```

If any test fails with exit code 1, report the error.

---

## Seed Test Data

```bash
# Create Standard + Plus gifts
npm run test:seed
```

**Expected output**:
```
📦 Standard Gift:
   Share Code: test-standard-[timestamp]
   Reveal: http://localhost:3000/m/[share-code]/reveal
   Dashboard: http://localhost:3000/dashboard/[share-code]

✨ Plus Gift:
   Share Code: test-plus-[timestamp]
   Reveal: http://localhost:3000/m/[share-code]/reveal
   Dashboard: http://localhost:3000/dashboard/[share-code]
```

**Save these URLs** for browser testing.

---

## Start Test Website

```bash
# Start dev server with test database
npm run test:dev

# Server at: http://localhost:3000
```

Your .env.local is NOT touched. Test environment loaded in memory only.

---

## Browser Verification Checklist

### Standard Gift (No AI):
- [ ] Open Standard reveal URL
- [ ] Memories display chronologically
- [ ] No chapter navigation
- [ ] No errors in console

### Plus Gift (Mock AI):
- [ ] Open Plus dashboard URL
- [ ] Click "Mark as Ready"
- [ ] Preparation completes (< 5 seconds)
- [ ] No errors in console
- [ ] Open Plus reveal URL
- [ ] Chapters, highlights, finale display correctly
- [ ] Smooth transitions
- [ ] Refresh page → same plan (cached)

### Database State:
- [ ] Supabase → Table Editor → ai_reveal_plans
- [ ] Plus gift has row
- [ ] plan is not null (JSON object)
- [ ] generation_lock_holder is NULL
- [ ] model_provider is 'mock'
- [ ] model_name is 'mock-test-model'

---

## Test Scenarios (Optional)

Change TEST_SCENARIO in .env.test and restart server:

```bash
# Timeout (waits 30s, then fallback)
TEST_SCENARIO=timeout

# Rate limit error
TEST_SCENARIO=rate_limit

# Server error
TEST_SCENARIO=server_error

# Invalid plan (fails validation)
TEST_SCENARIO=invalid_plan
```

Each should fall back to deterministic Plus plan with error logged.

---

## Summary

**Checks complete locally**:
- 59 AI Director unit tests pass
- Production build succeeds
- Environment validation enforced
- Timeout integration verified

**Checks ready to execute**:
- Database function tests (5 scenarios)
- Permission verification (service, anon, authenticated)
- Test data seeding (2 gifts)

**Checks pending browser**:
- Standard reveal (no AI)
- Plus preparation (mock generation)
- Plus playback (cached plan)
- Database state inspection

**Total time**: ~20 minutes from Supabase setup to complete verification
