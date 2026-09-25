/**
 * User Flow Capture Script
 * Captures screenshots of the complete MemoryPop user journey
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'http://localhost:3000';
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');

// Ensure screenshots directory exists
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function captureUserFlow() {
  console.log('🎬 Starting MemoryPop user flow capture...\n');

  const browser = await chromium.launch({
    headless: false, // Show browser for visibility
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });

  const page = await context.newPage();

  const screenshots = [];
  let stepNumber = 1;

  async function captureScreen(name, description) {
    const filename = `${String(stepNumber).padStart(2, '0')}-${name}.png`;
    const filepath = path.join(SCREENSHOTS_DIR, filename);

    console.log(`📸 Step ${stepNumber}: ${description}`);

    // Wait a moment for any animations
    await page.waitForTimeout(1000);

    // Take full page screenshot
    await page.screenshot({
      path: filepath,
      fullPage: true
    });

    screenshots.push({
      step: stepNumber,
      name,
      description,
      filename,
      url: page.url()
    });

    stepNumber++;
  }

  try {
    // Step 1: Homepage
    console.log(`\n🌐 Navigating to ${BASE_URL}\n`);
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await captureScreen('home', 'Landing page - Hero section with primary CTA');

    // Scroll to see "How it works"
    await page.evaluate(() => window.scrollTo(0, 800));
    await page.waitForTimeout(500);
    await captureScreen('home-how-it-works', 'How it works section');

    // Scroll to see Occasions
    await page.evaluate(() => window.scrollTo(0, 1600));
    await page.waitForTimeout(500);
    await captureScreen('home-occasions', 'Occasions grid');

    // Scroll to see Why MemoryPop
    await page.evaluate(() => window.scrollTo(0, 2400));
    await page.waitForTimeout(500);
    await captureScreen('home-why', 'Why people love MemoryPop section');

    // Scroll back to top
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);

    // Step 2: Click "Start a MemoryPop"
    console.log('\n🖱️  Clicking "Start a MemoryPop"\n');
    await page.click('a[href="/create"]');
    await page.waitForLoadState('networkidle');
    await captureScreen('create-occasion', 'Occasion selection step');

    // Try to interact with the form
    // Check if there are occasion buttons
    const occasionButtons = await page.$$('button[data-occasion], .occasion-card, [role="radio"]');

    if (occasionButtons.length > 0) {
      console.log(`\n📋 Found ${occasionButtons.length} occasion options\n`);

      // Click the first occasion (likely Birthday)
      await occasionButtons[0].click();
      await page.waitForTimeout(1000);
      await captureScreen('create-occasion-selected', 'Occasion selected');

      // Look for a "Next" or "Continue" button
      const nextButton = await page.$('button:has-text("Next"), button:has-text("Continue"), button[type="submit"]');
      if (nextButton) {
        await nextButton.click();
        await page.waitForTimeout(1500);
        await captureScreen('create-recipient', 'Recipient information step');
      }
    }

    // Try to find input fields and fill them
    const nameInput = await page.$('input[name="recipientName"], input[placeholder*="name" i], input[id*="name"]');
    if (nameInput) {
      await nameInput.fill('Emma Johnson');
      await page.waitForTimeout(500);
      await captureScreen('create-recipient-filled', 'Recipient name entered');
    }

    // Look for date picker or additional fields
    const dateInput = await page.$('input[type="date"], input[name*="date"], input[placeholder*="date" i]');
    if (dateInput) {
      await dateInput.fill('2026-10-15');
      await page.waitForTimeout(500);
      await captureScreen('create-date-selected', 'Date selected');
    }

    // Try to proceed to next step
    const continueButton = await page.$('button:has-text("Next"), button:has-text("Continue"), button[type="submit"]:not([disabled])');
    if (continueButton) {
      await continueButton.click();
      await page.waitForTimeout(1500);
      await captureScreen('create-story', 'Story/message step');
    }

    // Try to find a textarea for story/message
    const storyTextarea = await page.$('textarea, input[type="text"][name*="message"], input[type="text"][name*="story"]');
    if (storyTextarea) {
      await storyTextarea.fill('Emma is turning 30 and we want to celebrate with a special surprise! She loves travel, photography, and spending time with friends and family.');
      await page.waitForTimeout(500);
      await captureScreen('create-story-filled', 'Story entered');
    }

    // Try to upload a photo
    const photoInput = await page.$('input[type="file"]');
    if (photoInput) {
      await captureScreen('create-photo-upload', 'Photo upload interface');
    }

    // Try final submit
    const submitButton = await page.$('button:has-text("Create"), button:has-text("Generate"), button:has-text("Finish"), button[type="submit"]:not([disabled])');
    if (submitButton) {
      await captureScreen('create-ready-to-submit', 'Form ready for submission');

      // Note: We won't actually submit to avoid creating test data
      console.log('\n⚠️  Stopping before actual submission to avoid creating test data\n');
    }

    // Try to navigate to demo if available
    console.log('\n🎭 Checking for demo experience...\n');
    await page.goto(`${BASE_URL}/demo`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const isDemoPage = await page.$('text=/demo|experience|preview/i');
    if (isDemoPage || page.url().includes('/demo')) {
      await captureScreen('demo-experience', 'Demo MemoryPop experience');

      // Scroll through demo
      await page.evaluate(() => window.scrollTo(0, 800));
      await page.waitForTimeout(500);
      await captureScreen('demo-messages', 'Demo messages section');

      await page.evaluate(() => window.scrollTo(0, 1600));
      await page.waitForTimeout(500);
      await captureScreen('demo-photos', 'Demo photos section');
    } else {
      console.log('⚠️  Demo page not available or not accessible\n');
    }

    // Try to check if there's a reveal experience we can access
    console.log('\n🎁 Checking for reveal experience...\n');

    // Check if there are any test share codes in the app
    const revealPaths = await page.evaluate(() => {
      // Look for any links that might be reveal links
      const links = Array.from(document.querySelectorAll('a[href*="/m/"]'));
      return links.map(l => l.getAttribute('href')).filter(Boolean);
    });

    if (revealPaths.length > 0) {
      console.log(`Found ${revealPaths.length} potential reveal links\n`);
      const firstReveal = revealPaths[0];
      await page.goto(`${BASE_URL}${firstReveal}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1500);
      await captureScreen('reveal-landing', 'Reveal experience landing');

      // Click reveal button if present
      const revealButton = await page.$('button:has-text("Reveal"), button:has-text("Open"), button:has-text("View")');
      if (revealButton) {
        await revealButton.click();
        await page.waitForTimeout(2000);
        await captureScreen('reveal-experience', 'Reveal animation/experience');

        await page.evaluate(() => window.scrollTo(0, 800));
        await page.waitForTimeout(500);
        await captureScreen('reveal-content', 'Revealed content');
      }
    }

    console.log('\n✅ User flow capture complete!\n');
    console.log(`📁 ${screenshots.length} screenshots saved to: ${SCREENSHOTS_DIR}\n`);

    // Save metadata
    fs.writeFileSync(
      path.join(SCREENSHOTS_DIR, 'flow-metadata.json'),
      JSON.stringify(screenshots, null, 2)
    );

    console.log('📋 Flow metadata saved to: flow-metadata.json\n');

  } catch (error) {
    console.error('❌ Error during capture:', error);
    await captureScreen('error-state', `Error encountered: ${error.message}`);
  } finally {
    await browser.close();
    console.log('🎬 Browser closed\n');
  }

  return screenshots;
}

// Run the capture
captureUserFlow()
  .then((screenshots) => {
    console.log('\n=== Capture Summary ===');
    screenshots.forEach(s => {
      console.log(`${s.step}. ${s.description}`);
    });
    console.log('\n✨ Ready for PDF generation\n');
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
