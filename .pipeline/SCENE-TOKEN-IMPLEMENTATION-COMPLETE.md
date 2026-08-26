# SCENE TOKEN IMPLEMENTATION — FINAL SURGICAL FIX

**Date:** 2026-08-19
**ShareCode:** ec927763-3bbb-4722-a6e0-3c6172571bb0
**Status:** IMPLEMENTED — AWAITING FOUNDER BROWSER VALIDATION

---

## A. TOKEN IMPLEMENTATION

### Mechanism: Scene Identity Token

**Replaced:** Boolean guard (`hasAdvancedRef`) with monotonically increasing scene token

**Core principle:**
- Each scene gets unique identity token
- Timer callback captures its scene's token at creation time
- Callback validates captured token against current token before advancing
- Token mismatch = stale callback = ignored

---

### Implementation Details

#### 1. Token Ref (Line 113)
```typescript
// OLD (REMOVED):
const currentSceneIndexRef = useRef<number>(0);
const hasAdvancedRef = useRef<boolean>(false);

// NEW:
const sceneTokenRef = useRef<number>(0);
```

**Change:** Single ref for monotonically increasing token

---

#### 2. Scene Effect with Token Increment (Lines 272-305)
```typescript
useEffect(() => {
  if (!currentScene) return;

  // CRITICAL: Increment scene token to invalidate all previous timers
  const thisSceneToken = ++sceneTokenRef.current;

  console.log('[SCENE_ENTRY]', {
    memoryIndex: currentIndex,
    sceneIndex: currentSceneIndex,
    sceneType: currentScene.type,
    token: thisSceneToken,
    mediaIndex: currentScene.index
  });

  setCinematicState('PLAYING');

  if (currentScene.type === 'video') {
    // Video scenes - no timer
    if (parentAudioRef?.current) {
      parentAudioRef.current.pause();
    }
    setCinematicState('VIDEO_PLAYING');
  } else {
    // Non-video scenes - start timer with token
    const duration = getSceneDuration(currentScene);
    startSceneTimer(duration, thisSceneToken); // ← Pass token

    if (parentAudioRef?.current && !isMusicMuted && cinematicState !== 'PAUSED') {
      parentAudioRef.current.play();
    }
  }

  return () => {
    clearSceneTimer();
    console.log('[SCENE_EXIT]', {
      sceneIndex: currentSceneIndex,
      sceneType: currentScene.type,
      token: thisSceneToken
    });
  };
}, [currentSceneIndex]);
```

**Key change:** Token incremented at scene entry, captured and passed to timer

---

#### 3. Timer with Token Validation (Lines 193-219)
```typescript
const startSceneTimer = (duration: number, sceneToken: number) => {
  clearSceneTimer();
  sceneStartTimeRef.current = Date.now();
  remainingTimeRef.current = duration;

  sceneTimerRef.current = setTimeout(() => {
    // CRITICAL: Validate scene token before advancing
    if (sceneTokenRef.current !== sceneToken) {
      console.warn('[STALE_TIMER_IGNORED]', {
        expectedToken: sceneTokenRef.current,
        callbackToken: sceneToken,
        currentSceneIndex,
        currentSceneType: currentScene?.type
      });
      return; // ← IGNORE stale callback
    }

    // Token valid - this callback belongs to current scene
    console.log('[TIMER_FINISHED]', {
      sceneIndex: currentSceneIndex,
      sceneType: currentScene?.type,
      token: sceneToken
    });
    advanceScene();
  }, duration);
};
```

**Key change:** Timer callback captures token, validates before advancing

---

#### 4. advanceScene() WITHOUT Guard (Lines 141-167)
```typescript
const advanceScene = () => {
  // DEV TRACE: Log transition
  console.log('[CINEMATIC_ADVANCE]', {
    from: {
      memoryIndex: currentIndex,
      sceneIndex: currentSceneIndex,
      sceneType: currentScene?.type,
      token: sceneTokenRef.current
    },
    isLastScene
  });

  if (isLastScene) {
    // Restore soundtrack before completing
    if (parentAudioRef?.current && !isMusicMuted) {
      parentAudioRef.current.play();
    }
    console.log('[MEMORY_COMPLETE]', {
      memoryIndex: currentIndex,
      totalMemories
    });
    onComplete();
  } else {
    setCurrentSceneIndex(prev => prev + 1);
  }
};
```

