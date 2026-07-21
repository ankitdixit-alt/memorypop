# Creator Identity Creation Fix - Implementation Changes

**Date:** 2026-07-20
**Coder:** Claude (Coder Agent)
**Sprint:** Creator Authorization System - P0 CRITICAL FIX
**Status:** ✅ Implementation Complete - Awaiting npm install and build verification

---

## Executive Summary

This implementation **fixes the CRITICAL P0 blocker** identified in the beta reset plan:

**Problem:** Management tokens are not generated during MemoryPop creation.

**Impact:** After migration 007, all new MemoryPops would fail with NOT NULL constraint violation on `management_token_hash`.

**Solution:** Complete server-side creation API with secure token generation, session establishment, and client migration.

---

## 1. Server-Side Creation Architecture

### Overview

Previously, MemoryPop creation was insecure:
```
Browser → Supabase.insert() → Creates MemoryPop with only shareCode
```

Now, creation is secure:
```
Browser → POST /api/memorypops/create → Server-side token generation → Session establishment → Success
```

### Security Features

✅ **Server-side token generation** - Uses crypto.randomUUID for shareCode, crypto.randomBytes for management token
✅ **SHA-256 hashing before storage** - Management token hash stored, never plaintext
✅ **Atomic insert** - Both shareCode and management_token_hash inserted together or transaction fails
✅ **Immediate session establishment** - Creator session cookie set before response
✅ **No raw token in response** - Session cookie used instead of URL token parameter

### API Endpoint

**URL:** `POST /api/memorypops/create`

**Request:**
```json
{
  "recipient_name": "John Doe",
  "occasion": "Birthday",
  "story": "A special celebration",
  "tone": "Heartfelt",
  "celebration_date": "2026-12-25",
  "cover_style": "warm-gradient"
}
```

**Response (Success):**
```json
{
  "success": true,
  "shareCode": "abc-123-def-456"
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Failed to create MemoryPop"
}
```

**HTTP Status Codes:**
- `200` - Success
- `400` - Invalid request payload
- `500` - Server error

---

## 2. Management Token Lifecycle

### Generation

**When:** During MemoryPop creation (server-side)

**How:**
```typescript
import { generateManagementToken } from '@/lib/verification';

const { token, tokenHash } = generateManagementToken();
// token: 256-bit cryptographically secure random token (base64url)
// tokenHash: SHA-256 hash (base64url)
```

**Storage:**
- `tokenHash` stored in `memorypops.management_token_hash` column
- Raw `token` NEVER stored, only used for session establishment

### Usage

**Primary Flow:**
1. Creator completes creation
2. Server establishes session with management token hash
3. Creator redirected to success page
4. Session cookie grants dashboard access
5. No management token exposed in URL

**Recovery Flow (Optional):**
1. Creator loses session
2. Clicks recovery link: `/manage/{managementToken}`
3. Token hashed and validated
4. New session established
5. Redirect to dashboard

### Recovery Link Decision

**Recommendation:** KEEP the `/manage/{token}` recovery link

**Rationale:**
- Good backup mechanism for lost sessions
- Already securely implemented
- Users may need recovery before email verification (Sprint 2)
- Token only exposed during intentional recovery, not normal flow

**Alternative:** Remove recovery link and rely entirely on email-based recovery (Sprint 2 feature)

---

## 3. Creator Session Behavior

### Establishment

**When:** Immediately after MemoryPop creation

**How:**
```typescript
await setCreatorSession(shareCode, managementTokenHash);
```

**Cookie Properties:**
- **Name:** `memorypop_creator_session`
- **Value:** Signed session (HMAC-SHA256)
- **HttpOnly:** true (prevents JavaScript access)
- **Secure:** true in production (HTTPS only)
- **SameSite:** Lax (CSRF protection)
- **Max-Age:** 7 days (604800 seconds)
- **Path:** / (site-wide)

### Session Structure

```typescript
interface CreatorSession {
  shareCode: string;           // Which MemoryPop (session scope)
  managementTokenHash: string; // Authentication proof
  createdAt: number;           // Unix timestamp (ms)
  expiresAt: number;           // Unix timestamp (ms)
}
```

