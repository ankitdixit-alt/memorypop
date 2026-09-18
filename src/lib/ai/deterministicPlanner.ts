/**
 * Deterministic Reveal Planner - Production Capable
 *
 * Generates reveal plans using predictable rules based on occasion and metadata.
 * NO development guards - this is production-capable.
 * Works with arbitrary valid contribution data.
 *
 * Key properties:
 * - Deterministic: same input → same output
 * - Complete: includes all contributions exactly once
 * - Graceful: handles edge cases (empty, one contribution, ties)
 * - Honest: doesn't invent relationships or rewrite messages
 */

import type { RevealPlan, RevealPlanInput, MemoryMetadata, Chapter } from './types'
import { validateRevealPlan, assertValidRevealPlan } from './validation'

/**
 * Generate a deterministic reveal plan
 *
 * Uses predictable rules:
 * - Chronological baseline (newest first, Standard behavior)
 * - Finale selection prioritizes: family → emotional keywords → longest message → last chronological
 * - Chapter grouping based on occasion (2-3 chapters for meaningful structure)
 * - Stable ordering for tied timestamps
 */
export function generateDeterministicRevealPlan(
  input: RevealPlanInput
): RevealPlan {
  const { occasion, recipientName, memories } = input

  // Handle empty collection
  if (memories.length === 0) {
    return {
      opening: getOpeningText(occasion, recipientName),
      chapters: [{
        title: 'Memories',
        memoryIds: []
      }],
      highlightMemoryIds: [],
      finaleMemoryId: '',
      reasoningSummary: 'Empty collection - no memories to arrange',
      openingTitle: getOccasionTitle(occasion),
      closingText: getClosingText(occasion, recipientName)
    }
  }

  // Sort chronologically (newest first), with stable tie-breaking by ID
  const sorted = [...memories].sort((a, b) => {
    const timeDiff = b.createdAt.getTime() - a.createdAt.getTime()
    if (timeDiff !== 0) return timeDiff
    // Stable tie-breaker: alphabetical by ID
    return a.id.localeCompare(b.id)
  })

  // Select finale
  const finaleMemoryId = selectFinale(sorted, occasion)

  // Generate chapters
  const chapters = generateChapters(sorted, occasion, finaleMemoryId)

  // Select highlights (optional visual emphasis)
  const highlightMemoryIds = selectHighlights(sorted, finaleMemoryId)

  const plan: RevealPlan = {
    opening: getOpeningText(occasion, recipientName),
    chapters,
    highlightMemoryIds,
    finaleMemoryId,
    reasoningSummary: `Deterministic planner: ${memories.length} memories arranged in ${chapters.length} chapters for ${occasion}`,
    openingTitle: getOccasionTitle(occasion),
    closingText: getClosingText(occasion, recipientName)
  }

  // Validate before returning
  assertValidRevealPlan(plan, memories)

  return plan
}

/**
 * Select finale memory
 *
 * Priority order:
 * 1. Family members (mom, dad, parents, family keywords)
 * 2. Messages with emotional keywords (love, proud, grateful, cherish, blessed)
 * 3. Longest message (likely most heartfelt)
 * 4. Last chronological (fallback)
 */
function selectFinale(
  sortedMemories: MemoryMetadata[],
  occasion: string
): string {
  if (sortedMemories.length === 0) return ''
  if (sortedMemories.length === 1) return sortedMemories[0].id

  const familyPatterns = /\b(mom|dad|parent|mother|father|family|grandma|grandpa|grandmother|grandfather)\b/i
  const emotionalPatterns = /\b(love|proud|grateful|cherish|blessed|honor|treasure|admire|inspire)\b/i

  // For sympathy, prioritize closest relationships
  if (occasion === 'sympathy') {
    const closeRelationship = sortedMemories.find(m =>
      /\b(husband|wife|son|daughter|child|children|spouse|partner)\b/i.test(m.contributorName) ||
      /\b(husband|wife|son|daughter|child|children|spouse|partner)\b/i.test(m.message)
    )
    if (closeRelationship) return closeRelationship.id
  }

  // Check for family member
  const familyMemory = sortedMemories.find(m =>
    familyPatterns.test(m.contributorName) ||
    familyPatterns.test(m.message)
  )
  if (familyMemory) return familyMemory.id

  // Check for emotional message
  const emotionalMemory = sortedMemories.find(m =>
    emotionalPatterns.test(m.message)
  )
  if (emotionalMemory) return emotionalMemory.id

  // Select longest message (tie-breaker: first in chronological order)
  const longest = sortedMemories.reduce((max, m) =>
    m.message.length > max.message.length ? m : max
  , sortedMemories[0])

  return longest.id
}

