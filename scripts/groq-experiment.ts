#!/usr/bin/env tsx
/**
 * Groq AI Director Experiment Runner
 *
 * Compares Groq storytelling with previous Gemini experiments
 * using identical synthetic fixtures and prompts.
 *
 * IMPORTANT:
 * - Local experiment only, no production data
 * - Uses Free tier, no billing required
 * - Saves all results for manual review
 * - Handles quota limits gracefully
 */

// Load environment variables from .env.local
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

// Experiment configuration
const REPETITIONS = 3 // Up to 3 repetitions per case
const MAX_TOTAL_ATTEMPTS = 24 // Budget limit
const TIMEOUT_MS = 30000 // 30 second timeout per request
const RESULTS_DIR = path.join(__dirname, '../.experiments/groq')

// Experiment cases
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
  // Birthday - No Instructions
  {
    id: 'birthday-test-a',
    occasion: 'birthday',
    recipientName: syntheticMemoryPop.recipientName,
    tone: syntheticMemoryPop.tone,
    story: syntheticMemoryPop.story,
    memories: syntheticMemories,
  },
  // Birthday - With Instructions
  {
    id: 'birthday-test-b',
    occasion: 'birthday',
    recipientName: syntheticMemoryPop.recipientName,
    tone: syntheticMemoryPop.tone,
    story: syntheticMemoryPop.story,
    memories: syntheticMemories,
    creatorInstructions: 'Open with fun energy, transition to deeper memories, end with family love',
  },
  // Retirement - No Instructions
  {
    id: 'retirement-test-a',
    occasion: 'retirement',
    recipientName: syntheticFarewellMemoryPop.recipientName,
    tone: syntheticFarewellMemoryPop.tone,
    story: syntheticFarewellMemoryPop.story,
    memories: syntheticFarewellMemories,
  },
  // Retirement - With Instructions
  {
    id: 'retirement-test-b',
    occasion: 'retirement',
    recipientName: syntheticFarewellMemoryPop.recipientName,
    tone: syntheticFarewellMemoryPop.tone,
    story: syntheticFarewellMemoryPop.story,
    memories: syntheticFarewellMemories,
    creatorInstructions: 'Start with professional acknowledgments, include lighter moments in the middle, and build to the most heartfelt messages at the end',
  },
  // Anniversary - No Instructions
  {
    id: 'anniversary-test-a',
    occasion: 'anniversary',
    recipientName: syntheticAnniversaryMemoryPop.recipientName,
    tone: syntheticAnniversaryMemoryPop.tone,
    story: syntheticAnniversaryMemoryPop.story,
    memories: syntheticAnniversaryMemories,
  },
  // Anniversary - With Instructions
  {
    id: 'anniversary-test-b',
    occasion: 'anniversary',
    recipientName: syntheticAnniversaryMemoryPop.recipientName,
    tone: syntheticAnniversaryMemoryPop.tone,
    story: syntheticAnniversaryMemoryPop.story,
    memories: syntheticAnniversaryMemories,
    creatorInstructions: 'Open with fun memories and light teasing, transition to heartfelt relationship reflections, and finish with family messages',
  },
  // Sympathy - No Instructions
  {
    id: 'sympathy-test-a',
    occasion: 'sympathy',
    recipientName: syntheticSympathyMemoryPop.recipientName,
    tone: syntheticSympathyMemoryPop.tone,
    story: syntheticSympathyMemoryPop.story,
    memories: syntheticSympathyMemories,
  },
  // Sympathy - With Instructions
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
  success: boolean
  plan?: RevealPlan
  error?: string
  errorType?: 'quota' | 'timeout' | 'validation' | 'network' | 'parse' | 'unknown'
  latencyMs?: number
  tokensUsed?: number
  timestamp: string
  inputHash: string
  promptHash: string
}

interface ExperimentManifest {
  startedAt: string
  completedAt?: string
  totalAttempts: number
  successCount: number
  failureCount: number
  quotaExhausted: boolean
  results: ExperimentResult[]
}

/**
 * Hash input for reproducibility tracking
 */
