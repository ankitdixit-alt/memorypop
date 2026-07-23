/**
 * Celebration Mood Configuration
 *
 * Mood is a long-term experience layer that influences the emotional tone throughout the MemoryPop experience.
 *
 * This release: Mood influences copy (creator message-writing, contributor forms, reveal introduction)
 * Future: Mood will influence visual styling, animations, reveal experience, celebration effects, and AI prompting
 */

export type CelebrationMood =
  | "warm_heartfelt"
  | "playful_fun"
  | "thoughtful_meaningful"
  | "joyful_celebratory"
  | "nostalgic_reflective"
  | "simple_classic";

// Legacy mood types (for backwards compatibility)
type LegacyMood = "heartfelt" | "funny" | "emotional" | "simple";

export interface MoodConfig {
  // UI labels
  id: CelebrationMood;
  label: string;
  emoji: string;
  description: string;

  // Creator experience (message writing step during creation)
  creatorHeadline: string;
  creatorSupportingText: string;
  creatorPrompt: string;
  creatorPlaceholder: string;

  // Contributor experience (contribute page)
  contributorHeadline: string;
  contributorSupportingText: string;
  contributorPrompt: string;
  contributorPlaceholder: string;

  // Reveal experience
  revealIntroduction: string;

  // Optional: message starters (for creator message step)
  messageStarters?: string[];

  // Future extensibility (not yet implemented):
  // - Visual: colors, gradients, cover styles
  // - Animation: transition effects, celebration effects
  // - AI: prompt engineering hints
}

export const CELEBRATION_MOODS: Record<CelebrationMood, MoodConfig> = {
  warm_heartfelt: {
    id: "warm_heartfelt",
    label: "Warm & heartfelt",
    emoji: "💕",
    description: "Genuine love and warmth",

    // Creator experience
    creatorHeadline: "Make it personal",
    creatorSupportingText: "If someone asked why [Recipient] is special, what would you say?",
    creatorPrompt: "Your message",
    creatorPlaceholder: "Share your message...",

    // Contributor experience
    contributorHeadline: "Share something from the heart",
    contributorSupportingText: "This celebration is about genuine connection and love. Share a meaningful memory or heartfelt message.",
    contributorPrompt: "What is one memory that shows how much they mean to you?",
    contributorPlaceholder: "I'll always remember the time we...",

    // Reveal experience
    revealIntroduction: "Every memory here was shared with love.",

    messageStarters: [
      "One of my favorite memories with you is...",
      "You mean so much to me because...",
      "I'll never forget the day when...",
      "What I admire most about you is..."
    ]
  },

  playful_fun: {
    id: "playful_fun",
    label: "Playful & fun",
    emoji: "🎉",
    description: "Lighthearted and joyful",

    // Creator experience
    creatorHeadline: "Make it personal",
    creatorSupportingText: "If someone asked why [Recipient] is special, what would you say?",
    creatorPrompt: "Your message",
    creatorPlaceholder: "Share your message...",

    // Contributor experience
    contributorHeadline: "Share something that will make them smile",
    contributorSupportingText: "This celebration is about laughter and joy. Share a funny memory, inside joke, or lighthearted story.",
    contributorPrompt: "What's the funniest moment you've shared together?",
    contributorPlaceholder: "Remember when we...",

    // Reveal experience
    revealIntroduction: "Get ready for some memories that might make you laugh.",

    messageStarters: [
      "I still laugh when I think about the time...",
      "Remember when we thought it was a good idea to...",
      "One thing that always makes me smile is...",
      "I'll never let you forget the day you..."
    ]
  },

  thoughtful_meaningful: {
    id: "thoughtful_meaningful",
    label: "Thoughtful & meaningful",
    emoji: "✨",
    description: "Sincere and intentional",

    // Creator experience
    creatorHeadline: "Make it personal",
    creatorSupportingText: "If someone asked why [Recipient] is special, what would you say?",
    creatorPrompt: "Your message",
    creatorPlaceholder: "Share your message...",

    // Contributor experience
    contributorHeadline: "Share something meaningful",
    contributorSupportingText: "This celebration is about thoughtful reflection and genuine appreciation. Share something meaningful and sincere.",
    contributorPrompt: "What would you like them to always remember?",
    contributorPlaceholder: "What I've always appreciated about you is...",

    // Reveal experience
    revealIntroduction: "Every word here was chosen with care.",

    messageStarters: [
      "I've always admired the way you...",
      "One thing I hope you never forget is...",
      "What makes you special is...",
      "I'm grateful for the times we..."
    ]
  },

  joyful_celebratory: {
    id: "joyful_celebratory",
    label: "Joyful & celebratory",
    emoji: "🎊",
    description: "Uplifting and full of energy",

    // Creator experience
    creatorHeadline: "Make it personal",
    creatorSupportingText: "If someone asked why [Recipient] is special, what would you say?",
    creatorPrompt: "Your message",
    creatorPlaceholder: "Share your message...",

    // Contributor experience
    contributorHeadline: "Share the joy!",
    contributorSupportingText: "This celebration is about excitement and positive energy. Share an achievement, happy moment, or reason to celebrate.",
    contributorPrompt: "What makes this moment worth celebrating?",
    contributorPlaceholder: "I'm celebrating you because...",

    // Reveal experience
    revealIntroduction: "This is a moment to celebrate together!",

    messageStarters: [
      "I'm so proud of you for...",
      "This is such an exciting moment because...",
      "Watching you achieve this has been...",
      "You deserve to celebrate because..."
    ]
  },

  nostalgic_reflective: {
    id: "nostalgic_reflective",
    label: "Nostalgic & reflective",
    emoji: "🌸",
    description: "Looking back with fondness",

    // Creator experience
    creatorHeadline: "Make it personal",
    creatorSupportingText: "If someone asked why [Recipient] is special, what would you say?",
    creatorPrompt: "Your message",
    creatorPlaceholder: "Share your message...",

    // Contributor experience
    contributorHeadline: "Share a memory they'll treasure",
    contributorSupportingText: "This celebration is about cherished memories and meaningful moments. Share a favorite memory from the past.",
    contributorPrompt: "What memory do you treasure most?",
    contributorPlaceholder: "Looking back, I'll always remember...",

    // Reveal experience
    revealIntroduction: "Sometimes the best moments are the ones we carry with us.",

    messageStarters: [
      "Looking back, one moment that stands out is...",
      "I'll always treasure the memory of...",
      "Do you remember when we used to...",
      "Time has passed, but I still think about..."
    ]
  },

  simple_classic: {
    id: "simple_classic",
    label: "Simple & classic",
    emoji: "🤍",
    description: "Let the memories speak for themselves",

    // Creator experience
    creatorHeadline: "Make it personal",
    creatorSupportingText: "If someone asked why [Recipient] is special, what would you say?",
    creatorPrompt: "Your message",
    creatorPlaceholder: "Share your message...",

    // Contributor experience
    contributorHeadline: "Share your memory",
    contributorSupportingText: "This celebration is about authentic moments. Share what comes naturally.",
    contributorPrompt: "What would you like to say?",
    contributorPlaceholder: "I wanted to share...",

    // Reveal experience
    revealIntroduction: "Here are the memories everyone wanted to share.",

    messageStarters: [
      "I wanted to say...",
      "One thing I remember is...",
      "I'm thinking of...",
      "Here's what I want you to know..."
    ]
  }
};

