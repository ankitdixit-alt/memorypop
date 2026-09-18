/**
 * Shared scheduling logic for Groq experiments
 */

const MIN_DELAY_MS = 1000
const TARGET_TPM = 7000

/**
 * Calculate delay for next request
 * NO CAPPING on retry-after - respect server fully
 */
export function calculateDelay(tokensUsed: number | undefined, retryAfterSeconds?: number): number {
  // Server-requested delay takes priority (no cap)
  if (retryAfterSeconds && retryAfterSeconds > 0) {
    return retryAfterSeconds * 1000 + 2000 // Add 2s buffer
  }

  // Token-based delay to stay under target TPM
  if (tokensUsed && tokensUsed > 0) {
    const calculatedMs = Math.ceil((tokensUsed * 60000) / TARGET_TPM)
    return Math.max(MIN_DELAY_MS, calculatedMs)
  }

  return MIN_DELAY_MS
}

/**
 * Check if delay fits within remaining execution window
 */
export function fitsInWindow(delayMs: number, windowStartMs: number, maxWindowMs: number): boolean {
  const elapsed = Date.now() - windowStartMs
  const remaining = maxWindowMs - elapsed
  return delayMs <= remaining
}
