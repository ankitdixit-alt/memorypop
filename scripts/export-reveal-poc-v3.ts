/**
 * Proof of Concept: Export Reveal to MP4 (v3 - Export Lifecycle)
 *
 * Uses export mode with proper lifecycle phases and readiness checks.
 *
 * Usage:
 *   npx tsx scripts/export-reveal-poc-v3.ts <shareCode>
 *
 * Output:
 *   ./exports/run-[timestamp]/reveal-[shareCode]-[timestamp].mp4
 */

import { chromium, Page } from 'playwright';
import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';

// Parse CLI arguments
const shareCode = process.argv[2];

if (!shareCode || !/^[A-Za-z0-9_-]+$/.test(shareCode)) {
  console.error('Usage: npx tsx scripts/export-reveal-poc-v3.ts <shareCode>');
  console.error('Example: npx tsx scripts/export-reveal-poc-v3.ts test-sharing-1790756204563');
  process.exit(1);
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const EXPORTS_DIR = path.join(process.cwd(), 'exports');

// Validate test environment
if (!BASE_URL.includes('localhost')) {
  throw new Error('Export script requires localhost URL. Current: ' + BASE_URL);
}

const REVEAL_URL = new URL(`/m/${encodeURIComponent(shareCode)}/reveal`, BASE_URL);
REVEAL_URL.searchParams.set('export', 'true');

async function assertExportFrame(page: Page): Promise<void> {
  const stage = page.locator('[data-export-root="true"] [data-reveal-stage]');

  if (await stage.count() !== 1) {
    throw new Error('Expected exactly one export celebration stage');
  }

  await stage.waitFor({ state: 'visible' });

  const result = await stage.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const tolerance = 2;

    const outside = Array.from(
      element.querySelectorAll<HTMLElement>('[data-export-scene]')
    ).filter((child) => {
      const style = getComputedStyle(child);
      const box = child.getBoundingClientRect();

      if (
        style.display === 'none' ||
        style.visibility === 'hidden' ||
        Number(style.opacity) === 0 ||
        box.width === 0 ||
        box.height === 0
      ) {
        return false;
      }

      return (
        box.left < rect.left - tolerance ||
        box.top < rect.top - tolerance ||
        box.right > rect.right + tolerance ||
        box.bottom > rect.bottom + tolerance
      );
    });

    return {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      overflowingScenes: outside.length,
    };
  });

  const wrongFrame =
    Math.abs(result.x) > 2 ||
    Math.abs(result.y) > 2 ||
    Math.abs(result.width - result.viewportWidth) > 2 ||
    Math.abs(result.height - result.viewportHeight) > 2;

  if (wrongFrame || result.overflowingScenes > 0) {
    throw new Error(
      `Export layout failed: ${JSON.stringify(result)}`
    );
  }

  console.log(`✅ Layout validated: ${result.width}×${result.height} at (${result.x},${result.y})`);
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

async function waitForExportReady(page: Page): Promise<void> {
  console.log('⏳ Waiting for reveal to be ready...');

  // Wait for stage to enter ready phase
  await page.waitForFunction(
    () => {
      const stage = document.querySelector<HTMLElement>('[data-reveal-stage]');
      if (!stage || stage.dataset.exportPhase !== 'ready') {
        return false;
      }

      // Check that initial images are loaded
      const images = Array.from(stage.querySelectorAll<HTMLImageElement>('img'));
      const allImagesLoaded = images.length === 0 || images.every(
        image => image.complete && image.naturalWidth > 0
      );

      // Check that fonts are loaded
      const fontsLoaded = document.fonts.status === 'loaded';

      return allImagesLoaded && fontsLoaded;
    },
    undefined,
    { timeout: 30000 }
  );

  console.log('   Export phase: ready');
  console.log('   Initial assets loaded');
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
      color: rgba(90, 70, 60, 0.9);
      background: rgba(255, 250, 243, 0.7);
      padding: 6px 12px;
      border-radius: 6px;
      backdrop-filter: blur(4px);
      z-index: 99999;
      pointer-events: none;
      letter-spacing: 0.2px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    `;
    watermark.textContent = 'Made with MemoryPop';
    document.body.appendChild(watermark);
  });
}

async function showBrandedClosing(page: Page): Promise<void> {
  await page.evaluate(() => {
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
      margin-bottom: 18px;
      letter-spacing: -1px;
    `;
    title.textContent = 'Made together with MemoryPop';

    const website = document.createElement('div');
    website.style.cssText = `
      font-size: 16px;
      color: #71665f;
      letter-spacing: 0.5px;
    `;
    website.textContent = 'memorypop.app';

    closing.appendChild(heart);
    closing.appendChild(title);
    closing.appendChild(website);
    document.body.appendChild(closing);

    setTimeout(() => {
      closing.style.opacity = '1';
    }, 50);
  });
}

