/**
 * Add fictional memories to test gift
 *
 * Run: npx tsx scripts/add-test-memories.ts
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const SHARE_CODE = 'test-plus-final-verified';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const memories = [
  {
    contributor_name: 'Sarah',
    message: 'Happy birthday! I still remember when we first met at that coffee shop. You made me laugh so hard that day. Here\'s to many more years of friendship!',
  },
  {
    contributor_name: 'Mike',
    message: 'Wishing you an amazing birthday! Thank you for always being there when I needed advice. You\'re truly one of a kind.',
  },
  {
    contributor_name: 'Emily',
    message: 'Happy birthday to my favorite person! Remember that road trip we took last summer? Best memories ever. Can\'t wait to make more this year!',
  },
  {
    contributor_name: 'David',
    message: 'Hope you have the best birthday celebration! You deserve all the happiness in the world. Thanks for being such an incredible friend.',
  },
  {
    contributor_name: 'Lisa',
    message: 'Happy birthday! Your kindness and generosity inspire me every day. Looking forward to celebrating with you soon!',
  }
];

async function main() {
  console.log('Adding fictional memories to test gift...');
  console.log('Share code:', SHARE_CODE);

  // Get the memorypop ID
  const { data: memorypop, error: mpError } = await supabase
    .from('memorypops')
    .select('id, recipient_name')
    .eq('share_code', SHARE_CODE)
    .single();

  if (mpError || !memorypop) {
    console.error('Failed to find memorypop:', mpError);
    process.exit(1);
  }

  console.log('Gift:', memorypop.recipient_name, '(ID:', memorypop.id + ')');

  // Check if memories already exist
  const { data: existingMemories } = await supabase
    .from('memories')
    .select('id')
    .eq('memorypop_id', memorypop.id);

  if (existingMemories && existingMemories.length > 0) {
    console.log('⚠️  Gift already has', existingMemories.length, 'memories. Skipping insert.');
    console.log('Delete existing memories first if you want to add new ones.');
    return;
  }

  // Insert memories
  const memoriesToInsert = memories.map(m => ({
    ...m,
    memorypop_id: memorypop.id,
    photo_url: null,
  }));

  const { error: insertError } = await supabase
    .from('memories')
    .insert(memoriesToInsert);

  if (insertError) {
    console.error('Failed to insert memories:', insertError);
    process.exit(1);
  }

  console.log('✅ Added', memories.length, 'fictional memories to test gift');
  console.log('');
  console.log('Test gift now has memories. You can:');
  console.log('1. Click management link to access dashboard');
  console.log('2. Upload custom music (Plus feature)');
  console.log('3. Open reveal link to test first playback');
}

main();
