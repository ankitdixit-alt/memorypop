# Implementation Specification: Celebration Mood Step

**Date:** 2026-07-23
**Status:** ✅ Founder Approved with Refinements
**Estimated Effort:** 1-2 days

---

## Executive Summary

Add a dedicated mood selection step (Step 1.5) to the MemoryPop creation flow, positioned between occasion selection and message writing. Mood influences both the creator experience (message-writing) and contributor experience throughout the celebration journey.

**Core Change:** Split Step 2 into "Choose Mood" (new Step 1.5) + "Write Message" (Step 2), moving mood selection earlier and establishing it as a first-class experience layer.

**Architecture Principle:** Mood is a long-term experience layer that influences copy now, and will later influence visual styling, animations, reveal experience, celebration effects, and AI prompting.

---

## Architecture Principles

### Mood as Long-Term Experience Layer

Mood is architected as a **first-class dimension** that will grow beyond copy to influence the entire celebration experience.

**This Release (Copy Layer):**
- ✅ Mood selection UI (Step 1.5)
- ✅ Creator message-writing influenced by mood
- ✅ Contributor contribute page influenced by mood
- ✅ Reveal introduction influenced by mood

**Future Capabilities (Extensibility Built In):**
- 🎨 **Visual Layer:** Mood-specific color palettes, gradients, cover styles
- ✨ **Animation Layer:** Mood-appropriate transitions, celebration effects, confetti styles
- 🎭 **Reveal Experience:** Mood-driven pacing, transitions, sound effects
- 🤖 **AI Prompting:** Mood context for future AI-generated content
- 📊 **Analytics:** Mood-based insights and personalization

**Design Decision:** The `MoodConfig` interface includes extensibility comments to guide future features. Fields can be added without breaking changes.

**Key Principle:** Mood should feel like a natural, intuitive choice that creators understand immediately. Five options provide meaningful variety without overwhelming.

---

## Exact User Flow

### Current Flow (3 steps)
```
Step 1: Choose occasion + Enter recipient name
  ↓
Step 2: Write message + Choose tone + Choose cover + Add date + Add photos
  ↓
Step 3: Preview + Create
```

###Proposed Flow (4 steps - reusing step numbering)

```
Step 1: Choose occasion + Enter recipient name
  ↓ (Click "Make it personal →")
  
Step 1.5 NEW: Choose celebration mood
  - Display: "How should this celebration feel?"
  - Supporting: "Choose the atmosphere you'd like everyone to help create."
  - Show 5 mood cards (2-column mobile, 3-column desktop)
  - Each card: emoji + label + 1-sentence description
  - Click to select, button to continue
  - REQUIRED: Continue button disabled until mood selected
  ↓ (Click "Write your message →")
  
Step 2: Write personal message (ENHANCED with mood)
  - Header influenced by selected mood
  - Helper text influenced by selected mood
  - Message starters influenced by selected mood
  - Textarea placeholder influenced by selected mood
  - Celebration date (optional)
  - Emoji selector (RENAMED: "Choose a celebration icon")
  - Cover style selector (unchanged)
  - Photo upload (unchanged)
  ↓ (Click "See your MemoryPop →")
  
Step 3: Preview + Create (unchanged)
```

### Step-by-Step Interaction

**Step 1 → 1.5 transition:**
- User clicks "Make it personal →" after entering recipient name
- Progress bar updates: 25% → 37.5%
- Progress label changes: "🌱 Starting the celebration" → "💛 Choosing the mood"
- Step counter: "Step 1 of 3" → "Step 1.5 of 3" (or relabel to "Step 2 of 4")

**Step 1.5 (NEW):**
```
┌─────────────────────────────────────────┐
│ 💛 Choosing the mood                    │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │ 37.5%
│ Step 2 of 4                             │
└─────────────────────────────────────────┘

[← Back]

How should this celebration feel?
Choose the atmosphere you'd like everyone to help create.

┌─────────────────┬─────────────────┐
│ 💕 Warm &       │ 🎉 Playful &    │
│    heartfelt    │    fun          │
│                 │                 │
│ Genuine love    │ Lighthearted    │
│ and warmth      │ and joyful      │
└─────────────────┴─────────────────┘

┌─────────────────┬─────────────────┐
│ ✨ Thoughtful & │ 🎊 Joyful &     │
│    meaningful   │    celebratory  │
│                 │                 │
│ Sincere and     │ Uplifting and   │
│ intentional     │ full of energy  │
└─────────────────┴─────────────────┘

┌─────────────────────────────────────┐
│ 🌸 Nostalgic & reflective           │
│                                     │
│ Looking back with fondness          │
└─────────────────────────────────────┘

[Write your message →]  (disabled until selection)
```

