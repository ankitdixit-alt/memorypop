/**
 * Groq Provider for AI Director Experiments
 *
 * IMPORTANT: LOCAL EXPERIMENT ONLY - Not for production use
 * Uses Groq's Free tier for synthetic data evaluation only
 */

import type { RevealPlanInput, RevealPlan } from '../types'

/**
 * Development-only guard
 * Prevents accidental production usage
 */
function validateDevEnvironment() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'BLOCKED: Groq experiment provider cannot be used in production. ' +
      'This is for local synthetic evaluation only.'
    )
  }
}

/**
 * Get Groq API key from environment
 * NEVER expose this key to client code
 */
function getGroqApiKey(): string {
  const apiKey = process.env.GROQ_API_KEY

  if (!apiKey) {
    throw new Error(
      'GROQ_API_KEY not found in environment variables. ' +
      'Add it to .env.local (never commit this file).\n' +
      'Get your key at: https://console.groq.com/keys'
    )
  }

  return apiKey
}

/**
 * Build system prompt for AI Director
 * Uses same prompt as Gemini for fair comparison
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
 * Build user prompt with MemoryPop context and memories
 * Uses same format as Gemini for fair comparison
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
 * Validate AI output
 * Same validation as Gemini provider
 */
function validateRevealPlan(plan: RevealPlan, input: RevealPlanInput): void {
  const errors: string[] = []

  // Validate opening length
  if (plan.opening && plan.opening.length > 200) {
    errors.push(`Opening exceeds 200 characters: ${plan.opening.length}`)
  }

  // Validate chapters
  if (!plan.chapters || plan.chapters.length === 0) {
    errors.push('No chapters provided')
  }

  // Collect all memory IDs from chapters
  const usedMemoryIds = new Set<string>()
  plan.chapters?.forEach((chapter, chapterIndex) => {
    if (!chapter.title || chapter.title.length > 60) {
      errors.push(`Chapter ${chapterIndex + 1} title invalid (max 60 chars)`)
    }

    chapter.memoryIds?.forEach((memoryId) => {
      if (usedMemoryIds.has(memoryId)) {
        errors.push(`Duplicate memory ID: ${memoryId}`)
      }
      usedMemoryIds.add(memoryId)
    })
  })

  // Validate all memories are included
  const inputMemoryIds = new Set(input.memories.map((m) => m.id))
  inputMemoryIds.forEach((memoryId) => {
    if (!usedMemoryIds.has(memoryId)) {
      errors.push(`Missing memory ID: ${memoryId}`)
    }
  })

  // Validate no invented memory IDs
  usedMemoryIds.forEach((memoryId) => {
    if (!inputMemoryIds.has(memoryId)) {
      errors.push(`Invented memory ID: ${memoryId}`)
    }
  })

  // Validate finale
  if (!plan.finaleMemoryId) {
    errors.push('Plan is missing finale memory ID')
  } else if (!inputMemoryIds.has(plan.finaleMemoryId)) {
    errors.push(`Invalid finale memory ID: ${plan.finaleMemoryId}`)
  }

  // Validate highlights
  plan.highlightMemoryIds?.forEach((memoryId) => {
    if (!inputMemoryIds.has(memoryId)) {
      errors.push(`Invalid highlight memory ID: ${memoryId}`)
    }
  })

  if (errors.length > 0) {
    throw new Error(`Reveal plan validation failed:\n${errors.join('\n')}`)
  }
}

/**
 * Generate reveal plan using Groq
 *
 * Uses OpenAI-compatible API with JSON mode
 * Model: llama-3.3-70b-versatile (free tier, supports JSON)
 */
export async function generateWithGroq(input: RevealPlanInput): Promise<RevealPlan> {
  // Development-only guard
  validateDevEnvironment()

  // Get API key
  const apiKey = getGroqApiKey()

  // Build prompts
  const systemPrompt = buildSystemPrompt()
  const userPrompt = buildUserPrompt(input)

  // Groq API endpoint (OpenAI-compatible)
  const endpoint = 'https://api.groq.com/openai/v1/chat/completions'

  // Make request
  const startTime = Date.now()

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'openai/gpt-oss-120b',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 2048,
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
  })

  const latencyMs = Date.now() - startTime

  if (!response.ok) {
    const errorText = await response.text()
    // Try to extract failed_generation if present
    try {
      const errorJson = JSON.parse(errorText)
      if (errorJson.error?.failed_generation) {
        throw new Error(
          `Groq API error (${response.status}): ${errorJson.error.message}\n` +
          `Failed generation: ${errorJson.error.failed_generation.substring(0, 500)}`
        )
      }
    } catch (parseError) {
      // Fall through to original error
    }
    throw new Error(`Groq API error (${response.status}): ${errorText}`)
  }

  const data = await response.json()

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
    throw new Error(`Failed to parse Groq response as JSON: ${content.substring(0, 200)}...`)
  }

  // Validate plan
  validateRevealPlan(plan, input)

  // Return plan with metadata
  // NOTE: Do NOT substitute requested model if response omits it
  // Record as 'unknown' if missing to maintain accuracy
  return {
    ...plan,
    _metadata: {
      provider: 'groq',
      model: data.model || 'unknown',
      latencyMs,
      tokensUsed: data.usage?.total_tokens || 0,
      timestamp: new Date().toISOString(),
    },
  } as RevealPlan
}
