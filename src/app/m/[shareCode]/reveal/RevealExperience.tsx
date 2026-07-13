"use client";

import { useState, useEffect } from "react";
import { getOccasionCopy } from "@/lib/occasions";
import { supabase } from "@/lib/supabase";
import ReactionPrompt from "./ReactionPrompt";
import ReactionThankYou from "./ReactionThankYou";

interface Memory {
  id: string;
  contributor_name: string;
  memory: string;
  photo_url: string | null;
}

interface Props {
  recipientName: string;
  occasion: string;
  memories: Memory[];
  memorypopId: string;
}

export default function RevealExperience({
  recipientName,
  occasion,
  memories,
  memorypopId,
}: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [hasReacted, setHasReacted] = useState<boolean | null>(null); // null = loading, true/false = known
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);

  // Step 0: Welcome
  // Steps 1 to memories.length: Individual memories
  // Step memories.length + 1: Final celebration
  // Step memories.length + 2: ReactionPrompt (if not reacted)
  // Step memories.length + 3: ReactionThankYou (after reaction)

  const occasionCopy = getOccasionCopy(occasion, recipientName);

  // Calculate total steps based on whether user has reacted
  const totalSteps = hasReacted === null
    ? memories.length + 2 // loading state, default to no reactions
    : hasReacted
      ? memories.length + 2 // skip reaction steps if already reacted
      : memories.length + 4; // include reaction + thank you steps

  // Check if user already reacted (run on mount)
  useEffect(() => {
    async function checkReaction() {
      const { data, error } = await supabase
        .from('memorypop_reactions')
        .select('reaction_type')
        .eq('memorypop_id', memorypopId)
        .maybeSingle();

      if (data) {
        setHasReacted(true);
        // Don't show reaction steps if already reacted
      } else {
        setHasReacted(false);
      }
    }
    checkReaction();
  }, [memorypopId]);

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleReactionSelect = (reactionType: string) => {
    setSelectedReaction(reactionType);
    setHasReacted(true); // Update state to prevent re-prompting
    // Move to thank you screen
    handleNext();
  };

  // Conditional rendering based on currentStep
  if (currentStep === 0) {
    return (
      <WelcomeScreen
        recipientName={recipientName}
        memoryCount={memories.length}
        onBegin={handleNext}
        emoji={occasionCopy.emoji}
      />
    );
  } else if (currentStep <= memories.length) {
    const memoryIndex = currentStep - 1;
    return <MemoryScreen memory={memories[memoryIndex]} onNext={handleNext} />;
  } else if (currentStep === memories.length + 1) {
    return <FinalScreen occasionCopy={occasionCopy} onNext={handleNext} />;
  } else if (currentStep === memories.length + 2 && hasReacted === false) {
    // Show reaction prompt if user hasn't reacted
    return (
      <ReactionPrompt
        memorypopId={memorypopId}
        onReactionSelect={handleReactionSelect}
      />
    );
  } else if (currentStep === memories.length + 3 && selectedReaction) {
    // Show thank you screen after reaction
    return (
      <ReactionThankYou
        reactionType={selectedReaction}
      />
    );
  }

  // Fallback (should not reach here)
  return <FinalScreen occasionCopy={occasionCopy} onNext={handleNext} />;
}

// Welcome Screen (Step 0)
function WelcomeScreen({
  recipientName,
  memoryCount,
  onBegin,
  emoji,
}: {
  recipientName: string;
  memoryCount: number;
  onBegin: () => void;
  emoji: string;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#fff8ef] px-6">
      {/* Occasion emoji */}
      <div className="mb-8 text-7xl">{emoji}</div>

      {/* Welcome message */}
      <h1 className="mb-4 text-center text-4xl font-bold text-[#3a241e]">
        Welcome {recipientName}
      </h1>

      {/* Count message */}
      <p className="mb-12 text-center text-xl text-[#856b5f]">
        {memoryCount} {memoryCount === 1 ? "person" : "people"} came together to
        celebrate you.
      </p>

      {/* Begin button */}
      <button
        onClick={onBegin}
        className="rounded-full bg-[#ef6a57] px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-[#e05a47] active:ring-2 active:ring-white active:ring-offset-2 transition-all"
      >
        Begin
      </button>
    </div>
  );
}

// Memory Screen (Steps 1 to n)
function MemoryScreen({
  memory,
  onNext,
}: {
  memory: Memory;
  onNext: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#fff8ef] px-6">
      {/* Contributor photo - conditional */}
      {memory.photo_url && (
        <div className="mb-6 overflow-hidden rounded-lg">
          <img
            src={memory.photo_url}
            alt={`Photo from ${memory.contributor_name}`}
            className="max-h-64 w-auto object-contain"
          />
        </div>
      )}

      {/* Contributor name */}
      <h2 className="mb-4 text-center text-2xl font-semibold text-[#3a241e]">
        {memory.contributor_name}
      </h2>

      {/* Memory text */}
      <div className="mb-12 max-h-64 max-w-2xl overflow-y-auto rounded-lg bg-white p-6 text-center text-lg leading-relaxed text-[#3a241e]">
        {memory.memory}
      </div>

      {/* Next button */}
      <button
        onClick={onNext}
        className="rounded-full bg-[#ef6a57] px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-[#e05a47] active:ring-2 active:ring-white active:ring-offset-2 transition-all"
      >
        Next
      </button>
    </div>
  );
}

// Final Screen (Step n+1)
function FinalScreen({
  occasionCopy,
  onNext,
}: {
  occasionCopy: { celebrationMessage: string; subMessage?: string; emoji: string };
  onNext?: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#fff8ef] px-6">
      {/* Celebration emoji */}
      <div className="mb-8 text-7xl">{occasionCopy.emoji}</div>

      {/* Celebration message */}
      <h1 className="mb-4 text-center text-4xl font-bold text-[#3a241e]">
        {occasionCopy.celebrationMessage}
      </h1>

      {/* Optional sub-message (for Farewell, etc.) */}
      {occasionCopy.subMessage && (
        <p className="mb-4 text-center text-xl text-[#856b5f]">
          {occasionCopy.subMessage}
        </p>
      )}

      {/* Thank you message */}
      <p className="mb-12 text-center text-xl text-[#856b5f]">
        Thank you to everyone who made this celebration possible.
      </p>

      {/* Continue button (to progress to reaction step) */}
      {onNext && (
        <button
          onClick={onNext}
          className="rounded-full bg-[#ef6a57] px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-[#e05a47] active:ring-2 active:ring-white active:ring-offset-2 transition-all"
        >
          Continue
        </button>
      )}
    </div>
  );
}
