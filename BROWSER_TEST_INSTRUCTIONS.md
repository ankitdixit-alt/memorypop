# Browser Test Instructions - Tile Transitions

**Test URL:** http://127.0.0.1:3001/ai-director-reveal

---

## Quick Start

1. **Open browser** (should already be open)
2. **Open DevTools** (Cmd+Option+I)
3. **Check Console** for any errors
4. **Follow test sequence** below

---

## Test Sequence

### Phase 1: Initial Visual Check (Birthday, AI Director)

**Before clicking "Begin":**
- [ ] Page loads without errors (check console)
- [ ] "AI Director concept" tab is selected (should have ✦ symbol)
- [ ] "Subtle decorative motif" checkbox is checked
- [ ] Two cover photos visible

**Action: Click "Begin the reveal"**

**Observe First Transition (Opening → Chapter 1):**
- [ ] Do you see a grid of semi-transparent tiles covering the screen?
- [ ] Do the tiles animate away from center outward?
- [ ] Does the animation feel fast (under 1 second)?
- [ ] Does "The good kind of chaos" chapter title appear cleanly underneath?
- [ ] Are there any visual artifacts or flickering?

**Timing Check:**
- Start a stopwatch when you click "Begin"
- Stop when the chapter title is fully visible
- **Expected:** 400-600ms total
- **Actual:** ___________ms

### Phase 2: Memory Transition (Chapter → Sarah)

**After chapter card auto-advances:**

**Observe Second Transition (Chapter 1 → Sarah Mitchell):**
- [ ] Do tiles appear again?
- [ ] Do they flip out left-to-right (like pages flipping)?
- [ ] Does the animation feel playful and energetic?
- [ ] Does Sarah's message appear: "Happy 30th! Remember when we tried to bake..."
- [ ] Does her hero photo appear?
- [ ] Are tiles completely gone after animation finishes?
- [ ] Is there any overlap with text or photo?

**Timing Check:**
- **Expected:** 500-700ms total
- **Actual:** ___________ms

### Phase 3: Within Same Memory (Photo → Photo)

**Action: Click "Next" to advance to Sarah's second photo**

**Observe Transition:**
- [ ] Do tiles appear? (They should NOT - should be simple fade)
- [ ] Is the message still visible? (Should NOT repeat)
- [ ] Does the photo change smoothly?

**Expected:** Simple fade, no tiles, no message repetition

### Phase 4: Memory to Memory (Sarah → Jake)

**Action: Click "Next" until you reach Jake Rodriguez**

**Observe Transition:**
- [ ] Do tiles appear again? (They SHOULD)
- [ ] What pattern do they use? (Should be slideOut or flipOut for birthday)
- [ ] Does Jake's message appear: "Hey Em! Still can't believe we survived..."
- [ ] Is the transition smooth and cinematic?

### Phase 5: Video Protection Check

**Action: Navigate to Sarah Mitchell's video beat**
- In developer inspector, select "Sarah Mitchell" from dropdown
- Click through her photos until you reach the video

**Observe Transition (Photo → Video):**
- [ ] Do tiles appear? (They should NOT - video uses crossfade)
- [ ] Does the video element appear smoothly?
- [ ] No stuttering or interruption?

**Action: Click "Next" to leave video**

**Observe Transition (Video → Next Memory):**
- [ ] Do tiles appear? (They SHOULD reappear for next memory)
- [ ] Video playback stopped cleanly?

### Phase 6: Finale Check

**Action: Use developer inspector to jump to finale**
- Click "Jump to finale" button

**Observe Finale Transition:**
- [ ] Do tiles cascade down like falling leaves?
- [ ] Slower, more emotional animation? (600ms)
- [ ] Does Mom's message appear: "My dearest Emma, watching you grow..."
- [ ] Does it feel special and climactic?

### Phase 7: Mobile Check

**Action: Resize browser to 600px width**
- Use DevTools responsive design mode
- Set width to 600px

**Navigate through a few memories:**
- [ ] Do tiles still appear?
- [ ] Are there fewer tiles visible? (Should be 6×5 = 30 tiles vs 10×8 = 80)
- [ ] Is performance smooth (no lag)?
- [ ] Do tiles disappear cleanly?

### Phase 8: Other Occasions

**Action: Reload page and change occasion to "Anniversary"**
- Select "Anniversary" from occasion dropdown
- Click "Begin the reveal"

**Observe Transitions:**
- [ ] Do tiles fade out in diagonal wave pattern?
- [ ] Does it feel elegant and romantic (not playful)?
- [ ] Is the animation softer than birthday?

**Action: Change to "Sympathy"**
- Select "Sympathy" from occasion dropdown
- Click "Begin the reveal"

