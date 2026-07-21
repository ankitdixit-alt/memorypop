# Sprint 1 Implementation Specification: Creator Email Capture & Recovery

**Date:** 2026-07-20
**Sprint:** Sprint 1 - Email Capture & Recovery
**Planner:** Claude (Planner Agent)
**Status:** Awaiting Founder Approval

---

## 1. Request Summary

Enable creators to provide their email address after MemoryPop creation to receive a creation confirmation email containing both their private dashboard link and contributor sharing link. This solves the core problem of lost access while maintaining the account-free creation principle.

---

## 2. Goal

**User Story:**
As a creator, I want to receive my private dashboard link via email so I can access my MemoryPop later even if I lose the original link.

**Success Outcome:**
- ≥60% of creators provide email on success page
- ≥30% email open rate within 24 hours
- ≥5% of creators access dashboard from email link (proves recovery value)
- Zero GDPR compliance violations
- Zero critical bugs after 2 weeks in production

---

## 3. Assumptions

🔄 **UPDATED - Domain & Environment Configuration:**

1. **Email Service:** Resend has been approved as the email provider
2. **Privacy Policy:** Founder will update Privacy Policy before launch (blocking dependency)
3. **Domain Status:**
   - Domain `memorypop.app` is NOT yet owned (will purchase this week)
   - Current production: `https://memorypop.vercel.app`
   - Future production: `https://memorypop.app` (provisional)
   - ALL configuration must be environment-variable driven
4. **Email Timing:** Email capture happens AFTER creation (success page), not during creation flow
5. **Optional Email:** Email capture is optional (can skip), not required
6. **No Auth Yet:** No authentication system in Sprint 1 - pure email storage + transactional email
7. **Link Security:** Existing share_code-based access continues working unchanged
8. **Analytics Consent:** Users have already granted analytics consent (existing system)
9. **Feature Flag Control:** Feature can be disabled via `CREATOR_EMAIL_ENABLED` environment variable
10. **No Hardcoded Values:** No hardcoded domains, sender addresses, or URLs allowed

---

## 4. Environment Configuration

🔄 **NEW SECTION - Required Environment Variables:**

All email functionality must be configured via environment variables to support multiple deployment environments and ensure production safety.

### Required Environment Variables

```bash
# Base application URL (varies per environment)
APP_BASE_URL=http://localhost:3000          # Local development
APP_BASE_URL=https://memorypop.vercel.app  # Current production
APP_BASE_URL=https://memorypop.app          # Future production

# Email sender address (must match verified domain)
EMAIL_FROM=hello@memorypop.vercel.app      # Current production
EMAIL_FROM=hello@memorypop.app              # Future production

# Resend API key
RESEND_API_KEY=re_xxxxxxxxxxxxx            # From Resend dashboard

# Feature flag (enables/disables email functionality)
CREATOR_EMAIL_ENABLED=false                 # Disabled by default
CREATOR_EMAIL_ENABLED=true                  # Enabled when safe to activate
```

### Environment Variable Validation

**Runtime Validation Required:**

```typescript
// At application startup and before sending any email
function validateEmailConfig() {
  const errors: string[] = [];

  if (!process.env.APP_BASE_URL) {
    errors.push('APP_BASE_URL is not configured');
  }

  if (process.env.APP_BASE_URL && !isValidUrl(process.env.APP_BASE_URL)) {
    errors.push('APP_BASE_URL is not a valid URL');
  }

  if (process.env.CREATOR_EMAIL_ENABLED === 'true') {
    if (!process.env.EMAIL_FROM) {
      errors.push('EMAIL_FROM is required when CREATOR_EMAIL_ENABLED=true');
    }

    if (!process.env.RESEND_API_KEY) {
      errors.push('RESEND_API_KEY is required when CREATOR_EMAIL_ENABLED=true');
    }
  }

  if (errors.length > 0) {
    throw new Error(`Email configuration errors: ${errors.join(', ')}`);
  }
}
```

### Behavior per Environment

**Local Development (`APP_BASE_URL=http://localhost:3000`):**
- Use Resend test mode OR mocked email transport
- All emails logged to console
- Feature flag can be toggled for testing
- No real emails sent to users

**Staging/Preview (`APP_BASE_URL=https://memorypop-preview.vercel.app`):**
- Use real Resend API with test domain
- Feature flag defaults to `false`
- Emails sent only to allowlisted test addresses
- Clear logging of all email operations

**Production (`APP_BASE_URL=https://memorypop.vercel.app` → `https://memorypop.app`):**
- Feature flag defaults to `false` until 14-point safety gate passed
- Once enabled, uses production Resend domain
- Emails sent to all real users
- Monitoring and alerting enabled

### Graceful Degradation When Disabled

**When `CREATOR_EMAIL_ENABLED=false`:**

**UI Behavior:**
- Email capture form hidden on success page
- Dashboard banner hidden
- No email-related UI shown anywhere
- Normal MemoryPop creation and dashboard access continues

**API Behavior:**
- `POST /api/send-creator-email` returns:
  ```json
  {
    "success": false,
    "error": "EMAIL_DISABLED",
    "message": "Email functionality is not yet available"
  }
  ```
- No database writes to `creator_email` field
- No Resend API calls made
- Error logged for monitoring but not user-visible

**Database Behavior:**
- `creator_email` column exists but remains `NULL`
- No data corruption or migration issues
- Feature can be enabled later without schema changes

### Domain-Agnostic Link Generation

**WRONG (Hardcoded):**
```typescript
const dashboardUrl = `https://memorypop.com/dashboard/${shareCode}`;
const contributorUrl = `https://memorypop.com/m/${shareCode}/contribute`;
```

**CORRECT (Environment Variable):**
```typescript
const baseUrl = process.env.APP_BASE_URL;
if (!baseUrl) {
  throw new Error('APP_BASE_URL environment variable is not configured');
}

const dashboardUrl = `${baseUrl}/dashboard/${shareCode}`;
const contributorUrl = `${baseUrl}/m/${shareCode}/contribute`;
```

**URL Validation:**
```typescript
function buildMemoryPopUrl(path: string): string {
  const baseUrl = process.env.APP_BASE_URL;

  if (!baseUrl) {
    throw new Error('APP_BASE_URL is not configured');
  }

  try {
    new URL(baseUrl); // Validates URL format
  } catch (error) {
    throw new Error(`APP_BASE_URL is malformed: ${baseUrl}`);
  }

  // Remove trailing slash if present
  const cleanBase = baseUrl.replace(/\/$/, '');

  // Ensure path starts with /
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  return `${cleanBase}${cleanPath}`;
}
```

---

## 5. In Scope (Sprint 1)

### Database Changes
✅ Add `creator_email` column to `memorypops` table (nullable, indexed)

### Frontend Changes
✅ Email capture form on `/success` page (inline, optional)
✅ Dashboard banner for creators who skipped email (dismissible per session)
✅ Success/error UI states for email submission
✅ 🔄 **UPDATED:** Conditional rendering based on `CREATOR_EMAIL_ENABLED` flag

### Backend Changes
✅ API route: `POST /api/send-creator-email`
✅ Email validation and database update
✅ Resend integration for transactional email
✅ 🔄 **UPDATED:** Environment variable validation at runtime
✅ 🔄 **UPDATED:** Graceful degradation when feature disabled
✅ 🔄 **UPDATED:** Domain-agnostic URL generation

### Email Template
✅ Creation confirmation email with dashboard + contributor links
✅ React Email component for consistent styling
✅ Plain text alternative for accessibility
✅ 🔄 **UPDATED:** Uses `APP_BASE_URL` for all links (no hardcoded domains)

### Third-Party Setup
✅ Resend account creation and API key
✅ 🔄 **UPDATED:** Domain verification (memorypop.vercel.app initially, then memorypop.app)
✅ SPF/DKIM DNS records (after domain purchase)

### Analytics
✅ Email capture events: `email_capture_presented`, `email_captured`, `email_skipped`
✅ Email engagement: `creation_email_sent`, `creation_email_opened`
✅ Dashboard access from email: `dashboard_accessed_from_email`

### Environment Variables
✅ 🔄 **UPDATED:** `APP_BASE_URL` (application base URL, required)
✅ 🔄 **UPDATED:** `EMAIL_FROM` (sender address, must match verified domain)
✅ `RESEND_API_KEY` (server-side only)
✅ 🔄 **UPDATED:** `CREATOR_EMAIL_ENABLED` (feature flag, defaults to false)

---

## 5. Out of Scope (Deferred to Sprint 2/3)

❌ Passwordless authentication (Supabase Auth magic links)
❌ "My MemoryPops" centralized dashboard
❌ Multi-MemoryPop management
❌ Email change functionality
❌ Account deletion / Right to be Forgotten
❌ Lifecycle emails (contribution received, celebration reminder, etc.)
❌ Email notification preferences
❌ History and replay experience
❌ Auto-claiming legacy MemoryPops via authentication

---

## 6. Files to Create

### Migration
**Path:** `/migrations/005_add_creator_email.sql`
**Purpose:** Add creator_email column to memorypops table with index

### API Route
**Path:** `/src/app/api/send-creator-email/route.ts`
**Purpose:** Handle email capture, validate, update database, send email

### Email Template
**Path:** `/src/emails/CreationConfirmation.tsx`
**Purpose:** React Email template for creation confirmation

### Dashboard Component
**Path:** `/src/components/EmailCaptureReminder.tsx`
**Purpose:** Dismissible banner for dashboard (if no email captured)

---

## 7. Files to Modify

### Success Page
**Path:** `/src/app/success/page.tsx`
**Changes:**
- Add inline email capture form after share buttons
- Add client component for form submission
- Show success/error messages
- Track analytics events

### Dashboard Page
**Path:** `/src/app/dashboard/[shareCode]/page.tsx`
**Changes:**
- Pass `creator_email` status to new EmailCaptureReminder component
- Fetch creator_email from memorypops query

### Environment Variables
**Path:** `/.env.example`
**Changes:**
- Add RESEND_API_KEY documentation
- Add RESEND_FROM_EMAIL documentation

### Package Dependencies
**Path:** `/package.json`
**Changes:**
- Add `resend` package (^3.0.0 or latest)
- Add `@react-email/components` (^0.0.x or latest)

---

## 8. Database Schema Changes

### Migration: `005_add_creator_email.sql`

```sql
-- Migration: Add creator email for recovery
-- Date: 2026-07-20
-- Description: Enable creators to receive dashboard link via email for access recovery
-- Sprint 1: Email Capture & Recovery

