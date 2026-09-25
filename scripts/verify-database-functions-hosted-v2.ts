/**
 * Database Function Verification Script - Hosted Test Database v2
 *
 * Tests the publish_reveal_plan function with:
 * - Atomic operations and lock safety
 * - Race condition handling
 * - Actual execution permission verification
 *
 * Usage:
 *   npm run test:verify-db
 *   or
 *   ./scripts/run-with-test-env.sh "npx tsx scripts/verify-database-functions-hosted-v2.ts"
 */

import { createClient } from '@supabase/supabase-js'
import * as crypto from 'crypto'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const testProjectRef = process.env.TEST_PROJECT_REF

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables')
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗')
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗')
  process.exit(1)
}

// TypeScript narrowing: after validation, these are definitely strings
const validatedUrl = supabaseUrl as string
const validatedServiceKey = supabaseServiceKey as string

// Parse and validate Supabase URL
let hostname: string
try {
  const url = new URL(validatedUrl)
  hostname = url.hostname
} catch (error) {
  console.error('❌ MALFORMED URL')
  console.error('Cannot parse Supabase URL:', validatedUrl)
  process.exit(1)
}

// Check for localhost (exact match)
const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1'

// Check for exact test project hostname match
const expectedTestHostname = testProjectRef ? `${testProjectRef}.supabase.co` : null
const hasTestRef = expectedTestHostname && hostname === expectedTestHostname

if (!isLocalhost && !hasTestRef) {
  console.error('❌ HOSTNAME MISMATCH')
  console.error('Database hostname must be either:')
  console.error('  1. localhost or 127.0.0.1')
  console.error('  2. Exact match: ' + (expectedTestHostname || '(TEST_PROJECT_REF not set)'))
  console.error('')
  console.error('Got hostname:', hostname)
  process.exit(1)
}

// Block known production hostnames
const productionHostnames = [
  'gvfpgawbvuttglfscngg.supabase.co',
]

for (const prodHostname of productionHostnames) {
  if (hostname === prodHostname) {
    console.error('❌ PRODUCTION DATABASE BLOCKED')
    console.error('This script MUST NOT run against production.')
    console.error('Hostname:', hostname)
    process.exit(1)
  }
}

const serviceClient = createClient(validatedUrl, validatedServiceKey)
const anonClient = supabaseAnonKey ? createClient(validatedUrl, supabaseAnonKey) : null

const testPlan = {
  openingTitle: 'Test Plan',
  chapters: [
    { title: 'Chapter 1', memoryIds: ['test-mem-1', 'test-mem-2'] }
  ],
  highlightMemoryIds: ['test-mem-1'],
  finaleMemoryId: 'test-mem-2',
  reasoningSummary: 'Test'
}

async function cleanup(memorypopId: string) {
  await serviceClient.from('ai_reveal_plans').delete().eq('memorypop_id', memorypopId)
  await serviceClient.from('memorypops').delete().eq('id', memorypopId)
  console.log(`   Cleaned up ${memorypopId}`)
}

async function createParentMemoryPop(memorypopId: string) {
  const { error } = await serviceClient.from('memorypops').insert({
    id: memorypopId,
    share_code: `test-${memorypopId.substring(0, 8)}`,
    occasion: 'birthday',
    recipient_name: 'Test User',
    management_token_hash: 'test-token-hash'
  })
  if (error) {
    throw new Error(`Failed to create parent memorypop: ${error.message}`)
  }
}