function hashObject(obj: any): string {
  const str = JSON.stringify(obj, null, 0)
  return crypto.createHash('sha256').update(str).digest('hex').substring(0, 16)
}

/**
 * Load or initialize manifest
 */
function loadManifest(): ExperimentManifest {
  const manifestPath = path.join(RESULTS_DIR, 'manifest.json')

  if (fs.existsSync(manifestPath)) {
    const content = fs.readFileSync(manifestPath, 'utf-8')
    return JSON.parse(content)
  }

  return {
    startedAt: new Date().toISOString(),
    totalAttempts: 0,
    successCount: 0,
    failureCount: 0,
    quotaExhausted: false,
    results: [],
  }
}

/**
 * Save manifest
 */
function saveManifest(manifest: ExperimentManifest) {
  fs.mkdirSync(RESULTS_DIR, { recursive: true })
  const manifestPath = path.join(RESULTS_DIR, 'manifest.json')
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
}

/**
 * Save individual result
 */
function saveResult(result: ExperimentResult) {
  fs.mkdirSync(RESULTS_DIR, { recursive: true })
  const filename = `${result.caseId}-rep${result.repetition}-${result.timestamp.replace(/[:.]/g, '-')}.json`
  const filepath = path.join(RESULTS_DIR, filename)
  fs.writeFileSync(filepath, JSON.stringify(result, null, 2))
}

/**
 * Check if case/repetition already completed
 */
function isCompleted(manifest: ExperimentManifest, caseId: string, repetition: number): boolean {
  return manifest.results.some(
    (r) => r.caseId === caseId && r.repetition === repetition && r.success
  )
}

/**
 * Run single experiment attempt
 */
async function runExperiment(
  experimentCase: ExperimentCase,
  repetition: number
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
    // Set timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), TIMEOUT_MS)
    })

    const plan = await Promise.race([generateWithGroq(input), timeoutPromise])

    // Validate with shared validation
    const validation = validateRevealPlan(plan, input.memories)
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
    }

    const latencyMs = Date.now() - startTime

    const result: ExperimentResult = {
      caseId: experimentCase.id,
      repetition,
      success: true,
      plan,
      latencyMs,
      tokensUsed: (plan as any)._metadata?.tokensUsed,
      timestamp,
      inputHash,
      promptHash,
    }

    return result
  } catch (error: any) {
    const latencyMs = Date.now() - startTime
    const errorMessage = error.message || String(error)

    // Classify error type
    let errorType: ExperimentResult['errorType'] = 'unknown'
    const errorLower = errorMessage.toLowerCase()
    if (errorLower.includes('quota') || errorLower.includes('rate limit') || errorLower.includes('rate_limit_exceeded')) {
      errorType = 'quota'
    } else if (errorLower.includes('timeout')) {
      errorType = 'timeout'
    } else if (errorLower.includes('validation')) {
      errorType = 'validation'
    } else if (errorLower.includes('parse') || errorLower.includes('json')) {
      errorType = 'parse'
    } else if (errorLower.includes('fetch') || errorLower.includes('network')) {
      errorType = 'network'
    }

    const result: ExperimentResult = {
      caseId: experimentCase.id,
      repetition,
      success: false,
      error: errorMessage,
      errorType,
      latencyMs,
      timestamp,
      inputHash,
      promptHash,
    }

    return result
  }
}

/**
 * Main experiment runner
 */