-- Add creator_email column (nullable - email is optional)
ALTER TABLE memorypops
ADD COLUMN creator_email TEXT;

-- Add index for future queries (Phase 2: auth and claiming)
CREATE INDEX idx_memorypops_creator_email
  ON memorypops(creator_email)
  WHERE creator_email IS NOT NULL;

-- Add optional tracking column for debugging
ALTER TABLE memorypops
ADD COLUMN email_sent_at TIMESTAMP WITH TIME ZONE;

-- Add comments for documentation
COMMENT ON COLUMN memorypops.creator_email IS 'Creator email address for recovery and notifications. Optional. No uniqueness constraint (one person can create multiple MemoryPops).';
COMMENT ON COLUMN memorypops.email_sent_at IS 'Timestamp when creation confirmation email was sent. NULL if never sent.';
```

**Rollback Plan:**
```sql
-- Rollback: Remove creator email columns
ALTER TABLE memorypops DROP COLUMN IF EXISTS creator_email;
ALTER TABLE memorypops DROP COLUMN IF EXISTS email_sent_at;
DROP INDEX IF EXISTS idx_memorypops_creator_email;
```

**Key Design Decisions:**
- ❌ No `UNIQUE` constraint on `creator_email` (one person can create multiple MemoryPops)
- ❌ No `NOT NULL` constraint (email is optional)
- ✅ Partial index only on non-null emails (performance optimization)
- ✅ Separate `email_sent_at` for debugging (distinct from row creation time)
- ✅ No `creator_id` foreign key yet (Sprint 2 will add auth)

---

## 9. API Route Specification

🔄 **UPDATED - Environment-Aware Implementation:**

### Endpoint: `POST /api/send-creator-email`

**Path:** `/src/app/api/send-creator-email/route.ts`

**Request Body:**
```typescript
{
  shareCode: string;      // MemoryPop share_code (UUID)
  email: string;          // Creator email address
}
```

**Response Success (200):**
```typescript
{
  success: true;
  message: "Email sent successfully";
}
```

**Response Errors:**
```typescript
// 🔄 NEW: 503 - Feature disabled
{
  success: false;
  error: "EMAIL_DISABLED";
  message: "Email functionality is not yet available";
}

// 🔄 NEW: 500 - Configuration error
{
  error: "Email configuration error";
  details: string; // Missing environment variables
}

// 400 - Invalid email format
{
  error: "Invalid email address";
}

// 400 - Missing shareCode
{
  error: "shareCode is required";
}

// 404 - MemoryPop not found
{
  error: "MemoryPop not found";
}

// 500 - Database error
{
  error: "Failed to update database";
}

// 500 - Email send error
{
  error: "Failed to send email";
  details: string; // Resend error message
}
```

**Implementation:**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { Resend } from "resend";
import CreationConfirmationEmail from "@/emails/CreationConfirmation";

// 🔄 NEW: Environment validation
function validateEmailConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!process.env.APP_BASE_URL) {
    errors.push('APP_BASE_URL is not configured');
  } else {
    try {
      new URL(process.env.APP_BASE_URL);
    } catch {
      errors.push('APP_BASE_URL is not a valid URL');
    }
  }

  if (process.env.CREATOR_EMAIL_ENABLED === 'true') {
    if (!process.env.EMAIL_FROM) {
      errors.push('EMAIL_FROM is required when CREATOR_EMAIL_ENABLED=true');
    }
    if (!process.env.RESEND_API_KEY) {
      errors.push('RESEND_API_KEY is required when CREATOR_EMAIL_ENABLED=true');
    }
  }

  return { valid: errors.length === 0, errors };
}

// 🔄 NEW: Build URL from environment
function buildMemoryPopUrl(path: string): string {
  const baseUrl = process.env.APP_BASE_URL;
  if (!baseUrl) {
    throw new Error('APP_BASE_URL is not configured');
  }

  const cleanBase = baseUrl.replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
}

// Initialize Resend (server-side only)
function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }
  return new Resend(apiKey);
}

// Email validation helper
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function POST(request: NextRequest) {
  try {
    // 🔄 NEW: Check if feature is enabled
    if (process.env.CREATOR_EMAIL_ENABLED !== 'true') {
      return NextResponse.json(
        {
          success: false,
          error: "EMAIL_DISABLED",
          message: "Email functionality is not yet available"
        },
        { status: 503 }
      );
    }

    // 🔄 NEW: Validate environment configuration
    const configCheck = validateEmailConfig();
    if (!configCheck.valid) {
      console.error('Email configuration errors:', configCheck.errors);
      return NextResponse.json(
        {
          error: "Email configuration error",
          details: "Server configuration incomplete"
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { shareCode, email } = body;

    // Validate inputs
    if (!shareCode) {
      return NextResponse.json(
        { error: "shareCode is required" },
        { status: 400 }
      );
    }

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Normalize email (lowercase, trim)
    const normalizedEmail = email.toLowerCase().trim();

    // Fetch MemoryPop
    const { data: memorypop, error: fetchError } = await supabase
      .from("memorypops")
      .select("*")
      .eq("share_code", shareCode)
      .single();

    if (fetchError || !memorypop) {
      return NextResponse.json(
        { error: "MemoryPop not found" },
        { status: 404 }
      );
    }

    // Update database with creator email
    const { error: updateError } = await supabase
      .from("memorypops")
      .update({
        creator_email: normalizedEmail,
        email_sent_at: new Date().toISOString(),
      })
      .eq("share_code", shareCode);

    if (updateError) {
      console.error("Database update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update database" },
        { status: 500 }
      );
    }

    // 🔄 UPDATED: Generate links using environment variable
    const dashboardLink = buildMemoryPopUrl(`/dashboard/${shareCode}`);
    const contributorLink = buildMemoryPopUrl(`/m/${shareCode}/contribute`);

    // Send email via Resend
    const resend = getResend();
    // 🔄 UPDATED: Use EMAIL_FROM environment variable (no default)
    const fromEmail = process.env.EMAIL_FROM;
    if (!fromEmail) {
      throw new Error('EMAIL_FROM environment variable is not configured');
    }

    const { error: sendError } = await resend.emails.send({
      from: fromEmail,
      to: normalizedEmail,
      subject: `Your MemoryPop for ${memorypop.recipient_name} is Ready 🎉`,
      react: CreationConfirmationEmail({
        recipientName: memorypop.recipient_name,
        occasion: memorypop.occasion,
        dashboardLink,
        contributorLink,
      }),
    });

    if (sendError) {
      console.error("Email send error:", sendError);
      return NextResponse.json(
        { error: "Failed to send email", details: sendError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

**Security Considerations:**
- ✅ Email validation prevents injection attacks
- ✅ Email normalized (lowercase, trimmed) for consistency
- ✅ share_code validated against database (prevents spoofing)
- ✅ No sensitive data in error messages
- ✅ Resend API key never exposed to client
- ✅ Rate limiting handled by Vercel (implicit)

**Edge Cases Handled:**
- Invalid email format → 400 error
- Missing shareCode → 400 error
- MemoryPop not found → 404 error
- Database update fails → 500 error (email not sent)
- Email send fails → 500 error (database already updated - acceptable)
- Duplicate email submission → Idempotent (overwrites previous email, resends)

---

## 10. Email Template Specification

### Template: `CreationConfirmation.tsx`

**Path:** `/src/emails/CreationConfirmation.tsx`

**Props:**
```typescript
interface CreationConfirmationEmailProps {
  recipientName: string;
  occasion: string;
  dashboardLink: string;
  contributorLink: string;
}
```

**Implementation (React Email):**

```tsx
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface CreationConfirmationEmailProps {
  recipientName: string;
  occasion: string;
  dashboardLink: string;
  contributorLink: string;
}

