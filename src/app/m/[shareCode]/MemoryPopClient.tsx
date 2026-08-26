"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ShareButtons } from "@/components/ShareButtons";
import { getCelebrationExperience } from "@/lib/celebrationExperience";
import { getCoverHeroStyle } from "@/lib/coverStyles";
import { getCoverTheme } from "@/lib/coverTheme";
import PremiumChoiceModal from "@/components/PremiumChoiceModal";
import GalleryView from "@/components/memory-experience/GalleryView";
import type { MemoryPopMemory, MemoryPop } from "@/components/memory-experience/types";

interface MemoryPopClientProps {
  memoryPop: MemoryPop;
  memories: MemoryPopMemory[];
  shareLink: string;
  hasPremiumAccess: boolean;
}

type PresentationMode = 'choice' | 'browse';

export default function MemoryPopClient({
  memoryPop,
  memories,
  shareLink,
  hasPremiumAccess,
}: MemoryPopClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const viewParam = searchParams?.get('view');

  // Contributors bypass choice and go directly to browse mode
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

  // Choice handler - redirect to canonical RevealExperience
  const handleChooseExperience = () => {
    router.push(`/m/${memoryPop.share_code}/reveal`);
  };

  const handleChooseBrowse = () => {
    setMode('browse');
  };

  // Show choice modal
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

  // Show gallery-based browsing mode (Memory Wall)
  return (
    <GalleryView
      memoryPop={memoryPop}
      memories={memories}
      shareLink={shareLink}
    />
  );
}
