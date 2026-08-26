# Standard MemoryPop Multimedia — Progress

**Date:** 2026-08-13
**Stage:** Specification Complete → **IMPLEMENTATION IN PROGRESS**
**Workflow:** Product Owner (skipped) → Planner ✅ → Founder Approval ✅ → **CODER** → Tester → Judge → Reviewer → Founder Validation

---

## Status: 🚧 IMPLEMENTATION IN PROGRESS

**Founder approval received: "Approved, proceed to implementation"**

**Current stage:** Coder

---

## Implementation Guardrail

### Critical Acceptance Test

**Highest-priority test:** REAL maximum-media Standard contribution

**Test scenario:**
- Long-ish message
- 3 photos
- 1 animated GIF
- 1 × 15-second video
- Mobile width: ~390px

**Recipient must be able to:**
1. ✅ Understand the memory immediately
2. ✅ See the photo composition
3. ✅ Discover that GIF and video exist without explanation
4. ✅ Switch between Photos / GIF / Video naturally
5. ✅ Play video and have soundtrack duck correctly
6. ✅ Return to photos
7. ✅ See/use Next without hunting or excessive scrolling
8. ✅ Move to the next memory normally
9. ✅ Reach FinalScreen → Continue → ReactionPrompt after the last memory

**FAIL conditions:**
- ❌ Media tiny or page visually cramped (even if dimensions technically correct)
- ❌ Media selector feels like "technical UI" instead of emotional experience
- ❌ Navigation requires hunting or excessive scrolling
- ❌ Any regression in recently-fixed reveal ending flow

**Reporting requirement:**
- Distinguish clearly between:
  - ✅ **AUTOMATED/CODE VERIFIED**
  - ⏸️ **FOUNDER VISUAL VALIDATION REQUIRED**

**Do NOT report mobile/reveal PASS based only on:**
- Build passing
- Unit tests passing
- Code inspection
- Calculated dimensions

---

## Approved Specifications

### Summary

**Scope:** Standard MemoryPop multimedia experience
- 3 photos + 1 GIF + 1 video + message per contributor
- Beautiful end-to-end flow (contribute → reveal → Memory Wall)
- Mobile-first (390px priority)
- Backwards compatible

**Data model:** JSONB columns (photos[], gifs[], video)

**Contribution form:**
- All media types visible
- Multi-file upload with previews
- Client-side validation + progress
- Server-side validation (video duration)

**Reveal composition:** Composed memory page
- Main media area (dynamic height based on viewport)
- Compact media selector (chips: Photos · GIF · Video)
- In-place media switching
- Navigation always visible
- Photo collage (1/2/3 layouts)

**Video validation:** Vercel API + get-video-duration
- Server-side 15s enforcement
- Vercel Pro plan required ($20/month)

**Memory Wall:** First photo priority, media count badge

**DetailModal:** Full media display with scrolling

**Backwards compatibility:** Dual-read (JSONB first, fallback to photo_url/video_url)

---

## Implementation Plan

### Phase 1: Foundation (Day 1)
- [ ] Install get-video-duration dependency
- [ ] Database migration (staging)
- [ ] Update types.ts with MediaItem interfaces
- [ ] Create JSONB query utilities

### Phase 2: Upload & Storage (Day 1-2)
- [ ] Update /api/upload route
  - Add Node.js runtime
  - Server-side video validation
  - Error handling with duration info
- [ ] Test video validation (14s pass, 16s fail)
- [ ] Update /api/memories route
  - Accept JSONB structure
  - Insert photos[], gifs[], video

### Phase 3: Contribution Form (Day 2)
- [ ] Rewrite ContributeForm.tsx
  - Multi-media state (photos[], gifs[], video)
  - Upload handlers with progress
  - Preview displays
  - Client-side pre-checks
- [ ] Test all media combinations
- [ ] Test mobile upload flow

### Phase 4: Reveal Composition (Day 3-4)
- [ ] RevealExperience.tsx
  - Dynamic height calculation
  - Main media area
  - Photo collage (1/2/3 layouts)
  - GIF display (native img)
  - Video display (HTML5 video)
  - Audio ducking integration
- [ ] Media selector component
  - Chip-style buttons
  - Active state styling
  - Click handling
  - Fade transitions
- [ ] Test all media combinations
- [ ] **Test maximum-media scenario @ 390px** ⚠️ CRITICAL
- [ ] Verify navigation always visible
- [ ] Verify no regression in reveal ending flow

### Phase 5: Memory Wall & DetailModal (Day 5)
- [ ] Update MemoryCard.tsx
  - Thumbnail priority logic
  - Media count badge
- [ ] Update DetailModal.tsx
  - Full media display
  - Scrolling layout
- [ ] Update Reveal page loader
  - Query JSONB columns
  - Dual-read fallback

