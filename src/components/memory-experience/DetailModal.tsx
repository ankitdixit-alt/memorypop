"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import type { DetailModalProps } from "./types";

/**
 * Detail Modal Component
 *
 * Full-screen immersive modal for viewing complete memory.
 * Used in production recipient experience only.
 *
 * Features:
 * - Photo/GIF/video display (Standard multimedia)
 * - Full message text
 * - Contributor name signature
 * - Multi-photo support with smart layouts
 *
 * Standard multimedia support (JSONB):
 * - photos[] (up to 3 photos)
 * - gifs[] (up to 1 GIF)
 * - video (single video with validation proof)
 *
 * Display logic:
 * - All media types shown vertically stacked in media section
 * - Photos shown in collage (1/2/3 layout)
 * - GIFs shown with native img tag (preserves animation)
 * - Video shown with HTML5 controls
 *
 * Backwards compatibility:
 * - Legacy photoUrl field (real backwards compatibility)
 *
 * Interaction:
 * - Click backdrop to close
 * - ESC key to close
 * - Close button (X) in top-right
 * - Backdrop blur effect
 * - Body scroll lock when open
 */
export default function DetailModal({ memory, isOpen, onClose }: DetailModalProps) {
  const { contributorName, message, photoUrl, mediaType, photos, gifs, video } = memory;
  const videoRef = useRef<HTMLVideoElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const mediaContainerRef = useRef<HTMLDivElement>(null);

  // Backwards compatibility: Normalize JSONB and legacy photo_url
  const normalizedPhotos = photos || (photoUrl && !photoUrl.endsWith('.gif') ? [{ url: photoUrl, uploaded_at: '', file_size_bytes: 0 }] : []);
  const normalizedGifs = gifs || (photoUrl && photoUrl.endsWith('.gif') ? [{ url: photoUrl, uploaded_at: '', file_size_bytes: 0 }] : []);
  const normalizedVideo = video || null;

  // Check for valid visual media
  const hasPhotos = normalizedPhotos.length > 0;
  const hasGifs = normalizedGifs.length > 0;
  const hasVideo = normalizedVideo !== null;
  const hasVisualMedia = hasPhotos || hasGifs || hasVideo;

  // Determine effective media type (text-only if no media, otherwise 'media' for mixed content)
  const effectiveMediaType: 'text' | 'media' = hasVisualMedia ? 'media' : 'text';


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

  // Pause video when modal closes (no autoplay on open)
  useEffect(() => {
    if (!isOpen && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === modalRef.current) {
      onClose();
    }
  };

  // Render media content (all media types stacked vertically)
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

    // Multimedia display: Photos + GIFs + Video (stacked vertically)
    return (
      <div className="absolute inset-0 overflow-y-auto bg-[#1a1a1a] p-4 md:p-6 space-y-4">
        {/* Photos */}
        {hasPhotos && (
          <div className="w-full">
            {normalizedPhotos.length === 1 && (
              <Image
                src={normalizedPhotos[0].url}
                alt={`Photo from ${contributorName}`}
                width={800}
                height={600}
                className="w-full h-auto rounded-lg"
                unoptimized={normalizedPhotos[0].url.toLowerCase().includes('.gif')}
              />
            )}
            {normalizedPhotos.length === 2 && (
              <div className="grid grid-cols-2 gap-2">
                {normalizedPhotos.map((photo, idx) => (
                  <Image
                    key={idx}
                    src={photo.url}
                    alt={`Photo ${idx + 1} from ${contributorName}`}
                    width={400}
                    height={300}
                    className="w-full h-auto rounded-lg"
                    unoptimized={photo.url.toLowerCase().includes('.gif')}
                  />
                ))}
              </div>
            )}
            {normalizedPhotos.length === 3 && (
              <div className="grid grid-cols-2 gap-2">
                <div className="row-span-2">
                  <Image
                    src={normalizedPhotos[0].url}
                    alt={`Photo 1 from ${contributorName}`}
                    width={400}
                    height={600}
                    className="w-full h-full object-cover rounded-lg"
                    unoptimized={normalizedPhotos[0].url.toLowerCase().includes('.gif')}
                  />
                </div>
                {normalizedPhotos.slice(1).map((photo, idx) => (
                  <Image
                    key={idx}
                    src={photo.url}
                    alt={`Photo ${idx + 2} from ${contributorName}`}
                    width={400}
                    height={300}
                    className="w-full h-auto rounded-lg"
                    unoptimized={photo.url.toLowerCase().includes('.gif')}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* GIFs (native img tag to preserve animation) */}
        {hasGifs && normalizedGifs.map((gif, idx) => (
          <div key={idx} className="w-full relative">
            <img
              src={gif.url}
              alt={`GIF from ${contributorName}`}
              className="w-full h-auto rounded-lg"
            />
            <div className="absolute top-3 left-3 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-semibold">
              GIF
            </div>
          </div>
        ))}

        {/* Video */}
        {hasVideo && normalizedVideo && (
          <div className="w-full relative">
            <video
              ref={videoRef}
              src={normalizedVideo.url}
              className="w-full h-auto rounded-lg bg-black"
              controls
              playsInline
              preload="metadata"
            >
              <track kind="captions" />
            </video>
            {normalizedVideo.duration_seconds > 0 && (
              <div className="absolute top-3 left-3 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-semibold">
                {normalizedVideo.duration_seconds.toFixed(1)}s
              </div>
            )}
          </div>
        )}
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
        <div className="relative w-full h-full max-w-2xl mx-4 bg-[#fefdfb]
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

  // Media layout (side-by-side on desktop)
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
