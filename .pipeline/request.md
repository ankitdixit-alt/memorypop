# Feature Request: Celebration Mood Selection Step

**Date:** 2026-07-23
**Requester:** Founder
**Type:** New Feature

---

## Raw Request

Add a dedicated Celebration Mood step to the MemoryPop creation flow.

---

## Normalized Request

### Goal
Separate emotional tone (mood) from event type (occasion) in the creation flow, allowing creators to personalize how their celebration feels independently from what they're celebrating.

### User Problem
Currently, occasion and mood are conflated. A birthday can feel playful OR elegant depending on the recipient and relationship, but creators have no way to express this preference during creation.

### User Impact
- Creators gain control over emotional tone
- Personal message writing becomes more guided based on mood
- Celebrations feel more personalized to relationships, not just events

### Constraints
1. Must maintain mobile-first, simple UI
2. Cannot impact existing MemoryPops (migration safe)
3. Must integrate cleanly with existing occasion system
4. Cannot delay the creation flow significantly
5. Must support future theming/styling (but not implement it yet)

### Product Principles
- **Occasion answers: WHAT are we celebrating?**
- **Mood answers: HOW should it feel?**
- These are separate, orthogonal dimensions
- Mood must be stored independently from occasion
- Do not overload occasion configuration with mood logic

### Requirements

**Flow Change:**
```
Current: Choose occasion → Write message → Continue
New:     Choose occasion → Choose mood → Write message → Continue
```

**Initial Mood Options:**
1. Warm & heartfelt
2. Playful & fun
3. Elegant & meaningful
4. Bold & celebratory
5. Nostalgic & reflective

**Technical Requirements:**
1. Add dedicated Mood selection step before personal-message step
2. Selected mood influences message heading, helper text, and placeholder
3. Mood stored independently from occasion in database
4. Use composition layer that combines occasionConfig + celebrationMood
5. Rename emoji selector from "Add some emotion" to neutral label (e.g., "Choose a celebration icon")
6. Keep UI simple, warm, mobile-first

**Scope Boundaries:**
- ✅ Collect mood
- ✅ Persist mood
- ✅ Use mood to personalise message-writing step
- ❌ Do NOT implement visual theming yet
- ❌ Do NOT change cover styles based on mood
- ❌ Do NOT add mood-based animations

### Assumptions
- Five mood options are sufficient for MVP
- Mood can default to "Warm & heartfelt" if needed for backwards compatibility
- Mood selection adds ~10 seconds to creation flow (acceptable)
- Personal message step is the primary place mood should influence UX

### Open Questions
None blocking - request is well-specified.

---

## Requested Outputs (Pre-Implementation)

Before coding:
1. Product Owner recommendation (build now / next sprint / backlog / reject)
2. Exact user flow
3. Data-model recommendation
4. Proposed mood configuration shape
5. Copy for each mood
6. Files likely to change
7. Acceptance criteria
8. Risks and edge cases

Then: Founder approval before implementation.
