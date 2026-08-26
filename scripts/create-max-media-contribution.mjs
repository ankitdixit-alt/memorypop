/**
 * Create maximum-media contribution for founder testing
 * 3 photos + 1 GIF + 1 video (15s)
 */

import { readFileSync } from 'fs';
import { basename } from 'path';

const API_BASE = 'http://localhost:3000';
const SHARE_CODE = process.argv[2];

if (!SHARE_CODE) {
  console.error('❌ Usage: node create-max-media-contribution.mjs <shareCode>');
  process.exit(1);
}

async function uploadFile(filePath, mediaType) {
  const fileBuffer = readFileSync(filePath);
  const formData = new FormData();

  const file = new File([fileBuffer], basename(filePath), {
    type: mediaType === 'video' ? 'video/mp4' : mediaType === 'gif' ? 'image/gif' : 'image/jpeg'
  });

  formData.append('file', file);
  formData.append('shareCode', SHARE_CODE);
  formData.append('mediaType', mediaType);

  const response = await fetch(`${API_BASE}/api/upload`, {
    method: 'POST',
    body: formData,
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(`Upload failed: ${result.error}`);
  }

  return result;
}

async function createMaxMediaContribution() {
  console.log('📸 Creating maximum-media contribution...\n');

  // Upload 3 photos (using test video files as placeholders - real photos would be better)
  console.log('1/5 Uploading photo 1...');
  const photo1 = await uploadFile('test-assets/video-valid-14s.mp4', 'photo');
  console.log(`   ✅ ${photo1.publicUrl.substring(0, 60)}...`);

  console.log('2/5 Uploading photo 2...');
  const photo2 = await uploadFile('test-assets/video-valid-15s.mp4', 'photo');
  console.log(`   ✅ ${photo2.publicUrl.substring(0, 60)}...`);

  console.log('3/5 Uploading photo 3...');
  const photo3 = await uploadFile('test-assets/video-over-limit-16s.mp4', 'photo');
  console.log(`   ✅ ${photo3.publicUrl.substring(0, 60)}...`);

  // Upload 1 GIF (using a test video as placeholder)
  console.log('4/5 Uploading GIF...');
  const gif = await uploadFile('test-assets/video-valid-14s.mp4', 'gif');
  console.log(`   ✅ ${gif.publicUrl.substring(0, 60)}...`);

  // Upload 1 video (15s)
  console.log('5/5 Uploading video (15s)...');
  const video = await uploadFile('test-assets/video-valid-15s.mp4', 'video');
  console.log(`   ✅ Duration: ${video.duration}s`);
  console.log(`   Validation proof: ${video.validationProof.substring(0, 20)}...`);

  // Create memory contribution
  console.log('\n📝 Creating memory contribution...');

  const memoryData = {
    shareCode: SHARE_CODE,
    contributorName: 'Testing User',
    message: 'This is a maximum-media contribution for testing Standard multimedia support. It includes a longer message to demonstrate how the experience handles meaningful content alongside three photos, one animated GIF, and one 15-second video.',
    photos: [
      { url: photo1.publicUrl, uploaded_at: new Date().toISOString(), file_size_bytes: photo1.fileSize },
      { url: photo2.publicUrl, uploaded_at: new Date().toISOString(), file_size_bytes: photo2.fileSize },
      { url: photo3.publicUrl, uploaded_at: new Date().toISOString(), file_size_bytes: photo3.fileSize },
    ],
    gifs: [
      { url: gif.publicUrl, uploaded_at: new Date().toISOString(), file_size_bytes: gif.fileSize },
    ],
    video: {
      url: video.publicUrl,
      file_path: video.filePath,
      duration_seconds: video.duration,
      validation_proof: video.validationProof,
      uploaded_at: new Date().toISOString(),
      file_size_bytes: video.fileSize,
    },
  };

  const response = await fetch(`${API_BASE}/api/memories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(memoryData),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(`Memory creation failed: ${result.error}`);
  }

  console.log('✅ Maximum-media contribution created!\n');
  console.log('═'.repeat(60));
  console.log('TESTING URLS');
  console.log('═'.repeat(60));
  console.log(`Memory Wall: http://localhost:3000/m/${SHARE_CODE}`);
  console.log(`Reveal: http://localhost:3000/m/${SHARE_CODE}/reveal`);
  console.log(`Contribute: http://localhost:3000/m/${SHARE_CODE}/contribute`);
  console.log('═'.repeat(60));
  console.log('\n🎯 Ready for founder validation at 390px width');
}

createMaxMediaContribution().catch(err => {
  console.error('💥 Failed:', err.message);
  process.exit(1);
});
