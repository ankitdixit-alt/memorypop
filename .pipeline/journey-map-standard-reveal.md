# Standard Recipient Reveal Journey Map
**Date:** 2026-08-11
**Purpose:** Visual representation of Standard recipient flow

---

## Flow Diagram (First-Time User, 5 Memories Example)

```
┌─────────────────────────────────────────────────────────────────┐
│ Step 0: WelcomeScreen                                           │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ "Happy Birthday Emma!"                                          │
│ "5 people contributed memories for you"                         │
│                                                                 │
│ [Begin ↓]  ← Click to start                                    │
└─────────────────────────────────────────────────────────────────┘
                         ↓ handleNext()
┌─────────────────────────────────────────────────────────────────┐
│ Steps 1-5: MemoryScreen (one per contributor)                  │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ [Photo]                                                         │
│ "Sarah Chen"                                                    │
│ "Happy birthday! I'm so grateful for your friendship..."        │
│                                                                 │
│ Navigation:                                                     │
│ • Swipe left/right ← ENABLED                                   │
│ • Keyboard arrows ← ENABLED                                    │
│ • [← Previous] [Next →] buttons                                │
│ • "Browse all memories" link (top-right)                       │
└─────────────────────────────────────────────────────────────────┘
                         ↓ handleNext()
┌─────────────────────────────────────────────────────────────────┐
│ Step 6: FinalScreen                                             │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ 🎉                                                              │
│ "Happy Birthday!"                                               │
│ "Thank you to everyone who made this celebration possible."    │
│                                                                 │
│ [Continue] ← ONLY way to progress                              │
│                                                                 │
│ Navigation:                                                     │
│ • Swipe left/right ← DISABLED ⚠️                               │
│ • Keyboard arrows ← DISABLED ⚠️                                │
│ • Continue button ← ENABLED (calls handleNext)                 │
└─────────────────────────────────────────────────────────────────┘
                         ↓ handleNext() when button clicked
┌─────────────────────────────────────────────────────────────────┐
│ Step 7: ReactionPrompt (if !hasReacted)                        │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ "How did this MemoryPop make you feel?"                        │
│ "Your reaction will let the creators know you experienced it." │
│                                                                 │
│ [❤️ Loved it]                                                   │
│ [🥹 Made me emotional]                                          │
│ [😂 Made me laugh]                                              │
│                                                                 │
│ ⚠️ MISSING IF:                                                  │
│ • Continue button wasn't visible                               │
│ • Continue button wasn't clicked                               │
│ • hasReacted incorrectly set to true                           │
└─────────────────────────────────────────────────────────────────┘
                         ↓ onReactionSelect() when reaction clicked
┌─────────────────────────────────────────────────────────────────┐
│ Step 8: ReactionThankYou                                        │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ ❤️                                                              │
│ "Thank You"                                                     │
│ "Your reaction has been shared with everyone who contributed." │
│                                                                 │
│ [Revisit Memory Wall]                                           │
│ [Replay Reveal]                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Returning User Flow (Already Reacted)

```
┌─────────────────────────────────────────────────────────────────┐
│ Step 0: WelcomeScreen                                           │
└─────────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│ Steps 1-5: MemoryScreen (same as first-time)                   │
└─────────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│ Step 6: FinalScreen                                             │
│ [Continue]                                                      │
└─────────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│ Step 7: ReactionThankYou (isReturningUser=true)                │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ ❤️                                                              │
│ "Your Reaction"                                                 │
│ "You loved it when you first experienced this MemoryPop."      │
│                                                                 │
│ [Revisit Memory Wall]                                           │
│ [Replay Reveal]                                                 │
│                                                                 │
│ Note: NO ReactionPrompt shown (already reacted)                │
└─────────────────────────────────────────────────────────────────┘
```

---

## State Transitions

### First-Time User

| Step | currentStep | hasReacted | selectedReaction | Component Rendered |
|------|-------------|------------|------------------|--------------------|
| Welcome | 0 | false | null | WelcomeScreen |
| Memory 1 | 1 | false | null | MemoryScreen |
| Memory 2 | 2 | false | null | MemoryScreen |
| Memory 3 | 3 | false | null | MemoryScreen |
| Memory 4 | 4 | false | null | MemoryScreen |
| Memory 5 | 5 | false | null | MemoryScreen |
| Final | 6 | false | null | FinalScreen |
| **Reaction** | **7** | **false** | **null** | **ReactionPrompt** ⚠️ |
| Thank You | 8 | true | "loved_it" | ReactionThankYou |

**Critical transition:** Step 6 → Step 7
- **Trigger:** User clicks Continue button on FinalScreen
- **Function:** `handleNext()` increments `currentStep` from 6 to 7
- **Condition:** `currentStep === 7 && !hasReacted` must be true
- **Result:** ReactionPrompt renders

### Returning User

| Step | currentStep | hasReacted | selectedReaction | Component Rendered |
|------|-------------|------------|------------------|--------------------|
| Welcome | 0 | true | "loved_it" | WelcomeScreen |
| Memory 1-5 | 1-5 | true | "loved_it" | MemoryScreen |
| Final | 6 | true | "loved_it" | FinalScreen |
| **Thank You** | **7** | **true** | **"loved_it"** | **ReactionThankYou (isReturningUser=true)** |

**Critical transition:** Step 6 → Step 7
- **Trigger:** User clicks Continue button on FinalScreen
- **Function:** `handleNext()` increments `currentStep` from 6 to 7
- **Condition:** `currentStep === 7 && hasReacted && selectedReaction` must be true
- **Result:** ReactionThankYou (returning user variant) renders

---

## Regression Hypothesis Visualization

### Hypothesis 1: Continue Button Not Visible
```
FinalScreen ──[Continue button too faint]──> User doesn't click ──> Stuck at Step 6
                                                                      ↓
                                              User exits or refreshes
                                                                      ↓
                                              ❌ Never reaches ReactionPrompt
