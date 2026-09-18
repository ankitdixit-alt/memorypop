# Groq Experiment Corrections - Summary

**Date:** September 17, 2026
**Status:** ✓ Offline corrections complete, no API calls made

---

## 1. Coverage Reconciliation (Corrected)

### Actual Results

| Test Case | Valid Reps | Status |
|-----------|-----------|--------|
| birthday-test-a | **3/3** ✓ | Complete |
| birthday-test-b | **2/3** ⚠️ | Missing rep2 |
| retirement-test-a | **2/3** ⚠️ | Missing rep3 |
| retirement-test-b | **2/3** ⚠️ | Missing rep2 |
| anniversary-test-a | **0/3** ❌ | All failed validation |
| anniversary-test-b | **0/3** ❌ | Not attempted |
| sympathy-test-a | **0/3** ❌ | Not attempted |
| sympathy-test-b | **0/3** ❌ | Not attempted |

**Occasions Tested:** 2 of 4 (birthday, retirement only)
**Test Cases Complete:** 1 of 8 (birthday-test-a only)

### API Call Reconciliation

**Run-001 (Archived):** 14 attempts, 9 successes
**Run-002:** 24 attempts, 9 successes
**Total API calls:** 38 (distinct, non-cumulative runs)
**Net unique valid plans:** 9 from run-002

---

## 2. Verified: JSON Schema Not Available

**Finding:** `openai/gpt-oss-120b` does NOT support JSON Schema structured outputs.

**Current:** Generic `json_object` mode (no schema enforcement)
**Implication:** Application-level validation must remain strict
**Alternative:** `llama-3.3-70b-versatile` supports structured outputs (different experiment)

**Validation Agreement:**
- ✓ Prompt, schema, validator, and playback agree on finale representation
- ✓ All memories must appear exactly once
- ✓ Finale listed in `finaleMemoryId` AND appears in chapters

---

## 3. Fixed: Model Identity Tracking

**Before:**
```typescript
model: data.model || 'openai/gpt-oss-120b'  // ❌ Substituted requested model
```

**After:**
```typescript
model: data.model || 'unknown'  // ✓ Explicit unknown if missing
requestedModel: 'openai/gpt-oss-120b'  // ✓ Always recorded
returnedModel: data.model || undefined  // ✓ Only if API confirms
```

---

## 4. Fixed: Token-Aware Scheduling

**Before:** Fixed 8-second delay

**After:** Dynamic calculation
```typescript
delay = (tokens × 60000ms) / 7000 TPM  // Conservative target

Examples:
  1000 tokens → ~8.6s
  3000 tokens → ~25.7s
  7000 tokens → 60s (capped)

Retry-after: Respects server headers with 2s buffer (max 60s)
Execution window: Stops if retry >5 minutes
```

---

## 5. Fixed: Error Categorization

**Separate handling:**
- `rate_limit_minute`: Temporary (8000 TPM throttling), retry with delay
- `rate_limit_day`: Permanent (daily quota), stop immediately
- `validation`: Model omitted memories
- `parse`: Invalid JSON
- Other: timeout, network, api_error, unknown

---

## 6. Verified: Lock and Ledger

**Lock File:** ✓ Prevents concurrent runners (1-hour staleness timeout)
**Manifest:** ✓ Resumes across restarts
**Skip Logic:** ✓ Avoids re-running successful cases
**Progress:** ✓ Saves after every attempt

---

## 7. Verified: Review Forms

**Form ID:** `rating-${caseId}-rep${repetition}-attempt${attemptNumber}`
**Storage:** ✓ LocalStorage per exact result
**Persistence:** ✓ Restores ratings on reload
**Gemini Ratings:** ✓ Disabled with explicit notice

---

## 8. Offline Test Results

```bash
npm run groq-test-mocked
```

**Output:**
```
Tests: 24
Passed: 24
Failed: 0
✅ All offline tests passed
```

**Coverage:**
- ✓ Token-aware delay calculation (5 tests)
- ✓ Retry-after header respect (4 tests)
- ✓ Model identity tracking (2 tests)
- ✓ Error classification (6 tests)
- ✓ Retry-after parsing (3 tests)
- ✓ Execution window checks (2 tests)
- ✓ Budget tracking (2 tests)

---

## 9. Proposed Next Batch

### Batch 1: Anniversary and Sympathy (24 attempts)

**Cases:**
- anniversary-test-b (3 reps)
- sympathy-test-a (3 reps)
- sympathy-test-b (3 reps)

**Rationale:**
- Test 2 untested occasions
- Assess sensitive tone handling (sympathy)
- Complete 4 of 4 occasions

**Not Included:**
- anniversary-test-a (3/3 failed validation, low priority)
- Missing single reps from birthday/retirement (lower priority)

**Execution:** (Do NOT run yet)
```bash
npm run groq-experiment-v3
```

**Expected:**
- Duration: 5-10 minutes
- Valid plans: 6-9 (if 38% success rate holds)
- Coverage: 4/4 occasions, 6/8 test cases

---

## 10. What Remains Untested

### After Batch 1

**Untested:**
- ✓ anniversary-test-a (attempted but failed)
- Partial coverage: birthday-test-b rep2, retirement-test-a rep3, retirement-test-b rep2

### Cannot Test

**Storytelling Quality:**
- No manual ratings completed yet
- No Gemini baseline for comparison
- Must evaluate Groq absolute quality only

**Technical:**
- Alternative models (llama-3.3-70b-versatile)
- JSON Schema structured outputs
- Long-term quota behavior

---

## Updated Local Commands

```bash
# View corrections report
cat .experiments/groq/CORRECTIONS-REPORT.md

# Run offline tests (no API calls)
npm run groq-test-mocked

# Validate existing results
npm run groq-validate

# View run-002 manual review
open .experiments/groq/run-002-comparison.html

# Execute batch 1 (DO NOT RUN YET - awaiting approval)
npm run groq-experiment-v3

# After batch 1 completion:
# Generate combined review UI (run-002 + run-003)
npm run groq-compare-v3
open .experiments/groq/run-003-comparison.html
```

---

## Files Updated

**Corrected:**
- ✓ `scripts/groq-experiment-v3.ts` (token-aware scheduling, model tracking)
- ✓ `src/lib/ai/providers/groq.ts` (no model substitution)
- ✓ `scripts/test-groq-experiment-mocked.ts` (offline verification)

**Documentation:**
- ✓ `.experiments/groq/CORRECTIONS-REPORT.md` (detailed analysis)
- ✓ `.experiments/groq/CORRECTIONS-SUMMARY.md` (this file)

**Scripts Added:**
- ✓ `groq-test-mocked` (npm run command)
- ✓ `groq-experiment-v3` (npm run command)

---

## Decision Required

**Proposal:** Execute batch 1 (24 attempts) to test anniversary and sympathy occasions.

**Expected Result:**
- 6-9 valid plans
- Coverage of all 4 occasions
- Data for absolute quality assessment

**Alternative:** Accept partial coverage (2/4 occasions) and conduct manual review of existing 9 plans.

**Recommendation:** Run batch 1 first, then conduct comprehensive manual review of all valid plans together.
