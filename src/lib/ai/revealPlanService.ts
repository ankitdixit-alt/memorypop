/**
 * Reveal Plan Generation Service
 *
 * Production service for generating AI-powered reveal plans for MemoryPop Plus.
 *
 * Features:
 * - Server-side only (API key never exposed)
 * - Groq Free tier (zero spend)
 * - Bounded requests with timeout
 * - Deterministic fallback on any failure
 * - Input hashing for staleness detection
 * - Plan validation before saving
 */

import { createHash } from 'crypto'
import { generateDeterministicRevealPlan } from './deterministicPlanner'
import { validateRevealPlan } from './validation'
import type { RevealPlanInput, RevealPlan, MemoryMetadata } from './types'

/**
 * Generation result with metadata
 */
export interface GenerationResult {
  plan: RevealPlan
  source: 'ai_generated' | 'deterministic_fallback'
  error?: string
  modelName?: string
  modelProvider?: string
  inputHash: string
}

/**
 * Groq configuration
 */
const GROQ_CONFIG = {
  endpoint: 'https://api.groq.com/openai/v1/chat/completions',
  model: 'openai/gpt-oss-120b', // Free tier model
  timeout: 30000, // 30 seconds (generous for Free tier)
  maxTokens: 2048,
  temperature: 0.7,
} as const

/**
 * Get Groq API key from environment
 * Server-side only - NEVER expose to client
 */
function getGroqApiKey(): string | null {
  return process.env.GROQ_API_KEY || null
}

/**
 * Check if AI generation is enabled
 * Controlled by feature flag
 */
function isAIGenerationEnabled(): boolean {
  return process.env.ENABLE_AI_DIRECTOR === 'true'
}

/**
 * Generate input hash for staleness detection
 * Hash includes: occasion, memory IDs, messages, creator instructions
 */
export function hashInput(input: RevealPlanInput): string {
  const hashData = {
    occasion: input.occasion,
    tone: input.tone,
    memories: input.memories.map(m => ({
      id: m.id,
      message: m.message,
      contributor: m.contributorName,
    })),
    instructions: input.creatorInstructions || '',
  }

  const hash = createHash('sha256')
  hash.update(JSON.stringify(hashData))
  return hash.digest('hex')
}

/**
 * Build system prompt for AI Director
 */
function buildSystemPrompt(): string {
  return `You are an expert film director and editor creating an emotionally resonant celebration video.

Your task is to curate a sequence of personal memories into a compelling narrative arc with chapters.

GOALS:
- Create an emotional progression that builds toward a satisfying finale
- Group related memories into themed chapters
- Balance humor, nostalgia, and heartfelt moments
- Avoid placing repetitive or similar messages consecutively
- Use lighter moments to provide pacing between emotional peaks
- Select one powerful memory as the finale
- Identify 1-3 memories that deserve special emphasis (highlights)

CONSTRAINTS:
- You MUST include every memory exactly once
- You CANNOT invent memory IDs or skip memories
- You CANNOT rewrite or modify contributor messages
- You MUST respect the authentic voice of each contributor
- Base your decisions ONLY on the content provided (relationships, tone, themes in the text)
- DO NOT invent relationships or facts not supported by the messages

OUTPUT:
Return a JSON object with this exact structure:
{
  "opening": "A brief opening line (max 200 chars) that sets the emotional tone",
  "chapters": [
    {
      "title": "Chapter title (max 60 chars)",
      "memoryIds": ["mem_001", "mem_002", ...]
    }
  ],
  "highlightMemoryIds": ["mem_xxx"],
  "finaleMemoryId": "mem_xxx",
  "reasoningSummary": "Brief explanation of your editorial choices (dev-only, 2-3 sentences)"
}`
}

/**
 * Build user prompt with MemoryPop context
 * Only sends: IDs, messages, occasion, tone, instructions
 * Never sends: URLs, media paths, credentials, unnecessary PII
 */
