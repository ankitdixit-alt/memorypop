#!/usr/bin/env tsx
/**
 * Offline Validator for Groq Experiment Results
 *
 * Validates all saved results against known failure modes:
 * - Malformed JSON
 * - Duplicate memory IDs
 * - Unknown memory IDs
 * - Missing memories
 * - Invalid finale
 * - Invalid highlights
 * - Timeouts
 * - Quota errors
 */

// Load environment variables from .env.local
import * as dotenv from 'dotenv'
dotenv.config({ path: require('path').join(__dirname, '../.env.local') })

import * as fs from 'fs'
import * as path from 'path'
import { validateRevealPlan } from '../src/lib/ai/validation'
import type { RevealPlan, MemoryMetadata } from '../src/lib/ai/types'
import { syntheticMemories } from './fixtures/premiumRevealFixture'
import { syntheticFarewellMemories } from './fixtures/farewellFixture'
import { syntheticAnniversaryMemories } from './fixtures/anniversaryFixture'
import { syntheticSympathyMemories } from './fixtures/sympathyFixture'

const RESULTS_DIR = path.join(__dirname, '../.experiments/groq/run-002-openai-gpt-oss-120b')

interface ExperimentResult {
  caseId: string
  repetition: number
  success: boolean
  plan?: RevealPlan
  error?: string
  errorType?: string
  timestamp: string
}

interface ValidationIssue {
  caseId: string
  repetition: number
  severity: 'error' | 'warning'
  category: string
  message: string
}

/**
 * Get memories for a case
 */
function getMemoriesForCase(caseId: string): MemoryMetadata[] {
  if (caseId.startsWith('birthday')) return syntheticMemories
  if (caseId.startsWith('retirement')) return syntheticFarewellMemories
  if (caseId.startsWith('anniversary')) return syntheticAnniversaryMemories
  if (caseId.startsWith('sympathy')) return syntheticSympathyMemories
  throw new Error(`Unknown case: ${caseId}`)
}

/**
 * Load all results
 */
function loadResults(): ExperimentResult[] {
  if (!fs.existsSync(RESULTS_DIR)) {
    return []
  }

  const files = fs.readdirSync(RESULTS_DIR).filter((f) => f.endsWith('.json') && f !== 'manifest.json')
  return files.map((f) => {
    try {
      return JSON.parse(fs.readFileSync(path.join(RESULTS_DIR, f), 'utf-8'))
    } catch (error) {
      console.warn(`⚠️  Failed to parse ${f}: ${error}`)
      return null
    }
  }).filter(Boolean) as ExperimentResult[]
}

/**
 * Validate a single result
 */
function validateResult(result: ExperimentResult): ValidationIssue[] {
  const issues: ValidationIssue[] = []

  // Check failed results
  if (!result.success) {
    if (!result.error) {
      issues.push({
        caseId: result.caseId,
        repetition: result.repetition,
        severity: 'error',
        category: 'missing-error',
        message: 'Failed result without error message',
      })
    }

    if (!result.errorType) {
      issues.push({
        caseId: result.caseId,
        repetition: result.repetition,
        severity: 'warning',
        category: 'missing-error-type',
        message: 'Failed result without error type classification',
      })
    }

    // Verify error type classification
    if (result.error && result.errorType) {
      const errorLower = result.error.toLowerCase()
      if (errorLower.includes('quota') && result.errorType !== 'quota') {
        issues.push({
          caseId: result.caseId,
          repetition: result.repetition,
          severity: 'warning',
          category: 'error-type-mismatch',
          message: `Error mentions 'quota' but type is '${result.errorType}'`,
        })
      }
      if (errorLower.includes('timeout') && result.errorType !== 'timeout') {
        issues.push({
          caseId: result.caseId,
          repetition: result.repetition,
          severity: 'warning',
          category: 'error-type-mismatch',
          message: `Error mentions 'timeout' but type is '${result.errorType}'`,
        })
      }
    }

    return issues
  }

  // Validate successful results
  if (!result.plan) {
    issues.push({
      caseId: result.caseId,
      repetition: result.repetition,
      severity: 'error',
      category: 'missing-plan',
      message: 'Successful result without plan',
    })
    return issues
  }

  const plan = result.plan
  const memories = getMemoriesForCase(result.caseId)

  // Use shared validation
  const validation = validateRevealPlan(plan, memories)
  if (!validation.valid) {
    validation.errors.forEach((error) => {
      issues.push({
        caseId: result.caseId,
        repetition: result.repetition,
        severity: 'error',
        category: 'validation-failed',
        message: error,
      })
    })
  }

  // Additional checks
  // Check for empty chapters
  plan.chapters?.forEach((chapter, idx) => {
    if (!chapter.memoryIds || chapter.memoryIds.length === 0) {
      issues.push({
        caseId: result.caseId,
        repetition: result.repetition,
        severity: 'error',
        category: 'empty-chapter',
        message: `Chapter ${idx + 1} ("${chapter.title}") has no memories`,
      })
    }
  })

  // Check opening length
  if (plan.opening && plan.opening.length > 200) {
    issues.push({
      caseId: result.caseId,
      repetition: result.repetition,
      severity: 'warning',
      category: 'opening-too-long',
      message: `Opening is ${plan.opening.length} chars (max 200)`,
    })
  }

  // Check chapter title lengths
  plan.chapters?.forEach((chapter, idx) => {
    if (chapter.title && chapter.title.length > 60) {
      issues.push({
        caseId: result.caseId,
        repetition: result.repetition,
        severity: 'warning',
        category: 'chapter-title-too-long',
        message: `Chapter ${idx + 1} title is ${chapter.title.length} chars (max 60)`,
      })
    }
  })

  // Check if finale appears in chapters (should appear exactly once)
  if (plan.finaleMemoryId) {
    const finaleCount = plan.chapters.reduce(
      (count, ch) => count + ch.memoryIds.filter((id) => id === plan.finaleMemoryId).length,
      0
    )

    if (finaleCount === 0) {
      issues.push({
        caseId: result.caseId,
        repetition: result.repetition,
        severity: 'error',
        category: 'finale-not-in-chapters',
        message: `Finale memory ${plan.finaleMemoryId} not found in any chapter`,
      })
    } else if (finaleCount > 1) {
      issues.push({
        caseId: result.caseId,
        repetition: result.repetition,
        severity: 'error',
        category: 'finale-duplicated',
        message: `Finale memory ${plan.finaleMemoryId} appears ${finaleCount} times`,
      })
    }
  }

  return issues
}