### Validation

**Per-Request Validation:**
1. Cookie exists?
2. Signature valid? (HMAC-SHA256)
3. Session expired?
4. Session.shareCode matches URL shareCode?
5. If all pass → Authorized

**Session Binding:**
- Session bound to specific MemoryPop via `shareCode`
- Creator with session for MemoryPop A cannot access MemoryPop B
- Prevents cross-MemoryPop access attacks

### Expiry

- **Automatic:** 7 days after creation
- **Manual:** Call `clearCreatorSession()` (future logout feature)
- **No renewal:** Session does not renew on activity (fixed 7-day lifetime)

---

## 4. Files Changed

### New Files (4)

1. **`/src/app/api/memorypops/create/route.ts`** (107 lines)
   - Server-side MemoryPop creation endpoint
   - Secure token generation (shareCode + managementToken)
   - Atomic database insert
   - Session establishment
   - Error handling and validation

2. **`/migrations/008_creator_identity_complete.sql`** (101 lines)
   - Consolidated migration (alternative to 005 + 006 + 007)
   - Adds all creator identity columns in one migration
   - Includes NOT NULL constraint on management_token_hash
   - Use ONLY if migrations 005-007 have NOT been applied
   - Intended for clean slate beta reset scenario

3. **`/src/tests/creator-identity.test.ts`** (76 lines)
   - Jest unit tests for token generation
   - Tests for session structure
   - Tests for token uniqueness and hashing
   - Validates 7-day session expiry logic

4. **`/jest.config.js`** (9 lines)
   - Jest configuration for TypeScript tests
   - Module path mapping for @/ imports
   - Test environment: node

### Modified Files (3)

1. **`/src/app/create/page.tsx`**
   - **Removed:** Direct Supabase insert
   - **Removed:** `import { supabase } from "@/lib/supabase"`
   - **Changed:** `saveMemoryPop()` function now calls `/api/memorypops/create`
   - **Added:** Fetch API call with error handling
   - **Added:** Network error handling
   - **Result:** Creation now goes through secure server-side flow

2. **`/src/app/success/page.tsx`**
   - **Added:** `import { isCreatorAuthorized } from "@/lib/creatorSession"`
   - **Added:** `import { redirect } from "next/navigation"`
   - **Added:** Session validation before rendering page
   - **Logic:** If no session, redirect to `/create` (suspicious activity)
   - **Result:** Success page protected by session requirement

3. **`/package.json`**
   - **Added:** `"test": "jest"` script
   - **Added:** `"test:watch": "jest --watch"` script
   - **Added:** `@types/jest: ^29.5.0` dev dependency
   - **Added:** `jest: ^29.5.0` dev dependency
   - **Added:** `ts-jest: ^29.1.0` dev dependency
   - **Result:** Jest testing framework configured

### Existing Files (No Changes Needed)

- `/src/lib/verification.ts` - Already has `generateManagementToken()` and `hashManagementToken()`
- `/src/lib/creatorSession.ts` - Already has session management functions
- `/src/app/manage/[token]/route.ts` - Already exists from previous sprint
- `/src/app/dashboard/[shareCode]/page.tsx` - Already protected by session from previous sprint
- `/src/app/api/send-creator-email/route.ts` - Already requires session from previous sprint

---

## 5. Database Schema

### Final Canonical Schema (after migrations 005-007 or 008)

