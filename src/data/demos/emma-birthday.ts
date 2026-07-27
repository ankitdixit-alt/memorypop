/**
 * Interactive Demo Data: Emma's 30th Birthday
 * Complete demo data structure for the product demonstration
 */

export interface DemoMessage {
  id: string;
  contributor: {
    name: string;
    relationship: string;
    avatar: string;
  };
  content: string;
  timestamp: string;
  featured: boolean; // Full display (true) or preview (false)
  tone: 'heartfelt' | 'funny' | 'warm' | 'nostalgic' | 'emotional';
}

export interface DemoPhoto {
  id: string;
  url: string;
  alt: string;
  caption?: string;
}

export interface Demo {
  id: string;
  occasion: 'birthday' | 'retirement' | 'farewell' | 'wedding' | 'baby';
  recipient: { name: string; age?: number };
  creator: { name: string; relationship: string };
  stats: { contributors: number; messages: number; photos: number };
  messages: DemoMessage[];
  photos: DemoPhoto[];
  recipientReaction?: { photo: string; caption: string };
  creatorSteps: string[];
}

/**
 * Emma's 30th Birthday Demo
 * Complete data structure with all messages and content
 */
export const emmaBirthdayDemo: Demo = {
  id: 'emma-30th-birthday',
  occasion: 'birthday',
  recipient: {
    name: 'Emma',
    age: 30,
  },
  creator: {
    name: 'Sarah',
    relationship: 'Sister',
  },
  stats: {
    contributors: 42,
    messages: 38,
    photos: 64,
  },
  messages: [
    // Featured Message 1: Maya Chen (Best Friend) - HEARTFELT
    {
      id: 'msg-maya',
      contributor: {
        name: 'Maya Chen',
        relationship: 'Best friend since college',
        avatar: '/avatars/maya.jpg', // Future: Real avatar placeholder
      },
      content: `Remember that road trip to Portland when we got completely lost trying to find that tiny bookstore? We ended up in someone's driveway at midnight asking for directions, and they invited us in for tea. We stayed for two hours talking about everything.

That's so us. That's so you, Emma.

You find magic in disasters. You turn strangers into friends. You make ordinary moments unforgettable.

Thank you for ten years of spontaneous adventures, 2am debates about nothing and everything, and always knowing what I need to hear.

Here's to 30 more years of getting gloriously lost together.

I love you, Em. 🎂`,
      timestamp: '2 days ago',
      featured: true,
      tone: 'heartfelt',
    },
    // Featured Message 2: Sarah Rodriguez (Sister) - FUNNY & GENUINE
    {
      id: 'msg-sarah',
      contributor: {
        name: 'Sarah Rodriguez',
        relationship: 'Sister (also made this!)',
        avatar: '/avatars/sarah.jpg',
      },
      content: `Happy 30th to my little sister who somehow became a responsible adult with a mortgage. What happened to the kid who convinced me to TP the neighbor's house at midnight? (We got caught. Mom still brings it up every Thanksgiving.)

Here's what I won't say at dinner tonight: You're the person I call first with good news. You're the aunt my kids already love. You're proof that kindness isn't weakness.

Also, you still owe me $40 from 2018. 😂

Love you forever, little sis. — Sarah`,
      timestamp: '3 days ago',
      featured: true,
      tone: 'funny',
    },
    // Featured Message 3: Carlos Rodriguez (Dad) - DEEPLY EMOTIONAL
    {
      id: 'msg-carlos',
      contributor: {
        name: 'Carlos Rodriguez',
        relationship: 'Dad',
        avatar: '/avatars/carlos.jpg',
      },
      content: `Mija,

Thirty years ago I held you for the first time and thought: "How do I keep her safe forever?"

Turns out you didn't need as much protecting as I thought. You figured out how to stand up for yourself, chase dreams that scared you, build a life that makes you proud.

Watching you become the woman you are has been my greatest privilege.

Every single day, I'm grateful you're my daughter.

Te amo con todo mi corazón.

— Dad`,
      timestamp: '4 days ago',
      featured: true,
      tone: 'emotional',
    },
    // Supporting Message 4: James Patterson (Coworker) - PREVIEW ONLY
    {
      id: 'msg-james',
      contributor: {
        name: 'James Patterson',
        relationship: 'Project lead at work',
        avatar: '/avatars/james.jpg',
      },
      content: `Emma, working with you this year has been a highlight of my career. When we were three weeks behind on Q3 and everyone panicked, you calmly organized the team and got us across the finish line.

But more than that: you make work feel less like work. You remember birthdays. You bring donuts on rough Mondays. You actually listen.

Thank you for making our team better. Have the most amazing birthday. 🎉 — James`,
      timestamp: '2 days ago',
      featured: false,
      tone: 'warm',
    },
    // Supporting Message 5: Tyler Kim (Old Friend) - PREVIEW ONLY
    {
      id: 'msg-tyler',
      contributor: {
        name: 'Tyler Kim',
        relationship: 'Friend from back home',
        avatar: '/avatars/tyler.jpg',
      },
      content: `Can't believe we're both 30 now. Feels like yesterday we were sneaking out of Henderson's class to get burgers at that dive on 5th. (RIP—it's a yoga studio now?)

I know we don't see each other much since you moved to Seattle, but I think about those high school days all the time. You taught me it was okay to be the weird theater kid.

Thanks for being one of the real ones. Let's plan a reunion—I'm buying. 🍔 — Tyler`,
      timestamp: '1 day ago',
      featured: false,
      tone: 'nostalgic',
    },
  ],
  photos: [
    {
      id: 'photo-1',
      url: '/demo-photos/emma-1.jpg',
      alt: 'Emma blowing out birthday candles surrounded by friends',
      caption: 'The moment before 30',
    },
    {
      id: 'photo-2',
      url: '/demo-photos/emma-2.jpg',
      alt: 'Emma and Sarah laughing together at family dinner',
      caption: 'Sisters forever',
    },
    {
      id: 'photo-3',
      url: '/demo-photos/emma-3.jpg',
      alt: 'Emma hiking on a mountain trail',
      caption: 'Always seeking the next adventure',
    },
    {
      id: 'photo-4',
      url: '/demo-photos/emma-4.jpg',
      alt: 'Emma and Maya on their famous Portland road trip',
      caption: 'Lost but loving it',
    },
    {
      id: 'photo-5',
      url: '/demo-photos/emma-5.jpg',
      alt: 'Emma at work leading a team meeting',
      caption: 'Making work feel less like work',
    },
    {
      id: 'photo-6',
      url: '/demo-photos/emma-6.jpg',
      alt: 'Emma and Carlos at her college graduation',
      caption: "Dad's proudest day",
    },
  ],
  recipientReaction: {
    photo: '/demo-photos/emma-reaction.jpg',
    caption: '42 people. 38 messages. One unforgettable moment.',
  },
  creatorSteps: [
    'Send invite link\n42 people invited',
    'Memories arrive\nCollected in 4 days',
    'Share with Emma\nOne click to reveal',
  ],
};
