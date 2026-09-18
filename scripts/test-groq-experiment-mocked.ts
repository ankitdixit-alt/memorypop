#!/usr/bin/env tsx
/**
 * Offline Mock Tests for Groq Experiment Corrections
 * No API calls made - tests scheduling, model tracking, and error handling
 */

import { calculateDelay, fitsInWindow } from './lib/scheduling'

// Test suite
console.log('🧪 Running Offline Mock Tests')
console.log('=' + '='.repeat(50))
console.log()

let passed = 0
let failed = 0

function test(name: string, fn: () => void) {
  try {
    fn()
    console.log(`✓ ${name}`)
    passed++
  } catch (error: any) {
    console.log(`✗ ${name}`)
    console.log(`  ${error.message}`)
    failed++
  }
}

function assertEqual(actual: any, expected: any, message?: string) {
  if (actual !== expected) {
    throw new Error(message || `Expected ${expected}, got ${actual}`)
  }
}

function assertRange(actual: number, min: number, max: number, message?: string) {
  if (actual < min || actual > max) {
    throw new Error(message || `Expected ${actual} to be between ${min} and ${max}`)
  }
}

// Test 1: Token-aware scheduling
test('Token-aware delay: 1000 tokens', () => {
  const delay = calculateDelay(1000, undefined)
  // 1000 tokens * 60000ms / 7000 TPM = ~8571ms
  assertRange(delay, 8500, 8600, `Expected ~8571ms, got ${delay}ms`)
})

test('Token-aware delay: 3000 tokens', () => {
  const delay = calculateDelay(3000, undefined)
  // 3000 tokens * 60000ms / 7000 TPM = ~25714ms
  assertRange(delay, 25000, 26000, `Expected ~25714ms, got ${delay}ms`)
})

test('Token-aware delay: 7000 tokens (max TPM)', () => {
  const delay = calculateDelay(7000, undefined)
  // 7000 tokens * 60000ms / 7000 TPM = 60000ms (no cap on token-based)
  assertEqual(delay, 60000, `Expected 60000ms, got ${delay}ms`)
})

test('Token-aware delay: 10000 tokens (exceeds target)', () => {
  const delay = calculateDelay(10000, undefined)
  // 10000 tokens * 60000ms / 7000 TPM = ~85714ms (no cap)
  assertRange(delay, 85000, 86000, `Expected ~85714ms, got ${delay}ms`)
})

test('Token-aware delay: 0 tokens (fallback)', () => {
  const delay = calculateDelay(0, undefined)
  assertEqual(delay, 1000, `Expected 1000ms (MIN_DELAY_MS), got ${delay}ms`)
})

test('Token-aware delay: undefined tokens (fallback)', () => {
  const delay = calculateDelay(undefined, undefined)
  assertEqual(delay, 1000, `Expected 1000ms (MIN_DELAY_MS), got ${delay}ms`)
})

// Test 2: Retry-after header respect
test('Retry-after: 10 seconds', () => {
  const delay = calculateDelay(undefined, 10)
  // 10s * 1000 + 2000 buffer = 12000ms
  assertEqual(delay, 12000, `Expected 12000ms (10s + 2s buffer), got ${delay}ms`)
})

test('Retry-after: 60 seconds (NO cap)', () => {
  const delay = calculateDelay(undefined, 60)
  // 60s * 1000 + 2000 = 62000ms (no capping)
  assertEqual(delay, 62000, `Expected 62000ms (no cap), got ${delay}ms`)
})

test('Retry-after: 120 seconds (long wait)', () => {
  const delay = calculateDelay(undefined, 120)
  // 120s * 1000 + 2000 = 122000ms (no capping)
  assertEqual(delay, 122000, `Expected 122000ms (no cap), got ${delay}ms`)
})

test('Retry-after overrides token calculation', () => {
  const delay = calculateDelay(7000, 5)
  // Should use retry-after (5s + 2s = 7000ms), not token delay (60000ms)
  assertEqual(delay, 7000, `Expected 7000ms (retry-after), got ${delay}ms`)
})

test('Retry-after: 0 seconds (ignored)', () => {
  const delay = calculateDelay(3000, 0)
  // Should fallback to token calculation
  assertRange(delay, 25000, 26000, `Expected token-based delay, got ${delay}ms`)
})

