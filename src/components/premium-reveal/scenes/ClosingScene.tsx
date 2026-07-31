"use client";

import { useEffect, useState } from "react";

interface ClosingSceneProps {
  recipientName: string;
  contributorCount: number;
  onExploreMemories: () => void;
  onReplay: () => void;
  onComplete: () => void;
  isPaused: boolean;
  isMuted: boolean;
  isReducedMotion: boolean;
}

export default function ClosingScene({
  recipientName,
  contributorCount,
  onExploreMemories,
  isReducedMotion,
}: ClosingSceneProps) {
  const [phase, setPhase] = useState(1);

  useEffect(() => {
    // Progressive reveal with longer holds
    const timer1 = setTimeout(() => setPhase(2), 500);
    const timer2 = setTimeout(() => setPhase(3), 2500);
    const timer3 = setTimeout(() => setPhase(4), 5000);
    const timer4 = setTimeout(() => setPhase(5), 7500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  const transitionClass = isReducedMotion
    ? ''
    : 'transition-all duration-1000';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 bg-gradient-to-br from-[#fff8ef] via-[#ffe8d6] to-[#ffd4cc]">
      <div className="flex flex-col items-center text-center max-w-2xl space-y-8">
        {/* Name */}
        <h2
          className={`text-5xl md:text-6xl font-bold text-[#3a241e] ${transitionClass} ${
            phase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          {recipientName}
        </h2>

        {/* Core message */}
        <p
          className={`text-2xl md:text-3xl text-[#3a241e] ${transitionClass} ${
            phase >= 2 ? 'opacity-100' : 'opacity-0'
          }`}
        >
          You are loved
        </p>

        {/* Acknowledge contributors */}
        <p
          className={`text-lg md:text-xl text-[#856b5f] leading-relaxed ${transitionClass} ${
            phase >= 3 ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {contributorCount} {contributorCount === 1 ? 'person' : 'people'} spent time creating this
          <br />
          because they wanted you to know
          <br />
          how much you matter
        </p>

        {/* Invitation to browse */}
        <p
          className={`text-base md:text-lg text-[#856b5f] ${transitionClass} ${
            phase >= 4 ? 'opacity-100' : 'opacity-0'
          }`}
        >
          All of their memories are here
          <br />
          whenever you're ready
        </p>

        {/* Simple continue button - appears last */}
        {phase >= 5 && (
          <button
            onClick={onExploreMemories}
            className={`mt-6 text-base text-[#ef6a57] hover:text-[#d85a47] transition-colors ${transitionClass} ${
              phase >= 5 ? 'opacity-100' : 'opacity-0'
            }`}
          >
            Continue
          </button>
        )}
      </div>
    </div>
  );
}
