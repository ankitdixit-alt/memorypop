/**
 * Test Standard gift preparation flow
 * Verifies status update works for non-Plus gifts
 */

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const TEST_DB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const TEST_DB_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const API_URL = 'http://localhost:3000';

if (!TEST_DB_URL || !TEST_DB_SERVICE_KEY) {
  console.error('❌ Environment not configured');
  process.exit(1);
}

function generateTestCode(): string {
  return `test-standard-${Date.now()}`;
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('base64url');
}

async function testStandardPreparation() {
  console.log('🧪 Testing Standard Gift Preparation\n');

  const serviceClient = createClient(TEST_DB_URL, TEST_DB_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const shareCode = generateTestCode();
  const managementToken = `token-${Date.now()}`;
  const managementTokenHash = hashToken(managementToken);

  // Create Standard (non-Plus) gift
  console.log('Step 1: Create Standard gift');
  const { data: memoryPop, error: createError } = await serviceClient
    .from('memorypops')
    .insert({
      share_code: shareCode,
      recipient_name: 'Test Recipient',
      occasion: 'birthday',
      cover_style: 'sunset',
      management_token_hash: managementTokenHash,
      creator_email: 'test@example.com',
      status: 'collecting',
      is_premium: false, // Standard gift
    })
    .select()
    .single();

  if (createError || !memoryPop) {
    console.error('❌ Failed to create gift:', createError);
    return;
  }

  console.log('  ✅ Created:', memoryPop.id);
  console.log('  Share code:', shareCode);
  console.log('  Plus:', memoryPop.is_premium);
  console.log();

  // Add test memory (required for preparation)
  console.log('Step 2: Add test memory');
  const { error: memoryError } = await serviceClient
    .from('memories')
    .insert({
      memorypop_id: memoryPop.id,
      contributor_name: 'Test Contributor',
      message: 'Test message for standard gift preparation',
    });

  if (memoryError) {
    console.error('❌ Failed to add memory:', memoryError);
    return;
  }

  console.log('  ✅ Memory added');
  console.log();

  // Establish creator session (visit management route)
  console.log('Step 3: Establish creator session');
  try {
    const sessionResponse = await fetch(`${API_URL}/manage/${managementToken}`, {
      redirect: 'manual' // Don't follow redirect
    });

    console.log('  Session response:', sessionResponse.status);

    // Extract session cookie
    const setCookie = sessionResponse.headers.get('set-cookie');
    const sessionCookie = setCookie?.split(';')[0] || '';

    if (!sessionCookie) {
      console.error('  ❌ No session cookie set');
      return;
    }

    console.log('  ✅ Session cookie obtained');
    console.log();

    // Test status update with session cookie
    console.log('Step 4: Prepare reveal (transition to ready)');
    const statusResponse = await fetch(`${API_URL}/api/memorypops/${memoryPop.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': sessionCookie
      },
      body: JSON.stringify({ status: 'ready' }),
    });

    console.log('  Status response:', statusResponse.status);

    if (statusResponse.ok) {
      const result = await statusResponse.json();
      console.log('  ✅ PASS: Status updated successfully');
      console.log('  Result:', result);
    } else {
      const error = await statusResponse.json();
      console.log('  ❌ FAIL: Status update failed');
      console.log('  Status:', statusResponse.status);
      console.log('  Error:', error);
    }
    console.log();

    // Verify database state
    console.log('Step 5: Verify database state');
    const { data: updatedPop } = await serviceClient
      .from('memorypops')
      .select('status, is_premium')
      .eq('id', memoryPop.id)
      .single();

    if (updatedPop) {
      console.log('  Status:', updatedPop.status);
      console.log('  Plus:', updatedPop.is_premium);

      if (updatedPop.status === 'ready') {
        console.log('  ✅ PASS: Gift transitioned to ready');
      } else {
        console.log('  ❌ FAIL: Status not updated');
      }
    }
    console.log();

    // Verify no AI plan was created (Standard shouldn't trigger AI)
    console.log('Step 6: Verify no AI plan created');
    const { data: aiPlan } = await serviceClient
      .from('ai_reveal_plans')
      .select('*')
      .eq('memorypop_id', memoryPop.id)
      .maybeSingle();

    if (aiPlan) {
      console.log('  ⚠️  WARNING: AI plan exists for Standard gift');
      console.log('  This should not happen');
    } else {
      console.log('  ✅ PASS: No AI plan (expected for Standard)');
    }
    console.log();

    // Test recipient reveal access
    console.log('Step 7: Test recipient reveal access');
    const revealResponse = await fetch(`${API_URL}/m/${shareCode}/reveal`, {
      redirect: 'manual'
    });

    console.log('  Reveal response:', revealResponse.status);

    if (revealResponse.status === 200 || revealResponse.status === 0) {
      console.log('  ✅ PASS: Reveal page accessible');
    } else {
      console.log('  Status:', revealResponse.status);
    }

  } catch (error: any) {
    console.error('  ❌ Network error:', error.message);
    console.log('  (Server may not be running on', API_URL, ')');
  }

  console.log();
  console.log('═══════════════════════════════════════');
  console.log('✅ Standard gift preparation test complete');
  console.log();
  console.log('Created gift:', shareCode, '/', memoryPop.id);
  console.log('Dashboard:', `${API_URL}/dashboard/${shareCode}`);
  console.log('Reveal:', `${API_URL}/m/${shareCode}/reveal`);
  console.log('Manage:', `${API_URL}/manage/${managementToken}`);
}

testStandardPreparation();
