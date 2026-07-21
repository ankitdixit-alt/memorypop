# Creator Identity Feature - Founder Summary

**Date:** 2026-07-20
**Status:** Product Owner Evaluation Complete - Awaiting Your Approval

---

## Executive Summary

The Product Owner has evaluated the Creator Identity feature request and recommends **BUILD NOW** with significant scope constraints.

**Recommended Sprint 1 (3-5 days):**
- Email capture on success page (optional, not required)
- Creation confirmation email with dashboard + contributor links
- Dashboard banner if email skipped
- Resend email integration
- Basic analytics

**Defer to Later:**
- Sprint 2: Passwordless authentication + "My MemoryPops" dashboard
- Sprint 3: History, replay, lifecycle notifications

---

## Why Build This Now?

### The Problem:
Currently, if a creator loses their dashboard link, they permanently lose access to their MemoryPop. No recovery mechanism exists.

### The Risk:
Without email recovery, MemoryPop feels ephemeral. Public users won't trust the product or pay €7 for Premium if they might lose access.

### The Solution:
Capture creator email AFTER creation (no friction added) and send them both links via email. Simple, reversible, validates demand before building full auth system.

---

## Product Owner Decision

**Decision:** BUILD NOW (Sprint 1 only)

**Score:** 19/25
- Customer Value: 4/5 (solves real pain point)
- MVP Importance: 4/5 (critical for public launch)
- Complexity: 4/5 (simple implementation)
- Learning Value: 4/5 (validates before investing in auth)
- Revenue Potential: 3/5 (indirect: builds trust)

**Rationale:**
- Trust gate for public launch
- No friction added (email AFTER creation, not before)
- Simple implementation (no auth system)
- Validates demand (will creators provide email?)
- Foundation for Phase 2 without overbuilding

---

## What Gets Built (Sprint 1)

### Database:
```sql
ALTER TABLE memorypops ADD COLUMN creator_email TEXT;
CREATE INDEX idx_memorypops_creator_email ON memorypops(creator_email);
```

### Frontend:
1. `/success` page: Inline email capture form
   - Email input + submit button
   - "Skip for now" option (subtle)
   - Success/error messages

2. `/dashboard/{shareCode}`: Banner if no email captured
   - "⚠️ Add your email to enable recovery"
   - Shows once per session only

### Backend:
1. API route: `POST /api/send-creator-email`
   - Validate email + share_code
   - Update database
   - Send email via Resend

2. Email template (React Email):
   - Subject: "Your MemoryPop for {recipient} is Ready 🎉"
   - Dashboard link (marked "PRIVATE")
   - Contributor link (marked "SHARE THIS")
   - Footer: "Keep this safe - it's your key to managing {recipient}'s celebration"

### Third-Party:
- Resend setup (€0 at beta scale, free tier covers 3,000 emails/month)
- Domain verification + SPF/DKIM records

### Analytics:
- Email capture rate
- Email open rate
- Dashboard access from email link

---

## What Gets Deferred

**Not Building in Sprint 1:**
- ❌ Passwordless authentication (Supabase Auth)
- ❌ "My MemoryPops" centralized dashboard
- ❌ Multi-MemoryPop management
- ❌ History and replay
- ❌ Lifecycle notifications
- ❌ Account deletion / GDPR features

**Why defer:**
Sprint 1 validates whether creators value email recovery before investing 5-8 days in full auth system.

---

## Email Service Cost

**Provider:** Resend (recommended)

| Scale | MemoryPops/Month | Email Cost | Infrastructure Total |
|-------|------------------|------------|---------------------|
| Beta | 0-1,000 | €0 (free tier) | €42-€82/month |
| Growth | 10,000 | €10-€18 | €88-€528/month |
| Scale | 100,000 | €70-€80 | €148-€590/month |

**Impact:** Negligible. Already budgeted in financial plan.

---

## Standard/Premium/Keepsake Tiers

### Standard (Free):
- ✅ Email capture and creation confirmation
- ✅ Email recovery of dashboard link
- ✅ Single dashboard access via link
- ✅ View contributions and reactions

### Premium (€4.99-€9.99):
- 📧 Lifecycle notifications (contribution, reminder, reveal, reaction)

### Keepsake (€19.99-€29.99):
- 📦 Download complete archive
- 📦 PDF export
- 📦 10-year guaranteed storage

---

## Security & Privacy

### Security Risks (Sprint 1):
- **LOW:** Email enumeration (no public endpoint)
- **MEDIUM:** Share code exposure (already mitigated via Plausible)
- **MEDIUM:** Contributor access to creator dashboard (no change from current state)

### Privacy Requirements:
⚠️ **BLOCKING:** Privacy Policy must be updated before Sprint 1 launch
- Email usage disclosure
- Consent checkbox on form
- Unsubscribe link in email
- Data retention policy

**Without updated Privacy Policy, cannot capture creator emails (GDPR violation).**

---

## 8 Decisions Required from You

### Decision 1: Email Capture Timing
**Recommendation:** After creation (success page) ✅

**Why:** Preserves "emotion before technology" principle. No friction before creation.

**Your Decision:** Approve / Modify / Reject

---

### Decision 2: Email Required vs. Optional
**Recommendation:** Optional, but strongly encouraged (dashboard banner if skipped) ✅

