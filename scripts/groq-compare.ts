#!/usr/bin/env tsx
/**
 * Groq Experiment Comparison Tool
 *
 * Generates a local comparison UI for manual evaluation
 * of Groq vs Gemini AI Director storytelling.
 */

// Load environment variables from .env.local
import * as dotenv from 'dotenv'
dotenv.config({ path: require('path').join(__dirname, '../.env.local') })

import * as fs from 'fs'
import * as path from 'path'
import type { RevealPlan, MemoryMetadata } from '../src/lib/ai/types'

const RESULTS_DIR = path.join(__dirname, '../.experiments/groq')
const OUTPUT_PATH = path.join(RESULTS_DIR, 'comparison.html')

interface ExperimentResult {
  caseId: string
  repetition: number
  success: boolean
  plan?: RevealPlan
  error?: string
  timestamp: string
  latencyMs?: number
  tokensUsed?: number
}

interface ExperimentManifest {
  startedAt: string
  completedAt?: string
  totalAttempts: number
  successCount: number
  failureCount: number
  results: ExperimentResult[]
}

interface ComparisonPair {
  caseId: string
  occasion: string
  recipientName: string
  hasInstructions: boolean
  creatorInstructions?: string
  memoryCount: number
  plans: ExperimentResult[]
  avgLatencyMs: number
  avgTokens: number
}

/**
 * Load experiment manifest
 */
function loadManifest(): ExperimentManifest | null {
  const manifestPath = path.join(RESULTS_DIR, 'manifest.json')
  if (!fs.existsSync(manifestPath)) {
    return null
  }
  return JSON.parse(fs.readFileSync(manifestPath, 'utf-8'))
}

/**
 * Load individual results
 */
function loadResults(): ExperimentResult[] {
  if (!fs.existsSync(RESULTS_DIR)) {
    return []
  }

  const files = fs.readdirSync(RESULTS_DIR).filter((f) => f.endsWith('.json') && f !== 'manifest.json')
  return files.map((f) => JSON.parse(fs.readFileSync(path.join(RESULTS_DIR, f), 'utf-8')))
}

/**
 * Group results by case
 */
function groupByCase(results: ExperimentResult[]): Map<string, ExperimentResult[]> {
  const grouped = new Map<string, ExperimentResult[]>()

  results.forEach((result) => {
    if (!result.success) return // Only include successful results

    if (!grouped.has(result.caseId)) {
      grouped.set(result.caseId, [])
    }
    grouped.get(result.caseId)!.push(result)
  })

  return grouped
}

/**
 * Generate comparison HTML
 */
