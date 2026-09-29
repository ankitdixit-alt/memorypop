/**
 * Custom Music Management API Route
 *
 * GET /api/memorypops/[id]/custom-music
 * - Returns signed upload URL for direct-to-Supabase upload
 * - Verifies Plus entitlement and creator authorization
 * - Avoids Vercel's 4.5MB body limit by using signed URLs
 *
 * POST /api/memorypops/[id]/custom-music
 * - Validates uploaded file in storage
 * - Attaches validated music URL to gift
 * - Preserves previous track if validation fails
 *
 * DELETE /api/memorypops/[id]/custom-music
 * - Removes custom music
 * - Deletes file from storage
 * - Clears memorypops.custom_music_url
 * - Falls back to default occasion-based music
 *
 * Test environment: Uses memorypop-test database
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { isCreatorAuthorizedForMemoryPop } from '@/lib/creatorSession';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const ALLOWED_TYPES = ['audio/mpeg', 'audio/mp3', 'audio/mp4', 'audio/x-m4a'];
const STORAGE_BUCKET = 'memorypop-custom-music';

/**
 * Validate audio file by checking magic bytes (file signature)
 * Verifies actual file content, not just MIME type or extension
 */
function validateAudioMagicBytes(buffer: Buffer): boolean {
  if (buffer.length < 12) return false;

  // MP3 signatures
  // ID3v2 tag: starts with "ID3" (0x49 0x44 0x33)
  if (buffer[0] === 0x49 && buffer[1] === 0x44 && buffer[2] === 0x33) {
    return true;
  }

  // MPEG audio frame sync: 0xFF followed by 0xFB or 0xFA (first 11 bits set)
  if (buffer[0] === 0xFF && (buffer[1] & 0xE0) === 0xE0) {
    return true;
  }

  // M4A/MP4 container: "ftyp" box at offset 4
  // Format: [size:4bytes][type:4bytes="ftyp"][brand:4bytes]
  const ftypSignature = buffer.toString('ascii', 4, 8);
  if (ftypSignature === 'ftyp') {
    // Check for M4A brand identifiers
    const brand = buffer.toString('ascii', 8, 12);
    const m4aBrands = ['M4A ', 'M4B ', 'mp42', 'isom', 'iso2'];
    if (m4aBrands.includes(brand)) {
      return true;
    }
  }

  return false;
}

