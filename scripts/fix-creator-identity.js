// Fix creator identity in test MemoryPop
// Updates Memory 1 contributor_name from "Anonymous" to "From the creator"

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixCreatorIdentity(shareCode) {
  console.log('='.repeat(60));
  console.log('FIXING CREATOR IDENTITY');
  console.log('='.repeat(60));
  console.log(`ShareCode: ${shareCode}\n`);

  // Fetch MemoryPop
  const { data: memorypop, error: mpError } = await supabase
    .from('memorypops')
    .select('*')
    .eq('share_code', shareCode)
    .single();

  if (mpError) {
    console.error('Error fetching MemoryPop:', mpError);
    process.exit(1);
  }

  // Fetch memories
  const { data: memories, error: memError } = await supabase
    .from('memories')
    .select('*')
    .eq('memorypop_id', memorypop.id)
    .order('created_at', { ascending: true });

  if (memError) {
    console.error('Error fetching memories:', memError);
    process.exit(1);
  }

  console.log(`Found ${memories.length} memories\n`);

  // Find memories with "Anonymous" contributor
  const anonymousMemories = memories.filter(m => m.contributor_name === 'Anonymous');

  if (anonymousMemories.length === 0) {
    console.log('✓ No "Anonymous" memories found. Nothing to fix.');
    return;
  }

  console.log(`Found ${anonymousMemories.length} memories with "Anonymous" contributor\n`);

  // Update first memory (assumed to be creator memory)
  const creatorMemory = anonymousMemories[0];
  console.log(`Updating memory ${creatorMemory.id}:`);
  console.log(`  Current: "${creatorMemory.contributor_name}"`);
  console.log(`  New: "From the creator"`);

  const { error: updateError } = await supabase
    .from('memories')
    .update({ contributor_name: 'From the creator' })
    .eq('id', creatorMemory.id);

  if (updateError) {
    console.error('Error updating memory:', updateError);
    process.exit(1);
  }

  console.log('\n✓ Creator identity fixed successfully');
  console.log('='.repeat(60));
}

const shareCode = process.argv[2];
if (!shareCode) {
  console.error('Usage: node scripts/fix-creator-identity.js <shareCode>');
  process.exit(1);
}

fixCreatorIdentity(shareCode).catch(console.error);