**Step 1.5 → 2 transition:**
- User selects mood (card highlights)
- User clicks "Write your message →"
- Progress bar: 37.5% → 62.5%
- Progress label: "💛 Choosing the mood" → "💛 Making it personal"
- Step counter: "Step 2 of 4" → "Step 3 of 4"

**Step 2 (ENHANCED):**
- Header text changes based on selected mood (see Mood Configuration below)
- Helper text changes based on mood
- Message starters change based on mood (if available)
- Textarea prompt changes based on mood
- Placeholder changes based on mood
- Emoji selector label: "Add some emotion" → "Choose a celebration icon"

---

## Data Model

### Database

**NO SCHEMA CHANGES NEEDED**

Reuse existing `tone` field in `memorypops` table:
```sql
-- Existing schema (no changes)
CREATE TABLE memorypops (
  ...
  tone TEXT NOT NULL,  -- Legacy: "Heartfelt", "Funny", "Emotional", "Simple"
                       -- New values: "warm_heartfelt", "playful_fun", "thoughtful_meaningful",
                       --             "joyful_celebratory", "nostalgic_reflective"
                       -- REQUIRED: Creator must select mood (no default)
  ...
);
```

**Migration Strategy:**
- No SQL migration needed (field already exists)
- Normalize legacy values in application code
- New MemoryPops use snake_case mood IDs

### Type Definition

**Update `src/lib/celebrationMood.ts`:**

```typescript
export type CelebrationMood =
  | "warm_heartfelt"
  | "playful_fun"
  | "thoughtful_meaningful"
  | "joyful_celebratory"
  | "nostalgic_reflective";

// Legacy compatibility
type LegacyMood = "heartfelt" | "funny" | "emotional" | "simple";

export interface MoodConfig {
  // UI labels
  id: CelebrationMood;
  label: string;              // e.g., "Warm & heartfelt"
  emoji: string;              // e.g., "💕"
  description: string;        // e.g., "Genuine love and warmth"

  // Creator experience (message writing step)
  creatorHeadline: string;         // Header for creator's message step
  creatorSupportingText: string;   // Helper text for creator
  creatorPrompt: string;           // Label for creator's textarea
  creatorPlaceholder: string;      // Placeholder for creator's textarea

  // Contributor experience (contribute page)
  contributorHeadline: string;     // Header for contributor form
  contributorSupportingText: string; // Helper text for contributors
  contributorPrompt: string;        // Label for contributor's textarea
  contributorPlaceholder: string;   // Placeholder for contributor's textarea

  // Reveal experience
  revealIntroduction: string;      // Intro text on reveal page

  // Optional: message starters (can differ for creator vs contributor)
  messageStarters?: string[];

  // Future extensibility
  // Visual: colors, gradients, cover styles
  // Animation: transition effects, celebration effects
  // AI: prompt engineering hints
}
```

### State Management

**Update `src/app/create/page.tsx`:**

```typescript
const [step, setStep] = useState(1);       // Change to support 1.5
const [mood, setMood] = useState<CelebrationMood | null>(null); // Rename from tone, required selection
```

**IMPORTANT:** Mood is required. Do not provide a default value. The creator must make an intentional choice before proceeding to the message-writing step.

**Step numbering strategy:**
- Option A: Use fractional steps (1, 1.5, 2, 3) - simpler code
- Option B: Renumber to (1, 2, 3, 4) - clearer UI
- **Recommendation:** Option B (renumber to 4 steps)

---

## Mood Configuration

### Complete Mood Definitions

```typescript
export const CELEBRATION_MOODS: Record<CelebrationMood, MoodConfig> = {
  warm_heartfelt: {
    id: "warm_heartfelt",
    label: "Warm & heartfelt",
    emoji: "💕",
    description: "Genuine love and warmth",

    // Creator experience
    creatorHeadline: "Make it personal",
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
    creatorHeadline: "Make it personal",
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
    creatorHeadline: "Make it personal",
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
    creatorHeadline: "Make it personal",
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
    creatorHeadline: "Make it personal",
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
  }
};
```

