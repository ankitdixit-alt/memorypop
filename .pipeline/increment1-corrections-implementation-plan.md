# Increment 1 - Corrections Implementation Plan
**Date:** 2026-08-16
**Status:** Ready for Implementation

---

## PART G: Old Premium-Reveal Code Reuse/Retirement Plan (continued)

### Files to Retire (Delete)

1. `/src/components/premium-reveal/PremiumRevealExperience.tsx`
   - **Size:** ~800 lines
   - **Reason:** Placeholder data, duplicate implementation
   - **Replacement:** RevealExperience.tsx is canonical

2. `/src/components/premium-reveal/page.tsx`
   - **Reason:** Component-level page (incorrect location)
   - **Replacement:** `/src/app/m/[shareCode]/reveal/page.tsx` exists

### Files to Evaluate for Reuse

1. `/src/components/premium-reveal/RevealControls.tsx`
   - **Purpose:** Playback controls UI (pause, skip, mute, replay)
   - **Decision:** Evaluate visual design
   - **Action:** If good UX, extract as `<RevealPlaybackControls>` shared component
   - **Else:** Use simple controls in RevealExperience

### Files to Modify

1. `/src/components/PremiumChoiceModal.tsx`
   - **Change:** Remove "✨ Premium Experience" badge (line 74)
   - **Change:** Route "Experience" to `/m/[shareCode]/reveal` (canonical)
   - **Keep:** Two-option layout, analytics tracking

2. `/src/app/m/[shareCode]/MemoryPopClient.tsx`
   - **Remove:** 'reveal' mode routing to PremiumRevealExperience
   - **Change:** 'choice' mode routes to canonical RevealExperience
   - **Keep:** 'browse' mode (GalleryView)

### Component Consolidation

**Before:**
```
Landing Choice
├─ Experience → PremiumRevealExperience (fake data)
└─ Browse → GalleryView (real data)

Separate: /reveal → RevealExperience (real data)
```

**After:**
```
Landing Choice
├─ Experience → RevealExperience (real data) ← CANONICAL
└─ Browse → GalleryView (real data)
```

---

## PART H: Final Recipient Routing Diagram

### Landing Experience

**URL:** `/m/[shareCode]`

**Component:** `MemoryPopClient` (mode: 'choice')

**UI:** Two-option choice screen (no Premium badge)

```
┌─────────────────────────────────────────┐
│     [Recipient Name]                    │
│     [Occasion]                          │
│                                         │
│  Your friends created something special │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  ▶ Experience the Celebration   │   │
│  │  Cinematic reveal with music    │   │
│  │  [N] memories · ~2-3 minutes    │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  📖 Browse Memories              │   │
│  │  Explore at your own pace       │   │
│  │  [N] memories to explore        │   │
│  └─────────────────────────────────┘   │
│                                         │
│  💡 You can browse memories after      │
└─────────────────────────────────────────┘
```

### Option A: Experience the Celebration

**Route:** `/m/[shareCode]/reveal`

**Component:** `RevealExperience`

**Features:**
- Real contributor messages
- Real photos from photos[] JSONB
- Real curated GIFs from gifs[] JSONB
- Real videos from video JSONB
- Occasion + atmosphere → soundtrack
- Music lifecycle (loop, mute control)
- Video ducking (20% during video)
- Manual controls: Next, Previous, swipe
- Auto-progression (Increment 2)

**Flow:**
```
Experience Intro Screen
  → Memory 1 (photos/message)
  → Memory 2 (GIF/message)
  → Memory 3 (video/message)
  → ... (all memories)
  → FinalScreen
  → ReactionPrompt
  → ReactionThankYou
```

**Post-Reveal Options:**
- "Revisit Memory Wall" → `/m/[shareCode]?view=browse` (Memory Wall)
- "Replay Reveal" → `/m/[shareCode]/reveal` (restart experience)

### Option B: Browse Memories

**Route:** `/m/[shareCode]?view=browse`

**Component:** `GalleryView` (Memory Wall)

**Features:**
- Grid of memory cards
- Representative thumbnails (photos[0] / gifs[0] / video frame)
- Media count badges
- Click card → DetailModal
- Free browsing, no soundtrack

**DetailModal:**
- All media vertically stacked (photos, GIFs, video)
- Video PAUSED by default, user must press Play
- Full message text
- Close returns to Memory Wall

---

