/**
 * Server-side reveal export using the approved v4 exporter
 *
 * This module coordinates video generation using Playwright and FFmpeg.
 * It must run in an environment with:
 * - Chromium browser (via Playwright)
 * - FFmpeg with libx264 and libvpx-vp9 codecs
 * - Sufficient memory (~500MB per export)
 * - Persistent storage for completed videos
 */

import { chromium, Page } from 'playwright';
import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface ExportOptions {
  shareCode: string;
  baseUrl: string;
  outputDir: string;
}

export interface ExportResult {
  success: boolean;
  videoPath?: string;
  duration?: number;
  size?: number;
  error?: string;
}

/**
 * Calculate content hash for detecting when re-export is needed
 */
export function calculateContentHash(data: {
  revealPlanId?: string;
  memoryIds: string[];
  customMusicUrl?: string | null;
  exporterVersion: string;
}): string {
  const content = JSON.stringify({
    revealPlanId: data.revealPlanId || 'none',
    memoryIds: data.memoryIds.sort(), // Sort for consistency
    customMusicUrl: data.customMusicUrl || 'default',
    exporterVersion: data.exporterVersion,
  });

  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Wait for export to reach ready state with all assets loaded
 */
async function waitForExportReady(page: Page): Promise<void> {
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
}

/**
 * Wait for export to complete (reveal finishes playing)
 */
async function waitForExportComplete(page: Page): Promise<void> {
  await page.waitForFunction(
    () => {
      const stage = document.querySelector<HTMLElement>('[data-reveal-stage]');
      return stage?.dataset.exportPhase === 'complete';
    },
    undefined,
    { timeout: 180000 } // 3 minutes max
  );
}

/**
 * Extract audio URL from page
 */
async function extractAudioUrl(page: Page): Promise<string | null> {
  try {
    return await page.evaluate(() => {
      const audioElement = document.querySelector('audio');
      if (audioElement?.src) return audioElement.src;
      if (audioElement?.currentSrc) return audioElement.currentSrc;

      // Fallback: extract from page HTML
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

/**
 * Download audio track
 */
async function downloadAudio(audioUrl: string, outputPath: string): Promise<boolean> {
  try {
    execSync(`curl -L -f -s "${audioUrl}" -o "${outputPath}"`, { stdio: 'pipe' });
    if (!existsSync(outputPath)) {
      return false;
    }
    const stats = await fs.stat(outputPath);
    return stats.size > 1000; // Minimum 1KB
  } catch (error) {
    return false;
  }
}

/**
 * Trim and fade audio to match video duration
 */
async function trimAndFadeAudio(
  audioFile: string,
  duration: number,
  outputFile: string
): Promise<boolean> {
  try {
    const fadeStart = Math.max(0, duration - 2);
    execSync(
      `ffmpeg -i "${audioFile}" -t ${duration} -af "afade=t=out:st=${fadeStart}:d=2" "${outputFile}" -y`,
      { stdio: 'pipe' }
    );
    return existsSync(outputFile);
  } catch (error) {
    return false;
  }
}

/**
 * Add branding watermark overlay
 */
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

/**
 * Show branded closing card
 */
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
      opacity: 1;
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
  });
}

/**
 * Main export function using approved v4 approach
 *
 * IMPORTANT: This function requires:
 * - Chromium browser installed (Playwright)
 * - FFmpeg with H.264 codec support
 * - Write access to outputDir
 * - Network access to load reveal page and audio
 */
export async function exportReveal(options: ExportOptions): Promise<ExportResult> {
  const { shareCode, baseUrl, outputDir } = options;

  // Validate environment
  if (!baseUrl.includes('localhost') && !baseUrl.includes('127.0.0.1')) {
    return {
      success: false,
      error: 'Export currently only supports localhost URLs for security',
    };
  }

  const timestamp = Date.now();
  const runDir = path.join(outputDir, `run-${timestamp}`);

  try {
    // Create output directory
    if (!existsSync(runDir)) {
      mkdirSync(runDir, { recursive: true });
    }

    const rawVideoFile = path.join(runDir, `reveal-raw-${timestamp}.webm`);
    const audioFile = path.join(runDir, `reveal-audio-${timestamp}.mp3`);
    const trimmedAudioFile = path.join(runDir, `reveal-audio-trimmed-${timestamp}.mp3`);
    const finalMp4File = path.join(runDir, `reveal-${shareCode}-${timestamp}.mp4`);

    // Launch browser with video recording
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

    // Load reveal page with export mode
    const revealUrl = new URL(`/m/${encodeURIComponent(shareCode)}/reveal`, baseUrl);
    revealUrl.searchParams.set('export', 'true');

    await page.goto(revealUrl.toString(), { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(2000); // Allow initial render

    // Extract audio URL
    const audioUrl = await extractAudioUrl(page);

    // Wait for export ready state
    await waitForExportReady(page);

    // Add branding
    await addBrandingWatermark(page);
    await page.waitForTimeout(500);

    // Start export by dispatching event
    // The player will transition to 'playing' phase and begin the reveal
    await page.evaluate(() => {
      window.dispatchEvent(new Event('memorypop:export-start'));
    });

    // Wait for playback to actually start (first frame to render)
    // This ensures we don't capture the transition frame
    await page.waitForTimeout(2000);

    // Wait for export to complete
    await waitForExportComplete(page);

    // Add closing card
    await showBrandedClosing(page);
    await page.waitForTimeout(3000); // 3s closing hold

    // Finalize recording
    const recordedVideo = page.video();
    if (!recordedVideo) {
      throw new Error('Video recording was not enabled');
    }

    await context.close();
    await browser.close();

    // Wait for video file
    const rawVideoPath = await recordedVideo.path();
    await new Promise(resolve => setTimeout(resolve, 2000));
    await fs.rename(rawVideoPath, rawVideoFile);

    const videoStats = await fs.stat(rawVideoFile);
    if (videoStats.size === 0) {
      throw new Error('Video file is empty');
    }

    // Get video duration
    const rawProbe = execSync(
      `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${rawVideoFile}"`,
      { encoding: 'utf-8' }
    );
    const rawVideoDuration = parseFloat(rawProbe.trim());

    // Encode to H.264 MP4
    execSync(
      `ffmpeg -i "${rawVideoFile}" -c:v libx264 -preset medium -crf 23 -an "${finalMp4File}" -y`,
      { stdio: 'pipe' }
    );

    // Get encoded duration for audio sync
    const encodedProbe = execSync(
      `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${finalMp4File}"`,
      { encoding: 'utf-8' }
    );
    const encodedVideoDuration = parseFloat(encodedProbe.trim());

    // Process audio if available
    let audioProcessed = false;
    if (audioUrl) {
      const audioDownloaded = await downloadAudio(audioUrl, audioFile);
      if (audioDownloaded) {
        const audioTrimmed = await trimAndFadeAudio(audioFile, encodedVideoDuration, trimmedAudioFile);
        if (audioTrimmed) {
          // Merge audio with video
          const tempOutput = finalMp4File.replace('.mp4', '-temp.mp4');
          await fs.rename(finalMp4File, tempOutput);

          execSync(
            `ffmpeg -i "${tempOutput}" -i "${trimmedAudioFile}" -c:v copy -c:a aac -b:a 192k "${finalMp4File}" -y`,
            { stdio: 'pipe' }
          );

          await fs.unlink(tempOutput);
          audioProcessed = true;
        }
      }
    }

    // Get final stats
    const finalStats = await fs.stat(finalMp4File);

    return {
      success: true,
      videoPath: finalMp4File,
      duration: encodedVideoDuration,
      size: finalStats.size,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Export failed',
    };
  }
}
