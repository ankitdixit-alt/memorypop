/**
 * Test audio URL extraction and download
 */

import { chromium } from 'playwright';
import { execSync } from 'child_process';
import path from 'path';

const SHARE_CODE = 'test-sharing-1790756204563';
const BASE_URL = 'http://localhost:3000';
const REVEAL_URL = `${BASE_URL}/m/${SHARE_CODE}/reveal`;

async function testAudioDownload() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(REVEAL_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Extract audio URL
  const audioUrl = await page.evaluate(() => {
    const bodyText = document.body.innerHTML;

    // Match the customMusicUrl from escaped JSON
    // Format in HTML: customMusicUrl\":\"https://...\"
    const match = bodyText.match(/customMusicUrl\\":\\"(https:[^\\]+)\\"/);

    if (match && match[1]) {
      // Clean up escaped forward slashes
      const url = match[1].replace(/\\\//g, '/');

      // Verify it's a valid Supabase storage URL
      if (url.startsWith('https://') && url.includes('.supabase.co/storage')) {
        return url;
      }
    }

    return null;
  });

  await browser.close();

  if (!audioUrl) {
    console.log('❌ No audio URL found');
    return;
  }

  console.log('\nAudio URL:', audioUrl);
  console.log('\nAttempting download with curl...');

  try {
    const output = path.join(process.cwd(), 'exports', 'test-audio.mp3');
    execSync(`curl -v -L "${audioUrl}" -o "${output}"`, { stdio: 'inherit' });
    console.log(`\n✅ Downloaded to: ${output}`);
  } catch (error: any) {
    console.log(`\n❌ Download failed:`, error.message);
  }
}

testAudioDownload().catch(console.error);
