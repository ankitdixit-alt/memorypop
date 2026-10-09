/**
 * Verify dashboard button still works with backward compatibility
 */

import { chromium } from 'playwright';
import { promises as fs } from 'fs';
import path from 'path';

async function verifyDashboard() {
  console.log('📸 Verifying Dashboard Button (Backward Compatibility)\n');

  const browser = await chromium.launch({ headless: true });
  const resultsDir = path.join(process.cwd(), 'test-results', `dashboard-verify-${Date.now()}`);
  await fs.mkdir(resultsDir, { recursive: true });

  try {
    // Test 1: Idle state (no cached export)
    console.log('📦 Test 1: Dashboard idle state\n');

    const context1 = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    const page1 = await context1.newPage();

    // Mock to return pending (no cached export)
    await page1.route('**/api/export/request', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          jobId: 'mock-dashboard-idle',
          status: 'pending'
        })
      });
    });

    await page1.goto('http://localhost:3000/dashboard/test-sharing-1790756204563', {
      waitUntil: 'networkidle'
    });
    await page1.waitForTimeout(2000);

    const dashboardIdlePath = path.join(resultsDir, 'dashboard-idle.png');
    await page1.screenshot({ path: dashboardIdlePath, fullPage: true });
    console.log(`   📸 Dashboard idle: ${dashboardIdlePath}`);
    console.log('   Expected: "Create video" button with helper text below\n');

    await context1.close();

    // Test 2: Ready state (cached export exists)
    console.log('📦 Test 2: Dashboard ready state (cached)\n');

    const context2 = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    const page2 = await context2.newPage();

    await page2.goto('http://localhost:3000/dashboard/test-sharing-1790756204563', {
      waitUntil: 'networkidle'
    });
    await page2.waitForTimeout(2000);

    const dashboardReadyPath = path.join(resultsDir, 'dashboard-ready.png');
    await page2.screenshot({ path: dashboardReadyPath, fullPage: true });
    console.log(`   📸 Dashboard ready: ${dashboardReadyPath}`);
    console.log('   Expected: "Download video" button, no helper text\n');

    await context2.close();

    console.log('✅ Verification complete\n');
    console.log(`📁 Screenshots saved to: ${resultsDir}\n`);
    console.log('Dashboard verification:');
    console.log('1. Helper text should appear below button in column layout');
    console.log('2. Dashboard card should not be stretched by helper text');
    console.log('3. Button should remain styled correctly\n');

  } catch (error: any) {
    console.error('\n❌ Verification failed:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

verifyDashboard().catch(error => {
  console.error('Verification failed:', error);
  process.exit(1);
});