## PART I: Music Lifecycle After Consolidation

### Current State (Increment 1)

**Location:** RevealExperience.tsx (lines 40-130)

**Initialization:**
```typescript
const soundtrack = getSoundtrack(occasion, mood || 'simple_classic');

useEffect(() => {
  if (screen !== 'memories' || !soundtrack) return;

  const audio = new Audio(soundtrack);
  audio.loop = true;
  audio.volume = 0.5; // 50% normal

  audioRef.current = audio;
  // Load and prepare
}, [screen, soundtrack]);
```

**Playback control:**
```typescript
useEffect(() => {
  if (!audioRef.current || !isAudioReady || screen !== 'memories') return;

  audioRef.current.play().catch(err => {
    console.error('Playback failed:', err);
  });

  return () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };
}, [isAudioReady, screen]);
```

**Mute control:**
```typescript
const [isMuted, setIsMuted] = useState(false);

useEffect(() => {
  if (!audioRef.current) return;
  audioRef.current.volume = isMuted ? 0 : 0.5;
}, [isMuted]);
```

**Video ducking:**
```typescript
const handleVideoDuck = () => {
  if (!audioRef.current || isMuted) return;
  audioRef.current.volume = 0.2; // Duck to 20%
};

const handleVideoRestore = () => {
  if (!audioRef.current || isMuted) return;
  audioRef.current.volume = 0.5; // Restore to 50%
};

// Passed to MemoryScreen:
<MemoryScreen
  onVideoDuck={handleVideoDuck}
  onVideoRestore={handleVideoRestore}
  onMuteToggle={() => setIsMuted(!isMuted)}
  isMusicMuted={isMuted}
/>
```

### Problem: Music Not Heard

**Founder observation:** "Founder did not hear music in the expected initial reveal/manual experience."

**Possible causes:**
1. Audio element created but not mounted/played
2. Soundtrack path incorrect
3. Browser autoplay policy blocked audio
4. Volume set to 0 accidentally
5. Routing issue (music attached to wrong screen)

**Investigation needed:**
- Check if audioRef.current is populated
- Check if soundtrack file exists at path
- Check browser console for autoplay errors
- Verify screen state when music should play
- Check if isAudioReady ever becomes true

### Fix Required

**Root cause diagnosis:**
1. Add console.log to track audio lifecycle:
   - "Audio element created"
   - "Audio ready (canplaythrough)"
   - "Audio play() called"
   - "Audio play() succeeded"
   - "Audio play() failed: [error]"

2. Verify soundtrack file exists:
   - Check `/public/soundtracks/*.mp3` files
   - Verify path resolution

3. Check browser autoplay policy:
   - Music must start from user gesture
   - "Open My MemoryPop" button click counts as gesture
   - Verify screen transition happens AFTER click

**Expected behavior after fix:**
- User clicks "Open My MemoryPop" → music starts audibly
- Music loops continuously during experience
- Mute button (speaker icon) visible and functional
- Video plays → music ducks to 20%
- Video pauses → music restores to 50%

### Mute Control Clarity

**Current:** Speaker icon button (top-left of MemoryScreen)

**Founder concern:** "A speaker icon appeared, but its purpose was unclear."

**Improvement:** Add accessible label/tooltip
```typescript
<button
  onClick={onMuteToggle}
  className="..."
  aria-label={isMusicMuted ? "Unmute music" : "Mute music"}
  title={isMusicMuted ? "Unmute music" : "Mute music"} // Tooltip
>
  {isMusicMuted ? <MutedIcon /> : <UnmutedIcon />}
</button>
```

**Consider:** Small "Music" text label below icon on first use

---

## PART J: Browser Test Results (Pending Implementation)

**Format:** Will be populated after corrections implemented

### Test Scenarios

**1. CREATOR - Standard Multimedia**
- [ ] Navigate to /create
- [ ] Step 2: Verify photo upload (up to 3)
- [ ] Step 2: Verify curated GIF picker visible
- [ ] Step 2: Verify video upload (≤15s validation)
- [ ] Submit MemoryPop
- [ ] Verify creator's multimedia saved to memories table
- [ ] Verify creator appears as first memory in Memory Wall

**2. SYMPATHY - Appropriate Atmospheres**
- [ ] Navigate to /create
- [ ] Select Sympathy occasion
- [ ] Proceed to atmosphere selection
- [ ] Verify 4 atmospheres visible:
  - warm_heartfelt
  - thoughtful_meaningful
  - nostalgic_reflective
  - simple_classic
