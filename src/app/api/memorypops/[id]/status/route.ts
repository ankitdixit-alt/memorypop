/**
 * MemoryPop Status Update API Route
 * PATCH /api/memorypops/[id]/status
 *
 * Updates the status of a MemoryPop through valid state transitions.
 * Server-side validation and database update.
 *
 * Valid transitions:
 * - collecting → ready (when at least 1 memory exists)
 * - ready → revealed (when recipient views the reveal)
 *
 * Security:
 * - Uses service role to bypass RLS (Phase 3 will add policies)
 * - Validates status values against allowed set
 * - TODO Phase 3: Add creator authentication check
 *
 * Phase 2: Removes browser database access from DashboardClientSection
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

interface UpdateStatusRequest {
  status: string;
}

const VALID_STATUSES = ['collecting', 'ready', 'revealed'];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: UpdateStatusRequest = await request.json();

    // Validate status
    if (!body.status || !VALID_STATUSES.includes(body.status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: collecting, ready, revealed' },
        { status: 400 }
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