function generateHTML(manifest: ExperimentManifest, groupedResults: Map<string, ExperimentResult[]>): string {
  const cases: ComparisonPair[] = []

  groupedResults.forEach((plans, caseId) => {
    const [occasion, testType] = caseId.split('-test-')
    const hasInstructions = testType === 'b'

    // Get plan metadata from first successful result
    const firstPlan = plans[0]
    if (!firstPlan?.plan) return

    const avgLatencyMs = plans.reduce((sum, p) => sum + (p.latencyMs || 0), 0) / plans.length
    const avgTokens = plans.reduce((sum, p) => sum + (p.tokensUsed || 0), 0) / plans.length

    cases.push({
      caseId,
      occasion,
      recipientName: '', // Will be filled from plan
      hasInstructions,
      creatorInstructions: hasInstructions ? getCreatorInstructions(caseId) : undefined,
      memoryCount: firstPlan.plan.chapters.reduce((sum, ch) => sum + ch.memoryIds.length, 0),
      plans,
      avgLatencyMs,
      avgTokens,
    })
  })

  // Sort by occasion and test type
  cases.sort((a, b) => {
    const occOrder = ['birthday', 'retirement', 'anniversary', 'sympathy']
    const occDiff = occOrder.indexOf(a.occasion) - occOrder.indexOf(b.occasion)
    if (occDiff !== 0) return occDiff
    return a.hasInstructions ? 1 : -1
  })

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Groq AI Director Experiment - Comparison</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 20px;
      background: #f5f5f5;
      color: #1a1a1a;
    }
    .container {
      max-width: 1400px;
      margin: 0 auto;
    }
    header {
      background: white;
      padding: 24px;
      border-radius: 8px;
      margin-bottom: 24px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    h1 { margin: 0 0 8px; font-size: 28px; }
    .meta { color: #666; font-size: 14px; }
    .summary {
      background: white;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 24px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-top: 16px;
    }
    .summary-card {
      padding: 16px;
      background: #f9f9f9;
      border-radius: 6px;
    }
    .summary-card h3 { margin: 0 0 8px; font-size: 14px; color: #666; }
    .summary-card .value { font-size: 32px; font-weight: 600; }
    .comparison {
      background: white;
      padding: 24px;
      border-radius: 8px;
      margin-bottom: 24px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .comparison-header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 2px solid #e0e0e0;
    }
    .comparison-title {
      flex: 1;
    }
    .comparison-title h2 { margin: 0 0 4px; font-size: 20px; }
    .comparison-title .subtitle { color: #666; font-size: 14px; }
    .plans-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 20px;
      margin-bottom: 20px;
    }
    .plan-card {
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      padding: 16px;
      background: #fafafa;
    }
    .plan-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .plan-label {
      font-weight: 600;
      color: #333;
    }
    .plan-meta {
      font-size: 12px;
      color: #999;
    }
    .opening {
      font-style: italic;
      color: #555;
      margin-bottom: 16px;
      padding: 12px;
      background: white;
      border-radius: 4px;
      font-size: 14px;
    }
    .chapter {
      margin-bottom: 12px;
      padding: 12px;
      background: white;
      border-radius: 4px;
    }
    .chapter-title {
      font-weight: 600;
      margin-bottom: 6px;
      color: #1a1a1a;
    }
    .chapter-memories {
      font-size: 13px;
      color: #666;
    }
    .finale {
      background: #fff3cd;
      padding: 12px;
      border-radius: 4px;
      margin-top: 12px;
      font-size: 14px;
    }
    .finale strong { color: #856404; }
    .rating-section {
      margin-top: 24px;
      padding-top: 20px;
      border-top: 2px solid #e0e0e0;
    }
    .rating-form {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .rating-group {
      margin-bottom: 12px;
    }
    .rating-group label {
      display: block;
      font-weight: 600;
      margin-bottom: 6px;
      font-size: 14px;
    }
    .rating-options {
      display: flex;
      gap: 8px;
    }
    .rating-btn {
      flex: 1;
      padding: 8px;
      border: 1px solid #ddd;
      background: white;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .rating-btn:hover {
      border-color: #007bff;
      background: #f0f8ff;
    }
    .rating-btn.selected {
      border-color: #007bff;
      background: #007bff;
      color: white;
    }
    textarea {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-family: inherit;
      font-size: 14px;
      resize: vertical;
    }
    .save-btn {
      background: #28a745;
      color: white;
      padding: 12px 24px;
      border: none;
      border-radius: 6px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      margin-top: 16px;
    }
    .save-btn:hover {
      background: #218838;
    }
    .warning {
      background: #fff3cd;
      border: 1px solid #ffc107;
      color: #856404;
      padding: 16px;
      border-radius: 6px;
      margin-bottom: 24px;
    }
    .gemini-note {
      background: #e7f3ff;
      border: 1px solid #0066cc;
      color: #004085;
      padding: 16px;
      border-radius: 6px;
      margin-bottom: 24px;
    }
    .gemini-note strong { color: #003d7a; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>🔬 Groq AI Director Experiment</h1>
      <div class="meta">
        Comparing Groq storytelling with previous Gemini experiments<br>
        Started: ${manifest.startedAt} | Completed: ${manifest.completedAt || 'In progress'}
      </div>
    </header>

    <div class="gemini-note">
      <strong>⚠️ Important Limitation:</strong> Original Gemini JSON responses were not saved from previous experiments.
      Comparison is based on documented patterns and structures from AI-DIRECTOR-EXPERIMENT-RESULTS.md.
      Direct JSON-to-JSON comparison is not available. This evaluation focuses on Groq output quality and correctness.
    </div>

    <div class="summary">
      <h2>Experiment Summary</h2>
      <div class="summary-grid">
        <div class="summary-card">
          <h3>Total Attempts</h3>
          <div class="value">${manifest.totalAttempts}</div>
        </div>
        <div class="summary-card">
          <h3>Successful</h3>
          <div class="value" style="color: #28a745">${manifest.successCount}</div>
        </div>
        <div class="summary-card">
          <h3>Failed</h3>
          <div class="value" style="color: #dc3545">${manifest.failureCount}</div>
        </div>
        <div class="summary-card">
          <h3>Success Rate</h3>
          <div class="value">${manifest.totalAttempts > 0 ? Math.round((manifest.successCount / manifest.totalAttempts) * 100) : 0}%</div>
        </div>
      </div>
    </div>

    ${cases.map((c, idx) => generateComparisonCard(c, idx)).join('\n')}

    <div class="summary" style="margin-top: 40px;">
      <h2>Rating Guidelines</h2>
      <ul style="color: #666; line-height: 1.6;">
        <li><strong>Emotional Progression:</strong> Does the story build naturally from start to finish?</li>
        <li><strong>Chapter Coherence:</strong> Do memories within each chapter relate thematically?</li>
        <li><strong>Finale Quality:</strong> Is the last memory emotionally appropriate and impactful?</li>
        <li><strong>Creator Instruction Adherence:</strong> (Test B only) Did the AI follow the explicit guidance?</li>
        <li><strong>Appropriate Tone:</strong> Does the plan respect the occasion (celebratory, thoughtful, sympathetic)?</li>
      </ul>
      <p style="color: #666; margin-top: 16px; font-style: italic;">
        Remember: A different order or higher reorder percentage does not automatically make a story better.
        Evaluate based on emotional impact and narrative coherence.
      </p>
    </div>
  </div>

  <script>
    function saveRating(caseId, repetition) {
      const data = {
        caseId,
        repetition,
        emotionalProgression: getSelectedRating(caseId, repetition, 'emotional'),
        chapterCoherence: getSelectedRating(caseId, repetition, 'coherence'),
        finaleQuality: getSelectedRating(caseId, repetition, 'finale'),
        creatorAdherence: getSelectedRating(caseId, repetition, 'adherence'),
        appropriateTone: getSelectedRating(caseId, repetition, 'tone'),
        overallAssessment: getSelectedRating(caseId, repetition, 'overall'),
        comments: document.getElementById(\`comments-\${caseId}-\${repetition}\`)?.value || '',
        timestamp: new Date().toISOString()
      };

      console.log('Rating saved:', data);
      localStorage.setItem(\`rating-\${caseId}-\${repetition}\`, JSON.stringify(data));
      alert('Rating saved locally');
    }

    function getSelectedRating(caseId, repetition, dimension) {
      const name = \`\${caseId}-\${repetition}-\${dimension}\`;
      const selected = document.querySelector(\`input[name="\${name}"]:checked\`);
      return selected ? selected.value : null;
    }

    function selectRating(name, value) {
      document.querySelectorAll(\`input[name="\${name}"]\`).forEach(el => {
        el.parentElement.classList.toggle('selected', el.value === value);
      });
    }

    // Load saved ratings
    window.addEventListener('load', () => {
      document.querySelectorAll('input[type="radio"]').forEach(input => {
        const key = \`rating-\${input.name}\`;
        const saved = localStorage.getItem(key);
        if (saved) {
          try {
            const data = JSON.parse(saved);
            const dimension = input.name.split('-').pop();
            if (data[dimension] === input.value) {
              input.checked = true;
              input.parentElement.classList.add('selected');
            }
          } catch (e) {}
        }
      });
    });
  </script>
</body>
</html>`

  function generateComparisonCard(pair: ComparisonPair, index: number): string {
    return `
    <div class="comparison" id="case-${pair.caseId}">
      <div class="comparison-header">
        <div class="comparison-title">
          <h2>${pair.occasion.charAt(0).toUpperCase() + pair.occasion.slice(1)} - Test ${pair.hasInstructions ? 'B (With Instructions)' : 'A (No Instructions)'}</h2>
          <div class="subtitle">
            ${pair.memoryCount} memories | ${pair.plans.length} repetition(s) | Avg: ${Math.round(pair.avgLatencyMs)}ms, ${Math.round(pair.avgTokens)} tokens
          </div>
          ${pair.hasInstructions ? `<div style="margin-top: 8px; padding: 8px; background: #e7f3ff; border-radius: 4px; font-size: 13px;">
            <strong>Creator Instructions:</strong> "${pair.creatorInstructions}"
          </div>` : ''}
        </div>
      </div>

      ${pair.plans.map((plan, idx) => generatePlanView(plan, idx)).join('\n')}

      <div class="rating-section">
        <h3>Rate This Plan (Repetition 1)</h3>
        ${generateRatingForm(pair.caseId, 1, pair.hasInstructions)}
      </div>
    </div>`
  }

  function generatePlanView(result: ExperimentResult, index: number): string {
    if (!result.plan) return ''

    const plan = result.plan
    return `
      <div class="plans-grid">
        <div class="plan-card">
          <div class="plan-header">
            <div class="plan-label">Repetition ${result.repetition}</div>
            <div class="plan-meta">${result.latencyMs}ms | ${result.tokensUsed || 0} tokens</div>
          </div>

          <div class="opening">"${plan.opening}"</div>

          ${plan.chapters.map((ch, idx) => `
            <div class="chapter">
              <div class="chapter-title">${idx + 1}. ${ch.title}</div>
              <div class="chapter-memories">${ch.memoryIds.length} memories: ${ch.memoryIds.slice(0, 3).join(', ')}${ch.memoryIds.length > 3 ? '...' : ''}</div>
            </div>
          `).join('')}

          <div class="finale">
            <strong>Finale:</strong> ${plan.finaleMemoryId}
          </div>

          ${plan.highlightMemoryIds && plan.highlightMemoryIds.length > 0 ? `
            <div style="margin-top: 12px; font-size: 13px; color: #666;">
              <strong>Highlights:</strong> ${plan.highlightMemoryIds.join(', ')}
            </div>
          ` : ''}

          ${plan.reasoningSummary ? `
            <details style="margin-top: 12px;">
              <summary style="cursor: pointer; color: #666; font-size: 13px;">Show AI reasoning</summary>
              <p style="margin-top: 8px; font-size: 13px; color: #666;">${plan.reasoningSummary}</p>
            </details>
          ` : ''}
        </div>
      </div>`
  }

  function generateRatingForm(caseId: string, repetition: number, hasInstructions: boolean): string {
    return `
      <div class="rating-form">
        <div>
          ${generateRatingGroup(caseId, repetition, 'emotional', 'Emotional Progression')}
          ${generateRatingGroup(caseId, repetition, 'coherence', 'Chapter Coherence')}
          ${generateRatingGroup(caseId, repetition, 'finale', 'Finale Quality')}
          ${hasInstructions ? generateRatingGroup(caseId, repetition, 'adherence', 'Creator Instruction Adherence') : ''}
        </div>
        <div>
          ${generateRatingGroup(caseId, repetition, 'tone', 'Appropriate Tone')}
          ${generateOverallRatingGroup(caseId, repetition)}
          <div class="rating-group">
            <label>Comments</label>
            <textarea id="comments-${caseId}-${repetition}" rows="4" placeholder="Optional feedback..."></textarea>
          </div>
        </div>
      </div>
      <button class="save-btn" onclick="saveRating('${caseId}', ${repetition})">Save Rating</button>
    `
  }

  function generateRatingGroup(caseId: string, repetition: number, dimension: string, label: string): string {
    const name = `${caseId}-${repetition}-${dimension}`
    return `
      <div class="rating-group">
        <label>${label}</label>
        <div class="rating-options">
          ${[1, 2, 3, 4, 5].map(val => `
            <label class="rating-btn">
              <input type="radio" name="${name}" value="${val}" style="display: none;" onchange="selectRating('${name}', '${val}')">
              ${val}
            </label>
          `).join('')}
        </div>
      </div>
    `
  }

  function generateOverallRatingGroup(caseId: string, repetition: number): string {
    const name = `${caseId}-${repetition}-overall`
    return `
      <div class="rating-group">
        <label>Overall Assessment</label>
        <div class="rating-options" style="grid-template-columns: 1fr 1fr 1fr 1fr;">
          ${['Better', 'Comparable', 'Worse', 'Unsure'].map(val => `
            <label class="rating-btn">
              <input type="radio" name="${name}" value="${val}" style="display: none;" onchange="selectRating('${name}', '${val}')">
              ${val}
            </label>
          `).join('')}
        </div>
      </div>
    `
  }
}

function getCreatorInstructions(caseId: string): string {
  const instructions: Record<string, string> = {
    'birthday-test-b': 'Open with fun energy, transition to deeper memories, end with family love',
    'retirement-test-b': 'Start with professional acknowledgments, include lighter moments in the middle, and build to the most heartfelt messages at the end',
    'anniversary-test-b': 'Open with fun memories and light teasing, transition to heartfelt relationship reflections, and finish with family messages',
    'sympathy-test-b': 'Begin with community memories, acknowledge the loss with care, and conclude with messages of faith and enduring love',
  }
  return instructions[caseId] || ''
}

/**
 * Main
 */
function main() {
  console.log('📊 Generating Groq Experiment Comparison...')
  console.log()

  const manifest = loadManifest()
  if (!manifest) {
    console.error('❌ No experiment results found')
    console.error('   Run: npm run groq-experiment')
    process.exit(1)
  }

  const results = loadResults()
  if (results.length === 0) {
    console.error('❌ No result files found')
    process.exit(1)
  }

  const groupedResults = groupByCase(results)
  const html = generateHTML(manifest, groupedResults)

  fs.writeFileSync(OUTPUT_PATH, html, 'utf-8')

  console.log('✓ Comparison HTML generated')
  console.log(`  ${OUTPUT_PATH}`)
  console.log()
  console.log('📖 Open in browser:')
  console.log(`   open ${OUTPUT_PATH}`)
  console.log()
  console.log('📊 Results summary:')
  console.log(`   Total attempts: ${manifest.totalAttempts}`)
  console.log(`   Successful: ${manifest.successCount}`)
  console.log(`   Failed: ${manifest.failureCount}`)
  console.log(`   Success rate: ${manifest.totalAttempts > 0 ? Math.round((manifest.successCount / manifest.totalAttempts) * 100) : 0}%`)
  console.log()
}

main()
