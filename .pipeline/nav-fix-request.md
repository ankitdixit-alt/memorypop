# Feature Request: Homepage Occasion Card Navigation

**Date:** 2026-07-26
**Requested By:** Founder
**Type:** UX Enhancement / Navigation Fix

---

## Problem Statement

Landing pages exist (`/birthday-memory-book`, `/retirement-memory-book`, `/farewell-memory-book`) with high SEO priority (0.9 in sitemap), but they are not discoverable from the homepage.

**Current State:**
- Homepage displays 5 beautiful occasion cards (Birthdays, Weddings, New babies, Graduations, Retirements)
- Cards are `<div>` elements - NOT clickable
- Creates false affordance: users expect to click, but nothing happens
- Current path: Homepage → Footer "Occasions" link → `/occasions` page → Occasion card (2 clicks)

**Impact:**
- Landing pages are hidden from primary traffic source
- Poor user experience (cards look clickable but aren't)
- Missed SEO internal linking opportunity
- Lower landing page traffic

---

## User Problem

Visitors to the homepage see occasion cards that visually suggest interactivity but cannot click through to learn more about specific occasions. This creates friction and hides valuable SEO landing pages.

---

## User Impact

**Before:**
- Confusion when clicking non-interactive cards
- Requires 2 clicks to reach landing pages
- Landing pages underutilized

**After:**
- Single click from homepage to landing page
- All cards interactive and rewarding
- Better conversion to occasion-specific content
- Improved SEO internal linking

---

## Goal

Make the existing homepage occasions section fully interactive without adding new sections or increasing complexity. All cards should reward clicks appropriately.

---

## Founder Requirements

### Link Behavior

**Occasions with landing pages:**
- Birthday → `/birthday-memory-book`
- Retirement → `/retirement-memory-book`
- Farewell → `/farewell-memory-book` (if card exists, currently not on homepage)

**Occasions without landing pages (Wedding, New Baby, Graduation):**
- Link to `/create?occasion=X` with pre-selected occasion

### Visual Affordances

Maintain existing design, add subtle indicators:
- Cursor pointer
- Gentle hover lift (transform: scale(1.02))
- Hover shadow enhancement
- "Learn more →" text hint
- Must feel clean and premium

### Analytics Tracking

Track `occasion_card_clicked` event with:
- `occasion`: 'birthday' | 'retirement' | 'wedding' | 'new-baby' | 'graduation'
- `destination`: URL the user is navigating to
- `source`: 'homepage'

---

## Constraints

- Do NOT add new sections (no "Explore by Occasion")
- Do NOT duplicate navigation
- Maintain existing design and layout
- Keep homepage length unchanged
- Preserve premium feel

---

## Success Outcome

Homepage occasion cards become a natural discovery path to landing pages, increasing landing page traffic and improving user experience without visual clutter.

---

## Scope

**In Scope:**
- Convert occasion card `<div>` elements to `<Link>` components
- Add hover states (lift, shadow, cursor)
- Add "Learn more →" text hints
- Implement analytics tracking
- Handle all 5 occasion cards (no inactive cards)

**Out of Scope:**
- Creating new landing pages for Wedding/New Baby/Graduation
- Adding new homepage sections
- Changing occasion card design/layout
- Mobile-specific navigation patterns
