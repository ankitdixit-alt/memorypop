#!/usr/bin/env tsx
/**
 * Groq Pilot - Small Controlled Test
 *
 * CONFIGURATION:
 * - JSON Schema structured outputs (strict mode)
 * - 8 attempt budget maximum
 * - Tests anniversary A/B and sympathy A/B
 * - Max 1 retry per case
 * - No retry-after capping
 * - Separate run tracking (run-pilot)
 */

import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.join(__dirname, '../.env.local') })

import { generateWithGroq } from '../src/lib/ai/providers/groq'
import { validateRevealPlan } from '../src/lib/ai/validation'
import type { RevealPlanInput, RevealPlan, MemoryMetadata } from '../src/lib/ai/types'
import { syntheticAnniversaryMemories, syntheticAnniversaryMemoryPop } from './fixtures/anniversaryFixture'
import { syntheticSympathyMemories, syntheticSympathyMemoryPop } from './fixtures/sympathyFixture'
import * as fs from 'fs'
import * as crypto from 'crypto'
import { calculateDelay, fitsInWindow } from './lib/scheduling'

// Configuration
const MODEL_ID = 'openai/gpt-oss-120b'
const MAX_PILOT_ATTEMPTS = 8
const TIMEOUT_MS = 30000
const MAX_EXECUTION_WINDOW_MS = 600000 // 10 minutes
const RESULTS_DIR = path.join(__dirname, `../.experiments/groq/run-pilot`)
const LOCK_FILE = path.join(__dirname, '../.experiments/groq/.experiment.lock')

interface ExperimentCase {
  id: string
  occasion: string
  recipientName: string
  tone: string
  story: string
  memories: MemoryMetadata[]
  creatorInstructions?: string
  maxRetries: number
}

const PILOT_CASES: ExperimentCase[] = [
  {
    id: 'anniversary-test-a',
    occasion: 'anniversary',
    recipientName: syntheticAnniversaryMemoryPop.recipientName,
    tone: syntheticAnniversaryMemoryPop.tone,
    story: syntheticAnniversaryMemoryPop.story,
    memories: syntheticAnniversaryMemories,
    maxRetries: 1,
  },
  {
    id: 'anniversary-test-b',
    occasion: 'anniversary',
    recipientName: syntheticAnniversaryMemoryPop.recipientName,
    tone: syntheticAnniversaryMemoryPop.tone,
    story: syntheticAnniversaryMemoryPop.story,
    memories: syntheticAnniversaryMemories,
    creatorInstructions: 'Open with fun memories and light teasing, transition to heartfelt relationship reflections, and finish with family messages',
    maxRetries: 1,
  },
  {
    id: 'sympathy-test-a',
    occasion: 'sympathy',
    recipientName: syntheticSympathyMemoryPop.recipientName,
    tone: syntheticSympathyMemoryPop.tone,
    story: syntheticSympathyMemoryPop.story,
    memories: syntheticSympathyMemories,
    maxRetries: 1,
  },
  {
    id: 'sympathy-test-b',
    occasion: 'sympathy',
    recipientName: syntheticSympathyMemoryPop.recipientName,
    tone: syntheticSympathyMemoryPop.tone,
    story: syntheticSympathyMemoryPop.story,
    memories: syntheticSympathyMemories,
    creatorInstructions: 'Begin with community memories, acknowledge the loss with care, and conclude with messages of faith and enduring love',
    maxRetries: 1,
  },
]

interface ExperimentResult {
  caseId: string
  attemptNumber: number
  retryNumber: number // 0 = first attempt, 1+ = retry
  success: boolean
  plan?: RevealPlan
  error?: string
  errorType?: 'rate_limit_minute' | 'rate_limit_day' | 'timeout' | 'validation' | 'network' | 'parse' | 'api_error' | 'config_error' | 'unknown'
  retryAfterSeconds?: number
  requestedModel: string
  returnedModel?: string
  latencyMs?: number
  tokensUsed?: number
  timestamp: string
  inputHash: string
  promptHash: string
  configVersion: string
}

