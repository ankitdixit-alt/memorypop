# Plus Reveal Release Checklist

**Date**: 2026-09-27
**Components**: Beta code system + Customer reveal + TESTBETA2026

---

## Pre-Deployment: Environment Variables

### Verify Vercel Settings (Production)
**Location**: https://vercel.com/[project]/settings/environment-variables

**Required Variables**:
1. `ENABLE_AI_DIRECTOR=true` - Enables Groq plan generation
2. `GROQ_API_KEY=[key]` - Groq API key (Free tier)
3. All existing Supabase variables (NEXT_PUBLIC_SUPABASE_URL, etc.)

**Status**: ⚠️ **Cannot verify remotely** - Check Vercel dashboard before deployment

---

## Deployment Steps (In Order)

### 1. Database Migration (Production)
**File**: `PRODUCTION_BETA_CODE_RELEASE.sql`
**Location**: Supabase SQL Editor
**Link**: https://supabase.com/dashboard/project/gvfpgawbvuttglfscngg/sql

**Actions**:
- [ ] Copy entire file contents
- [ ] Paste into SQL Editor
- [ ] Run migration
- [ ] Verify output shows all tables/columns created
- [ ] Check verification queries at bottom pass

**Expected**:
- upgraded_at column added to memorypops
- upgrade_source column added to memorypops
- beta_codes table created with RLS
- beta_code_redemptions table created with RLS

---

### 2. Add TESTBETA2026 Code (Production)
**File**: `PRODUCTION_ADD_TESTBETA2026.sql`
**Location**: Same Supabase SQL Editor

**Actions**:
- [ ] Copy file contents
- [ ] Paste into SQL Editor
- [ ] Run SQL
- [ ] Verify verification query returns 1 row

**Expected Output**:
```
name: Complimentary Plus Access - TESTBETA2026
active: true
total_redemption_limit: 100
current_redemptions: 0
expires_at: 2027-09-27 23:59:59+00
```

**Code Details**:
- Raw code: `TESTBETA2026` (case-sensitive, no spaces)
- Hash: `56c609a1dd57a590e346fed18fd8fb072edab7140a65ff5bd66a9ff53956f4c0`
- Expiry: September 27, 2027
- Limit: 100 redemptions

---

### 3. Code Deployment (Git + Vercel)
**Files to Commit** (9 files):

**Backend (Database - already run above)**:
1. `migrations/PRODUCTION_BETA_CODE_RELEASE.sql`
2. `PRODUCTION_ADD_TESTBETA2026.sql`

**Backend (API Routes)**:
3. `src/app/api/memorypops/[id]/redeem-beta-code/route.ts`
4. `src/app/api/memorypops/[id]/redeem-beta-code/route.test.ts`

**Backend (Session)**:
5. `src/lib/creatorSession.ts` (MODIFIED)

**Frontend (Dashboard)**:
6. `src/components/DashboardPlusFeatures.tsx` (MODIFIED)

**Frontend (Customer Reveal)**:
7. `src/app/ai-director-reveal/RevealPlayer.tsx` (NEW)
8. `src/app/ai-director-reveal/reveal.module.css` (MODIFIED)
9. `src/app/m/[shareCode]/reveal/AIDirectorRevealController.tsx` (MODIFIED)

**Actions**:
- [ ] `git add` all 9 files
- [ ] `git commit -m "Release: Beta codes + Customer reveal"`
- [ ] `git push origin main`
- [ ] Wait for Vercel deployment (auto-triggers)
- [ ] Check Vercel deployment succeeds

---

### 4. Production Verification (Manual)
**Test Journey**: Dashboard → Enter code → Activate Plus → Open reveal

**URL**: https://memorypop.app/dashboard

**Steps**:
1. [ ] Navigate to creator dashboard with existing gift
2. [ ] Locate Plus upgrade section
3. [ ] Enter code: `TESTBETA2026`
4. [ ] Click "Upgrade to Plus"
5. [ ] **Verify success message**: "Successfully upgraded to MemoryPop Plus!"
6. [ ] **Verify cost**: €0 (no Stripe redirect)
7. [ ] Navigate to reveal page
8. [ ] **Verify Plus reveal loads** (not Standard)
9. [ ] Click through opening → first memory
10. [ ] Click → button to advance between memories
11. [ ] **Verify tile transitions visible** (~0.5s grid effect)
12. [ ] **Verify no developer inspector** in customer reveal
13. [ ] **Verify stable width** (no layout jumps)
14. [ ] **Verify music ducks during video** (if video present)

**Success Criteria**:
- Beta code redeems successfully for €0
- Plus reveal displays with all approved features
- Tile transitions visible between memories
- No prototype elements in customer view
- Layout stable across all scenes

---

## What This Release Includes

### Beta Code System ✅
- Database schema (beta_codes, beta_code_redemptions)
- Upgrade tracking columns (upgraded_at, upgrade_source)
- Redemption API with authorization
- Rate limiting (5 invalid attempts per 15min per IP)
- Atomic redemption (optimistic locking)
- TESTBETA2026 active code (100 uses, expires 2027-09-27)

### Customer Reveal (September 14 Baseline) ✅
- Tile transitions positioned inside .stage
- Decorative overlays (occasion-aware, mobile-disabled)
- Music ducking (0.03 video, 0.12 photos)
- Production audio via audioRef prop
- No developer inspector
- No prototype text
- Stable width (background:transparent)

### Backend Preservation ✅
- Groq plan generation (ENABLE_AI_DIRECTOR flag)
- Plan save/load infrastructure
- Deterministic fallback
- Standard reveal unchanged

---

## Rollback Procedure

### If Beta Code System Fails
**Database**:
```sql
BEGIN;
DROP TABLE IF EXISTS beta_code_redemptions CASCADE;
DROP TABLE IF EXISTS beta_codes CASCADE;
ALTER TABLE memorypops DROP COLUMN IF EXISTS upgraded_at;
ALTER TABLE memorypops DROP COLUMN IF EXISTS upgrade_source;
COMMIT;
```

**Code**: Revert commit or redeploy previous main

### If Customer Reveal Fails
**Code**: Revert commit, previous reveal still works (Standard uses separate path)

---

## Known Limitations

1. **Tile transitions**: Code fixed, visual verification pending
2. **Groq path**: Traced through code, not live end-to-end tested  
3. **Decorations**: Content-safe placement not visually verified
4. **Vercel settings**: Cannot verify ENABLE_AI_DIRECTOR/GROQ_API_KEY remotely

---

## Post-Deployment

After successful production verification:
- [ ] Test TESTBETA2026 with second gift (verify atomic redemption)
- [ ] Monitor error logs for redemption issues
- [ ] Check beta_codes.current_redemptions increments correctly
- [ ] Verify Groq plan generation works (may require first Plus creation)

**Do not claim production works until manual test journey succeeds.**
