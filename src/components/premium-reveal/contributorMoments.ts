/**
 * Contributor Moment Model
 *
 * Normalizes all contributor memories into a contributor-driven model.
 * Media is presentation format, contributor is the unit of storytelling.
 */

interface Memory {
  id: string;
  contributor_name: string;
  message: string;
  photo_url: string | null;
  video_url?: string | null;
}

export type MediaType = 'photo' | 'video' | 'text' | 'photo_video';

export interface ContributorMoment {
  id: string;
  contributorName: string;
  message?: string;
  photoUrl?: string | null;
  videoUrl?: string | null;
  mediaType: MediaType;
  introduction: string;
}

/**
 * Determine media type for a contributor
 */
function getMediaType(memory: Memory): MediaType {
  const hasPhoto = !!memory.photo_url;
  const hasVideo = !!memory.video_url;

  if (hasPhoto && hasVideo) return 'photo_video';
  if (hasVideo) return 'video';
  if (hasPhoto) return 'photo';
  return 'text';
}

/**
 * Check if a contributor has meaningful content
 */
function hasValidContribution(memory: Memory): boolean {
  // Must have at least one of: message, photo, or video
  const hasMessage = !!memory.message && memory.message.trim().length > 0;
  const hasPhoto = !!memory.photo_url;
  const hasVideo = !!memory.video_url;

  return hasMessage || hasPhoto || hasVideo;
}

/**
 * Build contributor moments from raw memories
 * Includes ALL valid contributors - no arbitrary limits
 */
export function buildContributorMoments(
  memories: Memory[],
  introductions: Array<{ contributorName: string; introduction: string }>
): ContributorMoment[] {
  // Filter to valid contributions only
  const validMemories = memories.filter(hasValidContribution);

  // Build contributor moments
  return validMemories.map((memory, index) => {
    const mediaType = getMediaType(memory);
    const intro = introductions[index];

    return {
      id: memory.id,
      contributorName: memory.contributor_name,
      message: memory.message || undefined,
      photoUrl: memory.photo_url,
      videoUrl: memory.video_url,
      mediaType,
      introduction: intro?.introduction || `${memory.contributor_name} wanted to share something...`,
    };
  });
}

/**
 * Group memories by contributor name
 * Handles cases where one contributor has multiple memories
 */
export function groupByContributor(memories: Memory[]): Map<string, Memory[]> {
  const groups = new Map<string, Memory[]>();

  for (const memory of memories) {
    const existing = groups.get(memory.contributor_name) || [];
    existing.push(memory);
    groups.set(memory.contributor_name, existing);
  }

  return groups;
}

/**
 * Merge multiple memories from same contributor into one moment
 * Use best available media + combine messages if needed
 */
export function mergeContributorMemories(memories: Memory[]): Memory {
  if (memories.length === 1) return memories[0];

  // Prefer memory with most media types
  const sorted = [...memories].sort((a, b) => {
    const aScore = (a.photo_url ? 1 : 0) + (a.video_url ? 1 : 0);
    const bScore = (b.photo_url ? 1 : 0) + (b.video_url ? 1 : 0);
    return bScore - aScore;
  });

  const base = sorted[0];

  // Collect all non-empty messages
  const messages = memories
    .map(m => m.message?.trim())
    .filter(Boolean);

  return {
    ...base,
    message: messages.join(' '), // Combine messages
    photo_url: base.photo_url || sorted.find(m => m.photo_url)?.photo_url || null,
    video_url: base.video_url || sorted.find(m => m.video_url)?.video_url || null,
  };
}
