# Manual Browser Verification Checklist

**URL:** http://localhost:3000/ai-director-reveal
**Date:** September 14, 2026

---

## Quick Verification (5 minutes)

### 1. Recipient Name Handling
Open Birthday occasion, AI Director concept mode:

- [ ] **Normal name (Emma):** Opening shows "A story for Emma, from everyone who contributed." Closing shows "Happy birthday, Emma."
- [ ] **Long name:** Switch to Sympathy (The Martinez Family). Verify text wraps naturally on desktop and mobile (<850px width). No overlap with other elements.

To test empty/whitespace (requires fixture edit):
- [ ] Temporarily edit `src/app/ai-director-reveal/prototype.ts` line 29, change `recipient: 'Emma'` to `recipient: ''`
- [ ] Reload page, verify opening shows "A story made together, from everyone who contributed." and closing shows "Happy birthday." (no name)
- [ ] Revert fixture change

### 2. All Four Occasions
Test AI Director concept mode with each occasion:

- [ ] **Birthday (Emma):** Opening "Made with love", closing "Happy birthday, Emma."
- [ ] **Anniversary (Alex & Jordan):** Opening "Made with love", closing "Alex & Jordan, here's to many more years together."
- [ ] **Retirement (Michael):** Opening "Made with love", closing "Thank you for everything, Michael."
- [ ] **Sympathy (The Martinez Family):** Opening "Shared with love", closing "These memories are here for you."

### 3. Reveal Playback
Pick one occasion (Birthday recommended):

- [ ] Click "Begin →" — Opening lasts ~3.4s, then fades to first chapter
- [ ] Click "Play" or press Space — Reveal plays through memories
- [ ] Audio fades in smoothly (800ms)
- [ ] Music ducks during video (quieter but present)
- [ ] Tile transitions animate smoothly (no reduced motion)
- [ ] Decorations visible and not overlapping content
- [ ] Messages appear once per contribution (no duplicates)
- [ ] Finale appears at end of last chapter
- [ ] Closing card appears after finale with "Replay reveal ↻" and "Visit memory wall ↗" buttons
- [ ] Click "Replay reveal ↻" — Returns to opening

### 4. Standard Comparison
Switch to "Standard reveal" tab:

- [ ] No opening sequence (goes straight to memories)
- [ ] No chapter cards
- [ ] No finale designation
- [ ] Simpler transitions (fade only)
- [ ] Same memories and media present

### 5. Mobile Layout
Resize browser to narrow width (<850px) or use device emulation:

- [ ] Opening text readable, not cut off
- [ ] Long recipient name (The Martinez Family) wraps without overflow
- [ ] Chapter text readable
- [ ] Closing text readable, buttons accessible
- [ ] Decorations reduced (fewer particles)
- [ ] All controls work on touch

---

## Extended Verification (15 minutes)

### Edge Cases
- [ ] Fast-forward with speed 2× — All text still readable
- [ ] Rapid clicking "Next" — No crashes, no audio overlap
- [ ] Click "Sound on/off" toggle — Music mutes/unmutes
- [ ] Click "Pause" mid-reveal — Music fades out
- [ ] Click "Play" after pause — Music fades in, continues from same spot
- [ ] Switch occasions while playing — Reveal resets correctly

### Reduced Motion
Enable "Prefers reduced motion" in OS/browser settings:

- [ ] Tile transitions disabled (simple fades instead)
- [ ] Decorations still present but not animated
- [ ] All other functionality works

---

## What This Verifies

✅ Recipient name handling (empty, normal, long, wrapping)
✅ Opening and closing text for all occasions
✅ Plus/Premium reveal complete playback
✅ Audio behavior (fades, ducking, cleanup)
✅ Tile transitions and decorations
✅ Standard vs Plus comparison
✅ Mobile responsive layout
✅ Controls and user interactions
✅ Edge cases and accessibility

---

## Not Tested Here

❌ Production guard (already code-verified)
❌ Synthetic data isolation (already code-verified)
❌ Missing external API requests (check Network tab if needed)

---

**Time estimate:** 5 minutes for quick verification, 15 minutes for extended
