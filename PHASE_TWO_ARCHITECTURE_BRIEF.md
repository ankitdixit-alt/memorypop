# Phase-Two Production AI Architecture Brief

**Date:** September 15, 2026
**Status:** Planning - NOT approved for implementation
**Blocker Status:** 5 blockers identified, must resolve before proceeding

---

## Executive Summary

This document specifies the architecture for production AI integration in MemoryPop Plus tier, subject to verification of Gemini API terms compliance and implementation of required safety/fallback mechanisms.

**Zero-spend requirement:** No additional AI API spending approved. Free tier only, if terms permit.

**Critical constraint:** AI provider feasibility against Google's official terms could not be verified from this environment due to network restrictions. Manual verification required before proceeding.

---

## 1. Current State

### What Exists (Development Prototype)

**Routes:** (Development-only, 404 in production)
- `/ai-director-preview` - Evidence view showing experiment results
- `/ai-director-reveal` - Interactive prototype with full Plus presentation

**AI Library:** (Development-guarded)
- Provider abstraction layer (`src/lib/ai/revealPlanner.ts`)
- Gemini provider implementation (`src/lib/ai/providers/gemini.ts`)
- Mock planner for synthetic fixtures (`src/lib/ai/mockRevealPlanner.ts`)
- Type definitions and validation (`src/lib/ai/types.ts`)

**Features Demonstrated:**
- AI-curated chapter structure
- Memory reordering for emotional flow
- Finale selection and highlights
- Tile transitions (6 variants)
- Occasion-aware decorations
- Opening/closing text generation
- Standard vs Plus comparison

**Data:** Synthetic fixtures only, no customer data, no production Gemini calls

### What's Missing (Blockers)

1. ❌ **Production-ready deterministic fallback** - Current mock/standard planners have development guards
2. ❌ **Gemini API terms verification** - Could not access official documentation (network restrictions)
3. ⚠️ **Content sanitization layer** - Contribution messages passed directly to AI without filtering
4. ⚠️ **User consent mechanism** - No checkbox or privacy disclosure for AI processing
5. ⚠️ **API key rotation** - Current GEMINI_API_KEY exposed during development, must rotate

### What Works in Production (No Changes)

**Premium Tier Features:**
- Choice modal (Experience vs Browse)
- Audio-enhanced reveal (`/m/[shareCode]/reveal`)
- Cinematic memory screen with transitions
- Reaction prompts
- Gallery browse mode (Memory Wall)

**Controlled by:**
- `is_premium` database flag (set by Stripe payment webhook)
- `hasPremiumAccess()` entitlement check
- No AI required, works with arbitrary content

---

## 2. Provider-Independent Reveal Plan Contract

### Input Schema

```typescript
interface RevealPlanInput {
  memoryPopId: string           // For plan caching (not sent to AI)
  recipientName: string         // ⚠️ PII - person being celebrated
  occasion: string              // 'birthday' | 'retirement' | 'anniversary' | 'sympathy'
  tone: string                  // e.g., 'nostalgic_reflective', 'celebratory'
  story: string                 // Creator's description of MemoryPop
  memories: MemoryMetadata[]    // Array of contribution metadata
  creatorInstructions?: string  // ⚠️ Optional guidance from creator
}

interface MemoryMetadata {
  id: string                    // Temporary identifier (mem_001, mem_002...)
  contributorName: string       // ⚠️ PII - contributor's name
  message: string               // ⚠️ Personal message text
  photoCount: number            // Count only, no files
  gifCount: number              // Count only, no files
  videoDuration?: number        // Seconds only, no file
  createdAt: Date               // Submission timestamp
}
```

**What's Included:**
- ✅ Text content (names, messages, instructions)
- ✅ Media metadata (counts, durations)
- ✅ Temporal data (createdAt timestamps)

**What's Excluded:**
- ❌ Media files (photos, GIFs, videos)
- ❌ Media base64 or binary data
- ❌ Media URLs or file paths
- ❌ Customer account IDs
- ❌ Email addresses
- ❌ Payment information
- ❌ Authentication tokens
- ❌ Supabase credentials

