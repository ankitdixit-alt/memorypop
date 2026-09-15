/**
 * Mock Reveal Planner - Deterministic AI Director Preview
 *
 * IMPORTANT: This is a MOCK implementation for local development preview only.
 * - Makes NO Gemini API calls
 * - Uses NO API keys
 * - Generates deterministic output based on documented experiment results
 * - BLOCKED in production (throws error)
 *
 * Purpose: Visualize AI Director experiment results in browser
 * Data source: Rule-based logic matching AI-DIRECTOR-EXPERIMENT-RESULTS.md
 */

import type { RevealPlan, Chapter, MemoryMetadata } from './types'
import { getExperimentStructure } from '@/data/ai-experiments/experimentResults'

/**
 * Production guard - throw if called in production
 */
function validateDevEnvironment() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'BLOCKED: Mock reveal planner is for development preview only. ' +
      'This function must never be called in production.'
    )
  }
}

/**
 * Generate deterministic mock reveal plan
 *
 * @param memories - Synthetic fixture memories
 * @param occasion - Occasion type (birthday, retirement, anniversary, sympathy)
 * @param variant - 'test-a' (no instructions) or 'test-b' (with instructions)
 * @returns Deterministic RevealPlan matching documented experiment results
 */
export function generateMockRevealPlan(
  memories: MemoryMetadata[],
  occasion: string,
  variant: 'test-a' | 'test-b'
): RevealPlan {
  validateDevEnvironment()

  const structure = getExperimentStructure(occasion)
  if (!structure) {
    throw new Error(`No experiment structure found for occasion: ${occasion}`)
  }

  const config = variant === 'test-a' ? structure.testA : structure.testB

  // Build chapters using pattern matching
  const chapters: Chapter[] = config.chapters.map(chapterConfig => {
    const matchingMemories = memories.filter(memory =>
      matchesPattern(memory, chapterConfig.contributorPattern)
    )
    return {
      title: chapterConfig.title,
      memoryIds: matchingMemories.map(m => m.id)
    }
  })

  // Ensure all memories are included (add unmatched to last chapter)
  const allAssignedIds = new Set(chapters.flatMap(ch => ch.memoryIds))
  const unassignedMemories = memories.filter(m => !allAssignedIds.has(m.id))
  if (unassignedMemories.length > 0 && chapters.length > 0) {
    chapters[chapters.length - 1].memoryIds.push(...unassignedMemories.map(m => m.id))
  }

  // Select highlights using pattern matching
  const highlights = memories
    .filter(memory => matchesPattern(memory, config.highlightPattern))
    .slice(0, 3)
    .map(m => m.id)

  // Select finale using pattern matching
  const finaleMemory = memories.find(memory =>
    matchesPattern(memory, config.finalePattern)
  )
  const finaleMemoryId = finaleMemory?.id || memories[memories.length - 1].id

  return {
    opening: config.opening,
    chapters,
    highlightMemoryIds: highlights,
    finaleMemoryId,
    reasoningSummary: generateReasoning(occasion, variant, chapters.length)
  }
}

/**
 * Generate Standard chronological reveal plan (baseline)
 */
export function generateStandardRevealPlan(
  memories: MemoryMetadata[],
  occasion: string
): RevealPlan {
  validateDevEnvironment()

  // Sort by createdAt DESC (most recent first)
  const sorted = [...memories].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  )

  return {
    opening: getStandardOpening(occasion),
    chapters: [
      {
        title: 'Memories',
        memoryIds: sorted.map(m => m.id)
      }
    ],
    highlightMemoryIds: [],
    finaleMemoryId: sorted[sorted.length - 1].id,
    reasoningSummary: 'Standard chronological ordering (createdAt DESC). No AI curation.'
  }
}

/**
 * Pattern matching helper
 * Checks if contributor name or message matches the pattern
 */
function matchesPattern(memory: MemoryMetadata, pattern: string): boolean {
  const regex = new RegExp(pattern, 'i')
  return regex.test(memory.contributorName.toLowerCase()) ||
         regex.test(memory.message.toLowerCase())
}

/**
 * Generate reasoning summary for mock plan
 */
function generateReasoning(
  occasion: string,
  variant: 'test-a' | 'test-b',
  chapterCount: number
): string {
  if (variant === 'test-a') {
    return `Mock AI Director output for ${occasion} (Test A - no creator instructions). ` +
           `Generated ${chapterCount} thematic chapters using documented experiment structure. ` +
           `This is deterministic output matching AI-DIRECTOR-EXPERIMENT-RESULTS.md.`
  } else {
    return `Mock AI Director output for ${occasion} (Test B - with creator instructions). ` +
           `Applied creator guidance to sequence memories. ` +
           `Generated ${chapterCount} chapters with instruction-guided structure. ` +
           `This is deterministic output matching AI-DIRECTOR-EXPERIMENT-RESULTS.md.`
  }
}

/**
 * Standard opening text by occasion
 */
function getStandardOpening(occasion: string): string {
  switch (occasion.toLowerCase()) {
    case 'birthday':
      return 'Happy Birthday! Your friends and family have shared their favorite memories with you.'
    case 'retirement':
    case 'farewell':
      return 'Congratulations on your retirement! Your colleagues have shared messages to celebrate your career.'
    case 'anniversary':
      return 'Happy Anniversary! Celebrate your love story with messages from friends and family.'
    case 'sympathy':
      return 'With deepest sympathy. These messages honor a life well-lived and the love that endures.'
    default:
      return 'Your friends and family have shared special memories with you.'
  }
}

/**
 * Calculate position differences between two reveal plans
 * Returns percentage of positions that differ
 */
export function calculateDifference(plan1: RevealPlan, plan2: RevealPlan): number {
  const ids1 = plan1.chapters.flatMap(ch => ch.memoryIds)
  const ids2 = plan2.chapters.flatMap(ch => ch.memoryIds)

  if (ids1.length !== ids2.length) {
    return 100 // Different lengths = 100% different
  }

  let differences = 0
  for (let i = 0; i < ids1.length; i++) {
    if (ids1[i] !== ids2[i]) {
      differences++
    }
  }

  return Math.round((differences / ids1.length) * 100)
}