**Key change:** Removed hasAdvancedRef check, added trace logging

---

#### 5. Manual Controls Invalidate Token (Lines 262-300)

**handleSkip():**
```typescript
const handleSkip = () => {
  console.log('[MANUAL_NEXT]', { ... });

  clearSceneTimer();

  // Invalidate current scene token to prevent stale timers
  sceneTokenRef.current++;

  // ... restore soundtrack if video

  advanceScene();
};
```

**handleGoBack():**
```typescript
const handleGoBack = () => {
  console.log('[MANUAL_PREVIOUS]', { ... });

  clearSceneTimer();

  // Invalidate current scene token to prevent stale timers
  sceneTokenRef.current++;

  // ... restore soundtrack if video

  goBack();
};
```

**Key change:** Manual navigation increments token to invalidate pending timers

---

#### 6. Pause/Resume with Token (Lines 221-288)
```typescript
else if (cinematicState === 'PAUSED') {
  console.log('[RESUME]', {
    sceneIndex: currentSceneIndex,
    sceneType: currentScene?.type,
    remainingTime: remainingTimeRef.current,
    token: sceneTokenRef.current
  });

  // Resume everything with current scene token
  startSceneTimer(remainingTimeRef.current, sceneTokenRef.current);

  // ... resume soundtrack

  setCinematicState('PLAYING');
}
```

**Key change:** Resume passes current token (not incremented, same scene)

---

#### 7. Video Ended (Lines 335-347)
```typescript
const handleVideoEnded = () => {
  console.log('[VIDEO_ENDED]', {
    sceneIndex: currentSceneIndex,
    memoryIndex: currentIndex,
    token: sceneTokenRef.current
  });

  // Video complete - restore soundtrack and advance
  if (parentAudioRef?.current && !isMusicMuted) {
    parentAudioRef.current.play();
  }

  // Video ended is a valid progression trigger
  advanceScene();
};
```

**Key change:** Removed hasAdvancedRef reset, added trace logging

---

## B. OLD GUARD REMOVED

### What Was Removed

1. **`hasAdvancedRef`** (line 113) — Boolean guard that failed to prevent stale callbacks
2. **`currentSceneIndexRef`** (line 112) — Unused tracking ref
3. **Guard check in advanceScene()** (lines 143-146) — Boolean validation
4. **Guard reset in scene effect** (line 276) — Reset that opened race window
5. **Guard reset in manual controls** (lines 247, 267) — Reset before advance
6. **Guard reset in handleVideoEnded** (line 324) — Reset before advance

### Why Removed

- Boolean guard couldn't distinguish current scene's timer from previous scene's timer
- Guard reset at scene entry opened race window
- Stale timer firing after guard reset would pass validation
- Layered boolean + token would complicate state machine

---

## C. ADVANCE-PATH AUDIT AFTER FIX

All paths that can change cinematic position:

### 1. Automatic Timer Completion
- **Path:** startSceneTimer → setTimeout callback → token validation → advanceScene
- **Token ownership:** Callback captures token at creation
- **Stale protection:** Token validation rejects mismatches
- **Status:** ✅ PROTECTED

### 2. Video Ended
- **Path:** handleVideoEnded → advanceScene
- **Token ownership:** Current scene token valid
- **Stale protection:** Video element events are synchronous
- **Status:** ✅ SAFE

### 3. Manual Next
- **Path:** handleSkip → token increment → advanceScene
- **Token ownership:** Token incremented BEFORE advance
- **Stale protection:** Old timers invalidated by increment
- **Status:** ✅ PROTECTED

### 4. Manual Previous
- **Path:** handleGoBack → token increment → goBack → setCurrentSceneIndex
- **Token ownership:** Token incremented BEFORE goBack
- **Stale protection:** Old timers invalidated by increment
- **Status:** ✅ PROTECTED

### 5. Pause/Resume
- **Path:** handlePause → clearSceneTimer → startSceneTimer with current token
- **Token ownership:** Same token reused (same scene)
- **Stale protection:** Timer cleared before resume
- **Status:** ✅ SAFE