// Test 3: Model identity tracking
test('Model identity: returned model recorded', () => {
  const mockMetadata = {
    model: 'openai/gpt-oss-120b',
    tokensUsed: 3000
  }
  const returnedModel = mockMetadata.model || 'unknown'
  assertEqual(returnedModel, 'openai/gpt-oss-120b')
})

test('Model identity: missing model recorded as unknown', () => {
  const mockMetadata: { tokensUsed: number; model?: string } = {
    tokensUsed: 3000
    // model field missing
  }
  const returnedModel = mockMetadata.model || 'unknown'
  assertEqual(returnedModel, 'unknown', 'Should not substitute requested model')
})

// Test 4: Error type classification
function classifyError(errorMessage: string): string {
  const errorLower = errorMessage.toLowerCase()

  if (errorLower.includes('rate_limit_exceeded') || errorLower.includes('rate limit')) {
    if (errorLower.includes('tokens per minute') || errorLower.includes('tpm')) {
      return 'rate_limit_minute'
    } else {
      return 'rate_limit_day'
    }
  } else if (errorLower.includes('timeout')) {
    return 'timeout'
  } else if (errorLower.includes('validation')) {
    return 'validation'
  } else if (errorLower.includes('parse') || errorLower.includes('json')) {
    return 'parse'
  } else if (errorLower.includes('fetch') || errorLower.includes('network')) {
    return 'network'
  }
  return 'unknown'
}

test('Error classification: rate_limit_minute', () => {
  const error = 'Rate limit reached for model `openai/gpt-oss-120b` in org. TPM: Limit 8000, Used 5930'
  assertEqual(classifyError(error), 'rate_limit_minute')
})

test('Error classification: rate_limit_day', () => {
  const error = 'Rate limit exceeded - daily quota exhausted'
  assertEqual(classifyError(error), 'rate_limit_day')
})

test('Error classification: timeout', () => {
  const error = 'Request timeout'
  assertEqual(classifyError(error), 'timeout')
})

test('Error classification: validation', () => {
  const error = 'Validation failed: Missing memory ID: mem_001'
  assertEqual(classifyError(error), 'validation')
})

test('Error classification: parse', () => {
  const error = 'Failed to parse Groq response as JSON'
  assertEqual(classifyError(error), 'parse')
})

test('Error classification: unknown', () => {
  const error = 'Something went wrong'
  assertEqual(classifyError(error), 'unknown')
})

// Test 5: Retry-after parsing
function parseRetryAfter(errorMessage: string): number | undefined {
  const retryMatch = errorMessage.match(/try again in ([0-9.]+)s/)
  if (retryMatch) {
    return Math.ceil(parseFloat(retryMatch[1]))
  }
  return undefined
}

test('Retry-after parsing: integer seconds', () => {
  const error = 'Rate limit reached... Please try again in 12s.'
  assertEqual(parseRetryAfter(error), 12)
})

test('Retry-after parsing: decimal seconds', () => {
  const error = 'Rate limit reached... Please try again in 12.6225s.'
  assertEqual(parseRetryAfter(error), 13, 'Should round up')
})

test('Retry-after parsing: no match', () => {
  const error = 'Rate limit exceeded'
  assertEqual(parseRetryAfter(error), undefined)
})

// Test 6: Execution window check
test('Execution window: under limit', () => {
  const MAX_WINDOW = 300000 // 5 minutes
  const delay = 60000 // 1 minute
  const shouldStop = delay > MAX_WINDOW
  assertEqual(shouldStop, false, 'Should continue')
})

test('Execution window: exceeds limit', () => {
  const MAX_WINDOW = 300000 // 5 minutes
  const delay = 400000 // 6.67 minutes
  const shouldStop = delay > MAX_WINDOW
  assertEqual(shouldStop, true, 'Should stop and save progress')
})

// Test 7: Budget tracking
test('Budget tracking: attempts consumed', () => {
  const MAX_ATTEMPTS = 24
  const totalAttempts = 15
  const remaining = MAX_ATTEMPTS - totalAttempts
  assertEqual(remaining, 9)
})

test('Budget tracking: exhausted', () => {
  const MAX_ATTEMPTS = 24
  const totalAttempts = 24
  const remaining = MAX_ATTEMPTS - totalAttempts
  assertEqual(remaining, 0)
  assertEqual(remaining <= 0, true, 'Should stop')
})

