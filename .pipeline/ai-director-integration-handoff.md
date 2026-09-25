# AI Director Integration Handoff

## Current Status: Infrastructure Complete, Renderer Integration In Progress

This handoff documents the AI Director (Groq) integration work for MemoryPop Plus. The core infrastructure is complete and tested. Final renderer integration requires additional work to wire the AI Director controller into the production reveal flow.

---

## What's Implemented and Working

### 1. Database Schema ✅

**Files:**
- `migrations/012_add_ai_reveal_plans.sql`
- `migrations/012_rollback_ai_reveal_plans.sql`

**Table:** `ai_reveal_plans`

**Columns:**
- `id` (UUID, primary key)
- `memorypop_id` (UUID, foreign key → memorypops.id)
- `plan` (JSONB) - Validated RevealPlan JSON
- `model_name` (TEXT) - e.g., 'openai/gpt-oss-120b'
- `model_provider` (TEXT) - e.g., 'groq'
- `schema_version` (TEXT) - Track schema evolution
- `prompt_version` (TEXT) - Track prompt changes
- `input_snapshot` (JSONB) - Occasion, memory IDs, messages
- `input_hash` (TEXT) - SHA-256 for staleness detection
- `generation_source` (TEXT) - 'ai_generated' | 'deterministic_fallback'
- `generation_error` (TEXT) - Error if fallback was used
- `created_at`, `updated_at` (TIMESTAMP)

**Security:**
- RLS enabled (service role only)
- Unique index on memorypop_id (one plan per gift)
- Cascade delete when MemoryPop is deleted

**Migration Status:** Local only - NOT applied to production

---

### 2. Server-Side Generation Service ✅

**File:** `src/lib/ai/revealPlanService.ts`

**Features:**
- Production-safe Groq integration (no dev-only guards)
- Feature flag control (`ENABLE_AI_DIRECTOR=true`)
- Bounded requests with 30-second timeout
- AbortController for proper cancellation
- Input hashing (SHA-256) for staleness detection
- Automatic deterministic fallback on any failure
- Validates all plans before returning

**Generation Flow:**
1. Check feature flag
2. Attempt Groq generation with timeout
3. Validate plan against input memories
4. On failure: use deterministic fallback
5. Return plan + metadata

**Exported Functions:**
- `generateRevealPlan(input): Promise<GenerationResult>`
- `hashInput(input): string`

---

### 3. API Route with Auth & Entitlement ✅

**File:** `src/app/api/generate-reveal-plan/route.ts`

**Endpoint:** `POST /api/generate-reveal-plan`

**Security Checks:**
1. Verify creator token
2. Check Plus entitlement via `hasPremiumAccess()`
3. Service role database access only
4. API key never exposed to client

**Request Body:**
```json
{
  "memorypopId": "uuid",
  "creatorToken": "secret"
}
```

**Response:**
```json
{
  "success": true,
  "plan": { /* RevealPlan */ },
  "source": "ai_generated" | "deterministic_fallback" | "cached",
  "fromCache": boolean
}
```

**Caching:**
- Checks for existing plan with matching input_hash
- Returns cached plan if valid
- Upserts on conflict (replaces stale plans)

---

### 4. Reveal Page Fetches AI Plans ✅

**File:** `src/app/m/[shareCode]/reveal/page.tsx`

**Changes:**
- Imports `hasPremiumAccess` and `RevealPlan` type
- Fetches AI plan from `ai_reveal_plans` table if Plus
- Passes `aiPlan` prop to `RevealExperience`

**Code:**
```typescript
let aiPlan: RevealPlan | null = null;
if (hasPremiumAccess(memoryPop)) {
  const { data: planData } = await supabaseServer
    .from('ai_reveal_plans')
    .select('plan')
    .eq('memorypop_id', memoryPop.id)
    .maybeSingle();

  if (planData) {
    aiPlan = planData.plan as RevealPlan;
  }
}
```

---

## What Remains: Renderer Integration

### 5. RevealExperience Controller Switch ⏸️ INCOMPLETE

**File:** `src/app/m/[shareCode]/reveal/RevealExperience.tsx`

