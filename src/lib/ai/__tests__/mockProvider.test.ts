/**
 * Mock AI Provider Tests
 * Verifies test-only mock provider for integration testing
 */

import { generateMockPlan, isMockProviderEnabled, validateMockEnvironment } from '../__mocks__/mockAIProvider'

describe('Mock AI Provider', () => {
  const testMemories = [
    { id: 'mem-1', contributorName: 'Alice', message: 'Happy birthday!' },
    { id: 'mem-2', contributorName: 'Bob', message: 'Best wishes!' },
    { id: 'mem-3', contributorName: 'Carol', message: 'Enjoy your day!' },
    { id: 'mem-4', contributorName: 'Dave', message: 'Cheers!' },
    { id: 'mem-5', contributorName: 'Eve', message: 'Congratulations!' },
    { id: 'mem-6', contributorName: 'Frank', message: 'Have fun!' },
  ]

  const originalEnv = process.env

  beforeEach(() => {
    // Reset environment
    process.env = { ...originalEnv }
    delete process.env.TEST_AI_PROVIDER
    delete process.env.TEST_SCENARIO
  })

  afterAll(() => {
    process.env = originalEnv
  })

  describe('validateMockEnvironment', () => {
    it('rejects when TEST_AI_PROVIDER is not mock', () => {
      const result = validateMockEnvironment()
      expect(result.valid).toBe(false)
      expect(result.error).toContain('TEST_AI_PROVIDER')
    })

    it('rejects when TEST_PROJECT_REF is missing', () => {
      process.env.TEST_AI_PROVIDER = 'mock'
      const result = validateMockEnvironment()
      expect(result.valid).toBe(false)
      expect(result.error).toContain('TEST_PROJECT_REF')
    })

    it('rejects when Supabase URL does not match test ref', () => {
      process.env.TEST_AI_PROVIDER = 'mock'
      process.env.TEST_PROJECT_REF = 'test123'
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://other456.supabase.co'
      const result = validateMockEnvironment()
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Hostname mismatch')
    })

    it('rejects production URL', () => {
      process.env.TEST_AI_PROVIDER = 'mock'
      process.env.TEST_PROJECT_REF = 'gvfpgawbvuttglfscngg'
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://gvfpgawbvuttglfscngg.supabase.co'
      const result = validateMockEnvironment()
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Production')
    })

    it('accepts localhost', () => {
      process.env.TEST_AI_PROVIDER = 'mock'
      process.env.TEST_PROJECT_REF = 'local'
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321'
      const result = validateMockEnvironment()
      expect(result.valid).toBe(true)
    })

    it('accepts matching test project', () => {
      process.env.TEST_AI_PROVIDER = 'mock'
      process.env.TEST_PROJECT_REF = 'test123xyz'
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test123xyz.supabase.co'
      const result = validateMockEnvironment()
      expect(result.valid).toBe(true)
    })
  })

  describe('isMockProviderEnabled', () => {
    it('returns false when TEST_AI_PROVIDER is not set', () => {
      expect(isMockProviderEnabled()).toBe(false)
    })

    it('returns true when TEST_AI_PROVIDER=mock', () => {
      process.env.TEST_AI_PROVIDER = 'mock'
      expect(isMockProviderEnabled()).toBe(true)
    })

    it('returns false when TEST_AI_PROVIDER has other value', () => {
      process.env.TEST_AI_PROVIDER = 'other'
      expect(isMockProviderEnabled()).toBe(false)
    })
  })

  describe('generateMockPlan', () => {
    beforeEach(() => {
      // Set up valid test environment
      process.env.TEST_AI_PROVIDER = 'mock'
      process.env.TEST_PROJECT_REF = 'test-local'
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321'
      process.env.TEST_SCENARIO = 'success'
    })

    it('generates valid plan with chapters and highlights', async () => {
      const plan = await generateMockPlan({
        memoryPopId: 'test-id',
        occasion: 'birthday',
        recipientName: 'John',
        memories: testMemories,
      })

      expect(plan).toMatchObject({
        openingTitle: expect.stringContaining('birthday'),
        chapters: expect.arrayContaining([
          expect.objectContaining({
            title: expect.any(String),
            memoryIds: expect.any(Array),
          }),
        ]),
        highlightMemoryIds: expect.any(Array),
        finaleMemoryId: expect.any(String),
        reasoningSummary: expect.any(String),
      })

      // Verify all memory IDs are included
      const allMemoryIds = plan.chapters.flatMap(c => c.memoryIds)
      expect(allMemoryIds.sort()).toEqual(testMemories.map(m => m.id).sort())
    })

    it('supports rate_limit scenario', async () => {
      process.env.TEST_SCENARIO = 'rate_limit'
      await expect(
        generateMockPlan({
          memoryPopId: 'test-id',
          occasion: 'birthday',
          recipientName: 'John',
          memories: testMemories,
        })
      ).rejects.toThrow('rate limit')
    })

    it('supports server_error scenario', async () => {
      process.env.TEST_SCENARIO = 'server_error'
      await expect(
        generateMockPlan({
          memoryPopId: 'test-id',
          occasion: 'birthday',
          recipientName: 'John',
          memories: testMemories,
        })
      ).rejects.toThrow('server error')
    })

    it('supports invalid_plan scenario', async () => {
      process.env.TEST_SCENARIO = 'invalid_plan'
      const plan = await generateMockPlan({
        memoryPopId: 'test-id',
        occasion: 'birthday',
        recipientName: 'John',
        memories: testMemories,
      })
      // Plan should have invalid memory IDs
      expect(plan.chapters[0].memoryIds[0]).toBe('nonexistent-id-1')
    })

    it('rejects invalid environment', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://other-project.supabase.co'
      await expect(
        generateMockPlan({
          memoryPopId: 'test-id',
          occasion: 'birthday',
          recipientName: 'John',
          memories: testMemories,
        })
      ).rejects.toThrow('security check failed')
    })

    it('includes realistic network delay', async () => {
      const startTime = Date.now()

      await generateMockPlan({
        memoryPopId: 'test-id',
        occasion: 'birthday',
        recipientName: 'John',
        memories: testMemories,
      })

      const duration = Date.now() - startTime
      expect(duration).toBeGreaterThanOrEqual(200) // 200ms delay
    })

    it('generates deterministic plans for same input', async () => {
      const options = {
        memoryPopId: 'test-id',
        occasion: 'birthday',
        recipientName: 'John',
        memories: testMemories,
      }

      const plan1 = await generateMockPlan(options)
      const plan2 = await generateMockPlan(options)

      expect(plan1).toEqual(plan2)
    })

    it('organizes memories into chapters correctly', async () => {
      const plan = await generateMockPlan({
        memoryPopId: 'test-id',
        occasion: 'birthday',
        recipientName: 'John',
        memories: testMemories,
      })

      // 6 memories should create 2 chapters (3 per chapter)
      expect(plan.chapters).toHaveLength(2)
      expect(plan.chapters[0].memoryIds).toHaveLength(3)
      expect(plan.chapters[1].memoryIds).toHaveLength(3)
    })

    it('selects highlights as every 3rd memory', async () => {
      const plan = await generateMockPlan({
        memoryPopId: 'test-id',
        occasion: 'birthday',
        recipientName: 'John',
        memories: testMemories,
      })

      // Every 3rd memory (index 0, 3): mem-1, mem-4
      expect(plan.highlightMemoryIds).toEqual(['mem-1', 'mem-4'])
    })

    it('selects finale as last memory', async () => {
      const plan = await generateMockPlan({
        memoryPopId: 'test-id',
        occasion: 'birthday',
        recipientName: 'John',
        memories: testMemories,
      })

      expect(plan.finaleMemoryId).toBe('mem-6')
    })
  })
})
