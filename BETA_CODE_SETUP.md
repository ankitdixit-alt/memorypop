# Beta Code Setup Guide

This guide explains how to configure and test the complimentary Plus beta access code system.

## Overview

The beta code system allows creators to upgrade to MemoryPop Plus at €0 during the beta period without payment processing. The system includes:

- Server-side validation and authorization
- Atomic, idempotent redemption
- Rate limiting for invalid attempts
- Configurable expiry and redemption limits
- Secure code storage (SHA-256 hashed)

---

## Step 1: Apply Database Migration

Run in Supabase SQL Editor:

```sql
-- Copy and run migrations/016_add_beta_codes.sql
```

This creates:
- `beta_codes` table (stores hashed codes with limits/expiry)
- `beta_code_redemptions` table (tracks which gifts redeemed which codes)
- `upgrade_source` column on `memorypops` (tracks how Plus was activated)

---

## Step 2: Generate Your Beta Code

Choose a secret code (e.g., `PLUS2026LAUNCH`) and create it:

```bash
BETA_CODE="PLUS2026LAUNCH" \
BETA_CAMPAIGN_NAME="launch_2026" \
BETA_REDEMPTION_LIMIT=100 \
BETA_EXPIRES_DAYS=90 \
npx tsx scripts/create-beta-code.ts
```

**Output**:
```
✅ Beta code created successfully!
  ID: [uuid]
  Campaign: launch_2026
  Limit: 100
  Expires: 2026-12-25T12:00:00.000Z

⚠️  Important:
  - Keep your BETA_CODE secret
  - Do not commit it to version control
  - Add BETA_CODE to Vercel environment variables (Production only)
```

**Security Notes**:
- The actual code is NEVER stored in the database (only SHA-256 hash)
- Only you know the plaintext code
- The database can validate codes without storing them

---

## Step 3: Verify Local Configuration

### Required Environment Variables

Add to `.env.local` (already excluded from Git):

```bash
# Beta Code (keep secret!)
BETA_CODE=PLUS2026LAUNCH

# Existing environment variables (must be present)
NEXT_PUBLIC_SUPABASE_URL=https://[your-project].supabase.co
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]
SESSION_SECRET=[your-session-secret]
```

### Test Locally

1. Start development server:
   ```bash
   npm run dev
   ```

2. Create a test MemoryPop at `http://localhost:3000/create`

3. Note the creator dashboard URL (e.g., `http://localhost:3000/dashboard/abc123`)

4. Verify upgrade UI shows:
   - "Upgrade to Plus" button
   - Beta code input field
   - "Activate Plus for €0" message
   - "No payment details required" notice

---

## Step 4: Test Complete Redemption Flow

### 4.1 Successful Redemption

1. Open creator dashboard (must be authorized)
2. Click "Upgrade to Plus"
3. Enter your beta code (e.g., `PLUS2026LAUNCH`)
4. Click "Activate Plus for €0"
5. Verify:
   - ✅ Success message appears
   - ✅ Plus badge shows in header
   - ✅ Dashboard refreshes to show Plus status
   - ✅ No payment was processed

### 4.2 Idempotent Redemption

1. Try redeeming the same code again for the same gift
2. Verify:
   - ✅ Success message (not an error)
   - ✅ No additional redemption counted
   - ✅ Plus status unchanged

### 4.3 Authorization Check

1. Open dashboard in incognito window (no creator session)
2. Try to access redemption endpoint directly
3. Verify:
   - ❌ 403 Unauthorized error
   - ❌ No upgrade occurred

### 4.4 Invalid Code Handling

1. Enter incorrect code (e.g., `WRONGCODE`)
2. Verify:
   - ❌ "Invalid beta code" error
   - ❌ No upgrade occurred
   - ✅ After 5 invalid attempts, rate limiting activates (429 error)

### 4.5 Expired Code Handling

1. Create a test code with `BETA_EXPIRES_DAYS=0`
2. Try to redeem expired code
3. Verify:
   - ❌ "This beta code has expired" error
   - ❌ No upgrade occurred

### 4.6 Redemption Limit

1. Create test code with `BETA_REDEMPTION_LIMIT=1`
2. Redeem for first gift (should succeed)
3. Try to redeem for second gift
4. Verify:
   - ❌ "This beta code has reached its redemption limit" error
   - ❌ No upgrade occurred for second gift

---

## Step 5: Verify Plus Experience

After successful redemption:

### 5.1 Creator Dashboard

1. Verify Plus badge appears in header
2. Check "Ready to Reveal" button is available
3. Mark gift as ready for reveal

### 5.2 Plus Preparation (AI Director)

