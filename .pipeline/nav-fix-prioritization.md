# Product Owner Decision: Homepage Occasion Card Navigation

**Date:** 2026-07-26
**Product Owner:** Founder (Direct Approval)
**Feature:** Make homepage occasion cards clickable/interactive

---

## Decision

**BUILD NOW**

---

## Rationale

### Customer Value: High

**Problem:**
- Landing pages exist but are hidden (requires 2 clicks from homepage)
- False affordance: cards look clickable but do nothing
- Users cannot discover occasion-specific content

**Value:**
- Direct path from homepage → landing pages (2 clicks → 1 click)
- All cards rewarding (no dead-end clicks)
- Better SEO internal linking
- Increased landing page traffic

### MVP Alignment: High

- Landing pages already exist (`/birthday-memory-book`, `/retirement-memory-book`, `/farewell-memory-book`)
- This fix exposes existing value rather than building new features
- Improves discoverability of SEO-optimized content
- Enhances homepage conversion paths

### Smallest Useful Slice

**Exact scope:**
- Convert 5 existing occasion cards to `<Link>` components
- Add subtle hover affordances
- Add analytics tracking
- No new sections, no design changes

**Implementation effort:** ~2 hours
**User impact:** Immediate improvement in landing page discoverability

---

## Founder Approval Notes

Founder directly reviewed navigation audit and approved Option 1 with modifications:

**Key Requirements:**
1. Use existing occasions section (no new sections)
2. All cards must be interactive (no inactive cards)
3. Occasions with landing pages → link to landing page
4. Occasions without landing pages → link to `/create?occasion=X`
5. Subtle visual affordances only
6. Analytics tracking required
7. Stop after implementation for Founder review

---

## Scope Definition

### In Scope

**Core Changes:**
- Birthday card → `/birthday-memory-book`
- Retirement card → `/retirement-memory-book`
- Wedding card → `/create?occasion=wedding`
- New Baby card → `/create?occasion=baby`
- Graduation card → `/create?occasion=graduation`

**Visual Enhancement:**
- Hover lift (scale 1.02)
- Enhanced shadow on hover
- Cursor pointer
- "Learn more →" text hint

**Analytics:**
- `occasion_card_clicked` event
- Track: occasion, destination, source

### Out of Scope

- New homepage sections
- Design/layout changes
- Creating new landing pages
- Farewell card (not currently on homepage)

---

## Success Outcome

Homepage occasion cards become natural discovery mechanism for landing pages, increasing traffic without adding complexity.

---

## Risk Assessment

**Low Risk:**
- Small, bounded change
- No design alteration
- Uses existing Next.js Link component
- Analytics already instrumented

**Mitigation:**
- Test all 5 links
- Verify analytics events fire
- Check mobile responsiveness
- Confirm hover states feel premium

---

## Dependencies

**None** - All pages and infrastructure exist.

---

## Implementation Priority

**P0 - Immediate**

Rationale:
- Quick win (2 hours)
- High user impact
- Exposes existing SEO investment
- Founder directly approved

---

## Next Steps

1. Planning: Create implementation spec
2. Implementation: Convert cards to Links, add hover states, add analytics
3. Stop for Founder review (as instructed)
4. After approval: Testing → Judge → Review → Founder validation
