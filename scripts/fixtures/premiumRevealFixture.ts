/**
 * Synthetic MemoryPop fixture for AI Director testing
 *
 * IMPORTANT: This is completely fictional test data.
 * DO NOT use production MemoryPop data with free-tier Gemini API.
 */

export interface MemoryMetadata {
  id: string
  contributorName: string
  message: string
  photoCount: number
  gifCount: number
  videoDuration?: number
  createdAt: Date
}

export interface MemoryPopMetadata {
  recipientName: string
  occasion: string
  tone: string
  story: string
}

/**
 * Synthetic MemoryPop: Emma Test's 30th Birthday
 *
 * NOTE: createdAt order is deliberately NOT the ideal emotional sequence.
 * We want to test whether AI curation improves upon chronological ordering.
 */
export const syntheticMemoryPop: MemoryPopMetadata = {
  recipientName: 'Emma Test',
  occasion: 'birthday',
  tone: 'nostalgic_reflective',
  story: 'Celebrating 30 years of friendship and the people who shaped Emma\'s life.',
}

export const syntheticMemories: MemoryMetadata[] = [
  {
    id: 'mem_001',
    contributorName: 'Sarah Mitchell',
    message: 'Happy 30th! Remember when we tried to bake that birthday cake in college and set off the fire alarm? Still one of my favorite memories. Here\'s to 30 more years of adventures!',
    photoCount: 2,
    gifCount: 1,
    createdAt: new Date('2026-09-06T14:32:00Z'), // Most recent
  },
  {
    id: 'mem_002',
    contributorName: 'Mom',
    message: 'My dearest Emma, watching you grow into the incredible woman you are today has been the greatest joy of my life. From your first steps to your first day of school to today, every moment has been precious. I am so proud of you. Happy 30th birthday, sweetheart.',
    photoCount: 4,
    gifCount: 0,
    createdAt: new Date('2026-09-06T10:15:00Z'),
  },
  {
    id: 'mem_003',
    contributorName: 'Jake Rodriguez',
    message: 'Hey Em! Still can\'t believe we survived that road trip to Vegas. What happens in Vegas... gets shared at your 30th! Happy birthday, you legend.',
    photoCount: 3,
    gifCount: 1,
    videoDuration: 8,
    createdAt: new Date('2026-09-05T22:45:00Z'),
  },
  {
    id: 'mem_004',
    contributorName: 'Olivia Chen',
    message: 'Happy birthday to my best friend since kindergarten! Remember when we used to pretend we were princesses in your backyard? You\'ll always be royalty to me. Love you forever.',
    photoCount: 5,
    gifCount: 0,
    createdAt: new Date('2026-09-05T19:20:00Z'),
  },
  {
    id: 'mem_005',
    contributorName: 'David Thompson',
    message: 'Happy 30th, Emma! Working with you this past year has been amazing. Your creativity and leadership inspire the whole team. Here\'s to many more successful projects together!',
    photoCount: 1,
    gifCount: 0,
    createdAt: new Date('2026-09-05T16:10:00Z'),
  },
  {
    id: 'mem_006',
    contributorName: 'Marcus Johnson',
    message: 'Emma! Three decades of being awesome! Remember spring break senior year when we thought we could surf? Still have the bruises (emotionally). Miss you, birthday twin!',
    photoCount: 2,
    gifCount: 1,
    createdAt: new Date('2026-09-05T13:55:00Z'),
  },
  {
    id: 'mem_007',
    contributorName: 'Aunt Linda',
    message: 'Happy birthday, sweet Emma! I remember holding you when you were just a baby. Now look at you - smart, kind, and so full of life. Your parents are so blessed to have you. Love you dearly.',
    photoCount: 3,
    gifCount: 0,
    createdAt: new Date('2026-09-05T11:30:00Z'),
  },
  {
    id: 'mem_008',
    contributorName: 'Ryan Park',
    message: 'Happy 30th! Still the reigning champion of bad karaoke and good vibes. Never change, Em.',
    photoCount: 0,
    gifCount: 1,
    createdAt: new Date('2026-09-05T09:20:00Z'),
  },
  {
    id: 'mem_009',
    contributorName: 'Jessica Williams',
    message: 'To my college roommate and forever friend - happy birthday! Remember all those late-night study sessions that turned into life-planning sessions? Some of those dreams actually came true. So proud of you.',
    photoCount: 4,
    gifCount: 0,
    videoDuration: 12,
    createdAt: new Date('2026-09-05T07:45:00Z'),
  },
  {
    id: 'mem_010',
    contributorName: 'Tom Bradley',
    message: 'Happy birthday, Emma! You\'re the best partner anyone could ask for. Every day with you is an adventure. Here\'s to our next chapter together. I love you so much.',
    photoCount: 6,
    gifCount: 0,
    videoDuration: 15,
    createdAt: new Date('2026-09-04T21:30:00Z'),
  },
  {
    id: 'mem_011',
    contributorName: 'Sophie Anderson',
    message: 'Emma! Happy 30th! High school drama club wouldn\'t have been the same without you. You were always the star, on and off stage.',
    photoCount: 2,
    gifCount: 0,
    createdAt: new Date('2026-09-04T18:15:00Z'),
  },
  {
    id: 'mem_012',
    contributorName: 'Dad',
    message: 'Happy birthday, pumpkin. Thirty years ago you changed our lives forever. You\'ve grown into such a remarkable person - strong, compassionate, and unstoppable. I couldn\'t be more proud to be your dad. Love you always.',
    photoCount: 5,
    gifCount: 0,
    createdAt: new Date('2026-09-04T15:00:00Z'),
  },
  {
    id: 'mem_013',
    contributorName: 'Nina Patel',
    message: 'Happy birthday, Emma! Working on that presentation together was chaos but we nailed it. You make everything more fun.',
    photoCount: 1,
    gifCount: 0,
    createdAt: new Date('2026-09-04T12:20:00Z'),
  },
  {
    id: 'mem_014',
    contributorName: 'Chris Murphy',
    message: 'Happy 30th! Remember when we thought 30 was OLD? Turns out it\'s just the beginning. Cheers to you, Em!',
    photoCount: 2,
    gifCount: 1,
    createdAt: new Date('2026-09-04T09:45:00Z'),
  },
  {
    id: 'mem_015',
    contributorName: 'Brother Alex',
    message: 'Happy birthday to my big sister! Thanks for always looking out for me, even when I definitely didn\'t deserve it. You\'re the best sister anyone could ask for. Love you lots.',
    photoCount: 3,
    gifCount: 0,
    videoDuration: 10,
    createdAt: new Date('2026-09-04T08:00:00Z'), // Oldest
  },
]
