# Implementation Specification: Creator Dashboard v2 (Phase 1)

## Overview

This specification details the Phase 1 enhancement of the Creator Dashboard at `/dashboard/[shareCode]`. The goal is to improve visual hierarchy, add progress visibility, and consolidate quick actions while staying within a tight budget of $4.75-5.25.

**What Phase 1 delivers:**
- Progress card showing memory collection status
- Memory counter breakdown (messages, photos, contributors)
- Consolidated quick actions section
- Enhanced empty state
- Better layout and visual hierarchy

**What Phase 1 explicitly does NOT deliver:**
- Recent activity feed (deferred to Phase 2)
- Real-time updates (refresh-based is acceptable)
- Activity timestamps or contributor attribution
- New database queries or schema changes

---

## Files to Modify

### Primary File
**Path:** `/Users/adixit/Downloads/MemoryPop/memorypop/src/app/dashboard/[shareCode]/page.tsx`

**Strategy:** Enhance existing dashboard by reorganizing layout and adding new card components inline. Do NOT rebuild from scratch.

### Supporting Files (No Changes Required)
- `/Users/adixit/Downloads/MemoryPop/memorypop/src/components/ShareButtons.tsx` - Reuse as-is
- `/Users/adixit/Downloads/MemoryPop/memorypop/src/lib/supabase.ts` - No changes needed

---

## Phase 1 Scope (Build ONLY These Features)

### 1. Progress Card

**Purpose:** Show collection progress at the top of the dashboard to build anticipation and momentum.

**Design:**
```
┌─────────────────────────────────────┐
│  ❤️ 8 Memories Collected            │
│                                     │
│  Goal:                              │
│  Collect memories before the        │
│  celebration.                       │
└─────────────────────────────────────┘
```

**Implementation Details:**
- Position: Top of dashboard, below header
- Background: White card with `rounded-2xl shadow-sm`
- Text styling:
  - "❤️ X Memories Collected" - Large, bold, primary color (`#3a241e`)
  - "Goal:" - Small, uppercase, secondary color (`#856b5f`)
  - Goal text - Regular, primary color
- Data source: `memoryCount` (already calculated)
- Singular/plural handling: "1 Memory Collected" vs "X Memories Collected"

**Conditional Logic:**
- Hide this card entirely when `memoryCount === 0`
- Show empty state card instead (see section 5)

---

### 2. Memory Counter Breakdown

**Purpose:** Display detailed metrics with clear visual separation.

**Design:**
```
┌──────────────┬──────────────┬──────────────┐
│   Messages   │    Photos    │ Contributors │
│      15      │      12      │      8       │
└──────────────┴──────────────┴──────────────┘
```

**Implementation Details:**
- Position: Below progress card
- Layout: 3-column grid on desktop, single column on mobile
- Each column: White card with `rounded-2xl shadow-sm`
- Text styling:
  - Number: Large, bold, primary color (`#3a241e`)
  - Label: Small, secondary color (`#856b5f`)
- Icons (optional): Consider adding small icons before labels

**Data Calculations:**
```typescript
// Messages count
const messagesCount = memories?.filter(m => m.message && m.message.trim() !== '').length || 0;

// Photos count
const photosCount = memories?.filter(m => m.photo_url).length || 0;

// Contributors count (already calculated)
const contributorCount = new Set(
  memories?.map((m) => m.contributor_name) || []
).size;
```

**Edge Cases:**
- Zero values: Display "0" not "-" or empty
- Singular labels: "1 Message", "1 Photo", "1 Contributor"
- Plural labels: "X Messages", "X Photos", "X Contributors"

---

### 3. Quick Actions Section

**Purpose:** Consolidate all dashboard actions in one organized section.

**Current State:**
- ShareButtons component with Copy Link + WhatsApp (lines 103-106)
- Reveal Celebration button (lines 108-115)
- Open MemoryPop link (lines 117-123)