interface PilotManifest {
  runId: string
  configVersion: string
  modelId: string
  startedAt: string
  completedAt?: string
  totalAttempts: number
  apiCallsMade: number
  successfulPlans: number
  failedAttempts: number
  budgetRemaining: number
  results: ExperimentResult[]
}

function hashObject(obj: any): string {
  const str = JSON.stringify(obj, null, 0)
  return crypto.createHash('sha256').update(str).digest('hex').substring(0, 16)
}

function acquireLock(): boolean {
  try {
    if (fs.existsSync(LOCK_FILE)) {
      const lockData = JSON.parse(fs.readFileSync(LOCK_FILE, 'utf-8'))
      const age = Date.now() - new Date(lockData.timestamp).getTime()
      if (age < 3600000) {
        console.error('❌ Another experiment runner is active')
        console.error(`   Started at: ${lockData.timestamp}`)
        console.error(`   Wait or remove: ${LOCK_FILE}`)
        return false
      }
    }
    fs.mkdirSync(path.dirname(LOCK_FILE), { recursive: true })
    fs.writeFileSync(LOCK_FILE, JSON.stringify({
      pid: process.pid,
      timestamp: new Date().toISOString(),
      run: 'pilot'
    }))
    return true
  } catch (error) {
    console.error('❌ Failed to acquire lock:', error)
    return false
  }
}

function releaseLock() {
  try {
    if (fs.existsSync(LOCK_FILE)) {
      fs.unlinkSync(LOCK_FILE)
    }
  } catch (error) {
    console.warn('⚠️  Failed to release lock:', error)
  }
}

function loadManifest(): PilotManifest {
  const manifestPath = path.join(RESULTS_DIR, 'manifest.json')

  if (fs.existsSync(manifestPath)) {
    return JSON.parse(fs.readFileSync(manifestPath, 'utf-8'))
  }

  return {
    runId: `pilot-${Date.now()}`,
    configVersion: 'json-schema-strict',
    modelId: MODEL_ID,
    startedAt: new Date().toISOString(),
    totalAttempts: 0,
    apiCallsMade: 0,
    successfulPlans: 0,
    failedAttempts: 0,
    budgetRemaining: MAX_PILOT_ATTEMPTS,
    results: [],
  }
}

function saveManifest(manifest: PilotManifest) {
  fs.mkdirSync(RESULTS_DIR, { recursive: true })
  const manifestPath = path.join(RESULTS_DIR, 'manifest.json')
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
}

function saveResult(result: ExperimentResult) {
  fs.mkdirSync(RESULTS_DIR, { recursive: true})
  const filename = `${result.caseId}-attempt${result.attemptNumber}-retry${result.retryNumber}-${result.timestamp.replace(/[:.]/g, '-')}.json`
  const filepath = path.join(RESULTS_DIR, filename)
  fs.writeFileSync(filepath, JSON.stringify(result, null, 2))
}

function isCompleted(manifest: PilotManifest, caseId: string): boolean {
  return manifest.results.some((r) => r.caseId === caseId && r.success)
}

function getRetryCount(manifest: PilotManifest, caseId: string): number {
  return manifest.results.filter((r) => r.caseId === caseId).length
}

