/**
 * Automated Video Validation Testing
 * Tests video upload API with boundary conditions
 */

import { readFileSync } from 'fs';
import { basename } from 'path';

const API_BASE = 'http://localhost:3000';
const SHARE_CODE = process.argv[2];

if (!SHARE_CODE) {
  console.error('❌ Usage: node test-video-validation.mjs <shareCode>');
  process.exit(1);
}

async function uploadVideo(videoPath, testName) {
  console.log(`\n📹 ${testName}`);
  console.log(`   File: ${basename(videoPath)}`);

  try {
    const fileBuffer = readFileSync(videoPath);
    const formData = new FormData();

    const file = new File([fileBuffer], basename(videoPath), { type: 'video/mp4' });
    formData.append('file', file);
    formData.append('shareCode', SHARE_CODE);
    formData.append('mediaType', 'video');

    const response = await fetch(`${API_BASE}/api/upload`, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (response.ok) {
      console.log(`   ✅ PASS - Accepted`);
      console.log(`   Duration: ${result.duration?.toFixed(2)}s`);
      console.log(`   Validation proof: ${result.validationProof?.substring(0, 20)}...`);
      return { success: true, result };
    } else {
      console.log(`   ❌ FAIL - Rejected`);
      console.log(`   Error: ${result.error}`);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.log(`   ❌ EXCEPTION - ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('═'.repeat(60));
  console.log('VIDEO VALIDATION RUNTIME TESTS');
  console.log('═'.repeat(60));
  console.log(`Share Code: ${SHARE_CODE}`);
  console.log(`API Base: ${API_BASE}`);

  // Test 1: 14-second video (should PASS)
  const test1 = await uploadVideo('test-assets/video-valid-14s.mp4', 'Test 1: 14s video (PASS expected)');

  // Test 2: 15-second video (should PASS at boundary)
  const test2 = await uploadVideo('test-assets/video-valid-15s.mp4', 'Test 2: 15s video (PASS expected - boundary)');

  // Test 3: 16-second video (should FAIL server-side)
  const test3 = await uploadVideo('test-assets/video-over-limit-16s.mp4', 'Test 3: 16s video (FAIL expected - over limit)');

  // Test 4: Corrupt video (should fail gracefully)
  const test4 = await uploadVideo('test-assets/video-invalid-corrupt.mp4', 'Test 4: Corrupt file (FAIL expected - invalid)');

  // Summary
  console.log('\n' + '═'.repeat(60));
  console.log('TEST SUMMARY');
  console.log('═'.repeat(60));

  const results = [
    { name: 'Test 1 (14s)', expected: 'PASS', actual: test1.success ? 'PASS' : 'FAIL', correct: test1.success },
    { name: 'Test 2 (15s)', expected: 'PASS', actual: test2.success ? 'PASS' : 'FAIL', correct: test2.success },
    { name: 'Test 3 (16s)', expected: 'FAIL', actual: test3.success ? 'PASS' : 'FAIL', correct: !test3.success },
    { name: 'Test 4 (corrupt)', expected: 'FAIL', actual: test4.success ? 'PASS' : 'FAIL', correct: !test4.success },
  ];

  results.forEach(r => {
    const icon = r.correct ? '✅' : '❌';
    console.log(`${icon} ${r.name}: Expected ${r.expected}, Got ${r.actual}`);
  });

  const allPassed = results.every(r => r.correct);

  if (allPassed) {
    console.log('\n✅ ALL TESTS PASSED - Video validation working correctly\n');
  } else {
    console.log('\n❌ SOME TESTS FAILED - Review above\n');
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('💥 Test suite failed:', err);
  process.exit(1);
});