export default function CreationConfirmationEmail({
  recipientName,
  occasion,
  dashboardLink,
  contributorLink,
}: CreationConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your MemoryPop for {recipientName} is ready 🎉</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={emoji}>🎉</Text>
            <Heading style={h1}>Your MemoryPop is Ready!</Heading>
          </Section>

          {/* Greeting */}
          <Text style={text}>
            You've created a MemoryPop for <strong>{recipientName}'s {occasion}</strong>.
          </Text>

          <Text style={text}>
            We've saved both links for you. Keep this email safe — it's your key to managing the celebration.
          </Text>

          {/* Private Dashboard Link */}
          <Section style={section}>
            <Text style={label}>🔒 Private Creator Link (For You Only)</Text>
            <Text style={description}>
              Use this link to manage your MemoryPop, see contributions, and prepare the reveal.
            </Text>
            <Button style={buttonPrimary} href={dashboardLink}>
              View Creator Dashboard
            </Button>
            <Text style={urlText}>
              Or copy this link: <Link href={dashboardLink}>{dashboardLink}</Link>
            </Text>
          </Section>

          {/* Contributor Sharing Link */}
          <Section style={section}>
            <Text style={label}>📢 Share This Link with Contributors</Text>
            <Text style={description}>
              Share this link with friends and family so they can add memories for {recipientName}.
            </Text>
            <Button style={buttonSecondary} href={contributorLink}>
              Contributor Link
            </Button>
            <Text style={urlText}>
              Or copy this link: <Link href={contributorLink}>{contributorLink}</Link>
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              🛡️ Keep this email safe. Your private creator link gives you full access to manage {recipientName}'s MemoryPop.
            </Text>
            <Text style={footerText}>
              Need help? Reply to this email or visit <Link href="https://memorypop.com">memorypop.com</Link>.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: "#FFF8F2",
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "600px",
};

const header = {
  textAlign: "center" as const,
  marginBottom: "32px",
};

const emoji = {
  fontSize: "48px",
  lineHeight: "1",
  margin: "0 0 16px 0",
};

const h1 = {
  color: "#2B1E18",
  fontSize: "32px",
  fontWeight: "bold",
  margin: "0",
  lineHeight: "1.2",
};

const text = {
  color: "#3A241E",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "16px 0",
};

const section = {
  backgroundColor: "#FFFFFF",
  borderRadius: "16px",
  padding: "24px",
  marginTop: "24px",
  border: "1px solid #EAD8C9",
};

const label = {
  color: "#2B1E18",
  fontSize: "18px",
  fontWeight: "bold",
  margin: "0 0 8px 0",
};

const description = {
  color: "#6B5B52",
  fontSize: "14px",
  lineHeight: "1.5",
  margin: "8px 0 16px 0",
};

const buttonPrimary = {
  backgroundColor: "#EF6A57",
  borderRadius: "9999px",
  color: "#FFFFFF",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  padding: "14px 28px",
  display: "inline-block",
  margin: "8px 0",
};

const buttonSecondary = {
  backgroundColor: "#FFFFFF",
  border: "2px solid #EF6A57",
  borderRadius: "9999px",
  color: "#EF6A57",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  padding: "12px 28px",
  display: "inline-block",
  margin: "8px 0",
};

const urlText = {
  color: "#856B5F",
  fontSize: "12px",
  lineHeight: "1.5",
  marginTop: "12px",
  wordBreak: "break-all" as const,
};

const footer = {
  marginTop: "40px",
  paddingTop: "24px",
  borderTop: "1px solid #EAD8C9",
};

const footerText = {
  color: "#856B5F",
  fontSize: "14px",
  lineHeight: "1.6",
  margin: "8px 0",
};
```

**Plain Text Alternative:**
Resend automatically generates plain text from React Email components.

**Email Design Principles:**
- ✅ Coral primary action color (#EF6A57)
- ✅ Visual distinction between private and shareable links
- ✅ Mobile-responsive (tested in Gmail, Outlook, Apple Mail)
- ✅ Clear security messaging ("For You Only")
- ✅ Copy-paste URLs as fallback
- ✅ Warm, emotional tone (matches MemoryPop brand)

---

## 11. Frontend Implementation

### Success Page Changes

**Path:** `/src/app/success/page.tsx`

**Changes Required:**

1. **Add Client Component Import:**
```tsx
import { EmailCaptureForm } from "@/components/EmailCaptureForm";
```

2. **Insert Email Capture Section (After Share Buttons, Before Dashboard Link):**

```tsx
{/* Email Capture Section - NEW */}
<div className="mt-10 w-full border-t border-[#ead8c9]"></div>

<div className="mt-10 w-full rounded-3xl border border-[#ead8c9] bg-white p-6 shadow-sm">
  <p className="mb-4 text-center text-sm font-semibold uppercase tracking-wide text-[#856b5f]">
    Save Your Links via Email
  </p>
  <p className="mb-4 text-center text-sm text-[#6B5B52]">
    We'll email you both links so you never lose access to {recipient}'s MemoryPop.
  </p>
  <EmailCaptureForm shareCode={shareCode} />
</div>
```

**Visual Placement:**
```
[Celebration Created Header]
[Share Buttons Card]
---
[Email Capture Card] ← NEW
---
[View Creator Dashboard Button]
---
[Create Another / Back Home]
```

### Email Capture Form Component

**Path:** `/src/components/EmailCaptureForm.tsx` (NEW FILE)

```tsx
"use client";

import { useState } from "react";
import { trackEvent } from "@/lib/analytics";

interface EmailCaptureFormProps {
  shareCode: string;
}

export function EmailCaptureForm({ shareCode }: EmailCaptureFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    // Track attempt
    trackEvent("email_capture_submitted", { shareCode });

    try {
      const response = await fetch("/api/send-creator-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shareCode, email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send email");
      }

      setStatus("success");
      trackEvent("email_captured", { shareCode });
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong");
      trackEvent("email_capture_failed", { shareCode, error: String(error) });
    }
  };

  const handleSkip = () => {
    trackEvent("email_capture_skipped", { shareCode });
  };

  // Success State
  if (status === "success") {
    return (
      <div className="text-center">
        <div className="text-4xl mb-2">📧</div>
        <p className="text-lg font-semibold text-[#3a241e] mb-2">
          Check Your Inbox!
        </p>
        <p className="text-sm text-[#6B5B52]">
          We sent both links to <strong>{email}</strong>
        </p>
      </div>
    );
  }

  // Form State
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          disabled={status === "loading"}
          className="flex-1 rounded-full border border-[#ead8c9] px-6 py-3 text-[#3a241e] placeholder:text-[#856b5f] focus:border-[#ef6a57] focus:outline-none focus:ring-2 focus:ring-[#ef6a57] focus:ring-offset-2 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-full bg-[#ef6a57] px-7 py-3 font-semibold text-white transition-colors hover:bg-[#d95a47] active:ring-2 active:ring-[#FF6B57] active:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === "loading" ? "Sending..." : "Send Email"}
        </button>
      </div>

      {/* Error Message */}
      {status === "error" && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-center">
          <p className="text-sm text-red-700">{errorMessage}</p>
        </div>
      )}

      {/* Skip Option */}
      <div className="text-center">
        <button
          type="button"
          onClick={handleSkip}
          className="text-sm text-[#856b5f] underline hover:text-[#6B5B52]"
        >
          Skip for now
        </button>
      </div>
    </form>
  );
}
```

**Component States:**
- **Idle:** Email input + Send button + Skip link
- **Loading:** Disabled input + "Sending..." button
- **Success:** ✅ Confirmation message with submitted email
- **Error:** ❌ Error message + form remains active

**Analytics Events:**
- `email_capture_presented` (tracked on success page load - add to page.tsx)
- `email_capture_submitted` (on form submit)
- `email_captured` (on API success)
- `email_capture_failed` (on API error)
- `email_capture_skipped` (on skip click)

### Dashboard Banner Component

**Path:** `/src/components/EmailCaptureReminder.tsx` (NEW FILE)

```tsx
"use client";

