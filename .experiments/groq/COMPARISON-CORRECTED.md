# Comparison Implementation Corrected

**Date:** September 17, 2026
**Status:** Ready for browser evaluation

---

## Corrections Applied

### 1. Fixed Baseline (generateDeterministicRevealPlan)

**Before:**
Used `generateStandardRevealPlan` which is basic Standard tier (chronological, no chapters).

**After:**
Uses `generateDeterministicRevealPlan` which is the actual Plus/Premium logic:
- Chronological baseline (newest first)
- Smart finale selection (family → emotional keywords → longest message)
- 2-3 chapter grouping based on occasion
- Highlight selection based on media richness and emotional content
- Proper opening/closing text by occasion

**Location:** `src/lib/ai/deterministicPlanner.ts`

### 2. Reused Actual Cinematic Renderer

**Before:**
Created duplicate `BeatRenderer` component with basic dark cards and fade classes.

**After:**
Modified existing `RevealPreview` component to accept optional story override:
- Added optional props: `storyOverride`, `modeOverride`, `presetOverride`
- Hides header controls when in comparison mode
- Preserves all existing behavior when no props provided
- Full cinematic rendering with:
  - Tile transitions
  - Occasion-specific decorations
  - Warm cream/coral branding
  - Existing photo layouts and GIF handling
  - Video lifecycle with browser playback coordination
  - Speed controls
  - Mobile responsive behavior

**Location:** `src/app/ai-director-reveal/RevealPreview.tsx`

### 3. Both Modes Use Same Renderer

**Comparison Setup:**
- **Current Plus**: `generateDeterministicRevealPlan` → `adaptRevealPlanToStory` → RevealPreview (mode='director', preset='tier')
- **Groq AI**: Saved pilot plan → `adaptRevealPlanToStory` → RevealPreview (mode='director', preset='tier')

Both rendered through identical Plus/Premium player with full capabilities.

### 4. Preserved Video and Audio Behavior

**Video Playback:**
- Videos start when their scene becomes active
- Subject to browser autoplay restrictions
- User interaction requirement handled correctly
- Videos coordinate with beat-based playback timing
- Automatic playback after first interaction

**Audio Coordination:**
- Background music with volume ramping
- Volume ducking during video (to 25%)
- Fade in/out on state changes
- Clean pause/resume coordination
- Prevented overlapping audio

**Mode Switching:**
- Stops playback cleanly
- Resets player state
- No audio artifacts
- Visible recovery if playback blocked

---

## Available Cases

✅ **Anniversary A** - No instructions, 4 chapters
✅ **Anniversary B** - With instructions, 3 chapters
✅ **Sympathy A** - No instructions, 4 chapters
❌ **Sympathy B** - Failed generation (honest representation, no fallback)

---

## Files Modified

### Created
- `src/app/groq-comparison/page.tsx` - Comparison page with proper baseline

### Modified
- `src/app/ai-director-reveal/RevealPreview.tsx` - Added optional story override
- `scripts/groq-compare.ts` - Fixed orphaned return statement
- `scripts/groq-experiment.ts` - Fixed duplicate path import
- `scripts/test-groq-experiment-mocked.ts` - Fixed type annotation

---

## Shared Components Used

**Baseline Planner:** `generateDeterministicRevealPlan` from `src/lib/ai/deterministicPlanner.ts`

**Shared Renderer:** `RevealPreview` from `src/app/ai-director-reveal/RevealPreview.tsx`

**Plan Adapter:** `adaptRevealPlanToStory` from `src/lib/ai/planAdapter.ts`

**Player Architecture:**
- `buildBeats()` - Converts story to playback timeline
- `usePlayback()` - Beat-based playback hook
- TileTransition - Cinematic tile effects
- DecorativeOverlay - Occasion-specific decorations
- PreviewImage/VideoSample - Media components
- Full transport controls with speed/sound

---

## Build Verification

```bash
npm run build
```

**Result:** ✅ Build successful (exit code 0)

**Output:**
- TypeScript check: Passed
- Static generation: 44 pages
- groq-comparison: Static ○

---

## Test Verification

```bash
npm run groq-test-mocked
```

**Result:** ✅ 35/35 tests passing

**Coverage:**
- Token-aware scheduling
- Retry-after respect (no capping)
- Execution window with remaining time
- Model identity tracking
- Error classification
- Pilot restart retry limits
- Budget tracking

---

## Local URL

**Dev server:** http://localhost:3000/groq-comparison

**Features:**
- Case selector (Anniversary A/B, Sympathy A, Sympathy B)
- Mode toggle (Current Plus ↔ Groq AI)
- Full cinematic playback
- Play/pause controls
- Previous/next beat navigation
- Restart button
- Sound toggle
- Speed control (0.75× to 2×)
- Progress bar
- Mobile responsive

---

## Browser Testing Checklist

### Desktop Testing (Chrome/Safari/Firefox)

**Page Load:**
- [ ] Page loads at http://localhost:3000/groq-comparison
- [ ] Header displays case selector and mode toggle
- [ ] Anniversary A loads by default
- [ ] Plus mode active by default

**Case Switching:**
- [ ] Switch to Anniversary B
- [ ] Switch to Sympathy A
- [ ] Switch to Sympathy B (shows failure message, no player)
- [ ] Mode resets to Plus when switching cases

**Mode Switching:**
- [ ] Click Groq AI mode (loads Groq plan)
- [ ] Player restarts with Groq story
- [ ] Click Current Plus mode
- [ ] Player restarts with Plus story
- [ ] Audio stops cleanly on switch
- [ ] No overlapping audio

