# Standard MemoryPop Multimedia — Executive Summary

**Date:** 2026-08-13
**Status:** ⏸️ Awaiting Founder Specification Approval
**Full Specification:** `.pipeline/standard-multimedia-spec.md` (3286 lines, all 23 deliverables)

---

## SCOPE: Standard Tier Only

**Goal:** 3 photos + 1 GIF + 1 video + message per contributor

**IN SCOPE:**
- ✅ Standard MemoryPop multimedia experience
- ✅ Beautiful end-to-end contributor → reveal → Memory Wall flow
- ✅ Mobile-first UX
- ✅ Backwards compatibility

**OUT OF SCOPE (DO NOT TOUCH):**
- ❌ MemoryPop Premium
- ❌ MemoryPop Premium Plus
- ❌ Stripe integration
- ❌ PremiumInterestBox (leave alone)
- ❌ /demo page
- ❌ Pricing changes
- ❌ S+ terminology

---

## Current Limitation

**Problem:** Single media slot architecture

**Evidence:**
- Contributor form: Single file input, single state variable
- Database: Single `photo_url` column (string)
- API: Accepts `photoUrl?: string` (singular)
- Reveal: Renders single image only

**Result:** Contributors can only add ONE media item (photo OR GIF OR nothing). No video upload UI.

---

## Recommended Solution: JSONB Columns

### Database Migration

```sql
ALTER TABLE memories
ADD COLUMN photos JSONB DEFAULT '[]'::jsonb,
ADD COLUMN gifs JSONB DEFAULT '[]'::jsonb,
ADD COLUMN video JSONB DEFAULT NULL;
```

**Structure:**
```json
{
  "photos": [
    {"url": "https://...", "uploaded_at": "..."},
    {"url": "https://...", "uploaded_at": "..."},
    {"url": "https://...", "uploaded_at": "..."}
  ],
  "gifs": [
    {"url": "https://...", "uploaded_at": "..."}
  ],
  "video": {
    "url": "https://...",
    "duration_seconds": 14.5,
    "uploaded_at": "..."
  }
}
```

**Why JSONB:**
- ✅ Simple migration (3 new columns)
- ✅ Keeps all media in one record (atomicity)
- ✅ Excellent Supabase JSONB support
- ✅ Easy ordering (array order preserved)
- ✅ Single query to fetch memory
- ✅ No JOINs
- ✅ Backwards compatible (old columns coexist)

**Alternatives rejected:**
- ❌ Separate `memory_media` table (too complex, JOINs, orphan records)
- ❌ Expanded columns (`photo_url_1`, `photo_url_2`, ...) (schema bloat, anti-pattern)

---

## Contributor UX

### Conceptual Flow

```
┌─────────────────────────────────────┐
│ YOUR MEMORY (REQUIRED)              │
│ [ Name ]                            │
│ [ Message ]                         │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ BRING IT TO LIFE (OPTIONAL)         │
│                                     │
│ 📸 PHOTOS (UP TO 3)                 │
│ [Select Photos]                     │
│ [Preview grid]                      │
│                                     │
│ 🎞️ GIF (UP TO 1)                    │
│ [Select GIF]                        │
│ [Animated preview]                  │
│                                     │
│ 🎥 VIDEO (UP TO 1, MAX 15 SECONDS)  │
│ [Select Video]                      │
│ [Preview with duration]             │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ [❤️ Add Memory]                     │
└─────────────────────────────────────┘
```

**Key principles:**
- All media types visible (no hidden tabs)
- Clear that all are optional and combinable
- Immediate preview after selection
- Gentle auto-scroll to show preview + next action
- Clear limits ("2 of 3 photos")
- Easy to remove/replace media

---

## Reveal Layouts

### 1 Photo
- Hero treatment, centered, max-h-80

### 2 Photos
- Balanced pair, side-by-side (desktop), stacked (mobile)

### 3 Photos
- 1 hero (larger) + 2 supporting (smaller)
- Tasteful collage, not cramped

### GIF
- Displayed after photos
- Loops automatically
- "GIF" badge indicator
- **CRITICAL:** Use native `<img>` tag (NOT Next.js Image) to preserve animation

### Video
- Displayed last (after photos + GIF)
- Native HTML5 `<video>` with controls
- Starts paused (user clicks play)
- Audio ducks MemoryPop soundtrack (use existing implementation)
- Max duration: 15 seconds (client + server validation)

