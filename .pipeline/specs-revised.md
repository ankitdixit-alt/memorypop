# Implementation Specification: Celebration Mood (Revised UX)

**Date:** 2026-07-23 (Revised after Founder feedback)
**Status:** ⏸️ Awaiting Founder Approval of Revised UX
**Previous Status:** Implementation complete, but UX needs refinement
**Estimated Effort:** 1 day (modifications to existing implementation)

---

## Executive Summary

Embed mood selection into the "Make it personal" step (Step 2) to create a continuous creative experience. Mood cards appear at the very top of the page, immediately followed by the message-writing flow.

**Core Change:** Mood is NOT a separate step. It's the first element on the message-writing page, making it feel like part of the creative process rather than a gate.

**Architecture Principle:** Mood remains a separate product concept from Occasion, but UX-wise it flows naturally into the writing experience with minimal friction.

---

## Product Principles

### Mood vs Occasion

**Occasion answers:** WHAT are we celebrating?
- Birthday, Anniversary, Wedding, etc.

**Mood answers:** HOW should this celebration feel?
- Warm, Playful, Thoughtful, Joyful, Nostalgic, Simple

These are separate product concepts that remain architecturally independent.

### Natural Creator Flow

The creator naturally thinks:
1. What are we celebrating? (Occasion)
2. Who is it for? (Recipient)
3. **What do I want to say?** ← Mood belongs here

Mood should feel like part of writing the message, not an extra checkpoint.

---

## Architecture Principles

### Mood as Long-Term Experience Layer

Mood is architected as a **first-class dimension** that will grow beyond copy to influence the entire celebration experience.

**This Release (Copy Layer):**
- ✅ Mood selection UI (embedded in Step 2)
- ✅ Creator message-writing influenced by mood
- ✅ Contributor contribute page influenced by mood
- ✅ Reveal introduction influenced by mood

**Future Capabilities (Extensibility Built In):**
- 🎨 **Visual Layer:** Mood-specific color palettes, gradients, cover styles
- ✨ **Animation Layer:** Mood-appropriate transitions, celebration effects, confetti styles
- 🎭 **Reveal Experience:** Mood-driven pacing, transitions, sound effects
- 🤖 **AI Prompting:** Mood context for future AI-generated content
- 📊 **Analytics:** Mood-based insights and personalization
- 🎨 **Illustrations:** Mood-appropriate imagery and decorative elements

**Design Decision:** The `MoodConfig` interface includes extensibility comments to guide future features. Fields can be added without breaking changes.

---

## Exact User Flow

### Current Flow (Before Revision)
```
Step 1: Choose occasion + Enter recipient name
  ↓
Step 2: Choose celebration mood (SEPARATE PAGE)
  ↓
Step 3: Write message + Choose cover + Add date + Add photos
  ↓
Step 4: Preview + Create
```

### Revised Flow (After Founder Feedback)

```
Step 1: Choose occasion + Enter recipient name
  ↓ (Click "Make it personal →")

Step 2: Make it personal (COMBINED PAGE)
  ┌─────────────────────────────────────────┐
  │ How should this celebration feel?       │
  │                                         │
  │ [ Mood cards - 6 options ]             │
  │                                         │
  ├─────────────────────────────────────────┤
  │ Write your message                      │
  │ [ Message textarea ]                    │
  │                                         │
  │ Celebration date (optional)             │
  │ [ Date picker ]                         │
  │                                         │
  │ Choose a celebration icon               │
  │ [ Emoji shortcuts ]                     │
  │                                         │
  │ Choose a cover style (optional)         │
  │ [ Cover presets ]                       │
  │                                         │
  │ Share a few favourite memories          │
  │ [ Photo upload ]                        │
  │                                         │
  │ [See your MemoryPop →]                  │
  │ (disabled until mood + message)         │
  └─────────────────────────────────────────┘
  ↓ (Click "See your MemoryPop →")

Step 3: Preview + Create (unchanged)
```

**Back to 3 steps** (from the implemented 4 steps)

---

## Detailed Page Layout: Step 2 (Make it personal)

### Visual Hierarchy

