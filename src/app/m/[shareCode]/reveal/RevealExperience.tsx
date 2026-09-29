"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { getCelebrationExperience } from "@/lib/celebrationExperience";
import { getCoverHeroStyle } from "@/lib/coverStyles";
import { getCoverTheme } from "@/lib/coverTheme";
import { getSoundtrack } from "@/lib/occasionExperience";
import ReactionPrompt from "./ReactionPrompt";
import ReactionThankYou from "./ReactionThankYou";
import GlobalCinematicController from "./GlobalCinematicController";
import AIDirectorRevealController from "./AIDirectorRevealController";
import type { MediaItem, VideoMedia } from "@/components/memory-experience/types";
import type { RevealPlan } from "@/lib/ai/types";

interface Memory {
  id: string;
  contributor_name: string;
  message: string;
  // Legacy field (backwards compatibility)
  photo_url: string | null;
  // Standard multimedia (JSONB)
  photos?: MediaItem[];
  gifs?: MediaItem[];
  video?: VideoMedia | null;
}

type MediaType = 'photos' | 'gif' | 'video';

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
  isPlusGift: boolean;
  revealPlan: RevealPlan | null;
  customMusicUrl?: string | null;
}

export default function RevealExperience({
  recipientName,
  occasion,
  memories,
  memorypopId,
  celebrationDate,
  coverStyle,
  customMusicUrl,
  shareCode,
  mood,
  existingReaction,
  isPlusGift,
  revealPlan,
}: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [hasReacted, setHasReacted] = useState<boolean>(!!existingReaction); // Initialize from server prop
  const [selectedReaction, setSelectedReaction] = useState<string | null>(
    existingReaction?.reaction_type || null
  );

  // Music playback state (Increment 1)
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isAudioReady, setIsAudioReady] = useState(false);

  // FLAT ARCHITECTURE - Single global timeline
  // Step 0: Welcome
  // Step 1: Cinematic (ALL memories in one global timeline)
  // Step 2: Final celebration
  // Step 3: ReactionPrompt (if not reacted)
  // Step 4: ReactionThankYou (after reaction)

  const celebrationExperience = getCelebrationExperience({
    occasion,
    mood,
    recipientName
  });

  // Resolve soundtrack based on occasion + atmosphere, with Plus custom music override
  const soundtrack = getSoundtrack(occasion, mood || 'simple_classic');
  const [audioTrack, setAudioTrack] = useState<string>(customMusicUrl || soundtrack.track);
  const [hasCustomMusicError, setHasCustomMusicError] = useState(false);

  // Initialize and manage audio playback with error fallback
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Create audio element (use custom music if available, otherwise default soundtrack)
    const audio = new Audio(audioTrack);
    audio.loop = true;
    audio.volume = isMuted ? 0 : 0.5; // Start at 50% volume
    audio.preload = 'auto'; // Ensure audio starts loading immediately
    audioRef.current = audio;

    // Handle audio ready state
    const handleCanPlay = () => {
      setIsAudioReady(true);
      // If user already clicked "Begin", start playing immediately when audio is ready
      if (currentStep > 0) {
        audio.play().catch(err => {
          console.warn('Audio playback failed on load:', err.message);
        });
      }
    };

    // Handle audio load errors (custom music failed to load)
    const handleError = (e: ErrorEvent | Event) => {
      console.error('Audio load error:', e);
      // If custom music failed and we haven't already fallen back
      if (customMusicUrl && audioTrack === customMusicUrl && !hasCustomMusicError) {
        console.warn('Custom music failed to load, falling back to default soundtrack');
        setHasCustomMusicError(true);
        setAudioTrack(soundtrack.track);
      }
    };

    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);

    // Start loading immediately
    audio.load();

    // Cleanup
    return () => {
      audio.pause();
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
      audioRef.current = null;
    };
  }, [audioTrack, customMusicUrl, hasCustomMusicError, soundtrack.track]);

  // Control audio playback based on current step
  useEffect(() => {
    if (!audioRef.current || !isAudioReady) return;

    if (currentStep > 0) {
      // Experience started - play music
      audioRef.current.play().catch(err => {
        console.warn('Audio playback failed:', err.message);
      });
    } else {
      // On welcome screen - pause music
      audioRef.current.pause();
    }
  }, [currentStep, isAudioReady]);

  // Mute/unmute control
  useEffect(() => {
    if (!audioRef.current) return;

    audioRef.current.volume = isMuted ? 0 : 0.5;

    // If unmuting while in the experience and audio is paused, resume playback
    // (Audio might be paused due to video playback or other scene transitions)
    if (!isMuted && currentStep > 0 && audioRef.current.paused) {
      audioRef.current.play().catch(err => {
        console.warn('Failed to resume audio after unmute:', err.message);
      });
    }
  }, [isMuted, currentStep]);

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Video audio now handled by GlobalCinematicController (pauses entirely)

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

  // Calculate total steps - FLAT ARCHITECTURE
  // Step 0: Welcome
  // Step 1: Cinematic (all memories)
  // Step 2: Final
  // Step 3: Reaction (if not reacted) / Thank you (if reacted)
  // Step 4: Thank you (after new reaction)
  const totalSteps = hasReacted
    ? 4 // already reacted: welcome + cinematic + final + thank you
    : 5; // not reacted: welcome + cinematic + final + reaction + thank you

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleReactionSelect = (reactionType: string) => {
    setSelectedReaction(reactionType);
    setHasReacted(true); // Update state to prevent re-prompting
    // Move to thank you screen
    handleNext();
  };

  // Conditional rendering - FLAT ARCHITECTURE
  if (currentStep === 0) {
    // Step 0: Welcome
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
  } else if (currentStep === 1) {
    // Step 1: Cinematic - Plus or Standard
    if (isPlusGift && revealPlan) {
      // Plus Experience (AI-generated or deterministic)
      return (
        <AIDirectorRevealController
          recipientName={recipientName}
          occasion={occasion}
          memories={memories}
          plan={revealPlan}
          shareCode={shareCode}
          onComplete={handleNext}
          audioRef={audioRef}
          isMusicMuted={isMuted}
          onMuteToggle={handleToggleMute}
        />
      )
    } else {
      // Standard Experience
      return (
        <GlobalCinematicController
          memories={memories}
          shareCode={shareCode}
          onComplete={handleNext}
          audioRef={audioRef}
          isMusicMuted={isMuted}
          onMuteToggle={handleToggleMute}
        />
      )
    }
  } else if (currentStep === 2) {
    // Step 2: Final celebration
    return (
      <FinalScreen
        celebrationExperience={celebrationExperience}
        onNext={handleNext}
        celebrationDate={celebrationDate}
        getCelebrationMessage={getCelebrationMessage}
        coverStyle={coverStyle}
      />
    );
  } else if (currentStep === 3 && !hasReacted) {
    // Step 3: Reaction prompt (if not reacted)
    return (
      <ReactionPrompt
        memorypopId={memorypopId}
        onReactionSelect={handleReactionSelect}
      />
    );
  } else if (currentStep === 3 && hasReacted && selectedReaction) {
    // Step 3: Show existing reaction (returning user)
    return (
      <ReactionThankYou
        reactionType={selectedReaction}
        shareCode={shareCode}
        isReturningUser={true}
      />
    );
  } else if (currentStep === 4 && selectedReaction) {
    // Step 4: Thank you after new reaction
    return (
      <ReactionThankYou
        reactionType={selectedReaction}
        shareCode={shareCode}
      />
    );
  }

  // Fallback
  return (
    <FinalScreen
      celebrationExperience={celebrationExperience}
      onNext={handleNext}
      celebrationDate={celebrationDate}
      getCelebrationMessage={getCelebrationMessage}
      coverStyle={coverStyle}
    />
  );
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
          <p
            className="mb-4 text-sm"
            style={{ color: theme.secondaryText }}
          >
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
