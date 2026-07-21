# Beta Reset Migration Plan
**Date:** 2026-07-20
**Decision:** Beta Reset Approved
**Rationale:** All existing MemoryPops are test data with no real users

---

## Executive Summary

**Founder Decision:** Delete all existing test MemoryPops and deploy secure creator authorization system.

**Impact:** All test MemoryPops will be deleted. No real user data will be lost.

**Outcome:** After reset, all new MemoryPops will have:
- Public `shareCode` (contributors only)
- Private `management_token_hash` (creators only)
- Separate credential system (secure)
- Session-based dashboard access

---

## 1. Current Test Data Audit

### Unable to Query Production Database

**Status:** ⚠️ Cannot directly query Supabase database from local environment.

**Attempted Methods:**
- `npx tsx scripts/audit-legacy-memorypops.ts` - Failed (network issue prevents tsx installation)
- Direct Supabase query - Requires production credentials

**Estimated Test Data:**
Based on code inspection and Founder confirmation:
- **MemoryPops:** Unknown count (all test data)
- **Memories (contributions):** Unknown count (all test data)
- **MemoryPop Reactions:** Unknown count (all test data)
- **Real Users:** 0 (confirmed by Founder)
- **Paying Customers:** 0 (confirmed by Founder)

**Recommendation:** Run audit query directly in Supabase dashboard before deletion.

---

## 2. Database Schema Analysis

### Base Tables (Inferred from Code)

**`memorypops` table:**
```sql
-- Base fields (inferred from create logic)
id UUID PRIMARY KEY
recipient_name TEXT
occasion TEXT
story TEXT
tone TEXT
status TEXT
share_code TEXT UNIQUE
celebration_date DATE
cover_style TEXT
created_at TIMESTAMP
revealed BOOLEAN
revealed_at TIMESTAMP

-- Sprint 1 additions (migrations 005, 006, 007)
creator_email TEXT                      -- Migration 005
email_sent_at TIMESTAMP                 -- Migration 005
creator_email_verified_at TIMESTAMP     -- Migration 006
verification_token_hash TEXT            -- Migration 006
verification_token_expires_at TIMESTAMP -- Migration 006
verification_attempts INTEGER           -- Migration 006
pending_creator_email TEXT              -- Migration 007
verification_sent_at TIMESTAMP          -- Migration 007
management_token_hash TEXT UNIQUE       -- Migration 007 (CRITICAL)
```

**`memories` table:**
```sql
-- Inferred from contribution flow
id UUID PRIMARY KEY
memorypop_id UUID REFERENCES memorypops(id)
contributor_name TEXT
message TEXT
photo_url TEXT
created_at TIMESTAMP
```

**`memorypop_reactions` table:**
```sql
-- Migration 001
id UUID PRIMARY KEY
memorypop_id UUID REFERENCES memorypops(id) ON DELETE CASCADE
reaction_type TEXT CHECK (IN 'loved_it', 'made_me_emotional', 'made_me_laugh')
created_at TIMESTAMP
```

### Foreign Key Relationships

```
memorypops (parent)
  ├─→ memories (child, likely CASCADE on delete)
  └─→ memorypop_reactions (child, CASCADE on delete - confirmed)
```

**Cascade Behavior:**
- `memorypop_reactions` has `ON DELETE CASCADE` (confirmed in migration 001)
- `memories` likely has `ON DELETE CASCADE` (standard practice, but not confirmed in migrations)

**Impact:** Deleting memorypops will automatically delete:
- ✅ All associated reactions (CASCADE confirmed)
- ⚠️ All associated memories (CASCADE likely, needs verification)

---

## 3. Migration Order Analysis

### Migration Relationships

**Migrations 005, 006, 007 are CUMULATIVE and SEQUENTIAL:**

```
005_add_creator_email.sql
  ↓ Adds: creator_email, email_sent_at

006_add_email_verification.sql
  ↓ Adds: creator_email_verified_at, verification_token_hash,
         verification_token_expires_at, verification_attempts

007_add_creator_authorization.sql
  ↓ Adds: management_token_hash, pending_creator_email, verification_sent_at
```

### Key Constraint in Migration 007

**⚠️ CRITICAL ISSUE DISCOVERED:**

```sql
-- From migration 007
ALTER TABLE memorypops
ADD COLUMN management_token_hash TEXT UNIQUE NOT NULL;
```

**Problem:** `NOT NULL` constraint **CANNOT** be added to existing table with data.

**Impact:** Migration 007 will FAIL if any rows exist in memorypops table.

