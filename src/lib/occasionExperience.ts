/**
 * Occasion Experience Configuration
 *
 * Maps occasions to appropriate atmospheres and soundtracks for Standard MemoryPop.
 *
 * Architecture:
 * - Occasion determines which atmospheres are appropriate
 * - Occasion + Atmosphere determines the soundtrack
 *
 * This ensures emotional coherence:
 * "Birthday + Nostalgic" can sound different from "Memorial + Nostalgic"
 */

import type { CelebrationMood } from './celebrationMood';

export interface SoundtrackConfig {
  track: string;           // Asset path or URL
  title: string;           // Track title
  artist?: string;         // Artist/composer
  license?: string;        // License info
  duration?: number;       // Duration in seconds (optional)
}

export interface OccasionConfig {
  atmospheres: CelebrationMood[];           // Available atmospheres for this occasion
  recommendedAtmospheres?: CelebrationMood[]; // Suggested default (optional)
}

/**
 * Occasion → Available Atmospheres
 *
 * Defines which atmospheres are appropriate for each occasion.
 * This filtering ensures emotional coherence.
 *
 * Principle: Each occasion exposes 3-6 atmospheres that are genuinely
 * emotionally appropriate. No forced padding to reach 6.
 *
 * Updated: 2026-08-17 - Added all 15 supported occasions
 */
export const OCCASION_ATMOSPHERES: Record<string, OccasionConfig> = {
  birthday: {
    atmospheres: [
      'warm_heartfelt',
      'playful_fun',
      'thoughtful_meaningful',
      'joyful_celebratory',
      'nostalgic_reflective',
      'simple_classic'
    ],
    recommendedAtmospheres: ['joyful_celebratory', 'warm_heartfelt', 'playful_fun']
  },

  wedding: {
    atmospheres: [
      'warm_heartfelt',
      'thoughtful_meaningful',
      'joyful_celebratory',
      'nostalgic_reflective',
      'simple_classic'
    ],
    recommendedAtmospheres: ['warm_heartfelt', 'joyful_celebratory']
  },

  anniversary: {
    atmospheres: [
      'warm_heartfelt',
      'thoughtful_meaningful',
      'nostalgic_reflective',
      'simple_classic'
    ],
    recommendedAtmospheres: ['warm_heartfelt', 'nostalgic_reflective']
  },

  graduation: {
    atmospheres: [
      'joyful_celebratory',
      'thoughtful_meaningful',
      'nostalgic_reflective',
      'simple_classic'
    ],
    recommendedAtmospheres: ['joyful_celebratory', 'thoughtful_meaningful']
  },

  promotion: {
    atmospheres: [
      'joyful_celebratory',
      'thoughtful_meaningful',
      'simple_classic'
    ],
    recommendedAtmospheres: ['joyful_celebratory']
  },

  retirement: {
    atmospheres: [
      'thoughtful_meaningful',
      'nostalgic_reflective',
      'joyful_celebratory',
      'warm_heartfelt',
      'simple_classic'
    ],
    recommendedAtmospheres: ['nostalgic_reflective', 'thoughtful_meaningful']
  },

  farewell: {
    atmospheres: [
      'thoughtful_meaningful',
      'nostalgic_reflective',
      'warm_heartfelt',
      'simple_classic'
    ],
    recommendedAtmospheres: ['thoughtful_meaningful', 'warm_heartfelt']
  },

  // NEW: Sensitive/Support Occasions

  sympathy: {
    atmospheres: [
      'warm_heartfelt',      // Support, love, comfort
      'thoughtful_meaningful', // Deep reflection, care
      'nostalgic_reflective', // Remembering, honoring
      'simple_classic'        // Understated, timeless
    ],
    recommendedAtmospheres: ['thoughtful_meaningful', 'warm_heartfelt']
  },

  getwellsoon: {
    atmospheres: [
      'warm_heartfelt',      // Care, support
      'thoughtful_meaningful', // Encouraging
      'simple_classic'
    ],
    recommendedAtmospheres: ['warm_heartfelt']
  },

  // NEW: Celebration Occasions

  newbaby: {
    atmospheres: [
      'joyful_celebratory',
      'warm_heartfelt',
      'simple_classic'
    ],
    recommendedAtmospheres: ['joyful_celebratory', 'warm_heartfelt']
  },

  engagement: {
    atmospheres: [
      'joyful_celebratory',
      'warm_heartfelt',
      'thoughtful_meaningful',
      'simple_classic'
    ],
    recommendedAtmospheres: ['warm_heartfelt', 'joyful_celebratory']
  },

  congratulations: {
    atmospheres: [
      'joyful_celebratory',
      'warm_heartfelt',
      'thoughtful_meaningful',
      'simple_classic'
    ],
    recommendedAtmospheres: ['joyful_celebratory', 'warm_heartfelt']
  },

  housewarming: {
    atmospheres: [
      'joyful_celebratory',
      'warm_heartfelt',
      'simple_classic'
    ],
    recommendedAtmospheres: ['warm_heartfelt', 'joyful_celebratory']
  },

  // NEW: Appreciation Occasions

  thankyou: {
    atmospheres: [
      'warm_heartfelt',
      'thoughtful_meaningful',
      'joyful_celebratory',
      'simple_classic'
    ],
    recommendedAtmospheres: ['warm_heartfelt', 'thoughtful_meaningful']
  },

  valentines: {
    atmospheres: [
      'warm_heartfelt',
      'joyful_celebratory',
      'simple_classic'
    ],
    recommendedAtmospheres: ['warm_heartfelt']
  }
};

