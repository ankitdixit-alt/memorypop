# AI Director Integration - Local Testing Guide

## Prerequisites

Before testing, ensure:

1. **Database Migration Applied**
   ```bash
   psql $DATABASE_URL < migrations/012_add_ai_reveal_plans.sql
   ```

2. **Environment Variables Set**
   ```bash
   # In .env.local
   GROQ_API_KEY=gsk_xxxxx    # Get from https://console.groq.com/keys
   ENABLE_AI_DIRECTOR=true   # Feature flag
   ```

3. **Dev Server Running**
   ```bash
   npm run dev
   ```

---

## Test Flow 1: API Route with Synthetic Data

### Step 1: Create Test Plus MemoryPop

Use Supabase dashboard or psql:

```sql
INSERT INTO memorypops (
  id,
  share_code,
  recipient_name,
  occasion,
  mood,
  creator_token,
  is_premium,
  created_at
) VALUES (
  'test-ai-uuid-001',
  'test-ai-reveal',
  'Test Recipient',
  'birthday',
  'joyful',
  'test-creator-token-001',
  true,  -- Plus entitlement
  NOW()
);
```

### Step 2: Add Test Memories

```sql
INSERT INTO memories (
  memorypop_id,
  contributor_name,
  message,
  created_at
) VALUES
  ('test-ai-uuid-001', 'Alice', 'Happy birthday! Hope this year brings you joy!', NOW() - INTERVAL '5 days'),
  ('test-ai-uuid-001', 'Bob', 'You are an amazing friend. Cheers to many more years!', NOW() - INTERVAL '4 days'),
  ('test-ai-uuid-001', 'Charlie', 'Remember that time we went hiking? Best memories!', NOW() - INTERVAL '3 days'),
  ('test-ai-uuid-001', 'Diana', 'Wishing you all the happiness in the world!', NOW() - INTERVAL '2 days'),
  ('test-ai-uuid-001', 'Eve', 'Thank you for being such a wonderful person. Love you!', NOW() - INTERVAL '1 day');
```

### Step 3: Call Generation API

```bash
curl -X POST http://localhost:3000/api/generate-reveal-plan \
  -H "Content-Type: application/json" \
  -d '{
    "memorypopId": "test-ai-uuid-001",
    "creatorToken": "test-creator-token-001"
  }' | jq
```

### Expected Response:

```json
{
  "success": true,
  "plan": {
    "opening": "A celebration of friendship and gratitude",
    "chapters": [
      {
        "title": "Adventures Together",
        "memoryIds": ["mem_003"]
      },
      {
        "title": "Words of Love",
        "memoryIds": ["mem_001", "mem_002", "mem_004", "mem_005"]
      }
    ],
    "highlightMemoryIds": ["mem_002"],
    "finaleMemoryId": "mem_005",
    "reasoningSummary": "Grouped by theme..."
  },
  "source": "ai_generated" | "deterministic_fallback",
  "fromCache": false
}
```

### Step 4: Verify Database Storage

```sql
SELECT
  memorypop_id,
  generation_source,
  model_name,
  input_hash,
  created_at
FROM ai_reveal_plans
WHERE memorypop_id = 'test-ai-uuid-001';
```

Expected: One row with plan data

### Step 5: Test Caching

Repeat Step 3 (call API again):

```bash
curl -X POST http://localhost:3000/api/generate-reveal-plan \
  -H "Content-Type: application/json" \
  -d '{
    "memorypopId": "test-ai-uuid-001",
    "creatorToken": "test-creator-token-001"
  }' | jq '.fromCache'
```

Expected: `true` (plan returned from cache, no Groq call)

---

## Test Flow 2: Reveal Page Integration

### Step 1: Visit Reveal Page

Navigate to: `http://localhost:3000/m/test-ai-reveal/reveal`

### Step 2: Check Browser Console

Open DevTools Console. On Step 1 (cinematic), you should see:

```
[AI_DIRECTOR] Plan available: {
  chapters: 2,
  finale: "mem_005",
  highlights: 1
}
```

This confirms:
- ✅ Plus entitlement detected
- ✅ AI plan fetched from database
- ✅ Plan passed to RevealExperience

**Note:** Standard timeline renders for now (AI Director controller not wired)

---