```
┌───────────────────────────────────────────────────┐
│ ← Back                                            │
│                                                   │
│ 💛 Making it personal                            │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │ 66%
│ Step 2 of 3                                      │
│                                                   │
├───────────────────────────────────────────────────┤
│                                                   │
│ # How should this celebration feel?              │
│                                                   │
│ Choose the atmosphere you'd like everyone        │
│ to help create.                                  │
│                                                   │
│ ┌────────────┬────────────┬────────────┐        │
│ │ 💕 Warm &  │ 🎉 Playful │ ✨ Thought │        │
│ │ heartfelt  │ & fun      │ & meaning  │        │
│ │            │            │            │        │
│ │ Genuine    │ Lightheart │ Sincere &  │        │
│ │ love and   │ and joyful │ intention  │        │
│ │ warmth     │            │            │        │
│ └────────────┴────────────┴────────────┘        │
│                                                   │
│ ┌────────────┬────────────┬────────────┐        │
│ │ 🎊 Joyful  │ 🌸 Nostalg │ 🤍 Simple  │        │
│ │ & celebr   │ & reflect  │ & classic  │        │
│ │            │            │            │        │
│ │ Uplifting  │ Looking    │ Let the    │        │
│ │ and full   │ back with  │ memories   │        │
│ │ of energy  │ fondness   │ speak      │        │
│ └────────────┴────────────┴────────────┘        │
│                                                   │
├───────────────────────────────────────────────────┤
│                                                   │
│ ## Write your message                            │
│                                                   │
│ If someone asked why [Recipient] is special,    │
│ what would you say?                              │
│                                                   │
│ Need inspiration? Try one of these messages:    │
│ [ Message starters... ]                          │
│                                                   │
│ ┌─────────────────────────────────────────────┐ │
│ │ Share your message...                       │ │
│ │                                             │ │
│ │                                             │ │
│ └─────────────────────────────────────────────┘ │
│                                                   │
│ ## Celebration Date (optional)                   │
│ [ Date picker ]                                  │
│                                                   │
│ ## Choose a celebration icon                     │
│ [ Emoji shortcuts ]                              │
│                                                   │
│ ## Choose a cover style (optional)               │
│ [ Cover presets ]                                │
│                                                   │
│ ## Share a few favourite memories (optional)     │
│ [ Photo upload ]                                 │
│                                                   │
│ [See your MemoryPop →]                           │
│ (disabled until mood + message filled)           │
│                                                   │
└───────────────────────────────────────────────────┘
```

### Key UX Principles

1. **Mood first:** Mood cards appear before any writing, establishing the tone
2. **Visual separation:** Subtle visual break between mood selection and writing
3. **Continuous flow:** No navigation required, everything on one page
4. **Single submit:** One button at the bottom (disabled until mood + message)
5. **Natural progression:** Read top → bottom, make choices, submit

---

## Mood Configuration

### Complete Mood Definitions (6 moods)