/**
 * Soundtrack Mapping: Occasion + Atmosphere → Track
 *
 * For beta, using simplified groupings to avoid overbuild.
 * Tracks are royalty-free and appropriate for commercial use.
 */
type SoundtrackId = 'warm_acoustic' | 'upbeat_celebration' | 'elegant_orchestral' | 'gentle_piano' | 'simple_strings';

const SOUNDTRACK_LIBRARY: Record<SoundtrackId, SoundtrackConfig> = {
  warm_acoustic: {
    track: '/soundtracks/warm_acoustic.mp3',
    title: 'Heartwarming',
    artist: 'Kevin MacLeod',
    license: 'CC BY 4.0 (incompetech.com)',
    duration: 138
  },
  upbeat_celebration: {
    track: '/soundtracks/upbeat_celebration.mp3',
    title: 'Wallpaper',
    artist: 'Kevin MacLeod',
    license: 'CC BY 4.0 (incompetech.com)',
    duration: 326
  },
  elegant_orchestral: {
    track: '/soundtracks/elegant_orchestral.mp3',
    title: 'Amazing Plan',
    artist: 'Kevin MacLeod',
    license: 'CC BY 4.0 (incompetech.com)',
    duration: 161
  },
  gentle_piano: {
    track: '/soundtracks/gentle_piano.mp3',
    title: 'Deliberate Thought',
    artist: 'Kevin MacLeod',
    license: 'CC BY 4.0 (incompetech.com)',
    duration: 334
  },
  simple_strings: {
    track: '/soundtracks/simple_strings.mp3',
    title: 'Backbay Lounge',
    artist: 'Kevin MacLeod',
    license: 'CC BY 4.0 (incompetech.com)',
    duration: 395
  }
};

/**
 * Mapping: Occasion + Atmosphere → Soundtrack ID
 *
 * Updated: 2026-08-17 - Added all 15 supported occasions
 */