**Privacy Implications:**
1. ⚠️ **Personal names included** - Recipient and contributor names sent to AI
2. ⚠️ **Personal messages included** - Full contribution text sent to AI
3. ⚠️ **Text-only limitation** - AI cannot inspect media content for appropriateness
4. ⚠️ **Prompt injection risk** - creatorInstructions could manipulate AI behavior

### Output Schema

```typescript
interface RevealPlan {
  opening: string                        // Opening text for reveal intro
  chapters: Chapter[]                    // Thematic groupings
  highlightMemoryIds: string[]           // Memories to emphasize visually
  finaleMemoryId: string                 // Final memory to end with
  reasoningSummary: string               // Why this plan (for debugging)
  // Optional extensions
  openingTitle?: string                  // Title for opening card
  closingText?: string                   // Text for closing card
  decorativeTheme?: DecorativeTheme      // Decoration configuration
  transitions?: Map<string, TransitionPlan> // Per-scene transition choices
}

interface Chapter {
  title: string                          // Chapter name (e.g., "Family Love")
  memoryIds: string[]                    // Ordered memory IDs in this chapter
  description?: string                   // Optional chapter description
  emotionalTone?: 'joyful' | 'heartfelt' | 'funny' | 'reflective' | 'celebratory'
  pacing?: 'normal' | 'slow' | 'fast'    // Playback speed suggestion
}
```

**Validation Requirements:**
1. ✅ All input memory IDs must appear exactly once in output
2. ✅ No invented memory IDs allowed
3. ✅ Finale memory ID must be in highlightMemoryIds
4. ✅ At least one chapter required
5. ✅ Chapter titles must be unique

**Rejection Criteria:**
- Missing memories (not all IDs included)
- Duplicate memory IDs (same memory in multiple chapters)
- Invalid memory IDs (not in input)
- Empty chapters (no memories assigned)
- Invalid finale ID (not in input or highlights)

---

## 3. Provider Abstraction Layer

### Current Implementation

**File:** `src/lib/ai/revealPlanner.ts`

```typescript
import { generateWithGemini } from './providers/gemini'

export async function generateRevealPlan(input: RevealPlanInput): Promise<RevealPlan> {
  return generateWithGemini(input)
}

export function getCurrentProvider(): string {
  return 'gemini-3.5-flash-lite'
}
```

**Swapping Providers:**
To switch from Gemini to OpenAI:

1. Create `src/lib/ai/providers/openai.ts`
2. Implement `generateWithOpenAI(input: RevealPlanInput): Promise<RevealPlan>`
3. Update `revealPlanner.ts`: `return generateWithOpenAI(input)`
4. Update `getCurrentProvider()`: `return 'gpt-4o-mini'`

No changes required in:
- Application routes
- Database schema
- Frontend components
- Validation logic

### Provider Requirements

Any AI provider must:
1. Accept `RevealPlanInput` schema
2. Return valid `RevealPlan` schema
3. Handle validation errors gracefully
4. Support timeouts (max 30 seconds)
5. Support quota/rate limit errors
6. Log failures for monitoring

---

## 4. Dependable Fallback Strategy

### Fallback Chain (Proposed)

