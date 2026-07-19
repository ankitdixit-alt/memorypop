/**
 * Celebration Experience Composition Layer
 *
 * Combines Occasion (WHAT is celebrated) and Mood (HOW it feels) into
 * a unified celebration experience.
 *
 * GUARDRAILS:
 * #1: Preserves both Occasion and Mood as separate dimensions
 * #2: Field-level composition (not object replacement)
 * #3: Targeted safety overrides (Sympathy + Funny/Emotional only)
 * #4: Separate composition module (doesn't own occasion or mood config)
 * #5: Legacy value compatibility (normalization functions)
 */

import { OCCASIONS, type OccasionMetadata, normalizeOccasion, type OccasionCategory, type CoverPreset } from './occasions';
import { CELEBRATION_MOODS, type CelebrationMood, normalizeMood } from './celebrationMood';

/**
 * Complete celebration experience combining occasion and mood
 */
export interface CelebrationExperience {
  // From occasion
  id: string;
  label: string;
  emoji: string;
  category: OccasionCategory;
  celebrationMessage: string;
  subMessage?: string;
  helperText?: string;
  progressLabel?: string;
  actionLabel?: string;
  emptyStateMessage?: string;
  sharePrompt?: string;
  messageStarters?: string[];
  emojiShortcuts?: string[];
  coverPresets?: CoverPreset[];
  landingNarrative?: { line1: string; line2: string; line3: string; };
  contributeNarrative?: { line1: string; line2: string; line3: string; line4: string; };
  contributeCTA?: string;
  whatsappMessage?: string;
  revealWhatsappMessage?: string;
  successMessage?: { title: string; message: string; };
  formPlaceholders?: { name: string; message: string; };

  // From mood (or occasion safetyOverride)
  contributorHeadline: string;
  contributorSupportingText: string;
  contributorPrompt: string;
  contributorPlaceholder: string;
  revealIntroduction: string;

  // Metadata
  moodUsed: CelebrationMood;           // Which mood was applied
  hasSafetyOverrides: boolean;         // Whether safety overrides were applied
}

/**
 * Combines occasion and mood into complete celebration experience
 *
 * GUARDRAIL #2: Field-level composition - each field composed individually
 * GUARDRAIL #3: Preserve creator's mood selection wherever appropriate
 */
export function getCelebrationExperience({
  occasion,
  mood,
  recipientName,
}: {
  occasion: string;
  mood?: string | null;
  recipientName?: string;
}): CelebrationExperience {
  // Step 1: Normalize inputs (GUARDRAIL #5: Legacy compatibility)
  const resolvedOccasion = normalizeOccasion(occasion);
  const resolvedMood = normalizeMood(mood);

  // Step 2: Load configurations
  const occasionConfig = OCCASIONS[resolvedOccasion] || OCCASIONS.birthday;
  const moodConfig = CELEBRATION_MOODS[resolvedMood];

  // Step 3: Check if this combination needs safety handling
  const needsSafetyHandling = shouldApplySafetyOverrides(
    resolvedOccasion,
    resolvedMood
  );

  // Step 4: FIELD-LEVEL COMPOSITION (GUARDRAIL #2)
  // Each field composed individually, not object-level replacement
  const composed: CelebrationExperience = {
    // Occasion-owned fields (always from occasion)
    id: occasionConfig.id,
    label: occasionConfig.label,
    emoji: occasionConfig.emoji,
    category: occasionConfig.category,
    celebrationMessage: typeof occasionConfig.celebrationMessage === 'function'
      ? occasionConfig.celebrationMessage(recipientName)
      : occasionConfig.celebrationMessage,
    subMessage: occasionConfig.subMessage,
    helperText: occasionConfig.helperText,
    progressLabel: occasionConfig.progressLabel,
    actionLabel: occasionConfig.actionLabel,
    emptyStateMessage: occasionConfig.emptyStateMessage,
    sharePrompt: occasionConfig.sharePrompt,
    messageStarters: occasionConfig.messageStarters,
    emojiShortcuts: occasionConfig.emojiShortcuts,
    coverPresets: occasionConfig.coverPresets,
    landingNarrative: occasionConfig.landingNarrative,
    contributeNarrative: occasionConfig.contributeNarrative,
    contributeCTA: occasionConfig.contributeCTA,
    whatsappMessage: occasionConfig.whatsappMessage,
    revealWhatsappMessage: occasionConfig.revealWhatsappMessage,
    successMessage: occasionConfig.successMessage,
    formPlaceholders: occasionConfig.formPlaceholders,

    // Mood-influenced fields (FIELD-BY-FIELD composition)
    contributorHeadline: composeHeadline(occasionConfig, moodConfig, needsSafetyHandling),
    contributorSupportingText: composeSupportingText(occasionConfig, moodConfig, needsSafetyHandling),
    contributorPrompt: composePrompt(occasionConfig, moodConfig, needsSafetyHandling),
    contributorPlaceholder: composePlaceholder(occasionConfig, moodConfig, needsSafetyHandling),
    revealIntroduction: composeRevealIntro(occasionConfig, moodConfig, needsSafetyHandling),

    // Metadata
    moodUsed: resolvedMood,
    hasSafetyOverrides: needsSafetyHandling,
  };

  // Step 5: Apply personalization to form placeholders
  if (recipientName && composed.formPlaceholders) {
    composed.formPlaceholders = applyPersonalization(
      composed.formPlaceholders,
      recipientName
    );
  }

  return composed;
}

