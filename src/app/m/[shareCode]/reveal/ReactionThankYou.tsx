"use client";

import Link from "next/link";

interface Props {
  reactionType: string;
  shareCode: string;
  isReturningUser?: boolean;
}

const REACTION_DISPLAY: Record<string, { emoji: string; label: string }> = {
  loved_it: { emoji: "❤️", label: "loved it" },
  made_me_emotional: { emoji: "🥹", label: "it was emotional" },
  made_me_laugh: { emoji: "😂", label: "it made you laugh" },
};

export default function ReactionThankYou({ reactionType, shareCode, isReturningUser = false }: Props) {
  const reaction = REACTION_DISPLAY[reactionType] || { emoji: "❤️", label: "loved it" };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#fff8ef] px-6">
      {/* Emoji */}
      <div className="text-7xl mb-6">{reaction.emoji}</div>

      {/* Heading - different for returning vs first-time users */}
      <h1 className="mb-4 text-center text-3xl font-bold text-[#3a241e]">
        {isReturningUser ? "Your Reaction" : "Thank You"}
      </h1>

      {/* Message - different for returning vs first-time users */}
      <p className="mb-12 text-center text-xl text-[#856b5f] max-w-md">
        {isReturningUser
          ? `You ${reaction.label} when you first experienced this MemoryPop.`
          : "Your reaction has been shared with everyone who contributed to this MemoryPop."
        }
      </p>

      {/* Ending Options */}
      <div className="flex flex-col gap-4 w-full max-w-md">
        <Link
          href={`/m/${shareCode}`}
          className="rounded-full bg-[#ef6a57] px-8 py-4 text-center font-semibold text-white transition-colors hover:bg-[#e05a47] active:ring-2 active:ring-white active:ring-offset-2 transition-all"
        >
          Revisit Memory Wall
        </Link>

        <button
          onClick={() => window.location.reload()}
          className="rounded-full border border-[#ead8c9] bg-white px-8 py-4 font-semibold text-[#3a241e] transition-colors hover:bg-[#fff8ef] active:ring-2 active:ring-[#FF6B57] active:ring-offset-2 transition-all"
        >
          Replay Reveal
        </button>
      </div>
    </div>
  );
}
