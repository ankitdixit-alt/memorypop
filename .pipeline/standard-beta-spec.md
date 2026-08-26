# Standard MemoryPop Beta — Stage Specification
**Product Manager / Architect**
**Date:** 2026-08-16

---

## PRODUCT PRINCIPLE

Standard MemoryPop delivers the complete emotional/cinematic experience.

**Not a deliberately weakened product.**

Premium will later monetize additional customization and capacity, NOT the core reveal magic.

---

## CURRENT STATE AUDIT

### Occasions (7 supported)
Database field: `occasion` (string)

Current keys:
1. `birthday`
2. `wedding`
3. `retirement`
4. `farewell`
5. `graduation`
6. `anniversary`
7. `promotion`

### Atmospheres/Moods (6 available)
Database field: `tone` (string, nullable)

Current keys:
1. `warm_heartfelt` - "Warm & heartfelt" 💕
2. `playful_fun` - "Playful & fun" 🎉
3. `thoughtful_meaningful` - "Thoughtful & meaningful" ✨
4. `joyful_celebratory` - "Joyful & celebratory" 🎊
5. `nostalgic_reflective` - "Nostalgic & reflective" 🌸
6. `simple_classic` - "Simple & classic" 🤍

**Configuration:** `/src/lib/celebrationMood.ts`

### Database Schema
**No migration required.**

Existing `memorypops` table fields sufficient:
- `occasion` → occasion key
- `tone` → atmosphere key

Music will be resolved at runtime from: `occasion + tone → soundtrack`

---

## LOCKED STANDARD ENTITLEMENTS

### Creator
- Choose occasion
- Choose atmosphere (from occasion-appropriate subset)
- Add personal message
- Invite contributors

### Contributor (per memory)
- Message (required)
- Up to 3 photos
- Up to 1 **curated GIF** (NOT arbitrary upload)
- Up to 1 video (≤15 seconds)

Entitlements are independent (not exclusive).

### Recipient Experience Modes
**All three belong to Standard:**

1. **Cinematic Experience**
   - Soundtrack (occasion + atmosphere → curated track)
   - Automatic progression
   - Content-aware pacing
   - Cinematic transitions

2. **Manual Memory Experience**
   - Swipe, Next, Previous
   - Recipient controls pacing
   - Same content as cinematic

3. **Memory Wall**
   - Browse all memories
   - Click to open DetailModal
   - Revisit anytime

---

## ARCHITECTURE DECISIONS

### 1. Occasion → Atmosphere Configuration

**Pattern:**
```typescript
occasionConfig[occasion] = {
  atmospheres: CelebrationMood[],
  recommendedAtmospheres?: CelebrationMood[]
}
```

**Implementation location:** New file `/src/lib/occasionExperience.ts`

**Beta Configuration:**

| Occasion | Available Atmospheres | Notes |
|----------|----------------------|-------|
| birthday | All 6 | Universal appropriateness |
| wedding | warm_heartfelt, thoughtful_meaningful, joyful_celebratory, nostalgic_reflective, simple_classic | Exclude playful_fun |
| anniversary | warm_heartfelt, thoughtful_meaningful, nostalgic_reflective, simple_classic | Focus on heartfelt/reflective |
| graduation | joyful_celebratory, thoughtful_meaningful, nostalgic_reflective, simple_classic | Celebratory + reflective |
| promotion | joyful_celebratory, thoughtful_meaningful, simple_classic | Professional + celebratory |
| retirement | thoughtful_meaningful, nostalgic_reflective, joyful_celebratory, simple_classic | Reflective + celebratory |
| farewell | thoughtful_meaningful, nostalgic_reflective, warm_heartfelt, simple_classic | Exclude playful/celebratory |

**Rationale:**
- Birthday: Universal - all atmospheres appropriate
- Wedding/Anniversary: Exclude overtly playful
- Farewell/Retirement: Exclude playful, focus on meaningful/reflective
- Graduation/Promotion: Balance celebration with thoughtfulness

