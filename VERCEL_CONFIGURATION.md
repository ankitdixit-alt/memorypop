# Vercel Production Configuration Required

**Before pushing to main, verify these settings in Vercel Dashboard.**

---

## Required Environment Variables

Navigate to: https://vercel.com/[your-project]/settings/environment-variables

### 1. ENABLE_AI_DIRECTOR

**Environment**: Production
**Value**: `true`
**Purpose**: Enables Groq AI generation for Plus customers

**To Add**:
1. Click "Add New"
2. Name: `ENABLE_AI_DIRECTOR`
3. Value: `true`
4. Environment: Select "Production" only
5. Click "Save"

### 2. GROQ_API_KEY

**Environment**: Production
**Value**: `[Copy from .env.local]`
**Purpose**: Groq API authentication (free tier)

**To Verify**:
1. Check if `GROQ_API_KEY` exists in Production environment
2. If not present, add it with the value from your local `.env.local` file
3. This key is already in `.env.local` (confirmed safe to use)

**Important**: This is a FREE TIER key with no billing enabled. Zero cost.

---

## How to Verify Current Settings

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Check for these two variables in **Production** environment
3. If missing, add them following steps above

**Note**: Preview and Development environments should NOT have `ENABLE_AI_DIRECTOR=true` unless you want AI active there too.

---

## Disabling Groq (Emergency)

To disable Groq without redeploying code:

1. Go to Vercel Dashboard → Environment Variables
2. Find `ENABLE_AI_DIRECTOR`
3. Change value from `true` to `false`
4. Vercel will automatically redeploy with new value

**Effect**: Plus customers use deterministic fallback (full premium experience)

---

## Verification Checklist

Before pushing to main:

- [ ] `ENABLE_AI_DIRECTOR=true` set in Vercel Production
- [ ] `GROQ_API_KEY` set in Vercel Production (value from `.env.local`)
- [ ] Both variables scoped to "Production" environment only
- [ ] No test variables (TEST_AI_PROVIDER, INTEGRATION_TEST) in Vercel

**Cannot verify Vercel settings programmatically** - you must check dashboard manually.
