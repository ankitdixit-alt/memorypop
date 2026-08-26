# Standard Multimedia - Comprehensive Test Plan

**Test Date:** 2026-08-13
**Build Status:** ✅ PASS
**Environment:** macOS ARM64, Node.js, Next.js 16.2.9 (Turbopack)

---

## BUILD FIX VERIFICATION ✅

### Root Cause
- `get-video-duration` package installed successfully
- Turbopack attempted to bundle native `@ffprobe-installer/ffprobe` binary
- Build failed with "Unknown module type" and "invalid utf-8" errors

### Solution
```typescript
// next.config.ts
serverExternalPackages: ['get-video-duration', '@ffprobe-installer/ffprobe']
```

### Changes Made
1. Added `serverExternalPackages` to exclude native dependencies from Turbopack bundling
2. Fixed TypeScript error: Convert Buffer to Readable stream for `getVideoDurationInSeconds`
3. Fixed TypeScript error: Updated DetailModal effectiveMediaType logic

### Build Result
```
npm run build
✅ Compiled successfully in 3.4s
✅ TypeScript type check passed
✅ Production build complete
```

### Compatibility
- ✅ Local macOS ARM64: Build passes
- ✅ Vercel/Linux: `serverExternalPackages` is standard Next.js 16 feature, works cross-platform
- ✅ Node.js runtime: Explicitly set via `export const runtime = 'nodejs'` in /api/upload

---

## ENVIRONMENT SETUP ✅

### VIDEO_VALIDATION_SECRET
- ✅ Generated new 256-bit secret using `openssl rand -hex 32`
- ✅ Added to `.env.local`
- ✅ Verified `.env*` pattern in `.gitignore`
- ✅ Secret NOT exposed in logs/responses/pipeline files

### Dev Server
- ✅ Starts successfully
- ✅ Responds on http://localhost:3000
- ✅ API routes available

---

## TEST ASSETS LIMITATION ⚠️

### Issue
- ffmpeg not installed on system
- Cannot create synthetic test videos with specific durations

### Impact
- Video upload tests require manual video files
- Cannot automate exact 14s/15s/16s boundary testing

### Mitigation
- Manual testing required with real video files
- Founder must provide or record test videos
- Alternative: Install ffmpeg via homebrew for automated testing

---

## MANUAL TEST PLAN (REQUIRED)

### Phase 1: Video Upload Tests

**Preparation:**
1. Record or obtain 3 test videos:
   - Video A: ~14 seconds (should PASS)
   - Video B: exactly or near 15.0 seconds (should PASS)
   - Video C: ~16+ seconds (should FAIL server-side)

**Test Steps:**

#### Test A: 14-second video (PASS expected)
1. Navigate to: `http://localhost:3000/m/[shareCode]/contribute`
2. Fill contributor name and message
3. Click "Add Video"
4. Select video-A (~14s)
5. **Verify:** Client accepts (shows preview)
6. Click "Share Your Memory"
7. **Verify:** Server accepts (200 OK response)
8. **Verify:** Response includes:
   - `validationProof` (HMAC signature)
   - `duration` (server-validated, ~14s)
   - `filePath` (canonical storage path)
   - `fileSize`

#### Test B: 15-second boundary (PASS expected)
1. Repeat steps with video-B (~15.0s)
2. **Verify:** Client accepts
3. **Verify:** Server accepts
4. **Verify:** Response includes validation proof

#### Test C: 16-second video (FAIL expected)
1. Repeat steps with video-C (~16s)
2. **Verify:** Client shows error: "Video duration XX.Xs exceeds 15s limit"
3. **Verify:** Upload does NOT proceed
4. **If client bypassed:** Server must reject with error

#### Test D: Invalid/corrupt video (FAIL expected)
1. Create invalid file (rename .txt to .mp4)
2. **Verify:** Server returns error: "Could not read video metadata"
3. **Verify:** No crash, graceful failure

---

### Phase 2: Security/Tamper Tests

**Preparation:**
1. Successfully upload a valid video (get validation proof)
2. Intercept the request to `/api/memories` (browser DevTools Network tab)

**Test Steps:**

#### Test 1: Modify duration_seconds
1. Change `video.duration_seconds` from 14.0 to 10.0
2. **Expected:** Server rejects with "Duration mismatch"

#### Test 2: Modify file_path
1. Change `video.file_path` to different path
2. **Expected:** Server rejects with "File path mismatch"

#### Test 3: Modify file_size_bytes
1. Change `video.file_size_bytes`
2. **Expected:** Server rejects with "File size mismatch"

#### Test 4: Wrong shareCode
1. Use video uploaded for shareCode-A in contribution for shareCode-B
2. **Expected:** Server rejects with "ShareCode mismatch"

#### Test 5: Modify validation_proof
1. Change any character in validation_proof string
2. **Expected:** Server rejects with "Signature verification failed"

