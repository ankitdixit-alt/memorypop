/**
 * Test actual beta code redemption API endpoint
 * Simulates browser redemption request
 */

import { createClient } from '@supabase/supabase-js';

const TEST_DB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const TEST_DB_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const TEST_DB_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const TEST_MEMORYPOP_ID = '56a1ed54-5392-4864-8f35-cea3b4b42eb6';
const TEST_SHARE_CODE = 'beta-test-498303';
const TEST_BETA_CODE = 'TESTBETA2026';
const API_URL = 'http://localhost:3000';

if (!TEST_DB_URL || !TEST_DB_ANON_KEY || !TEST_DB_SERVICE_KEY) {
  console.error('❌ Environment not configured');
  process.exit(1);
}

async function testActualRedemption() {
  console.log('🧪 Testing Actual Beta Code Redemption API\n');
  console.log('Gift:', TEST_SHARE_CODE, '/', TEST_MEMORYPOP_ID);
  console.log('API:', API_URL);
  console.log('Code:', TEST_BETA_CODE);
  console.log();

  const serviceClient = createClient(TEST_DB_URL, TEST_DB_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  // Get initial state
  console.log('📊 Initial State:');
  const { data: initialPop } = await serviceClient
    .from('memorypops')
    .select('is_premium, upgrade_source')
    .eq('id', TEST_MEMORYPOP_ID)
    .single();

  console.log('  is_premium:', initialPop?.is_premium || false);
  console.log('  upgrade_source:', initialPop?.upgrade_source || 'null');

  const { data: betaCode } = await serviceClient
    .from('beta_codes')
    .select('current_redemptions, total_redemption_limit')
    .eq('campaign_name', 'test_2026')
    .single();

  const initialRedemptions = betaCode?.current_redemptions || 0;
  console.log('  redemptions:', initialRedemptions, '/', betaCode?.total_redemption_limit || 0);
  console.log();

  // Test 1: Unauthorized access (no session cookie)
  console.log('Test 1: Unauthorized API call (should fail with 403)');
  try {
    const response = await fetch(`${API_URL}/api/memorypops/${TEST_MEMORYPOP_ID}/redeem-beta-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: TEST_BETA_CODE })
    });

    const result = await response.json();
    if (response.status === 403) {
      console.log('  ✅ PASS: Unauthorized blocked (403)');
    } else {
      console.log('  ❌ FAIL: Expected 403, got', response.status);
      console.log('  Response:', result);
    }
  } catch (error: any) {
    console.log('  ⚠️  Network error:', error.message);
    console.log('  (Server may not be running on', API_URL, ')');
  }
  console.log();

  // Note: Cannot test authorized redemption without establishing session cookie
  // That requires browser or complex session setup
  console.log('⚠️  Authorized redemption test requires browser:');
  console.log('  1. Open: http://localhost:3000/manage/test-token-beta-2026');
  console.log('  2. Enter code: TESTBETA2026');
  console.log('  3. Click "Activate Plus for €0"');
  console.log();

  // Test 2: Verify anon cannot read beta_codes directly
  console.log('Test 2: Anon client direct database access (should fail)');
  const anonClient = createClient(TEST_DB_URL, TEST_DB_ANON_KEY);

  const { data: anonData, error: anonError } = await anonClient
    .from('beta_codes')
    .select('*')
    .limit(1);

  if (anonError) {
    console.log('  ✅ PASS: Anon blocked (', anonError.message, ')');
  } else if (anonData && anonData.length > 0) {
    console.log('  ❌ FAIL: Anon can read beta_codes! Security vulnerability!');
  } else {
    console.log('  ✅ PASS: Anon has no access');
  }
  console.log();

  // Test 3: Verify service role CAN read beta_codes
  console.log('Test 3: Service role direct database access (should succeed)');
  const { data: serviceData, error: serviceError } = await serviceClient
    .from('beta_codes')
    .select('*')
    .eq('campaign_name', 'test_2026')
    .single();

  if (serviceError) {
    console.log('  ❌ FAIL: Service role blocked');
    console.log('  Error:', serviceError.message);
    console.log('  Code:', serviceError.code);
    console.log();
    console.log('  ACTION REQUIRED: Run CORRECT_BETA_CODE_PERMISSIONS.sql');
    return;
  } else if (serviceData) {
    console.log('  ✅ PASS: Service role can access beta_codes');
  }
  console.log();

  console.log('✅ Database permission verification complete');
  console.log();
  console.log('Next: Test authorized redemption in browser');
  console.log('  Open: http://localhost:3000/manage/test-token-beta-2026');
}

testActualRedemption();
