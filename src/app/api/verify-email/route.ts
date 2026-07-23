/**
 * API Route: Verify Email
 * Sprint 1: Security Fix - Email Ownership Verification
 *
 * Endpoint: GET /api/verify-email?token={token}&code={shareCode}
 * Purpose: Verify email ownership and grant dashboard access
 *
 * Security Requirements:
 * - Validate token hash matches stored hash
 * - Check token not expired (24 hours)
 * - Enforce single-use (invalidate after verification)
 * - Rate limit failed attempts (max 5)
 * - Redirect to dashboard on success
 * - Clear error messages on failure
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { hashToken, isTokenExpired, isVerificationLocked } from "@/lib/verification";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get('token');
  const shareCode = searchParams.get('code');

  // Validate inputs
  if (!token || !shareCode) {
    return NextResponse.redirect(
      new URL('/verify-email?error=invalid', request.url)
    );
  }

  // Hash the token for comparison
  // SECURITY: Compare hashes, never expose plaintext tokens
  const tokenHash = hashToken(token);

  // Fetch MemoryPop with verification data
  const { data: memorypop, error: fetchError } = await supabaseServer
    .from("memorypops")
    .select("*")
    .eq("share_code", shareCode)
    .single();

  if (fetchError || !memorypop) {
    return NextResponse.redirect(
      new URL('/verify-email?error=not-found', request.url)
    );
  }

  // Check if already verified
  // Allow access to dashboard if email is already verified
  if (memorypop.creator_email_verified_at) {
    return NextResponse.redirect(
      new URL(`/dashboard/${shareCode}?verified=true`, request.url)
    );
  }

  // Check rate limiting
  // Prevent brute force attacks by limiting failed attempts
  if (isVerificationLocked(memorypop.verification_attempts || 0)) {
    return NextResponse.redirect(
      new URL('/verify-email?error=locked', request.url)
    );
  }

  // Validate token hash matches
  // Constant-time comparison would be ideal but string comparison is acceptable here
  if (memorypop.verification_token_hash !== tokenHash) {
    // Increment failed attempts
    await supabaseServer
      .from("memorypops")
      .update({
        verification_attempts: (memorypop.verification_attempts || 0) + 1,
      })
      .eq("share_code", shareCode);

    return NextResponse.redirect(
      new URL('/verify-email?error=invalid', request.url)
    );
  }

  // Check token expiry
  if (!memorypop.verification_token_expires_at || isTokenExpired(memorypop.verification_token_expires_at)) {
    return NextResponse.redirect(
      new URL('/verify-email?error=expired', request.url)
    );
  }

  // SUCCESS - Promote pending email to verified email
  // Move pending_creator_email → creator_email (verified)
  // SECURITY: Invalidate token after single use
  const { error: updateError } = await supabaseServer
    .from("memorypops")
    .update({
      creator_email: memorypop.pending_creator_email, // Promote pending to verified
      creator_email_verified_at: new Date().toISOString(),
      pending_creator_email: null, // Clear pending state
      verification_token_hash: null, // Invalidate token (single-use)
      verification_token_expires_at: null,
      verification_attempts: 0, // Reset attempts
    })
    .eq("share_code", shareCode);

  if (updateError) {
    console.error("Verification update error:", updateError);
    return NextResponse.redirect(
      new URL('/verify-email?error=server', request.url)
    );
  }

  // Redirect to dashboard with success message
  // Set Referrer-Policy to prevent token leakage
  const response = NextResponse.redirect(
    new URL(`/dashboard/${shareCode}?verified=true`, request.url)
  );

  response.headers.set('Referrer-Policy', 'no-referrer');

  return response;
}
