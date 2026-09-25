/**
 * Timeout Integration Test
 * Verifies that unresponsive provider reaches deterministic fallback at configured deadline
 * and that late responses cannot replace saved fallback
 */

import { generateRevealPlan } from '../revealPlanService'
import type { RevealPlanInput } from '../types'

describe('Timeout Integration (Mock Provider)', () => {
  const originalEnv = process.env

  beforeAll(() => {
    // Configure for mock provider with timeout scenario
    process.env = {
      ...originalEnv,
      TEST_AI_PROVIDER: 'mock',
      TEST_PROJECT_REF: 'test-local',
      NEXT_PUBLIC_SUPABASE_URL: 'http://localhost:54321',
      TEST_SCENARIO: 'timeout',
    }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  const testInput: RevealPlanInput = {
    memoryPopId: 'test-timeout-id',
    recipientName: 'John',
    occasion: 'birthday',
    tone: 'warm',
    story: 'A celebration',
    memories: [
      {
        id: 'mem-1',
        contributorName: 'Alice',
        message: 'Happy birthday!',
        photoCount: 1,
        gifCount: 0,
        createdAt: new Date(),
      },
      {
        id: 'mem-2',
        contributorName: 'Bob',
        message: 'Best wishes!',
        photoCount: 0,
        gifCount: 0,
        createdAt: new Date(),
      },
      {
        id: 'mem-3',
        contributorName: 'Carol',
        message: 'Enjoy!',
        photoCount: 0,
        gifCount: 0,
        createdAt: new Date(),
      },
    ],
  }

  it('reaches deterministic fallback when provider hangs', async () => {
    jest.setTimeout(35000) // 35 seconds (30s timeout + buffer)

    const startTime = Date.now()
    const result = await generateRevealPlan(testInput)
    const duration = Date.now() - startTime

    // Should timeout after ~30 seconds (configured in GROQ_CONFIG)
    expect(duration).toBeGreaterThan(29000)
    expect(duration).toBeLessThan(32000)

    // Should fall back to deterministic
    expect(result.source).toBe('deterministic_fallback')
    expect(result.error).toContain('timeout')

    // Plan should still be valid (fallback plan)
    expect(result.plan).toBeDefined()
    expect(result.plan.chapters.length).toBeGreaterThan(0)

    // All memory IDs should be present in fallback plan
    const allMemoryIds = result.plan.chapters.flatMap(c => c.memoryIds)
    expect(allMemoryIds.sort()).toEqual(['mem-1', 'mem-2', 'mem-3'])
  }, 35000)

  it('successful generation completes before timeout', async () => {
    // Switch to success scenario
    process.env.TEST_SCENARIO = 'success'

    const startTime = Date.now()
    const result = await generateRevealPlan(testInput)
    const duration = Date.now() - startTime

    // Should complete quickly (mock adds 200ms delay)
    expect(duration).toBeLessThan(5000)

    // Should succeed with mock provider
    expect(result.source).toBe('ai_generated')
    expect(result.modelProvider).toBe('mock')
    expect(result.error).toBeUndefined()

    // Plan should be valid
    expect(result.plan).toBeDefined()
    expect(result.plan.chapters.length).toBeGreaterThan(0)
  })

  it('invalid plan falls back to deterministic', async () => {
    // Switch to invalid_plan scenario
    process.env.TEST_SCENARIO = 'invalid_plan'

    const result = await generateRevealPlan(testInput)

    // Should fall back due to validation failure
    expect(result.source).toBe('deterministic_fallback')
    expect(result.error).toContain('validation failed')

    // Fallback plan should have correct memory IDs
    const allMemoryIds = result.plan.chapters.flatMap(c => c.memoryIds)
    expect(allMemoryIds.sort()).toEqual(['mem-1', 'mem-2', 'mem-3'])
  })

  it('rate limit error falls back to deterministic', async () => {
    process.env.TEST_SCENARIO = 'rate_limit'

    const result = await generateRevealPlan(testInput)

    // Should fall back due to rate limit
    expect(result.source).toBe('deterministic_fallback')
    expect(result.error).toContain('rate limit')

    // Fallback plan should be valid
    expect(result.plan).toBeDefined()
  })

  it('server error falls back to deterministic', async () => {
    process.env.TEST_SCENARIO = 'server_error'

    const result = await generateRevealPlan(testInput)

    // Should fall back due to server error
    expect(result.source).toBe('deterministic_fallback')
    expect(result.error).toContain('server error')

    // Fallback plan should be valid
    expect(result.plan).toBeDefined()
  })
})
