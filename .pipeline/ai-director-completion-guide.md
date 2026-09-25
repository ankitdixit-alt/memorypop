# AI Director - Completion Guide

**Goal:** Complete the remaining 25% (renderer + trigger) to deliver working end-to-end AI Director experience.

**Estimated Time:** 8-12 hours focused work

---

## Task 1: Wire AI Director Renderer (3-5 hours)

### Current State
- AI plan fetches successfully
- Plan logs to console
- Standard timeline renders (safe MVP)

### Target State
- AI plan triggers AIDirectorCinematicController
- Chapters, highlights, finale render correctly
- Music, transitions, controls work

### Implementation Steps

#### Step 1.1: Align AIDirectorCinematicController Props

**File:** `src/app/m/[shareCode]/reveal/AIDirectorCinematicController.tsx`

**Current Props:**
```typescript
interface Props {
  memories: Memory[]
  plan: RevealPlan
  onComplete: () => void
  onSceneChange: (sceneIndex: number, scene: AIDirectorScene) => void
  showTransitions?: boolean
  playbackSpeed?: number
}
```

**Need to Add:**
```typescript
interface Props {
  memories: Memory[]
  plan: RevealPlan
  onComplete: () => void
  // Add these to match GlobalCinematicController:
  audioRef: React.MutableRefObject<HTMLAudioElement | null>
  isMusicMuted: boolean
  onMuteToggle: () => void
  // Optional for compatibility:
  onSceneChange?: (sceneIndex: number, scene: AIDirectorScene) => void
  showTransitions?: boolean
  playbackSpeed?: number
}
```

**Changes Needed:**
1. Add audioRef, isMusicMuted, onMuteToggle to Props
2. Remove hardcoded music handling (use passed audioRef)
3. Respect isMusicMuted prop
4. Call onMuteToggle when user toggles mute

**Current Code Pattern (Remove):**
```typescript
// Remove internal music setup
const audioRef = useRef<HTMLAudioElement | null>(null)
useEffect(() => {
  const audio = new Audio(soundtrack)
  // ... internal music logic
}, [])
```

**New Code Pattern (Use):**
```typescript
// Use passed audioRef from parent
useEffect(() => {
  if (audioRef.current && playbackState === 'PLAYING') {
    audioRef.current.play().catch(...)
  }
}, [playbackState, audioRef])
```

#### Step 1.2: Copy Controller to Production Location

**Option A: Copy File**
```bash
cp src/app/ai-director-reveal/AIDirectorCinematicController.tsx \
   "src/app/m/[shareCode]/reveal/AIDirectorCinematicController.tsx"
```

**Option B: Export from Existing Location**
```typescript
// In src/app/ai-director-reveal/AIDirectorCinematicController.tsx
// Remove "Development Only" comment
// Export for production use
```

Then import in RevealExperience:
```typescript
import AIDirectorCinematicController from '@/app/ai-director-reveal/AIDirectorCinematicController'
```

**Recommendation:** Option B (less duplication)

#### Step 1.3: Wire into RevealExperience

**File:** `src/app/m/[shareCode]/reveal/RevealExperience.tsx`

**Find:**
```typescript
} else if (currentStep === 1) {
  // Step 1: Cinematic (ALL memories in one global timeline)
  // Log AI plan availability for debugging
  if (aiPlan && process.env.NODE_ENV === 'development') {
    console.log('[AI_DIRECTOR] Plan available:', {...});
  }

  // TODO: Wire AIDirectorCinematicController when aiPlan exists
  return (
    <GlobalCinematicController
      memories={memories}
      shareCode={shareCode}
      onComplete={handleNext}
      audioRef={audioRef}
      isMusicMuted={isMuted}
      onMuteToggle={handleToggleMute}
    />
  );
}
```

**Replace With:**
```typescript
} else if (currentStep === 1) {
  // Step 1: Cinematic - AI Director or Standard
  const useAIDirector = Boolean(aiPlan)

  if (useAIDirector && aiPlan) {
    // AI Director Plus Experience
    return (
      <AIDirectorCinematicController
        memories={memories}
        plan={aiPlan}
        onComplete={handleNext}
        audioRef={audioRef}
        isMusicMuted={isMuted}
        onMuteToggle={handleToggleMute}
      />
    )
  } else {
    // Standard Timeline (Plus without AI or Standard tier)
    return (
      <GlobalCinematicController
        memories={memories}
        shareCode={shareCode}
        onComplete={handleNext}
        audioRef={audioRef}
        isMusicMuted={isMuted}
        onMuteToggle={handleToggleMute}
      />
    )
  }
}
```