async function runAttempt(
  experimentCase: ExperimentCase,
  attemptNumber: number,
  retryNumber: number
): Promise<ExperimentResult> {
  const startTime = Date.now()
  const timestamp = new Date().toISOString()

  const input: RevealPlanInput = {
    memoryPopId: `pilot-${experimentCase.id}-attempt${attemptNumber}`,
    recipientName: experimentCase.recipientName,
    occasion: experimentCase.occasion,
    tone: experimentCase.tone,
    story: experimentCase.story,
    memories: experimentCase.memories,
    creatorInstructions: experimentCase.creatorInstructions,
  }

  const inputHash = hashObject({
    occasion: input.occasion,
    recipientName: input.recipientName,
    memories: input.memories.map((m) => m.id).sort(),
    creatorInstructions: input.creatorInstructions,
  })

  const promptHash = hashObject({
    system: 'ai-director-system-prompt-v1',
    userTemplate: 'reveal-plan-request-v1',
    input: inputHash,
  })

  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), TIMEOUT_MS)
    })

    const plan = await Promise.race([generateWithGroq(input), timeoutPromise])

    // Validate
    const validation = validateRevealPlan(plan, input.memories)
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
    }

    const latencyMs = Date.now() - startTime
    const metadata = (plan as any)._metadata

    return {
      caseId: experimentCase.id,
      attemptNumber,
      retryNumber,
      success: true,
      plan,
      requestedModel: MODEL_ID,
      returnedModel: metadata?.model || undefined,
      latencyMs,
      tokensUsed: metadata?.tokensUsed,
      timestamp,
      inputHash,
      promptHash,
      configVersion: 'json-schema-strict',
    }
  } catch (error: any) {
    const latencyMs = Date.now() - startTime
    const errorMessage = error.message || String(error)
    const errorLower = errorMessage.toLowerCase()

    let errorType: ExperimentResult['errorType'] = 'unknown'
    let retryAfterSeconds: number | undefined

    // Classify error
    if (errorLower.includes('rate_limit_exceeded') || errorLower.includes('rate limit')) {
      if (errorLower.includes('tokens per minute') || errorLower.includes('tpm')) {
        errorType = 'rate_limit_minute'
        const retryMatch = errorMessage.match(/try again in ([0-9.]+)s/)
        if (retryMatch) {
          retryAfterSeconds = Math.ceil(parseFloat(retryMatch[1]))
        }
      } else {
        errorType = 'rate_limit_day'
      }
    } else if (errorLower.includes('timeout')) {
      errorType = 'timeout'
    } else if (errorLower.includes('validation')) {
      errorType = 'validation'
    } else if (errorLower.includes('parse') || errorLower.includes('json')) {
      errorType = 'parse'
    } else if (errorLower.includes('fetch') || errorLower.includes('network')) {
      errorType = 'network'
    } else if (errorLower.includes('configuration') || errorLower.includes('invalid request')) {
      errorType = 'config_error'
    } else if (error.message?.includes('API error')) {
      errorType = 'api_error'
    }

    return {
      caseId: experimentCase.id,
      attemptNumber,
      retryNumber,
      success: false,
      error: errorMessage,
      errorType,
      retryAfterSeconds,
      requestedModel: MODEL_ID,
      latencyMs,
      timestamp,
      inputHash,
      promptHash,
      configVersion: 'json-schema-strict',
    }
  }
}

