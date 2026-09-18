#!/usr/bin/env tsx
/**
 * Generate pilot review page
 */

import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.join(__dirname, '../.env.local') })

import * as fs from 'fs'
import type { RevealPlan, MemoryMetadata } from '../src/lib/ai/types'
import { syntheticAnniversaryMemories, syntheticAnniversaryMemoryPop } from './fixtures/anniversaryFixture'
import { syntheticSympathyMemories, syntheticSympathyMemoryPop } from './fixtures/sympathyFixture'

const PILOT_DIR = path.join(__dirname, '../.experiments/groq/run-pilot')
const OUTPUT_FILE = path.join(__dirname, '../.experiments/groq/pilot-review.html')

interface PilotResult {
  caseId: string
  attemptNumber: number
  retryNumber: number
  success: boolean
  plan?: RevealPlan
  error?: string
  errorType?: string
  requestedModel: string
  returnedModel?: string
  latencyMs?: number
  tokensUsed?: number
  timestamp: string
  configVersion: string
}

function getMemoriesForCase(caseId: string): MemoryMetadata[] {
  if (caseId.startsWith('anniversary')) return syntheticAnniversaryMemories
  if (caseId.startsWith('sympathy')) return syntheticSympathyMemories
  throw new Error(`Unknown case: ${caseId}`)
}

function getContextForCase(caseId: string) {
  if (caseId.startsWith('anniversary')) return syntheticAnniversaryMemoryPop
  if (caseId.startsWith('sympathy')) return syntheticSympathyMemoryPop
  throw new Error(`Unknown case: ${caseId}`)
}

function loadResults(): PilotResult[] {
  if (!fs.existsSync(PILOT_DIR)) return []

  const files = fs.readdirSync(PILOT_DIR)
    .filter((f) => f.endsWith('.json') && f !== 'manifest.json')
    .sort()

  return files
    .map((f) => {
      try {
        return JSON.parse(fs.readFileSync(path.join(PILOT_DIR, f), 'utf-8'))
      } catch (error) {
        console.warn(`Failed to parse ${f}`)
        return null
      }
    })
    .filter((r) => r && r.success) as PilotResult[]
}

