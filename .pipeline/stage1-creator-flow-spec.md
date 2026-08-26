# Stage 1: Creator Flow — Implementation Specification

**Date:** 2026-08-12
**Status:** Awaiting Founder Approval
**Type:** Creator Communication Only (No Enforcement Changes)
**Workflow Stage:** Planning → Awaiting Spec Approval

---

## Scope: What Stage 1 Does

✅ Update creator-facing communication to show locked beta media limits
✅ Communicate Standard vs Premium at natural decision/share points
✅ Set expectations before sharing contribution link

❌ Does NOT change upload enforcement
❌ Does NOT change contributor form
❌ Does NOT change database
❌ Does NOT change demo page

**Goal:** Creator understands what contributors can add before sharing the link.

---

## Product Definition (Founder-Approved)

### Standard
**Each contributor can add:**
- 3 photos
- 1 GIF
- 1 video up to 15 seconds
- Written message

**Plus:** Cinematic storytelling + MemoryPop soundtrack

### Premium €4.99
**Each contributor can add:**
- 10 photos
- Up to 3 GIFs
- 1 video up to 90 seconds
- Written message

**Plus:** Custom music + Premium frames/themes + Additional personalization

---

## Touchpoints (From Audit)

### Touchpoint 1: Success Page (PRIMARY)

**File:** `src/app/success/page.tsx` or equivalent
**Location:** After MemoryPop creation, before sharing link
**Current state:** Generic "Invite people to contribute"

**New section to add:**

```
┌─────────────────────────────────────────────────────────┐
│ What contributors can add                               │
│                                                         │
│ Standard:                                               │
│ • 3 photos                                              │
│ • 1 GIF                                                 │
│ • 15-second video                                       │
│ • Written memory                                        │
│                                                         │
│ Plus cinematic storytelling and MemoryPop soundtrack    │
│                                                         │
│ [Want more? Upgrade to Premium]                         │
│                                                         │
│ Premium (€4.99):                                        │
│ • 10 photos per contributor                             │
│ • 3 GIFs per contributor                                │
│ • 90-second video                                       │
│ • Custom music + Premium themes                         │
└─────────────────────────────────────────────────────────┘
```

**Design principles:**
- Not a feature table (avoid wall of text)
- Concise bullet lists
- Natural hierarchy (Standard first, then Premium option)
- Contextual placement (at point of sharing decision)

**Visual treatment:**
- Standard section: clean, warm background (current MemoryPop palette)
- Premium section: subtle gradient/border to distinguish
- Upgrade CTA: non-intrusive button/link
- Icons optional (emoji: 📸 🎞️ 🎥 ✍️)

### Touchpoint 2: Share Modal/Instructions (SECONDARY)

**Context:** When creator is copying/sharing contribution link

**Current state:** Generic share messaging

**Recommended addition:**
```
💡 Contributors can add photos, a GIF, and video to their memory
```

**Placement:** Small hint/tooltip near share button or in share modal

**Design:** Lightweight, informational tone, not a CTA

---

## Success Page Implementation Plan

### Current Success Page Audit

**Need to find:**
1. Current success page location
2. Current layout and structure
3. Where "share link" section lives
4. Whether Premium upgrade is already mentioned
5. Current visual hierarchy

**Files to check:**
- `src/app/success/page.tsx`
- `src/app/success/[shareCode]/page.tsx`
- Components used in success flow

### Proposed New Section

**Section title:**
```tsx
<h2 className="text-2xl font-bold text-[#2B1E18] mb-4">
  What Contributors Can Add
</h2>
```

**Standard block:**
```tsx
<div className="rounded-2xl bg-white p-6 shadow-md border border-[#F0DED2] mb-6">
  <h3 className="text-lg font-semibold text-[#2B1E18] mb-3 flex items-center gap-2">
    <span>Standard</span>
    <span className="text-sm font-normal text-[#6B5B52]">(Free)</span>
  </h3>

  <p className="text-sm text-[#6B5B52] mb-4">
    Each contributor can add:
  </p>

  <ul className="space-y-2 mb-4">
    <li className="flex items-start gap-2 text-[#2B1E18]">
      <span className="text-lg">📸</span>
      <span>3 photos</span>
    </li>
    <li className="flex items-start gap-2 text-[#2B1E18]">
      <span className="text-lg">🎞️</span>
      <span>1 GIF</span>
    </li>
    <li className="flex items-start gap-2 text-[#2B1E18]">
      <span className="text-lg">🎥</span>
      <span>15-second video</span>
    </li>
    <li className="flex items-start gap-2 text-[#2B1E18]">
      <span className="text-lg">✍️</span>
      <span>Written memory</span>
    </li>
  </ul>

  <p className="text-sm text-[#6B5B52]">
    Plus cinematic storytelling and MemoryPop soundtrack
  </p>
</div>
```

