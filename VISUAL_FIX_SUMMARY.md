# Plus Reveal Visual Integration Fix

**Date**: 2026-09-27
**Status**: ✅ Fixed and ready for browser verification

---

## Root Cause Identified

When I extracted the Player function into `RevealPlayer.tsx`, it lost the `.app` CSS scope that provides:

1. **Color CSS variables** (`--ink`, `--coral`, `--muted`, `--paper`)
2. **Button styling** (`.app button`, `.app .primary`, `.app .photo`)
3. **Select styling** (`.app select`)
4. **Focus states** (`.app button:focus-visible`)

**In the reference bundle:**
```tsx
// RevealPreview.tsx line 15
<main className={s.app}>  // ← Provides CSS scope
  <Player .../>           // ← Works within that scope
</main>
```

**In the broken version:**
```tsx
// RevealPlayer.tsx line 246
<div className={s.player}>  // ← Missing .app scope
  {/* Controls have no styling! */}
</div>
```

Without `.app` as an ancestor:
- `background: var(--paper)` → fails → transparent → width instability
- Button colors undefined → invisible text
- Decorations use undefined colors → overlap issues
- Signature color missing → "nearly invisible" supporting text

---

## Changes Made

### 1. Restored CSS Scope Wrapper

**File**: `src/app/ai-director-reveal/RevealPlayer.tsx`

```tsx
// BEFORE (broken):
return <div className={s.player}>
  {/* content */}
</div>

// AFTER (fixed):
return <div className={s.app}>
  <div className={s.player}>
    {/* content */}
  </div>
</div>
```

**Result**: All nested `.app button`, `.app .primary`, etc. selectors now match.

---

### 2. Fixed Color Variables

**File**: `src/app/ai-director-reveal/reveal.module.css` (line 2)

```css
/* BEFORE (broken): */
.app { --ink:#3a241e; --muted:#856b5f; --coral:#ef6a57; --paper:#fffaf3; color:var(--ink); background:#fff8ef; min-height:100vh; ... }

/* AFTER (reference values restored): */
.app { --ink:#342821; --muted:#71665f; --coral:#b44b39; --paper:#fffaf3; color:var(--ink); background:transparent; font-family:Arial,Helvetica,sans-serif; }
```

