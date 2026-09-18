#!/usr/bin/env tsx
/**
 * Groq AI Director Experiment - V2 (Corrected)
 *
 * CORRECTIONS:
 * - Reverted to gpt-oss-120b (proven working model)
 * - Distinguish per-minute rate limiting from daily quota
 * - Respect retry-after headers with bounded backoff
 * - Ensure single experiment runner (lock file)
 * - Count ALL attempts against 24-attempt budget
 * - Record actual model identifiers in results
 * - Separate runs by model/config
 */

import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.join(__dirname, '../.env.local') })

import { generateWithGroq } from '../src/lib/ai/providers/groq'
import { validateRevealPlan } from '../src/lib/ai/validation'
import type { RevealPlanInput, RevealPlan, MemoryMetadata } from '../src/lib/ai/types'
import { syntheticMemories, syntheticMemoryPop } from './fixtures/premiumRevealFixture'
import { syntheticFarewellMemories, syntheticFarewellMemoryPop } from './fixtures/farewellFixture'
import { syntheticAnniversaryMemories, syntheticAnniversaryMemoryPop } from './fixtures/anniversaryFixture'
import { syntheticSympathyMemories, syntheticSympathyMemoryPop } from './fixtures/sympathyFixture'
import * as fs from 'fs'
import * as crypto from 'crypto'

// Configuration
const MODEL_ID = 'openai/gpt-oss-120b' // Proven working from run-001
const MAX_TOTAL_ATTEMPTS = 24
const TIMEOUT_MS = 30000
const MIN_DELAY_MS = 8000 // Minimum 8s between requests to stay under 8000 TPM
const MAX_BACKOFF_MS = 60000 // Max 60s backoff
const RESULTS_DIR = path.join(__dirname, `../.experiments/groq/run-002-${MODEL_ID.replace('/', '-')}`)
const LOCK_FILE = path.join(__dirname, '../.experiments/groq/.experiment.lock')

interface ExperimentCase {
  id: string
  occasion: string
  recipientName: string
  tone: string
  story: string
  memories: MemoryMetadata[]
  creatorInstructions?: string
}

const EXPERIMENT_CASES: ExperimentCase[] = [
  {
    id: 'birthday-test-a',
    occasion: 'birthday',
    recipientName: syntheticMemoryPop.recipientName,
    tone: syntheticMemoryPop.tone,
    story: syntheticMemoryPop.story,
    memories: syntheticMemories,
  },
  {
    id: 'birthday-test-b',
    occasion: 'birthday',
    recipientName: syntheticMemoryPop.recipientName,
    tone: syntheticMemoryPop.tone,
    story: syntheticMemoryPop.story,
    memories: syntheticMemories,
    creatorInstructions: 'Open with fun energy, transition to deeper memories, end with family love',
  },
  {
    id: 'retirement-test-a',
    occasion: 'retirement',
    recipientName: syntheticFarewellMemoryPop.recipientName,
    tone: syntheticFarewellMemoryPop.tone,
    story: syntheticFarewellMemoryPop.story,
    memories: syntheticFarewellMemories,
  },
  {
    id: 'retirement-test-b',
    occasion: 'retirement',
    recipientName: syntheticFarewellMemoryPop.recipientName,
    tone: syntheticFarewellMemoryPop.tone,
    story: syntheticFarewellMemoryPop.story,
    memories: syntheticFarewellMemories,
    creatorInstructions: 'Start with professional acknowledgments, include lighter moments in the middle, and build to the most heartfelt messages at the end',
  },
  {
    id: 'anniversary-test-a',
    occasion: 'anniversary',
    recipientName: syntheticAnniversaryMemoryPop.recipientName,
    tone: syntheticAnniversaryMemoryPop.tone,
    story: syntheticAnniversaryMemoryPop.story,
    memories: syntheticAnniversaryMemories,
  },
  {
    id: 'anniversary-test-b',
    occasion: 'anniversary',
    recipientName: syntheticAnniversaryMemoryPop.recipientName,
    tone: syntheticAnniversaryMemoryPop.tone,
    story: syntheticAnniversaryMemoryPop.story,
    memories: syntheticAnniversaryMemories,
    creatorInstructions: 'Open with fun memories and light teasing, transition to heartfelt relationship reflections, and finish with family messages',
  },
  {
    id: 'sympathy-test-a',
    occasion: 'sympathy',
    recipientName: syntheticSympathyMemoryPop.recipientName,
    tone: syntheticSympathyMemoryPop.tone,
    story: syntheticSympathyMemoryPop.story,
    memories: syntheticSympathyMemories,
  },
  {
    id: 'sympathy-test-b',
    occasion: 'sympathy',
    recipientName: syntheticSympathyMemoryPop.recipientName,
    tone: syntheticSympathyMemoryPop.tone,
    story: syntheticSympathyMemoryPop.story,
    memories: syntheticSympathyMemories,
    creatorInstructions: 'Begin with community memories, acknowledge the loss with care, and conclude with messages of faith and enduring love',
  },
]