function buildUserPrompt(input: RevealPlanInput): string {
  const { recipientName, occasion, tone, story, memories, creatorInstructions } = input

  let prompt = `Create a reveal plan for this celebration:

RECIPIENT: ${recipientName}
OCCASION: ${occasion}
TONE: ${tone}
STORY: ${story}
${creatorInstructions ? `\nCREATOR INSTRUCTIONS: ${creatorInstructions}` : ''}

MEMORIES TO SEQUENCE (${memories.length} total):
`

  memories.forEach((memory) => {
    prompt += `\n[${memory.id}]
FROM: ${memory.contributorName}
MESSAGE: "${memory.message}"
MEDIA: ${memory.photoCount} photos, ${memory.gifCount} GIFs${memory.videoDuration ? `, ${memory.videoDuration}s video` : ''}
SUBMITTED: ${memory.createdAt.toISOString()}
`
  })

  prompt += `\nRemember:
- Every memory ID must appear exactly once
- Do NOT invent new memory IDs
- Do NOT rewrite messages
- Create a compelling emotional arc
- Return valid JSON matching the schema`

  return prompt
}

/**
 * Generate reveal plan using Groq
 * With timeout, error handling, and fallback
 */
async function generateWithGroq(
  input: RevealPlanInput,
  abortSignal?: AbortSignal
): Promise<{ plan: RevealPlan; modelName: string }> {
  const apiKey = getGroqApiKey()

  if (!apiKey) {
    throw new Error('GROQ_API_KEY not configured')
  }

  // Build prompts
  const systemPrompt = buildSystemPrompt()
  const userPrompt = buildUserPrompt(input)

  // Make request with timeout
  const response = await fetch(GROQ_CONFIG.endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: GROQ_CONFIG.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: GROQ_CONFIG.temperature,
      max_tokens: GROQ_CONFIG.maxTokens,
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'reveal_plan',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              opening: {
                type: 'string',
                description: 'Opening line that sets emotional tone (max 200 chars)'
              },
              chapters: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    title: {
                      type: 'string',
                      description: 'Chapter title (max 60 chars)'
                    },
                    memoryIds: {
                      type: 'array',
                      items: { type: 'string' },
                      description: 'Memory IDs in this chapter'
                    }
                  },
                  required: ['title', 'memoryIds'],
                  additionalProperties: false
                }
              },
              highlightMemoryIds: {
                type: 'array',
                items: { type: 'string' },
                description: '1-3 memories that deserve special emphasis'
              },
              finaleMemoryId: {
                type: 'string',
                description: 'The powerful memory used as finale'
              },
              reasoningSummary: {
                type: 'string',
                description: 'Brief explanation of editorial choices (2-3 sentences)'
              }
            },
            required: ['opening', 'chapters', 'highlightMemoryIds', 'finaleMemoryId', 'reasoningSummary'],
            additionalProperties: false
          }
        }
      }
    }),
    signal: abortSignal,
  })

  // Check abort before reading body
  if (abortSignal?.aborted) {
    throw new Error('Request timeout')
  }

  if (!response.ok) {
    // Race body reading with abort signal
    const errorText = await Promise.race([
      response.text(),
      new Promise<string>((_, reject) => {
        if (abortSignal) {
          abortSignal.addEventListener('abort', () => {
            reject(new Error('Request timeout during error body read'))
          })
        }
      })
    ])

    // Handle rate limit specifically
    if (response.status === 429) {
      throw new Error('Rate limit exceeded')
    }

    throw new Error(`Groq API error (${response.status}): ${errorText}`)
  }

  // Race body reading with abort signal
  const data = await Promise.race([
    response.json(),
    new Promise((_, reject) => {
      if (abortSignal) {
        abortSignal.addEventListener('abort', () => {
          reject(new Error('Request timeout during body read'))
        })
      }
    })
  ])

  if (!data.choices || data.choices.length === 0) {
    throw new Error('Groq API returned no choices')
  }

  const content = data.choices[0].message?.content
  if (!content) {
    throw new Error('Groq API returned empty content')
  }

  // Parse JSON
  let plan: RevealPlan
  try {
    plan = JSON.parse(content)
  } catch (error) {
    throw new Error('Failed to parse Groq response as JSON')
  }

  return {
    plan,
    modelName: data.model || GROQ_CONFIG.model,
  }
}