**Add Import:**
```typescript
import AIDirectorCinematicController from '@/app/ai-director-reveal/AIDirectorCinematicController'
```

#### Step 1.4: Test Locally

```bash
# 1. Generate plan for test MemoryPop (see testing guide)
curl -X POST http://localhost:3000/api/generate-reveal-plan \
  -H "Content-Type: application/json" \
  -d '{"memorypopId": "test-uuid", "creatorToken": "test-token"}'

# 2. Visit reveal page
open http://localhost:3000/m/test-ai-reveal/reveal

# 3. Click "Begin Your Experience"

# 4. Verify:
# - Opening title shows (AI-generated opening)
# - Chapter cards appear between sections
# - Memories render in AI-planned order
# - Highlights have special emphasis
# - Finale has special treatment
# - Music plays throughout
# - Mute toggle works
# - Navigation controls work
```

#### Step 1.5: Test Edge Cases

**Test Case 1: Plus with No AI Plan**
```sql
DELETE FROM ai_reveal_plans WHERE memorypop_id = 'test-uuid';
```
Expected: Standard timeline renders (graceful fallback)

**Test Case 2: Standard Tier**
```sql
UPDATE memorypops SET is_premium = false WHERE id = 'test-uuid';
```
Expected: Standard timeline, no AI plan fetch attempted

**Test Case 3: Invalid Plan**
```sql
UPDATE ai_reveal_plans
SET plan = '{"invalid": "plan"}'::jsonb
WHERE memorypop_id = 'test-uuid';
```
Expected: Error caught, Standard timeline fallback

---

## Task 2: Add Generation Trigger (1-2 hours)

### Current State
- API route works when called manually
- No automatic trigger in creator flow