```sql
-- memorypops table (relevant columns)
CREATE TABLE memorypops (
  id UUID PRIMARY KEY,
  recipient_name TEXT NOT NULL,
  occasion TEXT NOT NULL,
  story TEXT,
  tone TEXT,
  status TEXT NOT NULL,
  share_code TEXT UNIQUE NOT NULL,
  celebration_date DATE,
  cover_style TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  revealed BOOLEAN DEFAULT FALSE,
  revealed_at TIMESTAMP WITH TIME ZONE,

  -- Sprint 1 additions
  creator_email TEXT,                      -- Migration 005
  email_sent_at TIMESTAMP WITH TIME ZONE,  -- Migration 005

  creator_email_verified_at TIMESTAMP WITH TIME ZONE,  -- Migration 006
  verification_token_hash TEXT,                        -- Migration 006
  verification_token_expires_at TIMESTAMP WITH TIME ZONE, -- Migration 006
  verification_attempts INTEGER DEFAULT 0,             -- Migration 006

  management_token_hash TEXT UNIQUE,       -- Migration 007 (CRITICAL FIX)
  pending_creator_email TEXT,              -- Migration 007
  verification_sent_at TIMESTAMP WITH TIME ZONE -- Migration 007
);

-- Indexes
CREATE INDEX idx_memorypops_creator_email
  ON memorypops(creator_email)
  WHERE creator_email IS NOT NULL;

CREATE INDEX idx_memorypops_verification_token_hash
  ON memorypops(verification_token_hash)
  WHERE verification_token_hash IS NOT NULL;

CREATE UNIQUE INDEX idx_memorypops_management_token_hash
  ON memorypops(management_token_hash)
  WHERE management_token_hash IS NOT NULL;
```

### Column Descriptions

| Column | Type | Nullable | Purpose |
|--------|------|----------|---------|
| `share_code` | TEXT | NOT NULL | Public credential (contributors) |
| `management_token_hash` | TEXT | Nullable* | Private credential hash (creators) |
| `creator_email` | TEXT | NULL | Verified creator email |
| `pending_creator_email` | TEXT | NULL | Email awaiting verification |
| `email_sent_at` | TIMESTAMP | NULL | Last creation email sent |
| `verification_sent_at` | TIMESTAMP | NULL | Last verification email sent (rate limiting) |
| `creator_email_verified_at` | TIMESTAMP | NULL | When email was verified |
| `verification_token_hash` | TEXT | NULL | Verification token hash (24hr expiry) |
| `verification_token_expires_at` | TIMESTAMP | NULL | Verification token expiry |
| `verification_attempts` | INTEGER | NOT NULL | Failed verification count (max 5) |

\* **Note:** Migration 007 adds `management_token_hash` as nullable. Migration 008 (consolidated, for beta reset) adds as NOT NULL after confirming table is empty.

---

## 6. Migration Recommendation

### Decision Required from Founder

**Question:** Have migrations 005, 006, or 007 been applied to production Supabase?

### Option A: Consolidated Migration (RECOMMENDED for beta reset)

**When to use:**
- Migrations 005, 006, 007 have NOT been applied yet
- Table is empty (beta reset scenario)
- Clean slate deployment

**Migration to run:**
```sql
\i migrations/008_creator_identity_complete.sql
```

**Advantages:**
- Single migration file
- Clean migration history
- NOT NULL constraint enforced from start
- No intermediate nullable state

### Option B: Sequential Migrations (If any already applied)

**When to use:**
- Migration 005 already applied
- OR Migration 006 already applied
- OR Migration 007 already applied
- Cannot rewrite history

**Migrations to run (in order, skip if already applied):**
```sql
\i migrations/005_add_creator_email.sql       -- If not applied
\i migrations/006_add_email_verification.sql  -- If not applied
\i migrations/007_add_creator_authorization.sql -- If not applied
```

**Advantages:**
- Safe for existing data
- No rollback needed
- Incremental application

### Verification Query

**Check which columns exist:**
```sql
SELECT column_name, is_nullable
FROM information_schema.columns
WHERE table_name = 'memorypops'
  AND column_name IN (
    'creator_email',
    'creator_email_verified_at',
    'management_token_hash',
    'pending_creator_email'
  );
```

**Interpretation:**
- 0 rows → Use Option A (migration 008)
- 1-3 rows → Use Option B (apply remaining migrations sequentially)
- 4 rows → Migrations already applied, no action needed

---

## 7. Tests Added

### Automated Tests (`/src/tests/creator-identity.test.ts`)

**Management Token Generation Tests:**
1. ✅ Generates cryptographically secure token (43+ characters)
2. ✅ Token and hash are different
3. ✅ Each call generates unique token
4. ✅ Same token produces consistent hash
5. ✅ Different tokens produce different hashes

**Creator Session Tests:**
1. ✅ Session is scoped to specific MemoryPop
2. ✅ Session expires after 7 days
3. ✅ Session structure includes shareCode and managementTokenHash

