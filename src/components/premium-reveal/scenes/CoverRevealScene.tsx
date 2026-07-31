"use client";

import { useEffect, useState } from "react";
import { getCoverHeroStyle } from "@/lib/coverStyles";
import { getCoverTheme } from "@/lib/coverTheme";

interface CoverRevealSceneProps {
  recipientName: string;
  occasion: string;
  coverPhotoUrl?: string | null;
  coverStyle?: string | null;
  onComplete: () => void;
  isPaused: boolean;
  isMuted: boolean;
  isReducedMotion: boolean;
}

export default function CoverRevealScene({
  recipientName,
  occasion,
  coverPhotoUrl,
  coverStyle,
  onComplete,
  isPaused,
  isReducedMotion,
}: CoverRevealSceneProps) {
  const [isVisible, setIsVisible] = useState(false);
  const theme = getCoverTheme(coverStyle);

  useEffect(() => {
    // Trigger fade-in animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isPaused) return;

    // Auto-advance after 8 seconds (longer to let context land)
    const timer = setTimeout(() => {
      onComplete();
    }, 8000);

    return () => clearTimeout(timer);
  }, [isPaused, onComplete]);

  const transitionClass = isReducedMotion
    ? ''
    : 'transition-all duration-1000';

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-6"
      style={getCoverHeroStyle(coverStyle)}
    >
      <div
        className={`flex flex-col items-center text-center ${transitionClass} ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        {/* Recipient name */}
        <h1
          className="mb-8 text-5xl md:text-6xl font-bold max-w-4xl"
          style={{ color: theme.primaryText }}
        >
          {recipientName}
        </h1>

        {/* Context about the celebration */}
        <p
          className="mb-6 text-xl md:text-2xl max-w-2xl leading-relaxed"
          style={{ color: theme.secondaryText }}
        >
          The people in your life wanted to celebrate you
        </p>

        {/* Occasion */}
        <p
          className="text-lg md:text-xl"
          style={{ color: theme.accentText }}
        >
          This is for your {occasion}
        </p>
      </div>
    </div>
  );
}
