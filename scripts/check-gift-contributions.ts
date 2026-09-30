import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

// Check database
if (!supabaseUrl.includes('lbjtwbpnlruykqgsaiwy')) {
  console.error('❌ ABORT: Not using test database!');
  process.exit(1);
}

console.log('✅ Using memorypop-test database');

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkGift() {
  const { data: gift, error: giftError } = await supabase
    .from('memorypops')
    .select('id, share_code, recipient_name, status, is_premium')
    .eq('share_code', 'test-sharing-1790756204563')
    .single();

  if (giftError || !gift) {
    console.log('Gift not found:', giftError?.message);
    return;
  }

  console.log('\nGift:', gift.share_code);
  console.log('Gift ID:', gift.id);
  console.log('Recipient:', gift.recipient_name);
  console.log('Status:', gift.status);
  console.log('Premium:', gift.is_premium);

  const { data: memories, error: memoriesError } = await supabase
    .from('memories')
    .select('id, contributor_name, message, photo_url, photos, gifs, video')
    .eq('memorypop_id', gift.id);

  if (memoriesError) {
    console.error('\nError fetching memories:', memoriesError);
    return;
  }

  console.log('\nExisting contributions:', memories?.length || 0);
  if (memories && memories.length > 0) {
    memories.forEach((m, i) => {
      const msg = m.message || '(no message)';
      console.log(`${i+1}. ${m.contributor_name}: ${msg.substring(0, 60)}${msg.length > 60 ? '...' : ''}`);
      const photosCount = Array.isArray(m.photos) ? m.photos.length : 0;
      const gifsCount = Array.isArray(m.gifs) ? m.gifs.length : 0;
      const hasVideo = m.video ? 1 : 0;
      console.log(`   Photos: ${photosCount}, GIFs: ${gifsCount}, Video: ${hasVideo}`);
    });
  }
}

checkGift().catch(console.error);
