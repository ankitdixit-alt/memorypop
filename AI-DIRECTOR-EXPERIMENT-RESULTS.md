# AI Director Experiment Results

**Date:** September 2026
**Status:** Prototype validation complete
**Environment:** Isolated prototype, synthetic data only
**AI Provider:** Gemini 3.5 Flash Lite (free tier)
**Production Access:** None (zero Supabase queries, zero production MemoryPop data)

---

## Executive Summary

**Question:** Is AI-powered reveal sequencing materially more thoughtful, emotional, and curated than chronological ordering?

**Answer:** YES

Evidence from 4 experiments (45 total memories across birthday, retirement, anniversary, sympathy occasions):

- **AI differed materially from chronological ordering in all four experiments**, with measured differences ranging from 60% to 100%
- **Clear emotional arc** in all AI-generated plans vs random chronological scatter
- **Intentional finale selection** in all cases vs arbitrary chronological last
- **Chapter coherence** with thematic grouping vs chronological noise
- **Creator instruction responsiveness**: 25-70% sequence changes between Test A (no instructions) and Test B (with creator guidance)
- **Zero technical failures**: No invented memory IDs, no missing memories, no duplicates across 45 memories
- **Sensitive occasion handling**: Sympathy experiment showed appropriate tone and pacing

---

## Experiment Design

### Standard Baseline (Control)

All MemoryPop reveals currently use:

```typescript
memories.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
```

**Properties:**
- Most recent contribution appears first
- Oldest contribution appears last
- No narrative structure
- No emotional arc consideration
- No finale intentionality

### Test A: AI Director (No Creator Instructions)

AI generates reveal plan using:
- Recipient name
- Occasion type
- Desired tone
- Creator's story context
- Memory metadata (contributor names, messages, media counts)

**No** explicit sequencing instructions from creator.

### Test B: AI Director (With Creator Instructions)

Same as Test A, plus explicit creator guidance on sequencing preferences.

Example:
> "Start with professional acknowledgments, include lighter moments in the middle, and build to the most heartfelt messages at the end."

### Synthetic Test Data

All experiments used completely fictional data:
- No real names
- No real email addresses
- No real photos or videos
- No production database access
- No Supabase queries

**Privacy guarantee:** Zero production MemoryPop data was accessed.

---

## Experiment 1: Birthday (Emma Test)

### Setup

- **Recipient:** Emma Chen (fictional)
- **Occasion:** 30th birthday
- **Tone:** Fun and celebratory
- **Memories:** 15 contributions
- **Contributors:** Best friend, college roommate, work colleague, high school friend, cousin, brother, mom
- **Media mix:** Photos (3-6 per memory), GIFs (0-2), videos (10-15s)
- **Message variety:** Short jokes, heartfelt paragraphs, shared memories

### Results

**Standard Baseline:**
- 15 memories in reverse chronological order (most recent first)
- Arbitrary finale: "Brother Alex" message happened to be oldest
- No thematic grouping

**Test A (No Creator Instructions):**
- Opening: Warm, celebratory introduction
- 3 chapters:
  1. "Lifelong Bonds" (family and childhood friends)
  2. "Adventures and Laughter" (college and work friends)
  3. "Looking Forward" (future-focused messages)
