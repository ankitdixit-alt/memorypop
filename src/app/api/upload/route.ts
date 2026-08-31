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
import { createHmac } from 'crypto';

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
 * Parse video duration from MP4/MOV/WebM container metadata
 * Pure JavaScript implementation - works in Vercel serverless (no FFmpeg required)
 *
 * Supported formats:
 * - MP4: Reads 'mvhd' atom (movie header) from ISO Base Media File Format
 * - MOV: Same as MP4 (QuickTime uses ISOBMFF)
 * - WebM: Reads 'Duration' element from Matroska/EBML container
 *
 * @param buffer - Video file buffer
 * @param mimeType - File MIME type for format detection
 * @returns Duration in seconds, or null if parsing fails
 */
function parseVideoDuration(buffer: Buffer, mimeType: string): number | null {
  try {
    if (mimeType === 'video/mp4' || mimeType === 'video/quicktime') {
      return parseMP4Duration(buffer);
    } else if (mimeType === 'video/webm') {
      return parseWebMDuration(buffer);
    }
    return null;
  } catch (error) {
    console.error('Video duration parse error:', error);
    return null;
  }
}

/**
 * Parse MP4/MOV duration from 'mvhd' atom
 * MP4 structure: Atoms are nested recursively (moov contains mvhd)
 * This implementation properly traverses nested atoms
 */
function parseMP4Duration(buffer: Buffer): number | null {
  // Search for mvhd within moov atom
  // Most MP4s have moov within first 100KB (search more aggressively)
  const searchLimit = Math.min(buffer.length, 100000);

  // First, find the moov atom
  const moovOffset = findAtom(buffer, 'moov', 0, searchLimit);
  if (moovOffset === null) {
    return null;
  }

  // Read moov atom size to limit search within it
  const moovSize = buffer.readUInt32BE(moovOffset);
  const moovDataOffset = moovOffset + 8; // Skip size + type
  const moovEndOffset = Math.min(moovOffset + moovSize, searchLimit);

  // Search for mvhd within moov atom
  const mvhdOffset = findAtom(buffer, 'mvhd', moovDataOffset, moovEndOffset);
  if (mvhdOffset === null) {
    return null;
  }

  // Parse mvhd atom for duration
  const version = buffer.readUInt8(mvhdOffset + 8);
  let timescale: number;
  let duration: number;

  if (version === 1) {
    // Version 1: 64-bit duration
    timescale = buffer.readUInt32BE(mvhdOffset + 28);
    duration = Number(buffer.readBigUInt64BE(mvhdOffset + 32));
  } else {
    // Version 0: 32-bit duration
    timescale = buffer.readUInt32BE(mvhdOffset + 20);
    duration = buffer.readUInt32BE(mvhdOffset + 24);
  }

  if (timescale > 0 && duration > 0) {
    return duration / timescale;
  }

  return null;
}

/**
 * Find an MP4 atom by type within a buffer range
 * Returns offset to atom start, or null if not found
 */
function findAtom(buffer: Buffer, atomType: string, startOffset: number, endOffset: number): number | null {
  let offset = startOffset;

  while (offset < endOffset - 8) {
    const atomSize = buffer.readUInt32BE(offset);
    const currentAtomType = buffer.slice(offset + 4, offset + 8).toString('ascii');

    if (currentAtomType === atomType) {
      return offset;
    }

    // Move to next atom
    if (atomSize < 8 || atomSize > (endOffset - offset)) {
      break;
    }
    offset += atomSize;
  }

  return null;
}

/**
 * Parse WebM duration from EBML/Matroska 'Duration' element
 * WebM uses EBML variable-length encoding
 */
function parseWebMDuration(buffer: Buffer): number | null {
  // WebM Duration element ID: 0x4489
  // Timecode scale element ID: 0x2AD7B1 (default 1000000ns = 1ms)

  let offset = 0;
  const length = Math.min(buffer.length, 10000);
  let timecodeScale = 1000000; // Default: 1ms per tick
  let duration: number | null = null;

  while (offset < length - 4) {
    // Read EBML element ID (variable length)
    const firstByte = buffer.readUInt8(offset);

    // Check for Duration element (0x4489)
    if (firstByte === 0x44 && offset + 1 < length && buffer.readUInt8(offset + 1) === 0x89) {
      offset += 2;
      // Read element size
      const sizeLength = getEBMLSize(buffer, offset);
      if (!sizeLength) break;
      offset += sizeLength.bytes;

      // Read duration as float (typically 4 or 8 bytes)
      if (sizeLength.value === 4) {
        duration = buffer.readFloatBE(offset);
      } else if (sizeLength.value === 8) {
        duration = buffer.readDoubleBE(offset);
      }

      if (duration !== null) {
        // Duration is in timecode scale units (default 1ms)
        return (duration * timecodeScale) / 1000000000; // Convert to seconds
      }
    }

    offset++;
  }

  return null;
}

/**
 * Read EBML variable-length size encoding
 */
function getEBMLSize(buffer: Buffer, offset: number): { value: number; bytes: number } | null {
  if (offset >= buffer.length) return null;

  const firstByte = buffer.readUInt8(offset);
  let numBytes = 1;
  let mask = 0x80;

  // Find leading 1 bit to determine length
  while (numBytes <= 8 && !(firstByte & mask)) {
    mask >>= 1;
    numBytes++;
  }

  if (numBytes > 8 || offset + numBytes > buffer.length) return null;

  // Read size value
  let value = firstByte & (mask - 1);
  for (let i = 1; i < numBytes; i++) {
    value = (value << 8) | buffer.readUInt8(offset + i);
  }

  return { value, bytes: numBytes };
}

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
      // Parse video duration using pure JavaScript (no FFmpeg/external binaries)
      // Works reliably in Vercel serverless environment
      const parsedDuration = parseVideoDuration(buffer, file.type);

      if (parsedDuration === null) {
        console.error('Video duration parse failed:', {
          type: file.type,
          size: file.size,
          bufferLength: buffer.length,
          firstBytes: buffer.slice(0, 32).toString('hex')
        });
        return NextResponse.json(
          { error: 'Could not read video metadata. Please ensure your video is in MP4, MOV, or WebM format and is not corrupted.' },
          { status: 400 }
        );
      }

      videoDuration = parsedDuration;

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