## Test Flow 3: Auth & Entitlement Checks

### Test 3a: Unauthorized Request (Wrong Token)

```bash
curl -X POST http://localhost:3000/api/generate-reveal-plan \
  -H "Content-Type: application/json" \
  -d '{
    "memorypopId": "test-ai-uuid-001",
    "creatorToken": "wrong-token"
  }'
```

Expected: `HTTP 401 Unauthorized`

### Test 3b: Non-Plus MemoryPop

```sql
-- Create Standard MemoryPop
INSERT INTO memorypops (
  id,
  share_code,
  recipient_name,
  occasion,
  creator_token,
  is_premium,  -- false
  created_at
) VALUES (
  'test-standard-uuid',
  'test-standard',
  'Standard User',
  'birthday',
  'standard-token',
  false,
  NOW()
);
```

```bash
curl -X POST http://localhost:3000/api/generate-reveal-plan \
  -H "Content-Type: application/json" \
  -d '{
    "memorypopId": "test-standard-uuid",
    "creatorToken": "standard-token"
  }'
```

Expected: `HTTP 403 Plus entitlement required`

---

## Test Flow 4: Fallback Scenarios

### Test 4a: AI Generation Disabled

```bash
# In .env.local
ENABLE_AI_DIRECTOR=false
```

Restart dev server, then call API:

```bash
curl -X POST http://localhost:3000/api/generate-reveal-plan \
  -H "Content-Type: application/json" \
  -d '{
    "memorypopId": "test-ai-uuid-001",
    "creatorToken": "test-creator-token-001"
  }' | jq '.source'
```

Expected: `"deterministic_fallback"`

Plan should still be valid and usable.

### Test 4b: Missing API Key

```bash
# In .env.local
# GROQ_API_KEY=   # Comment out
ENABLE_AI_DIRECTOR=true
```

Restart dev server, then call API.

Expected: `"deterministic_fallback"` with error in generation_error column

### Test 4c: Rate Limit (Simulated)

This requires actual Groq rate limiting, which is hard to simulate. On production Free tier (30 RPM), rapid concurrent requests should trigger fallback.

---

## Test Flow 5: Input Staleness Detection

### Step 1: Generate Initial Plan

```bash
curl -X POST http://localhost:3000/api/generate-reveal-plan \
  -H "Content-Type: application/json" \
  -d '{
    "memorypopId": "test-ai-uuid-001",
    "creatorToken": "test-creator-token-001"
  }' | jq '.fromCache'
```

Expected: `false` (new generation)

### Step 2: Verify Cached

Repeat Step 1. Expected: `true` (from cache)

### Step 3: Modify Input (Add Memory)

```sql
INSERT INTO memories (
  memorypop_id,
  contributor_name,
  message,
  created_at
) VALUES (
  'test-ai-uuid-001',
  'Frank',
  'New memory added after initial plan!',
  NOW()
);
```

### Step 4: Regenerate

```bash
curl -X POST http://localhost:3000/api/generate-reveal-plan \
  -H "Content-Type: application/json" \
  -d '{
    "memorypopId": "test-ai-uuid-001",
    "creatorToken": "test-creator-token-001"
  }' | jq '.fromCache'
```

Expected: `false` (input changed, new generation triggered)

### Step 5: Verify Database

```sql
SELECT
  input_hash,
  (plan->'chapters')::text,
  updated_at
FROM ai_reveal_plans
WHERE memorypop_id = 'test-ai-uuid-001';
```

Expected: New input_hash, updated plan with 6 memories, recent updated_at

---

## Test Flow 6: Error Handling

### Test 6a: No Memories

```sql
DELETE FROM memories WHERE memorypop_id = 'test-ai-uuid-001';
```

```bash
curl -X POST http://localhost:3000/api/generate-reveal-plan \
  -H "Content-Type: application/json" \
  -d '{
    "memorypopId": "test-ai-uuid-001",
    "creatorToken": "test-creator-token-001"
  }'
```

Expected: `HTTP 400 No memories to plan`

### Test 6b: Invalid MemoryPop ID

```bash
curl -X POST http://localhost:3000/api/generate-reveal-plan \
  -H "Content-Type: application/json" \
  -d '{
    "memorypopId": "nonexistent-uuid",
    "creatorToken": "any-token"
  }'
```