**Enhanced Design:**
```
┌─────────────────────────────────────┐
│        Share or View                │
│                                     │
│  [Copy Link] [Share WhatsApp]       │
│                                     │
│  [Preview MemoryPop]                │
│                                     │
│  [Reveal Celebration]   (if memories)│
└─────────────────────────────────────┘
```

**Implementation Details:**
- Position: Below memory counter breakdown
- Background: White card with `rounded-2xl shadow-sm`
- Section title: "Quick Actions" or "Share or View" (uppercase, secondary color)
- Button order:
  1. ShareButtons component (Copy Link + WhatsApp)
  2. Preview MemoryPop button (secondary style)
  3. Reveal Celebration button (primary style, conditional)

**Button Styles:**
- **Primary action** (Reveal Celebration):
  - Background: `#ef6a57` (coral)
  - Text: White
  - Full width on mobile
  - Hover: `#e05a47`

- **Secondary action** (Preview MemoryPop):
  - Background: White
  - Border: `1px solid #ead8c9`
  - Text: `#3a241e`
  - Full width on mobile
  - Hover: `#fff8ef`

**Conditional Logic:**
- Reveal Celebration button: Only show when `memoryCount > 0`
- All other actions: Always visible

---

### 4. Empty State

**Purpose:** Guide creators when no memories have been collected yet.

**Design:**
```
┌─────────────────────────────────────┐
│                                     │
│  No memories yet.                   │
│                                     │
│  Share your MemoryPop to start      │
│  collecting beautiful memories ❤️   │
│                                     │
│  [Copy Link] [Share WhatsApp]       │
│                                     │
└─────────────────────────────────────┘
```

**Implementation Details:**
- Position: Replaces progress card when `memoryCount === 0`
- Background: White card with `rounded-2xl shadow-sm`
- Text styling:
  - "No memories yet." - Bold, larger, primary color
  - Description - Regular, secondary color
  - Heart emoji at end
- Include ShareButtons component for immediate action
- Center-aligned text

**Conditional Logic:**
```typescript
if (memoryCount === 0) {
  // Show empty state card (replaces progress card)
  // Hide memory counter breakdown
  // Show quick actions (but NOT Reveal Celebration)
} else {
  // Show progress card
  // Show memory counter breakdown
  // Show full quick actions including Reveal Celebration
}
```

---

### 5. Enhanced Layout Structure

**New Dashboard Hierarchy:**

```
Header (unchanged)
├── Title: "{recipient}'s {occasion}"
└── Label: "Dashboard"

┌─ Section 1: Progress/Empty State
│  ├── IF memories > 0: Progress Card
│  └── IF memories === 0: Empty State Card

┌─ Section 2: Metrics (only if memories > 0)
│  └── Memory Counter Breakdown (3 columns)

┌─ Section 3: Actions
│  └── Quick Actions Card
│     ├── ShareButtons
│     ├── Preview MemoryPop
│     └── Reveal Celebration (conditional)

┌─ Section 4: Info Card (move below actions)
│  └── Story + Status Badge (existing card)

┌─ Section 5: Contributors List (unchanged)
│  └── Recent Contributors (only if memories > 0)
```

**Layout Changes:**
1. Move Info Card (Story + Status) below Quick Actions
2. Add Progress Card at top
3. Add Memory Counter Breakdown
4. Consolidate actions into Quick Actions section
5. Simplify empty state logic

---

## Design System Compliance

### Colors (from memorypop-context.md)
- Background: `#fff8ef` (cream)
- Text primary: `#3a241e` (dark brown)
- Text secondary: `#856b5f` (mid brown)
- Primary action: `#ef6a57` (coral)
- Primary hover: `#e05a47`
- Card background: `#ffffff`
- Card border: `#ead8c9`
- Status badge background: `#fff1e6`

### Typography
- Section labels: `text-sm font-semibold uppercase tracking-wide`
- Primary headings: `text-4xl font-bold`
- Card titles: `text-sm font-semibold uppercase tracking-wide`
- Body text: `leading-relaxed`
- Metric numbers: `text-3xl font-bold`
- Metric labels: `text-sm`

