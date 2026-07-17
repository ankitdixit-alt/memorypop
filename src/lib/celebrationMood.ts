/**
 * Celebration Mood Configuration
 *
 * Defines mood-specific copy for contributor journey and reveal introduction.
 * Moods influence the emotional tone throughout the MemoryPop experience.
 */

export type CelebrationMood = "heartfelt" | "funny" | "emotional" | "simple";

export interface MoodConfig {
  contributorHeadline: string;
  contributorSupportingText: string;
  contributorPrompt: string;
  contributorPlaceholder: string;
  revealIntroduction: string;
}

export const CELEBRATION_MOODS: Record<CelebrationMood, MoodConfig> = {
  heartfelt: {
    contributorHeadline: "Help us create something they'll treasure.",
    contributorSupportingText: "Share a meaningful memory, message, or wish from the heart.",
    contributorPrompt: "What is one memory that shows how much they mean to you?",
    contributorPlaceholder: "I'll never forget the time we…",
    revealIntroduction: "Every memory here was shared with love.",
  },
  funny: {
    contributorHeadline: "Help us make them laugh.",
    contributorSupportingText: "Share a funny memory, inside joke, or story they'll instantly recognise.",
    contributorPrompt: "What is the funniest moment you have shared together?",
    contributorPlaceholder: "Remember when we…",
    revealIntroduction: "Get ready for a few memories that might make you laugh.",
  },
  emotional: {
    contributorHeadline: "Share something they'll always remember.",
    contributorSupportingText: "Write something meaningful that you may not say often enough.",
    contributorPrompt: "What is something you have always wanted them to know?",
    contributorPlaceholder: "I want you to know that…",
    revealIntroduction: "Some words stay with us forever.",
  },
  simple: {
    contributorHeadline: "Add your message.",
    contributorSupportingText: "Leave a short memory, wish, or note for the celebration.",
    contributorPrompt: "What would you like to say?",
    contributorPlaceholder: "Wishing you…",
    revealIntroduction: "Here are messages from people who care about you.",
  },
};

/**
 * Get mood configuration with safe fallback
 * @param tone - The tone value from database (may be capitalized or null)
 * @returns Mood configuration (defaults to "simple" for unknown values)
 */
export function getMoodConfig(tone: string | null | undefined): MoodConfig {
  if (!tone) {
    return CELEBRATION_MOODS.simple;
  }

  const normalizedMood = tone.toLowerCase() as CelebrationMood;

  if (normalizedMood in CELEBRATION_MOODS) {
    return CELEBRATION_MOODS[normalizedMood];
  }

  // Fallback for unknown values
  return CELEBRATION_MOODS.simple;
}

/**
 * Get mood type with safe fallback
 * @param tone - The tone value from database
 * @returns Normalized mood type
 */
export function getMoodType(tone: string | null | undefined): CelebrationMood {
  if (!tone) {
    return "simple";
  }

  const normalizedMood = tone.toLowerCase() as CelebrationMood;

  if (normalizedMood in CELEBRATION_MOODS) {
    return normalizedMood;
  }

  return "simple";
}
