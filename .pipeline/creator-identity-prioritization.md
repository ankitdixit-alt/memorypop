# Product Owner Prioritization: Creator Identity, Email Recovery, and MemoryPop History

**Date:** 2026-07-20
**Product Owner:** Claude (Product Owner Agent)
**Status:** Awaiting Founder Approval

---

## 1. Product Decision

**BUILD NOW** (Sprint 1 Only - Email Capture & Recovery)

**Defer to Next Sprint:** Passwordless authentication and "My MemoryPops" dashboard
**Defer to Backlog:** Full history, replay experience, and lifecycle notifications

---

## 2. Score

| Criterion | Score | Rationale |
|-----------|-------|-----------|
| **Customer Value** | 4/5 | Solves real pain: lost links = lost access. Email recovery is table stakes. |
| **MVP Importance** | 4/5 | Critical for public launch. Creators need confidence they won't lose access. |
| **Complexity** | 4/5 | Sprint 1 is simple: capture email, send confirmation with links. Low risk. |
| **Learning Value** | 4/5 | Will validate if creators find value in email recovery before building auth. |
| **Revenue Potential** | 3/5 | Indirect: builds trust for future Premium upgrades. Not direct monetization. |

**Total Score:** 19/25

**Decision Rationale:** Score suggests "next sprint" but Creator Identity (email capture phase only) should be built now because:

1. **Trust gate for public launch:** Without email recovery, MemoryPop feels ephemeral and risky
2. **No friction added:** Email capture happens AFTER creation (success page), not before
3. **Simple implementation:** No auth system, no dashboard, just email + transactional message
4. **Validates demand:** Measures whether creators value account recovery before investing in full auth
5. **Foundation for future:** Lays groundwork for Phase 2 (auth) and Phase 3 (history) without overbuilding

---

## 3. Current-State Authentication and Link-Access Audit

### How Creators Currently Access MemoryPops

**Current Flow:**
1. Creator completes 3-step creation form (`/create`)
2. System generates random `share_code` (UUID)
3. Creator redirected to `/success?shareCode={code}` with two links:
   - **Private creator link:** `/dashboard/{shareCode}`
   - **Shareable contributor link:** `/m/{shareCode}/contribute`
4. Creator must bookmark or save these links manually
5. No email capture, no account creation, no auth required

**Access Model:**
- **Security:** Knowledge of `share_code` = access to dashboard
- **Recovery:** None. Lost link = permanent loss of access.
- **RLS Policy:** Not audited in codebase, but assumed to be open SELECT on `memorypops` by `share_code`

### What Happens If Creator Loses the Link

**Current Behavior:** Permanent loss of access. No recovery mechanism exists.

**User Impact:**
- Cannot manage MemoryPop
- Cannot see contributions
- Cannot upgrade to Premium
- Cannot see recipient reactions
- Cannot relive completed celebrations

**Workaround:** None available without support intervention (and no creator email to contact them).

### What Creator Data Exists Today

**Database Schema (from migrations):**