```typescript
// src/lib/ai/revealPlanManager.ts

export async function getRevealPlan(
  memoryPopId: string,
  input: RevealPlanInput
): Promise<{ plan: RevealPlan; source: 'saved' | 'ai' | 'deterministic' }> {

  // 1. Check for valid saved plan matching content version
  const savedPlan = await loadSavedPlan(memoryPopId, input.memories)
  if (savedPlan && validateRevealPlan(savedPlan, input.memories)) {
    return { plan: savedPlan, source: 'saved' }
  }

  // 2. Try AI generation (if enabled and quota available)
  if (isAIEnabled() && await hasQuotaRemaining()) {
    try {
      const aiPlan = await generateRevealPlan(input)
      if (validateRevealPlan(aiPlan, input.memories)) {
        await savePlan(memoryPopId, aiPlan, input.memories)
        return { plan: aiPlan, source: 'ai' }
      }
    } catch (error) {
      console.error('AI generation failed, falling back:', error)
      // Continues to deterministic fallback
    }
  }

  // 3. Fall back to deterministic planner (always available)
  const deterministicPlan = generateDeterministicRevealPlan(
    input.memories,
    input.occasion,
    input.recipientName
  )
  return { plan: deterministicPlan, source: 'deterministic' }
}
```

### Saved Plan Storage

**Database Schema:**
```sql
CREATE TABLE reveal_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  memorypop_id UUID REFERENCES memorypops(id) ON DELETE CASCADE,
  content_hash TEXT NOT NULL,  -- SHA-256 of sorted memory IDs
  plan JSONB NOT NULL,
  source TEXT NOT NULL,        -- 'ai' | 'deterministic'
  provider TEXT,               -- 'gemini-3.5-flash-lite' | null
  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(memorypop_id, content_hash)
);

CREATE INDEX idx_reveal_plans_memorypop ON reveal_plans(memorypop_id);
CREATE INDEX idx_reveal_plans_hash ON reveal_plans(content_hash);
```

**Content Version Matching:**
```typescript
function calculateContentHash(memories: MemoryMetadata[]): string {
  // Sort memory IDs to ensure consistent hash
  const sortedIds = memories.map(m => m.id).sort()
  return crypto.createHash('sha256').update(sortedIds.join(',')).digest('hex')
}

async function loadSavedPlan(
  memoryPopId: string,
  memories: MemoryMetadata[]
): Promise<RevealPlan | null> {
  const hash = calculateContentHash(memories)
  const result = await supabase
    .from('reveal_plans')
    .select('plan')
    .eq('memorypop_id', memoryPopId)
    .eq('content_hash', hash)
    .single()

  return result.data?.plan || null
}
```

**Invalidation Rules:**
- New memory added → Hash changes → Saved plan invalid
- Memory deleted → Hash changes → Saved plan invalid
- Memory edited → Hash changes → Saved plan invalid
- Reveal viewed without changes → Hash matches → Reuse saved plan

### Deterministic Planner (REQUIRED)

**Status:** ❌ NOT IMPLEMENTED (blocker)

**Current state:** Mock and standard planners have development guards

**Required implementation:**
```typescript
// src/lib/ai/deterministicPlanner.ts

export function generateDeterministicRevealPlan(
  memories: MemoryMetadata[],
  occasion: string,
  recipientName: string
): RevealPlan {
  // NO development guard - this IS the production fallback

  // Sort chronologically (newest first, Standard baseline)
  const sorted = [...memories].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  )

  // Select finale (prioritize family if present, else last chronological)
  const finaleMemoryId = selectFinale(sorted, occasion)

  // Generate chapters based on occasion
  const chapters = generateChapters(sorted, occasion)

  // Opening text by occasion
  const opening = generateOpening(occasion, recipientName)

  return {
    opening,
    chapters,
    highlightMemoryIds: [],
    finaleMemoryId,
    reasoningSummary: 'Deterministic MemoryPop planner (no AI)',
    openingTitle: getOccasionTitle(occasion),
    closingText: getClosingText(occasion, recipientName),
    decorativeTheme: getDecorativeTheme(occasion)
  }
}

function selectFinale(
  memories: MemoryMetadata[],
  occasion: string
): string {
  // Priority order:
  // 1. Family members (mom, dad, parents)
  // 2. Message with emotional keywords (love, proud, grateful)
  // 3. Longest message (likely most heartfelt)
  // 4. Last chronological (fallback)

  const familyPatterns = /mom|dad|parent|mother|father|family/i
  const emotionalPatterns = /love|proud|grateful|blessed|cherish/i

  // Check for family member
  const familyMemory = memories.find(m =>
    familyPatterns.test(m.contributorName) ||
    familyPatterns.test(m.message)
  )
  if (familyMemory) return familyMemory.id

  // Check for emotional message
  const emotionalMemory = memories.find(m =>
    emotionalPatterns.test(m.message)
  )
  if (emotionalMemory) return emotionalMemory.id

  // Select longest message
  const longest = memories.reduce((max, m) =>
    m.message.length > max.message.length ? m : max
  , memories[0])

  return longest.id
}

function generateChapters(
  memories: MemoryMetadata[],
  occasion: string
): Chapter[] {
  // Simple two-chapter structure for all occasions
  const midpoint = Math.ceil(memories.length / 2)

  return [
    {
      title: getFirstChapterTitle(occasion),
      memoryIds: memories.slice(0, midpoint).map(m => m.id),
      emotionalTone: 'joyful'
    },
    {
      title: getSecondChapterTitle(occasion),
      memoryIds: memories.slice(midpoint).map(m => m.id),
      emotionalTone: 'heartfelt'
    }
  ]
}
```

