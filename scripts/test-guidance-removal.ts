/**
 * Debug guidance text removal
 */

import { chromium } from 'playwright';

const SHARE_CODE = 'test-sharing-1790756204563';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const REVEAL_URL = `${BASE_URL}/m/${SHARE_CODE}/reveal`;

async function test() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  await page.goto(REVEAL_URL, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(2000);

  // Click through
  const openButton = page.locator('text=Open My MemoryPop');
  if (await openButton.isVisible({ timeout: 5000 })) {
    await openButton.click();
    await page.waitForTimeout(1000);
  }

  const beginButton = page.locator('text=Begin the reveal');
  if (await beginButton.isVisible({ timeout: 5000 })) {
    await beginButton.click();
    await page.waitForTimeout(3000);
  }

  // Find elements with guidance text
  const elements = await page.evaluate(() => {
    const results: any[] = [];
    document.querySelectorAll('*').forEach(el => {
      const text = el.textContent || '';
      if (text.includes('Take your time') || text.includes('About 1:04')) {
        const element = el as HTMLElement;
        results.push({
          tag: element.tagName.toLowerCase(),
          className: element.className,
          id: element.id,
          text: text.substring(0, 150),
          hasClass: !!element.className,
        });
      }
    });
    return results.slice(0, 10); // First 10 matches
  });

  console.log('\n🔍 Elements containing guidance text:');
  elements.forEach((el, i) => {
    console.log(`\n${i + 1}. <${el.tag}> ${el.className ? `class="${el.className}"` : ''} ${el.id ? `id="${el.id}"` : ''}`);
    console.log(`   Text: "${el.text}"`);
  });

  await page.waitForTimeout(5000);
  await browser.close();
}

test().catch(console.error);
