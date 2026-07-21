# Environment Variable Audit - CORRECTED
## Creator Identity & Authorization - Post-Implementation

**Date:** 2026-07-21 (Corrected per Founder feedback)
**Audit Scope:** All environment variables after Creator Identity implementation
**Status:** Complete

---

## Executive Summary

**Production Domain:** `https://memorypop.app` (NOT memorypop.com)

**Deployment Status:** 🟡 **NEEDS VERIFICATION** - 1 critical variable needs Founder confirmation

**Critical Issue Detected:**
- Code contains hardcoded fallback to wrong domain (`memorypop.com` instead of `memorypop.app`)
- NEXT_PUBLIC_BASE_URL must be set to override these fallbacks
- Founder confirmed APP_BASE_URL but did not mention NEXT_PUBLIC_BASE_URL

---

## A. Required Now for Core App

### Critical Path Variables

These variables are required for the core free MemoryPop experience to function correctly.

| Variable | Value Format | Code Location | Consequence if Absent | Status |
|----------|--------------|---------------|----------------------|--------|
| **NEXT_PUBLIC_SUPABASE_URL** | `https://xxxxx.supabase.co` | `src/lib/supabase.ts:4` - Database client init | ❌ CRASH - Cannot connect to database | ✅ Founder-confirmed configured |
| **NEXT_PUBLIC_SUPABASE_ANON_KEY** | `eyJhbGciOiJIUzI1Ni...` | `src/lib/supabase.ts:5` - Database auth | ❌ CRASH - Cannot authenticate with database | ✅ Founder-confirmed configured |
| **SESSION_SECRET** | 32+ byte base64 string | `src/lib/creatorSession.ts:20` - HMAC cookie signing | ❌ CRASH - Creator sessions fail, no authorization | ✅ Founder-confirmed configured |
| **NEXT_PUBLIC_BASE_URL** | `https://memorypop.app` | 8 files (metadata, sitemaps, share links) | ⚠️ WRONG URLS - Falls back to `memorypop.com` (incorrect domain) | ⚠️ **NEEDS FOUNDER VERIFICATION** |

**Deployment Risk Assessment:**

**If NEXT_PUBLIC_BASE_URL is missing:**
- ✅ App builds successfully
- ✅ Homepage loads
- ✅ MemoryPop creation works
- ✅ Contributor journey works
- ✅ Reveal journey works
- ❌ **BUT:** All metadata, Open Graph tags, social sharing links point to wrong domain (memorypop.com)
- ❌ **BUT:** Sitemap references wrong URLs
- ❌ **BUT:** Share links may break if clicked from external sites

**Severity:** Medium-High (app works but with wrong URLs everywhere)

---

### Hardcoded Domain References Requiring Fix

**Files with hardcoded `memorypop.com` fallback:**

1. `src/app/layout.tsx:23` - `process.env.NEXT_PUBLIC_BASE_URL || 'https://memorypop.com'`
2. `src/app/layout.tsx:107` - `process.env.NEXT_PUBLIC_BASE_URL || 'https://memorypop.com'`
3. `src/app/dashboard/[shareCode]/page.tsx:51` - Same fallback
4. `src/app/sitemap.xml/route.ts:12` - Same fallback
5. `src/app/m/[shareCode]/page.tsx:49` - Same fallback
6. `src/app/robots.txt/route.ts:11` - Same fallback
7. `src/app/m/[shareCode]/contribute/layout.tsx:15` - Same fallback
8. `src/app/m/[shareCode]/reveal/page.tsx:16` - Same fallback

**Files with hardcoded `memorypop.com` (no env variable):**

9. `src/components/OrganizationSchema.tsx:16` - `"url": "https://memorypop.com"`
10. `src/components/OrganizationSchema.tsx:17` - `"logo": "https://memorypop.com/apple-touch-icon.png"`
11. `src/components/OrganizationSchema.tsx:29` - `"email": "support@memorypop.com"`