```typescript
export const CELEBRATION_MOODS: Record<CelebrationMood, MoodConfig> = {
  warm_heartfelt: {
    id: "warm_heartfelt",
    label: "Warm & heartfelt",
    emoji: "💕",
    description: "Genuine love and warmth",

    // Creator experience
    creatorHeadline: "Write your message",
    creatorSupportingText: "If someone asked why [Recipient] is special, what would you say?",
    creatorPrompt: "Your message",
    creatorPlaceholder: "Share your message...",

    // Contributor experience
    contributorHeadline: "Share something from the heart",
    contributorSupportingText: "This celebration is about genuine connection and love. Share a meaningful memory or heartfelt message.",
    contributorPrompt: "What is one memory that shows how much they mean to you?",
    contributorPlaceholder: "I'll always remember the time we...",

    // Reveal experience
    revealIntroduction: "Every memory here was shared with love.",

    messageStarters: [
      "One of my favorite memories with you is...",
      "You mean so much to me because...",
      "I'll never forget the day when...",
      "What I admire most about you is..."
    ]
  },

  playful_fun: {
    id: "playful_fun",
    label: "Playful & fun",
    emoji: "🎉",
    description: "Lighthearted and joyful",

    // Creator experience
    creatorHeadline: "Write your message",
    creatorSupportingText: "If someone asked why [Recipient] is special, what would you say?",
    creatorPrompt: "Your message",
    creatorPlaceholder: "Share your message...",

    // Contributor experience
    contributorHeadline: "Share something that will make them smile",
    contributorSupportingText: "This celebration is about laughter and joy. Share a funny memory, inside joke, or lighthearted story.",
    contributorPrompt: "What's the funniest moment you've shared together?",
    contributorPlaceholder: "Remember when we...",

    // Reveal experience
    revealIntroduction: "Get ready for some memories that might make you laugh.",

    messageStarters: [
      "I still laugh when I think about the time...",
      "Remember when we thought it was a good idea to...",
      "One thing that always makes me smile is...",
      "I'll never let you forget the day you..."
    ]
  },

  thoughtful_meaningful: {
    id: "thoughtful_meaningful",
    label: "Thoughtful & meaningful",
    emoji: "✨",
    description: "Sincere and intentional",

    // Creator experience
    creatorHeadline: "Write your message",
    creatorSupportingText: "If someone asked why [Recipient] is special, what would you say?",
    creatorPrompt: "Your message",
    creatorPlaceholder: "Share your message...",

    // Contributor experience
    contributorHeadline: "Share something meaningful",
    contributorSupportingText: "This celebration is about thoughtful reflection and genuine appreciation. Share something meaningful and sincere.",
    contributorPrompt: "What would you like them to always remember?",
    contributorPlaceholder: "What I've always appreciated about you is...",

    // Reveal experience
    revealIntroduction: "Every word here was chosen with care.",

    messageStarters: [
      "I've always admired the way you...",
      "One thing I hope you never forget is...",
      "What makes you special is...",
      "I'm grateful for the times we..."
    ]
  },

  joyful_celebratory: {
    id: "joyful_celebratory",
    label: "Joyful & celebratory",
    emoji: "🎊",
    description: "Uplifting and full of energy",

    // Creator experience
    creatorHeadline: "Write your message",
    creatorSupportingText: "If someone asked why [Recipient] is special, what would you say?",
    creatorPrompt: "Your message",
    creatorPlaceholder: "Share your message...",

    // Contributor experience
    contributorHeadline: "Share the joy!",
    contributorSupportingText: "This celebration is about excitement and positive energy. Share an achievement, happy moment, or reason to celebrate.",
    contributorPrompt: "What makes this moment worth celebrating?",
    contributorPlaceholder: "I'm celebrating you because...",

    // Reveal experience
    revealIntroduction: "This is a moment to celebrate together!",

    messageStarters: [
      "I'm so proud of you for...",
      "This is such an exciting moment because...",
      "Watching you achieve this has been...",
      "You deserve to celebrate because..."
    ]
  },

  nostalgic_reflective: {
    id: "nostalgic_reflective",
    label: "Nostalgic & reflective",
    emoji: "🌸",
    description: "Looking back with fondness",

    // Creator experience
    creatorHeadline: "Write your message",
    creatorSupportingText: "If someone asked why [Recipient] is special, what would you say?",
    creatorPrompt: "Your message",
    creatorPlaceholder: "Share your message...",

    // Contributor experience
    contributorHeadline: "Share a memory they'll treasure",
    contributorSupportingText: "This celebration is about cherished memories and meaningful moments. Share a favorite memory from the past.",
    contributorPrompt: "What memory do you treasure most?",
    contributorPlaceholder: "Looking back, I'll always remember...",

    // Reveal experience
    revealIntroduction: "Sometimes the best moments are the ones we carry with us.",

    messageStarters: [
      "Looking back, one moment that stands out is...",
      "I'll always treasure the memory of...",
      "Do you remember when we used to...",
      "Time has passed, but I still think about..."
    ]
  },

  simple_classic: {
    id: "simple_classic",
    label: "Simple & classic",
    emoji: "🤍",
    description: "Let the memories speak for themselves",

    // Creator experience
    creatorHeadline: "Write your message",
    creatorSupportingText: "If someone asked why [Recipient] is special, what would you say?",
    creatorPrompt: "Your message",
    creatorPlaceholder: "Share your message...",

    // Contributor experience
    contributorHeadline: "Share your memory",
    contributorSupportingText: "This celebration is about authentic moments. Share what comes naturally.",
    contributorPrompt: "What would you like to say?",
    contributorPlaceholder: "I wanted to share...",

    // Reveal experience
    revealIntroduction: "Here are the memories everyone wanted to share.",

    messageStarters: [
      "I wanted to say...",
      "One thing I remember is...",
      "I'm thinking of...",
      "Here's what I want you to know..."
    ]
  }
};
```

---

## Data Model

### Type Definition

```typescript
export type CelebrationMood =
  | "warm_heartfelt"
  | "playful_fun"
  | "thoughtful_meaningful"
  | "joyful_celebratory"
  | "nostalgic_reflective"
  | "simple_classic"; // NEW

export interface MoodConfig {
  // UI labels
  id: CelebrationMood;
  label: string;
  emoji: string;
  description: string;

  // Creator experience
  creatorHeadline: string;
  creatorSupportingText: string;
  creatorPrompt: string;
  creatorPlaceholder: string;

  // Contributor experience
  contributorHeadline: string;
  contributorSupportingText: string;
  contributorPrompt: string;
  contributorPlaceholder: string;

  // Reveal experience
  revealIntroduction: string;

  // Optional: message starters
  messageStarters?: string[];
}
```

