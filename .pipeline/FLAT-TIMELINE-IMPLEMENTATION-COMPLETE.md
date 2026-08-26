# FLAT GLOBAL TIMELINE IMPLEMENTATION — COMPLETE

**Date:** 2026-08-19
**ShareCode:** ec927763-3bbb-4722-a6e0-3c6172571bb0
**Status:** READY FOR FOUNDER BROWSER VALIDATION (3 RUNS REQUIRED)

---

## A. OLD ARCHITECTURE — WHY IT FAILED

### Split Parent/Child Design
```
RevealExperience (parent)
  - Manages currentStep (memory-level: 0, 1, 2, ...)
  - Renders WelcomeScreen at step 0
  - Renders CinematicMemoryScreen for steps 1..N (one per memory)
  - Renders FinalScreen at step N+1

  CinematicMemoryScreen (child, per-memory instance)
    - Manages currentSceneIndex (scene-level within ONE memory)
    - Builds scene sequence from ONE memory
    - Creates its own timer
    - Has its own useEffect lifecycle
    - Mounts/unmounts when parent changes currentStep
```

### Root Causes of Failure

**1. Component Remounting at Memory Boundaries**
- When Memory 1 completes → parent increments currentStep
- React unmounts old CinematicMemoryScreen instance
- React mounts new CinematicMemoryScreen instance for Memory 2
- Unmount window creates race: old timers not yet cancelled, new timers starting

**2. Stale Timer Closures Across Boundaries**
- Scene N timer created with closure over Scene N's currentSceneIndex
- Scene N → Scene N+1 transition happens
- New scene effect runs, creates new timer
- Old timer callback fires AFTER new scene has reset guard/token
- Result: double-advance, skipped scene

**3. Two Independent Progression Owners**
- Parent owns memory-level progression (currentStep)
- Child owns scene-level progression (currentSceneIndex)
- Both can change independently
- Coordination failures at boundaries

**4. Scene Token Couldn't Cross Memory Boundaries**
- Token incremented per scene WITHIN one memory
- But memory boundaries involved component unmount/remount
- New component instance = new token sequence
- Old memory's final scene timer could fire during new memory's first scene

---

## B. NEW ARCHITECTURE — FLAT GLOBAL TIMELINE

### Single Source of Truth

```
RevealExperience
  - Manages phases: Welcome → Cinematic → Final → Reaction → Thank You
  - Delegates to GlobalCinematicController for entire cinematic portion

GlobalCinematicController
  - Builds ONE flat timeline from ALL memories at mount
  - Owns ONE currentSceneIndex for entire reveal
  - Owns ONE timer
  - Owns ONE state machine
  - NO component remounting during cinematic progression
  - NO memory boundaries - timeline is already flat
```

### Key Principles

1. **One Timeline:** Built once at component mount, spans all memories
2. **One Index:** currentSceneIndex (0..10 for founder fixture)
3. **One Timer Owner:** GlobalCinematicController manages single timer
4. **One State Machine:** PLAYING, PAUSED, VIDEO_PLAYING, VIDEO_PAUSED
5. **No Nesting:** No per-memory sub-machines
6. **No Remounting:** Same component instance from Opening → FinalScreen

---

## C. FLAT MANIFEST — FOUNDER FIXTURE

**ShareCode:** ec927763-3bbb-4722-a6e0-3c6172571bb0

### Actual Database Content

**Memory 1: From the creator**
- Message: "Happy birthday! You always make every day brighter."
- Photos: 3
- GIFs: 1
- Video: YES (14.8s)

**Memory 2: Kaka**
- Message: "Happy birthday! You always make every day brighter."
- Photos: 1
- GIFs: 1
- Video: NO

### Expected Flat Global Timeline (11 scenes)

```
Scene 0:  CONTRIBUTOR → "From the creator"
Scene 1:  MESSAGE → "Happy birthday! You always make..."
Scene 2:  PHOTO 1/3
Scene 3:  PHOTO 2/3  ← Previously skipped
Scene 4:  PHOTO 3/3
Scene 5:  GIF 1/1
Scene 6:  VIDEO (14.8s)
Scene 7:  CONTRIBUTOR → "Kaka"
Scene 8:  MESSAGE → "Happy birthday! You always make..."
Scene 9:  PHOTO 1/1
Scene 10: GIF 1/1
```

### Full Reveal Flow

```
Opening (Welcome screen)
  ↓
Scene 0..10 (Cinematic content - no interruption)
  ↓
FinalScreen
  ↓
ReactionPrompt
  ↓
ReactionThankYou
```

---

## D. SINGLE POSITION OWNER

### State Location

**File:** `GlobalCinematicController.tsx`
**Line:** 38