### Spacing
- Card padding: `p-6` or `p-8` (empty state)
- Card margin: `mt-6`
- Section gaps: `gap-4` (grid), `gap-3` (flex)
- Border radius: `rounded-2xl`
- Shadow: `shadow-sm`

### Responsive Breakpoints
- Mobile-first: Default is single column
- Desktop: `sm:` prefix for larger screens
- Grid: `grid-cols-2` on mobile, `grid-cols-3` on desktop for counters

---

## Data Requirements

### Available from Existing Queries

**MemoryPop Data:**
```typescript
const { data: memorypop } = await supabase
  .from("memorypops")
  .select("*")
  .eq("share_code", shareCode)
  .single();

// Contains: recipient_name, occasion, story, status, celebration_date
```

**Memories Data:**
```typescript
const { data: memories } = await supabase
  .from("memories")
  .select("*")
  .eq("memorypop_id", memorypop.id)
  .order("created_at", { ascending: false });

// Each memory contains: message, photo_url, contributor_name, created_at
```

### Derived Calculations

```typescript
// Total memories
const memoryCount = memories?.length || 0;

// Contributors (already calculated)
const contributorCount = new Set(
  memories?.map((m) => m.contributor_name) || []
).size;

// Messages count (NEW)
const messagesCount = memories?.filter(
  m => m.message && m.message.trim() !== ''
).length || 0;

// Photos count (NEW)
const photosCount = memories?.filter(
  m => m.photo_url
).length || 0;
```

**Important:** All data is already available. No new database queries required.

---

## Component Structure

### Reusable Components

**ShareButtons Component** (existing, no changes)
- Path: `/src/components/ShareButtons.tsx`
- Props: `shareLink`, `recipient`
- Renders: Copy Link button + WhatsApp share button
- Already styled correctly

### New Inline Components

**Progress Card:**
```tsx
<div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
  <p className="text-2xl font-bold text-[#3a241e]">
    ❤️ {memoryCount} {memoryCount === 1 ? 'Memory' : 'Memories'} Collected
  </p>
  <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-[#856b5f]">
    Goal:
  </p>
  <p className="mt-1 text-[#3a241e]">
    Collect memories before the celebration.
  </p>
</div>
```

**Memory Counter Breakdown:**
```tsx
<div className="mt-6 grid grid-cols-3 gap-4">
  {/* Messages Card */}
  <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
    <p className="text-3xl font-bold text-[#3a241e]">{messagesCount}</p>
    <p className="mt-1 text-sm text-[#856b5f]">
      {messagesCount === 1 ? 'Message' : 'Messages'}
    </p>
  </div>

  {/* Photos Card */}
  <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
    <p className="text-3xl font-bold text-[#3a241e]">{photosCount}</p>
    <p className="mt-1 text-sm text-[#856b5f]">
      {photosCount === 1 ? 'Photo' : 'Photos'}
    </p>
  </div>

  {/* Contributors Card */}
  <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
    <p className="text-3xl font-bold text-[#3a241e]">{contributorCount}</p>
    <p className="mt-1 text-sm text-[#856b5f]">
      {contributorCount === 1 ? 'Contributor' : 'Contributors'}
    </p>
  </div>
</div>
```

**Empty State Card:**
```tsx
<div className="mt-6 rounded-2xl bg-white p-8 text-center shadow-sm">
  <p className="text-xl font-bold text-[#3a241e]">
    No memories yet.
  </p>
  <p className="mt-3 text-[#856b5f]">
    Share your MemoryPop to start collecting beautiful memories ❤️
  </p>
  <div className="mt-6 flex justify-center">
    <ShareButtons shareLink={shareLink} recipient={memorypop.recipient_name} />
  </div>
</div>
```

---

## Edge Cases

### Zero State Scenarios

1. **Zero memories total:**
   - Hide progress card
   - Show empty state card
   - Hide memory counter breakdown
   - Show quick actions BUT hide Reveal Celebration

2. **Zero messages but has photos:**
   - Show progress card with total count
   - Memory counter shows: Messages: 0, Photos: X, Contributors: Y

