# MemoryPop Plus Release Guide

**Date**: 2026-09-26
**Feature**: Plus tier with AI Director reveal
**Type**: Manual release (requires SQL + Vercel configuration)

---

## Pre-Release Checklist

- [ ] All verification checks passed (see VERIFICATION_CHECKLIST.md)
- [ ] Build succeeds locally (`npm run build`)
- [ ] Tests pass (50/50 tests)
- [ ] Standard reveal production fix confirmed
- [ ] Plus reveal layout complete (8/8 features)
- [ ] Beta code entry point working

---

## Step 1: Production Database Migration

### 1.1 Required Schema Changes

Production currently has only `is_premium` column (added via PRODUCTION_FIX_ADD_IS_PREMIUM.sql).

Additional columns needed for full Plus release:

**File**: `migrations/PRODUCTION_PLUS_RELEASE.sql`

```sql
-- ============================================================
-- PRODUCTION RELEASE: MemoryPop Plus Full Schema
-- ============================================================
-- Adds upgrade tracking and beta code redemption schema
-- Safe to run: All operations are idempotent with existence checks
--
-- Run in: Supabase SQL Editor for production project gvfpgawbvuttglfscngg
-- Link: https://supabase.com/dashboard/project/gvfpgawbvuttglfscngg/sql
-- ============================================================

BEGIN;

-- ============================================================
-- 1. Add upgrade tracking columns to memorypops
-- ============================================================

-- upgraded_at: timestamp of Plus activation
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'memorypops'
    AND column_name = 'upgraded_at'
  ) THEN
    ALTER TABLE memorypops
    ADD COLUMN upgraded_at TIMESTAMP WITH TIME ZONE;

    COMMENT ON COLUMN memorypops.upgraded_at IS 'Timestamp when gift was upgraded to Plus';

    RAISE NOTICE 'Added upgraded_at column';
  ELSE
    RAISE NOTICE 'Column upgraded_at already exists';
  END IF;
END $$;

-- upgrade_source: 'beta_code' or 'stripe' (future)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'memorypops'
    AND column_name = 'upgrade_source'
  ) THEN
    ALTER TABLE memorypops
    ADD COLUMN upgrade_source TEXT CHECK (upgrade_source IN ('beta_code', 'stripe'));

    COMMENT ON COLUMN memorypops.upgrade_source IS 'Source of Plus upgrade: beta_code or stripe';

    RAISE NOTICE 'Added upgrade_source column';
  ELSE
    RAISE NOTICE 'Column upgrade_source already exists';
  END IF;
END $$;

-- ============================================================
-- 2. Create beta_codes table
-- ============================================================

CREATE TABLE IF NOT EXISTS beta_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, -- Human-readable name (e.g., "Launch Week 2024")
  code_hash TEXT NOT NULL UNIQUE, -- SHA-256 hash of actual code
  active BOOLEAN NOT NULL DEFAULT TRUE,
  total_redemption_limit INTEGER NOT NULL DEFAULT 1,
  current_redemptions INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_redemptions CHECK (current_redemptions <= total_redemption_limit),
  CONSTRAINT valid_expiry CHECK (expires_at > created_at)
);

-- Index for code lookup (primary operation)
CREATE INDEX IF NOT EXISTS idx_beta_codes_hash ON beta_codes(code_hash);

-- Index for active code queries
CREATE INDEX IF NOT EXISTS idx_beta_codes_active ON beta_codes(active) WHERE active = TRUE;

COMMENT ON TABLE beta_codes IS 'Beta access codes for Plus upgrades during early access period';

-- ============================================================
-- 3. Create beta_code_redemptions table
-- ============================================================

CREATE TABLE IF NOT EXISTS beta_code_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beta_code_id UUID NOT NULL REFERENCES beta_codes(id) ON DELETE CASCADE,
  memorypop_id UUID NOT NULL REFERENCES memorypops(id) ON DELETE CASCADE,
  redeemed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  -- One redemption per memorypop per code
  CONSTRAINT unique_redemption UNIQUE (beta_code_id, memorypop_id)
);

-- Index for redemption lookups
CREATE INDEX IF NOT EXISTS idx_beta_redemptions_memorypop ON beta_code_redemptions(memorypop_id);
CREATE INDEX IF NOT EXISTS idx_beta_redemptions_code ON beta_code_redemptions(beta_code_id);

COMMENT ON TABLE beta_code_redemptions IS 'Tracks which MemoryPops have redeemed which beta codes';

-- ============================================================
-- 4. Create ai_reveal_plans table (already exists in test)
-- ============================================================

CREATE TABLE IF NOT EXISTS ai_reveal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memorypop_id UUID NOT NULL REFERENCES memorypops(id) ON DELETE CASCADE,

  -- Generated plan (JSONB for flexible schema)
  plan JSONB,

  -- Model metadata
  model_name TEXT NOT NULL DEFAULT 'deterministic',
  model_provider TEXT NOT NULL DEFAULT 'internal',

  -- Input tracking (for cache invalidation)
  input_snapshot JSONB,
  input_hash TEXT NOT NULL DEFAULT '',

  -- Generation metadata
  generation_source TEXT NOT NULL DEFAULT 'deterministic_fallback',
  generation_error TEXT,
  generation_version INTEGER NOT NULL DEFAULT 1,

  -- Concurrency protection
  generation_lock_holder TEXT,
  generation_lock_acquired_at TIMESTAMP WITH TIME ZONE,
  generation_lock_expires_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  -- One plan per memorypop
  CONSTRAINT unique_plan_per_memorypop UNIQUE (memorypop_id)
);

-- Index for plan lookups
CREATE INDEX IF NOT EXISTS idx_ai_plans_memorypop ON ai_reveal_plans(memorypop_id);

-- Index for input hash (cache checks)
CREATE INDEX IF NOT EXISTS idx_ai_plans_input_hash ON ai_reveal_plans(input_hash);

COMMENT ON TABLE ai_reveal_plans IS 'AI-generated reveal plans for Plus experiences';

-- ============================================================
-- 5. Create publish_reveal_plan function
-- ============================================================

CREATE OR REPLACE FUNCTION publish_reveal_plan(
  p_memorypop_id UUID,
  p_worker_id TEXT,
  p_expected_version INTEGER,
  p_expected_input_hash TEXT,
  p_plan JSONB,
  p_model_name TEXT,
  p_model_provider TEXT,
  p_input_snapshot JSONB,
  p_input_hash TEXT,
  p_generation_source TEXT,
  p_generation_error TEXT DEFAULT NULL
) RETURNS TEXT AS $$
DECLARE
  v_current_version INTEGER;
  v_current_lock_holder TEXT;
  v_current_lock_expires TIMESTAMP WITH TIME ZONE;
  v_current_input_hash TEXT;
BEGIN
  -- Fetch current state
  SELECT
    generation_version,
    generation_lock_holder,
    generation_lock_expires_at,
    input_hash
  INTO
    v_current_version,
    v_current_lock_holder,
    v_current_lock_expires,
    v_current_input_hash
  FROM ai_reveal_plans
  WHERE memorypop_id = p_memorypop_id;

  -- Check 1: Version must match (prevents race conditions)
  IF v_current_version IS NOT NULL AND v_current_version != p_expected_version THEN
    RETURN 'version_mismatch';
  END IF;

  -- Check 2: Must hold the lock
  IF v_current_lock_holder IS NULL OR v_current_lock_holder != p_worker_id THEN
    RETURN 'lock_lost';
  END IF;

  -- Check 3: Lock must not be expired (use database NOW() for consistency)
  IF v_current_lock_expires IS NULL OR v_current_lock_expires < NOW() THEN
    RETURN 'lock_expired';
  END IF;

  -- Check 4: Input hash must match (prevents stale writes)
  IF v_current_input_hash IS NOT NULL AND v_current_input_hash != p_expected_input_hash THEN
    RETURN 'input_changed';
  END IF;

  -- All checks passed - publish the plan
  UPDATE ai_reveal_plans
  SET
    plan = p_plan,
    model_name = p_model_name,
    model_provider = p_model_provider,
    input_snapshot = p_input_snapshot,
    input_hash = p_input_hash,
    generation_source = p_generation_source,
    generation_error = p_generation_error,
    generation_lock_holder = NULL,
    generation_lock_acquired_at = NULL,
    generation_lock_expires_at = NULL,
    updated_at = NOW()
  WHERE memorypop_id = p_memorypop_id;

  RETURN 'success';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp;

COMMENT ON FUNCTION publish_reveal_plan IS 'Atomically publish a reveal plan with concurrency and staleness checks';

-- ============================================================
-- 6. Row Level Security (RLS)
-- ============================================================

-- Enable RLS on new tables
ALTER TABLE beta_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE beta_code_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_reveal_plans ENABLE ROW LEVEL SECURITY;

-- Beta codes: read-only via service role
CREATE POLICY beta_codes_service_role ON beta_codes
  FOR ALL
  USING (auth.role() = 'service_role');

-- Beta redemptions: service role only
CREATE POLICY beta_redemptions_service_role ON beta_code_redemptions
  FOR ALL
  USING (auth.role() = 'service_role');

-- AI plans: service role only
CREATE POLICY ai_plans_service_role ON ai_reveal_plans
  FOR ALL
  USING (auth.role() = 'service_role');

COMMIT;

-- ============================================================
-- Verification Queries
-- ============================================================

-- Check all Plus columns exist
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'memorypops'
  AND column_name IN ('is_premium', 'upgraded_at', 'upgrade_source')
ORDER BY column_name;

-- Expected output:
-- column_name    | data_type | is_nullable | column_default
-- ---------------+-----------+-------------+----------------
-- is_premium     | boolean   | NO          | false
-- upgraded_at    | timestamp | YES         | NULL
-- upgrade_source | text      | YES         | NULL

-- Check beta code tables
SELECT
  table_name,
  COUNT(*) as column_count
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('beta_codes', 'beta_code_redemptions', 'ai_reveal_plans')
GROUP BY table_name
ORDER BY table_name;

-- Expected output:
-- table_name              | column_count
-- ------------------------+--------------
-- ai_reveal_plans         | 16
-- beta_code_redemptions   | 4
-- beta_codes              | 8

-- Check function exists
SELECT
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'publish_reveal_plan';

-- Expected output:
-- routine_name         | routine_type
-- ---------------------+-------------
-- publish_reveal_plan  | FUNCTION

```