### Database

**NO SCHEMA CHANGES**

Continue using existing `tone` field in `memorypops` table. New value: `simple_classic`

### Legacy Value Normalization

```typescript
export function normalizeMood(mood: string | null | undefined): CelebrationMood {
  if (!mood) {
    return "warm_heartfelt"; // Safe default for existing MemoryPops
  }

  const lowercase = mood.toLowerCase().trim();

  // Handle new values
  if (lowercase in CELEBRATION_MOODS) {
    return lowercase as CelebrationMood;
  }

  // Handle legacy values
  const legacyMap: Record<string, CelebrationMood> = {
    "heartfelt": "warm_heartfelt",
    "funny": "playful_fun",
    "emotional": "nostalgic_reflective",
    "simple": "simple_classic",
    "elegant_meaningful": "thoughtful_meaningful",
    "bold_celebratory": "joyful_celebratory",
  };

  return legacyMap[lowercase] || "warm_heartfelt";
}
```

---

## Files to Change

### Modifications to Existing Implementation

1. **`src/lib/celebrationMood.ts`** (UPDATE)
   - Add 6th mood: `simple_classic`
   - Update `CelebrationMood` type
   - Add `simple_classic` configuration
   - Update `normalizeMood()` legacy map

2. **`src/app/create/page.tsx`** (MAJOR REFACTOR)
   - Remove Step 2 (mood selection page)
   - Move MoodSelector to top of Step 2 (message page)
   - Back to 3 steps (adjust progress calculation)
   - Update step labels
   - Update button logic (disabled until mood + message)

3. **`src/components/MoodSelector.tsx`** (NO CHANGES)
   - Component works as-is, just moved to different location

4. **`src/app/api/memorypops/create/route.ts`** (UPDATE)
   - Add `simple_classic` to `VALID_MOODS` array

5. **`src/lib/celebrationExperience.ts`** (NO CHANGES)
   - Already correct, no changes needed

---

## Acceptance Criteria

### Must Have (Required for Ship)

1. ✅ **Mood selection embedded in Step 2**
   - Appears at top of "Make it personal" page
   - Shows 6 mood options in responsive grid
   - No separate navigation step

2. ✅ **6 mood options**
   - Warm & heartfelt 💕
   - Playful & fun 🎉
   - Thoughtful & meaningful ✨
   - Joyful & celebratory 🎊
   - Nostalgic & reflective 🌸
   - Simple & classic 🤍 (NEW)

3. ✅ **Continuous flow**
   - Mood → Message → Details → Submit
   - All on one page (Step 2)
   - No step transitions between mood and message

4. ✅ **Submit button logic**
   - Disabled until BOTH mood selected AND message written
   - Button at bottom of page: "See your MemoryPop →"

5. ✅ **Creator experience influenced by mood**
   - Heading, supporting text, prompt, placeholder change
   - Message starters change based on mood

6. ✅ **Contributor experience influenced by mood**
   - Headline, supporting text, prompt, placeholder change
   - Different copy for each mood

7. ✅ **3 steps total**
   - Step 1: Occasion + Recipient
   - Step 2: Mood + Message (combined)
   - Step 3: Preview

8. ✅ **Data correctly saved**
   - Selected mood saved to `tone` field
   - API validates against 6 valid moods
   - Existing MemoryPops still work

9. ✅ **UI polish**
   - Heading: "How should this celebration feel?"
   - Supporting: "Choose the atmosphere you'd like everyone to help create."
   - Visual separation between mood and message sections
   - Mobile-first responsive (2 columns mobile, 3 desktop)

10. ✅ **Emoji selector renamed**
    - Label: "Choose a celebration icon"

11. ✅ **Legacy compatibility**
    - `normalizeMood()` handles old values
    - New legacy mapping: "simple" → "simple_classic"

---

## Risks & Edge Cases

### Technical Risks: VERY LOW

**Risk 1: Form validation complexity**
- **Impact:** Low - need to validate both mood and message
- **Mitigation:** Check both fields before enabling submit button
- **Implementation:** `disabled={!mood || !story}`