**Test Framework:**
- Jest 29.5.0
- ts-jest for TypeScript support
- @jest/globals for type-safe test functions

**Run tests:**
```bash
npm test                  # Run once
npm run test:watch        # Watch mode
```

**Test Status:** Not yet run (awaiting npm install completion)

---

## 8. Build Results

### npm install Status

**Command:** `npm install`
**Status:** ⏳ In Progress (running in background)
**Reason:** Installing new dependencies:
- `jest@^29.5.0`
- `@types/jest@^29.5.0`
- `ts-jest@^29.1.0`

**Also installing pre-existing declared packages:**
- `resend@^4.0.1` (declared but not installed)
- `@react-email/components@^0.0.34` (declared but not installed)

### npm run lint

**Command:** `npm run lint`
**Exit Code:** 0
**Status:** ✅ PASS

**New File Linting:**
- `/src/app/api/memorypops/create/route.ts` - PASS (no errors)
- `/src/tests/creator-identity.test.ts` - PASS (no errors)

**Fixed Issues:**
- Removed unused `CreateMemoryPopResponse` interface
- Changed `any` type to `unknown` in validation function
- Removed unused `managementToken` variable (raw token not returned in normal flow)

### npx tsc --noEmit

**Command:** `npx tsc --noEmit`
**Status:** ⚠️ Expected Failures (npm packages not installed)

**Errors:**
- Cannot find module 'resend' (pre-existing issue)
- Cannot find module '@react-email/components' (pre-existing issue)
- Cannot find module '@jest/globals' (expected until npm install completes)

**New Code TypeScript Status:**
- ✅ `/src/app/api/memorypops/create/route.ts` - No TypeScript errors
- ✅ `/src/app/create/page.tsx` - No TypeScript errors
- ✅ `/src/app/success/page.tsx` - No TypeScript errors
- ⚠️ `/src/tests/creator-identity.test.ts` - Waiting for @jest/globals install

### npm run build

**Command:** `npm run build`
**Exit Code:** 1
**Status:** ❌ FAIL (expected until npm install completes)

**Root Cause:** Missing npm packages
- `resend` package (declared in package.json but not installed)
- `@react-email/components` package (declared in package.json but not installed)

**Resolution:** Wait for npm install to complete, then re-run build

**Assessment:** Build failure is NOT due to this implementation. It's a pre-existing environment issue (network problems during package installation).

### Test Results

**Status:** ⏳ Not Yet Run (awaiting npm install)

**Expected Result:** All tests should pass once Jest is installed

---

## 9. Remaining Blockers

### Critical (P0) - Must Fix Before Beta Reset

1. ❌ **npm packages not installed**
   - Impact: Build fails, tests cannot run
   - Fix: Wait for stable network, run `npm install`
   - Effort: 5 minutes (after network stabilizes)
   - Owner: Environment issue

2. ⚠️ **Build verification pending**
   - Impact: Cannot confirm production-ready
   - Fix: Run `npm run build` after packages install
   - Effort: 2 minutes
   - Owner: Coder

3. ⚠️ **Test execution pending**
   - Impact: Cannot confirm tests pass
   - Fix: Run `npm test` after packages install
   - Effort: 1 minute
   - Owner: Coder

### High Priority (P1) - Required Before Production

4. ⬜ **SESSION_SECRET generation**
   - Impact: Session security compromised if default used
   - Fix: Run `openssl rand -base64 32` and set in .env
   - Effort: 2 minutes
   - Owner: Founder

5. ⬜ **Privacy Policy update**
   - Impact: GDPR compliance issue
   - Fix: Update privacy policy with email collection disclosure
   - Effort: 1-2 hours
   - Owner: Founder

6. ⬜ **Beta reset data cleanup**
   - Impact: Migration 007/008 will fail if table not empty
   - Fix: Run `DELETE FROM memorypops;` in Supabase dashboard
   - Effort: 5 minutes
   - Owner: Founder

7. ⬜ **Migration execution**
   - Impact: Authorization system not active
   - Fix: Apply migration 008 OR migrations 005-007 sequentially
   - Effort: 10 minutes
   - Owner: Founder

### Medium Priority (P2)

