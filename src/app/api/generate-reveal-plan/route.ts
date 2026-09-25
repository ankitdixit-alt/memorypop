/**
 * API Route: Generate Reveal Plan
 *
 * Server-side generation of AI-powered reveal plans for MemoryPop Plus.
 *
 * Security:
 * - Verifies creator authorization via token
 * - Checks Plus entitlement before generation
 * - API key never exposed to client
 * - Service role database access only
 *
 * Flow:
 * 1. Verify creator token
 * 2. Check Plus entitlement
 * 3. Fetch memories (private data)
 * 4. Generate or retrieve cached plan
 * 5. Save plan to database
 * 6. Return plan
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'
import { hasPremiumAccess } from '@/lib/premiumEntitlement'
import { generateRevealPlan, hashInput } from '@/lib/ai/revealPlanService'
import type { RevealPlanInput } from '@/lib/ai/types'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * POST /api/generate-reveal-plan
 *
 * Body:
 * {
 *   memorypopId: string,
 *   creatorToken: string
 * }
 *
 * Returns:
 * {
 *   success: boolean,
 *   plan: RevealPlan,
 *   source: 'ai_generated' | 'deterministic_fallback' | 'cached',
 *   fromCache: boolean
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    const { memorypopId, creatorToken } = body

    if (!memorypopId || !creatorToken) {
      return NextResponse.json(
        { error: 'Missing memorypopId or creatorToken' },
        { status: 400 }
      )
    }

    // 1. Verify creator authorization
    const { data: memoryPop, error: memoryPopError } = await supabaseServer
      .from('memorypops')
      .select('id, creator_token, is_premium, recipient_name, occasion, mood')
      .eq('id', memorypopId)
      .single()

    if (memoryPopError || !memoryPop) {
      return NextResponse.json(
        { error: 'MemoryPop not found' },
        { status: 404 }
      )
    }

    // Verify creator token
    if (memoryPop.creator_token !== creatorToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. Check Plus entitlement
    if (!hasPremiumAccess(memoryPop)) {
      return NextResponse.json(
        { error: 'Plus entitlement required' },
        { status: 403 }
      )
    }

    // 3. Fetch memories (private contributor data)
    const { data: memories, error: memoriesError } = await supabaseServer
      .from('memories')
      .select('id, contributor_name, message, created_at, photos, gifs, video')
      .eq('memorypop_id', memorypopId)
      .order('created_at', { ascending: false })

    if (memoriesError) {
      return NextResponse.json(
        { error: 'Failed to fetch memories' },
        { status: 500 }
      )
    }

    if (!memories || memories.length === 0) {
      return NextResponse.json(
        { error: 'No memories to plan' },
        { status: 400 }
      )
    }

    // Convert to MemoryMetadata format
    const memoryMetadata = memories.map(m => ({
      id: m.id,
      contributorName: m.contributor_name,
      message: m.message,
      photoCount: (m.photos as any[] || []).length,
      gifCount: (m.gifs as any[] || []).length,
      videoDuration: m.video ? ((m.video as any).duration_seconds || 0) : 0,
      createdAt: new Date(m.created_at),
    }))

    // Build input
    const input: RevealPlanInput = {
      memoryPopId: memorypopId,
      recipientName: memoryPop.recipient_name,
      occasion: memoryPop.occasion,
      tone: memoryPop.mood || 'warm',
      story: `A celebration for ${memoryPop.recipient_name}`,
      memories: memoryMetadata,
    }

    const inputHash = hashInput(input)

    // 4. Check for existing valid plan
    const { data: existingPlan } = await supabaseServer
      .from('ai_reveal_plans')
      .select('*')
      .eq('memorypop_id', memorypopId)
      .eq('input_hash', inputHash)
      .single()

    if (existingPlan) {
      // Valid cached plan exists
      return NextResponse.json({
        success: true,
        plan: existingPlan.plan,
        source: existingPlan.generation_source,
        fromCache: true,
      })
    }

    // 5. Generate new plan
    const result = await generateRevealPlan(input)

    // 6. Save plan to database
    const { error: saveError } = await supabaseServer
      .from('ai_reveal_plans')
      .upsert({
        memorypop_id: memorypopId,
        plan: result.plan,
        model_name: result.modelName || 'deterministic',
        model_provider: result.modelProvider || 'internal',
        schema_version: 'v1',
        prompt_version: 'v1',
        input_snapshot: {
          occasion: input.occasion,
          tone: input.tone,
          memoryIds: input.memories.map(m => m.id),
          messages: input.memories.map(m => m.message),
        },
        input_hash: inputHash,
        generation_source: result.source,
        generation_error: result.error || null,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'memorypop_id',
      })

    if (saveError) {
      console.error('Failed to save reveal plan:', saveError)
      // Continue - plan was generated successfully
    }

    return NextResponse.json({
      success: true,
      plan: result.plan,
      source: result.source,
      fromCache: false,
    })

  } catch (error) {
    console.error('Generate reveal plan error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
