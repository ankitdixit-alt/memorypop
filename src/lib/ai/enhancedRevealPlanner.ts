/**
 * Enhanced Reveal Planner - For Cinematic AI Director Concept
 *
 * Generates extended reveal plans with:
 * - Chapter structure
 * - Pacing recommendations
 * - Decorative themes
 * - Opening/closing text
 *
 * DEVELOPMENT ONLY - uses deterministic mock logic
 */

import type { MemoryMetadata, RevealPlan, Chapter, DecorativeTheme } from './types'
import { getExperimentStructure } from '@/data/ai-experiments/experimentResults'
import { buildTransitionMap, inferEmotionalTone } from './transitionSelector'

function validateDevEnvironment() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('BLOCKED: Enhanced reveal planner is development-only')
  }
}

/**
 * Generate enhanced AI Director reveal plan for cinematic experience
 */
export function generateEnhancedRevealPlan(
  memories: MemoryMetadata[],
  occasion: string,
  recipientName: string
): RevealPlan {
  validateDevEnvironment()

  const structure = getExperimentStructure(occasion)
  if (!structure) {
    throw new Error(`No experiment structure for occasion: ${occasion}`)
  }

  const config = structure.testB // Use Test B (with creator instructions)

  // Build chapters with emotional tones
  const chapters: Chapter[] = config.chapters.map(chapterConfig => {
    const matchingMemories = memories.filter(memory =>
      matchesPattern(memory, chapterConfig.contributorPattern)
    )

    // Infer chapter emotional tone from memories
    const memoryTones = matchingMemories.map(m => inferEmotionalTone(m))
    const dominantTone = getMostCommonTone(memoryTones)

    return {
      title: chapterConfig.title,
      memoryIds: matchingMemories.map(m => m.id),
      description: getChapterDescription(chapterConfig.title, occasion),
      emotionalTone: dominantTone,
      pacing: 'normal' as const
    }
  })

  // Ensure all memories included
  const allAssignedIds = new Set(chapters.flatMap(ch => ch.memoryIds))
  const unassignedMemories = memories.filter(m => !allAssignedIds.has(m.id))
  if (unassignedMemories.length > 0 && chapters.length > 0) {
    chapters[chapters.length - 1].memoryIds.push(...unassignedMemories.map(m => m.id))
  }

  // Select highlights (adjust pacing to slower for emphasis)
  const highlights = memories
    .filter(memory => matchesPattern(memory, config.highlightPattern))
    .slice(0, 3)
    .map(m => m.id)

  // Adjust pacing for highlight chapters
  chapters.forEach(chapter => {
    const hasHighlight = chapter.memoryIds.some(id => highlights.includes(id))
    if (hasHighlight) {
      chapter.pacing = 'slow' // Slower pacing for chapters with highlights
    }
  })

  // Select finale
  const finaleMemory = memories.find(memory =>
    matchesPattern(memory, config.finalePattern)
  )
  const finaleMemoryId = finaleMemory?.id || memories[memories.length - 1].id

  // Decorative theme
  const decorativeTheme = getDecorativeTheme(occasion)

  // Build transition map
  const transitions = buildTransitionMap(memories, chapters, highlights, finaleMemoryId)

  return {
    opening: config.opening,
    openingTitle: getOpeningTitle(occasion, recipientName),
    chapters,
    highlightMemoryIds: highlights,
    finaleMemoryId,
    closingText: getClosingText(occasion, recipientName),
    reasoningSummary: `AI Director concept for ${occasion}. ${chapters.length} chapters, ${highlights.length} highlights, intentional finale.`,
    decorativeTheme,
    transitions
  }
}

