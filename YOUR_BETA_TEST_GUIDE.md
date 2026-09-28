# Your Beta Test Guide

Quick steps to configure your beta code and test Plus yourself.

---

## Step 1: Apply Migration (2 min)

Open Supabase SQL Editor and run:
```sql
-- Copy entire contents of migrations/016_add_beta_codes.sql
-- Paste and run
```

---

## Step 2: Create Your Secret Code (1 min)

```bash
cd ~/Downloads/MemoryPop/memorypop

BETA_CODE="PLUS2026LAUNCH" \
BETA_CAMPAIGN_NAME="launch_2026" \
BETA_REDEMPTION_LIMIT=100 \
BETA_EXPIRES_DAYS=90 \
npx tsx scripts/create-beta-code.ts
```

**Your code**: `PLUS2026LAUNCH` (keep this secret!)

---

## Step 3: Configure Locally (30 sec)

```bash
echo 'BETA_CODE=PLUS2026LAUNCH' >> .env.local
```

---

## Step 4: Start Development Server (30 sec)

```bash
npm run dev
```

---

## Step 5: Test Complete Plus Journey (5 min)

### 5.1 Create Test Gift

1. Open: `http://localhost:3000/create`
2. Fill in:
   - Recipient: "Test User"
   - Occasion: Birthday
   - Story: "Testing Plus beta"
   - Date: Today + 7 days
3. Click "Create MemoryPop"
4. **Copy your creator dashboard URL**: `http://localhost:3000/dashboard/ABC123`

### 5.2 Upgrade to Plus

1. Open your creator dashboard URL
2. Scroll to Plus section
3. Click "Upgrade to Plus"
4. Enter code: `PLUS2026LAUNCH`
5. Click "Activate Plus for €0"
6. ✅ Verify Plus badge appears in header

### 5.3 Add Memories

1. Click "Preview MemoryPop" or open `http://localhost:3000/m/ABC123/contribute`
2. Add 3-5 memories (mix of text/photos)
3. Return to dashboard: `http://localhost:3000/dashboard/ABC123`

### 5.4 Prepare Reveal

1. Click "Ready to Reveal"
2. Confirm
3. Wait 30-60 seconds for AI generation
4. Dashboard will show "Ready"

### 5.5 Verify Plus Reveal

1. Open reveal: `http://localhost:3000/m/ABC123/reveal`
2. ✅ AI-generated chapter titles appear
3. ✅ Recipient name visible in opening
4. ✅ Plus presentation (tiles, transitions, decorations)
5. ✅ Music plays
6. ✅ Photos/videos display correctly
7. Refresh page:
   - ✅ Same content (cached plan, no regeneration)

### 5.6 Test Standard (Unchanged)

1. Create new gift (don't upgrade)
2. Add memories
3. Mark ready to reveal
4. Open reveal
5. ✅ Chronological display (no AI chapters)
6. ✅ Standard presentation preserved

---

## Your URLs

**Local Development**:
- Create: `http://localhost:3000/create`
- Dashboard: `http://localhost:3000/dashboard/[shareCode]`
- Contribute: `http://localhost:3000/m/[shareCode]/contribute`
- Reveal: `http://localhost:3000/m/[shareCode]/reveal`

**Production** (after deployment):
- Create: `https://memorypop.com/create`
- Dashboard: `https://memorypop.com/dashboard/[shareCode]`
- Contribute: `https://memorypop.com/m/[shareCode]/contribute`
- Reveal: `https://memorypop.com/m/[shareCode]/reveal`

---

## Test Checklist

### Core Flow
- [ ] Upgrade UI shows beta code input
- [ ] Code input says "€0" and "no payment required"
- [ ] Valid code activates Plus
- [ ] Plus badge appears in dashboard
- [ ] AI plan generates (30-60 sec)
- [ ] Reveal shows AI chapters
- [ ] Refresh reuses cached plan

### Security
- [ ] Unauthorized user can't upgrade (403)
- [ ] Invalid code rejected
- [ ] Repeat redemption works (idempotent)
- [ ] Rate limiting works (5 invalid attempts)

### Preservation
- [ ] Standard gifts work (chronological)
- [ ] Existing Plus features intact
- [ ] Share links work
- [ ] Creator auth works

---

## Database Verification

```sql
-- Check your redemption
SELECT
  m.recipient_name,
  m.is_premium,
  m.upgraded_at,
  m.upgrade_source,
  r.redeemed_at
FROM memorypops m
LEFT JOIN beta_code_redemptions r ON r.memorypop_id = m.id
WHERE m.share_code = 'ABC123';
```

Expected:
```
recipient_name | is_premium | upgrade_source | redeemed_at
Test User      | true       | beta_code      | 2026-09-26...
```

---

## Share With Beta Testers

After production deployment, share:

**Code**: `PLUS2026LAUNCH`

**Instructions**:
1. Create your MemoryPop at memorypop.com/create
2. Open your creator dashboard
3. Click "Upgrade to Plus"
4. Enter code: `PLUS2026LAUNCH`
5. Activate Plus for €0
6. Add memories and reveal!

---

## Management

```sql
-- Check redemptions
SELECT current_redemptions, total_redemption_limit
FROM beta_codes WHERE campaign_name = 'launch_2026';

-- Disable code (emergency)
UPDATE beta_codes SET active = false
WHERE campaign_name = 'launch_2026';

-- Extend expiry
UPDATE beta_codes SET expires_at = NOW() + INTERVAL '90 days'
WHERE campaign_name = 'launch_2026';
```

---

## Production Deployment

1. Apply `migrations/016_add_beta_codes.sql` to production Supabase
2. Run create script against production database:
   ```bash
   BETA_CODE="PLUS2026LAUNCH" \
   BETA_CAMPAIGN_NAME="launch_2026" \
   BETA_REDEMPTION_LIMIT=100 \
   BETA_EXPIRES_DAYS=90 \
   npx tsx scripts/create-beta-code.ts
   ```
3. **No Vercel config needed** (code already hashed in database)
4. Commit and push code changes
5. Test one redemption in production
6. Share code privately with beta testers

---

**Full Docs**: `BETA_CODE_SETUP.md`
**Quick Ref**: `BETA_CODE_QUICK_START.md`
