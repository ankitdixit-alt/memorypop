/**
 * Create Standard MemoryPop for testing multimedia
 * Usage: node scripts/create-standard-test-memorypop.mjs
 */

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestMemoryPop() {
  console.log('🎬 Creating Standard test MemoryPop...\n');

  const shareCode = `test-standard-${crypto.randomBytes(3).toString('hex')}`;

  const { data: memorypop, error } = await supabase
    .from('memorypops')
    .insert({
      recipient_name: 'Alex',
      occasion: 'Birthday Celebration',
      story: 'Testing Standard multimedia: 3 photos + 1 GIF + 1 video (15s max)',
      tone: 'warm_heartfelt',
      cover_style: 'birthday',
      share_code: shareCode,
      status: 'collecting',
      management_token_hash: crypto.randomBytes(32).toString('hex'),
    })
    .select('id, share_code, recipient_name')
    .single();

  if (error) {
    console.error('❌ Failed:', error.message);
    process.exit(1);
  }

  console.log('✅ Standard MemoryPop created\n');
  console.log('═'.repeat(60));
  console.log(`Recipient: ${memorypop.recipient_name}`);
  console.log(`Share Code: ${memorypop.share_code}`);
  console.log(`\nTesting URLs:`);
  console.log(`  Contribute: http://localhost:3000/m/${memorypop.share_code}/contribute`);
  console.log(`  Memory Wall: http://localhost:3000/m/${memorypop.share_code}`);
  console.log(`  Reveal: http://localhost:3000/m/${memorypop.share_code}/reveal`);
  console.log('═'.repeat(60));
  console.log('\n📹 Test videos available in test-assets/');
  console.log('  - video-valid-14s.mp4 (should PASS)');
  console.log('  - video-valid-15s.mp4 (should PASS)');
  console.log('  - video-over-limit-16s.mp4 (should FAIL server-side)');
  console.log('  - video-invalid-corrupt.mp4 (should fail gracefully)\n');
}

createTestMemoryPop();
