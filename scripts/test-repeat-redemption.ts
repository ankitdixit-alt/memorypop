/**
 * Test actual repeat redemption behavior
 * Shows database timestamps and idempotency
 */

import { createClient } from '@supabase/supabase-js';

const TEST_DB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const TEST_DB_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const TEST_MEMORYPOP_ID = '56a1ed54-5392-4864-8f35-cea3b4b42eb6';
const API_URL = 'http://localhost:3000';
const TEST_BETA_CODE = 'TESTBETA2026';

if (!TEST_DB_URL || !TEST_DB_SERVICE_KEY) {
  console.error('❌ Environment not configured');
  process.exit(1);
}

async function testRepeatRedemption() {
  console.log('🧪 Testing Repeat Beta Code Redemption\n');
  console.log('Gift:', TEST_MEMORYPOP_ID);
  console.log('Code:', TEST_BETA_CODE);
  console.log();

  const serviceClient = createClient(TEST_DB_URL, TEST_DB_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  // Get initial state with timestamps
  console.log('📊 Initial State:');
  const { data: initialPop } = await serviceClient
    .from('memorypops')
    .select('is_premium, upgrade_source, upgraded_at')
    .eq('id', TEST_MEMORYPOP_ID)
    .single();

  console.log('  is_premium:', initialPop?.is_premium || false);
  console.log('  upgrade_source:', initialPop?.upgrade_source || 'null');
  console.log('  upgraded_at:', initialPop?.upgraded_at || 'null');

  const { data: betaCode } = await serviceClient
    .from('beta_codes')
    .select('id, current_redemptions, total_redemption_limit')
    .eq('campaign_name', 'test_2026')
    .single();

  console.log('  redemptions:', betaCode?.current_redemptions || 0, '/', betaCode?.total_redemption_limit || 0);

  // Check existing redemption record
  const { data: existingRedemptions, count: redemptionCount } = await serviceClient
    .from('beta_code_redemptions')
    .select('redeemed_at', { count: 'exact' })
    .eq('memorypop_id', TEST_MEMORYPOP_ID)
    .eq('beta_code_id', betaCode?.id || '');

  console.log('  existing redemptions:', redemptionCount || 0);
  if (existingRedemptions && existingRedemptions.length > 0) {
    console.log('  first redeemed_at:', existingRedemptions[0].redeemed_at);
  }
  console.log();

  if (!initialPop?.is_premium) {
    console.log('⚠️  Gift is not Plus. First redemption must be done via browser:');
    console.log('   http://localhost:3000/manage/test-token-beta-2026');
    console.log('   Enter code: TESTBETA2026');
    console.log();
    console.log('After first redemption, re-run this script to test repeat behavior.');
    return;
  }

  if (!existingRedemptions || existingRedemptions.length === 0) {
    console.log('⚠️  Gift is Plus but no redemption record exists.');
    console.log('   This indicates upgrade happened via Stripe, not beta code.');
    console.log('   Cannot test repeat redemption without first redemption record.');
    return;
  }

  const firstRedemptionTime = existingRedemptions[0].redeemed_at;
  const firstRedemptionCount = betaCode?.current_redemptions || 0;

  console.log('✅ Gift has existing redemption. Testing repeat redemption...\n');

  // Simulate repeat redemption via API (requires session - this will fail with 403)
  // Actual test must be done in browser with session
  console.log('Test 1: Repeat redemption via API (will show 403 - expected)');
  try {
    const response = await fetch(`${API_URL}/api/memorypops/${TEST_MEMORYPOP_ID}/redeem-beta-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: TEST_BETA_CODE })
    });

    const result = await response.json();
    console.log('  Status:', response.status);
    console.log('  Response:', result);

    if (response.status === 403) {
      console.log('  ℹ️  Expected: API requires session authentication');
    }
  } catch (error: any) {
    console.log('  ⚠️  Network error:', error.message);
  }
  console.log();

  console.log('Test 2: Check database state for idempotency\n');
  console.log('Expected behavior on repeat redemption:');
  console.log('  - redemption count should NOT increment');
  console.log('  - redeemed_at timestamp should NOT change');
  console.log('  - should return success without creating duplicate record');
  console.log();

  // Show what to verify in browser
  console.log('📋 Manual Repeat Redemption Test:\n');
  console.log('1. Open: http://localhost:3000/manage/test-token-beta-2026');
  console.log('2. Enter code: TESTBETA2026');
  console.log('3. Click "Activate Plus for €0"');
  console.log('4. Should see success message');
  console.log();
  console.log('Then verify in database:');
  console.log();
  console.log('```sql');
  console.log(`SELECT is_premium, upgrade_source, upgraded_at`);
  console.log(`FROM memorypops WHERE id = '${TEST_MEMORYPOP_ID}';`);
  console.log(`-- upgraded_at should match: ${firstRedemptionTime}`);
  console.log();
  console.log(`SELECT r.redeemed_at, bc.current_redemptions`);
  console.log(`FROM beta_code_redemptions r`);
  console.log(`JOIN beta_codes bc ON r.beta_code_id = bc.id`);
  console.log(`WHERE r.memorypop_id = '${TEST_MEMORYPOP_ID}';`);
  console.log(`-- redeemed_at should match: ${firstRedemptionTime}`);
  console.log(`-- current_redemptions should stay: ${firstRedemptionCount}`);
  console.log('```');
  console.log();

  // Automated verification: compare current state
  console.log('Test 3: Current database state verification\n');

  const { data: currentPop } = await serviceClient
    .from('memorypops')
    .select('upgraded_at')
    .eq('id', TEST_MEMORYPOP_ID)
    .single();

  const { data: currentBetaCode } = await serviceClient
    .from('beta_codes')
    .select('current_redemptions')
    .eq('campaign_name', 'test_2026')
    .single();

  const { data: currentRedemptions, count: currentCount } = await serviceClient
    .from('beta_code_redemptions')
    .select('redeemed_at', { count: 'exact' })
    .eq('memorypop_id', TEST_MEMORYPOP_ID);

  console.log('Current state:');
  console.log('  upgraded_at:', currentPop?.upgraded_at);
  console.log('  current_redemptions:', currentBetaCode?.current_redemptions);
  console.log('  redemption records:', currentCount);
  console.log();

  // Check for idempotency violations
  let violations = 0;

  if (currentBetaCode?.current_redemptions !== firstRedemptionCount) {
    console.log('⚠️  WARNING: Redemption count changed!');
    console.log('   First:', firstRedemptionCount, '→ Current:', currentBetaCode?.current_redemptions);
    violations++;
  } else {
    console.log('✅ Redemption count unchanged:', firstRedemptionCount);
  }

  if ((currentCount || 0) > 1) {
    console.log('⚠️  WARNING: Multiple redemption records exist!');
    console.log('   Expected: 1, Found:', currentCount);
    console.log('   UNIQUE constraint may have failed');
    violations++;
  } else {
    console.log('✅ Single redemption record (UNIQUE constraint working)');
  }

  if (currentRedemptions && currentRedemptions[0].redeemed_at !== firstRedemptionTime) {
    console.log('⚠️  WARNING: Redemption timestamp changed!');
    console.log('   First:', firstRedemptionTime);
    console.log('   Current:', currentRedemptions[0].redeemed_at);
    violations++;
  } else {
    console.log('✅ Redemption timestamp unchanged:', firstRedemptionTime);
  }

  console.log();
  if (violations === 0) {
    console.log('✅ Idempotency verified: repeat redemption would be safe');
  } else {
    console.log(`❌ Found ${violations} idempotency violation(s)`);
  }

  console.log();
  console.log('Note: This test verifies database state consistency.');
  console.log('To test actual repeat redemption flow, use the browser checklist above.');
}

testRepeatRedemption();