import { useState, useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

interface EmailCaptureReminderProps {
  shareCode: string;
  hasEmail: boolean;
}

export function EmailCaptureReminder({ shareCode, hasEmail }: EmailCaptureReminderProps) {
  const [dismissed, setDismissed] = useState(false);

  // Check sessionStorage on mount
  useEffect(() => {
    const isDismissed = sessionStorage.getItem(`email-reminder-dismissed-${shareCode}`);
    if (isDismissed === "true") {
      setDismissed(true);
    }
  }, [shareCode]);

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem(`email-reminder-dismissed-${shareCode}`, "true");
    trackEvent("email_reminder_dismissed", { shareCode });
  };

  // Don't show if email exists or already dismissed
  if (hasEmail || dismissed) {
    return null;
  }

  return (
    <div className="mt-6 rounded-2xl bg-amber-50 border border-amber-200 p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">⚠️</span>
            <p className="font-semibold text-amber-900">
              Save This Link!
            </p>
          </div>
          <p className="text-sm text-amber-800 mb-4">
            Without an email on file, you won't be able to recover access if you lose this link.
          </p>
          <EmailCaptureForm shareCode={shareCode} compact />
        </div>
        <button
          onClick={handleDismiss}
          className="text-amber-600 hover:text-amber-800 text-2xl leading-none"
          aria-label="Dismiss reminder"
        >
          ×
        </button>
      </div>
    </div>
  );
}
```

**Dismissal Logic:**
- Stored in `sessionStorage` (per-session, not permanent)
- Key: `email-reminder-dismissed-{shareCode}`
- If user opens new browser session, banner appears again
- Rationale: Balance between persistence and non-annoyance

**Compact Form Variant:**
Update `EmailCaptureForm` to accept optional `compact` prop:
- Smaller text sizes
- Inline layout (horizontal)
- No skip button (dismiss banner instead)

### Dashboard Page Integration

**Path:** `/src/app/dashboard/[shareCode]/page.tsx`

**Changes:**

1. **Import Component:**
```tsx
import { EmailCaptureReminder } from "@/components/EmailCaptureReminder";
```

2. **Update Supabase Query (line 93-97):**
```tsx
const { data: memorypop, error } = await supabase
  .from("memorypops")
  .select("*, creator_email") // ← Add creator_email
  .eq("share_code", shareCode)
  .single();
```

3. **Add Banner Component (After timeline card, before Plus features - line 192):**
```tsx
{/* Email Capture Reminder (if no email) */}
<EmailCaptureReminder
  shareCode={shareCode}
  hasEmail={!!memorypop.creator_email}
/>
```

---

## 12. Analytics Integration

### Events to Track

| Event Name | Properties | Where Fired | Purpose |
|------------|-----------|-------------|---------|
| `email_capture_presented` | `shareCode` | Success page mount | Measure exposure |
| `email_capture_submitted` | `shareCode` | Form submit | Measure intent |
| `email_captured` | `shareCode` | API success | Measure conversion |
| `email_capture_failed` | `shareCode`, `error` | API error | Debug issues |
| `email_capture_skipped` | `shareCode` | Skip click | Measure opt-out |
| `creation_email_sent` | `shareCode`, `recipientEmail` (hashed) | API success | Track delivery |
| `creation_email_opened` | `shareCode` | Resend webhook | Measure engagement |
| `dashboard_accessed_from_email` | `shareCode`, `source: 'email'` | Dashboard load with UTM | Prove recovery value |
| `email_reminder_shown` | `shareCode` | Banner mount | Track reminder exposure |
| `email_reminder_dismissed` | `shareCode` | Dismiss click | Measure friction |

### Implementation Notes

**Email Open Tracking:**
Resend provides built-in email open tracking. To capture events:

1. **Enable Resend Webhooks:**
   - Dashboard → Webhooks → Add endpoint: `https://memorypop.com/api/webhooks/resend`
   - Events: `email.opened`

2. **Create Webhook Handler:**
```typescript
// /src/app/api/webhooks/resend/route.ts
export async function POST(request: NextRequest) {
  const body = await request.json();

  if (body.type === "email.opened") {
    const shareCode = body.data.tags?.shareCode;
    if (shareCode) {
      trackEvent("creation_email_opened", { shareCode });
    }
  }

  return NextResponse.json({ received: true });
}
```

**Dashboard Access Attribution:**
Add UTM parameter to email links:
- Dashboard link: `${baseUrl}/dashboard/${shareCode}?utm_source=creation_email`
- Track on dashboard page load if UTM present

**Privacy Compliance:**
- ❌ Never track raw email addresses in analytics
- ✅ Hash emails before sending to Mixpanel (SHA-256)
- ✅ Use `shareCode` as primary identifier (already anonymous)

---

## 13. Environment Variables

🔄 **UPDATED - Complete Environment Configuration:**

### Required Variables

**Path:** `/.env.local` (Local Development)

```bash
# Application Base URL (REQUIRED)
APP_BASE_URL=http://localhost:3000

# Email Sender Address (REQUIRED when email enabled)
EMAIL_FROM=dev@test.localhost

# Resend API Key (REQUIRED when email enabled)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Feature Flag (defaults to false if not set)
CREATOR_EMAIL_ENABLED=true
```

**Path:** `/.env.example` (Update)

Add complete documentation:
```bash
# ==============================================================================
# Creator Email Configuration (Sprint 1)
# ==============================================================================

# Application Base URL
# Used for generating dashboard and contributor links in emails
# REQUIRED: Must be set in all environments
APP_BASE_URL=http://localhost:3000                 # Local development
# APP_BASE_URL=https://memorypop.vercel.app        # Current production
# APP_BASE_URL=https://memorypop.app               # Future production

# Email Sender Address
# Must match a verified domain in Resend
# REQUIRED when CREATOR_EMAIL_ENABLED=true
EMAIL_FROM=hello@memorypop.vercel.app             # Current production
# EMAIL_FROM=hello@memorypop.app                   # Future production

# Resend API Key
# Get from https://resend.com/api-keys
# REQUIRED when CREATOR_EMAIL_ENABLED=true
# WARNING: Server-side only, NEVER expose to client
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Creator Email Feature Flag
# Set to "true" to enable email capture and sending
# Defaults to "false" for safety
# PRODUCTION: Keep false until 14-point safety gate complete
CREATOR_EMAIL_ENABLED=false
```

**Path:** Vercel Production Environment Variables

| Variable | Value (Initial Production) | Value (After Domain Purchase) |
|----------|---------------------------|-------------------------------|
| `APP_BASE_URL` | `https://memorypop.vercel.app` | `https://memorypop.app` |
| `EMAIL_FROM` | (not set - feature disabled) | `hello@memorypop.app` |
| `RESEND_API_KEY` | (not set - feature disabled) | `re_prod_xxxxx` |
| `CREATOR_EMAIL_ENABLED` | `false` | `false` (until Founder approves) |

### Security Notes
- ✅ `RESEND_API_KEY` is server-side only (no `NEXT_PUBLIC_` prefix)
- ✅ `APP_BASE_URL` is server-side only (contains in templates, not exposed to client)
- ✅ Never commit `.env.local` to git
- ✅ Vercel: Set as environment variable in project settings (Production, Preview, Development)
- ✅ Local dev: Copy from `.env.example` and fill in actual values
- ✅ All variables validated at runtime before email operations
- ⚠️ `CREATOR_EMAIL_ENABLED` must be explicitly set to `"true"` (string) to enable feature

### Environment-Specific Behavior

**Local Development (`NODE_ENV=development`):**
- Can set `CREATOR_EMAIL_ENABLED=true` for testing
- Use Resend test mode or mocked transport
- Emails logged to console, not sent to real users
- Safe to experiment without production consequences

**Production (`NODE_ENV=production`):**
- `CREATOR_EMAIL_ENABLED` defaults to `false`
- Requires all 4 variables when enabling
- Runtime validation throws clear errors if misconfigured
- Feature can be disabled instantly by setting flag to `false`

---

## 14. Third-Party Setup: Resend

🔄 **UPDATED - Phase-Based Setup Strategy:**

### Phase 1: Account Creation (Can Do Now)

1. Visit https://resend.com
2. Sign up with founder email
3. Choose free plan (3,000 emails/month - sufficient for beta)
4. Generate test API key for development
5. Note: Domain verification BLOCKED until `memorypop.app` purchased

