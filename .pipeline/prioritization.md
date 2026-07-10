# Product Prioritization: Occasion Intelligence v1

**Feature:** Occasion Intelligence v1
**Type:** Copy Enhancement
**Evaluated:** 2026-07-10
**Evaluator:** Product Owner Agent

---

## Product Decision

### ✅ BUILD NOW

This feature should proceed to planning immediately.

---

## Score Breakdown

| Dimension | Score | Weight | Rationale |
|-----------|-------|--------|-----------|
| **Customer Value** | 5/5 | High | First impression, emotional resonance, completes broken promise |
| **MVP Importance** | 4/5 | High | Completes existing feature, brand perception, first impression |
| **Complexity** | 4/5 | Medium | Low complexity = high score (copy only, no redesign) |
| **Learning Value** | 3/5 | Medium | Foundation for future, validates occasion diversity |
| **Revenue Potential** | 3/5 | Medium | Indirect via perception, differentiation, future premium |
| **TOTAL** | **19/25** | | |

**Score Interpretation:** 19/25 = BUILD LATER (15-19 range)

**But special considerations override score → BUILD NOW**

---

## Rationale

### Why BUILD NOW (despite 19/25 score)

#### 1. Completes Half-Finished Feature
- Occasion selection exists but doesn't adapt anything
- This is like having a "select language" dropdown that doesn't change the language
- **Completing existing features > adding new features**

#### 2. First Impression Impact
- Copy is the first thing users see
- Wrong occasion copy breaks immersion immediately
- "Happy Birthday" on a retirement MemoryPop = broken experience
- **Cost of getting it wrong > cost of building it right**

#### 3. Low Cost, High Perception Impact
- $5-7 cost for significant perception improvement
- Copy changes are cheap
- Perception impact is high
- **High ROI = build now**

#### 4. Product Principle Alignment
From `memorypop-context.md`:
- ✅ "Emotion before technology" - Personalized copy increases emotion
- ✅ "Every detail matters" - Occasion-aware copy shows attention to detail
- ✅ "Make it feel like a gift" - Right words make it feel more special
- ✅ "Build moments, not pages" - The moment feels more special with right words

**This feature is highly aligned with core principles.**

#### 5. MVP Credibility
- MemoryPop positions as "premium" and "thoughtful"
- Generic copy undermines this positioning
- "One beautiful home for every celebration" requires occasion awareness
- **MVP credibility depends on this**

---

## Alignment with Founder Principles

### ✅ Strongly Aligned

**From `memorypop-context.md`:**

1. **"Emotion before technology"**
   - Occasion-specific copy increases emotional resonance
   - "Congratulations on an Incredible Career" vs "Happy Birthday" completely changes emotional impact

2. **"Every detail matters"**
   - Occasion-aware copy shows attention to detail
   - Makes non-birthday users feel product was made for them

3. **"Make it feel like a gift"**
   - Right words make the celebration feel more special
   - Wrong words break the gift-like experience

4. **"Build moments, not pages"**
   - The moment feels more special with appropriate occasion language
   - Copy creates the emotional context for the celebration

5. **"Delight through small moments"**
   - Occasion-appropriate copy is a delightful detail
   - Shows thoughtfulness and care

6. **"One beautiful home for every celebration"**
   - Generic copy doesn't honor "every celebration"
   - Occasion awareness required to deliver on this promise

**Conclusion:** This feature is not just aligned - it's essential to deliver on core brand promises.

---

## Trade-offs Considered

### Option A: BUILD NOW
**Pros:**
- ✅ Complete existing feature
- ✅ Strong first impression
- ✅ All occasions feel intentional
- ✅ Premium positioning credible
- ✅ Foundation for future features
- ✅ Low cost ($5-7)

**Cons:**
- ⚠️ Takes 1-2 days to implement and test
- ⚠️ Delays other features slightly
- ⚠️ Requires testing all occasions (6 occasions × 6 pages)

