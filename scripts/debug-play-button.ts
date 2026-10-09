/**
 * Debug: Check play button behavior
 */

import { chromium } from 'playwright';
import path from 'path';

const SHARE_CODE = 'test-sharing-1790756204563';
const BASE_URL = 'http://localhost:3000';
const REVEAL_URL = `${BASE_URL}/m/${SHARE_CODE}/reveal`;
const EXPORTS_DIR = path.join(process.cwd(), 'exports');

async function debugPlayButton() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  await page.goto(REVEAL_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Click open button
  const openButton = page.locator('button:has-text("Open My MemoryPop")');
  await openButton.click();
  await page.waitForTimeout(2000);

  await page.screenshot({ path: path.join(EXPORTS_DIR, 'debug-player-loaded.png'), fullPage: true });
  console.log('Screenshot: Player loaded');

  // Check for play buttons
  const buttons = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button')).map(b => ({
      text: b.textContent?.trim().substring(0, 50),
      ariaLabel: b.getAttribute('aria-label'),
      classes: b.className
    }));
  });

  console.log('\nAvailable buttons:');
  buttons.forEach((b, i) => {
    console.log(`  ${i + 1}. "${b.text}" | aria-label: ${b.ariaLabel} | classes: ${b.classes.substring(0, 50)}`);
  });

  // Try clicking "Begin the reveal" if it exists
  try {
    const beginButton = page.locator('button:has-text("Begin the reveal")');
    const count = await beginButton.count();
    console.log(`\n"Begin the reveal" button count: ${count}`);

    if (count > 0) {
      await beginButton.first().click();
      await page.waitForTimeout(5000);
      await page.screenshot({ path: path.join(EXPORTS_DIR, 'debug-after-begin.png'), fullPage: true });
      console.log('Screenshot: After clicking "Begin the reveal"');

      const afterText = await page.evaluate(() => document.body.innerText.substring(0, 300));
      console.log('\nPage text after click:', afterText);
    }
  } catch (error) {
    console.log('Error:', error);
  }

  await browser.close();
}

debugPlayButton().catch(console.error);