**Observe Transitions:**
- [ ] Are most transitions simple fades? (They SHOULD be - respectful)
- [ ] Do tiles only appear on finale? (Gentle cascade only)
- [ ] Does the overall feel seem calm and subdued?

### Phase 9: Standard Mode Comparison

**Action: Switch to "Standard reveal" tab**
- Click "Standard reveal" button
- Click "Begin"

**Observe:**
- [ ] Are there ANY tiles? (There should be NONE - all simple fades)
- [ ] Does the experience look identical to before tile implementation?
- [ ] Does the message repeat with every asset? (Should repeat - this is intentional)

### Phase 10: Stress Test

**Action: Rapid clicking**
- Return to "AI Director concept" mode
- Click "Begin"
- Click "Next" rapidly 10 times

**Observe:**
- [ ] Do tiles stack up? (They should NOT)
- [ ] Any visual glitches?
- [ ] Any console errors?
- [ ] Does performance degrade?

**Action: Pause during transition**
- Click "Play"
- Wait for tile animation to start
- Immediately click pause

**Observe:**
- [ ] Do tiles finish animating even when paused?
- [ ] Are there stuck tiles?
- [ ] Does resume work correctly?

---

## Console Check

**Open DevTools Console:**

**Expected:**
- No errors
- No warnings
- No "Failed to load" messages

**If you see errors, document them:**
- Error message: ___________________
- File/line: ___________________
- When it occurred: ___________________

---

## Network Check

**Open DevTools Network Tab:**
- Clear network log
- Reload page
- Play through entire reveal

**Expected:**
- All requests to `http://127.0.0.1:3001`
- All media from `/ai-director-reveal/media/*`
- NO requests to:
  - Gemini API
  - Supabase
  - External domains

**If you see unexpected requests, document them:**
- URL: ___________________
- Status: ___________________
- When: ___________________

---

## Performance Check

**Open DevTools Performance Tab:**
- Start recording
- Navigate through 5-10 transitions
- Stop recording

**Check:**
- [ ] Frame rate during transitions: _____ FPS (target: 60)
- [ ] Any dropped frames?
- [ ] GPU acceleration active? (Check Layers panel)
- [ ] Memory stable? (No continuous increase)

---

## Summary Questions

After completing all tests:

**1. Do the tile transitions feel premium and cinematic?**
- [ ] Yes, much better than before
- [ ] Somewhat better
- [ ] No noticeable difference
- [ ] Worse than before

**2. Is the timing right?**
- [ ] Too fast (feels rushed)
- [ ] Perfect (cinematic and smooth)
- [ ] Too slow (feels sluggish)

**3. Are there any visual issues?**
- [ ] Text overlap after transition
- [ ] Media overlap after transition
- [ ] Tiles don't disappear completely
- [ ] Visual artifacts/flickering
- [ ] Other: ___________________

**4. Do occasion-specific transitions match the tone?**
- [ ] Birthday feels playful ✓
- [ ] Anniversary feels elegant ✓
- [ ] Retirement feels confident ✓
- [ ] Sympathy feels respectful ✓

**5. Is performance acceptable?**
- [ ] Smooth 60 FPS desktop
- [ ] Smooth on mobile
- [ ] Some lag but acceptable
- [ ] Unacceptable lag or stuttering

**6. Any console errors or warnings?**
- [ ] None (clean console)
- [ ] Minor warnings (document below)
- [ ] Errors (document below)

**7. Does Standard mode work correctly?**
- [ ] No tiles visible ✓
- [ ] Simple fades only ✓
- [ ] Backward compatible ✓

**8. Overall assessment:**
- [ ] Ship it - ready for production
- [ ] Minor tweaks needed (specify)
- [ ] Major issues found (specify)

---

## Issues Found (Document Here)

**Issue 1:**
- Description: ___________________
- Severity: [ ] Critical  [ ] Major  [ ] Minor
- Steps to reproduce: ___________________
- Screenshot/video: ___________________

**Issue 2:**
- Description: ___________________
- Severity: [ ] Critical  [ ] Major  [ ] Minor
- Steps to reproduce: ___________________

---

## Recommendations

Based on testing, should we:

- [ ] Ship as-is (no changes needed)
- [ ] Tune timing (specify: make transitions _____ ms)
- [ ] Adjust tile count (specify: _____ tiles)
- [ ] Fix visual overlap (specify where)
- [ ] Change occasion mapping (specify which)
- [ ] Add/remove variants (specify)
- [ ] Other: ___________________

---

**Tester:** ___________________
**Date:** ___________________
**Browser:** ___________________
**OS:** ___________________
**Viewport:** _____px × _____px

