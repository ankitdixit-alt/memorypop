"use client";

import { useEffect } from "react";
import Image from "next/image";
import type { MediaType } from "../contributorMoments";

interface Contributor {
  name: string;
  photoUrl?: string | null;
  videoUrl?: string | null;
  mediaType: MediaType;
}

interface OpeningMontageSceneProps {
  contributors: Contributor[];
  onComplete: () => void;
  isPaused: boolean;
  isMuted: boolean;
  isReducedMotion: boolean;
}

/**
 * Opening Montage Scene
 *
 * Brief 3-second moment showing all contributors in a grid.
 * Supports photos, video posters, and text-only tiles.
 * Purpose: Create anticipation by showing several people came together.
 */
export default function OpeningMontageScene({
  contributors,
  onComplete,
  isPaused,
  isReducedMotion,
}: OpeningMontageSceneProps) {
  useEffect(() => {
    if (isPaused) return;

    // 3 seconds, then transition
    const timer = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, [isPaused, onComplete]);

  // Determine grid layout based on contributor count
  const getGridClasses = (count: number) => {
    if (count <= 2) return 'grid-cols-2';
    if (count === 3) return 'grid-cols-3';
    if (count === 4) return 'grid-cols-2 grid-rows-2';
    if (count === 5) return 'grid-cols-3'; // 3 on top row, 2 on bottom
    if (count === 6) return 'grid-cols-3 grid-rows-2';
    if (count >= 7 && count <= 8) return 'grid-cols-4'; // 7-8 contributors
    return 'grid-cols-4'; // 9+ use 4 columns
  };

  const transitionClass = isReducedMotion
    ? ''
    : 'transition-all duration-1000';

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#fff8ef] via-[#ffe8d6] to-[#ffd4cc] px-6">
      <div className="w-full max-w-4xl">
        {/* Grid of contributors - adapts to count */}
        <div
          className={`grid gap-4 ${getGridClasses(contributors.length)} ${transitionClass} opacity-100`}
        >
          {contributors.map((contributor, index) => (
            <div
              key={index}
              className={`relative aspect-square overflow-hidden rounded-lg ${transitionClass}`}
              style={{
                animationDelay: isReducedMotion ? '0ms' : `${index * 100}ms`,
              }}
            >
              {/* Photo or video poster */}
              {(contributor.photoUrl || contributor.videoUrl) ? (
                <Image
                  src={contributor.photoUrl || contributor.videoUrl || ''}
                  alt={`From ${contributor.name}`}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                /* Text-only contributor tile */
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#f5e6d3] to-[#e8d4c0] p-4">
                  <p className="text-center text-lg md:text-xl font-medium text-[#3a241e] line-clamp-3">
                    {contributor.name}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        ${!isReducedMotion ? `
          .grid > div {
            animation: fadeInScale 600ms ease-out forwards;
          }
        ` : ''}
      `}</style>
    </div>
  );
}