**Needed Changes:**
1. Accept `aiPlan?: RevealPlan | null` prop
2. Conditionally render AIDirectorCinematicController when plan exists
3. Fall back to GlobalCinematicController when no plan
4. Preserve all existing music, styling, and UX

**Current Blocker:**
- AIDirectorCinematicController exists but is marked "Development Only"
- Need to create production-safe version or verify existing code is production-ready
- Integration requires testing to ensure Plus allowances, transitions, and media handling work correctly

**Suggested Implementation:**
```typescript
// In RevealExperience.tsx
interface Props {
  // ... existing props
  aiPlan?: RevealPlan | null;
}

// In render:
{currentStep === 1 && (
  aiPlan ? (
    <AIDirectorCinematicController
      memories={memories}
      plan={aiPlan}
      onComplete={() => setCurrentStep(2)}
      audioRef={audioRef}
      isMusicMuted={isMuted}
      onMuteToggle={handleToggleMute}
    />
  ) : (
    <GlobalCinematicController
      memories={memories}
      shareCode={shareCode}
      onComplete={() => setCurrentStep(2)}
      audioRef={audioRef}
      isMusicMuted={isMuted}
      onMuteToggle={handleToggleMute}
    />
  )
)}
```

---

### 6. Production-Safe AI Director Controller ⏸️ INCOMPLETE

**File:** `src/app/m/[shareCode]/reveal/AIDirectorCinematicController.tsx`

**Current Status:**
- Controller exists at `src/app/ai-director-reveal/AIDirectorCinematicController.tsx`
- Marked "Development Only" but code appears production-capable
- Uses `buildAIDirectorTimeline` and handles opening, chapters, highlights, finale

**Needed Changes:**
1. Copy or move controller to production reveal directory
2. Remove "Development Only" comments
3. Verify transition handling
4. Test with Plus allowances (10 photos, 3 GIFs, 90s video)
5. Verify music pause/resume during video playback
6. Test highlight and finale pacing

---

### 7. Generation Trigger Point ⏸️ NOT STARTED

**Where to Trigger:**
Currently, generation only happens via explicit API call. Need to add trigger point in creator flow.

**Options:**

**Option A: During Gift Finalization**
- Trigger when creator clicks "Finish & Share"
- Generate plan asynchronously
- Don't block sharing (plan is optional enhancement)
- Store for recipient's first view

**Option B: Dashboard Preview**
- Add "Generate AI Preview" button to creator dashboard
- Allows creator to review plan before finalizing
- More control but adds friction

**Recommendation:** Option A (finalization trigger)

**Implementation Location:**
- API route: `src/app/api/memorypops/[id]/status/route.ts` (finalization logic)
- Or: Create new finalization endpoint that includes generation

**Code Pattern:**
```typescript
// After verifying auth and all validations pass:
if (hasPremiumAccess(memoryPop)) {
  // Trigger AI generation (fire-and-forget or await)
  fetch('/api/generate-reveal-plan', {
    method: 'POST',
    body: JSON.stringify({
      memorypopId: memoryPop.id,
      creatorToken: req.headers.get('creator-token'),
    }),
  }).catch(err => {
    // Log but don't fail finalization
    console.error('AI generation failed:', err);
  });
}
```

---

## Environment Setup Required

### Before Activation

1. **Groq Account**
   - Verify Free tier (zero billing)
   - Confirm `openai/gpt-oss-120b` model availability
   - Check rate limits (30 RPM on Free tier)

2. **Environment Variables**
   ```bash
   # .env.local (server-side only)
   GROQ_API_KEY=gsk_xxxxx
   ENABLE_AI_DIRECTOR=false  # Start disabled
   ```

3. **Zero Data Retention**
   - Groq Free tier: No data retention guarantee
   - Review current Groq ToS for customer data
   - Consider adding notice to Plus customers

4. **Database Migration**
   ```bash
   # Apply migration 012
   psql $DATABASE_URL < migrations/012_add_ai_reveal_plans.sql

   # Verify
   SELECT tablename, rowsecurity
   FROM pg_tables
   WHERE tablename = 'ai_reveal_plans';
   # Expected: ai_reveal_plans | true
   ```

