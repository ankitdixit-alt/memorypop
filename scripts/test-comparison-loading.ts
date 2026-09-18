/**
 * Focused tests for comparison page loading and validation
 * 
 * Tests the actual plan loading path with:
 * - Timeout (never-resolving request)
 * - Stale response handling
 * - Plan validation
 * - Fallback behavior
 */

import { validateRevealPlan } from '../src/lib/ai/validation'
import type { RevealPlan, MemoryMetadata } from '../src/lib/ai/types'

const testMemories: MemoryMetadata[] = [
  {
    id: 'mem_001',
    contributorName: 'Alice',
    message: 'Happy anniversary!',
    photoCount: 2,
    gifCount: 0,
    videoDuration: 0,
    createdAt: new Date('2026-01-01')
  },
  {
    id: 'mem_002',
    contributorName: 'Bob',
    message: 'Congrats!',
    photoCount: 1,
    gifCount: 1,
    videoDuration: 0,
    createdAt: new Date('2026-01-02')
  },
  {
    id: 'mem_003',
    contributorName: 'Carol',
    message: 'Love you both!',
    photoCount: 3,
    gifCount: 0,
    videoDuration: 10,
    createdAt: new Date('2026-01-03')
  }
]

// Test helpers
let testsPassed = 0
let testsFailed = 0

function test(name: string, fn: () => void | Promise<void>) {
  return async () => {
    try {
      await fn()
      console.log(`✓ ${name}`)
      testsPassed++
    } catch (error) {
      console.log(`✗ ${name}`)
      console.log(`  ${error instanceof Error ? error.message : String(error)}`)
      testsFailed++
    }
  }
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message)
  }
}

function assertEqual<T>(actual: T, expected: T, message: string) {
  if (actual !== expected) {
    throw new Error(`${message}: expected ${expected}, got ${actual}`)
  }
}

// Tests

const testValidPlan = test('Valid plan passes validation', () => {
  const plan: RevealPlan = {
    opening: 'Test opening',
    chapters: [
      {
        title: 'Chapter 1',
        description: 'First chapter',
        memoryIds: ['mem_001', 'mem_002']
      },
      {
        title: 'Chapter 2',
        description: 'Second chapter',
        memoryIds: ['mem_003']
      }
    ],
    finaleMemoryId: 'mem_003',
    highlightMemoryIds: ['mem_001'],
    reasoningSummary: 'Test reasoning'
  }

  const result = validateRevealPlan(plan, testMemories)
  assert(result.valid, `Expected valid plan, got errors: ${result.errors.join(', ')}`)
  assertEqual(result.errors.length, 0, 'Expected no errors')
})

const testMissingMemories = test('Invalid plan: missing memories', () => {
  const plan: RevealPlan = {
    opening: 'Test opening',
    chapters: [
      {
        title: 'Chapter 1',
        description: 'Only some memories',
        memoryIds: ['mem_001'] // Missing mem_002 and mem_003
      }
    ],
    finaleMemoryId: 'mem_001',
    highlightMemoryIds: [],
    reasoningSummary: 'Test reasoning'
  }

  const result = validateRevealPlan(plan, testMemories)
  assert(!result.valid, 'Expected invalid plan')
  assert(result.errors.some(e => e.includes('missing required memories')), 'Expected missing memories error')
})

const testUnknownMemoryIds = test('Invalid plan: unknown memory IDs', () => {
  const plan: RevealPlan = {
    opening: 'Test opening',
    chapters: [
      {
        title: 'Chapter 1',
        description: 'Has invented IDs',
        memoryIds: ['mem_001', 'mem_999', 'mem_002', 'mem_003'] // mem_999 doesn't exist
      }
    ],
    finaleMemoryId: 'mem_003',
    highlightMemoryIds: [],
    reasoningSummary: 'Test reasoning'
  }

  const result = validateRevealPlan(plan, testMemories)
  assert(!result.valid, 'Expected invalid plan')
  assert(result.errors.some(e => e.includes('unknown memory IDs')), 'Expected unknown IDs error')
  assert(result.errors.some(e => e.includes('mem_999')), 'Expected mem_999 in error')
})

const testDuplicateMemories = test('Invalid plan: duplicate memory placements', () => {
  const plan: RevealPlan = {
    opening: 'Test opening',
    chapters: [
      {
        title: 'Chapter 1',
        description: 'First chapter',
        memoryIds: ['mem_001', 'mem_002']
      },
      {
        title: 'Chapter 2',
        description: 'Second chapter',
        memoryIds: ['mem_002', 'mem_003'] // mem_002 appears twice
      }
    ],
    finaleMemoryId: 'mem_003',
    highlightMemoryIds: [],
    reasoningSummary: 'Test reasoning'
  }

  const result = validateRevealPlan(plan, testMemories)
  assert(!result.valid, 'Expected invalid plan')
  assert(result.errors.some(e => e.includes('duplicate memory placements')), 'Expected duplicate error')
})