```sql
-- Core memorypops table (inferred from usage)
CREATE TABLE memorypops (
  id UUID PRIMARY KEY,
  share_code TEXT UNIQUE NOT NULL,
  recipient_name TEXT NOT NULL,
  occasion TEXT NOT NULL,
  story TEXT,
  tone TEXT,
  status TEXT NOT NULL,
  celebration_date DATE,
  cover_style TEXT DEFAULT 'none',

  -- Premium features (002_add_premium_features.sql)
  is_premium BOOLEAN DEFAULT FALSE NOT NULL,
  upgraded_at TIMESTAMP WITH TIME ZONE,
  stripe_payment_id TEXT,
  stripe_customer_id TEXT,

  -- Standard timestamps (assumed)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Notable Gaps:**
- **No `creator_email` field** (does not exist)
- **No `creator_id` field** (no auth user association)
- **No `management_token` field** (security relies solely on share_code secrecy)

**Related Tables:**
- `memorypop_reactions` - recipient reactions (1 per MemoryPop)
- `contributions` table - assumed to exist for contributor messages/photos
- No `users` or `creators` table exists

### Current Security Model for Management Tokens

**Security:**
- `share_code` acts as both identifier AND secret
- No separate management token
- Dashboard route `/dashboard/{shareCode}` has no authentication check
- Anyone with the link can access creator dashboard

**Vulnerabilities:**
1. Share code may appear in analytics, referrer logs, or browser history
2. No rotation mechanism if link is compromised
3. No rate limiting visible on dashboard access
4. Contributors could accidentally access creator dashboard if given wrong link

**RLS Status:** Migrations show RLS enabled for `memorypop_reactions` but no evidence of RLS policies for `memorypops` table itself.

---

## 4. Recommended Creator Identity Journey

### Phase 1: Email Capture & Creation Confirmation (BUILD NOW)

**When to capture email:**
Immediately after MemoryPop creation, on `/success` page.

**Flow:**
1. Creator completes creation → redirected to `/success?shareCode={code}`
2. Success page shows:
   - Celebration created confirmation
   - Two prominent action buttons:
     - "Share with Contributors" (primary)
     - "Email Me This Link" (secondary, coral outline)
3. "Email Me This Link" opens inline form:
   - Single email input
   - "Send Confirmation Email" button
   - Optional: "Skip for now" link
4. On submit:
   - Validate email format
   - Update `memorypops.creator_email` (new column)
   - Send creation confirmation email
   - Show success message: "Check your inbox! We sent you both links."
5. Email contains:
   - Subject: "Your MemoryPop for {recipient_name} is Ready 🎉"
   - Private creator dashboard link (clearly marked "PRIVATE - For You Only")
   - Contributor sharing link (clearly marked "SHARE THIS with friends & family")
   - Visual distinction between the two links
   - Plain text alternative
   - Footer: "Keep this email safe. It's your key to managing {recipient_name}'s celebration."

**Should email be required or optional in beta?**

**Recommendation: Optional, but strongly encouraged**

Rationale:
- Beta users may want to test without providing email
- Product principle: "No friction before first MemoryPop creation"
- Avoiding sign-up friction is a core differentiator
- BUT: Show persistent reminder on dashboard if no email captured

**Dashboard Reminder (if no email):**
```
⚠️ Save this link! Without an email on file, you won't be able to recover access if you lose it.
[Add My Email] button (opens inline form)
```

**Analytics Events to Track:**
- `email_capture_prompted` (success page shown)
- `email_capture_submitted` (email provided)
- `email_capture_skipped` (user chose "skip for now")
- `email_capture_dashboard_retry` (added email later from dashboard banner)
- `email_confirmation_opened` (email link clicked)

### Phase 2: Passwordless Authentication & "My MemoryPops" Dashboard (NEXT SPRINT)

**Not building now. Document for future reference.**

**When Phase 2 becomes priority:**
- After validating Phase 1 email capture rates
- When creators request centralized access
- When multiple MemoryPop ownership becomes common use case

**Proposed Flow:**
1. Creator visits `/login` or clicks "View My MemoryPops" from marketing site
2. Enter email → receives magic link via Supabase Auth
3. Click magic link → authenticated session
4. Redirect to `/my-memorypops` dashboard showing:
   - Active celebrations (before celebration date)
   - Upcoming celebrations (within 7 days)
   - Completed celebrations (past reveal date)
   - Ability to claim legacy MemoryPops created with same email before auth existed

**Security Requirements:**
- Supabase Auth passwordless magic links (built-in, no custom implementation)
- `creator_id` column references `auth.users(id)`
- RLS policies on `memorypops`:
  ```sql
  CREATE POLICY "Creators can view own memorypops"
    ON memorypops FOR SELECT
    USING (auth.uid() = creator_id);
  ```
- Safe migration path for legacy email-only MemoryPops

### Phase 3: History, Replay, and Lifecycle Notifications (BACKLOG)

**Not building now. Document for future reference.**

**Features:**
- Timeline view of all celebrations
- Replay completed MemoryPops
- See all contributor messages and photos
- View recipient reactions
- Purchase history (for Premium upgrades)
- Lifecycle emails:
  - First contribution received
  - Celebration reminder (1 day before)
  - Ready for reveal (on celebration date)
  - Recipient reacted

**Premium vs. Standard Classification:**
- History access: Standard (free)
- Replay experience: Standard (free)
- Download/export: Keepsake tier
- Advanced notifications: Premium tier

### Handling Existing Anonymous MemoryPops

**Problem:** MemoryPops created before email capture have no `creator_email`.

**Solutions:**

**Option 1: Graceful Degradation (Recommended for MVP)**
- Legacy MemoryPops continue working via direct link
- Dashboard shows banner: "Add your email to enable recovery and access from any device"
- No retroactive claiming required
- Simple, low-risk

**Option 2: Email-Based Claiming (Phase 2)**
- When creator provides email on dashboard, associate that email with MemoryPop
- When creator authenticates (Phase 2), auto-claim all MemoryPops matching email
- Requires conflict resolution if multiple people claim same email

**Option 3: Do Nothing**
- Legacy MemoryPops remain link-only forever
- Acceptable for beta period
- Clears technical debt by not supporting legacy pattern

**Recommendation:** Option 1 for Phase 1. Enables smooth migration to Option 2 in Phase 2 without database migrations or breaking changes.

---

## 5. Standard/Premium/Keepsake Classification

### Standard Tier (Free)

**Creator Identity & Access:**
- ✅ Email capture and creation confirmation
- ✅ Email recovery of creator dashboard link
- ✅ Single dashboard access via link (Phase 1)
- ✅ Authenticated "My MemoryPops" dashboard (Phase 2)
- ✅ View all created MemoryPops
- ✅ See contributions in real-time
- ✅ View recipient reactions

**Why free?**
- Table stakes for credible digital product
- Builds trust for future Premium conversion
- No incremental cost to provide (email + auth are fixed costs)

### Premium Tier (€4.99-€9.99 per MemoryPop)

**Enhanced Notifications:**
- 📧 First contribution received
- 📧 Celebration reminder (1 day before)
- 📧 Recipient opened MemoryPop
- 📧 Recipient reacted

**Why Premium?**
- High perceived value: "Stay connected to the celebration"
- Low cost to deliver (transactional emails)
- Encourages Premium upgrade at purchase decision point

### Keepsake Tier (Future)

**Permanent Preservation:**
- 📦 Download complete MemoryPop archive (HTML + assets)
- 📦 PDF export with all memories
- 📦 High-resolution photo gallery download
- 📦 10-year guaranteed storage

**Why Keepsake?**
- Solves "what if MemoryPop shuts down?" concern
- Justifies higher price point (€19.99-€29.99)
- Provides emotional insurance

---

## 6. Security and Privacy Risks

### Security Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| **Account Takeover via Email Hijacking** | HIGH | Supabase Auth magic links (Phase 2) have built-in expiration and single-use tokens. Phase 1 has no auth, so no account to take over. |
| **Share Code Exposure in Logs/Analytics** | MEDIUM | Never log full dashboard URLs. Track only `share_code` hash or MemoryPop `id`. Already implemented via Plausible (privacy-first). |
| **Email Enumeration Attack** | LOW | No public "check if email exists" endpoint. Email capture is write-only. |
| **Contributor Access to Creator Dashboard** | MEDIUM | Currently possible if contributor receives wrong link. Phase 2 RLS will prevent this. Phase 1 relies on creator not sharing dashboard link. |
| **Lost Email Access (Creator loses email account)** | MEDIUM | No recovery mechanism if creator loses email access. Consider adding secondary email or SMS in Phase 3. |
| **Stripe Customer ID Leakage** | LOW | Stripe IDs are not sensitive (designed to be semi-public). But verify they're not exposed in frontend API responses. |

### Privacy Risks & GDPR Compliance

| Requirement | Status | Action Required |
|-------------|--------|-----------------|
| **Consent for Email Storage** | ⚠️ REQUIRED | Add checkbox: "I agree to receive MemoryPop creation confirmation and recovery emails." Link to Privacy Policy. |
| **Privacy Policy Update** | ⚠️ REQUIRED | Document email usage: "We store your email to send you your private creator link and (if Premium) celebration notifications." |
| **Email Opt-Out** | ⚠️ REQUIRED | Phase 1: Include unsubscribe link (but clarify: "You'll still be able to access your dashboard"). Phase 2: Allow email change in settings. |
| **Right to be Forgotten (GDPR Article 17)** | ⚠️ REQUIRED | Provide "Delete My Account" feature (Phase 2). Must delete: creator email, auth record, all MemoryPops. Inform contributors that MemoryPop will be deleted. |
| **Data Portability (GDPR Article 20)** | 📅 PHASE 3 | Keepsake tier naturally satisfies this (download all data). |
| **Data Retention Policy** | ⚠️ REQUIRED | Define: How long do we keep completed MemoryPops? Recommendation: Forever (unless creator deletes). But must document in Privacy Policy. |
| **Email Change Behavior** | 📅 PHASE 2 | Allow email change in settings. Re-verify new email. Do NOT allow claiming other users' MemoryPops via email change. |
| **Duplicate Email Handling** | 📅 PHASE 2 | Multiple MemoryPops can share same creator_email. Phase 2 auth links to `auth.users(id)`, not email (Supabase handles this). |

### Safe Account-Claiming Rules (Phase 2)

**Problem:** When creator authenticates for first time, how do we associate legacy email-only MemoryPops?

**Proposed Rules:**
1. **Auto-claim:** MemoryPops with `creator_email` matching authenticated user's email are automatically associated
2. **No manual claiming:** Do not allow "Enter an old MemoryPop link to claim it" feature (security risk)
3. **Conflict resolution:** If MemoryPop already has `creator_id` set, do NOT overwrite (first claimer wins)
4. **Notification:** Email creator when auto-claiming happens: "We linked 3 MemoryPops to your new account"

---

## 7. Email Service Cost Estimate

### Recommended Provider: **Resend**

**Why Resend:**
- Modern, developer-friendly API (similar to Stripe)
- Excellent Next.js/React Email integration
- GDPR-compliant (EU presence)
- Transparent pricing
- Built for transactional emails (not marketing)
- Already listed in MemoryPop financial plan

**Alternative Providers:**
- **SendGrid:** More expensive, complex UI, reputation issues
- **Postmark:** Excellent deliverability, but pricier
- **AWS SES:** Cheapest, but requires more setup and monitoring
- **Mailgun:** Mid-tier option, acceptable but not ideal UX

### Cost Estimate

#### Beta/Early Stage (0-1,000 MemoryPops/month)

**Email Volume:**
- Creation confirmations: ~1,000/month (assume 100% opt-in initially)
- Total emails: 1,000/month

**Resend Pricing:**
- Free tier: 3,000 emails/month
- **Cost: €0/month** ✅

#### Growth Stage (10,000 MemoryPops/month)

**Email Volume:**
- Creation confirmations: ~8,000/month (assume 80% opt-in)
- Premium notifications (5% Premium rate): ~4,000/month (4 emails per Premium MemoryPop)
- Total: ~12,000 emails/month

**Resend Pricing:**
- €10/month for 50,000 emails
- **Cost: €10-€18/month**

#### Scale (100,000 MemoryPops/month)

**Email Volume:**
- Creation confirmations: ~80,000/month
- Premium notifications: ~40,000/month
- Total: ~120,000 emails/month

**Resend Pricing:**
- €70/month for 150,000 emails
- **Cost: €70-€80/month**

### Operating Cost Implications

**Impact on Financial Plan:**

| Scale | Email Cost | Total Infrastructure | Email % of Total |
|-------|-----------|---------------------|------------------|
| Beta | €0 | €42-€82/month | 0% |
| Growth | €10-€18 | €88-€528/month | 11-18% |
| Scale | €70-€80 | €148-€590/month | 47-13% |

**Conclusion:** Email costs are negligible at beta scale and remain manageable at growth stage (already budgeted in financial plan at €18-€80/month). Not a blocker for launch.

**Cost per MemoryPop:** €0.001-€0.008 (less than 1 cent per creation) - far below €4.99 Premium price.

---

## 8. Proposed Phased Roadmap

### Sprint 1: Email Capture & Creation Confirmation (BUILD NOW)

**Goal:** Enable creator email recovery without adding auth complexity.

**User Story:**
As a creator, I want to receive my private dashboard link via email so I can access my MemoryPop later even if I lose the original link.

**Scope:**

**Database:**
- Add `creator_email TEXT` column to `memorypops` table
- Add `email_sent_at TIMESTAMP` column (optional, for debugging)
- Create index on `creator_email` for future queries
- No RLS changes (link-based access continues working)

**Frontend:**
- `/success` page: Add inline email capture form
  - Input field + submit button
  - "Skip for now" option (subtle, bottom of card)
  - Success state: "Email sent! Check your inbox."
  - Error state: "Please enter a valid email"
- `/dashboard/{shareCode}` page: Add banner if no email captured
  - "⚠️ Add your email to enable recovery" + inline form
  - Show only once per session (store in sessionStorage)

**Backend:**
- API route: `POST /api/send-creator-email`
  - Validate email format
  - Validate `share_code` exists
  - Update `memorypops.creator_email`
  - Send email via Resend
  - Return success/error
- Email template (using React Email):
  - Subject: "Your MemoryPop for {recipient_name} is Ready 🎉"
  - Hero: Occasion-specific emoji + recipient name
  - Body: "We've saved both links for you"
  - Button: "Manage Your MemoryPop" (dashboard link)
  - Text: "Share this link with contributors" (contributor link, secondary)
  - Footer: "Keep this email safe. It contains your private creator link."

**Third-Party Setup:**
- Resend account creation
- Domain verification (memorypop.com)
- SPF/DKIM records (for deliverability)
- Test email sending

**Analytics:**
- Track email capture rate
- Track email open rate (Resend provides this)
- Track dashboard access from email link

**Testing Requirements:**
- Email delivery to Gmail, Outlook, Apple Mail
- Email rendering on mobile devices
- Spam filter testing
- Link expiration testing (links should never expire in Phase 1)
- Error handling: invalid email, Resend API failure

**Success Metrics:**
- ≥60% of creators provide email on success page
- ≥15% of creators add email later from dashboard banner
- ≥30% email open rate within 24 hours
- 0 complaints about spam/phishing

**Estimated Effort:** 3-5 days for experienced developer

**Dependencies:** None (standalone feature)

**Rollout Strategy:**
- Deploy to staging
- Founder manually tests email delivery
- Test with 5-10 real beta users
- Monitor email delivery rates for 48 hours
- Roll out to 100% traffic

**Rollback Plan:**
- Remove email capture form from frontend
- Creator access via link continues working normally
- No data loss (emails already captured remain in database)

---

### Sprint 2: Passwordless Auth & "My MemoryPops" Dashboard (NEXT SPRINT)

**Goal:** Replace link-based access with authenticated creator accounts.

**Prerequisites:**
- Phase 1 email capture must be live
- Must have ≥100 creators with emails captured
- Must validate creator interest in centralized dashboard

**Scope:**

**Authentication:**
- Supabase Auth setup (magic link email)
- `/login` page with email input
- Email verification flow
- Session management
- Logout functionality

**Database:**
- Add `creator_id UUID REFERENCES auth.users(id)` to `memorypops`
- Migration: Auto-associate MemoryPops where `creator_email` matches `auth.users.email`
- RLS policies:
  ```sql
  CREATE POLICY "Creators can view own memorypops"
    ON memorypops FOR SELECT
    USING (auth.uid() = creator_id OR share_code = ANY(current_setting('request.headers', true)::json->>'share_code'));
  ```
  (Allow both authenticated access AND legacy link-based access)

**Frontend:**
- `/my-memorypops` dashboard:
  - List of all MemoryPops (grouped by status)
  - Quick actions: Share, Upgrade, View Dashboard
  - Empty state: "Create your first MemoryPop"
- Navigation: Add "My MemoryPops" link to header (when authenticated)
- `/dashboard/{shareCode}`: Add "Save to Account" prompt if not authenticated

**Backend:**
- Auto-claiming logic for legacy MemoryPops
- Email notification when MemoryPops are auto-claimed

**Testing Requirements:**
- Magic link delivery and expiration
- Multi-device auth (desktop + mobile)
- Legacy link-based access still works
- Auto-claiming does not create conflicts

**Success Metrics:**
- ≥40% of returning creators authenticate
- ≥20% of creators create multiple MemoryPops after authenticating
- 0 reports of lost access during migration

**Estimated Effort:** 5-8 days

---

### Sprint 3: History, Replay & Lifecycle Notifications (BACKLOG)

**Goal:** Complete creator experience with rich history and proactive notifications.

**Prerequisites:**
- Phase 2 auth must be live
- Must have ≥500 authenticated creators
- Must have validated willingness to pay for Premium notifications

**Scope:**

**History & Replay:**
- Timeline view (all MemoryPops chronologically)
- Replay mode for completed MemoryPops (read-only)
- Archive feature (hide from main list)
- Search and filter (by occasion, recipient, date)

**Lifecycle Notifications:**
- First contribution received (Premium only)
- Celebration reminder - 1 day before (Premium only)
- Ready for reveal (Standard)
- Recipient reacted (Premium only)

**Notification Preferences:**
- Settings page: Toggle notifications on/off
- Frequency controls (immediate, daily digest, weekly)
- Preview: "See what this email looks like"

**Analytics:**
- Track replay usage
- Track notification open rates
- Track notification → dashboard conversion

**Success Metrics:**
- ≥30% of creators replay completed MemoryPops within 7 days
- ≥25% notification open rate
- ≥10% notification click-through to dashboard

**Estimated Effort:** 8-12 days

---

### Sprint Dependency Chart

```
Sprint 1 (Email Capture)
    ↓
    ✓ Validates creator interest in email recovery
    ↓