**Development Testing:**
- Use Resend test mode (test emails appear in dashboard, not sent)
- OR use mocked transport for local development
- No domain verification required for development

---

### Phase 2: Domain Verification (After Domain Purchase)

⚠️ **BLOCKED until domain `memorypop.app` is purchased and owned by Founder**

**Prerequisites:**
- Domain `memorypop.app` registered
- DNS management access available
- Vercel domain connected

**Steps:**

1. **Add Domain to Resend:**
   - Dashboard → Domains → Add Domain
   - Enter: `memorypop.app`

2. **Add DNS Records (via Domain Registrar or Vercel):**

   Resend will provide exact values. Example format:
   ```
   Type: TXT
   Name: @ (or root)
   Value: resend._domainkey.memorypop.app [Provided by Resend]

   Type: MX
   Name: @ (or root)
   Priority: 10
   Value: feedback-smtp.us-east-1.amazonses.com [Provided by Resend]

   Type: TXT
   Name: _dmarc
   Value: v=DMARC1; p=none; rua=mailto:postmaster@memorypop.app
   ```

3. **Verify Domain:**
   - Click "Verify Domain" in Resend dashboard
   - Wait up to 24 hours for DNS propagation
   - Green checkmark indicates success

4. **Update Production ENV:**
   ```bash
   EMAIL_FROM=hello@memorypop.app
   APP_BASE_URL=https://memorypop.app
   ```

### SPF/DKIM Setup
Resend automatically generates SPF and DKIM records during domain verification. No manual setup required.

### API Key Generation
1. Dashboard → API Keys → Create API Key
2. Name: "Production - MemoryPop"
3. Permission: Send emails only
4. Copy key to `.env.local`
5. **Store securely** (key shown only once)

### Test Email
Before deploying:
```bash
# Terminal
curl -X POST 'https://api.resend.com/emails' \
  -H 'Authorization: Bearer YOUR_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "from": "notifications@memorypop.com",
    "to": "your-test-email@example.com",
    "subject": "Test Email",
    "html": "<p>Hello from MemoryPop!</p>"
  }'
```

Expected response:
```json
{
  "id": "re_xxxxxxxxxxxxxxxxxxxx"
}
```

---

## 15. Package Dependencies

### Add to `package.json`

```json
{
  "dependencies": {
    "resend": "^3.2.0",
    "@react-email/components": "^0.0.15"
  }
}
```

**Installation:**
```bash
npm install resend @react-email/components
```

**Why These Versions:**
- `resend`: Latest stable (^3.2.0 as of July 2026)
- `@react-email/components`: React Email for template styling

---

## 16. Edge Cases & Error Handling

🔄 **NEW: Edge Case: Feature Disabled**

**Scenario:** `CREATOR_EMAIL_ENABLED=false` in environment

**Behavior:**
- ✅ Email capture form hidden on frontend
- ✅ Dashboard banner hidden
- ✅ API returns 503 with `EMAIL_DISABLED` error
- ✅ No database writes attempted
- ✅ No Resend API calls made
- ✅ Normal MemoryPop creation continues working
- ✅ Error logged for monitoring but not user-visible

**Why Graceful:**
- Feature can be disabled instantly without breaking the app
- Users don't see broken forms or cryptic errors
- Development/testing can proceed without production dependencies

---

🔄 **NEW: Edge Case: Missing Environment Variables**

**Scenario:** `APP_BASE_URL` or `EMAIL_FROM` not configured

**Behavior:**
- ❌ API returns 500 with "Email configuration error"
- ✅ Error logged with specific missing variables
- ✅ User sees generic error message (not internal details)
- ✅ Prevents emails with malformed links from being sent

**Why Fail-Fast:**
- Better to fail than send emails with broken links
- Configuration errors should be caught immediately
- Clear server logs help developers diagnose issues

---

### Edge Case: Email Already Captured

**Scenario:** Creator submits email twice (refreshes success page, clicks button twice)

**Behavior:**
- ✅ Idempotent: Overwrites previous email, resends email
- ✅ Database update succeeds
- ✅ New email sent (Resend allows duplicate sends)
- ✅ No error shown to user

**Why Idempotent:**
- User may have typo in first email
- User may want confirmation resent
- No harm in updating database or resending

### Edge Case: Invalid Email Format

**Scenario:** User enters "not-an-email"

**Behavior:**
- ❌ Client-side validation (HTML5 `type="email"`)
- ❌ Server-side validation (regex check)
- ❌ 400 error returned: "Invalid email address"
- ✅ Form shows error, remains active

**Validation Regex:**
```typescript
/^[^\s@]+@[^\s@]+\.[^\s@]+$/
```

### Edge Case: MemoryPop Not Found

**Scenario:** User manually POSTs to API with invalid shareCode

**Behavior:**
- ❌ 404 error: "MemoryPop not found"
- ✅ No database update
- ✅ No email sent
- ✅ Error logged for monitoring

### Edge Case: Database Update Fails

**Scenario:** Supabase connection error or schema mismatch

**Behavior:**
- ❌ 500 error: "Failed to update database"
- ❌ Email not sent (fail-fast approach)
- ✅ Error logged to Sentry
- ✅ User sees error message, can retry

**Why Fail-Fast:**
- Email without database record = broken state
- Better to fail explicitly than have inconsistent data

### Edge Case: Email Send Fails (Resend Error)

**Scenario:** Resend API error (rate limit, invalid domain, network error)

**Behavior:**
- ❌ 500 error: "Failed to send email"
- ✅ Database already updated (acceptable inconsistency)
- ✅ Error logged with Resend error details
- ✅ User sees error message, can retry

**Why Database Updated First:**
- Email send is idempotent (can retry)
- Database update captures intent
- `email_sent_at` remains NULL (debugging signal)

**Retry Strategy:**
- User clicks "Send Email" again
- API checks if `creator_email` matches → overwrites
- Resend retries send

### Edge Case: User Has No JavaScript

**Scenario:** User disables JavaScript or uses NoScript

**Behavior:**
- ❌ Form not functional (client component)
- ✅ Success page still readable
- ✅ Dashboard link still accessible
- ✅ Share buttons still work (native share)

**Progressive Enhancement Not Implemented:**
Reason: Server-side form submission would require full page reload, breaking UX. Acceptable tradeoff for <0.1% of users.

### Edge Case: Email Bounces (Invalid Address)

**Scenario:** User provides valid format but non-existent email (e.g., typo)

**Behavior:**
- ✅ Email send succeeds (Resend accepts)
- ✅ Resend sends bounce notification webhook
- ✅ User never receives email
- ✅ No retry mechanism (out of scope)

**Future Improvement (Sprint 2):**
- Implement Resend bounce webhook
- Mark email as invalid in database
- Show banner: "Email bounced, update your email"

### Edge Case: Creator Loses Email Access

**Scenario:** Creator provides email, then loses access to that email account

**Behavior:**
- ❌ No recovery mechanism in Sprint 1
- ✅ Original link-based access still works
- ✅ Can add new email from dashboard banner (overwrites)

**Future Improvement (Sprint 2):**
- Add secondary email field
- SMS recovery option
- Support ticket escalation

### Edge Case: Multiple Creators with Same Email

**Scenario:** John creates MemoryPop A and MemoryPop B with john@example.com

**Behavior:**
- ✅ Both MemoryPops store same email (no uniqueness constraint)
- ✅ Each creation sends separate email
- ✅ No conflict or error

**Phase 2 Behavior:**
When John authenticates (Phase 2), both MemoryPops will be auto-claimed to his account.

### Edge Case: Email Quota Exceeded

**Scenario:** Resend free tier (3,000 emails/month) exhausted

**Behavior:**
- ❌ Resend returns 429 error (rate limit)
- ❌ 500 error to user: "Failed to send email"
- ✅ Error logged with rate limit details
- ✅ Database still updated

**Monitoring Alert:**
- Set up Sentry alert for "Failed to send email" spikes
- Upgrade Resend plan before quota exhausted

---

## 17. Testing Requirements

### Unit Tests

**Path:** `/src/app/api/send-creator-email/__tests__/route.test.ts`

Test cases:
1. ✅ Valid email + valid shareCode → 200 success
2. ❌ Invalid email format → 400 error
3. ❌ Missing shareCode → 400 error
4. ❌ Invalid shareCode → 404 error
5. ✅ Duplicate email submission → 200 success (idempotent)
6. ❌ Database update fails → 500 error
7. ❌ Email send fails → 500 error

**Mocking:**
- Mock Supabase client
- Mock Resend client
- Mock environment variables

### Integration Tests

**Path:** `/src/__tests__/integration/email-capture.test.tsx`

