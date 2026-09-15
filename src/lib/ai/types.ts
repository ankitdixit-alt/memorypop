/**
 * AI Director Types
 *
 * Simplified schema for V1 prototype.
 * NOT the full production RevealPlan architecture yet.
 */

export interface RevealPlanInput {
  memoryPopId: string
  recipientName: string
  occasion: string
  tone: string
  story: string
  memories: MemoryMetadata[]
  creatorInstructions?: string
}

export interface MemoryMetadata {
  id: string
  contributorName: string
  message: string
  photoCount: number
  gifCount: number
  videoDuration?: number
  createdAt: Date
}

/**
 * Approved transition vocabulary for AI Director
 * Each transition is smooth, accessible, and emotionally appropriate
 */
export type TransitionType =
  | 'gentle-fade'      // Soft, default transition
  | 'crossfade'        // Smooth blend between scenes
  | 'soft-slide'       // Gentle horizontal movement
  | 'slow-zoom'        // Subtle scale emphasis
  | 'chapter-card'     // Chapter title reveal
  | 'playful-pop'      // Light, energetic entry (fun memories)
  | 'media-reveal'     // Photo/GIF/video introduction
  | 'calm-dissolve'    // Slower, emotional fade
  | 'finale-fade'      // Meaningful final transition

export interface TransitionPlan {
  type: TransitionType
  reason: string // Why this transition was chosen
  durationMs: number
}

export interface RevealPlan {
  opening: string
  chapters: Chapter[]
  highlightMemoryIds: string[]
  finaleMemoryId: string
  reasoningSummary: string
  // Extended for full reveal experience
  openingTitle?: string
  closingText?: string
  decorativeTheme?: DecorativeTheme
  transitions?: Map<string, TransitionPlan> // Key: "scene_{index}" or "memory_{id}"
}

export interface Chapter {
  title: string
  memoryIds: string[]
  // Extended for full reveal experience
  description?: string
  emotionalTone?: 'joyful' | 'heartfelt' | 'funny' | 'reflective' | 'celebratory'
  pacing?: 'normal' | 'slow' | 'fast'
}

export interface DecorativeTheme {
  name: string
  elements: string[] // e.g., ['confetti', 'balloons'] for birthday
  intensity: 'subtle' | 'moderate' | 'celebration'
}
