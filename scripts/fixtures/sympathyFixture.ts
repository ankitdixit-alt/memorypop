/**
 * Synthetic MemoryPop fixture: Sympathy (Sensitive Occasion)
 *
 * IMPORTANT: Completely fictional test data for testing AI handling of sensitive occasions.
 * Tests whether AI can maintain respectful tone and appropriate sequencing.
 */

import type { MemoryMetadata, MemoryPopMetadata } from './premiumRevealFixture'

export const syntheticSympathyMemoryPop: MemoryPopMetadata = {
  recipientName: 'The Martinez Family',
  occasion: 'sympathy',
  tone: 'thoughtful_meaningful',
  story: 'Honoring the memory of Elena Martinez and supporting her family during this difficult time.',
}

/**
 * 8 memories with careful emotional handling:
 * - Respectful, comforting messages
 * - Mix of shared memories and support
 * - Varied length messages
 * - Some with photos (memories), some text-only (support)
 * - Tests AI's ability to handle grief appropriately
 */
export const syntheticSympathyMemories: MemoryMetadata[] = [
  {
    id: 'mem_s01',
    contributorName: 'Longtime Friend Sarah',
    message: 'Elena\'s kindness touched everyone she met. I\'ll always remember her infectious laugh and the way she made everyone feel welcome. She was a light in our community. My heart is with you all.',
    photoCount: 2,
    gifCount: 0,
    createdAt: new Date('2026-09-07T18:00:00Z'),
  },
  {
    id: 'mem_s02',
    contributorName: 'Neighbor James',
    message: 'Our neighborhood won\'t be the same without Elena. Her garden was beautiful, but her spirit was even more so. Sending love and strength to the entire family during this time.',
    photoCount: 0,
    gifCount: 0,
    createdAt: new Date('2026-09-07T15:30:00Z'),
  },
  {
    id: 'mem_s03',
    contributorName: 'Colleague Maria',
    message: 'Elena was not just a coworker but a mentor and friend. She taught me so much about grace, perseverance, and living with purpose. The impact she made will continue through all of us she inspired.',
    photoCount: 3,
    gifCount: 0,
    createdAt: new Date('2026-09-07T13:00:00Z'),
  },
  {
    id: 'mem_s04',
    contributorName: 'Childhood Friend Lisa',
    message: 'We grew up together, shared our dreams, and supported each other through everything life brought. Elena was my sister in every way that mattered. I will carry her memory in my heart always.',
    photoCount: 4,
    gifCount: 0,
    videoDuration: 15,
    createdAt: new Date('2026-09-07T10:30:00Z'),
  },
  {
    id: 'mem_s05',
    contributorName: 'Community Leader Robert',
    message: 'Elena\'s volunteer work at the community center changed lives. Her compassion and dedication inspired us all to do better, be better. She leaves behind a legacy of love and service.',
    photoCount: 1,
    gifCount: 0,
    createdAt: new Date('2026-09-07T08:00:00Z'),
  },
  {
    id: 'mem_s06',
    contributorName: 'Book Club Members',
    message: 'Elena brought joy to our monthly gatherings. Her insights, her laughter, her thoughtful perspective - we treasured every moment. To the Martinez family: we are here for you, today and always.',
    photoCount: 2,
    gifCount: 0,
    createdAt: new Date('2026-09-06T19:00:00Z'),
  },
  {
    id: 'mem_s07',
    contributorName: 'Family Friend David',
    message: 'I\'ve known the Martinez family for 20 years. Elena was the heart of your family, and her love surrounds you still. Please know that you are not alone in this grief. We\'re here, holding you in our thoughts.',
    photoCount: 0,
    gifCount: 0,
    createdAt: new Date('2026-09-06T16:30:00Z'),
  },
  {
    id: 'mem_s08',
    contributorName: 'Pastor Michael',
    message: 'Elena\'s faith was quiet but profound, her kindness boundless. She lived her values every day, touching lives in ways she never knew. To the Martinez family: may you find comfort in these memories and in the knowledge that her love remains with you always.',
    photoCount: 1,
    gifCount: 0,
    createdAt: new Date('2026-09-06T14:00:00Z'),
  },
]