**Impact:** SEO schema points to wrong domain, no way to override with environment variable

**Recommended Action:**
- Either set NEXT_PUBLIC_BASE_URL=https://memorypop.app in Vercel
- OR change hardcoded fallbacks from memorypop.com to memorypop.app
- OR make OrganizationSchema.tsx read from environment variable

---

### Why Both APP_BASE_URL and NEXT_PUBLIC_BASE_URL?

**APP_BASE_URL** (Founder-confirmed configured):
- **Purpose:** Server-side secure URL generation
- **Used in:** Email link generation only
- **Files:** `src/app/api/send-creator-email/route.ts`, `src/emails/CreationConfirmation.tsx`
- **Security:** Server-only, not exposed to client
- **Value:** `https://memorypop.app`

**NEXT_PUBLIC_BASE_URL** (Status unknown):
- **Purpose:** Public-facing URLs (metadata, social sharing, sitemaps)
- **Used in:** 8 server components and API routes
- **Files:** layout.tsx, page.tsx components, sitemap, robots.txt
- **Security:** Public prefix required by Next.js for metadata base
- **Value:** Should be `https://memorypop.app`

**Conclusion:** Both are necessary for different purposes. Cannot consolidate into one variable without refactoring.

---

## B. Required Later for Creator Email

**Current State:** Feature disabled (`CREATOR_EMAIL_ENABLED=false`)

These variables are only required when creator email feature is enabled.

| Variable | Value Format | Code Location | Consequence if Absent | Status |
|----------|--------------|---------------|----------------------|--------|
| **APP_BASE_URL** | `https://memorypop.app` | `src/app/api/send-creator-email/route.ts:26-30` - Email link generation | ⚠️ API returns 500 if feature enabled | ✅ Founder-confirmed configured |
| **EMAIL_FROM** | `hello@memorypop.app` | `src/app/api/send-creator-email/route.ts:37-40, 224` - Resend sender | ⚠️ API returns 500 if feature enabled | ❌ Not configured |
| **RESEND_API_KEY** | `re_xxxxxxxxxxxxx` | `src/app/api/send-creator-email/route.ts:40-43, 80` - Resend authentication | ⚠️ API returns 500 if feature enabled | ❌ Not configured |
| **CREATOR_EMAIL_ENABLED** | `false` (current), `true` (to enable) | 3 files - Feature flag | ℹ️ Feature disabled if missing or false | ❌ Not configured (defaults to disabled) |

**Validation Logic:**

The API validates these variables only when `CREATOR_EMAIL_ENABLED=true`:

```typescript
// src/app/api/send-creator-email/route.ts:36-43
if (process.env.CREATOR_EMAIL_ENABLED === 'true') {
  if (!process.env.EMAIL_FROM) {
    return NextResponse.json({ error: 'EMAIL_FROM not configured' }, { status: 500 });
  }
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 });
  }
}
```

**Graceful Degradation:**

When `CREATOR_EMAIL_ENABLED != 'true'`, the API returns:
```json
{ "emailSent": false, "reason": "feature_disabled" }
```

**Deployment Risk:** ✅ SAFE - Feature flag ensures no crashes if email vars missing

---

## C. Required Later for Payments

**Current State:** Premium "Upgrade to Plus" button visible but not functional without Stripe configuration

| Variable | Value Format | Code Location | Consequence if Absent | Status |
|----------|--------------|---------------|----------------------|--------|
| **STRIPE_SECRET_KEY** | `sk_test_...` or `sk_live_...` | `src/app/api/checkout/route.ts:7-13`, `src/app/api/verify-payment/route.ts:7` | ⚠️ Upgrade button fails with 500 error | ❌ Not configured |
| **NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY** | `pk_test_...` or `pk_live_...` | Documented in `.env.example` but not used in code yet | ℹ️ Not used yet | ❌ Not configured, not needed |

