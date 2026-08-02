"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ShareButtons } from "@/components/ShareButtons";
import { getCelebrationExperience } from "@/lib/celebrationExperience";
import { getCoverHeroStyle } from "@/lib/coverStyles";
import { getCoverTheme } from "@/lib/coverTheme";
import PremiumChoiceModal from "@/components/PremiumChoiceModal";
import PremiumRevealExperience from "@/components/premium-reveal/PremiumRevealExperience";
import GalleryView from "@/components/memory-experience/GalleryView";

interface Memory {
  id: string;
  contributor_name: string;
  message: string;
  photo_url: string | null;
  video_url?: string | null;
  created_at: string;
}

interface MemoryPop {
  id: string;
  recipient_name: string;
  occasion: string;
  story: string;
  share_code: string;
  cover_style: string | null;
  tone: string | null;
  is_premium: boolean;
  celebration_date: string | null;
  cover_photo_url: string | null;
}

interface MemoryPopClientProps {
  memoryPop: MemoryPop;
  memories: Memory[];
  shareLink: string;
  hasPremiumAccess: boolean;
}

type PresentationMode = 'choice' | 'reveal' | 'browse';

export default function MemoryPopClient({
  memoryPop,
  memories,
  shareLink,
  hasPremiumAccess,
}: MemoryPopClientProps) {
  const searchParams = useSearchParams();
  const viewParam = searchParams?.get('view');

  // Contributors bypass Premium choice and go directly to browse mode
  const initialMode: PresentationMode =
    viewParam === 'browse' ? 'browse' :
    hasPremiumAccess ? 'choice' :
    'browse';

  const [mode, setMode] = useState<PresentationMode>(initialMode);

  const celebrationExperience = getCelebrationExperience({
    occasion: memoryPop.occasion,
    mood: memoryPop.tone,
    recipientName: memoryPop.recipient_name
  });

  const previewTheme = getCoverTheme(memoryPop.cover_style);

  // Premium choice handler
  const handleChooseExperience = () => {
    setMode('reveal');
  };

  const handleChooseBrowse = () => {
    setMode('browse');
  };

  // Premium reveal completion handler
  const handleRevealComplete = () => {
    setMode('browse');
  };

  // Show premium choice modal
  if (mode === 'choice') {
    return (
      <PremiumChoiceModal
        recipientName={memoryPop.recipient_name}
        occasion={memoryPop.occasion}
        memoryCount={memories.length}
        coverStyle={memoryPop.cover_style}
        onChooseExperience={handleChooseExperience}
        onChooseBrowse={handleChooseBrowse}
        memorypopId={memoryPop.id}
        shareCode={memoryPop.share_code}
      />
    );
  }

  // Show premium reveal
  if (mode === 'reveal') {
    return (
      <PremiumRevealExperience
        recipientName={memoryPop.recipient_name}
        occasion={memoryPop.occasion}
        memories={memories}
        memorypopId={memoryPop.id}
        celebrationDate={memoryPop.celebration_date}
        coverStyle={memoryPop.cover_style}
        shareCode={memoryPop.share_code}
        mood={memoryPop.tone}
        coverPhotoUrl={memoryPop.cover_photo_url}
        onComplete={handleRevealComplete}
      />
    );
  }

  // Show gallery-based browsing mode (Memory Experience V1)
  return (
    <GalleryView
      memoryPop={memoryPop}
      memories={memories}
      shareLink={shareLink}
    />
  );
}
