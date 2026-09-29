/**
 * MemoryPop Plus Product Configuration
 * Single source of truth for Plus tier naming, pricing, and allowances
 */

export const MEMORYPOP_PLUS = {
  // Product naming
  name: 'MemoryPop Plus',
  tagline: 'More room for every memory',

  // Pricing
  price: '€4.99',
  priceLabel: 'Founding price',

  // Standard tier allowances (for comparison)
  standard: {
    photos: 3,
    gifs: 1,
    videoSeconds: 15,
  },

  // Plus tier allowances
  plus: {
    photos: 10,
    gifs: 3,
    videoSeconds: 90,
  },

  // Feature descriptions
  features: {
    photos: '10 photos per contributor',
    gifs: '3 GIFs per contributor',
    video: '90-sec video per contributor',
    music: 'custom music',
    styles: 'premium reveal styles',
  },

  // Short summary (for compact displays)
  shortSummary: '10 photos · 3 GIFs · 90-sec video per contributor',
  fullSummary: '10 photos · 3 GIFs · 90-sec video per contributor\nPlus custom music and premium reveal styles.',

  // Coming soon state
  comingSoon: true,
  comingSoonCTA: 'I\'m interested',
  comingSoonConfirmation: '✓ Thanks — noted 💛',
  comingSoonFollowup: 'We\'ll let you know when MemoryPop Plus is ready.',
} as const;

/**
 * Get contribution limits for a tier
 * @param isPremium - Whether the gift is Plus/Premium tier
 * @returns Contribution limits for the tier
 */
export function getContributionLimits(isPremium: boolean) {
  return isPremium ? MEMORYPOP_PLUS.plus : MEMORYPOP_PLUS.standard;
}
