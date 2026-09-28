# Plus Feature Verification Checklist

**Date**: 2026-09-26
**Database**: memorypop-test (`lbjtwbpnlruykqgsaiwy`)
**Test Gift**: `beta-test-498303` (ID: `56a1ed54-5392-4864-8f35-cea3b4b42eb6`)

---

## ✅ Prerequisites

- [x] Build passes (`npm run build`)
- [x] Tests pass (50/50 tests)
- [x] Migration applied to test database
- [x] Plus reveal layout restored (8/8 features)
- [x] Beta code entry point verified (complete)
- [x] Standard reveal production fix confirmed

---

## 1. Beta Code Redemption → Plus Reveal Flow

### 1.1 Dashboard Upgrade Flow

**Steps**:
```bash
# Open test dashboard
open http://localhost:3000/dashboard/beta-test-498303
```

**Verification**:
- [ ] Dashboard loads with creator session
- [ ] Plus badge shown (✨ Plus)
- [ ] No upgrade CTA shown (already Plus)
- [ ] Timeline card shows celebration date
- [ ] Contributor stats displayed correctly

**Expected**: Dashboard recognizes Plus status from beta code redemption

---

### 1.2 Prepare Reveal (Plus Gift)

**Steps**:
```bash
# In dashboard, click "Prepare the Reveal"
# Status should update from "collecting" → "ready"
```

**Verification**:
- [ ] Button enabled (≥1 memory exists)
- [ ] Status updates to "ready" (200 OK)
- [ ] No JavaScript errors in console
- [ ] "View Reveal" button appears

**Expected**: Preparation triggers Groq AI plan generation

---

### 1.3 Plus Reveal Playback

**Steps**:
```bash
# Click "View Reveal" or open directly
open http://localhost:3000/m/beta-test-498303/reveal
```

**Verification - Layout Features**:
- [ ] Progress bar visible and updates during playback
- [ ] Restart button (↻) present and functional
- [ ] Chapter eyebrow text shows occasion-specific text
- [ ] Chapter rule divider visible
- [ ] Asset count text ("3 photos · A part of your story")
- [ ] Playback notes section shows context-aware messages
- [ ] "Next memory" button appears during video playback
- [ ] All buttons have proper aria-labels

**Verification - Playback**:
- [ ] Opening card shows title and "Begin" button
- [ ] Chapters display with title cards
- [ ] Memory beats show contributor name + message
- [ ] Photos display in gallery layout (1-3 photos per beat)
- [ ] Video playback works with music ducking
- [ ] Finale memory has special "with love" eyebrow
- [ ] Closing card shows thank you message
- [ ] Memory wall modal opens and displays all memories

**Verification - Plus Features**:
- [ ] Decorative overlays animate (birthday, confetti, etc.)
- [ ] Tile transitions between beats (Premium only)
- [ ] Up to 10 photos per memory
- [ ] Up to 3 GIFs per memory
- [ ] Up to 90 seconds video per memory

**Expected**: Full Plus reveal with all 8 restored features

---

## 2. Groq Plan Save/Reuse

### 2.1 Check Initial Plan Creation

**Steps**:
```sql
-- Connect to test database
SELECT
  memorypop_id,
  model_name,
  model_provider,
  generation_source,
  input_hash,
  created_at,
  updated_at
FROM ai_reveal_plans
WHERE memorypop_id = '56a1ed54-5392-4864-8f35-cea3b4b42eb6';
```

**Verification**:
- [ ] Plan exists in database
- [ ] `model_name`: `openai/gpt-oss-120b`
- [ ] `model_provider`: `groq`
- [ ] `generation_source`: `ai_generated`
- [ ] `input_hash`: non-empty SHA-256 hash
- [ ] `created_at`: timestamp of first preparation
- [ ] `updated_at`: same as `created_at` (first generation)

**Expected**: Plan saved with correct Groq model metadata

---

### 2.2 Refresh Reveal (Plan Reuse)

**Steps**:
```bash
# Refresh reveal page
open http://localhost:3000/m/beta-test-498303/reveal
# Wait for page load, then check database
```

**Query**:
```sql
SELECT
  created_at,
  updated_at,
  generation_source,
  input_hash
FROM ai_reveal_plans
WHERE memorypop_id = '56a1ed54-5392-4864-8f35-cea3b4b42eb6';
```

**Verification**:
- [ ] `created_at`: unchanged (original timestamp)
- [ ] `updated_at`: unchanged (no regeneration)
- [ ] `generation_source`: still `ai_generated`
- [ ] `input_hash`: unchanged
- [ ] Reveal plays identically to first viewing

**Expected**: Plan reused from cache, no Groq API call

---

### 2.3 Force Regeneration