**How Stripe is Used:**

1. `DashboardPlusFeatures` component renders "Upgrade to Plus" button on every dashboard
2. Button is visible to all free users (no feature flag)
3. When clicked, calls `POST /api/checkout` with shareCode
4. `/api/checkout` throws error if `STRIPE_SECRET_KEY` missing (line 10)
5. User sees alert: "Failed to create checkout session"

**Core App Impact Assessment:**

- ✅ Homepage loads without Stripe
- ✅ MemoryPop creation works without Stripe
- ✅ Contributor journey works without Stripe
- ✅ Reveal journey works without Stripe
- ✅ Dashboard loads without Stripe
- ❌ "Upgrade to Plus" button fails if clicked

**Deployment Risk:** 🟡 MEDIUM
- Core free experience works perfectly
- But visible "Upgrade" button creates bad UX when it fails
- No feature flag to hide upgrade button when Stripe not configured

**Options:**
1. Configure Stripe before deployment (enables premium upgrades)
2. Deploy without Stripe (upgrade button fails for now)
3. Add feature flag to hide upgrade button if Stripe not configured

**Recommendation:** Deploy without Stripe for now. Premium feature is optional. Document that upgrade will fail until Stripe is configured.

---

## D. Optional Analytics and Monitoring

**Current State:** Monitoring partially configured

| Variable | Value Format | Code Location | Consequence if Absent | Status |
|----------|--------------|---------------|----------------------|--------|
| **NEXT_PUBLIC_MIXPANEL_TOKEN** | `xxxxxxxxxxxxxxxxxxxxx` | `src/lib/analytics.ts:8` - Mixpanel init | ℹ️ Analytics disabled, no tracking | ✅ Founder-confirmed configured |
| **SENTRY_DSN** | `https://xxx@xxx.ingest.sentry.io/xxx` | `sentry.server.config.ts:5`, `sentry.edge.config.ts:5` | ℹ️ Server error tracking disabled | ❌ Needs Founder verification |
| **NEXT_PUBLIC_SENTRY_DSN** | `https://xxx@xxx.ingest.sentry.io/xxx` | `src/instrumentation-client.ts:5` | ℹ️ Client error tracking disabled | ❌ Needs Founder verification |
| **SENTRY_ENVIRONMENT** | `production`, `preview`, `development` | 3 Sentry config files | ℹ️ Falls back to NODE_ENV | ❌ Optional, falls back gracefully |
| **SENTRY_AUTH_TOKEN** | `sntrys_xxxxxxxxxxxxx` | `next.config.ts:20` - Source map upload | ℹ️ Readable stack traces disabled | ❌ Optional, build succeeds |
| **SENTRY_ORG** | `your-org-slug` | `next.config.ts:14` - Source map upload | ℹ️ Source maps not uploaded | ❌ Optional, build succeeds |
| **SENTRY_PROJECT** | `memorypop` | `next.config.ts:17` - Source map upload | ℹ️ Source maps not uploaded | ❌ Optional, build succeeds |

**Graceful Degradation:**

All monitoring variables have safe fallbacks:

```typescript
// Mixpanel disabled if token missing
const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
if (!MIXPANEL_TOKEN) {
  console.log('Mixpanel disabled');
  // Analytics functions become no-ops
}

// Sentry disabled if DSN missing
enabled: !!process.env.SENTRY_DSN,

// Environment falls back to NODE_ENV
environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development',

// Source maps disabled if build vars missing (app still runs)
disableServerWebpackPlugin: process.env.NODE_ENV !== 'production',
```

**Deployment Risk:** ✅ SAFE - App works without monitoring, just blind to errors

---

## Framework-Managed Variables

These are automatically set by Next.js/Node.js:

| Variable | Value | Purpose | Status |
|----------|-------|---------|--------|
| **NODE_ENV** | `development`, `production`, `test` | Environment detection | ✅ Auto-set by framework |
| **NEXT_RUNTIME** | `nodejs`, `edge` | Runtime detection | ✅ Auto-set by Next.js |

