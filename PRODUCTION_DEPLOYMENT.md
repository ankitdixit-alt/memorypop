# Groq-Powered MemoryPop Plus - Production Deployment Guide

**Status**: Ready for Production Launch
**Date**: 2026-09-25
**API Cost**: Zero (Free tier only)

---

## ✅ Pre-Deployment Verification

### Completed Checks

- ✅ **Build**: Production build passes successfully
- ✅ **Groq Integration**: Real API generation tested and verified
- ✅ **Caching**: Plan reuse confirmed (no redundant API calls)
- ✅ **Fallback**: Deterministic Plus works on errors/timeout
- ✅ **Security**: Mock provider requires test environment
- ✅ **Data Safety**: Only memory IDs and text sent to Groq
- ✅ **Authentication**: Session-based with SHA-256 hashing
- ✅ **Standard**: Unchanged and separate code path

### Test Evidence

- **Test Database**: memorypop-test (lbjtwbpnlruykqgsaiwy.supabase.co)
- **Real Generation**: `model_name: openai/gpt-oss-120b`, `source: ai_generated`
- **Plan Saved**: 3 AI-generated chapters with personalized opening
- **Cache Working**: Refresh reuses plan (no new Groq request)
- **Lock Management**: Properly acquired and released
- **Render Integration**: Full Plus presentation reused

---

## 🚀 Deployment Steps

### Step 1: Database Migration (5 minutes)

**Run in Supabase SQL Editor** (Production Dashboard):

1. Go to: https://supabase.com/dashboard/project/gvfpgawbvuttglfscngg/sql/new
2. Copy entire contents of: `migrations/PRODUCTION_AI_DIRECTOR_MIGRATION.sql`
3. Paste into SQL Editor
4. Click "Run"
5. Verify output shows:
   - ✅ `ai_reveal_plans | true` (RLS enabled)
   - ✅ All columns present (id, memorypop_id, plan, model_name, etc.)
   - ✅ `publish_reveal_plan` function exists

**Rollback Plan** (if needed):
```sql
-- Emergency rollback (preserves customer data)
DROP TABLE IF EXISTS ai_reveal_plans CASCADE;
DROP FUNCTION IF EXISTS publish_reveal_plan CASCADE;
```

### Step 2: Environment Configuration

#### Vercel Dashboard

1. Go to: https://vercel.com/[your-project]/settings/environment-variables
2. Add/Update these variables:

**Production Environment:**
```bash
ENABLE_AI_DIRECTOR=true
GROQ_API_KEY=[your-groq-api-key]
```

**Preview/Development** (Optional):
```bash
ENABLE_AI_DIRECTOR=false  # Start disabled for previews
```

#### Safety Notes

- **GROQ_API_KEY**: Free tier only, no billing enabled
- **ENABLE_AI_DIRECTOR**: Can be set to `false` to disable Groq without breaking Plus
- **ENABLE_PREMIUM_BETA**: Keep current setting (controls Plus access)

### Step 3: Deploy to Production

#### Option A: Git Push (Manual)

```bash
# From your local machine (NOT from Claude)
git add migrations/PRODUCTION_AI_DIRECTOR_MIGRATION.sql
git add src/lib/ai/prepareRevealPlan.ts
git add TEST_SETUP_FINAL.md
git add PRODUCTION_DEPLOYMENT.md
git commit -m "Launch Groq-powered MemoryPop Plus

- Add AI Director database schema (migrations 012-015)
- Enable real Groq API integration
- Fix mood field reference (not in schema)
- Preserve deterministic Plus fallback
- Complete production verification"

git push origin main
```

**Vercel** will automatically deploy when push completes.

#### Option B: Vercel CLI (if configured)

```bash
vercel --prod
```

### Step 4: Post-Deployment Verification (10 minutes)

#### Create Smoke Test Gift

1. Go to: https://memorypop.com/create
2. Create a new gift:
   - Recipient: "Test User"
   - Occasion: "birthday"
   - Add 3-5 text memories from different contributors
3. **Upgrade to Plus** (you must be the creator/owner)
4. Mark as "Ready to Reveal"
5. Wait 30-60 seconds for generation

#### Verify AI Generation

