/**
 * Tests for status route authorization and AI Director integration
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals'

// Mock Next.js
const mockNextResponse = {
  json: jest.fn((data: any, init?: any) => ({
    json: async () => data,
    status: init?.status || 200
  }))
}

jest.mock('next/server', () => ({
  NextRequest: class MockNextRequest {},
  NextResponse: mockNextResponse
}))

// Mock Supabase
const mockSupabaseServer = {
  from: jest.fn()
}

jest.mock('@/lib/supabaseServer', () => ({
  supabaseServer: mockSupabaseServer
}))

// Mock prepareRevealPlan
const mockPrepareRevealPlan = jest.fn()
jest.mock('@/lib/ai/prepareRevealPlan', () => ({
  prepareRevealPlan: mockPrepareRevealPlan
}))

describe('Status Route Authorization', () => {
  let PATCH: (request: any, context: any) => Promise<any>

  beforeEach(async () => {
    jest.clearAllMocks()
    process.env.ENABLE_AI_DIRECTOR = 'true'

    // Dynamically import the route handler
    const module = await import('../[id]/status/route')
    PATCH = module.PATCH
  })

  afterEach(() => {
    jest.restoreAllMocks()
    delete process.env.ENABLE_AI_DIRECTOR
  })

  it('rejects requests without creator token', async () => {
    const request = {
      json: async () => ({
        status: 'ready'
        // Missing creatorToken
      })
    }

    const params = Promise.resolve({ id: 'mp-test-1' })

    const response = await PATCH(request, { params })
    const data = await response.json()

    expect(data.error).toContain('creatorToken required')
    expect(response.status).toBe(401)
  })

  it('rejects requests with wrong creator token', async () => {
    const request = {
      json: async () => ({
        status: 'ready',
        creatorToken: 'wrong-token-123'
      })
    }

    const params = Promise.resolve({ id: 'mp-test-1' })

    // Mock fetch to return MemoryPop with different token
    mockSupabaseServer.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: {
              id: 'mp-test-1',
              creator_token: 'correct-token-456',
              is_premium: true,
              status: 'collecting'
            },
            error: null
          })
        })
      }),
      update: jest.fn()
    })

    const response = await PATCH(request, { params })
    const data = await response.json()

    expect(data.error).toContain('Unauthorized')
    expect(response.status).toBe(401)
  })

  it('accepts requests with correct creator token', async () => {
    const request = {
      json: async () => ({
        status: 'ready',
        creatorToken: 'correct-token-456'
      })
    }

    const params = Promise.resolve({ id: 'mp-test-1' })

    mockSupabaseServer.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: {
              id: 'mp-test-1',
              creator_token: 'correct-token-456',
              is_premium: false,
              status: 'collecting'
            },
            error: null
          })
        })
      }),
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              error: null
            })
          })
        })
      })
    })

    const response = await PATCH(request, { params })
    const data = await response.json()

    expect(data.success).toBe(true)
    expect(data.status).toBe('ready')
  })

  it('triggers AI preparation only on transition to ready for Plus gifts', async () => {
    const request = {
      json: async () => ({
        status: 'ready',
        creatorToken: 'correct-token-456'
      })
    }

    const params = Promise.resolve({ id: 'mp-test-1' })

    mockSupabaseServer.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: {
              id: 'mp-test-1',
              creator_token: 'correct-token-456',
              is_premium: true,
              status: 'collecting' // Transitioning from collecting to ready
            },
            error: null
          })
        })
      }),
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              error: null
            })
          })
        })
      })
    })

    mockPrepareRevealPlan.mockResolvedValue({
      success: true,
      source: 'ai_generated',
      fromCache: false
    })

    const response = await PATCH(request, { params })
    const data = await response.json()

    expect(data.success).toBe(true)
    expect(mockPrepareRevealPlan).toHaveBeenCalledWith({
      creatorToken: 'correct-token-456',
      memorypopId: 'mp-test-1',
      forceRegenerate: false
    })
  })

  it('does not trigger AI preparation when already ready', async () => {
    const request = {
      json: async () => ({
        status: 'ready',
        creatorToken: 'correct-token-456'
      })
    }

    const params = Promise.resolve({ id: 'mp-test-1' })

    mockSupabaseServer.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: {
              id: 'mp-test-1',
              creator_token: 'correct-token-456',
              is_premium: true,
              status: 'ready' // Already ready
            },
            error: null
          })
        })
      }),
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              error: null
            })
          })
        })
      })
    })

    const response = await PATCH(request, { params })
    const data = await response.json()

    expect(data.success).toBe(true)
    expect(mockPrepareRevealPlan).not.toHaveBeenCalled()
  })

  it('does not trigger AI preparation for non-Plus gifts', async () => {
    const request = {
      json: async () => ({
        status: 'ready',
        creatorToken: 'correct-token-456'
      })
    }

    const params = Promise.resolve({ id: 'mp-test-1' })

    mockSupabaseServer.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: {
              id: 'mp-test-1',
              creator_token: 'correct-token-456',
              is_premium: false, // Not Plus
              status: 'collecting'
            },
            error: null
          })
        })
      }),
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              error: null
            })
          })
        })
      })
    })

    const response = await PATCH(request, { params })
    const data = await response.json()

    expect(data.success).toBe(true)
    expect(mockPrepareRevealPlan).not.toHaveBeenCalled()
  })

  it('does not trigger AI preparation when feature disabled', async () => {
    process.env.ENABLE_AI_DIRECTOR = 'false'

    const request = {
      json: async () => ({
        status: 'ready',
        creatorToken: 'correct-token-456'
      })
    }

    const params = Promise.resolve({ id: 'mp-test-1' })

    mockSupabaseServer.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: {
              id: 'mp-test-1',
              creator_token: 'correct-token-456',
              is_premium: true,
              status: 'collecting'
            },
            error: null
          })
        })
      }),
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              error: null
            })
          })
        })
      })
    })

    const response = await PATCH(request, { params })
    const data = await response.json()

    expect(data.success).toBe(true)
    expect(mockPrepareRevealPlan).not.toHaveBeenCalled()
  })

  it('continues successfully even if AI preparation fails', async () => {
    const request = {
      json: async () => ({
        status: 'ready',
        creatorToken: 'correct-token-456'
      })
    }

    const params = Promise.resolve({ id: 'mp-test-1' })

    mockSupabaseServer.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: {
              id: 'mp-test-1',
              creator_token: 'correct-token-456',
              is_premium: true,
              status: 'collecting'
            },
            error: null
          })
        })
      }),
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              error: null
            })
          })
        })
      })
    })

    // Preparation fails
    mockPrepareRevealPlan.mockResolvedValue({
      success: false,
      source: 'deterministic_fallback',
      fromCache: false,
      error: 'Generation failed'
    })

    const response = await PATCH(request, { params })
    const data = await response.json()

    // Status update still succeeds
    expect(data.success).toBe(true)
    expect(data.status).toBe('ready')
  })

  it('allows retry for already-ready gifts with forceRegenerate flag', async () => {
    const request = {
      json: async () => ({
        status: 'ready',
        creatorToken: 'correct-token-456',
        forceRegenerate: true
      })
    }

    const params = Promise.resolve({ id: 'mp-test-1' })

    mockSupabaseServer.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: {
              id: 'mp-test-1',
              creator_token: 'correct-token-456',
              is_premium: true,
              status: 'ready' // Already ready
            },
            error: null
          })
        })
      }),
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              error: null
            })
          })
        })
      })
    })

    mockPrepareRevealPlan.mockResolvedValue({
      success: true,
      source: 'ai_generated',
      fromCache: false
    })

    const response = await PATCH(request, { params })
    const data = await response.json()

    expect(data.success).toBe(true)
    // Preparation should be triggered even though already ready
    expect(mockPrepareRevealPlan).toHaveBeenCalledWith({
      creatorToken: 'correct-token-456',
      memorypopId: 'mp-test-1',
      forceRegenerate: true
    })
  })
})