### 1.2 Apply Migration

**Steps**:
1. Open Supabase SQL Editor: https://supabase.com/dashboard/project/gvfpgawbvuttglfscngg/sql
2. Copy entire contents of `migrations/PRODUCTION_PLUS_RELEASE.sql`
3. Paste into SQL Editor
4. Click "Run"
5. Verify success messages in output
6. Run verification queries at end of file

**Expected Output**:
```
NOTICE: Added upgraded_at column
NOTICE: Added upgrade_source column
COMMIT
```

**Rollback** (if needed):
```sql
-- Only if release must be reverted
DROP TABLE IF EXISTS beta_code_redemptions CASCADE;
DROP TABLE IF EXISTS beta_codes CASCADE;
DROP TABLE IF EXISTS ai_reveal_plans CASCADE;
DROP FUNCTION IF EXISTS publish_reveal_plan;

ALTER TABLE memorypops DROP COLUMN IF EXISTS upgraded_at;
ALTER TABLE memorypops DROP COLUMN IF EXISTS upgrade_source;
-- Keep is_premium (used by Standard gifts)
```

---

## Step 2: Vercel Environment Variables

### 2.1 Required Variables

Open Vercel project settings: https://vercel.com/your-team/memorypop/settings/environment-variables

**Add or update**:

| Variable | Value | Environment |
|----------|-------|-------------|
| `ENABLE_AI_DIRECTOR` | `true` | Production |
| `GROQ_API_KEY` | `gsk_...` (production key) | Production |
| `ENABLE_PREMIUM_BETA` | `true` | Production |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://gvfpgawbvuttglfscngg.supabase.co` | Production |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJh...` (production anon key) | Production |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJh...` (production service key) | Production |

**Important**:
- Use **production** Supabase project credentials (`gvfpgawbvuttglfscngg`)
- Get Groq production API key from https://console.groq.com
- Keep `ENABLE_PREMIUM_BETA=true` until Stripe integration ready
- All variables should be Production environment only (not Preview)

### 2.2 Verify Current Settings

```bash
# Check current production environment
vercel env ls --environment production
```

Should show:
- ENABLE_AI_DIRECTOR
- GROQ_API_KEY
- ENABLE_PREMIUM_BETA
- All Supabase variables

---

## Step 3: Create Beta Access Codes

### 3.1 Generate Code Hash

**Local script** (`scripts/create-beta-code.ts`):
```typescript
import crypto from 'crypto';

// Generate a random beta code
const code = 'PLUS-' + crypto.randomBytes(8).toString('hex').toUpperCase();

// Hash it for storage
const codeHash = crypto.createHash('sha256').update(code).digest('hex');

console.log('Beta Code:', code);
console.log('Code Hash:', codeHash);
console.log('\nSave the code securely - it cannot be recovered from the hash!');
```