/**
 * Generate reveal plan with automatic fallback
 *
 * Flow:
 * 1. Check if AI generation is enabled
 * 2. If enabled, attempt Groq generation with timeout
 * 3. Validate returned plan
 * 4. On any failure, use deterministic fallback
 * 5. Return plan + generation metadata
 */
export async function generateRevealPlan(
  input: RevealPlanInput
): Promise<GenerationResult> {
  const inputHash = hashInput(input)

  // Check for test mock provider (for integration testing)
  if (process.env.TEST_AI_PROVIDER === 'mock') {
    try {
      const { generateMockPlan, validateMockEnvironment } = await import('./__mocks__/mockAIProvider')

      // Verify mock environment before proceeding
      const envCheck = validateMockEnvironment()
      if (!envCheck.valid) {
        throw new Error(`Mock provider blocked: ${envCheck.error}`)
      }

      // Create abort controller for timeout (same as real provider)
      const abortController = new AbortController()
      const timeoutId = setTimeout(() => {
        abortController.abort(new Error('Request timeout'))
      }, GROQ_CONFIG.timeout)

      try {
        // Race between mock generation and abort signal
        const plan = await Promise.race([
          generateMockPlan({
            memoryPopId: input.memoryPopId,
            occasion: input.occasion,
            recipientName: input.recipientName,
            memories: input.memories,
            timeout: GROQ_CONFIG.timeout,
          }),
          new Promise<never>((_, reject) => {
            abortController.signal.addEventListener('abort', () => {
              reject(new Error('Request timeout'))
            })
          })
        ])

        // Clear timeout on success
        clearTimeout(timeoutId)

        // Validate plan against input memories (same as real provider)
        const validation = validateRevealPlan(plan, input.memories)
        if (!validation.valid) {
          throw new Error(`Plan validation failed: ${validation.errors.join('; ')}`)
        }

        return {
          plan,
          source: 'ai_generated',
          modelName: 'mock-test-model',
          modelProvider: 'mock',
          inputHash,
        }
      } catch (error) {
        clearTimeout(timeoutId)
        throw error
      }
    } catch (error) {
      // Mock generation failed - use deterministic fallback (same as real provider)
      const plan = generateDeterministicRevealPlan(input)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      return {
        plan,
        source: 'deterministic_fallback',
        error: errorMessage,
        inputHash,
      }
    }
  }

  // Check if AI generation is enabled
  if (!isAIGenerationEnabled()) {
    const plan = generateDeterministicRevealPlan(input)
    return {
      plan,
      source: 'deterministic_fallback',
      error: 'AI generation disabled',
      inputHash,
    }
  }

  // Attempt AI generation with timeout
  try {
    // Create abort controller for timeout
    const abortController = new AbortController()
    const timeoutId = setTimeout(() => {
      abortController.abort(new Error('Request timeout'))
    }, GROQ_CONFIG.timeout)

    try {
      const { plan, modelName } = await generateWithGroq(input, abortController.signal)

      // Clear timeout on success
      clearTimeout(timeoutId)

      // Validate plan against input memories
      const validation = validateRevealPlan(plan, input.memories)
      if (!validation.valid) {
        throw new Error(`Plan validation failed: ${validation.errors.join('; ')}`)
      }

      return {
        plan,
        source: 'ai_generated',
        modelName,
        modelProvider: 'groq',
        inputHash,
      }
    } catch (error) {
      clearTimeout(timeoutId)
      throw error
    }
  } catch (error) {
    // AI generation failed - use deterministic fallback
    const plan = generateDeterministicRevealPlan(input)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    return {
      plan,
      source: 'deterministic_fallback',
      error: errorMessage,
      inputHash,
    }
  }
}