async function main() {
  console.log('🔬 Groq Pilot - Small Controlled Test')
  console.log('=' + '='.repeat(60))
  console.log()

  if (!acquireLock()) {
    process.exit(1)
  }

  const windowStartMs = Date.now()

  try {
    if (!process.env.GROQ_API_KEY) {
      console.error('❌ GROQ_API_KEY not found')
      process.exit(1)
    }

    let manifest = loadManifest()

    console.log(`📊 Pilot Configuration:`)
    console.log(`   Config: JSON Schema structured outputs (strict mode)`)
    console.log(`   Model: ${MODEL_ID}`)
    console.log(`   Cases: ${PILOT_CASES.length} (anniversary A/B, sympathy A/B)`)
    console.log(`   Max retries per case: 1`)
    console.log(`   Total budget: ${MAX_PILOT_ATTEMPTS} attempts`)
    console.log(`   Used: ${manifest.totalAttempts} attempts`)
    console.log(`   Remaining: ${manifest.budgetRemaining} attempts`)
    console.log()

    if (manifest.budgetRemaining <= 0) {
      console.log('❌ Pilot budget exhausted')
      console.log(`   Results: ${manifest.successfulPlans} valid plans`)
      process.exit(0)
    }

    for (const experimentCase of PILOT_CASES) {
      if (manifest.budgetRemaining <= 0) {
        console.log(`\n⚠️  Budget exhausted`)
        break
      }

      if (isCompleted(manifest, experimentCase.id)) {
        console.log(`\n✓ ${experimentCase.id} already completed`)
        continue
      }

      console.log(`\n📝 Case: ${experimentCase.id}`)
      console.log(`   Occasion: ${experimentCase.occasion}`)
      console.log(`   Memories: ${experimentCase.memories.length}`)
      console.log(`   Instructions: ${experimentCase.creatorInstructions ? 'Yes' : 'No'}`)

      const retryCount = getRetryCount(manifest, experimentCase.id)
      const attemptsRemaining = 1 + experimentCase.maxRetries - retryCount

      for (let retry = retryCount; retry <= experimentCase.maxRetries && manifest.budgetRemaining > 0; retry++) {
        const attemptNumber = manifest.totalAttempts + 1
        console.log(`   → Attempt ${attemptNumber} (retry ${retry})...`)

        const result = await runAttempt(experimentCase, attemptNumber, retry)

        manifest.totalAttempts++
        manifest.budgetRemaining = MAX_PILOT_ATTEMPTS - manifest.totalAttempts

        if (result.success) {
          manifest.apiCallsMade++
          manifest.successfulPlans++
          console.log(`     ✓ Success (${result.latencyMs}ms, ${result.tokensUsed} tokens)`)
          console.log(`     Model: ${result.returnedModel || 'unknown'}`)
          manifest.results.push(result)
          saveResult(result)
          saveManifest(manifest)
          break // Success, no more retries
        } else {
          manifest.failedAttempts++
          console.log(`     ✗ Failed: ${result.errorType}`)
          console.log(`     ${result.error?.substring(0, 120)}`)

          // Handle permanent errors
          if (result.errorType === 'rate_limit_day') {
            console.log(`     Daily quota exhausted - stopping pilot`)
            manifest.results.push(result)
            saveResult(result)
            saveManifest(manifest)
            releaseLock()
            process.exit(0)
          }

          if (result.errorType === 'config_error') {
            console.log(`     Configuration error - recording and continuing`)
          }

          manifest.results.push(result)
          saveResult(result)
          saveManifest(manifest)

          // Calculate delay
          if (manifest.budgetRemaining > 0 && retry < experimentCase.maxRetries) {
            const delay = calculateDelay(
              result.tokensUsed,
              result.errorType === 'rate_limit_minute' ? result.retryAfterSeconds : undefined
            )

            // Check if delay fits in remaining execution window
            if (!fitsInWindow(delay, windowStartMs, MAX_EXECUTION_WINDOW_MS)) {
              const elapsed = Math.ceil((Date.now() - windowStartMs) / 1000)
              console.log(`     Retry delay ${Math.ceil(delay/1000)}s doesn't fit in remaining window`)
              console.log(`     (${elapsed}s elapsed of ${MAX_EXECUTION_WINDOW_MS/1000}s total)`)
              console.log(`     Skipping retries for this case`)
              break
            }

            console.log(`     Waiting ${Math.ceil(delay/1000)}s before retry...`)
            await new Promise((resolve) => setTimeout(resolve, delay))
          }
        }
      }

      // Minimum delay between cases
      if (manifest.budgetRemaining > 0) {
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }
    }

    manifest.completedAt = new Date().toISOString()
    saveManifest(manifest)

    // Summary
    console.log()
    console.log('=' + '='.repeat(60))
    console.log('📊 Pilot Summary')
    console.log('=' + '='.repeat(60))
    console.log()
    console.log(`Model: ${MODEL_ID}`)
    console.log(`Config: JSON Schema structured outputs (strict mode)`)
    console.log(`Total attempts: ${manifest.totalAttempts}`)
    console.log(`Successful plans: ${manifest.successfulPlans}`)
    console.log(`Failed attempts: ${manifest.failedAttempts}`)
    console.log(`Budget remaining: ${manifest.budgetRemaining}`)
    console.log()
    console.log(`Results: ${RESULTS_DIR}`)
    console.log()
  } finally {
    releaseLock()
  }
}

main().catch((error) => {
  console.error('Fatal error:', error)
  releaseLock()
  process.exit(1)
})
