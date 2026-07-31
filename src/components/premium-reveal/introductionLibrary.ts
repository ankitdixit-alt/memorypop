/**
 * Smart Introduction Library
 *
 * Provides natural, varied introduction phrases for Premium Reveal.
 * Avoids repetitive patterns and template-like language.
 *
 * Principles:
 * - Never repeat the same introduction within one reveal
 * - Match introduction to media type
 * - Keep wording short and conversational
 * - Feel authentic, not AI-generated
 * - The recipient should feel another real person is stepping forward
 */

interface IntroductionSet {
  photo: string[];
  message: string[];
  video: string[];
}

const introductions: IntroductionSet = {
  photo: [
    "wanted you to remember...",
    "remembered this day...",
    "kept this photo because...",
    "smiled when thinking about...",
    "couldn't forget this moment...",
    "wanted to share this memory...",
    "held onto this moment...",
  ],
  message: [
    "wanted to tell you something...",
    "has been meaning to say...",
    "couldn't let today pass without...",
    "wanted you to know...",
    "has something they'd like to share...",
    "wrote something especially for you...",
    "wanted to make sure you heard this...",
  ],
  video: [
    "wanted to look you in the eyes...",
    "recorded something especially for you...",
    "wanted to speak directly to you...",
    "couldn't say this in writing...",
    "wanted you to hear this in their own voice...",
    "recorded a message just for you...",
  ],
};

type MediaType = 'photo' | 'message' | 'video';

/**
 * Get a varied introduction for a contributor moment
 *
 * @param contributorName - Name of the contributor
 * @param mediaType - Type of media being presented
 * @param usedIntroductions - Array of introduction phrases already used in this reveal
 * @returns A natural introduction string like "Marcus wanted you to remember..."
 */
export function getIntroduction(
  contributorName: string,
  mediaType: MediaType,
  usedIntroductions: string[] = []
): { text: string; phrase: string } {
  const options = introductions[mediaType];

  // Find unused introductions
  const availableOptions = options.filter(
    phrase => !usedIntroductions.includes(phrase)
  );

  // If all have been used, reset and use any
  const selectedPhrase = availableOptions.length > 0
    ? availableOptions[Math.floor(Math.random() * availableOptions.length)]
    : options[Math.floor(Math.random() * options.length)];

  const text = `${contributorName} ${selectedPhrase}`;

  return { text, phrase: selectedPhrase };
}

/**
 * Select introductions for multiple contributors
 * Ensures no repetition within the set
 */
export function selectIntroductions(
  contributors: Array<{ name: string; type: MediaType }>,
  startWithUsed: string[] = []
): Array<{ contributorName: string; introduction: string; phrase: string }> {
  const used: string[] = [...startWithUsed];
  const results: Array<{ contributorName: string; introduction: string; phrase: string }> = [];

  for (const contributor of contributors) {
    const { text, phrase } = getIntroduction(contributor.name, contributor.type, used);
    used.push(phrase);
    results.push({
      contributorName: contributor.name,
      introduction: text,
      phrase,
    });
  }

  return results;
}
