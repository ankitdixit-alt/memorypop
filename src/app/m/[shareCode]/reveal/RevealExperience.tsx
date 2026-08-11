"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { getCelebrationExperience } from "@/lib/celebrationExperience";
import { getCoverHeroStyle } from "@/lib/coverStyles";
import { getCoverTheme } from "@/lib/coverTheme";
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
  mood?: string | null;
  existingReaction?: { reaction_type: string } | null;
}

export default function RevealExperience({
  recipientName,
  occasion,
  memories,
  memorypopId,
  celebrationDate,
  coverStyle,
  shareCode,
  mood,
  existingReaction,
}: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [hasReacted, setHasReacted] = useState<boolean>(!!existingReaction); // Initialize from server prop
  const [selectedReaction, setSelectedReaction] = useState<string | null>(
    existingReaction?.reaction_type || null
  );
  const [hasSwipedOnce, setHasSwipedOnce] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  // Step 0: Welcome
  // Step 0.5: Mood Introduction (NEW)
  // Steps 1 to memories.length: Individual memories
  // Step memories.length + 1: Final celebration
  // Step memories.length + 2: ReactionPrompt (if not reacted)
  // Step memories.length + 3: ReactionThankYou (after reaction)

  const celebrationExperience = getCelebrationExperience({
    occasion,
    mood,
    recipientName
  });

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
  // Phase 2: hasReacted is initialized from server prop, no loading state
  const totalSteps = hasReacted
    ? memories.length + 3 // already reacted: welcome + memories + final + thank you
    : memories.length + 4; // not reacted: welcome + memories + final + reaction + thank you

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      // Only animate during memory screens
      if (currentStep >= 1 && currentStep <= memories.length) {
        setSlideDirection('left');
        setTimeout(() => {
          setCurrentStep((prev) => prev + 1);
          setSlideDirection(null);
        }, 200);
      } else {
        setCurrentStep((prev) => prev + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      // Only animate during memory screens
      if (currentStep >= 1 && currentStep <= memories.length) {
        setSlideDirection('right');
        setTimeout(() => {
          setCurrentStep((prev) => prev - 1);
          setSlideDirection(null);
        }, 200);
      } else {
        setCurrentStep((prev) => prev - 1);
      }
    }
  };

  const handleReactionSelect = (reactionType: string) => {
    setSelectedReaction(reactionType);
    setHasReacted(true); // Update state to prevent re-prompting
    // Move to thank you screen
    handleNext();
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only enable during memory screens (steps 1 to memories.length)
      if (currentStep >= 1 && currentStep <= memories.length) {
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          handleNext();
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          handlePrevious();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, memories.length]);

  // Swipe gesture detection
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (touchStartX.current === null || touchStartY.current === null) return;

      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;

      const deltaX = touchEndX - touchStartX.current;
      const deltaY = touchEndY - touchStartY.current;

      // Only trigger if horizontal swipe is dominant (not vertical scroll)
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        // Only enable during memory screens
        if (currentStep >= 1 && currentStep <= memories.length) {
          if (deltaX < 0) {
            // Swipe left → next
            handleNext();
            setHasSwipedOnce(true);
          } else {
            // Swipe right → previous
            handlePrevious();
            setHasSwipedOnce(true);
          }
        }
      }

      touchStartX.current = null;
      touchStartY.current = null;
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [currentStep, memories.length]);

  // Conditional rendering based on currentStep
  if (currentStep === 0) {
    return (
      <WelcomeScreen
        recipientName={recipientName}
        memoryCount={memories.length}
        onBegin={handleNext}
        emoji={celebrationExperience.emoji}
        coverStyle={coverStyle}
        moodIntroduction={celebrationExperience.revealIntroduction}
      />
    );
  } else if (currentStep <= memories.length) {
    const memoryIndex = currentStep - 1;
    return (
      <MemoryScreen
        memory={memories[memoryIndex]}
        onNext={handleNext}
        onPrevious={handlePrevious}
        currentIndex={memoryIndex}
        totalMemories={memories.length}
        shareCode={shareCode}
        showOnboardingHint={memoryIndex === 0 && !hasSwipedOnce}
        slideDirection={slideDirection}
      />
    );
  } else if (currentStep === memories.length + 1) {
    return <FinalScreen celebrationExperience={celebrationExperience} onNext={handleNext} celebrationDate={celebrationDate} getCelebrationMessage={getCelebrationMessage} coverStyle={coverStyle} />;
  } else if (currentStep === memories.length + 2 && !hasReacted) {
    // Show reaction prompt if user hasn't reacted (or still loading)
    return (
      <ReactionPrompt
        memorypopId={memorypopId}
        onReactionSelect={handleReactionSelect}
      />
    );
  } else if (currentStep === memories.length + 2 && hasReacted && selectedReaction) {
    // User already reacted in previous session - show their actual reaction
    return (
      <ReactionThankYou
        reactionType={selectedReaction}
        shareCode={shareCode}
        isReturningUser={true}
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
  return <FinalScreen celebrationExperience={celebrationExperience} onNext={handleNext} celebrationDate={celebrationDate} getCelebrationMessage={getCelebrationMessage} coverStyle={coverStyle} />;
}

// Welcome Screen (Step 0)
function WelcomeScreen({
  recipientName,
  memoryCount,
  onBegin,
  emoji,
  coverStyle,
  moodIntroduction,
}: {
  recipientName: string;
  memoryCount: number;
  onBegin: () => void;
  emoji: string;
  coverStyle?: string | null;
  moodIntroduction: string;
}) {
  const theme = getCoverTheme(coverStyle);

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-6"
      style={getCoverHeroStyle(coverStyle)}
    >
      {/* Occasion emoji */}
      <div className="mb-8 text-7xl">{emoji}</div>

      {/* Gift message */}
      <h1
        className="mb-4 text-center text-4xl font-bold"
        style={{ color: theme.primaryText }}
      >
        {recipientName}, this MemoryPop was created especially for you
      </h1>

      {/* Mood Introduction */}
      <p
        className="mb-4 text-center text-xl font-semibold max-w-2xl"
        style={{ color: theme.accentText }}
      >
        {moodIntroduction}
      </p>

      {/* Subtitle */}
      <p
        className="mb-8 text-center text-lg max-w-2xl"
        style={{ color: theme.secondaryText }}
      >
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
        className="rounded-full px-10 py-5 text-xl font-semibold transition-colors hover:opacity-90 active:ring-2 active:ring-white active:ring-offset-2 transition-all shadow-lg"
        style={{
          backgroundColor: theme.buttonBg,
          color: theme.buttonText,
        }}
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
  onPrevious,
  currentIndex,
  totalMemories,
  shareCode,
  showOnboardingHint,
  slideDirection,
}: {
  memory: Memory;
  onNext: () => void;
  onPrevious: () => void;
  currentIndex: number;
  totalMemories: number;
  shareCode: string;
  showOnboardingHint: boolean;
  slideDirection: 'left' | 'right' | null;
}) {
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalMemories - 1;

  // Animation class based on slide direction
  const getAnimationClass = () => {
    if (slideDirection === 'left') {
      return 'animate-slide-out-left';
    } else if (slideDirection === 'right') {
      return 'animate-slide-out-right';
    }
    return 'animate-slide-in';
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#fff8ef] px-6">
      {/* Browse all memories - top right corner */}
      <div className="absolute top-6 right-6 z-10">
        <Link
          href={`/m/${shareCode}`}
          className="text-sm text-[#856b5f] hover:text-[#3a241e] transition-colors"
        >
          Browse all memories
        </Link>
      </div>

      {/* Memory content with animation */}
      <div className={`w-full flex flex-col items-center ${getAnimationClass()}`}>
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

        {/* Desktop navigation controls */}
        <div className="hidden md:flex items-center gap-4 mb-8">
          <button
            onClick={onPrevious}
            disabled={isFirst}
            className={`rounded-full px-6 py-3 text-sm font-semibold transition-all ${
              isFirst
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-[#ef6a57] text-white hover:bg-[#e05a47] active:ring-2 active:ring-white active:ring-offset-2'
            }`}
          >
            ← Previous
          </button>
          <span className="text-sm text-[#856b5f]">
            {currentIndex + 1} of {totalMemories}
          </span>
          <button
            onClick={onNext}
            disabled={isLast}
            className={`rounded-full px-6 py-3 text-sm font-semibold transition-all ${
              isLast
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-[#ef6a57] text-white hover:bg-[#e05a47] active:ring-2 active:ring-white active:ring-offset-2'
            }`}
          >
            Next →
          </button>
        </div>

        {/* Mobile Next button */}
        <button
          onClick={onNext}
          className="md:hidden rounded-full bg-[#ef6a57] px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-[#e05a47] active:ring-2 active:ring-white active:ring-offset-2 transition-all"
        >
          Next
        </button>

        {/* Mobile onboarding hint */}
        {showOnboardingHint && (
          <div className="md:hidden mt-4 text-center">
            <p className="text-sm text-[#856b5f] animate-pulse">
              ← Swipe to continue →
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(0);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slide-out-left {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(-30px);
          }
        }

        @keyframes slide-out-right {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(30px);
          }
        }

        .animate-slide-in {
          animation: slide-in 150ms ease-out;
        }

        .animate-slide-out-left {
          animation: slide-out-left 200ms ease-in;
        }

        .animate-slide-out-right {
          animation: slide-out-right 200ms ease-in;
        }
      `}</style>
    </div>
  );
}

// Final Screen (Step n+1)
function FinalScreen({
  celebrationExperience,
  onNext,
  celebrationDate,
  getCelebrationMessage,
  coverStyle,
}: {
  celebrationExperience: { celebrationMessage: string; subMessage?: string; emoji: string };
  onNext?: () => void;
  celebrationDate?: string | null;
  getCelebrationMessage?: (dateString?: string | null) => string | null;
  coverStyle?: string | null;
}) {
  const specialMessage = getCelebrationMessage ? getCelebrationMessage(celebrationDate) : null;
  const theme = getCoverTheme(coverStyle);

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-6"
      style={getCoverHeroStyle(coverStyle)}
    >
      {/* Celebration emoji */}
      <div className="mb-8 text-7xl">{celebrationExperience.emoji}</div>

      {/* Celebration message */}
      <h1
        className="mb-4 text-center text-4xl font-bold"
        style={{ color: theme.primaryText }}
      >
        {celebrationExperience.celebrationMessage}
      </h1>

      {/* Optional sub-message (for Farewell, etc.) */}
      {celebrationExperience.subMessage && (
        <p
          className="mb-4 text-center text-xl"
          style={{ color: theme.secondaryText }}
        >
          {celebrationExperience.subMessage}
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
      <p
        className="mb-12 text-center text-xl"
        style={{ color: theme.secondaryText }}
      >
        Thank you to everyone who made this celebration possible.
      </p>

      {/* Continue button (to progress to reaction step) */}
      {onNext && (
        <div className="flex flex-col items-center">
          <p className="mb-4 text-sm text-[#856b5f]">
            One more thing…
          </p>
          <button
            onClick={onNext}
            className="rounded-full px-8 py-4 text-lg font-semibold bg-[#ef6a57] text-white hover:bg-[#e05a47] shadow-lg active:ring-2 active:ring-white active:ring-offset-2 transition-all"
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
}