const OCCASION_SOUNDTRACK_MAP: Record<string, Partial<Record<CelebrationMood, SoundtrackId>>> = {
  birthday: {
    warm_heartfelt: 'warm_acoustic',
    playful_fun: 'upbeat_celebration',
    thoughtful_meaningful: 'warm_acoustic',
    joyful_celebratory: 'upbeat_celebration',
    nostalgic_reflective: 'gentle_piano',
    simple_classic: 'simple_strings'
  },
  wedding: {
    warm_heartfelt: 'elegant_orchestral',
    thoughtful_meaningful: 'elegant_orchestral',
    joyful_celebratory: 'elegant_orchestral',
    nostalgic_reflective: 'gentle_piano',
    simple_classic: 'simple_strings'
  },
  anniversary: {
    warm_heartfelt: 'warm_acoustic',
    thoughtful_meaningful: 'elegant_orchestral',
    nostalgic_reflective: 'gentle_piano',
    simple_classic: 'simple_strings'
  },
  graduation: {
    joyful_celebratory: 'upbeat_celebration',
    thoughtful_meaningful: 'warm_acoustic',
    nostalgic_reflective: 'gentle_piano',
    simple_classic: 'simple_strings'
  },
  promotion: {
    joyful_celebratory: 'upbeat_celebration',
    thoughtful_meaningful: 'warm_acoustic',
    simple_classic: 'simple_strings'
  },
  retirement: {
    thoughtful_meaningful: 'gentle_piano',
    nostalgic_reflective: 'gentle_piano',
    joyful_celebratory: 'warm_acoustic',
    warm_heartfelt: 'warm_acoustic',
    simple_classic: 'simple_strings'
  },
  farewell: {
    thoughtful_meaningful: 'gentle_piano',
    nostalgic_reflective: 'gentle_piano',
    warm_heartfelt: 'warm_acoustic',
    simple_classic: 'simple_strings'
  },

  // NEW: Sensitive/Support Occasions

  sympathy: {
    warm_heartfelt: 'gentle_piano',       // Soft, comforting
    thoughtful_meaningful: 'gentle_piano', // Reflective
    nostalgic_reflective: 'gentle_piano',  // Remembering
    simple_classic: 'simple_strings'       // Understated
  },

  getwellsoon: {
    warm_heartfelt: 'warm_acoustic',      // Encouraging, supportive
    thoughtful_meaningful: 'gentle_piano', // Caring
    simple_classic: 'simple_strings'
  },

  // NEW: Celebration Occasions

  newbaby: {
    joyful_celebratory: 'upbeat_celebration',
    warm_heartfelt: 'warm_acoustic',
    simple_classic: 'simple_strings'
  },

  engagement: {
    joyful_celebratory: 'elegant_orchestral',
    warm_heartfelt: 'warm_acoustic',
    thoughtful_meaningful: 'elegant_orchestral',
    simple_classic: 'simple_strings'
  },

  congratulations: {
    joyful_celebratory: 'upbeat_celebration',
    warm_heartfelt: 'warm_acoustic',
    thoughtful_meaningful: 'warm_acoustic',
    simple_classic: 'simple_strings'
  },

  housewarming: {
    joyful_celebratory: 'upbeat_celebration',
    warm_heartfelt: 'warm_acoustic',
    simple_classic: 'simple_strings'
  },

  // NEW: Appreciation Occasions

  thankyou: {
    warm_heartfelt: 'warm_acoustic',
    thoughtful_meaningful: 'gentle_piano',
    joyful_celebratory: 'upbeat_celebration',
    simple_classic: 'simple_strings'
  },

  valentines: {
    warm_heartfelt: 'warm_acoustic',
    joyful_celebratory: 'elegant_orchestral',
    simple_classic: 'simple_strings'
  }
};

/**
 * Get occasion configuration (available atmospheres)
 *
 * @param occasion - Occasion key (e.g., "birthday")
 * @returns Occasion configuration with atmospheres
 */
export function getOccasionConfig(occasion: string): OccasionConfig {
  // Normalize occasion to lowercase
  const normalizedOccasion = occasion?.toLowerCase().trim();

  // Return occasion-specific config or fallback to birthday (all atmospheres)
  return OCCASION_ATMOSPHERES[normalizedOccasion] || OCCASION_ATMOSPHERES.birthday;
}

/**
 * Get soundtrack for occasion + atmosphere combination
 *
 * @param occasion - Occasion key (e.g., "birthday")
 * @param atmosphere - Atmosphere/mood key (e.g., "warm_heartfelt")
 * @returns Soundtrack configuration
 */
export function getSoundtrack(occasion: string, atmosphere: string): SoundtrackConfig {
  // Normalize inputs
  const normalizedOccasion = occasion?.toLowerCase().trim();
  const normalizedAtmosphere = atmosphere?.toLowerCase().trim() as CelebrationMood;

  // Get soundtrack ID from mapping
  const occasionMap = OCCASION_SOUNDTRACK_MAP[normalizedOccasion];
  const soundtrackId = occasionMap?.[normalizedAtmosphere] || 'simple_strings'; // Universal fallback

  // Return soundtrack config
  return SOUNDTRACK_LIBRARY[soundtrackId];
}

/**
 * Check if atmosphere is appropriate for occasion
 *
 * @param occasion - Occasion key
 * @param atmosphere - Atmosphere/mood key
 * @returns True if atmosphere is appropriate for this occasion
 */
export function isAtmosphereAppropriate(occasion: string, atmosphere: string): boolean {
  const config = getOccasionConfig(occasion);
  return config.atmospheres.includes(atmosphere as CelebrationMood);
}
