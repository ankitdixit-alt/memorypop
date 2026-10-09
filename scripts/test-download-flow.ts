/**
 * Test complete download button flow with browser automation
 */

import { chromium } from 'playwright';
import { promises as fs } from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function testDownloadFlow() {
  console.log('🎬 Testing Download Button Flow\n');

  const browser = await chromium.launch({ headless: true });
  const resultsDir = path.join(process.cwd(), 'test-results', `download-flow-${Date.now()}`);
  await fs.mkdir(resultsDir, { recursive: true });

  try {
    // Test 1: Reveal page with photo-rich gift
    console.log('📦 Test 1: Photo-rich gift reveal page\n');

    const context1 = await browser.newContext({
      acceptDownloads: true,
      viewport: { width: 1920, height: 1080 }
    });
    const page1 = await context1.newPage();

    // Navigate directly to reveal page
    console.log('   Loading reveal page...');
    await page1.goto('http://localhost:3000/m/test-sharing-1790756204563/reveal', {
      waitUntil: 'networkidle'
    });

    // Wait for the page to load
    await page1.waitForTimeout(2000);

    // Check if we're at the beginning or end of reveal
    const beginButton = page1.locator('button:has-text("Begin reveal")');
    const createButton = page1.locator('button:has-text("Create video")');
    const downloadButton = page1.locator('button:has-text("Download video")');

    const hasBegin = await beginButton.isVisible({ timeout: 2000 }).catch(() => false);
    const hasCreate = await createButton.isVisible({ timeout: 2000 }).catch(() => false);
    const hasDownload = await downloadButton.isVisible({ timeout: 2000 }).catch(() => false);

    console.log(`   State: begin=${hasBegin}, create=${hasCreate}, download=${hasDownload}`);

    if (hasBegin) {
      console.log('   Starting reveal...');
      await beginButton.click();
      await page1.waitForTimeout(1000);

      // Fast-forward to end by seeking in player or waiting
      // For now, just wait for end actions to appear
      console.log('   Waiting for reveal to complete (or skip to end)...');

      // Try clicking through to end or wait for end actions
      // Look for "Visit memory wall" button which appears at the end
      await page1.waitForSelector('button:has-text("Visit memory wall")', { timeout: 180000 });
      console.log('   ✅ Reached end of reveal');
    } else if (hasCreate || hasDownload) {
      console.log('   ⚡ Already at end actions');
    } else {
      console.log('   ⚠️  Unexpected state, taking screenshot');
      await page1.screenshot({ path: path.join(resultsDir, 'unexpected-state.png'), fullPage: true });
    }

    // Screenshot desktop Create video button state
    await page1.waitForTimeout(500);
    const createDesktopPath = path.join(resultsDir, 'photo-rich-create-desktop.png');
    await page1.screenshot({ path: createDesktopPath, fullPage: true });
    console.log(`   📸 Desktop screenshot: ${createDesktopPath}`);

    // Screenshot mobile Create video button state
    await page1.setViewportSize({ width: 375, height: 667 });
    await page1.waitForTimeout(500);
    const createMobilePath = path.join(resultsDir, 'photo-rich-create-mobile.png');
    await page1.screenshot({ path: createMobilePath, fullPage: true });
    console.log(`   📸 Mobile screenshot: ${createMobilePath}`);

    // Back to desktop
    await page1.setViewportSize({ width: 1920, height: 1080 });
    await page1.waitForTimeout(500);

    // Click Create video
    const createBtn = page1.locator('button:has-text("Create video")');
    const hasCreateBtn = await createBtn.isVisible({ timeout: 2000 }).catch(() => false);

    if (hasCreateBtn) {
      console.log('   🖱️  Clicking Create video...');
      await createBtn.click();
      await page1.waitForTimeout(1500);

      // Should transition to Download video (cached)
      const downloadBtn = page1.locator('button:has-text("Download video")');
      await downloadBtn.waitFor({ timeout: 5000 });
      console.log('   ⚡ Transitioned to Download video');
    } else {
      console.log('   ℹ️  Already showing Download video');
    }

    // Screenshot desktop Download video state
    const downloadDesktopPath = path.join(resultsDir, 'photo-rich-download-desktop.png');
    await page1.screenshot({ path: downloadDesktopPath, fullPage: true });
    console.log(`   📸 Desktop (Download): ${downloadDesktopPath}`);

    // Screenshot mobile Download video state
    await page1.setViewportSize({ width: 375, height: 667 });
    await page1.waitForTimeout(500);
    const downloadMobilePath = path.join(resultsDir, 'photo-rich-download-mobile.png');
    await page1.screenshot({ path: downloadMobilePath, fullPage: true });
    console.log(`   📸 Mobile (Download): ${downloadMobilePath}`);

    // Back to desktop for download
    await page1.setViewportSize({ width: 1920, height: 1080 });
    await page1.waitForTimeout(500);

    // Intercept download request to get jobId
    console.log('   🖱️  Clicking Download video...');
    const downloadBtn = page1.locator('button:has-text("Download video")');

    let downloadJobId: string | null = null;
    page1.on('request', (request) => {
      const url = request.url();
      if (url.includes('/api/export/download?jobId=')) {
        const match = url.match(/jobId=([a-f0-9-]+)/);
        if (match) {
          downloadJobId = match[1];
        }
      }
    });

    await downloadBtn.click();
    await page1.waitForTimeout(2000);

    if (!downloadJobId) {
      throw new Error('❌ Download request not intercepted');
    }

    console.log(`   📝 Download request sent for jobId: ${downloadJobId}`);

    // Verify filename via HTTP headers
    const { stdout: headersOutput } = await execAsync(
      `curl -s -I "http://localhost:3000/api/export/download?jobId=${downloadJobId}" | grep -i "content-disposition"`
    );

    const filenameMatch = headersOutput.match(/filename="([^"]+)"/);
    if (!filenameMatch) {
      throw new Error('❌ Could not extract filename from Content-Disposition header');
    }

    const suggestedFilename = filenameMatch[1];
    console.log(`   📝 Server filename: ${suggestedFilename}`);

    // STRICT assertion: must end with .mp4
    if (!suggestedFilename.endsWith('.mp4')) {
      throw new Error(`❌ FAILED: Filename does NOT end with .mp4: ${suggestedFilename}`);
    }
    console.log('   ✅ Filename ends with .mp4');

    // STRICT assertion: must match expected pattern
    if (!/test-user-birthday-reveal\.mp4$/i.test(suggestedFilename)) {
      throw new Error(`❌ FAILED: Filename does not match expected pattern: ${suggestedFilename}`);
    }
    console.log('   ✅ Filename matches expected pattern');

    // Download the actual file
    const downloadPath1 = path.join(resultsDir, suggestedFilename);
    await execAsync(
      `curl -s "http://localhost:3000/api/export/download?jobId=${downloadJobId}" -o "${downloadPath1}"`
    );
    console.log(`   💾 Downloaded to: ${downloadPath1}`);

    // Verify file
    const stats1 = await fs.stat(downloadPath1);
    console.log(`   ✅ File size: ${(stats1.size / 1024 / 1024).toFixed(2)} MB`);

    // Verify video format
    const { stdout: probe1 } = await execAsync(
      `ffprobe -v error -show_entries format=duration:stream=codec_name,width,height -of default=noprint_wrappers=1 "${downloadPath1}"`
    );

    if (!probe1.includes('codec_name=h264') || !probe1.includes('codec_name=aac') ||
        !probe1.includes('width=1920') || !probe1.includes('height=1080')) {
      throw new Error('❌ Video format incorrect');
    }
    console.log('   ✅ Video decodes correctly (H.264, AAC, 1920×1080)\n');

    await context1.close();

    // Test 2: Text-only gift
    console.log('📦 Test 2: Text-only gift\n');

    const context2 = await browser.newContext({
      acceptDownloads: true,
      viewport: { width: 1920, height: 1080 }
    });
    const page2 = await context2.newPage();

    console.log('   Loading reveal page...');
    await page2.goto('http://localhost:3000/m/test-plus-final-verified/reveal', {
      waitUntil: 'networkidle'
    });
    await page2.waitForTimeout(2000);

    // Check state
    const beginButton2 = page2.locator('button:has-text("Begin reveal")');
    const hasBegin2 = await beginButton2.isVisible({ timeout: 2000 }).catch(() => false);

    if (hasBegin2) {
      console.log('   Starting reveal...');
      await beginButton2.click();
      await page2.waitForTimeout(1000);
      console.log('   Waiting for reveal to complete...');
      await page2.waitForSelector('button:has-text("Visit memory wall")', { timeout: 180000 });
      console.log('   ✅ Reached end of reveal');
    } else {
      console.log('   ⚡ Already at end actions');
    }

    // Click Create video
    await page2.waitForTimeout(500);
    const createBtn2 = page2.locator('button:has-text("Create video")');
    const hasCreateBtn2 = await createBtn2.isVisible({ timeout: 2000 }).catch(() => false);

    if (hasCreateBtn2) {
      console.log('   🖱️  Clicking Create video...');
      await createBtn2.click();
      await page2.waitForTimeout(1500);
    }

    // Download
    console.log('   🖱️  Clicking Download video...');
    const downloadBtn2 = page2.locator('button:has-text("Download video")');
    await downloadBtn2.waitFor({ timeout: 5000 });

    let downloadJobId2: string | null = null;
    page2.on('request', (request) => {
      const url = request.url();
      if (url.includes('/api/export/download?jobId=')) {
        const match = url.match(/jobId=([a-f0-9-]+)/);
        if (match) {
          downloadJobId2 = match[1];
        }
      }
    });

    await downloadBtn2.click();
    await page2.waitForTimeout(2000);

    if (!downloadJobId2) {
      throw new Error('❌ Download request not intercepted');
    }

    console.log(`   📝 Download request sent for jobId: ${downloadJobId2}`);

    // Verify filename via HTTP headers
    const { stdout: headersOutput2 } = await execAsync(
      `curl -s -I "http://localhost:3000/api/export/download?jobId=${downloadJobId2}" | grep -i "content-disposition"`
    );

    const filenameMatch2 = headersOutput2.match(/filename="([^"]+)"/);
    if (!filenameMatch2) {
      throw new Error('❌ Could not extract filename from Content-Disposition header');
    }

    const suggestedFilename2 = filenameMatch2[1];
    console.log(`   📝 Server filename: ${suggestedFilename2}`);

    // STRICT assertions
    if (!suggestedFilename2.endsWith('.mp4')) {
      throw new Error(`❌ FAILED: Filename does NOT end with .mp4: ${suggestedFilename2}`);
    }
    console.log('   ✅ Filename ends with .mp4');

    if (!/final-verification-test-birthday-reveal\.mp4$/i.test(suggestedFilename2)) {
      throw new Error(`❌ FAILED: Filename does not match expected pattern: ${suggestedFilename2}`);
    }
    console.log('   ✅ Filename matches expected pattern');

    const downloadPath2 = path.join(resultsDir, suggestedFilename2);
    await execAsync(
      `curl -s "http://localhost:3000/api/export/download?jobId=${downloadJobId2}" -o "${downloadPath2}"`
    );
    console.log(`   💾 Downloaded to: ${downloadPath2}`);

    const stats2 = await fs.stat(downloadPath2);
    console.log(`   ✅ File size: ${(stats2.size / 1024 / 1024).toFixed(2)} MB`);

    const { stdout: probe2 } = await execAsync(
      `ffprobe -v error -show_entries format=duration:stream=codec_name,width,height -of default=noprint_wrappers=1 "${downloadPath2}"`
    );

    if (!probe2.includes('codec_name=h264') || !probe2.includes('codec_name=aac') ||
        !probe2.includes('width=1920') || !probe2.includes('height=1080')) {
      throw new Error('❌ Video format incorrect');
    }
    console.log('   ✅ Video decodes correctly (H.264, AAC, 1920×1080)\n');

    await context2.close();

    console.log('\n✅ All tests passed!\n');
    console.log(`📁 Results saved to: ${resultsDir}\n`);
    console.log('Downloaded files:');
    console.log(`  - ${suggestedFilename}`);
    console.log(`  - ${suggestedFilename2}\n`);

  } catch (error: any) {
    console.error('\n❌ Test failed:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

testDownloadFlow().catch(error => {
  console.error('Test suite failed:', error);
  process.exit(1);
});
