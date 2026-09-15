/**
 * Occasion-aware decoration configuration
 * Defines which decorative elements appear for each occasion type
 */

import type { Occasion } from '../app/ai-director-reveal/prototype'

export type DecorativeElement =
  | 'balloons'
  | 'confetti'
  | 'sparkles'
  | 'stars'
  | 'hearts'
  | 'flowers'
  | 'petals'
  | 'glow'
  | 'particles'
  | 'leaves'

export interface DecorationConfig {
  elements: DecorativeElement[]
  finaleElements: DecorativeElement[]
  intensity: 'subtle' | 'moderate' | 'celebration'
  speed: 'slow' | 'medium' | 'fast'
}

/**
 * Occasion-specific decoration configurations
 */
export const OCCASION_DECORATIONS: Record<Occasion, DecorationConfig> = {
  birthday: {
    elements: ['balloons', 'sparkles'],
    finaleElements: ['balloons', 'confetti', 'sparkles'],
    intensity: 'celebration',
    speed: 'medium',
  },
  retirement: {
    elements: ['stars', 'sparkles'],
    finaleElements: ['stars', 'sparkles', 'glow'],
    intensity: 'subtle',
    speed: 'slow',
  },
  anniversary: {
    elements: ['hearts', 'flowers'],
    finaleElements: ['hearts', 'flowers', 'petals'],
    intensity: 'subtle',
    speed: 'slow',
  },
  sympathy: {
    elements: ['particles', 'glow'],
    finaleElements: ['particles', 'leaves', 'glow'],
    intensity: 'subtle',
    speed: 'slow',
  },
}

/**
 * Get decoration configuration for an occasion
 */
export function getDecorationConfig(occasion: Occasion, isFinale: boolean): {
  elements: DecorativeElement[]
  intensity: 'subtle' | 'moderate' | 'celebration'
  speed: 'slow' | 'medium' | 'fast'
} {
  const config = OCCASION_DECORATIONS[occasion]
  return {
    elements: isFinale ? config.finaleElements : config.elements,
    intensity: config.intensity,
    speed: config.speed,
  }
}
