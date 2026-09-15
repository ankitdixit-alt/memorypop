/**
 * Synthetic MemoryPop fixture: Farewell/Retirement
 *
 * IMPORTANT: Completely fictional test data.
 */

import type { MemoryMetadata, MemoryPopMetadata } from './premiumRevealFixture'

export const syntheticFarewellMemoryPop: MemoryPopMetadata = {
  recipientName: 'Michael Zhang',
  occasion: 'retirement',
  tone: 'thoughtful_meaningful',
  story: 'Celebrating 35 years of dedication, mentorship, and the incredible impact Michael had on our team.',
}

/**
 * 12 memories with varied patterns:
 * - Mix of long/short messages
 * - Some text-only
 * - Some with photos
 * - One video message
 * - Different emotional tones (professional, personal, humorous)
 */
export const syntheticFarewellMemories: MemoryMetadata[] = [
  {
    id: 'mem_f01',
    contributorName: 'Jennifer Park',
    message: 'Michael, working under your leadership transformed my career. You taught me that excellence comes from patience and attention to detail. Thank you for believing in me when I didn\'t believe in myself. Enjoy your well-deserved retirement!',
    photoCount: 3,
    gifCount: 0,
    createdAt: new Date('2026-09-07T16:20:00Z'),
  },
  {
    id: 'mem_f02',
    contributorName: 'David Kumar',
    message: 'Happy retirement, Michael! Remember our legendary whiteboard sessions that somehow always ended with pizza at 9 PM? Those late nights built something special. You\'ll be missed!',
    photoCount: 2,
    gifCount: 1,
    createdAt: new Date('2026-09-07T14:45:00Z'),
  },
  {
    id: 'mem_f03',
    contributorName: 'Rachel Thompson',
    message: 'To the best mentor I ever had - thank you for 15 years of wisdom, support, and terrible dad jokes. The office won\'t be the same without you!',
    photoCount: 0,
    gifCount: 0,
    createdAt: new Date('2026-09-07T12:30:00Z'),
  },
  {
    id: 'mem_f04',
    contributorName: 'CEO Sarah Williams',
    message: 'Michael, your 35 years of service have shaped this company\'s culture and success. Your integrity, vision, and dedication are the foundation we build on. Thank you for everything. Congratulations on your retirement.',
    photoCount: 4,
    gifCount: 0,
    videoDuration: 18,
    createdAt: new Date('2026-09-07T10:00:00Z'),
  },
  {
    id: 'mem_f05',
    contributorName: 'Tom Rodriguez',
    message: 'Mike! The golf course is calling your name. Thanks for being more than a colleague - you\'ve been a true friend. Enjoy every moment of freedom!',
    photoCount: 1,
    gifCount: 1,
    createdAt: new Date('2026-09-07T08:15:00Z'),
  },
  {
    id: 'mem_f06',
    contributorName: 'Maria Santos',
    message: 'Michael, you showed us what leadership with compassion looks like. Your door was always open, your advice always thoughtful. We\'re all better professionals because of you.',
    photoCount: 2,
    gifCount: 0,
    createdAt: new Date('2026-09-06T18:30:00Z'),
  },
  {
    id: 'mem_f07',
    contributorName: 'James Chen',
    message: 'Congrats on retirement! Still can\'t believe you survived 35 years of quarterly reviews. Time to finally take that Alaska trip you\'ve been talking about for a decade!',
    photoCount: 0,
    gifCount: 1,
    createdAt: new Date('2026-09-06T16:20:00Z'),
  },
  {
    id: 'mem_f08',
    contributorName: 'Emma Foster',
    message: 'Michael, watching you lead with grace under pressure taught me more than any MBA could. Thank you for seeing potential in people and helping us grow into it.',
    photoCount: 3,
    gifCount: 0,
    createdAt: new Date('2026-09-06T14:00:00Z'),
  },
  {
    id: 'mem_f09',
    contributorName: 'Robert Martinez',
    message: 'Happy retirement, Michael! You survived the 2008 crisis, the 2020 pandemic, and that infamous IT migration. Legend. Enjoy your freedom!',
    photoCount: 1,
    gifCount: 0,
    createdAt: new Date('2026-09-06T11:45:00Z'),
  },
  {
    id: 'mem_f10',
    contributorName: 'Linda Wu',
    message: 'Michael, you\'ve been my mentor, my advocate, and my friend for 20 years. The wisdom you shared, the opportunities you created, the support you gave - I\'ll carry it all forward. Thank you.',
    photoCount: 5,
    gifCount: 0,
    createdAt: new Date('2026-09-06T09:30:00Z'),
  },
  {
    id: 'mem_f11',
    contributorName: 'Chris Anderson',
    message: 'Mike - thanks for the career advice, the life advice, and most importantly, the coffee machine upgrade in 2019. Priorities. Enjoy retirement!',
    photoCount: 0,
    gifCount: 0,
    createdAt: new Date('2026-09-06T07:15:00Z'),
  },
  {
    id: 'mem_f12',
    contributorName: 'Team',
    message: 'Michael, from all of us - thank you for 35 years of leadership, laughter, and leaving this place better than you found it. You built more than projects; you built careers, friendships, and a legacy. We wish you every happiness in your retirement.',
    photoCount: 8,
    gifCount: 0,
    createdAt: new Date('2026-09-05T20:00:00Z'),
  },
]
