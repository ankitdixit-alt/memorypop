/**
 * Reveal Plan Adapter
 *
 * Converts validated RevealPlan to the Story format used by the preview renderer.
 * Handles memory lookup, asset generation, and structure mapping.
 */

import type { RevealPlan, MemoryMetadata } from './types'
import type { Story, Contribution, Chapter as PreviewChapter, Asset, Occasion } from '../../app/ai-director-reveal/prototype'

export interface AdapterInput {
  plan: RevealPlan
  memories: MemoryMetadata[]
  occasion: Occasion
  recipientName: string
  mediaUrlGenerator: (memory: MemoryMetadata, assetType: 'photo' | 'gif' | 'video', index: number) => string
  photoPosterGenerator?: (photoUrl: string) => string
  gifPosterGenerator?: (gifUrl: string) => string
}

/**
 * Convert RevealPlan to Story format for preview renderer
 *
 * Maps:
 * - RevealPlan.chapters → Story.chapters (with subtitle generation)
 * - RevealPlan.finaleMemoryId → Story.finale
 * - RevealPlan.highlightMemoryIds → Story.highlights
 * - MemoryMetadata[] → Contribution[] (with asset URLs)
 */
export function adaptRevealPlanToStory(input: AdapterInput): Story {
  const { plan, memories, occasion, recipientName, mediaUrlGenerator } = input

  // Build memory lookup
  const memoryMap = new Map(memories.map(m => [m.id, m]))

  // Convert memories to contributions with assets
  const contributions: Contribution[] = memories.map(memory => {
    const assets: Asset[] = []

    // Generate photo assets
    for (let i = 0; i < memory.photoCount; i++) {
      assets.push({
        id: `${memory.id}:photo:${i}`,
        kind: 'photo',
        url: mediaUrlGenerator(memory, 'photo', i),
        alt: `Photo ${i + 1} from ${memory.contributorName}`
      })
    }

    // Generate GIF assets
    for (let i = 0; i < memory.gifCount; i++) {
      const url = mediaUrlGenerator(memory, 'gif', i)
      assets.push({
        id: `${memory.id}:gif:${i}`,
        kind: 'gif',
        url,
        poster: input.gifPosterGenerator?.(url),
        alt: `Animated GIF ${i + 1} from ${memory.contributorName}`
      })
    }

    // Generate video asset
    if (memory.videoDuration && memory.videoDuration > 0) {
      assets.push({
        id: `${memory.id}:video`,
        kind: 'video',
        url: mediaUrlGenerator(memory, 'video', 0),
        alt: `Video from ${memory.contributorName}`,
        seconds: memory.videoDuration
      })
    }

    return {
      id: memory.id,
      name: memory.contributorName,
      message: memory.message,
      createdAt: memory.createdAt.getTime(),
      assets
    }
  })

  // Convert chapters
  const previewChapters: PreviewChapter[] = plan.chapters.map((chapter, index) => ({
    title: chapter.title,
    subtitle: generateChapterSubtitle(chapter.title, occasion, index, plan.chapters.length),
    ids: chapter.memoryIds
  }))

  // Generate story title from opening or occasion
  const title = plan.openingTitle || generateDefaultTitle(occasion)

  return {
    recipient: recipientName || '',
    title,
    occasion,
    chapters: previewChapters,
    finale: plan.finaleMemoryId,
    highlights: plan.highlightMemoryIds,
    memories: contributions
  }
}

/**
 * Generate chapter subtitle based on title and occasion context
 */
function generateChapterSubtitle(
  title: string,
  occasion: Occasion,
  index: number,
  totalChapters: number
): string {
  // Use title keywords to generate contextual subtitle
  const lowerTitle = title.toLowerCase()

  if (lowerTitle.includes('adventure') || lowerTitle.includes('fun')) {
    return 'Inside jokes and unforgettable moments.'
  }
  if (lowerTitle.includes('growing') || lowerTitle.includes('together')) {
    return 'From then to now.'
  }
  if (lowerTitle.includes('corner') || lowerTitle.includes('love')) {
    return 'A little love from home.'
  }
  if (lowerTitle.includes('impact') || lowerTitle.includes('legacy')) {
    return 'Leadership remembered in your own words.'
  }
  if (lowerTitle.includes('job') || lowerTitle.includes('beyond')) {
    return 'Shared moments beyond the desk.'
  }
  if (lowerTitle.includes('thank') || lowerTitle.includes('gratitude')) {
    return 'From all of us.'
  }
  if (lowerTitle.includes('began') || lowerTitle.includes('beginning')) {
    return 'Where it all started.'
  }
  if (lowerTitle.includes('building') || lowerTitle.includes('journey')) {
    return 'Growing together through the years.'
  }
  if (lowerTitle.includes('forever') || lowerTitle.includes('always')) {
    return "Here's to many more."
  }
  if (lowerTitle.includes('life') || lowerTitle.includes('touched')) {
    return 'Stories shared by those who knew them.'
  }
  if (lowerTitle.includes('cherished') || lowerTitle.includes('moments')) {
    return 'Small moments, lovingly remembered.'
  }
  if (lowerTitle.includes('comfort') || lowerTitle.includes('here')) {
    return 'Words of support for you.'
  }

  // Generic fallbacks by occasion
  if (occasion === 'birthday') {
    if (index === 0) return 'Celebrating you.'
    if (index === totalChapters - 1) return 'With love.'
    return 'More memories to share.'
  }

  if (occasion === 'anniversary') {
    if (index === 0) return 'Your love story.'
    if (index === totalChapters - 1) return 'To many more years.'
    return 'Building a life together.'
  }

  if (occasion === 'retirement') {
    if (index === 0) return "What you've built."
    if (index === totalChapters - 1) return 'With gratitude.'
    return 'Memories shared.'
  }

  if (occasion === 'sympathy') {
    if (index === 0) return 'A life well lived.'
    if (index === totalChapters - 1) return 'Here for you.'
    return 'Cherished memories.'
  }

  // Ultimate fallback
  return 'Memories shared with you.'
}

/**
 * Generate default story title by occasion
 */
function generateDefaultTitle(occasion: Occasion): string {
  switch (occasion) {
    case 'birthday':
      return 'Happy Birthday'
    case 'anniversary':
      return 'Happy Anniversary'
    case 'retirement':
      return 'Congratulations'
    case 'sympathy':
      return 'In Loving Memory'
    default:
      return 'Your MemoryPop'
  }
}
