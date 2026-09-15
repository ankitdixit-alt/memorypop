# Transition Improvement Plan

**Date:** September 13, 2026
**Goal:** Enhance Plus/Premium transitions with cinematic tile-based reveals

---

## Current Implementation Analysis

### Files Controlling Transitions

1. **`/src/app/ai-director-reveal/prototype.ts`** (lines 111-163)
   - `selectTransition()` function chooses transition based on context
   - Returns transition type: `fade`, `slide`, `slideLeft`, `slideRight`, `crossfade`, `zoom`, `chapter`, `chapterEnhanced`, `finale`, `closing`, `tile`

2. **`/src/app/ai-director-reveal/reveal.module.css`** (lines 167-225)
   - CSS keyframe animations for each transition type
   - Transition classes with timing and easing

3. **`/src/app/ai-director-reveal/RevealPreview.tsx`** (lines 220, 227)
   - Applies transition class to content elements
   - `s[beat.transition]` adds the appropriate CSS class

### How Current Transitions Work

**Mechanism:**
1. Each beat has a `transition` property (string)
2. Beat content element gets CSS class matching transition type
3. CSS animation plays on element mount (new `key` triggers remount)
4. Animation is a simple fade-in with slight transform

**Current Transition Types:**
- `fade`: Opacity 0→1, scale 0.98→1 (500ms)
- `slide`: Opacity 0→1, translateY(20px)→0, scale 0.98→1 (600ms)
- `slideLeft`: Opacity 0→1, translateX(-40px)→0 (650ms)
- `slideRight`: Opacity 0→1, translateX(40px)→0 (650ms)
- `crossfade`: Opacity 0→1, scale 0.96→1, blur(2px)→0 (700ms)
- `zoom`: Opacity 0→1, scale 0.92→1 (750ms)
- `chapter`: Opacity 0→1, translateY(30px)→0, scale 0.95→1 (700ms)
- `chapterEnhanced`: Like chapter but with brightness effect (850ms)
- `finale`: Opacity 0→1, scale 0.94→1 with midpoint (1000ms)
- `closing`: Opacity 0→1, scale 0.95→1 (800ms)
- `tile`: Opacity 0→1, perspective rotateY(-8deg)→0 (800ms) - single element 3D rotation, NOT a tile grid

**Selection Logic:**
- Standard mode: Always `fade`
- Sympathy: `fade` or `finale`
- Chapter cards: `chapterEnhanced` or `chapter`
- Finale: `finale` or `crossfade`
- Highlights: `zoom`
- First in chapter: `slideLeft` or `slideRight`
- Video: `crossfade`
- Collections: Occasionally `tile` (every 5th)
- Default: Varies between `crossfade`, `slide`, `fade`

---

## Proposed Improvement: Tile-Based Transitions

### Concept

Instead of simple fade-in animations, create a **grid of tiles** that animate away to reveal the new content underneath.

**Visual Effect:**
```
┌─────────────────────────────┐
│ ▓▓│▓▓│▓▓│▓▓│▓▓│▓▓│▓▓│▓▓│▓▓ │  ← Grid of tiles covering stage
│ ▓▓│▓▓│▓▓│▓▓│▓▓│▓▓│▓▓│▓▓│▓▓ │
│ ▓▓│▓▓│▓▓│▓▓│▓▓│▓▓│▓▓│▓▓│▓▓ │
│ ▓▓│▓▓│▓▓│▓▓│▓▓│▓▓│▓▓│▓▓│▓▓ │
└─────────────────────────────┘
        ↓ Tiles fade/slide away
┌─────────────────────────────┐
│                             │
│    NEW CONTENT REVEALED     │
│                             │
│                             │
└─────────────────────────────┘
```

### Tile Grid Specifications

**Grid Size:**
- Desktop: 10 columns × 8 rows = 80 tiles
- Mobile: 6 columns × 5 rows = 30 tiles (fewer for performance)

**Tile Properties:**
- Borderless (seamless grid)
- Cover entire stage during transition
- Z-index above content, below decorations (or separate layer)
- Semi-transparent overlay: `rgba(255, 250, 243, 0.95)` (matches paper color)

**Animation Duration:**
- 350-550ms per tile animation
- Staggered start (delay based on position)
- Total transition time: 450-650ms

