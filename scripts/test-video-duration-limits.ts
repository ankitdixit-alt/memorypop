/**
 * Test Video Duration Limits
 *
 * Verifies:
 * 1. Plus accepts 16s video (above Standard 15s limit)
 * 2. Plus accepts 89s video (below Plus 90s limit)
 * 3. Plus rejects 91s video (above Plus 90s limit)
 * 4. Standard rejects 16s video (above Standard 15s limit)
 *
 * Run: npx tsx scripts/test-video-duration-limits.ts
 * Environment: Uses .env.test (memorypop-test database)
 * Requirement: ffmpeg must be installed
 */

import { createClient } from '@supabase/supabase-js';
import { execSync } from 'child_process';
import fs from 'fs';
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
const PLUS_SHARE_CODE = 'test-plus-video-limits';
const STANDARD_SHARE_CODE = 'test-standard-video-limits';
const PLUS_RAW_TOKEN = 'test-plus-video-token-' + Date.now();
const STANDARD_RAW_TOKEN = 'test-standard-video-token-' + Date.now();

const TEST_VIDEOS_DIR = '/tmp/memorypop-test-videos';

function hashManagementToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('base64url');
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

function generateTestVideo(durationSeconds: number, outputPath: string): void {
  // Generate black video with minimal size
  // format=yuv420p ensures compatibility, scale=320:240 keeps size small
  const command = `ffmpeg -f lavfi -i color=black:s=320x240:d=${durationSeconds} -f lavfi -i anullsrc=r=44100:cl=stereo -c:v libx264 -t ${durationSeconds} -pix_fmt yuv420p -c:a aac -shortest -y "${outputPath}" 2>&1`;

  try {
    execSync(command, { stdio: 'pipe' });
  } catch (error) {
    console.error(`Failed to generate video: ${error}`);
    throw error;
  }
}

async function createTestGifts() {
  console.log('\n📦 Creating test gifts...');

  // Create Plus gift
  const { data: plusGift, error: plusError } = await supabase
    .from('memorypops')
    .upsert({
      share_code: PLUS_SHARE_CODE,
      recipient_name: 'Test Plus Video User',
      occasion: 'birthday',
      is_premium: true,
      upgraded_at: new Date().toISOString(),
      upgrade_source: 'beta_code',
      management_token_hash: hashManagementToken(PLUS_RAW_TOKEN),
    }, { onConflict: 'share_code' })
    .select()
    .single();

  if (plusError || !plusGift) {
    console.error('❌ Failed to create Plus gift:', plusError);
    return null;
  }

  console.log(`✅ Plus gift: ${plusGift.id} (${PLUS_SHARE_CODE})`);

  // Create Standard gift
  const { data: standardGift, error: standardError } = await supabase
    .from('memorypops')
    .upsert({
      share_code: STANDARD_SHARE_CODE,
      recipient_name: 'Test Standard Video User',
      occasion: 'birthday',
      is_premium: false,
      management_token_hash: hashManagementToken(STANDARD_RAW_TOKEN),
    }, { onConflict: 'share_code' })
    .select()
    .single();

  if (standardError || !standardGift) {
    console.error('❌ Failed to create Standard gift:', standardError);
    return null;
  }

  console.log(`✅ Standard gift: ${standardGift.id} (${STANDARD_SHARE_CODE})`);

  return { plusGift, standardGift };
}

async function uploadVideo(shareCode: string, videoPath: string, sessionCookie: string): Promise<{ success: boolean; error?: string }> {
  // Upload video via API
  const videoBuffer = fs.readFileSync(videoPath);
  const formData = new FormData();

  // Create a File-like object for the video
  const videoFile = new File([videoBuffer], 'test-video.mp4', { type: 'video/mp4' });
  formData.append('file', videoFile);
  formData.append('shareCode', shareCode);
  formData.append('mediaType', 'video');

  const uploadResponse = await fetch(`${BASE_URL}/api/upload`, {
    method: 'POST',
    headers: {
      Cookie: sessionCookie,
    },
    body: formData,
  });

  if (!uploadResponse.ok) {
    try {
      const error = await uploadResponse.json();
      return { success: false, error: error.error || 'Upload failed' };
    } catch {
      return { success: false, error: `Upload failed with status ${uploadResponse.status}` };
    }
  }

  return { success: true };
}

async function testPlusAccepts16sVideo(sessionCookie: string) {
  console.log('\n🧪 Test 1: Plus accepts 16s video (above Standard limit)');

  const videoPath = `${TEST_VIDEOS_DIR}/video-16s.mp4`;
  const result = await uploadVideo(PLUS_SHARE_CODE, videoPath, sessionCookie);

  if (result.success) {
    console.log('  ✅ Plus accepted 16s video');
    return true;
  } else {
    console.error(`  ❌ Plus rejected 16s video: ${result.error}`);
    return false;
  }
}

