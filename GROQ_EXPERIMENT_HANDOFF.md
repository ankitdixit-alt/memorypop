# Groq AI Director Experiment - Implementation Handoff

**Date:** September 16, 2026
**Status:** Ready for execution and manual evaluation
**Environment:** Local development only, synthetic data
**API Provider:** Groq (Free tier)

---

## What Was Implemented

### 1. Groq Provider (`src/lib/ai/providers/groq.ts`)

Production-capable provider implementation using Groq's OpenAI-compatible API:

- **Model:** `openai/gpt-oss-120b` (free tier model)
- **JSON Mode:** Force valid JSON output via `response_format`
- **Same Prompts:** Uses identical system/user prompts as Gemini for fair comparison
- **Same Validation:** Uses shared validation layer from `src/lib/ai/validation.ts`
- **Development Guard:** Blocks production usage
- **Environment Variable:** Reads `GROQ_API_KEY` from `.env.local`
- **No Media Upload:** Only sends text (messages, names, metadata)

### 2. Experiment Runner (`scripts/groq-experiment.ts`)

Automated experiment execution with quota awareness:

- **8 Test Cases:** 4 occasions × 2 modes (with/without creator instructions)
  - Birthday (Test A & B)
  - Retirement (Test A & B)
  - Anniversary (Test A & B)
  - Sympathy (Test A & B)
- **Up to 3 Repetitions** per case for consistency checking
- **Budget Limit:** Max 24 attempts (configurable)
- **Timeout:** 30 second timeout per request
- **Quota Handling:** Gracefully stops on quota exhaustion, allows resuming
- **Result Storage:** Saves every attempt (success and failure) to `.experiments/groq/`
- **Manifest Tracking:** Tracks overall progress and completion status
- **Same Fixtures:** Uses identical synthetic data as Gemini experiments

### 3. Comparison Tool (`scripts/groq-compare.ts`)

Generates local HTML comparison UI:

- **Side-by-Side View:** Shows all plan repetitions for each case
- **Rating Interface:** 1-5 scales for emotional progression, chapter coherence, finale quality, instruction adherence, tone
- **Overall Assessment:** Better/Comparable/Worse/Unsure
- **Comments Field:** Free-text feedback per case
- **Local Storage:** Saves ratings locally (no server required)
- **Gemini Limitation Notice:** Clearly states original Gemini JSONs not available

### 4. Offline Validator (`scripts/validate-groq-results.ts`)

Comprehensive validation checking:

- **Structural Validation:**
  - All memories included exactly once
  - No duplicate IDs
  - No invented IDs
  - Finale exists and appears once
  - Highlights reference valid memories
- **Error Classification:**
  - Quota errors
  - Timeouts
  - Validation failures
  - Parse errors
  - Network errors
- **Quality Checks:**
  - Opening length (max 200 chars)
  - Chapter title length (max 60 chars)
  - Empty chapters
  - Finale placement
- **Summary Report:** Success rates, error breakdown, category analysis

---

## Experiment Configuration

### Same Inputs as Gemini

| Case | Occasion | Memories | Creator Instructions |
|------|----------|----------|---------------------|
| birthday-test-a | Birthday (Emma) | 15 | None |
| birthday-test-b | Birthday (Emma) | 15 | "Open with fun energy, transition to deeper memories, end with family love" |
| retirement-test-a | Retirement (Michael) | 12 | None |
| retirement-test-b | Retirement (Michael) | 12 | "Start with professional acknowledgments, include lighter moments in the middle, and build to the most heartfelt messages at the end" |
| anniversary-test-a | Anniversary (Alex & Jordan) | 10 | None |
| anniversary-test-b | Anniversary (Alex & Jordan) | 10 | "Open with fun memories and light teasing, transition to heartfelt relationship reflections, and finish with family messages" |
| sympathy-test-a | Sympathy (Martinez Family) | 8 | None |
| sympathy-test-b | Sympathy (Martinez Family) | 8 | "Begin with community memories, acknowledge the loss with care, and conclude with messages of faith and enduring love" |

