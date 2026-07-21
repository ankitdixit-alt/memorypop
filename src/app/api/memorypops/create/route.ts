/**
 * Server-Side MemoryPop Creation
 * POST /api/memorypops/create
 *
 * Securely generates public and private credentials,
 * establishes creator session, returns sanitized result.
 *
 * Security Features:
 * - Server-side token generation (crypto.randomUUID, crypto.randomBytes)
 * - SHA-256 hashing before storage
 * - Atomic insert (both credentials or none)
 * - Immediate session establishment
 * - No raw token in response (session cookie instead)
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateManagementToken } from '@/lib/verification';
import { setCreatorSession } from '@/lib/creatorSession';
import crypto from 'crypto';

interface CreateMemoryPopRequest {
  recipient_name: string;
  occasion: string;
  story: string;
  tone: string;
  celebration_date?: string | null;
  cover_style: string;
}

/**
 * Validate creation payload
 */
function validatePayload(body: unknown): body is CreateMemoryPopRequest {
  if (!body || typeof body !== 'object') return false;

  const payload = body as Record<string, unknown>;

  return (
    typeof payload.recipient_name === 'string' &&
    typeof payload.occasion === 'string' &&
    typeof payload.story === 'string' &&
    typeof payload.tone === 'string' &&
    typeof payload.cover_style === 'string' &&
    payload.recipient_name.trim().length > 0
  );
}

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request
    const body = await request.json();

    if (!validatePayload(body)) {
      return NextResponse.json(
        { success: false, error: 'Invalid request payload' },
        { status: 400 }
      );
    }

    // Generate public shareCode (for contributors)
    const shareCode = crypto.randomUUID();

    // Generate private management token (for creator)
    const { tokenHash: managementTokenHash } = generateManagementToken();

    // Insert MemoryPop with both credentials
    const { data, error } = await supabase
      .from('memorypops')
      .insert({
        recipient_name: body.recipient_name,
        occasion: body.occasion,
        story: body.story,
        tone: body.tone,
        status: 'collecting',
        share_code: shareCode,
        management_token_hash: managementTokenHash,
        celebration_date: body.celebration_date || null,
        cover_style: body.cover_style,
      })
      .select('share_code')
      .single();

    if (error) {
      console.error('Database insert error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create MemoryPop' },
        { status: 500 }
      );
    }

    // Establish scoped creator session
    // Session binds this creator to THIS specific MemoryPop
    await setCreatorSession(shareCode, managementTokenHash);

    // Return ONLY non-sensitive data
    // Do NOT return managementToken in normal flow
    return NextResponse.json({
      success: true,
      shareCode: data.share_code,
    });

  } catch (error) {
    console.error('Unexpected error in create:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
