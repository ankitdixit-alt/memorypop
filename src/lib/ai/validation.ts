/**
 * Reveal Plan Validation
 *
 * Validates that a RevealPlan is structurally sound and includes all input memories.
 * Production-capable - no development guards.
 */

import type { RevealPlan, MemoryMetadata } from './types'

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

/**
 * Validate a reveal plan against input memories
 *
 * Checks:
 * - All input memory IDs appear exactly once in chapters
 * - No unknown or invented memory IDs
 * - Finale memory ID exists in input
 * - At least one chapter exists
 * - No empty chapters
 * - Chapter titles are unique
 * - Finale memory appears in plan
 */
export function validateRevealPlan(
  plan: RevealPlan,
  inputMemories: MemoryMetadata[]
): ValidationResult {
  const errors: string[] = []
  const inputIds = new Set(inputMemories.map(m => m.id))

  // Check at least one chapter
  if (!plan.chapters || plan.chapters.length === 0) {
    errors.push('Plan must contain at least one chapter')
  }

  // Collect all memory IDs from chapters
  const planIds: string[] = []
  const chapterTitles = new Set<string>()

  for (const [index, chapter] of plan.chapters.entries()) {
    // Check chapter has title
    if (!chapter.title || chapter.title.trim() === '') {
      errors.push(`Chapter ${index + 1} is missing a title`)
    }

    // Check chapter title uniqueness
    if (chapterTitles.has(chapter.title)) {
      errors.push(`Duplicate chapter title: "${chapter.title}"`)
    }
    chapterTitles.add(chapter.title)

    // Check chapter has memories
    if (!chapter.memoryIds || chapter.memoryIds.length === 0) {
      errors.push(`Chapter "${chapter.title}" has no memories`)
    }

    // Collect all memory IDs
    planIds.push(...chapter.memoryIds)
  }

  // Check for unknown memory IDs (invented or invalid)
  const unknownIds = planIds.filter(id => !inputIds.has(id))
  if (unknownIds.length > 0) {
    errors.push(`Plan contains unknown memory IDs: ${unknownIds.join(', ')}`)
  }

  // Check for duplicate placements (same memory in multiple chapters)
  const duplicates = planIds.filter((id, index) => planIds.indexOf(id) !== index)
  if (duplicates.length > 0) {
    errors.push(`Plan contains duplicate memory placements: ${duplicates.join(', ')}`)
  }

  // Check for missing memories (input memories not included in plan)
  const planIdSet = new Set(planIds)
  const missingIds = Array.from(inputIds).filter(id => !planIdSet.has(id))
  if (missingIds.length > 0) {
    errors.push(`Plan is missing required memories: ${missingIds.join(', ')}`)
  }

  // Check finale memory exists
  if (!plan.finaleMemoryId) {
    errors.push('Plan is missing finale memory ID')
  } else if (!inputIds.has(plan.finaleMemoryId)) {
    errors.push(`Finale memory ID "${plan.finaleMemoryId}" is not in input memories`)
  } else if (!planIdSet.has(plan.finaleMemoryId)) {
    errors.push(`Finale memory ID "${plan.finaleMemoryId}" is not included in any chapter`)
  }

  // Check highlight memories exist
  if (plan.highlightMemoryIds) {
    const invalidHighlights = plan.highlightMemoryIds.filter(id => !inputIds.has(id))
    if (invalidHighlights.length > 0) {
      errors.push(`Plan contains invalid highlight memory IDs: ${invalidHighlights.join(', ')}`)
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Ensure a reveal plan is valid, throwing if not
 */
export function assertValidRevealPlan(
  plan: RevealPlan,
  inputMemories: MemoryMetadata[]
): void {
  const result = validateRevealPlan(plan, inputMemories)
  if (!result.valid) {
    throw new Error(`Invalid reveal plan:\n${result.errors.join('\n')}`)
  }
}