### Legacy Value Normalization

```typescript
export function normalizeMood(mood: string | null | undefined): CelebrationMood {
  if (!mood) {
    return "warm_heartfelt"; // Safe default
  }
  
  const lowercase = mood.toLowerCase().trim();
  
  // Handle new values (snake_case)
  if (lowercase in CELEBRATION_MOODS) {
    return lowercase as CelebrationMood;
  }
  
  // Handle legacy values (capitalized)
  const legacyMap: Record<string, CelebrationMood> = {
    "heartfelt": "warm_heartfelt",
    "funny": "playful_fun",
    "emotional": "nostalgic_reflective",
    "simple": "warm_heartfelt",
    // Handle old elegant/bold names during transition
    "elegant_meaningful": "thoughtful_meaningful",
    "bold_celebratory": "joyful_celebratory",
  };

  return legacyMap[lowercase] || "warm_heartfelt";
}

**Note:** For existing MemoryPops only, `normalizeMood()` provides a safe fallback. For new MemoryPops, mood is required and must be explicitly selected by the creator.
```

---

## Files to Change

### Core Implementation (5 files)

1. **`src/lib/celebrationMood.ts`** (MODIFIED)
   - Update `CelebrationMood` type with 5 new values
   - Update `MoodConfig` interface to add UI fields (label, emoji, description)
   - Replace `CELEBRATION_MOODS` object with 5 new mood configurations
   - Update `normalizeMood()` to handle legacy values
   - Add mood-specific `messageStarters` (optional per mood)

2. **`src/app/create/page.tsx`** (MODIFIED)
   - Insert new Step 1.5 (mood selection) between current Step 1 and Step 2
   - Rename `tone` state to `mood`
   - Update step numbering (1, 2, 3, 4) and progress calculation
   - Move mood selection out of Step 2
   - Update Step 2 to use mood-influenced copy from `celebrationExperience`
   - Change "Add some emotion" label to "Choose a celebration icon"

3. **`src/components/MoodSelector.tsx`** (NEW)
   - Reusable mood selection component
   - Display 5 mood cards in responsive grid
   - Handle selection state
   - Similar pattern to OccasionSelector

4. **`src/app/api/memorypops/create/route.ts`** (MINOR UPDATE)
   - Validate `mood` field in payload (should be one of 5 valid values)
   - Save as `tone` in database (field name unchanged)
   - Optional: log analytics event with mood selection

5. **`src/lib/celebrationExperience.ts`** (NO CHANGES)
   - Composition layer already supports mood
   - No modifications needed (already correctly structured)

### Optional Enhancements (2 files)

6. **`src/lib/occasions.ts`** (OPTIONAL CLEANUP)
   - Remove any mood-related overrides if present
   - Keep occasion configuration pure (no mood logic)

7. **`tests/mood-selection.test.tsx`** (NEW - if testing enabled)
   - Test mood normalization function
   - Test mood selector component
   - Test legacy value handling

---

## Acceptance Criteria

### Must Have (Required for Ship)

1. ✅ **Mood selection step exists and is required**
   - Appears after occasion selection, before message writing
   - Shows 5 mood options: Warm & heartfelt, Playful & fun, Thoughtful & meaningful, Joyful & celebratory, Nostalgic & reflective
   - Each shows emoji, label, and description
   - Allows single selection (radio-like behavior)
   - Continue button disabled until selection made
   - **No default mood** - creator must make intentional choice

2. ✅ **Creator message writing step influenced by mood**
   - Header text changes based on selected mood
   - Helper text changes based on mood
   - Textarea prompt changes based on mood
   - Placeholder text changes based on mood
   - Message starters (if present) change based on mood

3. ✅ **Contributor experience influenced by mood**
   - Contribute page headline changes based on mood
   - Supporting text changes based on mood
   - Textarea prompt changes based on mood
   - Placeholder text changes based on mood
   - Examples: Warm → "Share something from the heart", Playful → "Share something that will make them smile", Nostalgic → "Share a memory they'll treasure"

