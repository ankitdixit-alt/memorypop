/**
 * Premium Theme Configuration
 *
 * Switch between Theme A and Theme B by changing the PREMIUM_THEME value.
 * This is the ONLY change required to switch themes.
 *
 * Theme A: /audio/premium-theme-a.mp3 (Solo Piano)
 * Theme B: /audio/premium-theme-b.mp3 (Solo Piano alternate)
 *
 * Usage:
 * - Set PREMIUM_THEME to "A" or "B"
 * - No other code changes needed
 * - Reload browser to hear new theme
 *
 * Experiment Purpose:
 * This is a founder observation experiment (NOT analytics).
 * Manually switch themes while testing with early beta users.
 * Ask recipients: Which felt warmer? Which stayed with them? Which felt more emotional?
 */

export const PREMIUM_THEME = "A";

/**
 * Get the audio file path for the current theme
 */
export function getPremiumThemeAudioPath(): string {
  if (PREMIUM_THEME === "A") {
    return "/audio/premium-theme-a.mp3";
  } else if (PREMIUM_THEME === "B") {
    return "/audio/premium-theme-b.mp3";
  } else {
    // Fallback to Theme A if invalid value
    console.warn(`Invalid PREMIUM_THEME value: ${PREMIUM_THEME}. Falling back to Theme A.`);
    return "/audio/premium-theme-a.mp3";
  }
}