Run:
```bash
npx tsx scripts/create-beta-code.ts
```

Output:
```
Beta Code: PLUS-A1B2C3D4E5F67890
Code Hash: 5d41402abc4b2a76b9719d911017c592...
```

### 3.2 Insert Beta Code

**SQL** (run in production Supabase):
```sql
INSERT INTO beta_codes (
  name,
  code_hash,
  active,
  total_redemption_limit,
  expires_at
) VALUES (
  'Launch Week 2024',
  '5d41402abc4b2a76b9719d911017c592...', -- Use hash from script
  TRUE,
  100, -- Allow 100 redemptions
  '2024-12-31 23:59:59+00' -- Expires end of year
);
```

**Verify**:
```sql
SELECT
  name,
  active,
  total_redemption_limit,
  current_redemptions,
  expires_at
FROM beta_codes
WHERE active = TRUE;
```

### 3.3 Distribute Codes

- Store plaintext codes in secure password manager (1Password, etc.)
- Share codes with beta testers via secure channels
- Track redemptions in `beta_code_redemptions` table

---

## Step 4: Git Commit & Deploy

### 4.1 Files to Commit

**Core Feature Files**:
```
src/app/m/[shareCode]/reveal/AIDirectorRevealController.tsx  # Plus reveal controller
src/components/DashboardPlusFeatures.tsx                      # Beta code UI
src/app/api/memorypops/[id]/redeem-beta-code/route.ts        # Redemption API
src/app/api/memorypops/[id]/status/route.ts                  # Preparation trigger
src/lib/ai/prepareRevealPlan.ts                              # AI plan service
src/lib/ai/revealPlanService.ts                              # Groq integration
src/lib/premiumEntitlement.ts                                # Entitlement helper
```

**Migration Files**:
```
migrations/PRODUCTION_PLUS_RELEASE.sql                        # Full release migration
migrations/012_add_ai_reveal_plans.sql                        # AI plans table
migrations/013_add_concurrency_protection.sql                 # Lock columns
migrations/014_allow_null_pending_plans.sql                   # Nullable plan
migrations/015_add_publish_function.sql                       # Atomic publish
```

**Documentation**:
```
TEST_SETUP_FINAL.md                                           # Test results
VERIFICATION_CHECKLIST.md                                     # Verification steps
RELEASE_GUIDE.md                                              # This file
PRODUCTION_FIX_SUMMARY.md                                     # Standard fix summary
```

### 4.2 Commit Message

```
feat: Add MemoryPop Plus with AI Director reveal

- Restore approved Plus reveal layout (8 features from RevealPreview)
- Complete beta code redemption flow (DashboardPlusFeatures + API)
- Add Groq AI integration for reveal plans (openai/gpt-oss-120b)
- Implement concurrency-safe plan generation with locking
- Add deterministic fallback for AI failures
- Verify authorization (creator-only operations)
- Maintain Standard reveal compatibility

Database changes:
- Add upgraded_at, upgrade_source columns to memorypops
- Add beta_codes table with redemption tracking
- Add ai_reveal_plans table with concurrency protection
- Add publish_reveal_plan atomic function

Production migration: migrations/PRODUCTION_PLUS_RELEASE.sql

Tested:
- Beta code redemption → Plus reveal flow
- Groq plan generation and caching
- Fallback behavior (timeout, invalid input)
- Authorization (creator vs recipient access)
- Standard reveal unaffected

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

### 4.3 Deploy to Vercel

```bash
# Ensure on main branch
git checkout main

# Pull latest
git pull origin main

# Commit changes
git add -A
git commit -m "feat: Add MemoryPop Plus with AI Director reveal

[Full commit message from above]"