/**
 * GET: Generate signed upload URL for direct-to-Supabase upload
 * This avoids Vercel's 4.5MB request body limit
 * Binds upload to authenticated creator's MemoryPop
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: memorypopId } = await params;

    // Verify creator authorization
    const isAuthorized = await isCreatorAuthorizedForMemoryPop(memorypopId);
    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Creator authorization required' },
        { status: 403 }
      );
    }

    // Verify memorypop exists and is Plus
    const { data: memorypop, error: fetchError } = await supabaseServer
      .from('memorypops')
      .select('id, is_premium, custom_music_url')
      .eq('id', memorypopId)
      .single();

    if (fetchError || !memorypop) {
      console.error('[Custom Music API] Fetch failed:', { error: fetchError, memorypopId });
      return NextResponse.json(
        { error: 'MemoryPop not found' },
        { status: 404 }
      );
    }

    if (!memorypop.is_premium) {
      return NextResponse.json(
        { error: 'Custom music is a Plus-only feature' },
        { status: 403 }
      );
    }

    // Generate scoped file path with timestamp
    // Path binds to this specific memorypopId
    const timestamp = Date.now();
    const filePath = `${memorypopId}/reveal-music-${timestamp}.mp3`;

    // Create signed upload URL (valid for 5 minutes)
    const { data: signedUrlData, error: signedUrlError } = await supabaseServer.storage
      .from(STORAGE_BUCKET)
      .createSignedUploadUrl(filePath);

    if (signedUrlError || !signedUrlData) {
      console.error('Signed URL creation error:', signedUrlError);
      return NextResponse.json(
        { error: 'Failed to generate upload URL' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      uploadUrl: signedUrlData.signedUrl,
      token: signedUrlData.token,
      filePath: filePath,
      maxFileSize: MAX_FILE_SIZE,
      allowedTypes: ALLOWED_TYPES,
    });

  } catch (error) {
    console.error('Upload URL generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST: Validate uploaded file and attach to gift
 * Client uploads directly to Supabase, then calls this to validate and commit
 * Validates actual stored file and binds to creator's MemoryPop
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: memorypopId } = await params;
    const body = await request.json();
    const { filePath } = body;

    if (!filePath) {
      return NextResponse.json(
        { error: 'File path is required' },
        { status: 400 }
      );
    }

    // Verify creator authorization
    const isAuthorized = await isCreatorAuthorizedForMemoryPop(memorypopId);
    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Creator authorization required' },
        { status: 403 }
      );
    }

    // Verify memorypop exists and is Plus
    const { data: memorypop, error: fetchError } = await supabaseServer
      .from('memorypops')
      .select('id, is_premium, custom_music_url')
      .eq('id', memorypopId)
      .single();

    if (fetchError || !memorypop) {
      console.error('[Custom Music API] Fetch failed:', { error: fetchError, memorypopId });
      return NextResponse.json(
        { error: 'MemoryPop not found' },
        { status: 404 }
      );
    }

    if (!memorypop.is_premium) {
      return NextResponse.json(
        { error: 'Custom music is a Plus-only feature' },
        { status: 403 }
      );
    }

    // Security: Verify filePath is scoped to this memorypopId
    if (!filePath.startsWith(`${memorypopId}/`)) {
      return NextResponse.json(
        { error: 'Unauthorized file path' },
        { status: 403 }
      );
    }

    // Fetch actual file from storage to validate
    const { data: fileBlob, error: downloadError } = await supabaseServer.storage
      .from(STORAGE_BUCKET)
      .download(filePath);

    if (downloadError || !fileBlob) {
      console.error('File download failed:', downloadError);
      return NextResponse.json(
        { error: 'Uploaded file not found in storage' },
        { status: 404 }
      );
    }

    // Validate actual file size
    const actualFileSize = fileBlob.size;
    if (actualFileSize > MAX_FILE_SIZE) {
      // Delete oversized file
      await supabaseServer.storage
        .from(STORAGE_BUCKET)
        .remove([filePath]);
      return NextResponse.json(
        { error: `File too large (${(actualFileSize / 1024 / 1024).toFixed(1)}MB). Maximum size is 20MB.` },
        { status: 400 }
      );
    }

    // Validate actual file type (MIME type)
    const actualFileType = fileBlob.type;
    if (!ALLOWED_TYPES.includes(actualFileType)) {
      // Delete invalid file
      await supabaseServer.storage
        .from(STORAGE_BUCKET)
        .remove([filePath]);
      return NextResponse.json(
        { error: `Invalid file type (${actualFileType}). Only MP3 and M4A files are allowed.` },
        { status: 400 }
      );
    }

    // Validate actual file content by checking magic bytes
    const buffer = Buffer.from(await fileBlob.arrayBuffer());
    const isValidAudio = validateAudioMagicBytes(buffer);
    if (!isValidAudio) {
      // Delete invalid file
      await supabaseServer.storage
        .from(STORAGE_BUCKET)
        .remove([filePath]);
      return NextResponse.json(
        { error: 'File does not appear to be valid MP3 or M4A audio. Please ensure the file is not corrupted.' },
        { status: 400 }
      );
    }

    const previousMusicPath = memorypop.custom_music_url;

    // Store durable path (not signed URL)
    const { error: updateError } = await supabaseServer
      .from('memorypops')
      .update({ custom_music_url: filePath })
      .eq('id', memorypopId);

    if (updateError) {
      console.error('Database update error:', updateError);
      // Clean up uploaded file on database failure
      await supabaseServer.storage
        .from(STORAGE_BUCKET)
        .remove([filePath]);
      return NextResponse.json(
        { error: 'Failed to save music reference' },
        { status: 500 }
      );
    }

    // Delete old music file if replacement succeeded
    if (previousMusicPath && previousMusicPath.startsWith(`${memorypopId}/`)) {
      try {
        await supabaseServer.storage
          .from(STORAGE_BUCKET)
          .remove([previousMusicPath]);
      } catch (error) {
        console.warn('Failed to delete old custom music:', error);
        // Non-fatal - new music is already attached
      }
    }

    return NextResponse.json({
      success: true,
      storagePath: filePath,
      fileSize: actualFileSize,
      fileType: actualFileType,
    });

  } catch (error) {
    console.error('Custom music validation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: memorypopId } = await params;

    // Verify creator authorization
    const isAuthorized = await isCreatorAuthorizedForMemoryPop(memorypopId);
    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Creator authorization required' },
        { status: 403 }
      );
    }

    // Verify memorypop exists and is Plus
    const { data: memorypop, error: fetchError } = await supabaseServer
      .from('memorypops')
      .select('id, is_premium, custom_music_url')
      .eq('id', memorypopId)
      .single();

    if (fetchError || !memorypop) {
      console.error('[Custom Music API] Fetch failed:', { error: fetchError, memorypopId });
      return NextResponse.json(
        { error: 'MemoryPop not found' },
        { status: 404 }
      );
    }

    if (!memorypop.is_premium) {
      return NextResponse.json(
        { error: 'Custom music is a Plus-only feature' },
        { status: 403 }
      );
    }

    if (!memorypop.custom_music_url) {
      return NextResponse.json(
        { error: 'No custom music to delete' },
        { status: 404 }
      );
    }

    // Delete file from storage using durable path
    // Verify path is scoped to this memorypopId for security
    const storagePath = memorypop.custom_music_url;
    if (storagePath.startsWith(`${memorypopId}/`)) {
      try {
        await supabaseServer.storage
          .from(STORAGE_BUCKET)
          .remove([storagePath]);
      } catch (error) {
        console.warn('Failed to delete custom music file:', error);
        // Continue with database update even if deletion fails
      }
    }

    // Clear custom_music_url
    const { error: updateError } = await supabaseServer
      .from('memorypops')
      .update({ custom_music_url: null })
      .eq('id', memorypopId);

    if (updateError) {
      console.error('Database update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to remove music reference' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Custom music removed. Reveal will use default music.',
    });

  } catch (error) {
    console.error('Custom music delete error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