**Steps**:
```bash
# In dashboard, prepare reveal with forceRegenerate flag
# This can be tested via API or by clicking "Prepare" again
curl -X PATCH http://localhost:3000/api/memorypops/56a1ed54-5392-4864-8f35-cea3b4b42eb6/status \
  -H "Content-Type: application/json" \
  -d '{"status":"ready","forceRegenerate":true}'
```

**Query**:
```sql
SELECT
  created_at,
  updated_at,
  generation_version,
  input_hash
FROM ai_reveal_plans
WHERE memorypop_id = '56a1ed54-5392-4864-8f35-cea3b4b42eb6';
```

**Verification**:
- [ ] `created_at`: unchanged (original creation)
- [ ] `updated_at`: NEW timestamp (just now)
- [ ] `generation_version`: incremented (e.g., 1 → 2)
- [ ] `input_hash`: recalculated (may be same if memories unchanged)
- [ ] New plan may differ (AI non-determinism)

**Expected**: Plan regenerated with new Groq API call

---

## 3. Fallback Behavior

### 3.1 Groq Timeout Simulation

**Steps**:
1. Stop Groq API access (temporarily set invalid GROQ_API_KEY)
2. Create new Plus gift
3. Prepare reveal
4. Check result

**Environment**:
```bash
# Temporarily break Groq access
export GROQ_API_KEY="invalid-key-for-testing"
npm run dev
```