```typescript
const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
```

### State Changes (ALL go through one function)

**Function:** `advanceScene()` (lines 102-119)

```typescript
const advanceScene = () => {
  console.log('[ADVANCE]', {
    from: currentSceneIndex,
    to: currentSceneIndex + 1,
    type: currentScene?.type,
    isLast: isLastScene
  });

  if (isLastScene) {
    // Restore soundtrack before completing
    if (audioRef?.current && !isMusicMuted) {
      audioRef.current.play();
    }
    console.log('[CINEMATIC_COMPLETE]');
    onComplete(); // ← Triggers parent to move to FinalScreen
  } else {
    setCurrentSceneIndex(prev => prev + 1); // ← Only state change
  }
};
```

### Triggers for advanceScene()

1. **Timer finished** (line 95) - Token validated
2. **Video ended** (line 193) - Synchronous event
3. **Manual Next** (line 140) - User control

### Manual Previous

**Function:** `goBack()` (lines 121-130)

```typescript
const goBack = () => {
  if (currentSceneIndex > 0) {
    console.log('[GO_BACK]', {
      from: currentSceneIndex,
      to: currentSceneIndex - 1
    });
    setCurrentSceneIndex(prev => prev - 1); // ← Only other state change
  }
};
```

### No Competing Mechanisms

- ✅ No parent currentStep for memories
- ✅ No child currentSceneIndex per memory
- ✅ No memory boundary logic
- ✅ No nested autoplay loops
- ✅ Single `setCurrentSceneIndex` call site

---

## E. OLD CODE RETIRED

### Deleted/Unused

1. **`CinematicMemoryScreen.tsx`** - Entire per-memory component
   - Per-memory scene builder
   - Per-memory currentSceneIndex state
   - Per-memory timer management
   - Per-memory effects
   - Component mount/unmount at memory boundaries
   - **Status:** File still exists but NO LONGER IMPORTED OR USED

2. **Parent memory-level progression** in `RevealExperience.tsx`
   - OLD: Steps 1..N for individual memories
   - NEW: Step 1 for entire cinematic (all memories)
   - OLD: Loop rendering CinematicMemoryScreen per memory
   - NEW: Single GlobalCinematicController for all memories

3. **Video duck/restore callbacks** in `RevealExperience.tsx`
   - OLD: Parent passed handleVideoDuck/handleVideoRestore to child
   - NEW: GlobalCinematicController handles audio directly (pauses entirely)

### Replaced

- **OLD:** `buildSceneSequence()` inside CinematicMemoryScreen (per-memory)
- **NEW:** `buildCinematicTimeline()` in `/src/lib/buildCinematicTimeline.ts` (global, all memories)

- **OLD:** Per-memory `currentSceneIndex` state in CinematicMemoryScreen
- **NEW:** Global `currentSceneIndex` state in GlobalCinematicController

- **OLD:** Per-memory timer ownership in CinematicMemoryScreen
- **NEW:** Global timer ownership in GlobalCinematicController

---

## F. AUTOMATED TESTS

### Test File

**`scripts/validate-flat-timeline.js`**

### Test Cases

1. ✅ **Flat manifest from 2 memories** - 11 scenes in correct order
2. ✅ **Photo array order preservation** - photo1 → photo2 → photo3
3. ✅ **Memory boundary is flat** - video1 → contributor2 (no gap)
4. ✅ **Only real content** - No fake data for empty media
5. ✅ **Single photo** - Correct mediaIndex
6. ✅ **Video position** - contributor → message → photos → GIF → video

### Result

```bash
node scripts/validate-flat-timeline.js
```

```
============================================================
SUMMARY
============================================================
Total:  6
Passed: 6
Failed: 0

✓ ALL TESTS PASSED - Flat timeline verified
```

**Status:** ✅ ALL PASS

---

## G. RUNTIME RUN 1 — AWAITING FOUNDER

**Dev Server:** http://localhost:3000
**Test URL:** http://localhost:3000/m/ec927763-3bbb-4722-a6e0-3c6172571bb0/reveal

### Instructions

1. Open URL in browser (fresh, clear cache if needed)
2. Click "Open My MemoryPop"
3. **DO NOT press Next manually**
4. Observe complete auto-progression from Opening → FinalScreen
5. Note ACTUAL sequence visible on screen (not expected)
6. Check browser console for trace logs

### Expected Sequence (13 total: Opening + 11 scenes + FinalScreen)

