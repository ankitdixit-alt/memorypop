"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import Image from "next/image";
import type { ContributorMoment } from "../contributorMoments";

interface ContributorMomentSceneProps {
  moment: ContributorMoment;
  onComplete: () => void;
  onMessageStart: () => void;
  onMessageEnd: () => void;
  isPaused: boolean;
  isMuted: boolean;
  isReducedMotion: boolean;
}

/**
 * Contributor Moment Scene
 *
 * Presents one complete memory moment:
 * - Introduction ("Marcus wanted you to remember...")
 * - Photo (settles for 2 seconds)
 * - Message (reveals line by line)
 * - Signature (contributor name)
 * - Hold (2-3 seconds)
 * - Transition
 *
 * Layout:
 * - Desktop: Image-dominant (60-65%) + message panel (35-40%)
 * - Mobile: Stacked (image top, message below)
 * - Editorial magazine feel, not app UI
 * - Generous whitespace, no overlay on photo
 */
export default function ContributorMomentScene({
  moment,
  onComplete,
  onMessageStart,
  onMessageEnd,
  isPaused,
  isMuted,
  isReducedMotion,
}: ContributorMomentSceneProps) {
  const { contributorName, message, photoUrl, videoUrl, mediaType, introduction } = moment;

  // Bug 1 Fix: Compute effective media type
  // If photo is invalid/missing, treat as text-only to reuse existing text-only flow
  const hasValidPhoto = photoUrl && photoUrl.trim().length > 0;
  const effectiveMediaType = (mediaType === 'photo' && !hasValidPhoto) ? 'text' : mediaType;

  const videoRef = useRef<HTMLVideoElement>(null);
  const hasCompletedRef = useRef(false);
  const [phase, setPhase] = useState<'intro' | 'media' | 'message' | 'hold'>('intro');
  const [visibleLines, setVisibleLines] = useState(0);
  const [showSignature, setShowSignature] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);

  // Reset state when moment changes
  useEffect(() => {
    setPhase('intro');
    setVisibleLines(0);
    setShowSignature(false);
    setVideoEnded(false);
    hasCompletedRef.current = false;
  }, [moment.id]);

  // Split message into meaningful phrases/sentences
  const lines = useMemo(() => {
    if (!message) return [];
    return message
      .split(/([.!?]\s+)/)
      .reduce((acc: string[], curr, i, arr) => {
        if (i % 2 === 0 && curr.trim()) {
          acc.push(curr + (arr[i + 1] || ''));
        }
        return acc;
      }, [])
      .filter(line => line.trim());
  }, [message]);

  // Handle video playback
  useEffect(() => {
    if (effectiveMediaType !== 'video' && effectiveMediaType !== 'photo_video') return;
    if (!videoRef.current) return;
    if (phase !== 'media') return;

    const video = videoRef.current;
    video.muted = isMuted;

    let hasTransitioned = false;

    const transitionToNextPhase = () => {
      if (hasTransitioned) return;
      hasTransitioned = true;
      setVideoEnded(true);
      // Move to message phase after video ends
      setTimeout(() => {
        setPhase('message');
        if (message) onMessageStart();
      }, 1000);
    };

    const handleVideoEnd = () => {
      transitionToNextPhase();
    };

    // Bug 2 Fix: Add error handler and timeout fallback
    const handleVideoError = () => {
      console.warn('Video failed to load, continuing to message phase');
      transitionToNextPhase();
    };

    // Bug 2 Fix: Timeout fallback (10 seconds) in case video stalls or never fires 'ended'
    const fallbackTimeout = setTimeout(() => {
      console.warn('Video timeout reached, continuing to message phase');
      transitionToNextPhase();
    }, 10000);

    video.addEventListener('ended', handleVideoEnd);
    video.addEventListener('error', handleVideoError);
    video.play().catch(err => {
      console.error('Video playback failed:', err);
      transitionToNextPhase();
    });

    return () => {
      video.removeEventListener('ended', handleVideoEnd);
      video.removeEventListener('error', handleVideoError);
      clearTimeout(fallbackTimeout);
    };
  }, [phase, mediaType, isMuted, message, onMessageStart]);

  // Intro → Media transition (runs once on mount)
  useEffect(() => {
    if (isPaused) return;

    const timer = setTimeout(() => {
      setPhase('media');
    }, 1000);

    return () => clearTimeout(timer);
  }, [isPaused, contributorName]);

  // Handle no-message contributors (text-only or photo-only without message)
  useEffect(() => {
    if (isPaused) return;
    if (message && message.trim().length > 0) return; // Has message, skip
    if (phase !== 'media') return; // Wait for media phase

    const mediaSettleTime = effectiveMediaType === 'text' ? 3000 : 2000;
    const timer = setTimeout(() => {
      onComplete();
    }, mediaSettleTime);

    return () => clearTimeout(timer);
  }, [phase, isPaused, message, mediaType, onComplete, contributorName]);

  // Media → Message transition (for non-video contributors)
  useEffect(() => {
    if (isPaused) return;
    if (!message || message.trim().length === 0) return; // No message
    if (effectiveMediaType === 'video' || effectiveMediaType === 'photo_video') return; // Video handled separately
    if (phase !== 'media') return; // Wait for media phase

    const timer = setTimeout(() => {
      setPhase('message');
      onMessageStart();
    }, 2000); // 2 seconds for photo to settle

    return () => clearTimeout(timer);
  }, [phase, isPaused, message, mediaType, onMessageStart, contributorName]);

  // Effect A: Message reveal (runs when phase === 'message')
  useEffect(() => {
    if (phase !== 'message') return;
    if (isPaused) return;
    if (!message || message.trim().length === 0) return;

    const timers: NodeJS.Timeout[] = [];

    // Reveal lines one by one
    lines.forEach((_, index) => {
      const delay = index * 1800;
      timers.push(
        setTimeout(() => {
          setVisibleLines(index + 1);
        }, delay)
      );
    });

    // Show signature after all lines
    const signatureDelay = (lines.length * 1800) + 800;
    timers.push(
      setTimeout(() => {
        setShowSignature(true);
      }, signatureDelay)
    );

    // Transition to hold phase
    const holdDelay = signatureDelay + 2500;
    timers.push(
      setTimeout(() => {
        setPhase('hold');
        onMessageEnd();
      }, holdDelay)
    );

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [phase, isPaused, message, lines, onMessageEnd]);

  // Effect B: Completion (runs when phase === 'hold')
  useEffect(() => {
    if (phase !== 'hold') return;
    if (isPaused) return;
    if (hasCompletedRef.current) return;

    const timer = setTimeout(() => {
      hasCompletedRef.current = true;
      onComplete();
    }, 1000);

    return () => clearTimeout(timer);
  }, [phase, isPaused, onComplete]);

  const transitionClass = isReducedMotion
    ? ''
    : 'transition-all duration-700';

  // Render media based on type
  const renderMedia = () => {
    if (effectiveMediaType === 'text') {
      // Text-only: elegant typographic treatment
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#f5e6d3] to-[#e8d4c0] p-12">
          <div className="text-center max-w-md">
            <p className="text-3xl md:text-4xl font-serif text-[#3a241e] mb-4">
              {contributorName}
            </p>
            <p className="text-sm md:text-base text-[#856b5f] uppercase tracking-wider">
              A memory for you
            </p>
          </div>
        </div>
      );
    }

    if (effectiveMediaType === 'video' || effectiveMediaType === 'photo_video') {
      // Video: full-screen playback
      return (
        <video
          ref={videoRef}
          src={videoUrl || ''}
          className="w-full h-full object-contain bg-[#1a1a1a]"
          playsInline
          preload="auto"
        >
          <track kind="captions" />
        </video>
      );
    }

    // Photo: image-dominant
    // Bug 1 Fix: photoUrl validation happens at component level via effectiveMediaType
    // Invalid photos are treated as text-only, so this path only renders valid photos
    return (
      <>
        <Image
          src={photoUrl || ''}
          alt={`Memory from ${contributorName}`}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
      </>
    );
  };

  // For text-only, use centered full-screen layout
  if (effectiveMediaType === 'text') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fff8ef] via-[#ffe8d6] to-[#ffd4cc]">
        <div className="flex min-h-screen flex-col items-center justify-center px-8 py-12">
          {/* Text-only contributor tile + message */}
          {phase !== 'intro' && (
            <div className="max-w-3xl w-full space-y-12">
              {/* Contributor name tile */}
              <div className="relative aspect-video rounded-lg overflow-hidden">
                {renderMedia()}
              </div>

              {/* Message */}
              {(phase === 'message' || phase === 'hold') && message && (
                <div className="space-y-4 min-h-[200px]">
                  {lines.slice(0, visibleLines).map((line, index) => (
                    <p
                      key={index}
                      className={`text-lg md:text-xl leading-relaxed text-[#3a241e] text-center ${transitionClass}`}
                    >
                      {line.trim()}
                    </p>
                  ))}
                </div>
              )}

              {/* Signature */}
              {showSignature && (
                <div className={`pt-8 border-t border-[#856b5f]/20 text-center ${transitionClass}`}>
                  <p className="text-base md:text-lg text-[#856b5f] italic">
                    — {contributorName}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // For photo/video: side-by-side layout
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff8ef] via-[#ffe8d6] to-[#ffd4cc]">
      <div className="flex min-h-screen flex-col lg:flex-row">
        {/* Media Section - Image/video-dominant */}
        <div className="relative flex-shrink-0 lg:w-[65%] h-[50vh] lg:h-screen">
          {/* Media (photo or video) */}
          <div
            className={`relative w-full h-full ${transitionClass} ${
              phase !== 'intro' ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {renderMedia()}
          </div>
        </div>

        {/* Message Panel - Clean, editorial */}
        <div className="flex-1 flex items-center justify-center px-8 py-12 lg:px-16 lg:py-20">
          <div className="max-w-xl w-full">
            {/* Message lines - appear progressively */}
            {(phase === 'message' || phase === 'hold') && message && (
              <div className="space-y-4 min-h-[200px]">
                {lines.slice(0, visibleLines).map((line, index) => (
                  <p
                    key={index}
                    className={`text-lg md:text-xl leading-relaxed text-[#3a241e] ${transitionClass}`}
                  >
                    {line.trim()}
                  </p>
                ))}
              </div>
            )}

            {/* Signature - appears after message */}
            {showSignature && (
              <div className={`pt-8 border-t border-[#856b5f]/20 ${transitionClass}`}>
                <p className="text-base md:text-lg text-[#856b5f] italic">
                  — {contributorName}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