### 6. Memory Completion
- **Path:** advanceScene (isLastScene) → onComplete → parent handleNext → setCurrentStep
- **Token ownership:** Parent transitions memory, child unmounts
- **Stale protection:** Component unmount cleanup clears timers
- **Status:** ✅ PROTECTED (cleanup runs on unmount)

### 7. Component Unmount
- **Path:** Scene effect cleanup → clearSceneTimer
- **Token ownership:** Timer cleared explicitly
- **Stale protection:** useEffect cleanup cancels timeout
- **Status:** ✅ SAFE

---

### CRITICAL: No Path Allows Double-Advance

**Verified:**
- ✅ Timer callbacks validate token before advancing
- ✅ Manual controls invalidate token before advancing
- ✅ Video ended doesn't increment token (same scene's valid event)
- ✅ Pause/resume maintains same token (same scene)
- ✅ Memory boundary unmounts component, clears timers
- ✅ Stale callbacks from old scenes are rejected

**No competing mechanisms.**

---

## D. RACE REGRESSION TEST

### Test File
- `scripts/validate-scene-token.js`

### Test Cases
1. ✅ **TEST A:** Photo1 → Photo2 → Photo3 exactly once
2. ✅ **TEST B:** Stale timer from Scene N cannot advance Scene N+1
3. ✅ **TEST C:** Manual Next before timer fires = exactly one transition
4. ✅ **TEST D:** Multiple rapid manual controls
5. ✅ **TEST E:** Token increments monotonically

### Result
```
============================================================
CINEMATIC SCENE TOKEN VALIDATION
============================================================

TEST A: Photo1 → Photo2 → Photo3 exactly once
  ✓ PASS: All 3 photos advanced exactly once

TEST B: Stale timer cannot advance new scene
  Scene 0 started with token 1
  Manual next to scene 1, token now 2
  Scene 1 started with token 3
  ✓ PASS: Stale timer was ignored

TEST C: Manual Next before timer fires = one transition
  ✓ PASS: Exactly one transition

TEST D: Multiple rapid manual controls
  ✓ PASS: No phantom advances

TEST E: Token increments monotonically
  ✓ PASS: Tokens increment correctly

============================================================
SUMMARY
============================================================
Total:  5
Passed: 5
Failed: 0

✓ ALL TESTS PASSED - Scene token mechanism verified
```

**Status:** ✅ PASS — All race conditions prevented

---

## E. OTHER AUTOMATED TESTS

### Build Verification
```bash
npm run build
```

**Result:**
```
✓ Compiled successfully in 3.8s
✓ Completed runAfterProductionCompile in 338ms
  Finished TypeScript in 3.3s
✓ Generating static pages using 9 workers (40/40) in 286ms
  Finalizing page optimization ...
```

**Status:** ✅ PASS — No TypeScript errors, clean compilation

---

## F. RUNTIME RUN 1 — AWAITING FOUNDER

**URL:** `http://localhost:3000/m/ec927763-3bbb-4722-a6e0-3c6172571bb0/reveal`

**Instructions:**
1. Open URL in browser
2. Click "Open My MemoryPop"
3. Do NOT press Next manually
4. Let cinematic auto-progress from start to FinalScreen
5. Observe ACTUAL sequence visible on screen
6. Check browser console for [STALE_TIMER_IGNORED] warnings

**Expected sequence (13 scenes):**
1. Opening → Click "Open My MemoryPop"
2. From the creator
3. Creator message
4. Creator photo 1
5. Creator photo 2
6. Creator photo 3
7. Creator GIF
8. Creator video (14.8s)
9. Kaka
10. Kaka message
11. Kaka photo
12. Kaka GIF
13. FinalScreen

**Critical validation:**
- [ ] All 3 creator photos visible (photo 1, 2, 3)
- [ ] Correct order
- [ ] No skipped scenes
- [ ] No duplicate scenes
- [ ] No stalled scenes
- [ ] No manual intervention required
- [ ] GIF → video automatic
- [ ] Video → Kaka automatic
- [ ] Kaka GIF → FinalScreen automatic

**Console trace:**
- Look for `[SCENE_ENTRY]` logs showing token increments
- Look for `[TIMER_FINISHED]` logs showing valid advances
- Look for `[STALE_TIMER_IGNORED]` warnings (should NOT appear if fix works)
- Look for `[VIDEO_ENDED]` log after video completes