/**
 * Get mood configuration with safe fallback
 *
 * For existing MemoryPops only, provides a fallback. New MemoryPops require explicit mood selection.
 *
 * @param tone - The tone value from database (may be capitalized or null)
 * @returns Mood configuration (defaults to "warm_heartfelt" for legacy/unknown values)
 */
export function getMoodConfig(tone: string | null | undefined): MoodConfig {
  const normalized = normalizeMood(tone);
  return CELEBRATION_MOODS[normalized];
}

/**
 * Normalize mood value for composition layer
 *
 * Handles legacy values and ensures backwards compatibility
 *
 * @param mood - Mood value (may be legacy format, capitalized, or null)
 * @returns Normalized CelebrationMood
 */
export function normalizeMood(mood: string | null | undefined): CelebrationMood {
  // For existing MemoryPops with no mood, default to warm_heartfelt
  if (!mood) {
    return "warm_heartfelt";
  }

  const lowercase = mood.toLowerCase().trim();

  // Handle new mood values (snake_case)
  if (lowercase in CELEBRATION_MOODS) {
    return lowercase as CelebrationMood;
  }

  // Handle legacy values (old capitalized format)
  const legacyMap: Record<string, CelebrationMood> = {
    "heartfelt": "warm_heartfelt",
    "funny": "playful_fun",
    "emotional": "nostalgic_reflective",
    "simple": "simple_classic",
    // Handle transition from old new names to final names
    "elegant_meaningful": "thoughtful_meaningful",
    "bold_celebratory": "joyful_celebratory",
  };

  return legacyMap[lowercase] || "warm_heartfelt";
}

/**
 * Get mood type with safe fallback (alias for normalizeMood)
 *
 * @param tone - The tone value from database
 * @returns Normalized mood type
 */
export function getMoodType(tone: string | null | undefined): CelebrationMood {
  return normalizeMood(tone);
}
