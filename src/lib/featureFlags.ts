/**
 * Feature flags for production safety
 */

/**
 * Video export feature flag
 *
 * Export requires:
 * - Background worker with Chromium + FFmpeg
 * - Cloud storage (not local filesystem)
 * - export_jobs table migration
 *
 * Set ENABLE_VIDEO_EXPORT=true in .env.local for local development
 * Production requires infrastructure before enabling
 */
export function isVideoExportEnabled(): boolean {
  // Server-side only check
  if (typeof window !== 'undefined') {
    throw new Error('isVideoExportEnabled() is server-side only. Use NEXT_PUBLIC_ENABLE_VIDEO_EXPORT on client.');
  }

  return process.env.ENABLE_VIDEO_EXPORT === 'true';
}

/**
 * Client-side check for video export availability
 * Must be prefixed with NEXT_PUBLIC_ to be available in browser
 */
export function isVideoExportEnabledClient(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_VIDEO_EXPORT === 'true';
}
