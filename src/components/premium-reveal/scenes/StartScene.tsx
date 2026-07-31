"use client";

import { getCoverHeroStyle } from "@/lib/coverStyles";
import { getCoverTheme } from "@/lib/coverTheme";

interface StartSceneProps {
  recipientName: string;
  occasion: string;
  memoryCount: number;
  onStart: () => void;
  coverPhotoUrl?: string | null;
  coverStyle?: string | null;
}

export default function StartScene({
  recipientName,
  occasion,
  memoryCount,
  onStart,
  coverPhotoUrl,
  coverStyle,
}: StartSceneProps) {
  const theme = getCoverTheme(coverStyle);

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-6 text-center cursor-pointer"
      style={getCoverHeroStyle(coverStyle)}
      onClick={onStart}
    >
      {/* Recipient name */}
      <h1
        className="mb-8 text-5xl md:text-6xl font-bold max-w-3xl leading-tight"
        style={{ color: theme.primaryText }}
      >
        {recipientName}
      </h1>

      {/* Introduction - focus on people */}
      <p
        className="mb-6 text-xl md:text-2xl leading-relaxed max-w-2xl"
        style={{ color: theme.secondaryText }}
      >
        Some of the people who love you most
        <br />
        wanted to create something together
      </p>

      <p
        className="mb-16 text-lg md:text-xl leading-relaxed max-w-xl"
        style={{ color: theme.secondaryText, opacity: 0.9 }}
      >
        They each have something to tell you
      </p>

      {/* Gentle prompt - no button */}
      <p
        className="text-base"
        style={{ color: theme.secondaryText, opacity: 0.7 }}
      >
        Tap anywhere when you're ready
      </p>
    </div>
  );
}
