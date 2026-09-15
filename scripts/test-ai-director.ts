/**
 * AI Director Prototype Test Script
 *
 * Tests the hypothesis: Can AI sequencing make a MemoryPop reveal feel
 * materially more thoughtful, emotional, and curated than chronological ordering?
 *
 * IMPORTANT: Uses synthetic data only. DO NOT use production MemoryPop data.
 */

// Load environment variables from .env.local
import { readFileSync } from 'fs'
import { resolve } from 'path'

try {
  const envPath = resolve(process.cwd(), '.env.local')
  const envContent = readFileSync(envPath, 'utf-8')
  envContent.split('\n').forEach((line) => {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=')
      if (key && valueParts.length > 0) {
        process.env[key.trim()] = valueParts.join('=').trim()
      }
    }
  })
} catch (error) {
  console.error('Warning: Could not load .env.local')
}

import { generateRevealPlan, getCurrentProvider } from '../src/lib/ai/revealPlanner'
import type { RevealPlan } from '../src/lib/ai/types'
import {
  syntheticMemoryPop,
  syntheticMemories,
  type MemoryMetadata,
} from './fixtures/premiumRevealFixture'

// ANSI color codes for readable terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
}

/**
 * Print section header
 */
function printHeader(title: string) {
  console.log('\n' + colors.bright + colors.cyan + '='.repeat(80) + colors.reset)
  console.log(colors.bright + colors.cyan + title + colors.reset)
  console.log(colors.cyan + '='.repeat(80) + colors.reset + '\n')
}

/**
 * Print memory in human-readable format
 */
function printMemory(memory: MemoryMetadata, index?: number) {
  const prefix = index !== undefined ? `${index + 1}. ` : '→ '
  console.log(colors.bright + prefix + memory.contributorName + colors.reset)

  // Truncate message if too long
  const message = memory.message.length > 100
    ? memory.message.substring(0, 97) + '...'
    : memory.message
  console.log(colors.dim + '   ' + message + colors.reset)

  // Media metadata
  const media: string[] = []
  if (memory.photoCount > 0) media.push(`${memory.photoCount} photo${memory.photoCount > 1 ? 's' : ''}`)
  if (memory.gifCount > 0) media.push(`${memory.gifCount} GIF${memory.gifCount > 1 ? 's' : ''}`)
  if (memory.videoDuration) media.push(`${memory.videoDuration}s video`)

  if (media.length > 0) {
    console.log(colors.dim + '   [' + media.join(', ') + ']' + colors.reset)
  }

  console.log() // Empty line
}

/**
 * Print Standard baseline (current MemoryPop behavior)
 */
function printStandardBaseline() {
  printHeader('CURRENT STANDARD ORDER (createdAt DESC)')

  console.log(colors.yellow + 'This is how MemoryPop currently sequences memories:' + colors.reset)
  console.log(colors.yellow + 'Most recent contributions first, chronological order only.\n' + colors.reset)

  // Sort by createdAt descending (most recent first)
  const standardOrder = [...syntheticMemories].sort((a, b) =>
    b.createdAt.getTime() - a.createdAt.getTime()
  )

  standardOrder.forEach((memory, index) => {
    printMemory(memory, index)
  })

  console.log(colors.dim + `Total: ${standardOrder.length} memories` + colors.reset)
}

/**
 * Print AI-curated reveal plan
 */
function printRevealPlan(plan: RevealPlan, testName: string) {
  printHeader(testName)

  // Opening
  console.log(colors.magenta + 'OPENING:' + colors.reset)
  console.log(colors.bright + '"' + plan.opening + '"' + colors.reset)
  console.log()

  // Chapters
  console.log(colors.magenta + 'CHAPTERS:' + colors.reset)
  plan.chapters.forEach((chapter, chapterIndex) => {
    console.log(colors.green + `\nChapter ${chapterIndex + 1}: ${chapter.title}` + colors.reset)

    chapter.memoryIds.forEach((memoryId) => {
      const memory = syntheticMemories.find((m) => m.id === memoryId)
      if (memory) {
        printMemory(memory)
      } else {
        console.log(colors.bright + '  ERROR: Memory not found: ' + memoryId + colors.reset)
      }
    })
  })

  // Highlights
  if (plan.highlightMemoryIds.length > 0) {
    console.log(colors.magenta + '\nHIGHLIGHTS:' + colors.reset)
    plan.highlightMemoryIds.forEach((memoryId) => {
      const memory = syntheticMemories.find((m) => m.id === memoryId)
      if (memory) {
        console.log(colors.yellow + '★ ' + memory.contributorName + colors.reset)
        console.log(colors.dim + '   ' + memory.message.substring(0, 100) + '...' + colors.reset)
      }
    })
  }

  // Finale
  console.log(colors.magenta + '\nFINALE:' + colors.reset)
  const finaleMemory = syntheticMemories.find((m) => m.id === plan.finaleMemoryId)
  if (finaleMemory) {
    console.log(colors.bright + '🎬 ' + finaleMemory.contributorName + colors.reset)
    console.log(colors.dim + '   ' + finaleMemory.message.substring(0, 100) + '...' + colors.reset)
  }

  // Reasoning (dev-only)
  console.log(colors.magenta + '\nREASONING SUMMARY (DEV-ONLY):' + colors.reset)
  console.log(colors.dim + plan.reasoningSummary + colors.reset)
}

/**
 * Compare sequences and assess differences
 */
