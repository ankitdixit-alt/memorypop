# Color Palette Audit: Memory Pop Codebase

**Date:** 2026-07-10
**Auditor:** Design System Guardian

---

## Problem Statement

During the design system review of the reveal experience, I discovered **two distinct color palettes** in use across the Memory Pop website. This creates brand inconsistency and maintenance debt.

---

## Color Palette Comparison

### Palette A (Reveal + Dashboard)
Used in:
- `/src/app/m/[shareCode]/reveal/RevealExperience.tsx`
- `/src/app/dashboard/[shareCode]/page.tsx`

| Color Name | Hex Value | Usage |
|------------|-----------|-------|
| Cream Background | `#fff8ef` | Page background |
| Dark Brown | `#3a241e` | Primary text |
| Muted Brown | `#856b5f` | Secondary text |
| Coral | `#ef6a57` | Primary button |
| Coral Hover | `#e05a47` | Button hover state |
| Beige | `#ead8c9` | Borders |
| White | `#ffffff` | Card backgrounds |
| Coral Light | `#fff1e6` | Status badges (dashboard only) |

### Palette B (View Page)
Used in:
- `/src/app/m/[shareCode]/page.tsx`

| Color Name | Hex Value | Usage | Difference from Palette A |
|------------|-----------|-------|---------------------------|
| Background | `#FFF8F2` | Page background | Slightly more pink/peach |
| Dark Text | `#2B1E18` | Primary text | Warmer, more red-brown |
| Muted Text | `#6B5B52` | Secondary text | Warmer, less gray |
| Coral Button | `#FF6B57` | Primary button | Brighter, more red |
| Border | `#F0DED2` | Card borders | Warmer, more pink |

---

## Visual Difference Analysis

### Background Colors
- **Palette A:** `#fff8ef` (more yellow-cream)
- **Palette B:** `#FFF8F2` (more pink-cream)
- **Difference:** 4 hex points on red, 10 points on blue (subtle but noticeable)

### Primary Text
- **Palette A:** `#3a241e` (cooler brown)
- **Palette B:** `#2B1E18` (warmer brown)
- **Difference:** Palette B is darker and redder

### Primary Button
- **Palette A:** `#ef6a57` (muted coral)
- **Palette B:** `#FF6B57` (bright coral)
- **Difference:** Palette B is more saturated and vibrant

---

## User Impact

### Scenario: User Flow
1. User receives link: `memorypop.com/m/ABC123` (View Page - Palette B)
2. User clicks "Add Your Memory" → contributes
3. Creator clicks "View Dashboard" (Dashboard - Palette A)
4. Creator clicks "Reveal Celebration" (Reveal - Palette A)

**Result:** User sees a subtle color shift between steps 1 and 2/3/4.

### Severity Assessment
- **Perceptibility:** Low-Medium (most users won't consciously notice)
- **Brand Impact:** Medium-High (inconsistency suggests lack of polish)
- **Trust Impact:** Low (colors are close enough not to break trust)
- **Maintenance Impact:** HIGH (two palettes = double CSS debt)

---

## Root Cause Analysis

Possible explanations:
1. **Design iteration:** View page was built first, then palette was refined
2. **Multiple designers:** Different designers used different values
3. **No centralized theme:** Colors are hardcoded inline, not via Tailwind config
4. **Copy-paste errors:** Hex values were manually typed inconsistently

---

## Recommended Solution

### Option 1: Standardize to Palette A (RECOMMENDED)
**Rationale:**
- Palette A is used in 2/3 pages (reveal + dashboard)
- Dashboard is the main entry point for creators
- Palette A is more muted/sophisticated

**Action:**
Update `/src/app/m/[shareCode]/page.tsx`:
```tsx
// Current (Palette B)
bg-[#FFF8F2] → bg-[#fff8ef]
text-[#2B1E18] → text-[#3a241e]
text-[#6B5B52] → text-[#856b5f]
bg-[#FF6B57] → bg-[#ef6a57]
border-[#F0DED2] → border-[#ead8c9]
```

### Option 2: Standardize to Palette B
**Rationale:**
- View page is the first user touchpoint
- Brighter coral may perform better for CTAs

**Action:**
Update reveal and dashboard to Palette B

### Option 3: Create Tailwind Theme (BEST LONG-TERM)
**Rationale:**
- Prevents future drift
- Single source of truth
- Easier to update brand colors globally

**Action:**
Create `tailwind.config.js`:
```js
module.exports = {
  theme: {
    extend: {
      colors: {
        'memorypop-cream': '#fff8ef',
        'memorypop-dark': '#3a241e',
        'memorypop-muted': '#856b5f',
        'memorypop-coral': '#ef6a57',
        'memorypop-coral-hover': '#e05a47',
        'memorypop-border': '#ead8c9',
      }
    }
  }
}
```

Then update all pages:
```tsx
bg-[#fff8ef] → bg-memorypop-cream
text-[#3a241e] → text-memorypop-dark
```

---

## Implementation Priority

### Critical (Block Merge)
- None - this is not a merge blocker

### High (Before Scale)
- ✅ **Standardize to one palette** (recommend Palette A)
- ✅ **Update view page** to match dashboard/reveal

### Medium (Next Sprint)
- ⚠️ **Create Tailwind theme** to prevent future drift
- ⚠️ **Document color usage** in design system

### Low (Backlog)
- 📋 **Add color contrast tests** (a11y)
- 📋 **Add visual regression tests** (Percy/Chromatic)

---

## File Locations for Update

If standardizing to Palette A:

**File to Update:**
- `/src/app/m/[shareCode]/page.tsx` (View Page)

**Lines to Change:**
- Line 37: `bg-[#FFF8F2]` → `bg-[#fff8ef]`
- Line 37: `text-[#2B1E18]` → `text-[#3a241e]`
- Line 46: `text-[#6B5B52]` → `text-[#856b5f]`
- Line 52: `bg-[#FF6B57]` → `bg-[#ef6a57]`
- Line 59: `border-[#F0DED2]` → `border-[#ead8c9]`
- Line 60: `text-[#6B5B52]` → `text-[#856b5f]`
- Line 78: `text-[#6B5B52]` → `text-[#856b5f]`
- Line 97: `text-[#2B1E18]` → `text-[#3a241e]`
- Line 100: `text-[#6B5B52]` → `text-[#856b5f]`
- Line 108: `text-[#4A372F]` → `text-[#3a241e]` (this is a NEW color - body text)

**Files to Reference (Correct Palette):**
- `/src/app/dashboard/[shareCode]/page.tsx`
- `/src/app/m/[shareCode]/reveal/RevealExperience.tsx`

---

## Testing Plan

After updating view page:

1. **Visual QA:**
   - Open view page → should match dashboard cream tone
   - Click "Add Your Memory" button → should match dashboard coral
   - Navigate view → dashboard → reveal → colors should feel seamless

2. **Browser Testing:**
   - Test in Safari (color rendering differs)
   - Test in dark mode (if supported)
   - Test on iPhone (color profiles differ)

3. **Accessibility:**
   - Run WCAG contrast checker on new colors
   - Ensure text remains readable

---

## Conclusion

**Finding:** Two color palettes exist in production
**Impact:** Medium (brand inconsistency, maintenance debt)
**Recommendation:** Standardize to Palette A (reveal/dashboard colors)
**Effort:** Low (10 line changes in one file)
**Blocker Status:** NOT a merge blocker, but should be fixed before scale

---

**Audit Completed:** 2026-07-10
**Status:** Documented, awaiting fix
**Next Action:** Update view page colors (1 file, 10 lines)
