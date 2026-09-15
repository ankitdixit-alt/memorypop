/**
 * AI Director Experiment Results
 *
 * Structured data extracted from AI-DIRECTOR-EXPERIMENT-RESULTS.md
 * Used to generate deterministic mock reveal plans that match documented experiment outcomes.
 *
 * IMPORTANT: This is reference data only. No Gemini API calls are made.
 */

export interface ExperimentStructure {
  testA: {
    chapters: { title: string; contributorPattern: string }[]
    highlightPattern: string
    finalePattern: string
    opening: string
  }
  testB: {
    chapters: { title: string; contributorPattern: string }[]
    highlightPattern: string
    finalePattern: string
    opening: string
    creatorInstruction: string
  }
}

/**
 * Birthday Experiment (Emma Test)
 * 15 memories, 100% position difference from Standard
 */
export const birthdayExperiment: ExperimentStructure = {
  testA: {
    chapters: [
      { title: 'Lifelong Bonds', contributorPattern: 'family|childhood|brother|mom' },
      { title: 'Adventures and Laughter', contributorPattern: 'college|work|friend' },
      { title: 'Looking Forward', contributorPattern: 'future|next|chapter' }
    ],
    highlightPattern: 'best friend|mom|college roommate',
    finalePattern: 'mom',
    opening: 'Emma, thirty years of memories come together to celebrate the incredible person you are. From childhood adventures to today, these messages tell the story of a life filled with love, laughter, and meaningful connections.'
  },
  testB: {
    chapters: [
      { title: 'Fun and Friendship', contributorPattern: 'college|work|sarah' },
      { title: 'Shared History', contributorPattern: 'childhood|cousin' },
      { title: 'Family Love', contributorPattern: 'brother|mom|family' }
    ],
    highlightPattern: 'sarah|college|inside joke',
    finalePattern: 'mom',
    opening: 'Hey Emma! Let\'s kick off your 30th with some of your favorite people sharing their favorite Emma moments. Get ready to laugh, smile, and maybe even cry a little!',
    creatorInstruction: 'Open with fun energy, transition to deeper memories, end with family love'
  }
}

/**
 * Farewell/Retirement Experiment (Michael Zhang)
 * 12 memories, 92% position difference from Standard
 */
export const farewellExperiment: ExperimentStructure = {
  testA: {
    chapters: [
      { title: 'Leadership and Legacy', contributorPattern: 'ceo|senior|director' },
      { title: 'Mentorship and Impact', contributorPattern: 'mentee|taught|learned' },
      { title: 'Friendship and Humor', contributorPattern: 'golf|joke|funny' },
      { title: 'Gratitude and Farewell', contributorPattern: 'team|thank|farewell' }
    ],
    highlightPattern: 'ceo|long-time mentee|20-year colleague',
    finalePattern: 'team',
    opening: 'Michael, after 35 years of dedication, vision, and leadership, your colleagues have come together to honor your incredible career and the profound impact you\'ve had on so many lives.'
  },
  testB: {
    chapters: [
      { title: 'Professional Excellence', contributorPattern: 'ceo|sarah|leadership' },
      { title: 'Lighter Moments', contributorPattern: 'golf|rodriguez|joke' },
      { title: 'Heartfelt Gratitude', contributorPattern: 'mentee|linda|team' }
    ],
    highlightPattern: 'ceo|video message|career milestone',
    finalePattern: 'team',
    opening: 'Michael Zhang, your colleagues and friends reflect on 35 years of professional excellence, shared laughter, and the mentorship that shaped so many careers.',
    creatorInstruction: 'Start with professional acknowledgments, include lighter moments in the middle, and build to the most heartfelt messages at the end'
  }
}

/**
 * Anniversary Experiment (Alex & Jordan)
 * 10 memories, 60% position difference from Standard
 */
export const anniversaryExperiment: ExperimentStructure = {
  testA: {
    chapters: [
      { title: 'Love and Laughter', contributorPattern: 'best man|neighbor|friend' },
      { title: 'Partnership and Growth', contributorPattern: 'maid|colleague|work' },
      { title: 'Family Blessings', contributorPattern: 'parents|mom|dad' }
    ],
    highlightPattern: 'best man toast|photographer|parents video',
    finalePattern: 'jordan.*parents',
    opening: 'Alex and Jordan, ten years ago you promised forever. Today, the people who\'ve witnessed your love story celebrate the beautiful partnership you\'ve built together.'
  },
  testB: {
    chapters: [
      { title: 'Fun and Friendship', contributorPattern: 'marcus|emma|just friends' },
      { title: 'Love That Lasts', contributorPattern: 'sophie|priya|photographer' },
      { title: 'Family Love', contributorPattern: 'parents|maya|mom|dad' }
    ],
    highlightPattern: 'best man joke|maid of honor',
    finalePattern: 'jordan.*parents',
    opening: 'Hey Alex and Jordan! Remember when you were "just friends"? Let\'s relive the journey from there to ten years of married bliss!',
    creatorInstruction: 'Open with fun memories and light teasing, transition to heartfelt relationship reflections, and finish with family messages'
  }
}

/**
 * Sympathy Experiment (Martinez Family)
 * 8 memories, 63% position difference from Standard
 */
export const sympathyExperiment: ExperimentStructure = {
  testA: {
    chapters: [
      { title: 'Community and Connection', contributorPattern: 'neighbor|book club|community' },
      { title: 'Memories and Love', contributorPattern: 'friend|colleague|childhood' },
      { title: 'Faith and Comfort', contributorPattern: 'family friend|pastor|faith' }
    ],
    highlightPattern: 'childhood friend video|longtime friend',
    finalePattern: 'pastor',
    opening: 'To the Martinez family: Elena\'s life touched so many hearts. These messages honor her memory and the love that will endure.'
  },
  testB: {
    chapters: [
      { title: 'Community Impact', contributorPattern: 'community|book club|robert' },
      { title: 'Shared Memories', contributorPattern: 'sarah|neighbor|lisa' },
      { title: 'Enduring Love', contributorPattern: 'david|pastor|faith' }
    ],
    highlightPattern: 'community leader|childhood friend|longtime friend',
    finalePattern: 'pastor',
    opening: 'To the Martinez family: Elena\'s impact on our community was profound. We remember her kindness, her compassion, and the love she shared so freely.',
    creatorInstruction: 'Begin with community memories, acknowledge the loss with care, and conclude with messages of faith and enduring love'
  }
}

/**
 * Get experiment structure by occasion
 */
export function getExperimentStructure(occasion: string): ExperimentStructure | null {
  switch (occasion.toLowerCase()) {
    case 'birthday':
      return birthdayExperiment
    case 'retirement':
    case 'farewell':
      return farewellExperiment
    case 'anniversary':
      return anniversaryExperiment
    case 'sympathy':
      return sympathyExperiment
    default:
      return null
  }
}