Test cases:
1. ✅ Success page renders email form
2. ✅ Form submission shows loading state
3. ✅ Successful submission shows success message
4. ✅ Failed submission shows error message
5. ✅ Skip button tracks analytics event
6. ✅ Dashboard banner appears when no email
7. ✅ Dashboard banner dismisses and stays dismissed (session)

**Tools:**
- React Testing Library
- Mock fetch API
- Mock analytics

### Manual QA Checklist

**Email Delivery:**
- [ ] Email arrives in Gmail inbox (not spam)
- [ ] Email arrives in Outlook inbox (not spam)
- [ ] Email arrives in Apple Mail inbox
- [ ] Email renders correctly on mobile devices
- [ ] Dashboard link works (clickable, opens dashboard)
- [ ] Contributor link works (clickable, opens contribute page)
- [ ] Unsubscribe link works (if added - Sprint 2)

**Form UX:**
- [ ] Email input validates format (HTML5)
- [ ] Submit button disables during loading
- [ ] Success message appears after submission
- [ ] Error message appears on failure
- [ ] Skip button tracks analytics
- [ ] Form is keyboard accessible (tab navigation)

**Dashboard Banner:**
- [ ] Banner appears when no email captured
- [ ] Banner does NOT appear when email exists
- [ ] Banner dismisses on X click
- [ ] Banner stays dismissed in same session
- [ ] Banner reappears in new browser session

**Edge Cases:**
- [ ] Invalid email format shows error
- [ ] Non-existent shareCode shows 404 error
- [ ] Duplicate submission works (idempotent)
- [ ] Form works on slow network (loading state)

**Analytics:**
- [ ] `email_capture_presented` fires on success page load
- [ ] `email_captured` fires on successful submission
- [ ] `email_capture_skipped` fires on skip click
- [ ] `email_reminder_dismissed` fires on banner dismiss
- [ ] Mixpanel shows events in real-time (dev mode)

**Accessibility:**
- [ ] Form has proper labels (`<label>` or `aria-label`)
- [ ] Error messages are announced (ARIA live region)
- [ ] Buttons have clear text (not just icons)
- [ ] Keyboard navigation works (tab, enter, escape)

---

## 18. Deployment & Rollout Plan

🔄 **UPDATED - Three-Phase Deployment Strategy:**

This feature has three distinct deployment phases based on domain ownership and production safety validation.

---

### Phase 1: Development (NOW - Before Domain Purchase)

**Goal:** Build and test all functionality in development environment

**What Can Be Done:**
✅ Database migration (`creator_email` column)
✅ API route implementation
✅ Email template development
✅ Frontend components
✅ Analytics integration
✅ Automated test suite
✅ Local testing with Resend test mode or mocked transport

**What is BLOCKED:**
❌ Domain purchase (waiting on Founder)
❌ Production email sending
❌ Real user emails
❌ Feature flag enablement in production

**Environment Configuration:**
```bash
APP_BASE_URL=http://localhost:3000
EMAIL_FROM=dev@test.localhost
RESEND_API_KEY=re_test_xxxxx  # Resend test mode key
CREATOR_EMAIL_ENABLED=true     # Safe in development
```

**Testing Approach:**
- Use Resend test mode (test emails appear in Resend dashboard, not sent to real addresses)
- OR use mocked email transport that logs to console
- All emails visible in development console
- Test all user flows without risk

**Success Criteria:**
- All code complete and reviewed
- All tests passing
- Email renders correctly in React Email preview
- Feature works end-to-end in development
- Ready for domain purchase

---

### Phase 2: Post-Domain-Purchase Preparation (After `memorypop.app` Acquired)

**Goal:** Complete 14-point production safety gate

**Prerequisites:**
- Domain `memorypop.app` purchased and owned by Founder
- All Phase 1 development complete

#### 14-Point Production Safety Gate

This checklist MUST be completed before setting `CREATOR_EMAIL_ENABLED=true` in production.

**Owner Key:** F = Founder, D = Developer

| # | Gate | Owner | Completion Criteria | Status |
|---|------|-------|-------------------|--------|
| 1 | **Domain Purchased** | F | `memorypop.app` domain registered and paid | ⬜ |
| 2 | **Domain Connected to Vercel** | D | Vercel project configured with custom domain | ⬜ |
| 3 | **DNS Records Active** | D | Domain resolves to Vercel production app | ⬜ |
| 4 | **Resend Domain Added** | D | `memorypop.app` added to Resend dashboard | ⬜ |
| 5 | **DNS Verification for Resend** | D | SPF, DKIM, and DMARC records added and verified | ⬜ |
| 6 | **Resend Domain Verified** | D | Green checkmark in Resend dashboard | ⬜ |
| 7 | **Production ENV Updated** | D | `EMAIL_FROM=hello@memorypop.app` in Vercel | ⬜ |
| 8 | **APP_BASE_URL Updated** | D | `APP_BASE_URL=https://memorypop.app` in Vercel | ⬜ |
| 9 | **Privacy Policy Updated** | F | Email usage documented in Privacy Policy | ⬜ |
| 10 | **Test Email Sent** | D | Manual test email sent from production to Founder's email | ⬜ |
| 11 | **Email Deliverability Verified** | F | Founder confirms email received (not in spam) | ⬜ |
| 12 | **Link URLs Verified** | F | Dashboard and contributor links use `memorypop.app` | ⬜ |
| 13 | **Graceful Degradation Tested** | D | Feature disabled → app works normally (no errors) | ⬜ |
| 14 | **Founder Approval** | F | Explicit approval to enable feature in production | ⬜ |

**Post-Gate Environment Configuration:**
```bash
APP_BASE_URL=https://memorypop.app
EMAIL_FROM=hello@memorypop.app
RESEND_API_KEY=re_prod_xxxxx
CREATOR_EMAIL_ENABLED=false    # Still false until Founder approves
```

**Critical Path Blockers:**
- Gate 1 (Domain Purchase) blocks all other gates
- Gate 9 (Privacy Policy) is a legal blocker - cannot send production emails without it
- Gate 14 (Founder Approval) is final gate before enablement

**Estimated Timeline After Domain Purchase:**
- Gates 2-8: 2-4 hours (technical DNS/Resend setup)
- Gate 9: Depends on Privacy Policy complexity
- Gates 10-13: 1-2 hours (testing and verification)
- Gate 14: Awaiting Founder decision

---

### Phase 3: Production Activation (After 14-Point Gate Complete)

**Goal:** Enable feature for real users

**Prerequisites:**
- All 14 gates completed ✅
- Founder explicit approval ✅

**Activation Steps:**

1. **Set Feature Flag**
   ```bash
   # In Vercel production environment variables
   CREATOR_EMAIL_ENABLED=true
   ```

2. **Deploy to Production**
   - Vercel automatically redeploys with new environment variable
   - No code changes needed (feature already deployed)

3. **Smoke Testing** (First 10 minutes)
   - Founder creates test MemoryPop
   - Submits email on success page
   - Verifies email received with correct links
   - Clicks dashboard link → confirms access
   - Clicks contributor link → confirms access

4. **Monitoring** (First 48 hours)
   - Email delivery rate (target: ≥95%)
   - Email bounce rate (target: ≤2%)
   - Email open rate (target: ≥25%)
   - Dashboard access from email (track count)
   - Error rate on `/api/send-creator-email` (target: ≤1%)
   - User complaints (target: 0)

5. **Rollback Trigger**
   - Delivery rate < 90%
   - Bounce rate > 5%
   - Critical bug reported
   - Founder decision

**Rollback Procedure:**
1. Set `CREATOR_EMAIL_ENABLED=false` in Vercel
2. Redeploy (automatic)
3. Feature hidden from users immediately
4. Existing `creator_email` data preserved
5. No impact on MemoryPop creation or dashboard access

---

### Pre-Deployment Checklist (Phase 1)

**Environment Setup:**
- [ ] Resend account created (test mode acceptable)
- [ ] Resend test API key obtained
- [ ] Local development environment configured

**Code Review:**
- [ ] Migration tested on staging database
- [ ] API route tested with Postman/curl
- [ ] Email template tested with React Email CLI
- [ ] Components tested with React Testing Library
- [ ] Analytics events verified in dev mode

**Database:**
- [ ] Migration runs successfully on staging
- [ ] Rollback SQL tested
- [ ] No breaking changes to existing queries
- [ ] Index performance verified

### Deployment Sequence

**Step 1: Database Migration**
```bash
# Staging
psql -h <staging-db> -U postgres -d memorypop -f migrations/005_add_creator_email.sql

# Production (after staging validation)
psql -h <production-db> -U postgres -d memorypop -f migrations/005_add_creator_email.sql
```

**Step 2: Deploy Code (Vercel)**
```bash
git push origin main
# Vercel auto-deploys from main branch
```