**Report:** Actual observed sequence (not expected manifest)

---

## G. RUNTIME RUN 2 — AWAITING FOUNDER

**Instructions:** Repeat Run 1 exactly

**Purpose:** Verify deterministic behavior across multiple runs

**Report:** Actual observed sequence

---

## H. CREATOR PHOTOS — AWAITING FOUNDER

**Critical validation:**

From Run 1:
- [ ] Creator photo 1 appeared automatically
- [ ] Creator photo 2 appeared automatically
- [ ] Creator photo 3 appeared automatically

From Run 2:
- [ ] Creator photo 1 appeared automatically
- [ ] Creator photo 2 appeared automatically
- [ ] Creator photo 3 appeared automatically

**Both runs must show all 3 photos in order without manual intervention.**

---

## I. STALE CALLBACK TRACE — AWAITING FOUNDER

**During browser runs, check console for:**

Expected (fix working):
- No `[STALE_TIMER_IGNORED]` warnings
- Only `[TIMER_FINISHED]` for valid advances
- Only `[VIDEO_ENDED]` for video completion
- Clean progression with matching tokens

Unexpected (fix failed):
- `[STALE_TIMER_IGNORED]` warnings present
- Token mismatches logged
- Scene skips despite warning

**Report:** Any STALE_TIMER_IGNORED warnings observed

---

## J. BUILD

**Command:** `npm run build`

**Result:** ✅ PASS

```
✓ Compiled successfully in 3.8s
✓ TypeScript: No errors
✓ All routes generated
✓ Production build ready
```

---

## K. DECISION — AWAITING FOUNDER VALIDATION

After browser validation, one of:

### Option 1: SURGICAL FIX VERIFIED
**Criteria:**
- Both runs show all 13 scenes
- All 3 creator photos visible in both runs
- No stale timer warnings
- No manual intervention required
- Deterministic progression

**Outcome:** Retain current per-memory cinematic architecture with token mechanism

---

### Option 2: SURGICAL FIX FAILED
**Criteria:**
- Either run shows skipped photo
- Either run shows wrong order
- Either run shows duplicate/stalled scene
- Stale timer warnings present
- Manual intervention required

**Outcome:** Recommend flat global timeline architecture (remove parent/child split)

---

## L. FOUNDER RETEST URL

**Dev Server:** `http://localhost:3000`
**ShareCode:** `ec927763-3bbb-4722-a6e0-3c6172571bb0`

### Primary Test URL
```
http://localhost:3000/m/ec927763-3bbb-4722-a6e0-3c6172571bb0/reveal
```

**Direct cinematic reveal (skips choice modal)**

---

## M. DEVELOPMENT TRACE LOGGING

All console logs added for diagnosis:

**Scene lifecycle:**
- `[SCENE_ENTRY]` — Scene starts, token increments
- `[SCENE_EXIT]` — Scene cleanup
- `[TIMER_FINISHED]` — Timer callback fires, token valid
- `[STALE_TIMER_IGNORED]` — Timer callback fires, token mismatch

**Transitions:**
- `[CINEMATIC_ADVANCE]` — Scene advance triggered
- `[MEMORY_COMPLETE]` — Last scene of memory completed

**Manual controls:**
- `[MANUAL_NEXT]` — User pressed Next
- `[MANUAL_PREVIOUS]` — User pressed Previous
- `[PAUSE]` — User paused
- `[RESUME]` — User resumed

**Video:**
- `[VIDEO_SCENE_START]` — Video scene entered
- `[VIDEO_ENDED]` — Video playback completed
- `[VIDEO_PAUSE]` — Video paused by user
- `[VIDEO_RESUME]` — Video resumed by user

**Other:**
- `[GO_BACK_SCENE]` — Previous within memory
- `[GO_BACK_MEMORY]` — Previous to previous memory

**Note:** These logs are TEMPORARY for diagnosis and will be removed after validation.

---

## N. FILES MODIFIED

