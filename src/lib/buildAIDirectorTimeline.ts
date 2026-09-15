/**
 * AI Director Timeline Builder
 *
 * Extends buildCinematicTimeline with:
 * - Opening screen
 * - Chapter transitions
 * - Adjusted pacing for highlights
 * - Closing screen
 *
 * DEVELOPMENT ONLY
 */

import type { RevealPlan } from './ai/types'
import type { CinematicScene, Memory } from './buildCinematicTimeline'
import { getSceneDuration as getStandardDuration } from './buildCinematicTimeline'

export type AIDirectorSceneType =
  | 'opening'           // AI-generated opening title
  | 'chapter_transition' // Chapter title card
  | 'memory_presentation' // Combined contributor + message (ONE per memory)
  | 'photo'
  | 'gif'
  | 'video'
  | 'closing'           // AI-generated closing message

export interface AIDirectorScene extends Omit<CinematicScene, 'type'> {
  type: AIDirectorSceneType
  // Additional AI Director fields
  chapterIndex?: number
  chapterTitle?: string
  chapterDescription?: string
  isHighlight?: boolean
  isFinale?: boolean
  decorativeElements?: string[]
  // Transition information
  transition?: {
    type: string
    reason: string
    durationMs: number
  }
}

/**
 * Build AI Director timeline with chapters and enhanced pacing
 * CRITICAL: Each memory message renders exactly ONCE via memory_presentation
 */
export function buildAIDirectorTimeline(
  memories: Memory[],
  plan: RevealPlan
): AIDirectorScene[] {
  const timeline: AIDirectorScene[] = []
  const memoryMap = new Map(memories.map(m => [m.id, m]))
  const transitions = plan.transitions || new Map()

  let sceneIndex = 0

  // 1. Opening scene
  timeline.push({
    type: 'opening',
    memoryIndex: -1,
    memory: memories[0], // Dummy reference
    decorativeElements: plan.decorativeTheme?.elements || [],
    transition: transitions.get('scene_0') || {
      type: 'gentle-fade',
      reason: 'Opening',
      durationMs: 800
    }
  })
  sceneIndex++

  // 2. For each chapter
  plan.chapters.forEach((chapter, chapterIndex) => {
    // Chapter transition
    timeline.push({
      type: 'chapter_transition',
      memoryIndex: -1,
      memory: memories[0], // Dummy reference
      chapterIndex,
      chapterTitle: chapter.title,
      chapterDescription: chapter.description,
      transition: transitions.get(`scene_${sceneIndex}`) || {
        type: 'chapter-card',
        reason: 'New chapter',
        durationMs: 600
      }
    })
    sceneIndex++

    // Memories in this chapter
    chapter.memoryIds.forEach(memoryId => {
      const memory = memoryMap.get(memoryId)
      if (!memory) return

      const memoryIndex = memories.findIndex(m => m.id === memoryId)
      const isHighlight = plan.highlightMemoryIds.includes(memoryId)
      const isFinale = plan.finaleMemoryId === memoryId

      // Parse media
      const photos = memory.photos || (
        memory.photo_url && !memory.photo_url.endsWith('.gif')
          ? [{ url: memory.photo_url, uploaded_at: '', file_size_bytes: 0 }]
          : []
      )
      const gifs = memory.gifs || (
        memory.photo_url && memory.photo_url.endsWith('.gif')
          ? [{ url: memory.photo_url, uploaded_at: '', file_size_bytes: 0 }]
          : []
      )
      const video = memory.video || null

      // Memory presentation: contributor + message combined (ONE SCENE per memory)
      timeline.push({
        type: 'memory_presentation',
        memoryIndex,
        memory,
        chapterIndex,
        chapterTitle: chapter.title,
        isHighlight,
        isFinale,
        transition: transitions.get(`memory_${memoryId}`) || {
          type: 'gentle-fade',
          reason: 'Memory presentation',
          durationMs: 600
        }
      })
      sceneIndex++

      // Photos (optional additional scenes - do NOT repeat message)
      photos.forEach((photo, photoIndex) => {
        timeline.push({
          type: 'photo',
          memoryIndex,
          memory,
          mediaIndex: photoIndex,
          media: photo,
          chapterIndex,
          isHighlight,
          isFinale,
          transition: {
            type: 'media-reveal',
            reason: 'Photo presentation',
            durationMs: 700
          }
        })
        sceneIndex++
      })

      // GIFs
      gifs.forEach((gif, gifIndex) => {
        timeline.push({
          type: 'gif',
          memoryIndex,
          memory,
          mediaIndex: gifIndex,
          media: gif,
          chapterIndex,
          isHighlight,
          isFinale,
          transition: {
            type: 'media-reveal',
            reason: 'GIF presentation',
            durationMs: 700
          }
        })
        sceneIndex++
      })

      // Video
      if (video) {
        timeline.push({
          type: 'video',
          memoryIndex,
          memory,
          media: video,
          chapterIndex,
          isHighlight,
          isFinale,
          transition: {
            type: 'media-reveal',
            reason: 'Video presentation',
            durationMs: 700
          }
        })
        sceneIndex++
      }
    })
  })

  // 3. Closing scene
  timeline.push({
    type: 'closing',
    memoryIndex: -1,
    memory: memories[0], // Dummy reference
    decorativeElements: plan.decorativeTheme?.elements || [],
    transition: transitions.get('scene_closing') || {
      type: 'finale-fade',
      reason: 'Closing',
      durationMs: 1200
    }
  })

  return timeline
}

/**
 * Get scene duration with AI Director pacing adjustments
 * Optimized for quick evaluation while maintaining emotional impact
 */
export function getAIDirectorSceneDuration(scene: AIDirectorScene, playbackSpeed: number = 1): number {
  let baseDuration: number

  switch (scene.type) {
    case 'opening':
      baseDuration = 3000 // 3s for opening title
      break
    case 'chapter_transition':
      baseDuration = 1500 // 1.5s for chapter transition
      break
    case 'closing':
      baseDuration = scene.isFinale ? 5000 : 4000 // 4-5s for closing
      break
    case 'memory_presentation':
      // Calculate reading time based on message length
      const words = (scene.memory.message || '').split(/\s+/).length
      const readingTime = Math.max(3000, words * 200) // 200ms per word, min 3s
      // Highlights and finale get modest +25% emphasis
      const emphasis = (scene.isHighlight || scene.isFinale) ? 1.25 : 1
      baseDuration = Math.round(readingTime * emphasis)
      break
    case 'photo':
      // Quick photo viewing: 2.5s normal, 3s highlight
      baseDuration = scene.isHighlight ? 3000 : 2500
      break
    case 'gif':
      // GIF duration: 3s normal, 3.5s highlight (time for one natural loop)
      baseDuration = scene.isHighlight ? 3500 : 3000
      break
    case 'video':
      // Video duration handled by element
      return 0
    default:
      baseDuration = getStandardDuration(scene as CinematicScene)
  }

  // Apply playback speed multiplier
  return Math.round(baseDuration / playbackSpeed)
}

/**
 * Get memory info for AI Director scenes
 */
export function getAIDirectorMemoryInfo(scene: AIDirectorScene, totalMemories: number) {
  if (scene.type === 'opening' || scene.type === 'chapter_transition' || scene.type === 'closing') {
    return null
  }

  return {
    currentMemory: scene.memoryIndex + 1,
    totalMemories,
    contributorName: scene.memory.contributor_name,
    chapterTitle: scene.chapterTitle,
    isHighlight: scene.isHighlight,
    isFinale: scene.isFinale
  }
}