interface ExperimentResult {
  caseId: string
  repetition: number
  attemptNumber: number // Global attempt counter
  success: boolean
  plan?: RevealPlan
  error?: string
  errorType?: 'rate_limit_minute' | 'rate_limit_day' | 'timeout' | 'validation' | 'network' | 'parse' | 'api_error' | 'unknown'
  retryAfterSeconds?: number
  requestedModel: string
  returnedModel?: string // From API response if available
  latencyMs?: number
  tokensUsed?: number
  timestamp: string
  inputHash: string
  promptHash: string
}

interface ExperimentManifest {
  runId: string
  modelId: string
  startedAt: string
  completedAt?: string
  totalAttempts: number // ALL attempts including retries
  apiCallsMade: number // Successful API calls
  successfulPlans: number // Valid plans
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
      if (age < 3600000) { // 1 hour
        console.error('❌ Another experiment runner is active')
        console.error(`   Started at: ${lockData.timestamp}`)
        console.error(`   Wait or remove: ${LOCK_FILE}`)
        return false
      }
    }
    fs.mkdirSync(path.dirname(LOCK_FILE), { recursive: true })
    fs.writeFileSync(LOCK_FILE, JSON.stringify({
      pid: process.pid,
      timestamp: new Date().toISOString()
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

function loadManifest(): ExperimentManifest {
  const manifestPath = path.join(RESULTS_DIR, 'manifest.json')

  if (fs.existsSync(manifestPath)) {
    return JSON.parse(fs.readFileSync(manifestPath, 'utf-8'))
  }

  return {
    runId: `run-002-${Date.now()}`,
    modelId: MODEL_ID,
    startedAt: new Date().toISOString(),
    totalAttempts: 0,
    apiCallsMade: 0,
    successfulPlans: 0,
    failedAttempts: 0,
    budgetRemaining: MAX_TOTAL_ATTEMPTS,
    results: [],
  }
}

function saveManifest(manifest: ExperimentManifest) {
  fs.mkdirSync(RESULTS_DIR, { recursive: true })
  const manifestPath = path.join(RESULTS_DIR, 'manifest.json')
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
}

function saveResult(result: ExperimentResult) {
  fs.mkdirSync(RESULTS_DIR, { recursive: true})
  const filename = `${result.caseId}-rep${result.repetition}-attempt${result.attemptNumber}-${result.timestamp.replace(/[:.]/g, '-')}.json`
  const filepath = path.join(RESULTS_DIR, filename)
  fs.writeFileSync(filepath, JSON.stringify(result, null, 2))
}

function isCompleted(manifest: ExperimentManifest, caseId: string, repetition: number): boolean {
  return manifest.results.some(
    (r) => r.caseId === caseId && r.repetition === repetition && r.success
  )
}

async function runExperiment(
  experimentCase: ExperimentCase,
  repetition: number,
  attemptNumber: number
): Promise<ExperimentResult> {
  const startTime = Date.now()
  const timestamp = new Date().toISOString()

  const input: RevealPlanInput = {
    memoryPopId: `experiment-${experimentCase.id}-rep${repetition}`,
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
      repetition,
      attemptNumber,
      success: true,
      plan,
      requestedModel: MODEL_ID,
      returnedModel: metadata?.model || 'unknown',
      latencyMs,
      tokensUsed: metadata?.tokensUsed,
      timestamp,
      inputHash,
      promptHash,
    }
  } catch (error: any) {
    const latencyMs = Date.now() - startTime
    const errorMessage = error.message || String(error)
    const errorLower = errorMessage.toLowerCase()

    let errorType: ExperimentResult['errorType'] = 'unknown'
    let retryAfterSeconds: number | undefined

    // Classify error
    if (errorLower.includes('rate_limit_exceeded') || errorLower.includes('rate limit')) {
      // Check if it's per-minute or daily
      if (errorLower.includes('tokens per minute') || errorLower.includes('tpm')) {
        errorType = 'rate_limit_minute'
        // Extract retry-after if present
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
    } else if (error.message?.includes('API error')) {
      errorType = 'api_error'
    }

    return {
      caseId: experimentCase.id,
      repetition,
      attemptNumber,
      success: false,
      error: errorMessage,
      errorType,
      retryAfterSeconds,
      requestedModel: MODEL_ID,
      latencyMs,
      timestamp,
      inputHash,
      promptHash,
    }
  }
}

async function main() {
  console.log('🔬 Groq AI Director Experiment - V2 (Corrected)')
  console.log('=' + '='.repeat(60))
  console.log()

  // Acquire lock
  if (!acquireLock()) {
    process.exit(1)
  }

  try {
    // Check API key
    if (!process.env.GROQ_API_KEY) {
      console.error('❌ GROQ_API_KEY not found')
      process.exit(1)
    }

    let manifest = loadManifest()

    console.log(`📊 Configuration:`)
    console.log(`   Model: ${MODEL_ID}`)
    console.log(`   Cases: ${EXPERIMENT_CASES.length}`)
    console.log(`   Repetitions per case: 3`)
    console.log(`   Total budget: ${MAX_TOTAL_ATTEMPTS} attempts`)
    console.log(`   Used: ${manifest.totalAttempts} attempts`)
    console.log(`   Remaining: ${manifest.budgetRemaining} attempts`)
    console.log()

    if (manifest.budgetRemaining <= 0) {
      console.log('❌ Budget exhausted')
      console.log(`   Results: ${manifest.successfulPlans} valid plans`)
      process.exit(0)
    }

    for (const experimentCase of EXPERIMENT_CASES) {
      if (manifest.budgetRemaining <= 0) {
        console.log(`\n⚠️  Budget exhausted`)
        break
      }

      console.log(`\n📝 Case: ${experimentCase.id}`)
      console.log(`   Occasion: ${experimentCase.occasion}`)
      console.log(`   Memories: ${experimentCase.memories.length}`)
      console.log(`   Instructions: ${experimentCase.creatorInstructions ? 'Yes' : 'No'}`)

      for (let rep = 1; rep <= 3; rep++) {
        if (manifest.budgetRemaining <= 0) break

        if (isCompleted(manifest, experimentCase.id, rep)) {
          console.log(`   ✓ Repetition ${rep} already completed`)
          continue
        }

        console.log(`   → Repetition ${rep}...`)

        const attemptNumber = manifest.totalAttempts + 1
        const result = await runExperiment(experimentCase, rep, attemptNumber)

        // Update counters
        manifest.totalAttempts++
        manifest.budgetRemaining = MAX_TOTAL_ATTEMPTS - manifest.totalAttempts

        if (result.success) {
          manifest.apiCallsMade++
          manifest.successfulPlans++
          console.log(`     ✓ Success (${result.latencyMs}ms, ${result.tokensUsed} tokens)`)
          console.log(`     Model: requested=${result.requestedModel}, returned=${result.returnedModel}`)
        } else {
          manifest.failedAttempts++
          console.log(`     ✗ Failed: ${result.errorType}`)
          console.log(`     ${result.error?.substring(0, 100)}...`)

          // Handle rate limiting
          if (result.errorType === 'rate_limit_minute' && result.retryAfterSeconds) {
            const backoffMs = Math.min(result.retryAfterSeconds * 1000 + 2000, MAX_BACKOFF_MS)
            console.log(`     Backing off ${Math.ceil(backoffMs / 1000)}s...`)
            await new Promise((resolve) => setTimeout(resolve, backoffMs))
          } else if (result.errorType === 'rate_limit_day') {
            console.log(`     Daily quota exhausted`)
            manifest.results.push(result)
            saveResult(result)
            saveManifest(manifest)
            break
          }
        }

        manifest.results.push(result)
        saveResult(result)
        saveManifest(manifest)

        // Minimum delay between requests
        if (manifest.budgetRemaining > 0 && result.success) {
          await new Promise((resolve) => setTimeout(resolve, MIN_DELAY_MS))
        }
      }

      // Only stop if we hit daily quota exhaustion
      // Don't stop on consecutive failures - rate limits are temporary
    }

    manifest.completedAt = new Date().toISOString()
    saveManifest(manifest)

    // Summary
    console.log()
    console.log('=' + '='.repeat(60))
    console.log('📊 Experiment Summary')
    console.log('=' + '='.repeat(60))
    console.log()
    console.log(`Model: ${MODEL_ID}`)
    console.log(`Total attempts: ${manifest.totalAttempts}`)
    console.log(`API calls made: ${manifest.apiCallsMade}`)
    console.log(`Successful plans: ${manifest.successfulPlans}`)
    console.log(`Failed attempts: ${manifest.failedAttempts}`)
    console.log(`Budget remaining: ${manifest.budgetRemaining}`)
    console.log()
    console.log(`Results saved to: ${RESULTS_DIR}`)
    console.log()
    console.log('Next steps:')
    console.log('1. Validate: npm run groq-validate')
    console.log('2. Compare: npm run groq-compare')
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
