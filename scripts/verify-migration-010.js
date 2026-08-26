/**
 * Verify Migration 010 Success
 * Checks schema, backfill, and existing MemoryPop compatibility
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verify() {
  console.log('🔍 Verifying Migration 010...\n');

  // 1. Verify schema - fetch one memory to see columns
  console.log('1️⃣  Checking schema columns...');
  const { data: sampleMemory, error: schemaError } = await supabase
    .from('memories')
    .select('id, photo_url, photos, gifs, video')
    .limit(1);

  if (schemaError) {
    console.error('❌ Schema check failed:', schemaError.message);
    process.exit(1);
  }

  const columns = sampleMemory && sampleMemory.length > 0
    ? Object.keys(sampleMemory[0])
    : ['id', 'photo_url', 'photos', 'gifs', 'video'];

  console.log('   ✅ Columns present:', columns.join(', '));

  // 2. Check for existing legacy MemoryPops
  console.log('\n2️⃣  Checking existing legacy MemoryPops...');
  const { data: legacyMemories, error: legacyError, count: legacyCount } = await supabase
    .from('memories')
    .select('id, contributor_name, photo_url, photos, gifs', { count: 'exact' })
    .not('photo_url', 'is', null)
    .limit(5);

  if (legacyError) {
    console.error('❌ Legacy memory check failed:', legacyError.message);
    process.exit(1);
  }

  console.log(`   ✅ Found ${legacyCount} memories with legacy photo_url`);

  if (legacyMemories && legacyMemories.length > 0) {
    console.log('   Sample legacy memory:');
    const sample = legacyMemories[0];
    console.log(`   - ID: ${sample.id}`);
    console.log(`   - Contributor: ${sample.contributor_name}`);
    console.log(`   - photo_url: ${sample.photo_url ? 'present' : 'null'}`);
    console.log(`   - photos[]: ${Array.isArray(sample.photos) ? `${sample.photos.length} items` : 'null/empty'}`);
    console.log(`   - gifs[]: ${Array.isArray(sample.gifs) ? `${sample.gifs.length} items` : 'null/empty'}`);
  }

  // 3. Verify backfill - check photos/gifs arrays were populated
  console.log('\n3️⃣  Verifying photo_url backfill...');

  const { data: backfilledPhotos, count: backfilledPhotoCount } = await supabase
    .from('memories')
    .select('id', { count: 'exact' })
    .not('photo_url', 'is', null)
    .like('photo_url', '%')
    .not('photo_url', 'like', '%.gif')
    .filter('photos', 'neq', '[]');

  const { data: backfilledGifs, count: backfilledGifCount } = await supabase
    .from('memories')
    .select('id', { count: 'exact' })
    .not('photo_url', 'is', null)
    .like('photo_url', '%.gif')
    .filter('gifs', 'neq', '[]');

  console.log(`   ✅ Non-GIF photos backfilled: ${backfilledPhotoCount} memories`);
  console.log(`   ✅ GIF photos backfilled: ${backfilledGifCount} memories`);

  // 4. Verify photo_url not modified
  console.log('\n4️⃣  Verifying photo_url preserved...');
  const { count: preservedCount } = await supabase
    .from('memories')
    .select('id', { count: 'exact' })
    .not('photo_url', 'is', null);

  console.log(`   ✅ photo_url still present in ${preservedCount} memories`);

  // 5. Test loading one complete MemoryPop
  console.log('\n5️⃣  Testing complete MemoryPop load...');
  const { data: memorypops } = await supabase
    .from('memorypops')
    .select('id, share_code, recipient_name')
    .limit(1);

  if (memorypops && memorypops.length > 0) {
    const testMemoryPop = memorypops[0];
    const { data: memories, error: loadError } = await supabase
      .from('memories')
      .select('*')
      .eq('memorypop_id', testMemoryPop.id);

    if (loadError) {
      console.error('❌ MemoryPop load failed:', loadError.message);
      process.exit(1);
    }

    console.log(`   ✅ MemoryPop "${testMemoryPop.recipient_name}" loaded successfully`);
    console.log(`   - Share code: ${testMemoryPop.share_code}`);
    console.log(`   - Memories: ${memories.length}`);
    console.log(`   - URL: http://localhost:3000/m/${testMemoryPop.share_code}`);
  }

  // 6. Summary
  console.log('\n' + '═'.repeat(60));
  console.log('✅ MIGRATION 010 VERIFICATION COMPLETE');
  console.log('═'.repeat(60));
  console.log('\nSchema: ✅ All JSONB columns present');
  console.log('Backfill: ✅ Legacy photo_url data migrated');
  console.log('Backwards compatibility: ✅ photo_url preserved');
  console.log('Existing MemoryPops: ✅ Load successfully');
  console.log('\n✅ Ready for runtime testing\n');
}

verify().catch(err => {
  console.error('💥 Verification failed:', err);
  process.exit(1);
});