function getMostCommonTone(tones: Array<'joyful' | 'heartfelt' | 'funny' | 'reflective' | 'celebratory'>): 'joyful' | 'heartfelt' | 'funny' | 'reflective' | 'celebratory' {
  if (tones.length === 0) return 'joyful'

  const counts: Record<string, number> = {}
  tones.forEach(tone => {
    counts[tone] = (counts[tone] || 0) + 1
  })

  let maxCount = 0
  let dominantTone: 'joyful' | 'heartfelt' | 'funny' | 'reflective' | 'celebratory' = 'joyful'

  Object.entries(counts).forEach(([tone, count]) => {
    if (count > maxCount) {
      maxCount = count
      dominantTone = tone as typeof dominantTone
    }
  })

  return dominantTone
}

function matchesPattern(memory: MemoryMetadata, pattern: string): boolean {
  const regex = new RegExp(pattern, 'i')
  return regex.test(memory.contributorName.toLowerCase()) ||
         regex.test(memory.message.toLowerCase())
}

function getChapterDescription(title: string, occasion: string): string {
  // Generate brief chapter descriptions
  const descriptions: Record<string, string> = {
    'Lifelong Bonds': 'The people who have known you longest',
    'Adventures and Laughter': 'Shared moments of joy and friendship',
    'Looking Forward': 'Wishes for your future',
    'Family Love': 'Love from those closest to you',
    'Fun and Friendship': 'Lighthearted memories and laughter',
    'Shared History': 'Years of memories together',
    'Leadership and Legacy': 'Your impact and influence',
    'Mentorship and Impact': 'Lives you have changed',
    'Friendship and Humor': 'Lighter moments and camaraderie',
    'Gratitude and Farewell': 'Thank you and goodbye',
    'Professional Excellence': 'Your career achievements',
    'Lighter Moments': 'Humor and levity',
    'Heartfelt Gratitude': 'Deep appreciation',
    'Love and Laughter': 'Joy and romance',
    'Partnership and Growth': 'Growing together',
    'Family Blessings': 'Family celebrating your love',
    'Love That Lasts': 'Enduring connection',
    'Community and Connection': 'Impact on others',
    'Memories and Love': 'Cherished moments',
    'Faith and Comfort': 'Spiritual support',
    'Community Impact': 'Lives touched',
    'Shared Memories': 'Time together',
    'Enduring Love': 'Love that continues'
  }

  return descriptions[title] || 'Special memories'
}

function getOpeningTitle(occasion: string, recipientName: string): string {
  switch (occasion.toLowerCase()) {
    case 'birthday':
      return `${recipientName}'s Birthday Story`
    case 'retirement':
    case 'farewell':
      return `${recipientName}'s Legacy`
    case 'anniversary':
      return `A Love Story`
    case 'sympathy':
      return `In Loving Memory`
    default:
      return `${recipientName}'s Story`
  }
}

function getClosingText(occasion: string, recipientName: string): string {
  switch (occasion.toLowerCase()) {
    case 'birthday':
      return `Happy Birthday, ${recipientName}. May this year bring you as much joy as you bring to others.`
    case 'retirement':
    case 'farewell':
      return `Thank you, ${recipientName}, for everything you've given. Your legacy lives on.`
    case 'anniversary':
      return `To many more years of love and happiness together.`
    case 'sympathy':
      return `May these memories bring comfort and peace. Love endures forever.`
    default:
      return `With love and gratitude.`
  }
}

function getDecorativeTheme(occasion: string): DecorativeTheme {
  switch (occasion.toLowerCase()) {
    case 'birthday':
      return {
        name: 'birthday_celebration',
        elements: ['confetti', 'balloons'],
        intensity: 'subtle'
      }
    case 'retirement':
    case 'farewell':
      return {
        name: 'journey_celebration',
        elements: ['stars', 'travel'],
        intensity: 'subtle'
      }
    case 'anniversary':
      return {
        name: 'romance',
        elements: ['hearts', 'flowers'],
        intensity: 'subtle'
      }
    case 'sympathy':
      return {
        name: 'remembrance',
        elements: [], // No decorations for sympathy
        intensity: 'subtle'
      }
    default:
      return {
        name: 'celebration',
        elements: ['sparkles'],
        intensity: 'subtle'
      }
  }
}
