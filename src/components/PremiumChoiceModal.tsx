"use client";

import { useState, useEffect } from "react";
import { getCoverHeroStyle } from "@/lib/coverStyles";
import { getCoverTheme } from "@/lib/coverTheme";

interface PremiumChoiceModalProps {
  recipientName: string;
  occasion: string;
  memoryCount: number;
  coverStyle?: string | null;
  onChooseExperience: () => void;
  onChooseBrowse: () => void;
  memorypopId?: string;
  shareCode?: string;
}

export default function PremiumChoiceModal({
  recipientName,
  occasion,
  memoryCount,
  coverStyle,
  onChooseExperience,
  onChooseBrowse,
  memorypopId,
  shareCode,
}: PremiumChoiceModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const theme = getCoverTheme(coverStyle);

  useEffect(() => {
    // Fade in after mount
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleExperienceClick = () => {
    // Track analytics
    if (typeof window !== 'undefined' && window.plausible) {
      window.plausible('premium_choice_selected', {
        props: {
          memorypop_id: memorypopId || '',
          share_code: shareCode || '',
          choice: 'experience',
        },
      });
    }
    onChooseExperience();
  };

  const handleBrowseClick = () => {
    // Track analytics
    if (typeof window !== 'undefined' && window.plausible) {
      window.plausible('premium_choice_selected', {
        props: {
          memorypop_id: memorypopId || '',
          share_code: shareCode || '',
          choice: 'browse',
        },
      });
    }
    onChooseBrowse();
  };

  return (
    <div
      className={`flex min-h-screen flex-col items-center justify-center px-6 transition-opacity duration-700 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={getCoverHeroStyle(coverStyle)}
    >
      {/* Premium Badge */}
      <div className="mb-6 rounded-full bg-white/90 px-6 py-2 shadow-sm border border-[#F0DED2]">
        <span className="text-sm font-semibold text-[#ef6a57]">✨ Premium Experience</span>
      </div>

      {/* Recipient name */}
      <h1
        className="mb-4 text-center text-5xl md:text-6xl font-bold max-w-3xl"
        style={{ color: theme.primaryText }}
      >
        {recipientName}
      </h1>

      {/* Occasion */}
      <p
        className="mb-8 text-center text-2xl font-medium"
        style={{ color: theme.accentText }}
      >
        {occasion}
      </p>

      {/* Introduction */}
      <p
        className="mb-12 text-center text-xl max-w-2xl leading-relaxed"
        style={{ color: theme.secondaryText }}
      >
        Your friends and family created something special for you.
        <br />
        Choose how you'd like to experience this celebration.
      </p>

      {/* Choice Cards */}
      <div className="flex flex-col md:flex-row gap-6 w-full max-w-4xl mb-8">
        {/* Experience Option (Premium) */}
        <button
          onClick={handleExperienceClick}
          className="group flex-1 bg-white/95 border-2 border-[#ef6a57] rounded-2xl p-8 hover:bg-[#ef6a57] hover:scale-105 transition-all duration-300 shadow-xl"
        >
          <div className="flex flex-col items-center text-center">
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">▶</div>
            <h3 className="text-2xl font-bold mb-3 text-[#ef6a57] group-hover:text-white transition-colors">
              Experience the Celebration
            </h3>
            <p className="text-[#856b5f] group-hover:text-white/90 transition-colors leading-relaxed">
              Watch a beautifully directed reveal with music, cinematic pacing, and emotional storytelling
            </p>
            <div className="mt-4 text-sm text-[#856b5f] group-hover:text-white/80 transition-colors">
              {memoryCount} {memoryCount === 1 ? 'memory' : 'memories'} · ~2-3 minutes
            </div>
          </div>
        </button>

        {/* Browse Option (Standard) */}
        <button
          onClick={handleBrowseClick}
          className="group flex-1 bg-white/90 border-2 border-[#F0DED2] rounded-2xl p-8 hover:bg-white hover:border-[#856b5f] hover:scale-105 transition-all duration-300 shadow-lg"
        >
          <div className="flex flex-col items-center text-center">
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">📖</div>
            <h3 className="text-2xl font-bold mb-3 text-[#3a241e] transition-colors">
              Browse Memories
            </h3>
            <p className="text-[#856b5f] leading-relaxed">
              Explore all photos, videos, and messages at your own pace
            </p>
            <div className="mt-4 text-sm text-[#856b5f]">
              {memoryCount} {memoryCount === 1 ? 'memory' : 'memories'} to explore
            </div>
          </div>
        </button>
      </div>

      {/* Helpful hint */}
      <p className="text-sm text-[#856b5f] text-center max-w-md">
        💡 You can always browse all memories after the experience
      </p>
    </div>
  );
}
