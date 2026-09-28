# Layout Differences: AIDirectorRevealController vs RevealPreview

**Date**: 2026-09-26
**Issue**: Production Plus renderer differs from approved prototype
**Comparison**: Direct code analysis of JSX structure, CSS classes, and features

---

## Executive Summary

The header comment in `AIDirectorRevealController.tsx` claiming it "reuses the approved renderer from RevealPreview" is **misleading**. The production renderer is a **simplified version** with **8 missing features** and **5 implementation differences** that explain the reported layout discrepancy.

---

## Missing Features

### 1. Progress Bar (MAJOR UX REGRESSION)

**RevealPreview** (line 359-360):
```typescript
<div className={s.track} role="progressbar" aria-label="Reveal progress"
  aria-valuenow={overall} aria-valuemin={0} aria-valuemax={100}>
  <span style={{width: overall + '%'}}/>
</div>
```

**AIDirectorRevealController**: **MISSING ENTIRELY**

**Impact**: User cannot see reveal progress or how much remains.

---

### 2. Restart Button

**RevealPreview** (line 362):
```typescript
<button aria-label="Restart reveal" onClick={player.restart}>↻</button>
```

**AIDirectorRevealController**: **MISSING ENTIRELY**

**Impact**: User must manually navigate back to beginning.

---

### 3. Chapter Eyebrow Text

**RevealPreview** (lines 305-307):
```typescript
<p className={s.eyebrow}>
  {story.occasion === 'birthday' ? 'Your story continues' :
   story.occasion === 'anniversary' ? 'The next chapter' :
   story.occasion === 'retirement' ? 'Another chapter' :
   'Continuing on'}
</p>
```

**AIDirectorRevealController**: **MISSING ENTIRELY**

**Impact**: Chapters lack contextual transition text, reducing narrative richness.

---

### 4. Chapter Rule Divider

**RevealPreview** (line 309):
```typescript
<div className={s.chapterRule}/>
```

**AIDirectorRevealController**: **MISSING ENTIRELY**

**Impact**: Visual separator missing from chapter cards.

---

### 5. Asset Count Text

**RevealPreview** (line 320):
```typescript
<p className={s.assetCount}>
  {currentMemory.assets.filter(a => a.kind === 'photo').length > 0 &&
   currentMemory.assets.filter(a => a.kind === 'photo').length + ' photos · '}
  A part of your story
</p>
```

**AIDirectorRevealController**: **MISSING ENTIRELY**

**Impact**: User doesn't see "3 photos · A part of your story" attribution in message panel.

---

### 6. Playback Note Section

**RevealPreview** (lines 375-376):
```typescript
<div className={s.playbackNote}>
  <span>{isVideo ? videoStatus === 'buffering' ? 'Buffering — the reveal is waiting.' :
    'Video uses its own playback clock. Speed also applies to video.' :
    isClosing ? 'Your memory wall is ready.' :
    speed === 1 ? 'Take your time. Pause whenever you like.' :
    'Preview speed — use 1× to judge the intended experience.'}</span>
  <span>About {formatDuration(estimateSeconds(beats, speed))} at {speed}×, excluding pauses</span>
</div>
```

**AIDirectorRevealController**: **MISSING ENTIRELY**

**Impact**: Contextual playback information missing (duration estimate, buffering status, etc.).

---

### 7. "Next Memory" Button During Video

**RevealPreview** (line 366):
```typescript
{isVideo && <button onClick={nextContribution}>Next memory</button>}
```

**AIDirectorRevealController**: **MISSING ENTIRELY**

**Impact**: During video playback, user cannot skip to next contribution.

---

### 8. Speed Selector (Prototype Feature)

**RevealPreview** (lines 370-372):
```typescript
<label>Speed <select aria-label="Playback speed" value={speed}
  onChange={e => onSpeed(Number(e.target.value))}>
  <option value={0.75}>0.75×</option>
  <option value={1}>1× · intended</option>
  <option value={1.5}>1.5× · preview</option>
  <option value={2}>2× · preview</option>
</select></label>
```

**AIDirectorRevealController**: **MISSING ENTIRELY**