#### Test 6: Missing validation_proof
1. Remove validation_proof field entirely
2. **Expected:** Server rejects with "Video validation proof required"

#### Test 7: Proof from video A attached to video B
1. Upload video-A (get proof-A)
2. Upload video-B (get proof-B)
3. Submit video-B with proof-A
4. **Expected:** Server rejects (file path mismatch)

---

### Phase 3: Standard Contributor Tests

**Navigate to:** `http://localhost:3000/m/[shareCode]/contribute`

#### Test 1: Text only
- Fill name + message only
- **Verify:** Submit succeeds

#### Test 2: Single photo
- Add 1 photo
- **Verify:** Preview shows, submit succeeds

#### Test 3: Multiple photos
- Add photo 1
- Add photo 2
- Add photo 3
- **Verify:** All 3 show in preview
- **Verify:** "Add Photos (3/3)" button shows
- Attempt to add photo 4
- **Verify:** Button disabled or shows error

#### Test 4: GIF
- Add 1 animated GIF
- **Verify:** GIF animates in preview
- **Verify:** "Add GIF" changes to "Replace GIF"
- Attempt to add second GIF
- **Verify:** Replaces first GIF (not adds)

#### Test 5: Video
- Add 14s video
- **Verify:** Video shows in preview with duration badge
- **Verify:** "Add Video" changes to "Replace Video"

#### Test 6: Maximum contribution
- Fill long message (~3-4 sentences)
- Add 3 photos
- Add 1 animated GIF
- Add 1 video (14-15s)
- **Verify:** All media shows in preview grid
- **Verify:** Page remains usable (not cramped)
- Click "Share Your Memory"
- **Verify:** Upload succeeds
- **Verify:** Success confirmation
- **Verify:** Redirect to memory wall

#### Test 7: Remove controls (mobile-critical)
- Add photo
- **Verify:** Remove X button visible WITHOUT hover (mobile test)
- Click X
- **Verify:** Photo removed
- Repeat for GIF and video

---

### Phase 4: Contributor Mobile UX (390px)

**Setup:** Resize browser to 390px width (iPhone 12/13 Pro size)

**Navigate to:** Contribute page

#### Test 1: Add photos flow
1. Click "Add Photos"
2. Select photo
3. **Verify:** Page auto-scrolls to show new preview (not hidden below fold)
4. **Verify:** Remove X button clearly visible
5. **Verify:** Button text updates ("Add Photos (1/3)")

#### Test 2: Add GIF flow
1. Click "Add GIF"
2. Select animated GIF
3. **Verify:** Page shows GIF preview
4. **Verify:** GIF animates
5. **Verify:** No excessive scrolling required

#### Test 3: Add video flow
1. Click "Add Video"
2. Select 14s video
3. **Verify:** Video preview appears
4. **Verify:** Duration badge visible
5. **Verify:** Controls not cramped

#### Test 4: Maximum scenario at 390px
1. Add long message + 3 photos + GIF + video
2. **Verify:** All previews visible
3. **Verify:** Grid layout not broken
4. **Verify:** Submit button discoverable (not requiring excessive scroll)
5. **Verify:** No horizontal overflow

---

### Phase 5: Standard Reveal (CRITICAL - 390px)

**Setup:**
1. Create test memory with maximum media (3 photos + GIF + video)
2. Navigate to: `http://localhost:3000/m/[shareCode]/reveal`
3. Resize browser to 390px width

**Navigate through reveal flow:**

#### Welcome Screen
- **Verify:** Emoji, recipient name, count display correctly
- Click "Open My MemoryPop"

#### Memory Screen - Maximum Media
- **Verify:** Contributor name visible
- **Verify:** Message readable (not tiny text)
- **Verify:** Photos display by default
- **Verify:** Photo composition feels intentional (not cramped grid)

**Photo Composition Tests:**

1 Photo:
- **Verify:** Hero treatment (large, emotionally significant)

2 Photos:
- **Verify:** Balanced pair (side-by-side or stacked)
- **Verify:** Both photos given equal visual weight

3 Photos:
- **Verify:** Composition feels curated
- **Verify:** One photo clearly hero, two supporting
- **Verify:** Not generic auto-grid

**Media Selector:**
- **Verify:** Chips visible: 📸 Photos (3)  🎞️ GIF  🎥 Video
- **Verify:** Chips don't wrap awkwardly
- **Verify:** Selector feels warm/polished (not technical tabs)
- **Verify:** Active state clear (brown bg, white text)

**Media Switching:**
- Click "🎞️ GIF"
- **Verify:** GIF displays in same fixed-height area
- **Verify:** GIF animates
- **Verify:** Page height does NOT increase
- **Verify:** No jarring layout shifts

