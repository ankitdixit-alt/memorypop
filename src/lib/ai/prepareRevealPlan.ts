/**
 * Reveal Plan Preparation Service
 *
 * Server-side service for preparing AI reveal plans.
 * Handles authorization, Plus entitlement, generation, validation, and persistence.
 *
 * IMPORTANT: This is a server-only module. Never import in client components.
 */

import { supabaseServer } from '@/lib/supabaseServer'
import { hasPremiumAccess } from '@/lib/premiumEntitlement'
import { generateRevealPlan, hashInput } from './revealPlanService'
import { validateRevealPlan } from './validation'
import type { RevealPlan, MemoryMetadata, RevealPlanInput } from './types'

export interface PreparationResult {
  success: boolean
  plan?: RevealPlan
  source: 'ai_generated' | 'deterministic_fallback' | 'cached'
  fromCache: boolean
  error?: string
}

interface PreparationOptions {
  creatorToken: string
  memorypopId: string
  forceRegenerate?: boolean
}

/**
 * Configuration for lock acquisition and worker expiration
 */
const LOCK_CONFIG = {
  // Lock expires after 60 seconds (protects against crashed workers)
  lockDurationMs: 60000,
  // Wait up to 10 seconds for another worker to finish
  maxWaitMs: 10000,
  // Check every 500ms if lock is available
  pollIntervalMs: 500,
} as const

/**
 * Generate unique worker ID for this generation attempt
 */
