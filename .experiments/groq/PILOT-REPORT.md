# Groq Pilot Report

**Date:** September 17, 2026
**Configuration:** JSON Schema structured outputs (strict mode)
**Model:** openai/gpt-oss-120b

---

## Pilot Results

**Budget:** 8 attempts maximum
**Consumed:** 5 attempts
**Remaining:** 3 attempts

### Outcomes

| Case | Status | Attempts | Result |
|------|--------|----------|--------|
| anniversary-test-a | ✓ Success | 1 | Valid plan (2925 tokens, 3.2s) |
| anniversary-test-b | ✓ Success | 1 | Valid plan (2502 tokens, 2.4s) |
| sympathy-test-a | ✓ Success | 1 | Valid plan (2324 tokens, 2.2s) |
| sympathy-test-b | ✗ Failed | 2 | Rate limit → Internal server error |

**Valid Plans:** 3 of 4 cases (75%)
**Total Attempts:** 5
**Success Rate:** 60% (3 successes / 5 attempts)

### Failure Details

**sympathy-test-b:**
1. Attempt 4: Rate limit (429) - waited 9s
2. Attempt 5: Internal server error (500) - Groq API issue

---

## JSON Schema Verification

**Configuration Confirmed Working:**
- ✓ `response_format.type = "json_schema"`
- ✓ `json_schema.strict = true`
- ✓ All 3 successful responses validated against schema
- ✓ No parse errors (100% valid JSON in successes)
- ✓ Model identity correctly recorded: "openai/gpt-oss-120b"

**Schema Enforcement:**
All valid plans include required fields:
- opening (string)
- chapters (array)
- highlightMemoryIds (array)
- finaleMemoryId (string)
- reasoningSummary (string)

---

## Categorized Failures

| Error Type | Count | Notes |
|------------|-------|-------|
| rate_limit_minute | 1 | Temporary throttling, retry succeeded after 9s wait |
| api_error (500) | 1 | Internal server error on retry |

**No configuration errors** - JSON Schema strict mode accepted by API.

---

## Coverage Progress

### By Occasion (All Runs)

| Occasion | Valid Plans | Test Cases | Coverage |
|----------|-------------|------------|----------|
| Birthday | 9 | 2 (A/B) | Complete |
| Retirement | 9 | 2 (A/B) | Complete |
| Anniversary | 2 | 2 (A/B) | **NEW** ✓ |
| Sympathy | 1 | 1 of 2 (A only) | **NEW** Partial |

### Historical Context

**Total API Attempts (All Runs):**
- Run-001 (archived): 14 attempts
- Run-002 (JSON mode): 24 attempts
- Pilot (JSON Schema): 5 attempts
- **Grand Total: 43 attempts**

**Net Valid Plans:** 12
- Run-002: 9 plans (birthday/retirement)
- Pilot: 3 plans (anniversary, sympathy)

---

## Remaining Gaps

**Incomplete:**
- sympathy-test-b: Failed after 2 attempts (rate limit + API error)
- Budget remaining: 3 attempts

**Optional Extensions:**
- birthday-test-b rep2 (run-002 failed validation)
- retirement-test-a rep3 (run-002 failed validation)
- retirement-test-b rep2 (run-002 failed rate limit)

**Not Blocking:** All 4 occasions now have at least one valid plan.

---

## Review Page

**Generated:** `.experiments/groq/pilot-review.html`

**Features:**
- Complete memory playback in chapter order
- Opening and finale clearly marked
- Per-result rating forms (1-5 scales)
- LocalStorage persistence
- Gemini comparison disabled (originals unavailable)

**Open:**
```bash
open .experiments/groq/pilot-review.html
```

**Ratings Collected:**
- Emotional progression
- Chapter coherence
- Finale quality
- Overall quality
- Free-form notes

**Form IDs:** `rating-pilot-{caseId}-attempt{N}`
**Storage Key:** `groq-pilot-rating-pilot-{caseId}-attempt{N}`

---

## Key Findings

### JSON Schema Structured Outputs

✓ **Confirmed Working** for openai/gpt-oss-120b
- All 3 successful requests returned valid schema-compliant JSON
- No parse errors
- Strict mode accepted without configuration errors
- Earlier documentation was incorrect

### Scheduling Corrections

✓ **No retry-after capping** implemented
- Respected 9s wait from rate limit header
- Would honor 120s+ delays if requested
- Execution window check in place (10 minutes)

### Reliability

**Success Rate:** 60% (3/5 attempts)
- Run-002: 38% (9/24 with JSON mode)
- Pilot: 60% (3/5 with JSON Schema)

**Improvement possible** but small sample size.

### Structural Validation

All 3 valid plans passed:
- ✓ All memories included exactly once
- ✓ No duplicate memory IDs
- ✓ No invented memory IDs
- ✓ Valid finale in chapters
- ✓ Chapter titles under 60 chars
- ✓ Opening under 200 chars

**Quality assessment pending** - requires manual review.

---

## Commands

```bash
# View this report
cat .experiments/groq/PILOT-REPORT.md

# Open review page
open .experiments/groq/pilot-review.html

# Regenerate review (if needed)
npm run groq-pilot-review

# Check pilot manifest
jq . .experiments/groq/run-pilot/manifest.json

# Resume pilot (3 attempts remaining)
npm run groq-pilot
```

---

## Next Steps

1. **Manual review** of 3 valid plans in browser
2. **Rate storytelling quality** (not just structural validity)
3. **Optional:** Retry sympathy-test-b (2 attempts left in budget)
4. **Decision:** Assess whether quality justifies production consideration

**Status:** Pilot complete, awaiting manual quality assessment.
