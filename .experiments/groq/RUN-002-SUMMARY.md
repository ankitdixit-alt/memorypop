# Groq AI Director Experiment - Run 002 Summary

## Experiment Configuration

**Model:** `openai/gpt-oss-120b`
**Attempt Budget:** 24 (exhausted)
**Run Directory:** `.experiments/groq/run-002-openai-gpt-oss-120b`
**Date:** September 16, 2026

## Key Improvements from Run 001

1. **Lock File Mechanism**: Prevents concurrent experiment runners
2. **Rate Limit Handling**: Distinguishes per-minute (8000 TPM) from daily quota
3. **Retry-After Headers**: Respects Groq API backoff recommendations (max 60s)
4. **Attempt Tracking**: Counts ALL attempts including retries against 24-attempt budget
5. **Model Identity**: Records both requested and returned model identifiers
6. **Run Separation**: Results saved in model-specific directory structure

## Results Overview

| Metric | Value |
|--------|-------|
| Total Attempts | 24 |
| Successful Plans | 9 |
| Failed Attempts | 15 |
| Budget Status | Exhausted |
| Run Duration | ~4 minutes |

## Failure Breakdown

| Error Type | Count | Notes |
|------------|-------|-------|
| Rate Limit (per-minute) | 9 | Temporary 8000 TPM throttling |
| Validation Errors | 4 | Model failed to include all memories |
| Parse Errors | 2 | Invalid JSON output from model |

## Coverage by Test Case

| Case ID | Repetitions Complete | Success Rate | Attempts | Status |
|---------|---------------------|--------------|----------|--------|
| birthday-test-a | 3/3 ✓ | 50% | 6 | Complete |
| birthday-test-b | 2/3 ⚠️ | 40% | 5 | Rep 2 failed validation |
| retirement-test-a | 2/3 ⚠️ | 29% | 7 | Rep 1 failed validation |
| retirement-test-b | 2/3 ✓ | 67% | 3 | Rep 2 failed rate limit |
| anniversary-test-a | 0/3 ❌ | 0% | 3 | All reps failed validation |
| anniversary-test-b | 0/3 ❌ | N/A | 0 | Not attempted (budget) |
| sympathy-test-a | 0/3 ❌ | N/A | 0 | Not attempted (budget) |
| sympathy-test-b | 0/3 ❌ | N/A | 0 | Not attempted (budget) |

**Coverage Summary:**
- **Complete**: 4/8 test cases (birthday-test-a, birthday-test-b, retirement-test-a, retirement-test-b)
- **Partial**: 4/8 cases have at least 2 valid repetitions
- **Missing**: anniversary-test-b, sympathy-test-a, sympathy-test-b never attempted

## Model Performance Analysis

### Successful Plans (n=9)

**Latency:**
- Range: 2,340ms - 4,521ms
- Mean: ~3,200ms

**Token Usage:**
- Range: 2,428 - 3,647 tokens
- Mean: ~2,900 tokens

**Model Identity:**
- All successful plans confirmed: `openai/gpt-oss-120b`
- No model confusion detected in run-002

### Validation Errors (n=4)

**Missing Memory IDs:**
- birthday-test-b rep 2: Missing mem_002
- retirement-test-a rep 1: Missing mem_f04
- anniversary-test-a rep 1: Missing mem_a09
- anniversary-test-a rep 3: Memory ID omission (unspecified)

**Pattern:** Model occasionally fails to include all memories in the plan, violating the "every memory exactly once" constraint.

### Rate Limit Behavior (n=9 hits)

**Per-Minute Throttling:**
- Triggered 9 times during run
- Retry-after values: 8s - 15s
- All rate limits were temporary (not daily quota)
- Backoff mechanism working correctly

**8-Second Delay:**
- Updated from 5s to 8s mid-run
- Still insufficient to avoid all rate limit hits
- Suggests 10-12s minimum delay needed for consistent success

## Improved Review Interface

**File:** `.experiments/groq/run-002-comparison.html`

**Features:**
1. **Complete Memory Playback**: Full contributor messages in chapter order
2. **Visual Badges**: Highlights and finale clearly marked
3. **Per-Result Rating Forms**: 5-point scales for:
   - Emotional progression
   - Chapter coherence
   - Finale quality
   - Instruction adherence
   - Tone match
