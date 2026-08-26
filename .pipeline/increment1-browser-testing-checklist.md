# Increment 1 Corrections - Browser Testing Checklist

**Date:** 2026-08-17
**Status:** Ready for Founder Validation

---

## Testing Environment

**Test URL:** https://memorypop.app (or staging URL)

**Required test share codes:**
- **Sympathy MemoryPop:** [Founder to provide - must have occasion="sympathy"]
- **Mixed multimedia MemoryPop:** [Founder to provide - must have memories with photos + GIF + video]
- **Any MemoryPop:** Can use existing test MemoryPops

**Browsers to test:**
- Chrome (desktop + mobile)
- Safari (desktop + mobile)
- Firefox (desktop)
- Edge (desktop)

---

## Phase 1: Occasion Atmosphere Configuration

### Test 1.1: Sympathy Occasion Shows Correct Atmospheres

**Test URL:** `/create` with occasion=sympathy

**Steps:**
1. Visit `/create`
2. Select "Sympathy" occasion
3. Enter recipient name
4. Click "Continue"
5. **Verify:** Atmosphere selector shows ONLY 4 options:
   - Warm & Heartfelt
   - Thoughtful & Meaningful
   - Nostalgic & Reflective
   - Simple & Classic
6. **Verify:** NO "Playful & Fun" option
7. **Verify:** NO "Joyful & Celebratory" option

**Expected result:** ✅ Sympathy shows 4 appropriate atmospheres (NO playful/joyful)

---

### Test 1.2: Other Occasions Show Correct Atmospheres

**Test occasions:**
- Birthday (should show all 6 atmospheres)
- Wedding (should show 5 atmospheres, NO playful)
- Retirement (should show 5 atmospheres)

**Steps:**
1. Visit `/create`
2. Select test occasion
3. Enter recipient name
4. Click "Continue"
5. **Verify:** Atmosphere count matches expected
6. **Verify:** Atmosphere options are emotionally appropriate

**Expected result:** ✅ All 15 occasions show correct atmosphere count and options

---

## Phase 2: DetailModal Video Autoplay Fix

### Test 2.1: Video Does NOT Autoplay on Modal Open

**Test URL:** `/m/[shareCode]` (Memory Wall with video memory)

**Steps:**
1. Visit Memory Wall with at least one memory containing video
2. Click on memory card with video
3. DetailModal opens
4. **Verify:** Video is PAUSED (not playing)
5. **Verify:** No audio heard
6. **Verify:** Video shows first frame/poster
7. **Verify:** Play button visible in browser controls

**Expected result:** ✅ Video does NOT autoplay, stays paused

---

### Test 2.2: Video Plays When User Clicks Play

**Steps:**
1. Open DetailModal with video (from Test 2.1)
2. Click Play button on video controls
3. **Verify:** Video starts playing
4. **Verify:** Audio is audible (if unmuted)
5. **Verify:** User has full control (pause, seek, volume)

**Expected result:** ✅ Video plays only when user explicitly clicks Play

---

### Test 2.3: Video Resets on Modal Close/Reopen

**Steps:**
1. Open DetailModal with video
2. Play video partway through (e.g., 5 seconds)
3. Close DetailModal
4. Reopen same memory card
5. **Verify:** Video is PAUSED at 0:00 (reset to start)
6. **Verify:** No automatic playback

**Expected result:** ✅ Video resets to beginning and stays paused

---

## Phase 5: Reveal Consolidation

### Test 5.1: No "Premium Experience" Badge on Landing

**Test URL:** `/m/[shareCode]`

**Steps:**
1. Visit MemoryPop landing page (with hasPremiumAccess = true)
2. **Verify:** Choice modal displays
3. **Verify:** NO "✨ Premium Experience" badge visible
4. **Verify:** "Experience the Celebration" button present
5. **Verify:** "Browse Memories" button present

**Expected result:** ✅ No premium badge, clean choice modal

---

### Test 5.2: "Experience the Celebration" Routes to Canonical Reveal

**Test URL:** `/m/[shareCode]`

**Steps:**
1. Visit MemoryPop landing page
2. Click "Experience the Celebration" button
3. **Verify:** URL changes to `/m/[shareCode]/reveal`
4. **Verify:** RevealExperience component loads
5. **Verify:** Welcome screen shows with recipient name
6. **Verify:** "Open My MemoryPop" button visible

**Expected result:** ✅ Routes to canonical `/reveal` page

---

### Test 5.3: Reveal Uses Real Memory Data (Not Fake)

**Test URL:** `/m/[shareCode]/reveal`

**Steps:**
1. Complete Test 5.2 to reach reveal
2. Click "Open My MemoryPop"
3. Navigate through memories
4. **Verify:** Real contributor names from database (not "Sarah Miller" placeholder)
5. **Verify:** Real messages from database
6. **Verify:** Real photos/GIFs/videos from database
7. **Verify:** Correct memory count matches database

