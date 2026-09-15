/**
 * Gemini Provider for AI Director
 *
 * IMPORTANT: DEV ONLY - Free-tier Gemini may use content for product improvement.
 * DO NOT use with production MemoryPop data.
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import type { RevealPlanInput, RevealPlan } from '../types'

/**
 * Development-only guard
 * Prevents accidental production usage with free-tier API
 */
function validateDevEnvironment() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'BLOCKED: Gemini free-tier cannot be used in production. ' +
      'This prototype is for local development only.'
    )
  }
}

/**
 * Get Gemini API key from environment
 * NEVER expose this key to client code
 */
function getGeminiApiKey(): string {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY not found in environment variables. ' +
      'Add it to .env.local (never commit this file).'
    )
  }

  return apiKey
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
 * Build user prompt with MemoryPop context and memories
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

  memories.forEach((memory, index) => {
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
 */
function validateRevealPlan(plan: RevealPlan, input: RevealPlanInput): void {
  const errors: string[] = []

  // Validate opening length
  if (plan.opening.length > 200) {
    errors.push(`Opening exceeds 200 characters: ${plan.opening.length}`)
  }

  // Validate chapters
  if (!plan.chapters || plan.chapters.length === 0) {
    errors.push('No chapters provided')
  }

  // Collect all memory IDs from chapters
  const usedMemoryIds = new Set<string>()
  plan.chapters.forEach((chapter, chapterIndex) => {
    if (!chapter.title || chapter.title.length > 60) {
      errors.push(`Chapter ${chapterIndex + 1} title invalid (max 60 chars)`)
    }

    chapter.memoryIds.forEach((memoryId) => {
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
  if (!inputMemoryIds.has(plan.finaleMemoryId)) {
    errors.push(`Invalid finale memory ID: ${plan.finaleMemoryId}`)
  }

  // Validate highlights
  plan.highlightMemoryIds.forEach((memoryId) => {
    if (!inputMemoryIds.has(memoryId)) {
      errors.push(`Invalid highlight memory ID: ${memoryId}`)
    }
  })

  if (errors.length > 0) {
    throw new Error(`Reveal plan validation failed:\n${errors.join('\n')}`)
  }
}

/**
 * Generate reveal plan using Gemini
 */
export async function generateWithGemini(input: RevealPlanInput): Promise<RevealPlan> {
  // Development-only guard
  validateDevEnvironment()

  // Get API key
  const apiKey = getGeminiApiKey()

  // Initialize Gemini
  const genAI = new GoogleGenerativeAI(apiKey)

  // Use Gemini 3.5 Flash Lite (current cheapest free-tier model with JSON support)
  // Gemini 2.0 Flash Lite has been deprecated by Google
  const model = genAI.getGenerativeModel({
    model: 'gemini-3.5-flash-lite',
    generationConfig: {
      temperature: 0.7, // Some creativity, not too random
      topP: 0.9,
      topK: 40,
      maxOutputTokens: 2048,
      responseMimeType: 'application/json', // Force JSON output
    },
  })

  // Build prompts
  const systemPrompt = buildSystemPrompt()
  const userPrompt = buildUserPrompt(input)

  // Call Gemini
  const result = await model.generateContent([
    { text: systemPrompt },
    { text: userPrompt },
  ])

  const response = result.response
  const text = response.text()

  // Parse JSON
  let plan: RevealPlan
  try {
    plan = JSON.parse(text)
  } catch (error) {
    throw new Error(`Failed to parse Gemini response as JSON: ${text.substring(0, 200)}...`)
  }

  // Validate plan
  validateRevealPlan(plan, input)

  return plan
}
