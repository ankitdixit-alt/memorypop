# Beta Code Quick Start

Complete Plus beta access in 5 steps.

---

## Step 1: Apply Migration

Supabase SQL Editor → Run `migrations/016_add_beta_codes.sql`

---

## Step 2: Create Your Beta Code

```bash
BETA_CODE="PLUS2026LAUNCH" \
BETA_CAMPAIGN_NAME="launch_2026" \
BETA_REDEMPTION_LIMIT=100 \
BETA_EXPIRES_DAYS=90 \
npx tsx scripts/create-beta-code.ts
```

**Keep `PLUS2026LAUNCH` secret!**

---

## Step 3: Add to `.env.local`

```bash
BETA_CODE=PLUS2026LAUNCH
```

---

## Step 4: Test Locally

1. `npm run dev`
2. Create test gift at `http://localhost:3000/create`
3. Open creator dashboard
4. Click "Upgrade to Plus"
5. Enter: `PLUS2026LAUNCH`
6. Click "Activate Plus for €0"
7. Verify Plus badge appears

---

## Step 5: Test Plus Reveal

1. Add 3-5 memories to your test gift
2. Mark as "Ready to Reveal"
3. Wait 30-60 seconds
4. Open reveal page
5. Verify:
   - ✅ AI-generated chapters
   - ✅ Plus presentation
   - ✅ Refresh reuses plan

---

## Your Beta Code URL

**Creator Dashboard**: `http://localhost:3000/dashboard/[shareCode]`

Share `PLUS2026LAUNCH` with beta testers privately.

---

## Verification Checklist

After redemption:

- [ ] Plus badge shows in dashboard header
- [ ] "Ready to Reveal" button available
- [ ] AI plan generated (check `ai_reveal_plans` table)
- [ ] Reveal displays AI chapters
- [ ] Refresh reuses cached plan
- [ ] Standard gifts unchanged (chronological)
- [ ] Unauthorized users blocked (403)
- [ ] Invalid codes rejected
- [ ] Repeat redemption succeeds (idempotent)

---

## Production

1. Apply same migration to production Supabase
2. Run create script against production database
3. **Do NOT** add `BETA_CODE` to Vercel (already hashed in DB)
4. Test one redemption in production
5. Share code with beta testers

---

## Manage Code

```sql
-- Check redemptions
SELECT current_redemptions, total_redemption_limit
FROM beta_codes WHERE campaign_name = 'launch_2026';

-- Disable code
UPDATE beta_codes SET active = false
WHERE campaign_name = 'launch_2026';

-- Extend expiry
UPDATE beta_codes SET expires_at = NOW() + INTERVAL '90 days'
WHERE campaign_name = 'launch_2026';
```

---

Full docs: `BETA_CODE_SETUP.md`
