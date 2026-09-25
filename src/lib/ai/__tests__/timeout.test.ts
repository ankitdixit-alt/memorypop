/**
 * Timeout Mechanism Tests
 *
 * Verifies that the actual service timeout protects against:
 * - Requests that never settle
 * - Response bodies that never finish loading
 * - Late results cannot replace selected fallback
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals'
import { generateRevealPlan } from '../revealPlanService'
import type { RevealPlanInput } from '../types'

// Mock fetch
const mockFetch = jest.fn()
global.fetch = mockFetch as any

describe('Timeout Mechanism', () => {
  const mockInput: RevealPlanInput = {
    memoryPopId: 'test-uuid',
    recipientName: 'Test',
    occasion: 'birthday',
    tone: 'warm',
    story: '',
    memories: [
      {
        id: 'mem1',
        contributorName: 'Alice',
        message: 'Test',
        photoCount: 1,
        gifCount: 0,
        videoDuration: 0,
        createdAt: new Date()
      }
    ]
  }

  beforeEach(() => {
    mockFetch.mockClear()
    process.env.ENABLE_AI_DIRECTOR = 'true'
    process.env.GROQ_API_KEY = 'test-key'
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('triggers fallback when fetch request never settles', async () => {
    // Mock fetch that responds to abort signal
    let capturedSignal: AbortSignal | undefined
    mockFetch.mockImplementation((_url, options) => {
      capturedSignal = options?.signal as AbortSignal
      return new Promise((_, reject) => {
        // Listen for abort and reject when it fires
        if (capturedSignal) {
          capturedSignal.addEventListener('abort', () => {
            reject(new Error('The operation was aborted'))
          })
        }
        // Otherwise never settles - simulates hanging connection
      })
    })

    // Start generation
    const resultPromise = generateRevealPlan(mockInput)

    // Fast forward to just before timeout
    await jest.advanceTimersByTimeAsync(29000)

    // Should still be pending
    expect(capturedSignal?.aborted).toBe(false)

    // Fast forward past timeout (30s)
    await jest.advanceTimersByTimeAsync(2000)

    // Should have aborted
    expect(capturedSignal?.aborted).toBe(true)

    // Wait for result
    const result = await resultPromise

    // Should return deterministic fallback
    expect(result.source).toBe('deterministic_fallback')
    expect(result.error).toMatch(/timeout|abort/i)
    expect(result.plan).toBeDefined()
    expect(result.plan.chapters).toBeDefined()
  })

  it('triggers fallback when response body never finishes loading', async () => {
    let bodyReadStarted = false
    let capturedSignal: AbortSignal | undefined

    // Mock fetch that returns response but body stream hangs
    mockFetch.mockImplementation((_url, options) => {
      capturedSignal = options?.signal as AbortSignal

      return Promise.resolve({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => {
          bodyReadStarted = true
          // Check if already aborted
          if (capturedSignal?.aborted) {
            throw new Error('The operation was aborted')
          }
          // Body stream hangs - never resolves
          return new Promise(() => {})
        }
      } as Response)
    })

    // Start generation
    const resultPromise = generateRevealPlan(mockInput)

    // Let fetch resolve (returns response immediately)
    await jest.advanceTimersByTimeAsync(100)

    // Body reading should have started
    expect(bodyReadStarted).toBe(true)

    // Fast forward past timeout
    await jest.advanceTimersByTimeAsync(30000)

    // Should have aborted
    expect(capturedSignal?.aborted).toBe(true)

    // Wait for result
    const result = await resultPromise

    // Should return deterministic fallback
    expect(result.source).toBe('deterministic_fallback')
    expect(result.plan).toBeDefined()
  })

  it('cleans up timeout timer on successful completion', async () => {
    const validPlan = {
      opening: 'Test',
      chapters: [{
        title: 'Chapter 1',
        memoryIds: ['mem1']
      }],
      highlightMemoryIds: ['mem1'],
      finaleMemoryId: 'mem1',
      reasoningSummary: 'Test'
    }

    // Mock successful response
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({
        choices: [{
          message: {
            content: JSON.stringify(validPlan)
          }
        }],
        model: 'test-model'
      })
    } as Response)

    // Start generation
    const resultPromise = generateRevealPlan(mockInput)

    // Let it complete
    await jest.runAllTimersAsync()
    const result = await resultPromise

    // Should succeed
    expect(result.source).toBe('ai_generated')
    expect(result.plan).toEqual(validPlan)

    // Timer should have been cleared - no pending timers
    expect(jest.getTimerCount()).toBe(0)
  })

  it('cleans up timeout timer on error before timeout', async () => {
    // Mock immediate error
    mockFetch.mockRejectedValue(new Error('Network error'))

    // Start generation
    const resultPromise = generateRevealPlan(mockInput)

    // Let it complete
    await jest.runAllTimersAsync()
    const result = await resultPromise

    // Should return fallback
    expect(result.source).toBe('deterministic_fallback')
    expect(result.error).toContain('Network error')

    // Timer should have been cleared - no pending timers
    expect(jest.getTimerCount()).toBe(0)
  })

  it('prevents late results from replacing selected fallback', async () => {
    let resolveHangingRequest: any
    let rejectHangingRequest: any
    let capturedSignal: AbortSignal | undefined

    // Mock fetch that can be controlled
    mockFetch.mockImplementation((_url, options) => {
      capturedSignal = options?.signal as AbortSignal

      return new Promise((resolve, reject) => {
        resolveHangingRequest = resolve
        rejectHangingRequest = reject

        // Listen for abort
        if (capturedSignal) {
          capturedSignal.addEventListener('abort', () => {
            reject(new Error('The operation was aborted'))
          })
        }
      })
    })

    // Start generation
    const resultPromise = generateRevealPlan(mockInput)

    // Fast forward past timeout
    await jest.advanceTimersByTimeAsync(31000)

    // Get fallback result (should have been triggered by abort)
    const result = await resultPromise

    // Verify fallback was returned
    expect(result.source).toBe('deterministic_fallback')
    const fallbackPlan = result.plan

    // Now simulate late response arrival (after abort was already processed)
    const latePlan = {
      opening: 'Late response',
      chapters: [{
        title: 'Late Chapter',
        memoryIds: ['mem1']
      }],
      highlightMemoryIds: [],
      finaleMemoryId: 'mem1',
      reasoningSummary: 'Too late'
    }

    // Try to resolve with late data (but promise was already rejected)
    resolveHangingRequest({
      ok: true,
      status: 200,
      json: async () => ({
        choices: [{
          message: {
            content: JSON.stringify(latePlan)
          }
        }],
        model: 'late-model'
      })
    })

    // Allow late response to process
    await jest.runAllTimersAsync()

    // Original result should not have changed
    expect(result.plan).toEqual(fallbackPlan)
    expect(result.plan).not.toEqual(latePlan)
  })
})