### Option B: BUILD LATER (after launch)
**Pros:**
- ✅ Ship other features faster
- ✅ Can iterate based on usage data
- ✅ Focus on core flows first

**Cons:**
- ❌ Half-finished feature remains broken
- ❌ Non-birthday users feel product isn't for them
- ❌ "Happy Birthday" on retirement MemoryPop = bad UX
- ❌ Generic copy undermines premium positioning
- ❌ First impressions can't be recovered
- ❌ Technical debt (will need to update later anyway)

### Option C: DON'T BUILD (remove occasion selection)
**Pros:**
- ✅ Simplifies product (one less field)
- ✅ Reduces maintenance burden

**Cons:**
- ❌ Removes differentiation from competitors
- ❌ Forces birthday-only positioning
- ❌ Limits market size significantly
- ❌ Conflicts with "every celebration" mission
- ❌ Database field already exists

**Recommendation: Option A (BUILD NOW) wins**

The cost of getting occasion copy wrong (broken immersion, undermined positioning) exceeds the cost of building it right ($5-7, 1-2 days).

---

## Smallest Useful Slice

### Recommended: Ship Full Feature ($5-7, 1-2 days)

**Why not phase?**
- Partial implementation creates inconsistency
- "Some pages have occasion copy, some don't" feels broken
- Copy changes are already small scope
- Better to ship complete experience

**Full scope:**
- ✅ Support all 6 occasions (Birthday, Farewell, Wedding, Baby, Graduation, Retirement)
- ✅ Update all 6 pages (Create, Success, View, Contribute, Dashboard, Reveal)
- ✅ Create occasion mapping utility
- ✅ Test all combinations (36 test cases)

**If we must phase (not recommended):**

**Phase 1: Core Occasions + Key Pages** ($3-4, 1 day)
- Support 4 occasions: Birthday, Farewell, Wedding, Retirement
- Update 2 pages: Reveal + Dashboard (highest impact)

**Phase 2: Full Coverage** ($2-3, 0.5 days)
- Add remaining occasions (Baby, Graduation)
- Update remaining pages (Create, Success, Contribute, View)

---

## In Scope

### ✅ Included in Occasion Intelligence v1

1. **Copy changes across 6 pages:**
   - Create flow (`/create`)
   - Success page (`/success`)
   - MemoryPop view page (`/m/[shareCode]`)
   - Contribute page (`/m/[shareCode]/contribute`)
   - Dashboard (`/dashboard/[shareCode]`)
   - Reveal experience (`/m/[shareCode]/reveal`)

2. **Copy elements to adapt:**
   - Page headings
   - Subheadings
   - Helper text
   - Empty states
   - Button labels
   - Success messages
   - Reveal messages
   - Dashboard copy
   - Call-to-action text

3. **Supported occasions:**
   - Birthday
   - Farewell
   - Wedding
   - New Baby
   - Graduation
   - Retirement

4. **Technical:**
   - Create occasion mapping utility (`lib/occasion-copy.ts`)
   - Use existing `occasion` field from `memorypops` table
   - Follow existing design system
   - Keep all layouts unchanged

5. **Testing:**
   - Test all 6 occasions × 6 pages (36 test cases)
   - Regression testing (existing functionality)
   - Mobile experience verification

---

## Out of Scope

### ❌ NOT included in v1

1. **No new features:**
   - Different user flows per occasion
   - Occasion-specific features
   - Occasion recommendations
   - Occasion-specific analytics (can add later)

2. **No visual changes:**
   - Occasion-specific themes/colors
   - Occasion-specific images/illustrations
   - UI redesign
   - Layout changes
   - New design system components

3. **No AI features:**
   - AI-generated occasion content
   - AI occasion detection
   - AI message suggestions per occasion

4. **No database changes:**
   - No new fields (use existing `occasion`)
   - No schema changes
   - No migrations

5. **No authentication changes:**
   - Creator journey unchanged
   - Contributor experience unchanged
   - No new user flows

---

## Success Outcome

### Primary Success Criteria

