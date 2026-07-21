/**
 * API Route: Send Creator Welcome Email
 * Private Beta: Optional Email Convenience Feature
 *
 * Endpoint: POST /api/send-creator-email
 * Purpose: Send creator a warm welcome email with their links and MemoryPop details
 *
 * Request: { shareCode: string, email: string, managementToken: string }
 * Response: { success: boolean, message?: string, error?: string }
 *
 * Security Model:
 * - Validates creator session (HTTP-only cookie)
 * - Validates management token hashes to stored hash
 * - Never persists raw management token
 * - Never persists unverified email address
 * - Rate limited (5 minutes per MemoryPop)
 * - No logging of tokens or email addresses
 *
 * TODO (Future Enhancement):
 * When Creator Identity is enabled, this email may become part of a verification flow.
 * For now: Email is send-only convenience, not authentication or identity.
 * Private Creator Link remains the only security boundary.
 */

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { Resend } from "resend";
import CreatorWelcomeEmail from "@/emails/CreatorWelcome";
import { hashManagementToken } from "@/lib/verification";
import { getCreatorSession } from "@/lib/creatorSession";

/**
 * Validate email configuration environment variables
 * Returns validation result with list of errors if any
 */
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

/**
 * Build a complete MemoryPop URL from environment-configured base URL
 * @param path - The path to append (e.g., '/dashboard/abc123')
 * @returns Complete URL (e.g., 'https://memorypop.app/dashboard/abc123')
 */
function buildMemoryPopUrl(path: string): string {
  const baseUrl = process.env.APP_BASE_URL;

  if (!baseUrl) {
    throw new Error('APP_BASE_URL is not configured');
  }

  try {
    new URL(baseUrl); // Validates URL format
  } catch {
    throw new Error(`APP_BASE_URL is malformed: ${baseUrl}`);
  }

  // Remove trailing slash if present
  const cleanBase = baseUrl.replace(/\/$/, '');

  // Ensure path starts with /
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  return `${cleanBase}${cleanPath}`;
}

/**
 * Initialize Resend client (server-side only)
 * @returns Resend client instance
 */
function getResend(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }
  return new Resend(apiKey);
}

/**
 * Validate email address format
 * @param email - Email address to validate
 * @returns true if valid, false otherwise
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * POST /api/send-creator-email
 * Send creator welcome email with Private Creator Link and contributor link
 */
export async function POST(request: NextRequest) {
  try {
    // Check if feature is enabled
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

    // Validate environment configuration
    const configCheck = validateEmailConfig();
    if (!configCheck.valid) {
      // DO NOT LOG errors (may contain config details)
      return NextResponse.json(
        {
          error: "Email configuration error",
          details: "Server configuration incomplete"
        },
        { status: 500 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { shareCode, email, managementToken } = body;

    // Validate inputs (DO NOT LOG - contains email and token)
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

    if (!managementToken) {
      return NextResponse.json(
        { error: "managementToken is required" },
        { status: 400 }
      );
    }

    // CRITICAL: Verify creator authorization
    // Only creators with valid session can submit email
    const session = await getCreatorSession(shareCode);

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized - Creator session required" },
        { status: 403 }
      );
    }

    // Normalize email (lowercase, trim)
    // DO NOT LOG normalized email
    const normalizedEmail = email.toLowerCase().trim();

    // Fetch MemoryPop from database with session validation
    const { data: memorypop, error: fetchError } = await supabase
      .from("memorypops")
      .select("*")
      .eq("share_code", shareCode)
      .eq("management_token_hash", session.managementTokenHash) // Double-check session matches
      .single();

    if (fetchError || !memorypop) {
      return NextResponse.json(
        { error: "MemoryPop not found or unauthorized" },
        { status: 404 }
      );
    }

    // CRITICAL SECURITY: Verify management token hashes to stored hash
    // This prevents unauthorized email distribution
    const tokenHash = hashManagementToken(managementToken);

    if (tokenHash !== memorypop.management_token_hash) {
      // Invalid token - DO NOT LOG token or hash
      return NextResponse.json(
        { error: "Invalid management token" },
        { status: 403 }
      );
    }

    // Rate limiting check (5 minutes between emails)
    if (memorypop.verification_sent_at) {
      const lastSent = new Date(memorypop.verification_sent_at);
      const minutesSince = (Date.now() - lastSent.getTime()) / (1000 * 60);

      if (minutesSince < 5) {
        return NextResponse.json(
          {
            error: "Rate limit exceeded",
            message: "Please wait 5 minutes between email requests"
          },
          { status: 429 }
        );
      }
    }

    // Update database with rate limiting timestamp ONLY
    // DO NOT persist email address or management token
    const { error: updateError } = await supabase
      .from("memorypops")
      .update({
        verification_sent_at: new Date().toISOString(), // For rate limiting
      })
      .eq("share_code", shareCode);

    if (updateError) {
      // DO NOT LOG error (may contain sensitive data)
      return NextResponse.json(
        { error: "Failed to update database" },
        { status: 500 }
      );
    }

    // Generate email links
    const managementLink = buildMemoryPopUrl(`/manage/${managementToken}`);
    const contributorLink = buildMemoryPopUrl(`/m/${shareCode}/contribute`);

    // Send welcome email via Resend
    const resend = getResend();
    const fromEmail = process.env.EMAIL_FROM;

    if (!fromEmail) {
      throw new Error('EMAIL_FROM environment variable is not configured');
    }

    // Calculate celebration timeline if date exists
    const celebrationMessage = memorypop.celebration_date
      ? formatCelebrationTimeline(memorypop.celebration_date)
      : null;

    const { error: sendError } = await resend.emails.send({
      from: fromEmail,
      to: normalizedEmail,
      subject: `🎉 Your MemoryPop is ready!`,
      react: CreatorWelcomeEmail({
        recipientName: memorypop.recipient_name,
        occasion: memorypop.occasion,
        celebrationDate: memorypop.celebration_date,
        celebrationMessage,
        createdAt: memorypop.created_at,
        managementLink,
        contributorLink,
      }),
    });

    if (sendError) {
      // DO NOT LOG sendError (may contain email or token)
      return NextResponse.json(
        { error: "Failed to send email", details: "Email delivery failed" },
        { status: 500 }
      );
    }

    // Success response (DO NOT include email or token in response)
    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
    });

  } catch {
    // DO NOT LOG error (may contain email or token)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Format celebration date timeline message
 * @param dateString - ISO date string
 * @returns Human-readable timeline message
 */
function formatCelebrationTimeline(dateString: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const celebration = new Date(dateString);
  celebration.setHours(0, 0, 0, 0);

  const diffTime = celebration.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays > 0) {
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} until the celebration`;
  } else if (diffDays === 0) {
    return "Today is the celebration!";
  } else {
    return "Celebration complete";
  }
}