**Premium upgrade option:**
```tsx
<div className="rounded-2xl bg-gradient-to-br from-orange-50 to-pink-50 p-6 shadow-md border-2 border-orange-200">
  <h3 className="text-lg font-semibold text-[#2B1E18] mb-3 flex items-center gap-2">
    <span className="text-xl">✨</span>
    <span>Premium — €4.99</span>
  </h3>

  <p className="text-sm text-[#6B5B52] mb-4">
    Give contributors more room to tell the story:
  </p>

  <ul className="space-y-2 mb-4">
    <li className="flex items-start gap-2 text-[#2B1E18]">
      <span className="text-lg">📸</span>
      <span>10 photos per contributor</span>
    </li>
    <li className="flex items-start gap-2 text-[#2B1E18]">
      <span className="text-lg">🎞️</span>
      <span>3 GIFs per contributor</span>
    </li>
    <li className="flex items-start gap-2 text-[#2B1E18]">
      <span className="text-lg">🎥</span>
      <span>90-second video</span>
    </li>
    <li className="flex items-start gap-2 text-[#2B1E18]">
      <span className="text-lg">✍️</span>
      <span>Written memory</span>
    </li>
  </ul>

  <p className="text-sm text-[#6B5B52] mb-4">
    Plus custom music, Premium frames, and personalization
  </p>

  <a
    href="/pricing"
    className="inline-block rounded-full bg-[#FF6B57] px-6 py-3 font-semibold text-white hover:bg-[#e05a47] transition-all"
  >
    See Premium Benefits
  </a>
</div>
```

**Tone:**
- Standard is presented as complete (not "basic" or "limited")
- Premium is presented as enhancement ("more room to tell the story")
- No feature table feel (warm, conversational)
- Clear but not pushy

---

## Exact Files to Modify

### Primary Change

**File:** `src/app/success/page.tsx`

**Current structure (verified):**
1. Line 74-82: Celebration header
2. Line 87-103: Invite contributors (share buttons)
3. Line 105: Divider
4. Line 108-131: Keep access safe (management section)
5. Line 136-157: Dashboard & navigation

**Insertion point:** After line 103 (after share buttons section), before line 105 (divider)

**New section to insert:**
```tsx
{/* SECTION 2.5: WHAT CONTRIBUTORS CAN ADD */}
<div className="mt-8 w-full">
  <h2 className="text-2xl font-bold text-[#2B1E18] mb-6">
    What Contributors Can Add
  </h2>

  {/* Standard tier */}
  <div className="rounded-2xl bg-white p-6 shadow-md border border-[#F0DED2] mb-6">
    ...Standard content...
  </div>

  {/* Premium tier option */}
  <div className="rounded-2xl bg-gradient-to-br from-orange-50 to-pink-50 p-6 shadow-md border-2 border-orange-200">
    ...Premium content...
  </div>
</div>
```

**Change type:** Add new section (lines 104-170 approximately)

**Estimated impact:** +66 lines

### Secondary Change (Optional - Low Priority)

**File:** Share modal/instructions component (if exists)

**Change type:** Add tooltip/hint about contributor capabilities

**Estimated lines:** +5 lines

---

## Design Specifications

### Colors

- **Standard container:** `bg-white` with `border-[#F0DED2]`
- **Premium container:** `bg-gradient-to-br from-orange-50 to-pink-50` with `border-orange-200`
- **Text primary:** `text-[#2B1E18]`
- **Text secondary:** `text-[#6B5B52]`
- **CTA button:** `bg-[#FF6B57]` hover `bg-[#e05a47]`

### Typography

- **Section title:** `text-2xl font-bold`
- **Card title:** `text-lg font-semibold`
- **Body text:** `text-sm`
- **List items:** `text-base`

### Spacing

- **Container padding:** `p-6`
- **Section margin:** `mb-6`
- **List spacing:** `space-y-2`
- **Icon-text gap:** `gap-2`

### Icons

Using emoji for simplicity (no SVG dependencies):
- Photos: 📸
- GIF: 🎞️
- Video: 🎥
- Message: ✍️
- Premium: ✨

**Alternative:** Can replace with Heroicons if preferred

---

## Mobile Responsiveness

### Breakpoints