- [ ] Verify playful_fun NOT visible
- [ ] Verify joyful_celebratory NOT visible

**3. FAREWELL - Appropriate Atmospheres**
- [ ] Select Farewell occasion
- [ ] Verify 4 atmospheres visible:
  - thoughtful_meaningful
  - nostalgic_reflective
  - warm_heartfelt
  - simple_classic

**4. DETAIL MODAL - Video Autoplay Fixed**
- [ ] Navigate to Memory Wall
- [ ] Click mixed-media card (with video)
- [ ] DetailModal opens
- [ ] **Verify:** Video shows poster/first frame (NOT playing)
- [ ] Click Play button
- [ ] **Verify:** Video starts playing
- [ ] Close modal
- [ ] **Verify:** Video pauses
- [ ] Reopen same card
- [ ] **Verify:** Video starts PAUSED again

**5. LANDING - No Premium Badge**
- [ ] Navigate to /m/[shareCode] (with Premium access)
- [ ] **Verify:** NO "✨ Premium Experience" badge visible
- [ ] **Verify:** Two options visible:
  - "Experience the Celebration"
  - "Browse Memories"

**6. EXPERIENCE THE CELEBRATION - Real Data**
- [ ] Click "Experience the Celebration"
- [ ] **Verify:** Routes to /m/[shareCode]/reveal
- [ ] **Verify:** Real contributor name visible
- [ ] **Verify:** Real message text visible
- [ ] **Verify:** Real photos displayed (if present)
- [ ] **Verify:** Real curated GIF displayed (if present)
- [ ] **Verify:** Real video thumbnail (if present)
- [ ] **Verify:** NO beige placeholder boxes
- [ ] **Verify:** NO "A MEMORY FOR YOU" generic text

**7. MUSIC PLAYBACK**
- [ ] Click "Open My MemoryPop" to enter experience
- [ ] **Listen:** Audible soundtrack starts
- [ ] **Verify:** Music loops continuously
- [ ] Click mute button (speaker icon)
- [ ] **Verify:** Music volume = 0
- [ ] Click unmute
- [ ] **Verify:** Music returns to 50% volume
- [ ] **Verify:** Tooltip/label explains button purpose

**8. VIDEO + MUSIC**
- [ ] Navigate to memory with video
- [ ] Click Play on video
- [ ] **Listen:** Music ducks to ~20% volume
- [ ] Pause video
- [ ] **Listen:** Music restores to ~50% volume

**9. ENDING FLOW**
- [ ] Complete all memories
- [ ] **Verify:** FinalScreen appears
- [ ] Continue to reaction
- [ ] Submit reaction
- [ ] **Verify:** ReactionThankYou screen
- [ ] Click "Revisit Memory Wall"
- [ ] **Verify:** Routes to Memory Wall (real data)
- [ ] Click "Replay Reveal"
- [ ] **Verify:** Routes to /m/[shareCode]/reveal (canonical experience)

**10. BUILD**
- [ ] Run `npm run build`
- [ ] **Verify:** PASS (no TypeScript errors)

---

## PART K: Exact Founder Retest URLs

### Test Environment

**Dev server:** `npm run dev` → http://localhost:3000

### Test URLs

**1. Creator Flow**
```
http://localhost:3000/create
```

**2. Sympathy Atmosphere Test**
```
http://localhost:3000/create?occasion=Sympathy
```
_(Or manually select Sympathy after landing)_

**3. Farewell Atmosphere Test**
```
http://localhost:3000/create?occasion=Farewell
```

**4. Recipient Landing (Standard User)**
```
http://localhost:3000/m/[TEST_SHARE_CODE]
```
_(Replace with actual test share code)_

**5. Recipient Landing (Premium User)**
```
http://localhost:3000/m/[PREMIUM_SHARE_CODE]
```
_(Must have is_premium = true in database)_

**6. Direct Experience Access**
```
http://localhost:3000/m/[SHARE_CODE]/reveal
```

**7. Direct Memory Wall Access**
```
http://localhost:3000/m/[SHARE_CODE]?view=browse
```

**8. Contributor Flow**
```
http://localhost:3000/m/[SHARE_CODE]/contribute
```

### Test Data Requirements

