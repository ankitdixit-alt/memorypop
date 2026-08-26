# Increment 1 Corrections - Phase 6: Music Debugging & Lifecycle Fixes

**Date:** 2026-08-17
**Status:** COMPLETE ✅

---

## Problems Identified

**File:** `/src/app/m/[shareCode]/reveal/RevealExperience.tsx`

### 1. No Console Logs for Debugging

**Problem:** Music lifecycle had minimal logging, making it hard to diagnose playback issues.

**Missing logs:**
- Audio initialization
- Play/pause events
- Volume changes
- Ducking events
- Mute state changes

### 2. Mute Button Lacks Visible Label

**Problem:** Mute button only showed icon with `aria-label`, no visible text label for clarity.

**User confusion:** Users may not understand what the button does without a label.

### 3. Video+Music Interaction Bug

**Problem:** When switching away from video tab (to photos or GIF), soundtrack remained ducked at 20% volume instead of restoring to 50%.

**Root cause:**
- Old `useEffect` (lines 599-615) used `document.querySelectorAll('audio')` approach
- Set volume to 0.2 when playing, 1.0 when paused
- Conflicted with callback-based ducking (which uses 0.5 as normal volume)
- Didn't respect mute state
- `handleMediaSwitch` didn't call `onVideoRestore` when leaving video context

---

## Changes Made

### 1. Enhanced Audio Lifecycle Logging

**Lines modified:** 82-108, 111-123, 126-145, 136-161

**Added comprehensive console logs:**

```typescript
// Audio initialization
console.log('[Audio Lifecycle] Initializing audio:', {
  soundtrack: soundtrack.track,
  title: soundtrack.title,
  isMuted,
  currentStep,
});

console.log('[Audio Lifecycle] Audio element created:', {
  loop: audio.loop,
  volume: audio.volume,
  src: audio.src,
});

console.log('[Audio Lifecycle] Audio ready (canplay event fired)');

// Playback control
console.log('[Audio Control] Starting playback (currentStep > 0):', {
  currentStep,
  volume: audioRef.current.volume,
  paused: audioRef.current.paused,
});

console.log('[Audio Control] ✅ Playback started successfully');
console.log('[Audio Control] ❌ Play failed:', err.message);

// Mute control
console.log('[Audio Control] Mute state changed:', {
  isMuted,
  newVolume,
  oldVolume: audioRef.current.volume,
});

console.log('[Audio Control] User toggled mute button:', {
  oldState: isMuted,
  newState: !isMuted,
});

// Video ducking
console.log('[Video Ducking] Ducking soundtrack (video playing):', {
  oldVolume: audioRef.current.volume,
  newVolume: 0.2,
});

console.log('[Video Ducking] Restoring soundtrack (video paused/ended):', {
  oldVolume: audioRef.current.volume,
  newVolume: 0.5,
});
```

**Benefits:**
- Complete visibility into audio lifecycle
- Easy diagnosis of autoplay blocks
- Track volume changes in real time
- Understand ducking behavior

---

### 2. Added Visible Label to Mute Button

**Lines modified:** 659-695

**Before:**
```typescript
<button
  onClick={onMuteToggle}
  className="flex items-center gap-2 text-sm text-[#856b5f] hover:text-[#3a241e] transition-colors"
  aria-label={isMusicMuted ? "Unmute music" : "Mute music"}
>
  {isMusicMuted ? (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      {/* Muted icon */}
    </svg>
  ) : (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      {/* Playing icon */}
    </svg>
  )}
</button>
```

**After:**
```typescript
<button
  onClick={onMuteToggle}
  className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/80 hover:bg-white shadow-sm text-sm text-[#856b5f] hover:text-[#3a241e] transition-all"
  aria-label={isMusicMuted ? "Unmute music" : "Mute music"}
  title={isMusicMuted ? "Click to unmute music" : "Click to mute music"}
>
  {isMusicMuted ? (
    <>
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        {/* Muted icon */}
      </svg>
      <span className="font-medium">Muted</span>
    </>
  ) : (
    <>
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        {/* Playing icon */}
      </svg>
      <span className="font-medium">Music</span>
    </>
  )}
</button>
```

**Changes:**
- Added visible text label: "Music" (when playing) or "Muted" (when muted)
- Added white background pill for better visibility
- Added tooltip with `title` attribute
- Enhanced hover state with background color change

**Benefits:**
- Clear indication of music state
- Better user affordance
- Accessible and discoverable

---

### 3. Fixed Video+Music Interaction Bug

#### 3a. Removed Conflicting useEffect

**Lines removed:** 599-615

**Before (removed):**
```typescript
// Audio ducking: Pause/restore background audio
useEffect(() => {
  // Find background audio element (if exists)
  const audioElements = document.querySelectorAll('audio');

  if (isVideoPlaying) {
    // Duck audio when video plays
    audioElements.forEach(audio => {
      audio.volume = 0.2; // Duck to 20%
    });
  } else {
    // Restore audio when video pauses/ends
    audioElements.forEach(audio => {
      audio.volume = 1.0; // Restore to 100% ❌ WRONG
    });
  }
}, [isVideoPlaying]);
```

