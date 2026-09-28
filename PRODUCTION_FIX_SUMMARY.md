# Production Fix: Standard Gift Preparation

**Date**: 2026-09-26
**Issue**: Standard gifts cannot prepare reveal
**Error**: PostgreSQL 42703 "column memorypops.is_premium does not exist"

---

## Root Cause

Production database (`gvfpgawbvuttglfscngg`) is missing the `is_premium` column.

**Deployed code** explicitly selects:
```typescript
.select('id, share_code, management_token_hash, is_premium, status')
```

**Result**: PostgreSQL error 42703 when column doesn't exist

---

## Solution

**SQL-only fix** - No code deployment needed.

Add missing `is_premium` column to production database:
```sql
ALTER TABLE memorypops
ADD COLUMN is_premium BOOLEAN DEFAULT FALSE NOT NULL;
```

**Why this works**:
- Deployed code already expects this column
- Default FALSE makes all existing gifts Standard
- Status route checks: `if (memoryPop.is_premium === true)`
- Standard gifts (false) skip AI/Plus logic → preparation succeeds

---

## Verification (Local Test)

**Test**: Standard gift preparation with `is_premium` column present

**Commands**:
```bash
./scripts/run-with-test-env.sh "npx tsx scripts/test-standard-preparation.ts"
npm run build
```

**Results**: ✅ PASS
- Standard gift created (is_premium = false)
- Status updated: collecting → ready (200 OK)
- No AI plan created
- No Groq API call
- Reveal page accessible (200 OK)
- Build successful (236 routes)

**Confirmed**:
- Deployed code works correctly with `is_premium` present
- Standard gifts (is_premium = false) follow non-AI path
- No Plus logic triggered for Standard

---

## Production Fix File

**File**: `PRODUCTION_FIX_ADD_IS_PREMIUM.sql`

**Contents**:
- Idempotent check (safe to run multiple times)
- Adds `is_premium BOOLEAN DEFAULT FALSE NOT NULL`
- Adds index for performance
- Verification query included

**Run in**: Supabase SQL Editor
**Project**: gvfpgawbvuttglfscngg
**Link**: https://supabase.com/dashboard/project/gvfpgawbvuttglfscngg/sql

---

## Impact

**Before SQL fix**:
- Status route query fails (column doesn't exist)
- Error 42703 converted to 404 "MemoryPop not found"
- Cannot prepare any gifts (Standard or Plus)

**After SQL fix**:
- Column exists with default FALSE for all existing gifts
- Deployed code queries succeed
- Standard gifts prepare successfully (is_premium = false)
- No code deployment required

**Plus features**:
- Remain disabled (all gifts have is_premium = false)
- Can be enabled later by setting is_premium = true
- Beta code integration requires additional columns (upgrade_source)

---

## What User Must Do

1. Open Supabase SQL Editor for production project gvfpgawbvuttglfscngg
2. Copy/paste contents of `PRODUCTION_FIX_ADD_IS_PREMIUM.sql`
3. Click "Run"
4. Verify output shows: "Added is_premium column successfully"
5. Verify affected gift can now prepare:
   - Open: https://memorypop.app/dashboard/62913a7f-58cf-4b84-8d62-4e440a15d078
   - Click "Prepare the Reveal"
   - Expected: 200 OK (status updates successfully)
   - Verify reveal opens and plays Standard experience

**No code deployment needed** - deployed code already expects this column.

---

## Rollback

If SQL causes issues (unlikely):
```sql
ALTER TABLE memorypops DROP COLUMN IF EXISTS is_premium;
```

---

## Future Work

**For Plus features** (separate from this fix):
- Add `upgrade_source` column (for beta codes)
- Add `upgraded_at` column (for analytics)
- Add Stripe columns when Stripe integration deployed
- These can be added incrementally as needed