**Solutions:**

**Option A: Drop and recreate (RECOMMENDED for beta reset)**
```sql
-- Delete all test data first
DELETE FROM memorypops; -- Cascades to reactions and memories

-- Then apply migrations
```

**Option B: Modify migration 007 (ALTER ONLY)**
```sql
-- Change migration to allow NULL initially
ALTER TABLE memorypops
ADD COLUMN management_token_hash TEXT UNIQUE;

-- After data migration/deletion, add NOT NULL constraint
ALTER TABLE memorypops
ALTER COLUMN management_token_hash SET NOT NULL;
```

**Recommendation:** Use Option A (delete data first, then apply migrations cleanly).

---

## 4. Exact Cleanup Plan

### Pre-Cleanup Verification Checklist

**In Supabase Dashboard, verify:**

- [ ] Count total memorypops: `SELECT COUNT(*) FROM memorypops;`
- [ ] Count memorypops with contributions: `SELECT COUNT(DISTINCT memorypop_id) FROM memories;`
- [ ] Count revealed memorypops: `SELECT COUNT(*) FROM memorypops WHERE revealed = true;`
- [ ] Confirm NO real user data: Review recent records manually
- [ ] **STOP if any record appears to be real user data**

### Cleanup Execution Steps

**⚠️ DESTRUCTIVE OPERATION - EXECUTE ONLY AFTER FOUNDER CONFIRMATION**

```sql
-- Step 1: Record counts (for audit trail)
SELECT 'memorypops' AS table_name, COUNT(*) AS record_count FROM memorypops
UNION ALL
SELECT 'memories', COUNT(*) FROM memories
UNION ALL
SELECT 'memorypop_reactions', COUNT(*) FROM memorypop_reactions;

-- Step 2: Delete all test data (CASCADE will handle related records)
DELETE FROM memorypops;

-- Step 3: Verify cleanup
SELECT COUNT(*) FROM memorypops;      -- Should be 0
SELECT COUNT(*) FROM memories;        -- Should be 0
SELECT COUNT(*) FROM memorypop_reactions; -- Should be 0

-- Step 4: Confirm ready for migration 007
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'memorypops'
  AND column_name = 'management_token_hash';
-- Should return 0 rows (column doesn't exist yet)
```

### Rollback/Backup Recommendation

**Pre-Cleanup Backup (OPTIONAL for test data):**

Since Founder confirmed all data is test data, backup is OPTIONAL.

If backup desired:
```sql
-- Export to CSV via Supabase dashboard
-- Table: memorypops → Export → CSV
-- Table: memories → Export → CSV
-- Table: memorypop_reactions → Export → CSV
```

**Post-Cleanup Rollback:**
- NOT APPLICABLE (test data, intentional deletion)
- If needed: Re-create test MemoryPops through UI

---

## 5. Migration Execution Order

### Correct Sequence

**Assumption:** Migrations 005 and 006 may already be applied in some environments.

**Safe Execution Plan:**

```bash
# Check current migration status in Supabase dashboard
# SQL: SELECT * FROM schema_migrations; (if migrations table exists)

# Apply migrations in order (skip if already applied)

# Migration 005: Creator email
psql -f migrations/005_add_creator_email.sql

# Migration 006: Email verification
psql -f migrations/006_add_email_verification.sql

# Migration 007: Creator authorization (AFTER data cleanup)
psql -f migrations/007_add_creator_authorization.sql
```

**Migration Properties:**

| Migration | Idempotent? | Reversible? | Safe to Re-run? |
|-----------|-------------|-------------|-----------------|
| 005 | ⚠️ No (fails if columns exist) | ✅ Yes (rollback script provided) | ❌ No (use IF NOT EXISTS) |
| 006 | ⚠️ No (fails if columns exist) | ✅ Yes (rollback script provided) | ❌ No (use IF NOT EXISTS) |
| 007 | ⚠️ No (fails if columns exist OR data exists) | ✅ Yes (rollback script provided) | ❌ No (requires empty table) |

**Recommendation:** Check if columns exist before applying each migration.

### Idempotent Migration Template

For safer execution, modify migrations to be idempotent:

```sql
-- Example: Migration 007 made idempotent
ALTER TABLE memorypops
ADD COLUMN IF NOT EXISTS management_token_hash TEXT UNIQUE NOT NULL;

-- Check if index exists before creating
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE indexname = 'idx_memorypops_management_token_hash'
  ) THEN
    CREATE UNIQUE INDEX idx_memorypops_management_token_hash
      ON memorypops(management_token_hash);
  END IF;
END $$;
```

