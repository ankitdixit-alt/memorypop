/**
 * Find Test Gifts in memorypop-test Database
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env.test
dotenv.config({ path: path.resolve(process.cwd(), '.env.test') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.test');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function findTestGifts() {
  const { data, error } = await supabase
    .from('memorypops')
    .select('id, share_code, recipient_name, occasion, is_premium, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('=== Recent Fictional Gifts in memorypop-test ===\n');

  if (!data || data.length === 0) {
    console.log('No gifts found. Need to create test gift.');
    return;
  }

  data.forEach((gift, idx) => {
    console.log(`Gift ${idx + 1}:`);
    console.log(`  Share Code: ${gift.share_code}`);
    console.log(`  Recipient: ${gift.recipient_name}`);
    console.log(`  Occasion: ${gift.occasion}`);
    console.log(`  Tier: ${gift.is_premium ? 'Plus' : 'Standard'}`);
    console.log(`  Created: ${new Date(gift.created_at).toLocaleDateString()}`);
    console.log();
  });

  // Pick test-plus-final-verified or first one
  const testGift = data.find(g => g.share_code === 'test-plus-final-verified') || data[0];
  console.log('=== Selected Test Gift ===');
  console.log(`Share Code: ${testGift.share_code}`);
  console.log(`Recipient: ${testGift.recipient_name}`);
  console.log(`Tier: ${testGift.is_premium ? 'Plus' : 'Standard'}`);
  console.log();
  console.log('Working Test Links (http://localhost:3000):');
  console.log(`  Contributor: http://localhost:3000/m/${testGift.share_code}/contribute`);
  console.log(`  Reveal: http://localhost:3000/m/${testGift.share_code}/reveal`);

  // Check for creator session token
  const { data: sessionData, error: sessionError } = await supabase
    .from('creator_sessions')
    .select('session_token')
    .eq('memorypop_id', testGift.id)
    .maybeSingle();

  if (!sessionError && sessionData) {
    console.log(`  Creator Management: http://localhost:3000/m/${testGift.share_code}/manage?token=${sessionData.session_token}`);
  } else {
    console.log(`  Creator Management: (no valid session token found)`);
  }

  // Check for memories
  const { data: memories, error: memError } = await supabase
    .from('memories')
    .select('id, contributor_name')
    .eq('memorypop_id', testGift.id);

  if (!memError && memories) {
    console.log();
    console.log(`Memories: ${memories.length} contribution(s)`);
    if (memories.length > 0) {
      memories.forEach((m, idx) => {
        console.log(`  ${idx + 1}. ${m.contributor_name}`);
      });
    }
  }
}

findTestGifts().catch(console.error);