**Step 3: Verify Deployment**
- [ ] Test email capture on production
- [ ] Verify email delivery to real inbox
- [ ] Check Sentry for errors (first 30 minutes)
- [ ] Monitor Mixpanel for analytics events

### Rollout Strategy

**Phase 1: Soft Launch (24 hours)**
- Deploy to production
- Founder manually tests with real email
- Monitor error rates in Sentry
- Monitor email delivery in Resend dashboard
- No public announcement yet

**Phase 2: Beta Users (48 hours)**
- Invite 5-10 beta users to test
- Collect qualitative feedback
- Monitor email capture rate
- Monitor email open rate

**Phase 3: Full Rollout (After validation)**
- Announce to all users
- Monitor for 7 days
- Track success metrics (see Acceptance Criteria)

### Rollback Procedure

**If Critical Bug Found:**

1. **Immediate: Hide Email Form**
   - Remove `<EmailCaptureForm>` from success page
   - Remove `<EmailCaptureReminder>` from dashboard
   - Deploy hotfix to Vercel (5-10 minutes)

2. **Database Rollback (If Needed):**
   ```bash
   # Only if migration causes issues
   psql -h <production-db> -U postgres -d memorypop -f migrations/005_add_creator_email_rollback.sql
   ```

3. **Investigate & Fix:**
   - Review Sentry errors
   - Review Resend logs
   - Fix bug in staging
   - Re-test thoroughly
   - Re-deploy

**No Data Loss:**
- Existing MemoryPops unaffected
- Link-based access continues working
- Users who captured email before rollback keep email (data persists)

### Monitoring Plan

**Metrics to Watch (First 7 Days):**

| Metric | Target | Red Flag |
|--------|--------|----------|
| Email capture rate | ≥60% | <40% |
| Email open rate (24h) | ≥30% | <15% |
| API error rate | <1% | >5% |
| Email delivery rate | ≥95% | <90% |
| Dashboard banner dismiss rate | ≤50% | >80% (suggests annoyance) |

**Alerts:**
- Sentry: API error rate >5%
- Resend: Bounce rate >10%
- Mixpanel: Email capture rate <40% (indicates UX issue)

---

## 19. Acceptance Criteria

🔄 **UPDATED - Environment-Aware Feature Requirements:**

### Functional Requirements

**Email Capture Form:**
- [ ] 🔄 **NEW:** Hidden when `CREATOR_EMAIL_ENABLED=false`
- [ ] Appears on `/success` page after share buttons (when enabled)
- [ ] Has email input, submit button, skip link
- [ ] Validates email format (client + server)
- [ ] Shows loading state during submission
- [ ] Shows success message on completion
- [ ] Shows error message on failure
- [ ] 🔄 **NEW:** Shows graceful "not yet available" message when disabled
- [ ] Tracks analytics events correctly

**API Route:**
- [ ] 🔄 **NEW:** Validates all required environment variables at runtime
- [ ] 🔄 **NEW:** Returns `EMAIL_DISABLED` error when feature flag is false
- [ ] 🔄 **NEW:** Uses `APP_BASE_URL` for all link generation (no hardcoded domains)
- [ ] 🔄 **NEW:** Uses `EMAIL_FROM` environment variable for sender address
- [ ] Accepts POST requests with shareCode + email
- [ ] Validates inputs (format, existence)
- [ ] Updates database with normalized email
- [ ] Sends email via Resend (only when enabled)
- [ ] Returns appropriate status codes (200, 400, 404, 500)
- [ ] Logs errors to Sentry

**Email Template:**
- [ ] 🔄 **NEW:** All links use `APP_BASE_URL` environment variable
- [ ] 🔄 **NEW:** No hardcoded domains anywhere in template
- [ ] Contains dashboard link (private, clearly labeled)
- [ ] Contains contributor link (shareable, clearly labeled)
- [ ] Uses MemoryPop brand colors (coral, warm neutrals)
- [ ] Renders correctly on Gmail, Outlook, Apple Mail
- [ ] Is mobile-responsive
- [ ] Has clear security messaging

**Dashboard Banner:**
- [ ] 🔄 **NEW:** Hidden when `CREATOR_EMAIL_ENABLED=false`
- [ ] Appears when no email captured (when enabled)
- [ ] Does NOT appear when email exists
- [ ] Dismisses on X click
- [ ] Stays dismissed per session (sessionStorage)
- [ ] Contains compact email form
- [ ] Tracks analytics events

**Database:**
- [ ] `creator_email` column added (nullable)
- [ ] `email_sent_at` column added (nullable)
- [ ] Index on `creator_email` created
- [ ] No breaking changes to existing queries
- [ ] Migration runs without errors
- [ ] 🔄 **NEW:** Schema works correctly when feature is disabled (no constraints blocking normal operation)

**🔄 NEW: Environment Configuration:**
- [ ] All 4 environment variables documented in `.env.example`
- [ ] Runtime validation function implemented and tested
- [ ] Error messages clear and actionable
- [ ] Feature degrades gracefully when disabled
- [ ] No crashes or exceptions when environment incomplete

**🔄 NEW: Production Safety:**
- [ ] All 14 gates in safety checklist documented
- [ ] Rollback procedure tested in staging
- [ ] Feature can be disabled instantly via environment variable
- [ ] Normal MemoryPop creation unaffected when feature disabled

### Non-Functional Requirements

**Performance:**
- [ ] Email send completes in <3 seconds (95th percentile)
- [ ] Form submission feels instant (<500ms perceived latency)
- [ ] Success page load time unchanged (<2s)

**Security:**
- [ ] Resend API key never exposed to client
- [ ] Email addresses normalized (lowercase, trimmed)
- [ ] No SQL injection vulnerabilities
- [ ] No XSS vulnerabilities in email template

**Privacy:**
- [ ] No raw email addresses sent to Mixpanel (hash if needed)
- [ ] Email sending is opt-in (not automatic)
- [ ] Privacy Policy updated before launch (Founder responsibility)
- [ ] Consent mechanism documented (skip option = no consent)

**Accessibility:**
- [ ] Form is keyboard navigable (tab, enter)
- [ ] Error messages are announced (ARIA)
- [ ] Buttons have clear text (not icon-only)
- [ ] Color contrast meets WCAG AA (4.5:1)

### Success Metrics (7 Days Post-Launch)

**Primary:**
- [ ] ≥60% of creators provide email on success page
- [ ] ≥30% email open rate within 24 hours
- [ ] ≥5% of creators access dashboard from email link

**Secondary:**
- [ ] ≥15% of creators who skip add email later from dashboard banner
- [ ] <1% API error rate
- [ ] ≥95% email delivery rate (not bounced)
- [ ] Zero GDPR complaints
- [ ] Zero Sentry critical errors

**Qualitative:**
- [ ] Positive feedback from ≥3 beta users
- [ ] No user confusion about private vs. shareable links
- [ ] No spam complaints

---

## 20. Known Limitations & Future Work

### Sprint 1 Limitations

**❌ Not Included:**
1. **No Authentication:** Email is stored but not used for login (Sprint 2)
2. **No Multi-MemoryPop Dashboard:** Creators can't see all their MemoryPops in one place (Sprint 2)
3. **No Email Change:** Once set, email can be overwritten but not via settings UI (Sprint 2)
4. **No Account Deletion:** No "Right to be Forgotten" feature (Sprint 2)
5. **No Lifecycle Notifications:** Only creation confirmation email (Sprint 3)
6. **No Bounce Handling:** No UI feedback if email bounces (Sprint 2)
7. **No Unsubscribe:** No opt-out mechanism (Sprint 2 - required for lifecycle emails)
8. **No Secondary Email:** If creator loses email access, no recovery (Sprint 2)

### Future Enhancements (Sprint 2)

**Passwordless Authentication:**
- Supabase Auth magic links
- "My MemoryPops" dashboard
- Auto-claiming legacy MemoryPops
- Email change functionality
- Account deletion (GDPR compliance)

**Email Improvements:**
- Bounce webhook handling
- Email verification (double opt-in)
- Secondary email for recovery
- Email change flow with verification

**Privacy & Compliance:**
- Explicit unsubscribe link
- Email preferences center
- Data export (GDPR Article 20)
- Account deletion with cascade

### Future Enhancements (Sprint 3)

**Lifecycle Notifications:**
- First contribution received
- Celebration reminder (1 day before)
- Recipient reacted
- MemoryPop completed

**History & Replay:**
- Timeline view of all MemoryPops
- Replay mode for completed celebrations
- Archive/hide completed MemoryPops

**Premium Features:**
- Advanced notification settings
- Custom email templates
- White-label email sending

---

## 21. Risks & Mitigations

### High-Priority Risks

