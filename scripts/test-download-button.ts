/**
 * Test download button flow with actual browser interaction
 * Assumes exports are already completed (run API requests first)
 */

import { chromium } from 'playwright';
import { promises as fs } from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const TEST_GIFTS = [
  {
    name: 'photo-rich',
    shareCode: 'test-sharing-1790756204563',
    dashboardUrl: 'http://localhost:3000/dashboard/test-sharing-1790756204563',
    expectedFilename: /test-user-birthday-reveal\.mp4$/i
  },
  {
    name: 'text-only',
    shareCode: 'test-plus-final-verified',
    dashboardUrl: 'http://localhost:3000/dashboard/test-plus-final-verified',
    expectedFilename: /final-verification-test-birthday-reveal\.mp4$/i
  }
];

async function testDownloadButton() {
  console.log('🎬 Testing Download Button Flow\n');

  const browser = await chromium.launch({ headless: true });
  const resultsDir = path.join(process.cwd(), 'test-results', `download-test-${Date.now()}`);
  await fs.mkdir(resultsDir, { recursive: true });

  try {
    for (const gift of TEST_GIFTS) {
      console.log(`\n📦 Testing: ${gift.name} (${gift.shareCode})`);
      console.log(`   URL: ${gift.dashboardUrl}\n`);

      const context = await browser.newContext({
        acceptDownloads: true,
        viewport: { width: 1920, height: 1080 }
      });
      const page = await context.newPage();

      // Navigate to dashboard where download button should be visible
      await page.goto(gift.dashboardUrl, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);

      // Look for Download video button (export should be cached/ready)
      const downloadButton = page.locator('button:has-text("Download video")');
      const createButton = page.locator('button:has-text("Create video")');

      // Check which button is visible
      const hasDownload = await downloadButton.isVisible({ timeout: 5000 }).catch(() => false);
      const hasCreate = await createButton.isVisible({ timeout: 5000 }).catch(() => false);

      if (!hasDownload && !hasCreate) {
        throw new Error('❌ No download button found (neither Create nor Download)');
      }

      if (hasDownload) {
        console.log('   ⚡ Export already ready - Download video button visible');

        // Screenshot Download video button state
        const downloadScreenshot = path.join(resultsDir, `${gift.name}-download-ready-desktop.png`);
        await page.screenshot({ path: downloadScreenshot, fullPage: true });
        console.log(`   📸 Screenshot (Download ready): ${downloadScreenshot}`);

      } else {
        console.log('   📸 Create video button visible');

        // Screenshot Create video button state
        const createScreenshot = path.join(resultsDir, `${gift.name}-create-button-desktop.png`);
        await page.screenshot({ path: createScreenshot, fullPage: true });
        console.log(`   📸 Screenshot (Create button): ${createScreenshot}`);

        // Click Create video and wait for it to become Download video
        console.log('   🖱️  Clicking Create video...');
        await createButton.click();
        await page.waitForTimeout(1500);

        // Should immediately show Download video (cached)
        await downloadButton.waitFor({ timeout: 5000 });
        console.log('   ⚡ Transitioned to Download video');

        const downloadScreenshot = path.join(resultsDir, `${gift.name}-download-ready-desktop.png`);
        await page.screenshot({ path: downloadScreenshot, fullPage: true });
        console.log(`   📸 Screenshot (Download ready): ${downloadScreenshot}`);
      }

      // Start download
      console.log('   🖱️  Clicking Download video...');
      const downloadPromise = page.waitForEvent('download', { timeout: 10000 });
      await downloadButton.click();
      const download = await downloadPromise;

      // Check suggested filename
      const suggestedFilename = download.suggestedFilename();
      console.log(`   📝 Suggested filename: ${suggestedFilename}`);

      // Verify filename ends with .mp4
      if (!suggestedFilename.endsWith('.mp4')) {
        throw new Error(`❌ Filename does NOT end with .mp4: ${suggestedFilename}`);
      }
      console.log('   ✅ Filename ends with .mp4');

      // Verify filename matches expected pattern
      if (!gift.expectedFilename.test(suggestedFilename)) {
        console.log(`   ⚠️  Warning: Filename "${suggestedFilename}" doesn't match expected pattern ${gift.expectedFilename}`);
      } else {
        console.log('   ✅ Filename matches expected pattern');
      }

      // Save with suggested filename (don't append .mp4 manually)
      const downloadPath = path.join(resultsDir, suggestedFilename);
      await download.saveAs(downloadPath);
      console.log(`   💾 Downloaded to: ${downloadPath}`);

      // Verify file exists and is not empty
      const stats = await fs.stat(downloadPath);
      if (stats.size === 0) {
        throw new Error('❌ Downloaded file is empty');
      }
      console.log(`   ✅ File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

      // Verify video decodes (check with ffprobe)
      console.log('   🔍 Verifying video decodes...');
      try {
        const { stdout } = await execAsync(
          `ffprobe -v error -show_entries format=duration:stream=codec_name,width,height -of default=noprint_wrappers=1 "${downloadPath}"`
        );

        const hasH264 = stdout.includes('codec_name=h264');
        const hasAAC = stdout.includes('codec_name=aac');
        const has1920x1080 = stdout.includes('width=1920') && stdout.includes('height=1080');

        if (!hasH264 || !hasAAC || !has1920x1080) {
          throw new Error('❌ Video format incorrect');
        }

        console.log('   ✅ Video decodes correctly (H.264, AAC, 1920×1080)');
      } catch (error: any) {
        throw new Error(`❌ Video decode failed: ${error.message}`);
      }

      // Test mobile viewport
      console.log('   📱 Testing mobile viewport...');
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(500);

      const mobileScreenshot = path.join(resultsDir, `${gift.name}-download-mobile.png`);
      await page.screenshot({ path: mobileScreenshot, fullPage: true });
      console.log(`   📸 Screenshot (mobile): ${mobileScreenshot}`);

      await context.close();
      console.log(`   ✅ Test passed for ${gift.name}\n`);
    }

    console.log('\n✅ All tests passed!\n');
    console.log(`📁 Results saved to: ${resultsDir}\n`);

  } catch (error: any) {
    console.error('\n❌ Test failed:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

// Run test
testDownloadButton().catch(error => {
  console.error('Test suite failed:', error);
  process.exit(1);
});
