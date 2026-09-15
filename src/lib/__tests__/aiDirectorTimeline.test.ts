/**
 * AI Director Timeline Tests
 *
 * Validates:
 * - No repeated messages (each memory message renders exactly once)
 * - Approved transition vocabulary only
 * - Chapter transitions use appropriate types
 * - Finale uses finale transition
 * - GIF and video do not duplicate messages
 */

import { describe, it, expect } from '@jest/globals'
import { buildAIDirectorTimeline } from '../buildAIDirectorTimeline'
import type { RevealPlan } from '../ai/types'
import type { Memory } from '../buildCinematicTimeline'

// Approved transition types
const APPROVED_TRANSITIONS = [
  'gentle-fade',
  'crossfade',
  'soft-slide',
  'slow-zoom',
  'chapter-card',
  'playful-pop',
  'media-reveal',
  'calm-dissolve',
  'finale-fade'
]

describe('AI Director Timeline', () => {
  // Sample test data
  const mockMemories: Memory[] = [
    {
      id: 'mem1',
      contributor_name: 'Alice',
      message: 'Happy birthday!',
      photo_url: null,
      photos: [],
      gifs: [],
      video: null
    },
    {
      id: 'mem2',
      contributor_name: 'Bob',
      message: 'You are amazing!',
      photo_url: '/photo.jpg',
      photos: [{ url: '/photo.jpg', uploaded_at: '', file_size_bytes: 0 }],
      gifs: [],
      video: null
    },
    {
      id: 'mem3',
      contributor_name: 'Charlie',
      message: 'Great memories together!',
      photo_url: '/gif.gif',
      photos: [],
      gifs: [{ url: '/gif.gif', uploaded_at: '', file_size_bytes: 0 }],
      video: null
    }
  ]

  const mockPlan: RevealPlan = {
    opening: 'A celebration of friendship',
    openingTitle: 'Birthday Story',
    closingText: 'Happy birthday!',
    chapters: [
      {
        title: 'Chapter 1',
        memoryIds: ['mem1', 'mem2'],
        description: 'First chapter',
        emotionalTone: 'joyful'
      },
      {
        title: 'Chapter 2',
        memoryIds: ['mem3'],
        description: 'Second chapter',
        emotionalTone: 'heartfelt'
      }
    ],
    highlightMemoryIds: ['mem2'],
    finaleMemoryId: 'mem3',
    reasoningSummary: 'Test plan',
    decorativeTheme: {
      name: 'test',
      elements: [],
      intensity: 'subtle'
    },
    transitions: new Map()
  }

  it('should render each memory message exactly once', () => {
    const timeline = buildAIDirectorTimeline(mockMemories, mockPlan)

    // Count memory_presentation scenes per memory ID
    const memoryPresentations = timeline.filter(s => s.type === 'memory_presentation')
    const memoryIdCounts: Record<string, number> = {}

    memoryPresentations.forEach(scene => {
      const id = scene.memory.id
      memoryIdCounts[id] = (memoryIdCounts[id] || 0) + 1
    })

    // Each memory should appear exactly once
    Object.entries(memoryIdCounts).forEach(([id, count]) => {
      expect(count).toBe(1)
    })

    // Total memory presentations should equal total memories
    expect(memoryPresentations.length).toBe(mockMemories.length)
  })

  it('should not have separate contributor or message scenes', () => {
    const timeline = buildAIDirectorTimeline(mockMemories, mockPlan)

    const contributorScenes = timeline.filter(s => s.type === 'contributor')
    const messageScenes = timeline.filter(s => s.type === 'message')

    expect(contributorScenes.length).toBe(0)
    expect(messageScenes.length).toBe(0)
  })

  it('should only use approved transition types', () => {
    const timeline = buildAIDirectorTimeline(mockMemories, mockPlan)

    timeline.forEach((scene, index) => {
      if (scene.transition) {
        const isApproved = APPROVED_TRANSITIONS.includes(scene.transition.type)
        expect(isApproved).toBe(true)
      }
    })
  })

  it('should use chapter-card transition for chapter boundaries', () => {
    const timeline = buildAIDirectorTimeline(mockMemories, mockPlan)

    const chapterScenes = timeline.filter(s => s.type === 'chapter_transition')

    chapterScenes.forEach(scene => {
      expect(scene.transition?.type).toBe('chapter-card')
    })
  })

  it('should use finale-fade transition for closing scene', () => {
    const timeline = buildAIDirectorTimeline(mockMemories, mockPlan)

    const closingScene = timeline.find(s => s.type === 'closing')
    expect(closingScene?.transition?.type).toBe('finale-fade')
  })

  it('should use media-reveal transition for photos, gifs, and videos', () => {
    const timeline = buildAIDirectorTimeline(mockMemories, mockPlan)

    const mediaScenes = timeline.filter(s =>
      s.type === 'photo' || s.type === 'gif' || s.type === 'video'
    )

    mediaScenes.forEach(scene => {
      expect(scene.transition?.type).toBe('media-reveal')
    })
  })

  it('should include opening and closing scenes', () => {
    const timeline = buildAIDirectorTimeline(mockMemories, mockPlan)

    const openingScene = timeline.find(s => s.type === 'opening')
    const closingScene = timeline.find(s => s.type === 'closing')

    expect(openingScene).toBeDefined()
    expect(closingScene).toBeDefined()
  })

  it('should mark highlights correctly', () => {
    const timeline = buildAIDirectorTimeline(mockMemories, mockPlan)

    const highlightScenes = timeline.filter(s => s.isHighlight)

    // At least the memory_presentation scene should be marked as highlight
    const highlightMemoryPresentations = highlightScenes.filter(s => s.type === 'memory_presentation')
    expect(highlightMemoryPresentations.length).toBeGreaterThan(0)

    // All highlighted scenes should be for memory id in highlightMemoryIds
    highlightScenes.forEach(scene => {
      if (scene.memoryIndex !== -1) {
        expect(mockPlan.highlightMemoryIds.includes(scene.memory.id)).toBe(true)
      }
    })
  })

  it('should mark finale correctly', () => {
    const timeline = buildAIDirectorTimeline(mockMemories, mockPlan)

    const finaleScenes = timeline.filter(s => s.isFinale)

    // All finale scenes should be for the finale memory
    finaleScenes.forEach(scene => {
      if (scene.memoryIndex !== -1) {
        expect(scene.memory.id).toBe(mockPlan.finaleMemoryId)
      }
    })
  })

  it('should include all memories in timeline', () => {
    const timeline = buildAIDirectorTimeline(mockMemories, mockPlan)

    const memoryIds = new Set(mockMemories.map(m => m.id))
    const timelineMemoryIds = new Set(
      timeline
        .filter(s => s.memoryIndex !== -1)
        .map(s => s.memory.id)
    )

    memoryIds.forEach(id => {
      expect(timelineMemoryIds.has(id)).toBe(true)
    })
  })

  it('should have photo scenes for memories with photos', () => {
    const timeline = buildAIDirectorTimeline(mockMemories, mockPlan)

    const mem2Timeline = timeline.filter(s =>
      s.memory?.id === 'mem2' && s.type === 'photo'
    )

    expect(mem2Timeline.length).toBeGreaterThan(0)
  })

  it('should have gif scenes for memories with gifs', () => {
    const timeline = buildAIDirectorTimeline(mockMemories, mockPlan)

    const mem3Timeline = timeline.filter(s =>
      s.memory?.id === 'mem3' && s.type === 'gif'
    )

    expect(mem3Timeline.length).toBeGreaterThan(0)
  })

  it('should include transition reason for all scenes', () => {
    const timeline = buildAIDirectorTimeline(mockMemories, mockPlan)

    timeline.forEach((scene, index) => {
      if (scene.transition) {
        expect(scene.transition.reason).toBeDefined()
        expect(typeof scene.transition.reason).toBe('string')
        expect(scene.transition.reason.length).toBeGreaterThan(0)
      }
    })
  })
})