**Usage:** Referenced 28 times throughout codebase for conditional logic

---

## Corrected Domain References

**ALL references to `memorypop.com` must be changed to `memorypop.app`:**

### Code Fallbacks (8 files)
```typescript
// WRONG (current):
process.env.NEXT_PUBLIC_BASE_URL || 'https://memorypop.com'

// CORRECT:
process.env.NEXT_PUBLIC_BASE_URL || 'https://memorypop.app'
```

**OR** set NEXT_PUBLIC_BASE_URL=https://memorypop.app in Vercel to override

### Hardcoded Schema (1 file)
```typescript
// src/components/OrganizationSchema.tsx
// WRONG (current):
"url": "https://memorypop.com",
"logo": "https://memorypop.com/apple-touch-icon.png",
"email": "support@memorypop.com"

// CORRECT:
"url": "https://memorypop.app",
"logo": "https://memorypop.app/apple-touch-icon.png",
"email": "support@memorypop.app"
```

**Impact:** SEO structured data points to wrong domain

---

## Deployment Checklist

### Priority 0: Critical (Must Verify)

- [ ] **Verify NEXT_PUBLIC_BASE_URL** is set to `https://memorypop.app` in Vercel Production
  - Check: Vercel Dashboard → Project → Settings → Environment Variables → Production
  - If missing: Add with value `https://memorypop.app`
  - If wrong: Change from `memorypop.com` to `memorypop.app`

### Priority 1: Core App (Founder-Confirmed)

- [x] NEXT_PUBLIC_SUPABASE_URL ✅ Configured
- [x] NEXT_PUBLIC_SUPABASE_ANON_KEY ✅ Configured
- [x] SESSION_SECRET ✅ Configured
- [x] APP_BASE_URL ✅ Configured as `https://memorypop.app`

### Priority 2: Creator Email (Disabled for Now)

- [x] CREATOR_EMAIL_ENABLED=false (or missing) ✅ Feature disabled
- [ ] EMAIL_FROM (required later)
- [ ] RESEND_API_KEY (required later)

### Priority 3: Payments (Optional Premium Feature)

- [ ] STRIPE_SECRET_KEY (optional, upgrade button fails without it)
- [ ] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (not used yet)

### Priority 4: Monitoring (Partially Configured)

- [x] NEXT_PUBLIC_MIXPANEL_TOKEN ✅ Founder-confirmed configured
- [ ] SENTRY_DSN (needs verification)
- [ ] NEXT_PUBLIC_SENTRY_DSN (needs verification)
- [ ] SENTRY_ENVIRONMENT (optional, falls back to NODE_ENV)
- [ ] SENTRY_AUTH_TOKEN (optional, source maps)
- [ ] SENTRY_ORG (optional, source maps)
- [ ] SENTRY_PROJECT (optional, source maps)

---

## Pre-Deployment Verification Script

Run this in Vercel Production environment to verify critical variables:

