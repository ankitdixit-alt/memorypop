/**
 * API Route: Request reveal export
 *
 * POST /api/export/request
 *
 * Creates or returns existing export job for a memorypop.
 * Access control: Creator or authorized recipient only.
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { calculateContentHash } from '@/lib/export/exportReveal';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { shareCode } = body;

    if (!shareCode || typeof shareCode !== 'string') {
      return NextResponse.json(
        { error: 'Share code is required' },
        { status: 400 }
      );
    }

    // Fetch memorypop
    const { data: memorypop, error: memorypopError } = await supabaseServer
      .from('memorypops')
      .select('id, is_premium, share_code')
      .eq('share_code', shareCode)
      .single();

    if (memorypopError || !memorypop) {
      return NextResponse.json(
        { error: 'Gift not found' },
        { status: 404 }
      );
    }

    // Check if Plus gift (export only supported for Plus tier)
    if (!memorypop.is_premium) {
      return NextResponse.json(
        { error: 'Export is only available for Plus tier gifts' },
        { status: 403 }
      );
    }

    // Fetch reveal plan if exists
    const { data: revealPlan } = await supabaseServer
      .from('reveal_plans')
      .select('id')
      .eq('memorypop_id', memorypop.id)
      .maybeSingle();

    // Fetch memories for content hash
    const { data: memories } = await supabaseServer
      .from('memories')
      .select('id')
      .eq('memorypop_id', memorypop.id)
      .order('created_at', { ascending: false });

    // Fetch custom music URL
    const { data: music } = await supabaseServer
      .from('memorypops')
      .select('custom_music_url')
      .eq('id', memorypop.id)
      .single();

    // Calculate content hash
    const contentHash = calculateContentHash({
      revealPlanId: revealPlan?.id,
      memoryIds: memories?.map(m => m.id) || [],
      customMusicUrl: music?.custom_music_url,
      exporterVersion: 'v4',
    });

    // Check for existing completed export with matching content
    const { data: existingExport } = await supabaseServer
      .from('export_jobs')
      .select('id, status, video_path, created_at')
      .eq('memorypop_id', memorypop.id)
      .eq('status', 'completed')
      .eq('content_hash', contentHash)
      .maybeSingle();

    if (existingExport) {
      // Return existing completed export
      return NextResponse.json({
        jobId: existingExport.id,
        status: 'completed',
        videoPath: existingExport.video_path,
        createdAt: existingExport.created_at,
      });
    }

    // Check for pending/processing job
    const { data: activeJob } = await supabaseServer
      .from('export_jobs')
      .select('id, status, created_at')
      .eq('memorypop_id', memorypop.id)
      .in('status', ['pending', 'processing'])
      .maybeSingle();

    if (activeJob) {
      // Return existing active job
      return NextResponse.json({
        jobId: activeJob.id,
        status: activeJob.status,
        createdAt: activeJob.created_at,
      });
    }

    // Create new export job
    const { data: newJob, error: insertError } = await supabaseServer
      .from('export_jobs')
      .insert({
        memorypop_id: memorypop.id,
        status: 'pending',
        content_hash: contentHash,
        exporter_version: 'v4',
      })
      .select('id, status, created_at')
      .single();

    if (insertError || !newJob) {
      return NextResponse.json(
        { error: 'Failed to create export job' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      jobId: newJob.id,
      status: newJob.status,
      createdAt: newJob.created_at,
    }, { status: 201 });

  } catch (error: any) {
    console.error('Export request error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
