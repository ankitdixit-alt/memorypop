/**
 * Test Custom Music API
 *
 * Verifies:
 * 1. GET returns signed upload URL for Plus gift
 * 2. Direct upload to Supabase Storage works
 * 3. POST validates and attaches music URL
 * 4. Standard gift returns 403 Forbidden
 * 5. DELETE removes custom music
 *
 * Run: npx tsx scripts/test-custom-music-api.ts
 * Environment: Uses .env.test (memorypop-test database)
 */

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Load test environment
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const BASE_URL = 'http://localhost:3000';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials in .env.test');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Test fixtures
const PLUS_SHARE_CODE = 'test-plus-music';
const STANDARD_SHARE_CODE = 'test-standard-music';
const PLUS_RAW_TOKEN = 'test-plus-music-token-' + Date.now();
const STANDARD_RAW_TOKEN = 'test-standard-music-token-' + Date.now();

function hashManagementToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('base64url');
}

async function createTestGifts() {
  console.log('\n📦 Creating test gifts...');

  // Create Plus gift
  const { data: plusGift, error: plusError } = await supabase
    .from('memorypops')
    .upsert({
      share_code: PLUS_SHARE_CODE,
      recipient_name: 'Test Plus Music User',
      occasion: 'birthday',
      is_premium: true,
      upgraded_at: new Date().toISOString(),
      upgrade_source: 'beta_code',
      management_token_hash: hashManagementToken(PLUS_RAW_TOKEN),
    }, { onConflict: 'share_code' })
    .select()
    .single();

  if (plusError) {
    console.error('❌ Failed to create Plus gift:', plusError);
    return null;
  }

  console.log(`✅ Plus gift: ${plusGift.id} (${PLUS_SHARE_CODE})`);

  // Create Standard gift
  const { data: standardGift, error: standardError } = await supabase
    .from('memorypops')
    .upsert({
      share_code: STANDARD_SHARE_CODE,
      recipient_name: 'Test Standard Music User',
      occasion: 'birthday',
      is_premium: false,
      management_token_hash: hashManagementToken(STANDARD_RAW_TOKEN),
    }, { onConflict: 'share_code' })
    .select()
    .single();

  if (standardError) {
    console.error('❌ Failed to create Standard gift:', standardError);
    return null;
  }

  console.log(`✅ Standard gift: ${standardGift.id} (${STANDARD_SHARE_CODE})`);

  return { plusGift, standardGift };
}

async function establishCreatorSession(rawToken: string): Promise<string | null> {
  const response = await fetch(`${BASE_URL}/manage/${rawToken}`, {
    redirect: 'manual',
  });

  if (response.status !== 302 && response.status !== 307) {
    return null;
  }

  const setCookieHeaders = response.headers.getSetCookie?.() || [];
  if (setCookieHeaders.length === 0) {
    const singleCookie = response.headers.get('set-cookie');
    if (!singleCookie) return null;
    setCookieHeaders.push(singleCookie);
  }

  const sessionCookie = setCookieHeaders.find(c => c.includes('memorypop_creator_session'));
  if (!sessionCookie) return null;

  return sessionCookie.split(';')[0];
}

function createTestAudioFile(): File {
  // Create minimal valid MP3 (silent, ~1KB)
  // MP3 header + LAME tag + minimal audio frames
  const mp3Buffer = Buffer.from([
    // MP3 Frame Header (MPEG-1 Layer 3, 128 kbps, 44100 Hz)
    0xFF, 0xFB, 0x90, 0x00,
    // Padding to create ~1KB file
    ...Array(1020).fill(0x00)
  ]);

  const blob = new Blob([mp3Buffer], { type: 'audio/mpeg' });
  return new File([blob], 'test-music.mp3', { type: 'audio/mpeg' });
}

async function testPlusUploadFlow(memorypopId: string) {
  console.log('\n🧪 Test 1: Plus upload flow');

  // Establish creator session
  const sessionCookie = await establishCreatorSession(PLUS_RAW_TOKEN);
  if (!sessionCookie) {
    console.error('  ❌ Failed to establish creator session');
    return false;
  }

  // Step 1: Get signed upload URL
  console.log('  📡 Step 1: GET signed upload URL');
  const urlResponse = await fetch(`${BASE_URL}/api/memorypops/${memorypopId}/custom-music`, {
    headers: { Cookie: sessionCookie },
  });

  if (!urlResponse.ok) {
    console.error(`  ❌ Failed to get upload URL: ${urlResponse.status}`);
    return false;
  }

  const { uploadUrl, filePath, token, maxFileSize, allowedTypes } = await urlResponse.json();
  console.log(`  ✅ Got signed URL (path: ${filePath})`);

  // Step 2: Upload directly to Supabase
  console.log('  ⬆️  Step 2: Upload to Supabase Storage');
  const testFile = createTestAudioFile();

  const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'audio/mpeg',
      'x-upsert': 'true',
    },
    body: testFile,
  });

  if (!uploadResponse.ok) {
    console.error(`  ❌ Storage upload failed: ${uploadResponse.status}`);
    return false;
  }

  console.log(`  ✅ File uploaded to storage`);

  // Step 3: Validate and attach
  console.log('  ✅ Step 3: Validate and attach to gift');
  const validateResponse = await fetch(`${BASE_URL}/api/memorypops/${memorypopId}/custom-music`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': sessionCookie,
    },
    body: JSON.stringify({
      filePath,
      fileSize: testFile.size,
      fileType: testFile.type,
      fileName: testFile.name,
    }),
  });

  if (!validateResponse.ok) {
    const error = await validateResponse.json();
    console.error(`  ❌ Validation failed: ${error.error}`);
    return false;
  }

  const result = await validateResponse.json();
  console.log(`  ✅ Music attached (path: ${result.storagePath})`);

  // Verify database update
  const { data: updatedGift } = await supabase
    .from('memorypops')
    .select('custom_music_url')
    .eq('id', memorypopId)
    .single();

  if (!updatedGift?.custom_music_url) {
    console.error(`  ❌ Database not updated`);
    return false;
  }

  console.log(`  ✅ Database updated (stored path: ${updatedGift.custom_music_url})`);

  return true;
}

