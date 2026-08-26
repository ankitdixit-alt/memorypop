/**
 * PRINT FLAT MANIFEST FOR FOUNDER FIXTURE
 *
 * Fetches actual memory data and prints expected flat timeline.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function printManifest(shareCode) {
  console.log('='.repeat(70));
  console.log('FLAT GLOBAL CINEMATIC MANIFEST');
  console.log('='.repeat(70));
  console.log(`ShareCode: ${shareCode}`);
  console.log('');

  // Fetch memories
  const { data: memories, error } = await supabase
    .from('memories')
    .select('*')
    .eq('memorypop_id', (
      await supabase
        .from('memorypops')
        .select('id')
        .eq('share_code', shareCode)
        .single()
    ).data.id)
    .order('created_at', { ascending: true });

  if (error || !memories) {
    console.error('Error fetching memories:', error);
    process.exit(1);
  }

  console.log(`Total Memories: ${memories.length}`);
  console.log('');

  // Build flat timeline
  let sceneIndex = 0;

  console.log('EXPECTED FLAT TIMELINE:');
  console.log('');

  memories.forEach((memory, memoryIndex) => {
    const photos = memory.photos || [];
    const gifs = memory.gifs || [];
    const video = memory.video || null;

    console.log(`--- Memory ${memoryIndex + 1}: ${memory.contributor_name} ---`);
    console.log('');

    // Contributor
    console.log(`  Scene ${sceneIndex}: CONTRIBUTOR → "${memory.contributor_name}"`);
    sceneIndex++;

    // Message
    console.log(`  Scene ${sceneIndex}: MESSAGE → "${memory.message.substring(0, 50)}..."`);
    sceneIndex++;

    // Photos
    photos.forEach((photo, photoIndex) => {
      console.log(`  Scene ${sceneIndex}: PHOTO ${photoIndex + 1}/${photos.length}`);
      sceneIndex++;
    });

    // GIFs
    gifs.forEach((gif, gifIndex) => {
      console.log(`  Scene ${sceneIndex}: GIF ${gifIndex + 1}/${gifs.length}`);
      sceneIndex++;
    });

    // Video
    if (video) {
      console.log(`  Scene ${sceneIndex}: VIDEO (${video.duration_seconds.toFixed(1)}s)`);
      sceneIndex++;
    }

    console.log('');
  });

  console.log('='.repeat(70));
  console.log(`TOTAL CONTENT SCENES: ${sceneIndex}`);
  console.log('='.repeat(70));
  console.log('');
  console.log('FULL REVEAL FLOW:');
  console.log('  Opening (Welcome screen)');
  console.log(`  → Scene 0..${sceneIndex - 1} (Cinematic content)`);
  console.log('  → FinalScreen');
  console.log('  → ReactionPrompt');
  console.log('  → ReactionThankYou');
  console.log('');
}

const shareCode = process.argv[2] || 'ec927763-3bbb-4722-a6e0-3c6172571bb0';
printManifest(shareCode);
