# Specification Update Summary: Environment Configuration & Production Safety

**Date:** 2026-07-20
**Updated By:** Planner Agent
**Reason:** Incorporate Founder clarification on domain ownership and production safety requirements

---

## What Changed

The specification has been updated to reflect that:
1. Domain `memorypop.app` is NOT yet owned (will purchase this week)
2. Current production is `https://memorypop.vercel.app`
3. All configuration must be environment-variable driven (no hardcoded domains)
4. Feature must degrade gracefully when disabled
5. Production activation requires 14-point safety gate

---

## Major Updates to Specification

### 1. New Section: Environment Configuration (Section 4)

**Added:**
- Complete environment variable documentation (4 required variables)
- Runtime validation logic with clear error messages
- Behavior per environment (Local, Staging, Production)
- Graceful degradation when `CREATOR_EMAIL_ENABLED=false`
- Domain-agnostic link generation patterns

**Key Environment Variables:**
```bash
APP_BASE_URL          # http://localhost:3000 → https://memorypop.app
EMAIL_FROM            # Sender address (must match verified domain)
RESEND_API_KEY        # API key from Resend
CREATOR_EMAIL_ENABLED # Feature flag (defaults to false)
```

---

### 2. Updated: Deployment Plan (Section 18)

**Changed from:** Single deployment checklist
**Changed to:** Three-phase deployment strategy

**Phase 1: Development (NOW)**
- Build all functionality
- Test with Resend test mode or mocked transport
- No production emails
- Feature flag disabled in production

**Phase 2: Post-Domain-Purchase Preparation**
- Complete 14-point production safety gate
- Domain purchase blocks all other gates
- Privacy Policy update is legal blocker

**Phase 3: Production Activation**
- Set `CREATOR_EMAIL_ENABLED=true` after Founder approval
- Smoke testing procedure
- 48-hour monitoring plan
- Clear rollback procedure

---

### 3. New: 14-Point Production Safety Gate

**Purpose:** Ensure zero risk of sending malformed or unauthorized emails before feature activation

**Critical Gates:**
1. Domain purchased ✅ (Founder)
2. Domain connected to Vercel ✅ (Developer)
3. DNS records active ✅ (Developer)
4. Resend domain added ✅ (Developer)
5. DNS verification for Resend ✅ (Developer)
6. Resend domain verified ✅ (Developer)
7. Production ENV updated ✅ (Developer)
8. APP_BASE_URL updated ✅ (Developer)
9. **Privacy Policy updated ✅ (Founder - Legal blocker)**
10. Test email sent ✅ (Developer)
11. Email deliverability verified ✅ (Founder)
12. Link URLs verified ✅ (Founder)
13. Graceful degradation tested ✅ (Developer)
14. **Founder approval ✅ (Founder - Final gate)**

**Blockers:**
- Gate 1 (Domain Purchase) blocks gates 2-8
- Gate 9 (Privacy Policy) is legal blocker
- Gate 14 (Founder Approval) is final approval before activation

---

### 4. Updated: API Route Implementation (Section 9)

**Added:**
- Environment variable validation at runtime
- Feature flag check (`CREATOR_EMAIL_ENABLED`)
- Domain-agnostic URL generation using `APP_BASE_URL`
- `EMAIL_FROM` validation (no default fallback)
- New error responses:
  - `503 EMAIL_DISABLED` when feature disabled
  - `500 Email configuration error` when ENV incomplete

**Code Changes:**
```typescript
// NEW: Runtime validation
function validateEmailConfig(): { valid: boolean; errors: string[] }

// NEW: Domain-agnostic link building
function buildMemoryPopUrl(path: string): string

// NEW: Feature flag check
if (process.env.CREATOR_EMAIL_ENABLED !== 'true') {
  return 503 EMAIL_DISABLED
}
```

---

### 5. Updated: Acceptance Criteria (Section 19)

**Added:**
- Feature must hide when `CREATOR_EMAIL_ENABLED=false`
- Environment validation must work correctly
- No hardcoded domains anywhere
- Graceful degradation without crashes
- Schema works correctly when feature disabled

---

### 6. Updated: Edge Cases (Section 16)

**Added two new edge cases:**

**Edge Case: Feature Disabled**
- UI hidden
- API returns 503 with clear message
- No database writes
- No Resend calls
- Normal MemoryPop creation unaffected

**Edge Case: Missing Environment Variables**
- API returns 500 with configuration error
- Specific missing variables logged
- Prevents emails with malformed links

---

### 7. Updated: Environment Variables Section (Section 13)

**Changed from:** 2 variables (API key, sender address)
**Changed to:** 4 variables with complete documentation

**Added:**
- `APP_BASE_URL` (required)
- `CREATOR_EMAIL_ENABLED` (feature flag)
- Environment-specific value tables
- Security notes about runtime validation
- Behavior differences per environment

---

### 8. Updated: Third-Party Setup (Section 14)

**Changed from:** Single domain verification guide
**Changed to:** Phase-based setup strategy

**Phase 1 (Now):**
- Create Resend account
- Generate test API key
- Test in development with test mode

**Phase 2 (After Domain Purchase):**
- Add `memorypop.app` to Resend
- Complete DNS verification
- Update production environment variables

---

### 9. Updated: Assumptions (Section 3)

**Added:**
- Domain status clarification (NOT yet owned)
- Current vs future production URLs
- Environment-variable requirement
- Feature flag control
- No hardcoded values allowed

---

## What Was NOT Changed

The following remain unchanged:
- Database schema (still `creator_email` nullable column)
- Email template design and content
- Frontend component structure
- Analytics events
- Testing requirements (except graceful degradation test added)
- Success metrics
- Package dependencies

---

## Development Impact

