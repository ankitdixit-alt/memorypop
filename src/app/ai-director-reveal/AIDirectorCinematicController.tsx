/**
 * AI Director Cinematic Controller - Development Only
 *
 * Extends GlobalCinematicController pattern for AI Director reveals.
 * Handles opening, chapter transitions, highlights, and closing screens.
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { buildAIDirectorTimeline, getAIDirectorSceneDuration, getAIDirectorMemoryInfo } from '@/lib/buildAIDirectorTimeline'
import type { AIDirectorScene } from '@/lib/buildAIDirectorTimeline'
import type { Memory } from '@/lib/buildCinematicTimeline'
import type { RevealPlan } from '@/lib/ai/types'
import type { MediaItem, VideoMedia } from '@/components/memory-experience/types'

type PlaybackState = 'PLAYING' | 'PAUSED' | 'VIDEO_PLAYING' | 'VIDEO_PAUSED'

interface Props {
  memories: Memory[]
  plan: RevealPlan
  onComplete: () => void
  onSceneChange: (sceneIndex: number, scene: AIDirectorScene) => void
  showTransitions?: boolean
  playbackSpeed?: number
}

export default function AIDirectorCinematicController({
  memories,
  plan,
  onComplete,
  onSceneChange,
  showTransitions = false,
  playbackSpeed = 1
}: Props) {
  // Build AI Director timeline once
  const timeline = useRef(buildAIDirectorTimeline(memories, plan)).current
  const totalScenes = timeline.length

  // Single source of truth: Global scene index
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0)
  const [playbackState, setPlaybackState] = useState<PlaybackState>('PLAYING')

  // Timer ownership
  const sceneTimerRef = useRef<NodeJS.Timeout | null>(null)
  const sceneStartTimeRef = useRef<number>(0)
  const remainingTimeRef = useRef<number>(0)
  const sceneTokenRef = useRef<number>(0)

  // Video ref
  const videoRef = useRef<HTMLVideoElement | null>(null)

  const currentScene = timeline[currentSceneIndex]
  const isLastScene = currentSceneIndex === totalScenes - 1
  const memoryInfo = currentScene ? getAIDirectorMemoryInfo(currentScene, memories.length) : null

  // Get transition CSS class
  const getTransitionClass = (scene: AIDirectorScene): string => {
    if (!scene.transition) return 'animate-gentle-fade'

    switch (scene.transition.type) {
      case 'gentle-fade':
        return 'animate-gentle-fade'
      case 'crossfade':
        return 'animate-crossfade'
      case 'soft-slide':
        return 'animate-soft-slide'
      case 'slow-zoom':
        return 'animate-slow-zoom'
      case 'chapter-card':
        return 'animate-chapter-card'
      case 'playful-pop':
        return 'animate-playful-pop'
      case 'media-reveal':
        return 'animate-media-reveal'
      case 'calm-dissolve':
        return 'animate-calm-dissolve'
      case 'finale-fade':
        return 'animate-finale-fade'
      default:
        return 'animate-gentle-fade'
    }
  }

  // Notify parent of scene changes
  useEffect(() => {
    if (currentScene) {
      onSceneChange(currentSceneIndex, currentScene)
    }
  }, [currentSceneIndex, currentScene, onSceneChange])

  /**
   * Clear active timer
   */
  const clearTimer = () => {
    if (sceneTimerRef.current) {
      clearTimeout(sceneTimerRef.current)
      sceneTimerRef.current = null
    }
  }

  /**
   * Start scene timer with token validation
   */
  const startTimer = (duration: number, sceneToken: number) => {
    clearTimer()
    sceneStartTimeRef.current = Date.now()
    remainingTimeRef.current = duration

    sceneTimerRef.current = setTimeout(() => {
      if (sceneTokenRef.current !== sceneToken) {
        return
      }
      advanceScene()
    }, duration)
  }

  /**
   * Advance to next scene
   */
  const advanceScene = () => {
    if (isLastScene) {
      onComplete()
    } else {
      setCurrentSceneIndex(prev => prev + 1)
    }
  }

  /**
   * Manual Next (exposed via ref/props in parent)
   */
  const handleNext = () => {
    clearTimer()
    sceneTokenRef.current++

    if (currentScene?.type === 'video' && videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }

    advanceScene()
  }

  /**
   * Manual Previous
   */
  const handlePrevious = () => {
    if (currentSceneIndex > 0) {
      clearTimer()
      sceneTokenRef.current++

      if (currentScene?.type === 'video' && videoRef.current) {
        videoRef.current.pause()
        videoRef.current.currentTime = 0
      }

      setCurrentSceneIndex(prev => prev - 1)
    }
  }

  /**
   * Pause/Resume
   */
  const handlePause = () => {
    if (playbackState === 'PLAYING') {
      clearTimer()
      const elapsed = Date.now() - sceneStartTimeRef.current
      remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed)
      setPlaybackState('PAUSED')
    } else if (playbackState === 'PAUSED') {
      startTimer(remainingTimeRef.current, sceneTokenRef.current)
      setPlaybackState('PLAYING')
    } else if (playbackState === 'VIDEO_PLAYING') {
      if (videoRef.current) {
        videoRef.current.pause()
      }
      setPlaybackState('VIDEO_PAUSED')
    } else if (playbackState === 'VIDEO_PAUSED') {
      if (videoRef.current) {
        videoRef.current.play()
      }
      setPlaybackState('VIDEO_PLAYING')
    }
  }

  /**
   * Video ended
   */
  const handleVideoEnded = () => {
    advanceScene()
  }

  /**
   * Scene change effect
   */
  useEffect(() => {
    if (!currentScene) return

    const thisSceneToken = ++sceneTokenRef.current

    setPlaybackState('PLAYING')

    if (currentScene.type === 'video') {
      setPlaybackState('VIDEO_PLAYING')
    } else {
      const duration = getAIDirectorSceneDuration(currentScene, playbackSpeed)
      startTimer(duration, thisSceneToken)
    }

    return () => {
      clearTimer()
    }
  }, [currentSceneIndex, playbackSpeed])

  // Expose controls to parent via callback
  useEffect(() => {
    ;(window as any).__aiDirectorControls = {
      next: handleNext,
      previous: handlePrevious,
      pause: handlePause,
      restart: () => {
        clearTimer()
        sceneTokenRef.current++
        setCurrentSceneIndex(0)
      },
      skipToFinale: () => {
        clearTimer()
        sceneTokenRef.current++
        // Find finale or last memory scene
        const finaleIndex = timeline.findIndex(s => s.isFinale) || timeline.length - 2
        setCurrentSceneIndex(finaleIndex)
      }
    }

    return () => {
      delete (window as any).__aiDirectorControls
    }
  }, [currentSceneIndex, playbackState])

  if (!currentScene) {
    return null
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#fff8ef]">
      {/* Progress indicator */}
      {memoryInfo && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 bg-white/90 px-4 py-2 rounded-full shadow-sm">
          <span className="text-xs text-gray-500">
            {memoryInfo.currentMemory} of {memoryInfo.totalMemories} memories
            {memoryInfo.chapterTitle && ` • ${memoryInfo.chapterTitle}`}
          </span>
        </div>
      )}

      {/* Transition indicator (dev only) */}
      {showTransitions && currentScene.transition && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 bg-black/80 text-white px-4 py-2 rounded-lg shadow-lg text-xs">
          <div className="font-bold mb-1">{currentScene.transition.type}</div>
          <div className="text-gray-300">{currentScene.transition.reason}</div>
        </div>
      )}

      {/* Scene renderer */}
      <div className="w-full max-w-4xl px-6">
        {/* Opening screen */}
        {currentScene.type === 'opening' && (
          <div className={`flex items-center justify-center min-h-[60vh] ${getTransitionClass(currentScene)}`}>
            <div className="flex flex-col items-center justify-center px-6 md:px-12 text-center space-y-6">
              {plan.openingTitle && (
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#3a241e] leading-tight">
                  {plan.openingTitle}
                </h1>
              )}
              {plan.opening && (
                <p className="text-xl md:text-2xl text-gray-700 italic max-w-2xl leading-relaxed">
                  "{plan.opening}"
                </p>
              )}
            </div>
          </div>
        )}

        {/* Chapter transition */}
        {currentScene.type === 'chapter_transition' && (
          <div className={`flex items-center justify-center min-h-[60vh] ${getTransitionClass(currentScene)}`}>
            <div className="flex flex-col items-center justify-center px-6 md:px-12 text-center space-y-4">
              <div className="text-sm uppercase tracking-wider text-gray-500 font-medium">
                Chapter {(currentScene.chapterIndex || 0) + 1}
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#3a241e]">
                {currentScene.chapterTitle}
              </h2>
              {currentScene.chapterDescription && (
                <p className="text-lg text-gray-600 max-w-xl">
                  {currentScene.chapterDescription}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Memory presentation (contributor + message combined) */}
        {currentScene.type === 'memory_presentation' && (
          <div className={`flex items-center justify-center min-h-[60vh] ${getTransitionClass(currentScene)}`}>
            <div className="flex flex-col items-center justify-center px-6 md:px-12 text-center">
              <p className="text-xl md:text-3xl lg:text-4xl leading-relaxed text-gray-800 max-w-4xl">
                "{currentScene.memory.message || `${currentScene.memory.contributor_name} shared a memory for you.`}"
              </p>
              <p className="text-sm md:text-lg text-gray-600 mt-6">
                — {currentScene.memory.contributor_name}
              </p>
              {currentScene.isHighlight && (
                <div className="mt-4 px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                  ⭐ Highlight
                </div>
              )}
              {currentScene.isFinale && (
                <div className="mt-2 px-3 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full">
                  💙 Finale
                </div>
              )}
            </div>
          </div>
        )}

        {/* Photo scene */}
        {currentScene.type === 'photo' && currentScene.media && (
          <div className={`flex flex-col items-center justify-center h-screen ${getTransitionClass(currentScene)}`}>
            <div className="flex-shrink-0 h-20" />
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
            </div>
            <div className="flex-shrink-0 h-20" />
          </div>
        )}

        {/* GIF scene */}
        {currentScene.type === 'gif' && currentScene.media && (
          <div className={`flex flex-col items-center justify-center h-screen ${getTransitionClass(currentScene)}`}>
            <div className="flex-shrink-0 h-20" />
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
            </div>
            <div className="flex-shrink-0 h-20" />
          </div>
        )}

        {/* Video scene */}
        {currentScene.type === 'video' && currentScene.media && (
          <div
            className={`flex items-center justify-center ${getTransitionClass(currentScene)}`}
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

        {/* Closing screen */}
        {currentScene.type === 'closing' && (
          <div className={`flex items-center justify-center min-h-[60vh] ${getTransitionClass(currentScene)}`}>
            <div className="flex flex-col items-center justify-center px-6 md:px-12 text-center space-y-6">
              {plan.closingText && (
                <p className="text-xl md:text-2xl lg:text-3xl text-gray-700 italic max-w-2xl leading-relaxed">
                  "{plan.closingText}"
                </p>
              )}
              <div className="text-4xl">💙</div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        /* Transition animations - smooth, accessible, emotionally appropriate */

        @keyframes gentle-fade {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes crossfade {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes soft-slide {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slow-zoom {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes chapter-card {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes playful-pop {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes media-reveal {
          from {
            opacity: 0;
            transform: scale(0.97);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes calm-dissolve {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes finale-fade {
          from {
            opacity: 0;
            transform: scale(0.98);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes ken-burns {
          0% { transform: scale(1); }
          100% { transform: scale(1.05); }
        }

        /* Apply transitions */
        .animate-gentle-fade { animation: gentle-fade 600ms ease-out; }
        .animate-crossfade { animation: crossfade 800ms ease-in-out; }
        .animate-soft-slide { animation: soft-slide 600ms ease-out; }
        .animate-slow-zoom { animation: slow-zoom 1000ms ease-out; }
        .animate-chapter-card { animation: chapter-card 600ms ease-out; }
        .animate-playful-pop { animation: playful-pop 500ms cubic-bezier(0.68, -0.55, 0.27, 1.55); }
        .animate-media-reveal { animation: media-reveal 700ms ease-out; }
        .animate-calm-dissolve { animation: calm-dissolve 1000ms ease-in-out; }
        .animate-finale-fade { animation: finale-fade 1200ms ease-in-out; }
        .animate-ken-burns { animation: ken-burns 5s ease-in-out forwards; }

        /* Respect reduced motion preferences */
        @media (prefers-reduced-motion: reduce) {
          .animate-gentle-fade,
          .animate-crossfade,
          .animate-soft-slide,
          .animate-slow-zoom,
          .animate-chapter-card,
          .animate-playful-pop,
          .animate-media-reveal,
          .animate-calm-dissolve,
          .animate-finale-fade {
            animation: gentle-fade 300ms ease-out;
          }
          .animate-ken-burns {
            animation: none;
          }
        }
      `}</style>
    </div>
  )
}