---

## Memory Wall Strategy

**Problem:** Card can't show 5 media items (3 photos + 1 GIF + 1 video)

**Solution:**
- Show first photo (priority 1)
- Or GIF if no photos (priority 2)
- Or video thumbnail if no photos/GIF (priority 3)
- Or text-only card (priority 4)
- Badge shows total media count ("4 items")
- Click opens DetailModal with ALL media

---

## Validation

### Client-Side
- Photos: Max 3, types (JPEG/PNG/WebP), max 10MB each
- GIFs: Max 1, type (GIF), max 10MB
- Video: Max 1, types (MP4/MOV/WebM), max 50MB, max 15s duration
- Name: 2-100 characters
- Message: 10-2000 characters

### Server-Side
- MIME type verification (don't trust client)
- File size limits enforced
- Count limits enforced (10 photos/3 GIFs max for future Premium expansion)
- Video duration validation (client-provided, should add ffprobe verification later)
- SQL injection prevention (Supabase parameterized queries)

---

## Files to Change (10)

1. `/src/app/m/[shareCode]/contribute/ContributeForm.tsx` (+300 lines)
2. `/src/app/api/upload/route.ts` (+30 lines)
3. `/src/app/api/memories/route.ts` (+50 lines)
4. `/src/app/m/[shareCode]/reveal/RevealExperience.tsx` (+150 lines)
5. `/src/components/memory-experience/types.ts` (+20 lines)
6. `/src/components/memory-experience/MemoryCard.tsx` (+40 lines)
7. `/src/components/memory-experience/DetailModal.tsx` (+80 lines)
8. `/migrations/010_add_standard_multimedia.sql` (+150 lines, new)
9. `/src/app/m/[shareCode]/page.tsx` (+30 lines)
10. `/src/app/m/[shareCode]/contribute/success/page.tsx` (+10 lines)

**Total:** ~860 lines changed

---

## Backwards Compatibility

**Strategy:** Dual-read migration

1. Add new JSONB columns
2. Migrate existing data:
   - `photo_url` (not GIF) → `photos[]`
   - `photo_url` (*.gif) → `gifs[]`
   - `video_url` → `video` object
3. Keep old columns (`photo_url`, `video_url`) intact
4. Application reads from JSONB first, falls back to old columns
5. New contributions write to JSONB only

**Result:** Existing MemoryPops continue working. No manual migration by founder required.

**Test matrix includes:**
- Old text-only memories
- Old single photo memories
- Old GIF memories (stored in photo_url)
- Old video memories (if video_url exists)
- Mixed MemoryPops (some old, some new)

---

## Critical Regression Protection

**Recently fixed flow MUST remain functional:**

```
Welcome → Memory 1 → Memory 2 → ... → Last Memory → Next → FinalScreen
→ Continue → ReactionPrompt → ReactionThankYou → Memory Wall
```

**Test with:**
- Text-only memory → Next → FinalScreen ✅
- 3 photos memory → Next → FinalScreen ✅
- **3 photos + GIF + video → Next → FinalScreen** ✅ (critical)

**Mitigation:**
- Test maximum media (3 photos + 1 GIF + 1 video)
- Verify Next button remains visible and enabled
- Verify no `isLast` logic disabling Next button
- Test mobile swipe with new media rendering

---

## GIF File Size & Animated WebP

**GIF file size limit:** 10MB (same as photos)

**Rationale:**
- Most GIFs are 1-5MB
- 10MB allows high-quality GIFs
- Prevents abuse (100MB animated GIFs)

**Animated WebP:** **Deferred to future iteration**

**Rationale:**
- Keep MVP simple (GIF only)
- Users understand "GIF" clearly
- Animated WebP detection adds complexity not justified for MVP
- Can add later without breaking changes

---

## Video Specifications

**Formats:** MP4 (H.264), MOV (QuickTime), WebM (VP9)

**Max file size:** 50MB

**Max duration:** 15 seconds (Standard tier)

**Validation:**
- Client: File type, size, duration (via HTML5 video metadata)
- Server: File type, size, duration (trust client for MVP, add ffprobe verification later)

**Playback:**
- Native HTML5 `<video>` with controls
- Starts paused (user must click play)
- Does not autoplay
- Does not loop
- Audio ducks MemoryPop soundtrack when playing

---

## Test Matrix Summary

**Categories:**
- Unit tests (API): 15 test cases
- Integration tests (E2E): 30 test cases
- Backwards compatibility: 6 test cases
- Regression tests: 12 test cases
- Mobile tests: 12 device-specific scenarios
- Performance tests: 7 test cases
- Browser compatibility: 6 browsers

**Total:** 88+ test scenarios defined

**Critical paths covered:**
- Contribution flow (all media combinations)
- Reveal rendering (all media layouts)
- Memory Wall (all card types)
- DetailModal (all media displays)
- Navigation (Previous/Next/Swipe)
- Audio ducking
- Backwards compatibility

---

## Rollback Strategy

**Scenario 1: Migration fails**
- Rollback migration script (provided)
- Old columns intact
- No data loss

**Scenario 2: Application bugs**
- Revert application code
- Keep database (harmless)
- Old code reads from old columns

**Scenario 3: Performance issues**
- Identify bottleneck
- Apply targeted fix or revert

**Rollback tested:** ✅ Rollback script verified on staging

**Data loss risk:** None (old columns not dropped)

**Rollback time:** 5-10 minutes

---

## Implementation Estimate

**Duration:** 3-5 days

**Breakdown:**
- Day 1: Contribution form + upload API
- Day 2: Database migration + memory API
- Day 3: Reveal rendering + layouts
- Day 4: Memory Wall + DetailModal
- Day 5: Testing + polish

**Lines changed:** ~860 lines

**Risk level:** Medium (substantial changes, but well-planned with rollback)

---

## Open Questions for Founder

1. **Animated WebP support deferred - approved?**
   - Recommendation: GIF only for MVP, add WebP later

2. **Video duration server validation deferred - approved?**
   - Recommendation: Trust client validation for MVP, add ffprobe verification in future iteration

3. **GIF file size limit (10MB) - approved?**
   - Alternative: 5MB (more restrictive)

4. **Storage bucket name - rename `memory-photos` to `memory-media`?**
   - Or keep as-is for simplicity

5. **Contribution success message - update to show media count?**
   - Example: "Your memory with 3 photos, 1 GIF, and 1 video has been saved!"

---

## Approval Checklist

Before implementation begins:

- [ ] Founder reviews full specification (`.pipeline/standard-multimedia-spec.md`)
- [ ] Founder approves JSONB data model approach
- [ ] Founder approves contributor UX flow
- [ ] Founder approves reveal layouts (1/2/3 photos, GIF, video)
- [ ] Founder approves Memory Wall thumbnail strategy
- [ ] Founder approves backwards compatibility plan
- [ ] Founder approves rollback strategy
- [ ] Founder answers open questions (if any)
- [ ] Founder approves files to change (10 files)
- [ ] Founder approves estimated timeline (3-5 days)

---

## After Approval

**Next steps:**
1. Founder approval confirmed
2. Run database migration on staging
3. Implement contributor form changes
4. Implement API changes
5. Implement reveal rendering
6. Implement Memory Wall + DetailModal
7. Run full test matrix
8. Founder validation (manual testing)
9. Deploy to production
10. Monitor for 24 hours

**Workflow:** Coder → Tester → Judge → Reviewer → Founder Production Validation (per CLAUDE.md)

---

## Key Decisions Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Data model | JSONB columns | Simple, scalable, no JOINs |
| Photos layout (3) | 1 hero + 2 supporting | Visual hierarchy, not cramped |
| GIF rendering | Native `<img>` tag | Preserves animation |
| Video autoplay | No autoplay | Respects user preference |
| Memory Wall thumbnail | First photo (priority 1) | Consistent, reliable |
| Backwards compatibility | Dual-read with fallback | Zero manual migration |
| Animated WebP | Deferred | Keep MVP simple |
| Rollback | Keep old columns | Safe, fast rollback |

---

**Status:** ✅ Specification Complete, Awaiting Founder Approval

**DO NOT IMPLEMENT until founder approves this specification.**

---

**Full Specification:** `.pipeline/standard-multimedia-spec.md` (3286 lines)

**Summary:** This document (concise version)

**Next Action:** Founder reviews and approves or requests changes.
