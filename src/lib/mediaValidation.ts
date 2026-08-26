/**
 * Shared Media Validation Utilities
 *
 * Standard tier multimedia validation rules used by both:
 * - Creator (at creation time)
 * - Contributors (when adding memories)
 *
 * Ensures ONE source of truth for validation logic.
 */

export interface PhotoValidation {
  valid: boolean;
  error?: string;
}

export interface VideoValidation {
  valid: boolean;
  duration?: number;
  error?: string;
}

/**
 * Validate photo file
 * Standard: max 3 photos, 10MB each, JPEG/PNG/WebP only
 */
export function validatePhotoFile(file: File): PhotoValidation {
  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Only JPEG, PNG, and WebP photos are allowed.'
    };
  }

  // Validate file size (10MB limit)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Each photo must be under 10MB.'
    };
  }

  return { valid: true };
}

/**
 * Validate video file
 * Standard: max 1 video, 50MB, 15s max, MP4/MOV/WebM only
 */
export async function validateVideoFile(file: File): Promise<VideoValidation> {
  // Validate file type
  const allowedTypes = ['video/mp4', 'video/quicktime', 'video/webm'];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Only MP4, MOV, and WebM videos are allowed.'
    };
  }

  // Validate file size (50MB limit)
  const maxSize = 50 * 1024 * 1024; // 50MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Video must be under 50MB.'
    };
  }

  // Validate duration (15s limit for Standard tier)
  try {
    const duration = await getVideoDuration(file);

    if (!Number.isFinite(duration) || duration <= 0) {
      return {
        valid: false,
        error: 'Could not determine video duration. The file may be corrupted.'
      };
    }

    if (duration > 15) {
      return {
        valid: false,
        error: `Video is ${duration.toFixed(1)} seconds long. Standard MemoryPops have a 15-second video limit.`,
        duration
      };
    }

    return {
      valid: true,
      duration
    };
  } catch (error) {
    return {
      valid: false,
      error: 'Could not read video. Please ensure it is a valid video file.'
    };
  }
}

/**
 * Get video duration from File
 */
export function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const videoElement = document.createElement('video');
    videoElement.preload = 'metadata';

    videoElement.onloadedmetadata = () => {
      URL.revokeObjectURL(videoElement.src);
      resolve(videoElement.duration);
    };

    videoElement.onerror = () => {
      URL.revokeObjectURL(videoElement.src);
      reject(new Error('Failed to load video metadata'));
    };

    videoElement.src = URL.createObjectURL(file);
  });
}

/**
 * Standard tier multimedia limits
 */
export const STANDARD_LIMITS = {
  maxPhotos: 3,
  maxPhotoSizeMB: 10,
  maxGifs: 1,
  maxVideos: 1,
  maxVideoSizeMB: 50,
  maxVideoDurationSeconds: 15,
} as const;