### Provider Settings

**Groq (This Experiment):**
- Model: `openai/gpt-oss-120b`
- Temperature: 0.7
- Max tokens: 2048
- JSON mode: Enabled
- System prompt: AI Director v1 (shared with Gemini)

**Gemini (Historical):**
- Model: `gemini-3.5-flash-lite`
- Temperature: 0.7
- Max tokens: 2048
- JSON mode: Enabled (`responseMimeType: 'application/json'`)
- System prompt: AI Director v1 (identical)

### Unavoidable Differences

1. **Model Architecture:** Groq uses different underlying model than Gemini
2. **API Implementation:** Different providers may parse prompts differently
3. **No Direct Gemini JSON:** Cannot compare exact JSON structures (originals not saved)

---

## How to Run the Experiment

### Prerequisites

1. **Get Groq API Key:**
   ```bash
   # Visit: https://console.groq.com/keys
   # Create free account
   # Generate API key
   ```

2. **Configure Environment:**
   ```bash
   cd ~/Downloads/MemoryPop/memorypop

   # Add to .env.local (create if needed):
   echo "GROQ_API_KEY=your_key_here" >> .env.local

   # NEVER commit .env.local - already in .gitignore
   ```

3. **Verify Setup:**
   ```bash
   # Check if key is loaded (will not print the key)
   npm run groq-experiment
   # If key missing, you'll see setup instructions
   ```

### Step 1: Run Experiment

```bash
npm run groq-experiment
```

**What happens:**
- Runs up to 24 generation attempts
- 3 repetitions per case (8 cases × 3 = 24 total)
- Saves every result to `.experiments/groq/`
- Creates manifest with progress tracking
- Stops gracefully if quota exhausted

**Expected output:**
```
🔬 Groq AI Director Experiment
==============================

📊 Configuration:
   Cases: 8
   Repetitions per case: 3
   Max total attempts: 24
   Timeout: 30000ms

📝 Case: birthday-test-a
   Occasion: birthday
   Memories: 15
   Instructions: No
   → Repetition 1...
     ✓ Success (2341ms, 1024 tokens)
   → Repetition 2...
     ✓ Success (2198ms, 987 tokens)
   ...
```

**If quota exhausted:**
```
⚠️  Quota exhausted - stopping experiment
   Completed: 12/24
   Resume after quota reset with: npm run groq-experiment
```

### Step 2: Validate Results

```bash
npm run groq-validate
```

**What this checks:**
- All memories included exactly once
- No invented IDs
- No duplicate IDs
- Finale appears once in sequence
- Highlights reference valid memories
- Opening/chapter titles within length limits
- Error type classification correct

**Expected output:**
```
=====================================================
Groq Experiment Validation Report
=====================================================

📊 Overall Statistics:
   Total results: 24
   Successful: 23
   Failed: 1

❌ Failure Breakdown:
   timeout: 1

✅ No validation issues found

📈 Success Rate by Case:
   birthday-test-a: 3/3 (100%)
   birthday-test-b: 3/3 (100%)
   retirement-test-a: 3/3 (100%)
   ...

✅ All results valid - experiment ready for manual review
```

### Step 3: Generate Comparison UI

```bash
npm run groq-compare
```

**What this creates:**
- `.experiments/groq/comparison.html`
- Side-by-side view of all plans
- Rating interface for manual evaluation

**Expected output:**
```
📊 Generating Groq Experiment Comparison...

✓ Comparison HTML generated
  /path/to/.experiments/groq/comparison.html

📖 Open in browser:
   open .experiments/groq/comparison.html

📊 Results summary:
   Total attempts: 24
   Successful: 23
   Failed: 1
   Success rate: 96%
```

### Step 4: Manual Evaluation

```bash
open .experiments/groq/comparison.html
```

**Rate each plan on:**
1. **Emotional Progression** (1-5): Does the story build naturally?
2. **Chapter Coherence** (1-5): Do memories in each chapter relate thematically?
3. **Finale Quality** (1-5): Is the last memory emotionally appropriate?
4. **Creator Instruction Adherence** (1-5, Test B only): Did AI follow explicit guidance?
5. **Appropriate Tone** (1-5): Does the plan respect the occasion?
6. **Overall Assessment:** Better / Comparable / Worse / Unsure