**Why:** Preserves "no account required" principle. Beta users can test without email.

**Your Decision:** Approve / Modify / Reject

---

### Decision 3: Privacy Policy Update
**Recommendation:** Block Sprint 1 until Privacy Policy updated ⚠️

**Why:** GDPR violation risk (€20M fine or 4% revenue). Cannot capture emails without policy.

**Your Decision:** 
- Who owns Privacy Policy creation?
- Timeline to update?
- Legal counsel required?

---

### Decision 4: Email Service Provider
**Recommendation:** Resend ✅

**Why:** Modern DX, great Next.js integration, €0 at beta scale, GDPR-compliant.

**Alternative:** Postmark (better reputation, 15% more expensive)

**Your Decision:** Approve Resend / Choose alternative / Evaluate both

---

### Decision 5: Dashboard Banner Persistence
**Recommendation:** Once per session (sessionStorage) ✅

**Why:** Balances conversion with respecting creator choice. Not annoying.

**Your Decision:** Approve / Show every time / Show once forever

---

### Decision 6: Sprint 2 Commitment
**Recommendation:** Wait for Sprint 1 validation ✅

**Why:** Sprint 2 is 5-8 days. Only commit if Sprint 1 shows:
- ≥60% email capture rate
- ≥5% creators use recovery link
- Qualitative demand for "My MemoryPops" dashboard

**Your Decision:** 
- Commit Sprint 2 now
- Wait for Sprint 1 validation (recommended)

---

### Decision 7: Premium Notification Scope
**Recommendation:** Premium-only (not Standard) ✅

**Why:** Aligns with €4.99-€9.99 pricing. High perceived value. Encourages conversion.

**Alternative:** Include basic notifications in Standard (may reduce Premium conversion)

**Your Decision:** Approve Premium-only / Include in Standard

---

### Decision 8: Public Launch Blocker
**Recommendation:** YES - Block public launch until Sprint 1 ships ⚠️

**Why:**
- Beta users tolerate lost-link risk
- Public users expect account safety as table stakes
- Lack of recovery = credibility risk
- Premium conversion requires trust

**Your Decision:** 
- Block launch until Sprint 1 complete
- Launch without email recovery

---

## Success Metrics (Sprint 1)

**Validation Criteria:**
- ≥60% email capture rate on success page
- ≥15% email capture from dashboard banner
- ≥30% email open rate within 24 hours
- ≥5% creators access dashboard from email link
- 0 spam complaints
- 0 critical bugs after 2 weeks

**If Sprint 1 fails these metrics:**
- Do not proceed to Sprint 2
- Investigate why creators don't value email recovery
- Consider alternative solutions

---

## Timeline

**Assuming you approve today (2026-07-20):**

| Stage | Duration | Dates |
|-------|----------|-------|
| Planning | 1 day | 2026-07-21 |
| Your spec approval | 0.5 days | 2026-07-21 |
| Implementation | 3-5 days | 2026-07-22 to 2026-07-26 |
| Testing | 1 day | 2026-07-27 |
| Judge + Review | 1 day | 2026-07-28 |
| Your production validation | 0.5 days | 2026-07-28 |

**Earliest completion:** 2026-07-28 (8 days)
**Latest completion:** 2026-07-30 (10 days)

**Risk buffer:** +2 days for Privacy Policy update or email deliverability testing

---

## Budget

**Claude Usage:**
- Today (Product Owner): $1.50
- Remaining stages: ~$4.60
- Total project: ~$6.10 (20% of $30 daily budget)
- ✅ Well within budget, large safety margin

---

## Recommended Next Actions

### Option 1: Approve Sprint 1 (Recommended)
1. Review full prioritization: `.pipeline/creator-identity-prioritization.md`
2. Answer 8 decisions above
3. Confirm Privacy Policy ownership and timeline
4. Authorize Planner to begin
5. Review specification before implementation

### Option 2: Modify Sprint 1 Scope
1. Specify which parts to keep/remove/change
2. Product Owner revises prioritization
3. Re-review and approve

### Option 3: Reject Sprint 1
1. Specify reason for rejection
2. Identify what would make it approvable
3. Product Owner re-evaluates or closes request

---

## Key Documents

1. **Full Prioritization (9 sections):** `.pipeline/creator-identity-prioritization.md`
2. **Status Summary:** `.pipeline/creator-identity-status.md`
3. **Progress Tracking:** `.pipeline/creator-identity-progress.md`
4. **Budget Tracking:** `.pipeline/creator-identity-budget.md`
5. **Original Request:** `.pipeline/creator-identity-request.md`

---

## Product Owner Recommendation

**BUILD NOW** - Sprint 1 only (Email Capture & Creation Confirmation)

**Why:**
- Trust gate for public launch
- No friction added to creation flow
- Simple, reversible implementation
- Validates demand before investing in full auth
- Foundation for future without overbuilding
- €0 cost at beta scale
- 8 days to production

**Blocker:**
Privacy Policy must be updated before implementation begins.

**Decision Required:**
Your explicit approval to proceed to Planning stage.

---

**Status:** Awaiting your review and decision.

**If you approve:** Planner will produce implementation specification within 24 hours for your review.

**If you need clarification:** Request specific sections to be expanded or revised.

**If you reject:** Provide reason so Product Owner can re-evaluate or close request.