async function main() {
  console.log('🔬 Groq AI Director Experiment')
  console.log('=' + '='.repeat(50))
  console.log()

  // Check for API key
  if (!process.env.GROQ_API_KEY) {
    console.error('❌ GROQ_API_KEY not found in environment')
    console.error()
    console.error('To run this experiment:')
    console.error('1. Get your API key at: https://console.groq.com/keys')
    console.error('2. Add to .env.local: GROQ_API_KEY=your_key_here')
    console.error('3. Run: npm run groq-experiment')
    console.error()
    process.exit(1)
  }

  // Load manifest
  let manifest = loadManifest()

  if (manifest.quotaExhausted) {
    console.log('⚠️  Previous run exhausted quota')
    console.log(`   Completed ${manifest.successCount}/${manifest.totalAttempts} attempts`)
    console.log()
    console.log('   Resume after quota reset? (y/n)')
    // For now, just continue
  }

  console.log(`📊 Configuration:`)
  console.log(`   Cases: ${EXPERIMENT_CASES.length}`)
  console.log(`   Repetitions per case: ${REPETITIONS}`)
  console.log(`   Max total attempts: ${MAX_TOTAL_ATTEMPTS}`)
  console.log(`   Timeout: ${TIMEOUT_MS}ms`)
  console.log()

  // Run experiments
  let quotaExhausted = false

  for (const experimentCase of EXPERIMENT_CASES) {
    if (manifest.totalAttempts >= MAX_TOTAL_ATTEMPTS) {
      console.log(`⚠️  Budget limit reached (${MAX_TOTAL_ATTEMPTS} attempts)`)
      break
    }

    console.log(`\n📝 Case: ${experimentCase.id}`)
    console.log(`   Occasion: ${experimentCase.occasion}`)
    console.log(`   Memories: ${experimentCase.memories.length}`)
    console.log(`   Instructions: ${experimentCase.creatorInstructions ? 'Yes' : 'No'}`)

    for (let rep = 1; rep <= REPETITIONS; rep++) {
      if (manifest.totalAttempts >= MAX_TOTAL_ATTEMPTS) {
        break
      }

      // Skip if already completed
      if (isCompleted(manifest, experimentCase.id, rep)) {
        console.log(`   ✓ Repetition ${rep} already completed (skipping)`)
        continue
      }

      console.log(`   → Repetition ${rep}...`)

      const result = await runExperiment(experimentCase, rep)

      manifest.totalAttempts++
      if (result.success) {
        manifest.successCount++
        console.log(`     ✓ Success (${result.latencyMs}ms, ${result.tokensUsed} tokens)`)
      } else {
        manifest.failureCount++
        console.log(`     ✗ Failed: ${result.errorType} - ${result.error}`)

        if (result.errorType === 'quota') {
          quotaExhausted = true
          manifest.quotaExhausted = true
        }
      }

      manifest.results.push(result)
      saveResult(result)
      saveManifest(manifest)

      // Stop if quota exhausted
      if (quotaExhausted) {
        console.log(`\n⚠️  Quota exhausted - stopping experiment`)
        console.log(`   Completed: ${manifest.successCount}/${manifest.totalAttempts}`)
        console.log(`   Resume after quota reset with: npm run groq-experiment`)
        break
      }

      // Delay between requests to avoid rate limiting
      // Groq free tier: 8000 tokens/minute limit
      await new Promise((resolve) => setTimeout(resolve, 15000)) // 15 second delay
    }

    if (quotaExhausted) break
  }

  // Finalize manifest
  manifest.completedAt = new Date().toISOString()
  saveManifest(manifest)

  // Print summary
  console.log()
  console.log('=' + '='.repeat(50))
  console.log('📊 Experiment Summary')
  console.log('=' + '='.repeat(50))
  console.log()
  console.log(`Total attempts: ${manifest.totalAttempts}`)
  console.log(`Successful: ${manifest.successCount}`)
  console.log(`Failed: ${manifest.failureCount}`)
  console.log()

  if (manifest.failureCount > 0) {
    const errorTypes = new Map<string, number>()
    manifest.results
      .filter((r) => !r.success)
      .forEach((r) => {
        const type = r.errorType || 'unknown'
        errorTypes.set(type, (errorTypes.get(type) || 0) + 1)
      })

    console.log('Error breakdown:')
    errorTypes.forEach((count, type) => {
      console.log(`  ${type}: ${count}`)
    })
    console.log()
  }

  console.log(`Results saved to: ${RESULTS_DIR}`)
  console.log()
  console.log('Next steps:')
  console.log('1. Review results: npm run groq-compare')
  console.log('2. View comparison UI: open .experiments/groq/comparison.html')
  console.log()
}

// Run
main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