3. **Zero photos but has messages:**
   - Show progress card with total count
   - Memory counter shows: Messages: X, Photos: 0, Contributors: Y

4. **Zero contributors:**
   - Should be impossible if memories exist (contributor_name required)
   - Defensive coding: Show 0 if it happens

### Singular vs Plural

**Always handle singular forms:**
- 1 Memory (not "1 Memories")
- 1 Message (not "1 Messages")
- 1 Photo (not "1 Photos")
- 1 Contributor (not "1 Contributors")

**Implementation pattern:**
```typescript
{count === 1 ? 'Memory' : 'Memories'}
```

### Long Counts

**Unlikely but possible:**
- 100+ memories: Counter should not break layout
- Use `text-3xl` which scales appropriately
- Trust the design system's responsive text sizing

### Missing Data

**Defensive checks:**
```typescript
const memories = data?.memories || [];
const memoryCount = memories.length || 0;
const messagesCount = memories.filter(m => m.message?.trim()).length || 0;
```

**Null/undefined handling:**
- Use optional chaining: `m.message?.trim()`
- Use nullish coalescing: `memories?.length || 0`

### Mobile Responsiveness

**Grid breakpoints:**
- Memory counter: `grid-cols-3` on mobile (acceptable, cards are small)
- Quick actions: `flex-col` on mobile, `gap-3`
- ShareButtons: Already handles mobile with `flex-col sm:flex-row`

**Text sizing:**
- Use relative units (`text-xl`, `text-3xl`) not fixed pixels
- Trust Tailwind's responsive defaults

---

## Acceptance Criteria

The implementation is complete when ALL of these criteria are met:

1. **Progress card displays correctly when memories > 0**
   - Shows "❤️ X Memories Collected"
   - Shows goal message
   - Uses correct singular/plural grammar

2. **Empty state displays correctly when memories === 0**
   - Shows "No memories yet" message
   - Includes ShareButtons for immediate action
   - Replaces progress card (not shown alongside)

3. **Memory counter breakdown displays accurate counts**
   - Messages count matches memories with non-empty message field
   - Photos count matches memories with photo_url
   - Contributors count shows unique contributor names
   - All three metrics display simultaneously

4. **Quick actions section consolidates all actions**
   - ShareButtons (Copy Link + WhatsApp) render correctly
   - Preview MemoryPop button navigates to `/m/[shareCode]`
   - Reveal Celebration button only shows when memoryCount > 0
   - Reveal Celebration navigates to `/m/[shareCode]/reveal`

5. **Layout hierarchy is correct**
   - Progress/Empty State at top
   - Memory counter below progress
   - Quick actions below counter
   - Story card below actions
   - Contributors list at bottom (existing)

6. **Mobile responsive on small screens**
   - Cards stack vertically on mobile
   - Text remains readable
   - Buttons are full-width on mobile
   - No horizontal scrolling

7. **Design system compliance**
   - Colors match existing palette
   - Typography matches existing scale
   - Spacing is consistent
   - Cards use `rounded-2xl shadow-sm`

8. **Edge cases handled gracefully**
   - Zero state works correctly
   - Singular/plural grammar is correct
   - Missing data doesn't break layout
   - Defensive coding for null/undefined

9. **Existing functionality preserved**
   - Copy Link works (existing ShareButtons)
   - WhatsApp share works (existing ShareButtons)
   - Preview link works (existing Link)
   - Reveal button works (existing Link)
   - Contributors list works (existing section)

10. **Performance acceptable**
    - Page loads in < 2 seconds
    - No unnecessary re-renders
    - Server-side rendering works correctly

---

## Testing Approach

### Manual Testing Scenarios

**Test Case 1: Fresh MemoryPop (Zero Memories)**
1. Navigate to dashboard with shareCode that has 0 memories
2. Verify empty state card displays
3. Verify progress card does NOT display
4. Verify memory counter does NOT display
5. Verify Reveal Celebration button does NOT display
6. Verify Copy Link and WhatsApp buttons work

