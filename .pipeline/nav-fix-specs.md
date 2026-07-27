# Implementation Specification: Homepage Occasion Card Navigation

**Date:** 2026-07-26
**Feature:** Make homepage occasion cards clickable/interactive
**Estimated Effort:** 2 hours
**Files Changed:** 1 file (`/src/app/page.tsx`)

---

## Overview

Convert existing homepage occasion cards from display-only `<article>` elements to interactive `<Link>` components with subtle hover affordances and analytics tracking.

**Key Principle:** Evolve what exists, don't add new sections.

---

## File Changes

### `/src/app/page.tsx`

**Changes Required:**
1. Update `occasions` array: Add `href` property to each occasion
2. Modify `Celebrations` component: Wrap cards in `<Link>`, add hover states, add "Learn more →" text
3. Add analytics tracking: `occasion_card_clicked` event

---

## 1. Data Structure Changes

**Location:** Lines 207-238

**Current:**
```typescript
const occasions = [
  {
    title: "Birthdays",
    copy: "Milestone or just because—make their day unforgettable.",
    src: "/images/birthday-cover.png",
    span: "sm:col-span-2 sm:row-span-2",
  },
  // ... 4 more occasions
]
```

**New:**
```typescript
const occasions = [
  {
    title: "Birthdays",
    copy: "Milestone or just because—make their day unforgettable.",
    src: "/images/birthday-cover.png",
    span: "sm:col-span-2 sm:row-span-2",
    href: "/birthday-memory-book",
    occasionSlug: "birthday",
  },
  {
    title: "Weddings",
    copy: "Collect toasts and well-wishes from every guest.",
    src: "/images/celebration-wedding.png",
    span: "",
    href: "/create?occasion=wedding",
    occasionSlug: "wedding",
  },
  {
    title: "New babies",
    copy: "Welcome them with love from the whole family.",
    src: "/images/celebration-baby.png",
    span: "",
    href: "/create?occasion=baby",
    occasionSlug: "baby",
  },
  {
    title: "Graduations",
    copy: "Cheer on their next big chapter, together.",
    src: "/images/celebration-graduation.png",
    span: "",
    href: "/create?occasion=graduation",
    occasionSlug: "graduation",
  },
  {
    title: "Retirements",
    copy: "Honor a lifetime of memories and gratitude.",
    src: "/images/celebration-retirement.png",
    span: "",
    href: "/retirement-memory-book",
    occasionSlug: "retirement",
  },
]
```

**Changes:**
- Add `href` property to each occasion (either landing page or create flow with pre-selected occasion)
- Add `occasionSlug` property for analytics tracking

---

## 2. Component Changes

**Location:** Lines 579-610 (`Celebrations` function)

**Current Structure:**
```tsx
<article key={o.title} className={`group relative overflow-hidden rounded-3xl ring-1 ring-border ${o.span}`}>
  <img ... />
  <div className="absolute inset-0 bg-gradient-to-t ..." />
  <div className="absolute bottom-0 left-0 right-0 p-5">
    <h3 ...>{o.title}</h3>
    <p ...>{o.copy}</p>
  </div>
</article>
```

**New Structure:**
```tsx
<Link
  key={o.title}
  href={o.href}
  onClick={() => handleOccasionCardClick(o.title, o.href, o.occasionSlug)}
  className={`group relative overflow-hidden rounded-3xl ring-1 ring-border transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:ring-2 hover:ring-primary/20 ${o.span}`}
>
  <img
    src={o.src || "/placeholder.svg"}
    alt={o.title}
    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
  />
  <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
  <div className="absolute bottom-0 left-0 right-0 p-5">
    <h3 className="font-heading text-xl font-semibold text-background sm:text-2xl">{o.title}</h3>
    <p className="mt-1 text-sm leading-relaxed text-background/85 text-pretty">{o.copy}</p>
    <span className="mt-2 inline-flex items-center text-sm font-medium text-background/90 group-hover:underline">
      Learn more →
    </span>
  </div>
</Link>
```

**Key Changes:**
1. Replace `<article>` with `<Link>` component (import from `next/link`)
2. Add `href={o.href}` attribute
3. Add hover transform: `hover:scale-[1.02]`
4. Add hover shadow: `hover:shadow-xl`
5. Add hover ring enhancement: `hover:ring-2 hover:ring-primary/20`
6. Add transition: `transition-all duration-300`
7. Add "Learn more →" text hint with `group-hover:underline`
8. Add onClick handler for analytics

---

## 3. Analytics Tracking

