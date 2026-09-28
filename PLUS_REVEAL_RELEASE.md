# Plus Reveal Manual Release

**Date**: 2026-09-27
**Status**: Ready for manual release (beta code system + customer reveal)

---

## Deployment Status Evidence

### Already Deployed to Production ✅
**Commit**: 69eae7b "Deploy AI Director to production"

**Includes**:
- AI reveal plans table (migrations/012-015)
- PRODUCTION_AI_DIRECTOR_MIGRATION.sql
- Groq generation infrastructure
- Plan save/load endpoints
- prepareRevealPlan.ts, revealPlanService.ts
- RevealExperience.tsx (Plus wrapper)
- page.tsx (reveal page with Plus detection)

**Evidence**: Git log shows these files committed in 69eae7b.

---

### NOT Deployed (Pending Manual Release) ⚠️

#### Beta Code System
**Status**: Complete, uncommitted

**Files**:
1. migrations/016_add_beta_codes.sql
2. migrations/017_fix_beta_codes_rls.sql
3. migrations/PRODUCTION_BETA_CODE_RELEASE.sql
4. src/app/api/memorypops/[id]/redeem-beta-code/ (API + tests)
5. src/lib/creatorSession.ts (MODIFIED)
6. src/components/DashboardPlusFeatures.tsx (MODIFIED)

**Evidence**: Git status shows migrations and API route as untracked (??), session/dashboard as modified (M).

#### Customer Reveal Presentation
**Status**: Complete, uncommitted

**Files**:
1. src/app/ai-director-reveal/RevealPlayer.tsx (NEW)
2. src/app/ai-director-reveal/reveal.module.css (MODIFIED)
3. src/app/m/[shareCode]/reveal/AIDirectorRevealController.tsx (MODIFIED)
4. src/app/ai-director-reveal/RevealPreview.tsx (MODIFIED)

**Evidence**: Git status shows RevealPlayer.tsx as untracked (??), others as modified (M).

---

## Complete File List for Manual Release

### Backend (Database)
1. **migrations/PRODUCTION_BETA_CODE_RELEASE.sql**
   - Creates beta_codes table with RLS
   - Adds upgraded_at column to memorypops
   - Idempotent (checks for existing structures)
   - **Manual step**: Run via Supabase SQL Editor

### Backend (API Routes)
2. **src/app/api/memorypops/[id]/redeem-beta-code/route.ts**
   - POST endpoint for code redemption
   - Authorization via management token
   - Validates code, checks usage, upgrades gift

3. **src/app/api/memorypops/[id]/redeem-beta-code/route.test.ts**
   - Test coverage for redemption flow

### Backend (Session & State)
4. **src/lib/creatorSession.ts** (MODIFIED, +22 lines)
   - Beta code redemption integration
   - Session state management

### Frontend (Dashboard)
5. **src/components/DashboardPlusFeatures.tsx** (MODIFIED, +120 lines)
   - Beta code redemption UI
   - Plus upgrade form
   - Success/error messaging

### Frontend (Customer Reveal)
6. **src/app/ai-director-reveal/RevealPlayer.tsx** (NEW FILE)
   - Customer presentation component
   - Tile transitions inside .stage (line 252)
   - Decorative overlays (lines 255-263)
   - Music ducking 0.03/0.12 (lines 166-197)
   - Production audio via audioRef (line 47)
   - No developer inspector or prototype text

7. **src/app/ai-director-reveal/reveal.module.css** (MODIFIED)
   - Line 2: .app { background:transparent; } (stable width fix)

8. **src/app/m/[shareCode]/reveal/AIDirectorRevealController.tsx** (MODIFIED)
   - Line 143: Passes audioRef to RevealPlayer
   - Converts memories to Story format

9. **src/app/ai-director-reveal/RevealPreview.tsx** (MODIFIED)
   - Developer preview component (prototype only, not customer-facing)

---

### Shared Dependencies (Already Deployed) ✅
- src/app/ai-director-reveal/prototype.ts
- src/app/ai-director-reveal/usePlayback.ts
- src/app/ai-director-reveal/PreviewMedia.tsx
- src/app/ai-director-reveal/TileTransition.tsx
- src/components/DecorativeOverlay.tsx
- src/config/decorations.ts
- src/lib/ai/planAdapter.ts
- src/lib/premiumEntitlement.ts

---

## Code Verification (Read-Only) ✅

### Groq Integration Path
**Flow**: page.tsx → loadRevealPlan → database read-only

1. Premium detection: hasPremiumAccess(memoryPop) (page.tsx:103)
2. Plan loading: loadRevealPlan(memoryPopId, memories) (page.tsx:119)
   - Retrieves from ai_reveal_plans table
   - Never calls Groq
   - Validates against current memories
3. Deterministic fallback: generateDeterministicRevealPlan() (page.tsx:124)
   - Runs when no valid plan exists
   - Production-capable, no API calls
4. Player consumption: buildBeats(story, mode) (RevealPlayer.tsx:49)
   - Converts saved plan to timeline
   - Triggers tile transitions on beat changes

**Verification**: Code paths traced, not live-tested.

---

### September 14 Baseline Restoration
| Component | Code Status | Visual Status |
|-----------|------------|---------------|
| Tile transitions | ✅ Fixed (line 252) | ⚠️ Unverified |
| Decorative overlays | ✅ Preserved | ⚠️ Unverified |
| Music ducking | ✅ Preserved | ⚠️ Unverified |
| Production audio | ✅ Preserved | ⚠️ Unverified |
| Customer integration | ✅ Fixed | ⚠️ Unverified |
| Stable width | ✅ Preserved | ⚠️ Unverified |

**Tile Transition Fix**:
- Issue: Positioned outside .stage, invisible
- Fix: Moved to line 252 inside .stage with all props
- Status: Code change complete, visual verification pending

---

## Manual Validation Checklist

### Local Testing (Before Release)
Environment: npm run test:dev (memorypop-test database)
URL: http://localhost:3000/m/beta-test-498303/reveal

- [ ] Navigate through opening → first memory
- [ ] Click → button to advance between memories
- [ ] Tile transitions visible (~0.5s grid effect, staggered)
- [ ] No developer inspector in customer reveal
- [ ] Stable width (no layout jumps between scenes)
- [ ] Music ducks during video (quieter than photos)
- [ ] Test desktop viewport (decorations enabled)
- [ ] Test mobile viewport (<850px, decorations disabled)

### Production Deployment Steps
1. Database: Run migrations/PRODUCTION_BETA_CODE_RELEASE.sql via Supabase SQL Editor
2. Verify: Check beta_codes table exists with RLS policies
3. Code: Commit all 9 files listed above
4. Deploy: Push to main (Vercel auto-deploys)
5. Test: Verify production Plus reveal with beta code
6. Validate: Manual test of tile transitions and layout

---

## Known Limitations

1. Tile transitions: Code fixed, requires browser verification
2. Groq path: Traced through code, not live end-to-end tested
3. Beta codes: Tested on memorypop-test, not production database
4. Decorations: Content-safe placement not visually verified

---

## Rollback Plan

### Database
Run migration rollback from PRODUCTION_BETA_CODE_RELEASE.sql:
- DROP TABLE beta_codes
- ALTER TABLE memorypops DROP COLUMN upgraded_at

### Code
Revert commit or deploy previous main branch state.

---

## Summary

Backend: Beta code system complete, migration file ready (not yet deployed)
Frontend: Customer reveal restored to September 14 baseline
Verification: Code paths traced, visual verification pending
Deployment: Manual database migration + Git commit (9 files) + Vercel deploy

All files uncommitted and ready for manual release.
