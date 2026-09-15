/**
 * Synthetic MemoryPop fixture: Wedding Anniversary
 *
 * IMPORTANT: Completely fictional test data.
 */

import type { MemoryMetadata, MemoryPopMetadata } from './premiumRevealFixture'

export const syntheticAnniversaryMemoryPop: MemoryPopMetadata = {
  recipientName: 'Alex & Jordan',
  occasion: 'anniversary',
  tone: 'warm_heartfelt',
  story: 'Celebrating 10 years of love, partnership, and building a life together.',
}

/**
 * 10 memories with varied patterns:
 * - Couple's shared memories
 * - Messages to both partners
 * - Some photo-heavy (wedding memories)
 * - Some text-only
 * - Mix of romantic and humorous
 */
export const syntheticAnniversaryMemories: MemoryMetadata[] = [
  {
    id: 'mem_a01',
    contributorName: 'Best Man Marcus',
    message: 'Happy 10th anniversary! I still remember your vows - "I promise to always let you pick the restaurant." Alex, you\'ve kept that promise admirably. Here\'s to 10 more years of pretending to like each other\'s music!',
    photoCount: 4,
    gifCount: 1,
    createdAt: new Date('2026-09-07T19:30:00Z'),
  },
  {
    id: 'mem_a02',
    contributorName: 'Maid of Honor Sophie',
    message: 'Ten years ago, I watched two of my favorite people promise forever to each other. You\'ve built something beautiful - a partnership full of laughter, support, and genuine love. Congratulations!',
    photoCount: 6,
    gifCount: 0,
    createdAt: new Date('2026-09-07T17:15:00Z'),
  },
  {
    id: 'mem_a03',
    contributorName: 'Alex\'s Parents',
    message: 'To our dear Alex and Jordan - watching your love grow over these 10 years has been one of our greatest joys. You\'ve created a home filled with warmth, laughter, and kindness. We\'re so proud of you both.',
    photoCount: 5,
    gifCount: 0,
    videoDuration: 22,
    createdAt: new Date('2026-09-07T15:00:00Z'),
  },
  {
    id: 'mem_a04',
    contributorName: 'College Friend Emma',
    message: 'Remember when you were "just friends"? We all knew. Happy 10th anniversary to the couple who took forever to realize what everyone else already saw!',
    photoCount: 3,
    gifCount: 0,
    createdAt: new Date('2026-09-07T13:20:00Z'),
  },
  {
    id: 'mem_a05',
    contributorName: 'Jordan\'s Sister Maya',
    message: 'Alex, thank you for loving my sibling so completely. Jordan, thank you for finding someone who laughs at your terrible puns. You two are perfect together. Happy anniversary!',
    photoCount: 2,
    gifCount: 1,
    createdAt: new Date('2026-09-07T11:45:00Z'),
  },
  {
    id: 'mem_a06',
    contributorName: 'Neighbor Carlos',
    message: 'Happy 10 years! Thanks for letting me borrow your ladder that one time and for being the best neighbors anyone could ask for. Your relationship goals are real.',
    photoCount: 0,
    gifCount: 0,
    createdAt: new Date('2026-09-07T09:30:00Z'),
  },
  {
    id: 'mem_a07',
    contributorName: 'Work Colleague Priya',
    message: 'Alex, you light up whenever you talk about Jordan. It\'s beautiful to see a partnership that still feels like that after 10 years. Congratulations to you both!',
    photoCount: 1,
    gifCount: 0,
    createdAt: new Date('2026-09-07T07:50:00Z'),
  },
  {
    id: 'mem_a08',
    contributorName: 'High School Friend Chris',
    message: 'Jordan, I\'ve known you since we were 15. Seeing you this happy, this settled, this loved - it\'s everything I hoped for you. Alex is lucky to have you, and vice versa. Happy 10th!',
    photoCount: 2,
    gifCount: 0,
    createdAt: new Date('2026-09-06T20:10:00Z'),
  },
  {
    id: 'mem_a09',
    contributorName: 'Wedding Photographer David',
    message: 'I photographed your wedding 10 years ago. The way you looked at each other that day? That same spark is still there. Congratulations on a beautiful decade together!',
    photoCount: 7,
    gifCount: 0,
    createdAt: new Date('2026-09-06T18:00:00Z'),
  },
  {
    id: 'mem_a10',
    contributorName: 'Jordan\'s Parents',
    message: 'Dear Alex and Jordan, what a joy it has been watching you build a life together. Your love is patient, your partnership is strong, and your home is filled with warmth. We\'re blessed to call you both family. Happy 10th anniversary.',
    photoCount: 4,
    gifCount: 0,
    createdAt: new Date('2026-09-06T16:00:00Z'),
  },
]