**Must handle:**
- ✅ Arbitrary number of memories (1 to unlimited)
- ✅ Any occasion type
- ✅ Missing or empty recipient name
- ✅ Mixed media types (photos, GIFs, videos)
- ✅ No external dependencies (no API calls)
- ✅ Fast execution (<100ms)

**Quality standards:**
- ✅ Better than pure chronological (Standard baseline)
- ✅ Finale feels meaningful (not just last submission)
- ✅ Chapter structure makes sense for occasion
- ✅ Opening/closing text appropriate for occasion
- ✅ Decorations match occasion theme

---

## 5. Privacy and Disclosure Requirements

### Data Processing Disclosure

**Required user-facing disclosure (if AI enabled):**

> **AI-Enhanced Curation**
>
> MemoryPop Plus uses AI to arrange your memories into a meaningful story. Here's what that means:
>
> - **What's processed:** Contributor names, messages, and media counts (not the photos/videos themselves)
> - **How it's used:** AI suggests an emotional flow, chapter structure, and finale selection
> - **Provider:** Google Gemini API
> - **What AI can't see:** Photos, GIFs, and videos are not sent to AI. Only text is processed.
> - **Your control:** You can preview and use the Standard experience instead (chronological, no AI)
>
> By continuing, you consent to AI processing of contribution text for curation purposes.

**Privacy policy additions:**
1. AI provider name and version
2. What data is sent to AI (text only)
3. What data is NOT sent (media files, account IDs, payment info)
4. How AI output is validated
5. How to opt out (use Standard mode)
6. Data retention by AI provider (if applicable)

### User Consent Mechanism

**Implementation:** Add checkbox to MemoryPop creation flow

**Location:** `/create` page, before final submission

**UI mockup:**
```
┌─────────────────────────────────────────────┐
│ [ ] Use AI to curate my reveal              │
│                                             │
│     MemoryPop Plus will arrange memories    │
│     into chapters and select a finale.      │
│     Learn more about AI curation →          │
│                                             │
│     If unchecked, memories will appear      │
│     in chronological order (Standard).      │
└─────────────────────────────────────────────┘
```

**Database schema addition:**
```sql
ALTER TABLE memorypops
ADD COLUMN ai_curation_consent BOOLEAN DEFAULT false;
```

**Enforcement:**
```typescript
async function getRevealPlan(memoryPopId: string, input: RevealPlanInput) {
  const memoryPop = await getMemoryPop(memoryPopId)

  // Check consent and premium access
  const useAI = memoryPop.ai_curation_consent &&
                hasPremiumAccess(memoryPop) &&
                isAIEnabled()

  if (!useAI) {
    // Skip AI, use deterministic planner
    return generateDeterministicRevealPlan(...)
  }

  // Proceed with AI generation attempt
  ...
}
```

### Text-Only AI Limitation