function generateHTML(results: PilotResult[]): string {
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Groq Pilot Review</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: #f5f5f5;
      padding: 2rem;
      line-height: 1.6;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    .header {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      margin-bottom: 2rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .notice {
      background: #e3f2fd;
      border-left: 4px solid #2196f3;
      padding: 1rem;
      margin: 1rem 0;
      border-radius: 4px;
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
      <h1>Groq Pilot Review</h1>
      <p>JSON Schema Structured Outputs (Strict Mode)</p>
      <div class="notice">
        <strong>✓ Configuration Change</strong>
        <p>This pilot uses JSON Schema structured outputs with strict mode. Results are tracked separately from earlier JSON-mode runs.</p>
      </div>
      <div class="notice">
        <strong>⚠️ Gemini Comparison Unavailable</strong>
        <p>Original Gemini responses were never captured. Ratings evaluate Groq storytelling quality independently.</p>
      </div>
    </div>
`

  results.forEach((result) => {
    if (!result.plan) return

    const plan = result.plan
    const memories = getMemoriesForCase(result.caseId)
    const context = getContextForCase(result.caseId)
    const memoryMap = new Map(memories.map((m) => [m.id, m]))
    const highlights = new Set(plan.highlightMemoryIds || [])
    const finaleId = plan.finaleMemoryId

    html += `
    <div class="result-card">
      <div class="result-header">
        <div class="result-title">${result.caseId} (Attempt ${result.attemptNumber})</div>
        <div class="result-meta">
          <span>${result.latencyMs}ms</span>
          <span>${result.tokensUsed} tokens</span>
          <span>${result.configVersion}</span>
        </div>
      </div>

      <div class="context-section">
        <p><strong>Recipient:</strong> ${context.recipientName}</p>
        <p><strong>Occasion:</strong> ${context.occasion}</p>
        <p><strong>Tone:</strong> ${context.tone}</p>
        <p><strong>Memories:</strong> ${memories.length}</p>
      </div>

      ${plan.opening ? `<div class="opening">"${plan.opening}"</div>` : ''}
`

    plan.chapters?.forEach((chapter, idx) => {
      html += `
      <div class="chapter">
        <div class="chapter-title">Chapter ${idx + 1}: ${chapter.title}</div>
`

      chapter.memoryIds?.forEach((memoryId) => {
        const memory = memoryMap.get(memoryId)
        if (!memory) {
          html += `<div class="memory">⚠️ Unknown: ${memoryId}</div>`
          return
        }

        const isHighlight = highlights.has(memoryId)
        const isFinale = memoryId === finaleId
        const cssClass = isFinale ? 'finale' : isHighlight ? 'highlight' : ''

        html += `
        <div class="memory ${cssClass}">
          <div class="memory-header">
            <span class="contributor-name">${memory.contributorName}</span>
            <div>
              ${isHighlight ? '<span class="badge badge-highlight">HIGHLIGHT</span>' : ''}
              ${isFinale ? '<span class="badge badge-finale">FINALE</span>' : ''}
            </div>
          </div>
          <div class="memory-message">"${memory.message}"</div>
        </div>
`
      })

      html += `</div>`
    })

    const formId = `rating-pilot-${result.caseId}-attempt${result.attemptNumber}`
    html += `
      <div class="rating-form">
        <h3>Manual Rating</h3>
        <form id="${formId}">
          <div class="rating-group">
            <label>1. Emotional Progression</label>
            <div class="rating-options">
              <div><input type="radio" name="emotional" value="1"> 1</div>
              <div><input type="radio" name="emotional" value="2"> 2</div>
              <div><input type="radio" name="emotional" value="3"> 3</div>
              <div><input type="radio" name="emotional" value="4"> 4</div>
              <div><input type="radio" name="emotional" value="5"> 5</div>
            </div>
          </div>
          <div class="rating-group">
            <label>2. Chapter Coherence</label>
            <div class="rating-options">
              <div><input type="radio" name="coherence" value="1"> 1</div>
              <div><input type="radio" name="coherence" value="2"> 2</div>
              <div><input type="radio" name="coherence" value="3"> 3</div>
              <div><input type="radio" name="coherence" value="4"> 4</div>
              <div><input type="radio" name="coherence" value="5"> 5</div>
            </div>
          </div>
          <div class="rating-group">
            <label>3. Finale Quality</label>
            <div class="rating-options">
              <div><input type="radio" name="finale" value="1"> 1</div>
              <div><input type="radio" name="finale" value="2"> 2</div>
              <div><input type="radio" name="finale" value="3"> 3</div>
              <div><input type="radio" name="finale" value="4"> 4</div>
              <div><input type="radio" name="finale" value="5"> 5</div>
            </div>
          </div>
          <div class="rating-group">
            <label>4. Overall Quality</label>
            <div class="rating-options">
              <div><input type="radio" name="overall" value="1"> 1</div>
              <div><input type="radio" name="overall" value="2"> 2</div>
              <div><input type="radio" name="overall" value="3"> 3</div>
              <div><input type="radio" name="overall" value="4"> 4</div>
              <div><input type="radio" name="overall" value="5"> 5</div>
            </div>
          </div>
          <div class="rating-group">
            <label>Notes</label>
            <textarea name="notes" placeholder="Specific observations..."></textarea>
          </div>
          <button type="button" class="save-button" onclick="saveRating('${formId}')">Save Rating</button>
          <span class="save-status" id="${formId}-status"></span>
        </form>
      </div>
    </div>
`
  })

  html += `
  </div>
  <script>
    function saveRating(formId) {
      const form = document.getElementById(formId);
      const formData = new FormData(form);
      const data = Object.fromEntries(formData);
      const key = 'groq-pilot-' + formId;
      localStorage.setItem(key, JSON.stringify({
        ...data,
        timestamp: new Date().toISOString()
      }));
      const status = document.getElementById(formId + '-status');
      status.textContent = '✓ Saved';
      setTimeout(() => { status.textContent = ''; }, 2000);
    }

    document.addEventListener('DOMContentLoaded', () => {
      document.querySelectorAll('form[id^="rating-"]').forEach(form => {
        const key = 'groq-pilot-' + form.id;
        const saved = localStorage.getItem(key);
        if (saved) {
          const data = JSON.parse(saved);
          Object.entries(data).forEach(([name, value]) => {
            if (name === 'timestamp') return;
            const input = form.querySelector(\`[name="\${name}"]\`);
            if (input) {
              if (input.type === 'radio') {
                form.querySelector(\`[name="\${name}"][value="\${value}"]\`)?.checked = true;
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

const results = loadResults()
const html = generateHTML(results)
fs.writeFileSync(OUTPUT_FILE, html)

console.log(`✓ Pilot review saved to:`)
console.log(`  ${OUTPUT_FILE}`)
console.log()
console.log(`Open: open "${OUTPUT_FILE}"`)
