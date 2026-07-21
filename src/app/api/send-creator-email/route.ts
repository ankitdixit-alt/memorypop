/**
 * API Route: Send Creator Email
 * Sprint 1: Creator Email Capture & Recovery
 *
 * Endpoint: POST /api/send-creator-email
 * Purpose: Capture creator email, send confirmation with dashboard + contributor links
 *
 * Request: { shareCode: string, email: string }
 * Response: { success: boolean, message?: string, error?: string }
 */

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { Resend } from "resend";
import CreationConfirmationEmail from "@/emails/CreationConfirmation";
import { generateVerificationToken } from "@/lib/verification";
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
  } catch (error) {
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
 * Handle creator email capture and send confirmation email
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
      console.error('Email configuration errors:', configCheck.errors);
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
    const { shareCode, email } = body;

    // Validate inputs
    if (!shareCode) {
      return NextResponse.json(
        { error: "shareCode is required" },
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

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Normalize email (lowercase, trim)
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

    // Generate secure verification token
    const { token, tokenHash, expiresAt } = generateVerificationToken();

    // Update database with PENDING email, token hash, and expiry
    // SECURITY: Store token HASH only, never plaintext
    // Email stored in pending_creator_email until verified
    const { error: updateError } = await supabase
      .from("memorypops")
      .update({
        pending_creator_email: normalizedEmail, // Store as PENDING (not verified yet)
        verification_sent_at: new Date().toISOString(), // For rate limiting
        verification_token_hash: tokenHash,
        verification_token_expires_at: expiresAt.toISOString(),
        verification_attempts: 0, // Reset attempts on new token
      })
      .eq("share_code", shareCode);

    if (updateError) {
      console.error("Database update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update database" },
        { status: 500 }
      );
    }

    // Generate VERIFICATION link (not dashboard link)
    // User must verify email ownership before accessing dashboard
    const verificationLink = buildMemoryPopUrl(`/verify-email?token=${token}&code=${shareCode}`);
    const contributorLink = buildMemoryPopUrl(`/m/${shareCode}/contribute`);

    // Send email via Resend
    const resend = getResend();
    const fromEmail = process.env.EMAIL_FROM;

    if (!fromEmail) {
      throw new Error('EMAIL_FROM environment variable is not configured');
    }

    const { error: sendError } = await resend.emails.send({
      from: fromEmail,
      to: normalizedEmail,
      subject: `Verify your email for ${memorypop.recipient_name}'s MemoryPop 🎉`,
      react: CreationConfirmationEmail({
        recipientName: memorypop.recipient_name,
        occasion: memorypop.occasion,
        verificationLink,
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

    // Success response
    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
    });

  } catch (error) {
    console.error("Unexpected error in send-creator-email:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