**Expected result:** ✅ Reveal shows real data from JSONB columns (photos[], gifs[], video)

---

### Test 5.4: Replay Button Works Correctly

**Test URL:** `/m/[shareCode]/reveal` (after completing experience)

**Steps:**
1. Complete full reveal experience
2. Reach "Reaction Thank You" screen
3. Click "Replay Reveal" button
4. **Verify:** Page reloads
5. **Verify:** Returns to welcome screen
6. **Verify:** Can play through entire experience again

**Expected result:** ✅ Replay works, uses canonical reveal

---

### Test 5.5: Memory Wall Button Works Correctly

**Test URL:** `/m/[shareCode]/reveal` (after completing experience)

**Steps:**
1. Complete full reveal experience
2. Reach "Reaction Thank You" screen
3. Click "Revisit Memory Wall" button
4. **Verify:** Routes to `/m/[shareCode]`
5. **Verify:** Shows Memory Wall (GalleryView)
6. **Verify:** All memories display in gallery format

**Expected result:** ✅ Memory Wall routing works

---

## Phase 6: Music Debugging & Lifecycle

### Test 6.1: Audio Lifecycle Logging

**Test URL:** `/m/[shareCode]/reveal`

**Steps:**
1. Open browser console (F12)
2. Visit reveal page
3. **Verify:** Console shows `[Audio Lifecycle] Initializing audio`
4. **Verify:** Console shows `[Audio Lifecycle] Audio element created`
5. Click "Open My MemoryPop"
6. **Verify:** Console shows `[Audio Control] Starting playback`
7. **Verify:** Console shows `✅ Playback started` or `⚠️ Autoplay blocked`

**Expected result:** ✅ Comprehensive console logs tracking audio lifecycle

---

### Test 6.2: Mute Button Has Visible Label

**Test URL:** `/m/[shareCode]/reveal` (memory screen)

**Steps:**
1. Navigate to any memory screen in reveal
2. Look at top-left corner
3. **Verify:** Mute button shows "Music" label (not just icon)
4. **Verify:** Button has white pill background
5. Hover over button
6. **Verify:** Tooltip shows "Click to mute music"
7. Click mute button
8. **Verify:** Label changes to "Muted"
9. **Verify:** Tooltip shows "Click to unmute music"

**Expected result:** ✅ Mute button has clear visible label and tooltip

---

### Test 6.3: Music Starts Audibly (If Autoplay Allowed)

**Test URL:** `/m/[shareCode]/reveal`

**Steps:**
1. Visit reveal page
2. Click "Open My MemoryPop"
3. **IF autoplay allowed:**
   - **Verify:** Music starts playing audibly
   - **Verify:** Volume at normal level (50%)
4. **IF autoplay blocked:**
   - **Verify:** Console shows autoplay blocked message
   - Navigate to next memory or interact with page
   - **Verify:** Music starts after first user interaction

**Expected result:** ✅ Music either autoplays or starts on first interaction

---

### Test 6.4: Mute/Unmute Works Correctly

**Test URL:** `/m/[shareCode]/reveal` (memory screen)

**Steps:**
1. Ensure music is playing
2. Click "Music" button
3. **Verify:** Button changes to "Muted"
4. **Verify:** Music stops (volume = 0)
5. **Verify:** Console shows mute state change logs
6. Click "Muted" button
7. **Verify:** Button changes back to "Music"
8. **Verify:** Music resumes at normal volume
9. **Verify:** Console shows unmute logs

**Expected result:** ✅ Mute/unmute works, logging confirms state changes

---

### Test 6.5: Video Ducking Works (Normal Flow)

**Test URL:** `/m/[shareCode]/reveal` (memory with video)

**Steps:**
1. Navigate to memory with video
2. **Verify:** Music playing at normal volume
3. Click video play button
4. **Verify:** Console shows `[Video Events] Video started playing`
5. **Verify:** Console shows `[Video Ducking] Ducking soundtrack`
6. **Verify:** Music volume reduces (still audible but quieter)
7. Pause video
8. **Verify:** Console shows `[Video Ducking] Restoring soundtrack`
9. **Verify:** Music volume immediately returns to normal

**Expected result:** ✅ Music ducks during video, restores on pause

---

### Test 6.6: CRITICAL - Switching Away From Video Restores Music

**Test URL:** `/m/[shareCode]/reveal` (memory with video + photos or video + GIF)

**Scenario A: Video + Photos**
1. Navigate to memory with BOTH video AND photos
2. Switch to video tab
3. Play video
4. **Verify:** Music ducked to 20%
5. **While video is playing**, switch to photos tab
6. **Verify:** Console shows `[Media Switch] Pausing video and restoring soundtrack`
7. **Verify:** Console shows `[Video Ducking] Restoring soundtrack`
8. **Verify:** Music volume IMMEDIATELY restores to 50% ✅
9. **Verify:** Music is audibly louder again