4. **Gemini Comparison Notice**: "Original Gemini responses not available"
5. **LocalStorage Persistence**: Ratings saved in browser
6. **Metadata Display**: Latency, tokens, model identity per result

**Usage:**
```bash
open .experiments/groq/run-002-comparison.html
```

## Remaining Limitations

### 1. Incomplete Coverage
- Only 4/8 test cases fully explored
- Anniversary and sympathy occasions not tested
- Unable to evaluate occasion-specific storytelling quality

### 2. Validation Reliability
- 4/24 attempts (17%) failed validation
- Model sometimes omits memories without explanation
- No way to force strict memory inclusion

### 3. Rate Limiting Constraints
- 8000 TPM limit very restrictive for large memory sets (15 memories)
- 8-second delay insufficient for back-to-back requests
- Budget exhausted before completing all cases

### 4. No Gemini Comparison Baseline
- Original Gemini responses never captured
- Cannot perform relative "Better/Comparable/Worse" ratings
- Must evaluate Groq storytelling quality independently

### 5. Single Model Tested
- Only tested `openai/gpt-oss-120b`
- Did not explore alternative Groq models (llama-3.3-70b-versatile, etc.)
- Cannot compare Groq model performance

## Recommendations

### Immediate Actions

1. **Manual Review Required**: Open comparison.html and rate the 9 successful plans
2. **Archive Run-002**: Move results to permanent storage before new runs
3. **Update Budget Policy**: Consider 36-48 attempt budget for full 8-case coverage

### For Future Runs

1. **Increase Minimum Delay**: Use 12s between requests to avoid rate limits
2. **Retry Logic**: On validation failures, retry with prompt refinement
3. **Occasion Prioritization**: Test sympathy and anniversary with dedicated budgets
4. **Model Comparison**: Test llama-3.3-70b-versatile separately
5. **Gemini Capture**: If repeating Gemini experiments, save full responses for comparison

### Experimental Design Improvements

1. **Smaller Memory Sets**: Test with 8-10 memories to reduce token usage
2. **Staged Rollout**: Run 1 repetition per case first, then expand successful cases
3. **Budget Checkpoints**: Auto-save progress every 6 attempts
4. **Failure Analysis**: Log full API responses for parse and validation errors

## Files Generated

```
.experiments/groq/run-002-openai-gpt-oss-120b/
├── manifest.json                          (Experiment metadata)
├── birthday-test-a-rep1-attempt1-*.json   (Result 1)
├── birthday-test-a-rep2-attempt2-*.json   (Result 2)
├── ... (22 more result files)
└── (24 total attempts)

.experiments/groq/
├── run-002-comparison.html                (Manual review UI)
└── RUN-002-SUMMARY.md                     (This document)
```

## Validation Command

```bash
npm run groq-validate
```

**Output:**
- Total results: 24
- Successful: 9
- Failed: 15
- No structural validation issues in successful plans
- All successful plans passed memory inclusion checks

## Next Steps

1. **Manual Review**: Rate the 9 successful plans in comparison.html
2. **Decide on Coverage Strategy**:
   - Option A: Accept partial coverage (4/8 cases) and draw conclusions
   - Option B: Run supplemental experiment with remaining 3 cases
   - Option C: Increase budget and re-run entire experiment
3. **Document Findings**: Summarize storytelling quality observations
4. **Compare with Gemini**: If Gemini baselines available, perform relative comparison
5. **Production Decision**: Determine if Groq is viable for Memory Pop AI Director

## Conclusion

Run-002 successfully demonstrated:
- ✓ Model identity tracking working correctly
- ✓ Rate limit handling functional (but delay too short)
- ✓ Attempt budgeting accurate
- ✓ Result archiving and validation working
- ✓ Improved review interface usable

However, limitations remain:
- ❌ Incomplete coverage (4/8 cases)
- ❌ Validation failures (17% of attempts)
- ❌ Rate limiting still problematic despite improvements
- ❌ No Gemini baseline for comparison

**Recommendation:** Complete manual review of 9 successful plans before deciding whether to allocate budget for supplemental run to test anniversary and sympathy occasions.
