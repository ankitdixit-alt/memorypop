# Feature Request: Premium Directed Reveal Experience (Prototype)

**Date:** 2026-07-28
**Priority:** TBD (Product Owner Evaluation Required)
**Requestor:** Founder
**Type:** Strategic Product Pivot - Premium Value Proposition

---

## Raw User Request

This is a strategic pivot for what Premium means in MemoryPop.

**Current Premium:** Prettier UI (upgraded themes, layouts)

**Proposed Premium:** Guided emotional reveal - a 60-90 second cinematic experience where the recipient is guided through their memories in a directed, emotionally choreographed journey.

**Goal:** Validate whether a directed reveal feels materially more special than letting the recipient browse freely.

**Prototype Scope:** Emma's 30th Birthday only

---

## Context

MemoryPop currently offers:
- Free tier: Basic reveal experience where recipient can browse memories
- Premium tier: Same experience but with prettier themes/layouts

**Strategic Question:** Is "prettier UI" compelling enough to drive Premium adoption?

**Hypothesis:** A guided, cinematic reveal experience may feel more special, memorable, and worth paying for than just visual upgrades.

---

## Proposed Solution

### Reveal Engine Architecture

Create a system that can:
1. **Analyze** the celebration (occasion, mood, contributor count, memory types)
2. **Sequence** memories in an emotionally intentional order
3. **Narrate** the journey with occasion-aware copy between memories
4. **Pace** the reveal with controlled timing and transitions
5. **Build** toward an emotional climax

### Prototype Scope

- One occasion only: Birthday (Emma's 30th)
- One mood: Joyful
- 60-90 second experience
- 6-8 memories maximum
- Narration between memories
- Auto-advance with manual override
- Mobile-first
- No backend storage changes required (prototype demonstration)

### What Makes This "Premium"

- Directed experience feels like receiving a gift, not browsing a gallery
- Emotional choreography creates stronger impact
- Effortful curation signals care
- Cinematic presentation feels special

---

## User Problem

**Creator Problem:**
- Wants the reveal to feel special and worth the effort
- Unsure if Premium themes alone justify the upgrade
- Wants the recipient to feel the love that went into collecting memories

**Recipient Problem:**
- Free-browse experience may lack emotional structure
- No guidance on what to see first or how memories connect
- May miss the "big moment" feeling

---

## User Impact

**If successful:**
- Premium has a clear value proposition beyond aesthetics
- Creators feel confident the reveal will land emotionally
- Recipients have a more memorable, shareable experience
- Revenue potential increases through stronger Premium differentiation

**If unsuccessful:**
- Learn that directed reveal doesn't resonate
- Validate that browsing freedom is more important
- Inform future Premium strategy

---

## Constraints

1. Must work on mobile (90% of traffic)
2. Cannot break existing reveal experience
3. Must respect contributor intent (no reordering that changes meaning)
4. Cannot require backend schema changes for prototype
5. Should be demoable in one celebration
6. Must complete within daily budget limits

---

## Assumptions

1. Emotional choreography can be algorithmically approximated
2. 60-90 seconds is long enough to feel special, short enough to hold attention
3. Emma's 30th Birthday is representative enough to validate the concept
4. Manual override doesn't defeat the purpose of guided experience
5. Narration between memories enhances rather than interrupts emotion

---

## Open Questions

1. **Strategic Timing:** Should we validate the demo page and current Premium before pivoting?
2. **Complexity:** Is Reveal Engine architecture justified for a prototype?
3. **Smallest Slice:** Is "one demo prototype" the right scope, or should we start smaller?
4. **Revenue Model:** If this works, does Premium become "unlock directed reveal" or something else?
5. **Compatibility:** Can guided reveal coexist with free browsing, or does one replace the other?

---

## Success Criteria (If Built)

**Product Success:**
- Founder can demo the experience end-to-end
- Experience feels emotionally coherent
- Timing and pacing feel intentional
- Narration enhances rather than distracts
- Mobile experience is polished

**Strategic Success:**
- Founder can answer: "Is directed reveal worth building as Premium?"
- Clear direction on Premium value proposition
- Evidence to inform next product decision

---

## Notes

This is a **strategic pivot decision** that affects:
- Premium positioning
- Revenue strategy
- Product roadmap prioritization
- Engineering investment

The Product Owner should rigorously evaluate:
- Customer value (does this solve a real problem?)
- MVP alignment (is this the right time?)
- Smallest useful slice (is the scope appropriate?)
- Learning value (will this prototype answer the strategic question?)
- Complexity vs. value (is the investment justified?)

**Key Risk:** Building sophisticated architecture for a hypothesis that may not validate.

**Key Opportunity:** Differentiated Premium experience that feels meaningfully special.
