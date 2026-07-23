"use client";

import { CELEBRATION_MOODS, type CelebrationMood } from "@/lib/celebrationMood";

interface MoodSelectorProps {
  selectedMood: CelebrationMood | null;
  onSelect: (mood: CelebrationMood) => void;
}

export default function MoodSelector({ selectedMood, onSelect }: MoodSelectorProps) {
  const moods: CelebrationMood[] = [
    "warm_heartfelt",
    "playful_fun",
    "thoughtful_meaningful",
    "joyful_celebratory",
    "nostalgic_reflective",
    "simple_classic"
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {moods.map((moodId) => {
        const mood = CELEBRATION_MOODS[moodId];
        const isSelected = selectedMood === moodId;

        return (
          <button
            key={moodId}
            type="button"
            onClick={() => onSelect(moodId)}
            className={`rounded-2xl border p-4 text-left transition-all ${
              isSelected
                ? "border-[#FF6B57] bg-[#FFF1EC] ring-2 ring-[#FF6B57] ring-offset-2"
                : "border-[#F0DED2] hover:border-[#FF6B57] hover:bg-[#FFF8F2]"
            } active:ring-2 active:ring-[#FF6B57] active:ring-offset-1`}
          >
            <div className="text-3xl mb-2">{mood.emoji}</div>
            <div className="font-semibold text-sm text-[#2B1E18]">{mood.label}</div>
            <div className="text-xs text-[#6B5B52] mt-1">{mood.description}</div>
          </button>
        );
      })}
    </div>
  );
}
