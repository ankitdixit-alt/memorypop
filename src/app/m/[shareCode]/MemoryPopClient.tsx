"use client";

import { useState } from "react";
import { ShareButtons } from "@/components/ShareButtons";
import { getCelebrationExperience } from "@/lib/celebrationExperience";
import { getCoverHeroStyle } from "@/lib/coverStyles";
import { getCoverTheme } from "@/lib/coverTheme";
import PremiumChoiceModal from "@/components/PremiumChoiceModal";
import PremiumRevealExperience from "@/components/premium-reveal/PremiumRevealExperience";

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
  const [mode, setMode] = useState<PresentationMode>(
    hasPremiumAccess ? 'choice' : 'browse'
  );

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

  // Show standard browsing mode
  return (
    <main className="min-h-screen bg-[#FFF8F2] px-6 py-12 text-[#2B1E18]">
      <div className="mx-auto max-w-2xl">

        {/* Celebration Narrative Block - P0: Landing Page Context */}
        <div
          className="mb-8 rounded-[2rem] p-8 shadow-xl text-center"
          style={getCoverHeroStyle(memoryPop.cover_style)}
        >
          <p className="text-5xl">{celebrationExperience.emoji}</p>
          <div className="mt-6 space-y-4">
            <p
              className="text-lg leading-relaxed"
              style={{ color: previewTheme.primaryText }}
            >
              {celebrationExperience.landingNarrative?.line1}
            </p>
            <p
              className="text-lg leading-relaxed"
              style={{ color: previewTheme.secondaryText }}
            >
              {celebrationExperience.landingNarrative?.line2}
            </p>
            <p
              className="text-lg leading-relaxed font-semibold"
              style={{ color: previewTheme.primaryText }}
            >
              {celebrationExperience.landingNarrative?.line3}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center text-center">
          <p className="text-5xl">{celebrationExperience.emoji}</p>

          <h1 className="mt-6 text-4xl font-bold">
            {celebrationExperience.celebrationMessage}
          </h1>

          {celebrationExperience.subMessage && (
            <p className="mt-2 text-lg text-[#6B5B52]">
              {celebrationExperience.subMessage}
            </p>
          )}

          <p className="mt-4 text-lg leading-8 text-[#6B5B52]">
            &ldquo;{memoryPop.story}&rdquo;
          </p>

          <a
            href={`/m/${memoryPop.share_code}/contribute`}
            className="mt-10 inline-block rounded-full bg-[#FF6B57] px-8 py-4 font-semibold text-white active:ring-2 active:ring-white active:ring-offset-2 transition-all"
          >
            {celebrationExperience.emoji} {celebrationExperience.contributeCTA}
          </a>
        </div>

        {/* Share Section */}
        <div className="mt-8 rounded-2xl border border-[#F0DED2] bg-white p-6 shadow-sm">
          <p className="mb-4 text-center text-sm font-semibold uppercase tracking-wide text-[#6B5B52]">
            {celebrationExperience.sharePrompt}
          </p>

          <div className="flex justify-center">
            <ShareButtons
              shareLink={shareLink}
              recipient={memoryPop.recipient_name}
              whatsappMessage={celebrationExperience.whatsappMessage}
              shareCode={memoryPop.share_code}
            />
          </div>
        </div>

        {/* Memories Section */}
        <div className="mt-16">
          <h2 className="text-center text-2xl font-bold">Shared Memories</h2>

          {!memories || memories.length === 0 ? (
            <div className="mt-8 rounded-2xl bg-white p-8 text-center shadow-sm">
              <p className="text-[#6B5B52]">
                {celebrationExperience.emptyStateMessage}
              </p>
            </div>
          ) : (
            <div className="mt-8 space-y-4">
              {memories.map((memory) => (
                <div
                  key={memory.id}
                  className="rounded-2xl bg-white p-6 shadow-sm"
                >
                  {memory.photo_url && (
                    <img
                      src={memory.photo_url}
                      alt="Memory photo"
                      className="mb-4 h-48 w-full rounded-xl object-cover"
                    />
                  )}
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-[#2B1E18]">
                      {memory.contributor_name}
                    </p>
                    <p className="text-sm text-[#6B5B52]">
                      {new Date(memory.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <p className="mt-3 leading-relaxed text-[#4A372F]">
                    {memory.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