1. **Opening** → Click "Open My MemoryPop"
2. Scene 0: From the creator
3. Scene 1: Creator message
4. Scene 2: Creator photo 1
5. Scene 3: Creator photo 2 ← **THIS WAS THE BUG**
6. Scene 4: Creator photo 3
7. Scene 5: Creator GIF
8. Scene 6: Creator video (14.8s)
9. Scene 7: Kaka
10. Scene 8: Kaka message
11. Scene 9: Kaka photo
12. Scene 10: Kaka GIF
13. **FinalScreen**

### Validation Checklist

- [ ] All 11 content scenes appeared
- [ ] All 3 creator photos visible (photos 1, 2, 3)
- [ ] Correct order maintained
- [ ] No skipped scenes
- [ ] No duplicate scenes
- [ ] No stalled scenes
- [ ] No manual intervention required
- [ ] GIF → video automatic
- [ ] Video → Kaka automatic (memory boundary)
- [ ] Kaka GIF → FinalScreen automatic

### Console Trace

Look for:
- `[GLOBAL_TIMELINE_MANIFEST]` - Shows 11 scenes at mount
- `[SCENE_ENTRY]` logs for each scene (0..10)
- `[TIMER_FINISHED]` for timer-driven advances
- `[VIDEO_ENDED]` after video completes
- `[ADVANCE]` for each progression
- `[CINEMATIC_COMPLETE]` when done

Should NOT see:
- `[STALE_TIMER_IGNORED]` warnings

### Report Format

```
RUN 1 - ACTUAL OBSERVED SEQUENCE:

Opening → clicked
Scene X: [what was visible]
Scene Y: [what was visible]
...
FinalScreen reached: YES/NO

Issues:
- [any skipped scenes]
- [any wrong order]
- [any stalled scenes]
- [any manual intervention needed]
```

---

## H. RUNTIME RUN 2 — AWAITING FOUNDER

**Instructions:** Repeat Run 1 exactly

**Purpose:** Verify deterministic behavior

**Report:** Same format as Run 1

---

## I. RUNTIME RUN 3 — AWAITING FOUNDER

**Instructions:** Repeat Run 1 again

**Purpose:** Confirm consistency across multiple runs

**Report:** Same format as Run 1

---

## J. PHOTO ORDER — AWAITING FOUNDER

**Critical validation across ALL THREE runs:**

### Run 1
- [ ] Creator photo 1 appeared automatically
- [ ] Creator photo 2 appeared automatically ← **THIS WAS MISSING BEFORE**
- [ ] Creator photo 3 appeared automatically
- [ ] Photos appeared in order: 1 → 2 → 3

### Run 2
- [ ] Creator photo 1 appeared automatically
- [ ] Creator photo 2 appeared automatically
- [ ] Creator photo 3 appeared automatically
- [ ] Photos appeared in order: 1 → 2 → 3

### Run 3
- [ ] Creator photo 1 appeared automatically
- [ ] Creator photo 2 appeared automatically
- [ ] Creator photo 3 appeared automatically
- [ ] Photos appeared in order: 1 → 2 → 3

**All three runs must show all 3 photos in correct order with no manual intervention.**

---

## K. MEMORY BOUNDARY — AWAITING FOUNDER

**Critical validation: Scene 6 (video) → Scene 7 (Kaka contributor)**

This is where the OLD architecture had memory boundary remount races.

### Run 1
- [ ] Creator video played to completion
- [ ] Automatic transition to Kaka contributor (no manual click)
- [ ] No stalled scene
- [ ] No duplicate scene

### Run 2
- [ ] Creator video → Kaka automatic
- [ ] Clean transition

### Run 3
- [ ] Creator video → Kaka automatic
- [ ] Clean transition

**Memory boundary must be seamless in all three runs.**

---

## L. MANUAL NAVIGATION — AWAITING FOUNDER

**After successful automatic runs, test manual controls:**

### Test 1: Photo 2 → Previous → Photo 1
1. Refresh page
2. Auto-progress to Scene 3 (Photo 2)
3. Press Previous
4. **Expected:** Scene 2 (Photo 1)
5. **Verify:** Correct scene displayed

### Test 2: Photo 1 → Next → Photo 2
1. From Photo 1
2. Press Next
3. **Expected:** Scene 3 (Photo 2)
4. **Verify:** Correct scene displayed

### Test 3: Video → Next → Kaka (memory boundary)
1. Refresh page
2. Auto-progress to Scene 6 (Video)
3. Press Next
4. **Expected:** Scene 7 (Kaka contributor)
5. **Verify:** Clean memory boundary transition

### Test 4: Kaka → Previous → Video (reverse memory boundary)
1. From Kaka contributor
2. Press Previous
3. **Expected:** Scene 6 (Creator video)
4. **Verify:** Clean reverse memory boundary

**Report:** PASS/FAIL for each test

---

## M. REPLAY — AWAITING FOUNDER