**Risk 2: Reverting from 4 steps to 3 steps**
- **Impact:** Low - simpler than original implementation
- **Mitigation:** Test progress bar calculation carefully
- **Implementation:** `(step / 3) * 100`

**Risk 3: Page height on mobile**
- **Impact:** Low - more content on one page
- **Mitigation:** Mood cards at top, scrollable content
- **Testing:** Verify scrolling works smoothly

### Product Risks: VERY LOW

**Risk 1: More content on one page**
- **Impact:** Low - might feel overwhelming
- **Mitigation:** Clear visual hierarchy (mood → message)
- **Measurement:** Track completion rate

**Risk 2: Six mood options**
- **Impact:** Low - was 5, now 6
- **Mitigation:** "Simple & classic" fills real need
- **Measurement:** Track mood distribution

### UX Risks: VERY LOW

**Risk 1: Mood cards might be missed**
- **Impact:** Low - at top of page, required field
- **Mitigation:** Strong heading, visual prominence
- **Fallback:** Submit button disabled until selected

---

## Non-Goals

❌ Separate mood selection step (explicitly removed)
❌ Mood editing after creation
❌ Custom mood creation
❌ Mood-based visual theming (this release)
❌ A/B testing different mood sets

---

## Testing Checklist

### Flow Tests
- [ ] Step 1 → Step 2 transition shows mood cards at top
- [ ] Mood cards displayed in responsive grid (2 mobile, 3 desktop)
- [ ] Selecting mood highlights card
- [ ] Message section appears below mood cards
- [ ] Submit button disabled until mood + message
- [ ] Submit button enabled when both filled
- [ ] Creating MemoryPop saves mood correctly

### Mood Tests
- [ ] All 6 moods display correctly
- [ ] Simple & classic mood works
- [ ] Message starters change per mood
- [ ] Contributor experience influenced by mood

### Legacy Tests
- [ ] Existing MemoryPops with old tone values work
- [ ] "simple" → "simple_classic" mapping works

### Visual Tests
- [ ] Progress bar: 33% → 66% → 100%
- [ ] Step counter: "Step 1 of 3", "Step 2 of 3", "Step 3 of 3"
- [ ] Visual separation between mood and message sections

---

## Implementation Changes

### What Changes from Existing Implementation

**Remove:**
- ❌ Separate Step 2 (mood selection page)
- ❌ "Write your message →" button after mood selection
- ❌ Step 2 progress label "💛 Choosing the mood"

**Move:**
- 📦 MoodSelector component → top of Step 2 (message page)
- 📦 Mood state validation → submit button logic

**Add:**
- ➕ 6th mood: "Simple & classic"
- ➕ Visual section break between mood and message
- ➕ Combined validation (mood + message) for submit button

**Update:**
- 🔄 Progress calculation: `(step / 3) * 100`
- 🔄 Step labels: 3 steps instead of 4
- 🔄 Button logic: Check both mood and message

---

## Rollout Plan

### Phase 1: Update Specification (Current)
- Revise specs based on Founder feedback
- Get Founder approval of revised UX

### Phase 2: Modify Implementation (1 day)
- Add 6th mood to `celebrationMood.ts`
- Refactor `create/page.tsx` to embed mood in Step 2
- Update progress calculation
- Update API validation
- Test flow

### Phase 3: Testing & Validation
- Manual testing of revised flow
- Verify 3-step progress works
- Verify mood + message validation
- Verify legacy compatibility

### Phase 4: Deploy & Monitor
- Deploy to production
- Monitor completion rates
- Track mood distribution (expect "Simple & classic" ~10-15%)
- Gather creator feedback

---

## Success Metrics

**Leading Indicators:**
- Mood selection rate: >95%
- Step 2 completion rate: maintained or improved
- Time on Step 2: acceptable (not dramatically increased)

**Lagging Indicators:**
- Mood distribution: Simple & classic ~10-15%, others ~17% each
- Creator feedback: "Flow feels natural"
- No increase in support questions

---

## Ready for Founder Approval

This revised specification reflects the UX feedback:
- ✅ Mood embedded in Step 2 (not separate step)
- ✅ 6 moods (including Simple & classic)
- ✅ Continuous creative flow
- ✅ Reduced friction
- ✅ Mood remains separate from Occasion architecturally
- ✅ Long-term extensibility preserved

**Estimated effort:** 1 day (modifications to existing implementation)
**Risk level:** Very Low
**Product value:** High (improved UX, reduced friction)

**Awaiting Founder approval to proceed with implementation changes.**