/**
 * Generate summary report
 */
function generateReport(results: ExperimentResult[], issues: ValidationIssue[]) {
  console.log('=' + '='.repeat(60))
  console.log('Groq Experiment Validation Report')
  console.log('=' + '='.repeat(60))
  console.log()

  // Overall stats
  const successfulResults = results.filter((r) => r.success)
  const failedResults = results.filter((r) => !r.success)

  console.log('📊 Overall Statistics:')
  console.log(`   Total results: ${results.length}`)
  console.log(`   Successful: ${successfulResults.length}`)
  console.log(`   Failed: ${failedResults.length}`)
  console.log()

  // Error type breakdown
  if (failedResults.length > 0) {
    console.log('❌ Failure Breakdown:')
    const errorTypes = new Map<string, number>()
    failedResults.forEach((r) => {
      const type = r.errorType || 'unknown'
      errorTypes.set(type, (errorTypes.get(type) || 0) + 1)
    })
    errorTypes.forEach((count, type) => {
      console.log(`   ${type}: ${count}`)
    })
    console.log()
  }

  // Validation issues
  if (issues.length > 0) {
    const errors = issues.filter((i) => i.severity === 'error')
    const warnings = issues.filter((i) => i.severity === 'warning')

    console.log(`⚠️  Validation Issues: ${issues.length}`)
    console.log(`   Errors: ${errors.length}`)
    console.log(`   Warnings: ${warnings.length}`)
    console.log()

    if (errors.length > 0) {
      console.log('🔴 Errors:')
      errors.forEach((issue) => {
        console.log(`   [${issue.caseId}-rep${issue.repetition}] ${issue.category}: ${issue.message}`)
      })
      console.log()
    }

    if (warnings.length > 0) {
      console.log('🟡 Warnings:')
      warnings.forEach((issue) => {
        console.log(`   [${issue.caseId}-rep${issue.repetition}] ${issue.category}: ${issue.message}`)
      })
      console.log()
    }

    // Category breakdown
    const categoryCounts = new Map<string, number>()
    issues.forEach((issue) => {
      categoryCounts.set(issue.category, (categoryCounts.get(issue.category) || 0) + 1)
    })

    console.log('Issue Categories:')
    Array.from(categoryCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .forEach(([category, count]) => {
        console.log(`   ${category}: ${count}`)
      })
    console.log()
  } else {
    console.log('✅ No validation issues found')
    console.log()
  }

  // Success rate by case
  console.log('📈 Success Rate by Case:')
  const caseGroups = new Map<string, { total: number; success: number }>()
  results.forEach((r) => {
    if (!caseGroups.has(r.caseId)) {
      caseGroups.set(r.caseId, { total: 0, success: 0 })
    }
    const group = caseGroups.get(r.caseId)!
    group.total++
    if (r.success) group.success++
  })
  caseGroups.forEach((stats, caseId) => {
    const rate = stats.total > 0 ? Math.round((stats.success / stats.total) * 100) : 0
    console.log(`   ${caseId}: ${stats.success}/${stats.total} (${rate}%)`)
  })
  console.log()

  // Final assessment
  const hasErrors = issues.some((i) => i.severity === 'error')
  const hasFailures = failedResults.length > 0

  if (!hasErrors && !hasFailures) {
    console.log('✅ All results valid - experiment ready for manual review')
  } else if (hasErrors) {
    console.log('❌ Critical validation errors found - review before manual comparison')
  } else {
    console.log('⚠️  Some failures, but no validation errors in successful results')
  }
  console.log()
  console.log('=' + '='.repeat(60))
}

/**
 * Main
 */
function main() {
  const results = loadResults()

  if (results.length === 0) {
    console.error('❌ No results found')
    console.error('   Run: npm run groq-experiment')
    process.exit(1)
  }

  console.log(`Found ${results.length} result(s)`)
  console.log()

  const allIssues: ValidationIssue[] = []
  results.forEach((result) => {
    const issues = validateResult(result)
    allIssues.push(...issues)
  })

  generateReport(results, allIssues)
}

main()
