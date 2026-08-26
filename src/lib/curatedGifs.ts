/**
 * Curated GIF Library
 *
 * Standard MemoryPop GIF picker uses curated GIFs only (no arbitrary upload).
 * Each GIF is pre-selected for emotional appropriateness and quality.
 *
 * All GIFs stored locally in /public/curated-gifs/ (controlled assets).
 *
 * Future: Occasion-aware filtering (birthday GIFs, wedding GIFs, etc.)
 */

export type GifCategory = 'birthday' | 'celebration' | 'love' | 'funny' | 'gratitude' | 'congrats' | 'nostalgic' | 'elegant';

export interface CuratedGif {
  id: string;
  url: string;
  category: GifCategory;
  description: string;         // For accessibility and UX
  occasions?: string[];        // Future: filter by occasion
  thumbnail?: string;          // Optional static thumbnail (for performance)
}

/**
 * Beta Curated GIF Library - DEVELOPMENT/BETA STATUS
 *
 * 8 animated GIF assets for founder UX testing and beta validation.
 *
 * DEV/BETA STATUS - PHASE 3 IMPLEMENTATION:
 * These GIFs are sourced from publicly available services with appropriate
 * licensing for development/testing use. Each GIF is documented below.
 *
 * PRODUCTION REQUIREMENTS:
 * Before production launch, founder must either:
 * 1. Obtain commercial licenses for these specific GIFs, OR
 * 2. Replace with owned/licensed GIF assets, OR
 * 3. Implement GIPHY Pro API integration for commercial use
 *
 * All GIFs selected for:
 * - Visible animation (not static)
 * - Emotional recognizability
 * - Appropriate to MemoryPop context
 * - Quality sufficient for founder UX testing
 *
 * Sources documented in /docs/curated-gifs-dev-licenses.md
 */
export const CURATED_GIFS: CuratedGif[] = [
  {
    id: 'birthday-cake-sparkle',
    // DEV/BETA: Animated birthday cake with candles - appropriate for celebration
    url: 'https://media.giphy.com/media/g5R9dok94mrIvplmZd/giphy.gif',
    category: 'birthday',
    description: 'Animated birthday cake with candles',
    occasions: ['birthday']
  },
  {
    id: 'celebration-confetti',
    // DEV/BETA: Colorful confetti burst - universal celebration
    url: 'https://media.giphy.com/media/26tOZ42Mg6pbTUPHW/giphy.gif',
    category: 'celebration',
    description: 'Colorful confetti celebration',
    occasions: ['birthday', 'graduation', 'promotion', 'anniversary']
  },
  {
    id: 'heart-love',
    // DEV/BETA: Floating hearts animation - love/affection
    url: 'https://media.giphy.com/media/26FmQ6EOvLxp6cWyY/giphy.gif',
    category: 'love',
    description: 'Floating hearts animation',
    occasions: ['wedding', 'anniversary', 'birthday']
  },
  {
    id: 'funny-laughter',
    // DEV/BETA: Laughing emoji - playful/fun
    url: 'https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif',
    category: 'funny',
    description: 'Playful laughing animation',
    occasions: ['birthday', 'farewell']
  },
  {
    id: 'thank-you-gratitude',
    // DEV/BETA: Thank you text with hearts - gratitude/appreciation
    url: 'https://media.giphy.com/media/ZfK4cXKJTTay1Ava29/giphy.gif',
    category: 'gratitude',
    description: 'Thank you with hearts',
    occasions: ['farewell', 'retirement', 'anniversary']
  },
  {
    id: 'congrats-trophy',
    // DEV/BETA: Trophy with stars - achievement/success
    url: 'https://media.giphy.com/media/g9582DNuQppxC/giphy.gif',
    category: 'congrats',
    description: 'Trophy and celebration',
    occasions: ['promotion', 'graduation']
  },
  {
    id: 'nostalgic-vintage',
    // DEV/BETA: Vintage camera/film - memories/nostalgia
    url: 'https://media.giphy.com/media/l0HlDtKDqfGLuHHxe/giphy.gif',
    category: 'nostalgic',
    description: 'Vintage camera memories',
    occasions: ['retirement', 'farewell', 'anniversary']
  },
  {
    id: 'elegant-sparkle',
    // DEV/BETA: Golden sparkles - elegant/sophisticated
    url: 'https://media.giphy.com/media/l0HlMPcbD4jdARjRC/giphy.gif',
    category: 'elegant',
    description: 'Elegant golden sparkles',
    occasions: ['wedding', 'anniversary', 'graduation']
  }
];

/**
 * Get all curated GIFs (optionally filtered by occasion)
 *
 * @param occasion - Optional occasion key for future filtering
 * @returns Array of curated GIFs
 */
export function getCuratedGifs(occasion?: string): CuratedGif[] {
  // Future: Filter by occasion
  // For now, return all GIFs
  if (occasion) {
    const filtered = CURATED_GIFS.filter(gif =>
      !gif.occasions || gif.occasions.length === 0 || gif.occasions.includes(occasion)
    );
    return filtered.length > 0 ? filtered : CURATED_GIFS;
  }

  return CURATED_GIFS;
}

/**
 * Get curated GIF by ID
 *
 * @param id - GIF identifier
 * @returns Curated GIF or undefined
 */
export function getCuratedGifById(id: string): CuratedGif | undefined {
  return CURATED_GIFS.find(gif => gif.id === id);
}

/**
 * Get curated GIF by URL (for validation/lookup)
 *
 * @param url - GIF URL
 * @returns Curated GIF or undefined
 */
export function getCuratedGifByUrl(url: string): CuratedGif | undefined {
  return CURATED_GIFS.find(gif => gif.url === url);
}
