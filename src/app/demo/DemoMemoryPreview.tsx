'use client'

import { useEffect, useRef } from 'react'
import type { Memory } from '@/components/memory-experience/types'

interface DemoMemoryPreviewProps {
  memory: Memory | null
  isOpen: boolean
  onClose: () => void
}

/**
 * Demo Memory Preview Component
 *
 * DEMO-ONLY modal for previewing memories on /demo page.
 * This component is NOT used in production recipient experience.
 *
 * Design: Fixed shell dimensions that never change based on content.
 * Desktop: min(960px, calc(100vw - 48px)) × min(640px, calc(100dvh - 80px))
 * Mobile: calc(100vw - 24px) × calc(100dvh - 24px)
 *
 * Every memory (text, photo, video, multi-photo) opens in the SAME footprint.
 * Content adapts to the shell, not vice versa.
 */
export default function DemoMemoryPreview({ memory, isOpen, onClose }: DemoMemoryPreviewProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Normalize data safely before branching
  const photoUrl =
    memory && typeof memory.photoUrl === 'string' && memory.photoUrl.trim()
      ? memory.photoUrl
      : undefined

  const videoUrl =
    memory && typeof memory.videoUrl === 'string' && memory.videoUrl.trim()
      ? memory.videoUrl
      : undefined

  const multiplePhotos =
    memory && Array.isArray(memory.multiplePhotos)
      ? memory.multiplePhotos.filter(
          (url): url is string => typeof url === 'string' && url.trim().length > 0
        )
      : []

  const hasVisualMedia = !!photoUrl || multiplePhotos.length > 0
  const effectiveMediaType =
    memory && memory.mediaType === 'photo' && !hasVisualMedia ? 'text' : memory?.mediaType || 'text'

  // ESC key handler
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Video playback
  useEffect(() => {
    if (!isOpen || effectiveMediaType !== 'video') return
    if (!videoRef.current) return

    const video = videoRef.current
    video.play().catch((err) => {
      console.error('Video playback failed:', err)
    })

    return () => {
      if (video) {
        video.pause()
        video.currentTime = 0
      }
    }
  }, [isOpen, effectiveMediaType])

  // Early return AFTER all hooks
  if (!isOpen || !memory) return null

  const { contributorName, message } = memory

  // Render media content
  const renderMedia = () => {
    // Video
    if (effectiveMediaType === 'video' && videoUrl) {
      return (
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-contain bg-black rounded-l-2xl"
          controls
          playsInline
          preload="auto"
        >
          <track kind="captions" />
        </video>
      )
    }

    // Photo(s)
    if (effectiveMediaType === 'photo') {
      // Multiple photos
      if (multiplePhotos.length > 0) {
        const photoCount = multiplePhotos.length

        // Single photo from array
        if (photoCount === 1) {
          return (
            <img
              src={multiplePhotos[0]}
              alt={`Memory from ${contributorName}`}
              className="w-full h-full object-cover rounded-l-2xl"
            />
          )
        }

        // Two photos - side by side
        if (photoCount === 2) {
          return (
            <div className="grid grid-cols-2 gap-1 w-full h-full p-2">
              {multiplePhotos.slice(0, 2).map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  alt={`Memory ${idx + 1} from ${contributorName}`}
                  className="w-full h-full object-cover rounded"
                />
              ))}
            </div>
          )
        }

        // Three photos - 2-column collage
        if (photoCount === 3) {
          return (
            <div className="grid grid-cols-2 grid-rows-2 gap-1 w-full h-full p-2">
              <div className="row-span-2">
                <img
                  src={multiplePhotos[0]}
                  alt={`Memory 1 from ${contributorName}`}
                  className="w-full h-full object-cover rounded"
                />
              </div>
              <div>
                <img
                  src={multiplePhotos[1]}
                  alt={`Memory 2 from ${contributorName}`}
                  className="w-full h-full object-cover rounded"
                />
              </div>
              <div>
                <img
                  src={multiplePhotos[2]}
                  alt={`Memory 3 from ${contributorName}`}
                  className="w-full h-full object-cover rounded"
                />
              </div>
            </div>
          )
        }

        // Four or more photos - 2x2 grid
        return (
          <div className="grid grid-cols-2 grid-rows-2 gap-1 w-full h-full p-2">
            {multiplePhotos.slice(0, 4).map((url, idx) => (
              <div key={idx} className="relative">
                <img
                  src={url}
                  alt={`Memory ${idx + 1} from ${contributorName}`}
                  className="w-full h-full object-cover rounded"
                />
                {idx === 3 && photoCount > 4 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded">
                    <span className="text-white text-xl font-semibold">+{photoCount - 4}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      }

      // Single photo from photoUrl
      if (photoUrl) {
        return (
          <img
            src={photoUrl}
            alt={`Memory from ${contributorName}`}
            className="w-full h-full object-cover rounded-l-2xl"
          />
        )
      }
    }

    // Fallback for missing media
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#f9f6f1] to-[#f5f0e8] rounded-l-2xl">
        <div className="text-center max-w-md px-8">
          <p className="text-4xl md:text-5xl font-serif text-[#3a241e] mb-4">{contributorName}</p>
          <p className="text-sm md:text-base text-[#856b5f] uppercase tracking-wider">
            A memory for you
          </p>
        </div>
      </div>
    )
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === modalRef.current) {
      onClose()
    }
  }

  // Text-only layout (no split-screen)
  if (effectiveMediaType === 'text') {
    return (
      <div
        ref={modalRef}
        onClick={handleBackdropClick}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-3 md:p-6
                   animate-in fade-in duration-200"
      >
        <div
          className="relative bg-[#fefdfb] rounded-2xl shadow-2xl
                      animate-in zoom-in-95 duration-300 overflow-y-auto
                      w-[calc(100vw-24px)] max-w-[640px]
                      max-h-[calc(100dvh-24px)] md:max-h-[calc(100dvh-80px)]"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-white hover:bg-gray-50
                       flex items-center justify-center transition-all duration-200
                       focus:outline-none focus:ring-2 focus:ring-[#856b5f] shadow-lg"
            aria-label="Close"
          >
            <svg
              className="w-5 h-5 text-[#3a241e]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="px-8 md:px-12 py-12 md:py-16">
            <div className="max-w-xl mx-auto space-y-8">
              {/* Message */}
              {message && (
                <div>
                  <p className="text-lg md:text-xl leading-relaxed text-[#2a1a14] whitespace-pre-wrap font-serif">
                    {message}
                  </p>
                </div>
              )}

              {/* Signature */}
              <div className="pt-6 border-t border-[#3a241e]/10">
                <p className="text-base md:text-lg text-[#5a4a3e] italic font-serif">
                  — {contributorName}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Photo/video layout - fixed shell with split-screen
  return (
    <div
      ref={modalRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-3 md:p-6
                 animate-in fade-in duration-200"
    >
      <div
        className="relative bg-gradient-to-br from-[#f9f6f1] via-[#fefdfb] to-[#f5f0e8]
                    rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden
                    w-[calc(100vw-24px)] md:w-[min(960px,calc(100vw-48px))]
                    h-[calc(100dvh-24px)] md:h-[min(640px,calc(100dvh-80px))]"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-white hover:bg-gray-50
                     flex items-center justify-center transition-all duration-200
                     focus:outline-none focus:ring-2 focus:ring-[#856b5f] shadow-lg"
          aria-label="Close"
        >
          <svg
            className="w-5 h-5 text-[#3a241e]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex h-full flex-col md:flex-row">
          {/* Media Section - 58% on desktop */}
          <div className="relative shrink-0 w-full h-[38dvh] md:h-full md:w-[58%] bg-black/5">
            {renderMedia()}
          </div>

          {/* Message Panel - 42% on desktop */}
          <div className="flex-1 overflow-y-auto px-6 py-8 md:px-10 flex items-center justify-center">
            <div className="w-full space-y-6">
              {/* Message */}
              {message && (
                <div>
                  <p className="text-base md:text-lg leading-relaxed text-[#3a241e] whitespace-pre-wrap">
                    {message}
                  </p>
                </div>
              )}

              {/* Signature */}
              <div className="pt-4 border-t border-[#856b5f]/20">
                <p className="text-sm md:text-base text-[#856b5f] italic">— {contributorName}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