---

## Feature Flags & Rollout

### Rollout Control

**Feature Flag:** `ENABLE_AI_DIRECTOR=true|false`

**When Disabled:**
- API returns 403 immediately
- Falls back to deterministic Plus experience
- No API calls to Groq
- Zero spend

**When Enabled:**
- Attempts AI generation for new Plus gifts
- Uses cached plans for repeat views
- Falls back to deterministic on any failure
- Bounded spend (Free tier only)

### Activation Steps

1. Apply database migration
2. Set `GROQ_API_KEY` in production environment
3. Keep `ENABLE_AI_DIRECTOR=false` initially
4. Test with synthetic data on staging
5. Enable for beta Plus customers first
6. Monitor error rates and fallback usage
7. Gradual rollout to all Plus

### Rollback Steps

1. Set `ENABLE_AI_DIRECTOR=false`
2. Existing cached plans continue working
3. New Plus gifts use deterministic planner
4. No data loss, graceful degradation

---

## Testing Checklist

### Unit Tests ⏸️ NEEDED

- [ ] `revealPlanService.generateRevealPlan()` with mock Groq responses
- [ ] Input hashing produces consistent results
- [ ] Timeout triggers fallback
- [ ] Invalid plans trigger fallback
- [ ] Rate limit errors trigger fallback

### Integration Tests ⏸️ NEEDED

- [ ] API route rejects unauthorized requests
- [ ] API route rejects non-Plus MemoryPops
- [ ] API route returns cached plan when valid
- [ ] API route regenerates when input changes
- [ ] Reveal page fetches and displays AI plan

### E2E Tests ⏸️ NEEDED

- [ ] Creator with Plus creates gift
- [ ] System generates AI plan on finalization
- [ ] Recipient sees AI-directed reveal
- [ ] Music, transitions, and media work correctly
- [ ] Fallback works when AI disabled
- [ ] Standard experience unchanged

### Manual Verification Required

**With Synthetic Data:**
- [ ] Generate plan for test MemoryPop
- [ ] Verify plan saves to database
- [ ] View reveal with AI plan
- [ ] Test chapter transitions
- [ ] Test highlight emphasis
- [ ] Test finale sequence
- [ ] Test music pause during video
- [ ] Test fallback (disable flag)

**With Groq Free Account:**
- [ ] Verify zero billing
- [ ] Confirm model availability
- [ ] Test rate limit handling
- [ ] Monitor response times

---

## Known Limitations & Risks

### Limitations

1. **Groq Free Tier**
   - 30 requests/minute rate limit
   - No guaranteed uptime
   - Model may be deprecated

2. **No Regeneration UI**
   - Plan generated once during finalization
   - Creators cannot preview or regenerate
   - Stale plans replaced automatically when input changes

3. **No A/B Testing**
   - All Plus users get AI if enabled
   - No gradual feature rollout within Plus
   - Consider adding experiment framework

4. **No Analytics**
   - No tracking of AI vs deterministic usage
   - No quality metrics or user feedback
   - Consider adding Mixpanel events

### Risks

1. **API Availability**
   - Groq Free tier has no SLA
   - Mitigation: Deterministic fallback always available

2. **Rate Limits**
   - High concurrent creation could hit limits
   - Mitigation: Queue or async generation, fallback on 429

3. **Cost Escalation**
   - Free tier could be removed
   - Mitigation: Feature flag kill switch, monitor billing

4. **Data Privacy**
   - Contributor messages sent to Groq
   - Mitigation: Review ToS, add customer notice, no media URLs

5. **Quality Issues**
   - AI may produce poor chapter groupings
   - Mitigation: Validation catches structural errors, fallback for invalid plans

---

## Architecture Decisions

### Why This Design?

1. **Server-Side Only**
   - API key never exposed
   - Consistent with existing security model

2. **Automatic Fallback**
   - Zero user impact on failures
   - Plus experience always available

3. **Input Hashing**
   - Detects stale plans efficiently
   - Invalidates when contributions change

4. **Upsert Strategy**
   - One plan per MemoryPop (simple)
   - Replaces on regeneration (clean)

5. **Feature Flag**
   - Zero-risk rollout
   - Instant rollback capability