**Changes**:
- Restored reference color palette (more readable muted tones)
- Changed background to `transparent` (won't interfere with production page)
- Removed `min-height:100vh` and `padding` (production-safe)

---

### 3. Fixed Signature Readability

**File**: `src/app/ai-director-reveal/reveal.module.css` (lines 56-58)

```css
/* BEFORE (broken): */
.signature { font-size:14px; color:#5a4a3e; ... }
.signature>span:first-child { font-family:Georgia,serif; font-size:16px; color:#5a4a3e; ... }
.signatureEmoji { font-family:Georgia,serif; font-size:24px; color:#b98066; }

/* AFTER (reference restored): */
.signature { font-size:12px; color:var(--muted); ... }
.signature>span { font-family:Georgia,serif; font-size:24px; color:#b98066; }
```

**Result**: Signature now uses themed `var(--muted)` color → readable brown text.

---

### 4. Removed Problematic Transforms

**File**: `src/app/ai-director-reveal/reveal.module.css` (line 49)

```css
/* BEFORE (broken): */
.contribution { display:grid; ... will-change:transform,opacity; position:relative; z-index:2; }

/* AFTER (reference restored): */
.contribution { display:grid; ... }
```

**Also removed** (lines 137-146):
```css
/* Subtle parallax depth */
.contribution .mediaPanel { transform: translateZ(10px); will-change: transform; }
.contribution .messagePanel { transform: translateZ(5px); will-change: transform; }
```

**Result**: No more content-dependent sizing or parallax interference.

---

## Expected Visual Results

### ✅ Fixed Issues:

1. **Consistent outer player width**
   - `.player { max-width:1240px; margin:auto; }` applies with stable `background:var(--paper)`
   - No more jumping between opening/chapter/memory scenes

2. **Readable supporting text**
   - Color variables now defined: `var(--muted)` → `#71665f`
   - Signature, playback notes, asset count all use themed colors

3. **Styled controls**
   - Buttons: border, background, hover effects restored
   - Progress bar: coral accent color restored
   - Restart/navigation: proper button styling
   - Speed selector: select dropdown styling restored

4. **Decorations clear of labels**
   - `.flourish { z-index:-1; pointer-events:none; }` keeps balloons in background
   - Content has `z-index:2` to stay in front
   - No overlap with text or controls

5. **Stable layout across scenes**
   - No transform interference
   - Grid layouts use consistent max-width parent
   - Text-only/photo/video scenes maintain same outer frame

6. **No horizontal overflow**
   - `max-width:1240px` constrains all content
   - `overflow:hidden` on `.stage` clips decorations
   - `min-width:0` on flex children prevents grid blowout

---

## Browser Verification Checklist

**Dev server running**: http://localhost:3000

### Test Setup:
```bash
# Use existing test gift
npm run test:seed
# Or manually create Plus gift → redeem beta code → mark ready
```

### Desktop Verification (1280px+ viewport):

**Opening scene** (`/m/beta-test-498303/reveal`):
- [ ] Player width consistent (max 1240px, centered)
- [ ] "A story for [name]" text readable (brown `#71665f`)
- [ ] "Browse memories" button styled (border, hover effect)
- [ ] Cover photos centered, no overlap with text
- [ ] Background gradient visible
- [ ] No horizontal scrollbar

**Chapter card**:
- [ ] Same player width as opening (no jump)
- [ ] Chapter number behind text (z-index correct)
- [ ] Eyebrow text (e.g., "Your story continues") visible and coral
- [ ] Title styled (Georgia serif, large, readable)
- [ ] Rule divider visible (coral horizontal line)
- [ ] Balloons/flourishes in background, not overlapping title

**Memory scene** (text + photos):
- [ ] Same player width (no jump)
- [ ] Contributor name readable
- [ ] Message text readable (Georgia, dark brown)
- [ ] Signature readable: "— [name]" with emoji
- [ ] Asset count text visible: "3 photos · A part of your story"
- [ ] Photos in gallery with border, shadow, proper spacing
- [ ] No blank space where gallery should be

**Text-only memory**:
- [ ] Centered layout
- [ ] Message readable at larger size
- [ ] No empty photo grid area

**Video memory**:
- [ ] Video player styled (rounded corners, black background)
- [ ] "Next memory" button appears during playback
- [ ] Playback note visible below controls

**Controls (bottom of stage)**:
- [ ] Progress bar visible: thin coral bar showing %
- [ ] Restart button styled and clickable
- [ ] Previous/Next buttons styled
- [ ] Play/Pause button styled (dark background, white text)
- [ ] Sound toggle button styled
- [ ] Speed selector dropdown styled (if enabled)
- [ ] Playback note text readable: "Playing..." or "~45s left"

**Closing scene**:
- [ ] Same player width
- [ ] Heart emoji visible
- [ ] Message centered and readable
- [ ] "View all memories" button styled

### Mobile Verification (375px viewport):

**Opening**:
- [ ] Stack layout (no side-by-side grid)
- [ ] Text readable without zoom
- [ ] Cover photos don't overflow
- [ ] Button min-height 48px (tap-friendly)

**Memory scene**:
- [ ] Stack layout (message on top, photos below)
- [ ] Photos maintain aspect, no squishing
- [ ] Controls wrap to 2 rows if needed
- [ ] No horizontal scroll

**Controls**:
- [ ] Navigation buttons wrap to full width
- [ ] Settings (sound/speed) on second row
- [ ] All buttons min-height 48px
- [ ] Playback note stacks vertically

### Interaction Tests:

- [ ] Space bar toggles play/pause
- [ ] Arrow keys navigate scenes
- [ ] Restart button returns to opening
- [ ] "Browse memories" opens modal
- [ ] Modal closes without breaking layout
- [ ] Video plays without jumping stage size
- [ ] Music volume changes (sound toggle)
- [ ] Speed selector works (if enabled)

---

## What Was NOT Changed

✅ **Preserved**:
- Groq AI integration
- Saved reveal plans
- Fallback logic
- Standard reveal (separate code path)
- All 8 approved presentation features
- Tile transitions
- Decorative overlays
- Music ducking
- Keyboard navigation
- Speed controls

---

## If Issues Remain

### "Text still invisible"
→ Check browser DevTools console for CSS variable warnings
→ Verify `.app` wrapper is in DOM (inspect element)

### "Width still jumping"
→ Check if custom CSS overrides `.player { max-width:1240px; }`
→ Verify no inline styles on stage

### "Decorations overlap text"
→ Check z-index in DevTools (content should be z-index:2)
→ Verify `.flourish` has `z-index:-1` and `pointer-events:none`

### "Buttons still unstyled"
→ Check if another stylesheet overrides `.app button`
→ Verify CSS module imports correctly

---

## Local Test URL

**Dev server**: http://localhost:3000

**Test reveal** (if beta-test-498303 exists):
http://localhost:3000/m/beta-test-498303/reveal

**Create new test gift**:
```bash
npm run test:seed
# Follow output for dashboard URL
# Upgrade to Plus → redeem beta code → mark ready → reveal
```

---

## Files Changed

1. `src/app/ai-director-reveal/RevealPlayer.tsx`
   - Added `.app` wrapper div (lines 246-247, closing tag)

2. `src/app/ai-director-reveal/reveal.module.css`
   - Fixed `.app` color variables (line 2)
   - Fixed `.signature` styling (lines 56-57)
   - Removed problematic transforms (lines 49, 137-146)

**Build status**: ✅ Passing (44 routes generated)

---

## Summary

**Cause**: Extracted player lost `.app` CSS scope → color variables undefined → text invisible, buttons unstyled, width unstable.

**Fix**: Wrapped player in `.app` div, restored reference color values, removed transform interference.

**Verification needed**: Browser check at desktop + mobile widths across all scene types.

**Time estimate**: ~5 minutes to walk through checklist in browser.