- Click "🎥 Video"
- **Verify:** Video displays in same area
- **Verify:** Video starts PAUSED
- **Verify:** Duration badge visible (top-left)
- **Verify:** Controls usable

**Audio Ducking:**
- Play video
- **Verify:** Background soundtrack ducks to ~20% volume (audible difference)
- Pause video
- **Verify:** Soundtrack restores to 100%
- Play video again
- Let video end naturally
- **Verify:** Soundtrack restores to 100%
- Play video
- Click "📸 Photos" while playing
- **Verify:** Video pauses immediately
- **Verify:** Soundtrack restores

**Navigation:**
- **Verify:** "Next" button discoverable (not requiring hunting/excessive scroll)
- Click "Next"
- **Verify:** Smooth transition to next memory
- **Verify:** Previous memory video stopped
- **Verify:** New memory media state reset (shows photos by default if available)

#### Continue through reveal
- Navigate to last memory
- Click "Next"
- **Verify:** FinalScreen appears
- **Verify:** Celebration emoji, message
- **Verify:** "One more thing…" text
- Click "Continue"
- **Verify:** ReactionPrompt appears
- Select reaction
- **Verify:** ReactionThankYou appears
- **Verify:** Can return to memory wall

---

### Phase 6: Memory Wall

**Navigate to:** `http://localhost:3000/m/[shareCode]`

#### Card Display
- **Verify:** Cards show first photo as thumbnail (if photos exist)
- **Verify:** If GIF only: GIF thumbnail
- **Verify:** If video only: Video thumbnail or fallback
- **Verify:** Total media count badge shows (e.g., "5" for 3 photos + GIF + video)
- **Verify:** Text-only memories render elegantly
- **Verify:** Cards remain attractive (not cluttered)

#### Card Interaction
- Click card with maximum media
- **Verify:** DetailModal opens
- **Verify:** All media visible (scroll if needed)
- **Verify:** Close button works
- Press ESC
- **Verify:** Modal closes
- Click backdrop
- **Verify:** Modal closes

---

### Phase 7: Detail Modal

#### Desktop View
- Open maximum-media memory
- **Verify:** All 3 photos displayed (layout: 1 hero or grid)
- **Verify:** GIF displayed below photos
- **Verify:** GIF animates
- **Verify:** Video displayed
- **Verify:** Video has controls
- **Verify:** Full message text on right side
- **Verify:** Contributor name signature at bottom

#### Mobile View (390px)
- **Verify:** Media section scrollable
- **Verify:** All media accessible via scroll
- **Verify:** Message readable
- **Verify:** No horizontal overflow

---

### Phase 8: Regression Tests

#### Standard Reveal Ending Flow
1. Start reveal from Welcome
2. Navigate through all memories using "Next"
3. **Verify:** Last memory → Next → FinalScreen (NOT memory wall)
4. **Verify:** FinalScreen shows celebration + "One more thing…"
5. Click "Continue"
6. **Verify:** ReactionPrompt appears (if not reacted before)
7. Select reaction
8. **Verify:** ReactionThankYou appears
9. **Verify:** Can revisit memory wall

#### Navigation
- **Verify:** Previous button works
- **Verify:** Swipe left/right works (mobile)
- **Verify:** Arrow keys work (desktop)
- **Verify:** "Browse all memories" link works

#### Backwards Compatibility
- Load existing MemoryPop with:
  - Text only
  - Single legacy photo_url
  - Legacy multiple_photos array
- **Verify:** All render correctly
- **Verify:** No crashes or blank screens

---

## AUTOMATED TESTS (Future)

### Unit Tests Needed
- HMAC proof generation
- HMAC proof verification
- Buffer to stream conversion
- Duration validation logic
- File size validation

### Integration Tests Needed
- /api/upload with mock files
- /api/memories with mock proofs
- Tamper detection
- Cross-browser media playback

---

## DEPLOYMENT BLOCKERS

### Resolved ✅
- Build failure (serverExternalPackages fix)
- TypeScript errors (stream conversion, DetailModal)
- VIDEO_VALIDATION_SECRET generated

### Remaining ⚠️
- Database migration not applied (010_add_standard_multimedia.sql)
- Manual testing not completed
- Founder visual validation required
- Test videos not created (ffmpeg unavailable)

---

## RECOMMENDATION

**DO NOT DEPLOY until:**
1. Founder completes manual testing checklist
2. Maximum-media scenario at 390px validated
3. Audio ducking verified working
4. Media selector UX approved
5. Database migration applied to staging
6. Cross-browser testing complete (Safari iOS, Chrome Android)

**Estimated Manual Testing Time:** 60-90 minutes

**Critical Tests (Minimum):**
- Video upload with 14s/15s/16s files
- Maximum media contribution
- Reveal at 390px with max media
- Audio ducking during video playback
- Navigation flow (last memory → FinalScreen → Continue → ReactionPrompt)
