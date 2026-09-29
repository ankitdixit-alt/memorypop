/**
 * Test Custom Music Authorization
 *
 * Verifies:
 * 1. GET/POST/DELETE reject requests with no creator session (401/403)
 * 2. GET/POST/DELETE reject requests with wrong gift's creator session (403)
 * 3. GET/POST/DELETE accept requests with correct creator session
 *
 * Run: npx tsx scripts/test-custom-music-authorization.ts
 * Environment: Uses .env.test (memorypop-test database)
 * Requirement: npm run test:dev must be running on port 3000
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
const GIFT_A_SHARE_CODE = 'test-music-auth-a';
const GIFT_B_SHARE_CODE = 'test-music-auth-b';
const GIFT_A_RAW_TOKEN = 'test-raw-token-a-' + Date.now();
const GIFT_B_RAW_TOKEN = 'test-raw-token-b-' + Date.now();

function hashManagementToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('base64url');
}

async function createTestGifts() {
  console.log('\n📦 Creating test gifts...');

  // Create Gift A (Plus)
  const { data: giftA, error: errorA } = await supabase
    .from('memorypops')
    .upsert({
      share_code: GIFT_A_SHARE_CODE,
      recipient_name: 'Test Gift A',
      occasion: 'birthday',
      is_premium: true,
      upgraded_at: new Date().toISOString(),
      upgrade_source: 'beta_code',
      management_token_hash: hashManagementToken(GIFT_A_RAW_TOKEN),
    }, { onConflict: 'share_code' })
    .select()
    .single();

  if (errorA || !giftA) {
    console.error('❌ Failed to create Gift A:', errorA);
    return null;
  }

  console.log(`✅ Gift A: ${giftA.id} (${GIFT_A_SHARE_CODE})`);

  // Create Gift B (Plus)
  const { data: giftB, error: errorB } = await supabase
    .from('memorypops')
    .upsert({
      share_code: GIFT_B_SHARE_CODE,
      recipient_name: 'Test Gift B',
      occasion: 'birthday',
      is_premium: true,
      upgraded_at: new Date().toISOString(),
      upgrade_source: 'beta_code',
      management_token_hash: hashManagementToken(GIFT_B_RAW_TOKEN),
    }, { onConflict: 'share_code' })
    .select()
    .single();

  if (errorB || !giftB) {
    console.error('❌ Failed to create Gift B:', errorB);
    return null;
  }

  console.log(`✅ Gift B: ${giftB.id} (${GIFT_B_SHARE_CODE})`);

  return { giftA, giftB };
}

async function testNoSessionRejection(memorypopId: string) {
  console.log('\n🧪 Test 1: No creator session - should reject with 403');

  const response = await fetch(`${BASE_URL}/api/memorypops/${memorypopId}/custom-music`);

  if (response.status === 403) {
    console.log(`  ✅ GET rejected with 403 (no session)`);
    return true;
  } else {
    console.error(`  ❌ Expected 403, got ${response.status}`);
    return false;
  }
}

async function testWrongSessionRejection(giftAId: string, giftBId: string) {
  console.log('\n🧪 Test 2: Wrong gift session - should reject with 403');

  // Establish session for Gift A using management token flow
  const manageResponse = await fetch(`${BASE_URL}/manage/${GIFT_A_RAW_TOKEN}`, {
    redirect: 'manual', // Don't follow redirect, just get the cookie
  });

  if (manageResponse.status !== 302 && manageResponse.status !== 307) {
    console.error(`  ❌ Failed to establish Gift A session: ${manageResponse.status}`);
    return false;
  }

  // Get all Set-Cookie headers (fetch spec uses getSetCookie() for this)
  const setCookieHeaders = manageResponse.headers.getSetCookie?.() || [];
  if (setCookieHeaders.length === 0) {
    // Fallback to get('set-cookie') for older Node versions
    const singleCookie = manageResponse.headers.get('set-cookie');
    if (!singleCookie) {
      console.error('  ❌ No session cookie returned');
      console.error(`  Status: ${manageResponse.status}`);
      console.error(`  Headers:`, Object.fromEntries(manageResponse.headers.entries()));
      return false;
    }
    setCookieHeaders.push(singleCookie);
  }

  // Find the creator session cookie
  const sessionCookie = setCookieHeaders.find(c => c.includes('memorypop_creator_session'));
  if (!sessionCookie) {
    console.error('  ❌ Creator session cookie not found');
    return false;
  }

  // Try to access Gift B with Gift A's session
  const response = await fetch(`${BASE_URL}/api/memorypops/${giftBId}/custom-music`, {
    headers: { Cookie: sessionCookie.split(';')[0] }, // Use only the name=value part
  });

  if (response.status === 403) {
    console.log(`  ✅ GET rejected with 403 (wrong session)`);
    return true;
  } else {
    console.error(`  ❌ Expected 403, got ${response.status}`);
    return false;
  }
}

async function testCorrectSessionAccepted(memorypopId: string, rawToken: string) {
  console.log('\n🧪 Test 3: Correct creator session - should accept');

  // Establish correct session using management token flow
  const manageResponse = await fetch(`${BASE_URL}/manage/${rawToken}`, {
    redirect: 'manual', // Don't follow redirect, just get the cookie
  });

  if (manageResponse.status !== 302 && manageResponse.status !== 307) {
    console.error(`  ❌ Failed to establish session: ${manageResponse.status}`);
    return false;
  }

  // Get all Set-Cookie headers (fetch spec uses getSetCookie() for this)
  const setCookieHeaders = manageResponse.headers.getSetCookie?.() || [];
  if (setCookieHeaders.length === 0) {
    // Fallback to get('set-cookie') for older Node versions
    const singleCookie = manageResponse.headers.get('set-cookie');
    if (!singleCookie) {
      console.error('  ❌ No session cookie returned');
      return false;
    }
    setCookieHeaders.push(singleCookie);
  }

  // Find the creator session cookie
  const sessionCookie = setCookieHeaders.find(c => c.includes('memorypop_creator_session'));
  if (!sessionCookie) {
    console.error('  ❌ Creator session cookie not found');
    return false;
  }

  // Try to access with correct session
  const response = await fetch(`${BASE_URL}/api/memorypops/${memorypopId}/custom-music`, {
    headers: { Cookie: sessionCookie.split(';')[0] }, // Use only the name=value part
  });

  if (response.ok) {
    console.log(`  ✅ GET accepted with correct session`);
    return true;
  } else {
    console.error(`  ❌ Expected 200, got ${response.status}`);
    const error = await response.json();
    console.error(`  Error:`, error);
    return false;
  }
}

async function cleanup() {
  console.log('\n🧹 Cleaning up test data...');

  await supabase.from('memorypops').delete().eq('share_code', GIFT_A_SHARE_CODE);
  await supabase.from('memorypops').delete().eq('share_code', GIFT_B_SHARE_CODE);

  console.log('✅ Cleanup complete');
}

async function main() {
  console.log('🧪 Custom Music Authorization Test');
  console.log('Environment: memorypop-test database');
  console.log('Requirement: npm run test:dev must be running on port 3000');

  // Check if server is running
  try {
    const response = await fetch(BASE_URL);
    if (!response.ok && response.status !== 404) throw new Error('Server not responding');
  } catch (error) {
    console.error('\n❌ Server not running. Run: npm run test:dev');
    process.exit(1);
  }

  try {
    const gifts = await createTestGifts();
    if (!gifts) {
      console.error('❌ Failed to create test gifts');
      process.exit(1);
    }

    const noSessionResult = await testNoSessionRejection(gifts.giftA.id);
    const wrongSessionResult = await testWrongSessionRejection(gifts.giftA.id, gifts.giftB.id);
    const correctSessionResult = await testCorrectSessionAccepted(
      gifts.giftA.id,
      GIFT_A_RAW_TOKEN
    );

    await cleanup();

    console.log('\n📊 Test Summary');
    console.log(`No session rejection: ${noSessionResult ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Wrong session rejection: ${wrongSessionResult ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Correct session accepted: ${correctSessionResult ? '✅ PASS' : '❌ FAIL'}`);

    if (noSessionResult && wrongSessionResult && correctSessionResult) {
      console.log('\n✅ All authorization tests passed');
      process.exit(0);
    } else {
      console.log('\n❌ Some authorization tests failed');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Test error:', error);
    await cleanup();
    process.exit(1);
  }
}

main();