**Disclosure requirement:**
```
⚠️ AI Limitation: Media Content Not Inspected

MemoryPop's AI curation reads contributor messages but cannot
inspect photos, videos, or GIFs. MemoryPop creators are
responsible for reviewing all media content for appropriateness
before sharing.
```

**Implications:**
- AI cannot detect inappropriate images
- AI cannot identify faces or people in photos
- AI cannot verify video content matches message
- AI cannot assess image quality or composition
- AI makes decisions based solely on text (names, messages, counts)

**Mitigation:**
- Provide creator preview before sharing
- Include reporting mechanism for inappropriate content
- Creator dashboard shows all media (not just AI-selected)
- Terms of service clarify creator responsibility

---

## 6. Content Sanitization Layer

### Required Before Production

**Purpose:** Prevent prompt injection, filter offensive content, limit input size

**Implementation:**
```typescript
// src/lib/ai/contentSanitization.ts

export function sanitizeRevealPlanInput(
  input: RevealPlanInput
): RevealPlanInput {
  return {
    ...input,
    recipientName: sanitizeName(input.recipientName),
    story: sanitizeText(input.story, 1000),
    memories: input.memories.map(sanitizeMemory),
    creatorInstructions: input.creatorInstructions
      ? sanitizeInstructions(input.creatorInstructions)
      : undefined
  }
}

function sanitizeName(name: string): string {
  // Remove control characters and trim
  return name.replace(/[\x00-\x1F\x7F-\x9F]/g, '').trim()
}

function sanitizeText(text: string, maxLength: number): string {
  // Remove control characters
  let clean = text.replace(/[\x00-\x1F\x7F-\x9F]/g, '')

  // Limit length
  if (clean.length > maxLength) {
    clean = clean.substring(0, maxLength)
  }

  return clean.trim()
}

function sanitizeMemory(memory: MemoryMetadata): MemoryMetadata {
  return {
    ...memory,
    contributorName: sanitizeName(memory.contributorName),
    message: sanitizeMessage(memory.message)
  }
}

function sanitizeMessage(message: string): string {
  let clean = message

  // Remove control characters
  clean = clean.replace(/[\x00-\x1F\x7F-\x9F]/g, '')

  // Remove potential prompt injection patterns
  const injectionPatterns = [
    /ignore\s+(previous|all|above)\s+(instructions|prompts|commands)/gi,
    /new\s+instructions?:/gi,
    /system\s*:/gi,
    /\[SYSTEM\]/gi,
    /\{\{.*\}\}/g  // Template injection attempts
  ]

  injectionPatterns.forEach(pattern => {
    clean = clean.replace(pattern, '[removed]')
  })

  // Limit length (1000 chars per message)
  if (clean.length > 1000) {
    clean = clean.substring(0, 1000)
  }

  return clean.trim()
}

function sanitizeInstructions(instructions: string): string {
  // More aggressive filtering for creator instructions
  let clean = instructions

  // Remove control characters
  clean = clean.replace(/[\x00-\x1F\x7F-\x9F]/g, '')

  // Limit length (500 chars)
  if (clean.length > 500) {
    clean = clean.substring(0, 500)
  }

  // Remove role-play or persona injection attempts
  const rolePatterns = [
    /you\s+are\s+(now|a)/gi,
    /pretend\s+to\s+be/gi,
    /act\s+as/gi,
    /roleplay/gi
  ]

  rolePatterns.forEach(pattern => {
    clean = clean.replace(pattern, '')
  })

  return clean.trim()
}
```

**Usage:**
```typescript
async function generateRevealPlan(input: RevealPlanInput): Promise<RevealPlan> {
  // Sanitize before sending to AI
  const sanitized = sanitizeRevealPlanInput(input)

  return generateWithGemini(sanitized)
}
```

---

## 7. Gemini API Terms Verification

### Verification Status: ❌ BLOCKED

**Attempted methods:**
1. WebFetch to https://ai.google.dev/gemini-api/terms
   - Result: Network restrictions blocked access
