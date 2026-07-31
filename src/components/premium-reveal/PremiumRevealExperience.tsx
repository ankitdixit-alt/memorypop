"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import StartScene from "./scenes/StartScene";
import CoverRevealScene from "./scenes/CoverRevealScene";
import OpeningMontageScene from "./scenes/OpeningMontageScene";
import ContributorMomentScene from "./scenes/ContributorMomentScene";
import ClosingScene from "./scenes/ClosingScene";
import RevealControls from "./RevealControls";
import { useAudioDucking } from "./useAudioDucking";
import { getRevealConfig } from "./revealConfig";

interface Memory {
  id: string;
  contributor_name: string;
  message: string;
  photo_url: string | null;
  video_url?: string | null;
}

interface PremiumRevealExperienceProps {
  recipientName: string;
  occasion: string;
  memories: Memory[];
  memorypopId: string;
  celebrationDate?: string | null;
  coverStyle?: string | null;
  shareCode: string;
  mood?: string | null;
  coverPhotoUrl?: string | null;
  onComplete?: () => void; // Callback when reveal ends (transitions to browsing)
}

export default function PremiumRevealExperience({
  recipientName,
  occasion,
  memories,
  memorypopId,
  celebrationDate,
  coverStyle,
  shareCode,
  mood,
  coverPhotoUrl,
  onComplete,
}: PremiumRevealExperienceProps) {
  const [currentScene, setCurrentScene] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  // Audio ducking hook
  const {
    backgroundMusicRef,
    startBackgroundMusic,
    pauseBackgroundMusic,
    resumeBackgroundMusic,
    duckForVideo,
    unduckAfterVideo,
    duckForMessage,
    unduckAfterMessage,
    toggleMute,
    isMuted,
  } = useAudioDucking();

  // Get reveal configuration (hardcoded for Emma)
  const config = useMemo(
    () => getRevealConfig(memories, recipientName, occasion, coverPhotoUrl),
    [memories, recipientName, occasion, coverPhotoUrl]
  );

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!hasStarted) return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          handleTogglePause();
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleNext();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handlePrevious();
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          toggleMute();
          break;
        case 'Escape':
          e.preventDefault();
          handleExit();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasStarted, currentScene, isPaused]);

  // Track analytics
  useEffect(() => {
    if (hasStarted && typeof window !== 'undefined' && window.plausible) {
      window.plausible('premium_reveal_started', {
        props: {
          memorypop_id: memorypopId,
          share_code: shareCode,
        },
      });
    }
  }, [hasStarted, memorypopId, shareCode]);

  useEffect(() => {
    if (hasStarted && currentScene > 0 && typeof window !== 'undefined' && window.plausible) {
      window.plausible('premium_reveal_scene_viewed', {
        props: {
          memorypop_id: memorypopId,
          share_code: shareCode,
          scene_number: currentScene,
        },
      });
    }
  }, [currentScene, hasStarted, memorypopId, shareCode]);

  const handleStart = () => {
    setHasStarted(true);
    setCurrentScene(1); // Move to first real scene
    startBackgroundMusic();
  };

  const handleNext = useCallback(() => {
    if (currentScene < config.scenes.length) {
      setCurrentScene((prev) => prev + 1);
    } else {
      // Reveal complete
      if (typeof window !== 'undefined' && window.plausible) {
        window.plausible('premium_reveal_completed', {
          props: {
            memorypop_id: memorypopId,
            share_code: shareCode,
          },
        });
      }
    }
  }, [currentScene, config.scenes.length, memorypopId, shareCode]);

  const handlePrevious = useCallback(() => {
    if (currentScene > 1) {
      setCurrentScene((prev) => prev - 1);
    }
  }, [currentScene]);

  const handleTogglePause = useCallback(() => {
    setIsPaused(!isPaused);
    if (!isPaused) {
      pauseBackgroundMusic();
    } else {
      resumeBackgroundMusic();
    }
  }, [isPaused, pauseBackgroundMusic, resumeBackgroundMusic]);

  const handleSkip = useCallback(() => {
    if (typeof window !== 'undefined' && window.plausible) {
      window.plausible('premium_reveal_skipped', {
        props: {
          memorypop_id: memorypopId,
          share_code: shareCode,
          last_scene_number: currentScene,
        },
      });
    }
    onComplete?.();
  }, [memorypopId, shareCode, currentScene, onComplete]);

  const handleReplay = () => {
    if (typeof window !== 'undefined' && window.plausible) {
      window.plausible('premium_reveal_replayed', {
        props: {
          memorypop_id: memorypopId,
          share_code: shareCode,
        },
      });
    }
    setCurrentScene(0);
    setHasStarted(false);
    setIsPaused(false);
  };

  const handleExit = useCallback(() => {
    const shouldExit = window.confirm('Exit the Premium Reveal?');
    if (shouldExit) {
      handleSkip();
    }
  }, [handleSkip]);

  const handleExploreMemories = () => {
    if (typeof window !== 'undefined' && window.plausible) {
      window.plausible('premium_reveal_cta_clicked', {
        props: {
          memorypop_id: memorypopId,
          share_code: shareCode,
          cta_type: 'explore',
        },
      });
    }
    onComplete?.();
  };

  // Render current scene
  const renderScene = () => {
    if (!hasStarted || currentScene === 0) {
      return (
        <StartScene
          recipientName={recipientName}
          occasion={occasion}
          memoryCount={memories.length}
          onStart={handleStart}
          coverPhotoUrl={coverPhotoUrl}
          coverStyle={coverStyle}
        />
      );
    }

    const sceneIndex = currentScene - 1;
    if (sceneIndex >= config.scenes.length) {
      // Beyond last scene - shouldn't happen
      return null;
    }

    const sceneConfig = config.scenes[sceneIndex];
    const commonProps = {
      onComplete: handleNext,
      isPaused,
      isMuted,
      isReducedMotion,
    };

    switch (sceneConfig.type) {
      case 'cover':
        return (
          <CoverRevealScene
            {...commonProps}
            recipientName={recipientName}
            occasion={occasion}
            coverPhotoUrl={coverPhotoUrl}
            coverStyle={coverStyle}
          />
        );
      case 'montage':
        return (
          <OpeningMontageScene
            {...commonProps}
            contributors={sceneConfig.contributors || []}
          />
        );
      case 'contributor_moment':
        return (
          <ContributorMomentScene
            key={sceneConfig.moment!.id}
            {...commonProps}
            moment={sceneConfig.moment!}
            onMessageStart={duckForMessage}
            onMessageEnd={unduckAfterMessage}
          />
        );
      case 'closing':
        return (
          <ClosingScene
            {...commonProps}
            recipientName={recipientName}
            contributorCount={config.contributorCount}
            onExploreMemories={handleExploreMemories}
            onReplay={handleReplay}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative min-h-screen bg-[#fff8ef]">
      {/* Background music (hidden audio element) */}
      <audio
        ref={backgroundMusicRef}
        src={config.music.src}
        loop
        preload="auto"
      />

      {/* Current scene */}
      <div className="relative z-10">
        {renderScene()}
      </div>

      {/* Controls (only show after reveal has started) */}
      {hasStarted && currentScene > 0 && currentScene <= config.scenes.length && (
        <RevealControls
          isPaused={isPaused}
          isMuted={isMuted}
          onTogglePause={handleTogglePause}
          onToggleMute={toggleMute}
          onSkip={handleNext}
          onExit={handleExit}
        />
      )}
    </div>
  );
}