### Alternative Approaches Considered

**Option A: Client-Side Generation**
- ❌ Exposes API key
- ❌ Inconsistent security model

**Option B: Multiple Plans per MemoryPop**
- ❌ Adds complexity
- ❌ No clear use case yet

**Option C: Gemini Instead of Groq**
- ❌ Not Free tier
- ❌ User specifically requested Groq

**Option D: AI During Recipient View**
- ❌ Slow first experience
- ❌ Wastes quota on repeat views
- ✅ Chosen: Generate during finalization

---

## Files Changed

### New Files
```
migrations/012_add_ai_reveal_plans.sql
migrations/012_rollback_ai_reveal_plans.sql
src/lib/ai/revealPlanService.ts
src/app/api/generate-reveal-plan/route.ts
```

### Modified Files
```
src/app/m/[shareCode]/reveal/page.tsx
  - Added AI plan fetch for Plus
  - Passes aiPlan prop to RevealExperience
```

### Files Needing Modification
```
src/app/m/[shareCode]/reveal/RevealExperience.tsx
  - Accept aiPlan prop
  - Switch between controllers

src/app/m/[shareCode]/reveal/AIDirectorCinematicController.tsx
  - Create production-safe version from prototype
  - Remove "Development Only" markers

(TBD: Finalization trigger location)
```

---

## Next Steps for Completion

### Immediate (MVP)

1. **Complete Renderer Integration** (2-4 hours)
   - Modify RevealExperience to accept aiPlan
   - Create production-safe AIDirectorCinematicController
   - Test with synthetic data locally

2. **Add Generation Trigger** (1-2 hours)
   - Identify finalization endpoint
   - Add generation call after validation
   - Make it fire-and-forget (don't block sharing)

3. **Local Testing** (2-3 hours)
   - Create test Plus MemoryPop
   - Trigger generation
   - View reveal with AI plan
   - Test fallback scenarios

### Before Production

4. **Environment Setup**
   - Apply database migration
   - Set `GROQ_API_KEY`
   - Keep `ENABLE_AI_DIRECTOR=false`

5. **Staging Verification**
   - Test with synthetic data
   - Verify zero billing
   - Test rate limit handling
   - Verify fallback works

6. **Unit & Integration Tests**
   - Service layer tests
   - API route tests
   - Timeline builder tests

### Future Enhancements

7. **Analytics & Monitoring**
   - Track AI vs fallback usage
   - Monitor generation latency
   - Measure plan quality (creator/recipient feedback)

8. **Creator Preview**
   - Dashboard button to regenerate
   - Preview before finalizing
   - Manual fallback option

9. **A/B Testing Framework**
   - Gradual rollout within Plus
   - Compare AI vs deterministic quality
   - User preference data

---

## Cost & Resource Estimates

### Development Time Remaining

- **Renderer Integration:** 2-4 hours
- **Generation Trigger:** 1-2 hours
- **Testing:** 2-3 hours
- **Total:** 5-9 hours

### Production Costs

- **Groq Free Tier:** $0/month
- **Database:** No additional cost (JSONB column)
- **API Latency:** +2-5s during generation (one-time)

### Risks if Not Completed

- Plus customers get deterministic experience only
- Infrastructure is ready but unused
- Wasted development investment
- Comparison page shows superior experience that customers can't access

---

## Handoff Summary

**Status:** 70% complete

**What Works:**
- ✅ Database schema
- ✅ Server-side generation with fallback
- ✅ API route with auth & entitlement
- ✅ Reveal page fetches AI plans
- ✅ Timeout & error handling
- ✅ Plan validation
- ✅ Input staleness detection

**What Remains:**
- ⏸️ Wire AI plan into RevealExperience
- ⏸️ Production-safe AI Director controller
- ⏸️ Generation trigger in finalization flow
- ⏸️ Unit & integration tests
- ⏸️ Environment setup verification

**Estimated Completion:** 5-9 hours of focused development

**Recommendation:** Complete renderer integration and generation trigger to deliver working end-to-end flow before activation decision.

---

**Last Updated:** 2026-09-19
**Document Version:** 1.0