**Important:**
- A different order ≠ automatically better story
- Evaluate narrative quality, not just reorder percentage
- Compare across repetitions for consistency
- Add comments explaining your assessment

**Ratings saved locally** in browser localStorage.

---

## Critical Limitations

### 1. No Direct Gemini JSON Comparison

**Issue:** Original Gemini JSON responses were not saved from previous experiments.

**Impact:**
- Cannot compare exact JSON structures
- Cannot measure position difference percentages
- Cannot compare token usage or latency directly
- Cannot verify identical handling of edge cases

**What We Have:**
- Documented patterns from AI-DIRECTOR-EXPERIMENT-RESULTS.md
- Experiment structure (Test A/B, creator instructions)
- Same synthetic fixtures
- Same prompts
- Same validation rules

**Mitigation:**
- This experiment evaluates Groq output quality independently
- Can compare patterns (chapter count, finale selection strategies)
- Can verify correctness (all memories included, no invented IDs)
- Manual evaluation focuses on narrative quality

### 2. Model Availability

**Current Status (Sep 2026):**
- Model `openai/gpt-oss-120b` used based on user's specification
- **NOT VERIFIED:** Actual availability and structured output support

**Risk:**
- Model may not be available on Groq Free tier
- Model may not support JSON mode
- Model may have different capabilities than documented

**Fallback:**
- If model unavailable, experiment will fail with clear error
- User can update model name in `src/lib/ai/providers/groq.ts`
- Check Groq docs: https://console.groq.com/docs/models

### 3. Free Tier Quota

**Groq Free Tier Limits (typical):**
- ~100 requests per day
- Rate limits may apply
- Quota resets daily

**Impact:**
- May not complete all 24 attempts in one session
- Experiment runner handles graceful pause
- Can resume after quota reset

**Mitigation:**
- Budget limit prevents infinite retries
- Resume capability allows continuing next day
- Progress saved after each attempt

### 4. No Production Integration

**What This Is:**
- Local synthetic evaluation only
- Saved results comparison tool
- Manual rating interface

**What This Is NOT:**
- Production-ready provider
- Customer-facing feature
- Automated A/B test
- Real-time API integration

**Next Steps for Production:**
- Would need: plan persistence, entitlement checks, rollout strategy, monitoring
- Out of scope for this experiment

---

## File Structure

```
memorypop/
├── src/lib/ai/
│   ├── providers/
│   │   ├── gemini.ts              # Existing Gemini provider
│   │   └── groq.ts                # NEW: Groq provider
│   ├── validation.ts              # Shared validation (unchanged)
│   └── types.ts                   # Shared types (unchanged)
├── scripts/
│   ├── groq-experiment.ts         # NEW: Experiment runner
│   ├── groq-compare.ts            # NEW: Comparison UI generator
│   ├── validate-groq-results.ts   # NEW: Offline validator
│   └── fixtures/
│       ├── premiumRevealFixture.ts     # Birthday fixture (unchanged)
│       ├── farewellFixture.ts          # Retirement fixture (unchanged)
│       ├── anniversaryFixture.ts       # Anniversary fixture (unchanged)
│       └── sympathyFixture.ts          # Sympathy fixture (unchanged)
├── .experiments/groq/              # NEW: Results directory
│   ├── manifest.json               # Progress tracking
│   ├── comparison.html             # Generated comparison UI
│   └── [result files].json         # Individual attempt results
├── package.json                    # Updated with new scripts
├── GROQ_EXPERIMENT_HANDOFF.md      # This file
└── .env.local                      # Contains GROQ_API_KEY (never commit)
```

---

## Preservation of Production Code

