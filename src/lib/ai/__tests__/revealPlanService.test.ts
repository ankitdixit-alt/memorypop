/**
 * Reveal Plan Service Tests
 *
 * Focused integration tests for AI Director service layer.
 * Tests actual service behavior with synthetic data and mocked external dependencies.
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals'
import { generateRevealPlan, hashInput } from '../revealPlanService'
import type { RevealPlanInput } from '../types'

// Mock fetch for Groq API calls
global.fetch = jest.fn()

describe('revealPlanService', () => {
  const mockInput: RevealPlanInput = {
    memoryPopId: 'test-uuid',
    recipientName: 'Test Recipient',
    occasion: 'birthday',
    tone: 'warm',
    story: 'Test story',
    memories: [
      {
        id: 'mem1',
        contributorName: 'Alice',
        message: 'Happy birthday!',
        photoCount: 1,
        gifCount: 0,
        videoDuration: 0,
        createdAt: new Date('2026-01-01')
      },
      {
        id: 'mem2',
        contributorName: 'Bob',
        message: 'Best wishes!',
        photoCount: 0,
        gifCount: 1,
        videoDuration: 0,
        createdAt: new Date('2026-01-02')
      },
      {
        id: 'mem3',
        contributorName: 'Charlie',
        message: 'Many happy returns!',
        photoCount: 2,
        gifCount: 0,
        videoDuration: 0,
        createdAt: new Date('2026-01-03')
      }
    ]
  }

  beforeEach(() => {
    process.env.ENABLE_AI_DIRECTOR = 'true'
    process.env.GROQ_API_KEY = 'test-key'
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Input Hashing', () => {
    it('produces consistent hash for same input', () => {
      const hash1 = hashInput(mockInput)
      const hash2 = hashInput(mockInput)

      expect(hash1).toBe(hash2)
      expect(hash1).toMatch(/^[a-f0-9]{64}$/) // SHA-256 hex format
    })

    it('produces different hash when memories change', () => {
      const hash1 = hashInput(mockInput)

      const modifiedInput = {
        ...mockInput,
        memories: [
          ...mockInput.memories,
          {
            id: 'mem4',
            contributorName: 'Diana',
            message: 'Congrats!',
            photoCount: 1,
            gifCount: 0,
            videoDuration: 0,
            createdAt: new Date('2026-01-04')
          }
        ]
      }
      const hash2 = hashInput(modifiedInput)

      expect(hash1).not.toBe(hash2)
    })

    it('produces different hash when occasion changes', () => {
      const hash1 = hashInput(mockInput)
      const hash2 = hashInput({ ...mockInput, occasion: 'anniversary' })

      expect(hash1).not.toBe(hash2)
    })
  })

  describe('Generation with AI Enabled', () => {
    it('returns deterministic fallback when AI disabled', async () => {
      process.env.ENABLE_AI_DIRECTOR = 'false'

      const result = await generateRevealPlan(mockInput)

      expect(result.source).toBe('deterministic_fallback')
      expect(result.error).toContain('AI generation disabled')
      expect(result.plan).toBeDefined()
      expect(result.plan.chapters).toHaveLength(2) // Deterministic creates 2 chapters for 3 memories (2-4 range)
      expect(result.plan.opening).toBeDefined()
      expect(result.plan.finaleMemoryId).toBeDefined()
    })

    it('returns deterministic fallback when API key missing', async () => {
      delete process.env.GROQ_API_KEY

      const result = await generateRevealPlan(mockInput)

      expect(result.source).toBe('deterministic_fallback')
      expect(result.error).toContain('GROQ_API_KEY not configured')
      expect(result.plan).toBeDefined()
    })

    it('returns deterministic fallback on Groq timeout', async () => {
      // Mock fetch to throw an abort error (simulates timeout without waiting 30s)
      const abortError = new Error('Request timeout')
      abortError.name = 'AbortError'
      jest.mocked(fetch).mockRejectedValueOnce(abortError)

      const result = await generateRevealPlan(mockInput)

      expect(result.source).toBe('deterministic_fallback')
      expect(result.error).toContain('timeout')
      expect(result.plan).toBeDefined()
    })

    it('returns deterministic fallback on Groq error', async () => {
      jest.mocked(fetch).mockRejectedValueOnce(new Error('Network error'))

      const result = await generateRevealPlan(mockInput)

      expect(result.source).toBe('deterministic_fallback')
      expect(result.error).toContain('Network error')
      expect(result.plan).toBeDefined()
    })

    it('returns deterministic fallback on invalid plan structure', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              opening: 'Test',
              chapters: [], // Invalid: no chapters
              highlightMemoryIds: [],
              finaleMemoryId: 'missing-id', // Invalid: doesn't exist
              reasoningSummary: 'Test'
            })
          }
        }],
        model: 'openai/gpt-oss-120b'
      }

      jest.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
        status: 200,
        statusText: 'OK'
      } as Response)

      const result = await generateRevealPlan(mockInput)

      expect(result.source).toBe('deterministic_fallback')
      expect(result.error).toBeDefined()
      expect(result.plan).toBeDefined()
    })

    it('generates valid plan structure with mocked Groq response', async () => {
      const mockGroqPlan = {
        opening: 'A celebration of friendship',
        chapters: [
          {
            title: 'Chapter 1',
            description: 'The beginning',
            memoryIds: ['mem1', 'mem2']
          },
          {
            title: 'Chapter 2',
            description: 'More memories',
            memoryIds: ['mem3']
          }
        ],
        highlightMemoryIds: ['mem2'],
        finaleMemoryId: 'mem3',
        reasoningSummary: 'Grouped by theme'
      }

      jest.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{
            message: {
              content: JSON.stringify(mockGroqPlan)
            }
          }],
          model: 'openai/gpt-oss-120b'
        }),
        status: 200,
        statusText: 'OK'
      } as Response)

      const result = await generateRevealPlan(mockInput)

      expect(result.source).toBe('ai_generated')
      expect(result.modelName).toBe('openai/gpt-oss-120b')
      expect(result.modelProvider).toBe('groq')
      expect(result.plan).toEqual(mockGroqPlan)
      expect(result.inputHash).toBeDefined()
    })
  })

  describe('Plan Validation', () => {
    it('validates that all memory IDs exist in input', async () => {
      const mockPlanWithUnknownId = {
        opening: 'Test',
        chapters: [{
          title: 'Chapter 1',
          description: 'Test',
          memoryIds: ['mem1', 'unknown-id', 'mem2']
        }],
        highlightMemoryIds: [],
        finaleMemoryId: 'mem1',
        reasoningSummary: 'Test'
      }

      jest.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{
            message: {
              content: JSON.stringify(mockPlanWithUnknownId)
            }
          }],
          model: 'openai/gpt-oss-120b'
        }),
        status: 200,
        statusText: 'OK'
      } as Response)

      const result = await generateRevealPlan(mockInput)

      expect(result.source).toBe('deterministic_fallback')
      expect(result.error).toContain('validation failed')
    })

    it('validates that all memories are included in chapters', async () => {
      const mockPlanMissingMemory = {
        opening: 'Test',
        chapters: [{
          title: 'Chapter 1',
          description: 'Test',
          memoryIds: ['mem1'] // Missing mem2 and mem3
        }],
        highlightMemoryIds: [],
        finaleMemoryId: 'mem1',
        reasoningSummary: 'Test'
      }

      jest.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{
            message: {
              content: JSON.stringify(mockPlanMissingMemory)
            }
          }],
          model: 'openai/gpt-oss-120b'
        }),
        status: 200,
        statusText: 'OK'
      } as Response)

      const result = await generateRevealPlan(mockInput)

      expect(result.source).toBe('deterministic_fallback')
      expect(result.error).toContain('validation failed')
    })
  })
})