---

## 6. Post-Reset Verification

### New MemoryPop Creation Test

**After migrations applied, create test MemoryPop and verify:**

**Manual Test Steps:**

1. **Create MemoryPop via UI**
   - Visit `/create`
   - Fill in recipient, occasion, story
   - Click "Create Your MemoryPop"

2. **Verify Database Record**
   ```sql
   SELECT
     share_code,
     management_token_hash,
     creator_email,
     creator_email_verified_at
   FROM memorypops
   ORDER BY created_at DESC
   LIMIT 1;
   ```

3. **Expected Results:**
   - ✅ `share_code` exists (UUID format)
   - ❌ `management_token_hash` is NULL (PROBLEM - needs implementation fix)
   - ❌ `creator_email` is NULL (expected - not submitted yet)
   - ❌ `creator_email_verified_at` is NULL (expected)

4. **⚠️ CRITICAL FINDING:**

   **Management token is NOT generated during MemoryPop creation!**

   Current create logic (`/src/app/create/page.tsx` line 60) only generates:
   ```javascript
   share_code: crypto.randomUUID()
   ```

   **Missing:** `management_token` generation and hashing.

### Authorization Tests

**After creation flow is fixed:**

1. **Test public shareCode CANNOT access dashboard:**
   ```
   Visit: /dashboard/{shareCode}
   Expected: Redirect to /unauthorized
   Result: _________
   ```

2. **Test management token authentication:**
   ```
   Visit: /manage/{managementToken}
   Expected: Session created, redirect to /dashboard/{shareCode}
   Result: _________
   ```

3. **Test contributor link does NOT contain management token:**
   ```
   Visit: /m/{shareCode}/contribute
   Expected: Contribution form, no creator access
   Result: _________
   ```

4. **Test email submission requires session:**
   ```
   POST /api/send-creator-email without session
   Expected: 403 Unauthorized
   Result: _________
   ```

5. **Test rate limiting:**
   ```
   POST /api/send-creator-email twice within 5 minutes
   Expected: Second request returns 429
   Result: _________
   ```

---

## 7. Build and Test Results

### Build Status

**Command:** `npm run build`
**Exit Code:** 1
**Status:** ❌ FAILED

**Error:**
```
Module not found: Can't resolve '@react-email/components'
Module not found: Can't resolve 'resend'
```

**Root Cause:** npm packages not installed (network issue: ECONNRESET)

**Required Packages:**
- `resend@^4.0.1`
- `@react-email/components@^0.0.34`

**Resolution:** Install packages when network stable:
```bash
npm install resend @react-email/components
```

### TypeScript Validation

**Status:** ⚠️ Cannot run (depends on successful build)

**Alternative Check:**
```bash
npx tsc --noEmit --skipLibCheck
```

**Expected:** Should pass after packages install.

### Lint Status

**Command:** `npm run lint`
**Status:** ⚠️ Not attempted (build must succeed first)

### Automated Tests

**Status:** ❌ NO AUTOMATED TESTS EXIST

**Test Suite:** None configured
**Coverage Tool:** None configured
**Test Framework:** None configured

**Validation Method:** Manual code inspection + manual testing only

### Executed vs Inspection Testing

**Security Tests (47/47 PASS):**
- Method: Code inspection
- Validation: Logic review, not runtime execution
- Confidence: High (but not runtime-verified)

**Authorization Tests:**
- Method: Code inspection
- Status: Logic appears correct
- Confidence: Needs runtime validation

---

## 8. Critical Implementation Gap: Management Token Generation

### BLOCKER DISCOVERED

**Problem:** Management token is NOT generated during MemoryPop creation.

**Impact:** After beta reset and migration, new MemoryPops will have:
- ✅ `share_code` (generated)
- ❌ `management_token_hash` (NULL - violates NOT NULL constraint)

**Root Cause:** Create flow was never updated to generate management token.

**Required Fix:**

**File:** `/src/app/create/page.tsx`

**Current Code (line 59-72):**
```typescript
const { data, error } = await supabase
  .from("memorypops")
  .insert({
    recipient_name: recipient,
    occasion,
    story,
    tone,
    status: "collecting",
    share_code: crypto.randomUUID(), // ✅ Generated
    celebration_date: celebrationDate || null,
    cover_style: selectedCover,
    // ❌ MISSING: management_token_hash
  })
  .select()
  .single();
```