4. ✅ **Data correctly saved**
   - Selected mood saved to database `tone` field
   - API validates mood value against allowed list (5 valid values)
   - API rejects creation if mood is missing or invalid
   - Existing MemoryPops continue to work (legacy values normalized)

5. ✅ **UI polish**
   - Mood step visually consistent with existing design
   - Heading: "How should this celebration feel?"
   - Supporting text: "Choose the atmosphere you'd like everyone to help create."
   - Mobile-first responsive layout (2 columns mobile, 3 desktop)
   - Selected mood visually distinct (border + background color)
   - Smooth transitions between steps
   - Back button returns to mood selection with previous selection preserved

6. ✅ **Emoji selector renamed**
   - Label changes from "Add some emotion" to "Choose a celebration icon"
   - Functionality unchanged

7. ✅ **Legacy compatibility**
   - Existing MemoryPops with old tone values ("Heartfelt", "Funny", etc.) still render correctly
   - `normalizeMood()` function handles legacy values (including "elegant_meaningful" → "thoughtful_meaningful", "bold_celebratory" → "joyful_celebratory")
   - No errors when viewing old MemoryPops

### Nice to Have (Optional)

- ⭐ Mood-specific message starters (enhances UX but not required)
- ⭐ Analytics event tracking mood selection
- ⭐ Mood preview (show sample headline before selection)

---

## Risks & Edge Cases

### Technical Risks: VERY LOW

**Risk 1: Existing MemoryPops with legacy tone values**
- **Impact:** Low - only affects display, not data integrity
- **Mitigation:** `normalizeMood()` function maps legacy → new
- **Fallback:** Default to "warm_heartfelt" if unmapped

**Risk 2: Step numbering changes**
- **Impact:** Low - visual only, doesn't affect logic
- **Mitigation:** Test step transitions thoroughly
- **Fallback:** Keep fractional steps (1, 1.5, 2, 3) if renumbering complex

**Risk 3: Database field name mismatch**
- **Impact:** None - field is `tone` in DB, `mood` in UI
- **Mitigation:** Map at API boundary (payload: mood → DB: tone)
- **Fallback:** Already implemented correctly

### Product Risks: LOW

**Risk 1: Mood step adds time to creation flow**
- **Impact:** Medium - might increase abandonment
- **Mitigation:** Keep step simple, fast, obvious value
- **Measurement:** Track time-on-step and abandonment rate

**Risk 2: Five options might overwhelm creators**
- **Impact:** Low - 5 is reasonable for important decision
- **Mitigation:** Clear descriptions, sensible default
- **Fallback:** Reduce to 3-4 moods in future if data shows confusion

**Risk 3: Mood selection doesn't feel valuable**
- **Impact:** Medium - creators might skip/ignore
- **Mitigation:** Strong influence on message step (obvious value)
- **Measurement:** Track mood selection rate (target >95%)

### UX Risks: VERY LOW

**Risk 1: Mood cards not visually distinct**
- **Impact:** Low - might be hard to see selection
- **Mitigation:** Strong selected state (border + background)
- **Fallback:** Add checkmark icon to selected card

**Risk 2: Descriptions too long on mobile**
- **Impact:** Low - text wrapping might look bad
- **Mitigation:** Keep descriptions to 1 short sentence (4-6 words)
- **Fallback:** Hide descriptions on mobile (show only label)

### Edge Cases

**Edge 1: User hits back from Step 2 to mood selection**
- **Behavior:** Return to mood selection with previous mood still selected
- **Implementation:** Preserve `mood` state, don't reset to default

**Edge 2: User hits back from mood selection to Step 1**
- **Behavior:** Return to occasion/recipient step, previous values preserved
- **Implementation:** Standard back navigation, no special handling

**Edge 3: User refreshes page during creation**
- **Behavior:** State is lost (all create flows lose state on refresh)
- **Implementation:** No special handling (consistent with existing behavior)

**Edge 4: Null/undefined mood in database**
- **Behavior:** Default to "warm_heartfelt"
- **Implementation:** `normalizeMood()` handles this

**Edge 5: Invalid mood value in database (e.g., "test123")**
- **Behavior:** Default to "warm_heartfelt"
- **Implementation:** `normalizeMood()` handles this

---

## Non-Goals (Explicitly Out of Scope)

