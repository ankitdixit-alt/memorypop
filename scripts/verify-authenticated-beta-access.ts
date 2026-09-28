/**
 * Verify authenticated role cannot access beta_codes tables
 * Tests that signed-in users cannot bypass API to read codes directly
 */

import { createClient } from '@supabase/supabase-js';

const TEST_DB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const TEST_DB_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const TEST_DB_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!TEST_DB_URL || !TEST_DB_ANON_KEY || !TEST_DB_SERVICE_KEY) {
  console.error('❌ Environment not configured');
  process.exit(1);
}

async function testAuthenticatedAccess() {
  console.log('🧪 Testing Authenticated Role Beta Code Access\n');

  // Test 1: Create authenticated session for test user
  console.log('Test 1: Create authenticated session');
  const anonClient = createClient(TEST_DB_URL, TEST_DB_ANON_KEY);

  // Sign in with magic link or test credentials
  // For this test, we'll use the management token approach
  const { data: authData, error: authError } = await anonClient.auth.signInWithPassword({
    email: 'test@example.com',
    password: 'test-password-123'
  });

  if (authError && authError.message.includes('Invalid login credentials')) {
    console.log('  ℹ️  Test user does not exist, creating...');

    // Try to create test user
    const { data: signUpData, error: signUpError } = await anonClient.auth.signUp({
      email: 'test@example.com',
      password: 'test-password-123',
    });

    if (signUpError) {
      console.log('  ⚠️  Cannot create test user:', signUpError.message);
      console.log('  ⚠️  Skipping authenticated test (requires user creation)');
      console.log();
      testWithoutAuth();
      return;
    }

    console.log('  ✅ Test user created:', signUpData.user?.id);
    console.log();
  } else if (authError) {
    console.log('  ❌ Auth error:', authError.message);
    console.log('  ⚠️  Skipping authenticated test');
    console.log();
    testWithoutAuth();
    return;
  } else {
    console.log('  ✅ Authenticated as:', authData.user?.id);
    console.log();
  }

  // Test 2: Try to read beta_codes with authenticated session
  console.log('Test 2: Authenticated client attempts beta_codes SELECT');
  const { data: betaCodes, error: betaCodesError } = await anonClient
    .from('beta_codes')
    .select('*')
    .limit(1);

  if (betaCodesError) {
    console.log('  ✅ PASS: Authenticated blocked');
    console.log('  Error:', betaCodesError.message);
    console.log('  Code:', betaCodesError.code);
  } else if (betaCodes && betaCodes.length > 0) {
    console.log('  ❌ FAIL: Authenticated can read beta_codes!');
    console.log('  Security vulnerability: authenticated users can bypass API');
    console.log('  Data:', betaCodes);
  } else {
    console.log('  ✅ PASS: Authenticated has no access (empty result)');
  }
  console.log();

  // Test 3: Try to insert into beta_code_redemptions with authenticated session
  console.log('Test 3: Authenticated client attempts beta_code_redemptions INSERT');
  const { data: redemptionData, error: redemptionError } = await anonClient
    .from('beta_code_redemptions')
    .insert({
      beta_code_id: '00000000-0000-0000-0000-000000000000', // fake ID
      memorypop_id: '00000000-0000-0000-0000-000000000000', // fake ID
    })
    .select();

  if (redemptionError) {
    console.log('  ✅ PASS: Authenticated blocked from INSERT');
    console.log('  Error:', redemptionError.message);
    console.log('  Code:', redemptionError.code);
  } else if (redemptionData) {
    console.log('  ❌ FAIL: Authenticated can insert redemptions!');
    console.log('  Security vulnerability: authenticated users can forge redemptions');
    console.log('  Data:', redemptionData);
  } else {
    console.log('  ✅ PASS: Authenticated cannot insert');
  }
  console.log();

  // Test 4: Try to update beta_codes with authenticated session
  console.log('Test 4: Authenticated client attempts beta_codes UPDATE');
  const { data: updateData, error: updateError } = await anonClient
    .from('beta_codes')
    .update({ current_redemptions: 999 })
    .eq('campaign_name', 'test_2026')
    .select();

  if (updateError) {
    console.log('  ✅ PASS: Authenticated blocked from UPDATE');
    console.log('  Error:', updateError.message);
    console.log('  Code:', updateError.code);
  } else if (updateData && updateData.length > 0) {
    console.log('  ❌ FAIL: Authenticated can update beta_codes!');
    console.log('  Security vulnerability: authenticated users can manipulate redemption counts');
    console.log('  Data:', updateData);
  } else {
    console.log('  ✅ PASS: Authenticated cannot update');
  }
  console.log();

  console.log('✅ Authenticated role security verification complete');
}

async function testWithoutAuth() {
  console.log('Fallback Test: Verify anon and service roles only\n');

  const serviceClient = createClient(TEST_DB_URL, TEST_DB_SERVICE_KEY);
  const anonClient = createClient(TEST_DB_URL, TEST_DB_ANON_KEY);

  // Test anon blocking
  console.log('Test A: Anon client beta_codes SELECT');
  const { error: anonError } = await anonClient
    .from('beta_codes')
    .select('*')
    .limit(1);

  if (anonError) {
    console.log('  ✅ PASS: Anon blocked');
  } else {
    console.log('  ❌ FAIL: Anon has access');
  }
  console.log();

  // Test service role access
  console.log('Test B: Service role beta_codes SELECT');
  const { data: serviceData, error: serviceError } = await serviceClient
    .from('beta_codes')
    .select('campaign_name')
    .eq('campaign_name', 'test_2026')
    .single();

  if (serviceError) {
    console.log('  ❌ FAIL: Service role blocked');
    console.log('  Error:', serviceError.message);
  } else if (serviceData) {
    console.log('  ✅ PASS: Service role can access');
    console.log('  Campaign:', serviceData.campaign_name);
  }
  console.log();

  console.log('✅ Fallback verification complete');
  console.log();
  console.log('Note: Full authenticated test requires user creation');
  console.log('Or run with existing user credentials');
}

testAuthenticatedAccess();