# Push to trigger deployment
git push origin main
```

**Vercel Auto-Deploy**:
- Push to `main` triggers production build
- Build includes Plus feature code
- Environment variables applied automatically
- Deployment typically takes 2-3 minutes

---

## Step 5: Post-Deployment Verification

### 5.1 Production Health Checks

**Homepage**:
```bash
curl -I https://memorypop.app
# Expected: 200 OK
```

**Standard Preparation** (existing gift):
```bash
# Test with production Standard gift
open https://memorypop.app/dashboard/62913a7f-58cf-4b84-8d62-4e440a15d078
# Click "Prepare the Reveal"
# Expected: 200 OK, status updates to "ready"
```

**Standard Reveal**:
```bash
open https://memorypop.app/m/62913a7f-58cf-4b84-8d62-4e440a15d078/reveal
# Expected: Standard reveal plays correctly
```

### 5.2 Plus Feature Smoke Test

**Create Plus Gift**:
1. Visit https://memorypop.app/create
2. Fill form (recipient, occasion, celebration date)
3. Complete creation flow
4. Add 2-3 memories with photos

**Redeem Beta Code**:
1. Open dashboard (https://memorypop.app/dashboard/[share-code])
2. Click "Upgrade to Plus"
3. Enter beta code
4. Click "Activate Plus for €0"
5. Expected: Success message, Plus badge appears

**Prepare Plus Reveal**:
1. Click "Prepare the Reveal"
2. Wait 3-10 seconds (Groq generation)
3. Expected: Status updates to "ready", "View Reveal" appears

**View Plus Reveal**:
1. Click "View Reveal"
2. Expected: Plus reveal with all 8 features
   - Progress bar
   - Restart button
   - Chapter cards with eyebrow text
   - Asset count
   - Playback notes
   - "Next memory" button (if video present)
   - Proper aria-labels
   - Decorative overlays

### 5.3 Monitoring

**Vercel Logs**:
```bash
vercel logs https://memorypop.app --follow
```

**Check for**:
- No 500 errors
- No Groq API failures
- Preparation logs: "[AI_DIRECTOR] Preparation complete"
- No database errors

**Sentry** (if configured):
- No new error alerts
- No JavaScript exceptions
- No unhandled promise rejections

**Database**:
```sql
-- Check Plus redemptions
SELECT
  mp.share_code,
  mp.is_premium,
  mp.upgraded_at,
  mp.upgrade_source,
  bc.name as beta_code_name
FROM memorypops mp
LEFT JOIN beta_code_redemptions bcr ON mp.id = bcr.memorypop_id
LEFT JOIN beta_codes bc ON bcr.beta_code_id = bc.id
WHERE mp.is_premium = TRUE
ORDER BY mp.upgraded_at DESC
LIMIT 10;

-- Check AI plan generation
SELECT
  COUNT(*) as total_plans,
  COUNT(*) FILTER (WHERE generation_source = 'ai_generated') as ai_plans,
  COUNT(*) FILTER (WHERE generation_source = 'deterministic_fallback') as fallback_plans,
  AVG(EXTRACT(EPOCH FROM (updated_at - created_at))) as avg_generation_seconds
FROM ai_reveal_plans
WHERE created_at > NOW() - INTERVAL '24 hours';
```

---

## Step 6: Rollback Plan

### 6.1 Code Rollback

If deployment causes issues:

```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Or force revert to specific commit
git reset --hard <previous-commit-sha>
git push origin main --force
```

Vercel will auto-deploy the reverted code.

### 6.2 Environment Variable Rollback

Disable Plus features without code changes:

```bash
# In Vercel project settings, set:
ENABLE_AI_DIRECTOR=false
ENABLE_PREMIUM_BETA=false

# Redeploy
vercel redeploy --prod
```

**Effect**:
- Plus reveal preparation disabled (but Standard still works)
- Beta code redemption UI hidden
- Existing Plus gifts continue to use cached plans

### 6.3 Database Rollback

**⚠️ CAUTION**: Only if database issues detected

```sql
-- Drop Plus-specific tables (preserves memorypops data)
DROP TABLE IF EXISTS beta_code_redemptions CASCADE;
DROP TABLE IF EXISTS beta_codes CASCADE;
DROP TABLE IF EXISTS ai_reveal_plans CASCADE;
DROP FUNCTION IF EXISTS publish_reveal_plan;

-- Remove upgrade tracking columns (optional)
ALTER TABLE memorypops DROP COLUMN IF EXISTS upgraded_at;
ALTER TABLE memorypops DROP COLUMN IF EXISTS upgrade_source;

-- Keep is_premium column (needed for Standard reveal compatibility)
```

**Impact**:
- Beta code redemption stops working
- Plus reveal falls back to deterministic mode
- Standard reveals unaffected
- Existing Plus gifts lose AI plans (but still play)

---

## Step 7: Communication

### 7.1 Internal Announcement

**To Team**:
```
🚀 MemoryPop Plus is now live in production!

