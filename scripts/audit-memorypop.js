// Audit script for test MemoryPop content inventory
// Usage: node scripts/audit-memorypop.js <shareCode>

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function auditMemoryPop(shareCode) {
  console.log('='.repeat(60));
  console.log('MEMORYPOP CONTENT INVENTORY');
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

  console.log('MemoryPop Details:');
  console.log(`- Recipient: ${memorypop.recipient_name}`);
  console.log(`- Occasion: ${memorypop.occasion}`);
  console.log(`- Mood: ${memorypop.tone || 'N/A'}`);
  console.log(`- Cover Style: ${memorypop.cover_style || 'default'}`);
  console.log();

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

  console.log(`Total Memories: ${memories.length}\n`);
  console.log('='.repeat(60));
  console.log('MEMORY-BY-MEMORY INVENTORY');
  console.log('='.repeat(60));

  let totalPhotos = 0;
  let totalGifs = 0;
  let totalVideos = 0;

  memories.forEach((memory, index) => {
    console.log(`\n[Memory ${index + 1}]`);
    console.log(`ID: ${memory.id}`);
    console.log(`Contributor: ${memory.contributor_name}`);
    console.log(`Message: ${memory.message ? `"${memory.message.substring(0, 80)}${memory.message.length > 80 ? '...' : ''}"` : '(none)'}`);

    // Parse photos
    const photos = memory.photos || [];
    const gifs = memory.gifs || [];
    const video = memory.video;

    console.log(`Photos: ${photos.length}`);
    if (photos.length > 0) {
      photos.forEach((photo, i) => {
        console.log(`  [${i + 1}] ${photo.url}`);
      });
      totalPhotos += photos.length;
    }

    console.log(`GIFs: ${gifs.length}`);
    if (gifs.length > 0) {
      gifs.forEach((gif, i) => {
        console.log(`  [${i + 1}] ${gif.url}`);
      });
      totalGifs += gifs.length;
    }

    console.log(`Video: ${video ? 'YES' : 'NO'}`);
    if (video) {
      console.log(`  URL: ${video.url}`);
      console.log(`  Duration: ${video.duration_seconds}s`);
      totalVideos++;
    }

    console.log('-'.repeat(60));
  });

  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Memories: ${memories.length}`);
  console.log(`Total Photos: ${totalPhotos}`);
  console.log(`Total GIFs: ${totalGifs}`);
  console.log(`Total Videos: ${totalVideos}`);
  console.log('='.repeat(60));
}

const shareCode = process.argv[2];
if (!shareCode) {
  console.error('Usage: node scripts/audit-memorypop.js <shareCode>');
  process.exit(1);
}

auditMemoryPop(shareCode).catch(console.error);