**Test Case 2: One Memory**
1. Add one memory with message only
2. Navigate to dashboard
3. Verify progress card shows "1 Memory Collected" (singular)
4. Verify memory counter shows: 1 Message, 0 Photos, 1 Contributor
5. Verify Reveal Celebration button DOES display

**Test Case 3: Multiple Memories Mixed Content**
1. Add memories with different combinations (message only, photo only, both)
2. Navigate to dashboard
3. Verify progress card shows correct total
4. Verify messages count = memories with non-empty message
5. Verify photos count = memories with photo_url
6. Verify contributors count = unique contributor names

**Test Case 4: Mobile Responsive**
1. Open dashboard on mobile device or small viewport
2. Verify cards stack vertically
3. Verify memory counter remains readable (3 columns acceptable)
4. Verify buttons are full-width
5. Verify no horizontal overflow

**Test Case 5: Quick Actions**
1. Click Copy Link → verify copied feedback
2. Click WhatsApp → verify opens WhatsApp with correct message
3. Click Preview MemoryPop → verify navigates to `/m/[shareCode]`
4. Click Reveal Celebration → verify navigates to `/m/[shareCode]/reveal`

### Automated Testing (Optional)

If time allows, add unit tests for data calculations:

```typescript
describe('Dashboard calculations', () => {
  it('calculates messages count correctly', () => {
    const memories = [
      { message: 'Hello', photo_url: null },
      { message: '', photo_url: 'photo.jpg' },
      { message: 'World', photo_url: 'photo2.jpg' }
    ];
    expect(messagesCount).toBe(2); // Only non-empty messages
  });

  it('calculates photos count correctly', () => {
    // Similar test
  });

  it('handles singular vs plural correctly', () => {
    expect(formatMemoryCount(1)).toBe('1 Memory Collected');
    expect(formatMemoryCount(5)).toBe('5 Memories Collected');
  });
});
```

**Note:** Automated tests are nice-to-have, not required for Phase 1.

---

## Risk Assessment

### Technical Risks

**Risk 1: Budget Overrun**
- **Severity:** HIGH
- **Likelihood:** MODERATE
- **Impact:** Cannot complete implementation
- **Mitigation:**
  - Keep implementation simple
  - Reuse existing components
  - No new queries or schema changes
  - Pause gracefully if time runs out

**Risk 2: Scope Creep**
- **Severity:** MODERATE
- **Likelihood:** MODERATE
- **Impact:** Recent activity feed gets added, blows budget
- **Mitigation:**
  - Strict adherence to Phase 1 scope
  - Explicit "do not implement" list in spec
  - Coder agent must follow spec exactly

**Risk 3: Mobile Layout Issues**
- **Severity:** LOW
- **Likelihood:** LOW
- **Impact:** Poor mobile experience
- **Mitigation:**
  - Follow existing mobile patterns
  - Use proven responsive utilities
  - Test on small viewport early

**Risk 4: Data Calculation Errors**
- **Severity:** MODERATE
- **Likelihood:** LOW
- **Impact:** Incorrect counts shown to users
- **Mitigation:**
  - Defensive coding with nullish coalescing
  - Test with various memory combinations
  - Validate calculations match existing metrics

### Product Risks

**Risk 1: Empty State Not Compelling**
- **Severity:** LOW
- **Likelihood:** MODERATE
- **Impact:** Creators don't share when dashboard is empty
- **Mitigation:**
  - Include ShareButtons directly in empty state
  - Use warm, encouraging language
  - Heart emoji for emotional connection

**Risk 2: Progress Visibility Doesn't Drive Behavior**
- **Severity:** LOW
- **Likelihood:** MODERATE
- **Impact:** Dashboard enhancement doesn't increase sharing
- **Mitigation:**
  - This is a learning experiment
  - Phase 1 validates hypothesis
  - Low cost to iterate or remove

**Risk 3: Too Much Information Overwhelms**
- **Severity:** LOW
- **Likelihood:** LOW
- **Impact:** Dashboard feels cluttered
- **Mitigation:**
  - Clean card-based design
  - Clear visual hierarchy
  - Consistent with existing patterns

---

