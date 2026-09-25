# ⚠️ OBSOLETE - DO NOT USE

**This guide is superseded by TEST_SETUP_FINAL.md**

**Problems with this guide:**
- Contains instructions to overwrite .env.local (line 86: `cp .env.test .env.local`)
- Missing mock AI provider configuration
- Incomplete permission verification

**Use instead:** `TEST_SETUP_FINAL.md`

---

# Quick Start: AI Director Integration Testing

**Estimated time**: 20-30 minutes
**Prerequisites**: Supabase account with free project slot available
**Status**: OBSOLETE - Use TEST_SETUP_FINAL.md

---

## Part 1: Setup (You do this in browser)

### 1. Create Test Project

1. Go to: https://supabase.com/dashboard
2. Click "New Project"
3. Name: `memorypop-test`, Free plan, any region
4. Wait ~2 minutes for initialization

### 2. Get API Keys

1. Go to: **Settings → API**
2. Copy:
   - Project URL
   - Project Ref (from URL)
   - anon public key
   - service_role key (click reveal)

### 3. Initialize Database

1. Go to: **SQL Editor** → New query
2. Open and copy: `~/Downloads/MemoryPop/memorypop/test-db-init.sql`
3. Paste into editor, click "Run"
4. Wait for "Success" (verifies 4 tables + 1 function created)

---

## Part 2: Local Configuration (Terminal)

```bash
cd ~/Downloads/MemoryPop/memorypop

# Create test config
cp .env.test.template .env.test

# Edit with your keys (use nano, vim, VS Code, etc.)
nano .env.test

# Fill in:
# - NEXT_PUBLIC_SUPABASE_URL=https://[your-ref].supabase.co
# - NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
# - SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]
# - TEST_PROJECT_REF=[your-ref]

# Save and exit
```

---

## Part 3: Verification (Automated)

```bash
# Export test environment
export NEXT_PUBLIC_SUPABASE_URL=$(grep NEXT_PUBLIC_SUPABASE_URL .env.test | cut -d '=' -f2)
export SUPABASE_SERVICE_ROLE_KEY=$(grep SUPABASE_SERVICE_ROLE_KEY .env.test | cut -d '=' -f2)
export TEST_PROJECT_REF=$(grep TEST_PROJECT_REF .env.test | cut -d '=' -f2)

# Test database functions (should see 5 ✅)
npm run test:verify-db

# Seed test data (creates 2 gifts, saves URLs)
npm run test:seed

# Run unit tests
npm test

# Build verification
npm run build
```

**Expected**: All pass

---

## Part 4: Browser Testing (Manual)

```bash
# Copy test config to active
cp .env.test .env.local

# Start server
npm run dev

# Server at: http://localhost:3000
```

### Test Checklist

Open URLs from seed output:

- [ ] **Standard Reveal**: No AI, chronological display
- [ ] **Plus Dashboard**: Mark ready, see preparation complete
- [ ] **Plus Reveal**: Chapters, highlights, finale work correctly
- [ ] **Refresh Plus**: Same plan (cached), no regeneration

Check Supabase **Table Editor → ai_reveal_plans**:
- [ ] Row exists for Plus gift
- [ ] `plan` is not null
- [ ] `generation_lock_holder` is null
- [ ] `model_name` is not 'pending'

---

## Part 5: Restore

```bash
# When done, restore production config
cp .env.local.production .env.local

# Or just delete
rm .env.local
```

---

## What You've Verified

- ✅ Database schema initialization
- ✅ Atomic publish function with safety checks
- ✅ Stale write prevention
- ✅ Lock expiration and takeover
- ✅ Input change detection
- ✅ Plus creator preparation flow
- ✅ Cached plan playback
- ✅ Standard reveal unchanged
- ✅ Unit tests passing
- ✅ Production build successful

---

## If Anything Fails

See **TEST_ENVIRONMENT_SETUP.md** for:
- Detailed troubleshooting
- Expected outputs
- Debugging steps
- Complete test procedures

---

## Summary

You've now:
1. Created isolated test environment
2. Verified all database functions
3. Tested creator-to-recipient journey
4. Confirmed production build works
5. Kept production database untouched

**Ready for next steps**: Implementation is verified. Feature flag remains disabled in production.
