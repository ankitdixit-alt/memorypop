/**
 * Verify exported reveal MP4 by extracting key frames
 */

import { execSync } from 'child_process';
import { readdirSync } from 'fs';
import path from 'path';

// Find the latest exported MP4 file
const exportsDir = path.join(process.cwd(), 'exports');
const mp4Files = readdirSync(exportsDir)
  .filter(f => f.startsWith('reveal-') && f.endsWith('.mp4'))
  .sort()
  .reverse();

if (mp4Files.length === 0) {
  console.error('❌ No exported MP4 files found in exports/');
  process.exit(1);
}

const MP4_FILE = path.join(exportsDir, mp4Files[0]);
const FRAMES_DIR = path.join(process.cwd(), 'exports', 'frames');

async function verifyExport() {
  console.log('🔍 Verifying exported reveal...\n');

  const fs = await import('fs');

  if (!fs.existsSync(FRAMES_DIR)) {
    fs.mkdirSync(FRAMES_DIR, { recursive: true });
  }

  // Extract frames at key moments
  const frames = [
    { time: '00:00:00', name: 'first-frame', desc: 'First frame (should be first contribution, not invitation)' },
    { time: '00:00:35', name: 'middle-contribution', desc: 'Middle contribution (check watermark and UI removal)' },
    { time: '00:01:09', name: 'final-seconds', desc: 'Final seconds (should show branded closing)' },
  ];

  console.log('📸 Extracting frames for visual inspection...\n');

  for (const frame of frames) {
    const outputFile = path.join(FRAMES_DIR, `${frame.name}.png`);
    try {
      execSync(
        `ffmpeg -ss ${frame.time} -i "${MP4_FILE}" -vframes 1 -q:v 2 "${outputFile}" -y`,
        { stdio: 'pipe' }
      );
      console.log(`  ✅ ${frame.desc}`);
    } catch (error) {
      console.log(`  ❌ ${frame.desc} - failed`);
    }
  }

  // Get video info
  console.log('\n📊 Video stream analysis:');
  try {
    const probe = execSync(`ffprobe -v error -show_streams -select_streams v:0 "${MP4_FILE}"`, { encoding: 'utf-8' });
    const durationMatch = probe.match(/duration=(\d+\.\d+)/);
    if (durationMatch) {
      console.log(`  Video duration: ${durationMatch[1]}s`);
    }
  } catch (error) {
    console.log('  Failed to analyze video');
  }

  console.log('\n📊 Audio stream analysis:');
  try {
    const probe = execSync(`ffprobe -v error -show_streams -select_streams a:0 "${MP4_FILE}"`, { encoding: 'utf-8' });
    const durationMatch = probe.match(/duration=(\d+\.\d+)/);
    if (durationMatch) {
      console.log(`  Audio duration: ${durationMatch[1]}s`);
    }
  } catch (error) {
    console.log('  Failed to analyze audio');
  }

  console.log(`\n✅ Frames extracted to: ${FRAMES_DIR}`);
  console.log('\nMANUAL VERIFICATION REQUIRED:');
  console.log('  1. first-frame.png - No invitation screen, no player controls');
  console.log('  2. middle-contribution.png - Watermark visible, celebration fills frame');
  console.log('  3. final-seconds.png - Branded closing card visible');
  console.log(`\nTo view: open "${FRAMES_DIR}"`);
  console.log(`To watch video: open "${MP4_FILE}"`);
}

verifyExport().catch(console.error);
