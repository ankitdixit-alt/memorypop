/**
 * Debug: Screenshot reveal at key moments
 */

import { chromium } from 'playwright';
import path from 'path';

const SHARE_CODE = 'test-sharing-1790756204563';
const BASE_URL = 'http://localhost:3000';
const REVEAL_URL = `${BASE_URL}/m/${SHARE_CODE}/reveal`;
const EXPORTS_DIR = path.join(process.cwd(), 'exports');

async function debugWithScreenshots() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  console.log('Loading page...');
  await page.goto(REVEAL_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Screenshot 1: Initial state
  await page.screenshot({ path: path.join(EXPORTS_DIR, 'debug-1-initial.png'), fullPage: true });
  console.log('Screenshot 1: Initial state');

  // Get page info
  const initial = await page.evaluate(() => ({
    title: document.title,
    url: window.location.href,
    bodyText: document.body.innerText.substring(0, 300)
  }));
  console.log('Initial state:', JSON.stringify(initial, null, 2));

  // Click button
  console.log('\nClicking button...');
  const button = page.locator('button:has-text("Open My MemoryPop")');
  await button.click();
  await page.waitForTimeout(3000);

  // Screenshot 2: After click
  await page.screenshot({ path: path.join(EXPORTS_DIR, 'debug-2-after-click.png'), fullPage: true });
  console.log('Screenshot 2: After button click');

  const afterClick = await page.evaluate(() => ({
    url: window.location.href,
    bodyText: document.body.innerText.substring(0, 300)
  }));
  console.log('After click:', JSON.stringify(afterClick, null, 2));

  // Wait and screenshot again
  await page.waitForTimeout(10000);
  await page.screenshot({ path: path.join(EXPORTS_DIR, 'debug-3-after-10s.png'), fullPage: true });
  console.log('Screenshot 3: After 10 seconds');

  const after10s = await page.evaluate(() => ({
    bodyText: document.body.innerText.substring(0, 300)
  }));
  console.log('After 10s:', JSON.stringify(after10s, null, 2));

  await browser.close();
  console.log('\nScreenshots saved to:', EXPORTS_DIR);
}

debugWithScreenshots().catch(console.error);