### 2. Occasion + Atmosphere → Soundtrack

**Pattern:**
```typescript
soundtrackConfig[occasion][atmosphere] = {
  track: string,          // asset path or URL
  title: string,          // for attribution
  artist?: string,
  license?: string        // for tracking
}
```

**Implementation location:** Same file `/src/lib/occasionExperience.ts`

**Beta Soundtrack Mapping:**

For beta, use **simplified soundtrack groupings** to avoid overbuild:

| Soundtrack ID | Occasions | Atmospheres | Asset |
|---------------|-----------|-------------|-------|
| warm_acoustic | birthday, anniversary, farewell | warm_heartfelt, thoughtful_meaningful, nostalgic_reflective | TBD (royalty-free warm acoustic) |
| upbeat_celebration | birthday, graduation, promotion | joyful_celebratory, playful_fun | TBD (royalty-free upbeat) |
| elegant_orchestral | wedding, anniversary, retirement | warm_heartfelt, thoughtful_meaningful | TBD (royalty-free elegant) |
| gentle_piano | farewell, retirement | nostalgic_reflective, simple_classic | TBD (royalty-free gentle piano) |
| simple_strings | ALL occasions | simple_classic | TBD (royalty-free minimal strings) |

**Fallback:** If specific mapping missing, use `simple_strings` as universal fallback.

**Asset Requirements:**
- Royalty-free or owned
- Licensed for commercial use
- Loopable (seamless or natural fade)
- ~2-4 minutes minimum duration
- Document source and license

**Asset Storage:** `/public/soundtracks/` or CDN

### 3. Curated GIF Library

**Pattern:**
```typescript
curatedGifs = [
  {
    id: string,
    url: string,
    category: 'birthday' | 'celebration' | 'love' | 'funny' | 'gratitude' | 'congrats',
    thumbnail?: string,
    occasions?: string[]  // future: occasion filtering
  }
]
```

**Implementation location:** New file `/src/lib/curatedGifs.ts`

**Beta GIF Library (4–8 options):**
1. Birthday celebration (animated cake/confetti)
2. Heart/love (animated hearts)
3. Funny/playful (animated laughter/emoji)
4. Thank you (animated thank you text)
5. Congratulations (animated trophy/star)
6. General celebration (animated party)
7. Nostalgic (animated vintage film/memory)
8. Simple elegant (minimal animated graphic)

**Source:** Free GIF platforms (Giphy API, tenor, or owned assets)

**Storage:** Supabase Storage or CDN URLs

**UX Requirements:**
- Animated preview (not static thumbnail)
- Click/tap to select
- Visual selected state
- Max 1 selection
- Change selection allowed
- Remove selection allowed
- Mobile-friendly grid (2 columns at 390px)

---

## IMPLEMENTATION SCOPE

### Phase 1: Architecture & Configuration ✅

**Files to create:**
1. `/src/lib/occasionExperience.ts`
   - Occasion → atmospheres mapping
   - Occasion + atmosphere → soundtrack mapping
   - Export `getOccasionConfig(occasion)`
   - Export `getSoundtrack(occasion, atmosphere)`

2. `/src/lib/curatedGifs.ts`
   - Beta curated GIF library (4–8 options)
   - Export `CURATED_GIFS`
   - Export `getCuratedGifs(occasion?)` for future filtering

**Files to modify:**
- Creator atmosphere selection screen
  - Read occasion from state
  - Filter available atmospheres using `getOccasionConfig(occasion)`
  - Display only occasion-appropriate atmospheres

### Phase 2: Curated GIF Picker ✅

**Component to create:**
- `/src/components/contribute/CuratedGifPicker.tsx`
  - Grid layout (2 cols mobile, 3-4 cols desktop)
  - Animated GIF previews
  - Click to select
  - Visual selected state
  - Max 1 selection
  - Remove button

