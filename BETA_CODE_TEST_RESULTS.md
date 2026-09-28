# Beta Code Test Results

**Date**: 2026-09-26
**Database**: memorypop-test (`lbjtwbpnlruykqgsaiwy`)
**Test Server**: Running on http://localhost:3000

---

## ⚠️ Fix Applied: Token Hash Format

**Issue**: Management token was hashed using hex format, but application expects base64url format.

**Resolution**:
- Fixed `scripts/setup-beta-test-direct.ts` to use base64url encoding
- Created new test MemoryPop with correct token hash
- Corrected authentication URL format from `/m/{shareCode}?token={token}` to `/manage/{token}`

**Authentication Flow**:
1. User visits: `/manage/{rawToken}`
2. Server hashes token (SHA-256 base64url), validates against database
3. Creates signed session cookie
4. Redirects to: `/dashboard/{shareCode}`

---

## Test Setup Complete

### ✅ Test Environment Created

**MemoryPop Created**:
- Share Code: `beta-test-498303`
- MemoryPop ID: `56a1ed54-5392-4864-8f35-cea3b4b42eb6`
- Recipient: Beta Test User
- Occasion: Birthday
- Memories: 3 test memories added
- Status: collecting, is_premium: false

**Beta Code Configured**:
- Code: `TESTBETA2026`
- Campaign: `test_2026`
- Hash: `56c609a1dd57a590e346fed18fd8fb072edab7140a65ff5bd66a9ff53956f4c0`
- Limit: 10 redemptions
- Expires: 2026-10-03

**Creator Authorization**:
- Management Token: `test-token-beta-2026`
- Token Hash: (stored in database)

---

## Manual Action Required

### Create Beta Code in Database

**RLS blocks programmatic creation**. Run this SQL in Supabase SQL Editor:

```sql
INSERT INTO beta_codes (code_hash, campaign_name, total_redemption_limit, current_redemptions, expires_at, active, created_at, updated_at)
VALUES (
  '56c609a1dd57a590e346fed18fd8fb072edab7140a65ff5bd66a9ff53956f4c0',
  'test_2026',
  10,
  0,
  '2026-10-03T10:26:59.419Z',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (code_hash) DO NOTHING;
```

**Verify**:
```sql
SELECT campaign_name, current_redemptions, total_redemption_limit, active
FROM beta_codes WHERE campaign_name = 'test_2026';
```

---

## Test Credentials

### Creator Management Link
```
http://localhost:3000/manage/test-token-beta-2026
```

This link will authenticate and redirect to: `http://localhost:3000/dashboard/beta-test-498303`

### Beta Code
```
TESTBETA2026
```

### Test Server
- Status: ✅ Running
- URL: http://localhost:3000
- Environment: memorypop-test (.env.test)

---

## Manual Browser Tests (Your Action)

### 1. Complete Plus Journey
1. Open: http://localhost:3000/manage/test-token-beta-2026
2. Verify automatic redirect to dashboard
3. Locate and click "Upgrade to Plus" section
4. Enter code: `TESTBETA2026`
5. Click "Activate Plus for €0"
6. Verify Plus badge appears
7. Click "Ready to Reveal"
8. Wait 30-60 seconds
9. Open reveal page
10. Verify AI-generated chapters
11. Refresh page
12. Verify cached plan reused

### 2. Database Verification (Post-Redemption)
```sql
-- Check Plus activated
SELECT is_premium, upgrade_source, upgraded_at
FROM memorypops
WHERE id = '56a1ed54-5392-4864-8f35-cea3b4b42eb6';
-- Expected: is_premium=true, upgrade_source='beta_code'

-- Check redemption recorded
SELECT r.redeemed_at, bc.campaign_name, bc.current_redemptions
FROM beta_code_redemptions r
JOIN beta_codes bc ON r.beta_code_id = bc.id
WHERE r.memorypop_id = '56a1ed54-5392-4864-8f35-cea3b4b42eb6';
-- Expected: 1 row, campaign='test_2026', redemptions incremented

-- Check AI plan generated
SELECT model_name, generation_source, created_at
FROM ai_reveal_plans
WHERE memorypop_id = '56a1ed54-5392-4864-8f35-cea3b4b42eb6';
-- Expected: model_name='openai/gpt-oss-120b', generation_source='ai_generated'
```

---

## API-Level Security Tests

### Test Status: ⏳ Pending Execution

These tests require the beta code to be created first (see Manual Action above).

**Test Plan**:
1. ✅ **Server Running**: Test server operational on localhost:3000
2. ⏳ **Unauthorized Access**: API call without creator session → 403
3. ⏳ **Invalid Code**: Try `WRONGCODE` → "Invalid beta code"
4. ⏳ **Expired Code**: Create expired test code → "This beta code has expired"
5. ⏳ **Redemption Limit**: Create limit=1 code, exceed → "reached its redemption limit"
6. ⏳ **Repeat Redemption**: Same code twice → Success (idempotent, no double-count)
7. ⏳ **Rate Limiting**: 5 invalid attempts → 429 error
8. ⏳ **Concurrent Requests**: Simultaneous redemptions → Only one succeeds

**Execution**: Will run after beta code creation confirmed

---

## Expected Outcomes

### ✅ Code-Level Complete
- [x] Migration applied to test database
- [x] Test MemoryPop created (beta-test-419093)
- [x] Test memories added (3)
- [x] Management token configured
- [x] Test server running

### ⏳ Manual Setup Pending
- [ ] Beta code created in database (SQL above)
- [ ] Beta code verified in database

### ⏳ Browser Tests Pending (Your Action)
- [ ] Creator authorization established
- [ ] Plus activated with beta code at €0
- [ ] Plus badge visible in dashboard
- [ ] AI plan generated (30-60s)
- [ ] Reveal shows AI chapters
- [ ] Refresh reuses cached plan

### ⏳ API Tests Pending (Automated After Beta Code Created)
- [ ] Invalid codes rejected
- [ ] Unauthorized users blocked (403)
- [ ] Repeat redemption idempotent
- [ ] Rate limiting active (5 attempts)
- [ ] Expired codes rejected
- [ ] Redemption limit enforced
- [ ] Concurrent requests handled

### ⏳ Database Verification Pending
- [ ] is_premium = true
- [ ] upgrade_source = 'beta_code'
- [ ] Redemption recorded
- [ ] AI plan exists
- [ ] Redemption count incremented

---

## Next Steps

1. **Create beta code** (run SQL above in Supabase)
2. **Open management link** in browser
3. **Complete Plus journey** (steps above)
4. **Verify database** (queries above)
5. **Run API tests** (will be executed after beta code exists)
6. **Update this file** with actual results

---

## Notes

- Test server is running with .env.test configuration
- All tests target memorypop-test database
- Production database is NOT affected
- RLS policies require manual beta code creation via SQL
- API tests will be automated once beta code exists
