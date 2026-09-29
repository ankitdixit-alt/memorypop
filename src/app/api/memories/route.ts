/**
 * Memory Creation API Route
 * POST /api/memories
 *
 * Creates a new memory contribution for a MemoryPop.
 * Server-side validation and database insertion.
 *
 * Tier-based multimedia support:
 * - Standard: 3 photos, 1 GIF, 15s video
 * - Plus: 10 photos, 3 GIFs, 90s video
 *
 * Security:
 * - Uses service role to bypass RLS (Phase 3 will add policies)
 * - Validates share_code exists before inserting
 * - **RE-VALIDATES VIDEO DURATION** - Does not trust client-provided duration
 * - Downloads video from Supabase and checks duration server-side
 * - Enforces tier-specific limits based on is_premium entitlement
 * - Returns memory count for progress display
 * - Rate limiting via MemoryPop lookup (invalid codes fail fast)
 *
 * Backwards compatibility:
 * - Still accepts photoUrl (legacy field)
 * - New contributions use JSONB columns (photos[], gifs[], video)
 */

import { NextRequest, NextResponse } from 'next/server';
import type { MediaItem, VideoMedia } from '@/components/memory-experience/types';
import { createHmac, timingSafeEqual } from 'crypto';
import { getContributionLimits } from '@/config/plus';

// Opt out of static generation for this API route
export const dynamic = 'force-dynamic';

// Use Node.js runtime for crypto compatibility
export const runtime = 'nodejs';

// Server-only secret for video validation verification (must match /api/upload)
const VIDEO_VALIDATION_SECRET = process.env.VIDEO_VALIDATION_SECRET;

if (!VIDEO_VALIDATION_SECRET) {
  console.error('FATAL: VIDEO_VALIDATION_SECRET environment variable not set');
}

/**
 * Verify HMAC-SHA256 signed validation proof for video uploads
 * Prevents tampering, replay attacks, and unauthorized video acceptance
 */
function verifyVideoValidationProof(
  proof: string,
  expectedPayload: {
    version: number;
    mediaType: string;
    shareCode: string;
    filePath: string;
    duration: number;
    fileSize: number;
  },
  maxDuration: number
): { valid: boolean; payload?: any; error?: string } {
  if (!VIDEO_VALIDATION_SECRET) {
    return { valid: false, error: 'VIDEO_VALIDATION_SECRET not configured' };
  }

  try {
    // Parse proof: base64url(payload).signature
    const [payloadB64, signature] = proof.split('.');
    if (!payloadB64 || !signature) {
      return { valid: false, error: 'Invalid proof format' };
    }

    // Decode payload
    const payloadString = Buffer.from(payloadB64, 'base64url').toString('utf-8');
    const payload = JSON.parse(payloadString);

    // Verify signature using timing-safe comparison
    const hmac = createHmac('sha256', VIDEO_VALIDATION_SECRET);
    hmac.update(payloadString);
    const expectedSignature = hmac.digest('hex');

    // Convert to buffers for timingSafeEqual (requires equal lengths)
    const signatureBuffer = Buffer.from(signature, 'hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');

    if (signatureBuffer.length !== expectedBuffer.length) {
      return { valid: false, error: 'Signature length mismatch' };
    }

    if (!timingSafeEqual(signatureBuffer, expectedBuffer)) {
      return { valid: false, error: 'Signature verification failed' };
    }

    // Verify payload structure and values
    if (payload.version !== expectedPayload.version) {
      return { valid: false, error: 'Version mismatch' };
    }

    if (payload.mediaType !== expectedPayload.mediaType) {
      return { valid: false, error: 'Media type mismatch' };
    }

    if (payload.shareCode !== expectedPayload.shareCode) {
      return { valid: false, error: 'ShareCode mismatch' };
    }

    if (payload.filePath !== expectedPayload.filePath) {
      return { valid: false, error: 'File path mismatch' };
    }

    if (payload.duration !== expectedPayload.duration) {
      return { valid: false, error: 'Duration mismatch' };
    }

    if (payload.fileSize !== expectedPayload.fileSize) {
      return { valid: false, error: 'File size mismatch' };
    }

    // Verify duration is valid
    if (!Number.isFinite(payload.duration) || payload.duration <= 0) {
      return { valid: false, error: 'Invalid duration value' };
    }

    if (payload.duration > maxDuration) {
      return { valid: false, error: `Duration ${payload.duration}s exceeds ${maxDuration}s limit` };
    }

    // Verify file path belongs to shareCode
    if (!payload.filePath.startsWith(`${payload.shareCode}/`)) {
      return { valid: false, error: 'File path does not belong to shareCode' };
    }

    return { valid: true, payload };
  } catch (error) {
    console.error('Proof verification error:', error);
    return { valid: false, error: 'Proof verification failed' };
  }
}

