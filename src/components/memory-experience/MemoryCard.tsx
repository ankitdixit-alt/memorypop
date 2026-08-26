"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import type { MemoryCardProps } from "./types";

/**
 * Memory Card Component
 *
 * Four variants:
 * 1. Photo card: Image + contributor name overlay
 * 2. Multi-photo card: 2-4 photos with smart layouts, 5+ with auto-rotation
 * 3. Text-only card: Elegant typographic treatment with gradient background
 * 4. Video card: Thumbnail + play icon indicator
 *
 * Standard multimedia support (JSONB):
 * - photos[] (up to 3 photos)
 * - gifs[] (up to 1 GIF)
 * - video (single video)
 *
 * Thumbnail priority: photos[0] > gifs[0] > video thumbnail > text-only
 * Media count badge shows total items (e.g., "5" for 3 photos + 1 GIF + 1 video)
 *
 * Backwards compatibility:
 * - Legacy photoUrl, multiplePhotos, videoUrl fields
 *
 * Interaction:
 * - Hover: subtle scale + shadow lift
 * - Click: opens detail modal
 *
 * Visual language: Glass Morphism (Option C)
 * - Frosted glass effect with backdrop blur
 * - Premium iOS 15+ design language
 */
export default function MemoryCard({ memory, onClick }: MemoryCardProps) {
  const { contributorName, message, photoUrl, mediaType, photos, gifs, video } = memory;

  // Backwards compatibility: Normalize JSONB and legacy photo_url
  const normalizedPhotos = photos || (photoUrl && !photoUrl.endsWith('.gif') ? [{ url: photoUrl, uploaded_at: '', file_size_bytes: 0 }] : []);
  const normalizedGifs = gifs || (photoUrl && photoUrl.endsWith('.gif') ? [{ url: photoUrl, uploaded_at: '', file_size_bytes: 0 }] : []);
  const normalizedVideo = video || null;

  // Calculate total media count
  const totalMediaCount = normalizedPhotos.length + normalizedGifs.length + (normalizedVideo ? 1 : 0);

  // Thumbnail priority: photos[0] > gifs[0] > video > text-only
  const thumbnailUrl = normalizedPhotos[0]?.url || normalizedGifs[0]?.url || (normalizedVideo?.url) || null;
  const thumbnailIsGif = !!(thumbnailUrl && thumbnailUrl.toLowerCase().includes('.gif'));
  const showVideoPlayIcon = !normalizedPhotos.length && !normalizedGifs.length && normalizedVideo;

  // Use full message for preview - CSS will handle line clamping with natural fade
  const messagePreview = message || '';

  // Multi-photo support (for carousel display if >4 photos in legacy multiplePhotos)
  const hasMultiplePhotos = normalizedPhotos.length > 1;
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Auto-rotation for 5+ photos (batches of 4)
  useEffect(() => {
    if (!hasMultiplePhotos || normalizedPhotos.length <= 4) return;

    const photoBatches = Math.ceil(normalizedPhotos.length / 4);
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % photoBatches);
    }, 3000);

    return () => clearInterval(interval);
  }, [hasMultiplePhotos, normalizedPhotos.length]);

  // Render multi-photo layout
  const renderMultiPhotoLayout = () => {
    if (!hasMultiplePhotos) return null;

    const allPhotos = normalizedPhotos.map(p => p.url);
    const photoBatches = [];
    for (let i = 0; i < allPhotos.length; i += 4) {
      photoBatches.push(allPhotos.slice(i, i + 4));
    }

    const currentPhotos = photoBatches[currentSlideIndex] || [];
    const photoCount = currentPhotos.length;

    if (photoCount === 2) {
      return (
        <>
          <div className="absolute inset-0 flex gap-0.5">
            {currentPhotos.map((photo, idx) => (
              <div key={idx} className="relative flex-1 overflow-hidden">
                <Image
                  src={photo}
                  alt={`Photo ${idx + 1}`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  unoptimized={photo.toLowerCase().includes('.gif')}
                />
              </div>
            ))}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
            <svg className="w-4 h-4 text-[#3a241e]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium text-[#3a241e]">{totalMediaCount}</span>
          </div>
        </>
      );
    }

    if (photoCount === 3) {
      return (
        <>
          <div className="absolute inset-0 flex gap-0.5">
            <div className="relative flex-[2] overflow-hidden">
              <Image
                src={currentPhotos[0]}
                alt="Photo 1"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                unoptimized={currentPhotos[0].toLowerCase().includes('.gif')}
              />
            </div>
            <div className="flex-1 flex flex-col gap-0.5">
              {currentPhotos.slice(1).map((photo, idx) => (
                <div key={idx} className="relative flex-1 overflow-hidden">
                  <Image
                    src={photo}
                    alt={`Photo ${idx + 2}`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    unoptimized={photo.toLowerCase().includes('.gif')}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
            <svg className="w-4 h-4 text-[#3a241e]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium text-[#3a241e]">{totalMediaCount}</span>
          </div>
        </>
      );
    }

    if (photoCount >= 4) {
      return (
        <>
          <div className="absolute inset-0 flex flex-col gap-0.5">
            <div className="flex-1 flex gap-0.5">
              {currentPhotos.slice(0, 2).map((photo, idx) => (
                <div key={idx} className="relative flex-1 overflow-hidden">
                  <Image
                    src={photo}
                    alt={`Photo ${idx + 1}`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    unoptimized={photo.toLowerCase().includes('.gif')}
                  />
                </div>
              ))}
            </div>
            <div className="flex-1 flex gap-0.5">
              {currentPhotos.slice(2, 4).map((photo, idx) => (
                <div key={idx} className="relative flex-1 overflow-hidden">
                  <Image
                    src={photo}
                    alt={`Photo ${idx + 3}`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    unoptimized={photo.toLowerCase().includes('.gif')}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
            <svg className="w-4 h-4 text-[#3a241e]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium text-[#3a241e]">{totalMediaCount}</span>
          </div>
          {photoBatches.length > 1 && (
            <div className="absolute top-4 left-4 flex gap-1.5">
              {photoBatches.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentSlideIndex ? 'bg-white w-4' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </>
      );
    }

    return null;
  };

  return (
    <button
      onClick={onClick}
      className="group relative aspect-[4/5] w-full rounded-3xl overflow-hidden
                 border border-white/40 backdrop-blur-xl bg-white/60
                 shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.08),0_24px_56px_rgba(0,0,0,0.06)]
                 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06),0_12px_32px_rgba(0,0,0,0.10),0_32px_72px_rgba(0,0,0,0.08)]
                 hover:scale-[1.04] hover:-translate-y-2
                 transition-all duration-700 cubic-bezier(0.34, 1.56, 0.64, 1)
                 focus:outline-none focus:ring-2 focus:ring-[#856b5f] focus:ring-offset-2"
    >
      {/* Multi-photo variant */}
      {hasMultiplePhotos ? (
        <>
          {renderMultiPhotoLayout()}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <p className="text-white text-lg font-serif mb-2">{contributorName}</p>
            {messagePreview && (
              <p className="text-white/90 text-sm leading-relaxed line-clamp-2">
                {messagePreview}
              </p>
            )}
          </div>
        </>
      ) : null}

      {/* Photo/GIF/Video variant (single thumbnail) */}
      {!hasMultiplePhotos && thumbnailUrl && (
        <>
          <Image
            src={thumbnailUrl}
            alt={`Memory from ${contributorName}`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            unoptimized={thumbnailIsGif}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

          {/* Media count badge (if multiple items) */}
          {totalMediaCount > 1 && (
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
              <svg className="w-4 h-4 text-[#3a241e]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-[#3a241e]">{totalMediaCount}</span>
            </div>
          )}

          {/* Video play icon (if video is the only media) */}
          {showVideoPlayIcon && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center
                              transition-all duration-300 group-hover:bg-white group-hover:scale-110">
                <svg
                  className="w-8 h-8 text-[#3a241e] ml-1"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-6">
            <p className="text-white text-lg font-serif mb-2">{contributorName}</p>
            {messagePreview && (
              <div className="relative">
                <p className="text-white/90 text-sm leading-relaxed line-clamp-3">
                  {messagePreview}
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Text-only variant */}
      {!hasMultiplePhotos && !thumbnailUrl && (
        <div className="absolute inset-0 bg-gradient-to-br from-[#f9f6f1] to-[#f5f0e8]
                        flex flex-col items-center justify-center p-8 text-center">
          <p className="text-2xl md:text-3xl font-serif text-[#3a241e] mb-4">
            {contributorName}
          </p>
          {messagePreview && (
            <div className="relative w-full">
              <p className="text-sm md:text-base text-[#856b5f] line-clamp-3 leading-relaxed">
                {messagePreview}
              </p>
            </div>
          )}
          <p className="text-xs text-[#856b5f]/70 uppercase tracking-wider mt-4">
            Tap to read
          </p>
        </div>
      )}
    </button>
  );
}
