/**
 * List available test gifts for export testing
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function listTestGifts() {
  // Find gifts with test in share code or specific test patterns
  const { data: gifts, error } = await supabase
    .from('memorypops')
    .select('id, share_code, recipient_name, occasion, is_premium')
    .or('share_code.ilike.%test%,recipient_name.ilike.%test%')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Query error:', error);
    return;
  }

  if (!gifts || gifts.length === 0) {
    console.log('No test gifts found');
    return;
  }

  console.log(`\nFound ${gifts.length} test gift(s):\n`);

  for (const gift of gifts) {
    // Get memory count
    const { count } = await supabase
      .from('memories')
      .select('*', { count: 'exact', head: true })
      .eq('memorypop_id', gift.id);

    // Get reveal plan status
    const { data: plan } = await supabase
      .from('reveal_plans')
      .select('id')
      .eq('memorypop_id', gift.id)
      .maybeSingle();

    console.log(`Share Code: ${gift.share_code}`);
    console.log(`  Recipient: ${gift.recipient_name}`);
    console.log(`  Occasion: ${gift.occasion}`);
    console.log(`  Tier: ${gift.is_premium ? 'Plus' : 'Standard'}`);
    console.log(`  Memories: ${count || 0}`);
    console.log(`  Reveal Plan: ${plan ? 'Yes' : 'No'}`);
    console.log(`  URL: http://localhost:3000/m/${gift.share_code}/reveal`);
    console.log('');
  }
}

listTestGifts().catch(console.error);