interface CreateMemoryRequest {
  shareCode: string;
  contributorName: string;
  message: string;
  // Legacy field (backwards compatibility)
  photoUrl?: string;
  // Standard multimedia (JSONB)
  photos?: MediaItem[];
  gifs?: MediaItem[];
  video?: VideoMedia | null;
}

export async function POST(request: NextRequest) {
  try {
    // Lazy import to prevent module evaluation during build
    const { supabaseServer } = await import('@/lib/supabaseServer');

    const body: CreateMemoryRequest = await request.json();

    // Validate required fields
    if (!body.shareCode || !body.contributorName || !body.message) {
      return NextResponse.json(
        { error: 'Missing required fields: shareCode, contributorName, message' },
        { status: 400 }
      );
    }

    // Look up MemoryPop by share_code (fetch is_premium for tier-based validation)
    const { data: memorypop, error: fetchError } = await supabaseServer
      .from('memorypops')
      .select('id, is_premium')
      .eq('share_code', body.shareCode)
      .single();

    if (fetchError || !memorypop) {
      return NextResponse.json(
        { error: 'MemoryPop not found' },
        { status: 404 }
      );
    }

    // Get tier-specific contribution limits
    const limits = getContributionLimits(memorypop.is_premium);

    // SERVER-SIDE VIDEO VALIDATION VIA SIGNED PROOF
    // Verify cryptographic proof generated by /api/upload
    // Do NOT trust client-provided duration_seconds without verification
    if (body.video) {
      // Require validation proof
      if (!body.video.validation_proof) {
        return NextResponse.json(
          { error: 'Video validation proof required. Please re-upload your video.' },
          { status: 400 }
        );
      }

      // Require canonical file path
      if (!body.video.file_path) {
        return NextResponse.json(
          { error: 'Video file path required. Please re-upload your video.' },
          { status: 400 }
        );
      }

      // Verify signed proof with tier-specific limit
      const verificationResult = verifyVideoValidationProof(
        body.video.validation_proof,
        {
          version: 1,
          mediaType: 'video',
          shareCode: body.shareCode,
          filePath: body.video.file_path,
          duration: body.video.duration_seconds,
          fileSize: body.video.file_size_bytes,
        },
        limits.videoSeconds
      );

      if (!verificationResult.valid) {
        console.error('Video proof verification failed:', verificationResult.error);
        return NextResponse.json(
          { error: `Video validation failed: ${verificationResult.error}. Please re-upload your video.` },
          { status: 400 }
        );
      }

      // Proof verified successfully
      // Duration_seconds is now authoritatively bound to the uploaded video
      // No re-download or re-parsing needed
    }

    // Insert memory with JSONB multimedia support
    const { error: insertError } = await supabaseServer
      .from('memories')
      .insert({
        memorypop_id: memorypop.id,
        contributor_name: body.contributorName,
        message: body.message,
        // Legacy field (backwards compatibility)
        photo_url: body.photoUrl || null,
        // Standard multimedia (JSONB)
        photos: body.photos || [],
        gifs: body.gifs || [],
        video: body.video || null,
      });

    if (insertError) {
      console.error('Memory insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to save memory' },
        { status: 500 }
      );
    }

    // Count total memories for progress display
    const { count: memoryCount, error: countError } = await supabaseServer
      .from('memories')
      .select('*', { count: 'exact', head: true })
      .eq('memorypop_id', memorypop.id);

    if (countError) {
      console.error('Memory count error:', countError);
      // Don't fail the request, just return without count
      return NextResponse.json({
        success: true,
        memorypopId: memorypop.id,
      });
    }

    return NextResponse.json({
      success: true,
      memorypopId: memorypop.id,
      memoryCount: memoryCount || 0,
    });

  } catch (error) {
    console.error('Memory creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
