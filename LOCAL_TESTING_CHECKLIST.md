# Local Testing Checklist

**Status**: Ready for execution after Docker/Supabase installation

---

## Prerequisites ⚠️ BLOCKED

### Installation Required

1. **Docker Desktop** (Apple Silicon)
   ```bash
   # Option 1: Direct download
   open "https://desktop.docker.com/mac/main/arm64/Docker.dmg"

   # Option 2: Homebrew
   brew install --cask docker
   ```

   After installation:
   - Launch Docker Desktop from Applications
   - Wait for Docker engine to start (whale icon in menu bar)
   - Verify: `docker --version` (should show 20.x or later)

2. **Supabase CLI**
   ```bash
   brew install supabase/tap/supabase

   # Verify
   supabase --version  # Should show 1.x
   ```

### Environment Setup

3. **Run setup script**
   ```bash
   cd ~/Downloads/MemoryPop/memorypop
   ./scripts/setup-local-supabase.sh
   ```

   This will:
   - Initialize Supabase project
   - Start local PostgreSQL + Studio
   - Apply migrations 012-015
   - Display connection keys

4. **Configure environment**
   ```bash
   # Backup production config
   cp .env.local .env.local.production

   # Copy template
   cp .env.local.supabase.template .env.local

   # Edit .env.local and paste keys from supabase start output:
   # - NEXT_PUBLIC_SUPABASE_URL
   # - NEXT_PUBLIC_SUPABASE_ANON_KEY
   # - SUPABASE_SERVICE_ROLE_KEY
   ```

---

## Tests Ready to Execute ✅

Once Docker and Supabase CLI are installed, run these in order:

### 1. Database Function Verification

```bash
npx tsx scripts/verify-database-functions.ts
```

**Tests**:
- ✓ Version mismatch rejects stale writes
- ✓ Expired lock rejection
- ✓ Input change detection
- ✓ Successful publish and lock release
- ✓ Function permissions

**Expected output**:
```
✅ Correctly rejected stale write
✅ Correctly rejected expired lock
✅ Correctly detected input change
✅ Successfully published and released lock
✅ Function exists
```

---

### 2. Seed Test Data

```bash
npx tsx scripts/seed-test-data.ts
```

**Creates**:
- 1 Standard gift (3 memories)
- 1 Plus gift (6 memories)

**Output**:
```
✅ Created Standard gift: <id>
Standard: http://localhost:3000/m/<share-code>/reveal

✅ Created Plus gift: <id>
Plus: http://localhost:3000/m/<share-code>/reveal
```

**Save these URLs** for manual testing.

---

### 3. Unit Tests (All Suites)

```bash
npm test
```

**Expected**:
- ✅ 171 tests passing
- ❌ 7 tests failing (celebrationExperience - pre-existing, unrelated)

**AI Director tests (10 tests)**:
- prepareRevealPlan.test.ts: 6 tests
- concurrent.test.ts: 4 tests

All should pass.

---

### 4. Build Verification

```bash
npm run build
```

**Expected**:
- Exit code: 0
- ✓ Compiled successfully
- ✓ 44 routes generated

---

### 5. Start Development Server

```bash
npm run dev
```

Access:
- App: http://localhost:3000
- Supabase Studio: http://localhost:54323 (view database)

---

## Manual Verification Tests

Run these with the dev server running and seed URLs from step 2.

### Test A: Creator Preparation Flow

1. Navigate to dashboard with creator token:
   ```
   http://localhost:3000/dashboard/<share-code>
   ```

2. Mark gift as "Ready"

3. **Verify in Supabase Studio**:
   - Table: `ai_reveal_plans`
   - Check row for memorypop:
     - `generation_version`: 1 or higher
     - `plan`: Not null (full plan object)
     - `input_hash`: Not empty
     - `model_name`: NOT 'pending'
     - `generation_lock_holder`: NULL (released)
     - `generation_source`: 'ai_generated' or 'deterministic_fallback'

4. **Expected behavior**:
   - Preparation completes within 5 seconds
   - No errors in console
   - Status changes to "ready"

---

### Test B: Recipient Playback (Cached Plan)

1. Open Plus reveal URL:
   ```
   http://localhost:3000/m/<plus-share-code>/reveal
   ```

2. **Verify**:
   - ✅ Plus cinematic experience loads
   - ✅ Chapters display correctly
   - ✅ Highlight memories shown
   - ✅ Finale memory displays
   - ✅ No AI generation call (uses cached plan)
   - ✅ No errors in console

3. **Check Network tab**:
   - No calls to `/api/generate-reveal-plan`
   - No external AI provider requests

---

### Test C: Concurrent Request Handling

1. Open two terminal windows

2. **Terminal 1**:
   ```bash
   curl -X PATCH http://localhost:3000/api/memorypops/<id>/status \
     -H "Content-Type: application/json" \
     -d '{"status": "ready", "creatorToken": "<token>", "forceRegenerate": true}'
   ```

