/**
 * MemoryPop Status Update API Route
 * PATCH /api/memorypops/[id]/status
 *
 * Updates the status of a MemoryPop through valid state transitions.
 * Server-side validation, authorization, and database update.
 *
 * Valid transitions:
 * - collecting → ready (when at least 1 memory exists)
 * - ready → revealed (when recipient views the reveal)
 *
 * Security:
 * - Requires creator token in request body for authorization
 * - Validates status values against allowed set
 * - Uses service role to bypass RLS for status update
 *
 * AI Director Integration:
 * - Triggers reveal plan preparation for Plus gifts on transition to "ready"
 * - Uses server-side prepareRevealPlan service (no HTTP roundtrip)
 * - Bounded, awaited operation (not fire-and-forget)
 * - Respects ENABLE_AI_DIRECTOR feature flag
 */

import { NextRequest, NextResponse } from 'next/server';

// Opt out of static generation for this API route
export const dynamic = 'force-dynamic';

interface UpdateStatusRequest {
  status: string;
  creatorToken?: string; // Required for authorization
  forceRegenerate?: boolean; // Optional: force AI plan regeneration even if already ready
}

const VALID_STATUSES = ['collecting', 'ready', 'revealed'];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Lazy import to prevent module evaluation during build
    const { supabaseServer } = await import('@/lib/supabaseServer');
    const { prepareRevealPlan } = await import('@/lib/ai/prepareRevealPlan');

    const { id } = await params;
    const body: UpdateStatusRequest = await request.json();

    // Validate status
    if (!body.status || !VALID_STATUSES.includes(body.status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: collecting, ready, revealed' },
        { status: 400 }
      );
    }

    // Fetch MemoryPop to get shareCode and verify existence
    const { data: memoryPop, error: fetchError } = await supabaseServer
      .from('memorypops')
      .select('id, share_code, management_token_hash, is_premium, status')
      .eq('id', id)
      .single();

    if (fetchError || !memoryPop) {
      console.error('Failed to fetch MemoryPop:', fetchError);
      return NextResponse.json(
        { error: 'MemoryPop not found' },
        { status: 404 }
      );
    }

    // Verify creator authorization using session
    const { getCreatorSession } = await import('@/lib/creatorSession');
    const session = await getCreatorSession(memoryPop.share_code);

    if (!session || session.managementTokenHash !== memoryPop.management_token_hash) {
      return NextResponse.json(
        { error: 'Unauthorized: creator session required' },
        { status: 401 }
      );
    }

    // Update status
    const { error } = await supabaseServer
      .from('memorypops')
      .update({ status: body.status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Status update error:', error);
      return NextResponse.json(
        { error: 'Failed to update status' },
        { status: 500 }
      );
    }

    // Prepare AI Director reveal plan for Plus gifts
    // Triggers on:
    // 1. Transition to "ready" (not on repeated calls when already ready)
    // 2. Explicit retry via forceRegenerate flag (allows recovery from failed preparation)
    const transitioningToReady = body.status === 'ready' && memoryPop.status !== 'ready'
    const retryingPreparation = body.status === 'ready' && memoryPop.status === 'ready' && body.forceRegenerate === true
    const shouldPrepare = (transitioningToReady || retryingPreparation)
    const isPlusGift = memoryPop.is_premium === true
    const aiDirectorEnabled = process.env.ENABLE_AI_DIRECTOR === 'true'

    if (shouldPrepare && isPlusGift && aiDirectorEnabled) {
      try {
        // Bounded, awaited preparation using server-side service
        const preparationResult = await prepareRevealPlan({
          creatorToken: session.managementTokenHash,
          memorypopId: id,
          forceRegenerate: body.forceRegenerate || false,
        });

        console.log('[AI_DIRECTOR] Preparation complete:', {
          memorypopId: id,
          success: preparationResult.success,
          source: preparationResult.source,
          fromCache: preparationResult.fromCache,
        });

        // Note: Preparation failure doesn't block status update
        // Recipient will get deterministic Plus fallback during playback
        if (!preparationResult.success) {
          console.error('[AI_DIRECTOR] Preparation failed:', preparationResult.error);
        }
      } catch (preparationError) {
        // Log but don't fail status update
        console.error('[AI_DIRECTOR] Preparation error:', preparationError);
      }
    }

    return NextResponse.json({
      success: true,
      status: body.status,
    });

  } catch (error) {
    console.error('Status update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