### Tile Animation Variants

**1. Fade Out (`tileFadeOut`)**
- Each tile fades from opacity 1 → 0
- Stagger: diagonal wave pattern
- Use for: gentle, elegant transitions

**2. Slide Out (`tileSlideOut`)**
- Tiles slide outward from center
- Top tiles slide up, bottom slide down, left/right accordingly
- Stagger: from center outward
- Use for: dynamic, energetic transitions

**3. Dissolve (`tileDissolve`)**
- Tiles scale down and fade out simultaneously
- Stagger: random or checkerboard pattern
- Use for: magical, soft transitions

**4. Flip Out (`tileFlipOut`)**
- Tiles rotate on Y or X axis and fade
- Stagger: left-to-right or top-to-bottom wave
- Use for: playful, modern transitions (birthday, anniversary)

**5. Chapter Reveal (`tileChapterReveal`)**
- Tiles slide outward in all directions from center
- Faster animation (400ms)
- Use for: chapter transitions

**6. Finale Cascade (`tileFinale`)**
- Tiles cascade down like falling leaves
- Slower, more emotional (600ms)
- Use for: finale moment

### Context-Aware Selection

**Birthday:**
- Default: `tileSlideOut`, `tileFlipOut`
- Chapter: `tileChapterReveal`
- Finale: `tileFinale`

**Anniversary:**
- Default: `tileFadeOut`, `tileDissolve`
- Chapter: `tileFadeOut` (elegant)
- Finale: `tileFinale`

**Retirement:**
- Default: `tileSlideOut`, `tileFadeOut`
- Chapter: `tileChapterReveal`
- Finale: `tileFinale`

**Sympathy:**
- Default: Simple `fade` (no tiles, respect somber tone)
- Finale: Gentle `tileFadeOut` (very subtle)

### Implementation Architecture

**Component Structure:**
```tsx
<section className={s.stage}>
  {/* Tile overlay during transitions */}
  {isTransitioning && !reducedMotion && premium && (
    <TileTransition
      variant={tileVariant}
      occasion={story.occasion}
      onComplete={() => setIsTransitioning(false)}
    />
  )}

  {/* Decorations */}
  {premium && decorations && <DecorativeOverlay ... />}

  {/* Content */}
  <div className={s.storyProgress}>...</div>
  {beat.kind === 'opening' && <div>...</div>}
  {beat.kind === 'memory' && <article>...</article>}
  ...
</section>
```

**TileTransition Component:**
```tsx
interface TileTransitionProps {
  variant: TileVariant
  occasion: Occasion
  onComplete: () => void
}

function TileTransition({ variant, occasion, onComplete }: TileTransitionProps) {
  const [tiles, setTiles] = useState<TileData[]>([])

  useEffect(() => {
    // Generate tile grid
    const grid = generateTileGrid(isMobile ? 30 : 80)
    setTiles(grid)

    // Start animation
    animateTiles(grid, variant)

    // Call onComplete after animation
    const duration = getVariantDuration(variant)
    const timer = setTimeout(onComplete, duration)
    return () => clearTimeout(timer)
  }, [variant, onComplete])

  return (
    <div className={s.tileOverlay}>
      {tiles.map((tile, i) => (
        <div
          key={i}
          className={s.tile}
          style={{
            gridColumn: tile.col,
            gridRow: tile.row,
            animationDelay: `${tile.delay}ms`,
            animationName: variant,
          }}
        />
      ))}
    </div>
  )
}
```

**CSS Structure:**
```css
.tileOverlay {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  grid-template-rows: repeat(8, 1fr);
  z-index: 10; /* Above content (z-index: 2), below decorations if separate */
  pointer-events: none;
}

.tile {
  background: var(--paper);
  opacity: 0.95;
  animation-fill-mode: forwards;
  animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes tileFadeOut {
  from { opacity: 0.95; }
  to { opacity: 0; }
}

@keyframes tileSlideOut {
  from { opacity: 0.95; transform: translate(0, 0); }
  to { opacity: 0; transform: translate(var(--slide-x), var(--slide-y)); }
}

/* ... more variants ... */
```

---

## Risks and Mitigations