**Create test MemoryPop with:**
- Occasion: Sympathy (for atmosphere testing)
- At least 5 memories:
  - 1 with 3 photos
  - 1 with curated GIF
  - 1 with video (≤15s)
  - 1 with photos + GIF + video (mixed media)
  - 1 text-only

**Database setup:**
```sql
-- Get existing test share codes
SELECT share_code, recipient_name, occasion, is_premium
FROM memorypops
WHERE share_code LIKE 'TEST%'
ORDER BY created_at DESC
LIMIT 5;

-- Count memories per MemoryPop
SELECT m.share_code, COUNT(mem.id) as memory_count
FROM memorypops m
LEFT JOIN memories mem ON mem.memorypop_id = m.id
WHERE m.share_code LIKE 'TEST%'
GROUP BY m.share_code;
```

---

## PART L: Implementation Order

### Phase 1: Data Consolidation (No UI Changes Yet)

**Priority:** CRITICAL - Must complete before UI routing changes

**Tasks:**
1. Update occasionExperience.ts with all 15 occasions ✅
2. Add sympathy, newbaby, engagement, etc. atmosphere mappings ✅
3. Add soundtrack mappings for new occasions ✅
4. Test occasion config resolution for all occasions ✅

**Verification:**
```typescript
// Test each occasion returns appropriate atmospheres
console.log(getOccasionConfig('sympathy').atmospheres);
// Expected: 4 atmospheres (no playful/joyful)

console.log(getOccasionConfig('farewell').atmospheres);
// Expected: 4 atmospheres (existing)

console.log(getSoundtrack('sympathy', 'warm_heartfelt'));
// Expected: warm_acoustic.mp3
```

**Files:** 1 file modified
- `/src/lib/occasionExperience.ts`

---

### Phase 2: DetailModal Video Autoplay Fix

**Priority:** HIGH - Standalone bug fix, no dependencies

**Tasks:**
1. Remove video autoplay useEffect from DetailModal.tsx
2. Add controls, poster, preload="metadata" to video element
3. Test video PAUSED on modal open
4. Test user can press Play
5. Test close pauses video

**Verification:**
- Open DetailModal with video memory
- Video shows poster/first frame (not playing)
- Click Play → video starts
- Close modal → video pauses
- Reopen → video PAUSED again

**Files:** 1 file modified
- `/src/components/memory-experience/DetailModal.tsx`

---

### Phase 3: Improved GIF Assets

**Priority:** HIGH - Blocks founder validation

**Tasks:**
1. Source 6-8 attractive animated GIFs from GIPHY/Tenor
2. Download and store in `/public/curated-gifs/`
3. Update `/src/lib/curatedGifs.ts` URLs
4. Create `/docs/gif-licenses.md` documenting sources
5. Test GIF picker shows real animations
6. Test GIF selection saves correctly

**GIF Requirements:**
- Visibly animated
- Emotionally appropriate (birthday, love, celebration, gratitude, etc.)
- Tasteful
- File size <500KB each
- Local copies (no remote URLs)

**Files:**
- 8 GIF files replaced in `/public/curated-gifs/`
- 1 file modified: `/src/lib/curatedGifs.ts`
- 1 file created: `/docs/gif-licenses.md`

---

### Phase 4: Creator Multimedia Support

**Priority:** CRITICAL - Product parity requirement

**Tasks:**
1. Create shared multimedia components:
   - `/src/components/shared-media/SharedPhotoUpload.tsx`
   - `/src/components/shared-media/SharedCuratedGifPicker.tsx`
   - `/src/components/shared-media/SharedVideoUpload.tsx`

2. Refactor ContributeForm to use shared components
   - Extract existing photo upload logic
   - Extract existing GIF picker logic
   - Extract existing video upload logic
   - Verify contributor flow still works

3. Integrate shared components into CreateForm step 2
   - Add photo upload (max 3)
   - Add curated GIF picker (max 1)
   - Add video upload (≤15s validation)
   - Update step 3 preview to show all media

4. Update creator submission API
   - Modify `/api/memorypops/create` to accept multimedia
   - Upload creator's photos/GIF/video to Supabase Storage
   - Validate video duration (reuse /api/upload validation)
   - Save creator's multimedia as first memory in memories table

5. Test creator can submit with:
   - 3 photos
   - 1 curated GIF
   - 1 video ≤15s
   - All three together

