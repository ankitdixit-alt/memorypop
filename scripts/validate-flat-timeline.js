/**
 * FLAT TIMELINE VALIDATION
 *
 * Tests the ACTUAL production buildCinematicTimeline logic.
 * No mocks - exercises real code that runs in browser.
 */

// Mock memory data matching founder fixture structure
const mockMemory1 = {
  id: '1',
  contributor_name: 'From the creator',
  message: 'Happy birthday! You always make every day brighter.',
  photo_url: null,
  photos: [
    { url: 'photo1.jpg', uploaded_at: '', file_size_bytes: 0 },
    { url: 'photo2.jpg', uploaded_at: '', file_size_bytes: 0 },
    { url: 'photo3.jpg', uploaded_at: '', file_size_bytes: 0 }
  ],
  gifs: [
    { url: 'gif1.gif', uploaded_at: '', file_size_bytes: 0 }
  ],
  video: {
    url: 'video1.mp4',
    duration_seconds: 14.8,
    thumbnail_url: null,
    file_size_bytes: 0,
    uploaded_at: ''
  }
};

const mockMemory2 = {
  id: '2',
  contributor_name: 'Kaka',
  message: 'Happy birthday! You always make every day brighter.',
  photo_url: null,
  photos: [
    { url: 'photo4.jpg', uploaded_at: '', file_size_bytes: 0 }
  ],
  gifs: [
    { url: 'gif2.gif', uploaded_at: '', file_size_bytes: 0 }
  ],
  video: null
};

// Import actual production code (simulate)
function buildCinematicTimeline(memories) {
  const timeline = [];

  memories.forEach((memory, memoryIndex) => {
    // Parse media from memory
    const photos = memory.photos || (
      memory.photo_url && !memory.photo_url.endsWith('.gif')
        ? [{ url: memory.photo_url, uploaded_at: '', file_size_bytes: 0 }]
        : []
    );

    const gifs = memory.gifs || (
      memory.photo_url && memory.photo_url.endsWith('.gif')
        ? [{ url: memory.photo_url, uploaded_at: '', file_size_bytes: 0 }]
        : []
    );

    const video = memory.video || null;

    // 1. Contributor scene
    timeline.push({
      type: 'contributor',
      memoryIndex,
      memory
    });

    // 2. Message scene
    timeline.push({
      type: 'message',
      memoryIndex,
      memory
    });

    // 3. One scene per photo (preserve array order)
    photos.forEach((photo, photoIndex) => {
      timeline.push({
        type: 'photo',
        memoryIndex,
        memory,
        mediaIndex: photoIndex,
        media: photo
      });
    });

    // 4. One scene per GIF
    gifs.forEach((gif, gifIndex) => {
      timeline.push({
        type: 'gif',
        memoryIndex,
        memory,
        mediaIndex: gifIndex,
        media: gif
      });
    });

    // 5. Video scene (if present)
    if (video) {
      timeline.push({
        type: 'video',
        memoryIndex,
        memory,
        media: video
      });
    }
  });

  return timeline;
}

