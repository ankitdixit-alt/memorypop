/**
 * Automated Screenshot Script for MemoryPop Mockup Routes
 *
 * Captures all 12 mockup preview routes at exact aspect ratios
 * and saves them to /public/images/mockups/
 *
 * Usage:
 *   npm install -D @playwright/test
 *   node scripts/screenshot-mockups.js
 *
 * Requirements:
 *   - Dev server running at localhost:3000
 *   - Playwright installed
 */

const { chromium } = require('@playwright/test');
const { mkdir } = require('fs/promises');
const { existsSync } = require('fs');
const { join } = require('path');

// Configuration
const BASE_URL = 'http://localhost:3000';
const OUTPUT_DIR = join(__dirname, '..', 'public', 'images', 'mockups');
const WAIT_FOR_LOAD = 2000; // 2 seconds to ensure fonts/gradients loaded

// All mockup routes with their specifications
const mockups = [
  // Birthday routes
  {
    path: '/mockups/birthday-cover',
    filename: 'birthday-cover.png',
    width: 1600,
    height: 1000,
    description: 'Birthday cover (16:10)',
  },
  {
    path: '/mockups/birthday-message',
    filename: 'birthday-message.png',
    width: 800,
    height: 1000,
    description: 'Birthday message card (4:5)',
  },
  {
    path: '/mockups/birthday-photo-grid',
    filename: 'birthday-photo-grid.png',
    width: 800,
    height: 1000,
    description: 'Birthday photo grid (4:5)',
  },
  {
    path: '/mockups/birthday-demo-preview',
    filename: 'birthday-demo-preview.png',
    width: 1920,
    height: 1080,
    description: 'Birthday demo preview (16:9)',
  },

  // Retirement routes
  {
    path: '/mockups/retirement-cover',
    filename: 'retirement-cover.png',
    width: 1600,
    height: 1000,
    description: 'Retirement cover (16:10)',
  },
  {
    path: '/mockups/retirement-message',
    filename: 'retirement-message.png',
    width: 800,
    height: 1000,
    description: 'Retirement message card (4:5)',
  },
  {
    path: '/mockups/retirement-timeline',
    filename: 'retirement-timeline.png',
    width: 800,
    height: 1000,
    description: 'Retirement timeline (4:5)',
  },
  {
    path: '/mockups/retirement-demo-preview',
    filename: 'retirement-demo-preview.png',
    width: 1920,
    height: 1080,
    description: 'Retirement demo preview (16:9)',
  },

  // Farewell routes
  {
    path: '/mockups/farewell-cover',
    filename: 'farewell-cover.png',
    width: 1600,
    height: 1000,
    description: 'Farewell cover (16:10)',
  },
  {
    path: '/mockups/farewell-message',
    filename: 'farewell-message.png',
    width: 800,
    height: 1000,
    description: 'Farewell message card (4:5)',
  },
  {
    path: '/mockups/farewell-memory-collection',
    filename: 'farewell-memory-collection.png',
    width: 800,
    height: 1000,
    description: 'Farewell memory collection (4:5)',
  },
  {
    path: '/mockups/farewell-demo-preview',
    filename: 'farewell-demo-preview.png',
    width: 1920,
    height: 1080,
    description: 'Farewell demo preview (16:9)',
  },
];

/**
 * Check if dev server is running
 */
async function checkServer() {
  try {
    const response = await fetch(BASE_URL);
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Main screenshot capture function
 */
async function captureScreenshots() {
  console.log('🎨 MemoryPop Mockup Screenshot Script\n');

  // Check if dev server is running
  console.log('Checking dev server...');
  const serverRunning = await checkServer();
  if (!serverRunning) {
    console.error('❌ Dev server not running at', BASE_URL);
    console.error('   Please start it with: npm run dev');
    process.exit(1);
  }
  console.log('✅ Dev server is running\n');

  // Create output directory if it doesn't exist
  if (!existsSync(OUTPUT_DIR)) {
    console.log('Creating output directory:', OUTPUT_DIR);
    await mkdir(OUTPUT_DIR, { recursive: true });
  }

  // Launch browser
  console.log('Launching browser...');
  const browser = await chromium.launch({
    headless: true,
  });

  const context = await browser.newContext({
    deviceScaleFactor: 2, // 2x resolution for retina displays
  });

  const page = await context.newPage();

  // Capture each mockup
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < mockups.length; i++) {
    const mockup = mockups[i];
    const progress = `[${i + 1}/${mockups.length}]`;

    try {
      console.log(`${progress} Capturing ${mockup.description}...`);

      // Set viewport
      await page.setViewportSize({
        width: mockup.width,
        height: mockup.height,
      });

      // Navigate to route
      const url = `${BASE_URL}${mockup.path}`;
      await page.goto(url, {
        waitUntil: 'networkidle',
        timeout: 10000,
      });

      // Wait for fonts and gradients to load
      await page.waitForTimeout(WAIT_FOR_LOAD);

      // Take screenshot
      const outputPath = join(OUTPUT_DIR, mockup.filename);
      await page.screenshot({
        path: outputPath,
        fullPage: false,
        type: 'png',
      });

      console.log(`    ✅ Saved: ${mockup.filename}`);
      successCount++;
    } catch (error) {
      console.error(`    ❌ Failed: ${mockup.filename}`);
      console.error(`       Error: ${error.message}`);
      failCount++;
    }
  }

  // Cleanup
  await browser.close();

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Screenshot Summary');
  console.log('='.repeat(50));
  console.log(`✅ Successful: ${successCount}/${mockups.length}`);
  if (failCount > 0) {
    console.log(`❌ Failed: ${failCount}/${mockups.length}`);
  }
  console.log(`📁 Output directory: ${OUTPUT_DIR}`);
  console.log('='.repeat(50));

  if (failCount > 0) {
    console.log('\n⚠️  Some screenshots failed. Check errors above.');
    process.exit(1);
  } else {
    console.log('\n🎉 All screenshots captured successfully!');
    console.log('\nNext steps:');
    console.log('1. Verify screenshots in /public/images/mockups/');
    console.log('2. Replace placeholder divs in landing pages');
    console.log('3. See .pipeline/mockup-screenshot-guide.md for integration code');
  }
}

// Run the script
captureScreenshots().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
