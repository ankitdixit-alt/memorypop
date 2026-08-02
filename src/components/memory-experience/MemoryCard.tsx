"use client";

import Image from "next/image";
import type { MemoryCardProps } from "./types";

/**
 * Memory Card Component
 *
 * Three variants:
 * 1. Photo card: Image + contributor name overlay
 * 2. Text-only card: Elegant typographic treatment with gradient background
 * 3. Video card: Thumbnail + play icon indicator
 *
 * Interaction:
 * - Hover: subtle scale + shadow lift
 * - Click: opens detail modal
 *
 * Visual language from Premium Reveal:
 * - Colors: #3a241e, #856b5f, #f5e6d3, #e8d4c0
 * - Rounded corners, generous padding
 * - Premium magazine feel
 */
export default function MemoryCard({ memory, onClick }: MemoryCardProps) {
  const { contributorName, message, photoUrl, videoUrl, mediaType } = memory;

  // Determine effective media type (handle missing photos)
  const hasValidPhoto = photoUrl && photoUrl.trim().length > 0;
  const effectiveMediaType = (mediaType === 'photo' && !hasValidPhoto) ? 'text' : mediaType;

  // Use full message for preview - CSS will handle line clamping with natural fade
  const messagePreview = message || '';

  return (
    <button
      onClick={onClick}
      className="group relative aspect-[4/5] w-full rounded-lg overflow-hidden
                 transition-all duration-300 ease-out
                 hover:scale-[1.02] hover:shadow-xl
                 focus:outline-none focus:ring-2 focus:ring-[#856b5f] focus:ring-offset-2"
    >
      {/* Photo variant */}
      {effectiveMediaType === 'photo' && (
        <>
          <Image
            src={photoUrl || ''}
            alt={`Memory from ${contributorName}`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
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

      {/* Video variant */}
      {effectiveMediaType === 'video' && (
        <>
          {photoUrl ? (
            <Image
              src={photoUrl}
              alt={`Video from ${contributorName}`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#f5e6d3] to-[#e8d4c0]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

          {/* Play icon */}
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

          <div className="absolute bottom-0 left-0 right-0 p-6">
            <p className="text-white text-lg font-serif">{contributorName}</p>
            <p className="text-white/80 text-sm mt-1">Video memory</p>
          </div>
        </>
      )}

      {/* Text-only variant */}
      {effectiveMediaType === 'text' && (
        <div className="absolute inset-0 bg-gradient-to-br from-[#f5e6d3] to-[#e8d4c0]
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
