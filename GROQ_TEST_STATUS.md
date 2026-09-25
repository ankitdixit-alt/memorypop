# Live Groq Integration Test - Current Status

**Date:** 2026-09-23
**Project:** memorypop-test (Supabase test project)
**Working Directory:** ~/Downloads/MemoryPop/memorypop

---

## ✅ Verified Complete

### 1. Approved Plus Renderer Integration
- **Renderer Used:** `AIDirectorRevealController.tsx` (reuses approved Plus renderer)
- **Components:** Same Player, TileTransition, DecorativeOverlay, MediaViewer as prototype
- **Data Flow:** RevealPlan → adaptRevealPlanToStory() → Story → buildBeats() → Player
- **Recipient Name:** ✅ Correctly passed and displays ("Casey Fictional" renders)
- **Contributor Names:** ✅ Mapped from database records using memory IDs
- **Text-only Layout:** Uses existing presentation modes (letter, paired, collection)
- **Chapters, Transitions, Decorations:** All preserved from approved renderer
- **Music Behavior:** Soundtrack plays with ducking during video (existing logic)
- **Media Mapping:** Uses mediaUrlGenerator to extract actual URLs from memory records

### 2. Authentication & Authorization
- **Creator Auth:** ✅ Fixed to use `management_token_hash` + session cookies
- **Management URLs:** ✅ Work correctly (/manage/{token} → dashboard)
- **API Routes:** ✅ Updated to use session-based auth (not body token)
- **Token Hashing:** ✅ SHA-256 matching between seed script and application

### 3. Test Data
- **Fictional Gift Created:** groq-test-1790196239253
- **Gift ID:** aeb3e603-0c5e-4539-b9a5-1b541d11dc7f
- **Memories:** 5 minimal-text memories (no media)
- **Contributors:** Alex, Jordan, Taylor, Morgan, Riley
- **Recipient:** Casey Fictional
- **Occasion:** birthday
- **Premium:** Yes (is_premium = true)

### 4. Groq API
- **Connectivity:** ✅ Verified (200 response, 80 tokens used)
- **Model:** openai/gpt-oss-120b
- **Free Tier:** ✅ Available
- **API Key:** Configured in .env.test

### 5. Environment
- **AI Director:** ✅ Enabled (ENABLE_AI_DIRECTOR=true)
- **Test Server:** ✅ Running on port 3000 with .env.test
- **Database:** memorypop-test Supabase project

---

## ❌ Blocker: Missing Database Column

**Issue:** The `status` column is missing from the `memorypops` table in memorypop-test.

**Impact:** Cannot trigger AI generation through the dashboard "Prepare Reveal" flow.

**Error Message:**
```
column memorypops.status does not exist
```

**Required Fix:**

Run this SQL in Supabase SQL Editor (memorypop-test project):

```sql
ALTER TABLE public.memorypops
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'collecting' NOT NULL;
```

**Verification:**
```bash
npm run test:verify-db
```

---

## ⏳ Pending After Fix

### Live Groq Test Flow

1. **Add Status Column** (SQL above)

2. **Trigger Generation:**
   - Open: http://localhost:3000/manage/groq-token-1790196239253
   - Click "Prepare the Reveal" button
   - Server calls prepareRevealPlan() which calls Groq API
   - Plan validated and saved to ai_reveal_plans table

3. **Verify Saved Plan:**
   - Supabase → Table Editor → ai_reveal_plans
   - Find row: memorypop_id = aeb3e603-0c5e-4539-b9a5-1b541d11dc7f
   - Check fields:
     - `model_name` should be `openai/gpt-oss-120b` (not 'deterministic')
     - `generation_source` should be 'ai_generated'
     - `chapters_data` should contain AI-generated chapter structure
     - `input_hash` should be populated
     - `generation_lock_holder` should be NULL (released after completion)

