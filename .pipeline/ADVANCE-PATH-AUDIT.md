# ADVANCE PATH AUDIT — ALL STATE CHANGE PATHS

**ShareCode:** ec927763-3bbb-4722-a6e0-3c6172571bb0
**Status:** ROOT CAUSE ANALYSIS IN PROGRESS
**Date:** 2026-08-19

---

## A. REVEALEXPERIENCE.TSX — PARENT STATE MACHINE

### State Variables

1. **currentStep** (line 51)
   - Type: `number`
   - Initial: `0`
   - Purpose: Tracks which memory or screen is currently displayed
   - Range: 0 (welcome) → 1..N (memories) → N+1 (final) → N+2 (reaction) → N+3 (thank you)

2. **hasReacted** (line 52)
   - Type: `boolean`
   - Purpose: Tracks whether user has reacted
   - Does not affect scene progression

3. **selectedReaction** (line 53)
   - Type: `string | null`
   - Purpose: Stores reaction type
   - Does not affect scene progression

4. **audioRef** (line 58)
   - Type: `MutableRefObject<HTMLAudioElement | null>`
   - Purpose: Controls soundtrack playback
   - Passed to CinematicMemoryScreen as prop

5. **isMuted** (line 59)
   - Type: `boolean`
   - Purpose: Mute state
   - Does not affect scene progression

6. **isAudioReady** (line 60)
   - Type: `boolean`
   - Purpose: Audio load state
   - Does not affect scene progression

---

### State Change Paths for `currentStep`

#### PATH 1: handleNext()
- **Location:** Lines 173-177
- **Trigger:** Multiple sources (see below)
- **Effect:**
  ```typescript
  setCurrentStep((prev) => prev + 1);
  ```
- **Callers:**
  1. Line 198: WelcomeScreen `onBegin` prop
  2. Line 209: CinematicMemoryScreen `onComplete` prop ← **CRITICAL HANDOFF**
  3. Line 222: FinalScreen `onNext` prop
  4. Line 189: After reaction select

#### PATH 2: handlePrevious()
- **Location:** Lines 179-183
- **Trigger:** CinematicMemoryScreen `onPrevious` prop
- **Effect:**
  ```typescript
  setCurrentStep((prev) => prev - 1);
  ```
- **Caller:** Line 210: CinematicMemoryScreen only

#### PATH 3: handleReactionSelect()
- **Location:** Lines 185-190
- **Effect:** Sets reaction state, then calls `handleNext()`
- **Indirect:** Increments currentStep via handleNext()

---

### Conditional Rendering Based on currentStep

#### Rendering Logic (Lines 193-252)

**Step 0:** WelcomeScreen
- Lines 193-203
- No CinematicMemoryScreen rendered

**Steps 1 to N:** Individual memories
- Lines 204-220
- **CRITICAL:** Mounts CinematicMemoryScreen with:
  - `memory={memories[memoryIndex]}`
  - `onComplete={handleNext}` ← Triggers memory boundary transition
  - `onPrevious={handlePrevious}`
  - `currentIndex={memoryIndex}`
- When currentStep changes within this range:
  - React unmounts old CinematicMemoryScreen
  - React mounts new CinematicMemoryScreen with different memory
  - Component remount = new instance = new timers = new effects

**Step N+1:** FinalScreen
- Lines 221-222

**Step N+2:** ReactionPrompt or ReactionThankYou
- Lines 223-248

---

### Audio Effects

#### Effect 1: Audio initialization (Lines 79-106)
- **Dependency:** `[soundtrack.track]`
- **Lifecycle:**
  - Creates new Audio element
  - Registers event listeners
  - Cleanup: pauses audio, removes listeners, nulls ref
- **Does not directly change currentStep**

#### Effect 2: Audio playback control (Lines 109-121)
- **Dependency:** `[currentStep, isAudioReady]`
- **Effect:**
  - If currentStep > 0, plays audio
  - If currentStep === 0, pauses audio
- **Does not directly change currentStep**

#### Effect 3: Mute control (Lines 124-127)
- **Dependency:** `[isMuted]`
- **Does not directly change currentStep**

---

## B. CINEMATICMEMORYSCREEN.TSX — CHILD STATE MACHINE

### State Variables

1. **currentSceneIndex** (line 104)
   - Type: `number`
   - Initial: `0`
   - Purpose: Tracks which scene within the current memory is displayed
   - Range: 0..sceneSequence.length-1