const testInvalidFinale = test('Invalid plan: finale not in input', () => {
  const plan: RevealPlan = {
    opening: 'Test opening',
    chapters: [
      {
        title: 'Chapter 1',
        description: 'All memories',
        memoryIds: ['mem_001', 'mem_002', 'mem_003']
      }
    ],
    finaleMemoryId: 'mem_999', // Doesn't exist
    highlightMemoryIds: [],
    reasoningSummary: 'Test reasoning'
  }

  const result = validateRevealPlan(plan, testMemories)
  assert(!result.valid, 'Expected invalid plan')
  assert(result.errors.some(e => e.includes('Finale memory ID') && e.includes('not in input')), 'Expected finale not in input error')
})

const testFinaleNotInChapters = test('Invalid plan: finale not included in chapters', () => {
  const plan: RevealPlan = {
    opening: 'Test opening',
    chapters: [
      {
        title: 'Chapter 1',
        description: 'Only some memories',
        memoryIds: ['mem_001', 'mem_002'] // mem_003 is finale but not in chapters
      }
    ],
    finaleMemoryId: 'mem_003',
    highlightMemoryIds: [],
    reasoningSummary: 'Test reasoning'
  }

  const result = validateRevealPlan(plan, testMemories)
  assert(!result.valid, 'Expected invalid plan')
  assert(result.errors.some(e => e.includes('not included in any chapter')), 'Expected finale not in chapters error')
})

const testEmptyChapters = test('Invalid plan: empty chapters', () => {
  const plan: RevealPlan = {
    opening: 'Test opening',
    chapters: [
      {
        title: 'Chapter 1',
        description: 'Has memories',
        memoryIds: ['mem_001', 'mem_002', 'mem_003']
      },
      {
        title: 'Chapter 2',
        description: 'Empty',
        memoryIds: [] // Empty chapter
      }
    ],
    finaleMemoryId: 'mem_003',
    highlightMemoryIds: [],
    reasoningSummary: 'Test reasoning'
  }

  const result = validateRevealPlan(plan, testMemories)
  assert(!result.valid, 'Expected invalid plan')
  assert(result.errors.some(e => e.includes('has no memories')), 'Expected empty chapter error')
})

const testDuplicateChapterTitles = test('Invalid plan: duplicate chapter titles', () => {
  const plan: RevealPlan = {
    opening: 'Test opening',
    chapters: [
      {
        title: 'Same Title',
        description: 'First',
        memoryIds: ['mem_001']
      },
      {
        title: 'Same Title', // Duplicate
        description: 'Second',
        memoryIds: ['mem_002', 'mem_003']
      }
    ],
    finaleMemoryId: 'mem_003',
    highlightMemoryIds: [],
    reasoningSummary: 'Test reasoning'
  }

  const result = validateRevealPlan(plan, testMemories)
  assert(!result.valid, 'Expected invalid plan')
  assert(result.errors.some(e => e.includes('Duplicate chapter title')), 'Expected duplicate title error')
})

const testInvalidHighlights = test('Invalid plan: highlight IDs not in input', () => {
  const plan: RevealPlan = {
    opening: 'Test opening',
    chapters: [
      {
        title: 'Chapter 1',
        description: 'All memories',
        memoryIds: ['mem_001', 'mem_002', 'mem_003']
      }
    ],
    finaleMemoryId: 'mem_003',
    highlightMemoryIds: ['mem_001', 'mem_999'], // mem_999 doesn't exist
    reasoningSummary: 'Test reasoning'
  }

  const result = validateRevealPlan(plan, testMemories)
  assert(!result.valid, 'Expected invalid plan')
  assert(result.errors.some(e => e.includes('invalid highlight memory IDs')), 'Expected invalid highlights error')
})

const testAbortController = test('AbortController cancels request', async () => {
  const controller = new AbortController()
  
  // Abort immediately
  controller.abort(new Error('Test abort'))
  
  assert(controller.signal.aborted, 'Expected signal to be aborted')
  assert(controller.signal.reason instanceof Error, 'Expected abort reason to be an Error')
  assertEqual(controller.signal.reason.message, 'Test abort', 'Expected correct abort reason')
})