**Note**: This is likely an intentional prototype-only feature, not a regression.

---

## Implementation Differences

### 1. Dynamic Transition Classes vs Hardcoded Fade

**RevealPreview** (line 303):
```typescript
className={s.chapterCard + ' ' + s[beat.transition]}
```

**AIDirectorRevealController** (line 298):
```typescript
className={s.chapterCard + ' ' + s.fade}
```

**Impact**: AIDirector uses only fade transitions; RevealPreview supports multiple transition types defined in beats.

---

### 2. Stage Section Classes

**RevealPreview** (line 263):
```typescript
<section className={s.stage}>
```

**AIDirectorRevealController** (line 264):
```typescript
<section className={[s.stage, s.director, beat.finale ? s.finale : ''].join(' ')}
  data-beat={beat.id} data-kind={beat.kind}>
```

**Impact**: AIDirector adds `s.director` class and data attributes. May cause different CSS rules to apply.

---

### 3. Memory Contribution Classes

**RevealPreview** (line 313):
```typescript
className={[s.contribution, s[beat.transition],
  !beat.introducesMessage && beat.assets.length > 0 ? s.mediaOnly : '',
  !currentMemory.assets.length ? s.letterOnly : ''].join(' ')}
data-memory={currentMemory.id}
```

**AIDirectorRevealController** (lines 306-311):
```typescript
className={[
  s.contribution,
  s.fade,
  !beat.introducesMessage && beat.assets.length > 0 ? s.mediaOnly : '',
  beat.assets.length === 0 ? s.letterOnly : ''
].join(' ')}
```

**Impact**:
- Missing `data-memory` attribute
- Hardcoded `s.fade` instead of dynamic `s[beat.transition]`
- Different letterOnly logic (probably equivalent)

---

### 4. Signature Emoji Structure

**RevealPreview** (line 319):
```typescript
<div className={s.signature}>
  — {currentMemory.name}<span aria-hidden="true">{beat.finale ? '♡' : '—'}</span>
</div>
```

**AIDirectorRevealController** (lines 317-320):
```typescript
<div className={s.signature}>
  <span>— {beat.memory.name}</span>
  <span className={s.signatureEmoji}>{beat.finale ? '♡' : '—'}</span>
</div>
```

**Impact**: Different wrapper structure may affect styling. AIDirector uses `s.signatureEmoji` class.

---

### 5. Accessibility Attributes

**RevealPreview** has extensive aria-labels:
- Line 358: `aria-label="Playback controls"`
- Line 359: `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- Line 362-366: `aria-label` on all navigation buttons
- Line 369: `aria-pressed` on sound toggle
- Line 370: `aria-label="Playback speed"`

**AIDirectorRevealController**: **MISSING MOST ARIA-LABELS**

**Impact**: Reduced accessibility for screen reader users.

---

## Additional Data Attributes Missing

**RevealPreview** includes:
- Line 313: `data-memory={currentMemory.id}` on contributions
- Line 318: `data-testid="contribution-message"` on blockquotes
- Line 250: `data-preset={preset}` on player wrapper

**AIDirectorRevealController**: Missing all of these except `data-mode`.

---

## Text-Only Memory Behavior

Both renderers handle text-only memories (no assets) correctly with `letterOnly` class. The layout differences are **not** due to the three text-only test memories.

---

## Conclusion

The production AIDirectorRevealController is **not** a reuse of the approved RevealPreview renderer. It is a **simplified reimplementation** missing:

### Critical UX Features
1. Progress bar
2. Restart button
3. Chapter eyebrow text
4. Asset count attribution
5. Playback contextual notes

### Polish & Accessibility
6. Dynamic transition classes (uses only fade)
7. Extensive aria-labels
8. Semantic data attributes

### The layout difference reported by the user is explained by these missing features and CSS class differences.

---

## Recommended Action

**Option A**: Restore missing features from RevealPreview to AIDirectorRevealController
**Option B**: Replace AIDirectorRevealController entirely with RevealPreview (pass mode="director")
**Option C**: Accept differences as intentional production simplification (requires explicit approval)

The header comment claiming reuse is misleading and should be corrected regardless of chosen approach.
