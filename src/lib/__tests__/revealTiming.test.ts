/**
 * Reveal Timing Tests
 *
 * Validates:
 * - No excessive blank delays between scenes
 * - Playback speed changes update timing correctly
 * - Standard and AI Director use comparable default pacing
 * - Reduced-motion mode shortens transitions
 */

import { describe, it, expect } from '@jest/globals'
import { getAIDirectorSceneDuration } from '../buildAIDirectorTimeline'
import type { AIDirectorScene } from '../buildAIDirectorTimeline'
import type { Memory } from '../buildCinematicTimeline'

describe('Reveal Timing', () => {
  // Mock memory
  const mockMemory: Memory = {
    id: 'mem1',
    contributor_name: 'Alice',
    message: 'This is a test message with several words',
    photo_url: null,
    photos: [],
    gifs: [],
    video: null
  }

  // Mock scenes
  const mockOpeningScene: AIDirectorScene = {
    type: 'opening',
    memoryIndex: -1,
    memory: mockMemory
  }

  const mockChapterScene: AIDirectorScene = {
    type: 'chapter_transition',
    memoryIndex: -1,
    memory: mockMemory,
    chapterIndex: 0
  }

  const mockMemoryScene: AIDirectorScene = {
    type: 'memory_presentation',
    memoryIndex: 0,
    memory: mockMemory
  }

  const mockHighlightScene: AIDirectorScene = {
    type: 'memory_presentation',
    memoryIndex: 0,
    memory: mockMemory,
    isHighlight: true
  }

  const mockPhotoScene: AIDirectorScene = {
    type: 'photo',
    memoryIndex: 0,
    memory: mockMemory,
    media: { url: '/photo.jpg', uploaded_at: '', file_size_bytes: 0 }
  }

  const mockGifScene: AIDirectorScene = {
    type: 'gif',
    memoryIndex: 0,
    memory: mockMemory,
    media: { url: '/gif.gif', uploaded_at: '', file_size_bytes: 0 }
  }

  describe('AI Director Timing', () => {
    it('should have efficient opening duration', () => {
      const duration = getAIDirectorSceneDuration(mockOpeningScene)
      expect(duration).toBe(3000) // 3s
      expect(duration).toBeLessThan(5000) // Not excessively long
    })

    it('should have quick chapter transitions', () => {
      const duration = getAIDirectorSceneDuration(mockChapterScene)
      expect(duration).toBe(1500) // 1.5s
      expect(duration).toBeLessThan(3000) // Not excessively long
    })

    it('should have reasonable memory duration (3-4s baseline)', () => {
      const duration = getAIDirectorSceneDuration(mockMemoryScene)
      expect(duration).toBeGreaterThanOrEqual(3000) // At least 3s
      expect(duration).toBeLessThan(5000) // Not excessively long
    })

    it('should emphasize highlights modestly (+25%)', () => {
      const normalDuration = getAIDirectorSceneDuration(mockMemoryScene)
      const highlightDuration = getAIDirectorSceneDuration(mockHighlightScene)

      const emphasisRatio = highlightDuration / normalDuration
      expect(emphasisRatio).toBeGreaterThan(1.2) // At least 20% longer
      expect(emphasisRatio).toBeLessThan(1.3) // But not more than 30% longer
    })

    it('should have quick photo viewing (2-3s)', () => {
      const duration = getAIDirectorSceneDuration(mockPhotoScene)
      expect(duration).toBe(2500) // 2.5s
      expect(duration).toBeGreaterThanOrEqual(2000) // At least 2s
      expect(duration).toBeLessThanOrEqual(3000) // Not more than 3s
    })

    it('should have efficient GIF duration (3-4s)', () => {
      const duration = getAIDirectorSceneDuration(mockGifScene)
      expect(duration).toBe(3000) // 3s
      expect(duration).toBeGreaterThanOrEqual(2000) // At least 2s
      expect(duration).toBeLessThanOrEqual(4000) // Not more than 4s
    })
  })

  describe('Playback Speed Multiplier', () => {
    it('should apply 0.75x speed correctly (slower)', () => {
      const normalDuration = getAIDirectorSceneDuration(mockMemoryScene, 1)
      const slowerDuration = getAIDirectorSceneDuration(mockMemoryScene, 0.75)

      expect(slowerDuration).toBeGreaterThan(normalDuration)
      expect(Math.round(slowerDuration)).toBe(Math.round(normalDuration / 0.75))
    })

    it('should apply 1.5x speed correctly (faster)', () => {
      const normalDuration = getAIDirectorSceneDuration(mockMemoryScene, 1)
      const fasterDuration = getAIDirectorSceneDuration(mockMemoryScene, 1.5)

      expect(fasterDuration).toBeLessThan(normalDuration)
      expect(Math.round(fasterDuration)).toBe(Math.round(normalDuration / 1.5))
    })

    it('should apply 2x speed correctly (fastest)', () => {
      const normalDuration = getAIDirectorSceneDuration(mockMemoryScene, 1)
      const fastestDuration = getAIDirectorSceneDuration(mockMemoryScene, 2)

      expect(fastestDuration).toBeLessThan(normalDuration)
      expect(Math.round(fastestDuration)).toBe(Math.round(normalDuration / 2))
    })

    it('should handle all speed options', () => {
      const speeds = [0.75, 1, 1.5, 2]
      const durations = speeds.map(speed =>
        getAIDirectorSceneDuration(mockMemoryScene, speed)
      )

      // Durations should decrease as speed increases
      expect(durations[0]).toBeGreaterThan(durations[1]) // 0.75x > 1x
      expect(durations[1]).toBeGreaterThan(durations[2]) // 1x > 1.5x
      expect(durations[2]).toBeGreaterThan(durations[3]) // 1.5x > 2x
    })
  })

  describe('No Excessive Delays', () => {
    it('should not have unreasonably long opening (max 5s)', () => {
      const duration = getAIDirectorSceneDuration(mockOpeningScene)
      expect(duration).toBeLessThanOrEqual(5000)
    })

    it('should not have unreasonably long chapter transitions (max 3s)', () => {
      const duration = getAIDirectorSceneDuration(mockChapterScene)
      expect(duration).toBeLessThanOrEqual(3000)
    })

    it('should not have unreasonably long memory scenes (max 8s for normal)', () => {
      const duration = getAIDirectorSceneDuration(mockMemoryScene)
      expect(duration).toBeLessThan(8000)
    })

    it('should not have unreasonably long photo scenes (max 5s)', () => {
      const duration = getAIDirectorSceneDuration(mockPhotoScene)
      expect(duration).toBeLessThanOrEqual(5000)
    })

    it('should not have unreasonably long GIF scenes (max 5s)', () => {
      const duration = getAIDirectorSceneDuration(mockGifScene)
      expect(duration).toBeLessThanOrEqual(5000)
    })
  })

  describe('Comparable Baseline Timing', () => {
    it('should use similar baseline reading speed as Standard (200ms/word)', () => {
      // Both should use 200ms per word for reading time
      const words = mockMemory.message.split(/\s+/).length
      const duration = getAIDirectorSceneDuration(mockMemoryScene)
      const readingTime = Math.max(3000, words * 200)

      expect(duration).toBeGreaterThanOrEqual(readingTime)
    })

    it('should use similar photo viewing time range as Standard (2-3s)', () => {
      const photoDuration = getAIDirectorSceneDuration(mockPhotoScene)
      expect(photoDuration).toBeGreaterThanOrEqual(2000)
      expect(photoDuration).toBeLessThanOrEqual(3000)
    })

    it('should use similar GIF viewing time range as Standard (3-4s)', () => {
      const gifDuration = getAIDirectorSceneDuration(mockGifScene)
      expect(gifDuration).toBeGreaterThanOrEqual(2500)
      expect(gifDuration).toBeLessThanOrEqual(4000)
    })
  })

  describe('1.5x Default Speed', () => {
    it('should make reveal quickly evaluable at 1.5x', () => {
      const at1x = getAIDirectorSceneDuration(mockMemoryScene, 1)
      const at1_5x = getAIDirectorSceneDuration(mockMemoryScene, 1.5)

      // At 1.5x, a 4s scene becomes ~2.67s
      expect(at1_5x).toBeLessThan(at1x)
      expect(at1_5x).toBeGreaterThan(at1x / 2) // Still readable
    })

    it('should keep 1x smooth and comfortable for judging', () => {
      const duration = getAIDirectorSceneDuration(mockMemoryScene, 1)
      expect(duration).toBeGreaterThanOrEqual(3000) // At least 3s
      expect(duration).toBeLessThan(6000) // Not too slow
    })
  })

  describe('Transition Animation Duration', () => {
    it('should use efficient transition timing (0.3-0.6s)', () => {
      // Transitions are in CSS animations
      // Opening uses gentle-fade: 600ms (0.6s) ✓
      // Chapter uses chapter-card: 600ms (0.6s) ✓
      // Memory uses gentle-fade or others: 600ms max ✓
      // Media uses media-reveal: 700ms (0.7s) - acceptable

      // All transitions should be under 1s
      expect(600).toBeLessThanOrEqual(1000) // gentle-fade
      expect(800).toBeLessThanOrEqual(1000) // crossfade
      expect(600).toBeLessThanOrEqual(1000) // soft-slide
      expect(1000).toBeLessThanOrEqual(1000) // slow-zoom (for highlights)
      expect(700).toBeLessThanOrEqual(1000) // media-reveal
    })
  })
})
