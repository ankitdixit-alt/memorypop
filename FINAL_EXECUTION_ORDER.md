# Final Execution Order

**Date**: 2026-09-28
**Status**: Ready for production execution

---

## Schema Verification Complete ✅

### API Operations Confirmed
**Redemption API** (`src/app/api/memorypops/[id]/redeem-beta-code/route.ts`):

1. **beta_codes** table:
   - SELECT: All columns (code lookup by hash)
   - UPDATE: current_redemptions, updated_at (increment counter)

2. **beta_code_redemptions** table:
   - SELECT: id (check existing redemption)
   - INSERT: beta_code_id, memorypop_id (record redemption)
   - DELETE: (rollback on failure)

3. **memorypops** table:
   - SELECT: id, is_premium, share_code
   - UPDATE: is_premium, upgraded_at, upgrade_source

### Schema Match ✅
- beta_codes: 9 columns (id, name, code_hash, active, total_redemption_limit, current_redemptions, expires_at, created_at, updated_at)
- beta_code_redemptions: 4 columns (id, beta_code_id, memorypop_id, redeemed_at with DEFAULT NOW())
- memorypops columns: upgraded_at, upgrade_source added conditionally

### Permissions Applied ✅
**REVOKE**: PUBLIC, anon, authenticated (all privileges on beta tables)
**GRANT service_role**:
- beta_codes: SELECT, UPDATE
- beta_code_redemptions: SELECT, INSERT, DELETE
- memorypops: Not modified (assumes existing permissions)

### Corrections Applied ✅
1. Fixed column count comment (9 not 8)
2. Added IF NOT EXISTS warning (won't update existing tables)
3. Added explicit GRANT/REVOKE statements
4. Added permission verification query

---

## Execution Order (Supabase SQL Editor)

**Link**: https://supabase.com/dashboard/project/gvfpgawbvuttglfscngg/sql

### Step 1: Base Migration
**File**: `migrations/PRODUCTION_BETA_CODE_RELEASE.sql`

**Actions**:
1. Copy entire file contents
2. Paste into Supabase SQL Editor (production project)
3. Run migration
4. Check output for NOTICE messages confirming columns/tables created
5. Run all verification queries at bottom
6. Verify expected outputs match

**Creates**:
- memorypops.upgraded_at column (if not exists)
- memorypops.upgrade_source column (if not exists)
- beta_codes table with 9 columns, RLS, indexes
- beta_code_redemptions table with 4 columns, RLS, indexes
- RLS policies (service_role only)
- Explicit permissions (REVOKE + GRANT)

**Expected Verification Output**:
```
-- Column check: 3 rows (is_premium, upgraded_at, upgrade_source)
-- Table RLS: 2 rows (both tables have RLS enabled)
-- Column count: beta_codes=9, beta_code_redemptions=4
-- Policies: 2 policies (one per table, service_role only)
-- Permissions: Only service_role has privileges
```

**Important**: If beta_codes or beta_code_redemptions already exist with different schemas, CREATE TABLE IF NOT EXISTS will skip them. Check verification queries carefully.

---

### Step 2: Add Test Code
**File**: `PRODUCTION_ADD_TESTBETA2026.sql`

**Actions**:
1. Copy entire file contents
2. Paste into same SQL Editor
3. Run SQL
4. Check verification query returns 1 row

**Creates**:
- TESTBETA2026 entry in beta_codes table
- Code: `TESTBETA2026` (case-sensitive, no spaces)
- Hash: `56c609a1dd57a590e346fed18fd8fb072edab7140a65ff5bd66a9ff53956f4c0`
- Active: true
- Limit: 100 redemptions
- Expiry: 2027-09-27 23:59:59 UTC
- Idempotent: ON CONFLICT DO NOTHING

**Expected Output**:
```
name: Complimentary Plus Access - TESTBETA2026
active: t
total_redemption_limit: 100
current_redemptions: 0
expires_at: 2027-09-27 23:59:59+00
```

---

## Pre-Execution Checklist

- [ ] Backup production database (optional but recommended)
- [ ] Verify Supabase project ID: gvfpgawbvuttglfscngg
- [ ] Confirm logged in as project owner
- [ ] Read both SQL files completely before execution

---

## Post-Execution Verification

### Database State
Run these queries manually after both migrations:

```sql
-- Check beta_codes table exists and has TESTBETA2026
SELECT COUNT(*) FROM beta_codes;
-- Expected: 1

-- Check permissions
SELECT grantee, privilege_type 
FROM information_schema.table_privileges 
WHERE table_name = 'beta_codes' AND grantee = 'service_role';
-- Expected: SELECT, UPDATE

SELECT grantee, privilege_type 
FROM information_schema.table_privileges 
WHERE table_name = 'beta_codes' AND grantee IN ('PUBLIC', 'anon', 'authenticated');
-- Expected: No rows

-- Check upgraded_at column exists
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'memorypops' AND column_name = 'upgraded_at';
-- Expected: 1 row
```

### API Test (After Code Deployment)
Test redemption API with curl (replace [memorypop-id] and [management-token]):

```bash
curl -X POST https://memorypop.app/api/memorypops/[memorypop-id]/redeem-beta-code \
  -H "Content-Type: application/json" \
  -H "Cookie: creator_token=[management-token]" \
  -d '{"code":"TESTBETA2026"}'
```

Expected: 200 OK with `{"success":true,"message":"Successfully upgraded to MemoryPop Plus!"}`

---

## Rollback (If Needed)

```sql
BEGIN;
DROP TABLE IF EXISTS beta_code_redemptions CASCADE;
DROP TABLE IF EXISTS beta_codes CASCADE;
ALTER TABLE memorypops DROP COLUMN IF EXISTS upgraded_at;
ALTER TABLE memorypops DROP COLUMN IF EXISTS upgrade_source;
COMMIT;
```

---

## Summary

**Migration file corrected**: PRODUCTION_BETA_CODE_RELEASE.sql
**Corrections**:
1. Fixed column count (9 not 8)
2. Added REVOKE PUBLIC/anon/authenticated
3. Added GRANT service_role (SELECT, UPDATE on beta_codes; SELECT, INSERT, DELETE on beta_code_redemptions)
4. Added IF NOT EXISTS warning
5. Added permission verification query

**Execution**: Run PRODUCTION_BETA_CODE_RELEASE.sql first, then PRODUCTION_ADD_TESTBETA2026.sql
**No changes to**: memorypops table permissions (assumes existing setup)