2. **cinematicState** (line 105)
   - Type: `'PLAYING' | 'PAUSED' | 'VIDEO_PLAYING' | 'VIDEO_PAUSED' | 'TRANSITIONING'`
   - Purpose: Playback state
   - Does not directly trigger scene advance

3. **showControls** (line 106)
   - Type: `boolean`
   - Purpose: Control overlay visibility
   - Does not affect scene progression

---

### Refs (Timers and Guards)

1. **videoRef** (line 108)
   - Type: `MutableRefObject<HTMLVideoElement | null>`
   - Purpose: Reference to video element

2. **sceneTimerRef** (line 109)
   - Type: `MutableRefObject<NodeJS.Timeout | null>`
   - Purpose: Holds current scene timer ID
   - **CRITICAL:** Timer callbacks can fire after component unmount

3. **sceneStartTimeRef** (line 110)
   - Type: `MutableRefObject<number>`
   - Purpose: Records when scene started (for pause/resume)

4. **remainingTimeRef** (line 111)
   - Type: `MutableRefObject<number>`
   - Purpose: Stores remaining time when paused

5. **currentSceneIndexRef** (line 112)
   - Type: `MutableRefObject<number>`
   - Purpose: Track current scene to prevent stale advances
   - **Note:** Not currently used for validation

6. **hasAdvancedRef** (line 113)
   - Type: `MutableRefObject<boolean>`
   - Purpose: Guard against double-advance
   - **CRITICAL:** This is the failed guard mechanism

---

### State Change Paths for `currentSceneIndex`

#### PATH 1: advanceScene()
- **Location:** Lines 141-160
- **Guard:** Lines 143-146 check `hasAdvancedRef.current`
- **Effect:**
  ```typescript
  hasAdvancedRef.current = true;
  if (isLastScene) {
    onComplete(); // ← Triggers parent memory transition
  } else {
    setCurrentSceneIndex(prev => prev + 1);
  }
  ```
- **Callers:** (see below)

#### PATH 2: setCurrentSceneIndex() calls
- Direct callers:
  1. Line 158: In advanceScene() when not last scene
  2. Line 165: In goBack() when currentSceneIndex > 0

#### PATH 3: goBack()
- **Location:** Lines 163-169
- **Effect:**
  - If currentSceneIndex > 0: `setCurrentSceneIndex(prev => prev - 1)`
  - If currentSceneIndex === 0 AND currentIndex > 0: calls `onPrevious()` (parent)
- **Callers:** Line 268 in handleGoBack()

---

### advanceScene() Callers

#### CALLER 1: Timer callback (Line 186)
- **Location:** startSceneTimer() → setTimeout callback
- **Critical issue:**
  ```typescript
  sceneTimerRef.current = setTimeout(() => {
    advanceScene(); // ← Stale closure risk
  }, duration);
  ```
- **Risk:** Callback created in Scene N effect may fire after Scene N+1 mounted

#### CALLER 2: handleVideoEnded() (Line 325)
- **Location:** Video `onEnded` event
- **Code:**
  ```typescript
  hasAdvancedRef.current = false; // Reset guard before advance
  advanceScene();
  ```
- **Risk:** If video ends near memory boundary, may trigger during unmount

#### CALLER 3: handleSkip() (Line 248)
- **Location:** Manual skip button
- **Code:**
  ```typescript
  hasAdvancedRef.current = false; // Bypass guard
  advanceScene();
  ```
- **Safe:** User-triggered, synchronous

---

### Scene Change Effect (Lines 272-305)

#### Trigger
- **Dependency:** `[currentSceneIndex]`
- Fires when currentSceneIndex changes OR when component mounts

#### Critical Sequence
```typescript
useEffect(() => {
  if (!currentScene) return;

  // Line 275-276: Reset guard
  hasAdvancedRef.current = false;
  currentSceneIndexRef.current = currentSceneIndex;

  // Line 280: Reset state
  setCinematicState('PLAYING');

  if (currentScene.type === 'video') {
    // Lines 283-289: Video scene - pause soundtrack, no timer
    if (parentAudioRef?.current) {
      parentAudioRef.current.pause();
    }
    setCinematicState('VIDEO_PLAYING');
  } else {
    // Lines 290-299: Non-video scene - start timer
    const duration = getSceneDuration(currentScene);
    startSceneTimer(duration); // ← Creates new timer

    // Ensure soundtrack playing
    if (parentAudioRef?.current && !isMusicMuted && cinematicState !== 'PAUSED') {
      parentAudioRef.current.play();
    }
  }

  // Line 302-304: Cleanup on unmount or scene change
  return () => {
    clearSceneTimer(); // ← Clears current timer
  };
}, [currentSceneIndex]);
```