2. WebSearch for "Gemini API free tier terms EEA UK commercial use"
   - Result: Web search only supported with direct Anthropic connection

**Status:** Unable to verify from this environment

### Required Manual Verification

**Documents to review:**
1. https://ai.google.dev/gemini-api/terms
2. https://ai.google.dev/gemini-api/docs/billing
3. https://ai.google.dev/gemini-api/docs/models/gemini (pricing page)

**Key questions:**
1. ✅ Does free tier permit commercial use?
2. ✅ Does free tier permit customer data processing?
3. ✅ Are there regional restrictions (EEA, UK, Switzerland)?
4. ✅ Is Paid Services requirement mandatory for certain regions?
5. ✅ What are the rate limits and quotas for free tier?
6. ✅ What are the data retention policies?
7. ✅ Are there content filtering or safety requirements?
8. ✅ What are the acceptable use cases?

### Known Constraints (from code inspection)

**From gemini.ts comments:**
```typescript
// BLOCKED: Gemini free-tier cannot be used in production.
// This prototype is for local development only.
```

**From previous documentation mentions:**
- EEA/UK/Swiss Paid Services requirement
- Cannot use free quota with text-only requests for customer data
- Free tier may be for personal/research use only

### If Zero-Spend Requirement Cannot Be Met

**Document limitation:**
```
⚠️ Gemini API Free Tier Limitation

Google Gemini API free tier does not permit customer data
processing in production for [specific reason from terms].

Options:
1. Upgrade to Gemini paid tier (requires budget approval)
2. Switch to alternative provider (OpenAI, Anthropic, Mistral)
3. Use deterministic planner only (no AI)

Recommendation: [Based on verification results]
```

**Leave AI disabled:**
- Use deterministic planner for all Plus tier reveals
- Preserve Plus visual presentation without AI curation
- No additional API spending
- No terms violations

---

## 8. API Key Security

### Current State

**Location:** `.env.local` line 23
```
GEMINI_API_KEY=AIz...
```

**Status:** ⚠️ Exposed during development and testing

**Risk:** If this key is used with customer data, it could be:
- Logged in development environments
- Cached in browser dev tools
- Exposed in error messages
- Tracked in monitoring systems

### Required Before Production AI

**1. Generate new API key**
- Log into Google AI Studio
- Create new Gemini API key
- Name: "MemoryPop Production AI - 2026-09"

**2. Rotate in environment**
```bash
# Update .env.local
GEMINI_API_KEY=NEW_KEY_HERE

# Restart Next.js dev server
npm run dev
```

**3. Revoke old key**
- Delete old key from Google AI Studio
- Document rotation in security log

**4. Store securely**
- Add to password manager (1Password, LastPass)
- Share with team via secure channel (not Slack, not email)
- Document as "rotated 2026-09-15" in security log

### Key Management Best Practices

**Development:**
- Use separate dev key (not production)
- Limit permissions (Gemini API only)
- Set usage quotas (prevent runaway costs)

**Production:**
- Environment variable only (never in code)
- Rotate quarterly or on suspected exposure
- Monitor usage for anomalies
- Alert on quota exhaustion

---

## 9. Implementation Sequence

### Phase 2a: Foundation (Required Before Any Production AI)

**Duration:** 3-5 days
**Dependencies:** None
**Approval:** Founder review required

**Tasks:**
1. ✅ Manually verify Gemini API terms and billing
2. ✅ Document findings in GEMINI_API_TERMS_VERIFICATION.md
3. ✅ Decision: Proceed with Gemini, switch provider, or disable AI

**Deliverable:** Go/no-go decision on production AI

### Phase 2b: Fallback Implementation (BLOCKER)

**Duration:** 2-3 days
**Dependencies:** Phase 2a decision
**Approval:** Founder code review required

