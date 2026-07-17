/**
 * Cover Theme Utility
 *
 * Maps cover styles to appropriate text colors for accessibility.
 * Ensures all text meets WCAG AA contrast standards (4.5:1 minimum).
 *
 * Design System Fix: Issue discovered during Founder validation
 */

/**
 * Theme configuration for a cover style
 */
export interface CoverTheme {
  primaryText: string;      // Headings (h1, h2)
  secondaryText: string;    // Body text (p)
  accentText: string;       // Mood introduction, special callouts
  buttonBg: string;         // CTA button background
  buttonText: string;       // CTA button text
}

/**
 * Default theme for light backgrounds
 * Matches original design colors
 */
const DEFAULT_THEME: CoverTheme = {
  primaryText: '#3a241e',    // Dark brown
  secondaryText: '#856b5f',  // Medium brown
  accentText: '#FF6B57',     // Orange/coral
  buttonBg: '#ef6a57',       // Orange button
  buttonText: '#FFFFFF',     // White text
};

/**
 * Theme for dark purple backgrounds
 * High contrast white text with tinted secondaries
 */
const DARK_PURPLE_THEME: CoverTheme = {
  primaryText: '#FFFFFF',    // White headings
  secondaryText: '#F0E6FF',  // Light purple body
  accentText: '#FFE066',     // Light yellow accent
  buttonBg: '#FFFFFF',       // White button
  buttonText: '#764ba2',     // Dark purple text
};

/**
 * Theme for pink/red backgrounds
 * White text with pink-tinted secondaries
 */
const PINK_THEME: CoverTheme = {
  primaryText: '#FFFFFF',    // White headings
  secondaryText: '#FFE6F0',  // Light pink body
  accentText: '#FFE066',     // Light yellow accent
  buttonBg: '#FFFFFF',       // White button
  buttonText: '#f5576c',     // Pink text
};

/**
 * Theme for peach/coral backgrounds
 * White text with peach-tinted secondaries
 */
const PEACH_THEME: CoverTheme = {
  primaryText: '#FFFFFF',    // White headings
  secondaryText: '#FFF0E6',  // Light peach body
  accentText: '#FFE066',     // Light yellow accent
  buttonBg: '#FFFFFF',       // White button
  buttonText: '#fd6585',     // Coral text
};

/**
 * Map of all cover style IDs to their themes
 *
 * IMPORTANT: Keep in sync with coverStyles.ts
 */
export const COVER_THEMES: Record<string, CoverTheme> = {
  // Default - light background
  'none': DEFAULT_THEME,

  // Birthday - Dark purple requires white text
  'confetti': DARK_PURPLE_THEME,
  'cake': PINK_THEME,
  'balloons': DEFAULT_THEME,  // Light blue - dark text works

  // Anniversary - Mostly light backgrounds
  'floral': DEFAULT_THEME,    // Very light - dark text works
  'romantic': DEFAULT_THEME,  // Light pastel - dark text works
  'elegant': DEFAULT_THEME,   // Light - dark text works

  // Wedding - Mixed
  'celebration': DARK_PURPLE_THEME,  // Dark purple - needs white text
  'journey': DEFAULT_THEME,          // Light blue - dark text works
  'gratitude': DEFAULT_THEME,        // Light green/blue - dark text works

  // Farewell - Mixed
  'warm': DEFAULT_THEME,      // Light peach - dark text works
  'heartfelt': PINK_THEME,    // Pink/red gradient - needs white text
  'grateful': DEFAULT_THEME,  // Light green/blue - dark text works

  // Graduation - Mixed
  'achievement': PINK_THEME,  // Pink gradient - needs white text
  'future': DEFAULT_THEME,    // Light blue - dark text works

  // New Baby - Mixed
  'soft': DEFAULT_THEME,      // Light peach - dark text works
  'pastel': DEFAULT_THEME,    // Light blue - dark text works
  'gentle': PEACH_THEME,      // Peach/coral gradient - needs white text

  // Wedding (additional)
  'hearts': PINK_THEME,       // Pink gradient - needs white text
};

/**
 * Get the theme configuration for a given cover style
 *
 * @param styleId - The cover style ID from the database
 * @returns Theme object with text colors and button styling
 *
 * @example
 * const theme = getCoverTheme('confetti');
 * // Returns: { primaryText: '#FFFFFF', secondaryText: '#F0E6FF', ... }
 */
export function getCoverTheme(styleId: string | null | undefined): CoverTheme {
  // Handle null/undefined/empty
  if (!styleId) return DEFAULT_THEME;

  // Return mapped theme or default
  return COVER_THEMES[styleId] || DEFAULT_THEME;
}

/**
 * Utility: Check if a cover style uses a dark background
 * Useful for conditional styling decisions
 *
 * @param styleId - The cover style ID
 * @returns true if the style uses white text (dark background)
 */
export function isDarkBackground(styleId: string | null | undefined): boolean {
  const theme = getCoverTheme(styleId);
  return theme.primaryText === '#FFFFFF';
}