/**
 * Generate chapters based on occasion
 *
 * Uses 2-3 chapter structure for meaningful grouping:
 * - Birthday: Past/Present/Future or Friends/Family
 * - Anniversary: Beginning/Journey/Future
 * - Retirement: Career/Personal/Gratitude
 * - Sympathy: Life/Memories/Comfort
 *
 * For single contribution, uses one chapter.
 * For 2-4 contributions, uses 2 chapters.
 * For 5+ contributions, uses 3 chapters.
 */
function generateChapters(
  sortedMemories: MemoryMetadata[],
  occasion: string,
  finaleId: string
): Chapter[] {
  const count = sortedMemories.length

  // Single contribution: one chapter
  if (count === 1) {
    return [{
      title: getChapterTitle(occasion, 0, 1),
      memoryIds: [sortedMemories[0].id]
    }]
  }

  // 2-4 contributions: two chapters
  if (count <= 4) {
    const midpoint = Math.ceil(count / 2)
    return [
      {
        title: getChapterTitle(occasion, 0, 2),
        memoryIds: sortedMemories.slice(0, midpoint).map(m => m.id)
      },
      {
        title: getChapterTitle(occasion, 1, 2),
        memoryIds: sortedMemories.slice(midpoint).map(m => m.id)
      }
    ]
  }

  // 5+ contributions: three chapters
  // Move finale to last chapter if not already there
  const finaleIndex = sortedMemories.findIndex(m => m.id === finaleId)
  let reordered = [...sortedMemories]

  if (finaleIndex !== -1 && finaleIndex < count - Math.ceil(count / 3)) {
    // Remove finale from current position
    const finale = reordered.splice(finaleIndex, 1)[0]
    // Add to end
    reordered.push(finale)
  }

  const firstThird = Math.ceil(count / 3)
  const secondThird = firstThird + Math.ceil((count - firstThird) / 2)

  return [
    {
      title: getChapterTitle(occasion, 0, 3),
      memoryIds: reordered.slice(0, firstThird).map(m => m.id)
    },
    {
      title: getChapterTitle(occasion, 1, 3),
      memoryIds: reordered.slice(firstThird, secondThird).map(m => m.id)
    },
    {
      title: getChapterTitle(occasion, 2, 3),
      memoryIds: reordered.slice(secondThird).map(m => m.id)
    }
  ]
}

/**
 * Get chapter title by occasion and position
 */
function getChapterTitle(occasion: string, index: number, totalChapters: number): string {
  const occ = occasion.toLowerCase()

  if (totalChapters === 1) {
    return 'Memories'
  }

  if (totalChapters === 2) {
    if (occ === 'birthday') {
      return index === 0 ? 'Celebrations and Laughter' : 'Love from Your People'
    }
    if (occ === 'anniversary') {
      return index === 0 ? 'The Journey Together' : 'Looking Forward'
    }
    if (occ === 'retirement') {
      return index === 0 ? 'Your Impact' : 'Gratitude and Farewell'
    }
    if (occ === 'sympathy') {
      return index === 0 ? 'A Life Remembered' : 'Words of Comfort'
    }
    return index === 0 ? 'Earlier Memories' : 'Recent Memories'
  }

  // Three chapters
  if (occ === 'birthday') {
    if (index === 0) return 'Adventures and Fun'
    if (index === 1) return 'Growing Together'
    return 'Always in Your Corner'
  }

  if (occ === 'anniversary') {
    if (index === 0) return 'How It Began'
    if (index === 1) return 'Building a Life'
    return 'Forever and Always'
  }

  if (occ === 'retirement') {
    if (index === 0) return 'Your Legacy'
    if (index === 1) return 'Beyond the Job'
    return 'Thank You'
  }

  if (occ === 'sympathy') {
    if (index === 0) return 'A Life That Touched Others'
    if (index === 1) return 'Cherished Moments'
    return 'Here With You'
  }

  // Generic fallback
  if (index === 0) return 'Early Memories'
  if (index === 1) return 'More Memories'
  return 'Recent Memories'
}