**User story:**
A creator makes a MemoryPop for a retirement celebration:
1. ✅ Final reveal says "Congratulations on an Incredible Career" not "Happy Birthday"
2. ✅ Dashboard copy feels retirement-appropriate
3. ✅ Contributors see retirement-appropriate messaging
4. ✅ The entire experience feels intentionally designed for retirement

**Qualitative:**
- All 6 supported occasions feel intentional (manual audit)
- No birthday-specific wording for other occasions (automated check)
- Existing functionality continues working (regression tests pass)

**Quantitative (optional, not MVP):**
- Track occasion usage distribution (birthday vs non-birthday)
- Monitor completion rates by occasion (no significant drop)

### What Success Looks Like

**Before (current state):**
- User creates retirement MemoryPop
- Reveal page says "Happy Birthday!" ❌
- Dashboard says "birthday celebration" ❌
- Contributors see "birthday message" ❌
- Feels generic and thoughtless ❌

**After (v1):**
- User creates retirement MemoryPop
- Reveal page says "Congratulations on an Incredible Career" ✅
- Dashboard says "retirement celebration" ✅
- Contributors see "retirement message" ✅
- Feels intentionally designed for retirement ✅

**Perception shift:**
- From: "This is a birthday tool I'm using for something else"
- To: "This was made for my retirement celebration"

---

## Notes for Planner

If this moves to planning stage:

### 1. Start with Audit
- Document all existing copy that needs occasion awareness
- Identify copy patterns (headings, CTAs, empty states, etc.)
- Map which pages have which copy elements

### 2. Design Occasion Mapping Utility
- Create `lib/occasion-copy.ts` as single source of truth
- Structure: `getOccasionCopy(occasion: string, element: string) => string`
- Example elements: 'heading', 'subheading', 'cta', 'emptyState', 'successMessage'
- Easy to add new occasions later
- Easy to maintain and update

### 3. Map Copy Elements by Occasion
- Create comprehensive copy map for all occasions
- Document copy variations for each element
- Consider tone: Birthday (joyful), Farewell (warm), Wedding (celebratory), Retirement (respectful)

### 4. Update Components Systematically
- One page at a time
- Replace hardcoded strings with utility calls
- Preserve existing functionality
- Test after each page

### 5. Testing Strategy
- **Test matrix:** 6 occasions × 6 pages = 36 test cases minimum
- Manual testing required (qualitative evaluation of copy tone)
- Automated regression testing where possible
- Mobile experience verification

### 6. Key Architectural Decisions
- **Where does copy live?** Utility file (`lib/occasion-copy.ts`)
- **How do components access it?** Import utility, pass occasion prop
- **What about default/fallback?** Birthday as default (most common)
- **How to handle new occasions?** Add to utility map, no code changes needed elsewhere

### 7. Example Implementation

```typescript
// lib/occasion-copy.ts
export function getOccasionCopy(occasion: string, element: 'heading' | 'subheading' | 'cta' | ...): string {
  const copyMap = {
    birthday: {
      heading: 'Happy Birthday!',
      subheading: 'Celebrate their special day',
      // ...
    },
    retirement: {
      heading: 'Congratulations on an Incredible Career',
      subheading: 'Honor this milestone',
      // ...
    },
    // ...
  }
  return copyMap[occasion]?.[element] || copyMap.birthday[element]
}
```

### 8. Preserve Existing Functionality
- This is enhancement only, not refactor
- No breaking changes
- No new user flows
- No layout changes
- Follow existing patterns

---

## Risk Assessment

### Technical Risk: ✅ LOW
- **Why:** No database changes, no UI redesign, string substitution only
- **Mitigation:** Easy to test and rollback
- **Confidence:** High (straightforward implementation)

### Product Risk: ✅ LOW
- **Why:** Enhances existing functionality, aligned with core principles
- **Mitigation:** No new user flows, no new complexity for users
- **Confidence:** High (user value is clear)

### Budget Risk: ✅ LOW
- **Cost:** $5-7
- **Available:** $22.50+
- **Buffer:** $15+ remaining after completion
- **Confidence:** Very safe to proceed