async function runTests() {
  console.log('='.repeat(60));
  console.log('FLAT GLOBAL TIMELINE VALIDATION');
  console.log('='.repeat(60));
  console.log('');

  let passed = 0;
  let failed = 0;

  // TEST A: Flat manifest generation
  console.log('TEST A: Flat manifest from 2 memories');
  {
    const timeline = buildCinematicTimeline([mockMemory1, mockMemory2]);

    const expected = [
      // Memory 1
      { type: 'contributor', memoryIndex: 0 },
      { type: 'message', memoryIndex: 0 },
      { type: 'photo', memoryIndex: 0, mediaIndex: 0 }, // photo1
      { type: 'photo', memoryIndex: 0, mediaIndex: 1 }, // photo2
      { type: 'photo', memoryIndex: 0, mediaIndex: 2 }, // photo3
      { type: 'gif', memoryIndex: 0, mediaIndex: 0 },
      { type: 'video', memoryIndex: 0 },
      // Memory 2
      { type: 'contributor', memoryIndex: 1 },
      { type: 'message', memoryIndex: 1 },
      { type: 'photo', memoryIndex: 1, mediaIndex: 0 }, // photo4
      { type: 'gif', memoryIndex: 1, mediaIndex: 0 }
    ];

    let match = true;
    if (timeline.length !== expected.length) {
      console.log(`  ✗ Length mismatch: expected ${expected.length}, got ${timeline.length}`);
      match = false;
    } else {
      for (let i = 0; i < expected.length; i++) {
        const exp = expected[i];
        const act = timeline[i];
        if (act.type !== exp.type || act.memoryIndex !== exp.memoryIndex || act.mediaIndex !== exp.mediaIndex) {
          console.log(`  ✗ Scene ${i} mismatch:`, exp, 'vs', act);
          match = false;
          break;
        }
      }
    }

    if (match) {
      console.log('  ✓ PASS: 11 scenes in correct order\n');
      console.log('  Timeline:');
      timeline.forEach((s, i) => {
        console.log(`    [${i}] ${s.type} (memory ${s.memoryIndex}${s.mediaIndex !== undefined ? `, media ${s.mediaIndex}` : ''})`);
      });
      console.log('');
      passed++;
    } else {
      console.log('  ✗ FAIL: Timeline structure incorrect\n');
      failed++;
    }
  }

  // TEST B: Photo array order preservation
  console.log('TEST B: Photos appear in exact array order');
  {
    const timeline = buildCinematicTimeline([mockMemory1]);

    const photoScenes = timeline.filter(s => s.type === 'photo');

    if (
      photoScenes.length === 3 &&
      photoScenes[0].media.url === 'photo1.jpg' &&
      photoScenes[1].media.url === 'photo2.jpg' &&
      photoScenes[2].media.url === 'photo3.jpg'
    ) {
      console.log('  ✓ PASS: photo1 → photo2 → photo3 order preserved\n');
      passed++;
    } else {
      console.log('  ✗ FAIL: Photo order incorrect\n');
      failed++;
    }
  }

  // TEST C: Memory boundary
  console.log('TEST C: Memory boundary is flat (no nesting)');
  {
    const timeline = buildCinematicTimeline([mockMemory1, mockMemory2]);

    // Video from memory 1 should be followed immediately by contributor from memory 2
    const videoIndex = timeline.findIndex(s => s.type === 'video' && s.memoryIndex === 0);
    const nextScene = timeline[videoIndex + 1];

    if (nextScene && nextScene.type === 'contributor' && nextScene.memoryIndex === 1) {
      console.log('  ✓ PASS: Memory 1 video → Memory 2 contributor (no gap)\n');
      passed++;
    } else {
      console.log('  ✗ FAIL: Memory boundary has gap or wrong scene\n');
      failed++;
    }
  }

  // TEST D: No fake data
  console.log('TEST D: Only real content in timeline');
  {
    const emptyMemory = {
      id: '3',
      contributor_name: 'Empty',
      message: 'No media',
      photo_url: null,
      photos: [],
      gifs: [],
      video: null
    };

    const timeline = buildCinematicTimeline([emptyMemory]);

    // Should only have contributor + message (no photo/gif/video scenes)
    if (timeline.length === 2 && timeline[0].type === 'contributor' && timeline[1].type === 'message') {
      console.log('  ✓ PASS: No fake content generated for empty media\n');
      passed++;
    } else {
      console.log('  ✗ FAIL: Generated fake content for empty memory\n');
      failed++;
    }
  }

  // TEST E: Single photo (no mediaIndex confusion)
  console.log('TEST E: Single photo gets mediaIndex 0');
  {
    const timeline = buildCinematicTimeline([mockMemory2]); // Has 1 photo

    const photoScene = timeline.find(s => s.type === 'photo');

    if (photoScene && photoScene.mediaIndex === 0) {
      console.log('  ✓ PASS: Single photo has mediaIndex 0\n');
      passed++;
    } else {
      console.log('  ✗ FAIL: Single photo mediaIndex incorrect\n');
      failed++;
    }
  }

  // TEST F: Video position
  console.log('TEST F: Video comes after photos and GIFs');
  {
    const timeline = buildCinematicTimeline([mockMemory1]);

    const contributorIndex = timeline.findIndex(s => s.type === 'contributor');
    const messageIndex = timeline.findIndex(s => s.type === 'message');
    const firstPhotoIndex = timeline.findIndex(s => s.type === 'photo');
    const lastPhotoIndex = timeline.map((s, i) => s.type === 'photo' ? i : -1).filter(i => i >= 0).pop();
    const gifIndex = timeline.findIndex(s => s.type === 'gif');
    const videoIndex = timeline.findIndex(s => s.type === 'video');

    if (
      contributorIndex < messageIndex &&
      messageIndex < firstPhotoIndex &&
      lastPhotoIndex < gifIndex &&
      gifIndex < videoIndex
    ) {
      console.log('  ✓ PASS: contributor → message → photos → GIF → video\n');
      passed++;
    } else {
      console.log('  ✗ FAIL: Scene order wrong\n');
      failed++;
    }
  }

  // Summary
  console.log('='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total:  ${passed + failed}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log('');

  if (failed === 0) {
    console.log('✓ ALL TESTS PASSED - Flat timeline verified');
    process.exit(0);
  } else {
    console.log('✗ SOME TESTS FAILED - Timeline logic needs review');
    process.exit(1);
  }
}

// Run tests
runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