### Phase 6: Testing (Day 5-6)
- [ ] Unit tests (API routes)
- [ ] Integration tests (E2E)
- [ ] Backwards compatibility tests
- [ ] Regression tests (reveal ending flow)
- [ ] Mobile tests (390px, 768px, 1920px)
- [ ] Performance tests
- [ ] Browser compatibility
- [ ] **Maximum-media acceptance test** ⚠️ CRITICAL

### Phase 7: Review & Validation (Day 6)
- [ ] Tester validation
- [ ] Judge user acceptance (emotional experience)
- [ ] Reviewer technical review
- [ ] **Founder visual validation** ⚠️ REQUIRED

---

## Files to Change

**9 files, ~1,055 lines:**

1. **ContributeForm.tsx** (+340 lines)
2. **/api/upload/route.ts** (+75 lines) — video validation
3. **/api/memories/route.ts** (+60 lines) — JSONB insert
4. **RevealExperience.tsx** (+220 lines) — composed memory page
5. **types.ts** (+30 lines) — interfaces
6. **MemoryCard.tsx** (+45 lines) — thumbnails
7. **DetailModal.tsx** (+90 lines) — full display
8. **010_add_standard_multimedia.sql** (+160 lines) — migration
9. **Reveal page loader** (+35 lines) — JSONB query

**New dependency:**
- get-video-duration ^4.1.0

---

## Timeline

**Estimated:** 4-6 days

**Current day:** Day 1

**Target completion:** 2026-08-17 to 2026-08-19

---

## Scope Protection

### ✅ IN SCOPE
- Standard MemoryPop multimedia
- Contributor form redesign
- Upload API with video validation
- Database migration
- Reveal composition (composed memory page)
- Memory Wall + DetailModal
- Backwards compatibility
- Full test coverage

### ❌ OUT OF SCOPE (DO NOT TOUCH)
- MemoryPop Premium
- MemoryPop Premium Plus
- S+ terminology
- Stripe integration
- PremiumInterestBox
- /demo page
- Pricing changes

---

## Risk Tracking

**10 risks identified:**

1. ✅ Vercel Pro requirement ($20/month) — Accepted
2. ⏸️ Video upload latency (+5-15s) — Monitor during testing
3. ⏸️ Reveal height calculation — Test across devices
4. ⏸️ Media selector UX — Judge evaluation required
5. ⏸️ Photo collage responsive — Test 390px/768px/1920px
6. ⏸️ Navigation visibility mobile — Critical acceptance test
7. ⏸️ In-place switching polish — Judge evaluation required
8. ⏸️ Audio ducking — Test with video playback
9. ⏸️ Backwards compatibility — Test old memories
10. ⏸️ Reveal ending regression — Test last memory → FinalScreen

---

## Workflow Status

| Stage | Status | Owner |
|-------|--------|-------|
| Product Owner | ✅ Complete | Skipped |
| Planning | ✅ Complete | Planner |
| Founder Spec Approval | ✅ Complete | Founder |
| Founder Feedback (2 rounds) | ✅ Complete | Founder |
| Specification Revisions | ✅ Complete | Planner |
| Final Founder Approval | ✅ Complete | Founder |
| **Implementation** | 🚧 **IN PROGRESS** | **Coder** |
| Testing | ⏸️ Pending | Tester |
| User Acceptance | ⏸️ Pending | Judge |
| Technical Review | ⏸️ Pending | Reviewer |
| Founder Production Validation | ⏸️ Pending | Founder |

---

## Current Phase

**Phase:** Foundation + Upload & Storage (Day 1)

**Next actions:**
1. Install get-video-duration
2. Run database migration on staging
3. Update types.ts
4. Update /api/upload route with video validation
5. Update /api/memories route with JSONB insert
6. Test video validation (14s/16s scenarios)

---

## Critical Path

```
✅ Planning complete
✅ Specification approved (after 2 revision rounds)
✅ Final founder approval received
🚧 Implementation (Day 1 of 4-6)
⏸️ Testing (comprehensive test matrix)
⏸️ Judge approval (emotional experience)
⏸️ Reviewer approval (technical quality)
⏸️ Founder production validation (visual validation)
```

---

## Success Criteria

**Automated verification:**
- ✅ Build passes
- ✅ Unit tests pass
- ✅ API routes validate correctly
- ✅ Database queries work
- ✅ Backwards compatibility works

**Founder visual validation REQUIRED:**
- ⏸️ Maximum-media reveal @ 390px feels spacious, not cramped
- ⏸️ Media selector feels natural, not technical
- ⏸️ Photo collage is aesthetically pleasing
- ⏸️ Navigation clearly discoverable without hunting
- ⏸️ Reveal ending flow works (last memory → FinalScreen → Continue)
- ⏸️ Overall emotional experience matches MemoryPop quality bar

**Do NOT declare SUCCESS without founder visual validation.**

---

**Last Updated:** 2026-08-13
**Stage:** Implementation Day 1
**Current owner:** Coder
**Next checkpoint:** After upload API + video validation complete
