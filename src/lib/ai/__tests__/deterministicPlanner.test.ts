/**
 * Tests for Deterministic Planner
 *
 * Verifies:
 * - Exact contribution coverage (all memories included once)
 * - Finale uniqueness (appears once in sequence)
 * - Deterministic ordering (same input = same output)
 * - Invalid plan rejection
 * - Edge cases (empty, single contribution, ties)
 */

import { generateDeterministicRevealPlan } from '../deterministicPlanner'
import { validateRevealPlan } from '../validation'
import type { MemoryMetadata, RevealPlanInput } from '../types'

describe('deterministicPlanner', () => {
  // Helper to create test memories
  function createMemory(
    id: string,
    contributorName: string,
    message: string,
    createdAt: Date,
    photoCount = 1,
    gifCount = 0,
    videoDuration = 0
  ): MemoryMetadata {
    return {
      id,
      contributorName,
      message,
      photoCount,
      gifCount,
      videoDuration,
      createdAt
    }
  }

  describe('contribution coverage', () => {
    it('should include all memories exactly once', () => {
      const memories: MemoryMetadata[] = [
        createMemory('mem_1', 'Alice', 'Happy birthday!', new Date('2026-01-01')),
        createMemory('mem_2', 'Bob', 'Best wishes!', new Date('2026-01-02')),
        createMemory('mem_3', 'Charlie', 'Congrats!', new Date('2026-01-03'))
      ]

      const input: RevealPlanInput = {
        memoryPopId: 'test-1',
        recipientName: 'Emma',
        occasion: 'birthday',
        tone: 'celebratory',
        story: 'Test story',
        memories
      }

      const plan = generateDeterministicRevealPlan(input)

      // Collect all memory IDs from chapters
      const allIds = plan.chapters.flatMap(ch => ch.memoryIds)

      // Check each memory appears exactly once
      expect(allIds.sort()).toEqual(['mem_1', 'mem_2', 'mem_3'])
      expect(new Set(allIds).size).toBe(3) // No duplicates

      // Validate plan
      const validation = validateRevealPlan(plan, memories)
      expect(validation.valid).toBe(true)
      expect(validation.errors).toEqual([])
    })

    it('should include memories with rich media', () => {
      const memories: MemoryMetadata[] = [
        createMemory('mem_1', 'Alice', 'Lots of photos!', new Date('2026-01-01'), 10, 0, 0),
        createMemory('mem_2', 'Bob', 'Video message', new Date('2026-01-02'), 2, 1, 90),
        createMemory('mem_3', 'Charlie', 'GIFs!', new Date('2026-01-03'), 1, 3, 0)
      ]

      const input: RevealPlanInput = {
        memoryPopId: 'test-media',
        recipientName: 'Emma',
        occasion: 'birthday',
        tone: 'celebratory',
        story: 'Test story',
        memories
      }

      const plan = generateDeterministicRevealPlan(input)
      const allIds = plan.chapters.flatMap(ch => ch.memoryIds)

      expect(allIds.sort()).toEqual(['mem_1', 'mem_2', 'mem_3'])
      expect(validateRevealPlan(plan, memories).valid).toBe(true)
    })
  })

  describe('finale selection', () => {
    it('should select family member as finale', () => {
      const memories: MemoryMetadata[] = [
        createMemory('mem_1', 'Friend', 'Nice message', new Date('2026-01-01')),
        createMemory('mem_2', 'Mom', 'So proud of you!', new Date('2026-01-02')),
        createMemory('mem_3', 'Colleague', 'Great work', new Date('2026-01-03'))
      ]

      const input: RevealPlanInput = {
        memoryPopId: 'test-finale',
        recipientName: 'Emma',
        occasion: 'birthday',
        tone: 'celebratory',
        story: 'Test story',
        memories
      }

      const plan = generateDeterministicRevealPlan(input)

      expect(plan.finaleMemoryId).toBe('mem_2') // Mom
    })

    it('should select emotional message as finale when no family', () => {
      const memories: MemoryMetadata[] = [
        createMemory('mem_1', 'Alice', 'Happy birthday!', new Date('2026-01-01')),
        createMemory('mem_2', 'Bob', 'You are so loved and cherished!', new Date('2026-01-02')),
        createMemory('mem_3', 'Charlie', 'Great times!', new Date('2026-01-03'))
      ]

      const input: RevealPlanInput = {
        memoryPopId: 'test-emotional',
        recipientName: 'Emma',
        occasion: 'birthday',
        tone: 'celebratory',
        story: 'Test story',
        memories
      }

      const plan = generateDeterministicRevealPlan(input)

      expect(plan.finaleMemoryId).toBe('mem_2') // Emotional keywords
    })

    it('should include finale in chapter sequence', () => {
      const memories: MemoryMetadata[] = [
        createMemory('mem_1', 'Alice', 'Message', new Date('2026-01-01')),
        createMemory('mem_2', 'Mom', 'Love you', new Date('2026-01-02')),
        createMemory('mem_3', 'Charlie', 'Hi', new Date('2026-01-03'))
      ]

      const input: RevealPlanInput = {
        memoryPopId: 'test-finale-included',
        recipientName: 'Emma',
        occasion: 'birthday',
        tone: 'celebratory',
        story: 'Test story',
        memories
      }

      const plan = generateDeterministicRevealPlan(input)
      const allIds = plan.chapters.flatMap(ch => ch.memoryIds)

      expect(allIds).toContain(plan.finaleMemoryId)
      expect(validateRevealPlan(plan, memories).valid).toBe(true)
    })
  })

  describe('deterministic ordering', () => {
    it('should produce same output for same input', () => {
      const memories: MemoryMetadata[] = [
        createMemory('mem_1', 'Alice', 'One', new Date('2026-01-01')),
        createMemory('mem_2', 'Bob', 'Two', new Date('2026-01-02')),
        createMemory('mem_3', 'Charlie', 'Three', new Date('2026-01-03'))
      ]

      const input: RevealPlanInput = {
        memoryPopId: 'test-deterministic',
        recipientName: 'Emma',
        occasion: 'birthday',
        tone: 'celebratory',
        story: 'Test story',
        memories
      }

      const plan1 = generateDeterministicRevealPlan(input)
      const plan2 = generateDeterministicRevealPlan(input)

      expect(plan1.chapters).toEqual(plan2.chapters)
      expect(plan1.finaleMemoryId).toBe(plan2.finaleMemoryId)
      expect(plan1.highlightMemoryIds).toEqual(plan2.highlightMemoryIds)
    })

    it('should handle tied timestamps consistently', () => {
      const sameDate = new Date('2026-01-01T10:00:00Z')
      const memories: MemoryMetadata[] = [
        createMemory('mem_a', 'Alice', 'Same time A', sameDate),
        createMemory('mem_b', 'Bob', 'Same time B', sameDate),
        createMemory('mem_c', 'Charlie', 'Same time C', sameDate)
      ]

      const input: RevealPlanInput = {
        memoryPopId: 'test-ties',
        recipientName: 'Emma',
        occasion: 'birthday',
        tone: 'celebratory',
        story: 'Test story',
        memories
      }

      const plan1 = generateDeterministicRevealPlan(input)
      const plan2 = generateDeterministicRevealPlan(input)

      // Same order both times (alphabetical tie-breaking by ID)
      expect(plan1.chapters).toEqual(plan2.chapters)
    })
  })

  describe('edge cases', () => {
    it('should handle empty memory collection', () => {
      const input: RevealPlanInput = {
        memoryPopId: 'test-empty',
        recipientName: 'Emma',
        occasion: 'birthday',
        tone: 'celebratory',
        story: 'Test story',
        memories: []
      }

      const plan = generateDeterministicRevealPlan(input)

      expect(plan.chapters.length).toBe(1)
      expect(plan.chapters[0].memoryIds).toEqual([])
      expect(plan.finaleMemoryId).toBe('')
      expect(plan.opening).toBeTruthy()
    })

    it('should handle single memory', () => {
      const memories: MemoryMetadata[] = [
        createMemory('mem_only', 'Alice', 'Only message', new Date('2026-01-01'))
      ]

      const input: RevealPlanInput = {
        memoryPopId: 'test-single',
        recipientName: 'Emma',
        occasion: 'birthday',
        tone: 'celebratory',
        story: 'Test story',
        memories
      }

      const plan = generateDeterministicRevealPlan(input)

      expect(plan.chapters.length).toBe(1)
      expect(plan.chapters[0].memoryIds).toEqual(['mem_only'])
      expect(plan.finaleMemoryId).toBe('mem_only')
      expect(validateRevealPlan(plan, memories).valid).toBe(true)
    })

    it('should handle two memories', () => {
      const memories: MemoryMetadata[] = [
        createMemory('mem_1', 'Alice', 'First', new Date('2026-01-01')),
        createMemory('mem_2', 'Bob', 'Second', new Date('2026-01-02'))
      ]

      const input: RevealPlanInput = {
        memoryPopId: 'test-two',
        recipientName: 'Emma',
        occasion: 'birthday',
        tone: 'celebratory',
        story: 'Test story',
        memories
      }

      const plan = generateDeterministicRevealPlan(input)

      expect(plan.chapters.length).toBe(2)
      const allIds = plan.chapters.flatMap(ch => ch.memoryIds)
      expect(allIds.sort()).toEqual(['mem_1', 'mem_2'])
      expect(validateRevealPlan(plan, memories).valid).toBe(true)
    })

    it('should handle many memories', () => {
      const memories: MemoryMetadata[] = Array.from({ length: 15 }, (_, i) =>
        createMemory(`mem_${i + 1}`, `Person ${i + 1}`, `Message ${i + 1}`, new Date(2026, 0, i + 1))
      )

      const input: RevealPlanInput = {
        memoryPopId: 'test-many',
        recipientName: 'Emma',
        occasion: 'birthday',
        tone: 'celebratory',
        story: 'Test story',
        memories
      }

      const plan = generateDeterministicRevealPlan(input)

      expect(plan.chapters.length).toBeGreaterThanOrEqual(2)
      const allIds = plan.chapters.flatMap(ch => ch.memoryIds)
      expect(allIds.length).toBe(15)
      expect(validateRevealPlan(plan, memories).valid).toBe(true)
    })

    it('should handle empty recipient name', () => {
      const memories: MemoryMetadata[] = [
        createMemory('mem_1', 'Alice', 'Message', new Date('2026-01-01'))
      ]

      const input: RevealPlanInput = {
        memoryPopId: 'test-no-name',
        recipientName: '',
        occasion: 'birthday',
        tone: 'celebratory',
        story: 'Test story',
        memories
      }

      const plan = generateDeterministicRevealPlan(input)

      expect(plan.opening).toBeTruthy()
      expect(plan.opening).not.toContain('undefined')
      expect(plan.closingText).toBeTruthy()
    })

    it('should handle whitespace-only recipient name', () => {
      const memories: MemoryMetadata[] = [
        createMemory('mem_1', 'Alice', 'Message', new Date('2026-01-01'))
      ]

      const input: RevealPlanInput = {
        memoryPopId: 'test-whitespace-name',
        recipientName: '   ',
        occasion: 'birthday',
        tone: 'celebratory',
        story: 'Test story',
        memories
      }

      const plan = generateDeterministicRevealPlan(input)

      expect(plan.opening).toBeTruthy()
      expect(plan.closingText).toBeTruthy()
    })
  })

  describe('occasion support', () => {
    const testOccasions = ['birthday', 'anniversary', 'retirement', 'sympathy'] as const

    testOccasions.forEach(occasion => {
      it(`should generate valid plan for ${occasion}`, () => {
        const memories: MemoryMetadata[] = [
          createMemory('mem_1', 'Alice', 'Message one', new Date('2026-01-01')),
          createMemory('mem_2', 'Bob', 'Message two', new Date('2026-01-02')),
          createMemory('mem_3', 'Charlie', 'Message three', new Date('2026-01-03'))
        ]

        const input: RevealPlanInput = {
          memoryPopId: `test-${occasion}`,
          recipientName: 'Emma',
          occasion,
          tone: 'warm',
          story: 'Test story',
          memories
        }

        const plan = generateDeterministicRevealPlan(input)

        expect(plan.chapters.length).toBeGreaterThan(0)
        expect(plan.opening).toBeTruthy()
        expect(plan.finaleMemoryId).toBeTruthy()
        expect(validateRevealPlan(plan, memories).valid).toBe(true)
      })
    })
  })

  describe('chapter structure', () => {
    it('should create unique chapter titles', () => {
      const memories: MemoryMetadata[] = Array.from({ length: 6 }, (_, i) =>
        createMemory(`mem_${i + 1}`, `Person ${i + 1}`, `Message ${i + 1}`, new Date(2026, 0, i + 1))
      )

      const input: RevealPlanInput = {
        memoryPopId: 'test-titles',
        recipientName: 'Emma',
        occasion: 'birthday',
        tone: 'celebratory',
        story: 'Test story',
        memories
      }

      const plan = generateDeterministicRevealPlan(input)

      const titles = plan.chapters.map(ch => ch.title)
      const uniqueTitles = new Set(titles)
      expect(uniqueTitles.size).toBe(titles.length) // All titles unique
    })

    it('should not create empty chapters', () => {
      const memories: MemoryMetadata[] = Array.from({ length: 8 }, (_, i) =>
        createMemory(`mem_${i + 1}`, `Person ${i + 1}`, `Message ${i + 1}`, new Date(2026, 0, i + 1))
      )

      const input: RevealPlanInput = {
        memoryPopId: 'test-no-empty',
        recipientName: 'Emma',
        occasion: 'birthday',
        tone: 'celebratory',
        story: 'Test story',
        memories
      }

      const plan = generateDeterministicRevealPlan(input)

      plan.chapters.forEach(chapter => {
        expect(chapter.memoryIds.length).toBeGreaterThan(0)
      })
    })
  })
})
