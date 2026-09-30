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
    // For Plus gifts, skip FinalScreen (step 2) and go directly to ReactionPrompt (step 3)
    if (currentStep === 1 && isPlusGift) {
      setCurrentStep(3);
    } else if (currentStep < totalSteps - 1) {
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
        shareCode={shareCode}
      />
    );
  } else if (currentStep === 3 && !hasReacted) {
    // Step 3: Reaction prompt (if not reacted)
    return (
      <ReactionPrompt
        memorypopId={memorypopId}
        onReactionSelect={handleReactionSelect}
        onSkip={isPlusGift ? () => setCurrentStep(1) : undefined}
      />
    );
  } else if (currentStep === 3 && hasReacted && selectedReaction) {
    // Step 3: Show existing reaction (returning user)
    return (
      <ReactionThankYou
        reactionType={selectedReaction}
        shareCode={shareCode}
        isReturningUser={true}
        onBack={isPlusGift ? () => setCurrentStep(1) : undefined}
      />
    );
  } else if (currentStep === 4 && selectedReaction) {
    // Step 4: Thank you after new reaction
    return (
      <ReactionThankYou
        reactionType={selectedReaction}
        shareCode={shareCode}
        onBack={isPlusGift ? () => setCurrentStep(1) : undefined}
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
      shareCode={shareCode}
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
  shareCode,
}: {
  celebrationExperience: { celebrationMessage: string; subMessage?: string; emoji: string };
  onNext?: () => void;
  celebrationDate?: string | null;
  getCelebrationMessage?: (dateString?: string | null) => string | null;
  coverStyle?: string | null;
  shareCode?: string;
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

      {/* Product Discovery - Organic Growth Opportunity (collapsed initially) */}
      {shareCode && <ProductSharingPanel theme={theme} />}
    </div>
  );
}