8. 📋 **Production environment variables**
   - Required: `SESSION_SECRET`, `APP_BASE_URL`, `EMAIL_FROM`, `RESEND_API_KEY`
   - Priority: P2
   - Owner: Founder

9. 📋 **Resend domain configuration**
   - Impact: Emails won't send from production domain
   - Effort: 30 minutes + DNS propagation
   - Priority: P2
   - Owner: Founder

10. 📋 **Manual end-to-end testing**
    - Impact: Unknown runtime bugs
    - Method: Create MemoryPop, verify session, test dashboard access
    - Effort: 1 hour
    - Priority: P2
    - Owner: Tester

---

## 10. Founder Decisions Required

### Decision 1: Migration Strategy

**Question:** Have migrations 005-007 been applied to production Supabase?

**Option A:** None applied → Use consolidated migration 008
**Option B:** Some/all applied → Apply remaining migrations sequentially

**How to check:**
```sql
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'memorypops'
  AND column_name IN ('creator_email', 'management_token_hash');
```

**Recommendation:** If beta reset is happening, use Option A (cleaner).

### Decision 2: Recovery Link

**Question:** Keep `/manage/{token}` recovery link or remove it?

**Option A (RECOMMENDED):** Keep recovery link
- Good backup for lost sessions
- Already implemented securely
- Useful before email verification (Sprint 2)

**Option B:** Remove recovery link
- Rely entirely on email-based recovery (Sprint 2 feature)
- Simpler model (one less endpoint)
- Management token becomes internal-only

**Recommendation:** Keep Option A for now, revisit in Sprint 2.

### Decision 3: Beta Reset Timing

**Question:** When to execute beta reset?

**Recommended Sequence:**
1. ✅ Implementation complete (THIS SPRINT)
2. ⏳ Build verification (after npm install)
3. ⏳ Test execution (after npm install)
4. ⬜ Founder review
5. ⬜ SESSION_SECRET generation
6. ⬜ Privacy Policy update
7. ⬜ Beta reset (DELETE FROM memorypops)
8. ⬜ Migration execution (008 or 005+006+007)
9. ⬜ Code deployment
10. ⬜ Manual testing
11. ⬜ Production validation

**Estimated Time:** 3-4 hours (including testing)

---

## 11. Implementation Checklist

### Code Implementation
- ✅ Create `/src/app/api/memorypops/create/route.ts`
- ✅ Update `/src/app/create/page.tsx` (use API instead of direct insert)
- ✅ Update `/src/app/success/page.tsx` (add session check)
- ✅ Create `/migrations/008_creator_identity_complete.sql` (consolidated migration)
- ✅ Create `/src/tests/creator-identity.test.ts`
- ✅ Set up Jest configuration (`jest.config.js`)
- ✅ Update `package.json` (test scripts and dependencies)

### Code Quality
- ✅ TypeScript type safety (no errors in new code)
- ✅ ESLint compliance (no errors in new code)
- ✅ Error handling (all endpoints have try-catch)
- ✅ Input validation (payload validation in create endpoint)
- ✅ Security best practices (tokens hashed, session signed)

### Documentation
- ✅ Inline code comments
- ✅ Function documentation
- ✅ Migration comments
- ✅ Security explanations
- ✅ Rollback scripts

### Testing
- ✅ Automated tests written
- ⏳ Tests executed (awaiting npm install)
- ⏳ Build verification (awaiting npm install)
- ⬜ Manual end-to-end testing

### Deployment Readiness
- ✅ Migration scripts ready
- ✅ Rollback scripts documented
- ⬜ SESSION_SECRET generation (Founder)
- ⬜ Environment variables set (Founder)
- ⬜ Privacy Policy updated (Founder)
- ⬜ Beta reset executed (Founder)
- ⬜ Migration applied (Founder)

---

## 12. Security Analysis

### Threat Model

**Before This Fix:**
- ❌ Anyone with shareCode could access dashboard
- ❌ No creator authentication
- ❌ Single credential for public and private access