**Tasks:**
1. ✅ Implement `generateDeterministicRevealPlan()` without guards
2. ✅ Test with arbitrary memory content (not just fixtures)
3. ✅ Verify quality better than chronological baseline
4. ✅ Add unit tests for deterministic planner

**Deliverable:** Production-ready fallback that works with any content

### Phase 2c: Security Hardening

**Duration:** 2 days
**Dependencies:** Phase 2b complete
**Approval:** Security review required

**Tasks:**
1. ✅ Implement content sanitization layer
2. ✅ Rotate GEMINI_API_KEY
3. ✅ Add input validation before AI calls
4. ✅ Add error handling for injection attempts

**Deliverable:** Secure AI input pipeline

### Phase 2d: Saved Plan Storage

**Duration:** 2-3 days
**Dependencies:** Phase 2b complete
**Approval:** Database schema review required

**Tasks:**
1. ✅ Create `reveal_plans` table migration
2. ✅ Implement plan caching logic
3. ✅ Add content hash calculation
4. ✅ Test cache invalidation on memory changes

**Deliverable:** Plan persistence to avoid redundant AI calls

### Phase 2e: User Consent and Privacy

**Duration:** 2 days
**Dependencies:** Phase 2c complete
**Approval:** Legal review required

**Tasks:**
1. ✅ Add AI consent checkbox to creation flow
2. ✅ Update privacy policy with AI disclosure
3. ✅ Add "Learn more" modal explaining AI curation
4. ✅ Implement consent enforcement in plan generation

**Deliverable:** Compliant user consent mechanism

### Phase 2f: Integration and Testing

**Duration:** 3-4 days
**Dependencies:** All previous phases complete
**Approval:** Full product review required

**Tasks:**
1. ✅ Wire up fallback chain in production routes
2. ✅ Test complete flow: saved → AI → deterministic
3. ✅ Test error cases (timeout, quota, invalid response)
4. ✅ Add monitoring and analytics
5. ✅ Remove development guards from AI library
6. ✅ Enable production AI behind feature flag

**Deliverable:** Production-ready AI integration

### Phase 2g: Controlled Rollout

**Duration:** 1-2 weeks
**Dependencies:** Phase 2f complete
**Approval:** Founder approval for each stage

**Stages:**
1. ✅ Internal testing (team MemoryPops only)
2. ✅ Beta users (10-20 selected creators)
3. ✅ Gradual rollout (10% → 50% → 100% of Premium)
4. ✅ Monitor metrics (success rate, fallback rate, user satisfaction)

**Deliverable:** Full production AI launch

---

## 10. Monitoring and Observability

### Metrics to Track

**AI Generation Metrics:**
- Success rate (% of AI calls returning valid plans)
- Fallback rate (% using deterministic planner)
- Average generation time (p50, p95, p99)
- Quota usage (requests per day, tokens per day)
- Error rate by type (timeout, invalid, quota exceeded)

**Plan Quality Metrics:**
- User satisfaction (AI vs Standard comparison)
- Creator edits after AI generation (do they tweak the plan?)
- Replay rate (do recipients watch multiple times?)
- Share rate (do they share the reveal?)

**Content Safety Metrics:**
- Injection attempts detected (sanitization triggers)
- Invalid plans rejected (validation failures)
- Offensive content flags (if filtering added)

### Logging Strategy

**What to log:**
```typescript
// Log all AI generation attempts
logger.info('AI generation started', {
  memoryPopId,
  memoryCount: input.memories.length,
  occasion: input.occasion,
  provider: getCurrentProvider()
})

// Log all outcomes
logger.info('AI generation succeeded', {
  memoryPopId,
  source: 'ai',
  duration: elapsedMs,
  chapterCount: plan.chapters.length
})

logger.warn('AI generation failed, using fallback', {
  memoryPopId,
  error: error.message,
  source: 'deterministic'
})
```

**What NOT to log:**
- ❌ Recipient names
- ❌ Contributor names
- ❌ Contribution messages
- ❌ Creator instructions
- ❌ Full reveal plans (JSONB can be large)

