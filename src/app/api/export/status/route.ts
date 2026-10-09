/**
 * API Route: Check export job status
 *
 * GET /api/export/status?jobId=<uuid>
 *
 * Returns current status of an export job.
 * Access control: Creator or authorized recipient only.
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

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

    // Fetch job with memorypop info
    const { data: job, error: jobError } = await supabaseServer
      .from('export_jobs')
      .select(`
        id,
        status,
        video_path,
        error_message,
        created_at,
        updated_at,
        completed_at,
        memorypops!inner(share_code)
      `)
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Return job status
    const response: any = {
      jobId: job.id,
      status: job.status,
      createdAt: job.created_at,
      updatedAt: job.updated_at,
    };

    if (job.status === 'completed') {
      response.completedAt = job.completed_at;
      response.videoPath = job.video_path;
    }

    if (job.status === 'failed') {
      response.errorMessage = job.error_message;
    }

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('Export status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
