"use client";

import { useState } from "react";

interface Props {
  memorypopId: string;
  onReactionSelect: (reactionType: string) => void;
}

const REACTIONS = [
  { type: "loved_it", emoji: "❤️", label: "Loved it" },
  { type: "made_me_emotional", emoji: "🥹", label: "Made me emotional" },
  { type: "made_me_laugh", emoji: "😂", label: "Made me laugh" },
] as const;

export default function ReactionPrompt({ memorypopId, onReactionSelect }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  async function handleReactionClick(reactionType: string) {
    // Prevent double-tap
    if (isSubmitting || selectedType) return;

    setSelectedType(reactionType);
    setIsSubmitting(true);

    try {
      // Call API to insert reaction (server-side)
      const response = await fetch('/api/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memorypopId,
          reactionType,
        }),
      });

      if (!response.ok) {
        console.error("Failed to save reaction");
        alert("Failed to save your reaction. Please try again.");
        setIsSubmitting(false);
        setSelectedType(null);
        return;
      }

      const data = await response.json();

      // If duplicate (user already reacted), still show thank you screen
      if (data.duplicate) {
        console.log("Already reacted (duplicate)");
      }

      // Success - move to thank you screen
      onReactionSelect(reactionType);
    } catch (error) {
      console.error("Reaction submission error:", error);
      alert("Something went wrong. Please try again.");
      setIsSubmitting(false);
      setSelectedType(null);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#fff8ef] px-6">
      {/* Heading */}
      <h1 className="mb-4 text-center text-3xl font-bold text-[#3a241e]">
        How did this MemoryPop make you feel?
      </h1>

      {/* Subtext */}
      <p className="mb-12 text-center text-lg text-[#856b5f]">
        Your reaction will let the creators know you experienced it.
      </p>

      {/* Reaction Buttons */}
      <div className="flex flex-col gap-4 w-full max-w-md">
        {REACTIONS.map((reaction) => (
          <button
            key={reaction.type}
            onClick={() => handleReactionClick(reaction.type)}
            disabled={isSubmitting || selectedType !== null}
            className="rounded-full bg-white border-2 border-[#ead8c9] px-8 py-5 text-lg font-semibold text-[#3a241e] transition-all hover:bg-[#fff1e6] hover:border-[#ef6a57] hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3"
          >
            <span className="text-3xl">{reaction.emoji}</span>
            <span>{reaction.label}</span>
          </button>
        ))}
      </div>

      {/* Loading state */}
      {isSubmitting && (
        <p className="mt-6 text-sm text-[#856b5f]">
          Saving your reaction...
        </p>
      )}
    </div>
  );
}