async function testPlusAccepts89sVideo(sessionCookie: string) {
  console.log('\n🧪 Test 2: Plus accepts 89s video (below Plus limit)');

  const videoPath = `${TEST_VIDEOS_DIR}/video-89s.mp4`;
  const result = await uploadVideo(PLUS_SHARE_CODE, videoPath, sessionCookie);

  if (result.success) {
    console.log('  ✅ Plus accepted 89s video');
    return true;
  } else {
    console.error(`  ❌ Plus rejected 89s video: ${result.error}`);
    return false;
  }
}

async function testPlusRejects91sVideo(sessionCookie: string) {
  console.log('\n🧪 Test 3: Plus rejects 91s video (above Plus limit)');

  const videoPath = `${TEST_VIDEOS_DIR}/video-91s.mp4`;
  const result = await uploadVideo(PLUS_SHARE_CODE, videoPath, sessionCookie);

  if (!result.success && result.error?.includes('90')) {
    console.log('  ✅ Plus rejected 91s video with duration error');
    return true;
  } else {
    console.error(`  ❌ Expected rejection for 91s video, got: ${result.success ? 'success' : result.error}`);
    return false;
  }
}

async function testStandardRejects16sVideo(sessionCookie: string) {
  console.log('\n🧪 Test 4: Standard rejects 16s video (above Standard limit)');

  const videoPath = `${TEST_VIDEOS_DIR}/video-16s.mp4`;
  const result = await uploadVideo(STANDARD_SHARE_CODE, videoPath, sessionCookie);

  if (!result.success && result.error?.includes('15')) {
    console.log('  ✅ Standard rejected 16s video with duration error');
    return true;
  } else {
    console.error(`  ❌ Expected rejection for 16s video, got: ${result.success ? 'success' : result.error}`);
    return false;
  }
}

async function cleanup() {
  console.log('\n🧹 Cleaning up test data...');

  await supabase.from('memorypops').delete().eq('share_code', PLUS_SHARE_CODE);
  await supabase.from('memorypops').delete().eq('share_code', STANDARD_SHARE_CODE);

  // Clean up test videos
  if (fs.existsSync(TEST_VIDEOS_DIR)) {
    fs.rmSync(TEST_VIDEOS_DIR, { recursive: true });
  }

  console.log('✅ Cleanup complete');
}

async function main() {
  console.log('🧪 Video Duration Limits Test');
  console.log('Environment: memorypop-test database');
  console.log('Requirement: npm run test:dev must be running on port 3000');
  console.log('Requirement: ffmpeg must be installed');

  // Check if server is running
  try {
    const response = await fetch(BASE_URL);
    if (!response.ok && response.status !== 404) throw new Error('Server not responding');
  } catch (error) {
    console.error('\n❌ Server not running. Run: npm run test:dev');
    process.exit(1);
  }

  // Check if ffmpeg is available
  try {
    execSync('which ffmpeg', { stdio: 'pipe' });
  } catch (error) {
    console.error('\n❌ ffmpeg not found. Install with: brew install ffmpeg');
    process.exit(1);
  }

  try {
    // Create test videos directory
    if (!fs.existsSync(TEST_VIDEOS_DIR)) {
      fs.mkdirSync(TEST_VIDEOS_DIR, { recursive: true });
    }

    // Generate test videos
    console.log('\n📹 Generating test videos...');
    console.log('  Creating 16s video...');
    generateTestVideo(16, `${TEST_VIDEOS_DIR}/video-16s.mp4`);
    console.log('  Creating 89s video...');
    generateTestVideo(89, `${TEST_VIDEOS_DIR}/video-89s.mp4`);
    console.log('  Creating 91s video...');
    generateTestVideo(91, `${TEST_VIDEOS_DIR}/video-91s.mp4`);
    console.log('✅ Test videos generated');

    const gifts = await createTestGifts();
    if (!gifts) {
      console.error('❌ Failed to create test gifts');
      process.exit(1);
    }

    // Establish sessions
    const plusSession = await establishCreatorSession(PLUS_RAW_TOKEN);
    const standardSession = await establishCreatorSession(STANDARD_RAW_TOKEN);

    if (!plusSession || !standardSession) {
      console.error('❌ Failed to establish creator sessions');
      process.exit(1);
    }

    const test1 = await testPlusAccepts16sVideo(plusSession);
    const test2 = await testPlusAccepts89sVideo(plusSession);
    const test3 = await testPlusRejects91sVideo(plusSession);
    const test4 = await testStandardRejects16sVideo(standardSession);

    await cleanup();

    console.log('\n📊 Test Summary');
    console.log(`Plus accepts 16s: ${test1 ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Plus accepts 89s: ${test2 ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Plus rejects 91s: ${test3 ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Standard rejects 16s: ${test4 ? '✅ PASS' : '❌ FAIL'}`);

    if (test1 && test2 && test3 && test4) {
      console.log('\n✅ All video duration tests passed');
      process.exit(0);
    } else {
      console.log('\n❌ Some video duration tests failed');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Test error:', error);
    await cleanup();
    process.exit(1);
  }
}

main();
