/**
 * Verify desktop button layout - Create vs Download states
 */

import { chromium } from 'playwright';
import { promises as fs } from 'fs';
import path from 'path';

async function verifyLayout() {
  console.log('📸 Verifying Desktop Button Layout\n');

  const browser = await chromium.launch({ headless: true });
  const resultsDir = path.join(process.cwd(), 'test-results', `layout-verify-${Date.now()}`);
  await fs.mkdir(resultsDir, { recursive: true });

  try {
    // Test both reveal end state and dashboard
    const testCases = [
      {
        name: 'reveal-photo-rich',
        url: 'http://localhost:3000/m/test-sharing-1790756204563/reveal',
        waitForSelector: 'button:has-text("Visit memory wall")',
        description: 'Reveal page end state (photo-rich gift)'
      },
      {
        name: 'reveal-text-only',
        url: 'http://localhost:3000/m/test-plus-final-verified/reveal',
        waitForSelector: 'button:has-text("Visit memory wall")',
        description: 'Reveal page end state (text-only gift)'
      }
    ];

    for (const testCase of testCases) {
      console.log(`📦 ${testCase.description}`);
      console.log(`   URL: ${testCase.url}\n`);

      const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
      });
      const page = await context.newPage();

      // Navigate
      await page.goto(testCase.url, { waitUntil: 'networkidle' });
      await page.waitForTimeout(3000);

      // Check if we need to start reveal
      const beginButton = page.locator('button:has-text("Begin reveal")');
      const hasBegin = await beginButton.isVisible({ timeout: 2000 }).catch(() => false);

      if (hasBegin) {
        console.log('   ⏭️  Starting reveal (will skip to end)...');
        await beginButton.click();
        await page.waitForTimeout(1000);

        // Try to wait for end state
        try {
          await page.waitForSelector(testCase.waitForSelector, { timeout: 180000 });
          console.log('   ✅ Reached end state');
        } catch {
          console.log('   ⚠️  Timeout waiting for end - capturing current state');
        }
      } else {
        console.log('   ⚡ Already at end state');
      }

      await page.waitForTimeout(1000);

      // Capture desktop Create video state
      const createDesktopPath = path.join(resultsDir, `${testCase.name}-create-desktop.png`);
      await page.screenshot({ path: createDesktopPath, fullPage: true });
      console.log(`   📸 Create state: ${createDesktopPath}`);

      // Try to click Create video if visible
      const createBtn = page.locator('button:has-text("Create video")');
      const hasCreate = await createBtn.isVisible({ timeout: 2000 }).catch(() => false);

      if (hasCreate) {
        console.log('   🖱️  Clicking Create video...');
        await createBtn.click();
        await page.waitForTimeout(2000);

        // Capture Download video state
        const downloadDesktopPath = path.join(resultsDir, `${testCase.name}-download-desktop.png`);
        await page.screenshot({ path: downloadDesktopPath, fullPage: true });
        console.log(`   📸 Download state: ${downloadDesktopPath}`);
      } else {
        console.log('   ℹ️  Create video button not found - may already be in Download state');
        const downloadDesktopPath = path.join(resultsDir, `${testCase.name}-download-desktop.png`);
        await page.screenshot({ path: downloadDesktopPath, fullPage: true });
        console.log(`   📸 Current state: ${downloadDesktopPath}`);
      }

      await context.close();
      console.log(`   ✅ Screenshots captured\n`);
    }

    console.log(`✅ Verification complete\n`);
    console.log(`📁 Screenshots saved to: ${resultsDir}\n`);
    console.log('Next steps:');
    console.log('1. Open screenshots and compare button heights');
    console.log('2. Verify neighboring buttons (Leave a reaction, Replay, Visit wall) have consistent height');
    console.log('3. Verify helper text appears below button row\n');

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