### What Developers Can Do NOW (Phase 1)

✅ **Allowed:**
- Database migration
- API route implementation
- Email template development
- Frontend components
- Analytics integration
- Automated tests
- Local testing with Resend test mode

❌ **Blocked:**
- Domain purchase (Founder decision)
- Production email sending
- Feature flag enablement in production
- Real user testing

### What Requires Domain Purchase (Phase 2)

After `memorypop.app` is purchased:
- Domain connection to Vercel
- DNS record configuration
- Resend domain verification
- Production environment variable updates
- 14-point safety gate completion

### What Requires Founder Approval (Phase 3)

Before setting `CREATOR_EMAIL_ENABLED=true`:
- Privacy Policy update complete
- All 14 safety gates passed
- Explicit Founder approval

---

## Configuration Safety Features

### Runtime Validation
Every email operation validates:
1. `APP_BASE_URL` is set and is valid URL
2. `EMAIL_FROM` is set (when enabled)
3. `RESEND_API_KEY` is set (when enabled)
4. `CREATOR_EMAIL_ENABLED` is explicitly `"true"`

### Graceful Degradation
When `CREATOR_EMAIL_ENABLED=false`:
- UI: Email forms hidden (not broken)
- API: Returns 503 with clear message
- Database: No writes attempted
- Monitoring: Errors logged but not user-visible
- App: Normal MemoryPop creation continues

### Fail-Fast on Misconfiguration
If environment incomplete:
- API returns 500 immediately
- Clear server logs indicate missing variables
- No emails sent with malformed links
- Developer alerted to fix configuration

---

## Rollback Safety

**Instant Disable:**
1. Set `CREATOR_EMAIL_ENABLED=false` in Vercel
2. Vercel redeploys automatically (30-60 seconds)
3. Feature hidden from all users
4. No code deployment needed
5. No data loss (existing emails preserved)
6. No impact on MemoryPop creation

**Rollback Triggers:**
- Email delivery rate < 90%
- Email bounce rate > 5%
- Critical bug reported
- Privacy/compliance concern
- Founder decision

---

## Testing Requirements Added

### New Tests Required

1. **Environment Validation Test:**
   - Missing `APP_BASE_URL` → clear error
   - Invalid `APP_BASE_URL` → clear error
   - Missing `EMAIL_FROM` when enabled → clear error
   - Missing `RESEND_API_KEY` when enabled → clear error

2. **Feature Flag Test:**
   - `CREATOR_EMAIL_ENABLED=false` → UI hidden
   - `CREATOR_EMAIL_ENABLED=false` → API returns 503
   - `CREATOR_EMAIL_ENABLED=true` → feature works

3. **Graceful Degradation Test:**
   - Feature disabled → MemoryPop creation works
   - Feature disabled → Dashboard access works
   - Feature disabled → No crashes or exceptions

4. **Link Generation Test:**
   - `APP_BASE_URL=http://localhost:3000` → correct local links
   - `APP_BASE_URL=https://memorypop.vercel.app` → correct production links
   - `APP_BASE_URL=https://memorypop.app` → correct future links

---

## Documentation Updates

All sections marked with 🔄 prefix:
- Section 3: Assumptions
- Section 4: Environment Configuration (NEW)
- Section 5: In Scope
- Section 9: API Route
- Section 13: Environment Variables
- Section 14: Third-Party Setup
- Section 16: Edge Cases
- Section 18: Deployment Plan
- Section 19: Acceptance Criteria

---

## Key Takeaways for Founder

### What This Means for Timeline

**Phase 1 (Development):**
- Can start immediately
- No blockers
- Estimated: 3-5 days

**Phase 2 (Post-Domain-Purchase):**
- BLOCKED until domain purchased
- Requires DNS/Resend setup: 2-4 hours
- Privacy Policy update: TBD (Founder)
- Testing and verification: 1-2 hours

**Phase 3 (Production Activation):**
- Requires Founder approval
- Smoke testing: 10-15 minutes
- Monitoring: 48 hours
- Can rollback instantly if needed

### Critical Path

```
Domain Purchase → Privacy Policy → 14-Point Gate → Founder Approval → Activation
     (Gate 1)          (Gate 9)      (Gates 2-13)      (Gate 14)
```

### Safety Guarantees

1. **No Production Risk Before Domain Purchase:**
   - Feature disabled by default
   - No emails sent before explicit enablement
   - Development can proceed safely

2. **No Real Emails Before Approval:**
   - 14-point gate must complete
   - Founder must explicitly approve
   - Test email verified before production

3. **Instant Rollback Available:**
   - Single environment variable flip
   - No code deployment needed
   - No data loss or corruption risk

4. **No Breaking Changes:**
   - Normal MemoryPop creation unaffected
   - Existing features continue working
   - Graceful degradation when disabled

---

## Questions for Founder (If Any)

1. **Domain Purchase Timeline:** When will `memorypop.app` be purchased?
2. **Privacy Policy Owner:** Who will update Privacy Policy (Gate 9)?
3. **Acceptable Launch Delay:** Is delaying until domain purchased acceptable, or should we use `memorypop.vercel.app` initially?

---

## Recommendation

The updated specification is **ready for Founder approval** with the following understanding:

**Development can start immediately** (Phase 1) with no risk:
- All code uses environment variables
- No hardcoded domains
- Feature disabled in production by default
- Testing proceeds with local/test mode

**Production activation blocked until:**
- Domain purchased
- Privacy Policy updated
- 14-point gate complete
- Founder explicitly approves

This approach **maximizes safety** while allowing development to proceed in parallel with domain acquisition.

---

**Next Step:** Founder reviews updated specification and approves/rejects/modifies before Coder begins implementation.