Sprint 2 (Auth & Dashboard)
    ↓
    ✓ Enables multi-device access and multi-MemoryPop management
    ↓
Sprint 3 (History & Notifications)
    ↓
    ✓ Completes creator lifecycle and Premium value proposition
```

**Critical Path:** Cannot skip Sprint 1. Sprint 2 and 3 can be combined if Sprint 1 shows very high engagement (≥80% email capture rate + user requests for centralized dashboard).

---

## 9. Smallest Useful Implementation Slice

### What Gets Built Now

**Absolute Minimum to Deliver Value:**

1. **Database Schema:**
   ```sql
   ALTER TABLE memorypops ADD COLUMN creator_email TEXT;
   CREATE INDEX idx_memorypops_creator_email ON memorypops(creator_email);
   ```

2. **Email Capture Form on `/success` page:**
   - Single email input
   - "Send Me This Link" button
   - Inline success/error messages
   - Optional skip

3. **API Route: `/api/send-creator-email`**
   - Validate email + share_code
   - Update database
   - Send email via Resend

4. **Email Template (React Email):**
   - Subject line
   - Body text with both links (dashboard + contributor)
   - Footer with safety message

5. **Resend Integration:**
   - API key setup
   - Domain verification
   - Single transactional email

**What Gets Deferred:**

- ❌ Passwordless authentication (Supabase Auth)
- ❌ "My MemoryPops" centralized dashboard
- ❌ Auto-claiming legacy MemoryPops
- ❌ Email change functionality
- ❌ Notification preferences
- ❌ Lifecycle emails (contribution, reminder, reveal, reaction)
- ❌ Account deletion / Right to be Forgotten
- ❌ History and replay experience

**Why This Slice Works:**

✅ **Solves core user problem:** Creator won't lose access
✅ **No friction added:** Email requested AFTER creation, not before
✅ **Testable end-to-end:** Can demo in 60 seconds
✅ **Reversible:** If email feature fails, rollback = remove form (no data loss)
✅ **Validates hypothesis:** Will creators provide email? Will they use recovery link?
✅ **Foundation for Phase 2:** Email column enables future auth without breaking changes
✅ **Production-ready:** Can ship to real users immediately after testing

**Validation Criteria Before Building Phase 2:**

- ≥60% email capture rate on success page
- ≥30% email open rate within 24 hours
- ≥5% of creators access dashboard from email link (indicates recovery value)
- Zero critical bugs after 2 weeks in production
- Positive qualitative feedback from beta users

---

## 10. Founder Decisions Required

The Product Owner cannot decide these alone. Founder approval required:

### Decision 1: Email Capture Timing

**Question:** Should email be captured on success page (after creation) or during creation flow (before creation)?

**Product Owner Recommendation:** After creation (success page)

**Why this matters:**
- During creation = friction before emotional payoff
- After creation = no friction, but lower capture rate
- MemoryPop principle: "Emotion before technology"

**Founder Must Decide:** Acceptable trade-off between capture rate and friction?

---

### Decision 2: Email Required vs. Optional

**Question:** Should email be required to create a MemoryPop, or optional?

**Product Owner Recommendation:** Optional, but strongly encouraged (dashboard banner if skipped)

**Why this matters:**
- Required = 100% capture rate, but breaks "account-free creation" principle
- Optional = preserves principle, but some creators will skip
- Competitor analysis: Kudoboard requires email upfront (friction point)

**Founder Must Decide:** Is "no account required" principle non-negotiable, or can we require email for public launch?

---

### Decision 3: Privacy Policy & GDPR Compliance

**Question:** Does MemoryPop have a current Privacy Policy that covers email storage?

**Product Owner Recommendation:** Block Phase 1 launch until Privacy Policy is updated with:
1. Email usage disclosure ("We store your email to send you your private creator link")
2. Consent mechanism (checkbox on email capture form)
3. Opt-out mechanism (unsubscribe link in email)
4. Data retention policy (how long we keep MemoryPops)

**Why this matters:**
- GDPR violation = €20M fine or 4% annual revenue
- Lack of Privacy Policy = credibility risk for public launch
- Beta users may tolerate missing policy; public users will not

**Founder Must Decide:** Who owns Privacy Policy creation? Legal counsel required?

---

### Decision 4: Email Service Provider

**Question:** Confirm Resend as email provider, or evaluate alternatives?

**Product Owner Recommendation:** Resend (already listed in financial plan)

**Why this matters:**
- Resend: Modern, great DX, but relatively new (founded 2023)
- Postmark: More established, better reputation, 15% more expensive
- AWS SES: Cheapest, but requires more DevOps work

**Founder Must Decide:** Prioritize cost (Resend/SES) or reputation (Postmark)?

---

### Decision 5: Dashboard Banner Persistence

**Question:** If creator skips email on success page, should we show recovery banner on dashboard every time, or only once per session?

**Product Owner Recommendation:** Once per session (store in sessionStorage)

**Why this matters:**
- Every time = annoying, but higher conversion
- Once per session = respectful, but some creators will never convert
- Product principle: "Reduce friction"

**Founder Must Decide:** Acceptable balance between conversion and annoyance?

---

### Decision 6: Sprint 2 Commitment

**Question:** Should we commit to building Sprint 2 (Passwordless Auth + Dashboard) now, or wait to see Sprint 1 validation metrics?

**Product Owner Recommendation:** Wait for Sprint 1 validation. Only commit to Sprint 2 if:
- ≥60% email capture rate
- ≥5% creators access dashboard from email link (proves recovery value)
- Qualitative feedback indicates demand for "My MemoryPops" centralized dashboard

**Why this matters:**
- Sprint 2 is 5-8 days of work (significant investment)
- If Sprint 1 shows low email capture or low recovery usage, may indicate auth is not high priority
- Validates "build vertical slices" principle: ship, learn, decide

**Founder Must Decide:** Commit full 3-sprint roadmap now, or commit only Sprint 1 and decide Sprint 2 after validation?

---

### Decision 7: Premium Notification Scope

**Question:** Should lifecycle notifications (first contribution, celebration reminder, recipient reaction) be Premium-only or Standard-included?

**Product Owner Recommendation:** Premium-only (aligns with financial plan €4.99-€9.99 pricing)

**Why this matters:**
- Notifications are high-value feature that encourages Premium conversion
- But withholding notifications may feel like crippling Standard tier
- Competitor analysis: Most platforms include basic notifications in free tier

**Founder Must Decide:** What is minimum viable Standard tier that feels generous (principle: "Standard tier should remain generous")?

---

### Decision 8: Public Launch Blocker Status

**Question:** Is Creator Identity (Phase 1) a blocking requirement for public launch, or can we launch without it?

**Product Owner Recommendation:** BLOCKING requirement. Cannot launch publicly without email recovery.

**Why this matters:**
- Beta users tolerate lost-link risk (they're testing product)
- Public users expect account safety as table stakes
- Lack of recovery = credibility risk ("Is this a serious product?")
- Premium conversion requires trust (won't pay €7 if might lose access)

**Founder Must Decide:** Can we launch publicly before Phase 1 ships, or must we wait?

---

## Summary for Founder

**This is a BUILD NOW recommendation with significant scope constraints:**

### Build in Sprint 1 (Next 3-5 days):
✅ Email capture on success page
✅ Creation confirmation email with dashboard + contributor links
✅ Dashboard banner if email skipped
✅ Basic analytics (capture rate, open rate, recovery usage)

### Defer to Sprint 2 (After validation):
⏸️ Passwordless authentication
⏸️ "My MemoryPops" centralized dashboard
⏸️ Multi-MemoryPop management

### Defer to Sprint 3 (Backlog):
⏸️ History and replay
⏸️ Lifecycle notifications
⏸️ Account deletion / GDPR compliance features

### Blocking Decisions Needed from Founder:
1. Email capture timing (after creation = recommended)
2. Email required vs. optional (optional = recommended)
3. Privacy Policy update (REQUIRED before launch)
4. Email provider confirmation (Resend = recommended)
5. Dashboard banner frequency (once per session = recommended)
6. Sprint 2 commitment (wait for validation = recommended)
7. Premium notification scope (Premium-only = recommended)
8. Public launch blocker status (YES, block until Phase 1 = recommended)

**Next Step:** Founder reviews this prioritization and approves/rejects/modifies Sprint 1 scope before Planning begins.

---

**Product Owner Stage Complete**
**Waiting for:** Founder Approval to Proceed to Planning