Features released:
✅ AI Director reveal with Groq (openai/gpt-oss-120b)
✅ Beta code redemption system
✅ 8 enhanced Plus features (progress bar, chapters, etc.)
✅ Standard reveal compatibility maintained

What to monitor:
- Beta code redemptions in production dashboard
- Groq API usage (check quota)
- Plus reveal playback quality
- Any user feedback on experience

Beta codes distributed to:
- [List of beta testers]

Next steps:
- Collect user feedback
- Monitor Groq performance and costs
- Prepare Stripe integration (when beta ends)

Questions? Check TEST_SETUP_FINAL.md and VERIFICATION_CHECKLIST.md
```

### 7.2 Beta Tester Instructions

**Email Template**:
```
Subject: Your MemoryPop Plus Beta Access

Hi [Name],

Thank you for being an early supporter of MemoryPop Plus!

Your beta access code: [PLUS-XXXXXXXXXX]

How to activate:
1. Create or open your MemoryPop gift
2. Go to your dashboard
3. Click "Upgrade to Plus"
4. Enter your code
5. Enjoy the enhanced reveal experience!

Plus features:
- AI-directed storytelling with chapters
- Up to 10 photos per memory (vs 3 in Standard)
- Up to 3 GIFs per memory (vs 1 in Standard)
- Up to 90 seconds video (vs 15s in Standard)
- Enhanced visual effects and transitions

Beta period: Free during early access (€0)
After beta: [€9.99 one-time purchase / details TBD]

Questions or issues? Reply to this email.

Enjoy creating magical memories!
— The MemoryPop Team
```

---

## Appendix: Troubleshooting

### Issue: Groq API Quota Exceeded

**Symptoms**:
- Preparation fails with timeout
- Logs show "429 Too Many Requests"

**Solution**:
```bash
# Check quota: https://console.groq.com/usage
# If exceeded:
# 1. Temporarily disable AI Director:
ENABLE_AI_DIRECTOR=false

# 2. Or upgrade Groq plan
# 3. Or implement request throttling
```

---

### Issue: Beta Code Not Working

**Symptoms**:
- "Invalid beta code" error
- Code redemption fails

**Debug**:
```sql
-- Check if code exists
SELECT
  name,
  active,
  current_redemptions,
  total_redemption_limit,
  expires_at
FROM beta_codes
WHERE code_hash = '[hash-from-create-script]';

-- If no results: code not inserted correctly
-- If active = false: code was deactivated
-- If current_redemptions >= total_redemption_limit: quota exhausted
-- If expires_at < NOW(): code expired
```

---

### Issue: Standard Reveal Broken After Deploy

**Symptoms**:
- Standard gifts can't prepare reveal
- 404 errors on reveal pages

**Check**:
```sql
-- Verify is_premium column exists
SELECT column_name FROM information_schema.columns
WHERE table_name = 'memorypops' AND column_name = 'is_premium';

-- If missing, re-apply PRODUCTION_FIX_ADD_IS_PREMIUM.sql
```

---

### Issue: Plus Reveal Shows Standard Experience

**Symptoms**:
- No chapter cards
- No decorative overlays
- Missing progress bar

**Debug**:
1. Check `is_premium` flag:
```sql
SELECT share_code, is_premium, upgrade_source
FROM memorypops
WHERE share_code = '[share-code]';
```

2. Verify environment variables:
```bash
vercel env ls --environment production | grep ENABLE_AI_DIRECTOR
# Should show: ENABLE_AI_DIRECTOR=true
```

3. Check browser console for errors

---

## Summary

**Required Actions**:
1. ✅ Apply `PRODUCTION_PLUS_RELEASE.sql` in Supabase
2. ✅ Set Vercel environment variables
3. ✅ Create and distribute beta codes
4. ✅ Commit and push to `main` branch
5. ✅ Verify deployment with smoke tests
6. ✅ Monitor logs and user feedback

**Success Criteria**:
- Standard reveals continue working
- Beta code redemption succeeds
- Plus reveals play with all 8 features
- No production errors in logs
- Groq API integration stable

**Support**:
- Documentation: TEST_SETUP_FINAL.md, VERIFICATION_CHECKLIST.md
- Rollback plan: Available in Step 6
- Monitoring: Vercel logs, Sentry, database queries

**Estimated Time**: 30-45 minutes for full release process