// Collapsed product sharing panel
function ProductSharingPanel({ theme }: { theme: any }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMoreChannels, setShowMoreChannels] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  const shareLink = typeof window !== 'undefined' ? window.location.origin : 'https://memorypop.app';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setShowFallback(false);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      setShowFallback(true);
      setCopied(false);
    }
  };

  const handleWhatsApp = () => {
    const message = `Create beautiful collaborative gifts with MemoryPop - the perfect way to celebrate someone special. ${shareLink}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.location.href = whatsappUrl;
  };

  const handleTelegram = () => {
    const text = 'Create beautiful collaborative gifts with MemoryPop';
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareLink)}&text=${encodeURIComponent(text)}`;
    window.open(telegramUrl, '_blank', 'noopener,noreferrer');
  };

  const handleEmail = () => {
    const subject = 'Create beautiful gift memories with MemoryPop';
    const body = `I wanted to share MemoryPop with you - it's a beautiful way to create collaborative gifts for someone special.\n\nYou can collect memories, photos, and messages from friends and family, then reveal them as a surprise gift.\n\n${shareLink}`;
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  const handleFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`;
    window.open(facebookUrl, '_blank', 'noopener,noreferrer,width=600,height=400');
  };

  const handleX = () => {
    const text = 'Create beautiful collaborative gifts with MemoryPop';
    const xUrl = `https://x.com/intent/tweet?url=${encodeURIComponent(shareLink)}&text=${encodeURIComponent(text)}`;
    window.open(xUrl, '_blank', 'noopener,noreferrer,width=600,height=400');
  };

  const handleLinkedIn = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareLink)}`;
    window.open(linkedInUrl, '_blank', 'noopener,noreferrer,width=600,height=400');
  };

  const handleReddit = () => {
    const title = 'MemoryPop - Create beautiful collaborative gifts';
    const redditUrl = `https://reddit.com/submit?url=${encodeURIComponent(shareLink)}&title=${encodeURIComponent(title)}`;
    window.open(redditUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCopyMessage = async () => {
    const fullMessage = `Create beautiful collaborative gifts with MemoryPop - the perfect way to celebrate someone special. ${shareLink}`;
    try {
      await navigator.clipboard.writeText(fullMessage);
    } catch (error) {
      console.error("Failed to copy message:", error);
    }
  };

  const handleNativeShare = async () => {
    if (!navigator.share) return;
    try {
      await navigator.share({
        title: 'MemoryPop',
        text: 'Create beautiful collaborative gifts with MemoryPop',
        url: shareLink,
      });
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Native share failed:', error);
      }
    }
  };

  return (
    <div className="mt-12 pt-8 border-t border-white/20 w-full max-w-md">
      <div className="text-center">
        <p className="text-sm mb-3" style={{ color: theme.secondaryText }}>
          Loved your MemoryPop?
        </p>

        {!isExpanded ? (
          <button
            onClick={() => setIsExpanded(true)}
            className="text-sm underline transition-colors"
            style={{ color: theme.secondaryText }}
            onMouseEnter={(e) => e.currentTarget.style.color = theme.primaryText}
            onMouseLeave={(e) => e.currentTarget.style.color = theme.secondaryText}
          >
            Share MemoryPop
          </button>
        ) : (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm font-semibold text-[#3a241e]">Share MemoryPop</p>
              <button
                onClick={() => { setIsExpanded(false); setShowMoreChannels(false); }}
                className="text-[#856b5f] hover:text-[#3a241e] text-xl leading-none"
                aria-label="Close sharing panel"
              >
                ×
              </button>
            </div>

            {/* Main Actions */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <button
                onClick={handleWhatsApp}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 font-semibold text-white text-sm transition-all hover:bg-[#22c55e] active:scale-95"
              >
                💬 WhatsApp
              </button>
              <button
                onClick={handleCopy}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#ef6a57] px-4 py-3 font-semibold text-white text-sm transition-all hover:bg-[#e05a47] active:scale-95"
              >
                {copied ? '✓ Copied!' : '🔗 Copy Link'}
              </button>
            </div>

            {/* Clipboard Fallback */}
            {showFallback && (
              <div className="mb-3 rounded-lg border border-[#FFD4CC] bg-[#FFF8F5] p-3">
                <p className="mb-2 text-xs text-[#6B5B52]">
                  Unable to copy automatically. Select and copy the link below:
                </p>
                <input
                  type="text"
                  readOnly
                  value={shareLink}
                  onClick={(e) => e.currentTarget.select()}
                  className="w-full rounded-md border border-[#ead8c9] bg-white px-3 py-2 text-xs font-mono text-[#3a241e]"
                />
              </div>
            )}

            {/* Secondary Actions */}
            <div className="mb-3 flex gap-2 justify-center text-sm">
              <button
                onClick={handleTelegram}
                className="text-[#856b5f] underline hover:text-[#3a241e] transition-colors"
              >
                📱 Telegram
              </button>
              <span className="text-[#ead8c9]">•</span>
              <div className="relative">
                <button
                  onClick={() => setShowMoreChannels(!showMoreChannels)}
                  className="text-[#856b5f] underline hover:text-[#3a241e] transition-colors"
                >
                  {showMoreChannels ? 'Hide channels' : 'More channels'}
                </button>

                {showMoreChannels && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 min-w-[200px] rounded-xl border border-[#FFD4CC] bg-white shadow-lg z-10">
                    <div className="p-2">
                      <button
                        onClick={() => { handleEmail(); setShowMoreChannels(false); }}
                        className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-sm font-medium text-[#3a241e] transition-colors hover:bg-[#FFF8F2]"
                      >
                        <span>📧</span>
                        <span>Email</span>
                      </button>
                      <button
                        onClick={() => { handleFacebook(); setShowMoreChannels(false); }}
                        className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-sm font-medium text-[#3a241e] transition-colors hover:bg-[#FFF8F2]"
                      >
                        <span>📘</span>
                        <span>Facebook</span>
                      </button>
                      <button
                        onClick={() => { handleX(); setShowMoreChannels(false); }}
                        className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-sm font-medium text-[#3a241e] transition-colors hover:bg-[#FFF8F2]"
                      >
                        <span>𝕏</span>
                        <span>X (Twitter)</span>
                      </button>
                      <button
                        onClick={() => { handleLinkedIn(); setShowMoreChannels(false); }}
                        className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-sm font-medium text-[#3a241e] transition-colors hover:bg-[#FFF8F2]"
                      >
                        <span>💼</span>
                        <span>LinkedIn</span>
                      </button>
                      <button
                        onClick={() => { handleReddit(); setShowMoreChannels(false); }}
                        className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-sm font-medium text-[#3a241e] transition-colors hover:bg-[#FFF8F2]"
                      >
                        <span>🔴</span>
                        <span>Reddit</span>
                      </button>
                      <div className="my-1 border-t border-[#FFD4CC]" />
                      <button
                        onClick={() => { handleCopyMessage(); setShowMoreChannels(false); }}
                        className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-sm font-medium text-[#3a241e] transition-colors hover:bg-[#FFF8F2]"
                      >
                        <span>📋</span>
                        <span>Copy message</span>
                      </button>
                      {typeof navigator !== 'undefined' && 'share' in navigator && (
                        <button
                          onClick={() => { handleNativeShare(); setShowMoreChannels(false); }}
                          className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-sm font-medium text-[#3a241e] transition-colors hover:bg-[#FFF8F2]"
                        >
                          <span>↗️</span>
                          <span>Share via device</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
