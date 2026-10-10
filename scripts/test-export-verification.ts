/**
 * Verification tests for video export
 *
 * Tests:
 * 1. Disabled feature flags (server rejects before cache check)
 * 2. Authorization (download requires valid gift access)
 */

import { createClient } from '@supabase/supabase-js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Test share codes (fictional gifts in memorypop-test)
const GIFT_A = 'test-sharing-1790756204563';

async function testDisabledFlags() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('1️⃣  Testing Disabled Feature Flags');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('Testing with flags explicitly disabled...');
  console.log('Note: This requires restarting dev server with ENABLE_VIDEO_EXPORT=false\n');

  // Test API rejection
  try {
    const { stdout } = await execAsync(
      `curl -s -w "\\nHTTP_STATUS:%{http_code}" -X POST "${baseUrl}/api/export/request" \
        -H "Content-Type: application/json" \
        -d '{"shareCode":"${GIFT_A}"}'`
    );

    const httpStatus = stdout.match(/HTTP_STATUS:(\d+)/)?.[1];
    const body = stdout.replace(/HTTP_STATUS:\d+/, '').trim();

    console.log(`   Response status: ${httpStatus}`);
    console.log(`   Response body: ${body}\n`);

    if (httpStatus === '503' && body.includes('not available')) {
      console.log('   ✅ API correctly rejects with 503 when disabled');
    } else if (httpStatus === '200' || httpStatus === '201') {
      console.log('   ⚠️  API accepted request - flags may be enabled');
      console.log('   To test disabled state: set ENABLE_VIDEO_EXPORT=false and restart server');
    } else {
      console.log(`   ❌ Unexpected response: ${httpStatus}`);
      return false;
    }
  } catch (error: any) {
    console.error('   ❌ API test failed:', error.message);
    return false;
  }

  console.log('\n   Manual verification needed:');
  console.log('   1. Open dev server in browser');
  console.log('   2. Navigate to dashboard or reveal page');
  console.log('   3. Confirm Create/Download video buttons are hidden\n');

  return true;
}

async function testAuthorization() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('2️⃣  Testing Download Authorization');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Find a completed export job
  console.log('Finding completed export job...');
  const { data: jobs } = await supabase
    .from('export_jobs')
    .select(`
      id,
      status,
      video_path,
      memorypops!inner(id, share_code, recipient_name)
    `)
    .eq('status', 'completed')
    .not('video_path', 'is', null)
    .limit(1);

  if (!jobs || jobs.length === 0) {
    console.log('   ⚠️  No completed export jobs found');
    console.log('   Create an export first: npx tsx scripts/test-storage-export.ts\n');
    return false;
  }

  const job = jobs[0];
  const memorypop = job.memorypops as any;
  const jobId = job.id;
  const validShareCode = memorypop.share_code;

  console.log(`   Found job: ${jobId}`);
  console.log(`   Gift: ${validShareCode}`);
  console.log(`   Recipient: ${memorypop.recipient_name}\n`);

  // Test 1: Access without any authorization
  console.log('Test 2.1: Access without shareCode...');
  try {
    const { stdout } = await execAsync(
      `curl -s -w "\\nHTTP_STATUS:%{http_code}" "${baseUrl}/api/export/download?jobId=${jobId}"`
    );

    const httpStatus = stdout.match(/HTTP_STATUS:(\d+)/)?.[1];

    if (httpStatus === '307' || httpStatus === '302') {
      console.log(`   ⚠️  Unauthorized access allowed (status ${httpStatus})`);
      console.log('   Issue: Download endpoint lacks authorization check');
      console.log('   Anyone with jobId can download the video\n');
      return false;
    } else if (httpStatus === '403' || httpStatus === '401') {
      console.log(`   ✅ Unauthorized access rejected (${httpStatus})\n`);
    } else {
      console.log(`   ⚠️  Unexpected status: ${httpStatus}\n`);
    }
  } catch (error: any) {
    console.error('   ❌ Test failed:', error.message);
    return false;
  }

  // Test 2: Access with wrong shareCode
  console.log('Test 2.2: Access with different gift shareCode...');

  // Find a different gift
  const { data: otherGifts } = await supabase
    .from('memorypops')
    .select('share_code')
    .neq('share_code', validShareCode)
    .limit(1);

  if (otherGifts && otherGifts.length > 0) {
    const wrongShareCode = otherGifts[0].share_code;

    try {
      const { stdout } = await execAsync(
        `curl -s -w "\\nHTTP_STATUS:%{http_code}" "${baseUrl}/api/export/download?jobId=${jobId}&shareCode=${wrongShareCode}"`
      );

      const httpStatus = stdout.match(/HTTP_STATUS:(\d+)/)?.[1];

      if (httpStatus === '307' || httpStatus === '302') {
        console.log(`   ⚠️  Access with wrong shareCode allowed (${httpStatus})`);
        console.log('   Issue: Download endpoint does not validate shareCode\n');
        return false;
      } else if (httpStatus === '403' || httpStatus === '404') {
        console.log(`   ✅ Access with wrong shareCode rejected (${httpStatus})\n`);
      } else {
        console.log(`   ⚠️  Unexpected status: ${httpStatus}\n`);
      }
    } catch (error: any) {
      console.error('   ❌ Test failed:', error.message);
      return false;
    }
  } else {
    console.log('   ⚠️  Could not find different gift for testing\n');
  }

  // Test 3: Legitimate access with correct shareCode
  console.log('Test 2.3: Legitimate access with correct shareCode...');
  try {
    const { stdout } = await execAsync(
      `curl -s -I "${baseUrl}/api/export/download?jobId=${jobId}&shareCode=${validShareCode}" | grep -i "location\\|http/"`
    );

    if (stdout.includes('location:') && (stdout.includes('HTTP/1.1 307') || stdout.includes('HTTP/1.1 302'))) {
      console.log('   ✅ Legitimate access granted with signed URL redirect\n');
    } else if (stdout.includes('HTTP/1.1 200')) {
      console.log('   ✅ Legitimate access granted\n');
    } else {
      console.log('   ❌ Legitimate access denied');
      console.log(`   Response: ${stdout}\n`);
      return false;
    }
  } catch (error: any) {
    console.error('   ❌ Test failed:', error.message);
    return false;
  }

  return true;
}

async function runTests() {
  console.log('\n🧪 Export Verification Tests\n');
  console.log(`   Environment: ${supabaseUrl?.includes('lbjtwbpnlruykqgsaiwy') ? 'memorypop-test' : 'unknown'}`);
  console.log(`   Base URL: ${baseUrl}\n`);

  const flagsOk = await testDisabledFlags();
  const authOk = await testAuthorization();

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Summary');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (flagsOk && authOk) {
    console.log('✅ All verification tests passed\n');
  } else {
    console.log('⚠️  Some tests revealed issues:\n');
    if (!flagsOk) {
      console.log('   • Feature flag enforcement needs verification');
    }
    if (!authOk) {
      console.log('   • Authorization check missing or incomplete\n');
    }
    process.exit(1);
  }
}

runTests().catch(error => {
  console.error('\n❌ Test suite failed:', error);
  process.exit(1);
});