**After (replaced with comment):**
```typescript
// Increment 1 - Phase 6: Removed old document.querySelectorAll approach
// Audio ducking is now handled via onVideoDuck/onVideoRestore callbacks passed from parent
// This ensures correct volume restoration (0.5, not 1.0) and respects mute state
```

**Problem with old approach:**
- Set volume to 1.0 (100%) instead of 0.5 (50%)
- Ignored mute state
- Conflicted with callback-based ducking

---

#### 3b. Updated handleMediaSwitch to Restore Soundtrack

**Lines modified:** 617-634

**Before:**
```typescript
const handleMediaSwitch = (newMediaType: MediaType) => {
  // Pause video if switching away from it
  if (activeMedia === 'video' && videoRef.current) {
    videoRef.current.pause();
    setIsVideoPlaying(false);
  }

  setActiveMedia(newMediaType);
};
```

**After:**
```typescript
const handleMediaSwitch = (newMediaType: MediaType) => {
  console.log('[Media Switch] Switching media type:', {
    from: activeMedia,
    to: newMediaType,
    isVideoPlaying,
  });

  // Pause video if switching away from it
  if (activeMedia === 'video' && videoRef.current) {
    console.log('[Media Switch] Pausing video and restoring soundtrack');
    videoRef.current.pause();
    setIsVideoPlaying(false);
    // CRITICAL: Restore soundtrack immediately when leaving video context
    if (onVideoRestore) onVideoRestore();
  }

  setActiveMedia(newMediaType);
};
```

**Fix:** Added `onVideoRestore()` call to immediately restore soundtrack volume to 50% when switching away from video.

---

#### 3c. Enhanced Video Event Handler Logging

**Lines modified:** 628-661

**Before:**
```typescript
const handleVideoPlay = () => {
  setIsVideoPlaying(true);
  if (onVideoDuck) onVideoDuck();
};

const handleVideoPause = () => {
  setIsVideoPlaying(false);
  if (onVideoRestore) onVideoRestore();
};

const handleVideoEnded = () => {
  setIsVideoPlaying(false);
  if (onVideoRestore) onVideoRestore();
};
```

**After:**
```typescript
const handleVideoPlay = () => {
  console.log('[Video Events] Video started playing');
  setIsVideoPlaying(true);
  if (onVideoDuck) {
    onVideoDuck();
  } else {
    console.warn('[Video Events] onVideoDuck callback not provided');
  }
};

const handleVideoPause = () => {
  console.log('[Video Events] Video paused');
  setIsVideoPlaying(false);
  if (onVideoRestore) {
    onVideoRestore();
  } else {
    console.warn('[Video Events] onVideoRestore callback not provided');
  }
};

const handleVideoEnded = () => {
  console.log('[Video Events] Video ended');
  setIsVideoPlaying(false);
  if (onVideoRestore) {
    onVideoRestore();
  } else {
    console.warn('[Video Events] onVideoRestore callback not provided');
  }
};
```

**Changes:**
- Added console logs for all video events
- Added warnings if callbacks are missing
- Makes debugging easier

---

## Expected Behavior After Fix

### Music Lifecycle (with logging)

**1. Welcome screen:**
- Console: `[Audio Lifecycle] Initializing audio`
- Console: `[Audio Lifecycle] Audio element created`
- Console: `[Audio Lifecycle] Audio ready (canplay event fired)`
- Music: Paused (not playing)

**2. User clicks "Open My MemoryPop":**
- Console: `[Audio Control] Starting playback (currentStep > 0)`
- Console: `[Audio Control] ✅ Playback started successfully` (or autoplay blocked)
- Music: Playing at 50% volume

**3. User clicks mute button:**
- Console: `[Audio Control] User toggled mute button`
- Console: `[Audio Control] Mute state changed`
- Button: Shows "Muted" label
- Music: Volume set to 0

**4. User clicks unmute button:**
- Console: `[Audio Control] User toggled mute button`
- Console: `[Audio Control] Mute state changed`
- Button: Shows "Music" label
- Music: Volume restored to 50%

### Video+Music Interaction (fixed)

**Scenario 1: User plays video**
- Console: `[Video Events] Video started playing`
- Console: `[Video Ducking] Ducking soundtrack (video playing)`
- Music: Volume reduced to 20%
- Video: Playing with audio

**Scenario 2: User pauses video**
- Console: `[Video Events] Video paused`
- Console: `[Video Ducking] Restoring soundtrack (video paused/ended)`
- Music: Volume restored to 50% immediately ✅