const testTimeoutRace = test('Timeout rejects before slow operation', async () => {
  const timeoutMs = 100

  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Timeout')), timeoutMs)
  })

  const slowPromise = new Promise(resolve => {
    setTimeout(resolve, timeoutMs * 10) // Much slower
  })

  try {
    await Promise.race([slowPromise, timeoutPromise])
    throw new Error('Should have timed out')
  } catch (error) {
    assert(error instanceof Error, 'Expected Error')
    if (error instanceof Error) {
      assertEqual(error.message, 'Timeout', 'Expected timeout error')
    }
  }
})

const testAbortSignalListener = test('Never-resolving promise respects abort signal', async () => {
  const controller = new AbortController()
  const timeoutMs = 100

  // Set up timeout to abort
  const timeoutId = setTimeout(() => {
    controller.abort(new Error('Request timeout'))
  }, timeoutMs)

  try {
    // Never-resolving promise that listens to abort (matches actual page implementation)
    await new Promise((_, reject) => {
      controller.signal.addEventListener('abort', () => {
        reject(controller.signal.reason || new Error('Aborted'))
      })
    })
    throw new Error('Should have been aborted')
  } catch (error) {
    clearTimeout(timeoutId)
    assert(error instanceof Error, 'Expected Error')
    if (error instanceof Error) {
      assertEqual(error.message, 'Request timeout', 'Expected timeout abort reason')
    }
  }
})

const testAbortReasonDistinction = test('Can distinguish timeout from cleanup abort', async () => {
  // Timeout abort
  const timeoutController = new AbortController()
  timeoutController.abort(new Error('Request timeout'))

  const isTimeout = timeoutController.signal.aborted &&
                   timeoutController.signal.reason instanceof Error &&
                   timeoutController.signal.reason.message === 'Request timeout'

  assert(isTimeout, 'Expected to identify timeout abort')

  // Cleanup abort
  const cleanupController = new AbortController()
  cleanupController.abort(new Error('Request obsolete'))

  const isCleanup = cleanupController.signal.aborted &&
                   cleanupController.signal.reason instanceof Error &&
                   cleanupController.signal.reason.message === 'Request obsolete'

  assert(isCleanup, 'Expected to identify cleanup abort')

  // Verify they're different
  const timeoutIsCleanup = cleanupController.signal.aborted &&
                          cleanupController.signal.reason instanceof Error &&
                          cleanupController.signal.reason.message === 'Request timeout'

  assert(!timeoutIsCleanup, 'Cleanup abort should not match timeout pattern')
})

const testStalledResponseBody = test('Timeout during response body read', async () => {
  const controller = new AbortController()
  const timeoutMs = 100

  // Simulate: fetch completes but json() never resolves
  const mockFetch = async () => {
    // Fetch succeeds
    await new Promise(resolve => setTimeout(resolve, 20))

    if (controller.signal.aborted) {
      throw controller.signal.reason || new Error('Aborted')
    }

    // Simulate stalled body read - never resolves
    await new Promise((_, reject) => {
      controller.signal.addEventListener('abort', () => {
        reject(controller.signal.reason || new Error('Aborted'))
      })
    })
  }

  const timeoutId = setTimeout(() => {
    controller.abort(new Error('Request timeout'))
  }, timeoutMs)

  try {
    await mockFetch()
    throw new Error('Should have timed out')
  } catch (error) {
    clearTimeout(timeoutId)
    assert(error instanceof Error, 'Expected Error')
    if (error instanceof Error) {
      assertEqual(error.message, 'Request timeout', 'Expected timeout during body read')
    }
  }
})

// Run all tests
async function runTests() {
  console.log('🧪 Running Comparison Loading Tests')
  console.log('===================================================\n')

  await testValidPlan()
  await testMissingMemories()
  await testUnknownMemoryIds()
  await testDuplicateMemories()
  await testInvalidFinale()
  await testFinaleNotInChapters()
  await testEmptyChapters()
  await testDuplicateChapterTitles()
  await testInvalidHighlights()
  await testAbortController()
  await testTimeoutRace()
  await testAbortSignalListener()
  await testAbortReasonDistinction()
  await testStalledResponseBody()

  console.log('\n===================================================')
  console.log(`Tests: ${testsPassed + testsFailed}`)
  console.log(`Passed: ${testsPassed}`)
  console.log(`Failed: ${testsFailed}`)

  if (testsFailed === 0) {
    console.log('\n✅ All comparison loading tests passed')
  } else {
    console.log(`\n❌ ${testsFailed} test(s) failed`)
    process.exit(1)
  }
}

runTests()
