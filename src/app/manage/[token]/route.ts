/**
 * Management Token Authentication Endpoint
 *
 * URL: /manage/{rawManagementToken}
 * Purpose: Exchange raw management token for creator session, then redirect to dashboard
 *
 * Flow:
 * 1. User clicks link from email: /manage/{rawToken}
 * 2. Hash the token
 * 3. Find MemoryPop by token hash
 * 4. Create creator session (signed HttpOnly cookie)
 * 5. Redirect to clean dashboard URL (token removed from URL)
 *
 * Security:
 * - Token hashed before database lookup (never store plaintext)
 * - Session established via signed HttpOnly cookie
 * - Token removed from URL after authentication (Referrer-Policy: no-referrer)
 * - Session bound to specific MemoryPop (prevents cross-MemoryPop access)
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { hashManagementToken } from '@/lib/verification';
import { setCreatorSession } from '@/lib/creatorSession';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  if (!token) {
    return NextResponse.redirect(new URL('/?error=invalid-link', request.url));
  }

  // Hash the token for database lookup
  const tokenHash = hashManagementToken(token);

  // Find MemoryPop by management token hash
  const { data: memorypop, error } = await supabaseServer
    .from('memorypops')
    .select('share_code, management_token_hash')
    .eq('management_token_hash', tokenHash)
    .single();

  if (error || !memorypop) {
    // Invalid token - redirect with error
    return NextResponse.redirect(new URL('/?error=invalid-link', request.url));
  }

  // Create creator session (signed HttpOnly cookie)
  await setCreatorSession(memorypop.share_code, tokenHash);

  // Redirect to clean dashboard URL (token removed from URL)
  const response = NextResponse.redirect(
    new URL(`/dashboard/${memorypop.share_code}`, request.url)
  );

  // Prevent token leakage via Referrer header
  response.headers.set('Referrer-Policy', 'no-referrer');

  return response;
}