```bash
#!/bin/bash
echo "=== Critical Variables Check ==="

# P0 - Must be set
for var in NEXT_PUBLIC_SUPABASE_URL NEXT_PUBLIC_SUPABASE_ANON_KEY SESSION_SECRET NEXT_PUBLIC_BASE_URL; do
  if [ -z "${!var}" ]; then
    echo "❌ $var: MISSING (BLOCKER)"
  elif [ "$var" = "NEXT_PUBLIC_BASE_URL" ] && [[ "${!var}" == *"memorypop.com"* ]]; then
    echo "❌ $var: WRONG DOMAIN (should be memorypop.app, not memorypop.com)"
  else
    echo "✅ $var: SET"
  fi
done

echo ""
echo "=== Email Feature Check ==="
if [ "$CREATOR_EMAIL_ENABLED" = "true" ]; then
  echo "⚠️ Email feature enabled"
  for var in APP_BASE_URL EMAIL_FROM RESEND_API_KEY; do
    if [ -z "${!var}" ]; then
      echo "❌ $var: MISSING (email will fail)"
    else
      echo "✅ $var: SET"
    fi
  done
else
  echo "✅ Email feature disabled (CREATOR_EMAIL_ENABLED != true)"
fi

echo ""
echo "=== Payment Feature Check ==="
if [ -z "$STRIPE_SECRET_KEY" ]; then
  echo "⚠️ STRIPE_SECRET_KEY: MISSING (upgrade button will fail)"
else
  echo "✅ STRIPE_SECRET_KEY: SET"
fi

echo ""
echo "=== Monitoring Check ==="
for var in NEXT_PUBLIC_MIXPANEL_TOKEN SENTRY_DSN NEXT_PUBLIC_SENTRY_DSN; do
  if [ -z "${!var}" ]; then
    echo "ℹ️ $var: MISSING (monitoring disabled)"
  else
    echo "✅ $var: SET"
  fi
done
```

**Expected Output for Safe Deployment:**

```
=== Critical Variables Check ===
✅ NEXT_PUBLIC_SUPABASE_URL: SET
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: SET
✅ SESSION_SECRET: SET
✅ NEXT_PUBLIC_BASE_URL: SET

=== Email Feature Check ===
✅ Email feature disabled (CREATOR_EMAIL_ENABLED != true)

=== Payment Feature Check ===
⚠️ STRIPE_SECRET_KEY: MISSING (upgrade button will fail)

=== Monitoring Check ===
✅ NEXT_PUBLIC_MIXPANEL_TOKEN: SET
ℹ️ SENTRY_DSN: MISSING (monitoring disabled)
ℹ️ NEXT_PUBLIC_SENTRY_DSN: MISSING (monitoring disabled)
```

---

## Security Status

**Client-Exposed Variables (NEXT_PUBLIC_ prefix):**
- ✅ NEXT_PUBLIC_SUPABASE_URL - Safe, public endpoint
- ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY - Safe, designed for client-side
- ✅ NEXT_PUBLIC_BASE_URL - Safe, public domain
- ✅ NEXT_PUBLIC_SENTRY_DSN - Safe, designed for client-side
- ✅ NEXT_PUBLIC_MIXPANEL_TOKEN - Safe, designed for client-side

**Server-Only Variables:**
- ✅ SESSION_SECRET - Server-only, never exposed
- ✅ STRIPE_SECRET_KEY - Server-only, never exposed
- ✅ RESEND_API_KEY - Server-only, never exposed
- ✅ APP_BASE_URL - Server-only
- ✅ EMAIL_FROM - Server-only
- ✅ SENTRY_AUTH_TOKEN - Build-time only

**Verdict:** ✅ No security issues detected

---

## Summary

**True Deployment Blockers (P0):** 0
- All critical variables are Founder-confirmed configured

**Needs Verification (P0.5):** 1
- NEXT_PUBLIC_BASE_URL - Must be `memorypop.app` not `memorypop.com`

**Disabled Features (Safe):** 2
- Creator Email - Gracefully disabled, no impact
- Premium Upgrades - Button fails but core app works

**Optional Monitoring:** 4
- Mixpanel configured ✅
- Sentry needs verification
- App works without monitoring

**Deployment Decision:**

✅ **SAFE TO DEPLOY** after verifying NEXT_PUBLIC_BASE_URL is set correctly

⚠️ **Known Issues:**
- Upgrade button will fail without Stripe (acceptable for now)
- Error tracking may be blind without Sentry DSN verification

---

**End of Corrected Environment Audit**

**Status:** ⏸️ WAITING FOR FOUNDER TO VERIFY NEXT_PUBLIC_BASE_URL
**Next Action:** Confirm NEXT_PUBLIC_BASE_URL=https://memorypop.app in Vercel Production