#### Cleanup Timing Issue
- Cleanup runs AFTER component unmounts
- Timer callback may fire DURING unmount window
- Timer callback has closure over OLD currentSceneIndex

---

### Manual Control Paths

#### handleSkip() (Lines 231-249)
- Clears timer
- If leaving video, restores soundtrack
- Resets guard: `hasAdvancedRef.current = false`
- Calls advanceScene()

#### handleGoBack() (Lines 251-269)
- Clears timer
- If leaving video, restores soundtrack
- Resets guard: `hasAdvancedRef.current = false`
- Calls goBack()

#### handlePause() (Lines 190-229)
- PLAYING → PAUSED: Clears timer, pauses soundtrack
- PAUSED → PLAYING: Resumes timer with remaining time, resumes soundtrack
- VIDEO_PLAYING → VIDEO_PAUSED: Pauses video
- VIDEO_PAUSED → VIDEO_PLAYING: Resumes video
- **Does not change currentSceneIndex directly**

---

## C. CRITICAL RACE CONDITIONS IDENTIFIED

### RACE #1: Memory Boundary Transition

**Timeline:**
1. Memory 1, Scene 7 (video) ends
2. Video `onEnded` fires → handleVideoEnded() called
3. Line 324: `hasAdvancedRef.current = false`
4. Line 325: advanceScene() called
5. Line 151-156: isLastScene=true → onComplete() called
6. onComplete → parent's handleNext()
7. Parent: `setCurrentStep(1 → 2)` queued
8. React schedules unmount of old CinematicMemoryScreen (Memory 1)
9. React schedules mount of new CinematicMemoryScreen (Memory 2)
10. **BUT:** Old component's cleanup effect (line 302-304) hasn't run yet
11. **AND:** If old timer from Scene 6 or Scene 7 was created but hasn't fired, it's still in event loop
12. React commits: old component unmounts, new component mounts
13. New component (Memory 2): currentSceneIndex = 0
14. New component effect runs: Line 275 resets guard, Line 293 creates NEW timer for Scene 0
15. **CRITICAL:** Old timer from Memory 1 might fire NOW
16. Old timer callback: calls advanceScene() with OLD closure
17. OLD closure sees Memory 1's scenes, but component is GONE
18. React might batch this with new component's render
19. Result: Scene skip or double-advance

**Evidence:**
- User: "Photo 2 of 3 missing during autoplay but appears going backwards"
- Going backwards works because manual navigation resets state cleanly
- Forward autoplay skips because of stale timer firing

---

### RACE #2: Guard Reset Timing

**Timeline:**
1. Scene 1 (photo) timer fires at 5s
2. advanceScene() called
3. Line 143-146: Guard check passes (first advance)
4. Line 149: `hasAdvancedRef.current = true`
5. Line 158: `setCurrentSceneIndex(1 → 2)` QUEUED
6. **BEFORE React commits:**
7. Scene 1 effect cleanup runs: clearSceneTimer()
8. **BUT:** If another timer was created or callback was queued, it's still pending
9. React commits: currentSceneIndex becomes 2
10. Scene 2 effect runs
11. Line 275: `hasAdvancedRef.current = false` ← **GUARD RESET**
12. Line 293: New timer created for Scene 2
13. **NOW:** If stale Scene 1 timer fires (or any queued callback executes)
14. advanceScene() called again
15. Line 143-146: Guard check PASSES (guard was reset)
16. Line 158: `setCurrentSceneIndex(2 → 3)` → Photo 2 skipped

**Why guard failed:**
- Guard is reset at start of new scene (line 275)
- But stale timer from previous scene might not have fired yet
- When it fires, guard is already reset, so it passes

---

### RACE #3: Component Unmount Window

**Timeline:**
1. Memory 1 completes → onComplete() called
2. Parent: setCurrentStep() triggers
3. React: Begin unmounting old CinematicMemoryScreen
4. **Unmount window:** Component is unmounting but cleanup hasn't run
5. If timer fires during this window:
   - Timer callback has closure over OLD memory's data
   - advanceScene() might call setCurrentSceneIndex() on unmounted component
   - Or worse: onComplete() might be called AGAIN