```

### Hypothesis 2: State Inconsistency
```
Server Query ──[Race condition or unexpected data]──> hasReacted = true (incorrect)
                                                      ↓
FinalScreen ──[User clicks Continue]──> Step 7 ──> Condition check fails
                                                   ↓
                                       Fallback renders FinalScreen again
                                                   ↓
                                       ❌ Infinite loop, no ReactionPrompt
```

### Hypothesis 3: User Exits Early
```
MemoryScreen ──[User clicks "Browse all memories"]──> Memory Wall (/m/[shareCode])
                                                      ↓
                                              ❌ Never reaches FinalScreen or ReactionPrompt
```

---

## Navigation Capabilities by Step

| Step | Screen | Swipe | Keyboard | Previous/Next Buttons | Other Actions |
|------|--------|-------|----------|----------------------|---------------|
| 0 | WelcomeScreen | ❌ | ❌ | ❌ | "Begin" button |
| 1-5 | MemoryScreen | ✅ | ✅ | ✅ | "Browse all memories" link |
| 6 | FinalScreen | ❌ | ❌ | ❌ | **"Continue" button** ⚠️ |
| 7 | ReactionPrompt | ❌ | ❌ | ❌ | Reaction buttons |
| 8 | ReactionThankYou | ❌ | ❌ | ❌ | "Revisit" / "Replay" links |

**Key insight:** FinalScreen is the ONLY step where:
- Navigation is fully disabled (no swipe, no keyboard)
- Progress depends on a single button click
- Button visibility/styling is critical

---

## Code Reference Quick Links

| Component | File | Line(s) | Purpose |
|-----------|------|---------|---------|
| Step calculation | RevealExperience.tsx | 87-89 | Determines totalSteps based on hasReacted |
| handleNext() | RevealExperience.tsx | 91-104 | Increments currentStep |
| FinalScreen render condition | RevealExperience.tsx | 218-219 | When to show FinalScreen |
| Continue button | RevealExperience.tsx | 564-575 | Button that triggers handleNext |
| ReactionPrompt render condition | RevealExperience.tsx | 220-227 | When to show ReactionPrompt |
| State initialization | RevealExperience.tsx | 42-45 | hasReacted and selectedReaction |
| Server data fetch | reveal/page.tsx | 92-96 | Query for existingReaction |

---

## Testing Checklist

### Visual Test (FinalScreen)
- [ ] Continue button is visible
- [ ] Button has clear label ("Continue")
- [ ] Button has sufficient color contrast
- [ ] Button responds to hover (visual feedback)
- [ ] Button responds to click (progresses to next step)
- [ ] Test across all cover styles

### Flow Test (First-Time User)
- [ ] Welcome → Begin → Memory screens
- [ ] Swipe through all memories
- [ ] Reach FinalScreen
- [ ] Click Continue
- [ ] ReactionPrompt appears ✅
- [ ] Select reaction
- [ ] ReactionThankYou appears

### State Test
- [ ] Log `currentStep`, `totalSteps`, `hasReacted` at each step
- [ ] Verify at FinalScreen: `step=6, total=9, hasReacted=false`
- [ ] Verify after Continue: `step=7, total=9, hasReacted=false`
- [ ] Verify ReactionPrompt condition passes

---

**Journey Map Status:** ✅ Complete
**Next:** Visual inspection and founder decision on fix approach
