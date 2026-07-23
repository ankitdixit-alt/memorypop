/**
 * Memory Creation API Route
 * POST /api/memories
 *
 * Creates a new memory contribution for a MemoryPop.
 * Server-side validation and database insertion.
 *
 * Security:
 * - Uses service role to bypass RLS (Phase 3 will add policies)
 * - Validates share_code exists before inserting
 * - Returns memory count for progress display
 * - Rate limiting via MemoryPop lookup (invalid codes fail fast)
 *
 * Phase 2: Removes browser database access from contribute page
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

interface CreateMemoryRequest {
  shareCode: string;
  contributorName: string;
  message: string;
  photoUrl?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateMemoryRequest = await request.json();

    // Validate required fields
    if (!body.shareCode || !body.contributorName || !body.message) {
      return NextResponse.json(
        { error: 'Missing required fields: shareCode, contributorName, message' },
        { status: 400 }
      );
    }

    // Look up MemoryPop by share_code
    const { data: memorypop, error: fetchError } = await supabaseServer
      .from('memorypops')
      .select('id')
      .eq('share_code', body.shareCode)
      .single();

    if (fetchError || !memorypop) {
      return NextResponse.json(
        { error: 'MemoryPop not found' },
        { status: 404 }
      );
    }

    // Insert memory
    const { error: insertError } = await supabaseServer
      .from('memories')
      .insert({
        memorypop_id: memorypop.id,
        contributor_name: body.contributorName,
        message: body.message,
        photo_url: body.photoUrl || null,
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