async function testStandardRejection(memorypopId: string) {
  console.log('\n🧪 Test 2: Standard gift rejection');

  const urlResponse = await fetch(`${BASE_URL}/api/memorypops/${memorypopId}/custom-music`);

  if (urlResponse.status === 403) {
    console.log(`  ✅ Standard gift rejected with 403 Forbidden`);
    return true;
  } else {
    console.error(`  ❌ Expected 403, got ${urlResponse.status}`);
    return false;
  }
}

async function testMusicDeletion(memorypopId: string) {
  console.log('\n🧪 Test 3: Music deletion');

  // Establish creator session
  const sessionCookie = await establishCreatorSession(PLUS_RAW_TOKEN);
  if (!sessionCookie) {
    console.error('  ❌ Failed to establish creator session');
    return false;
  }

  const deleteResponse = await fetch(`${BASE_URL}/api/memorypops/${memorypopId}/custom-music`, {
    method: 'DELETE',
    headers: { Cookie: sessionCookie },
  });

  if (!deleteResponse.ok) {
    console.error(`  ❌ Delete failed: ${deleteResponse.status}`);
    return false;
  }

  console.log(`  ✅ Music deleted`);

  // Verify database cleared
  const { data: updatedGift } = await supabase
    .from('memorypops')
    .select('custom_music_url')
    .eq('id', memorypopId)
    .single();

  if (updatedGift?.custom_music_url !== null) {
    console.error(`  ❌ Database not cleared`);
    return false;
  }

  console.log(`  ✅ Database cleared`);

  return true;
}

async function cleanup() {
  console.log('\n🧹 Cleaning up test data...');

  await supabase.from('memorypops').delete().eq('share_code', PLUS_SHARE_CODE);
  await supabase.from('memorypops').delete().eq('share_code', STANDARD_SHARE_CODE);

  // Clean up any test files in storage
  const { data: files } = await supabase.storage
    .from('memorypop-custom-music')
    .list('');

  if (files && files.length > 0) {
    const testFiles = files.filter(f => f.name.includes('test-'));
    if (testFiles.length > 0) {
      await supabase.storage
        .from('memorypop-custom-music')
        .remove(testFiles.map(f => f.name));
    }
  }

  console.log('✅ Cleanup complete');
}

async function main() {
  console.log('🧪 Custom Music API Test');
  console.log('Environment: memorypop-test database');
  console.log('Requirement: npm run test:dev must be running on port 3000');
  console.log('Requirement: memorypop-custom-music bucket must exist');

  // Check if server is running
  try {
    const response = await fetch(BASE_URL);
    if (!response.ok && response.status !== 404) throw new Error('Server not responding');
  } catch (error) {
    console.error('\n❌ Server not running. Run: npm run test:dev');
    process.exit(1);
  }

  // Check if storage bucket exists
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.some(b => b.name === 'memorypop-custom-music');

  if (!bucketExists) {
    console.error('\n❌ Storage bucket "memorypop-custom-music" not found');
    console.error('Create bucket: Supabase Dashboard → Storage → Create Bucket');
    console.error('Name: memorypop-custom-music, Private: yes');
    process.exit(1);
  }

  try {
    const gifts = await createTestGifts();
    if (!gifts) {
      console.error('❌ Failed to create test gifts');
      process.exit(1);
    }

    const uploadResult = await testPlusUploadFlow(gifts.plusGift.id);
    const rejectionResult = await testStandardRejection(gifts.standardGift.id);
    const deleteResult = await testMusicDeletion(gifts.plusGift.id);

    await cleanup();

    console.log('\n📊 Test Summary');
    console.log(`Plus upload flow: ${uploadResult ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Standard rejection: ${rejectionResult ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Music deletion: ${deleteResult ? '✅ PASS' : '❌ FAIL'}`);

    if (uploadResult && rejectionResult && deleteResult) {
      console.log('\n✅ All tests passed');
      process.exit(0);
    } else {
      console.log('\n❌ Some tests failed');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Test error:', error);
    await cleanup();
    process.exit(1);
  }
}

main();