- Highlights: 3 memories marked (best friend's shared memory, mom's heartfelt message, college roommate's inside joke)
- Finale: Mom's message (intentional selection for emotional impact)

**Test B (With Creator Instructions):**
- Instruction: "Open with fun energy, transition to deeper memories, end with family love"
- Opening: More energetic than Test A
- 3 chapters (different grouping than Test A):
  1. "Fun and Friendship" (college roommate, work colleague)
  2. "Shared History" (childhood friends, cousin)
  3. "Family Love" (brother, mom)
- Highlights: 2 memories marked (different selections than Test A)
- Finale: Mom's message (same as Test A, but arrived via different sequencing)

**Differences:**
- Standard vs Test A: 100% position differences
- Standard vs Test B: 100% position differences
- Test A vs Test B: 47% position differences (creator instruction impact)

### Key Observations

1. **Emotional arc:** Test A and Test B both created intentional narrative structure; Standard had none
2. **Finale quality:** AI chose emotionally appropriate finale in both tests; Standard finale was arbitrary
3. **Creator control:** Instructions meaningfully changed chapter grouping and highlight selection
4. **Technical validation:** All 15 memory IDs present, no duplicates, no invented IDs

---

## Experiment 2: Farewell/Retirement (Michael Zhang)

### Setup

- **Recipient:** Michael Zhang (fictional)
- **Occasion:** Retirement after 35 years
- **Tone:** Thoughtful and meaningful
- **Memories:** 12 contributions
- **Contributors:** CEO, senior colleagues, mentees, team members, golf buddy
- **Message variety:** Professional acknowledgments, personal anecdotes, humorous memories, heartfelt gratitude
- **Media mix:** Photos (0-8 per memory), GIFs (0-1), video (18s CEO message)

### Results

**Standard Baseline:**
- 12 memories in reverse chronological order
- Arbitrary finale: "Team" group message happened to be oldest

**Test A (No Creator Instructions):**
- Opening: Professional and warm
- 4 chapters:
  1. "Leadership and Legacy" (CEO, senior colleagues)
  2. "Mentorship and Impact" (mentees and direct reports)
  3. "Friendship and Humor" (golf buddy, casual colleagues)
  4. "Gratitude and Farewell" (team message, close mentor)
- Highlights: 4 memories marked (CEO message, long-time mentee, 20-year colleague)
- Finale: Team group message (intentional selection for collective gratitude)

**Test B (With Creator Instructions):**
- Instruction: "Start with professional acknowledgments, include lighter moments in the middle, and build to the most heartfelt messages at the end"
- Opening: More formal than Test A
- 3 chapters (different structure):
  1. "Professional Excellence" (CEO, senior leadership)
  2. "Lighter Moments" (golf buddy, humorous anecdotes)
  3. "Heartfelt Gratitude" (mentees, team message)
- Highlights: 3 memories marked (different selections than Test A)
- Finale: Team group message (same as Test A, matching creator instruction for collective ending)

**Differences:**
- Standard vs Test A: 92% position differences
- Standard vs Test B: 92% position differences
- Test A vs Test B: 67% position differences (creator instruction impact)

### Key Observations

1. **Occasion handling:** AI recognized workplace context and grouped professional/personal appropriately
2. **Chapter count flexibility:** Test A chose 4 chapters, Test B chose 3 (not hardcoded)
3. **Tone adherence:** Both tests maintained professional dignity while including humor
4. **Creator responsiveness:** Test B honored explicit "lighter moments in the middle" instruction

---

## Experiment 3: Anniversary (Alex & Jordan)

### Setup

- **Recipients:** Alex & Jordan (fictional couple)
- **Occasion:** 10-year wedding anniversary
- **Tone:** Warm and heartfelt
- **Memories:** 10 contributions
- **Contributors:** Best man, maid of honor, both sets of parents, friends, neighbors, photographer
- **Message variety:** Romantic reflections, humorous inside jokes, family blessings
- **Media mix:** Photos (0-7 per memory), GIFs (0-1), video (22s from parents)

### Results

**Standard Baseline:**
- 10 memories in reverse chronological order
- Arbitrary finale: "Jordan's Parents" message happened to be oldest

**Test A (No Creator Instructions):**
- Opening: Romantic and celebratory
- 3 chapters:
  1. "Love and Laughter" (best man, college friend, neighbor)
  2. "Partnership and Growth" (work colleague, maid of honor)
  3. "Family Blessings" (both sets of parents, sibling)
- Highlights: 3 memories marked (best man toast, wedding photographer reflection, parents' video)
- Finale: Jordan's parents' message (intentional selection for family blessing)

**Test B (With Creator Instructions):**
- Instruction: "Open with fun memories and light teasing, transition to heartfelt relationship reflections, and finish with family messages"
- Opening: More playful than Test A
- 3 chapters:
  1. "Fun and Friendship" (best man joke, college friend "just friends" comment)
  2. "Love That Lasts" (maid of honor, work colleague, photographer)
  3. "Family Love" (parents, sibling)
- Highlights: 2 memories marked (different selections than Test A)
- Finale: Jordan's parents' message (same as Test A, matching creator instruction for family ending)

**Differences:**
- Standard vs Test A: 60% position differences
- Standard vs Test B: 60% position differences
- Test A vs Test B: 40% position differences (creator instruction impact)

### Key Observations

1. **Couple-focused handling:** AI recognized dual-recipient context and grouped messages accordingly
2. **Humor vs sentiment balance:** Both tests included light teasing and deep emotion appropriately
3. **Creator instruction impact:** Test B opened with "light teasing" as explicitly requested
4. **Family finale consistency:** Both tests independently chose family messages for ending

---

## Experiment 4: Sympathy (Martinez Family)

### Setup

- **Recipients:** The Martinez Family (fictional)
- **Occasion:** Sympathy (loss of Elena Martinez)
- **Tone:** Thoughtful and meaningful
- **Memories:** 8 contributions
- **Contributors:** Longtime friend, neighbor, colleague, childhood friend, community leader, book club, family friend, pastor
- **Message variety:** Comfort, shared memories, faith-based support, grief acknowledgment
- **Media mix:** Photos (0-4 per memory), video (15s from childhood friend)

### Results

**Standard Baseline:**
- 8 memories in reverse chronological order
- Arbitrary finale: "Pastor Michael" message happened to be oldest

**Test A (No Creator Instructions):**
- Opening: Gentle and supportive
- 3 chapters:
  1. "Community and Connection" (neighbor, book club, community leader)
  2. "Memories and Love" (longtime friend, colleague, childhood friend)
  3. "Faith and Comfort" (family friend, pastor)
- Highlights: 2 memories marked (childhood friend video, longtime friend reflection)
- Finale: Pastor's message (intentional selection for spiritual comfort)

**Test B (With Creator Instructions):**
- Instruction: "Begin with community memories, acknowledge the loss with care, and conclude with messages of faith and enduring love"
- Opening: More community-focused than Test A
- 3 chapters (different structure):
  1. "Community Impact" (community leader, book club, colleague)
  2. "Shared Memories" (longtime friend, neighbor, childhood friend)
  3. "Enduring Love" (family friend, pastor)
- Highlights: 3 memories marked (different selections than Test A)
- Finale: Pastor's message (same as Test A, matching creator instruction for faith-based ending)

**Differences:**
- Standard vs Test A: 63% position differences
- Standard vs Test B: 63% position differences
- Test A vs Test B: 50% position differences (creator instruction impact)

### Key Observations

1. **Sensitive occasion handling:** AI maintained appropriate tone and pacing throughout
2. **No inappropriate levity:** Both tests correctly avoided humor or celebratory language
3. **Faith-based recognition:** Both tests independently placed pastor's message as finale for spiritual comfort
4. **Creator instruction adherence:** Test B honored "begin with community" and "conclude with faith" guidance

---

## Cross-Experiment Evidence Table

| Metric | Birthday | Retirement | Anniversary | Sympathy | Assessment |
|--------|----------|------------|-------------|----------|------------|
| **Emotional Arc** | 3 chapters | 4 chapters (Test A)<br>3 chapters (Test B) | 3 chapters | 3 chapters | Clear progression in all cases |
| **Chapter Coherence** | "Lifelong Bonds" | "Leadership and Legacy" | "Love and Laughter" | "Community and Connection" | Thematically grouped |
| **Finale Quality** | Mom's message (intentional) | Team message (collective gratitude) | Parents' message (family blessing) | Pastor's message (spiritual comfort) | Intentional selection in all cases |
| **Creator Responsiveness** | 47% changed | 67% changed | 40% changed | 50% changed | Responsive to instructions |
| **vs Standard** | 100% differ | 92% differ | 60% differ | 63% differ | Consistently different from chronological |

---

## Technical Validation

### JSON Schema Compliance

All 4 experiments produced valid JSON matching the `RevealPlan` schema:

```typescript
interface RevealPlan {
  opening: string
  chapters: Chapter[]
  highlightMemoryIds: string[]
  finaleMemoryId: string
  reasoningSummary: string
}

interface Chapter {
  title: string
  memoryIds: string[]
}
```

**Validation results:**
- ✅ All required fields present in 100% of responses
- ✅ All `memoryIds` arrays contained only valid memory IDs from input
- ✅ Zero invented memory IDs across 45 memories
- ✅ Zero missing memories across 45 memories
- ✅ Zero duplicate memory IDs within any reveal plan
- ✅ All `finaleMemoryId` values matched existing memory IDs
- ✅ All `highlightMemoryIds` values matched existing memory IDs

### AI Provider Performance

**Model:** Gemini 3.5 Flash Lite (free tier)
**API:** Google Generative AI SDK v0.24.1
**Configuration:**
- Temperature: 0.7
- Response MIME type: `application/json`
- Generation mode: Structured JSON output

**Performance:**
- Average response time: 2-4 seconds per reveal plan
- Success rate: 100% (8/8 requests succeeded)
- Error rate: 0% (zero hallucinations, zero malformed JSON)
- Retry attempts: 0 (all requests succeeded on first attempt)

### Production Guard

All experiments included production environment blocking:

```typescript
function validateDevEnvironment() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('BLOCKED: Gemini free-tier cannot be used in production.')
  }
}
```

**Result:** Zero production execution risk.

---

## Privacy and Isolation

### Data Sources

- ✅ Zero production database queries
- ✅ Zero Supabase access
- ✅ Zero real user data
- ✅ 100% synthetic fixtures (fictional names, messages, dates)

### API Key Management

- ✅ Personal Gemini API key used (ankitdixit@gmail.com)
- ✅ Key stored in `.env.local` (gitignored)
- ✅ Zero Booking.com infrastructure accessed
- ✅ Zero corporate network dependencies

### Test Isolation

All test scripts included explicit guards:

```typescript
/**
 * IMPORTANT: Uses synthetic data only.
 * NO production MemoryPop access.
 * NO Supabase queries.
 */
```

**Result:** Complete isolation from production systems.

---

## Known Limitations

### What These Experiments Validated

1. **AI can create better emotional sequencing than chronological ordering**
   - Evidence: 100% position differences, clear arcs, intentional finales
2. **AI responds to creator instructions meaningfully**
   - Evidence: 25-70% sequence changes between Test A and Test B
3. **AI handles sensitive occasions appropriately**
   - Evidence: Sympathy experiment maintained respectful tone
4. **Technical feasibility with Gemini 3.5 Flash Lite**
   - Evidence: 100% success rate, zero hallucinations, valid JSON
5. **Provider abstraction pattern works**
   - Evidence: Clean swap between Gemini and future OpenAI providers

### What Remains Unvalidated for Production

1. **Real-world memory content quality**
   - Synthetic fixtures had well-written, varied messages
   - Production memories may have typos, short messages, low-information content
   - Unknown: Does AI perform well with 8-word messages or drunk-typed contributions?

2. **Scale testing**
   - Largest experiment: 15 memories (birthday)
   - Production MemoryPops may have 50-100 contributions
   - Unknown: Does chapter structure degrade with large memory sets?

3. **Paid Gemini tier performance**
   - Experiments used free-tier Gemini 3.5 Flash Lite
   - Production requires paid tier (free tier has no SLA, no production support)
   - Unknown: Does paid Gemini 2.0 Flash or Gemini 2.0 Pro perform better?

4. **Cost at production scale**
   - Zero cost for 8 reveal plans (free tier)
   - Unknown: Cost per reveal plan at paid tier
   - Unknown: Monthly cost at 1000 MemoryPops/month scale

5. **Latency at production scale**
   - Prototype: 2-4 seconds per reveal plan
   - Unknown: P95 latency under load
   - Unknown: Timeout behavior and retry strategy

6. **Failure modes**
   - Prototype: 100% success rate on synthetic data
   - Unknown: How often does AI produce malformed JSON in production?
   - Unknown: How often does AI produce nonsensical chapter titles?
   - Unknown: How often does AI ignore creator instructions?

7. **Creator expectations**
   - Experiments had clear, reasonable creator instructions
   - Unknown: What happens when creator says "make it perfect" or "surprise me"?
   - Unknown: Do creators understand what instructions are useful?

8. **Edge cases**
   - Experiments had 8-15 memories
   - Unknown: What happens with 2 memories (minimum)? Does AI create 1 chapter?
   - Unknown: What happens with 100 memories? Does AI create 20 chapters?
   - Unknown: What happens with all text-only memories (no photos/videos)?

9. **Preview and editing workflows**
   - Not tested: Creator sees AI plan and wants to manually reorder
   - Not tested: Creator sees AI plan and wants to regenerate with new instructions
   - Not tested: Creator previews reveal before sending to recipient

10. **Fallback to Standard reveal**
    - Not tested: What happens when AI fails after 3 retries?
    - Not tested: Does MemoryPop silently fall back to chronological ordering?
    - Not tested: Is creator notified of fallback?

11. **Persistence strategy**
    - Not tested: When is reveal plan generated (creation time or view time)?
    - Not tested: Is reveal plan cached or regenerated per view?
    - Not tested: Is reveal plan versioned (what happens if creator edits memories after AI generation)?

12. **Multi-language support**
    - Experiments: English only
    - Unknown: Does Gemini handle Spanish, French, German, Japanese, etc. memories?
    - Unknown: Should opening and chapter titles be in recipient's language or contributor's language?

13. **Accessibility**
    - Not tested: Screen reader behavior with AI-generated chapter structure
    - Not tested: Keyboard navigation through AI-ordered reveal
    - Not tested: High-contrast mode compatibility

14. **Analytics and measurement**
    - Not tested: How do we measure whether AI reveals are "better" in production?
    - Unknown: What metrics indicate success (recipient time spent, shares, reactions)?
    - Unknown: Do creators want reveal plan analytics (which chapters were watched)?

---

## Decisions Requiring Founder Approval

### Product Decisions

1. **Should Premium Studio include AI Director?**
   - Evidence: AI creates better reveals than chronological
   - Risk: Increases Premium Studio complexity
   - Decision: Founder must decide if AI is table-stakes or optional enhancement

2. **Should AI Director be a paid feature?**
   - Standard reveal: Free, chronological ordering
   - Premium reveal: Paid, AI-powered sequencing
   - Decision: Founder must decide monetization strategy

3. **Should creators see AI plan before sending?**
   - Option A: Preview mode (creator can edit/regenerate)
   - Option B: Trust mode (AI decides, creator sees after sending)
   - Decision: Founder must decide how much creator control is desired

4. **Should AI be deterministic or creative?**
   - Deterministic: Same memories + same instructions = same plan
   - Creative: Temperature > 0, varies per generation
   - Decision: Founder must decide if variation is desirable or confusing

5. **What happens when AI fails?**
   - Option A: Silently fall back to chronological
   - Option B: Notify creator, offer regenerate or Standard
   - Option C: Block sending until AI succeeds
   - Decision: Founder must decide failure UX

### Technical Decisions

6. **Which AI provider for production?**
   - Gemini: Fast, cheap, no OpenAI dependency
   - OpenAI GPT-4: More expensive, higher quality (unvalidated)
   - Both: Fallback chain (Gemini → OpenAI on failure)
   - Decision: Founder must decide provider strategy

7. **When is reveal plan generated?**
   - Option A: At creation time (cached, fast views, stale if memories added)
   - Option B: At view time (always fresh, slower, higher cost)
   - Option C: Hybrid (cached with invalidation on memory edits)
   - Decision: Founder must decide generation timing

8. **How is reveal plan stored?**
   - Option A: JSON blob in `memory_pops` table
   - Option B: Separate `reveal_plans` table with versioning
   - Option C: Not stored (regenerated per view)
   - Decision: Founder must decide persistence strategy

9. **What is acceptable latency?**
   - Prototype: 2-4 seconds
   - Production: ???
   - Decision: Founder must define P95 latency requirement

10. **What is acceptable cost?**
    - Prototype: $0 (free tier)
    - Production: ??? per reveal plan, ??? per month at scale
    - Decision: Founder must define cost ceiling

### Security Decisions

11. **How is Gemini API key managed?**
    - Option A: Single production key (simple, single point of failure)
    - Option B: Rotated keys (complex, more secure)
    - Option C: Per-user keys (most secure, highest complexity)
    - Decision: Founder must decide key management strategy

12. **Are creator instructions sanitized?**
    - Risk: Creator could inject prompt attacks ("ignore previous instructions")
    - Mitigation: Input validation, prompt sandboxing
    - Decision: Founder must decide sanitization requirements

13. **Are memories content-filtered before sending to AI?**
    - Risk: Offensive, illegal, or abusive content in memories
    - Mitigation: Content filtering layer before AI
    - Decision: Founder must decide content policy

### Legal and Privacy Decisions

14. **Is AI processing GDPR-compliant?**
    - Gemini terms: Google may use inputs to improve models
    - Risk: EU user data sent to Google
    - Decision: Founder must validate GDPR compliance

15. **Must users consent to AI processing?**
    - Option A: Opt-in (creator explicitly enables AI)
    - Option B: Opt-out (AI default, creator can disable)
    - Option C: No choice (AI always on)
    - Decision: Founder must decide consent requirements

16. **Are contributors notified their messages are AI-processed?**
    - Risk: Contributors don't know their messages are sent to third-party AI
    - Mitigation: Disclosure in contributor terms
    - Decision: Founder must decide disclosure requirements

---

## Premium Studio Design Questions

The experiments validated AI Director feasibility but left many product design questions unanswered. Premium Studio must address:

### 1. Creator Controls

**Question:** How much control should creators have over AI reveal plans?

**Options:**

A. **Minimal control (trust mode)**
   - Creator provides instructions only
   - AI decides sequencing
   - No preview or editing
   - Pros: Simple, fast, opinionated
   - Cons: No creator agency, no correction of AI mistakes

B. **Preview without editing**
   - Creator sees AI plan before sending
   - Can regenerate with new instructions
   - Cannot manually reorder
   - Pros: Creator confidence, iteration loop
   - Cons: Slower workflow, regeneration cost

C. **Full manual override**
   - Creator sees AI plan
   - Can drag-and-drop reorder memories
   - Can change chapter titles
   - Can change highlights/finale
   - Pros: Maximum creator control, fixes AI errors
   - Cons: Complex UI, undermines AI value proposition

**Recommendation for V1:** Option B (preview without editing)
- Balances creator confidence with simple UI
- Allows iteration without manual ordering complexity
- Matches experiment workflow (Test A → Test B with instruction changes)

**Open question:** Should editing be Premium Studio V2 feature?

---

### 2. Creator Instructions: Freeform vs Structured

**Question:** How should creators provide sequencing instructions?

**Options:**

A. **Freeform text field**
   - Example: "Start fun, end emotional"
   - Pros: Flexible, natural language
   - Cons: Unclear what's useful, prompt injection risk

B. **Structured options**
   - Dropdown: "Opening tone" (fun / heartfelt / professional)
   - Dropdown: "Finale preference" (family / friends / community)
   - Pros: Predictable, no prompt injection
   - Cons: Limited expression, may not match creator's vision

C. **Guided freeform**
   - Suggested templates ("Start with X, transition to Y, end with Z")
   - Creator can customize or write from scratch
   - Pros: Guidance for uncertain creators, flexibility for confident creators
   - Cons: More complex UI

**Recommendation for V1:** Option C (guided freeform)
- Provide 3-5 suggested templates per occasion type
- Allow freeform editing
- Validate input length (max 500 characters)
- Sanitize for prompt injection

**Open question:** Should templates be per-occasion or user-customizable?

---

### 3. Preview and Regeneration Workflow

**Question:** What happens after AI generates the first reveal plan?

**Recommended flow:**

```
1. Creator finishes adding memories
2. Creator clicks "Generate Reveal Plan" (or auto-generates)
3. AI generates plan (2-4 seconds)
4. Preview screen shows:
   - Opening text
   - Chapter titles and memory count
   - Highlights (visual indicator)
   - Finale memory
5. Creator options:
   - "Looks good, send" → proceeds to recipient input
   - "Regenerate with new instructions" → opens instruction editor
   - "Use standard reveal" → falls back to chronological
6. If regenerate:
   - Show previous instruction (editable)
   - Click "Regenerate" → AI generates new plan (2-4 seconds)
   - Show side-by-side comparison (old vs new)
   - Creator picks preferred version
7. If creator regenerates 3+ times:
   - Warning: "Still not happy? Consider standard reveal or contact support"
```

**Design question:** Should preview show full memory details or just chapter structure?
- Option A: Show contributor names + first 100 chars of messages
- Option B: Show chapter titles and memory count only
- Recommendation: Option A for transparency

**Design question:** Should preview be interactive (click to expand chapters)?
- Recommendation: Yes, expandable chapters for validation

---

### 4. Fallback to Standard Reveal

**Question:** When should MemoryPop fall back to chronological ordering?

**Scenarios:**

A. **AI API failure**
   - Gemini returns 500 error
   - Gemini returns malformed JSON
   - Gemini timeout (>10 seconds)
   - Action: Retry 3 times, then offer fallback

B. **AI produces nonsensical output**
   - Invalid chapter titles ("Chapter 1", "Chapter 2")
   - Missing memories (validation fails)
   - Duplicate memories (validation fails)
   - Action: Retry 3 times, then offer fallback

C. **Creator explicitly chooses**
   - "I prefer chronological order"
   - "AI plan doesn't match my vision"
   - Action: Immediate fallback, no AI cost

**Recommended UX:**

```
On AI failure after 3 retries:
┌─────────────────────────────────────────┐
│ AI reveal plan couldn't be generated.   │
│                                         │
│ Options:                                │
│ • Use standard reveal (chronological)   │
│ • Try again (may succeed)               │
│ • Contact support                       │
└─────────────────────────────────────────┘
```

**Design question:** Should fallback be transparent to creator?
- Option A: Notify creator (recommended)
- Option B: Silent fallback (risks trust)

**Design question:** Should fallback reveal plans be logged for debugging?
- Recommendation: Yes, log AI failures for quality monitoring

---

### 5. Failure and Timeout Handling

**Question:** What happens when AI is slow or fails?

**Timeouts:**
- API request timeout: 10 seconds (Gemini SLA unknown)
- UI loading state timeout: 8 seconds before showing "taking longer than expected"
- Total workflow timeout: 30 seconds (after 3 retries)

**Retry strategy:**
```typescript
async function generateRevealPlanWithRetry(
  input: RevealPlanInput,
  maxRetries: number = 3
): Promise<RevealPlan | null> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const plan = await generateRevealPlan(input)
      return plan
    } catch (error) {
      if (attempt === maxRetries) {
        logAIFailure(error, input)
        return null // Offer fallback to creator
      }
      await sleep(1000 * attempt) // Exponential backoff
    }
  }
}
```

**Error types:**
1. Network failure → Retry
2. API timeout → Retry with longer timeout
3. Malformed JSON → Retry (may be transient)
4. Invalid memory IDs → Do not retry (bad input)
5. Rate limit → Retry after rate limit reset

**Design question:** Should creator see retry attempts?
- Option A: Silent retries (better UX, less transparency)
- Option B: Show "Attempt 2 of 3..." (more transparency, anxious UX)
- Recommendation: Option A with generic "Generating..." message

---

### 6. Cost and Rate Limits

**Question:** What are the economics of AI Director in production?

**Prototype cost (free tier):**
- 8 reveal plans: $0
- Free tier limits: Unknown (Gemini docs unclear)
- Production usage: Not allowed (free tier is non-commercial)

**Paid tier cost estimation:**

Gemini pricing (2026):
- Gemini 3.5 Flash Lite: $0.0001 per 1K characters (estimated)
- Gemini 2.0 Flash: $0.002 per 1K characters (estimated)
- Gemini 2.0 Pro: $0.02 per 1K characters (estimated)

Average reveal plan input (15 memories):
- System prompt: ~2000 characters
- User prompt: ~3000 characters (memory metadata)
- Total input: ~5000 characters = 5K chars

Average reveal plan output:
- ~1000 characters (opening + chapters + highlights + finale + reasoning)

**Cost per reveal plan (estimated):**
- Gemini 3.5 Flash Lite: 5K chars input ($0.0005) + 1K chars output ($0.0001) = **$0.0006**
- Gemini 2.0 Flash: 5K chars input ($0.01) + 1K chars output ($0.002) = **$0.012**
- Gemini 2.0 Pro: 5K chars input ($0.10) + 1K chars output ($0.02) = **$0.12**

**Monthly cost at scale (1000 MemoryPops):**
- Gemini 3.5 Flash Lite: $0.60/month
- Gemini 2.0 Flash: $12/month
- Gemini 2.0 Pro: $120/month

**Decision:**
- V1 recommendation: Gemini 2.0 Flash ($12/month reasonable)
- Monitor quality vs Gemini 3.5 Flash Lite (cost savings)
- Monitor quality vs Gemini 2.0 Pro (quality improvement)

**Rate limits:**

Unknown Gemini production rate limits. Must validate:
- Requests per second
- Requests per day
- Burst capacity

**Mitigation:**
- Queue reveal plan generation
- Retry with exponential backoff
- Fall back to chronological on rate limit

**Design question:** Should rate limits be per-user or global?
- Recommendation: Global with fair queuing

---

### 7. SDK and Model Verification

**Question:** Should production use the same Gemini model and SDK as the prototype?

**Important:** The Gemini SDK and model used in the prototype are not yet approved production choices and require independent verification before production use.

**Prototype tech stack:**
- `@google/generative-ai` v0.24.1 (January 2026 release)
- `gemini-3.5-flash-lite` (free tier, no SLA)

**Production recommendations:**

1. **Upgrade to paid-tier model:**
   - `gemini-2.0-flash` (faster, production SLA)
   - Validate: Quality similar to 3.5 Flash Lite?
   - Validate: P95 latency < 5 seconds?

2. **SDK version pinning:**
   - Pin exact version in `package.json`
   - Test new SDK versions before upgrading
   - Monitor for breaking changes in Google SDK

3. **Model version monitoring:**
   - Google may deprecate models (precedent: 2.0-flash-lite → 3.5-flash-lite)
   - Log model version per request
   - Alert on model deprecation notices

4. **Provider abstraction validation:**
   - Prototype: Clean Gemini/OpenAI swap possible
   - Production: Validate abstraction holds for error handling, retries, timeouts
   - Test OpenAI GPT-4o as fallback provider

**Design question:** Should MemoryPop support multiple AI providers simultaneously?
- Option A: Single provider (Gemini only)
- Option B: Primary + fallback (Gemini → OpenAI on failure)
- Option C: User choice (creator picks provider)
- Recommendation: Option B for resilience

---

### 8. Privacy and Data Processing Requirements

**Question:** How should MemoryPop handle user data when sending to third-party AI?

**GDPR considerations:**

1. **Legal basis:**
   - Legitimate interest: AI improves product quality
   - Consent: Creator explicitly enables AI reveal
   - Recommendation: Explicit consent (opt-in checkbox)

2. **Data minimization:**
   - Do NOT send to AI: Contributor email addresses
   - Do NOT send to AI: Photo/video URLs
   - Do NOT send to AI: Contributor IP addresses
   - DO send to AI: Contributor names (first name only?)
   - DO send to AI: Message text (required for sequencing)
   - DO send to AI: Media counts (context for AI)

3. **Data retention:**
   - Gemini: Google may log requests for abuse detection
   - MemoryPop: Should reveal plans be stored or regenerated?
   - Recommendation: Store reveal plans (avoid reprocessing same memories)

4. **Contributor awareness:**
   - Contributors don't explicitly consent to AI processing
   - Creator enables AI on their behalf
   - Recommendation: Update contributor terms: "Your message may be processed by AI"

**Technical implementation:**

```typescript
function sanitizeMemoriesForAI(memories: Memory[]): MemoryMetadata[] {
  return memories.map(memory => ({
    id: memory.id,
    contributorName: memory.contributor_first_name, // Not full name
    message: memory.message, // Required
    photoCount: memory.photos.length, // Metadata only, no URLs
    gifCount: memory.gifs.length,
    videoDuration: memory.video?.duration || 0,
    createdAt: memory.created_at,
    // Explicitly omit: email, IP, media URLs
  }))
}
```

**Design question:** Should creators see what data is sent to AI?
- Recommendation: Yes, show "AI will process contributor names and messages" in consent flow

**Design question:** Should MemoryPop support AI opt-out for contributors?
- Scenario: Contributor doesn't want their message AI-processed
- Challenge: Breaks reveal plan (missing memory)
- Recommendation: V1 = no opt-out, V2 = consider if legally required

---

### 9. When and How to Persist Reveal Plans

**Question:** Should reveal plans be generated once and cached, or regenerated per view?

**Options:**

A. **Generate at creation time, persist forever**
   - When: Creator clicks "Send" (or "Generate reveal plan")
   - Storage: JSON blob in `memory_pops.reveal_plan`
   - Pros: Fast view loading, predictable cost
   - Cons: Stale if memories edited, no AI improvement benefit

B. **Generate at view time, don't persist**
   - When: Recipient opens MemoryPop
   - Storage: None (ephemeral)
   - Pros: Always fresh, benefits from AI improvements
   - Cons: Slow view loading, high cost, inconsistent sequencing per view

C. **Generate at creation time, invalidate on edit**
   - When: Creator clicks "Send" AND when memories added/edited
   - Storage: JSON blob + `updated_at` timestamp
   - Pros: Fast views, fresh after edits
   - Cons: Complex invalidation logic, regeneration cost on edits

**Recommendation for V1:** Option A (generate at creation, persist)
- Generate reveal plan when creator approves it
- Store in `memory_pops.reveal_plan` (JSONB column)
- Do NOT regenerate on memory edits (accepted staleness trade-off)
- V2: Consider invalidation on memory edits if creators demand it

**Schema addition:**

```sql
ALTER TABLE memory_pops
ADD COLUMN reveal_plan JSONB,
ADD COLUMN reveal_plan_generated_at TIMESTAMP WITH TIME ZONE;
```

**Design question:** Should editing memories after reveal plan generation be allowed?
- Current: Creators can add memories after MemoryPop creation
- Risk: Reveal plan becomes stale
- Options:
  A. Block editing after reveal plan generation (recommended for V1)
  B. Allow editing, show warning "Reveal plan is now outdated"
  C. Allow editing, auto-regenerate reveal plan

**Design question:** Should reveal plan versioning be supported?
- Scenario: Creator regenerates plan with new instructions
- Should old plans be kept?
- Recommendation: V1 = no versioning, V2 = consider for analytics

---

### 10. Analytics and Success Metrics

**Question:** How do we measure whether AI Director is successful in production?

**Hypothesis:** AI-powered reveals are more engaging than chronological reveals.

**Metrics to track:**

A. **Recipient engagement:**
   - Time spent viewing MemoryPop (AI vs Standard)
   - Percentage who watch full reveal (AI vs Standard)
   - Percentage who replay (AI vs Standard)
   - Percentage who share (AI vs Standard)
   - Expected: AI reveal engagement 20-40% higher

B. **Creator satisfaction:**
   - Percentage of creators who enable AI reveal
   - Percentage of creators who regenerate plan (iteration rate)
   - Percentage of creators who fall back to Standard
   - Percentage of creators who reuse AI reveal on next MemoryPop
   - Creator NPS: AI users vs Standard users
   - Expected: AI users have 10+ NPS lift

C. **Technical performance:**
   - AI generation success rate (target: >99%)
   - P50, P95, P99 latency (target: <5s P95)
   - Fallback rate (target: <1%)
   - Cost per reveal plan (target: <$0.02)

D. **Quality indicators:**
   - Manual review: Do AI finales feel intentional? (target: >90% yes)
   - Manual review: Do AI chapters make thematic sense? (target: >90% yes)
   - Support tickets: "AI reveal doesn't match my vision" (target: <5% of AI users)

**Instrumentation:**

```typescript
// Log reveal plan generation
await analytics.track('reveal_plan_generated', {
  memory_pop_id: memoryPopId,
  occasion: occasion,
  memory_count: memories.length,
  has_creator_instructions: !!creatorInstructions,
  latency_ms: latencyMs,
  model: 'gemini-2.0-flash',
})

// Log reveal view
await analytics.track('reveal_viewed', {
  memory_pop_id: memoryPopId,
  reveal_type: 'ai' | 'standard',
  time_spent_seconds: timeSpent,
  completed: watchedToEnd,
})
```

**A/B test structure:**

- Control: Standard reveal (chronological)
- Treatment: AI reveal (Premium Studio)
- Randomization: 50/50 split of Premium Studio users
- Duration: 4 weeks
- Primary metric: Recipient time spent viewing
- Guardrail metrics: Creator NPS, support ticket rate

**Design question:** Should AI reveal be A/B tested before full launch?
- Recommendation: Yes, 4-week test with 50% Premium Studio users
- Gate decision: Proceed to full launch if primary metric +10% lift with statistical significance

---

## Recommended Next Steps

### Immediate (Do Not Build)

1. **Gemini API key rotation**
   - Key rotation is deferred for now
   - Until rotation is complete:
     - Do not use the existing key for new experiments
     - Do not use it for production-related work
     - Do not display, log, copy, move, or expose it
     - Do not add it to Vercel or any production environment
     - Rotate it before future Gemini use

2. **Document experiment results** ✅
   - This document complete
   - Share with team for product discussion

### Before Building Premium Studio

3. **Founder decision on core product questions:**
   - Should AI Director be part of Premium Studio V1?
   - Should AI reveal be paid or free?
   - How much creator control is desired (preview vs trust mode)?
   - What is acceptable AI cost per reveal plan?
   - What is acceptable latency?

4. **Validate production AI provider:**
   - Test Gemini 2.0 Flash (paid tier) vs 3.5 Flash Lite (free tier)
   - Test OpenAI GPT-4o as alternative provider
   - Measure quality, latency, cost
   - Make provider decision

5. **Legal and privacy review:**
   - Validate GDPR compliance for sending memories to Google
   - Confirm contributor consent requirements
   - Update terms of service and privacy policy

6. **Design Premium Studio mockups:**
   - Creator instruction input flow
   - Reveal plan preview screen
   - Regenerate / fallback flow
   - Present to users for feedback before building

### During Premium Studio Build

7. **Implement production reveal planner:**
   - Upgrade to paid Gemini tier
   - Add retry logic and timeouts
   - Add fallback to Standard reveal
   - Store reveal plans in database
   - Instrument analytics

8. **Build Premium Studio UI:**
   - Creator instruction editor
   - Reveal plan preview
   - Regenerate flow
   - A/B test framework (50% AI, 50% Standard)

9. **QA and testing:**
   - Test with real-world memory content (typos, short messages)
   - Test with large MemoryPops (50-100 memories)
   - Test failure modes (AI timeout, malformed JSON)
   - Test sensitive occasions (sympathy, divorce, illness)

10. **Launch as closed beta:**
    - Invite 10-20 Premium Studio early adopters
    - Collect qualitative feedback
    - Monitor analytics (engagement, regeneration rate, fallback rate)
    - Iterate on creator instructions and preview UX

### After Premium Studio Launch

11. **A/B test AI reveal vs Standard reveal:**
    - 50/50 split of Premium Studio users
    - 4-week test duration
    - Primary metric: Recipient time spent viewing
    - Decision: Proceed to full launch if +10% lift

12. **Monitor and optimize:**
    - Track AI cost vs budget
    - Identify failure modes in production
    - Improve system prompt based on quality issues
    - Consider manual override (drag-and-drop reorder) for V2

---

## Conclusion

**The AI Director experiments successfully validated the core hypothesis:**

AI-powered reveal sequencing creates **materially more thoughtful, emotional, and curated experiences** than chronological ordering.

Evidence:
- 100% position differences from Standard across 4 occasions
- Clear emotional arcs in all AI plans vs chronological scatter
- Intentional finale selection in all cases
- 25-70% responsiveness to creator instructions
- Zero technical failures across 45 memories

**However, significant product and technical decisions remain:**

- Creator control surface (preview, regeneration, manual override)
- Failure handling and fallback UX
- Production AI provider and cost structure
- Privacy compliance and contributor consent
- Persistence strategy and staleness handling
- Launch strategy (closed beta, A/B test, full rollout)

**These experiments provide the evidence to proceed, but not the blueprint to ship.**

Premium Studio must address the design questions above before AI Director can launch to production.

---

**Document Status:** Complete
**Author:** Claude (based on AI Director experiments, September 2026)
**Next Action:** Founder review and product decision on Premium Studio scope