async function waitForExportComplete(page: Page): Promise<void> {
  console.log('⏳ Waiting for export to complete...');

  await page.waitForFunction(
    () => {
      const stage = document.querySelector<HTMLElement>('[data-reveal-stage]');
      return stage?.dataset.exportPhase === 'complete';
    },
    undefined,
    { timeout: 180000 } // 3 minutes max
  );

  console.log('✅ Export phase: complete');
}

async function exportReveal() {
  console.log('🎬 Starting reveal export (Export Lifecycle v3)...\n');
  console.log(`Share code: ${shareCode}`);
  console.log(`URL: ${REVEAL_URL.toString()}`);
  console.log(`Output: ${EXPORTS_DIR}\n`);

  const timestamp = Date.now();
  const runDir = path.join(EXPORTS_DIR, `run-${timestamp}`);

  if (!existsSync(runDir)) {
    mkdirSync(runDir, { recursive: true });
  }

  const rawVideoFile = path.join(runDir, `reveal-raw-${timestamp}.webm`);
  const audioFile = path.join(runDir, `reveal-audio-${timestamp}.mp3`);
  const trimmedAudioFile = path.join(runDir, `reveal-audio-trimmed-${timestamp}.mp3`);
  const finalMp4File = path.join(runDir, `reveal-${shareCode}-${timestamp}.mp4`);

  console.log('🌐 Launching browser...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--autoplay-policy=no-user-gesture-required', '--no-sandbox', '--disable-setuid-sandbox'],
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: runDir,
      size: { width: 1920, height: 1080 },
    },
  });

  const page = await context.newPage();

  console.log('📄 Loading reveal page with export mode...');
  await page.goto(REVEAL_URL.toString(), { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(2000);

  const audioUrl = await extractAudioUrl(page);
  if (audioUrl) {
    console.log('🎵 Audio URL found');
  } else {
    console.log('⚠️  No audio URL detected');
  }

  // Wait for reveal to be ready
  await waitForExportReady(page);

  // Validate layout
  console.log('📐 Validating export frame...');
  await assertExportFrame(page);

  // Add branding watermark
  await addBrandingWatermark(page);
  await page.waitForTimeout(500);

  console.log('📹 Starting recording...\n');
  const recordingStartTime = Date.now();

  // Dispatch export start event
  await page.evaluate(() => {
    window.dispatchEvent(new Event('memorypop:export-start'));
  });

  // Wait for export to complete (reveal plays through + closing card)
  await waitForExportComplete(page);

  // Add final branded closing card
  console.log('🎨 Adding final branded closing card...');
  await showBrandedClosing(page);
  await page.waitForTimeout(3500); // 0.5s fade + 3s hold

  const recordingEndTime = Date.now();
  const totalRecordingDuration = (recordingEndTime - recordingStartTime) / 1000;

  console.log(`🛑 Stopping recording (${totalRecordingDuration.toFixed(1)}s total)...\n`);

  // Get video handle before closing
  const recordedVideo = page.video();
  if (!recordedVideo) {
    throw new Error('Video recording was not enabled');
  }

  await context.close();
  await browser.close();

  // Wait for video to be finalized
  const rawVideoPath = await recordedVideo.path();
  await new Promise(resolve => setTimeout(resolve, 2000));

  const fs = await import('fs');
  await fs.promises.rename(rawVideoPath, rawVideoFile);

  const videoStats = await fs.promises.stat(rawVideoFile);
  if (videoStats.size === 0) throw new Error('❌ Video file is empty');

  console.log(`✅ Raw video: ${(videoStats.size / 1024 / 1024).toFixed(2)} MB`);

  // Get video duration
  const rawProbe = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${rawVideoFile}"`, { encoding: 'utf-8' });
  const rawVideoDuration = parseFloat(rawProbe.trim());

  console.log(`   Duration: ${rawVideoDuration.toFixed(1)}s`);

  // Encode to H.264 MP4
  console.log(`\n🎬 Encoding to H.264 MP4...`);
  execSync(
    `ffmpeg -i "${rawVideoFile}" -c:v libx264 -preset medium -crf 23 -an "${finalMp4File}" -y`,
    { stdio: 'pipe' }
  );

  console.log(`✅ Video encoded`);

  // Download and process audio
  let audioProcessed = false;

  if (audioUrl) {
    const audioDownloaded = await downloadAudio(audioUrl, audioFile);
    if (audioDownloaded) {
      const audioTrimmed = await trimAndFadeAudio(audioFile, rawVideoDuration, trimmedAudioFile);
      if (audioTrimmed) {
        console.log(`✅ Audio trimmed and faded\n`);

        // Merge audio with video
        console.log('🔄 Merging video and audio...');
        const tempOutput = finalMp4File.replace('.mp4', '-temp.mp4');
        await fs.promises.rename(finalMp4File, tempOutput);

        execSync(
          `ffmpeg -i "${tempOutput}" -i "${trimmedAudioFile}" -c:v copy -c:a aac -b:a 192k "${finalMp4File}" -y`,
          { stdio: 'pipe' }
        );

        await fs.promises.unlink(tempOutput);
        audioProcessed = true;
      }
    }
  }

  // Final stats
  const finalStats = await fs.promises.stat(finalMp4File);
  const videoProbe = execSync(`ffprobe -v error -show_streams -select_streams v:0 "${finalMp4File}"`, { encoding: 'utf-8' });
  const videoDurationMatch = videoProbe.match(/duration=([\d.]+)/);
  const videoDuration = videoDurationMatch ? parseFloat(videoDurationMatch[1]) : 0;

  let audioDuration = 0;
  if (audioProcessed) {
    const audioProbe = execSync(`ffprobe -v error -show_streams -select_streams a:0 "${finalMp4File}"`, { encoding: 'utf-8' });
    const audioDurationMatch = audioProbe.match(/duration=([\d.]+)/);
    audioDuration = audioDurationMatch ? parseFloat(audioDurationMatch[1]) : 0;
  }

  console.log('\n======================================================================');
  console.log('✅ EXPORT COMPLETE');
  console.log('======================================================================\n');
  console.log(`File: ${finalMp4File}`);
  console.log(`Size: ${(finalStats.size / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Duration: ${Math.floor(videoDuration / 60)}:${String(Math.floor(videoDuration % 60)).padStart(2, '0')} (${videoDuration.toFixed(2)}s)`);
  console.log('\nStreams:');
  console.log(`  Video: ✅ YES (${videoDuration.toFixed(2)}s)`);
  console.log(`  Audio: ${audioProcessed ? '✅ YES' : '❌ NO'} ${audioProcessed ? `(${audioDuration.toFixed(2)}s)` : ''}`);
  if (audioProcessed) {
    const diff = Math.abs(videoDuration - audioDuration);
    console.log(`  Duration match: ${diff < 0.1 ? '✅' : '⚠️'} ${diff < 0.1 ? 'YES' : 'CLOSE'} (diff: ${diff.toFixed(2)}s)`);
  }
  console.log('\nBranding:');
  console.log('  Watermark: "Made with MemoryPop" (bottom-right, readable)');
  console.log('  Closing: Coral heart ♡ + "Made together with MemoryPop"');
  console.log('           + memorypop.app (3.5s with fade-in)');
  console.log(`\nTo view: open "${finalMp4File}"`);
  console.log('======================================================================\n');
}

exportReveal().catch((error) => {
  console.error('\n❌ Export failed:', error.message);
  process.exit(1);
});