**Scenario B: Video + GIF**
1. Navigate to memory with BOTH video AND GIF
2. Switch to video tab
3. Play video
4. **Verify:** Music ducked to 20%
5. **While video is playing**, switch to GIF tab
6. **Verify:** Console shows restoration logs
7. **Verify:** Music volume IMMEDIATELY restores to 50% ✅

**Expected result:** ✅ Music restores immediately when leaving video context (THIS WAS THE BUG)

---

### Test 6.7: Memory Navigation During Video

**Test URL:** `/m/[shareCode]/reveal` (multiple memories, one with video)

**Steps:**
1. Navigate to memory with video
2. Play video
3. **Verify:** Music ducked
4. Click "Next" button to go to next memory
5. **Verify:** Previous video stops playing
6. **Verify:** Music volume restored immediately
7. **Verify:** Console shows restoration logs

**Expected result:** ✅ Music restores when navigating away from video memory

---

## Cross-Browser Testing Matrix

### Desktop Browsers

**Chrome (Latest):**
- [ ] Test 1.1: Sympathy atmospheres
- [ ] Test 2.1: Video no autoplay
- [ ] Test 5.1: No premium badge
- [ ] Test 6.2: Mute button label
- [ ] Test 6.6: Video switching fix

**Safari (Latest):**
- [ ] Test 1.1: Sympathy atmospheres
- [ ] Test 2.1: Video no autoplay
- [ ] Test 5.1: No premium badge
- [ ] Test 6.2: Mute button label
- [ ] Test 6.6: Video switching fix

**Firefox (Latest):**
- [ ] Test 1.1: Sympathy atmospheres
- [ ] Test 2.1: Video no autoplay
- [ ] Test 5.1: No premium badge
- [ ] Test 6.2: Mute button label
- [ ] Test 6.6: Video switching fix

**Edge (Latest):**
- [ ] Test 1.1: Sympathy atmospheres
- [ ] Test 2.1: Video no autoplay
- [ ] Test 5.1: No premium badge
- [ ] Test 6.2: Mute button label
- [ ] Test 6.6: Video switching fix

---

### Mobile Browsers

**Chrome Mobile (iOS):**
- [ ] Test 2.1: Video no autoplay
- [ ] Test 6.2: Mute button label
- [ ] Test 6.6: Video switching fix

**Safari Mobile (iOS):**
- [ ] Test 2.1: Video no autoplay
- [ ] Test 6.2: Mute button label
- [ ] Test 6.6: Video switching fix

**Chrome Mobile (Android):**
- [ ] Test 2.1: Video no autoplay
- [ ] Test 6.2: Mute button label
- [ ] Test 6.6: Video switching fix

---

## Regression Testing

### Existing Features (Should Still Work)

**Memory Wall:**
- [ ] Gallery view displays all memories
- [ ] Click memory card opens DetailModal
- [ ] DetailModal shows photos/GIF/video correctly
- [ ] Close button works
- [ ] ESC key closes modal

**Contribute Flow:**
- [ ] Can add new memory
- [ ] Can upload 3 photos
- [ ] Can select 1 curated GIF
- [ ] Can upload 1 video (≤15s)
- [ ] Submit works correctly

**Create Flow:**
- [ ] Can create new MemoryPop
- [ ] Step 1: Occasion + recipient
- [ ] Step 2: Story (no multimedia yet - Phase 4 not implemented)
- [ ] Step 3: Preview
- [ ] Submit creates MemoryPop

---

## Known Issues / Not Fixed

**Phase 3: GIF Assets**
- ⏸️ Curated GIFs are still placeholders
- ⏸️ Real animated GIFs not yet sourced from GIPHY/Tenor
- ⚠️ Phase 3 requires founder action (see Phase 3 doc)

**Phase 4: Creator Multimedia**
- ⏸️ Creator cannot add multimedia at creation time
- ⏸️ CreateForm Step 2 only has text story field
- ⚠️ Phase 4 requires 6-8 hours development (see Phase 4 spec)

---

## Testing Sign-Off

**Tester:** _______________
**Date:** _______________

**Phase 1 (Occasion Config):** ☐ PASS  ☐ FAIL
**Phase 2 (Video Autoplay):** ☐ PASS  ☐ FAIL
**Phase 5 (Reveal Consolidation):** ☐ PASS  ☐ FAIL
**Phase 6 (Music Lifecycle):** ☐ PASS  ☐ FAIL

**Critical Issues Found:**
_____________________________________
_____________________________________
_____________________________________

**Minor Issues Found:**
_____________________________________
_____________________________________
_____________________________________

**Regression Issues:**
_____________________________________
_____________________________________
_____________________________________

**Overall Status:** ☐ APPROVED FOR PRODUCTION  ☐ NEEDS FIXES

---

**Notes:** This checklist covers Phases 1, 2, 5, and 6 only. Phases 3 and 4 are documented separately and require additional work before they can be tested.