/**
 * Select highlights (optional visual emphasis)
 *
 * Highlights memories with:
 * - Rich media (multiple photos or video)
 * - Emotional keywords
 * - Family relationships
 *
 * Excludes finale (already emphasized).
 * Returns up to 2 highlights.
 */
function selectHighlights(
  sortedMemories: MemoryMetadata[],
  finaleId: string
): string[] {
  const candidates = sortedMemories.filter(m => m.id !== finaleId)
  if (candidates.length === 0) return []

  const emotionalPatterns = /\b(love|proud|grateful|cherish|blessed|honor|treasure)\b/i
  const familyPatterns = /\b(mom|dad|parent|family|grandma|grandpa)\b/i

  // Score each memory for highlight worthiness
  const scored = candidates.map(m => ({
    id: m.id,
    score:
      (m.photoCount >= 3 ? 2 : 0) + // Rich media
      (m.videoDuration ? 2 : 0) + // Has video
      (emotionalPatterns.test(m.message) ? 1 : 0) + // Emotional
      (familyPatterns.test(m.contributorName) || familyPatterns.test(m.message) ? 1 : 0) // Family
  }))

  // Sort by score (descending), then by original order (stable)
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return candidates.findIndex(m => m.id === a.id) - candidates.findIndex(m => m.id === b.id)
  })

  // Return top 2 with score > 0
  return scored.filter(s => s.score > 0).slice(0, 2).map(s => s.id)
}

/**
 * Get opening text by occasion
 */
function getOpeningText(occasion: string, recipientName: string): string {
  const name = recipientName?.trim()
  const occ = occasion.toLowerCase()

  if (occ === 'birthday') {
    return name
      ? `Happy birthday, ${name}! Your friends and family have come together to celebrate you.`
      : 'Happy birthday! Your friends and family have come together to celebrate you.'
  }

  if (occ === 'anniversary') {
    return name
      ? `${name}, your journey together is celebrated here through the eyes of those who love you both.`
      : 'Your journey together is celebrated here through the eyes of those who love you both.'
  }

  if (occ === 'retirement') {
    return name
      ? `${name}, your colleagues and friends share what your years of dedication have meant to them.`
      : 'Your colleagues and friends share what your years of dedication have meant to them.'
  }

  if (occ === 'sympathy') {
    return name
      ? `${name}, these memories honor a life that touched so many hearts.`
      : 'These memories honor a life that touched so many hearts.'
  }

  return name
    ? `${name}, these special memories have been gathered for you.`
    : 'These special memories have been gathered for you.'
}

/**
 * Get occasion title for opening card
 */
function getOccasionTitle(occasion: string): string {
  const occ = occasion.toLowerCase()
  if (occ === 'birthday') return 'Made with Love'
  if (occ === 'anniversary') return 'Made with Love'
  if (occ === 'retirement' || occ === 'farewell') return 'Made with Gratitude'
  if (occ === 'sympathy') return 'Shared with Love'
  return 'Made for You'
}

/**
 * Get closing text by occasion
 */
function getClosingText(occasion: string, recipientName: string): string {
  const name = recipientName?.trim()
  const occ = occasion.toLowerCase()

  if (occ === 'birthday') {
    return name
      ? `Happy birthday, ${name}.`
      : 'Happy birthday.'
  }

  if (occ === 'anniversary') {
    return name
      ? `${name}, here's to many more years together.`
      : "Here's to many more years together."
  }

  if (occ === 'retirement') {
    return name
      ? `Thank you for everything, ${name}.`
      : 'Thank you for everything.'
  }

  if (occ === 'sympathy') {
    return 'These memories are here for you.'
  }

  return name
    ? `Thank you, ${name}.`
    : 'Thank you.'
}