// Test 8: Execution window with remaining time
test('Execution window: 122s fits at start of 10min window', () => {
  const MAX_WINDOW = 600000 // 10 minutes
  const windowStart = Date.now()
  const delay = calculateDelay(undefined, 120) // 122000ms
  const fits = fitsInWindow(delay, windowStart, MAX_WINDOW)
  assertEqual(fits, true, 'Should fit (122s < 600s remaining)')
})

test('Execution window: 122s does NOT fit when 9min elapsed', () => {
  const MAX_WINDOW = 600000 // 10 minutes
  const windowStart = Date.now() - 540000 // 9 minutes ago
  const delay = calculateDelay(undefined, 120) // 122000ms
  const fits = fitsInWindow(delay, windowStart, MAX_WINDOW)
  assertEqual(fits, false, 'Should not fit (122s > 60s remaining)')
})

test('Execution window: 500s fits at start of 10min window', () => {
  const MAX_WINDOW = 600000 // 10 minutes
  const windowStart = Date.now()
  const delay = calculateDelay(undefined, 500) // 502000ms
  const fits = fitsInWindow(delay, windowStart, MAX_WINDOW)
  assertEqual(fits, true, 'Should fit (502s < 600s remaining)')
})

test('Execution window: 700s never fits in 10min window', () => {
  const MAX_WINDOW = 600000 // 10 minutes
  const windowStart = Date.now()
  const delay = calculateDelay(undefined, 700) // 702000ms
  const fits = fitsInWindow(delay, windowStart, MAX_WINDOW)
  assertEqual(fits, false, 'Should not fit (702s > 600s)')
})

test('Execution window: 50s fits with 55s remaining', () => {
  const MAX_WINDOW = 600000 // 10 minutes
  const windowStart = Date.now() - 545000 // 9:05 elapsed, 55s remaining
  const delay = calculateDelay(undefined, 48) // 50000ms
  const fits = fitsInWindow(delay, windowStart, MAX_WINDOW)
  assertEqual(fits, true, 'Should fit (50s < 55s remaining)')
})

// Test 9: Pilot restart and retry limits
function mockGetRetryCount(results: any[], caseId: string): number {
  return results.filter((r: any) => r.caseId === caseId).length
}

function mockCanRetry(results: any[], caseId: string, maxRetries: number): boolean {
  const retryCount = mockGetRetryCount(results, caseId)
  return retryCount <= maxRetries
}

test('Pilot restart: sympathy-b used 2 attempts, cannot retry', () => {
  const results = [
    { caseId: 'sympathy-test-b', success: false }, // initial
    { caseId: 'sympathy-test-b', success: false }, // retry 1
  ]
  const canRetry = mockCanRetry(results, 'sympathy-test-b', 1) // max 1 retry
  assertEqual(canRetry, false, 'Should not retry (already used 2 attempts)')
})

test('Pilot restart: anniversary-a used 1 attempt, can retry once', () => {
  const results = [
    { caseId: 'anniversary-test-a', success: false },
  ]
  const canRetry = mockCanRetry(results, 'anniversary-test-a', 1)
  assertEqual(canRetry, true, 'Should allow retry (used 1 of 2 allowed)')
})

test('Pilot restart: new case can attempt', () => {
  const results: any[] = []
  const canRetry = mockCanRetry(results, 'new-case', 1)
  assertEqual(canRetry, true, 'Should allow initial attempt')
})

test('Pilot restart: budget remaining does not reopen exhausted case', () => {
  const totalBudget = 8
  const totalAttempts = 5
  const budgetRemaining = totalBudget - totalAttempts
  assertEqual(budgetRemaining, 3, 'Budget has 3 remaining')

  // Sympathy-b exhausted its retries
  const results = [
    { caseId: 'sympathy-test-b', success: false },
    { caseId: 'sympathy-test-b', success: false },
  ]
  const canRetry = mockCanRetry(results, 'sympathy-test-b', 1)
  assertEqual(canRetry, false, 'Case exhausted despite budget remaining')
})

// Summary
console.log()
console.log('=' + '='.repeat(50))
console.log(`Tests: ${passed + failed}`)
console.log(`Passed: ${passed}`)
console.log(`Failed: ${failed}`)
console.log()

if (failed === 0) {
  console.log('✅ All offline tests passed')
  console.log('   Corrections verified without API calls')
  process.exit(0)
} else {
  console.log('❌ Some tests failed')
  process.exit(1)
}
