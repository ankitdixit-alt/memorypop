/**
 * Transition Selector - AI Director
 *
 * Selects appropriate transitions based on:
 * - Chapter boundaries
 * - Emotional tone
 * - Media type
 * - Highlight status
 * - Position in reveal (opening, middle, finale)
 *
 * DEVELOPMENT ONLY
 */

import type { TransitionType, TransitionPlan, Chapter, MemoryMetadata } from './types'

interface TransitionContext {
  isChapterBoundary: boolean
  isOpening: boolean
  isFinale: boolean
  isHighlight: boolean
  hasMedia: boolean
  mediaType?: 'photo' | 'gif' | 'video'
  emotionalTone?: 'joyful' | 'heartfelt' | 'funny' | 'reflective' | 'celebratory'
  previousTone?: 'joyful' | 'heartfelt' | 'funny' | 'reflective' | 'celebratory'
  energyLevel?: 'high' | 'medium' | 'low'
}

/**
 * Select appropriate transition for a scene boundary
 */
export function selectTransition(context: TransitionContext): TransitionPlan {
  // Opening always gets a gentle fade
  if (context.isOpening) {
    return {
      type: 'gentle-fade',
      reason: 'Opening scene - welcoming entry',
      durationMs: 800
    }
  }

  // Chapter boundary gets chapter card
  if (context.isChapterBoundary) {
    return {
      type: 'chapter-card',
      reason: 'New chapter beginning',
      durationMs: 600
    }
  }

  // Finale gets special treatment
  if (context.isFinale) {
    return {
      type: 'finale-fade',
      reason: 'Final memory - meaningful emphasis',
      durationMs: 1200
    }
  }

  // Highlight moments get slow zoom
  if (context.isHighlight) {
    return {
      type: 'slow-zoom',
      reason: 'Highlighted memory - emphasis',
      durationMs: 1000
    }
  }

  // Media introduction
  if (context.hasMedia && context.mediaType) {
    return {
      type: 'media-reveal',
      reason: `Introducing ${context.mediaType}`,
      durationMs: 700
    }
  }

  // Tone-based transitions
  if (context.emotionalTone) {
    switch (context.emotionalTone) {
      case 'funny':
      case 'joyful':
        return {
          type: 'playful-pop',
          reason: 'Fun, energetic memory',
          durationMs: 500
        }

      case 'heartfelt':
      case 'reflective':
        return {
          type: 'calm-dissolve',
          reason: 'Emotional, meaningful memory',
          durationMs: 1000
        }

      case 'celebratory':
        return {
          type: 'soft-slide',
          reason: 'Celebratory momentum',
          durationMs: 600
        }
    }
  }

  // Tone change between memories
  if (context.previousTone && context.emotionalTone && context.previousTone !== context.emotionalTone) {
    return {
      type: 'crossfade',
      reason: `Transition from ${context.previousTone} to ${context.emotionalTone}`,
      durationMs: 800
    }
  }

  // Default gentle fade
  return {
    type: 'gentle-fade',
    reason: 'Smooth continuation within chapter',
    durationMs: 600
  }
}

/**
 * Infer emotional tone from memory content
 */
export function inferEmotionalTone(memory: MemoryMetadata): 'joyful' | 'heartfelt' | 'funny' | 'reflective' | 'celebratory' {
  const message = memory.message.toLowerCase()

  // Funny indicators
  if (message.includes('laugh') || message.includes('funny') || message.includes('haha') ||
      message.includes('lol') || message.includes('hilarious') || message.includes('joke')) {
    return 'funny'
  }

  // Heartfelt indicators
  if (message.includes('love') || message.includes('miss') || message.includes('grateful') ||
      message.includes('thank you') || message.includes('appreciate') || message.includes('special')) {
    return 'heartfelt'
  }

  // Celebratory indicators
  if (message.includes('congratulations') || message.includes('celebrate') || message.includes('amazing') ||
      message.includes('proud') || message.includes('success') || message.includes('achievement')) {
    return 'celebratory'
  }

  // Reflective indicators
  if (message.includes('remember') || message.includes('think') || message.includes('years') ||
      message.includes('time') || message.includes('journey')) {
    return 'reflective'
  }

  // Default to joyful
  return 'joyful'
}

/**
 * Build transition map for entire reveal
 */
export function buildTransitionMap(
  memories: MemoryMetadata[],
  chapters: Chapter[],
  highlightIds: string[],
  finaleId: string
): Map<string, TransitionPlan> {
  const transitionMap = new Map<string, TransitionPlan>()

  // Opening transition
  transitionMap.set('scene_0', selectTransition({
    isChapterBoundary: false,
    isOpening: true,
    isFinale: false,
    isHighlight: false,
    hasMedia: false
  }))

  let previousTone: 'joyful' | 'heartfelt' | 'funny' | 'reflective' | 'celebratory' | undefined
  let sceneIndex = 1

  chapters.forEach((chapter, chapterIndex) => {
    // Chapter transition
    transitionMap.set(`scene_${sceneIndex}`, selectTransition({
      isChapterBoundary: true,
      isOpening: false,
      isFinale: false,
      isHighlight: false,
      hasMedia: false,
      emotionalTone: chapter.emotionalTone
    }))
    sceneIndex++

    // Memory transitions within chapter
    chapter.memoryIds.forEach((memoryId, memoryIndexInChapter) => {
      const memory = memories.find(m => m.id === memoryId)
      if (!memory) return

      const isHighlight = highlightIds.includes(memoryId)
      const isFinale = memoryId === finaleId
      const tone = inferEmotionalTone(memory)
      const hasMedia = memory.photoCount > 0 || memory.gifCount > 0 || (memory.videoDuration || 0) > 0

      // Transition into this memory
      transitionMap.set(`memory_${memoryId}`, selectTransition({
        isChapterBoundary: false,
        isOpening: false,
        isFinale,
        isHighlight,
        hasMedia,
        mediaType: memory.videoDuration ? 'video' : memory.gifCount > 0 ? 'gif' : memory.photoCount > 0 ? 'photo' : undefined,
        emotionalTone: tone,
        previousTone,
        energyLevel: tone === 'funny' || tone === 'joyful' ? 'high' : tone === 'celebratory' ? 'medium' : 'low'
      }))

      previousTone = tone
      sceneIndex++
    })
  })

  // Closing transition
  transitionMap.set('scene_closing', selectTransition({
    isChapterBoundary: false,
    isOpening: false,
    isFinale: true,
    isHighlight: false,
    hasMedia: false,
    emotionalTone: 'heartfelt'
  }))

  return transitionMap
}
