#!/usr/bin/env tsx
/**
 * Groq Comparison UI Generator - V2 (Improved)
 *
 * Creates manual review page with:
 * - Complete contributor messages in playback order
 * - Per-result rating forms
 * - "Gemini comparison pending" notice
 * - Disabled relative Gemini ratings (no original responses available)
 */

import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.join(__dirname, '../.env.local') })

import * as fs from 'fs'
import type { RevealPlan, MemoryMetadata } from '../src/lib/ai/types'
import { syntheticMemories, syntheticMemoryPop } from './fixtures/premiumRevealFixture'
import { syntheticFarewellMemories, syntheticFarewellMemoryPop } from './fixtures/farewellFixture'
import { syntheticAnniversaryMemories, syntheticAnniversaryMemoryPop } from './fixtures/anniversaryFixture'
import { syntheticSympathyMemories, syntheticSympathyMemoryPop } from './fixtures/sympathyFixture'

const RESULTS_DIR = path.join(__dirname, '../.experiments/groq/run-002-openai-gpt-oss-120b')
const OUTPUT_FILE = path.join(__dirname, '../.experiments/groq/run-002-comparison.html')

interface ExperimentResult {
  caseId: string
  repetition: number
  attemptNumber: number
  success: boolean
  plan?: RevealPlan
  error?: string
  requestedModel: string
  returnedModel?: string
  latencyMs?: number
  timestamp: string
}

function getMemoriesForCase(caseId: string): MemoryMetadata[] {
  if (caseId.startsWith('birthday')) return syntheticMemories
  if (caseId.startsWith('retirement')) return syntheticFarewellMemories
  if (caseId.startsWith('anniversary')) return syntheticAnniversaryMemories
  if (caseId.startsWith('sympathy')) return syntheticSympathyMemories
  throw new Error(`Unknown case: ${caseId}`)
}

function getContextForCase(caseId: string) {
  if (caseId.startsWith('birthday')) return syntheticMemoryPop
  if (caseId.startsWith('retirement')) return syntheticFarewellMemoryPop
  if (caseId.startsWith('anniversary')) return syntheticAnniversaryMemoryPop
  if (caseId.startsWith('sympathy')) return syntheticSympathyMemoryPop
  throw new Error(`Unknown case: ${caseId}`)
}

function loadResults(): ExperimentResult[] {
  if (!fs.existsSync(RESULTS_DIR)) return []
  
  const files = fs.readdirSync(RESULTS_DIR)
    .filter((f) => f.endsWith('.json') && f !== 'manifest.json')
  
  return files
    .map((f) => {
      try {
        return JSON.parse(fs.readFileSync(path.join(RESULTS_DIR, f), 'utf-8'))
      } catch (error) {
        console.warn(`Failed to parse ${f}`)
        return null
      }
    })
    .filter((r) => r && r.success) as ExperimentResult[]
}

