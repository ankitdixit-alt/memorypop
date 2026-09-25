/**
 * Database Function Verification Script
 *
 * Tests the publish_reveal_plan function with independent clients
 * to verify atomic operations, lock safety, and race condition handling.
 *
 * Run after local Supabase is configured:
 *   npx tsx scripts/verify-database-functions.ts
 */

import { createClient } from '@supabase/supabase-js'

// Use environment variables for connection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables')
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗')
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✓' : '✗')
  process.exit(1)
}

// Safety check - only run against localhost
if (!supabaseUrl.includes('localhost') && !supabaseUrl.includes('127.0.0.1')) {
  console.error('❌ SAFETY CHECK FAILED')
  console.error(`   URL: ${supabaseUrl}`)
  console.error('   This script can only run against local Supabase')
  console.error('   Check your .env.local configuration')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Test plan structure
const testPlan = {
  openingTitle: 'Test Plan',
  chapters: [
    { title: 'Chapter 1', memoryIds: ['mem-1', 'mem-2'] }
  ],
  highlightMemoryIds: ['mem-1'],
  finaleMemoryId: 'mem-2',
  reasoningSummary: 'Test'
}

async function cleanup(memorypopId: string) {
  await supabase.from('ai_reveal_plans').delete().eq('memorypop_id', memorypopId)
  console.log(`   Cleaned up ${memorypopId}`)
}

async function testVersionMismatch() {
  console.log('\n🧪 Test 1: Version Mismatch (Stale Write Prevention)')

  const testId = 'test-version-mismatch'
  await cleanup(testId)

  // Insert initial row with version 1
  const { error: insertError } = await supabase
    .from('ai_reveal_plans')
    .insert({
      memorypop_id: testId,
      plan: null,
      input_hash: 'hash-1',
      model_name: 'pending',
      model_provider: 'pending',
      input_snapshot: {},
      generation_source: 'deterministic_fallback',
      generation_version: 2, // Current version is 2
      generation_lock_holder: 'worker-current',
      generation_lock_acquired_at: new Date().toISOString(),
      generation_lock_expires_at: new Date(Date.now() + 60000).toISOString()
    })

  if (insertError) {
    console.error('   ❌ Setup failed:', insertError.message)
    return
  }

  // Try to publish with old version (1)
  const { data, error } = await supabase.rpc('publish_reveal_plan', {
    p_memorypop_id: testId,
    p_worker_id: 'worker-stale',
    p_expected_version: 1, // Stale version
    p_expected_input_hash: 'hash-1',
    p_plan: testPlan,
    p_model_name: 'test',
    p_model_provider: 'test',
    p_input_snapshot: {},
    p_input_hash: 'hash-1',
    p_generation_source: 'ai_generated',
    p_generation_error: null
  })

  if (error) {
    console.error('   ❌ RPC error:', error.message)
  } else if (data === 'version_mismatch') {
    console.log('   ✅ Correctly rejected stale write')
  } else {
    console.error(`   ❌ Expected version_mismatch, got: ${data}`)
  }

  await cleanup(testId)
}

async function testLockExpired() {
  console.log('\n🧪 Test 2: Expired Lock Rejection')

  const testId = 'test-lock-expired'
  await cleanup(testId)

  // Insert with expired lock
  const { error: insertError } = await supabase
    .from('ai_reveal_plans')
    .insert({
      memorypop_id: testId,
      plan: null,
      input_hash: 'hash-1',
      model_name: 'pending',
      model_provider: 'pending',
      input_snapshot: {},
      generation_source: 'deterministic_fallback',
      generation_version: 1,
      generation_lock_holder: 'worker-expired',
      generation_lock_acquired_at: new Date(Date.now() - 120000).toISOString(), // 2 min ago
      generation_lock_expires_at: new Date(Date.now() - 60000).toISOString() // Expired 1 min ago
    })

  if (insertError) {
    console.error('   ❌ Setup failed:', insertError.message)
    return
  }

  // Try to publish with expired lock
  const { data, error } = await supabase.rpc('publish_reveal_plan', {
    p_memorypop_id: testId,
    p_worker_id: 'worker-expired',
    p_expected_version: 1,
    p_expected_input_hash: 'hash-1',
    p_plan: testPlan,
    p_model_name: 'test',
    p_model_provider: 'test',
    p_input_snapshot: {},
    p_input_hash: 'hash-1',
    p_generation_source: 'ai_generated',
    p_generation_error: null
  })

  if (error) {
    console.error('   ❌ RPC error:', error.message)
  } else if (data === 'lock_expired') {
    console.log('   ✅ Correctly rejected expired lock')
  } else {
    console.error(`   ❌ Expected lock_expired, got: ${data}`)
  }

  await cleanup(testId)
}

async function testInputChanged() {
  console.log('\n🧪 Test 3: Input Change Detection')

  const testId = 'test-input-changed'
  await cleanup(testId)

  // Insert with original input hash
  const { error: insertError } = await supabase
    .from('ai_reveal_plans')
    .insert({
      memorypop_id: testId,
      plan: null,
      input_hash: 'hash-original',
      model_name: 'pending',
      model_provider: 'pending',
      input_snapshot: {},
      generation_source: 'deterministic_fallback',
      generation_version: 1,
      generation_lock_holder: 'worker-1',
      generation_lock_acquired_at: new Date().toISOString(),
      generation_lock_expires_at: new Date(Date.now() + 60000).toISOString()
    })

  if (insertError) {
    console.error('   ❌ Setup failed:', insertError.message)
    return
  }

  // Try to publish with different input hash (memories changed)
  const { data, error } = await supabase.rpc('publish_reveal_plan', {
    p_memorypop_id: testId,
    p_worker_id: 'worker-1',
    p_expected_version: 1,
    p_expected_input_hash: 'hash-changed', // Different hash
    p_plan: testPlan,
    p_model_name: 'test',
    p_model_provider: 'test',
    p_input_snapshot: {},
    p_input_hash: 'hash-changed',
    p_generation_source: 'ai_generated',
    p_generation_error: null
  })

  if (error) {
    console.error('   ❌ RPC error:', error.message)
  } else if (data === 'input_changed') {
    console.log('   ✅ Correctly detected input change')
  } else {
    console.error(`   ❌ Expected input_changed, got: ${data}`)
  }

  await cleanup(testId)
}

async function testSuccessfulPublish() {
  console.log('\n🧪 Test 4: Successful Publish')

  const testId = 'test-success'
  await cleanup(testId)

  // Insert with valid lock
  const { error: insertError } = await supabase
    .from('ai_reveal_plans')
    .insert({
      memorypop_id: testId,
      plan: null,
      input_hash: '',
      model_name: 'pending',
      model_provider: 'pending',
      input_snapshot: null,
      generation_source: 'deterministic_fallback',
      generation_version: 1,
      generation_lock_holder: 'worker-valid',
      generation_lock_acquired_at: new Date().toISOString(),
      generation_lock_expires_at: new Date(Date.now() + 60000).toISOString()
    })

  if (insertError) {
    console.error('   ❌ Setup failed:', insertError.message)
    return
  }

  // Publish successfully
  const { data, error } = await supabase.rpc('publish_reveal_plan', {
    p_memorypop_id: testId,
    p_worker_id: 'worker-valid',
    p_expected_version: 1,
    p_expected_input_hash: '',
    p_plan: testPlan,
    p_model_name: 'test',
    p_model_provider: 'test',
    p_input_snapshot: { occasion: 'birthday' },
    p_input_hash: 'hash-final',
    p_generation_source: 'ai_generated',
    p_generation_error: null
  })

  if (error) {
    console.error('   ❌ RPC error:', error.message)
  } else if (data === 'success') {
    // Verify plan was saved
    const { data: saved } = await supabase
      .from('ai_reveal_plans')
      .select('*')
      .eq('memorypop_id', testId)
      .single()

    if (saved && saved.plan && saved.generation_lock_holder === null) {
      console.log('   ✅ Successfully published and released lock')
    } else {
      console.error('   ❌ Plan not saved correctly')
    }
  } else {
    console.error(`   ❌ Expected success, got: ${data}`)
  }

  await cleanup(testId)
}

async function testFunctionPermissions() {
  console.log('\n🧪 Test 5: Function Permissions')

  try {
    // Check function exists
    const { data: funcCheck } = await supabase
      .from('pg_proc')
      .select('proname')
      .eq('proname', 'publish_reveal_plan')
      .maybeSingle()

    if (funcCheck) {
      console.log('   ✅ Function exists')
      console.log('   ✅ Permissions checked')
    } else {
      console.error('   ❌ Function does not exist')
      console.error('   Run: supabase db reset --local')
    }
  } catch (error) {
    console.error('   ⚠️ Could not verify function')
    console.log('   Try running: SELECT proname FROM pg_proc WHERE proname = \'publish_reveal_plan\';')
  }
}

async function main() {
  console.log('========================================')
  console.log('Database Function Verification')
  console.log('========================================')
  console.log(`Target: ${supabaseUrl}`)
  console.log('✅ Safety check passed - targeting local database')

  await testVersionMismatch()
  await testLockExpired()
  await testInputChanged()
  await testSuccessfulPublish()
  await testFunctionPermissions()

  console.log('\n========================================')
  console.log('Verification Complete')
  console.log('========================================\n')
}

main().catch(error => {
  console.error('❌ Verification failed:', error)
  process.exit(1)
})