### Target State
- Plan generates automatically when creator finalizes gift
- Fire-and-forget (doesn't block sharing)
- Logged for debugging

### Implementation Steps

#### Step 2.1: Identify Finalization Endpoint

**Likely Locations:**
1. `src/app/api/memorypops/[id]/status/route.ts` (if exists)
2. `src/app/api/memorypops/create/route.ts` (after creation)
3. Dashboard finalization action

**Search:**
```bash
grep -r "finalize\|ready\|complete" src/app/api/memorypops/
```

**Find:** Where `ready_to_share` or similar flag is set

#### Step 2.2: Add Generation Call

**Pattern:**
```typescript
// After all finalization validations pass:

// Check if Plus and generation enabled
if (memoryPop.is_premium && process.env.ENABLE_AI_DIRECTOR === 'true') {
  // Fire-and-forget generation (don't block response)
  try {
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/generate-reveal-plan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        memorypopId: memoryPop.id,
        creatorToken: memoryPop.creator_token,
      }),
    }).catch(err => {
      // Log but don't fail finalization
      console.error('[AI_DIRECTOR] Generation failed:', err)
    })

    console.log('[AI_DIRECTOR] Generation triggered for:', memoryPop.id)
  } catch (err) {
    // Silent failure - creator can still share
    console.error('[AI_DIRECTOR] Failed to trigger generation:', err)
  }
}
```

**Key Points:**
- Don't await the fetch
- Catch and log errors
- Don't block finalization on failure
- Only trigger for Plus
- Respect ENABLE_AI_DIRECTOR flag

#### Step 2.3: Test Flow

```bash
# 1. Create new Plus MemoryPop via UI or API

# 2. Add memories

# 3. Finalize/complete the gift

# 4. Check server logs for:
[AI_DIRECTOR] Generation triggered for: <uuid>

# 5. Query database:
SELECT * FROM ai_reveal_plans WHERE memorypop_id = '<uuid>';
# Expected: One row appears within ~5 seconds

# 6. Visit reveal page
# Expected: AI Director timeline renders
```

---

## Task 3: Unit Tests (2-3 hours)

### Test File Structure

```
src/lib/ai/__tests__/
  revealPlanService.test.ts
src/app/api/__tests__/
  generate-reveal-plan.test.ts
```

### Test Coverage Needed

#### Test 3.1: Service Layer Tests

**File:** `src/lib/ai/__tests__/revealPlanService.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from '@jest/globals'
import { generateRevealPlan, hashInput } from '../revealPlanService'
import type { RevealPlanInput } from '../types'

// Mock fetch
global.fetch = vi.fn()

describe('revealPlanService', () => {
  beforeEach(() => {
    process.env.ENABLE_AI_DIRECTOR = 'true'
    process.env.GROQ_API_KEY = 'test-key'
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('generates plan with Groq when enabled', async () => {
    const mockResponse = {
      choices: [{
        message: {
          content: JSON.stringify({
            opening: 'Test opening',
            chapters: [
              { title: 'Chapter 1', memoryIds: ['mem1', 'mem2'] }
            ],
            highlightMemoryIds: ['mem1'],
            finaleMemoryId: 'mem2',
            reasoningSummary: 'Test'
          })
        }
      }],
      model: 'openai/gpt-oss-120b'
    }

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    } as Response)

    const input: RevealPlanInput = {
      memoryPopId: 'test',
      recipientName: 'Test',
      occasion: 'birthday',
      tone: 'warm',
      story: 'Test story',
      memories: [
        {
          id: 'mem1',
          contributorName: 'Alice',
          message: 'Happy birthday!',
          photoCount: 0,
          gifCount: 0,
          createdAt: new Date()
        },
        {
          id: 'mem2',
          contributorName: 'Bob',
          message: 'Best wishes!',
          photoCount: 0,
          gifCount: 0,
          createdAt: new Date()
        }
      ]
    }

    const result = await generateRevealPlan(input)

    expect(result.source).toBe('ai_generated')
    expect(result.plan.chapters).toHaveLength(1)
    expect(result.modelName).toBe('openai/gpt-oss-120b')
  })

  it('falls back to deterministic when AI disabled', async () => {
    process.env.ENABLE_AI_DIRECTOR = 'false'

    const input: RevealPlanInput = { /* ... */ }
    const result = await generateRevealPlan(input)

    expect(result.source).toBe('deterministic_fallback')
    expect(result.error).toContain('AI generation disabled')
    expect(result.plan).toBeDefined()
  })

  it('falls back on timeout', async () => {
    vi.mocked(fetch).mockImplementationOnce(() =>
      new Promise(resolve => setTimeout(resolve, 40000)) // > 30s timeout
    )

    const input: RevealPlanInput = { /* ... */ }
    const result = await generateRevealPlan(input)

    expect(result.source).toBe('deterministic_fallback')
    expect(result.error).toContain('timeout')
  })

  it('falls back on invalid plan', async () => {
    const mockResponse = {
      choices: [{
        message: {
          content: JSON.stringify({
            opening: 'Test',
            chapters: [], // Invalid: no chapters
            highlightMemoryIds: [],
            finaleMemoryId: 'missing', // Invalid: doesn't exist
            reasoningSummary: 'Test'
          })
        }
      }],
      model: 'openai/gpt-oss-120b'
    }

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    } as Response)

    const input: RevealPlanInput = { /* ... */ }
    const result = await generateRevealPlan(input)

    expect(result.source).toBe('deterministic_fallback')
    expect(result.error).toContain('validation failed')
  })

  it('produces consistent input hash', () => {
    const input1: RevealPlanInput = {
      memoryPopId: 'test',
      recipientName: 'Alice',
      occasion: 'birthday',
      tone: 'warm',
      story: 'Test',
      memories: [
        {
          id: 'mem1',
          contributorName: 'Bob',
          message: 'Happy birthday!',
          photoCount: 1,
          gifCount: 0,
          createdAt: new Date('2026-01-01')
        }
      ]
    }

    const input2: RevealPlanInput = { ...input1 }

    expect(hashInput(input1)).toBe(hashInput(input2))
  })

  it('produces different hash when input changes', () => {
    const input1: RevealPlanInput = { /* ... */ }
    const input2: RevealPlanInput = {
      ...input1,
      memories: [...input1.memories, { id: 'mem3', /* ... */ }]
    }

    expect(hashInput(input1)).not.toBe(hashInput(input2))
  })
})
```

#### Test 3.2: API Route Tests

**File:** `src/app/api/__tests__/generate-reveal-plan.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from '@jest/globals'
import { POST } from '../generate-reveal-plan/route'
import { NextRequest } from 'next/server'

// Mock dependencies
vi.mock('@/lib/supabaseServer')
vi.mock('@/lib/premiumEntitlement')
vi.mock('@/lib/ai/revealPlanService')

describe('POST /api/generate-reveal-plan', () => {
  it('rejects request with missing parameters', async () => {
    const request = new NextRequest('http://localhost:3000/api/generate-reveal-plan', {
      method: 'POST',
      body: JSON.stringify({})
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
  })

  it('rejects unauthorized request', async () => {
    // Mock: memoryPop.creator_token !== provided token
    // Expected: 401
  })

  it('rejects non-Plus MemoryPop', async () => {
    // Mock: hasPremiumAccess returns false
    // Expected: 403
  })

  it('returns cached plan when valid', async () => {
    // Mock: existing plan with matching input_hash
    // Expected: fromCache: true
  })

  it('generates new plan when no cache', async () => {
    // Mock: no existing plan
    // Expected: fromCache: false
  })

  it('regenerates when input changed', async () => {
    // Mock: existing plan with different input_hash
    // Expected: fromCache: false, new plan
  })
})
```

### Running Tests

```bash
npm test -- revealPlanService.test
npm test -- generate-reveal-plan.test
```

---

## Verification Checklist

Before considering complete:

### Renderer Integration
- [ ] AIDirectorCinematicController props match GlobalCinematicController
- [ ] Controller renders opening screen
- [ ] Chapter transitions work
- [ ] Memories render in AI-planned order
- [ ] Highlights have emphasis
- [ ] Finale has special treatment
- [ ] Music plays and mute toggle works
- [ ] Navigation controls work
- [ ] Fallback to Standard timeline on error

### Generation Trigger
- [ ] Trigger added to finalization flow
- [ ] Only triggers for Plus
- [ ] Respects ENABLE_AI_DIRECTOR flag
- [ ] Fire-and-forget (doesn't block)
- [ ] Logs generation start
- [ ] Silent failure if generation fails

### Testing
- [ ] Unit tests for service layer pass
- [ ] Unit tests for API route pass
- [ ] Integration test: create → finalize → reveal works
- [ ] Edge cases tested (no plan, invalid plan, disabled flag)

### Production Ready
- [ ] Build succeeds
- [ ] TypeScript checks pass
- [ ] No console errors in browser
- [ ] Performance acceptable (< 5s generation)
- [ ] Fallback works reliably

---

## Time Estimates

| Task | Estimated Time | Complexity |
|------|---------------|------------|
| Props alignment | 1 hour | Medium |
| Controller integration | 2 hours | Medium |
| Testing renderer | 1-2 hours | Low |
| **Subtotal: Renderer** | **3-5 hours** | |
| Find finalization point | 30 min | Low |
| Add generation trigger | 30 min | Low |
| Test trigger flow | 30 min | Low |
| **Subtotal: Trigger** | **1-2 hours** | |
| Service layer tests | 1-2 hours | Medium |
| API route tests | 1 hour | Low |
| **Subtotal: Tests** | **2-3 hours** | |
| **TOTAL** | **8-12 hours** | |

---

## Success Criteria

**MVP Complete When:**
1. ✅ Plus creator finalizes gift
2. ✅ System generates AI plan automatically
3. ✅ Plan saves to database
4. ✅ Recipient views AI-directed reveal
5. ✅ Chapters, highlights, finale work
6. ✅ Music and controls work
7. ✅ Fallback works if AI disabled or fails
8. ✅ Tests pass
9. ✅ Build succeeds

**Production Ready When:**
1. All MVP criteria met
2. Tested on staging with synthetic data
3. Verified zero Groq billing
4. Error monitoring in place
5. Rollback procedure documented
6. Customer data disclosure reviewed

---

## Getting Help

**Stuck on Renderer Integration?**
- Check AIDirectorCinematicController existing implementation
- Compare with GlobalCinematicController
- Look at comparison page (ai-director-reveal) for working example

**Stuck on Generation Trigger?**
- Search codebase for `ready_to_share` or similar
- Check existing Plus-specific code (Stripe integration)
- Consider dashboard finalization action

**Stuck on Tests?**
- Use existing test files as template (groq-experiment-mocked.ts)
- Mock fetch with vi.fn()
- Focus on happy path + fallback scenarios

---

**Last Updated:** 2026-09-19
**Status:** Ready for Implementation
