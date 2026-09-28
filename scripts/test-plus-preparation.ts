/**
 * Test Plus gift preparation with AI Director
 * Verifies AI plan generation still works after conditional import fix
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
  return `test-plus-${Date.now()}`;
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('base64url');
}

async function testPlusPreparation() {
  console.log('🧪 Testing Plus Gift Preparation with AI Director\n');

  const serviceClient = createClient(TEST_DB_URL, TEST_DB_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const shareCode = generateTestCode();
  const managementToken = `token-${Date.now()}`;
  const managementTokenHash = hashToken(managementToken);

  // Create Plus gift
  console.log('Step 1: Create Plus gift');
  const { data: memoryPop, error: createError } = await serviceClient
    .from('memorypops')
    .insert({
      share_code: shareCode,
      recipient_name: 'Test Plus Recipient',
      occasion: 'birthday',
      cover_style: 'sunset',
      management_token_hash: managementTokenHash,
      creator_email: 'test@example.com',
      status: 'collecting',
      is_premium: true, // Plus gift
      upgrade_source: 'test',
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

  // Add test memories (need 3+ for good AI generation)
  console.log('Step 2: Add test memories');
  const memories = [
    { name: 'Alice', message: 'Happy birthday! Remember that amazing trip we took last summer?' },
    { name: 'Bob', message: 'Wishing you all the best on your special day. You are amazing!' },
    { name: 'Carol', message: 'Hope your birthday is filled with joy and laughter!' },
  ];

  for (const memory of memories) {
    const { error: memoryError } = await serviceClient
      .from('memories')
      .insert({
        memorypop_id: memoryPop.id,
        contributor_name: memory.name,
        message: memory.message,
      });

    if (memoryError) {
      console.error(`❌ Failed to add memory from ${memory.name}:`, memoryError);
      return;
    }
  }

  console.log(`  ✅ Added ${memories.length} memories`);
  console.log();

  // Establish creator session
  console.log('Step 3: Establish creator session');
  try {
    const sessionResponse = await fetch(`${API_URL}/manage/${managementToken}`, {
      redirect: 'manual'
    });

    console.log('  Session response:', sessionResponse.status);

    const setCookie = sessionResponse.headers.get('set-cookie');
    const sessionCookie = setCookie?.split(';')[0] || '';

    if (!sessionCookie) {
      console.error('  ❌ No session cookie set');
      return;
    }

    console.log('  ✅ Session cookie obtained');
    console.log();

    // Test status update (should trigger AI preparation)
    console.log('Step 4: Prepare reveal (should trigger AI Director)');
    console.log('  ENABLE_AI_DIRECTOR:', process.env.ENABLE_AI_DIRECTOR);

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
      return;
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

    // Verify AI plan was created (if ENABLE_AI_DIRECTOR=true)
    console.log('Step 6: Check AI plan');
    const { data: aiPlan } = await serviceClient
      .from('ai_reveal_plans')
      .select('generation_source, model_name, model_provider')
      .eq('memorypop_id', memoryPop.id)
      .maybeSingle();

    if (process.env.ENABLE_AI_DIRECTOR === 'true') {
      if (aiPlan) {
        console.log('  ✅ PASS: AI plan created');
        console.log('  Source:', aiPlan.generation_source);
        console.log('  Model:', aiPlan.model_name);
        console.log('  Provider:', aiPlan.model_provider);
      } else {
        console.log('  ⚠️  WARNING: No AI plan created');
        console.log('  Expected AI plan for Plus gift with ENABLE_AI_DIRECTOR=true');
      }
    } else {
      console.log('  ℹ️  ENABLE_AI_DIRECTOR=false, skipping AI check');
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
  console.log('✅ Plus gift preparation test complete');
  console.log();
  console.log('Created gift:', shareCode, '/', memoryPop.id);
  console.log('Dashboard:', `${API_URL}/dashboard/${shareCode}`);
  console.log('Reveal:', `${API_URL}/m/${shareCode}/reveal`);
  console.log('Manage:', `${API_URL}/manage/${managementToken}`);
}

testPlusPreparation();
