/**
 * CINEMATIC SCENE TOKEN VALIDATION SCRIPT
 *
 * Standalone validation of scene identity token mechanism.
 * Tests that stale timer callbacks cannot advance scenes.
 */

// Mock scene progression engine
class CinematicSceneEngine {
  constructor() {
    this.sceneIndex = 0;
    this.sceneToken = 0;
    this.timer = null;
    this.advanceLog = [];
  }

  get currentScene() {
    return this.sceneIndex;
  }

  get currentToken() {
    return this.sceneToken;
  }

  get transitions() {
    return [...this.advanceLog];
  }

  /**
   * Start scene with token
   */
  startScene(sceneIndex, duration = 100) {
    this.sceneIndex = sceneIndex;
    this.sceneToken++;

    const thisSceneToken = this.sceneToken;

    // Clear old timer
    if (this.timer) {
      clearTimeout(this.timer);
    }

    // Create new timer with captured token
    this.timer = setTimeout(() => {
      this.timerCallback(thisSceneToken);
    }, duration);

    return thisSceneToken;
  }

  /**
   * Timer callback with token validation
   */
  timerCallback(capturedToken) {
    // CRITICAL: Validate token
    if (this.sceneToken !== capturedToken) {
      console.log(`  ✓ [STALE_TIMER_IGNORED] Expected token ${this.sceneToken}, got ${capturedToken}`);
      return;
    }

    // Token valid - advance
    this.advance('TIMER_FINISHED');
  }

  /**
   * Manual next - invalidates token
   */
  manualNext() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    // Invalidate token
    this.sceneToken++;

    this.advance('MANUAL_NEXT');
  }

  /**
   * Manual previous - invalidates token
   */
  manualPrevious() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    // Invalidate token
    this.sceneToken++;

    const from = this.sceneIndex;
    this.sceneIndex = Math.max(0, this.sceneIndex - 1);

    this.advanceLog.push({
      from,
      to: this.sceneIndex,
      event: 'MANUAL_PREVIOUS'
    });
  }

  /**
   * Advance to next scene
   */
  advance(event) {
    const from = this.sceneIndex;
    this.sceneIndex++;

    this.advanceLog.push({
      from,
      to: this.sceneIndex,
      event
    });
  }

  /**
   * Cleanup
   */
  cleanup() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}

// Test helper
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTests() {
  console.log('='.repeat(60));
  console.log('CINEMATIC SCENE TOKEN VALIDATION');
  console.log('='.repeat(60));
  console.log('');

  let passed = 0;
  let failed = 0;

  // TEST A: Photo1 → Photo2 → Photo3 exactly once
  console.log('TEST A: Photo1 → Photo2 → Photo3 exactly once');
  {
    const engine = new CinematicSceneEngine();

    // Photo 1
    const token1 = engine.startScene(0, 50);
    await sleep(60);

    // Photo 2
    const token2 = engine.startScene(1, 50);
    await sleep(60);

    // Photo 3
    const token3 = engine.startScene(2, 50);
    await sleep(60);

    const expected = [
      { from: 0, to: 1, event: 'TIMER_FINISHED' },
      { from: 1, to: 2, event: 'TIMER_FINISHED' },
      { from: 2, to: 3, event: 'TIMER_FINISHED' }
    ];

    if (JSON.stringify(engine.transitions) === JSON.stringify(expected)) {
      console.log('  ✓ PASS: All 3 photos advanced exactly once\n');
      passed++;
    } else {
      console.log('  ✗ FAIL: Unexpected transitions:', engine.transitions, '\n');
      failed++;
    }

    engine.cleanup();
  }

  // TEST B: Stale timer from Scene N cannot advance Scene N+1
  console.log('TEST B: Stale timer cannot advance new scene');
  {
    const engine = new CinematicSceneEngine();

    // Start scene 0 with 100ms timer
    const token0 = engine.startScene(0, 100);
    console.log(`  Scene 0 started with token ${token0}`);

    // Immediately advance to scene 1 manually (before timer fires)
    engine.manualNext();
    console.log(`  Manual next to scene 1, token now ${engine.currentToken}`);

    // Start scene 1 with LONGER timer (500ms)
    const token1 = engine.startScene(1, 500);
    console.log(`  Scene 1 started with token ${token1}`);

    // Wait for old scene 0 timer to fire (should be ignored)
    // Old timer at 100ms, new timer at 500ms
    await sleep(110);

    // Verify: Still at scene 1 (old timer rejected, new timer hasn't fired yet)
    // Should only have 1 transition (the manual next)
    if (engine.currentScene === 1 && engine.transitions.length === 1) {
      console.log('  ✓ PASS: Stale timer was ignored\n');
      passed++;
    } else {
      console.log(`  ✗ FAIL: Expected scene 1 with 1 transition, got scene ${engine.currentScene} with ${engine.transitions.length} transitions\n`);
      failed++;
    }

    engine.cleanup();
  }

  // TEST C: Manual Next before timer fires
  console.log('TEST C: Manual Next before timer fires = one transition');
  {
    const engine = new CinematicSceneEngine();

    engine.startScene(0, 200);

    // Manual next after 50ms (before timer)
    await sleep(50);
    engine.manualNext();

    // Wait for old timer (should be ignored)
    await sleep(160);

    if (engine.currentScene === 1 && engine.transitions.length === 1) {
      console.log('  ✓ PASS: Exactly one transition\n');
      passed++;
    } else {
      console.log(`  ✗ FAIL: Expected 1 transition, got ${engine.transitions.length}\n`);
      failed++;
    }

    engine.cleanup();
  }

  // TEST D: Rapid manual controls
  console.log('TEST D: Multiple rapid manual controls');
  {
    const engine = new CinematicSceneEngine();

    engine.startScene(0, 1000);
    engine.manualNext();
    engine.manualNext();
    engine.manualNext();

    await sleep(1100);

    if (engine.currentScene === 3 && engine.transitions.length === 3) {
      console.log('  ✓ PASS: No phantom advances\n');
      passed++;
    } else {
      console.log(`  ✗ FAIL: Expected 3 transitions, got ${engine.transitions.length}\n`);
      failed++;
    }

    engine.cleanup();
  }

  // TEST E: Token increments correctly
  console.log('TEST E: Token increments monotonically');
  {
    const engine = new CinematicSceneEngine();

    const t1 = engine.startScene(0, 50);
    await sleep(60);
    const t2 = engine.startScene(1, 50);
    await sleep(60);
    const t3 = engine.startScene(2, 50);

    if (t1 === 1 && t2 === 2 && t3 === 3) {
      console.log('  ✓ PASS: Tokens increment correctly\n');
      passed++;
    } else {
      console.log(`  ✗ FAIL: Token sequence incorrect: ${t1}, ${t2}, ${t3}\n`);
      failed++;
    }

    engine.cleanup();
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
    console.log('✓ ALL TESTS PASSED - Scene token mechanism verified');
    process.exit(0);
  } else {
    console.log('✗ SOME TESTS FAILED - Token mechanism needs review');
    process.exit(1);
  }
}

// Run tests
runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