/**
 * Determines if combination needs safety handling
 *
 * GUARDRAIL #3: Targeted safety, not blanket overrides
 * - Sympathy + Funny/Emotional → soften to gentle warmth
 * - Get Well Soon + Funny → allow (humor can aid recovery)
 * - All other combinations → allow creator's mood selection
 */
function shouldApplySafetyOverrides(
  occasion: string,
  mood: CelebrationMood
): boolean {
  // Only Sympathy with Funny/Emotional needs softening
  if (occasion === 'sympathy' && (mood === 'funny' || mood === 'emotional')) {
    return true;
  }

  // Get Well Soon can be funny (appropriate for close relationships)
  // Do NOT override Get Well Soon + Funny

  return false;
}

/**
 * Compose headline field
 *
 * GUARDRAIL #2: Field-level precedence
 * 1. Occasion-specific safety override (only for incompatible combinations)
 * 2. Mood-provided emotional tone (default)
 */
function composeHeadline(
  occasion: OccasionMetadata,
  mood: { contributorHeadline: string },
  needsSafety: boolean
): string {
  if (needsSafety && occasion.safetyOverrides?.contributorHeadline) {
    return occasion.safetyOverrides.contributorHeadline;
  }

  return mood.contributorHeadline;
}

/**
 * Compose supporting text field
 */
function composeSupportingText(
  occasion: OccasionMetadata,
  mood: { contributorSupportingText: string },
  needsSafety: boolean
): string {
  if (needsSafety && occasion.safetyOverrides?.contributorSupportingText) {
    return occasion.safetyOverrides.contributorSupportingText;
  }

  return mood.contributorSupportingText;
}

/**
 * Compose prompt field
 */
function composePrompt(
  occasion: OccasionMetadata,
  mood: { contributorPrompt: string },
  needsSafety: boolean
): string {
  if (needsSafety && occasion.safetyOverrides?.contributorPrompt) {
    return occasion.safetyOverrides.contributorPrompt;
  }

  return mood.contributorPrompt;
}

/**
 * Compose placeholder field
 */
function composePlaceholder(
  occasion: OccasionMetadata,
  mood: { contributorPlaceholder: string },
  needsSafety: boolean
): string {
  if (needsSafety && occasion.safetyOverrides?.contributorPlaceholder) {
    return occasion.safetyOverrides.contributorPlaceholder;
  }

  return mood.contributorPlaceholder;
}

/**
 * Compose reveal introduction field
 */
function composeRevealIntro(
  occasion: OccasionMetadata,
  mood: { revealIntroduction: string },
  needsSafety: boolean
): string {
  if (needsSafety && occasion.safetyOverrides?.revealIntroduction) {
    return occasion.safetyOverrides.revealIntroduction;
  }

  return mood.revealIntroduction;
}

/**
 * Apply recipient name personalization to form placeholders
 */
function applyPersonalization(
  placeholders: { name: string; message: string },
  recipientName: string
): { name: string; message: string } {
  return {
    name: placeholders.name,
    message: placeholders.message.replace(/{name}/gi, recipientName)
  };
}
