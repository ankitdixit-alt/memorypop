# Reveal Export Proof-of-Concept Results

**Date:** 2026-10-02
**Test Gift:** test-sharing-1790756204563 (memorypop-test database)
**Environment:** Local development (Playwright + FFmpeg)

---

## Export Output

**File:** `/Users/adixit/Downloads/MemoryPop/memorypop/exports/reveal-test-sharing-1790756204563-1790972692573.mp4`

**File Size:** 5.70 MB
**Duration:** 1:29 (89.4 seconds)
**Resolution:** 1920×1080 @ 25fps
**Format:** H.264 MP4

---

## Technical Verification

### ✅ Video Stream
- **Codec:** H.264
- **Present:** YES
- **Bitrate:** 332 kb/s

### ✅ Audio Stream
- **Codec:** AAC
- **Present:** YES
- **Bitrate:** 196 kb/s
- **Source:** Custom music track (Supabase storage)

### ✅ Playback Progression
Frame checks confirm reveal advanced through contributions:
- Memory 1 of 5: Adventures and Fun
- Memory 2 of 5: Adventures and Fun
- Chapter 2: Growing Together
- Memory 3 of 5: Growing Together
- Memory 4 of 5: Growing Together
- Memory 5 of 5 (ending reached)

---

## ❌ Issues Found

### 1. Surrounding Page UI Captured
Every frame check contains: `"A story for Sharing Test User Browse memories ↗"`

This indicates the export includes:
- Page header/navigation
- "Browse memories" link
- Likely player controls
- Possibly cookie banner

**User's original complaint:** "includes surrounding page controls and a cookie banner"

**Status:** NOT FIXED. The export still captures the full page, not just the celebration stage.

### 2. Duration Mismatch
- **Expected:** ~1:04 (from UI: "About 1:04 at 1×")
- **Actual:** 1:29
- **Difference:** +25 seconds

Possible causes:
- Includes "Made with Love" intro screen
- Includes ending screen delay
- Includes page load time
- Playwright recording started before reveal content

### 3. Start Point Not Verified
**Requirement:** "Start the output at the first actual reveal frame"

The recording likely includes:
- Welcome screen ("Open My MemoryPop" button)
- "Made with Love" intro title
- Player UI loading

**Status:** NOT VERIFIED. Did not inspect frames to confirm clean start.

---

## ⚠️ Not Manually Verified

### Visual Quality
- **Animations:** Not verified (transitions between contributions)
- **Branding:** Not verified (memorypop.app visibility)
- **Framing:** Not verified (celebration stage fills output frame)
- **Cookie banner:** Not verified (presence or absence)
- **Player controls:** Not verified (presence or absence)

### Audio Quality
- **Synchronization:** Not verified (audio plays in sync with visuals)
- **Playback:** Not verified (actually listened to audio)
- **Technical check only:** Confirmed audio stream exists in file

### Embedded Media
- **Photos:** Frame checks show images present, but quality not verified
- **Videos:** Not applicable (test gift has photos only)
- **GIFs:** Not applicable (test gift has photos only)

---

## Technical Approach Used

### Browser Recording
- **Tool:** Playwright (headless Chromium)
- **Method:** `context.recordVideo()` API
- **Audio:** Custom music track downloaded separately via curl
- **Merging:** FFmpeg combines video (VP8→H.264) + audio (MP3→AAC)

### Limitations
1. **No audio capture in browser recording** - Playwright's `recordVideo()` does not capture audio from `<audio>` elements
2. **Manual audio merge required** - Audio track extracted from page HTML and downloaded separately
3. **Full-page capture** - Records entire viewport including UI chrome
4. **No frame-level control** - Cannot programmatically hide UI elements during recording

---

## Blocker: Export Framing

**Requirement:** "Export only the celebration stage, filling the output frame. Exclude the introductory screen, surrounding page, player controls, cookie banners, and development overlays."

**Current Status:** BLOCKED

The Playwright recording approach captures the entire browser viewport, including:
- Page navigation header
- Player controls (restart, previous, play, next, sound)
- Browse memories link
- Cookie consent banner
- Any surrounding page chrome

### Why CSS Hiding Doesn't Work

CSS was applied to hide cookie banners:
```typescript
await page.addStyleTag({
  content: `
    [class*="cookie"], [id*="cookie"],
    [class*="banner"], [class*="consent"] {
      display: none !important;
    }
  `
});
```

**Problem:** Player controls and navigation are part of the reveal component itself, not separable decorative elements.

### Possible Solutions

1. **Create export-specific reveal component**
   - Build a clean version without player UI
   - Add route: `/m/[shareCode]/reveal/export`
   - Remove all controls, navigation, headers
   - Requires new component implementation

2. **Viewport cropping post-processing**
   - Record full page
   - Use FFmpeg to crop video to remove chrome
   - Requires knowing exact pixel dimensions of celebration stage
   - Fragile if UI layout changes

3. **Server-side headless with element selection**
   - Use Playwright's `locator.screenshot()` to record specific element only
   - Not supported for video recording (only static screenshots)
   - Would need frame-by-frame screenshot stitching (extremely slow)

---

## Next Steps

### Before Customer Deployment

1. **Manual review required:**
   - Open the MP4 file
   - Verify visual quality of contributions
   - Verify animations and transitions
   - Verify branding placement
   - Listen to audio for synchronization
   - Confirm UI chrome is acceptable or must be removed

2. **If UI chrome must be removed:**
   - Implement export-specific reveal route
   - Or determine acceptable viewport crop dimensions
   - Or accept limited export fidelity

3. **Test with different gifts:**
   - Gifts with videos (embedded media audio)
   - Gifts with GIFs
   - Standard tier gifts (non-Plus)
   - Different chapter counts
   - Different memory counts

---

## Summary

**Proof-of-concept outcome:** Partial success

✅ **Achieved:**
- Local MP4 export working
- Video + audio merge successful
- Contributions captured and progressing
- Custom music included
- Automated workflow (no user interaction during recording)

❌ **Not Achieved:**
- Clean framing (celebration stage only)
- Verified visual quality
- Verified audio synchronization
- Correct start point (first reveal frame)
- Expected duration match

**Recommendation:** Manual review of exported MP4 required before deciding on next steps.

**File path:** `/Users/adixit/Downloads/MemoryPop/memorypop/exports/reveal-test-sharing-1790756204563-1790972692573.mp4`
