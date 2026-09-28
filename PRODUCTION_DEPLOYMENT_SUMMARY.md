# Production Deployment Summary

**Date**: 2026-09-27
**Release**: Beta Code System + Plus Customer Reveal + TESTBETA2026

---

## Database Migrations

### 1. PRODUCTION_BETA_CODE_RELEASE.sql
**Location**: Run in Supabase SQL Editor (production project gvfpgawbvuttglfscngg)
**Link**: https://supabase.com/dashboard/project/gvfpgawbvuttglfscngg/sql

**Creates**:
- memorypops.upgraded_at (timestamp)
- memorypops.upgrade_source (text: 'beta_code' or 'stripe')
- beta_codes table (name, code_hash, active, limits, expiry)
- beta_code_redemptions table (tracks redemptions)
- RLS policies (service_role only)

**Verification**: Built-in queries at bottom of file

---

### 2. PRODUCTION_ADD_TESTBETA2026.sql
**Location**: Same Supabase SQL Editor
**Depends on**: PRODUCTION_BETA_CODE_RELEASE.sql must run first

**Inserts**:
- Name: "Complimentary Plus Access - TESTBETA2026"
- Code (raw): `TESTBETA2026` (case-sensitive)
- Hash: `56c609a1dd57a590e346fed18fd8fb072edab7140a65ff5bd66a9ff53956f4c0`
- Active: true
- Limit: 100 redemptions
- Expiry: 2027-09-27 23:59:59 UTC
- Idempotent: ON CONFLICT DO NOTHING

**Verification**: Query returns 1 row with code details

---

## Code Files (9 Files to Commit)

### Backend
1. `migrations/PRODUCTION_BETA_CODE_RELEASE.sql` (documentation)
2. `src/app/api/memorypops/[id]/redeem-beta-code/route.ts` (API endpoint)
3. `src/app/api/memorypops/[id]/redeem-beta-code/route.test.ts` (tests)
4. `src/lib/creatorSession.ts` (MODIFIED, +22 lines)

### Frontend - Dashboard
5. `src/components/DashboardPlusFeatures.tsx` (MODIFIED, +120 lines)

### Frontend - Customer Reveal
6. `src/app/ai-director-reveal/RevealPlayer.tsx` (NEW FILE)
7. `src/app/ai-director-reveal/reveal.module.css` (MODIFIED, line 2)
8. `src/app/m/[shareCode]/reveal/AIDirectorRevealController.tsx` (MODIFIED, line 143)
9. `src/app/ai-director-reveal/RevealPreview.tsx` (MODIFIED)

### Documentation (Do Not Commit)
- `PRODUCTION_ADD_TESTBETA2026.sql` (run via SQL Editor)
- `RELEASE_CHECKLIST.md` (reference only)
- `PRODUCTION_DEPLOYMENT_SUMMARY.md` (this file)

---

## Vercel Environment Variables

**Location**: https://vercel.com/[project]/settings/environment-variables

**Required for Groq**:
- `ENABLE_AI_DIRECTOR=true`
- `GROQ_API_KEY=[your-key]`

**Status**: ⚠️ **Cannot verify remotely** - Must check Vercel dashboard

**Note**: Beta code redemption works without these. Only Groq plan generation requires them.

---

## Redemption Flow

### Code Normalization
```typescript
code.trim()  // "TESTBETA2026" → "TESTBETA2026"
```

### Hashing
```typescript
crypto.createHash("sha256").update(code).digest("hex")
// "TESTBETA2026" → "56c609a1dd57a590e346fed18fd8fb072edab7140a65ff5bd66a9ff53956f4c0"
```

### Validation
1. Rate limit: 5 invalid attempts per 15min per IP
2. Creator authorization: management_token_hash match
3. Code lookup: active, not expired, under limit
4. Atomic redemption: optimistic lock on current_redemptions

### Upgrade
1. Increment beta_codes.current_redemptions
2. Insert beta_code_redemptions record
3. Set memorypops: is_premium=true, upgraded_at=NOW(), upgrade_source='beta_code'
4. Rollback on any failure

---

## Customer Reveal Features

### September 14 Baseline Restored
- Tile transitions inside .stage (line 252)
- Decorative overlays (occasion-aware, mobile-disabled)
- Music ducking (0.03 video / 0.12 photos)
- Production audio via audioRef prop
- No developer inspector
- No prototype text
- Stable width (background:transparent)

### Preserved Backend
- Groq plan generation (with ENABLE_AI_DIRECTOR flag)
- Plan save/load from ai_reveal_plans table
- Deterministic fallback (production-capable)
- Standard reveal (unchanged, separate code path)

---

## Production Test Journey

**URL**: https://memorypop.app/dashboard

**Steps**:
1. Navigate to dashboard with existing gift
2. Enter code: `TESTBETA2026`
3. Click "Upgrade to Plus"
4. **Verify**: Success message, €0 cost
5. Navigate to reveal page
6. **Verify**: Plus reveal loads (not Standard)
7. Click through scenes with → button
8. **Verify**: Tile transitions visible (~0.5s)
9. **Verify**: No developer inspector
10. **Verify**: Stable width (no layout jumps)

**Success = All verifications pass**

---

## What Cannot Be Verified Remotely

1. **Vercel environment variables**: ENABLE_AI_DIRECTOR, GROQ_API_KEY
2. **Tile transitions**: Visual effect (code fixed, browser test required)
3. **Decorative overlays**: Content placement (code preserved, visual test required)
4. **Music ducking**: Audio levels (code preserved, audio test required)
5. **Production database state**: Cannot query production tables

**These require manual production testing after deployment.**

---

## Already Deployed (Commit 69eae7b)

- AI reveal plans table (migrations 012-015)
- PRODUCTION_AI_DIRECTOR_MIGRATION.sql
- Groq generation infrastructure
- prepareRevealPlan.ts, revealPlanService.ts
- RevealExperience.tsx wrapper
- page.tsx with Plus detection
- hasPremiumAccess() entitlement check

---

## Rollback

### Database
```sql
BEGIN;
DROP TABLE IF EXISTS beta_code_redemptions CASCADE;
DROP TABLE IF EXISTS beta_codes CASCADE;
ALTER TABLE memorypops DROP COLUMN IF EXISTS upgraded_at;
ALTER TABLE memorypops DROP COLUMN IF EXISTS upgrade_source;
COMMIT;
```

### Code
Revert commit or redeploy previous main branch.

---

## Post-Deployment Monitoring

- [ ] Check Vercel deployment logs for errors
- [ ] Monitor beta_codes.current_redemptions increments
- [ ] Test second redemption (verify atomic behavior)
- [ ] Check Groq plan generation (if ENABLE_AI_DIRECTOR=true)
- [ ] Verify Standard reveal still works (separate path)

**Do not claim success until manual test journey completes.**
