/**
 * Check gift details for export testing
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const shareCode = process.argv[2];

if (!shareCode) {
  console.error('Usage: npx tsx scripts/check-gift-details.ts <shareCode>');
  process.exit(1);
}

async function checkGift() {
  const { data: gift, error: giftError } = await supabase
    .from('memorypops')
    .select('*')
    .eq('share_code', shareCode)
    .single();

  if (giftError || !gift) {
    console.error('Gift not found:', giftError?.message);
    return;
  }

  console.log(`\nGift: ${gift.share_code}`);
  console.log(`  Recipient: ${gift.recipient_name}`);
  console.log(`  Occasion: ${gift.occasion}`);
  console.log(`  Tier: ${gift.is_premium ? 'Plus' : 'Standard'}`);
  console.log(`  Music: ${gift.custom_music_url ? 'Custom' : 'Default'}`);

  // Get memories
  const { data: memories, error: memoriesError } = await supabase
    .from('memories')
    .select('id, contributor_name, message, photo_url, photos, gifs, video')
    .eq('memorypop_id', gift.id)
    .order('created_at', { ascending: false });

  if (memoriesError) {
    console.error('Error fetching memories:', memoriesError);
    return;
  }

  console.log(`\nMemories: ${memories?.length || 0}`);
  if (memories && memories.length > 0) {
    memories.forEach((m, i) => {
      const photoCount = (m.photos?.length || 0) + (m.photo_url ? 1 : 0);
      const gifCount = m.gifs?.length || 0;
      const hasVideo = !!m.video;
      const messageLength = m.message?.length || 0;

      console.log(`  ${i + 1}. ${m.contributor_name}`);
      console.log(`     Message: ${messageLength} chars`);
      console.log(`     Media: ${photoCount} photos, ${gifCount} GIFs${hasVideo ? ', 1 video' : ''}`);
    });
  }

  // Check for reveal plan
  const { data: plan } = await supabase
    .from('reveal_plans')
    .select('id, created_at')
    .eq('memorypop_id', gift.id)
    .maybeSingle();

  console.log(`\nReveal Plan: ${plan ? 'Yes (created ' + new Date(plan.created_at).toLocaleDateString() + ')' : 'No'}`);

  console.log(`\nReveal URL: http://localhost:3000/m/${shareCode}/reveal`);
}

checkGift().catch(console.error);