## Implementation Order

Follow this sequence to minimize risk and maintain safe checkpoints:

### Step 1: Data Calculations (15 min)
- Add `messagesCount` calculation
- Add `photosCount` calculation
- Verify calculations work with existing `memories` array
- Test with console.log or debugger
- **Checkpoint:** Data calculations work correctly

### Step 2: Progress Card (20 min)
- Add progress card component inline
- Position at top of layout
- Apply styling (white card, rounded, shadow)
- Handle singular/plural grammar
- Add conditional rendering: only when `memoryCount > 0`
- **Checkpoint:** Progress card displays correctly

### Step 3: Empty State Card (15 min)
- Add empty state card component inline
- Position where progress card would be
- Include ShareButtons component
- Add conditional rendering: only when `memoryCount === 0`
- **Checkpoint:** Empty state displays correctly

### Step 4: Memory Counter Breakdown (25 min)
- Add 3-column grid layout
- Create Messages card
- Create Photos card
- Update Contributors card (move from existing)
- Apply styling consistently
- Handle singular/plural for all labels
- Add conditional rendering: only when `memoryCount > 0`
- **Checkpoint:** Memory counter displays correctly

### Step 5: Quick Actions Section (20 min)
- Create Quick Actions card wrapper
- Move ShareButtons inside
- Add Preview MemoryPop button (reuse existing Link)
- Move Reveal Celebration button inside
- Keep Reveal conditional on `memoryCount > 0`
- Apply consistent styling
- **Checkpoint:** All actions work correctly

### Step 6: Layout Reorganization (15 min)
- Move Info Card (Story + Status) below Quick Actions
- Verify Contributors list remains at bottom
- Check spacing between all sections
- Ensure `mt-6` consistency
- **Checkpoint:** Layout hierarchy is correct

### Step 7: Mobile Testing (15 min)
- Test on small viewport (< 640px)
- Verify cards stack correctly
- Check memory counter on mobile (3 cols acceptable)
- Test ShareButtons mobile layout
- Fix any overflow issues
- **Checkpoint:** Mobile responsive works

### Step 8: Edge Case Testing (15 min)
- Test with 0 memories
- Test with 1 memory
- Test with messages only
- Test with photos only
- Test with mixed content
- Verify singular/plural throughout
- **Checkpoint:** All edge cases handled

### Step 9: Final Polish (10 min)
- Review all text content
- Check all colors against design system
- Verify spacing consistency
- Remove any console.logs
- Format code consistently
- **Checkpoint:** Implementation complete

**Total Estimated Time:** 2.5-3 hours

---

## Estimated Effort

### Planning Stage (Current)
- **Time:** 30-40 minutes
- **Cost:** $0.50-0.65
- **Model:** Claude Opus 4.8 (high quality planning)

### Implementation Stage
- **Time:** 2.5-3 hours
- **Cost:** $3.50-4.00
- **Model:** Claude Sonnet 4.6 (efficient execution)
- **Complexity:** Medium
- **Approach:** Enhance existing page, reuse components

### Testing Stage
- **Time:** 30 minutes
- **Cost:** $0.50
- **Tasks:**
  - Manual testing of all scenarios
  - Mobile responsive testing
  - Edge case validation

### Judge Stage
- **Time:** 15 minutes
- **Cost:** $0.25
- **Tasks:**
  - User-side evaluation
  - Experience validation
  - Verdict (approve/revise/block)

### Review Stage
- **Time:** 15 minutes
- **Cost:** $0.25
- **Tasks:**
  - Code quality review
  - Design system compliance
  - Verdict (approve/revise/block)

### Total Estimated Cost
- **Planning:** $0.50-0.65
- **Implementation:** $3.50-4.00
- **Testing:** $0.50
- **Judge:** $0.25
- **Review:** $0.25
- **Total:** $5.00-5.65

### Budget Status
- **Available:** $7.00
- **Estimated:** $5.00-5.65
- **Buffer:** $1.35-2.00
- **Risk Level:** LOW (adequate buffer)

