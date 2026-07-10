"use client";

import { useState } from "react";
import { getOccasionCopy } from "@/lib/occasions";

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
}

export default function RevealExperience({
  recipientName,
  occasion,
  memories,
}: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  // Step 0: Welcome
  // Steps 1 to memories.length: Individual memories
  // Step memories.length + 1: Final celebration

  const totalSteps = memories.length + 2; // welcome + memories + final
  const occasionCopy = getOccasionCopy(occasion, recipientName);

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    }
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
  } else {
    return <FinalScreen occasionCopy={occasionCopy} />;
  }
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
        className="rounded-full bg-[#ef6a57] px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-[#e05a47]"
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
        className="rounded-full bg-[#ef6a57] px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-[#e05a47]"
      >
        Next
      </button>
    </div>
  );
}

// Final Screen (Step n+1)
function FinalScreen({
  occasionCopy,
}: {
  occasionCopy: { celebrationMessage: string; subMessage?: string; emoji: string };
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
      <p className="text-center text-xl text-[#856b5f]">
        Thank you to everyone who made this celebration possible.
      </p>
    </div>
  );
}
