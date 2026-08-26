/**
 * GLOBAL CINEMATIC CONTROLLER
 *
 * Single-source cinematic progression for entire reveal.
 * Replaces parent-memory + child-scene split architecture.
 *
 * ONE global timeline
 * ONE currentSceneIndex
 * ONE timer owner
 * ONE state machine
 *
 * No nested per-memory autoplay.
 * No component remounting at memory boundaries.
 */

"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { buildCinematicTimeline, getSceneDuration, getMemoryInfo } from "@/lib/buildCinematicTimeline";
import type { CinematicScene, Memory } from "@/lib/buildCinematicTimeline";
import type { MediaItem, VideoMedia } from "@/components/memory-experience/types";

// Global playback state
type PlaybackState =
  | 'PLAYING'
  | 'PAUSED'
  | 'VIDEO_PLAYING'
  | 'VIDEO_PAUSED';

interface Props {
  memories: Memory[];
  shareCode: string;
  onComplete: () => void;
  audioRef: React.MutableRefObject<HTMLAudioElement | null>;
  isMusicMuted: boolean;
  onMuteToggle: () => void;
}

export default function GlobalCinematicController({
  memories,
  shareCode,
  onComplete,
  audioRef,
  isMusicMuted,
  onMuteToggle
}: Props) {
  // Build flat global timeline once
  const timeline = useRef(buildCinematicTimeline(memories)).current;
  const totalScenes = timeline.length;

  // SINGLE SOURCE OF TRUTH: Global scene index
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [playbackState, setPlaybackState] = useState<PlaybackState>('PLAYING');
  const [showControls, setShowControls] = useState(true); // Start visible

  // Timer ownership
  const sceneTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sceneStartTimeRef = useRef<number>(0);
  const remainingTimeRef = useRef<number>(0);
  const sceneTokenRef = useRef<number>(0); // Scene identity for stale callback defense

  // Video ref
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Auto-fade controls timer
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentScene = timeline[currentSceneIndex];
  const previousScene = currentSceneIndex > 0 ? timeline[currentSceneIndex - 1] : null;
  const isLastScene = currentSceneIndex === totalScenes - 1;
  const memoryInfo = currentScene ? getMemoryInfo(currentScene, memories.length) : null;

  // Check if message scene was already shown in previous contributor scene
  const messageWasShownInContributor =
    currentScene?.type === 'message' &&
    previousScene?.type === 'contributor' &&
    previousScene.memoryIndex === currentScene.memoryIndex;

  // DEV TRACE: Log manifest on mount
  useEffect(() => {
    console.log('[GLOBAL_TIMELINE_MANIFEST]', {
      totalScenes,
      scenes: timeline.map((s, i) => ({
        index: i,
        type: s.type,
        memory: s.memoryIndex,
        contributor: s.memory.contributor_name
      }))
    });
  }, []);

  /**
   * Clear active timer
   */
  const clearTimer = () => {
    if (sceneTimerRef.current) {
      clearTimeout(sceneTimerRef.current);
      sceneTimerRef.current = null;
    }
  };

  /**
   * Start scene timer with token validation
   */
  const startTimer = (duration: number, sceneToken: number) => {
    clearTimer();
    sceneStartTimeRef.current = Date.now();
    remainingTimeRef.current = duration;

    sceneTimerRef.current = setTimeout(() => {
      // Validate token
      if (sceneTokenRef.current !== sceneToken) {
        console.warn('[STALE_TIMER_IGNORED]', {
          expectedToken: sceneTokenRef.current,
          callbackToken: sceneToken,
          currentSceneIndex
        });
        return;
      }

      console.log('[TIMER_FINISHED]', {
        sceneIndex: currentSceneIndex,
        sceneType: currentScene?.type,
        token: sceneToken
      });

      advanceScene();
    }, duration);
  };

  /**
   * Advance to next scene (SINGLE PROGRESSION MECHANISM)
   */
  const advanceScene = () => {
    console.log('[ADVANCE]', {
      from: currentSceneIndex,
      to: currentSceneIndex + 1,
      type: currentScene?.type,
      isLast: isLastScene
    });

    if (isLastScene) {
      // Restore soundtrack before completing
      if (audioRef?.current && !isMusicMuted) {
        audioRef.current.play();
      }
      console.log('[CINEMATIC_COMPLETE]');
      onComplete();
    } else {
      setCurrentSceneIndex(prev => prev + 1);
    }
  };

  /**
   * Go to previous scene
   */
  const goBack = () => {
    if (currentSceneIndex > 0) {
      console.log('[GO_BACK]', {
        from: currentSceneIndex,
        to: currentSceneIndex - 1
      });
      setCurrentSceneIndex(prev => prev - 1);
    }
  };

  /**
   * Manual Next
   */
  const handleNext = () => {
    console.log('[MANUAL_NEXT]', {
      from: currentSceneIndex,
      sceneType: currentScene?.type
    });

    clearTimer();
    sceneTokenRef.current++; // Invalidate pending timers

    // If leaving video, restore soundtrack
    if (currentScene?.type === 'video' && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      if (audioRef?.current && !isMusicMuted) {
        audioRef.current.play();
      }
    }

    advanceScene();
  };

  /**
   * Manual Previous
   */
  const handlePrevious = () => {
    console.log('[MANUAL_PREVIOUS]', {
      from: currentSceneIndex,
      sceneType: currentScene?.type
    });

    clearTimer();
    sceneTokenRef.current++; // Invalidate pending timers

    // If leaving video, restore soundtrack
    if (currentScene?.type === 'video' && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      if (audioRef?.current && !isMusicMuted) {
        audioRef.current.play();
      }
    }

    goBack();
  };

  /**
   * Pause/Resume
   */
  const handlePause = () => {
    if (playbackState === 'PLAYING') {
      console.log('[PAUSE]', { sceneIndex: currentSceneIndex });

      clearTimer();

      // Calculate remaining time
      const elapsed = Date.now() - sceneStartTimeRef.current;
      remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);

      // Pause soundtrack
      if (audioRef?.current) {
        audioRef.current.pause();
      }

      setPlaybackState('PAUSED');
    } else if (playbackState === 'PAUSED') {
      console.log('[RESUME]', {
        sceneIndex: currentSceneIndex,
        remainingTime: remainingTimeRef.current
      });

      // Resume with current token (same scene)
      startTimer(remainingTimeRef.current, sceneTokenRef.current);

      // Resume soundtrack
      if (audioRef?.current && !isMusicMuted) {
        audioRef.current.play();
      }

      setPlaybackState('PLAYING');
    } else if (playbackState === 'VIDEO_PLAYING') {
      console.log('[VIDEO_PAUSE]', { sceneIndex: currentSceneIndex });
      if (videoRef.current) {
        videoRef.current.pause();
      }
      setPlaybackState('VIDEO_PAUSED');
    } else if (playbackState === 'VIDEO_PAUSED') {
      console.log('[VIDEO_RESUME]', { sceneIndex: currentSceneIndex });
      if (videoRef.current) {
        videoRef.current.play();
      }
      setPlaybackState('VIDEO_PLAYING');
    }
  };

  /**
   * Video ended
   */
  const handleVideoEnded = () => {
    console.log('[VIDEO_ENDED]', {
      sceneIndex: currentSceneIndex,
      token: sceneTokenRef.current
    });

    // Restore soundtrack
    if (audioRef?.current && !isMusicMuted) {
      audioRef.current.play();
    }

    advanceScene();
  };

  /**
   * Scene change effect - SINGLE PROGRESSION OWNER
   */
  useEffect(() => {
    if (!currentScene) return;

    // Increment scene token to invalidate stale timers
    const thisSceneToken = ++sceneTokenRef.current;

    console.log('[SCENE_ENTRY]', {
      sceneIndex: currentSceneIndex,
      type: currentScene.type,
      memoryIndex: currentScene.memoryIndex,
      contributor: currentScene.memory.contributor_name,
      token: thisSceneToken
    });

    // Detect and bypass redundant message scene
    const previousScene = currentSceneIndex > 0 ? timeline[currentSceneIndex - 1] : null;
    const isRedundantMessage =
      currentScene.type === 'message' &&
      previousScene?.type === 'contributor' &&
      previousScene.memoryIndex === currentScene.memoryIndex;

    if (isRedundantMessage) {
      console.log('[BYPASS_REDUNDANT_MESSAGE]', {
        sceneIndex: currentSceneIndex,
        token: thisSceneToken,
        reason: 'message already shown in previous contributor scene'
      });

      // Allow ~500ms for graceful transition fade, then advance
      const bypassTimer = setTimeout(() => {
        if (sceneTokenRef.current === thisSceneToken) {
          advanceScene();
        }
      }, 500);

      return () => {
        clearTimeout(bypassTimer);
        console.log('[SCENE_EXIT]', {
          sceneIndex: currentSceneIndex,
          type: currentScene.type,
          token: thisSceneToken
        });
      };
    }

    setPlaybackState('PLAYING');

    if (currentScene.type === 'video') {
      // Video scene - pause soundtrack, no timer
      if (audioRef?.current) {
        audioRef.current.pause();
      }
      setPlaybackState('VIDEO_PLAYING');
    } else {
      // Non-video scene - start timer
      const duration = getSceneDuration(currentScene);
      startTimer(duration, thisSceneToken);

      // Ensure soundtrack playing
      if (audioRef?.current && !isMusicMuted && playbackState !== 'PAUSED') {
        audioRef.current.play();
      }
    }

    // Cleanup
    return () => {
      clearTimer();
      console.log('[SCENE_EXIT]', {
        sceneIndex: currentSceneIndex,
        type: currentScene.type,
        token: thisSceneToken
      });
    };
  }, [currentSceneIndex]);

  /**
   * Reset controls fade timer
   */
  const resetControlsTimer = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 2500); // 2.5 seconds
  };

  /**
   * Show controls on interaction
   */
  const handleInteraction = () => {
    resetControlsTimer();
  };

  /**
   * Auto-fade controls on desktop
   */
  useEffect(() => {
    const handleMouseMove = () => resetControlsTimer();
    const handleKeyDown = () => setShowControls(true);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', handleKeyDown);

    resetControlsTimer(); // Initial timer

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Keyboard navigation (desktop only)
   */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore keyboard events when focus is in input elements
      const target = event.target as HTMLElement;
      const tagName = target.tagName.toLowerCase();
      const isEditable = target.contentEditable === 'true';

      if (
        tagName === 'input' ||
        tagName === 'textarea' ||
        tagName === 'select' ||
        tagName === 'button' ||
        isEditable
      ) {
        return; // Let input elements handle their own keyboard events
      }

      switch (event.key) {
        case 'ArrowRight':
          event.preventDefault();
          handleNext(); // Reuse existing NEXT action
          break;
        case 'ArrowLeft':
          event.preventDefault();
          handlePrevious(); // Reuse existing PREVIOUS action
          break;
        case ' ': // Space bar
          event.preventDefault();
          handlePause(); // Reuse existing PAUSE/RESUME action
          break;
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentSceneIndex, playbackState]); // Re-bind when scene or playback state changes

  if (!currentScene) {
    return null;
  }

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center bg-[#fff8ef]"
      onMouseMove={handleInteraction}
      onTouchStart={handleInteraction}
    >
      {/* Music control */}
      <div className="absolute top-6 left-6 z-20">
        <button
          onClick={onMuteToggle}
          className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/90 hover:bg-white shadow-sm text-sm text-[#856b5f] hover:text-[#3a241e] transition-all"
          aria-label={isMusicMuted ? "Unmute music" : "Mute music"}
        >
          {isMusicMuted ? (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
              <span className="font-medium">Muted</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
              <span className="font-medium">Music</span>
            </>
          )}
        </button>
      </div>

      {/* Exit to Memory Wall */}
      <div className="absolute top-6 right-6 z-20">
        <a
          href={`/m/${shareCode}?view=browse`}
          className="text-sm text-[#856b5f] hover:text-[#3a241e] transition-colors px-3 py-2 rounded-full bg-white/90 hover:bg-white shadow-sm"
        >
          Exit
        </a>
      </div>

      {/* Progress indicator */}
      {memoryInfo && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 bg-white/90 px-4 py-2 rounded-full shadow-sm">
          <span className="text-xs text-gray-500 opacity-70">
            {memoryInfo.currentMemory} of {memoryInfo.totalMemories} memories
          </span>
        </div>
      )}

      {/* Scene renderer */}
      <div className="w-full max-w-4xl px-6">
        {currentScene.type === 'contributor' && (
          <div className="flex items-center justify-center min-h-[60vh] animate-fade-in">
            <div className="flex flex-col items-center justify-center px-6 md:px-12 text-center">
              {/* Peek ahead and show message from next scene if available */}
              {timeline[currentSceneIndex + 1]?.type === 'message' && timeline[currentSceneIndex + 1]?.memory.message && (
                <>
                  <p className="text-xl md:text-3xl lg:text-4xl leading-relaxed text-gray-800">
                    "{timeline[currentSceneIndex + 1].memory.message}"
                  </p>
                  <p className="text-sm md:text-lg text-gray-600 mt-6">
                    — {currentScene.memory.contributor_name}
                  </p>
                </>
              )}
              {/* Fallback: Show just contributor name if next scene isn't a message */}
              {(!timeline[currentSceneIndex + 1] || timeline[currentSceneIndex + 1]?.type !== 'message') && (
                <h2 className="text-4xl md:text-5xl font-bold text-[#3a241e]">
                  {currentScene.memory.contributor_name}
                </h2>
              )}
            </div>
          </div>
        )}

        {currentScene.type === 'message' && !messageWasShownInContributor && (
          <div className="flex items-center justify-center min-h-[60vh] animate-fade-in">
            <div className="flex flex-col items-center justify-center px-6 md:px-12 text-center">
              <p className="text-xl md:text-3xl lg:text-4xl leading-relaxed text-gray-800">
                "{currentScene.memory.message || `${currentScene.memory.contributor_name} shared a memory for you.`}"
              </p>
              <p className="text-sm md:text-lg text-gray-600 mt-6">
                — {currentScene.memory.contributor_name}
              </p>
            </div>
          </div>
        )}

        {currentScene.type === 'message' && messageWasShownInContributor && (
          <div className="flex items-center justify-center min-h-[60vh]">
            {/* Message already shown in previous contributor scene - silent timer scene */}
          </div>
        )}

        {currentScene.type === 'photo' && currentScene.media && (
          <div className="flex flex-col items-center justify-center h-screen animate-fade-in">
            {/* Top spacer for controls */}
            <div className="flex-shrink-0 h-20" />

            {/* Media viewport with calculated max height */}
            <div
              className="flex-shrink-0 flex items-center justify-center w-full px-4"
              style={{
                maxHeight: 'calc(100vh - 260px)',
                height: 'calc(100vh - 260px)'
              }}
            >
              <img
                src={(currentScene.media as MediaItem).url}
                alt={`Memory photo ${(currentScene.mediaIndex || 0) + 1}`}
                className="rounded-2xl shadow-2xl animate-ken-burns max-h-full max-w-full object-contain"
              />
            </div>

            {/* Caption below with controlled height - editorial style */}
            <div className="flex-shrink-0 px-6 py-4 md:py-6 max-w-3xl mx-auto">
              {currentScene.memory.message && (
                <>
                  <p className="text-base md:text-lg lg:text-xl text-gray-700 italic leading-relaxed">
                    "{currentScene.memory.message}"
                  </p>
                  <p className="text-sm md:text-base text-gray-500 mt-2">
                    — {currentScene.memory.contributor_name}
                  </p>
                </>
              )}
              {!currentScene.memory.message && (
                <p className="text-base md:text-lg text-gray-500 italic">
                  From {currentScene.memory.contributor_name}
                </p>
              )}
            </div>

            {/* Bottom spacer for controls */}
            <div className="flex-shrink-0 h-20" />
          </div>
        )}

        {currentScene.type === 'gif' && currentScene.media && (
          <div className="flex flex-col items-center justify-center h-screen animate-fade-in">
            {/* Top spacer for controls */}
            <div className="flex-shrink-0 h-20" />

            {/* Media viewport with calculated max height */}
            <div
              className="flex-shrink-0 flex items-center justify-center w-full px-4 relative"
              style={{
                maxHeight: 'calc(100vh - 260px)',
                height: 'calc(100vh - 260px)'
              }}
            >
              <img
                src={(currentScene.media as MediaItem).url}
                alt="Animated memory"
                className="rounded-2xl shadow-2xl max-h-full max-w-full object-contain"
              />
              <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-semibold">
                GIF
              </div>
            </div>

            {/* Caption below with controlled height - editorial style */}
            <div className="flex-shrink-0 px-6 py-4 md:py-6 max-w-3xl mx-auto">
              {currentScene.memory.message && (
                <>
                  <p className="text-base md:text-lg lg:text-xl text-gray-700 italic leading-relaxed">
                    "{currentScene.memory.message}"
                  </p>
                  <p className="text-sm md:text-base text-gray-500 mt-2">
                    — {currentScene.memory.contributor_name}
                  </p>
                </>
              )}
              {!currentScene.memory.message && (
                <p className="text-base md:text-lg text-gray-500 italic">
                  From {currentScene.memory.contributor_name}
                </p>
              )}
            </div>

            {/* Bottom spacer for controls */}
            <div className="flex-shrink-0 h-20" />
          </div>
        )}

        {currentScene.type === 'video' && currentScene.media && (
          <div
            className="flex items-center justify-center animate-fade-in"
            style={{
              maxHeight: 'calc(100vh - 160px)',
              height: 'calc(100vh - 160px)'
            }}
          >
            <div className="relative w-full h-full max-w-3xl px-6">
              <video
                ref={videoRef}
                src={(currentScene.media as VideoMedia).url}
                controls
                autoPlay
                className="rounded-2xl shadow-2xl bg-black"
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  width: 'auto',
                  height: 'auto',
                  objectFit: 'contain',
                  margin: '0 auto',
                  display: 'block'
                }}
                onEnded={handleVideoEnded}
              />
              <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-semibold">
                {(currentScene.media as VideoMedia).duration_seconds.toFixed(1)}s
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Manual controls */}
      <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 z-20 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-30'}`}>
        <div className="flex items-center gap-2 bg-black/80 px-4 py-2 rounded-full shadow-lg">
          <button
            onClick={handlePrevious}
            disabled={currentSceneIndex === 0}
            className="text-white hover:text-[#FF6B57] disabled:text-gray-500 disabled:cursor-not-allowed transition-colors min-w-11 min-h-11 flex items-center justify-center"
            aria-label="Previous"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={handlePause}
            className="text-white hover:text-[#FF6B57] transition-colors min-w-11 min-h-11 flex items-center justify-center"
            aria-label={playbackState === 'PAUSED' || playbackState === 'VIDEO_PAUSED' ? "Play" : "Pause"}
          >
            {playbackState === 'PAUSED' || playbackState === 'VIDEO_PAUSED' ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </button>

          <button
            onClick={handleNext}
            disabled={isLastScene}
            className="text-white hover:text-[#FF6B57] disabled:text-gray-500 disabled:cursor-not-allowed transition-colors min-w-11 min-h-11 flex items-center justify-center"
            aria-label="Next"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes ken-burns {
          0% {
            transform: scale(1);
          }
          100% {
            transform: scale(1.05);
          }
        }

        .animate-fade-in {
          animation: fade-in 800ms ease-out;
        }

        .animate-ken-burns {
          animation: ken-burns 5s ease-in-out forwards;
        }
      `}</style>
    </div>
  );
}