3. **Terminal 2** (immediately):
   ```bash
   curl -X PATCH http://localhost:3000/api/memorypops/<id>/status \
     -H "Content-Type: application/json" \
     -d '{"status": "ready", "creatorToken": "<token>", "forceRegenerate": true}'
   ```

4. **Verify**:
   - One request acquires lock
   - Second request either:
     - Waits for first to complete, OR
     - Returns "already in progress"
   - Only ONE generation occurs (check logs)
   - Final `generation_version` incremented by 1

---

### Test D: Lock Expiration & Takeover

1. **Manually expire a lock**:
   ```sql
   -- In Supabase Studio SQL Editor
   UPDATE ai_reveal_plans
   SET generation_lock_holder = 'expired-worker',
       generation_lock_expires_at = NOW() - INTERVAL '5 minutes'
   WHERE memorypop_id = '<test-gift-id>';
   ```

2. **Trigger new preparation**:
   ```bash
   curl -X PATCH http://localhost:3000/api/memorypops/<id>/status \
     -d '{"status": "ready", "creatorToken": "<token>", "forceRegenerate": true}'
   ```

3. **Verify**:
   - New worker takes over lock
   - `generation_version` increments
   - Generation completes successfully
   - Lock released on completion

---

### Test E: Input Change Detection

1. **Prepare a gift** (creates plan)

2. **Add a new memory** via UI or SQL:
   ```sql
   INSERT INTO memories (memorypop_id, contributor_name, message)
   VALUES ('<memorypop-id>', 'New Person', 'New message');
   ```

3. **Simulate stale worker publishing**:
   ```sql
   -- Attempt to publish with old input_hash (should fail)
   SELECT publish_reveal_plan(
     '<memorypop-id>'::uuid,
     'worker-stale',
     1,  -- version
     'old-hash',  -- old input hash
     '{"openingTitle": "Stale"}'::jsonb,
     'test',
     'test',
     '{}'::jsonb,
     'old-hash',
     'ai_generated',
     null
   );
   ```

4. **Expected result**: `'input_changed'`

---

### Test F: Standard Gift Unchanged

1. Open Standard reveal URL:
   ```
   http://localhost:3000/m/<standard-share-code>/reveal
   ```

2. **Verify**:
   - ✅ Standard reveal experience (no chapters)
   - ✅ GlobalCinematicController used
   - ✅ No AI preparation triggered
   - ✅ No `ai_reveal_plans` row created

---

### Test G: Timeout & Error Fallback

1. **Disable AI generation** (if enabled):
   ```bash
   # In .env.local
   ENABLE_AI_DIRECTOR=false
   ```

2. **Prepare Plus gift**

3. **Verify**:
   - Falls back to deterministic planner
   - Full Plus experience delivered
   - `generation_source`: 'deterministic_fallback'
   - No external API calls

---

## Blocked Tests ⚠️

These require Docker/Supabase installation:

- [ ] Database function verification
- [ ] Seed data creation
- [ ] Creator preparation flow
- [ ] Recipient playback verification
- [ ] Concurrent request handling
- [ ] Lock expiration/takeover
- [ ] Input change detection
- [ ] Standard gift verification
- [ ] Timeout/error fallback

---

## Completed Tests ✅

These are already verified and passing:

- [x] Unit tests (171/187)
  - [x] prepareRevealPlan.test.ts (6/6)
  - [x] concurrent.test.ts (4/4)
  - [x] timeout.test.ts (5/5)
  - [x] revealPlanService.test.ts (11/11)
  - [x] deterministicPlanner.test.ts
  - [x] statusRoute.test.ts (9/9)

- [x] Build verification (exit code 0)
- [x] TypeScript compilation
- [x] Migrations created (012-015)
- [x] Rollback scripts created

---

## Pre-Existing Failures (Unrelated)

7 tests in `celebrationExperience.test.ts` failing:
- Expects 4 moods, receives 6
- Expects "funny", receives "playful_fun"
- Expects "heartfelt", receives "warm_heartfelt"

**Evidence this is unrelated**:
- Test file created: commit e57cc3b (Sep 17)
- AI Director work started: Sep 19
- No AI Director code touches mood system

---

## Installation Instructions Summary

**For your convenience, copy-paste this:**

```bash
# 1. Install Docker Desktop
brew install --cask docker
# Launch Docker Desktop, wait for it to start

# 2. Install Supabase CLI
brew install supabase/tap/supabase

# 3. Run setup
cd ~/Downloads/MemoryPop/memorypop
./scripts/setup-local-supabase.sh

# 4. Copy keys to environment
cp .env.local .env.local.production  # Backup
cp .env.local.supabase.template .env.local
# Edit .env.local with keys from supabase start output

# 5. Verify database functions
npx tsx scripts/verify-database-functions.ts

# 6. Seed test data
npx tsx scripts/seed-test-data.ts

# 7. Run tests
npm test

# 8. Start dev server
npm run dev
```

---

## Restore Production Environment

When finished with local testing:

```bash
# Stop Supabase
supabase stop

# Restore production config
cp .env.local.production .env.local

# Or keep local running for future tests
supabase start
```
