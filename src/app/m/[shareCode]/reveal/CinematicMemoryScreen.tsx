"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import type { MediaItem, VideoMedia } from "@/components/memory-experience/types";

interface Memory {
  id: string;
  contributor_name: string;
  message: string;
  photo_url: string | null;
  photos?: MediaItem[];
  gifs?: MediaItem[];
  video?: VideoMedia | null;
}

// Scene types - each represents one distinct moment
type SceneType = 'contributor' | 'message' | 'photo' | 'gif' | 'video';

interface Scene {
  type: SceneType;
  index?: number; // For photos/gifs with multiple items
  content?: MediaItem | VideoMedia; // Actual media content
}

// Cinematic state machine
type CinematicState =
  | 'PLAYING'         // Auto-progressing, timer active
  | 'PAUSED'          // User paused, timer frozen
  | 'VIDEO_PLAYING'   // Video is playing, timer inactive
  | 'VIDEO_PAUSED'    // Video paused by user
  | 'TRANSITIONING';  // Between scenes

interface Props {
  memory: Memory;
  onComplete: () => void;
  onPrevious: () => void;
  currentIndex: number;
  totalMemories: number;
  shareCode: string;
  onVideoDuck?: () => void;
  onVideoRestore?: () => void;
  onMuteToggle?: () => void;
  isMusicMuted?: boolean;
  audioRef?: React.MutableRefObject<HTMLAudioElement | null>; // Pass parent audio ref for direct control
}