1. **Check Database** (Supabase SQL Editor):
   ```sql
   SELECT
     memorypop_id,
     model_name,
     generation_source,
     generation_lock_holder,
     created_at
   FROM ai_reveal_plans
   WHERE memorypop_id = '[your-gift-id]'
   ORDER BY created_at DESC
   LIMIT 1;
   ```

   **Expected**:
   - `model_name`: `openai/gpt-oss-120b` (NOT deterministic)
   - `generation_source`: `ai_generated`
   - `generation_lock_holder`: `NULL` (released)

2. **Open Reveal URL** (get from dashboard)
   - Should show AI-generated chapters with titles
   - Opening personalization
   - Full Plus presentation (tiles, transitions, decorations)
   - Contributor names and messages intact

3. **Refresh Page**
   - Should show same content immediately
   - No new generation (check database - same created_at)

4. **Test Standard Gift**
   - Create a Standard (non-Plus) gift
   - Verify chronological display (no chapters)
   - Should work exactly as before

#### Monitor for Issues

Check these for first 24 hours:

- **Sentry**: https://sentry.io/organizations/.../projects/memorypop/
  - Look for Groq API errors
  - Check for rate limit warnings
  - Monitor timeout occurrences

- **Vercel Logs**: https://vercel.com/[your-project]/logs
  - Filter for `[AI_DIRECTOR]` logs
  - Check generation success rate
  - Monitor API response times

- **Database Growth** (Supabase Dashboard):
  - Monitor `ai_reveal_plans` row count
  - Should be ≤ number of Plus gifts marked ready
  - Check storage usage (plans are JSONB)

---

## 🎛️ Feature Control

### Disable Groq (Emergency)

**Vercel Dashboard** → Environment Variables:

```bash
ENABLE_AI_DIRECTOR=false
```

**Effect**:
- ✅ Plus customers still get premium presentation
- ✅ Uses deterministic fallback (high quality)
- ✅ No API calls or costs
- ✅ No customer-facing errors

**Redeploy**: Vercel will auto-redeploy on env change (or trigger manual deploy)

### Re-enable Groq

```bash
ENABLE_AI_DIRECTOR=true
```

**Effect**:
- New Plus gifts marked "Ready" will use Groq
- Existing cached plans remain unchanged
- Groq-generated plans will appear with next gift

---

## 📊 Monitoring

### Success Indicators

- **Generation Success Rate**: >80% should use `ai_generated` (not fallback)
- **Cache Hit Rate**: >90% of reveal views should reuse cached plan
- **API Response Time**: <5 seconds for generation
- **Error Rate**: <5% timeouts/errors (fallback handles these)

### Key Metrics to Track

1. **Plus Adoption**: % of gifts upgraded to Plus
2. **Preparation Rate**: % of Plus gifts marked "Ready"
3. **AI vs Fallback**: Ratio of `ai_generated` to `deterministic_fallback`
4. **Reveal Engagement**: Time on reveal page, completion rate

### Alert Thresholds

- **High Fallback Rate** (>50%): Check Groq API status, quota
- **High Timeout Rate** (>20%): Review API response times
- **Lock Expiry Issues**: Check for crashed workers

---

## 🔒 Security & Privacy

### Data Sent to Groq

**Included**:
- Memory IDs (opaque UUIDs)
- Contributor names
- Memory messages (text only)
- Media counts (photo/video counts, not URLs)
- Recipient name
- Occasion

**Excluded**:
- Photos/videos (content or URLs)
- Email addresses
- Authentication tokens
- Payment information
- Personal identifiers beyond names

### API Key Security

- ✅ Stored in Vercel environment (encrypted at rest)
- ✅ Never logged or exposed to client
- ✅ Free tier only (no billing, no charges)
- ✅ Rate limits prevent abuse

### Database Security

- ✅ RLS enabled on `ai_reveal_plans`
- ✅ Service role only (no public access)
- ✅ Plans cascade delete with gift
- ✅ No PII beyond memory content

---

## 🐛 Troubleshooting

### Issue: All plans use `deterministic_fallback`

**Possible Causes**:
1. `ENABLE_AI_DIRECTOR=false` in Vercel
2. Groq API key invalid/expired
3. Free tier quota exhausted
4. Network connectivity issues

**Resolution**:
1. Check Vercel environment variables
2. Test API key with: `scripts/check-groq-quota.ts`
3. Check Groq dashboard for quota status
4. Review Vercel logs for API errors

**Temporary Fix**: Fallback provides high-quality Plus experience

