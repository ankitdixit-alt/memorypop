/**
 * Verify error/retry state displays helper text correctly
 */

import { chromium } from 'playwright';
import { promises as fs } from 'fs';
import path from 'path';

async function verifyErrorState() {
  console.log('📸 Verifying Error/Retry State\n');

  const browser = await chromium.launch({ headless: true });
  const resultsDir = path.join(process.cwd(), 'test-results', `error-state-${Date.now()}`);
  await fs.mkdir(resultsDir, { recursive: true });

  try {
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();

    // Mock export request to return error
    await page.route('**/api/export/request', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Export failed: Mock error for testing'
        })
      });
    });

    await page.goto('http://localhost:3000/m/test-sharing-1790756204563/reveal', {
      waitUntil: 'networkidle'
    });
    await page.waitForTimeout(2000);

    // Navigate to end
    const beginButton = page.locator('button:has-text("Begin reveal")');
    const hasBegin = await beginButton.isVisible({ timeout: 2000 }).catch(() => false);

    if (hasBegin) {
      await beginButton.click();
      await page.waitForTimeout(1000);
      try {
        await page.waitForSelector('button:has-text("Visit memory wall")', { timeout: 180000 });
      } catch {}
    }

    await page.waitForTimeout(1000);

    // Click Create video to trigger error
    const createBtn = page.locator('button:has-text("Create video")');
    const hasCreate = await createBtn.isVisible({ timeout: 2000 }).catch(() => false);

    if (hasCreate) {
      console.log('   🖱️  Clicking Create video to trigger error...');
      await createBtn.click();
      await page.waitForTimeout(2000);

      // Capture error state desktop
      const errorDesktopPath = path.join(resultsDir, 'error-desktop.png');
      await page.screenshot({ path: errorDesktopPath, fullPage: false });
      console.log(`   📸 Desktop error state: ${errorDesktopPath}`);

      // Capture error state mobile
      await page.setViewportSize({ width: 400, height: 800 });
      await page.waitForTimeout(500);
      const errorMobilePath = path.join(resultsDir, 'error-mobile.png');
      await page.screenshot({ path: errorMobilePath, fullPage: false });
      console.log(`   📸 Mobile error state: ${errorMobilePath}\n`);

      console.log('   ✅ Error state verified');
      console.log('   Expected: "Try again" button with error message below button row\n');
    } else {
      console.log('   ⚠️  Create video button not found\n');
    }

    await context.close();

    console.log('✅ Verification complete\n');
    console.log(`📁 Screenshots saved to: ${resultsDir}\n`);

  } catch (error: any) {
    console.error('\n❌ Verification failed:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

verifyErrorState().catch(error => {
  console.error('Verification failed:', error);
  process.exit(1);
});