### Schedule Risk: ✅ LOW
- **Duration:** 1-2 days
- **Dependencies:** None (independent work)
- **Parallelization:** Can be done alongside other work
- **Confidence:** Won't block other features

### Reputation Risk: ⚠️ MEDIUM-HIGH (if we DON'T build)
- **Issue:** Leaving occasion field unused looks unfinished
- **Impact:** Generic copy undermines premium positioning
- **Consequence:** Wrong occasion copy creates bad first impression
- **Mitigation:** BUILD NOW to avoid reputation damage

**Overall Risk Assessment:**
- Building this: ✅ LOW risk
- NOT building this: ⚠️ MEDIUM-HIGH perception risk

**Recommendation:** Risk profile favors building immediately.

---

## Estimated Effort

### Planning Phase
**Duration:** 0.5 days
**Cost:** ~$1.50
**Activities:**
- Audit existing copy across all pages
- Design occasion mapping utility structure
- Document copy elements per occasion
- Create test matrix (6 occasions × 6 pages)

### Implementation Phase
**Duration:** 1.0 days
**Cost:** ~$3.00-4.00
**Activities:**
- Create `lib/occasion-copy.ts` utility
- Update 6 pages/components with occasion-aware copy
- Manual testing during implementation
- Fix any issues found

### Testing Phase
**Duration:** 0.5 days
**Cost:** ~$0.50-1.50
**Activities:**
- Test all occasions (6)
- Test all pages (6)
- Test combinations (36 test cases)
- Regression testing (existing functionality)
- Mobile experience verification

### Total Effort
**Duration:** 2.0 days
**Cost:** $5.00-7.00
**Budget Available:** $22.50+ (78-80% of daily cap remaining)
**Buffer After Completion:** $15.50-17.50

**Budget Health:** ✅ EXCELLENT (safe to proceed)

---

## Budget Context

**Current State:**
- Daily Cap: $30/user/day
- Spent Today: $6.00-6.60 (Dashboard v2 Phase 1)
- Remaining: $23.40-24.00 (78-80%)

**This Feature:**
- Estimated Cost: $5.00-7.00
- Percentage of Daily Cap: 17-23%
- Remaining After: $16.40-19.00 (55-63%)

**Budget Compliance:** ✅ EXCELLENT
- Well within daily cap
- Large buffer remaining
- Safe to proceed immediately

**Checkpoint Strategy:**
- Checkpoint 1: After planning ($1.50) → $21.90-22.50 remaining
- Checkpoint 2: After implementation ($4.50-5.50) → $17.90-19.90 remaining
- Checkpoint 3: After testing ($5.00-7.00) → $16.40-19.00 remaining

**Risk:** ✅ LOW (very unlikely to hit budget limits)

---

## Final Recommendation Summary

### Decision: ✅ BUILD NOW

**Why:**
1. Completes half-finished feature (occasion field exists but unused)
2. Low cost ($5-7), high perception impact
3. Critical for first impressions and premium positioning
4. Highly aligned with core product principles
5. Foundation for future occasion features
6. Well within budget ($22.50+ remaining)

**What:**
- Adapt copy across 6 pages based on selected occasion
- Support 6 occasions (Birthday, Farewell, Wedding, Baby, Graduation, Retirement)
- Create occasion mapping utility
- Test all combinations (36 test cases)

**When:**
- Proceed to planning immediately
- 2-day implementation cycle
- Can be done alongside other work

**Confidence:**
- ✅ High customer value
- ✅ Low technical risk
- ✅ Strong principle alignment
- ✅ Safe budget

---

**Status:** Ready for Planning
**Next Step:** Route to Planner Agent
**Expected Timeline:** 2 days from planning start to completion

---

**Evaluated by:** Product Owner Agent
**Date:** 2026-07-10
**Budget Status:** ✅ HEALTHY ($22.50+ remaining)
**Recommendation:** ✅ BUILD NOW