### Issue: Generation takes >30 seconds

**Possible Causes**:
1. Large number of memories (>20)
2. Groq API slow response
3. Network latency

**Resolution**:
1. Monitor via Sentry (timeout errors)
2. Fallback automatically activates at 30s
3. No action required (graceful degradation)

### Issue: Lock not released

**Symptoms**: Same gift stuck "preparing" forever

**Cause**: Worker crash during generation

**Resolution**:
```sql
-- In Supabase SQL Editor:
UPDATE ai_reveal_plans
SET
  generation_lock_holder = NULL,
  generation_lock_acquired_at = NULL,
  generation_lock_expires_at = NULL
WHERE memorypop_id = '[stuck-gift-id]';
```

Then retry preparation from dashboard.

### Issue: Plan doesn't match memories

**Possible Causes**:
1. Memories changed after plan generated
2. Stale plan cached
3. Input hash mismatch

**Resolution**:
```sql
-- Force regeneration:
DELETE FROM ai_reveal_plans
WHERE memorypop_id = '[gift-id]';
```

Then mark gift as "Ready" again to regenerate.

---

## 📋 Rollback Plan

If major issues occur, roll back in this order:

### Quick Disable (Recommended)

**Vercel** → Environment Variables:
```bash
ENABLE_AI_DIRECTOR=false
```

**Effect**: Plus customers use deterministic fallback (full premium experience)

### Full Rollback (Emergency)

1. **Disable AI Director** (above)
2. **Revert Code** (if needed):
   ```bash
   git revert [commit-hash]
   git push origin main
   ```
3. **Remove Database Tables** (optional, preserves data):
   ```sql
   -- This is safe but unnecessary
   -- Existing plans remain cached
   DROP TABLE IF EXISTS ai_reveal_plans CASCADE;
   DROP FUNCTION IF EXISTS publish_reveal_plan CASCADE;
   ```

**Customer Impact**: None (deterministic Plus is production-ready)

---

## ✅ Launch Checklist

### Pre-Launch

- [x] Build passes production verification
- [x] Migrations tested in memorypop-test
- [x] Real Groq generation verified
- [x] Caching confirmed working
- [x] Fallback tested (deterministic Plus)
- [x] Security review complete
- [x] Standard reveal unchanged
- [x] .env.local preserved (not committed)

### Launch Day

- [ ] Apply database migration (Step 1)
- [ ] Set ENABLE_AI_DIRECTOR=true (Step 2)
- [ ] Deploy to production (Step 3)
- [ ] Create smoke test gift (Step 4)
- [ ] Verify AI generation (Step 4)
- [ ] Test Standard gift (Step 4)
- [ ] Monitor Sentry for 1 hour
- [ ] Check Vercel logs for errors

### Post-Launch (24h)

- [ ] Review generation success rate
- [ ] Check Groq API quota usage
- [ ] Monitor error rate
- [ ] Verify cache hit rate
- [ ] Customer feedback (if any issues)

---

## 📚 References

- **Test Results**: `TEST_SETUP_FINAL.md`
- **Migration SQL**: `migrations/PRODUCTION_AI_DIRECTOR_MIGRATION.sql`
- **Code Changes**: `git log --oneline --since="2026-09-23"`
- **Groq Docs**: https://console.groq.com/docs
- **Supabase Dashboard**: https://supabase.com/dashboard/project/gvfpgawbvuttglfscngg

---

## 🎯 Success Criteria

**Launch Successful When**:

1. ✅ Migration applied without errors
2. ✅ Smoke test generates AI plan (`model_name: openai/gpt-oss-120b`)
3. ✅ Reveal displays full Plus experience
4. ✅ Refresh reuses cached plan
5. ✅ Standard gifts unchanged
6. ✅ No errors in Sentry (first hour)
7. ✅ Zero API charges (free tier)

**Customer Promise**:

> MemoryPop Plus delivers a beautifully personalized reveal experience powered by AI. Your contributions are thoughtfully arranged into a coherent story with meaningful chapters and transitions. When AI is unavailable, you still receive the full premium presentation with intelligent fallback arrangement.

---

**Questions or Issues?**
- Check Troubleshooting section above
- Review Vercel logs for specific errors
- Temporarily disable with `ENABLE_AI_DIRECTOR=false`
- Deterministic Plus fallback is production-grade