async function testVersionMismatch() {
  console.log('\n🧪 Test 1: Version Mismatch (Stale Write Prevention)')

  const testId = crypto.randomUUID()
  await cleanup(testId)
  await createParentMemoryPop(testId)

  const { error: insertError } = await serviceClient
    .from('ai_reveal_plans')
    .insert({
      memorypop_id: testId,
      plan: null,
      input_hash: 'hash-1',
      model_name: 'pending',
      model_provider: 'pending',
      input_snapshot: {},
      generation_source: 'deterministic_fallback',
      generation_version: 2,
      generation_lock_holder: 'worker-current',
      generation_lock_acquired_at: new Date().toISOString(),
      generation_lock_expires_at: new Date(Date.now() + 60000).toISOString()
    })

  if (insertError) {
    console.error('   ❌ Setup failed:', insertError.message)
    return
  }

  const { data, error } = await serviceClient.rpc('publish_reveal_plan', {
    p_memorypop_id: testId,
    p_worker_id: 'worker-stale',
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
  } else if (data === 'version_mismatch') {
    console.log('   ✅ Correctly rejected stale write')
  } else {
    console.error(`   ❌ Expected version_mismatch, got: ${data}`)
  }

  await cleanup(testId)
}

async function testLockExpired() {
  console.log('\n🧪 Test 2: Expired Lock Rejection')

  const testId = crypto.randomUUID()
  await cleanup(testId)
  await createParentMemoryPop(testId)

  const { error: insertError } = await serviceClient
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
      generation_lock_acquired_at: new Date(Date.now() - 120000).toISOString(),
      generation_lock_expires_at: new Date(Date.now() - 60000).toISOString()
    })

  if (insertError) {
    console.error('   ❌ Setup failed:', insertError.message)
    return
  }

  const { data, error } = await serviceClient.rpc('publish_reveal_plan', {
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

  const testId = crypto.randomUUID()
  await cleanup(testId)
  await createParentMemoryPop(testId)

  const { error: insertError } = await serviceClient
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

  const { data, error } = await serviceClient.rpc('publish_reveal_plan', {
    p_memorypop_id: testId,
    p_worker_id: 'worker-1',
    p_expected_version: 1,
    p_expected_input_hash: 'hash-changed',
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

  const testId = crypto.randomUUID()
  await cleanup(testId)
  await createParentMemoryPop(testId)

  const { error: insertError } = await serviceClient
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

  const { data, error } = await serviceClient.rpc('publish_reveal_plan', {
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
    const { data: saved } = await serviceClient
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

async function testMissingRow() {
  console.log('\n🧪 Test 5: Missing Row Rejection')

  const testId = crypto.randomUUID()
  // Don't create a row - test function handles missing row

  const { data, error } = await serviceClient.rpc('publish_reveal_plan', {
    p_memorypop_id: testId,
    p_worker_id: 'worker-test',
    p_expected_version: 1,
    p_expected_input_hash: '',
    p_plan: testPlan,
    p_model_name: 'test',
    p_model_provider: 'test',
    p_input_snapshot: {},
    p_input_hash: 'final',
    p_generation_source: 'ai_generated',
    p_generation_error: null
  })

  if (error) {
    console.error('   ❌ RPC error:', error.message)
  } else if (data === 'no_row_found') {
    console.log('   ✅ Correctly rejected missing row')
  } else {
    console.error(`   ❌ Expected no_row_found, got: ${data}`)
  }
}

async function testLateResponseAfterRelease() {
  console.log('\n🧪 Test 6: Late Response After Lock Release')

  const testId = crypto.randomUUID()
  await cleanup(testId)
  await createParentMemoryPop(testId)

  // Create row with already-released lock (NULL lock_holder)
  const { error: insertError } = await serviceClient
    .from('ai_reveal_plans')
    .insert({
      memorypop_id: testId,
      plan: testPlan, // Already published
      input_hash: 'hash-final',
      model_name: 'deterministic',
      model_provider: 'internal',
      input_snapshot: {},
      generation_source: 'deterministic_fallback',
      generation_version: 1,
      generation_lock_holder: null, // Lock already released
      generation_lock_acquired_at: null,
      generation_lock_expires_at: null
    })

  if (insertError) {
    console.error('   ❌ Setup failed:', insertError.message)
    return
  }

  // Late AI response tries to publish
  const { data, error } = await serviceClient.rpc('publish_reveal_plan', {
    p_memorypop_id: testId,
    p_worker_id: 'worker-late',
    p_expected_version: 1,
    p_expected_input_hash: 'hash-final',
    p_plan: testPlan,
    p_model_name: 'ai-model',
    p_model_provider: 'groq',
    p_input_snapshot: {},
    p_input_hash: 'hash-final',
    p_generation_source: 'ai_generated',
    p_generation_error: null
  })

  if (error) {
    console.error('   ❌ RPC error:', error.message)
  } else if (data === 'lock_lost') {
    console.log('   ✅ Correctly rejected late response (NULL lock holder)')
  } else {
    console.error(`   ❌ Expected lock_lost, got: ${data}`)
  }

  await cleanup(testId)
}

async function testInvalidArguments() {
  console.log('\n🧪 Test 7: Invalid Arguments Rejection')

  const testId = crypto.randomUUID()
  await cleanup(testId)
  await createParentMemoryPop(testId)

  const { error: insertError } = await serviceClient
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
      generation_lock_holder: 'worker-test',
      generation_lock_acquired_at: new Date().toISOString(),
      generation_lock_expires_at: new Date(Date.now() + 60000).toISOString()
    })

  if (insertError) {
    console.error('   ❌ Setup failed:', insertError.message)
    return
  }

  // Try to publish with NULL worker_id
  const { data, error } = await serviceClient.rpc('publish_reveal_plan', {
    p_memorypop_id: testId,
    p_worker_id: null, // Invalid argument
    p_expected_version: 1,
    p_expected_input_hash: '',
    p_plan: testPlan,
    p_model_name: 'test',
    p_model_provider: 'test',
    p_input_snapshot: {},
    p_input_hash: 'final',
    p_generation_source: 'ai_generated',
    p_generation_error: null
  })

  if (error) {
    console.error('   ❌ RPC error:', error.message)
  } else if (data === 'invalid_arguments') {
    console.log('   ✅ Correctly rejected NULL worker_id')
  } else {
    console.error(`   ❌ Expected invalid_arguments, got: ${data}`)
  }

  await cleanup(testId)
}

async function testFunctionPermissions() {
  console.log('\n🧪 Test 8: Function Execution Permissions')

  let functionWorks = false
  let testsFailed = false
  const testIdsToCleanup: string[] = []
  let testUserId: string | null = null

  try {
    // Test 5a: Verify function works with service role
    console.log('   Testing service role execution (must succeed)...')
    const testId = crypto.randomUUID()
    testIdsToCleanup.push(testId)

    // Create parent memorypop
    await createParentMemoryPop(testId)

    // Insert test row
    const { error: insertError } = await serviceClient
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
        generation_lock_holder: 'test-worker',
        generation_lock_acquired_at: new Date().toISOString(),
        generation_lock_expires_at: new Date(Date.now() + 60000).toISOString()
      })

    if (insertError) {
      console.error('   ❌ Service role insert failed:', insertError.message)
      testsFailed = true
      return
    }

    // Execute function
    const { data: result, error: executeError } = await serviceClient.rpc('publish_reveal_plan', {
      p_memorypop_id: testId,
      p_worker_id: 'test-worker',
      p_expected_version: 1,
      p_expected_input_hash: '',
      p_plan: testPlan,
      p_model_name: 'test',
      p_model_provider: 'test',
      p_input_snapshot: {},
      p_input_hash: 'final',
      p_generation_source: 'ai_generated',
      p_generation_error: null
    })

    if (executeError) {
      console.error('   ❌ Service role execution failed:', executeError.message)
      console.error('   Function does not exist or signature is incorrect')
      testsFailed = true
      return
    }

    if (result !== 'success') {
      console.error(`   ❌ Service role execution returned: ${result}`)
      testsFailed = true
      return
    }

    console.log('   ✅ Service role can execute function')
    functionWorks = true

    // Test 5b: Anonymous role must be denied
    if (!anonClient) {
      console.log('   ⚠️  Anon key not configured')
      console.log('   PENDING: Anonymous permission test')
      testsFailed = true
      return
    }

    console.log('   Testing anonymous access (must be denied)...')
    const anonTestId = crypto.randomUUID()
    testIdsToCleanup.push(anonTestId)

    // Create parent memorypop
    await createParentMemoryPop(anonTestId)

    // Service role creates row
    const { error: anonInsertError } = await serviceClient
      .from('ai_reveal_plans')
      .insert({
        memorypop_id: anonTestId,
        plan: null,
        input_hash: '',
        model_name: 'pending',
        model_provider: 'pending',
        input_snapshot: null,
        generation_source: 'deterministic_fallback',
        generation_version: 1,
        generation_lock_holder: 'test-anon',
        generation_lock_acquired_at: new Date().toISOString(),
        generation_lock_expires_at: new Date(Date.now() + 60000).toISOString()
      })

    if (anonInsertError) {
      console.error('   ❌ Setup failed for anonymous test:', anonInsertError.message)
      testsFailed = true
      return
    }

    // Anonymous tries to execute
    const { error: anonError } = await anonClient.rpc('publish_reveal_plan', {
      p_memorypop_id: anonTestId,
      p_worker_id: 'test-anon',
      p_expected_version: 1,
      p_expected_input_hash: '',
      p_plan: testPlan,
      p_model_name: 'test',
      p_model_provider: 'test',
      p_input_snapshot: {},
      p_input_hash: 'final',
      p_generation_source: 'ai_generated',
      p_generation_error: null
    })

    if (!anonError) {
      console.error('   ❌ CRITICAL: Anonymous succeeded - security breach!')
      testsFailed = true
      return
    }

    if (!anonError.message.includes('permission denied')) {
      console.error('   ❌ Anonymous blocked but not permission denied:')
      console.error(`      Message: ${anonError.message}`)
      console.error(`      Code: ${anonError.code}`)
      testsFailed = true
      return
    }

    console.log('   ✅ Anonymous correctly denied (permission denied)')

    // Test 5c: Authenticated user must be denied
    console.log('   Testing authenticated user (must be denied)...')

    const testEmail = `test-${Date.now()}@memorypop-test.local`
    const testPassword = 'test-password-' + crypto.randomUUID()

    const { data: userData, error: createError } = await serviceClient.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
    })

    if (createError || !userData.user) {
      console.log('   ⚠️  Cannot create test user - auth not available')
      console.log('   PENDING: Authenticated user permission test')
      testsFailed = true
      return
    }

    testUserId = userData.user.id
    console.log(`   Created test user: ${testEmail}`)

    // Sign in to get access token (using separate anon client)
    if (!supabaseAnonKey) {
      console.error('   ❌ Anon key required for sign-in')
      testsFailed = true
      return
    }
    // TypeScript narrowing workaround for module-level variable
    const anonKey = supabaseAnonKey as string
    const signInClient = createClient(validatedUrl, anonKey)
    const { data: sessionData, error: signInError } = await signInClient.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    })

    if (signInError || !sessionData.session) {
      console.error('   ❌ Could not sign in test user:', signInError?.message)
      testsFailed = true
      return
    }

    // Create authenticated client
    const authClient = createClient(validatedUrl, anonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`
        }
      }
    })

    const authTestId = crypto.randomUUID()
    testIdsToCleanup.push(authTestId)

    // Create parent memorypop
    await createParentMemoryPop(authTestId)

    // Service role creates row
    const { error: authInsertError } = await serviceClient
      .from('ai_reveal_plans')
      .insert({
        memorypop_id: authTestId,
        plan: null,
        input_hash: '',
        model_name: 'pending',
        model_provider: 'pending',
        input_snapshot: null,
        generation_source: 'deterministic_fallback',
        generation_version: 1,
        generation_lock_holder: 'test-auth',
        generation_lock_acquired_at: new Date().toISOString(),
        generation_lock_expires_at: new Date(Date.now() + 60000).toISOString()
      })

    if (authInsertError) {
      console.error('   ❌ Setup failed for authenticated test:', authInsertError.message)
      testsFailed = true
      return
    }

    // Authenticated user tries to execute
    const { error: authError } = await authClient.rpc('publish_reveal_plan', {
      p_memorypop_id: authTestId,
      p_worker_id: 'test-auth',
      p_expected_version: 1,
      p_expected_input_hash: '',
      p_plan: testPlan,
      p_model_name: 'test',
      p_model_provider: 'test',
      p_input_snapshot: {},
      p_input_hash: 'final',
      p_generation_source: 'ai_generated',
      p_generation_error: null
    })

    if (!authError) {
      console.error('   ❌ CRITICAL: Authenticated user succeeded - security breach!')
      testsFailed = true
      return
    }

    if (!authError.message.includes('permission denied')) {
      console.error('   ❌ Authenticated user blocked but not permission denied:')
      console.error(`      Message: ${authError.message}`)
      console.error(`      Code: ${authError.code}`)
      testsFailed = true
      return
    }

    console.log('   ✅ Authenticated user correctly denied (permission denied)')

  } finally {
    // Cleanup test data
    for (const id of testIdsToCleanup) {
      const { error } = await serviceClient
        .from('ai_reveal_plans')
        .delete()
        .eq('memorypop_id', id)

      if (error) {
        console.error(`   ⚠️  Cleanup failed for ${id}:`, error.message)
      }
    }

    // Cleanup test user
    if (testUserId) {
      const { error } = await serviceClient.auth.admin.deleteUser(testUserId)
      if (error) {
        console.error('   ⚠️  Failed to delete test user:', error.message)
      } else {
        console.log('   Cleaned up test user')
      }
    }

    if (testsFailed) {
      process.exit(1)
    }
  }
}

async function main() {
  console.log('========================================')
  console.log('Database Function Verification v2')
  console.log('========================================')
  console.log(`Target: ${validatedUrl}`)
  if (isLocalhost) {
    console.log('✅ Targeting localhost database')
  } else {
    console.log('✅ Targeting test project:', testProjectRef)
  }

  await testVersionMismatch()
  await testLockExpired()
  await testInputChanged()
  await testSuccessfulPublish()
  await testMissingRow()
  await testLateResponseAfterRelease()
  await testInvalidArguments()
  await testFunctionPermissions()

  console.log('\n========================================')
  console.log('Verification Complete')
  console.log('========================================\n')
}

main().catch(error => {
  console.error('❌ Verification failed:', error)
  process.exit(1)
})
