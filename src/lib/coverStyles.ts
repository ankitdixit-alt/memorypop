/**
 * Cover Style Utility
 *
 * Maps cover style IDs to gradients and provides consistent styling
 * across the entire MemoryPop experience.
 *
 * Production Blocker Fix: Issue #2
 */

/**
 * Default gradient when no style is selected or for existing MemoryPops
 */
const DEFAULT_GRADIENT = 'linear-gradient(135deg, #FFE1D6 0%, #FFF3C7 50%, #E5D4FF 100%)';

/**
 * Map of all cover style IDs to their gradients
 *
 * IMPORTANT: Keep in sync with occasions.ts coverPresets
 */
const COVER_STYLE_MAP: Record<string, string> = {
  // Default
  'none': DEFAULT_GRADIENT,

  // Birthday
  'confetti': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'cake': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'balloons': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',

  // Anniversary
  'floral': 'linear-gradient(135deg, #fff1eb 0%, #ace0f9 100%)',
  'romantic': 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)',
  'elegant': 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',

  // Wedding
  'celebration': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'journey': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'gratitude': 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',

  // Farewell
  'warm': 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
  'heartfelt': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'grateful': 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',

  // Graduation
  'achievement': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'future': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',

  // New Baby
  'soft': 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
  'pastel': 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
  'gentle': 'linear-gradient(135deg, #ffd3a5 0%, #fd6585 100%)',

  // Wedding (duplicate entries with different names)
  'hearts': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
};

/**
 * Get the gradient CSS for a given cover style
 *
 * @param styleId - The cover style ID from the database
 * @returns CSS gradient string
 *
 * @example
 * const gradient = getCoverGradient('confetti');
 * // Returns: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
 */
export function getCoverGradient(styleId: string | null | undefined): string {
  // Handle null/undefined/empty
  if (!styleId) return DEFAULT_GRADIENT;

  // Return mapped gradient or default
  return COVER_STYLE_MAP[styleId] || DEFAULT_GRADIENT;
}

/**
 * Get styles for a hero/cover section
 *
 * @param styleId - The cover style ID from the database
 * @returns CSS style object for hero section
 */
export function getCoverHeroStyle(styleId: string | null | undefined): React.CSSProperties {
  return {
    background: getCoverGradient(styleId),
  };
}

/**
 * Get styles for a subtle accent section
 *
 * Uses the cover gradient at reduced opacity for consistency
 * without overwhelming the UI.
 *
 * @param styleId - The cover style ID from the database
 * @returns CSS style object for accent section
 */
export function getCoverAccentStyle(styleId: string | null | undefined): React.CSSProperties {
  const gradient = getCoverGradient(styleId);

  return {
    background: `linear-gradient(to bottom, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.8)), ${gradient}`,
  };
}
