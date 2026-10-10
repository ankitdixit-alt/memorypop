/**
 * Setup Supabase Storage for exports (test environment only)
 *
 * This script:
 * 1. Verifies connection to test database
 * 2. Checks if exports bucket exists
 * 3. Creates bucket if needed (migration 019)
 * 4. Verifies bucket is private
 * 5. Tests upload/download with service role
 *
 * IMPORTANT: Only run on test environment (memorypop-test)
 */

import { createClient } from '@supabase/supabase-js';
import { promises as fs } from 'fs';
import path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

// Verify we're on test environment
if (!supabaseUrl.includes('lbjtwbpnlruykqgsaiwy')) {
  console.error('❌ Not running on test environment (memorypop-test)');
  console.error('   This script is for test only. Production setup must be manual.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupStorage() {
  console.log('🔧 Setting up export storage (test environment)\n');
  console.log(`   Project: memorypop-test (${supabaseUrl})\n`);

  // Step 1: Check if bucket exists
  console.log('1️⃣ Checking for exports bucket...');
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();

  if (listError) {
    console.error(`   ❌ Failed to list buckets: ${listError.message}`);
    process.exit(1);
  }

  const exportsBucket = buckets?.find(b => b.id === 'exports');

  if (exportsBucket) {
    console.log('   ✅ Bucket exists');
    console.log(`      Public: ${exportsBucket.public}`);
    console.log(`      File size limit: ${(exportsBucket.file_size_limit || 0) / 1024 / 1024} MB`);

    if (exportsBucket.public) {
      console.error('   ⚠️  Bucket is PUBLIC - should be PRIVATE');
      console.error('   Please manually update bucket to private in Supabase Dashboard');
    }
  } else {
    console.log('   📝 Bucket does not exist, creating...');

    // Create bucket using Storage API
    // Note: Some options may need to be set via dashboard after creation
    const { data: newBucket, error: createError } = await supabase.storage.createBucket('exports', {
      public: false,
    });

    if (createError) {
      console.error(`   ❌ Bucket creation failed: ${createError.message}`);
      console.log('\n   Manual steps:');
      console.log('   1. Open Supabase Dashboard → Storage');
      console.log('   2. Create new bucket named "exports"');
      console.log('   3. Set to PRIVATE');
      console.log('   4. Set file size limit to 500 MB');
      console.log('   5. Set allowed MIME types to video/mp4');
      process.exit(1);
    }

    console.log('   ✅ Bucket created');
    console.log(`      ID: ${newBucket?.name || 'exports'}`);
  }

  // Step 2: Test upload
  console.log('\n2️⃣ Testing upload...');
  const testContent = Buffer.from('test video content');
  const testPath = 'test/test-upload.mp4';

  const { error: uploadError } = await supabase.storage
    .from('exports')
    .upload(testPath, testContent, {
      contentType: 'video/mp4',
      upsert: true,
    });

  if (uploadError) {
    console.error(`   ❌ Upload failed: ${uploadError.message}`);
    process.exit(1);
  }

  console.log('   ✅ Upload successful');

  // Step 3: Test signed URL generation
  console.log('\n3️⃣ Testing signed URL generation...');
  const { data: signedUrl, error: signError } = await supabase.storage
    .from('exports')
    .createSignedUrl(testPath, 60, {
      download: 'test-download.mp4'
    });

  if (signError || !signedUrl) {
    console.error(`   ❌ Signed URL failed: ${signError?.message}`);
    process.exit(1);
  }

  console.log('   ✅ Signed URL generated');
  console.log(`      URL: ${signedUrl.signedUrl.substring(0, 80)}...`);

  // Step 4: Cleanup test file
  console.log('\n4️⃣ Cleaning up test file...');
  const { error: deleteError } = await supabase.storage
    .from('exports')
    .remove([testPath]);

  if (deleteError) {
    console.error(`   ⚠️  Cleanup warning: ${deleteError.message}`);
  } else {
    console.log('   ✅ Test file removed');
  }

  console.log('\n✅ Export storage setup complete!\n');
  console.log('Next steps:');
  console.log('1. Run export worker: npx tsx scripts/export-worker.ts');
  console.log('2. Test export via app or API');
  console.log('3. Verify download works without local MP4 files\n');
}

setupStorage().catch(error => {
  console.error('\n❌ Setup failed:', error);
  process.exit(1);
});