1. Wait 30-60 seconds for AI generation
2. Check database:
   ```sql
   SELECT model_name, generation_source, created_at
   FROM ai_reveal_plans
   WHERE memorypop_id = '[your-memorypop-id]'
   ORDER BY created_at DESC
   LIMIT 1;
   ```
3. Verify:
   - ✅ `model_name: openai/gpt-oss-120b`
   - ✅ `generation_source: ai_generated`

### 5.3 Plus Reveal Experience

1. Open reveal page (e.g., `/m/abc123/reveal`)
2. Verify:
   - ✅ AI-generated chapter titles
   - ✅ Full Plus presentation (tiles, transitions, decorations)
   - ✅ Recipient name visible
   - ✅ Signature contrast visible
   - ✅ Music playback works
   - ✅ Photo/video viewer works

3. Refresh page:
   - ✅ Same content displays (cached plan)
   - ✅ No new generation triggered

### 5.4 Standard Reveal Unchanged

1. Create a Standard (non-Plus) gift
2. Do NOT upgrade
3. Mark as ready for reveal
4. Open reveal page
5. Verify:
   - ✅ Chronological display (no AI chapters)
   - ✅ Standard presentation preserved

---

## Step 6: Database Verification Queries

### Check Beta Code Status

```sql
SELECT
  campaign_name,
  current_redemptions,
  total_redemption_limit,
  expires_at,
  active
FROM beta_codes
WHERE campaign_name = 'launch_2026';
```

### Check Redemptions

```sql
SELECT
  m.recipient_name,
  m.share_code,
  m.upgraded_at,
  m.upgrade_source,
  r.redeemed_at
FROM beta_code_redemptions r
JOIN memorypops m ON r.memorypop_id = m.id
ORDER BY r.redeemed_at DESC
LIMIT 10;
```

### Verify Upgrade Source Tracking

```sql
SELECT
  upgrade_source,
  COUNT(*) as count
FROM memorypops
WHERE is_premium = true
GROUP BY upgrade_source;
```

Expected output:
```
beta_code | 5
stripe    | 0
```

---

## Production Deployment

### Vercel Environment Variables

Add to Production environment only:

```bash
# ❌ DO NOT add BETA_CODE to Vercel
# The code is already hashed in the database
# No environment variable needed in production
```

### After Deployment

1. Test one real redemption with your beta code
2. Monitor redemption count:
   ```sql
   SELECT current_redemptions FROM beta_codes WHERE campaign_name = 'launch_2026';
   ```
3. Verify Plus reveal works in production
4. Check Groq API usage (should remain at $0)

---

## Managing Beta Codes

### Disable a Code

```sql
UPDATE beta_codes
SET active = false
WHERE campaign_name = 'launch_2026';
```

### Extend Expiry

```sql
UPDATE beta_codes
SET expires_at = NOW() + INTERVAL '90 days'
WHERE campaign_name = 'launch_2026';
```

### Increase Redemption Limit

```sql
UPDATE beta_codes
SET total_redemption_limit = 200
WHERE campaign_name = 'launch_2026';
```

### Create New Campaign Code

```bash
BETA_CODE="PLUS2027SPRING" \
BETA_CAMPAIGN_NAME="spring_2027" \
BETA_REDEMPTION_LIMIT=50 \
BETA_EXPIRES_DAYS=30 \
npx tsx scripts/create-beta-code.ts
```

---

## Security Checklist

- ✅ Beta code stored only in your local `.env.local`
- ✅ `.env.local` excluded from Git (`.gitignore`)
- ✅ Database stores only SHA-256 hash
- ✅ API validates creator authorization server-side
- ✅ Rate limiting prevents brute force attacks
- ✅ Atomic redemption prevents race conditions
- ✅ Idempotent redemption prevents double-counting
- ✅ RLS policies restrict table access to service_role only

---

## Rollback

If you need to remove the beta code system:

```sql
-- Run in Supabase SQL Editor
ALTER TABLE memorypops DROP COLUMN IF EXISTS upgrade_source;
DROP TABLE IF EXISTS beta_code_redemptions CASCADE;
DROP TABLE IF EXISTS beta_codes CASCADE;
```

Then remove:
- `/src/app/api/memorypops/[id]/redeem-beta-code/route.ts`
- `/src/app/api/memorypops/share/[shareCode]/route.ts`
- Beta code UI from `DashboardPlusFeatures.tsx`

---

## Support

If you encounter issues:

1. Check browser console for errors
2. Verify creator session exists (authenticated)
3. Check database for redemption records
4. Verify code hasn't expired or reached limit
5. Test with a fresh code and new test gift
