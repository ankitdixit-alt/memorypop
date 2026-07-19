"use client";

import { useEffect, useMemo } from "react";
import { OCCASIONS, type OccasionCategory as CategoryType } from "@/lib/occasions";

interface Occasion {
  id: string;
  label: string;
  emoji: string;
}

interface OccasionCategory {
  id: CategoryType;
  label: string;
  emoji: string;
  occasions: Occasion[];
}

interface OccasionSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (occasion: string) => void;
  currentOccasion?: string;
}

// Category metadata
const CATEGORY_METADATA: Record<CategoryType, { label: string; emoji: string }> = {
  celebrate: { label: 'Celebrate', emoji: '🎉' },
  love: { label: 'Love', emoji: '❤️' },
  family: { label: 'Family', emoji: '👶' },
  milestones: { label: 'Milestones', emoji: '🌴' },
  support: { label: 'Support', emoji: '💛' },
};

export default function OccasionSelector({
  isOpen,
  onClose,
  onSelect,
  currentOccasion
}: OccasionSelectorProps) {
  // Build grouped categories from OCCASIONS object
  const OCCASION_CATEGORIES = useMemo(() => {
    const categoryMap: Record<CategoryType, OccasionCategory> = {
      celebrate: { id: 'celebrate', ...CATEGORY_METADATA.celebrate, occasions: [] },
      love: { id: 'love', ...CATEGORY_METADATA.love, occasions: [] },
      family: { id: 'family', ...CATEGORY_METADATA.family, occasions: [] },
      milestones: { id: 'milestones', ...CATEGORY_METADATA.milestones, occasions: [] },
      support: { id: 'support', ...CATEGORY_METADATA.support, occasions: [] },
    };

    // Group occasions by category
    Object.values(OCCASIONS).forEach(occasion => {
      categoryMap[occasion.category].occasions.push({
        id: occasion.id,
        label: occasion.label,
        emoji: occasion.emoji,
      });
    });

    return Object.values(categoryMap);
  }, []);

  // Close on ESC key
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

  // Prevent body scroll when modal is open
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

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-0 sm:px-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="occasion-selector-title"
    >
      <div
        className="w-full sm:max-w-2xl bg-white rounded-t-3xl sm:rounded-2xl p-6 sm:p-8 shadow-2xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2
            id="occasion-selector-title"
            className="text-2xl font-bold text-[#3a241e]"
          >
            Select an Occasion
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#6B5B52] hover:bg-[#FFF1EC] hover:text-[#FF6B57] transition-colors"
            aria-label="Close occasion selector"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 5L5 15M5 5L15 15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Categories */}
        <div className="space-y-6">
          {OCCASION_CATEGORIES.map(category => (
            <div key={category.id} role="group" aria-labelledby={`category-${category.id}`}>
              <h3
                id={`category-${category.id}`}
                className="text-sm font-semibold uppercase tracking-wide text-[#6B5B52] mb-3"
              >
                {category.emoji} {category.label}
              </h3>
              <div className="grid grid-cols-1 gap-2" role="listbox">
                {category.occasions.map(occasion => {
                  const isSelected = currentOccasion === occasion.label;
                  return (
                    <button
                      key={occasion.id}
                      onClick={() => onSelect(occasion.label)}
                      className={`text-left p-4 rounded-xl border transition-all ${
                        isSelected
                          ? 'border-[#FF6B57] bg-[#FFF1EC] ring-2 ring-[#FF6B57] ring-offset-2'
                          : 'border-[#F0DED2] hover:border-[#FF6B57] hover:bg-[#FFF1EC]'
                      } active:ring-2 active:ring-[#FF6B57]`}
                      role="option"
                      aria-selected={isSelected}
                      aria-label={`Select ${occasion.label} celebration`}
                    >
                      <span className="text-lg">{occasion.emoji}</span>
                      <span className="ml-3 font-semibold text-[#3a241e]">
                        {occasion.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