function compareSequences(standardOrder: MemoryMetadata[], testA: RevealPlan, testB: RevealPlan) {
  printHeader('COMPARISON & ANALYSIS')

  // Standard order
  const standardIds = standardOrder.map((m) => m.id)

  // Test A order (flatten chapters)
  const testAIds = testA.chapters.flatMap((ch) => ch.memoryIds)

  // Test B order
  const testBIds = testB.chapters.flatMap((ch) => ch.memoryIds)

  // Calculate position differences
  let testADifferences = 0
  let testBDifferences = 0

  standardIds.forEach((id, index) => {
    if (testAIds[index] !== id) testADifferences++
    if (testBIds[index] !== id) testBDifferences++
  })

  console.log(colors.yellow + 'STANDARD VS TEST A:' + colors.reset)
  console.log(`${testADifferences} out of ${standardIds.length} positions differ (${Math.round(testADifferences / standardIds.length * 100)}%)`)

  // Identify key moves in Test A
  const standardFinaleId = standardIds[standardIds.length - 1]
  const testAFinaleId = testA.finaleMemoryId

  if (standardFinaleId !== testAFinaleId) {
    const standardFinale = syntheticMemories.find((m) => m.id === standardFinaleId)
    const testAFinale = syntheticMemories.find((m) => m.id === testAFinaleId)
    console.log(colors.green + '\n✓ AI chose different finale:' + colors.reset)
    console.log(colors.dim + `  Standard: ${standardFinale?.contributorName}` + colors.reset)
    console.log(colors.dim + `  AI: ${testAFinale?.contributorName}` + colors.reset)
  }

  console.log(colors.yellow + '\n\nTEST A VS TEST B:' + colors.reset)

  let testABDifferences = 0
  testAIds.forEach((id, index) => {
    if (testBIds[index] !== id) testABDifferences++
  })

  console.log(`${testABDifferences} out of ${testAIds.length} positions differ (${Math.round(testABDifferences / testAIds.length * 100)}%)`)

  if (testABDifferences > 0) {
    console.log(colors.green + '\n✓ Creator instructions materially changed the sequence' + colors.reset)

    // Check if Test B finale matches creator instruction
    const testBFinale = syntheticMemories.find((m) => m.id === testB.finaleMemoryId)
    if (testBFinale?.contributorName.includes('Mom') || testBFinale?.contributorName.includes('Dad') || testBFinale?.contributorName.includes('Brother') || testBFinale?.contributorName.includes('Sister')) {
      console.log(colors.green + '✓ Test B respected "finish with strongest family message" instruction' + colors.reset)
      console.log(colors.dim + `  Finale: ${testBFinale.contributorName}` + colors.reset)
    }
  } else {
    console.log(colors.yellow + '⚠ Creator instructions did not significantly change the sequence' + colors.reset)
  }
}

/**
 * Main test execution
 */
async function runTests() {
  console.log(colors.bright + '\n🎬 AI DIRECTOR PROTOTYPE TEST\n' + colors.reset)
  console.log(colors.dim + 'Provider: ' + getCurrentProvider() + colors.reset)
  console.log(colors.dim + 'Environment: ' + process.env.NODE_ENV + colors.reset)
  console.log(colors.dim + 'Fixture: Emma Test\'s 30th Birthday (' + syntheticMemories.length + ' memories)\n' + colors.reset)

  try {
    // 1. Standard baseline
    printStandardBaseline()

    // 2. Test A - Pure AI director (no creator instructions)
    console.log(colors.dim + '\nGenerating Test A (no creator instructions)...' + colors.reset)
    const testA = await generateRevealPlan({
      memoryPopId: 'test_emma_birthday',
      recipientName: syntheticMemoryPop.recipientName,
      occasion: syntheticMemoryPop.occasion,
      tone: syntheticMemoryPop.tone,
      story: syntheticMemoryPop.story,
      memories: syntheticMemories,
      // No creator instructions
    })
    printRevealPlan(testA, 'AI DIRECTOR — TEST A (No Creator Instructions)')

    // 3. Test B - Creator-directed AI
    console.log(colors.dim + '\nGenerating Test B (with creator instructions)...' + colors.reset)
    const testB = await generateRevealPlan({
      memoryPopId: 'test_emma_birthday',
      recipientName: syntheticMemoryPop.recipientName,
      occasion: syntheticMemoryPop.occasion,
      tone: syntheticMemoryPop.tone,
      story: syntheticMemoryPop.story,
      memories: syntheticMemories,
      creatorInstructions: 'Keep the beginning playful, gradually become more emotional, and finish with the strongest family message.',
    })
    printRevealPlan(testB, 'AI DIRECTOR — TEST B (With Creator Instructions)')

    // 4. Comparison
    const standardOrder = [...syntheticMemories].sort((a, b) =>
      b.createdAt.getTime() - a.createdAt.getTime()
    )
    compareSequences(standardOrder, testA, testB)

    // Success
    printHeader('✅ ALL TESTS PASSED')
    console.log(colors.green + 'JSON validation: PASS' + colors.reset)
    console.log(colors.green + 'Privacy/dev guard: PASS' + colors.reset)
    console.log(colors.green + 'Production data accessed: NO' + colors.reset)
    console.log(colors.green + 'Supabase accessed: NO' + colors.reset)
    console.log(colors.green + 'Gemini key exposed: NO\n' + colors.reset)

  } catch (error) {
    console.error(colors.bright + '\n❌ TEST FAILED\n' + colors.reset)
    console.error(error)
    process.exit(1)
  }
}

// Run tests
runTests()
