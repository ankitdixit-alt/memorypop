/**
 * Proof of Concept: Export Reveal to MP4
 *
 * Captures clean reveal with branding, proper framing, and matched audio/video duration.
 *
 * Usage:
 *   npx tsx scripts/export-reveal-poc.ts
 *
 * Output:
 *   ./exports/reveal-[shareCode]-[timestamp].mp4
 */

import { chromium, Page } from 'playwright';
import { execSync } from 'child_process';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import path from 'path';

const SHARE_CODE = 'test-sharing-1790756204563';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const REVEAL_URL = `${BASE_URL}/m/${SHARE_CODE}/reveal`;
const EXPORTS_DIR = path.join(process.cwd(), 'exports');

interface FrameCheck {
  timestamp: number;
  contributorName: string | null;
}

async function extractAudioUrl(page: Page): Promise<string | null> {
  try {
    return await page.evaluate(() => {
      const audioElement = document.querySelector('audio');
      if (audioElement?.src) return audioElement.src;
      if (audioElement?.currentSrc) return audioElement.currentSrc;

      const bodyText = document.body.innerHTML;
      const match = bodyText.match(/customMusicUrl\\":\\"(https:[^\\]+)\\"/);

      if (match && match[1]) {
        const url = match[1].replace(/\\\//g, '/');
        if (url.startsWith('https://') && url.includes('.supabase.co/storage')) {
          return url;
        }
      }

      return null;
    });
  } catch (error) {
    return null;
  }
}

async function applyExportStyling(page: Page): Promise<void> {
  await page.evaluate(() => {
    // Remove specific reveal UI components by class name pattern
    const stageHeader = document.querySelector('[class*="stageHeader"]');
    if (stageHeader) stageHeader.remove();

    const transport = document.querySelector('[class*="transport"]');
    if (transport) transport.remove();

    // Remove navigation, links, and buttons
    document.querySelectorAll('nav, header, [role="navigation"], a, button').forEach(el => {
      el.remove();
    });

    // Remove cookie banners and development badges
    document.querySelectorAll('[class*="cookie"], [id*="cookie"], [class*="consent"], [class*="synthetic"], [class*="badge"]').forEach(el => {
      el.remove();
    });

    // Remove any remaining element containing cookie text
    Array.from(document.querySelectorAll('div, section, aside, p')).forEach(el => {
      const text = el.textContent || '';
      if (text.includes('We use cookies') || text.includes('Accept') && text.includes('Decline')) {
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

async function addBrandingWatermark(page: Page): Promise<void> {
  await page.evaluate(() => {
    const watermark = document.createElement('div');
    watermark.id = 'memorypop-export-watermark';
    watermark.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 32px;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 13px;
      font-weight: 500;
      color: rgba(255, 255, 255, 0.85);
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
      z-index: 99999;
      pointer-events: none;
      letter-spacing: 0.2px;
    `;
    watermark.textContent = 'Made with MemoryPop';
    document.body.appendChild(watermark);
  });
}

async function showBrandedClosing(page: Page): Promise<void> {
  await page.evaluate(() => {
    // Create closing card with coral heart and warm styling
    const closing = document.createElement('div');
    closing.id = 'memorypop-export-closing';
    closing.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: #fffaf3;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 999999;
      font-family: system-ui, -apple-system, sans-serif;
      opacity: 0;
      transition: opacity 0.6s ease-in;
    `;

    const heart = document.createElement('div');
    heart.style.cssText = `
      font-family: Georgia, serif;
      font-size: 54px;
      line-height: 1;
      color: #b44b39;
      margin-bottom: 25px;
    `;
    heart.textContent = '♡';

    const title = document.createElement('div');
    title.style.cssText = `
      font-family: Georgia, serif;
      font-size: 42px;
      font-weight: 400;
      color: #342821;
      margin-bottom: 16px;
      text-align: center;
      letter-spacing: -1px;
    `;
    title.textContent = 'Made together with MemoryPop';

    const website = document.createElement('div');
    website.style.cssText = `
      font-size: 18px;
      font-weight: 500;
      color: #71665f;
      text-align: center;
      letter-spacing: 0.3px;
    `;
    website.textContent = 'memorypop.app';

    closing.appendChild(heart);
    closing.appendChild(title);
    closing.appendChild(website);
    document.body.appendChild(closing);

    // Fade in
    setTimeout(() => {
      closing.style.opacity = '1';
    }, 50);
  });
}

async function navigateToRevealStart(page: Page): Promise<number> {
  console.log('⏳ Navigating to reveal start...');

  const startTime = Date.now();

  // Click through invitation
  const openButton = page.locator('button:has-text("Open My MemoryPop")');
  await openButton.click();
  await page.waitForTimeout(2000);

  console.log('   Reveal player loaded');

  // Click begin
  const beginButton = page.locator('button:has-text("Begin the reveal")');
  await beginButton.click();
  await page.waitForTimeout(500);

  console.log('   "Begin the reveal" clicked');

  // Wait for actual reveal content to appear (not just the Made with Love intro)
  // Look for contributor names or "Memory X of Y" which indicates actual content
  await page.waitForFunction(
    () => {
      const text = document.body.innerText;
      // Check for contributor names or memory indicators
      const hasContributor = text.includes('Lisa Thompson') ||
                            text.includes('Sarah Chen') ||
                            text.includes('Emily Watson') ||
                            text.includes('Mike Rodriguez') ||
                            text.includes('James Kim');

      const hasMemoryIndicator = text.includes('Memory 1 of') ||
                                 text.includes('Memory') && text.includes('of 5');

      // Also check that we're past the initial screens
      const notOnIntro = !text.includes('Begin the reveal') &&
                        !text.includes('Open My MemoryPop');

      return (hasContributor || hasMemoryIndicator) && notOnIntro;
    },
    { timeout: 20000 }
  );

  const navEndTime = Date.now();
  const navigationDuration = (navEndTime - startTime) / 1000;

  console.log(`   Reveal content appeared (navigation: ${navigationDuration.toFixed(1)}s)`);

  // Small additional wait to ensure content is fully rendered
  await page.waitForTimeout(1000);

  return navigationDuration;
}

async function captureFrameCheck(page: Page): Promise<FrameCheck> {
  return await page.evaluate(() => {
    const text = document.body.innerText;
    let contributorName = null;

    const contributors = ['Lisa Thompson', 'Sarah Chen', 'Mike Rodriguez', 'Emily Watson', 'James Kim'];
    for (const name of contributors) {
      if (text.includes(name)) {
        contributorName = name;
        break;
      }
    }

    return { timestamp: Date.now(), contributorName };
  });
}

async function downloadAudio(audioUrl: string, outputPath: string): Promise<boolean> {
  try {
    console.log('📥 Downloading audio track...');
    execSync(`curl -L -f -s "${audioUrl}" -o "${outputPath}"`, { stdio: 'pipe' });
    if (!existsSync(outputPath)) {
      console.log('   Audio file not created');
      return false;
    }
    const fs = await import('fs');
    const stats = await fs.promises.stat(outputPath);
    if (stats.size < 1000) {
      console.log(`   Audio file too small: ${stats.size} bytes`);
      return false;
    }
    return true;
  } catch (error: any) {
    console.log(`   Download error: ${error.message}`);
    return false;
  }
}

async function trimAndFadeAudio(audioFile: string, duration: number, outputFile: string): Promise<boolean> {
  try {
    console.log(`🎵 Trimming audio to ${duration.toFixed(1)}s with fade-out...`);
    const fadeStart = Math.max(0, duration - 2);
    execSync(
      `ffmpeg -i "${audioFile}" -t ${duration} -af "afade=t=out:st=${fadeStart}:d=2" "${outputFile}" -y`,
      { stdio: 'pipe' }
    );
    return existsSync(outputFile);
  } catch (error) {
    console.error('   Audio trim failed:', error);
    return false;
  }
}

async function exportReveal() {
  console.log('🎬 Starting reveal export proof-of-concept...\n');
  console.log(`URL: ${REVEAL_URL}`);
  console.log(`Output: ${EXPORTS_DIR}\n`);

  if (!existsSync(EXPORTS_DIR)) {
    mkdirSync(EXPORTS_DIR, { recursive: true });
  }

  const timestamp = Date.now();
  const rawVideoFile = path.join(EXPORTS_DIR, `reveal-raw-${timestamp}.webm`);
  const trimmedVideoFile = path.join(EXPORTS_DIR, `reveal-trimmed-${timestamp}.webm`);
  const audioFile = path.join(EXPORTS_DIR, `reveal-audio-${timestamp}.mp3`);
  const trimmedAudioFile = path.join(EXPORTS_DIR, `reveal-audio-trimmed-${timestamp}.mp3`);
  const finalMp4File = path.join(EXPORTS_DIR, `reveal-${SHARE_CODE}-${timestamp}.mp4`);
  const verificationLog = path.join(EXPORTS_DIR, `reveal-verification-${timestamp}.json`);

  const frameChecks: FrameCheck[] = [];

  console.log('🌐 Launching browser...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--autoplay-policy=no-user-gesture-required', '--no-sandbox', '--disable-setuid-sandbox'],
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: {
      dir: EXPORTS_DIR,
      size: { width: 1920, height: 1080 },
    },
  });

  const page = await context.newPage();

  console.log('📄 Loading reveal page...');
  await page.goto(REVEAL_URL, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(2000);

  const audioUrl = await extractAudioUrl(page);
  if (audioUrl) {
    console.log('🎵 Audio URL found');
  } else {
    console.log('⚠️  No audio URL detected');
  }

  console.log('▶️  Starting reveal...');

  // Navigate and track timing
  const recordingStartTime = Date.now();
  const navigationDuration = await navigateToRevealStart(page);

  // Apply export styling AFTER navigation
  console.log('🎨 Applying export styling...');
  await applyExportStyling(page);
  await addBrandingWatermark(page);
  await page.waitForTimeout(500);

  console.log('✅ Recording reveal content');
  console.log('📹 Capturing contributions...\n');

  frameChecks.push(await captureFrameCheck(page));

  const checkInterval = setInterval(async () => {
    const check = await captureFrameCheck(page);
    frameChecks.push(check);
    if (check.contributorName) {
      console.log(`   ${new Date().toLocaleTimeString()}: ${check.contributorName}`);
    }
  }, 10000);

  // Wait for ending
  try {
    await page.waitForSelector('text=All these people. All this love.', { timeout: 120000 });
    console.log('\n✅ Emotional ending reached');
    await page.waitForTimeout(2000);
  } catch (error) {
    clearInterval(checkInterval);
    await browser.close();
    throw new Error('❌ Reveal did not reach ending');
  }

  clearInterval(checkInterval);

  // Show branded closing with transition
  console.log('🎨 Adding branded closing card...');
  await showBrandedClosing(page);
  await page.waitForTimeout(3500); // 0.5s fade + 3s hold

  const recordingEndTime = Date.now();
  const totalRecordingDuration = (recordingEndTime - recordingStartTime) / 1000;

  console.log(`🛑 Stopping recording (${totalRecordingDuration.toFixed(1)}s total)...\n`);

  const video = page.video();
  const videoPathPromise = video?.path();

  await page.close();
  await context.close();
  await browser.close();

  const videoPath = videoPathPromise ? await videoPathPromise : null;
  await new Promise(resolve => setTimeout(resolve, 2000));

  const fs = await import('fs');

  let tempVideoFile: string;
  if (videoPath && existsSync(videoPath)) {
    tempVideoFile = videoPath;
  } else {
    const files = await fs.promises.readdir(EXPORTS_DIR);
    const videoFile = files.find(f => f.endsWith('.webm') && !f.includes('reveal-'));
    if (!videoFile) throw new Error('❌ Video file not found');
    tempVideoFile = path.join(EXPORTS_DIR, videoFile);
  }

  await fs.promises.rename(tempVideoFile, rawVideoFile);

  const videoStats = await fs.promises.stat(rawVideoFile);
  if (videoStats.size === 0) throw new Error('❌ Video file is empty');

  console.log(`✅ Raw video: ${(videoStats.size / 1024 / 1024).toFixed(2)} MB`);

  // Get raw video duration
  const rawProbe = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${rawVideoFile}"`, { encoding: 'utf-8' });
  const rawVideoDuration = parseFloat(rawProbe.trim());

  console.log(`   Raw duration: ${rawVideoDuration.toFixed(1)}s`);

  // Calculate trim point (add 0.5s buffer for safety)
  const trimStart = Math.max(0, navigationDuration - 0.5);

  console.log(`🎬 Trimming video (removing first ${trimStart.toFixed(1)}s)...`);

  // Use accurate seek and re-encode to trim properly
  execSync(
    `ffmpeg -i "${rawVideoFile}" -ss ${trimStart} -c:v libvpx -b:v 2M -an "${trimmedVideoFile}" -y`,
    { stdio: 'pipe' }
  );

  // Get actual trimmed duration
  const trimmedProbe = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${trimmedVideoFile}"`, { encoding: 'utf-8' });
  const trimmedVideoDuration = parseFloat(trimmedProbe.trim());

  console.log(`   Trimmed duration: ${trimmedVideoDuration.toFixed(1)}s\n`);

  // Download and process audio
  let audioProcessed = false;

  if (audioUrl) {
    const audioDownloaded = await downloadAudio(audioUrl, audioFile);
    if (audioDownloaded) {
      console.log('✅ Audio downloaded');
      audioProcessed = await trimAndFadeAudio(audioFile, trimmedVideoDuration, trimmedAudioFile);
      if (audioProcessed) {
        console.log('✅ Audio trimmed and faded\n');
      }
    } else {
      console.log('⚠️  Audio download failed\n');
    }
  }

  // Merge video and audio
  console.log('🎬 Creating final MP4...');

  let success = false;
  if (audioProcessed) {
    console.log('🔄 Merging video and audio...');
    try {
      execSync(
        `ffmpeg -i "${trimmedVideoFile}" -i "${trimmedAudioFile}" -c:v libx264 -preset fast -crf 22 -c:a aac -b:a 192k -map 0:v:0 -map 1:a:0 -shortest "${finalMp4File}" -y`,
        { stdio: 'pipe' }
      );
      success = existsSync(finalMp4File);
    } catch (error) {
      console.error('   Merge failed:', error);
      success = false;
    }
  } else {
    console.log('   (Video only - no audio)');
    try {
      execSync(
        `ffmpeg -i "${trimmedVideoFile}" -c:v libx264 -preset fast -crf 22 "${finalMp4File}" -y`,
        { stdio: 'pipe' }
      );
      success = existsSync(finalMp4File);
    } catch (error) {
      success = false;
    }
  }

  if (!success) throw new Error('❌ MP4 conversion failed');

  const stats = await fs.promises.stat(finalMp4File);
  const sizeMB = (stats.size / 1024 / 1024).toFixed(2);

  // Verify final streams
  let hasVideo = false;
  let hasAudio = false;
  let videoDuration = 0;
  let audioDuration = 0;

  try {
    const probe = execSync(`ffprobe -v error -show_streams -show_format "${finalMp4File}"`, { encoding: 'utf-8' });
    hasVideo = probe.includes('codec_type=video');
    hasAudio = probe.includes('codec_type=audio');

    const videoMatch = probe.match(/codec_type=video[\s\S]*?duration=(\d+\.\d+)/);
    const audioMatch = probe.match(/codec_type=audio[\s\S]*?duration=(\d+\.\d+)/);

    if (videoMatch) videoDuration = parseFloat(videoMatch[1]);
    if (audioMatch) audioDuration = parseFloat(audioMatch[1]);
  } catch (error) {
    // ffprobe failed
  }

  const durationDiff = Math.abs(videoDuration - audioDuration);

  const verification = {
    timestamp,
    file: path.basename(finalMp4File),
    filePath: finalMp4File,
    fileSize: `${sizeMB} MB`,
    duration: `${Math.floor(videoDuration / 60)}:${String(Math.floor(videoDuration % 60)).padStart(2, '0')}`,
    durationSeconds: videoDuration,
    hasVideo,
    hasAudio,
    videoDurationSeconds: videoDuration,
    audioDurationSeconds: audioDuration,
    durationDifference: durationDiff,
    audioSource: audioProcessed ? 'custom music (trimmed with fade-out)' : 'none',
    navigationTrimmed: `${trimStart.toFixed(1)}s`,
    contributorsDetected: frameChecks.filter(f => f.contributorName).map(f => f.contributorName),
    uniqueContributors: [...new Set(frameChecks.filter(f => f.contributorName).map(f => f.contributorName))],
    brandingApplied: {
      watermark: 'discreet "Made with MemoryPop" bottom-right',
      closingCard: 'coral heart + "Made together with MemoryPop" + memorypop.app (3.5s with fade-in)'
    }
  };

  writeFileSync(verificationLog, JSON.stringify(verification, null, 2));

  console.log('\n' + '='.repeat(70));
  console.log('✅ EXPORT COMPLETE');
  console.log('='.repeat(70));
  console.log(`\nFile: ${finalMp4File}`);
  console.log(`Size: ${sizeMB} MB`);
  console.log(`Duration: ${Math.floor(videoDuration / 60)}:${String(Math.floor(videoDuration % 60)).padStart(2, '0')} (${videoDuration.toFixed(1)}s)`);
  console.log(`\nStreams:`);
  console.log(`  Video: ${hasVideo ? '✅ YES' : '❌ NO'} (${videoDuration.toFixed(2)}s)`);
  console.log(`  Audio: ${hasAudio ? '✅ YES' : '❌ NO'} (${audioDuration.toFixed(2)}s)`);
  console.log(`  Duration match: ${durationDiff < 0.5 ? '✅ YES' : '⚠️  NO'} (diff: ${durationDiff.toFixed(2)}s)`);
  console.log(`\nBranding:`);
  console.log(`  Watermark: Discreet "Made with MemoryPop" (bottom-right)`);
  console.log(`  Closing: Coral heart ♡ + "Made together with MemoryPop"`);
  console.log(`           + memorypop.app (3.5s with fade-in)`);
  console.log(`\nContributions detected: ${verification.uniqueContributors.length}`);
  verification.uniqueContributors.forEach((name: any) => {
    console.log(`  - ${name}`);
  });
  console.log(`\nNavigation trimmed: ${trimStart.toFixed(1)}s removed from start`);
  console.log(`Verification log: ${verificationLog}`);
  console.log(`\nTo view: open "${finalMp4File}"`);
  console.log('='.repeat(70) + '\n');
}

exportReveal().catch(error => {
  console.error('\n❌ Export failed:', error.message);
  process.exit(1);
});