**Files to modify:**
- `/src/components/contribute/ContributeForm.tsx` or equivalent
  - Replace "Choose GIF File" with curated picker
  - Remove arbitrary GIF file upload
  - Store selected curated GIF in state
  - Upload flow: curated GIF URL → `/api/upload` → Supabase Storage copy or direct JSONB storage

**API consideration:**
- Option A: Copy curated GIF to Supabase Storage per contribution
- Option B: Store curated GIF URL directly in JSONB (simpler, acceptable for beta)
- **Decision:** Option B for beta (simpler, curated GIFs are stable URLs)

### Phase 3: Cinematic Reveal Experience ✅

**Component to create/modify:**
- `/src/components/premium-reveal/RevealExperience.tsx` (exists, needs Standard support)
  - Or create new `/src/components/reveal/CinematicReveal.tsx`
  - Soundtrack playback (based on occasion + atmosphere)
  - Auto-progression with content-aware timing
  - Smooth transitions
  - Video/music interaction (audio ducking)

**Pacing Rules (pragmatic beta):**

| Content Type | Dwell Time | Notes |
|--------------|------------|-------|
| Text-only | 8-12s | Based on message length |
| Short message + photo | 10-15s | Reading time + viewing |
| Long message + photo | 15-20s | Extended reading time |
| Multiple photos | +3s per photo | Allow viewing each |
| GIF | 12-18s | Allow animation loop 2-3x |
| Video (playing) | No auto-advance | Wait for user pause/end |
| Video (paused) | Continue dwell timer | Standard timing |

**Audio Ducking:**
- Video plays → Soundtrack ducks to 15-25% volume
- Video pauses/ends/switches → Soundtrack restores to 100%
- Smooth volume transitions (0.5-1s fade)

**Manual Override:**
- User swipes/clicks Next → Reset timing, respect manual control
- User clicks Previous → Standard timing resumes
- Cinematic mode and manual controls coexist

### Phase 4: Memory Wall Bug Fix ✅

**Investigation required:**
1. Trace end-to-end flow:
   - ContributeForm → /api/upload → /api/memories → Supabase
   - Memory Wall query → MemoryCard render → DetailModal
2. Identify root cause:
   - JSONB data not persisted?
   - Query not selecting JSONB fields?
   - MemoryCard not rendering new JSONB?
   - Representative media logic broken?

**Fix requirements:**
- Newly submitted contribution must be immediately visible on Memory Wall
- Representative media priority:
  1. First photo (if photos exist)
  2. Curated GIF (if no photos)
  3. Video thumbnail/poster (if no photos/GIF)
  4. Text-only card treatment
- Media count indicator: Subtle badge showing total media items

**Files likely involved:**
- `/src/components/memory-experience/MemoryCard.tsx`
- `/src/components/memory-experience/GalleryView.tsx`
- Page component fetching memories

### Phase 5: DetailModal Verification ✅

**Requirements:**
- Display all content: message, photos, GIF, video
- Photo layout: 1/2/3 photo compositions
- GIF: Animated display
- Video: HTML5 controls, playable
- Close: Button, ESC, backdrop click
- Responsive: Desktop and mobile (390px)

**Files:**
- `/src/components/memory-experience/DetailModal.tsx` (already exists)

**Test:** Verify complete multimedia contribution displays correctly

### Phase 6: Realistic Test Fixture ✅

**Requirements:**
- Create birthday MemoryPop for "Alex"
- 3 contributors/memories minimum
- **Working media assets** (no broken placeholders)
- At least one memory with maximum media (3 photos + GIF + video)
- Natural emotional messages (not test documentation)

**Example memories:**

**Memory 1:** Photo story (2-3 photos)
**Memory 2:** GIF + lighter message
**Memory 3:** Maximum media (3 photos + curated GIF + 15s video)

**Script location:** `/scripts/create-realistic-fixture.mjs`

