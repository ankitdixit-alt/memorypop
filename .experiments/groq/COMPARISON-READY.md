# Groq Comparison Ready

**Date:** September 17, 2026
**Status:** Development comparison complete, no external API calls

---

## What Changed

### 1. Offline Verification Complete

**Extracted shared scheduling logic:**
- Created `scripts/lib/scheduling.ts` with shared functions
- Both pilot runner and tests import same logic
- No duplicated code

**Added 6 new tests:**
- Execution window uses **remaining time**, not full 10-minute allowance
- 122s wait doesn't fit when 9 minutes already elapsed
- Pilot restart preserves attempt counts
- Sympathy-b cannot retry (used initial + 1 retry = exhausted)
- Budget remaining doesn't reopen exhausted cases

**Test Results:** 35 tests passing (up from 29)

### 2. Development Comparison Page

**Created:** `src/app/groq-comparison/page.tsx`

**Shows:**
- Side-by-side: Deterministic Plus vs Groq AI
- 3 successful pilot cases available
- Sympathy-b marked "Generation Failed" (honest representation)
- Opening, chapters, memory sequence, highlights, finale
- Identical synthetic messages, no API calls

**API Route:** `src/app/api/groq-pilot-plan/route.ts`
- Serves saved pilot plans from `.experiments/groq/run-pilot/`
- Development only, no external requests
- Security: validates file names

### 3. What Was Tested

**Verified:**
- ✓ All 3 successful plans load correctly
- ✓ Sympathy-b shows failure status (not faked)
- ✓ No external API calls (local file reads only)
- ✓ Page loads at 200 status
- ✓ Plans include opening, chapters, highlights, finale
- ✓ Source labels clear (JSON Schema strict mode)

**Plans Available:**
1. Anniversary A (no instructions) - 4 chapters, 2925 tokens
2. Anniversary B (with instructions) - 3 chapters, 2502 tokens
3. Sympathy A (no instructions) - 4 chapters, 2324 tokens

**Not Available:**
- Sympathy B - failed generation (rate limit → API error)

---

## Local URL

```bash
npm run dev
```

**Then open:** http://localhost:3000/groq-comparison

**Selector:** Buttons to switch between available cases
**View:** Side-by-side plan comparison
**Content:** Real contributor messages in Groq-planned chapter order

---

## Comparison Shows

### Left Column: Deterministic Plus
- Existing reveal logic (mockRevealPlanner)
- Chronological ordering
- Standard chapter structure
- No AI involvement

### Right Column: Groq AI
- JSON Schema structured output
- AI-chosen opening
- AI-planned chapter grouping
- AI-selected highlights and finale
- Saved from 5-attempt pilot (no API calls during viewing)

### Identical Across Both
- Same synthetic messages
- Same contributor names
- Same occasion/tone
- Same fixture media (when played)
- Same MemoryPop branding
- Same playback transitions

### Different (Groq Only)
- Opening line
- Chapter titles and grouping
- Memory ordering
- Highlight selections
- Finale choice

---

## What's Pending

**Not Implemented:**
- Full reveal player integration (currently shows plan structure only)
- Actual media playback with transitions
- Sound settings toggle
- Mobile responsive layout
- Fullscreen mode

**Why:** Focus was on comparing **plan quality** (emotional progression, coherence, tone, finale strength) before investing in full player integration.

**Next:** If Groq storytelling quality is promising, integrate plans into existing reveal player component.

---

## Quick Checks

```bash
# Run all offline tests
npm run groq-test-mocked

# View pilot summary
cat .experiments/groq/PILOT-REPORT.md

# View browser review (full messages)
open .experiments/groq/pilot-review.html

# Start comparison server
npm run dev
# Then: http://localhost:3000/groq-comparison
```

---

## Assessment Criteria

**Evaluate Groq plans for:**

1. **Emotional Progression** - Does the story build naturally toward a climax?
2. **Chapter Coherence** - Do grouped memories make thematic sense?
3. **Tone Match** - Does storytelling fit occasion (joyful/reflective/somber)?
4. **Finale Strength** - Is the chosen ending message powerful and appropriate?
5. **Overall Flow** - Would a real recipient feel this is better than chronological?

**Compare Against:** Deterministic Plus (chronological + basic grouping)

---

## No External Requests

**Verified:**
- ✓ Plans served from local `.experiments/groq/run-pilot/` directory
- ✓ API route only reads filesystem
- ✓ No Gemini API calls
- ✓ No Groq API calls
- ✓ No Supabase queries
- ✓ Uses only synthetic fixture data

**Network Activity:** Local dev server only (localhost:3000)

---

## Status

**Ready for manual assessment.**

Open comparison page, switch between cases, evaluate storytelling quality.

Decision: Does Groq produce more natural emotional progression and stronger endings than our current Plus logic?