### Alerting Rules

**Critical alerts:**
- AI success rate drops below 90% (check provider status)
- Fallback rate exceeds 50% (quota issue or provider outage)
- Generation time p95 exceeds 10 seconds (performance degradation)
- Injection attempts detected (security issue)

**Warning alerts:**
- AI success rate drops below 95%
- Fallback rate exceeds 25%
- Quota usage at 80% of daily limit

---

## 11. Rollback Plan

### If Production AI Must Be Disabled

**Immediate rollback (< 1 hour):**
```typescript
// src/lib/ai/config.ts
export function isAIEnabled(): boolean {
  return process.env.ENABLE_AI_CURATION === 'true' // Set to 'false' to disable
}
```

**Effect:**
- All Premium reveals use deterministic planner
- No AI calls made
- No quota consumed
- Visual presentation preserved
- User experience unchanged (still Plus quality)

### If Gemini Provider Must Be Replaced

**Provider swap (< 1 day):**
1. Create new provider file (e.g., `src/lib/ai/providers/openai.ts`)
2. Implement `generateWithOpenAI()` matching interface
3. Update `revealPlanner.ts` import
4. Test with synthetic fixtures
5. Deploy

**No changes required in:**
- Database schema
- Frontend components
- Validation logic
- Fallback chain
- User consent mechanism

---

## 12. Success Criteria

### Phase-Two Complete When:

1. ✅ Gemini API terms verified and documented
2. ✅ Deterministic fallback implemented and tested
3. ✅ Content sanitization layer in place
4. ✅ API key rotated and secured
5. ✅ User consent mechanism live
6. ✅ Saved plan storage working
7. ✅ Fallback chain tested (saved → AI → deterministic)
8. ✅ Monitoring and alerting configured
9. ✅ Internal testing passed
10. ✅ Founder approval for controlled rollout

### Production AI Enabled When:

1. ✅ All Phase-Two tasks complete
2. ✅ Legal/privacy review passed
3. ✅ Security review passed
4. ✅ Beta testing successful (10-20 users)
5. ✅ Metrics show > 90% AI success rate
6. ✅ Fallback handles failures gracefully
7. ✅ User satisfaction positive (AI vs Standard)
8. ✅ No security incidents during beta
9. ✅ Founder approves full rollout

---

## 13. Appendix: Zero-Spend Alternatives

### If Gemini Free Tier Cannot Be Used

**Option 1: Upgrade to Gemini Paid Tier**
- Cost: ~$0.10-0.50 per 1000 reveals (estimate)
- Pros: Same provider, minimal code changes
- Cons: Requires budget approval, ongoing costs

**Option 2: Switch to Alternative Provider**

**Anthropic Claude (via Claude API):**
- Model: Claude 3.5 Haiku ($0.25 / 1M input tokens)
- Pros: Excellent instruction following, fast
- Cons: Requires billing account

**OpenAI (GPT-4o-mini):**
- Model: gpt-4o-mini ($0.15 / 1M input tokens)
- Pros: Well-documented, stable, low cost
- Cons: Requires billing account

**Mistral (Le Chat):**
- Model: Mistral Small ($0.10 / 1M tokens)
- Pros: Competitive pricing
- Cons: Smaller model, less mature API

**Local LLM (self-hosted):**
- Model: Llama 3.2 or similar
- Pros: No API costs, no data leaving infrastructure
- Cons: Requires GPU infrastructure, maintenance overhead

**Option 3: Deterministic Planner Only (No AI)**
- Cost: $0
- Pros: No API costs, no terms constraints, always available
- Cons: Lower quality curation than AI

**Recommendation:** Implement deterministic fallback first (Phase 2b). Makes Plus tier viable regardless of AI provider decision.

---

**Status:** ✅ Architecture documented, awaiting Phase 2a approval
**Next:** Founder review → Gemini terms verification → Go/no-go decision
**Blockers:** 5 (terms, fallback, sanitization, consent, key rotation)