### No Changes To:
- ✅ Production reveal routes (`/m/[shareCode]/reveal`)
- ✅ Standard reveal implementation
- ✅ Plus/Premium rendering (deterministic planner)
- ✅ Supabase Storage/RLS
- ✅ Authentication, payments, entitlements
- ✅ Upload validation or limits
- ✅ Existing Gemini provider
- ✅ Development guards on preview routes
- ✅ Any customer-facing features

### Development Only:
- ⚠️ Groq provider has same development guards as Gemini
- ⚠️ Experiment scripts are command-line only
- ⚠️ Results directory (`.experiments/`) not in Git
- ⚠️ API keys in `.env.local` never committed

---

## Quick Reference

### Commands
```bash
# Run experiment (requires GROQ_API_KEY in .env.local)
npm run groq-experiment

# Validate all results
npm run groq-validate

# Generate comparison UI
npm run groq-compare

# Open comparison in browser
open .experiments/groq/comparison.html
```

### Environment Setup
```bash
# Get API key: https://console.groq.com/keys
# Add to .env.local:
echo "GROQ_API_KEY=your_key_here" >> .env.local
```

### Expected Files After Experiment
```
.experiments/groq/
├── manifest.json                  # Experiment progress
├── comparison.html                # Comparison UI
├── birthday-test-a-rep1-*.json    # Individual results
├── birthday-test-a-rep2-*.json
├── birthday-test-a-rep3-*.json
└── ... (up to 24 result files)
```

---

## Limitations Summary Table

| Aspect | Available | Limitation | Impact |
|--------|-----------|------------|--------|
| **Gemini JSON** | ❌ No | Originals not saved | Cannot compare exact structures |
| **Position Difference %** | ❌ No | Need original JSON | Cannot measure reorder metrics |
| **Token Usage Comparison** | ⚠️ Partial | Only Groq side tracked | Cannot compare efficiency directly |
| **Latency Comparison** | ⚠️ Partial | Only Groq side tracked | Cannot compare speed directly |
| **Model Availability** | ⚠️ Unverified | May not exist on Free tier | Experiment may fail to start |
| **Free Tier Quota** | ⚠️ Limited | ~100 req/day typical | May need multiple days |
| **Direct Playback Comparison** | ⚠️ Manual | Needs preview integration | Rate from HTML, not rendered reveal |
| **Automated Scoring** | ❌ No | Manual evaluation only | Subjective assessment required |
| **Sample Size** | ⚠️ Small | 3 reps × 8 cases = 24 | Limited statistical power |

---

## Success Criteria for Manual Evaluation

### Must Pass (Blockers):
1. ✅ All memories included exactly once
2. ✅ No invented memory IDs
3. ✅ No duplicate memory IDs
4. ✅ Finale exists in input and appears in plan
5. ✅ Valid JSON structure
6. ✅ Opening and chapter titles meet contract

### Quality Evaluation (Subjective):
1. Does the plan create an emotional arc?
2. Do chapters group related memories?
3. Is the finale emotionally appropriate?
4. Does Test B honor creator instructions?
5. Is the tone appropriate for the occasion?

### Comparison Assessment:
- **Better:** Clear improvement in narrative quality over documented Gemini patterns
- **Comparable:** Similar quality, acceptable alternative approach
- **Worse:** Less coherent narrative or poor finale selection
- **Unsure:** Cannot determine without direct comparison

---

## Next Steps After Evaluation

1. **Review Results:**
   - Check validation report for any errors
   - Review comparison HTML for all cases
   - Rate each plan on provided dimensions

2. **Document Findings:**
   - Record overall assessment (Better/Comparable/Worse/Unsure)
   - Note patterns in storytelling approach
   - Identify any consistent strengths or weaknesses

3. **Decide on Production Readiness:**
   - If Better: Consider Groq as alternative to Gemini
   - If Comparable: Both viable, decide on other factors (cost, reliability)
   - If Worse: Document why and keep Gemini approach
   - If Unsure: May need direct Gemini comparison (requires re-running Gemini experiments)

---

**Implementation Complete:** September 16, 2026
**Ready for Execution:** Manual GROQ_API_KEY configuration required
**Ready for Evaluation:** After experiment completion

