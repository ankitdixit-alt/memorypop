# Beta Code Permissions - Correct Fix

**Date**: 2026-09-26
**Issue**: Missing service_role table privileges
**Database**: memorypop-test (`lbjtwbpnlruykqgsaiwy`)
**Status**: Ready for SQL correction

---

## Root Cause

The `beta_codes` and `beta_code_redemptions` tables were created with:
- ✅ RLS enabled
- ✅ Policies targeting `service_role` PostgreSQL role
- ❌ **Missing table-level GRANT statements for service_role**

**Result**: Service role key could not access tables → "permission denied for table beta_codes" → endpoint returned "Invalid beta code"

### What Was Incorrectly Tried

Initial fix incorrectly granted ALL privileges to `authenticated` role, which would expose server-side tables to any signed-in user.

### Correct Approach

**Keep RLS enabled** and grant only required privileges to `service_role` PostgreSQL role.

---

## Required Operations

From inspection of `src/app/api/memorypops/[id]/redeem-beta-code/route.ts`:

**beta_codes table**:
- SELECT (line 107-112: query beta code)
- UPDATE (line 178-185: increment redemptions, line 205-210: rollback)

**beta_code_redemptions table**:
- SELECT (line 161-166: check existing redemption)
- INSERT (line 196-201: record redemption)
- DELETE (line 231-234: rollback redemption)

---

## Correct Fix

**File**: `CORRECT_BETA_CODE_PERMISSIONS.sql`

This script is **idempotent** (safe to run multiple times) and works whether or not the unsafe fix was applied.

See file for full SQL. Key operations:
1. Remove any unsafe policies
2. Revoke grants from authenticated/anon/public
3. Revoke broad sequence grants
4. Enable RLS on both tables
5. Grant specific privileges to service_role only
6. Create proper RLS policies for service_role
7. Verify configuration

---

## Files Updated

### Migration Files
- ✅ `migrations/016_add_beta_codes.sql` - Now includes proper service_role grants and RLS policies
- ✅ `migrations/017_fix_beta_codes_rls.sql` - Marked as deprecated

### Fix Scripts
- ✅ `CORRECT_BETA_CODE_PERMISSIONS.sql` - **Use this file** - idempotent, complete fix
- ✅ `FIX_BETA_CODE_RLS.sql` - Marked as deprecated
- ✅ `ROLLBACK_UNSAFE_BETA_CODE_PERMISSIONS.sql` - Marked as deprecated

### Code
- ✅ `src/app/api/memorypops/[id]/redeem-beta-code/route.ts` - Distinguishes database errors (500) from invalid codes (400)
- ✅ `src/lib/supabaseServer.ts` - Uses service_role key (verified, no changes needed)

---

## Redemption Endpoint Security

### Verified Configuration

The redemption endpoint at `/api/memorypops/[id]/redeem-beta-code`:

1. ✅ Uses `supabaseServer` which is configured with service role key
2. ✅ No user Authorization header passed (service role only)
3. ✅ Has `autoRefreshToken: false, persistSession: false`
4. ✅ Validates creator authorization before redemption
5. ✅ Now distinguishes database errors (500) from invalid codes (400)

### Error Handling

**Before**: All errors reported as "Invalid beta code"
**After**:
- Invalid code (PGRST116) → 400 "Invalid beta code"
- Database/permission error → 500 "Database error validating beta code. Please contact support."

---

## Test Plan

### After SQL Correction

1. **Verify database access**:
   ```bash
   ./scripts/run-with-test-env.sh "npx tsx scripts/test-beta-redemption-flow.ts"
   ```

2. **Test redemption** (browser):
   - Open: http://localhost:3000/manage/test-token-beta-2026
   - Enter: `TESTBETA2026`
   - Click: "Activate Plus for €0"
   - Expected: Success, Plus badge appears

3. **Verify database state**:
   ```sql
   -- Check Plus activated
   SELECT is_premium, upgrade_source, upgraded_at
   FROM memorypops
   WHERE id = '56a1ed54-5392-4864-8f35-cea3b4b42eb6';
   -- Expected: is_premium=true, upgrade_source='beta_code'

   -- Check redemption recorded
   SELECT r.redeemed_at, bc.current_redemptions
   FROM beta_code_redemptions r
   JOIN beta_codes bc ON r.beta_code_id = bc.id
   WHERE r.memorypop_id = '56a1ed54-5392-4864-8f35-cea3b4b42eb6';
   -- Expected: 1 row, redemptions incremented
   ```

4. **Test idempotency** (browser):
   - Repeat step 2
   - Expected: Success without incrementing counter

5. **Verify anon cannot access**:
   ```bash
   ./scripts/run-with-test-env.sh "npx tsx scripts/verify-beta-code-security.ts"
   ```
   - Expected: Anon blocked, service role succeeds

---

## Why This Approach Is Correct

### RLS + service_role Grants

**RLS enabled** with **service_role-only grants**:
- ✅ Anonymous/authenticated users blocked (RLS + no grants)
- ✅ Service role key has table access (explicit grants + RLS policies)
- ✅ Defense in depth: both RLS and table permissions
- ✅ Follows Supabase security model

### Why authenticated Role Was Wrong

- `authenticated` = **any** signed-in user
- Granting ALL to authenticated = exposing server-side tables to regular users
- `service_role` = PostgreSQL role used by service role key only

### Service Role Access

The Supabase service role key:
1. Connects using the `service_role` PostgreSQL role
2. Requires table-level GRANT statements
3. RLS policies must allow service_role access
4. Does NOT bypass RLS unless policies allow it

---

## Next Step

**Run CORRECT_BETA_CODE_PERMISSIONS.sql in Supabase SQL Editor for memorypop-test**

Link: https://supabase.com/dashboard/project/lbjtwbpnlruykqgsaiwy/sql

Then test redemption at: http://localhost:3000/manage/test-token-beta-2026

Beta code: `TESTBETA2026`
