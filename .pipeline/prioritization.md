# Product Owner: Celebration Mood Step

**Date:** 2026-07-23
**Product Owner Decision:** BUILD NOW
**Score:** 9/10 (High Product Value)

---

## Decision: BUILD NOW ✅

This feature addresses a core product gap and aligns perfectly with MemoryPop's MVP vision of personalized celebrations.

---

## Product Value Assessment

### Customer Value: HIGH
- Creators gain explicit control over emotional tone
- Separating "what" from "how" makes the creation experience more intuitive
- Five mood options provide meaningful choice without overwhelming
- Message writing becomes more guided and less intimidating

### MVP Alignment: EXCELLENT
- Reinforces core value prop: "personalized celebrations"
- Small, well-scoped feature that delivers immediate UX improvement
- Builds on existing architecture (composition layer already exists)
- No breaking changes to existing MemoryPops

### Strategic Fit: HIGH
- Establishes mood as first-class dimension for future features
- Enables mood-based theming/styling later (not in this slice)
- Improves data quality for future personalization
- Separates concerns cleanly (occasion ≠ mood)

---

## Smallest Useful Slice

**Ship this:**
1. New Step 1.5: Mood selection screen (after occasion, before message)
2. Five mood options with clear labels and descriptions
3. Store mood in database (use existing `tone` field)
4. Message-writing step influenced by selected mood (headline, helper text, placeholder)
5. Rename emoji selector from "Add some emotion" to "Choose a celebration icon"

**Do NOT ship:**
- Mood-based visual theming (cover styles, colors)
- Mood-based animations
- Mood previews or examples
- Advanced mood filtering/search

---

## In Scope

**User Flow Changes:**
```
Step 1: Choose occasion + recipient ✅ (existing)
Step 1.5: Choose mood ⭐ (NEW)
Step 2: Write personal message (influenced by mood) ⭐ (enhanced)
Step 3: Preview and create ✅ (existing)
```

**Data Changes:**
- Reuse existing `tone` database field (already in schema)
- No migration needed (field already exists)
- Update mood values from 4 legacy values to 5 new values

**UX Changes:**
- Add mood selection screen
- Update message step to show mood-influenced copy
- Rename "Add some emotion" to "Choose a celebration icon"

**Configuration Changes:**
- Update `src/lib/celebrationMood.ts` with 5 new mood configs
- Update create page UI (Step 1.5)
- Update API validation if needed

---

## Out of Scope

❌ Visual theming based on mood (future)
❌ Mood-specific cover styles (future)
❌ Mood-based animations (future)
❌ Migration script for existing MemoryPops (safe default: "Warm & heartfelt")
❌ Mood editing after creation (future)
❌ Custom mood creation (future)

---

## Success Outcome

**For Creators:**
- "I feel more confident writing my personal message because the app guided me on the right tone."
- "The mood selection felt natural and helped me express the relationship better."

**For Product:**
- 95%+ of creators select a mood (not skipping)
- Average time on mood step: 5-10 seconds (quick, not blocking)
- Message writing conversion stays stable or improves
- No increase in create abandonment

**Metrics:**
- Mood selection rate (target: >95%)
- Mood distribution (expect: 40% Warm & heartfelt, 20% each others)
- Time on mood step (target: 5-10s)
- Message step completion rate (maintain or improve)

---

## Implementation Complexity

**Effort:** SMALL (1-2 days)
- Existing composition layer supports this
- Database field already exists
- UI patterns established (similar to occasion selector)
- No backend migration needed

**Risk:** VERY LOW
- Backwards compatible (existing `tone` field reused)
- No breaking changes
- Easy to rollback (revert mood options)
- Isolated feature (doesn't affect other flows)

---

## Notes for Planner

### Architecture Guidance
- **Use existing `tone` database field** - do not add a new field
- **Update `celebrationMood.ts`** - define 5 new mood configs
- **Composition layer is ready** - `celebrationExperience.ts` already handles mood
- **Create page needs Step 1.5** - insert mood selection between steps 1 and 2

### Mood Configuration Requirements
Each mood needs:
```typescript
{
  contributorHeadline: string;       // Header for message writing step
  contributorSupportingText: string; // Helper text below header
  contributorPrompt: string;         // Label above textarea
  contributorPlaceholder: string;    // Textarea placeholder
  revealIntroduction: string;        // Used in reveal flow (existing)
}
```

### UI Requirements
- Simple card-based selector (like occasion selector)
- Each mood card shows: label + short description
- Mobile-first layout (2 columns on mobile, 3 on desktop)
- Selected state: border + background color
- Must feel warm, simple, not clinical

### Copy Guidance
- Mood labels should feel warm and natural
- Descriptions should be 1 sentence, helping creator choose
- Message prompts should be specific to the mood
- Avoid corporate/clinical language

### Edge Cases
- Existing MemoryPops with legacy tone values ("Heartfelt", "Funny", "Emotional", "Simple")
  - Normalize to new mood values in `normalizeMood()` function
  - Map: Heartfelt → warm_heartfelt, Funny → playful_fun, Emotional → nostalgic_reflective, Simple → warm_heartfelt (default)
- Missing/null tone value → default to "warm_heartfelt"
- Creator hits back from Step 2 → return to mood selection with previous selection preserved

---

## Risk Assessment

### Technical Risks: VERY LOW
- ✅ Architecture already supports this (composition layer)
- ✅ Database field already exists (`tone`)
- ✅ No schema migration needed
- ✅ Backwards compatible

### Product Risks: LOW
- ⚠️ Mood step adds 5-10 seconds to creation flow
  - **Mitigation:** Keep UI fast, clear value prop
- ⚠️ Five options might feel like too many choices
  - **Mitigation:** Clear descriptions, sensible default
- ⚠️ Existing MemoryPops may have legacy tone values
  - **Mitigation:** Normalization function handles this

### UX Risks: VERY LOW
- ✅ Similar pattern to occasion selection (proven)
- ✅ No new concepts (creators understand mood)
- ✅ Easy to skip if creator confused (default applied)

---

## Open Questions

None blocking. Request is well-specified and feasible.

---

## Recommendation

**APPROVE FOR IMMEDIATE IMPLEMENTATION**

This is a well-scoped, high-value feature that:
1. Solves a real product gap (conflated occasion + mood)
2. Uses existing architecture (composition layer ready)
3. Requires minimal implementation (1-2 days)
4. Has very low risk (backwards compatible)
5. Delivers immediate UX improvement

Proceed to Planning phase.
