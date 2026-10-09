/**
 * Test export styling without full recording
 */

import { chromium } from 'playwright';

const SHARE_CODE = 'test-sharing-1790756204563';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const REVEAL_URL = `${BASE_URL}/m/${SHARE_CODE}/reveal`;

async function applyExportStyling(page: any): Promise<void> {
  await page.evaluate(() => {
    // Remove navigation and links
    document.querySelectorAll('nav, header, [role="navigation"], a[href*="browse"]').forEach((el: any) => {
      el.remove();
    });

    // Remove all buttons
    document.querySelectorAll('button').forEach((el: any) => {
      el.remove();
    });

    // Remove cookie banners and development badges
    document.querySelectorAll('[class*="cookie"], [id*="cookie"], [class*="banner"], [class*="consent"], [class*="synthetic"], [class*="badge"]').forEach((el: any) => {
      el.remove();
    });

    // Remove ONLY guidance paragraphs, not all paragraphs
    document.querySelectorAll('p').forEach((el: any) => {
      const text = el.textContent || '';
      const isGuidanceText = text.includes('Take your time') ||
                             text.includes('About 1:') ||
                             text.includes('Pause whenever') ||
                             text.includes('Browse memories');

      if (isGuidanceText) {
        el.remove();
      }
    });

    // Remove body margins
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.overflow = 'hidden';

    // Find and maximize reveal stage
    const stage = document.querySelector('[class*="stage"]') ||
                  document.querySelector('main') ||
                  document.querySelector('[class*="reveal"]');

    if (stage instanceof HTMLElement) {
      stage.style.width = '100vw';
      stage.style.height = '100vh';
      stage.style.margin = '0';
      stage.style.padding = '0';
    }
  });
}

async function test() {
  console.log('🧪 Testing export styling...\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();

  await page.goto(REVEAL_URL, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(2000);

  // Click through to first contribution
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

  // Apply export styling
  console.log('🎨 Applying export styling...');
  await applyExportStyling(page);

  console.log('📸 Taking screenshot...');
  await page.screenshot({ path: 'exports/test-styling-before.png', fullPage: true });

  // Wait for contribution to appear
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'exports/test-styling-after.png', fullPage: true });

  const bodyText = await page.evaluate(() => document.body.innerText);
  console.log('\n📄 Visible text sample:');
  console.log(bodyText.substring(0, 500));

  console.log('\n✅ Screenshots saved to exports/');
  console.log('   test-styling-before.png - After clicking through');
  console.log('   test-styling-after.png - After waiting 5s');

  await page.waitForTimeout(10000); // Keep browser open for manual inspection
  await browser.close();
}

test().catch(console.error);