export default function CinematicMemoryScreen({
  memory,
  onComplete,
  onPrevious,
  currentIndex,
  totalMemories,
  shareCode,
  onVideoDuck,
  onVideoRestore,
  onMuteToggle,
  isMusicMuted,
  audioRef: parentAudioRef,
}: Props) {
  // Parse media
  const photos = memory.photos || (memory.photo_url && !memory.photo_url.endsWith('.gif') ? [{ url: memory.photo_url, uploaded_at: '', file_size_bytes: 0 }] : []);
  const gifs = memory.gifs || (memory.photo_url && memory.photo_url.endsWith('.gif') ? [{ url: memory.photo_url, uploaded_at: '', file_size_bytes: 0 }] : []);
  const video = memory.video || null;

  // Build complete scene sequence - ONE SCENE PER ITEM
  const buildSceneSequence = (): Scene[] => {
    const scenes: Scene[] = [];

    // Always show contributor and message first
    scenes.push({ type: 'contributor' });
    scenes.push({ type: 'message' });

    // Individual scene for EACH photo
    photos.forEach((photo, i) => {
      scenes.push({
        type: 'photo',
        index: i,
        content: photo
      });
    });

    // Individual scene for EACH gif
    gifs.forEach((gif, i) => {
      scenes.push({
        type: 'gif',
        index: i,
        content: gif
      });
    });

    // One video scene if present
    if (video) {
      scenes.push({
        type: 'video',
        content: video
      });
    }

    return scenes;
  };

  const sceneSequence = buildSceneSequence();
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [cinematicState, setCinematicState] = useState<CinematicState>('PLAYING');
  const [showControls, setShowControls] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const sceneTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sceneStartTimeRef = useRef<number>(0);
  const remainingTimeRef = useRef<number>(0);
  // Scene identity token - monotonically increasing, invalidates stale timer callbacks
  const sceneTokenRef = useRef<number>(0);

  const currentScene = sceneSequence[currentSceneIndex];
  const isLastScene = currentSceneIndex === sceneSequence.length - 1;

  // Calculate scene duration based on content
  const getSceneDuration = (scene: Scene): number => {
    switch (scene.type) {
      case 'contributor':
        return 3000; // 3 seconds for contributor name
      case 'message':
        // Reading time: ~200 words per minute = ~3.3 words per second
        const words = (memory.message || '').split(/\s+/).length;
        const readingTime = Math.max(4000, words * 300); // Minimum 4s
        return readingTime;
      case 'photo':
        return 5000; // 5 seconds per individual photo
      case 'gif':
        return 6000; // 6 seconds per GIF
      case 'video':
        // Video duration handled by video ended event
        return 0;
      default:
        return 4000;
    }
  };

  // Progress to next scene
  const advanceScene = () => {
    // DEV TRACE: Log transition
    console.log('[CINEMATIC_ADVANCE]', {
      from: {
        memoryIndex: currentIndex,
        sceneIndex: currentSceneIndex,
        sceneType: currentScene?.type,
        token: sceneTokenRef.current
      },
      isLastScene
    });

    if (isLastScene) {
      // Restore soundtrack before completing
      if (parentAudioRef?.current && !isMusicMuted) {
        parentAudioRef.current.play();
      }
      console.log('[MEMORY_COMPLETE]', {
        memoryIndex: currentIndex,
        totalMemories
      });
      onComplete();
    } else {
      setCurrentSceneIndex(prev => prev + 1);
    }
  };

  // Go to previous scene or memory
  const goBack = () => {
    if (currentSceneIndex > 0) {
      console.log('[GO_BACK_SCENE]', {
        from: currentSceneIndex,
        to: currentSceneIndex - 1
      });
      setCurrentSceneIndex(prev => prev - 1);
    } else if (currentIndex > 0) {
      console.log('[GO_BACK_MEMORY]', {
        fromMemory: currentIndex,
        toMemory: currentIndex - 1
      });
      onPrevious();
    }
  };

  // Clear any active timer
  const clearSceneTimer = () => {
    if (sceneTimerRef.current) {
      clearTimeout(sceneTimerRef.current);
      sceneTimerRef.current = null;
    }
  };

  // Start scene timer for auto-progression with token validation
  const startSceneTimer = (duration: number, sceneToken: number) => {
    clearSceneTimer();
    sceneStartTimeRef.current = Date.now();
    remainingTimeRef.current = duration;

    sceneTimerRef.current = setTimeout(() => {
      // CRITICAL: Validate scene token before advancing
      if (sceneTokenRef.current !== sceneToken) {
        console.warn('[STALE_TIMER_IGNORED]', {
          expectedToken: sceneTokenRef.current,
          callbackToken: sceneToken,
          currentSceneIndex,
          currentSceneType: currentScene?.type
        });
        return;
      }

      // Token valid - this callback belongs to current scene
      console.log('[TIMER_FINISHED]', {
        sceneIndex: currentSceneIndex,
        sceneType: currentScene?.type,
        token: sceneToken
      });
      advanceScene();
    }, duration);
  };

  // Handle pause
  const handlePause = () => {
    if (cinematicState === 'PLAYING') {
      console.log('[PAUSE]', {
        sceneIndex: currentSceneIndex,
        sceneType: currentScene?.type,
        remainingTime: remainingTimeRef.current
      });

      // Pause everything
      clearSceneTimer();

      // Calculate remaining time
      const elapsed = Date.now() - sceneStartTimeRef.current;
      remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);

      // Pause soundtrack
      if (parentAudioRef?.current) {
        parentAudioRef.current.pause();
      }

      setCinematicState('PAUSED');
    } else if (cinematicState === 'PAUSED') {
      console.log('[RESUME]', {
        sceneIndex: currentSceneIndex,
        sceneType: currentScene?.type,
        remainingTime: remainingTimeRef.current,
        token: sceneTokenRef.current
      });

      // Resume everything with current scene token
      startSceneTimer(remainingTimeRef.current, sceneTokenRef.current);

      // Resume soundtrack
      if (parentAudioRef?.current && !isMusicMuted) {
        parentAudioRef.current.play();
      }

      setCinematicState('PLAYING');
    } else if (cinematicState === 'VIDEO_PLAYING') {
      console.log('[VIDEO_PAUSE]', {
        sceneIndex: currentSceneIndex
      });

      // Pause video
      if (videoRef.current) {
        videoRef.current.pause();
      }
      setCinematicState('VIDEO_PAUSED');
    } else if (cinematicState === 'VIDEO_PAUSED') {
      console.log('[VIDEO_RESUME]', {
        sceneIndex: currentSceneIndex
      });

      // Resume video
      if (videoRef.current) {
        videoRef.current.play();
      }
      setCinematicState('VIDEO_PLAYING');
    }
  };

  // Handle manual skip to next scene
  const handleSkip = () => {
    console.log('[MANUAL_NEXT]', {
      from: {
        memoryIndex: currentIndex,
        sceneIndex: currentSceneIndex,
        sceneType: currentScene?.type,
        token: sceneTokenRef.current
      }
    });

    clearSceneTimer();

    // Invalidate current scene token to prevent stale timers
    sceneTokenRef.current++;

    // If leaving video, restore soundtrack
    if (currentScene.type === 'video') {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
      if (parentAudioRef?.current && !isMusicMuted) {
        parentAudioRef.current.play();
      }
    }

    // Manual advance
    advanceScene();
  };

  // Handle manual previous
  const handleGoBack = () => {
    console.log('[MANUAL_PREVIOUS]', {
      from: {
        memoryIndex: currentIndex,
        sceneIndex: currentSceneIndex,
        sceneType: currentScene?.type,
        token: sceneTokenRef.current
      }
    });

    clearSceneTimer();

    // Invalidate current scene token to prevent stale timers
    sceneTokenRef.current++;

    // If leaving video, restore soundtrack
    if (currentScene.type === 'video') {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
      if (parentAudioRef?.current && !isMusicMuted) {
        parentAudioRef.current.play();
      }
    }

    // Manual navigation
    goBack();
  };

  // Scene change effect - start timer or handle video
  useEffect(() => {
    if (!currentScene) return;

    // CRITICAL: Increment scene token to invalidate all previous timers
    const thisSceneToken = ++sceneTokenRef.current;

    // DEV TRACE: Scene entry
    console.log('[SCENE_ENTRY]', {
      memoryIndex: currentIndex,
      sceneIndex: currentSceneIndex,
      sceneType: currentScene.type,
      token: thisSceneToken,
      mediaIndex: currentScene.index
    });

    // Reset state for new scene
    setCinematicState('PLAYING');

    if (currentScene.type === 'video') {
      // VIDEO AUDIO POLICY: PAUSE SOUNDTRACK ENTIRELY
      if (parentAudioRef?.current) {
        parentAudioRef.current.pause();
      }

      // Video progression handled by video events
      setCinematicState('VIDEO_PLAYING');
      console.log('[VIDEO_SCENE_START]', {
        sceneIndex: currentSceneIndex,
        token: thisSceneToken
      });
    } else {
      // Non-video scenes: start auto-progression timer with token
      const duration = getSceneDuration(currentScene);
      startSceneTimer(duration, thisSceneToken);

      // Ensure soundtrack is playing for non-video scenes
      if (parentAudioRef?.current && !isMusicMuted && cinematicState !== 'PAUSED') {
        parentAudioRef.current.play();
      }
    }

    // Cleanup on unmount or scene change
    return () => {
      clearSceneTimer();
      console.log('[SCENE_EXIT]', {
        sceneIndex: currentSceneIndex,
        sceneType: currentScene.type,
        token: thisSceneToken
      });
    };
  }, [currentSceneIndex]);

  // Video event handlers
  const handleVideoPlay = () => {
    setCinematicState('VIDEO_PLAYING');
  };

  const handleVideoPause = () => {
    if (cinematicState === 'VIDEO_PLAYING') {
      setCinematicState('VIDEO_PAUSED');
    }
  };

  const handleVideoEnded = () => {
    console.log('[VIDEO_ENDED]', {
      sceneIndex: currentSceneIndex,
      memoryIndex: currentIndex,
      token: sceneTokenRef.current
    });

    // Video complete - restore soundtrack and advance
    if (parentAudioRef?.current && !isMusicMuted) {
      parentAudioRef.current.play();
    }

    // Video ended is a valid progression trigger
    advanceScene();
  };

  // Show controls on hover/touch
  const handleInteraction = () => {
    setShowControls(true);
    setTimeout(() => setShowControls(false), 3000);
  };

  // Get animation class for scene transitions
  const getSceneAnimation = () => {
    return "animate-fade-in";
  };

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center bg-[#fff8ef]"
      onMouseMove={handleInteraction}
      onTouchStart={handleInteraction}
    >
      {/* Music control - top left */}
      {onMuteToggle && (
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
      )}

      {/* Exit to Memory Wall - top right */}
      <div className="absolute top-6 right-6 z-20">
        <Link
          href={`/m/${shareCode}?view=browse`}
          className="text-sm text-[#856b5f] hover:text-[#3a241e] transition-colors px-3 py-2 rounded-full bg-white/90 hover:bg-white shadow-sm"
        >
          Exit
        </Link>
      </div>

      {/* Progress indicator */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 bg-white/90 px-4 py-2 rounded-full shadow-sm">
        <span className="text-sm text-[#856b5f]">
          Memory {currentIndex + 1} of {totalMemories}
        </span>
      </div>

      {/* Cinematic content area */}
      <div className="w-full max-w-4xl px-6">
        {currentScene.type === 'contributor' && (
          <div className={`flex items-center justify-center min-h-[60vh] ${getSceneAnimation()}`}>
            <h2 className="text-center text-4xl md:text-5xl font-bold text-[#3a241e]">
              {memory.contributor_name}
            </h2>
          </div>
        )}

        {currentScene.type === 'message' && (
          <div className={`flex items-center justify-center min-h-[60vh] ${getSceneAnimation()}`}>
            <div className="rounded-2xl bg-white/95 p-8 md:p-12 text-center text-xl md:text-2xl leading-relaxed text-[#3a241e] shadow-lg max-w-2xl">
              {memory.message || (
                <span className="text-[#856b5f] italic">
                  {memory.contributor_name} shared a memory for you.
                </span>
              )}
            </div>
          </div>
        )}

        {currentScene.type === 'photo' && currentScene.content && (
          <div className={`flex items-center justify-center ${getSceneAnimation()}`} style={{ height: '70vh' }}>
            <div className="relative w-full h-full max-w-4xl px-6">
              <img
                src={(currentScene.content as MediaItem).url}
                alt={`Memory photo ${(currentScene.index || 0) + 1}`}
                className="rounded-2xl shadow-2xl animate-ken-burns"
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  width: 'auto',
                  height: 'auto',
                  objectFit: 'contain',
                  margin: '0 auto',
                  display: 'block'
                }}
              />
            </div>
          </div>
        )}

        {currentScene.type === 'gif' && currentScene.content && (
          <div className={`flex items-center justify-center ${getSceneAnimation()}`} style={{ height: '70vh' }}>
            <div className="relative w-full h-full max-w-3xl px-6">
              <img
                src={(currentScene.content as MediaItem).url}
                alt="Animated memory"
                className="rounded-2xl shadow-2xl"
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  width: 'auto',
                  height: 'auto',
                  objectFit: 'contain',
                  margin: '0 auto',
                  display: 'block'
                }}
              />
              <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-semibold">
                GIF
              </div>
            </div>
          </div>
        )}

        {currentScene.type === 'video' && currentScene.content && (
          <div className={`flex items-center justify-center ${getSceneAnimation()}`} style={{ height: '70vh' }}>
            <div className="relative w-full h-full max-w-3xl px-6">
              <video
                ref={videoRef}
                src={(currentScene.content as VideoMedia).url}
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
                onPlay={handleVideoPlay}
                onPause={handleVideoPause}
                onEnded={handleVideoEnded}
              />
              <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-semibold">
                {(currentScene.content as VideoMedia).duration_seconds.toFixed(1)}s
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Subtle manual controls overlay */}
      <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 z-20 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-center gap-3 bg-black/80 px-6 py-3 rounded-full shadow-lg">
          <button
            onClick={handleGoBack}
            disabled={currentIndex === 0 && currentSceneIndex === 0}
            className="text-white hover:text-[#FF6B57] disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={handlePause}
            className="text-white hover:text-[#FF6B57] transition-colors"
            aria-label={cinematicState === 'PAUSED' || cinematicState === 'VIDEO_PAUSED' ? "Play" : "Pause"}
          >
            {cinematicState === 'PAUSED' || cinematicState === 'VIDEO_PAUSED' ? (
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
            onClick={handleSkip}
            className="text-white hover:text-[#FF6B57] transition-colors"
            aria-label="Skip"
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
