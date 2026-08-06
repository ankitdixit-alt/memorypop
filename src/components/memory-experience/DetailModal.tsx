"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import type { DetailModalProps } from "./types";

/**
 * Detail Modal Component
 *
 * Full-screen modal for viewing complete memory:
 * - Photo/video display
 * - Full message text
 * - Contributor name signature
 *
 * Interaction:
 * - Click backdrop to close
 * - ESC key to close
 * - Close button (X) in top-right
 * - Backdrop blur effect
 * - Body scroll lock when open
 *
 * Layout:
 * - Mobile: stacked (media top, message below)
 * - Desktop: side-by-side (60/40 split)
 * - Premium Reveal visual language
 */
export default function DetailModal({ memory, isOpen, onClose }: DetailModalProps) {
  const { contributorName, message, photoUrl, videoUrl, mediaType } = memory;
  const videoRef = useRef<HTMLVideoElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const mediaContainerRef = useRef<HTMLDivElement>(null);

  // Determine effective media type
  const hasValidPhoto = photoUrl && photoUrl.trim().length > 0;
  const effectiveMediaType = (mediaType === 'photo' && !hasValidPhoto) ? 'text' : mediaType;

  // Check if photo is a GIF (for proper animation handling)
  const isGif = photoUrl && photoUrl.toLowerCase().includes('.gif');


  // Handle ESC key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle video playback
  useEffect(() => {
    if (!isOpen || effectiveMediaType !== 'video') return;
    if (!videoRef.current) return;

    const video = videoRef.current;
    video.play().catch(err => {
      console.error('Video playback failed:', err);
    });

    return () => {
      if (video) {
        video.pause();
        video.currentTime = 0;
      }
    };
  }, [isOpen, effectiveMediaType]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === modalRef.current) {
      onClose();
    }
  };

  // Render media content
  const renderMedia = () => {
    if (effectiveMediaType === 'text') {
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#f9f6f1] to-[#f5f0e8] p-12">
          <div className="text-center max-w-md">
            <p className="text-4xl md:text-5xl font-serif text-[#3a241e] mb-4">
              {contributorName}
            </p>
            <p className="text-sm md:text-base text-[#856b5f] uppercase tracking-wider">
              A memory for you
            </p>
          </div>
        </div>
      );
    }

    if (effectiveMediaType === 'video' && videoUrl) {
      return (
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-contain bg-[#1a1a1a]"
          controls
          playsInline
          preload="auto"
        >
          <track kind="captions" />
        </video>
      );
    }

    // Photo - render when effectiveMediaType is photo (matches MemoryCard)
    if (effectiveMediaType === 'photo') {
      return (
        <>
          <Image
            src={photoUrl!}
            alt={`Memory from ${contributorName}`}
            fill
            className="object-cover"
            unoptimized={isGif}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
        </>
      );
    }

    // Fallback for missing media
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#f9f6f1] to-[#f5f0e8] p-12">
        <div className="text-center max-w-md">
          <p className="text-4xl md:text-5xl font-serif text-[#3a241e] mb-4">
            {contributorName}
          </p>
          <p className="text-sm md:text-base text-[#856b5f] uppercase tracking-wider">
            A memory for you
          </p>
        </div>
      </div>
    );
  };

  // Text-only layout (optimized for reading)
  if (effectiveMediaType === 'text') {
    return (
      <div
        ref={modalRef}
        onClick={handleBackdropClick}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40
                   animate-in fade-in duration-200"
      >
        <div
          className="relative w-full h-full max-w-2xl mx-4 bg-[#fefdfb]
                      rounded-3xl overflow-hidden shadow-2xl
                      animate-in zoom-in-95 duration-300"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/90 hover:bg-white
                       flex items-center justify-center transition-all duration-200
                       focus:outline-none focus:ring-2 focus:ring-[#856b5f]"
            aria-label="Close"
          >
            <svg className="w-5 h-5 text-[#3a241e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="flex h-full flex-col items-center justify-center px-8 md:px-20 py-16 md:py-24">
            <div className="max-w-xl w-full space-y-12">
              {/* Message - optimized for reading */}
              {message && (
                <div>
                  <p className="text-lg md:text-xl leading-relaxed text-[#2a1a14] whitespace-pre-wrap font-serif">
                    {message}
                  </p>
                </div>
              )}

              {/* Signature */}
              <div className="pt-8 border-t border-[#3a241e]/10">
                <p className="text-base md:text-lg text-[#5a4a3e] italic font-serif">
                  — {contributorName}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Photo/video layout (side-by-side on desktop)
  return (
    <div
      ref={modalRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm
                 animate-in fade-in duration-200"
    >
      <div className="relative w-full h-full max-w-6xl mx-4 bg-gradient-to-br from-[#f9f6f1] via-[#fefdfb] to-[#f5f0e8]
                      rounded-3xl overflow-hidden shadow-2xl
                      animate-in zoom-in-95 duration-300">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/90 hover:bg-white
                     flex items-center justify-center transition-all duration-200
                     focus:outline-none focus:ring-2 focus:ring-[#856b5f]"
          aria-label="Close"
        >
          <svg className="w-5 h-5 text-[#3a241e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex h-full flex-col lg:flex-row">
          {/* Media Section */}
          <div
            ref={mediaContainerRef}
            className="relative flex-shrink-0 w-full lg:w-[60%] h-[50vh] lg:h-full"
          >
            {renderMedia()}
          </div>

          {/* Message Panel */}
          <div className="flex-1 flex items-center justify-center px-8 py-12 lg:px-12 overflow-y-auto">
            <div className="max-w-xl w-full space-y-8">
              {/* Message */}
              {message && (
                <div className="space-y-4">
                  <p className="text-lg md:text-xl leading-relaxed text-[#3a241e] whitespace-pre-wrap">
                    {message}
                  </p>
                </div>
              )}

              {/* Signature */}
              <div className="pt-8 border-t border-[#856b5f]/20">
                <p className="text-base md:text-lg text-[#856b5f] italic">
                  — {contributorName}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