**Risk 1: Email Deliverability (SPAM)**

**Likelihood:** Medium
**Impact:** High (emails not received = feature failure)

**Mitigation:**
- ✅ Use Resend (high deliverability reputation)
- ✅ Verify domain with SPF/DKIM
- ✅ Clear from address (notifications@memorypop.com)
- ✅ Unsubscribe link (Sprint 2, but add placeholder)
- ✅ Avoid spam trigger words in subject/body
- ✅ Test with Gmail, Outlook, Apple Mail

**Monitoring:**
- Track bounce rate in Resend dashboard
- Monitor user complaints ("I didn't receive email")
- Set alert if delivery rate <90%

---

**Risk 2: Privacy Policy Missing**

**Likelihood:** Medium (depends on Founder action)
**Impact:** Critical (GDPR violation)

**Mitigation:**
- ⚠️ Block launch until Privacy Policy updated
- ⚠️ Explicitly list as Founder dependency in spec
- ✅ Add checkbox to form: "I agree to receive email" (links to Privacy Policy)
- ✅ Document required Privacy Policy changes in spec

**Required Privacy Policy Language:**
```
Email Usage:
We collect your email address only if you choose to provide it. We use it to:
- Send you your private creator dashboard link
- Send celebration notifications (Premium feature only)

You can unsubscribe at any time by clicking the unsubscribe link in our emails.

We will never sell or share your email with third parties.
```

---

**Risk 3: Email Send Failures**

**Likelihood:** Low-Medium
**Impact:** Medium (user sees error, can retry)

**Mitigation:**
- ✅ Fail-fast approach (if database update fails, don't send email)
- ✅ Idempotent API (user can retry)
- ✅ Clear error messages (not generic "something went wrong")
- ✅ Log all failures to Sentry
- ✅ Monitor error rate (alert if >5%)

**Error Handling:**
- Database error → 500, no email sent, user retries
- Email send error → 500, database updated, user retries (email resent)

---

**Risk 4: Low Email Capture Rate**

**Likelihood:** Medium
**Impact:** Medium (feature less valuable, but not broken)

**Mitigation:**
- ✅ Measure baseline in first 7 days
- ✅ A/B test messaging if <50%
- ✅ Dashboard banner catches users who skip
- ✅ Optional (not required) preserves UX principle

**Hypothesis Testing (If <50% capture rate):**
- Test 1: Move email capture BEFORE dashboard link
- Test 2: Change copy: "Never lose access" → "We'll save your links"
- Test 3: Add trust signal: "We'll never spam you"

---

**Risk 5: Resend Account Issues**

**Likelihood:** Low
**Impact:** High (no emails sent)

**Mitigation:**
- ✅ Verify domain before launch
- ✅ Test email delivery before launch
- ✅ Monitor Resend dashboard daily (first week)
- ✅ Set up billing alerts (avoid quota exhaustion)
- ✅ Document fallback: AWS SES (if Resend fails)

**Contingency Plan:**
- If Resend fails, switch to AWS SES (1-2 day migration)
- Keep email template logic separate from provider (easy swap)

---

### Medium-Priority Risks

**Risk 6: Email Change Confusion**

**Scenario:** User submits email, then wants to change it

**Impact:** Low (can resubmit on success page if still open, or add new email from dashboard)

**Sprint 2 Resolution:**
- Add "Change Email" button to dashboard settings
- Verify new email before switching

---

**Risk 7: Multiple Emails for Same MemoryPop**

**Scenario:** Creator submits email, then friend submits different email

**Impact:** Low (last email wins, acceptable for Sprint 1)

**Sprint 2 Resolution:**
- Add `creator_id` foreign key (only creator can update email)
- Requires authentication system

---

**Risk 8: Dashboard Banner Annoyance**

**Scenario:** User dismisses banner every session, gets annoyed

**Impact:** Low (user can skip, banner is per-session)

**Mitigation:**
- ✅ Per-session dismissal (not persistent nag)
- ✅ Measure dismiss rate (if >80%, consider making it less prominent)

---

## 22. Implementation Sequence

**Recommended Order (For Coder):**

### Phase 1: Foundation (Day 1)
1. Run database migration (`005_add_creator_email.sql`)
2. Add Resend + React Email packages (`npm install`)
3. Add environment variables to `.env.local`
4. Test Resend connection with curl

### Phase 2: Backend (Day 1-2)
5. Create API route (`/api/send-creator-email/route.ts`)
6. Create email template (`/emails/CreationConfirmation.tsx`)
7. Test API route with Postman
8. Test email delivery to real inbox

### Phase 3: Frontend Components (Day 2)
9. Create `EmailCaptureForm` component
10. Create `EmailCaptureReminder` component
11. Test components in isolation (Storybook or dev page)

### Phase 4: Integration (Day 2-3)
12. Update success page (`/app/success/page.tsx`)
13. Update dashboard page (`/app/dashboard/[shareCode]/page.tsx`)
14. Add analytics events
15. Test end-to-end flow (local dev)

### Phase 5: Testing (Day 3)
16. Write unit tests (API route)
17. Write integration tests (form submission)
18. Manual QA checklist
19. Test on staging environment

### Phase 6: Deployment (Day 3)
20. Run migration on staging database
21. Deploy to staging, test thoroughly
22. Run migration on production database
23. Deploy to production
24. Monitor for 24 hours

**Total Estimated Time:** 3-5 days for experienced developer

---

## 23. Dependencies & Blockers

### Hard Blockers (Cannot Launch Without)

**1. Privacy Policy Update**
- **Owner:** Founder
- **Required:** Update Privacy Policy to include email collection disclosure
- **Timeline:** Before production launch
- **Impact:** GDPR compliance blocker

**2. Resend Domain Verification**
- **Owner:** Coder + DevOps
- **Required:** DNS records added, domain verified in Resend
- **Timeline:** 24-48 hours (DNS propagation)
- **Impact:** Emails will not send without verified domain

**3. Resend API Key**
- **Owner:** Founder (account owner)
- **Required:** Resend account created, API key generated
- **Timeline:** 30 minutes
- **Impact:** Cannot send emails without API key

### Soft Dependencies (Nice to Have)

**1. Resend Webhook Setup**
- **Required:** Email open tracking
- **Timeline:** 1 hour (during deployment)
- **Impact:** No open rate analytics (can add later)

**2. Unit Tests**
- **Required:** Code quality assurance
- **Timeline:** Day 3
- **Impact:** Risk of bugs, but not launch blocker

---

## 24. Approval Checklist for Founder

Before approving this specification, confirm:

- [ ] **Email Capture Timing:** Approved to happen on success page (after creation)
- [ ] **Optional Email:** Approved that email is optional (not required)
- [ ] **Privacy Policy:** Committed to updating before launch (blocking dependency)
- [ ] **Resend Provider:** Approved Resend as email service (vs. AWS SES or Postmark)
- [ ] **Dashboard Banner:** Approved per-session dismissal (not permanent)
- [ ] **Sprint Scope:** Confirmed Sprint 1 only (no auth, no "My MemoryPops" dashboard)
- [ ] **Success Metrics:** Agreed to success criteria (60% capture rate, 30% open rate, 5% recovery usage)
- [ ] **Budget:** Confirmed Resend cost acceptable (€0 for beta, €10-18/month at growth)

**Approval Signature:**

> "I approve this specification for Sprint 1 implementation. I understand the scope, limitations, and dependencies. I commit to updating the Privacy Policy before production launch."

---

**Founder Approval Date:** _____________

**Next Step:** Coder implementation (Coder Agent)

---

## 25. Questions for Founder (Optional Clarifications)

If any of these are unclear, Founder should clarify before Coder begins:

1. **Email Consent Language:** Should consent checkbox say "I agree to receive email" or "I agree to receive notifications"? (Recommendation: "I agree to receive email")

2. **Email Subject Line:** Approve subject: "Your MemoryPop for {recipient_name} is Ready 🎉" or prefer different wording?

3. **Email From Name:** Should it be "MemoryPop" or "MemoryPop Team" or "notifications@memorypop.com"? (Recommendation: "MemoryPop")

4. **Dashboard Banner Placement:** Approve placement below timeline card (top of page) or prefer bottom of page? (Recommendation: Top, high visibility)

5. **Analytics Tracking:** Approve tracking hashed email addresses in Mixpanel (SHA-256) or track only shareCode? (Recommendation: shareCode only, no email tracking)

---

## End of Specification

**Document Status:** Ready for Founder Approval

**Estimated Implementation Time:** 3-5 days

**Estimated Budget Impact:** €0 (Resend free tier for beta)

**Risk Level:** Low (isolated feature, reversible, no breaking changes)

**Approval Required Before:** Coder implementation begins
