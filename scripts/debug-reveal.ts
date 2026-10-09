/**
 * Debug script to understand reveal start behavior
 */

import { chromium } from 'playwright';

const SHARE_CODE = 'test-sharing-1790756204563';
const BASE_URL = 'http://localhost:3000';
const REVEAL_URL = `${BASE_URL}/m/${SHARE_CODE}/reveal`;

async function debugReveal() {
  console.log('🔍 Debugging reveal start behavior\n');

  const browser = await chromium.launch({ headless: false }); // Non-headless to see what happens
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();

  console.log('Loading page...');
  await page.goto(REVEAL_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  console.log('\nPage state before click:');
  const beforeClick = await page.evaluate(() => {
    const button = document.querySelector('button');
    return {
      buttonExists: !!button,
      buttonText: button?.textContent || 'none',
      buttonVisible: button ? !button.hidden : false,
      bodyClasses: document.body.className,
      hasAudio: !!document.querySelector('audio'),
      audioSrc: document.querySelector('audio')?.src || null,
    };
  });
  console.log(JSON.stringify(beforeClick, null, 2));

  console.log('\nClicking button...');
  const button = page.locator('button:has-text("Open My MemoryPop")');
  await button.click();
  await page.waitForTimeout(3000);

  console.log('\nPage state after click:');
  const afterClick = await page.evaluate(() => {
    const button = document.querySelector('button:has-text("Open My MemoryPop")');
    return {
      buttonStillExists: !!button,
      hasRevealContent: document.body.innerText.includes('Sarah Chen') ||
                       document.body.innerText.includes('Lisa Thompson'),
      imagesCount: document.querySelectorAll('img[src*="unsplash"]').length,
      bodyText: document.body.innerText.substring(0, 200),
      hasAudio: !!document.querySelector('audio'),
      audioPlaying: document.querySelector('audio')?.paused === false,
    };
  });
  console.log(JSON.stringify(afterClick, null, 2));

  console.log('\nWaiting 10 seconds to observe...');
  await page.waitForTimeout(10000);

  console.log('\nPage state after 10 seconds:');
  const after10s = await page.evaluate(() => {
    return {
      bodyText: document.body.innerText.substring(0, 300),
      imagesCount: document.querySelectorAll('img[src*="unsplash"]').length,
      hasContributorContent: document.body.innerText.includes('Sarah Chen') ||
                            document.body.innerText.includes('Lisa Thompson') ||
                            document.body.innerText.includes('Mike Rodriguez'),
    };
  });
  console.log(JSON.stringify(after10s, null, 2));

  console.log('\nPress Ctrl+C to close browser');
  await page.waitForTimeout(60000);

  await browser.close();
}

debugReveal().catch(console.error);