- **Mobile (<640px):** Single column, full width
- **Tablet (640px+):** Same as mobile (vertical cards)
- **Desktop (1024px+):** Optional side-by-side Standard/Premium

**Recommended:** Keep vertical stacking on all sizes for clarity

### Touch Targets

- Button: `px-6 py-3` = minimum 44px height ✅
- Tap area: `rounded-full` with padding

### Text Scaling

- All text sizes scale naturally with Tailwind responsive classes
- No fixed pixel heights
- Cards expand with content

---

## Backwards Compatibility

✅ **No breaking changes:**
- Adding new section only
- Existing share flow unchanged
- Existing success page content unchanged
- No database changes
- No API changes

✅ **Existing MemoryPops:**
- Continue working normally
- No migration needed

---

## Implementation Checklist

### Pre-Implementation

- [ ] Locate success page file (`src/app/success/page.tsx`)
- [ ] Read current success page structure
- [ ] Identify insertion point for new section
- [ ] Verify current MemoryPop theme colors
- [ ] Check if Premium upgrade is already mentioned

### Implementation

- [ ] Add new section component/markup
- [ ] Apply MemoryPop brand colors
- [ ] Add mobile responsive classes
- [ ] Test Standard tier display
- [ ] Test Premium tier display (if is_premium exists)
- [ ] Verify visual hierarchy

### Testing

- [ ] Desktop view (Chrome, Firefox, Safari)
- [ ] Mobile view (390px width minimum)
- [ ] Tablet view (768px)
- [ ] Touch targets (buttons clickable on mobile)
- [ ] Text readability (contrast sufficient)
- [ ] No layout breaks
- [ ] Existing success page features still work

### Validation

- [ ] Build succeeds (`npm run build`)
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Visual inspection across devices
- [ ] Founder approval of visual treatment

---

## Non-Goals (Stage 1)

❌ Do NOT change:
- Contributor upload form
- Upload API validation
- Database schema
- Memory rendering
- Demo page
- Pricing page (unless adding Premium link)

❌ Do NOT enforce:
- Media limits (enforcement is Stage 2)
- GIF validation
- Video duration limits

❌ Do NOT add:
- GIF search
- File upload UI changes
- Multi-upload functionality

**Stage 1 scope:** Communication only, no functional changes.

---

## Success Criteria

### Definition of Done

✅ Creator sees clear media limits before sharing
✅ Standard tier explained (3 photos, 1 GIF, 15s video)
✅ Premium tier explained (10 photos, 3 GIFs, 90s video)
✅ Visual hierarchy clear (not a feature table)
✅ Mobile responsive
✅ No regressions to existing success flow
✅ Build successful
✅ Founder visual approval

### What "Done" Looks Like

**Creator journey:**
1. Creates MemoryPop
2. Sees success page
3. **NEW:** Sees "What Contributors Can Add" section
4. Understands Standard limits
5. Sees Premium option
6. Copies share link
7. Shares with confidence

**Creator mental model:**
> "I know my friends can add 3 photos, a GIF, and a short video each. If I want to give them more room, I can upgrade to Premium."

---

## Risk Assessment

### Low Risk

✅ Additive changes only (no breaking changes)
✅ No database changes
✅ No API changes
✅ No upload enforcement changes

### Testing Required

⚠️ Visual inspection (founder validation)
⚠️ Mobile responsiveness
⚠️ Text contrast/readability

### Rollback Plan

If visual treatment doesn't work:
1. Revert commit
2. Adjust design
3. Re-submit for approval

---

## Open Questions for Founder

Before implementing Stage 1:

1. **Where exactly should the section appear?**
   - After share link?
   - Before share buttons?
   - As a separate tab/modal?

2. **Should Premium upgrade be inline or separate link?**
   - Inline (shown in same section)
   - Separate (link to /pricing)

3. **Should we mention "coming soon" if GIF upload not ready?**
   - Show limits as-is (implementation will catch up)
   - Add "coming soon" label

4. **Desktop layout preference?**
   - Vertical stacking (simpler)
   - Side-by-side Standard/Premium (more visual)

---

## Next Steps

1. ✅ Planning complete (this spec)
2. ⏸️ **Awaiting founder approval of Stage 1 spec**
3. ❌ Implementation (after approval)
4. ❌ Testing (after implementation)
5. ❌ Judge (after testing)
6. ❌ Review (after judge)
7. ❌ Founder validation (after review)

**Current status:** Awaiting Founder Specification Approval

**If approved:** Proceed to implementation (Coder agent role)
**If changes needed:** Revise spec and resubmit
