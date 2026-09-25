/**
 * Mock AI Provider for Integration Testing
 *
 * Provides deterministic AI responses for testing the complete generation flow
 * without making live API calls to external providers.
 *
 * SECURITY: Only activates in test environment with TEST_AI_PROVIDER=mock
 * and valid TEST_PROJECT_REF matching the Supabase URL.
 *
 * Test scenarios (controlled by TEST_SCENARIO environment variable):
 *   - success (default): Returns valid plan immediately
 *   - timeout: Hangs until application timeout triggers fallback
 *   - rate_limit: Throws rate limit error
 *   - server_error: Throws server error
 *   - invalid_plan: Returns malformed plan that fails validation
 */

import type { RevealPlan } from '../types'

export interface MockAIProviderOptions {
  memoryPopId: string
  occasion: string
  recipientName: string
  memories: Array<{
    id: string
    contributorName: string
    message: string
  }>
  timeout?: number // Timeout in milliseconds for abort signal
}

/**
 * Verify mock provider can only run in approved test environment
 */
export function validateMockEnvironment(): { valid: boolean; error?: string } {
  // Must have TEST_AI_PROVIDER=mock
  if (process.env.TEST_AI_PROVIDER !== 'mock') {
    return { valid: false, error: 'TEST_AI_PROVIDER must be "mock"' }
  }

  // Must have explicit integration test opt-in
  const isIntegrationTest = process.env.INTEGRATION_TEST === 'true' || process.env.NODE_ENV === 'test'
  if (!isIntegrationTest) {
    return { valid: false, error: 'INTEGRATION_TEST must be "true" or NODE_ENV must be "test"' }
  }

  // Must have test project ref
  const testRef = process.env.TEST_PROJECT_REF
  if (!testRef) {
    return { valid: false, error: 'TEST_PROJECT_REF not set' }
  }

  // Parse and validate Supabase URL
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  if (!supabaseUrl) {
    return { valid: false, error: 'NEXT_PUBLIC_SUPABASE_URL not set' }
  }

  let hostname: string
  try {
    const url = new URL(supabaseUrl)
    hostname = url.hostname
  } catch (error) {
    return { valid: false, error: 'NEXT_PUBLIC_SUPABASE_URL is malformed' }
  }

  // Check for localhost (exact match)
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1'

  // Check for exact test project hostname match
  const expectedTestHostname = `${testRef}.supabase.co`
  const matchesTestRef = hostname === expectedTestHostname

  if (!isLocalhost && !matchesTestRef) {
    return {
      valid: false,
      error: `Hostname mismatch: expected localhost or ${expectedTestHostname}, got ${hostname}`
    }
  }

  // Block known production hostnames (multiple for safety)
  const productionHostnames = [
    'gvfpgawbvuttglfscngg.supabase.co',
    // Add other production hostnames here if they exist
  ]

  for (const prodHostname of productionHostnames) {
    if (hostname === prodHostname) {
      return { valid: false, error: `Mock provider blocked: Production hostname ${hostname} detected` }
    }
  }

  return { valid: true }
}

/**
 * Mock AI generation with deterministic responses
 * Simulates the complete generation flow including delays and errors
 */
export async function generateMockPlan(
  options: MockAIProviderOptions
): Promise<RevealPlan> {
  const { memoryPopId, occasion, recipientName, memories, timeout } = options

  // Validate test environment
  const envCheck = validateMockEnvironment()
  if (!envCheck.valid) {
    throw new Error(`Mock provider security check failed: ${envCheck.error}`)
  }

  // Get test scenario from environment (default: success)
  const scenario = process.env.TEST_SCENARIO || 'success'

  // Simulate network delay (realistic 200ms)
  await new Promise(resolve => setTimeout(resolve, 200))

  // Test scenario: timeout
  // Hangs until application timeout (30s default) triggers
  if (scenario === 'timeout') {
    // Wait indefinitely - let the application timeout mechanism handle it
    await new Promise(() => {}) // Never resolves
  }

  // Test scenario: rate limit
  if (scenario === 'rate_limit') {
    throw new Error('Mock provider rate limit: Too many requests')
  }

  // Test scenario: server error
  if (scenario === 'server_error') {
    throw new Error('Mock provider server error: Internal server error')
  }

  // Test scenario: invalid plan
  if (scenario === 'invalid_plan') {
    // Return plan with invalid memory IDs (will fail validation)
    return {
      openingTitle: 'Invalid Plan',
      chapters: [
        { title: 'Chapter 1', memoryIds: ['nonexistent-id-1', 'nonexistent-id-2'] }
      ],
      highlightMemoryIds: ['nonexistent-id-3'],
      finaleMemoryId: 'nonexistent-id-4',
      reasoningSummary: 'Invalid plan for testing validation failures'
    }
  }

  // Default: Successful generation
  // Create a deterministic plan based on inputs
  const memoryIds = memories.map(m => m.id)

  // Group memories into chapters (3 memories per chapter)
  const chapters: Array<{ title: string; memoryIds: string[] }> = []
  for (let i = 0; i < memoryIds.length; i += 3) {
    const chapterMemories = memoryIds.slice(i, i + 3)
    chapters.push({
      title: `Chapter ${chapters.length + 1}`,
      memoryIds: chapterMemories
    })
  }

  // Select highlights (every 3rd memory)
  const highlightMemoryIds = memoryIds.filter((_, index) => index % 3 === 0)

  // Finale is the last memory
  const finaleMemoryId = memoryIds[memoryIds.length - 1]

  const plan: RevealPlan = {
    openingTitle: `A ${occasion} Celebration for ${recipientName}`,
    chapters,
    highlightMemoryIds,
    finaleMemoryId,
    reasoningSummary: `Mock AI generated plan with ${memories.length} memories organized into ${chapters.length} chapters. This is a deterministic test response.`
  }

  return plan
}

/**
 * Check if mock provider is enabled
 */
export function isMockProviderEnabled(): boolean {
  return process.env.TEST_AI_PROVIDER === 'mock'
}

/**
 * Get provider name for logging
 */
export function getMockProviderName(): string {
  return 'mock-ai-provider'
}
