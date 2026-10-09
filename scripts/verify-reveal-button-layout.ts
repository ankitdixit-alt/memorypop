/**
 * Verify actual reveal page button layout by mocking export status responses
 */

import { chromium } from 'playwright';
import { promises as fs } from 'fs';
import path from 'path';

async function verifyLayout() {
  console.log('📸 Verifying Reveal Page Button Layout\n');

  const browser = await chromium.launch({ headless: true });
  const resultsDir = path.join(process.cwd(), 'test-results', `reveal-layout-${Date.now()}`);
  await fs.mkdir(resultsDir, { recursive: true });

  try {
    // Test case 1: Create video state (idle, no export)
    console.log('📦 Test 1: Create video state (idle)\n');

    const context1 = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    const page1 = await context1.newPage();

    // Mock export request to return pending (simulates "no cached export")
    await page1.route('**/api/export/request', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          jobId: 'mock-job-idle',
          status: 'pending'
        })
      });
    });

    // Mock status check to stay pending
    await page1.route('**/api/export/status*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          jobId: 'mock-job-idle',
          status: 'pending'
        })
      });
    });

    await page1.goto('http://localhost:3000/m/test-sharing-1790756204563/reveal', {
      waitUntil: 'networkidle'
    });
    await page1.waitForTimeout(2000);

    // Try to reach end
    const beginButton1 = page1.locator('button:has-text("Begin reveal")');
    const hasBegin1 = await beginButton1.isVisible({ timeout: 2000 }).catch(() => false);

    if (hasBegin1) {
      await beginButton1.click();
      await page1.waitForTimeout(1000);
      try {
        await page1.waitForSelector('button:has-text("Visit memory wall")', { timeout: 180000 });
      } catch {
        console.log('   ⚠️  Timeout waiting for end');
      }
    }

    await page1.waitForTimeout(1000);

    // Capture Create video state desktop
    const createDesktopPath = path.join(resultsDir, 'create-video-desktop.png');
    await page1.screenshot({ path: createDesktopPath, fullPage: false });
    console.log(`   📸 Desktop Create video: ${createDesktopPath}`);

    // Capture Create video state mobile
    await page1.setViewportSize({ width: 400, height: 800 });
    await page1.waitForTimeout(500);
    const createMobilePath = path.join(resultsDir, 'create-video-mobile.png');
    await page1.screenshot({ path: createMobilePath, fullPage: false });
    console.log(`   📸 Mobile Create video: ${createMobilePath}\n`);

    await context1.close();

    // Test case 2: Processing state
    console.log('📦 Test 2: Processing state\n');

    const context2 = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    const page2 = await context2.newPage();

    // Mock status to return processing
    await page2.route('**/api/export/status*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          jobId: 'mock-job-processing',
          status: 'processing'
        })
      });
    });

    await page2.route('**/api/export/request', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          jobId: 'mock-job-processing',
          status: 'processing'
        })
      });
    });

    await page2.goto('http://localhost:3000/m/test-sharing-1790756204563/reveal', {
      waitUntil: 'networkidle'
    });
    await page2.waitForTimeout(2000);

    const beginButton2 = page2.locator('button:has-text("Begin reveal")');
    const hasBegin2 = await beginButton2.isVisible({ timeout: 2000 }).catch(() => false);

    if (hasBegin2) {
      await beginButton2.click();
      await page2.waitForTimeout(1000);
      try {
        await page2.waitForSelector('button:has-text("Visit memory wall")', { timeout: 180000 });
      } catch {}
    }

    await page2.waitForTimeout(500);

    // Try clicking Create video to trigger processing
    const createBtn = page2.locator('button:has-text("Create video")');
    const hasCreate = await createBtn.isVisible({ timeout: 2000 }).catch(() => false);
    if (hasCreate) {
      await createBtn.click();
      await page2.waitForTimeout(2000);
    }

    const processingDesktopPath = path.join(resultsDir, 'processing-desktop.png');
    await page2.screenshot({ path: processingDesktopPath, fullPage: false });
    console.log(`   📸 Desktop Processing: ${processingDesktopPath}`);

    await page2.setViewportSize({ width: 400, height: 800 });
    await page2.waitForTimeout(500);
    const processingMobilePath = path.join(resultsDir, 'processing-mobile.png');
    await page2.screenshot({ path: processingMobilePath, fullPage: false });
    console.log(`   📸 Mobile Processing: ${processingMobilePath}\n`);

    await context2.close();

    // Test case 3: Download video state (use real cached export)
    console.log('📦 Test 3: Download video state (cached export)\n');

    const context3 = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    const page3 = await context3.newPage();

    await page3.goto('http://localhost:3000/m/test-sharing-1790756204563/reveal', {
      waitUntil: 'networkidle'
    });
    await page3.waitForTimeout(2000);

    const beginButton3 = page3.locator('button:has-text("Begin reveal")');
    const hasBegin3 = await beginButton3.isVisible({ timeout: 2000 }).catch(() => false);

    if (hasBegin3) {
      await beginButton3.click();
      await page3.waitForTimeout(1000);
      try {
        await page3.waitForSelector('button:has-text("Visit memory wall")', { timeout: 180000 });
      } catch {}
    }

    await page3.waitForTimeout(1000);

    // This should show Download video (cached)
    const downloadDesktopPath = path.join(resultsDir, 'download-video-desktop.png');
    await page3.screenshot({ path: downloadDesktopPath, fullPage: false });
    console.log(`   📸 Desktop Download video: ${downloadDesktopPath}`);

    await page3.setViewportSize({ width: 400, height: 800 });
    await page3.waitForTimeout(500);
    const downloadMobilePath = path.join(resultsDir, 'download-video-mobile.png');
    await page3.screenshot({ path: downloadMobilePath, fullPage: false });
    console.log(`   📸 Mobile Download video: ${downloadMobilePath}\n`);

    await context3.close();

    console.log('✅ Verification complete\n');
    console.log(`📁 Screenshots saved to: ${resultsDir}\n`);
    console.log('Verification checklist:');
    console.log('1. All action buttons have consistent height (42px min-height)');
    console.log('2. Helper text appears BELOW the button row, not affecting button heights');
    console.log('3. Desktop buttons stay aligned and centered');
    console.log('4. Mobile layout (400px) wraps naturally');
    console.log('5. "Leave a reaction" remains primary action\n');

  } catch (error: any) {
    console.error('\n❌ Verification failed:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

verifyLayout().catch(error => {
  console.error('Verification failed:', error);
  process.exit(1);
});
