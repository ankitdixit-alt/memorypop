"use client";

import { useEffect } from "react";

interface Props {
  reactionType: string;
}

const REACTION_DISPLAY: Record<string, { emoji: string; label: string }> = {
  loved_it: { emoji: "❤️", label: "loved it" },
  made_me_emotional: { emoji: "🥹", label: "it was emotional" },
  made_me_laugh: { emoji: "😂", label: "it made you laugh" },
};

export default function ReactionThankYou({ reactionType }: Props) {
  const reaction = REACTION_DISPLAY[reactionType] || { emoji: "❤️", label: "loved it" };

  // Optional: Auto-fade or close after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      // Could add a callback here to return to MemoryPop main page
      // For MVP: screen stays visible, user can close tab/navigate away
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#fff8ef] px-6">
      {/* Emoji */}
      <div className="mb-8 text-7xl">{reaction.emoji}</div>

      {/* Thank you message */}
      <h1 className="mb-4 text-center text-4xl font-bold text-[#3a241e]">
        Thank you {reaction.emoji}
      </h1>

      {/* Personalized confirmation */}
      <p className="mb-8 text-center text-xl text-[#856b5f] max-w-md leading-relaxed">
        The people who created this MemoryPop will know you {reaction.label}.
      </p>

      {/* Optional: Show a subtle "Close" or "Back to MemoryPop" button */}
      {/* For MVP v1: Can be added in Phase 2 */}
    </div>
  );
}
