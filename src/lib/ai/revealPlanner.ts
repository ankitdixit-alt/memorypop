/**
 * AI Director - Provider Abstraction Layer
 *
 * This file provides a provider-agnostic interface for generating reveal plans.
 * The actual AI provider (Gemini, OpenAI, etc.) is abstracted behind this interface.
 *
 * To swap providers, only this file needs to change.
 */

import type { RevealPlanInput, RevealPlan } from './types'
import { generateWithGemini } from './providers/gemini'

/**
 * Generate a reveal plan using AI
 *
 * This is the main entry point for all AI-powered reveal planning.
 * Currently uses Gemini, but can be swapped to OpenAI or other providers
 * without changing application code.
 */
export async function generateRevealPlan(input: RevealPlanInput): Promise<RevealPlan> {
  // Currently using Gemini
  // To swap providers, change this to: generateWithOpenAI(input)
  return generateWithGemini(input)
}

/**
 * Get the current provider name (for logging/debugging)
 */
export function getCurrentProvider(): string {
  return 'gemini-3.5-flash-lite'
}
