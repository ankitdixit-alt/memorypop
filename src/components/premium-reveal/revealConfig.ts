import { selectIntroductions } from './introductionLibrary';
import {
  buildContributorMoments,
  groupByContributor,
  mergeContributorMemories,
  type ContributorMoment,
  type MediaType,
} from './contributorMoments';
import { getPremiumThemeAudioPath } from '@/config/premiumTheme';

interface Memory {
  id: string;
  contributor_name: string;
  message: string;
  photo_url: string | null;
  video_url?: string | null;
}

export interface SceneConfig {
  type: 'cover' | 'montage' | 'contributor_moment' | 'closing';
  duration?: number;
  // For montage
  contributors?: Array<{
    name: string;
    photoUrl?: string | null;
    videoUrl?: string | null;
    mediaType: MediaType;
  }>;
  // For contributor moment
  moment?: ContributorMoment;
}

interface RevealConfig {
  music: {
    src: string;
    volume: number;
    duckedVolume: number;
  };
  scenes: SceneConfig[];
  contributorCount: number;
}

/**
 * Generate reveal configuration - contributor-driven, media-agnostic
 * Every valid contributor receives exactly one contributor moment
 */
export function getRevealConfig(
  memories: Memory[],
  recipientName: string,
  occasion: string,
  coverPhotoUrl?: string | null
): RevealConfig {
  // Group memories by contributor (handles duplicates)
  const contributorGroups = groupByContributor(memories);

  // Merge multiple memories from same contributor
  const consolidatedMemories: Memory[] = [];
  for (const [_name, group] of contributorGroups) {
    consolidatedMemories.push(mergeContributorMemories(group));
  }

  // Filter to valid contributors only
  const validMemories = consolidatedMemories.filter(m => {
    const hasMessage = !!m.message && m.message.trim().length > 0;
    const hasPhoto = !!m.photo_url;
    const hasVideo = !!m.video_url;
    return hasMessage || hasPhoto || hasVideo;
  });

  // Generate varied introductions for all contributors
  const introductionData = selectIntroductions(
    validMemories.map(m => {
      // Determine intro type based on media
      let type: 'photo' | 'message' | 'video' = 'message';
      if (m.video_url) type = 'video';
      else if (m.photo_url && !m.message) type = 'photo';

      return {
        name: m.contributor_name,
        type,
      };
    })
  );

  // Build normalized contributor moments
  const moments = buildContributorMoments(validMemories, introductionData);

  // Build scene sequence
  const scenes: SceneConfig[] = [
    // 1. Cover reveal
    {
      type: 'cover',
      duration: 8000,
    },
    // 2. Opening montage - all contributors
    {
      type: 'montage',
      contributors: moments.map(m => ({
        name: m.contributorName,
        photoUrl: m.photoUrl,
        videoUrl: m.videoUrl,
        mediaType: m.mediaType,
      })),
    },
  ];

  // 3. Add contributor moments - one per contributor
  moments.forEach(moment => {
    scenes.push({
      type: 'contributor_moment',
      moment,
    });
  });

  // 4. Closing
  scenes.push({
    type: 'closing',
  });

  return {
    music: {
      src: getPremiumThemeAudioPath(),
      volume: 0.4, // 40% - subtle background presence
      duckedVolume: 0.15,
    },
    scenes,
    contributorCount: moments.length,
  };
}
