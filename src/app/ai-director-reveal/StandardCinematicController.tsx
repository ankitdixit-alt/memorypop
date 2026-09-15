/**
 * Standard Cinematic Controller - Development Only
 *
 * Chronological reveal baseline for comparison with AI Director.
 * Uses same cinematic framework but without AI curation.
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import type { Memory as BaseMemory } from '@/lib/buildCinematicTimeline'
import type { MediaItem, VideoMedia } from '@/components/memory-experience/types'

// Extended memory with created_at for sorting
interface Memory extends BaseMemory {
  created_at?: string
}

type StandardSceneType =
  | 'memory_presentation' // Contributor + message combined (ONE per memory)
  | 'photo'
  | 'gif'
  | 'video'

interface StandardScene {
  type: StandardSceneType
  memoryIndex: number
  memory: Memory
  mediaIndex?: number
  media?: MediaItem | VideoMedia
}

type PlaybackState = 'PLAYING' | 'PAUSED' | 'VIDEO_PLAYING' | 'VIDEO_PAUSED'

interface Props {
  memories: Memory[]
  onComplete: () => void
  onSceneChange: (sceneIndex: number, scene: StandardScene) => void
  playbackSpeed?: number
}

/**
 * Build standard chronological timeline
 * Each memory gets ONE memory_presentation scene + optional media scenes
 */
function buildStandardTimeline(memories: Memory[]): StandardScene[] {
  const timeline: StandardScene[] = []

  // Chronological order (most recent first, matching production)
  const sortedMemories = [...memories].sort((a, b) => {
    const timeA = a.created_at ? new Date(a.created_at).getTime() : 0
    const timeB = b.created_at ? new Date(b.created_at).getTime() : 0
    return timeB - timeA // Descending (newest first)
  })

  sortedMemories.forEach((memory, memoryIndex) => {
    // Parse media
    const photos = memory.photos || (
      memory.photo_url && !memory.photo_url.endsWith('.gif')
        ? [{ url: memory.photo_url, uploaded_at: '', file_size_bytes: 0 }]
        : []
    )
    const gifs = memory.gifs || (
      memory.photo_url && memory.photo_url.endsWith('.gif')
        ? [{ url: memory.photo_url, uploaded_at: '', file_size_bytes: 0 }]
        : []
    )
    const video = memory.video || null

    // Memory presentation: contributor + message combined (ONE SCENE per memory)
    timeline.push({
      type: 'memory_presentation',
      memoryIndex,
      memory
    })

    // Photos (optional additional scenes - do NOT repeat message)
    photos.forEach((photo, photoIndex) => {
      timeline.push({
        type: 'photo',
        memoryIndex,
        memory,
        mediaIndex: photoIndex,
        media: photo
      })
    })

    // GIFs
    gifs.forEach((gif, gifIndex) => {
      timeline.push({
        type: 'gif',
        memoryIndex,
        memory,
        mediaIndex: gifIndex,
        media: gif
      })
    })

    // Video
    if (video) {
      timeline.push({
        type: 'video',
        memoryIndex,
        memory,
        media: video
      })
    }
  })

  return timeline
}

/**
 * Get scene duration (standard pacing, no AI adjustments)
 * Consistent, efficient pacing for chronological baseline
 */
function getStandardSceneDuration(scene: StandardScene, playbackSpeed: number = 1): number {
  let baseDuration: number

  switch (scene.type) {
    case 'memory_presentation':
      // Reading time based on word count
      const words = (scene.memory.message || '').split(/\s+/).length
      baseDuration = Math.max(3000, words * 200) // 200ms per word, min 3s
      break
    case 'photo':
      baseDuration = 2500 // 2.5s per photo (consistent viewing)
      break
    case 'gif':
      baseDuration = 3000 // 3s per GIF (one natural loop)
      break
    case 'video':
      return 0 // Video controls its own duration
    default:
      baseDuration = 3000
  }

  // Apply playback speed multiplier
  return Math.round(baseDuration / playbackSpeed)
}

export default function StandardCinematicController({
  memories,
  onComplete,
  onSceneChange,
  playbackSpeed = 1
}: Props) {
  // Build standard timeline once
  const timeline = useRef(buildStandardTimeline(memories)).current
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
   * Manual Next
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
      const duration = getStandardSceneDuration(currentScene, playbackSpeed)
      startTimer(duration, thisSceneToken)
    }

    return () => {
      clearTimer()
    }
  }, [currentSceneIndex, playbackSpeed])

  // Expose controls to parent via callback
  useEffect(() => {
    ;(window as any).__standardControls = {
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
        // Find last memory scene
        const lastMemoryIndex = timeline.length - 1
        setCurrentSceneIndex(lastMemoryIndex)
      }
    }

    return () => {
      delete (window as any).__standardControls
    }
  }, [currentSceneIndex, playbackState])

  if (!currentScene) {
    return null
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#fff8ef]">
      {/* Progress indicator */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 bg-white/90 px-4 py-2 rounded-full shadow-sm">
        <span className="text-xs text-gray-500">
          {currentScene.memoryIndex + 1} of {memories.length} memories
        </span>
      </div>

      {/* Scene renderer */}
      <div className="w-full max-w-4xl px-6">
        {/* Memory presentation (contributor + message combined) */}
        {currentScene.type === 'memory_presentation' && (
          <div className="flex items-center justify-center min-h-[60vh] animate-standard-fade">
            <div className="flex flex-col items-center justify-center px-6 md:px-12 text-center">
              <p className="text-xl md:text-3xl lg:text-4xl leading-relaxed text-gray-800 max-w-4xl">
                "{currentScene.memory.message || `${currentScene.memory.contributor_name} shared a memory for you.`}"
              </p>
              <p className="text-sm md:text-lg text-gray-600 mt-6">
                — {currentScene.memory.contributor_name}
              </p>
            </div>
          </div>
        )}

        {/* Photo scene */}
        {currentScene.type === 'photo' && currentScene.media && (
          <div className="flex flex-col items-center justify-center h-screen animate-standard-fade">
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
          <div className="flex flex-col items-center justify-center h-screen animate-standard-fade">
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
            className="flex items-center justify-center animate-standard-fade"
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

      <style jsx>{`
        /* Standard transitions - simple, consistent */
        @keyframes standard-fade {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes ken-burns {
          0% { transform: scale(1); }
          100% { transform: scale(1.05); }
        }

        .animate-standard-fade {
          animation: standard-fade 600ms ease-out;
        }

        .animate-ken-burns {
          animation: ken-burns 5s ease-in-out forwards;
        }

        /* Respect reduced motion preferences */
        @media (prefers-reduced-motion: reduce) {
          .animate-standard-fade {
            animation: standard-fade 300ms ease-out;
          }
          .animate-ken-burns {
            animation: none;
          }
        }
      `}</style>
    </div>
  )
}
