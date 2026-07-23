/**
 * Server-Side MemoryPop Creation
 * POST /api/memorypops/create
 *
 * Securely generates public and private credentials,
 * establishes creator session, returns result with management token.
 *
 * Security Features:
 * - Server-side token generation (crypto.randomUUID, crypto.randomBytes)
 * - SHA-256 hashing before storage
 * - Atomic insert (both credentials or none)
 * - Immediate session establishment
 * - Raw management token returned ONCE in response (for recovery)
 *
 * SECURITY: Management token is returned once for display on success page.
 * This is the creator's only recovery mechanism during Private Beta.
 * Token never stored in database (only hash), never logged, never tracked.
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
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
 * Valid mood values (maps to database tone field)
 */
const VALID_MOODS = [
  'warm_heartfelt',
  'playful_fun',
  'thoughtful_meaningful',
  'joyful_celebratory',
  'nostalgic_reflective',
  'simple_classic'
];

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
    VALID_MOODS.includes(payload.tone) && // Validate mood is one of the 5 valid values
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
    // SECURITY: Token returned once, hash stored in DB
    const { token: managementToken, tokenHash: managementTokenHash } = generateManagementToken();

    // Insert MemoryPop with both credentials
    const { data, error } = await supabaseServer
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

    // Return shareCode and raw management token
    // SECURITY: Token returned ONCE for display on success page
    // This is creator's only recovery mechanism during Private Beta
    // Token must be saved by creator (shown once, never retrievable)
    return NextResponse.json({
      success: true,
      shareCode: data.share_code,
      managementToken: managementToken,
    });

  } catch (error) {
    console.error('Unexpected error in create:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
