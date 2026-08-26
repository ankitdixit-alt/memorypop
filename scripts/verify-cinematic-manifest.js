// Verify cinematic scene manifest
// Generates expected scene sequence based on memory content

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function generateSceneManifest(memory, memoryIndex) {
  const scenes = [];
  const photos = memory.photos || [];
  const gifs = memory.gifs || [];
  const video = memory.video;

  // Always show contributor and message first
  scenes.push({
    type: 'contributor',
    content: memory.contributor_name
  });

  scenes.push({
    type: 'message',
    content: memory.message || '(no message)'
  });

  // Individual scene for EACH photo
  photos.forEach((photo, i) => {
    scenes.push({
      type: 'photo',
      index: i + 1,
      url: photo.url
    });
  });

  // Individual scene for EACH gif
  gifs.forEach((gif, i) => {
    scenes.push({
      type: 'gif',
      index: i + 1,
      url: gif.url
    });
  });

  // One video scene if present
  if (video) {
    scenes.push({
      type: 'video',
      duration: video.duration_seconds,
      url: video.url
    });
  }

  return scenes;
}

async function verifyManifest(shareCode) {
  console.log('='.repeat(80));
  console.log('CINEMATIC SCENE MANIFEST VERIFICATION');
  console.log('='.repeat(80));
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

  console.log(`Recipient: ${memorypop.recipient_name}`);
  console.log(`Total Memories: ${memories.length}\n`);

  let totalScenes = 0;

  memories.forEach((memory, memoryIndex) => {
    console.log(`${'='.repeat(80)}`);
    console.log(`MEMORY ${memoryIndex + 1}: ${memory.contributor_name}`);
    console.log(`${'='.repeat(80)}`);

    const scenes = generateSceneManifest(memory, memoryIndex);

    console.log(`Expected Scenes: ${scenes.length}\n`);

    scenes.forEach((scene, sceneIndex) => {
      const sceneNum = totalScenes + sceneIndex + 1;
      console.log(`Scene ${sceneNum}: ${scene.type.toUpperCase()}`);

      if (scene.type === 'contributor') {
        console.log(`  → "${scene.content}"`);
      } else if (scene.type === 'message') {
        const preview = scene.content.substring(0, 60);
        console.log(`  → "${preview}${scene.content.length > 60 ? '...' : ''}"`);
      } else if (scene.type === 'photo') {
        console.log(`  → Photo ${scene.index} of ${memory.photos.length}`);
        console.log(`  → ${scene.url}`);
      } else if (scene.type === 'gif') {
        console.log(`  → GIF ${scene.index}`);
        console.log(`  → ${scene.url}`);
      } else if (scene.type === 'video') {
        console.log(`  → Duration: ${scene.duration.toFixed(1)}s`);
        console.log(`  → ${scene.url}`);
      }
      console.log();
    });

    totalScenes += scenes.length;
  });

  console.log(`${'='.repeat(80)}`);
  console.log(`FINAL SCREEN`);
  console.log(`${'='.repeat(80)}`);
  console.log(`Scene ${totalScenes + 1}: FINAL_SCREEN`);
  console.log(`  → Celebration message`);
  console.log(`  → "One more thing..."`);
  console.log(`  → Continue button → Reaction Prompt`);
  console.log();

  console.log(`${'='.repeat(80)}`);
  console.log('SUMMARY');
  console.log(`${'='.repeat(80)}`);
  console.log(`Total Memories: ${memories.length}`);
  console.log(`Total Cinematic Scenes: ${totalScenes}`);
  console.log(`Expected Auto-Progression: ${totalScenes} scenes + 1 final screen`);
  console.log();

  console.log('✓ Manifest generated successfully');
  console.log(`${'='.repeat(80)}`);
}

const shareCode = process.argv[2];
if (!shareCode) {
  console.error('Usage: node scripts/verify-cinematic-manifest.js <shareCode>');
  process.exit(1);
}

verifyManifest(shareCode).catch(console.error);
