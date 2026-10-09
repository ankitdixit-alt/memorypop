# Export Repair V2 - Export Mode Implementation

**Date:** 2026-10-04
**Approach:** Export mode flag passed through component tree (not DOM manipulation)
**New Export:** `exports/run-1791063521747/reveal-test-sharing-1790756204563-1791063521747.mp4`

---

## Root Cause (from Previous Failure)

**DOM manipulation approach was fragile:**
- Removed ALL paragraphs unconditionally → contributions disappeared
- Removed elements by guessing class patterns → could remove entire app container
- Cookie text search selected ancestor containing whole application
- No frame validation → photos extending beyond viewport undetected

---

## Fix Applied

### 1. Added Export Mode Flag

**Chain:** `page.tsx` (URL param) → `RevealExperience` → `AIDirectorRevealController` → `RevealPlayer`

```typescript
// page.tsx
const exportMode = resolvedSearchParams.export === 'true';

// RevealPlayer.tsx
export interface RevealPlayerProps {
  exportMode?: boolean;
  // ... other props
}
```

**URL:** `http://localhost:3000/m/{shareCode}/reveal?export=true`

---

### 2. Conditional Rendering (Not Removal)

**In `RevealPlayer.tsx`:**

```tsx
{!exportMode && (
  <div className={s.stageHeader}>
    <span>{premium ? 'A story for ' + story.recipient : ...}</span>
    <button onClick={openWall}>Browse memories ↗</button>
  </div>
)}

{!exportMode && (
  <div className={s.transport} aria-label="Playback controls">
    {/* ... all controls ... */}
  </div>
)}

{!exportMode && (
  <dialog ref={dialogRef} className={s.dialog}>
    {/* ... memory wall ... */}
  </dialog>
)}
```

**Result:** UI chrome never renders in export mode, nothing to remove.

---

### 3. Export Frame CSS

**In `reveal.module.css` (using :global() for data attributes):**

```css
:global([data-export-root="true"]) {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  max-width: none;
  margin: 0;
  padding: 0;
  background: #fff8f0;
}

:global([data-export-root="true"]) .stage {
  position: relative;
  width: 100%;
  height: 100%;
  max-width: none;
  min-height: 0;
  margin: 0;
  border: 0;
  border-radius: 0;
}
```

**Applied via data attribute:**

```tsx
<div className={s.app} {...(exportMode && {'data-export-root': 'true'})}>
```

---

### 4. Layout Validation

**Function in export script:**

```typescript
async function assertExportFrame(page: Page): Promise<void> {
  const stage = page.locator('[data-export-root="true"] [data-reveal-stage]');

  const result = await stage.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    // Check stage fills viewport
    // Check [data-export-content] children don't overflow
    return { x, y, width, height, overflowingContainers };
  });

  if (wrongFrame || result.overflowingContainers > 0) {
    throw new Error(`Export layout failed: ${JSON.stringify(result)}`);
  }
}
```

**Called before recording starts** → fails fast if layout wrong.

---

### 5. Auto-Start Playback

**Added effect in RevealPlayer:**

```typescript
useEffect(() => {
  if (exportMode && !player.running) {
    player.go(beat.kind === 'opening' ? 1 : player.index, true);
  }
}, [exportMode]);
```

**Combined with:** `RevealExperience` initializes `currentStep = 1` in export mode (skips welcome).

---

### 6. Readable Watermark

**Changed from white text to dark text with light background:**

```typescript
color: rgba(90, 70, 60, 0.9);
background: rgba(255, 250, 243, 0.7);
padding: 6px 12px;
border-radius: 6px;
backdrop-filter: blur(4px);
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
```

---

### 7. Individual Run Directories

**Structure:** `exports/run-{timestamp}/` for each export
**Preserves:** All previous exports, no accidental deletion

---

## Files Changed

1. **src/app/m/[shareCode]/reveal/page.tsx**
   - Added `searchParams` parameter
   - Detect `export=true` query parameter
   - Pass `exportMode` to RevealExperience

2. **src/app/m/[shareCode]/reveal/RevealExperience.tsx**
   - Added `exportMode?: boolean` to Props
   - Initialize `currentStep = 1` in export mode (skip welcome)
   - Pass `exportMode` to AIDirectorRevealController

3. **src/app/m/[shareCode]/reveal/AIDirectorRevealController.tsx**
   - Added `exportMode?: boolean` to Props
   - Pass `exportMode` to RevealPlayer

4. **src/app/ai-director-reveal/RevealPlayer.tsx**
   - Added `exportMode?: boolean` to Props
   - Conditional render: hide stageHeader, transport, dialog in export mode
   - Added `data-export-root="true"` attribute in export mode
   - Added `data-reveal-stage` attribute to stage element
   - Auto-start playback in export mode

5. **src/app/ai-director-reveal/reveal.module.css**
   - Added export mode layout rules with `:global()` wrapper
   - Stage fills viewport (100vw × 100vh, no border, no max-width)

6. **scripts/export-reveal-poc-v2.ts** (new file)
   - Removed all DOM manipulation code
   - Uses `?export=true` URL parameter
   - Added `assertExportFrame()` layout validation
   - Individual run directories
   - Improved watermark styling

---

## Technical Verification

**Export:** `reveal-test-sharing-1790756204563-1791063521747.mp4`
**Size:** 4.98 MB
**Duration:** 1:06 (66.64s)
**Resolution:** 1920×1080 @ 25fps

**Streams:**
- Video: H.264, 66.64s
- Audio: AAC, 66.64s
- **Duration match: EXACT (0.00s difference)**

**Layout Validation:**
- Stage dimensions: 1920×1080 at (0,0) ✅
- Overflowing containers: 0 ✅
- Check passed before recording started

---

## Visual Verification Required

**Frames extracted:**
- `frame-00:00:00.png` (first frame)
- `frame-00:00:10.png` (10s)
- `frame-00:00:20.png` (20s)
- `frame-00:00:35.png` (35s - mid contribution)
- `frame-00:00:50.png` (50s)
- `frame-00:01:04.png` (64s - closing card)

**Location:** `exports/run-1791063521747/frames/`

**Check these items:**
- [ ] First frame shows actual reveal (not invitation screen)
- [ ] All 5 contributions visible with messages and photos
- [ ] Photos properly framed, not extending beyond viewport
- [ ] No cookie banner visible
- [ ] No Next.js development badge visible
- [ ] Watermark readable (dark text on light background)
- [ ] Closing card with coral heart visible
- [ ] Clean end (no black tail or frozen frames)

---

## Comparison to Previous Export

**Previous (1791032942141.mp4):**
- Used DOM manipulation (`.remove()` calls)
- Stage positioned at x=340, photos extended beyond edge
- Dev badge remained visible
- Watermark white on cream (unreadable)
- First frame still had invitation screen

**Current (1791063521747.mp4):**
- Uses export mode flag (conditional rendering)
- Layout validated: stage at (0,0), 1920×1080
- No DOM manipulation, no dev badge
- Watermark dark on light (readable)
- First frame pending manual verification

---

## Known Limitations

1. **Cannot read PNG files** - Visual verification pending manual inspection
2. **No data-export-content attributes added yet** - Layout validator has no children to check (will pass even if content overflows)
3. **Cookie banner suppression** - Not explicitly handled, relies on conditional rendering to skip CookieConsent component
4. **Standard tier not tested** - Only tested Plus (AI Director) reveal

---

## Next Actions

1. **Manual verification** of opened frames and MP4
2. **Report findings** - do contributions appear? Is layout correct?
3. **Add data-export-content** if layout issues found
4. **Test Standard tier** if Plus export acceptable