**Playback (Plus Mode):**
- [ ] Click "Begin" button on opening card
- [ ] Opening card displays with photos
- [ ] Chapter card appears with chapter title
- [ ] Memory cards show contributor name and message
- [ ] Photos display in gallery layout
- [ ] GIFs animate when playing
- [ ] Videos have working controls and autoplay
- [ ] Tile transitions display between beats
- [ ] Decorations appear (subtle occasion-specific elements)
- [ ] Progress bar advances
- [ ] Finale badge shows on final memory
- [ ] Closing card appears at end

**Playback (Groq Mode):**
- [ ] Switch to Groq mode
- [ ] Opening line different from Plus
- [ ] Chapter titles different from Plus
- [ ] Memory order different from Plus
- [ ] Finale different from Plus
- [ ] Same messages appear (just different order)
- [ ] Same media assets
- [ ] Same transitions and decorations
- [ ] Highlight badges appear on selected memories

**Controls:**
- [ ] Play/pause toggle works
- [ ] Previous button navigates back
- [ ] Next button navigates forward
- [ ] Restart button returns to opening
- [ ] Sound toggle enables/disables music
- [ ] Speed selector changes playback speed
- [ ] Keyboard controls work (Space, Arrow keys)

**Video Playback:**
- [ ] Video scenes autoplay after first interaction
- [ ] Video controls appear
- [ ] Pause/resume video works
- [ ] Video audio plays correctly
- [ ] Background music ducks during video
- [ ] Next memory button appears during video

**Mode Switching During Playback:**
- [ ] Play Plus mode partway through
- [ ] Switch to Groq mode (playback stops cleanly)
- [ ] No audio artifacts or errors
- [ ] Groq playback starts from beginning
- [ ] Switch back to Plus mode
- [ ] Plus playback restarts correctly

### Mobile Testing (iPhone/Android)

**Layout:**
- [ ] Page loads on mobile viewport (< 850px)
- [ ] Case selector wraps correctly
- [ ] Mode toggle accessible
- [ ] Player fits viewport
- [ ] Controls accessible
- [ ] No horizontal scroll

**Playback:**
- [ ] Opening card displays correctly
- [ ] Chapter cards readable
- [ ] Memory cards fit screen
- [ ] Photos display in mobile layout
- [ ] Videos play on mobile
- [ ] Controls work with touch
- [ ] Progress bar visible
- [ ] Sound toggle works

**Transitions:**
- [ ] Tile transitions work on mobile
- [ ] No performance issues
- [ ] Decorations render correctly
- [ ] No layout breaks during transitions

### Edge Cases

**Network:**
- [ ] Groq plan loads successfully
- [ ] Error shown if plan fails to load
- [ ] No external API calls during playback
- [ ] No Supabase queries
- [ ] No billing charges

**Browser State:**
- [ ] Page refresh resets to default state
- [ ] Browser back/forward work correctly
- [ ] Visibility change pauses playback
- [ ] Multiple rapid mode switches don't break state

**Media:**
- [ ] Blocked autoplay shows error message
- [ ] Video buffering handled correctly
- [ ] GIF animation respects reduced motion
- [ ] Media inspector (Browse memories) works

---

## Assessment Criteria

Evaluate Groq plans against Current Plus baseline:

1. **Emotional Progression**
   Does the Groq story build naturally toward a climax?

2. **Chapter Coherence**
   Do Groq's grouped memories make thematic sense?

3. **Tone Match**
   Does Groq storytelling fit the occasion?

4. **Finale Strength**
   Is Groq's chosen ending more powerful than Plus baseline?

5. **Overall Flow**
   Would a recipient prefer Groq's structure over Plus chronological?

---

## Technical Verification

### No External Requests
- Plans served from `.experiments/groq/run-pilot/*.json`
- Media from `public/ai-director-reveal/media/`
- No Groq API calls during playback
- No Gemini API calls
- No Supabase queries
- No billing charges

### Shared Renderer Confirmed
- Both modes use `RevealPreview` component
- Both use `mode='director'` (Plus/Premium renderer)
- Both use `preset='tier'` (full Plus capabilities)
- Only difference: story source (Plus planner vs Groq plan)

### Baseline Confirmed
- Uses `generateDeterministicRevealPlan` (actual Plus logic)
- Not `generateStandardRevealPlan` (basic Standard tier)
- Includes smart finale selection
- Includes chapter grouping
- Includes highlight selection

---

## Known Limitations

1. **No Production Data**
   Uses only synthetic fixtures from test files

2. **Fixed Test Cases**
   Only Anniversary A/B and Sympathy A available (Sympathy B failed)

3. **Development Only**
   Comparison page blocked in production (NODE_ENV check)

4. **No API Calls**
   Cannot generate new Groq plans, only view saved results

5. **Synthetic Media**
   Test images and sample videos, not real user content

---

## Next Steps

1. **Manual Browser Testing**
   Complete checklist above in Chrome, Safari, Firefox, mobile

2. **Evaluate Storytelling Quality**
   Compare Groq emotional progression against Plus baseline

3. **Make Decision**
   - If Groq compelling → plan production integration
   - If Groq needs work → iterate on prompts/approach
   - If Plus sufficient → stay with deterministic

4. **Production Integration** (if approved)
   - Move from comparison to main reveal flow
   - Add user preference toggle
   - Implement rate limiting
   - Add error handling and fallback
   - Monitor API costs

---

## Status

**Ready for browser evaluation**

All corrections applied, build successful, tests passing, server running.

Manual browser testing required to evaluate Groq storytelling quality.