**Verification**:
- [ ] Preparation completes (doesn't hang)
- [ ] No 500 error on status endpoint
- [ ] Plan saved with `generation_source: deterministic_fallback`
- [ ] Reveal plays with deterministic chapter structure
- [ ] No Groq-specific errors in logs

**Expected**: Graceful fallback to deterministic plan

**Restore**:
```bash
# Restore valid key
export GROQ_API_KEY="<original-key>"
```

---

### 3.2 Invalid Input Handling

**Steps**:
1. Create Plus gift with minimal data:
   - 1 memory only
   - No photos/videos
   - Very short message

**Verification**:
- [ ] Preparation succeeds (doesn't reject)
- [ ] Plan generated (AI or fallback)
- [ ] Reveal plays with available content
- [ ] No validation errors

**Expected**: System handles edge cases gracefully

---

## 4. Authorization Checks

### 4.1 Non-Creator Access (Share Code)

**Steps**:
```bash
# Open reveal without creator session (incognito/different browser)
open http://localhost:3000/m/beta-test-498303/reveal
```

**Verification**:
- [ ] Reveal loads successfully
- [ ] Plus features render correctly
- [ ] No authorization errors
- [ ] Music and playback controls work

**Expected**: Recipients can view Plus reveal without creator session

---

### 4.2 Creator-Only Operations

**Test 1: Prepare Reveal (Non-Creator)**
```bash
# Try to prepare reveal without creator session
curl -X PATCH http://localhost:3000/api/memorypops/56a1ed54-5392-4864-8f35-cea3b4b42eb6/status \
  -H "Content-Type: application/json" \
  -d '{"status":"ready"}'
```

**Verification**:
- [ ] Returns 401 Unauthorized
- [ ] Status NOT updated in database
- [ ] Error message: "Unauthorized: creator session required"

**Test 2: Beta Code Redemption (Non-Creator)**
```bash
# Try to redeem code without creator session
curl -X POST http://localhost:3000/api/memorypops/56a1ed54-5392-4864-8f35-cea3b4b42eb6/redeem-beta-code \
  -H "Content-Type: application/json" \
  -d '{"code":"TEST-BETA-CODE"}'
```

**Verification**:
- [ ] Returns 403 Forbidden
- [ ] Error message: "Unauthorized. Only the creator can upgrade this MemoryPop."
- [ ] `is_premium` NOT changed in database

**Expected**: Creator-only operations properly protected

---

## 5. Standard Reveal (Non-Plus)

### 5.1 Create Standard Gift

**Steps**:
```bash
# Create new gift without Plus
# Visit create page: http://localhost:3000/create
# Fill form without beta code
```

**Gift Data**:
- Recipient: "Test User"
- Occasion: Birthday
- 1-2 memories added
- NO beta code redeemed

**Verification**:
- [ ] Gift created successfully
- [ ] `is_premium`: false in database
- [ ] No Plus badge in dashboard
- [ ] Upgrade CTA shown in dashboard

---

### 5.2 Prepare Standard Reveal

**Steps**:
```bash
# In dashboard, click "Prepare the Reveal"
```

**Verification**:
- [ ] Preparation succeeds (200 OK)
- [ ] Status updates to "ready"
- [ ] NO AI plan created (check `ai_reveal_plans` table)
- [ ] No Groq API call in logs
- [ ] "View Reveal" button appears

**Expected**: Standard preparation skips AI Director logic

---

### 5.3 Standard Reveal Playback

**Steps**:
```bash
# Click "View Reveal"
```

**Verification**:
- [ ] Standard reveal loads (NOT Plus controller)
- [ ] Simple sequential memory display
- [ ] No chapter cards or decorative overlays
- [ ] No tile transitions
- [ ] Standard media limits enforced (3 photos, 1 GIF, 15s video)
- [ ] Music plays (Standard soundbed)
- [ ] Closing card shows final message

**Expected**: Standard reveal experience with no Plus features

---

## 6. Database Schema Completeness

### 6.1 Test Database Schema

**Query**:
```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'memorypops'
  AND column_name IN ('is_premium', 'upgraded_at', 'upgrade_source')
ORDER BY column_name;
```

**Expected**:
```
column_name    | data_type | is_nullable | column_default
---------------+-----------+-------------+----------------
is_premium     | boolean   | NO          | false
upgraded_at    | timestamp | YES         | NULL
upgrade_source | text      | YES         | NULL
```

**Verification**:
- [ ] All Plus columns exist
- [ ] `is_premium` defaults to false
- [ ] Columns nullable as expected

---

### 6.2 Production Database Schema

**Query** (to run in production Supabase SQL Editor):
```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'memorypops'
  AND column_name IN ('is_premium', 'upgraded_at', 'upgrade_source')
ORDER BY column_name;
```

**Expected**:
```
column_name    | data_type | is_nullable | column_default
---------------+-----------+-------------+----------------
is_premium     | boolean   | NO          | false
```

**Notes**:
- Production has `is_premium` (from PRODUCTION_FIX_ADD_IS_PREMIUM.sql)
- Production does NOT have `upgraded_at` or `upgrade_source` yet
- These will be added when needed for beta code tracking

**Verification**:
- [ ] `is_premium` exists in production
- [ ] No PostgreSQL errors for Standard gifts

---

## 7. Environment Variables

### 7.1 Required Variables

**Local Development** (.env.local):
```bash
# AI Director
ENABLE_AI_DIRECTOR=true
GROQ_API_KEY=gsk_...

# Plus Features
ENABLE_PREMIUM_BETA=true

# Database
NEXT_PUBLIC_SUPABASE_URL=https://lbjtwbpnlruykqgsaiwy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

**Production** (Vercel Environment Variables):
```bash
# Required for Plus
ENABLE_AI_DIRECTOR=true
GROQ_API_KEY=gsk_... (production key)

# Beta mode (disable when Stripe ready)
ENABLE_PREMIUM_BETA=true

# Database
NEXT_PUBLIC_SUPABASE_URL=https://gvfpgawbvuttglfscngg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

**Verification**:
- [ ] All variables set in Vercel project settings
- [ ] Production uses correct Supabase project
- [ ] GROQ_API_KEY has sufficient quota
- [ ] No secrets exposed in client bundle

---

## 8. Error Scenarios

### 8.1 Prepare with No Memories

**Steps**:
```bash
# Create Plus gift with zero memories
# Try to prepare reveal
```

**Expected**:
- [ ] Prepare button disabled (memoryCount === 0)
- [ ] OR: API returns error "No memories found"
- [ ] Status NOT updated to "ready"

---

### 8.2 Reveal Before Preparation

**Steps**:
```bash
# Create Plus gift, add memories, but DON'T prepare
# Try to open reveal directly
open http://localhost:3000/m/<share-code>/reveal
```

**Expected**:
- [ ] Redirect to contribution page OR
- [ ] Show "Not ready yet" message
- [ ] NO reveal playback

---

### 8.3 Concurrent Preparation

**Steps**:
```bash
# Open dashboard in 2 browser tabs
# Click "Prepare the Reveal" in both simultaneously
```

**Expected**:
- [ ] One request acquires lock and generates plan
- [ ] Other request waits, then reuses plan
- [ ] No duplicate plan creation
- [ ] No 409 conflict errors
- [ ] Both dashboards update correctly

---

## 9. Performance & Logs

### 9.1 Preparation Time

**Measurement**:
```bash
# Time the preparation request
time curl -X PATCH http://localhost:3000/api/memorypops/<id>/status \
  -H "Content-Type: application/json" \
  -d '{"status":"ready"}'
```

**Expected**:
- [ ] Groq generation: 3-10 seconds (depends on memory count)
- [ ] Cached plan reuse: < 1 second
- [ ] Deterministic fallback: < 2 seconds
- [ ] No timeout errors (60s max)

---

### 9.2 Console Logs

**Check for**:
- [ ] No React warnings in browser console
- [ ] No hydration errors
- [ ] No unhandled promise rejections
- [ ] Server logs show "[AI_DIRECTOR] Preparation complete"

---

## Summary

**Total Checks**: 98
**Critical Path**:
1. Beta code redemption → Plus reveal
2. Groq plan save/reuse
3. Standard reveal still works
4. Authorization enforcement

**Completion Criteria**:
- All critical checks pass
- No P0 bugs found
- Performance acceptable
- Ready for production deployment