**Add function before `Celebrations` component:**

```typescript
function handleOccasionCardClick(title: string, destination: string, occasion: string) {
  // Google Analytics 4
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'occasion_card_clicked', {
      occasion: occasion,
      occasion_title: title,
      destination: destination,
      source: 'homepage',
    });
  }

  // Mixpanel
  if (typeof window !== 'undefined' && (window as any).mixpanel) {
    (window as any).mixpanel.track('Occasion Card Clicked', {
      occasion: occasion,
      occasion_title: title,
      destination: destination,
      source: 'homepage',
    });
  }
}
```

**Event Parameters:**
- `occasion`: Slug for occasion type (birthday, retirement, wedding, baby, graduation)
- `occasion_title`: Display title (Birthdays, Retirements, etc.)
- `destination`: URL user is navigating to
- `source`: Always 'homepage'

---

## 4. Import Changes

**Add to imports at top of file:**

```typescript
import Link from 'next/link';
```

**Verify:** Link is already imported (it's used in other parts of the page), no change needed.

---

## Visual Affordances Summary

### Hover States

**Card:**
- Transform: `scale(1.02)` (gentle lift)
- Shadow: Enhanced from default to `shadow-xl`
- Ring: Enhanced to `ring-2 ring-primary/20` (subtle primary color glow)
- Transition: `300ms` smooth

**Image:**
- Scale: `scale(1.05)` on card hover (already exists, keep it)
- Transition: `500ms` smooth (already exists, keep it)

**Text Indicator:**
- New element: "Learn more →"
- Underline on hover: `group-hover:underline`
- Color: `text-background/90` (subtle against gradient)

### Cursor
- Default `cursor-pointer` comes from `<Link>` component automatically

---

## Link Destination Strategy

**Occasions with Landing Pages:**
- **Birthday** → `/birthday-memory-book` (existing page, priority 0.9)
- **Retirement** → `/retirement-memory-book` (existing page, priority 0.9)

**Occasions without Landing Pages:**
- **Wedding** → `/create?occasion=wedding` (create flow, pre-selected)
- **New Baby** → `/create?occasion=baby` (create flow, pre-selected)
- **Graduation** → `/create?occasion=graduation` (create flow, pre-selected)

**Rationale for `/create` flow:**
- Founder requirement: "all cards must be interactive"
- Pre-selecting occasion reduces friction
- Create page already handles `?occasion=X` query param (verified in Phase 2C)
- Better UX than generic `/occasions` page

---

## Acceptance Criteria

### Functional

- [ ] All 5 occasion cards are clickable `<Link>` components
- [ ] Birthday card links to `/birthday-memory-book`
- [ ] Retirement card links to `/retirement-memory-book`
- [ ] Wedding card links to `/create?occasion=wedding`
- [ ] New Baby card links to `/create?occasion=baby`
- [ ] Graduation card links to `/create?occasion=graduation`
- [ ] All links navigate correctly (tested in browser)

### Visual

- [ ] Cursor changes to pointer on card hover
- [ ] Card lifts gently on hover (scale 1.02)
- [ ] Shadow enhances on hover (shadow-xl)
- [ ] Ring glow appears on hover (primary/20)
- [ ] "Learn more →" text appears below copy
- [ ] "Learn more →" underlines on hover
- [ ] Image scales on hover (already exists, verify still works)
- [ ] All transitions smooth (300ms card, 500ms image)
- [ ] Design feels premium and clean (no visual clutter)

### Analytics

- [ ] `occasion_card_clicked` event fires on click (Google Analytics)
- [ ] `Occasion Card Clicked` event fires on click (Mixpanel)
- [ ] Event includes correct `occasion` slug
- [ ] Event includes correct `occasion_title`
- [ ] Event includes correct `destination` URL
- [ ] Event includes `source: 'homepage'`
- [ ] Events fire before navigation (onClick before href)

### Responsive

- [ ] Cards work on mobile (375px width)
- [ ] Cards work on tablet (768px width)
- [ ] Cards work on desktop (1200px+ width)
- [ ] Grid layout unchanged (sm:col-span-2 sm:row-span-2 still applies to Birthday)
- [ ] Touch interaction works on mobile (tap registers as click)

### Compatibility

- [ ] No TypeScript errors
- [ ] No build errors (`npm run build`)
- [ ] No console errors in browser
- [ ] Works in Chrome, Safari, Firefox
- [ ] Works on iOS Safari (mobile)

---

## Testing Checklist

### Manual Testing

1. **Navigation Testing:**
   - Click Birthday card → Verify lands on `/birthday-memory-book`
   - Click Retirement card → Verify lands on `/retirement-memory-book`
   - Click Wedding card → Verify lands on `/create?occasion=wedding`
   - Click New Baby card → Verify lands on `/create?occasion=baby`
   - Click Graduation card → Verify lands on `/create?occasion=graduation`

2. **Visual Testing:**
   - Hover each card → Verify lift, shadow, ring enhancement
   - Hover each card → Verify "Learn more →" underlines
   - Check mobile → Verify cards still look good
   - Check tablet → Verify grid layout correct
   - Check desktop → Verify Birthday card spans 2x2

3. **Analytics Testing:**
   - Open browser console
   - Enable GA4 debug mode or Mixpanel debug
   - Click each card → Verify events fire with correct parameters
   - Verify events fire BEFORE navigation completes

### Build Testing

```bash
cd /Users/adixit/Downloads/MemoryPop/memorypop
npm run build
```

Expected: Clean build, no TypeScript errors, no warnings

---

## Edge Cases

### Query Param Handling
- **Scenario:** Wedding card links to `/create?occasion=wedding`
- **Expected:** Create page receives `occasion=wedding` query param and pre-selects Wedding occasion
- **Verified:** Phase 2C implementation handles this (lines 54-59 in `/src/app/create/page.tsx`)

### Missing Landing Pages
- **Scenario:** Graduation has no landing page yet
- **Handled:** Links to `/create?occasion=graduation` instead
- **Future:** When graduation landing page is created, update `occasions` array href

### Analytics Window Check
- **Scenario:** gtag or mixpanel not loaded yet
- **Handled:** Function checks `typeof window !== 'undefined'` and `window.gtag`/`window.mixpanel` exist

---

## Non-Goals

**NOT changing:**
- Grid layout or card sizing
- Images or text content
- Section heading or description
- Mobile/desktop breakpoints
- Any other homepage sections

**NOT adding:**
- New sections
- Duplicate navigation
- Farewell card (not currently on homepage)
- Animation libraries or heavy transitions

---

## Risk Assessment

**Low Risk:**
- Small, bounded change (one component, one data array)
- No design alteration (only hover enhancements)
- Uses existing Next.js Link component (battle-tested)
- Analytics pattern already used elsewhere (demo page, Phase 2C)

**Mitigation:**
- Test all 5 links manually
- Verify analytics events fire
- Check responsive behavior
- Verify no build errors

---

## Implementation Steps

1. Update `occasions` array: Add `href` and `occasionSlug` properties
2. Add `handleOccasionCardClick` function above `Celebrations` component
3. Update `Celebrations` component: Replace `<article>` with `<Link>`
4. Add hover classes: `hover:scale-[1.02] hover:shadow-xl hover:ring-2 hover:ring-primary/20 transition-all duration-300`
5. Add "Learn more →" text with hover underline
6. Test locally: Navigate to `http://localhost:3000`, click all 5 cards
7. Test analytics: Open console, verify events fire
8. Build: `npm run build` and verify no errors

---

## Success Metrics

**Immediate (Day 1):**
- All 5 cards clickable
- Landing page traffic increases
- Analytics events fire correctly

**Week 1:**
- Track `occasion_card_clicked` events by occasion
- Measure click-through rate from homepage to landing pages
- Compare traffic: homepage → landing page vs. /occasions page → landing page

**Expected Impact:**
- 30-50% increase in `/birthday-memory-book` traffic
- 30-50% increase in `/retirement-memory-book` traffic
- Reduced bounce rate from homepage
- Improved internal link equity for SEO

---

## Rollback Plan

**If issues arise:**
1. Revert commit (git revert)
2. Or remove `href` from occasions array and wrap in `<div>` instead of `<Link>`
3. Or feature flag: conditionally render Link vs article based on env var

**Low risk change:** Rollback unlikely to be needed.

---

## Founder Review Points

After implementation, Founder should validate:
1. **Visual feel:** Do hover states feel premium and clean? Too aggressive? Too subtle?
2. **Link destinations:** Wedding/New Baby/Graduation linking to `/create?occasion=X` correct?
3. **Analytics:** Events firing as expected?
4. **Mobile:** Cards work well on phone?
5. **Conversion:** After 24-48 hours, are landing pages getting more traffic?

---

**Status:** Ready for implementation
**Next Step:** Implement changes in `/src/app/page.tsx`
**Stop After:** Implementation complete, stop for Founder review