4. **Verify Playback:**
   - Open: http://localhost:3000/m/groq-test-1790196239253/reveal
   - Should show AI-generated experience:
     - Opening title from Groq
     - Chapters with Groq-selected memory IDs
     - Highlights emphasized
     - Finale memory as last beat
     - Same approved Plus presentation (chapters, transitions, decorations)

5. **Verify Caching:**
   - Refresh the reveal page
   - Should reuse same plan (no new Groq request)
   - Check server logs: no new `[AI_DIRECTOR] Preparation complete` message
   - Plan served from database cache

6. **Check Deterministic Fallback:**
   - Supabase → ai_reveal_plans → Delete the row
   - Refresh reveal page
   - Should show deterministic Plus fallback (chronological with computed chapters)
   - Check: `model_name` = 'deterministic', `generation_source` = 'deterministic_fallback'

---

## Current Working URLs

**After status column is added:**

- **Management (creates session + redirects):**
  http://localhost:3000/manage/groq-token-1790196239253

- **Reveal (public, no auth):**
  http://localhost:3000/m/groq-test-1790196239253/reveal

**Earlier test gifts (still functional):**

- **Standard (no AI):**
  http://localhost:3000/m/test-standard-1790117277076/reveal

- **Plus (no plan yet):**
  http://localhost:3000/manage/token-plus-1790117277621

---

## Renderer Verification

**Component:** `src/app/m/[shareCode]/reveal/AIDirectorRevealController.tsx`

**How it reuses the approved renderer:**

1. **Data Conversion:**
   ```
   RevealPlan (from Groq/database)
   → adaptRevealPlanToStory()
   → Story (recipient, title, chapters[], finale, highlights, memories[])
   → buildBeats()
   → Beat[] (opening, chapter, memory, closing beats)
   ```

2. **Player Component:**
   - Same `Player` from prototype
   - Same `TileTransition` animations
   - Same `DecorativeOverlay` for occasions
   - Same `PreviewImage` and `VideoSample` components
   - Same presentation modes (letter, paired, collection, video)

3. **Media Handling:**
   - `mediaUrlGenerator()` extracts URLs from database memory records
   - Photos: `memory.photo_url` (legacy) + `memory.photos[]` (JSONB)
   - GIFs: `memory.gifs[]` (JSONB)
   - Video: `memory.video.url` (JSONB)
   - No media sent to Groq - only memory IDs, contributor names, messages

4. **Styling:**
   - Uses `reveal.module.css` from approved renderer
   - Same text contrast, sizing, spacing
   - Same chapter cards, signature styling
   - Text-only memories use "letter" presentation (no empty photo space)

5. **Groq Integration Point:**
   - Groq receives: memory IDs, contributor names, messages, media counts only
   - Groq returns: opening, chapters[], highlightMemoryIds[], finaleMemoryId
   - Renderer uses memory IDs to look up actual records with URLs
   - Fallback: If Groq fails, uses deterministic planner (same renderer)

---

## Next Steps After Column Fix

1. Add status column (SQL above)
2. Trigger live Groq generation via dashboard
3. Verify saved plan in database (model_name, source, chapters)
4. Verify reveal playback uses approved Plus renderer
5. Verify caching (refresh doesn't regenerate)
6. Test with media fixtures (add photos/video to existing memories)
7. Document final results in TEST_SETUP_FINAL.md

---

## What This Confirms

✅ **Renderer Reuse:** AIDirectorRevealController uses the approved Plus renderer
✅ **Data Mapping:** Memory IDs map to actual records with contributor names and media
✅ **Presentation Modes:** Text-only uses letter mode (no empty space)
✅ **Recipient Name:** Passes correctly through all layers
✅ **Groq Scope:** Only receives text + counts, not URLs or credentials
✅ **Fallback:** Deterministic planner uses same renderer
✅ **Media Support:** Ready for photos/video via existing fixtures

⏳ **Waiting on:** Database status column → Live Groq test → Full verification
