"use client";

import { useState, useRef, useMemo } from "react";
import GalleryHeader from "./GalleryHeader";
import MemoryGrid from "./MemoryGrid";
import DetailModal from "./DetailModal";
import GalleryClosing from "./GalleryClosing";
import type { GalleryViewProps, Memory } from "./types";

/**
 * Gallery View Component (Main Container)
 *
 * Top-level component for the Memory Experience feature.
 * Manages modal state and orchestrates child components.
 *
 * Structure:
 * 1. GalleryHeader - Recipient name
 * 2. MemoryGrid - Grid of memory cards
 * 3. GalleryClosing - Contributors + permanent home message
 * 4. DetailModal - Full memory modal (conditionally rendered)
 *
 * State:
 * - selectedMemory: Currently opened memory (null when modal closed)
 * - scrollPosition: Captured scroll position before opening modal
 *
 * Background:
 * - Premium Reveal gradient: from-[#fff8ef] via-[#ffe8d6] to-[#ffd4cc]
 * - Full-height container
 */
export default function GalleryView({
  memoryPop,
  memories: rawMemories,
  shareLink,
}: GalleryViewProps) {
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const scrollPositionRef = useRef<number>(0);

  // Transform database memories to component format
  const memories = useMemo<Memory[]>(() => {
    return rawMemories.map((mem) => {
      // Validate and clean media URLs
      const hasValidPhotoUrl = mem.photo_url && mem.photo_url.trim().length > 0;
      const hasValidVideoUrl = mem.video_url && mem.video_url.trim().length > 0;

      // Determine media type
      let mediaType: 'photo' | 'video' | 'text' = 'text';
      if (hasValidVideoUrl) {
        mediaType = 'video';
      } else if (hasValidPhotoUrl) {
        mediaType = 'photo';
      }

      return {
        id: mem.id,
        contributorName: mem.contributor_name,
        message: mem.message,
        photoUrl: hasValidPhotoUrl ? mem.photo_url! : undefined,
        videoUrl: hasValidVideoUrl ? mem.video_url! : undefined,
        mediaType,
        createdAt: new Date(mem.created_at),
      };
    });
  }, [rawMemories]);

  // Derive unique contributors from memories
  const contributors = useMemo(() => {
    const uniqueNames = new Set<string>();
    memories.forEach(mem => uniqueNames.add(mem.contributorName));
    return Array.from(uniqueNames).map(name => ({ name }));
  }, [memories]);

  const handleMemoryClick = (memory: Memory) => {
    // Capture current scroll position
    scrollPositionRef.current = window.scrollY;
    setSelectedMemory(memory);
  };

  const handleModalClose = () => {
    setSelectedMemory(null);

    // Restore scroll position after modal closes
    requestAnimationFrame(() => {
      window.scrollTo(0, scrollPositionRef.current);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f9f6f1] via-[#fefdfb] to-[#f5f0e8]">
      {/* Header */}
      <GalleryHeader recipientName={memoryPop.recipient_name} />

      {/* Memory Grid */}
      <MemoryGrid
        memories={memories}
        onMemoryClick={handleMemoryClick}
      />

      {/* Closing */}
      <GalleryClosing contributors={contributors} />

      {/* Detail Modal */}
      {selectedMemory && (
        <DetailModal
          memory={selectedMemory}
          isOpen={!!selectedMemory}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}