**After reaching ReactionThankYou:**

### Test 1: First Replay
1. Click "Replay Reveal"
2. **Expected:** Returns to Opening screen
3. Click "Open My MemoryPop"
4. **Expected:** Full cinematic replays from Scene 0
5. **Verify:** All 11 scenes appear again

### Test 2: Second Replay
1. Let first replay complete to ReactionThankYou
2. Click "Replay Reveal" again
3. **Expected:** Returns to Opening screen
4. **Verify:** Replay works consistently

**Report:** PASS/FAIL

---

## N. REVIEWER — PENDING

Will run after browser validation confirms functional correctness.

**Focus areas:**
- Single source of cinematic position ✓
- Single timer owner ✓
- No nested local autoplay ✓
- No duplicate memory-level progression ✓
- No stale closures ✓
- Video event cleanup ✓
- Timer cleanup ✓
- Reset/replay ✓
- Photo array order ✓
- No fake data ✓
- Old CinematicMemoryScreen not used ✓

---

## O. BUILD

**Command:** `npm run build`

**Result:** ✅ PASS

```
✓ Compiled successfully in 3.6s
✓ TypeScript: No errors
✓ All routes generated
✓ Production build ready
```

---

## P. FOUNDER RETEST URL

**Dev Server:** `http://localhost:3000`
**Primary Test URL:**
```
http://localhost:3000/m/ec927763-3bbb-4722-a6e0-3c6172571bb0/reveal
```

---

## IMPLEMENTATION SUMMARY

### What Changed

**DELETED:** Parent-memory + child-scene split architecture
**CREATED:** Flat global timeline architecture

**BEFORE:**
- RevealExperience renders N instances of CinematicMemoryScreen
- Each instance manages local scene progression
- Component remounts at memory boundaries
- Timer ownership unclear across boundaries
- Stale closures cause photo skips

**AFTER:**
- RevealExperience renders ONE GlobalCinematicController
- Controller builds flat timeline from ALL memories
- NO component remounting during cinematic
- ONE global scene index
- ONE timer owner
- NO memory boundaries in timeline

### Files Modified

1. **`/src/lib/buildCinematicTimeline.ts`** (NEW)
   - Flat timeline builder
   - Scene duration calculator
   - Memory info helper

2. **`/src/app/m/[shareCode]/reveal/GlobalCinematicController.tsx`** (NEW)
   - Global cinematic controller
   - Single state machine
   - Single timer owner
   - Scene renderer

3. **`/src/app/m/[shareCode]/reveal/RevealExperience.tsx`** (MODIFIED)
   - Removed per-memory loop
   - Uses GlobalCinematicController for Step 1
   - Simplified step management
   - Removed video duck/restore callbacks

4. **`/src/app/m/[shareCode]/reveal/CinematicMemoryScreen.tsx`** (RETIRED)
   - No longer imported
   - No longer used
   - Per-memory architecture superseded

5. **`/scripts/validate-flat-timeline.js`** (NEW)
   - Automated tests for timeline builder

6. **`/scripts/print-flat-manifest.js`** (NEW)
   - Manifest verification tool

### Confidence Level

**High** - for architectural correctness:
- ✅ Single source of truth for position
- ✅ No component remounting during cinematic
- ✅ No memory boundary races
- ✅ Automated tests prove flat manifest correct
- ✅ Build passes

**AWAITING:** Real browser validation (3 runs)

### Expected Outcome

**If flat architecture is correct:**
- All 3 browser runs show identical sequence
- All 11 scenes appear exactly once
- Photo 2 no longer skipped
- Memory boundaries seamless
- Manual navigation works
- Replay works

**If flat architecture still has issues:**
- Will be visible in browser runs
- Will be debugged based on actual observed behavior
- Will NOT add more patches on top

---

## NEXT ACTIONS

1. **FOUNDER:** Run browser validation (3 identical runs)
2. **FOUNDER:** Report ACTUAL observed sequence (not expected)
3. **FOUNDER:** Test manual navigation (4 tests)
4. **FOUNDER:** Test replay (2 tests)
5. **FOUNDER:** Confirm all 3 photos visible in all 3 runs
6. **IF ALL PASS:** Remove dev trace logging, run Reviewer, commit
7. **IF ANY FAIL:** Debug based on actual observed failure, do NOT patch

---

**STATUS:** IMPLEMENTATION COMPLETE — AWAITING FOUNDER BROWSER VALIDATION (3 RUNS)

**DO NOT COMMIT**
**DO NOT DEPLOY**
**DEV SERVER RUNNING ON localhost:3000**

**END OF FLAT TIMELINE IMPLEMENTATION REPORT**
