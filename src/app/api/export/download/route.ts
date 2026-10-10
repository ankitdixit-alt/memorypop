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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const jobId = searchParams.get('jobId');
    const shareCode = searchParams.get('shareCode');

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    if (!shareCode) {
      return NextResponse.json(
        { error: 'Share code is required' },
        { status: 400 }
      );
    }

    // Fetch completed job with authorization check
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
      .eq('memorypops.share_code', shareCode)
      .single();

    if (jobError || !job) {
      return NextResponse.json(
        { error: 'Completed export not found or access denied' },
        { status: 404 }
      );
    }

    if (!job.video_path) {
      return NextResponse.json(
        { error: 'Video file not available' },
        { status: 404 }
      );
    }

    // Get memorypop info for filename
    const memorypop = job.memorypops as any;

    // Sanitize base name first, then append extension
    const baseName = `${memorypop.recipient_name}-${memorypop.occasion}-reveal`
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens

    const filename = `${baseName || 'memorypop-reveal'}.mp4`;

    // Generate signed URL for download (valid for 1 hour)
    const { data: signedUrl, error: signError } = await supabaseServer.storage
      .from('exports')
      .createSignedUrl(job.video_path, 3600, {
        download: filename, // Set the download filename
      });

    if (signError || !signedUrl) {
      console.error('Failed to generate signed URL:', signError);
      return NextResponse.json(
        { error: 'Failed to generate download link' },
        { status: 500 }
      );
    }

    // Redirect to signed URL
    // Browser will download with correct filename
    return NextResponse.redirect(signedUrl.signedUrl);

  } catch (error: any) {
    console.error('Export download error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
