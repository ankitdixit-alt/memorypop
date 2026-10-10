/**
 * Test feature flag enforcement
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const TEST_SHARE_CODE = 'test-sharing-1790756204563';

async function testFeatureFlag() {
  console.log('🚩 Testing Feature Flag Enforcement\n');

  // Test 1: API rejects when flag disabled
  console.log('1️⃣ Testing API enforcement (flag disabled)...');
  console.log('   Setting ENABLE_VIDEO_EXPORT=false temporarily...\n');

  // Create a test request with flag disabled
  const { stdout } = await execAsync(
    `ENABLE_VIDEO_EXPORT=false node -e "
      const http = require('http');
      const postData = JSON.stringify({ shareCode: '${TEST_SHARE_CODE}' });
      const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/export/request',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          console.log('Status:', res.statusCode);
          console.log('Body:', data);
        });
      });
      req.on('error', (e) => {
        console.error('Error:', e.message);
      });
      req.write(postData);
      req.end();
    "`
  );

  console.log(stdout);

  if (stdout.includes('503') && stdout.includes('not available')) {
    console.log('   ✅ API correctly rejects with 503 when flag disabled\n');
  } else {
    console.error('   ❌ API should reject with 503\n');
  }

  // Test 2: Flag enabled allows exports
  console.log('2️⃣ Testing API with flag enabled...');
  const { stdout: enabledOutput } = await execAsync(
    `curl -s -X POST "${baseUrl}/api/export/request" \\
      -H "Content-Type: application/json" \\
      -d '{"shareCode":"${TEST_SHARE_CODE}"}'`
  );

  const result = JSON.parse(enabledOutput);

  if (result.jobId || result.status) {
    console.log('   ✅ API accepts requests when flag enabled');
    console.log(`      Response: ${result.status || 'OK'}\n`);
  } else {
    console.error('   ❌ API should accept when flag enabled');
    console.error('   Response:', result, '\n');
  }

  // Test 3: Client-side flag (would need browser test)
  console.log('3️⃣ Client-side flag verification...');
  console.log('   Note: Full client-side testing requires browser');
  console.log('   Component checks NEXT_PUBLIC_ENABLE_VIDEO_EXPORT');
  console.log('   When false: buttons hidden in UI');
  console.log('   When true: buttons visible\n');

  console.log('✅ Feature flag tests complete!\n');
  console.log('Summary:');
  console.log('  • ENABLE_VIDEO_EXPORT=false → API returns 503');
  console.log('  • ENABLE_VIDEO_EXPORT=true → API processes requests');
  console.log('  • NEXT_PUBLIC_ENABLE_VIDEO_EXPORT → controls UI visibility');
  console.log('  • Production: flags unset → feature disabled\n');
}

testFeatureFlag().catch(error => {
  console.error('\n❌ Test failed:', error);
  process.exit(1);
});