**API Changes:**
- `/api/memorypops/create` accepts photos[], gifs[], video
- Reuse video validation from `/api/upload`
- Create first memory record for creator
- Return memorypop + first memory

**Files:**
- 3 new shared components created
- 2 files modified: ContributeForm.tsx, CreateForm.tsx
- 1 file modified: `/api/memorypops/create/route.ts`

---

### Phase 5: Reveal Architecture Consolidation

**Priority:** CRITICAL - Eliminates dual-system confusion

**Tasks:**
1. Remove "✨ Premium Experience" badge from PremiumChoiceModal
2. Route "Experience the Celebration" to `/m/[shareCode]/reveal`
3. Update MemoryPopClient routing logic
4. Remove mode: 'reveal' (old Premium path)
5. Test landing choice routes correctly
6. Test replay routing goes to canonical reveal

**Route Changes:**
```typescript
// OLD
'choice' → PremiumChoiceModal
  → Experience → PremiumRevealExperience (fake data)
  → Browse → GalleryView

// NEW
'choice' → PremiumChoiceModal
  → Experience → redirect to /reveal (RevealExperience, real data)
  → Browse → GalleryView (?view=browse)
```

**Files:**
- 1 file modified: `/src/components/PremiumChoiceModal.tsx`
- 1 file modified: `/src/app/m/[shareCode]/MemoryPopClient.tsx`

---

### Phase 6: Music Lifecycle Debugging

**Priority:** HIGH - User experience issue

**Tasks:**
1. Add console.log tracking to audio lifecycle
2. Verify soundtrack file paths correct
3. Test browser autoplay policy compliance
4. Add tooltip/label to mute button
5. Test music starts audibly after "Open My MemoryPop" click
6. Test music loops continuously
7. Test mute/unmute works
8. Test video ducking works

**Debug logs:**
```typescript
console.log('Audio element created:', audioRef.current);
console.log('Soundtrack path:', soundtrack);
console.log('Audio ready:', isAudioReady);
console.log('Audio play() called');
console.log('Audio play() result:', result);
```

**Files:**
- 1 file modified: `/src/app/m/[shareCode]/reveal/RevealExperience.tsx`
- 1 file modified: `/src/app/m/[shareCode]/reveal/MemoryScreen.tsx` (mute button tooltip)

---

### Phase 7: Retire Old Premium Reveal

**Priority:** MEDIUM - Cleanup after consolidation verified

**Tasks:**
1. Delete `/src/components/premium-reveal/PremiumRevealExperience.tsx`
2. Delete `/src/components/premium-reveal/page.tsx`
3. Evaluate `/src/components/premium-reveal/RevealControls.tsx` for reuse
4. Update imports/references
5. Test build succeeds
6. Verify no broken routes

**Files:**
- 2 files deleted
- 1 file evaluated (keep or delete based on usefulness)
- Update any imports

---

### Phase 8: Comprehensive Browser Testing

**Priority:** MANDATORY - Before founder validation

**Execute all test scenarios from Part J**

**Pass criteria:**
- All 10 test scenarios PASS
- `npm run build` PASS
- No TypeScript errors
- No console errors during testing

---

### Phase 9: Final Documentation

**Tasks:**
1. Update increment1-corrections-analysis.md with implementation results
2. Create increment1-corrections-testing-results.md
3. Update increment1-final-report.md with corrections

**Return to founder:**
- A. Final occasion → atmosphere mapping ✅
- B. Creator multimedia approach ✅
- C. Improved GIF asset details ✅
- D. DetailModal autoplay fix ✅
- E. Two reveal systems explanation ✅
- F. Canonical implementation selection ✅
- G. Old premium-reveal retirement ✅
- H. Final routing diagram ✅
- I. Music lifecycle after consolidation ✅
- J. Browser test results (after implementation)
- K. Exact retest URLs ✅

---

## NOT IN SCOPE (Defer to Increment 2)

- ❌ Automatic cinematic pacing
- ❌ Content-aware timing
- ❌ Advanced transitions (cross-fade, micro-zoom)
- ❌ Music intensity changes
- ❌ Chapter structure
- ❌ Statistics display ("42 people came together")

**Goal:** Consolidate architecture FIRST, then add Increment 2 enhancements

---

**Status:** Analysis complete, ready to begin implementation
**Next:** Start Phase 1 (Data Consolidation)