function generateHTML(results: ExperimentResult[]): string {
  const successfulResults = results.filter((r) => r.success)
  
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Groq Experiment Review - Run 002</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: #f5f5f5;
      padding: 2rem;
      line-height: 1.6;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .header {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      margin-bottom: 2rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    
    .header h1 {
      color: #1a1a1a;
      margin-bottom: 0.5rem;
    }
    
    .notice {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 1rem;
      margin: 1rem 0;
      border-radius: 4px;
    }
    
    .notice strong {
      display: block;
      margin-bottom: 0.5rem;
    }
    
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }
    
    .stat {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 4px;
    }
    
    .stat-label {
      font-size: 0.875rem;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .stat-value {
      font-size: 1.5rem;
      font-weight: 600;
      color: #1a1a1a;
      margin-top: 0.25rem;
    }
    
    .result-card {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      margin-bottom: 2rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    
    .result-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #e5e5e5;
    }
    
    .result-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1a1a1a;
    }
    
    .result-meta {
      display: flex;
      gap: 1rem;
      font-size: 0.875rem;
      color: #666;
    }
    
    .context-section {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 4px;
      margin-bottom: 1.5rem;
    }
    
    .context-section h3 {
      font-size: 0.875rem;
      text-transform: uppercase;
      color: #666;
      margin-bottom: 0.5rem;
    }
    
    .opening {
      font-size: 1.125rem;
      font-style: italic;
      color: #444;
      margin-bottom: 1.5rem;
      padding: 1rem;
      background: #f0f7ff;
      border-left: 4px solid #2196f3;
      border-radius: 4px;
    }
    
    .chapter {
      margin-bottom: 2rem;
    }
    
    .chapter-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid #e5e5e5;
    }
    
    .memory {
      background: #fafafa;
      padding: 1rem;
      margin-bottom: 0.75rem;
      border-radius: 4px;
      border-left: 3px solid #ddd;
    }
    
    .memory.highlight {
      border-left-color: #ff9800;
      background: #fff8e1;
    }
    
    .memory.finale {
      border-left-color: #4caf50;
      background: #e8f5e9;
      font-weight: 500;
    }
    
    .memory-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
    }
    
    .contributor-name {
      font-weight: 600;
      color: #1a1a1a;
    }
    
    .memory-badges {
      display: flex;
      gap: 0.5rem;
    }
    
    .badge {
      font-size: 0.75rem;
      padding: 0.125rem 0.5rem;
      border-radius: 3px;
      font-weight: 500;
    }
    
    .badge-highlight {
      background: #ff9800;
      color: white;
    }
    
    .badge-finale {
      background: #4caf50;
      color: white;
    }
    
    .memory-message {
      color: #333;
      line-height: 1.6;
    }
    
    .rating-form {
      background: #f8f9fa;
      padding: 1.5rem;
      border-radius: 4px;
      margin-top: 2rem;
    }
    
    .rating-form h3 {
      margin-bottom: 1rem;
      color: #1a1a1a;
    }
    
    .rating-group {
      margin-bottom: 1.5rem;
    }
    
    .rating-group label {
      display: block;
      font-weight: 500;
      margin-bottom: 0.5rem;
      color: #333;
    }
    
    .rating-options {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }
    
    .rating-option {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
    
    .rating-option input {
      margin: 0;
    }
    
    textarea {
      width: 100%;
      min-height: 100px;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-family: inherit;
      font-size: 0.875rem;
    }
    
    .save-button {
      background: #2196f3;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      margin-top: 1rem;
    }
    
    .save-button:hover {
      background: #1976d2;
    }
    
    .save-status {
      display: inline-block;
      margin-left: 1rem;
      color: #4caf50;
      font-weight: 500;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Groq Experiment Manual Review</h1>
      <p>Run 002: openai/gpt-oss-120b</p>
      
      <div class="notice">
        <strong>⚠️ Gemini Comparison Pending</strong>
        <p>Original Gemini responses are not available for side-by-side comparison. These ratings evaluate Groq storytelling quality independently.</p>
      </div>
      
      <div class="stats">
        <div class="stat">
          <div class="stat-label">Valid Plans</div>
          <div class="stat-value">${successfulResults.length}</div>
        </div>
        <div class="stat">
          <div class="stat-label">Total Attempts</div>
          <div class="stat-value">${results.length}</div>
        </div>
        <div class="stat">
          <div class="stat-label">Model</div>
          <div class="stat-value">gpt-oss-120b</div>
        </div>
      </div>
    </div>
`

  // Group results by case
  const resultsByCase = new Map<string, ExperimentResult[]>()
  successfulResults.forEach((result) => {
    if (!resultsByCase.has(result.caseId)) {
      resultsByCase.set(result.caseId, [])
    }
    resultsByCase.get(result.caseId)!.push(result)
  })

  // Generate cards for each result
  resultsByCase.forEach((caseResults, caseId) => {
    const memories = getMemoriesForCase(caseId)
    const context = getContextForCase(caseId)
    const memoryMap = new Map(memories.map((m) => [m.id, m]))
    
    caseResults.forEach((result) => {
      if (!result.plan) return
      
      const plan = result.plan
      const highlights = new Set(plan.highlightMemoryIds || [])
      const finaleId = plan.finaleMemoryId
      
      html += `
    <div class="result-card">
      <div class="result-header">
        <div class="result-title">${caseId} - Repetition ${result.repetition}</div>
        <div class="result-meta">
          <span>Attempt ${result.attemptNumber}</span>
          <span>${result.latencyMs}ms</span>
          <span>${result.returnedModel || result.requestedModel}</span>
        </div>
      </div>
      
      <div class="context-section">
        <h3>Context</h3>
        <p><strong>Recipient:</strong> ${context.recipientName}</p>
        <p><strong>Occasion:</strong> ${context.occasion}</p>
        <p><strong>Tone:</strong> ${context.tone}</p>
        <p><strong>Story:</strong> ${context.story}</p>
        <p><strong>Memories:</strong> ${memories.length}</p>
      </div>
      
      ${plan.opening ? `<div class="opening">"${plan.opening}"</div>` : ''}
      
`

      // Render chapters with full memory content
      plan.chapters?.forEach((chapter, chapterIndex) => {
        html += `
      <div class="chapter">
        <div class="chapter-title">Chapter ${chapterIndex + 1}: ${chapter.title}</div>
`
        
        chapter.memoryIds?.forEach((memoryId) => {
          const memory = memoryMap.get(memoryId)
          if (!memory) {
            html += `
        <div class="memory">
          <div class="memory-header">
            <span class="contributor-name">⚠️ Unknown Memory: ${memoryId}</span>
          </div>
        </div>
`
            return
          }
          
          const isHighlight = highlights.has(memoryId)
          const isFinale = memoryId === finaleId
          const cssClass = isFinale ? 'finale' : isHighlight ? 'highlight' : ''
          
          html += `
        <div class="memory ${cssClass}">
          <div class="memory-header">
            <span class="contributor-name">${memory.contributorName}</span>
            <div class="memory-badges">
              ${isHighlight ? '<span class="badge badge-highlight">HIGHLIGHT</span>' : ''}
              ${isFinale ? '<span class="badge badge-finale">FINALE</span>' : ''}
            </div>
          </div>
          <div class="memory-message">"${memory.message}"</div>
        </div>
`
        })
        
        html += `
      </div>
`
      })
      
      // Rating form
      const formId = `rating-${caseId}-rep${result.repetition}-attempt${result.attemptNumber}`
      html += `
      <div class="rating-form">
        <h3>Manual Rating</h3>
        <form id="${formId}">
          <div class="rating-group">
            <label>1. Emotional Progression</label>
            <div class="rating-options">
              <div class="rating-option"><input type="radio" name="emotional" value="1"> 1 - Flat</div>
              <div class="rating-option"><input type="radio" name="emotional" value="2"> 2 - Weak</div>
              <div class="rating-option"><input type="radio" name="emotional" value="3"> 3 - Adequate</div>
              <div class="rating-option"><input type="radio" name="emotional" value="4"> 4 - Strong</div>
              <div class="rating-option"><input type="radio" name="emotional" value="5"> 5 - Excellent</div>
            </div>
          </div>
          
          <div class="rating-group">
            <label>2. Chapter Coherence</label>
            <div class="rating-options">
              <div class="rating-option"><input type="radio" name="coherence" value="1"> 1 - Disjointed</div>
              <div class="rating-option"><input type="radio" name="coherence" value="2"> 2 - Weak</div>
              <div class="rating-option"><input type="radio" name="coherence" value="3"> 3 - Adequate</div>
              <div class="rating-option"><input type="radio" name="coherence" value="4"> 4 - Strong</div>
              <div class="rating-option"><input type="radio" name="coherence" value="5"> 5 - Excellent</div>
            </div>
          </div>
          
          <div class="rating-group">
            <label>3. Finale Quality</label>
            <div class="rating-options">
              <div class="rating-option"><input type="radio" name="finale" value="1"> 1 - Weak</div>
              <div class="rating-option"><input type="radio" name="finale" value="2"> 2 - Below Average</div>
              <div class="rating-option"><input type="radio" name="finale" value="3"> 3 - Adequate</div>
              <div class="rating-option"><input type="radio" name="finale" value="4"> 4 - Strong</div>
              <div class="rating-option"><input type="radio" name="finale" value="5"> 5 - Perfect</div>
            </div>
          </div>
          
          <div class="rating-group">
            <label>4. Instruction Adherence ${result.caseId.includes('-b') ? '(with instructions)' : '(no instructions)'}</label>
            <div class="rating-options">
              <div class="rating-option"><input type="radio" name="instructions" value="1"> 1 - Ignored</div>
              <div class="rating-option"><input type="radio" name="instructions" value="2"> 2 - Partial</div>
              <div class="rating-option"><input type="radio" name="instructions" value="3"> 3 - Adequate</div>
              <div class="rating-option"><input type="radio" name="instructions" value="4"> 4 - Good</div>
              <div class="rating-option"><input type="radio" name="instructions" value="5"> 5 - Excellent</div>
            </div>
          </div>
          
          <div class="rating-group">
            <label>5. Overall Tone Match</label>
            <div class="rating-options">
              <div class="rating-option"><input type="radio" name="tone" value="1"> 1 - Mismatched</div>
              <div class="rating-option"><input type="radio" name="tone" value="2"> 2 - Off</div>
              <div class="rating-option"><input type="radio" name="tone" value="3"> 3 - Adequate</div>
              <div class="rating-option"><input type="radio" name="tone" value="4"> 4 - Good</div>
              <div class="rating-option"><input type="radio" name="tone" value="5"> 5 - Perfect</div>
            </div>
          </div>
          
          <div class="rating-group">
            <label>Additional Notes</label>
            <textarea name="notes" placeholder="Specific strengths, weaknesses, or observations..."></textarea>
          </div>
          
          <button type="button" class="save-button" onclick="saveRating('${formId}')">Save Rating</button>
          <span class="save-status" id="${formId}-status"></span>
        </form>
      </div>
    </div>
`
    })
  })

  html += `
  </div>
  
  <script>
    function saveRating(formId) {
      const form = document.getElementById(formId);
      const formData = new FormData(form);
      const data = Object.fromEntries(formData);
      
      // Save to localStorage
      const key = 'groq-rating-' + formId;
      localStorage.setItem(key, JSON.stringify({
        ...data,
        timestamp: new Date().toISOString()
      }));
      
      // Show confirmation
      const status = document.getElementById(formId + '-status');
      status.textContent = '✓ Saved';
      setTimeout(() => {
        status.textContent = '';
      }, 2000);
    }
    
    // Load saved ratings on page load
    document.addEventListener('DOMContentLoaded', () => {
      document.querySelectorAll('form[id^="rating-"]').forEach(form => {
        const key = 'groq-rating-' + form.id;
        const saved = localStorage.getItem(key);
        if (saved) {
          const data = JSON.parse(saved);
          Object.entries(data).forEach(([name, value]) => {
            if (name === 'timestamp') return;
            const input = form.querySelector(\`[name="\${name}"]\`);
            if (input) {
              if (input.type === 'radio') {
                form.querySelector(\`[name="\${name}"][value="\${value}"]\`).checked = true;
              } else {
                input.value = value;
              }
            }
          });
        }
      });
    });
  </script>
</body>
</html>
`

  return html
}

function main() {
  console.log('🔬 Generating Groq Comparison UI - V2')
  console.log('=' + '='.repeat(50))
  console.log()
  
  const results = loadResults()
  const successfulResults = results.filter((r) => r.success)
  
  console.log(`Found ${results.length} total results`)
  console.log(`  Successful: ${successfulResults.length}`)
  console.log()
  
  if (successfulResults.length === 0) {
    console.error('❌ No successful results to display')
    process.exit(1)
  }
  
  const html = generateHTML(results)
  fs.writeFileSync(OUTPUT_FILE, html)
  
  console.log(`✓ Comparison UI saved to:`)
  console.log(`  ${OUTPUT_FILE}`)
  console.log()
  console.log('Open in browser:')
  console.log(`  open "${OUTPUT_FILE}"`)
  console.log()
}

main()
