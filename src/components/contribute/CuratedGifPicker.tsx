"use client";

import { useState } from "react";
import Image from "next/image";
import { getCuratedGifs, type CuratedGif } from "@/lib/curatedGifs";

interface CuratedGifPickerProps {
  /** Currently selected GIF ID (if any) */
  selectedGifId?: string;
  /** Callback when a GIF is selected */
  onSelect: (gif: CuratedGif) => void;
  /** Callback when selection is removed */
  onRemove: () => void;
  /** Optional occasion key for filtering (future enhancement) */
  occasion?: string;
}

/**
 * Curated GIF Picker Component
 *
 * Standard MemoryPop GIF selection (no arbitrary upload).
 * Displays 4-8 pre-selected, emotionally appropriate GIFs.
 *
 * Layout:
 * - 2 columns on mobile (390px)
 * - 3-4 columns on desktop
 * - Animated GIF previews
 * - Click to select
 * - Visual selected state (border + checkmark)
 * - Max 1 selection
 * - Change/remove selection allowed
 *
 * Future: occasion-aware filtering via getCuratedGifs(occasion)
 */
export default function CuratedGifPicker({
  selectedGifId,
  onSelect,
  onRemove,
  occasion,
}: CuratedGifPickerProps) {
  const gifs = getCuratedGifs(occasion);

  const handleGifClick = (gif: CuratedGif) => {
    if (selectedGifId === gif.id) {
      // Clicking selected GIF again = remove selection
      onRemove();
    } else {
      // Select new GIF (replaces previous selection)
      onSelect(gif);
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-medium text-[#3a241e]">
            Add a GIF
          </h3>
          <p className="text-sm text-[#856b5f]/70 mt-0.5">
            Choose one animated GIF
          </p>
        </div>
        {selectedGifId && (
          <button
            onClick={onRemove}
            className="text-sm text-[#856b5f] hover:text-[#3a241e] transition-colors"
          >
            Remove
          </button>
        )}
      </div>

      {/* GIF Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {gifs.map((gif) => {
          const isSelected = selectedGifId === gif.id;

          return (
            <button
              key={gif.id}
              onClick={() => handleGifClick(gif)}
              className={`
                relative aspect-square rounded-xl overflow-hidden
                border-2 transition-all duration-200
                ${
                  isSelected
                    ? 'border-[#d4836d] shadow-[0_0_0_3px_rgba(212,131,109,0.2)]'
                    : 'border-transparent hover:border-[#d4836d]/40'
                }
                focus:outline-none focus:ring-2 focus:ring-[#856b5f] focus:ring-offset-2
                group
              `}
              aria-label={gif.description}
              aria-pressed={isSelected}
            >
              {/* GIF Preview (native img for animation) */}
              <img
                src={gif.url}
                alt={gif.description}
                className="absolute inset-0 w-full h-full object-cover"
              />

              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

              {/* Selected checkmark */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-[#d4836d] rounded-full flex items-center justify-center shadow-lg">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}

              {/* Hover overlay */}
              <div
                className={`
                  absolute inset-0 bg-[#d4836d]/0 transition-colors
                  ${!isSelected && 'group-hover:bg-[#d4836d]/10'}
                `}
              />

              {/* Category badge (bottom-left) */}
              <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-md">
                <span className="text-xs text-white font-medium capitalize">
                  {gif.category}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Helper text */}
      {!selectedGifId && (
        <p className="text-xs text-[#856b5f]/60 text-center">
          Click a GIF to select it
        </p>
      )}
    </div>
  );
}