**Required Fix:**
```typescript
import { generateManagementToken } from '@/lib/verification';

// Generate tokens
const shareCode = crypto.randomUUID();
const { token, tokenHash } = generateManagementToken();

const { data, error } = await supabase
  .from("memorypops")
  .insert({
    recipient_name: recipient,
    occasion,
    story,
    tone,
    status: "collecting",
    share_code: shareCode,
    management_token_hash: tokenHash, // ✅ Added
    celebration_date: celebrationDate || null,
    cover_style: selectedCover,
  })
  .select()
  .single();

// Store raw token for success page redirect
// Redirect to: /success?shareCode=${shareCode}&managementToken=${token}
```

**Additional Required Changes:**

1. **Success Page** must receive `managementToken` and display management link
2. **Creation Email** must include management link (not dashboard link)
3. **Dashboard Link** should be removed from success page (requires email now)

**Status:** ⚠️ CRITICAL BLOCKER - Must be fixed before production deployment

---

## 9. Remaining Production Blockers

### Critical Blockers (Must Fix Before Deployment)

1. **❌ Management Token Generation Missing**
   - Impact: Cannot create MemoryPops after migration 007
   - Fix: Update create flow to generate and store token hash
   - Effort: 1-2 hours
   - Priority: P0 (blocks everything)

2. **❌ Success Page Flow Broken**
   - Impact: Creators won't receive management link
   - Fix: Pass token to success page, display management link
   - Effort: 1 hour
   - Priority: P0

3. **❌ npm Packages Not Installed**
   - Impact: Build fails
   - Fix: Resolve network issue, run `npm install`
   - Effort: 5 minutes (after network fixed)
   - Priority: P0

### High Priority (Required Before Launch)

4. **⚠️ Privacy Policy Update**
   - Impact: GDPR non-compliance
   - Owner: Founder
   - Effort: 1-2 hours
   - Priority: P1 (legal requirement)

5. **⚠️ SESSION_SECRET Generation**
   - Impact: Session security compromised
   - Owner: Founder
   - Command: `openssl rand -base64 32`
   - Priority: P1

6. **⚠️ Legacy Data Cleanup**
   - Impact: Migration 007 will fail
   - Owner: Founder (via Supabase dashboard)
   - Effort: 15 minutes
   - Priority: P1

7. **⚠️ Migration Execution**
   - Impact: Authorization system not active
   - Owner: Founder (via Supabase dashboard)
   - Effort: 15 minutes
   - Priority: P1

### Medium Priority (Should Complete)

8. **📋 Resend Domain Configuration**
   - Impact: Emails won't send
   - Owner: Founder
   - Effort: 30 minutes + DNS propagation
   - Priority: P2

9. **📋 Runtime Testing**
   - Impact: Unknown runtime bugs
   - Method: Manual testing after build succeeds
   - Effort: 1 hour
   - Priority: P2

10. **📋 Production Environment Variables**
    - Impact: Feature won't work in production
    - Required: APP_BASE_URL, EMAIL_FROM, RESEND_API_KEY, SESSION_SECRET
    - Priority: P2

---

## 10. Revised Migration Plan with Fixes

### Complete Deployment Sequence

**Phase 1: Fix Implementation (Developer)**

1. ✅ Authorization system implemented
2. ❌ Add management token generation to create flow
3. ❌ Update success page to display management link
4. ❌ Update creation email to use management link
5. ❌ Install npm packages (after network resolves)
6. ❌ Run successful build
7. ❌ Manual testing of complete flow

**Phase 2: Pre-Deployment (Founder)**

8. ⬜ Generate SESSION_SECRET
9. ⬜ Update Privacy Policy
10. ⬜ Configure Resend domain + DNS
11. ⬜ Set production environment variables

**Phase 3: Data Migration (Founder - Supabase Dashboard)**

12. ⬜ Audit existing test data (run count queries)
13. ⬜ Confirm all data is test data
14. ⬜ Delete all test MemoryPops: `DELETE FROM memorypops;`
15. ⬜ Verify cleanup: `SELECT COUNT(*) FROM memorypops;` (should be 0)

**Phase 4: Schema Migration (Founder - Supabase Dashboard)**

16. ⬜ Check migration 005 status (creator_email column exists?)
17. ⬜ Apply migration 005 if needed
18. ⬜ Check migration 006 status (verification columns exist?)
19. ⬜ Apply migration 006 if needed
20. ⬜ Apply migration 007 (management_token_hash)
21. ⬜ Verify migration: Check column exists with NOT NULL constraint

**Phase 5: Deployment (Founder)**

