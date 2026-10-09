/**
 * Verify download filename and button styling fixes
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { promises as fs } from 'fs';
import path from 'path';

const execAsync = promisify(exec);

async function verifyFixes() {
  console.log('🔍 Verifying Download Fixes\n');

  const resultsDir = path.join(process.cwd(), 'test-results', `verify-${Date.now()}`);
  await fs.mkdir(resultsDir, { recursive: true });

  try {
    // Test 1: Verify filename has .mp4 extension via HTTP headers
    console.log('📝 Test 1: Verify filename extension in Content-Disposition\n');

    const jobIds = [
      { name: 'photo-rich', jobId: 'c571f49d-3782-4734-a2c9-e11b32f49c4e' },
      { name: 'text-only', jobId: 'a7f63aa0-31ff-4148-8d23-cb23ea7d604a' }
    ];

    for (const { name, jobId } of jobIds) {
      console.log(`   Testing ${name} (${jobId})...`);

      const { stdout } = await execAsync(
        `curl -s -I "http://localhost:3000/api/export/download?jobId=${jobId}" | grep -i "content-disposition"`
      );

      console.log(`   Response: ${stdout.trim()}`);

      // Extract filename from Content-Disposition header
      const match = stdout.match(/filename="([^"]+)"/);
      if (!match) {
        throw new Error('❌ Could not extract filename from Content-Disposition header');
      }

      const filename = match[1];
      console.log(`   Filename: ${filename}`);

      // Verify it ends with .mp4
      if (!filename.endsWith('.mp4')) {
        throw new Error(`❌ Filename does NOT end with .mp4: ${filename}`);
      }
      console.log(`   ✅ Filename ends with .mp4`);

      // Verify no consecutive hyphens or hyphen before extension
      if (filename.includes('--') || filename.includes('-.mp4')) {
        console.log(`   ⚠️  Warning: Filename has formatting issues: ${filename}`);
      }

      console.log('');
    }

    // Test 2: Download actual files and verify they decode
    console.log('\n📥 Test 2: Download and verify video files\n');

    for (const { name, jobId } of jobIds) {
      console.log(`   Downloading ${name}...`);

      const outputFile = path.join(resultsDir, `${name}-test.mp4`);

      await execAsync(
        `curl -s "http://localhost:3000/api/export/download?jobId=${jobId}" -o "${outputFile}"`
      );

      // Check file size
      const stats = await fs.stat(outputFile);
      console.log(`   Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

      if (stats.size === 0) {
        throw new Error('❌ Downloaded file is empty');
      }

      // Verify video format
      const { stdout: probeOutput } = await execAsync(
        `ffprobe -v error -show_entries format=duration:stream=codec_name,width,height -of default=noprint_wrappers=1 "${outputFile}"`
      );

      const hasH264 = probeOutput.includes('codec_name=h264');
      const hasAAC = probeOutput.includes('codec_name=aac');
      const has1920x1080 = probeOutput.includes('width=1920') && probeOutput.includes('height=1080');

      if (!hasH264 || !hasAAC || !has1920x1080) {
        throw new Error('❌ Video format incorrect');
      }

      console.log(`   ✅ Video decodes correctly (H.264, AAC, 1920×1080)\n`);
    }

    // Test 3: Verify button component returns consistent structure
    console.log('\n🔧 Test 3: Verify button component structure\n');

    const componentPath = 'src/components/DownloadRevealButton.tsx';
    const componentContent = await fs.readFile(componentPath, 'utf-8');

    // Check that helper text is rendered separately from button
    if (!componentContent.includes('renderHelperText()')) {
      throw new Error('❌ Component does not have separate renderHelperText function');
    }
    console.log('   ✅ Component has separate renderHelperText function');

    // Check that all button states return just button element
    const renderButtonMatch = componentContent.match(/const renderButton = \(\) => \{([\s\S]*?)\n  \};/);
    if (!renderButtonMatch) {
      throw new Error('❌ Could not find renderButton function');
    }

    const renderButtonCode = renderButtonMatch[1];

    // Verify all cases return button element (not wrapped in divs)
    const cases = ['idle', 'creating', 'processing', 'ready', 'downloading', 'failed'];
    for (const caseState of cases) {
      const caseRegex = new RegExp(`case '${caseState}'[\\s\\S]*?return[\\s\\S]*?;`, 'g');
      const caseMatch = renderButtonCode.match(caseRegex);

      if (!caseMatch) {
        throw new Error(`❌ Could not find case for state: ${caseState}`);
      }

      const caseCode = caseMatch[0];

      // Check if it returns a button directly (not wrapped in div)
      if (caseCode.includes('<div')) {
        throw new Error(`❌ State '${caseState}' returns button wrapped in div`);
      }

      if (!caseCode.includes('<button')) {
        throw new Error(`❌ State '${caseState}' does not return a button`);
      }
    }

    console.log('   ✅ All button states return consistent button elements');
    console.log('   ✅ No states wrap button in divs that affect layout\n');

    console.log('\n✅ All verifications passed!\n');
    console.log(`📁 Downloaded files saved to: ${resultsDir}\n`);

  } catch (error: any) {
    console.error('\n❌ Verification failed:', error.message);
    throw error;
  }
}

// Run verification
verifyFixes().catch(error => {
  console.error('Verification suite failed:', error);
  process.exit(1);
});