### Risk 1: Performance on Mobile
**Issue:** 80 DOM elements animating simultaneously could cause jank
**Mitigation:**
- Reduce tile count on mobile (30 tiles instead of 80)
- Use `will-change: transform, opacity` on tiles
- Use CSS animations instead of JS for better GPU acceleration
- Simplify animations on mobile (fade only)

### Risk 2: Z-Index Conflicts
**Issue:** Tiles might interfere with decorations or content
**Mitigation:**
- Clear z-index hierarchy:
  - Stage: z-index 0
  - Content: z-index 2
  - Tile overlay: z-index 10
  - Decorations: z-index 1 (below tiles) OR separate layer
- Tiles only visible during transition (short window)

### Risk 3: Timing Synchronization
**Issue:** New content might flash or appear before tiles finish animating
**Mitigation:**
- Coordinate with React key changes
- Use `onComplete` callback to signal transition done
- Ensure content fade-in is delayed until tiles are mostly gone
- Test timing carefully across devices

### Risk 4: Video Playback Interruption
**Issue:** Tiles might cover video or cause playback stutter
**Mitigation:**
- Don't use tile transitions when transitioning TO video beats
- Keep existing `crossfade` for video transitions
- Ensure tiles don't interfere with video element

### Risk 5: Accessibility (Reduced Motion)
**Issue:** Tile animations could trigger motion sensitivity
**Mitigation:**
- Respect `prefers-reduced-motion` media query
- Fall back to simple fade (no tiles) when reduced motion enabled
- Already implemented: `const reduced = useReducedMotion()`

### Risk 6: Transition Stacking
**Issue:** Rapid Next/Previous clicks could stack multiple transitions
**Mitigation:**
- Use React state to track `isTransitioning`
- Disable navigation during transitions OR cancel previous transition
- Clear transition state on navigation change

---

## Implementation Plan

### Phase 1: Core Tile System (60 min)
1. Create `TileTransition.tsx` component
2. Implement tile grid generation logic
3. Define CSS for tile overlay and grid
4. Create 3 initial variants: `tileFadeOut`, `tileSlideOut`, `tileDissolve`
5. Test in browser with birthday occasion

### Phase 2: Variant Expansion (30 min)
1. Add `tileFlipOut` variant
2. Add `tileChapterReveal` variant
3. Add `tileFinale` variant
4. Tune animation durations and easings

### Phase 3: Context-Aware Integration (30 min)
1. Update `selectTransition()` to return tile variants
2. Add occasion-aware tile selection
3. Integrate with existing transition system
4. Preserve Standard mode (no tiles)

### Phase 4: Polish & Testing (60 min)
1. Test all occasions and scene types
2. Test mobile responsiveness
3. Test rapid navigation
4. Test reduced motion mode
5. Tune timing and stagger delays
6. Fix any visual issues

---

## Success Criteria

**Must Have:**
- ✅ Tiles animate smoothly (350-650ms)
- ✅ New content revealed cleanly underneath
- ✅ No overlap with content after transition
- ✅ Context-aware (different for occasions)
- ✅ Mobile-optimized (fewer tiles, good performance)
- ✅ Reduced motion fallback
- ✅ Standard mode unchanged
- ✅ No duplicate messages
- ✅ Video transitions preserved
- ✅ No external network requests

**Should Have:**
- ✅ 4-6 distinct tile variants
- ✅ Occasion-appropriate selection
- ✅ Smooth stagger patterns
- ✅ Chapter and finale special variants

**Nice to Have:**
- ✅ Deterministic pattern (not random every time)
- ✅ Subtle sound effect (future, not now)

---

## Out of Scope

- ❌ Canvas or WebGL rendering (too complex, stick to CSS)
- ❌ 3D perspective effects (too heavy)
- ❌ Particle systems
- ❌ Custom easing curves via JS
- ❌ Tile shapes other than rectangles
- ❌ User-configurable transition preferences

---

## Next Steps

1. ✅ Document current implementation (this file)
2. ⏳ Create TileTransition component
3. ⏳ Implement tile grid CSS
4. ⏳ Add tile animation variants
5. ⏳ Integrate with transition system
6. ⏳ Test in browser
7. ⏳ Document results and limitations