function generateWorkerId(): string {
  return `worker-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

interface LockAcquisitionResult {
  acquired: boolean
  cached?: boolean
  plan?: RevealPlan
  source?: 'ai_generated' | 'deterministic_fallback'
  workerId?: string
  version?: number
}

/**
 * Try to acquire generation lock for a memorypop
 *
 * Strategy:
 * 1. Check for existing valid cached plan (return immediately)
 * 2. Try to claim the lock atomically
 * 3. If locked by another worker:
 *    - Wait briefly for them to finish
 *    - Check if they completed (reuse their result)
 *    - If lock expired, take over
 * 4. Return lock acquisition result
 *
 * IMPORTANT: Does NOT modify input_hash or plan during lock acquisition.
 * Those are only set when saving the validated result.
 */
async function acquireGenerationLock(
  memorypopId: string,
  currentInputHash: string,
  currentMemories: MemoryMetadata[],
  forceRegenerate: boolean
): Promise<LockAcquisitionResult> {
  const workerId = generateWorkerId()
  const lockExpiresAt = new Date(Date.now() + LOCK_CONFIG.lockDurationMs)
  const giveUpAt = Date.now() + LOCK_CONFIG.maxWaitMs

  while (Date.now() < giveUpAt) {
    const { data: existingPlan } = await supabaseServer
      .from('ai_reveal_plans')
      .select('*')
      .eq('memorypop_id', memorypopId)
      .single()

    // Case 1: No plan exists yet - insert with our lock (but no plan data yet)
    if (!existingPlan) {
      const { data: inserted, error: insertError } = await supabaseServer
        .from('ai_reveal_plans')
        .insert({
          memorypop_id: memorypopId,
          plan: null, // No plan yet - pending generation
          model_name: 'pending',
          model_provider: 'pending',
          input_snapshot: null,
          input_hash: '', // Will be set when plan is saved
          generation_source: 'deterministic_fallback',
          generation_version: 1,
          generation_lock_holder: workerId,
          generation_lock_acquired_at: new Date().toISOString(),
          generation_lock_expires_at: lockExpiresAt.toISOString()
        })
        .select()
        .single()

      if (!insertError && inserted) {
        return { acquired: true, workerId, version: 1 }
      }

      // Another worker inserted first, retry
      await new Promise(resolve => setTimeout(resolve, LOCK_CONFIG.pollIntervalMs))
      continue
    }

    // Case 2: Valid cached plan with matching input hash
    if (!forceRegenerate && existingPlan.input_hash === currentInputHash) {
      // Verify it's actually valid and complete (not pending)
      if (
        existingPlan.plan &&
        typeof existingPlan.plan === 'object' &&
        existingPlan.model_name !== 'pending'
      ) {
        // Full validation before reusing
        const validation = validateRevealPlan(existingPlan.plan as RevealPlan, currentMemories)
        if (validation.valid) {
          return {
            acquired: false,
            cached: true,
            plan: existingPlan.plan as RevealPlan,
            source: existingPlan.generation_source as 'ai_generated' | 'deterministic_fallback'
          }
        }
        // Invalid cached plan - will regenerate
        console.log('[LOCK] Cached plan invalid, will regenerate:', validation.errors)
      }
    }

    // Case 3: Lock expired or no lock holder - try to take over
    // Use database time comparison for expiry check
    const lockExpired = existingPlan.generation_lock_expires_at
      ? new Date(existingPlan.generation_lock_expires_at) < new Date()
      : true // No expiry = no lock

    if (lockExpired || !existingPlan.generation_lock_holder) {
      const nextVersion = (existingPlan.generation_version || 0) + 1

      // Atomic lock acquisition with row count verification
      const { data: updated, error: updateError } = await supabaseServer
        .from('ai_reveal_plans')
        .update({
          generation_version: nextVersion,
          generation_lock_holder: workerId,
          generation_lock_acquired_at: new Date().toISOString(),
          generation_lock_expires_at: lockExpiresAt.toISOString()
          // NOTE: Do NOT update input_hash here - only when saving final plan
        })
        .eq('memorypop_id', memorypopId)
        .eq('generation_version', existingPlan.generation_version) // Optimistic lock
        .select()

      // Verify exactly one row was updated
      if (!updateError && updated && updated.length === 1) {
        return { acquired: true, workerId, version: nextVersion }
      }

      // Another worker grabbed it first (or version changed), retry
      await new Promise(resolve => setTimeout(resolve, LOCK_CONFIG.pollIntervalMs))
      continue
    }

    // Case 4: Another worker holds active lock - wait for them
    await new Promise(resolve => setTimeout(resolve, LOCK_CONFIG.pollIntervalMs))
  }

  // Gave up waiting
  return { acquired: false }
}

/**
 * Release generation lock safely
 *
 * Only clears lock if we still hold it (prevents clearing another worker's lock)
 */
async function releaseGenerationLock(
  memorypopId: string,
  workerId: string
): Promise<void> {
  const { data: updated } = await supabaseServer
    .from('ai_reveal_plans')
    .update({
      generation_lock_holder: null,
      generation_lock_acquired_at: null,
      generation_lock_expires_at: null
    })
    .eq('memorypop_id', memorypopId)
    .eq('generation_lock_holder', workerId) // Only clear if we still hold it
    .select()

  if (!updated || updated.length === 0) {
    // Lock was already released or taken by another worker - this is fine
    console.log('[LOCK] Lock already released or taken by another worker')
  }
}

interface WriteResult {
  success: boolean
  error?: string
}

/**
 * Write generation result with atomic checks
 *
 * Atomically publishes validated plan with matching input hash.
 * Uses raw SQL function for atomic checks with database time.
 *
 * Prevents stale writes by verifying:
 * - Version matches expected
 * - We still hold the lock
 * - Lock hasn't expired (using database NOW())
 * - Input hash matches current (content freshness)
 * - Exactly one row is updated
 */
async function writeGenerationResult(
  memorypopId: string,
  workerId: string,
  expectedVersion: number,
  expectedInputHash: string,
  input: RevealPlanInput,
  generationResult: Awaited<ReturnType<typeof generateRevealPlan>>
): Promise<WriteResult> {
  // Use RPC function for atomic checks with database time
  // This ensures lock expiry check uses database NOW(), not client time
  const { data: result, error: rpcError } = await supabaseServer
    .rpc('publish_reveal_plan', {
      p_memorypop_id: memorypopId,
      p_worker_id: workerId,
      p_expected_version: expectedVersion,
      p_expected_input_hash: expectedInputHash,
      p_plan: generationResult.plan as any,
      p_model_name: generationResult.modelName || 'deterministic',
      p_model_provider: generationResult.modelProvider || 'internal',
      p_input_snapshot: {
        occasion: input.occasion,
        memoryIds: input.memories.map(m => m.id),
        messages: input.memories.map(m => m.message)
      } as any,
      p_input_hash: expectedInputHash,
      p_generation_source: generationResult.source,
      p_generation_error: generationResult.error || null
    })

  if (rpcError) {
    console.error('[PREPARE] Write failed with RPC error:', rpcError)
    return {
      success: false,
      error: 'Database error during write'
    }
  }

  // Result codes:
  // 'success': Plan published successfully
  // 'version_mismatch': Another worker published a newer version
  // 'lock_lost': We no longer hold the lock
  // 'lock_expired': Lock expired (checked using database NOW())
  // 'input_changed': Input hash doesn't match (memories/occasion changed)

  if (result === 'success') {
    return { success: true }
  }

  console.error('[PREPARE] Write rejected:', result)
  return {
    success: false,
    error: result === 'version_mismatch' ? 'Version conflict: newer generation completed' :
           result === 'lock_expired' ? 'Lock expired before publish' :
           result === 'input_changed' ? 'Input changed during generation' :
           'Lock lost or invalid state'
  }
}

/**
 * Prepare reveal plan for a MemoryPop
 *
 * Authorization flow:
 * 1. Verify creator token matches memorypop.management_token_hash
 * 2. Check Plus entitlement via hasPremiumAccess()
 * 3. Generate or retrieve cached plan
 * 4. Validate and persist
 *
 * Preparation state:
 * - Bounded operation with timeout
 * - Idempotent: safe to retry on already-ready gifts
 * - Concurrent-safe: uses input_hash to detect conflicts
 * - Recoverable: failed preparation can be retried
 *
 * @param options - Creator token, memorypopId, and optional force flag
 * @returns Preparation result with plan, source, and cache status
 */
export async function prepareRevealPlan(
  options: PreparationOptions
): Promise<PreparationResult> {
  const { creatorToken, memorypopId, forceRegenerate = false } = options

  try {
    // 1. Fetch MemoryPop and verify authorization
    const { data: memoryPop, error: fetchError } = await supabaseServer
      .from('memorypops')
      .select('id, recipient_name, occasion, management_token_hash, is_premium, status')
      .eq('id', memorypopId)
      .single()

    if (fetchError || !memoryPop) {
      return {
        success: false,
        source: 'deterministic_fallback',
        fromCache: false,
        error: 'MemoryPop not found'
      }
    }

    // 2. Verify creator authorization
    if (memoryPop.management_token_hash !== creatorToken) {
      return {
        success: false,
        source: 'deterministic_fallback',
        fromCache: false,
        error: 'Unauthorized: creator token mismatch'
      }
    }

    // 3. Check Plus entitlement
    if (!hasPremiumAccess(memoryPop)) {
      return {
        success: false,
        source: 'deterministic_fallback',
        fromCache: false,
        error: 'Plus entitlement required'
      }
    }

    // 4. Fetch memories
    const { data: memories, error: memoriesError } = await supabaseServer
      .from('memories')
      .select('id, contributor_name, message, photo_url, photos, gifs, video, created_at')
      .eq('memorypop_id', memorypopId)
      .order('created_at', { ascending: true })

    if (memoriesError || !memories || memories.length === 0) {
      return {
        success: false,
        source: 'deterministic_fallback',
        fromCache: false,
        error: 'No memories found'
      }
    }

    // 5. Convert memories to MemoryMetadata format
    const memoryMetadata: MemoryMetadata[] = memories.map(m => ({
      id: m.id,
      contributorName: m.contributor_name,
      message: m.message,
      photoCount: (m.photos?.length || 0) + (m.photo_url && !m.photo_url.endsWith('.gif') ? 1 : 0),
      gifCount: (m.gifs?.length || 0) + (m.photo_url?.endsWith('.gif') ? 1 : 0),
      videoDuration: m.video?.duration || 0,
      createdAt: new Date(m.created_at)
    }))

    // 6. Build input for plan generation
    const input: RevealPlanInput = {
      memoryPopId: memorypopId,
      recipientName: memoryPop.recipient_name || '',
      occasion: memoryPop.occasion || 'birthday',
      tone: 'warm', // Default tone (mood field not in schema)
      story: '', // Not used in generation
      memories: memoryMetadata
    }

    const inputHash = hashInput(input)

    // 7. Try to acquire generation lock or reuse existing plan
    const lockResult = await acquireGenerationLock(
      memorypopId,
      inputHash,
      memoryMetadata,
      forceRegenerate
    )

    if (lockResult.cached) {
      // Another worker finished while we waited, or cached plan is valid
      return {
        success: true,
        plan: lockResult.plan!,
        source: lockResult.source!,
        fromCache: true
      }
    }

    if (!lockResult.acquired) {
      // Failed to acquire lock after retries
      return {
        success: false,
        source: 'deterministic_fallback',
        fromCache: false,
        error: 'Generation already in progress by another worker'
      }
    }

    const { workerId, version } = lockResult

    try {
      // 8. Generate new plan (we now hold the lock)
      const generationResult = await generateRevealPlan(input)

      // 9. Validate generated plan
      const validation = validateRevealPlan(generationResult.plan, memoryMetadata)
      if (!validation.valid) {
        await releaseGenerationLock(memorypopId, workerId!)
        return {
          success: false,
          source: 'deterministic_fallback',
          fromCache: false,
          error: `Plan validation failed: ${validation.errors.join('; ')}`
        }
      }

      // 10. Persist with version check (prevents stale writes)
      const writeResult = await writeGenerationResult(
        memorypopId,
        workerId!,
        version!,
        inputHash,
        input,
        generationResult
      )

      if (!writeResult.success) {
        return {
          success: false,
          source: generationResult.source,
          fromCache: false,
          error: writeResult.error
        }
      }

      return {
        success: true,
        plan: generationResult.plan,
        source: generationResult.source,
        fromCache: false
      }
    } catch (error) {
      // Always release lock on error
      await releaseGenerationLock(memorypopId, workerId!)
      throw error
    }

  } catch (error) {
    console.error('[PREPARE] Preparation error:', error)
    return {
      success: false,
      source: 'deterministic_fallback',
      fromCache: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Load and validate reveal plan for recipient playback
 *
 * Never calls external AI providers - only retrieves from database.
 * Validates plan against current inputs to detect stale plans.
 *
 * @param memorypopId - MemoryPop ID
 * @param memories - Current memories for validation
 * @returns Valid plan or null
 */
export async function loadRevealPlan(
  memorypopId: string,
  memories: MemoryMetadata[]
): Promise<RevealPlan | null> {
  try {
    const { data: planData } = await supabaseServer
      .from('ai_reveal_plans')
      .select('plan, input_hash, generation_source, model_name')
      .eq('memorypop_id', memorypopId)
      .single()

    if (!planData) {
      return null
    }

    // Exclude pending plans (generation in progress)
    if (planData.model_name === 'pending') {
      console.log('[LOAD] Plan is pending generation')
      return null
    }

    // Type assertion with runtime validation
    const plan = planData.plan as unknown

    // Verify it matches RevealPlan structure
    if (
      !plan ||
      typeof plan !== 'object' ||
      !('chapters' in plan) ||
      !('finaleMemoryId' in plan) ||
      !('highlightMemoryIds' in plan)
    ) {
      console.error('[LOAD] Invalid plan structure')
      return null
    }

    const typedPlan = plan as RevealPlan

    // Validate against current memories (schema, memory IDs, etc.)
    const validation = validateRevealPlan(typedPlan, memories)
    if (!validation.valid) {
      console.error('[LOAD] Plan validation failed:', validation.errors)
      return null
    }

    return typedPlan

  } catch (error) {
    console.error('[LOAD] Failed to load plan:', error)
    return null
  }
}