❌ Mood-based cover style recommendations
❌ Mood-based color theming
❌ Mood-based animations or transitions
❌ Custom mood creation (user-defined moods)
❌ Mood editing after MemoryPop creation
❌ Mood filtering on dashboard/browse
❌ Mood analytics dashboard
❌ A/B testing different mood sets
❌ Mood-based email copy
❌ Mood-based WhatsApp share messages

---

## Testing Checklist

### Functional Tests

- [ ] Mood selection step appears after Step 1
- [ ] All 5 moods display correctly (emoji + label + description)
- [ ] Selecting a mood highlights the card
- [ ] Continue button disabled until selection made
- [ ] Continue button navigates to Step 2 when mood selected
- [ ] Step 2 shows mood-influenced copy (headline, prompt, placeholder)
- [ ] Emoji selector labeled "Choose a celebration icon"
- [ ] Back button returns to mood selection with previous selection
- [ ] Creating MemoryPop saves mood to database
- [ ] API validates mood value (rejects invalid moods)

### Legacy Compatibility Tests

- [ ] Viewing MemoryPop with tone="Heartfelt" works (maps to warm_heartfelt)
- [ ] Viewing MemoryPop with tone="Funny" works (maps to playful_fun)
- [ ] Viewing MemoryPop with tone="Emotional" works (maps to nostalgic_reflective)
- [ ] Viewing MemoryPop with tone="Simple" works (maps to warm_heartfelt)
- [ ] Viewing MemoryPop with tone=null works (defaults to warm_heartfelt)
- [ ] Viewing MemoryPop with invalid tone works (defaults to warm_heartfelt)

### Responsive Tests

- [ ] Mood cards display 2 columns on mobile (< 640px)
- [ ] Mood cards display 3 columns on desktop (≥ 640px)
- [ ] Text wraps gracefully on small screens
- [ ] Touch targets are large enough (44px minimum)

### Visual Polish Tests

- [ ] Progress bar updates correctly (25% → 37.5% → 62.5% → 100%)
- [ ] Step counter updates correctly
- [ ] Selected mood has visible border and background
- [ ] Smooth transitions between steps
- [ ] Consistent color scheme and typography

---

## Rollout Plan

### Phase 1: Implementation (Day 1)
- Update `celebrationMood.ts` with 5 new moods
- Create `MoodSelector` component
- Update create page to insert Step 1.5
- Update Step 2 to use mood-influenced copy
- Rename emoji selector label

### Phase 2: Testing (Day 1-2)
- Manual testing of full creation flow
- Legacy value compatibility testing
- Responsive testing (mobile/desktop)
- API payload validation testing

### Phase 3: Deploy & Monitor (Day 2)
- Deploy to production
- Monitor key metrics:
  - Mood selection rate (target >95%)
  - Mood distribution
  - Time on mood step (target 5-10s)
  - Message step completion rate
  - Create abandonment rate

### Phase 4: Iterate (Week 1-2)
- Analyze mood selection patterns
- Gather creator feedback
- Adjust mood descriptions if confusion detected
- Consider A/B test of mood order or descriptions

---

## Success Metrics

**Leading Indicators (Day 1-7):**
- Mood selection rate: >95% of creators select a mood
- Time on mood step: 5-10 seconds (not blocking)
- No increase in create abandonment
- Message step completion rate maintained or improved

**Lagging Indicators (Week 2-4):**
- Mood distribution roughly: 40% Warm, 20% each others
- No increase in creator support questions about moods
- Contributor experience NPS maintained or improved
- Qualitative feedback mentions mood as helpful

**Failure Signals:**
- Mood selection rate <80% (creators skipping or confused)
- Time on mood step >20s (decision paralysis)
- Create abandonment increases >10%
- Negative feedback about added complexity

---

## Ready for Founder Approval

This specification provides:
- ✅ Complete user flow
- ✅ Data model (reuses existing `tone` field)
- ✅ All 5 mood configurations with full copy
- ✅ Files to change (5 core + 2 optional)
- ✅ Acceptance criteria (must-have + nice-to-have)
- ✅ Risks and edge cases (all low/very low)
- ✅ Testing checklist
- ✅ Rollout plan
- ✅ Success metrics

**Estimated effort:** 1-2 days
**Risk level:** Very Low
**Product value:** High

**Awaiting Founder approval to proceed to implementation.**
