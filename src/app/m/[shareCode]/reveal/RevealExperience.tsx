"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getOccasionCopy } from "@/lib/occasions";
import { getCoverHeroStyle } from "@/lib/coverStyles";
import { supabase } from "@/lib/supabase";
import ReactionPrompt from "./ReactionPrompt";
import ReactionThankYou from "./ReactionThankYou";

interface Memory {
  id: string;
  contributor_name: string;
  message: string;  // Fixed: Database column is 'message', not 'memory'
  photo_url: string | null;
}

interface Props {
  recipientName: string;
  occasion: string;
  memories: Memory[];
  memorypopId: string;
  celebrationDate?: string | null;
  coverStyle?: string | null;
  shareCode: string;
}

export default function RevealExperience({
  recipientName,
  occasion,
  memories,
  memorypopId,
  celebrationDate,
  coverStyle,
  shareCode,
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

  // Special messaging for celebration date
  function getCelebrationMessage(dateString?: string | null): string | null {
    if (!dateString) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const celebration = new Date(dateString);
    celebration.setHours(0, 0, 0, 0);

    const diffTime = celebration.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "🎉 Today is the celebration!";
    } else if (diffDays < 0) {
      return "❤️ This celebration has been preserved forever.";
    }
    return null; // No special message for future dates
  }

  // Calculate total steps based on whether user has reacted
  const totalSteps = hasReacted === null
    ? memories.length + 4 // loading state, assume reaction screens needed
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
        coverStyle={coverStyle}
      />
    );
  } else if (currentStep <= memories.length) {
    const memoryIndex = currentStep - 1;
    return <MemoryScreen memory={memories[memoryIndex]} onNext={handleNext} />;
  } else if (currentStep === memories.length + 1) {
    return <FinalScreen occasionCopy={occasionCopy} onNext={handleNext} celebrationDate={celebrationDate} getCelebrationMessage={getCelebrationMessage} coverStyle={coverStyle} />;
  } else if (currentStep === memories.length + 2 && !hasReacted) {
    // Show reaction prompt if user hasn't reacted (or still loading)
    return (
      <ReactionPrompt
        memorypopId={memorypopId}
        onReactionSelect={handleReactionSelect}
      />
    );
  } else if (currentStep === memories.length + 3 && selectedReaction) {
    // Show thank you screen after reaction with ending options
    return (
      <ReactionThankYou
        reactionType={selectedReaction}
        shareCode={shareCode}
      />
    );
  }

  // Fallback (should not reach here)
  return <FinalScreen occasionCopy={occasionCopy} onNext={handleNext} celebrationDate={celebrationDate} getCelebrationMessage={getCelebrationMessage} coverStyle={coverStyle} />;
}

// Welcome Screen (Step 0)
function WelcomeScreen({
  recipientName,
  memoryCount,
  onBegin,
  emoji,
  coverStyle,
}: {
  recipientName: string;
  memoryCount: number;
  onBegin: () => void;
  emoji: string;
  coverStyle?: string | null;
}) {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-6"
      style={getCoverHeroStyle(coverStyle)}
    >
      {/* Occasion emoji */}
      <div className="mb-8 text-7xl">{emoji}</div>

      {/* Gift message */}
      <h1 className="mb-4 text-center text-4xl font-bold text-[#3a241e]">
        {recipientName}, this MemoryPop was created especially for you
      </h1>

      {/* Subtitle */}
      <p className="mb-8 text-center text-xl text-[#856b5f] max-w-2xl">
        Friends and family came together to share memories, photos, and wishes for your celebration.
      </p>

      {/* Summary */}
      <div className="mb-12 rounded-2xl bg-white/90 border border-[#F0DED2] p-6 shadow-sm max-w-md">
        <ul className="space-y-2 text-center">
          <li className="text-[#3a241e]">
            <span className="font-semibold">{memoryCount}</span> {memoryCount === 1 ? 'person' : 'people'} contributed
          </li>
          <li className="text-[#3a241e]">
            <span className="font-semibold">{memoryCount}</span> {memoryCount === 1 ? 'memory' : 'memories'} collected
          </li>
          <li className="text-[#856b5f] text-sm italic">
            Created with love for your celebration
          </li>
        </ul>
      </div>

      {/* CTA */}
      <button
        onClick={onBegin}
        className="rounded-full bg-[#ef6a57] px-10 py-5 text-xl font-semibold text-white transition-colors hover:bg-[#e05a47] active:ring-2 active:ring-white active:ring-offset-2 transition-all shadow-lg"
      >
        Open My MemoryPop
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
        {memory.message || (
          <span className="text-[#856b5f] italic">
            {memory.photo_url
              ? `${memory.contributor_name} shared a photo for you.`
              : `${memory.contributor_name} left a memory.`
            }
          </span>
        )}
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
  celebrationDate,
  getCelebrationMessage,
  coverStyle,
}: {
  occasionCopy: { celebrationMessage: string; subMessage?: string; emoji: string };
  onNext?: () => void;
  celebrationDate?: string | null;
  getCelebrationMessage?: (dateString?: string | null) => string | null;
  coverStyle?: string | null;
}) {
  const specialMessage = getCelebrationMessage ? getCelebrationMessage(celebrationDate) : null;

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-6"
      style={getCoverHeroStyle(coverStyle)}
    >
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

      {/* Special Celebration Message */}
      {specialMessage && (
        <div className="mb-6 rounded-2xl bg-[#FFF1EC] border-2 border-[#FFD4CC] p-6 text-center max-w-md">
          <p className="text-2xl font-bold text-[#FF6B57]">
            {specialMessage}
          </p>
        </div>
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