### Phase 7: Testing Requirements ✅

**Automated:**
- Video validation: 14s/15s/16s/corrupt (re-run)
- HMAC security: All 7 tamper scenarios (execute for first time)

**Browser/Manual:**
- Contributor flow scenarios (9 test cases)
- Creator atmosphere selection (occasion-aware)
- Cinematic reveal (with real media + music)
- Manual reveal (swipe, Next, Previous)
- Memory Wall (representative media)
- DetailModal (complete multimedia)
- Ending sequence (FinalScreen → ReactionPrompt)

**Mobile 390px:**
- Creator: atmosphere cards fit
- Contributor: curated GIF picker, photo upload, video
- Cinematic: readable, stable, music works
- Manual: swipe works
- Memory Wall: cards usable

---

## OUT OF SCOPE (Do NOT implement)

- ❌ Premium custom music upload
- ❌ Premium music selection UI
- ❌ Premium custom GIF upload
- ❌ Premium capacity increases
- ❌ Premium pricing changes
- ❌ Stripe/checkout modifications
- ❌ Demo redesign
- ❌ Video duration changes
- ❌ Photo limit changes

---

## ACCEPTANCE CRITERIA

### Product Quality (Judge evaluation)
- [ ] Cinematic reveal feels intentional and emotional (not slideshow software)
- [ ] Pacing feels human (not robotic fixed timings)
- [ ] Soundtrack enhances experience (not distracting)
- [ ] Photo composition feels curated (not boring grid)
- [ ] Curated GIF picker feels polished (not technical file input)
- [ ] Media selector (if present) feels warm (not tabs/buttons)
- [ ] Memory Wall representative media immediately recognizable
- [ ] Overall experience meets "I want to create one" bar

### Technical Requirements (Reviewer evaluation)
- [ ] Occasion → atmosphere configuration extensible
- [ ] Soundtrack mapping clean and replaceable
- [ ] Audio lifecycle managed correctly
- [ ] Video ducking smooth
- [ ] JSONB multimedia persisted correctly
- [ ] Memory Wall bug root cause identified and fixed
- [ ] Backwards compatibility preserved
- [ ] No Premium functionality leaked

### Testing (Tester verification)
- [ ] Build passes (`npm run build`)
- [ ] Video validation: all 4 scenarios PASS
- [ ] HMAC security: all 7 scenarios PASS
- [ ] Contributor flow: all 9 scenarios PASS
- [ ] Cinematic reveal: functional with music
- [ ] Manual reveal: swipe/Next/Previous work
- [ ] Memory Wall: new contributions visible
- [ ] DetailModal: all media displays
- [ ] Ending: FinalScreen → Reaction flow intact
- [ ] Mobile 390px: all critical flows functional

### Founder Visual Approval Required
- [ ] Cinematic reveal at 390px (pacing, music, transitions)
- [ ] Curated GIF picker UX
- [ ] Memory Wall representative media
- [ ] Photo composition (1/2/3 layouts)
- [ ] Overall emotional impact

---

## IMPLEMENTATION HANDOFF TO CODER

**Start here:**
1. Create `/src/lib/occasionExperience.ts` with beta configuration
2. Create `/src/lib/curatedGifs.ts` with 4–8 GIFs
3. Source/document royalty-free soundtrack assets
4. Modify creator atmosphere selection to filter by occasion
5. Implement curated GIF picker component
6. Investigate and fix Memory Wall bug
7. Implement cinematic reveal with soundtrack + pacing
8. Create realistic test fixture
9. Execute HMAC security tests
10. Rotate VIDEO_VALIDATION_SECRET

**Branch strategy:**
Work in current branch (no deployment yet)

**Testing strategy:**
Coder → Tester (automated + browser) → Judge (UX) → Reviewer (architecture) → Founder (visual approval)

---

**Specification complete. Ready for Coder implementation.**