22. ⬜ Deploy fixed code to production
23. ⬜ Enable feature flag: `CREATOR_EMAIL_ENABLED=true`
24. ⬜ Create test MemoryPop via UI
25. ⬜ Verify management token generated
26. ⬜ Test authentication flow
27. ⬜ Test email submission + verification
28. ⬜ Monitor for 24 hours

---

## 11. Risk Assessment

### High Risk Items

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Management token generation missing | P0 - Cannot create MemoryPops | HIGH (confirmed) | Fix create flow before deployment |
| Migration 007 fails on existing data | Deployment blocked | HIGH (if data not deleted first) | Delete test data before migration |
| npm packages fail to install | Build fails | MEDIUM (network issue) | Retry in stable environment |
| Privacy Policy not updated | GDPR violation | MEDIUM | Block launch until updated |

### Medium Risk Items

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Session secret not strong | Security compromise | LOW (documented) | Use openssl, validate length |
| Resend email delivery fails | Bad UX | LOW (good provider) | Test with real inbox before launch |
| Rate limiting bypassed | Spam risk | LOW (server-side) | Monitor after launch |

### Low Risk Items

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Session cookie incompatibility | Auth fails | LOW (standard cookies) | Test in multiple browsers |
| Token hash collision | Auth fails | VERY LOW (256-bit, SHA-256) | Standard crypto best practice |

---

## 12. Success Criteria

**Beta Reset Complete When:**

- ✅ All test MemoryPops deleted
- ✅ Migrations 005, 006, 007 applied successfully
- ✅ `management_token_hash` column exists with NOT NULL constraint
- ✅ Create flow generates management token
- ✅ Success page displays management link
- ✅ Build succeeds
- ✅ Manual testing passes:
  - Create MemoryPop → Management token stored
  - Click management link → Session established
  - Dashboard accessible with session
  - Dashboard blocked without session
  - Email submission requires session
  - Rate limiting enforces 5-minute cooldown
- ✅ Privacy Policy updated
- ✅ Production environment variables set

---

## 13. Final Recommendation

### STOP - Critical Implementation Gap

**Status:** 🛑 **CANNOT PROCEED WITH BETA RESET UNTIL FIX DEPLOYED**

**Reason:** Management token is not generated during MemoryPop creation. After migration 007, all new MemoryPops will fail with NOT NULL constraint violation.

**Required Actions:**

1. **Fix create flow** (add management token generation)
2. **Fix success page** (display management link instead of direct dashboard access)
3. **Fix creation email** (use management link instead of dashboard link)
4. **Test build** (after npm packages install)
5. **Manual testing** (verify complete flow)
6. **THEN** proceed with beta reset

**Estimated Time to Fix:** 3-4 hours of development + 1 hour of testing

**Next Steps:**

1. Return to Coder stage to implement management token generation
2. Re-test authorization flow end-to-end
3. Verify build succeeds
4. Return to Founder with updated plan

---

**Plan Status:** 🚧 **DRAFT - AWAITING IMPLEMENTATION FIX**
**Execution Status:** ⏸️ **ON HOLD**
**Blocker:** Management token generation not implemented

---

## Appendix A: Quick Reference Commands

### Audit Queries (Run in Supabase Dashboard)

```sql
-- Count test data
SELECT 'memorypops' AS table, COUNT(*) AS count FROM memorypops
UNION ALL
SELECT 'memories', COUNT(*) FROM memories
UNION ALL
SELECT 'memorypop_reactions', COUNT(*) FROM memorypop_reactions;

-- Check migration status
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'memorypops'
  AND column_name IN (
    'creator_email',
    'management_token_hash',
    'verification_token_hash'
  );
```

### Cleanup Commands (Run After Confirmation)

```sql
-- DELETE ALL TEST DATA
DELETE FROM memorypops;

-- Verify cleanup
SELECT COUNT(*) FROM memorypops;
SELECT COUNT(*) FROM memories;
SELECT COUNT(*) FROM memorypop_reactions;
```

### Post-Migration Verification

```sql
-- Verify migration 007 applied
SELECT column_name, is_nullable, data_type
FROM information_schema.columns
WHERE table_name = 'memorypops'
  AND column_name = 'management_token_hash';
-- Expected: is_nullable = 'NO', data_type = 'text'

-- Verify unique constraint
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'memorypops'
  AND constraint_type = 'UNIQUE';
-- Should include constraint on management_token_hash
```

---

**Document Version:** 1.0
**Last Updated:** 2026-07-20
**Status:** Draft - Awaiting Implementation Fix