**Note:** If implementation starts taking longer than estimated, pause gracefully after next safe checkpoint and document progress in `.pipeline/status.md`.

---

## Success Metrics (Post-Launch)

While not part of implementation, these metrics validate the enhancement:

1. **Dashboard engagement:**
   - Dashboard page views increase by 20%+
   - Time on dashboard page increases

2. **Sharing behavior:**
   - Share actions from dashboard increase by 15%+
   - Time to first share decreases

3. **Creator satisfaction:**
   - Qualitative feedback: "I love seeing the progress"
   - Reduced confusion about dashboard purpose

4. **Return visits:**
   - Creators check dashboard multiple times
   - Measured by repeat visits to `/dashboard/[shareCode]`

---

## Phase 2 Deferred Features

These features are explicitly OUT OF SCOPE for Phase 1:

### Recent Activity Feed
- Show last 5 contributor actions
- Display "Mum added a memory" with relative timestamps
- Requires new activity tracking or created_at queries
- Estimated additional effort: 2-3 hours

### Real-Time Updates
- Live updates when new memories added
- WebSocket or polling implementation
- Requires infrastructure work
- Estimated additional effort: 3-4 hours

### Activity Timestamps
- Relative time display ("5 minutes ago")
- Requires date formatting library or utility
- Requires timestamp tracking
- Estimated additional effort: 1 hour

### Contributor Attribution
- Show who added what (privacy considerations)
- Might require permissions or reveal logic
- UX design needed
- Estimated additional effort: 2-3 hours

**Total Phase 2 Effort:** 8-11 hours ($8-12 cost)

**Decision:** Phase 2 features should be planned in next budget cycle when there's adequate time and budget.

---

## Dependencies

### Required (Already Available)
- ✅ Next.js (installed)
- ✅ Tailwind CSS (configured)
- ✅ Supabase client (configured)
- ✅ ShareButtons component (exists)
- ✅ Dashboard page (exists)
- ✅ Database schema (no changes needed)

### Not Required
- ❌ No new npm packages
- ❌ No database migrations
- ❌ No API route changes
- ❌ No new components (inline only)
- ❌ No environment variables

---

## Rollback Plan

If implementation fails or causes issues:

### Easy Rollback
Because we're enhancing an existing page without schema changes:

1. **Git revert** to previous commit
2. No data migration needed
3. No configuration changes needed
4. Dashboard v1 still functional

### Partial Rollback
If only specific features cause issues:

1. Remove problematic card/section
2. Keep working enhancements
3. Dashboard remains functional

### Zero Risk to Core Functionality
- Memories continue working
- Contributors can still add content
- Reveal mode unaffected
- Share functionality preserved

---

## Final Notes for Coder Agent

### Do's
✅ Follow this spec exactly
✅ Reuse existing components and patterns
✅ Use defensive coding (null checks)
✅ Handle singular/plural everywhere
✅ Test mobile responsive early
✅ Keep code changes minimal
✅ Maintain existing functionality
✅ Use consistent spacing (`mt-6`)
✅ Follow design system colors and typography

### Don'ts
❌ Do NOT implement recent activity feed
❌ Do NOT add real-time updates
❌ Do NOT create new database queries
❌ Do NOT install new dependencies
❌ Do NOT rebuild the page from scratch
❌ Do NOT change existing components (ShareButtons)
❌ Do NOT add features not in Phase 1 scope
❌ Do NOT optimize prematurely
❌ Do NOT over-engineer

### If You Get Stuck
1. Pause and document what's blocking
2. Update `.pipeline/status.md` with current state
3. Mark safe checkpoint in progress
4. Do NOT continue if approach seems wrong
5. Ask for clarification rather than guessing

---

## Specification Status

**Status:** COMPLETE ✅

**Date:** 2026-07-10
**Prepared by:** Planner Agent (Claude Opus 4.8)
**Approved for Implementation:** Yes
**Budget Status:** Within limits ($5.00-5.65 of $7.00 available)

**Next Step:** Hand off to Coder Agent for implementation using Claude Sonnet 4.6.

---

**End of Specification**
