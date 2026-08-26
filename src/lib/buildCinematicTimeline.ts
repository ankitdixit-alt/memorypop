/**
 * FLAT GLOBAL CINEMATIC TIMELINE BUILDER
 *
 * Builds ONE flat scene sequence from ALL memories.
 * No nested per-memory progression.
 * Each scene references its source memory and media.
 */

import type { MediaItem, VideoMedia } from "@/components/memory-experience/types";

export interface Memory {
  id: string;
  contributor_name: string;
  message: string;
  photo_url: string | null;
  photos?: MediaItem[];
  gifs?: MediaItem[];
  video?: VideoMedia | null;
}

export type SceneType = 'contributor' | 'message' | 'photo' | 'gif' | 'video';

export interface CinematicScene {
  type: SceneType;
  memoryIndex: number;
  memory: Memory;
  mediaIndex?: number; // For photos/gifs with multiple items
  media?: MediaItem | VideoMedia; // Actual media content
}

/**
 * Build flat global cinematic timeline from memories
 *
 * Each memory contributes:
 * 1. Contributor scene
 * 2. Message scene
 * 3. One scene per photo (in array order)
 * 4. One scene per GIF (in array order)
 * 5. One video scene (if present)
 *
 * Returns flat array of ALL scenes across ALL memories.
 */
export function buildCinematicTimeline(memories: Memory[]): CinematicScene[] {
  const timeline: CinematicScene[] = [];

  memories.forEach((memory, memoryIndex) => {
    // Parse media from memory
    const photos = memory.photos || (
      memory.photo_url && !memory.photo_url.endsWith('.gif')
        ? [{ url: memory.photo_url, uploaded_at: '', file_size_bytes: 0 }]
        : []
    );

    const gifs = memory.gifs || (
      memory.photo_url && memory.photo_url.endsWith('.gif')
        ? [{ url: memory.photo_url, uploaded_at: '', file_size_bytes: 0 }]
        : []
    );

    const video = memory.video || null;

    // 1. Contributor scene
    timeline.push({
      type: 'contributor',
      memoryIndex,
      memory
    });

    // 2. Message scene
    timeline.push({
      type: 'message',
      memoryIndex,
      memory
    });

    // 3. One scene per photo (preserve array order)
    photos.forEach((photo, photoIndex) => {
      timeline.push({
        type: 'photo',
        memoryIndex,
        memory,
        mediaIndex: photoIndex,
        media: photo
      });
    });

    // 4. One scene per GIF
    gifs.forEach((gif, gifIndex) => {
      timeline.push({
        type: 'gif',
        memoryIndex,
        memory,
        mediaIndex: gifIndex,
        media: gif
      });
    });

    // 5. Video scene (if present)
    if (video) {
      timeline.push({
        type: 'video',
        memoryIndex,
        memory,
        media: video
      });
    }
  });

  return timeline;
}

/**
 * Get scene duration in milliseconds
 */
export function getSceneDuration(scene: CinematicScene): number {
  switch (scene.type) {
    case 'contributor':
      return 3000; // 3 seconds
    case 'message':
      // Reading time: ~200 words per minute = ~3.3 words per second
      const words = (scene.memory.message || '').split(/\s+/).length;
      return Math.max(4000, words * 300); // Minimum 4s
    case 'photo':
      return 5000; // 5 seconds per photo
    case 'gif':
      return 6000; // 6 seconds per GIF
    case 'video':
      return 0; // Video duration handled by video element
    default:
      return 4000;
  }
}

/**
 * Get memory info for current scene
 */
export function getMemoryInfo(scene: CinematicScene, totalMemories: number) {
  return {
    currentMemory: scene.memoryIndex + 1,
    totalMemories,
    contributorName: scene.memory.contributor_name
  };
}
