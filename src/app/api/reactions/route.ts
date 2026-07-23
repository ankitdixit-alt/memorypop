/**
 * Reaction Submission API Route
 * POST /api/reactions
 *
 * Records a recipient's reaction to their MemoryPop reveal experience.
 * Server-side validation and database insertion.
 *
 * Security:
 * - Uses service role to bypass RLS (Phase 3 will add policies)
 * - Validates memorypopId and reactionType
 * - Handles duplicate reactions gracefully (unique constraint)
 * - No authentication required (reactions are anonymous)
 *
 * Phase 2: Removes browser database access from ReactionPrompt
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

interface CreateReactionRequest {
  memorypopId: string;
  reactionType: string;
}

const VALID_REACTIONS = ['loved_it', 'made_me_emotional', 'made_me_laugh'];

export async function POST(request: NextRequest) {
  try {
    const body: CreateReactionRequest = await request.json();

    // Validate required fields
    if (!body.memorypopId || !body.reactionType) {
      return NextResponse.json(
        { error: 'Missing required fields: memorypopId, reactionType' },
        { status: 400 }
      );
    }

    // Validate reaction type
    if (!VALID_REACTIONS.includes(body.reactionType)) {
      return NextResponse.json(
        { error: 'Invalid reaction type' },
        { status: 400 }
      );
    }

    // Insert reaction
    const { error: insertError } = await supabaseServer
      .from('memorypop_reactions')
      .insert({
        memorypop_id: body.memorypopId,
        reaction_type: body.reactionType,
      });

    if (insertError) {
      // Handle unique constraint violation (user already reacted)
      // PostgreSQL error code 23505 = unique_violation
      if (insertError.code === '23505') {
        return NextResponse.json({
          success: true,
          duplicate: true,
          message: 'Reaction already recorded',
        });
      }

      console.error('Reaction insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to save reaction' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      duplicate: false,
    });

  } catch (error) {
    console.error('Reaction submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