6. React: Cleanup effect runs (line 302-304)
7. clearSceneTimer() clears sceneTimerRef.current
8. **BUT:** If callback already queued in event loop, clearTimeout won't stop it

**Evidence:**
- Photo skip happens at memory boundaries
- User suspects split architecture issue
- Timer ownership not scoped to component instance

---

### RACE #4: Video → Next Scene Transition

**Timeline:**
1. Video scene active (Memory 1, Scene 7)
2. Video playing, no scene timer running
3. Video ends naturally
4. Line 318: handleVideoEnded() fires
5. Lines 320-322: Restore soundtrack
6. Line 324: `hasAdvancedRef.current = false` ← Reset guard
7. Line 325: advanceScene() called
8. Lines 151-156: isLastScene=true, onComplete() called
9. Parent memory transition starts
10. **CRITICAL:** New memory's first scene effect runs
11. Line 275: Guard reset AGAIN (redundant)
12. **BUT:** If video `onEnded` fires multiple times (browser bug?) or if there's a timer from previous scene still pending
13. Multiple advances possible

---

## D. ROOT CAUSE ANALYSIS

### Primary Root Cause: Stale Timer Closures

**Problem:**
- Timer callbacks created in Scene N's effect have closure over Scene N's state
- When Scene N → Scene N+1 transition happens, old callback hasn't fired yet
- Old callback fires AFTER new scene has mounted and reset guard
- Old callback sees old currentSceneIndex but NEW guard state (false)
- advanceScene() executes twice: once for old scene, once for new scene

**Evidence:**
1. User report: "Photo 2 skipped during autoplay"
2. Guard mechanism failed to prevent double-advance
3. Manual navigation works (synchronous, no timer race)
4. Problem happens at scene boundaries

---

### Contributing Cause: Guard Reset Too Early

**Problem:**
- Line 275: `hasAdvancedRef.current = false` at start of new scene effect
- This happens BEFORE all old timers have been cleared or fired
- If old timer fires after guard reset, it passes the guard check

**Fix needed:**
- Don't reset guard at scene entry
- Use scene identity token instead of boolean guard

---

### Contributing Cause: Memory Boundary Unmount Race

**Problem:**
- Memory completion triggers parent state change
- Parent unmounts old CinematicMemoryScreen, mounts new one
- Old component's cleanup runs AFTER unmount starts
- Timer from last scene of old memory might fire during unmount window

**Evidence:**
- User suspects split architecture issue
- Photo skip might correlate with memory transitions

---

### Contributing Cause: Cleanup Timing

**Problem:**
- Cleanup effect (line 302-304) runs AFTER component unmounts
- clearSceneTimer() called too late to prevent queued callbacks
- setTimeout callbacks already in event loop can't be cancelled once queued

**Fix needed:**
- Clear timer BEFORE state change
- Or use more robust timer ownership model

---

## E. PATHS THAT CAN CAUSE SCENE SKIP

### Confirmed Paths

1. **Stale timer + guard reset**
   - Scene 1 timer fires late
   - Scene 2 already mounted, guard reset
   - Old timer calls advanceScene()
   - Scene 2 → Scene 3 (skip Scene 2)

2. **Memory boundary timer race**
   - Last scene of Memory 1 completes
   - Parent transitions to Memory 2
   - Old component unmounting
   - Old timer fires during unmount
   - Might trigger double-advance

3. **Video ended + pending timer**
   - Video ends, triggers advanceScene()
   - But previous scene's timer was also pending
   - Both fire in quick succession
   - Double advance

---

## F. WHY hasAdvancedRef GUARD FAILED

**Intended behavior:**
- Set guard when advancing
- Prevent second advance until reset
- Reset at new scene entry

**Actual behavior:**
- Guard reset happens BEFORE old timers fire
- Timer from Scene 1 fires AFTER Scene 2 has reset guard
- Guard check passes, double-advance happens

**Fundamental flaw:**
- Boolean guard can't distinguish which scene created the timer
- Can't tell if callback is from current scene or stale scene
- Reset timing opens race window

---

## G. WHAT'S NEEDED INSTEAD

### Solution 1: Scene Identity Tokens

Replace `hasAdvancedRef` with `sceneIdentityRef`:

```typescript
const sceneIdentityRef = useRef<number>(0); // Increments every scene

useEffect(() => {
  const thisSceneIdentity = sceneIdentityRef.current + 1;
  sceneIdentityRef.current = thisSceneIdentity;

  const timer = setTimeout(() => {
    // Validate token
    if (sceneIdentityRef.current !== thisSceneIdentity) {
      console.warn('[CinematicMemoryScreen] Stale timer from previous scene, ignoring');
      return;
    }
    advanceScene();
  }, duration);

  return () => clearTimeout(timer);
}, [currentSceneIndex]);
```

**Advantage:**
- Each scene has unique identity
- Stale timers can be detected and ignored
- No reset race window

---

### Solution 2: Flat Timeline Architecture

Replace split architecture (parent memories + child scenes) with ONE flat timeline:

```typescript
// Build entire cinematic sequence upfront
const buildCinematicTimeline = (memories) => {
  const timeline = [{ type: 'welcome' }];

  memories.forEach(memory => {
    timeline.push({ type: 'contributor', memory });
    timeline.push({ type: 'message', memory });
    memory.photos.forEach(photo => timeline.push({ type: 'photo', photo, memory }));
    memory.gifs.forEach(gif => timeline.push({ type: 'gif', gif, memory }));
    if (memory.video) timeline.push({ type: 'video', video: memory.video, memory });
  });

  timeline.push({ type: 'final' });
  return timeline;
};

// Single timeline index, no parent/child split
const [timelineIndex, setTimelineIndex] = useState(0);
```

**Advantage:**
- No memory boundary remount races
- No parent/child state synchronization
- Single state machine
- Deterministic progression

---

### Solution 3: Proper Cleanup Before State Change

Move timer cleanup BEFORE calling advanceScene():

```typescript
const advanceScene = () => {
  // CRITICAL: Clear timer FIRST
  clearSceneTimer();

  // THEN advance
  if (isLastScene) {
    onComplete();
  } else {
    setCurrentSceneIndex(prev => prev + 1);
  }
};
```

**Advantage:**
- Ensures timer cleared before state changes
- Prevents cleanup race

---

## H. RECOMMENDED FIX APPROACH

**PHASE 1: Immediate (Scene Identity Token)**
- Replace hasAdvancedRef with sceneIdentityRef
- Validate timer callbacks against scene identity
- This prevents stale timer double-advance within a single memory
- Minimal code change
- Testable

**PHASE 2: Structural (Flat Timeline)**
- Evaluate full rewrite to flat timeline
- Eliminates memory boundary races
- Requires more testing but removes entire class of bugs
- Better long-term architecture

**PHASE 3: Validation (Automated Tests)**
- Test: Photo1 → Photo2 → Photo3 exactly once
- Test: Stale timer ignored
- Test: Manual controls work
- Test: Video ended exactly one advance
- Test: Memory boundary clean transition

---

## I. NEXT ACTIONS

1. ✅ Complete advance path audit (THIS DOCUMENT)
2. ⬜ Present findings to Founder
3. ⬜ Get approval for Solution 1 (Scene Identity) vs Solution 2 (Flat Timeline)
4. ⬜ Implement approved solution
5. ⬜ Add development trace logging
6. ⬜ Create automated regression tests
7. ⬜ Real browser validation (3 runs minimum)
8. ⬜ Remove trace logging
9. ⬜ Build verification
10. ⬜ Founder production validation

---

## J. SUMMARY FOR FOUNDER

**What causes photo skip:**
Stale timer from Scene 1 fires AFTER Scene 2 has mounted and reset the guard. The guard (hasAdvancedRef) can't distinguish between current scene's timer and previous scene's timer. When Scene 2 resets the guard at line 275, any pending timer from Scene 1 will pass the guard check and cause a double-advance.

**Why hasAdvancedRef didn't work:**
Boolean guard has race window when reset. Timer from old scene fires after guard reset, so it passes the check.

**Correct fix options:**

1. **Scene Identity Token** (fast, surgical)
   - Each scene gets unique ID
   - Timer validates ID before advancing
   - Stale timers detected and ignored

2. **Flat Timeline** (structural, cleaner long-term)
   - Replace parent/child split with single timeline
   - No memory boundary remounts
   - No parent/child state coordination bugs
   - Deterministic progression

**Recommendation:**
Start with Scene Identity Token for surgical fix, then evaluate Flat Timeline for next refactor increment.

---

**END OF ADVANCE PATH AUDIT**
