/**
 * Media Upload API Route
 * POST /api/upload
 *
 * Handles photo, GIF, and video uploads to Supabase Storage.
 * Server-side upload using service role.
 *
 * Standard multimedia support:
 * - Photos: JPEG, PNG, WebP (max 10MB each, up to 3)
 * - GIFs: Animated GIF (max 5MB, up to 1)
 * - Video: MP4, MOV, WebM (max 50MB, max 15 seconds, up to 1)
 *
 * Security:
 * - Uses service role for storage operations
 * - Validates file type per media type
 * - Validates file size per media type
 * - Server-side video duration validation (15s limit for Standard tier)
 * - Generates unique file names to prevent collisions
 * - Returns public URL for uploaded file
 */

import { NextRequest, NextResponse } from 'next/server';
import { getVideoDurationInSeconds } from 'get-video-duration';
import { createHmac } from 'crypto';
import { Readable } from 'stream';

// Opt out of static generation for this API route
export const dynamic = 'force-dynamic';

// Use Node.js runtime for get-video-duration compatibility
export const runtime = 'nodejs';

// Server-only secret for video validation signing
// Required in .env.local: VIDEO_VALIDATION_SECRET
const VIDEO_VALIDATION_SECRET = process.env.VIDEO_VALIDATION_SECRET;

if (!VIDEO_VALIDATION_SECRET) {
  console.error('FATAL: VIDEO_VALIDATION_SECRET environment variable not set');
}

// File size limits per media type
const MAX_FILE_SIZES = {
  photo: 10 * 1024 * 1024,  // 10MB
  gif: 5 * 1024 * 1024,     // 5MB (founder-specified)
  video: 50 * 1024 * 1024,  // 50MB
};

// Allowed MIME types per media type
const ALLOWED_TYPES = {
  photo: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  gif: ['image/gif'],
  video: ['video/mp4', 'video/quicktime', 'video/webm'],
};

// Video duration limit for Standard tier (seconds)
const MAX_VIDEO_DURATION = 15;

/**
 * Generate HMAC-SHA256 signed validation proof for video uploads
 * Binds video metadata to prevent tampering/replay attacks
 */
function generateVideoValidationProof(payload: {
  version: number;
  mediaType: string;
  shareCode: string;
  filePath: string;
  duration: number;
  fileSize: number;
  validatedAt: string;
}): string {
  if (!VIDEO_VALIDATION_SECRET) {
    throw new Error('VIDEO_VALIDATION_SECRET not configured');
  }

  // Canonical payload representation (order matters for verification)
  const payloadString = JSON.stringify({
    version: payload.version,
    mediaType: payload.mediaType,
    shareCode: payload.shareCode,
    filePath: payload.filePath,
    duration: payload.duration,
    fileSize: payload.fileSize,
    validatedAt: payload.validatedAt,
  });

  // Generate HMAC-SHA256 signature
  const hmac = createHmac('sha256', VIDEO_VALIDATION_SECRET);
  hmac.update(payloadString);
  const signature = hmac.digest('hex');

  // Return compact proof: base64(payload).signature
  const payloadB64 = Buffer.from(payloadString).toString('base64url');
  return `${payloadB64}.${signature}`;
}

export async function POST(request: NextRequest) {
  try {
    // Lazy import to prevent module evaluation during build
    const { supabaseServer } = await import('@/lib/supabaseServer');

    // Parse multipart/form-data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const shareCode = formData.get('shareCode') as string;
    const mediaType = (formData.get('mediaType') as string) || 'photo';

    // Validate required fields
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!shareCode) {
      return NextResponse.json(
        { error: 'shareCode is required' },
        { status: 400 }
      );
    }

    // Validate mediaType
    if (!['photo', 'gif', 'video'].includes(mediaType)) {
      return NextResponse.json(
        { error: 'Invalid mediaType. Must be "photo", "gif", or "video".' },
        { status: 400 }
      );
    }

    // Validate file type per media type
    const allowedTypes = ALLOWED_TYPES[mediaType as keyof typeof ALLOWED_TYPES];
    if (!allowedTypes.includes(file.type)) {
      const typeNames = { photo: 'JPEG, PNG, or WebP', gif: 'GIF', video: 'MP4, MOV, or WebM' };
      return NextResponse.json(
        { error: `Invalid file type for ${mediaType}. Only ${typeNames[mediaType as keyof typeof typeNames]} files are allowed.` },
        { status: 400 }
      );
    }

    // Validate file size per media type
    const maxSize = MAX_FILE_SIZES[mediaType as keyof typeof MAX_FILE_SIZES];
    if (file.size > maxSize) {
      const sizeMB = (maxSize / 1024 / 1024).toFixed(0);
      return NextResponse.json(
        { error: `File too large. Maximum size for ${mediaType} is ${sizeMB}MB.` },
        { status: 400 }
      );
    }

    // Convert File to Buffer once (reused for validation and upload)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Server-side video duration validation (critical for infrastructure cost guardrail)
    let videoDuration: number | undefined;
    if (mediaType === 'video') {
      try {
        // Convert Buffer to Readable stream for get-video-duration
        const bufferStream = Readable.from(buffer);
        videoDuration = await getVideoDurationInSeconds(bufferStream);
      } catch (error) {
        console.error('Video duration read error:', error);
        return NextResponse.json(
          { error: 'Could not read video metadata. Please ensure your video is in MP4, MOV, or WebM format.' },
          { status: 400 }
        );
      }

      // Validate duration is finite and positive
      if (!Number.isFinite(videoDuration) || videoDuration <= 0) {
        return NextResponse.json(
          { error: 'Invalid video duration. Please ensure your video file is not corrupted.' },
          { status: 400 }
        );
      }

      // Enforce Standard tier 15-second limit
      if (videoDuration > MAX_VIDEO_DURATION) {
        return NextResponse.json(
          {
            error: `Video duration ${videoDuration.toFixed(1)}s exceeds ${MAX_VIDEO_DURATION}s limit for Standard MemoryPops.`,
            duration: videoDuration,
          },
          { status: 400 }
        );
      }
    }

    // Generate unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${shareCode}/${fileName}`;

    // Upload to Supabase Storage using service role
    // Note: Using existing 'memory-photos' bucket (per founder: do not rename)
    const { data, error } = await supabaseServer.storage
      .from('memory-photos')
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Storage upload error:', error);
      return NextResponse.json(
        { error: `Failed to upload ${mediaType}` },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseServer.storage
      .from('memory-photos')
      .getPublicUrl(filePath);

    // Return response with video metadata and signed validation proof
    const response: {
      success: boolean;
      publicUrl: string;
      filePath: string;
      mediaType: string;
      fileSize: number;
      duration?: number;
      validationProof?: string;
    } = {
      success: true,
      publicUrl,
      filePath,
      mediaType,
      fileSize: file.size,
    };

    // For videos: include authoritative duration and signed validation proof
    if (mediaType === 'video' && videoDuration !== undefined) {
      response.duration = videoDuration;

      // Generate signed validation proof to prevent tampering
      try {
        const validationProof = generateVideoValidationProof({
          version: 1,
          mediaType: 'video',
          shareCode,
          filePath,
          duration: videoDuration,
          fileSize: file.size,
          validatedAt: new Date().toISOString(),
        });
        response.validationProof = validationProof;
      } catch (error) {
        console.error('Failed to generate validation proof:', error);
        // This is a server configuration error, not a client error
        return NextResponse.json(
          { error: 'Server configuration error. Please contact support.' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