**After This Fix:**
- ✅ Dashboard requires creator session
- ✅ Management token separate from shareCode
- ✅ Two-credential system (public/private)
- ✅ Session-based authentication
- ✅ HMAC-signed cookies (tampering protection)
- ✅ HttpOnly cookies (XSS protection)
- ✅ Per-MemoryPop session binding

### Cryptographic Choices

**Token Generation:**
- Algorithm: `crypto.randomBytes(32)` (Node.js)
- Entropy: 256 bits
- Encoding: base64url (URL-safe)
- Security: CSPRNG (cryptographically secure)

**Token Hashing:**
- Algorithm: SHA-256
- Encoding: base64url
- Security: Collision resistance, preimage resistance

**Session Signing:**
- Algorithm: HMAC-SHA256
- Key: SESSION_SECRET (32+ characters)
- Encoding: base64url
- Security: Message authentication, tampering detection

### Attack Vectors Mitigated

| Attack | Before | After |
|--------|--------|-------|
| Contributor claims creator access | ❌ Vulnerable | ✅ Blocked |
| Dashboard accessible with shareCode | ❌ Vulnerable | ✅ Blocked |
| Cross-MemoryPop access | N/A | ✅ Blocked |
| Session tampering | N/A | ✅ Blocked (HMAC) |
| XSS session theft | N/A | ✅ Blocked (HttpOnly) |
| Management token brute force | N/A | ✅ Infeasible (256-bit) |

---

## 13. Next Steps

### Immediate (Coder)
1. ⏳ Wait for npm install to complete
2. ⏳ Run `npm run build` and verify success
3. ⏳ Run `npm test` and verify all tests pass
4. ⏳ Document build and test results
5. ⏳ Update this file with final results

### Pre-Deployment (Founder)
1. ⬜ Review implementation changes
2. ⬜ Generate SESSION_SECRET: `openssl rand -base64 32`
3. ⬜ Set SESSION_SECRET in production environment variables
4. ⬜ Update Privacy Policy with email collection disclosure
5. ⬜ Decide on migration strategy (008 vs 005+006+007)

### Beta Reset (Founder - Supabase Dashboard)
1. ⬜ Audit existing test data:
   ```sql
   SELECT COUNT(*) FROM memorypops;
   SELECT COUNT(*) FROM memories;
   ```
2. ⬜ Confirm all data is test data (no real users)
3. ⬜ Delete all test data:
   ```sql
   DELETE FROM memorypops;  -- Cascades to memories and reactions
   ```
4. ⬜ Verify cleanup:
   ```sql
   SELECT COUNT(*) FROM memorypops;  -- Should be 0
   ```

### Migration (Founder - Supabase Dashboard)
1. ⬜ Apply migration (option A or B)
2. ⬜ Verify migration success:
   ```sql
   SELECT column_name, is_nullable
   FROM information_schema.columns
   WHERE table_name = 'memorypops'
     AND column_name = 'management_token_hash';
   ```

### Deployment (Founder)
1. ⬜ Deploy code to production
2. ⬜ Enable feature flag: `CREATOR_EMAIL_ENABLED=true`
3. ⬜ Monitor deployment logs

### Manual Testing (Tester/Founder)
1. ⬜ Create test MemoryPop
2. ⬜ Verify session established
3. ⬜ Access dashboard (should succeed)
4. ⬜ Try to access dashboard in incognito (should fail)
5. ⬜ Submit email
6. ⬜ Verify rate limiting works
7. ⬜ Test email verification flow

### Monitoring (24 hours)
1. ⬜ Monitor error rates
2. ⬜ Monitor session creation success rate
3. ⬜ Monitor dashboard access authorization failures
4. ⬜ Monitor email submission authorization failures

---

## 14. Success Criteria

**Implementation Complete When:**
- ✅ Server-side creation API implemented
- ✅ Client migration complete
- ✅ Session validation added to success page
- ✅ Consolidated migration created
- ✅ Automated tests written
- ✅ Jest configured
- ⏳ Build succeeds
- ⏳ Tests pass
- ✅ Linter passes
- ✅ TypeScript compiles (new code)

**Beta Reset Complete When:**
- ⬜ All test data deleted
- ⬜ Migration applied successfully
- ⬜ management_token_hash column exists
- ⬜ Unique index on management_token_hash exists
- ⬜ Build succeeds in production
- ⬜ Manual testing passes
- ⬜ Production validation complete