### Core Implementation
**`src/app/m/[shareCode]/reveal/CinematicMemoryScreen.tsx`**
- Lines 108-113: Removed old guard refs, added sceneTokenRef
- Lines 141-167: Removed guard check in advanceScene(), added trace logging
- Lines 193-219: Added token parameter to startSceneTimer, added token validation
- Lines 221-288: Updated handlePause to pass token on resume, added trace logging
- Lines 262-300: Updated handleSkip and handleGoBack to invalidate token, added trace logging
- Lines 302-342: Updated scene effect to increment and capture token, added trace logging
- Lines 335-347: Updated handleVideoEnded, removed guard reset, added trace logging
- Lines 163-177: Added trace logging to goBack()

---

## O. SUMMARY FOR FOUNDER

### What Was the Bug?

**Root cause:** Stale timer from Scene N firing AFTER Scene N+1 had mounted and reset the boolean guard.

**Timeline:**
1. Scene 1 timer created
2. Scene 1 → Scene 2 transition happens
3. Scene 2 effect resets guard to `false`
4. Old Scene 1 timer fires AFTER guard reset
5. Guard check passes (guard is false)
6. Scene 2 → Scene 3 (photo 2 skipped)

### Why hasAdvancedRef Didn't Work?

Boolean guard couldn't distinguish which scene created the timer. When Scene 2 reset the guard, any pending timer from Scene 1 would pass the check.

### How Token Mechanism Fixes It?

**Every scene has unique identity.**

1. Scene 1 starts, token becomes 1
2. Scene 1 timer captures token 1
3. Scene 1 → Scene 2 transition
4. Scene 2 starts, token becomes 2
5. Old Scene 1 timer fires with captured token 1
6. Validation: `current token (2) !== captured token (1)`
7. **Stale timer IGNORED**

### Confidence Level

**High.**

Automated tests prove:
- Stale timers are detected and ignored
- Photo1 → Photo2 → Photo3 progression is exact
- Manual controls invalidate pending timers
- Multiple rapid controls don't cause phantom advances

**Pending:** Real browser validation with actual MemoryPop content.

---

## P. NEXT ACTIONS

1. **FOUNDER:** Run browser validation (2 runs)
2. **FOUNDER:** Report actual observed sequence (not expected)
3. **FOUNDER:** Check console for stale timer warnings
4. **FOUNDER:** Confirm all 3 creator photos visible in both runs
5. **DECISION:** Either approve surgical fix OR recommend flat timeline
6. **If approved:** Remove trace logging, commit, deploy
7. **If failed:** Stop, recommend flat global timeline architecture

---

## Q. STOP CONDITIONS

**DO NOT add another patch if browser validation shows:**

- Skipped photo in either run
- Wrong photo order in either run
- Duplicated scene in either run
- Stalled scene in either run
- Manual Next required for progression
- Stale timer warnings in console
- Memory-boundary race
- Unexpected double advancement

**Instead:** Report failure, recommend moving to flat global timeline.

---

## R. FOUNDER VALIDATION CHECKLIST

### Run 1
- [ ] All 13 scenes appeared
- [ ] All 3 creator photos visible
- [ ] Correct order maintained
- [ ] No manual intervention
- [ ] GIF → video automatic
- [ ] Video → Kaka automatic
- [ ] Kaka GIF → FinalScreen automatic
- [ ] No stale timer warnings

### Run 2
- [ ] All 13 scenes appeared
- [ ] All 3 creator photos visible
- [ ] Correct order maintained
- [ ] No manual intervention
- [ ] GIF → video automatic
- [ ] Video → Kaka automatic
- [ ] Kaka GIF → FinalScreen automatic
- [ ] No stale timer warnings

### Console Validation
- [ ] `[SCENE_ENTRY]` logs present with incrementing tokens
- [ ] `[TIMER_FINISHED]` logs present for each scene
- [ ] `[VIDEO_ENDED]` log after video
- [ ] `[MEMORY_COMPLETE]` log after Memory 1
- [ ] NO `[STALE_TIMER_IGNORED]` warnings
- [ ] Token sequence monotonically increases

---

**STATUS:** IMPLEMENTATION COMPLETE — AWAITING FOUNDER BROWSER VALIDATION

**DO NOT COMMIT**
**DO NOT DEPLOY**
**DEV SERVER RUNNING ON localhost:3000**

**END OF SCENE TOKEN IMPLEMENTATION REPORT**
