/**
 * Create test MemoryPop with premium access for testing Premium Reveal
 *
 * Usage: npx tsx scripts/create-test-memorypop.ts
 */

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables. Make sure .env.local is configured.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestMemoryPop() {
  console.log('Creating test MemoryPop with Premium access...\n');

  // Generate unique share code
  const shareCode = `test-${crypto.randomBytes(4).toString('hex')}`;

  // Create MemoryPop with is_premium: true
  const { data: memorypop, error: memorypopError } = await supabase
    .from('memorypops')
    .insert({
      recipient_name: 'Emma',
      occasion: '30th Birthday',
      story: 'Emma is turning 30 and we wanted to create something special for her',
      tone: 'warm_heartfelt',
      cover_style: 'birthday',
      share_code: shareCode,
      is_premium: true,
      status: 'collecting',
      celebration_date: null,
      management_token_hash: crypto.randomBytes(32).toString('hex'),
    })
    .select('id, share_code')
    .single();

  if (memorypopError) {
    console.error('Failed to create MemoryPop:', memorypopError);
    process.exit(1);
  }

  console.log(`✓ Created MemoryPop (ID: ${memorypop.id})`);
  console.log(`  Share Code: ${memorypop.share_code}\n`);

  // Create sample memories
  const memories = [
    {
      memorypop_id: memorypop.id,
      contributor_name: 'Marcus',
      message: 'Emma, you have been such an incredible friend. I still remember when we met freshman year and you welcomed me with open arms. Your kindness and warmth made me feel at home. Happy 30th birthday!',
      photo_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&q=80',
      video_url: null,
    },
    {
      memorypop_id: memorypop.id,
      contributor_name: 'Sarah',
      message: 'To my best friend Emma - thank you for always being there through every high and low. You make everyone around you feel seen and valued. Here\'s to the next chapter!',
      photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80',
      video_url: null,
    },
    {
      memorypop_id: memorypop.id,
      contributor_name: 'James',
      message: 'Emma, working with you has been one of the highlights of my career. Your creativity and leadership inspire everyone on the team. Wishing you an amazing 30th year!',
      photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
      video_url: null,
    },
    {
      memorypop_id: memorypop.id,
      contributor_name: 'Rachel',
      message: 'Happy birthday to the most thoughtful person I know. You remember everyone\'s coffee order, their kids\' names, and always know exactly what to say. You\'re one of a kind, Emma.',
      photo_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&q=80',
      video_url: null,
    },
    {
      memorypop_id: memorypop.id,
      contributor_name: 'David',
      message: 'Emma - thank you for being such a positive light in everyone\'s life. Your energy is contagious and your heart is enormous. Happy 30th!',
      photo_url: null,
      video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    },
  ];

  const { error: memoriesError } = await supabase
    .from('memories')
    .insert(memories);

  if (memoriesError) {
    console.error('Failed to create memories:', memoriesError);
    process.exit(1);
  }

  console.log(`✓ Created ${memories.length} sample memories\n`);

  console.log('═══════════════════════════════════════');
  console.log('TEST MEMORYPOP CREATED SUCCESSFULLY');
  console.log('═══════════════════════════════════════\n');
  console.log(`URL: http://localhost:3000/m/${memorypop.share_code}`);
  console.log(`Share Code: ${memorypop.share_code}`);
  console.log(`\nMemories:`);
  console.log(`  - 4 photo memories (Marcus, Sarah, James, Rachel)`);
  console.log(`  - 1 video memory (David)`);
  console.log(`\nPremium Access: ✓ Enabled`);
  console.log('\nOpen the URL above to test the Premium Reveal experience.\n');
}

createTestMemoryPop().catch(console.error);
