"use client";

import MemoryCard from "./MemoryCard";
import type { Memory } from "./types";

/**
 * Memory Grid Component
 *
 * Responsive grid layout (FOUNDER APPROVED):
 * - Mobile (320px+): 1 column, gap 1.5rem
 * - Tablet (768px+): 2 columns, gap 2rem
 * - Desktop (1024px+): 2 columns (NOT 3), gap 3rem, max-width 1000px
 *
 * Premium magazine feel:
 * - Constrained width with generous margins
 * - Whitespace is intentional (digital keepsake principle)
 * - Centered layout
 */

interface MemoryGridProps {
  memories: Memory[];
  onMemoryClick: (memory: Memory) => void;
}

export default function MemoryGrid({ memories, onMemoryClick }: MemoryGridProps) {
  return (
    <div className="w-full px-6 pb-16">
      <div
        className="grid gap-6 md:gap-8 lg:gap-14 mx-auto
                   grid-cols-1
                   md:grid-cols-2
                   lg:grid-cols-2
                   lg:max-w-[1000px]"
      >
        {memories.map((memory) => (
          <MemoryCard
            key={memory.id}
            memory={memory}
            onClick={() => onMemoryClick(memory)}
          />
        ))}
      </div>
    </div>
  );
}