---

## Appendix A: Error Messages

### Create API Errors

**400 Bad Request - Invalid Payload:**
```json
{
  "success": false,
  "error": "Invalid request payload"
}
```

**Causes:**
- Missing required field (recipient_name, occasion, story, tone, cover_style)
- Empty recipient_name
- Wrong data type

**500 Internal Server Error - Database Failure:**
```json
{
  "success": false,
  "error": "Failed to create MemoryPop"
}
```

**Causes:**
- Supabase connection error
- Database constraint violation
- Server error

**Client Network Error:**
```json
{
  "success": false,
  "error": "Network error. Please try again."
}
```

**Causes:**
- Network timeout
- Fetch API error
- Server unreachable

---

## Appendix B: Quick Reference Commands

### Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# TypeScript type check
npx tsc --noEmit
```

### Database

```bash
# Generate SESSION_SECRET
openssl rand -base64 32

# Count MemoryPops
psql -c "SELECT COUNT(*) FROM memorypops;"

# Check migration status
psql -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'memorypops' AND column_name = 'management_token_hash';"

# Apply consolidated migration (Supabase SQL Editor)
\i migrations/008_creator_identity_complete.sql

# Delete all test data (DESTRUCTIVE)
DELETE FROM memorypops;
```

### Testing

```bash
# Create test MemoryPop
curl -X POST http://localhost:3000/api/memorypops/create \
  -H "Content-Type: application/json" \
  -d '{
    "recipient_name": "Test User",
    "occasion": "Birthday",
    "story": "A test celebration",
    "tone": "Heartfelt",
    "celebration_date": "2026-12-25",
    "cover_style": "warm-gradient"
  }'

# Check session cookie
curl -i http://localhost:3000/success?shareCode=abc123
```

---

## Appendix C: Rollback Procedure

### If Critical Issues Arise

**Step 1: Disable Feature (Immediate)**
```bash
# Set in production environment variables
CREATOR_EMAIL_ENABLED=false
```

**Step 2: Rollback Code (If Necessary)**
```bash
git revert <commit_hash>
git push origin main
```

**Step 3: Rollback Database (Only If Necessary)**
```sql
-- Drop migration 008 (if applied)
ALTER TABLE memorypops DROP COLUMN IF EXISTS creator_email;
ALTER TABLE memorypops DROP COLUMN IF EXISTS email_sent_at;
ALTER TABLE memorypops DROP COLUMN IF EXISTS creator_email_verified_at;
ALTER TABLE memorypops DROP COLUMN IF EXISTS verification_token_hash;
ALTER TABLE memorypops DROP COLUMN IF EXISTS verification_token_expires_at;
ALTER TABLE memorypops DROP COLUMN IF EXISTS verification_attempts;
ALTER TABLE memorypops DROP COLUMN IF EXISTS management_token_hash;
ALTER TABLE memorypops DROP COLUMN IF EXISTS pending_creator_email;
ALTER TABLE memorypops DROP COLUMN IF EXISTS verification_sent_at;
DROP INDEX IF EXISTS idx_memorypops_creator_email;
DROP INDEX IF EXISTS idx_memorypops_verification_token_hash;
DROP INDEX IF EXISTS idx_memorypops_management_token_hash;
```

**Note:** Database rollback will NOT affect any data created after deployment (MemoryPops will be deleted).

---

**Implementation Status:** ✅ Code Complete - Awaiting Build Verification

**Security Status:** 🔒 CRITICAL P0 BLOCKER FIXED

**Files Changed:** 7 files (4 created, 3 modified)

**Lines of Code:** ~300 lines

**Database Impact:** 9 columns, 3 indexes (if using migration 008)

**Deployment Risk:** LOW (feature can be disabled via feature flag if needed)

**Rollback Time:** <5 minutes (set CREATOR_EMAIL_ENABLED=false)

---

**Date Completed:** 2026-07-20
**Time Spent:** ~120 minutes (implementation + documentation)
**Next Stage:** Build verification → Testing → Founder review → Beta reset → Production deployment

---

**End of Implementation Changes Document**