Expected: `HTTP 404 MemoryPop not found`

---

## Verification Checklist

Before considering integration complete:

### Infrastructure
- [ ] Database migration applied
- [ ] ai_reveal_plans table exists with RLS enabled
- [ ] Environment variables set

### API Route
- [ ] Accepts POST requests
- [ ] Rejects unauthorized requests (wrong token)
- [ ] Rejects non-Plus MemoryPops
- [ ] Generates and saves plans
- [ ] Returns cached plans on repeat calls
- [ ] Detects stale inputs and regenerates
- [ ] Falls back to deterministic on errors

### Reveal Page
- [ ] Fetches AI plans for Plus MemoryPops
- [ ] Passes plan to RevealExperience
- [ ] Logs plan availability in console
- [ ] Renders Standard timeline (AI Director wiring pending)

### Fallback Logic
- [ ] Works when ENABLE_AI_DIRECTOR=false
- [ ] Works when GROQ_API_KEY missing
- [ ] Deterministic plan is valid and complete
- [ ] No errors thrown, graceful degradation

### Security
- [ ] API key never exposed to client
- [ ] Creator token verified before generation
- [ ] Plus entitlement checked
- [ ] Service role database access only

---

## Common Issues & Solutions

### Issue: API returns 403 even for Plus MemoryPop

**Check:**
1. `is_premium` column is `true`
2. `ENABLE_PREMIUM_BETA=true` in environment (if using beta flag)

**Solution:**
```sql
UPDATE memorypops
SET is_premium = true
WHERE id = 'test-ai-uuid-001';
```

### Issue: API always returns deterministic_fallback

**Check:**
1. `ENABLE_AI_DIRECTOR=true` in .env.local
2. `GROQ_API_KEY` is set correctly
3. Dev server was restarted after env changes

**Debug:**
Check terminal for errors like:
```
GROQ_API_KEY not configured
```

### Issue: Console log doesn't show plan

**Check:**
1. Viewing the reveal page, not dashboard
2. Using Plus MemoryPop (`is_premium = true`)
3. Plan exists in database
4. Browser DevTools console is open

**Debug:**
```sql
SELECT * FROM ai_reveal_plans
WHERE memorypop_id = 'test-ai-uuid-001';
```

Should return one row.

### Issue: Build fails with TypeScript errors

**Common cause:** Missing type imports

**Solution:**
```bash
npm run build 2>&1 | grep "error TS"
```

Fix any import errors, then rebuild.

---

## Performance Benchmarks

Expected timings on Free tier:

- **First generation:** 2-8 seconds
- **Cached retrieval:** < 100ms
- **Deterministic fallback:** < 50ms
- **Timeout threshold:** 30 seconds

If generation takes > 15 seconds, check Groq status: https://status.groq.com

---

## Next Steps After Testing

Once all tests pass:

1. **Complete Renderer Integration**
   - Wire AIDirectorCinematicController
   - Test with Plus allowances
   - Verify transitions and music

2. **Add Generation Trigger**
   - Identify finalization endpoint
   - Call generation API after validation
   - Make fire-and-forget (don't block sharing)

3. **Production Deployment**
   - Apply migration to production database
   - Set environment variables
   - Keep ENABLE_AI_DIRECTOR=false initially
   - Test on staging with synthetic data

4. **Gradual Rollout**
   - Enable for beta Plus users
   - Monitor error rates
   - Collect feedback
   - Expand to all Plus

---

## Support & Debugging

### Enable Verbose Logging

```typescript
// In revealPlanService.ts (temporarily)
console.log('[GENERATION] Input:', input);
console.log('[GENERATION] Result:', result);
```

### Check Groq API Status

- https://status.groq.com
- https://console.groq.com/usage (check rate limits)

### Database Queries

```sql
-- List all plans
SELECT
  memorypop_id,
  generation_source,
  model_name,
  created_at
FROM ai_reveal_plans
ORDER BY created_at DESC
LIMIT 10;

-- Plan details
SELECT
  plan,
  input_snapshot,
  generation_error
FROM ai_reveal_plans
WHERE memorypop_id = 'your-uuid';
```

---

**Last Updated:** 2026-09-19
**Version:** 1.0
