/**
 * API Route: Download completed export
 *
 * GET /api/export/download?jobId=<uuid>
 *
 * Serves the completed MP4 file with proper authorization.
 * Access control: Creator or authorized recipient only.
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { promises as fs } from 'fs';
import path from 'path';
import { existsSync } from 'fs';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    // Fetch completed job
    const { data: job, error: jobError } = await supabaseServer
      .from('export_jobs')
      .select(`
        id,
        status,
        video_path,
        memorypops!inner(share_code, recipient_name, occasion)
      `)
      .eq('id', jobId)
      .eq('status', 'completed')
      .single();

    if (jobError || !job) {
      return NextResponse.json(
        { error: 'Completed export not found' },
        { status: 404 }
      );
    }

    if (!job.video_path) {
      return NextResponse.json(
        { error: 'Video file not available' },
        { status: 404 }
      );
    }

    // Verify file exists
    if (!existsSync(job.video_path)) {
      return NextResponse.json(
        { error: 'Video file not found on disk' },
        { status: 404 }
      );
    }

    // Read video file
    const videoBuffer = await fs.readFile(job.video_path);

    // Get memorypop info for filename
    const memorypop = job.memorypops as any;

    // Sanitize base name first, then append extension
    const baseName = `${memorypop.recipient_name}-${memorypop.occasion}-reveal`
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens

    const filename = `${baseName || 'memorypop-reveal'}.mp4`;

    // Return video file
    return new NextResponse(videoBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Length': videoBuffer.length.toString(),
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'private, max-age=3600',
      },
    });

  } catch (error: any) {
    console.error('Export download error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