**Scenario 3: Video ends**
- Console: `[Video Events] Video ended`
- Console: `[Video Ducking] Restoring soundtrack (video paused/ended)`
- Music: Volume restored to 50% immediately ✅

**Scenario 4: User switches from video to photos (THE FIX)**
- Console: `[Media Switch] Switching media type: { from: 'video', to: 'photos' }`
- Console: `[Media Switch] Pausing video and restoring soundtrack`
- Console: `[Video Ducking] Restoring soundtrack (video paused/ended)`
- Video: Paused
- Music: Volume restored to 50% immediately ✅ (was staying at 20% before)

**Scenario 5: User switches from video to GIF (THE FIX)**
- Console: `[Media Switch] Switching media type: { from: 'video', to: 'gif' }`
- Console: `[Media Switch] Pausing video and restoring soundtrack`
- Console: `[Video Ducking] Restoring soundtrack (video paused/ended)`
- Video: Paused
- Music: Volume restored to 50% immediately ✅ (was staying at 20% before)

---

## Manual Testing Required

### Test 1: Audio Lifecycle Logging

- [ ] Open browser console (F12)
- [ ] Visit `/m/${shareCode}/reveal`
- [ ] **Verify:** Console shows audio initialization logs
- [ ] Click "Open My MemoryPop"
- [ ] **Verify:** Console shows playback start logs
- [ ] **Verify:** Music is audible (if autoplay allowed) or starts on next action

### Test 2: Mute Button Label

- [ ] View reveal experience
- [ ] **Verify:** Mute button shows "Music" label (not just icon)
- [ ] **Verify:** Button has white pill background
- [ ] Hover over button
- [ ] **Verify:** Tooltip shows "Click to mute music"
- [ ] Click mute button
- [ ] **Verify:** Button changes to "Muted" label
- [ ] **Verify:** Tooltip shows "Click to unmute music"
- [ ] **Verify:** Music stops
- [ ] Click unmute button
- [ ] **Verify:** Button changes back to "Music" label
- [ ] **Verify:** Music resumes

### Test 3: Video Ducking (Normal Flow)

- [ ] Navigate to a memory with video
- [ ] **Verify:** Music playing at normal volume
- [ ] Click video play button
- [ ] **Verify:** Console shows ducking logs
- [ ] **Verify:** Music volume reduces (still audible but quieter)
- [ ] Pause video
- [ ] **Verify:** Console shows restore logs
- [ ] **Verify:** Music volume immediately returns to normal

### Test 4: Video+Photos Switching (THE CRITICAL FIX)

- [ ] Navigate to a memory with BOTH video AND photos
- [ ] Switch to video tab
- [ ] Play video
- [ ] **Verify:** Music ducked to 20%
- [ ] **Verify:** Console shows ducking logs
- [ ] Switch to photos tab (while video was playing)
- [ ] **Verify:** Console shows `[Media Switch] Pausing video and restoring soundtrack`
- [ ] **Verify:** Music volume immediately restores to 50% ✅
- [ ] **Verify:** Music is audibly louder again

### Test 5: Video+GIF Switching (THE CRITICAL FIX)

- [ ] Navigate to a memory with BOTH video AND GIF
- [ ] Switch to video tab
- [ ] Play video
- [ ] **Verify:** Music ducked to 20%
- [ ] Switch to GIF tab (while video was playing)
- [ ] **Verify:** Console shows restoration logs
- [ ] **Verify:** Music volume immediately restores to 50% ✅

### Test 6: Memory Navigation During Video

- [ ] Navigate to memory with video
- [ ] Play video
- [ ] **Verify:** Music ducked
- [ ] Click "Next" to go to next memory
- [ ] **Verify:** Music volume restored immediately
- [ ] **Verify:** Previous video stopped playing

---

## Summary

**Phase 6 Results:**

- ✅ Added comprehensive audio lifecycle logging (initialization, play, pause, volume, ducking)
- ✅ Added visible "Music" / "Muted" label to mute button with pill background
- ✅ Fixed video+music interaction bug: soundtrack now restores immediately when leaving video context
- ✅ Removed conflicting document.querySelectorAll useEffect
- ✅ Updated handleMediaSwitch to call onVideoRestore when switching away from video
- ✅ Enhanced all video event handlers with logging

**Files modified:**
1. `/src/app/m/[shareCode]/reveal/RevealExperience.tsx` - Added logging, fixed ducking bug, improved mute button

**Total:** 1 file modified, ~15 functions enhanced, ~40 lines added/modified

---

## Next Steps

**Phase 3:** Real curated GIF assets (6-8 real animated GIFs from GIPHY/Tenor)
**Phase 4:** Creator multimedia parity (shared components + API changes)
**Browser Testing:** Comprehensive validation (11 scenarios)
**Final Report:** Generate report with exact retest URLs and STOP

---

**Status:** Phase 6 complete, ready for Phase 3 ✅
**Build:** Not yet tested (will test after all phases)
**Blockers:** None
