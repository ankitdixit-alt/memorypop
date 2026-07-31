"use client";

interface RevealControlsProps {
  isPaused: boolean;
  isMuted: boolean;
  onTogglePause: () => void;
  onToggleMute: () => void;
  onSkip: () => void;
  onExit: () => void;
}

export default function RevealControls({
  isPaused,
  isMuted,
  onTogglePause,
  onToggleMute,
  onSkip,
  onExit,
}: RevealControlsProps) {
  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
      <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md rounded-full px-4 py-3 shadow-2xl border border-white/10">
        {/* Play/Pause */}
        <button
          onClick={onTogglePause}
          className="group p-3 rounded-full hover:bg-white/10 transition-all active:scale-90"
          aria-label={isPaused ? "Resume" : "Pause"}
          title={isPaused ? "Resume (Space)" : "Pause (Space)"}
        >
          {isPaused ? (
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          )}
        </button>

        {/* Mute/Unmute */}
        <button
          onClick={onToggleMute}
          className="group p-3 rounded-full hover:bg-white/10 transition-all active:scale-90"
          aria-label={isMuted ? "Unmute" : "Mute"}
          title={isMuted ? "Unmute (M)" : "Mute (M)"}
        >
          {isMuted ? (
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
            </svg>
          )}
        </button>

        {/* Divider */}
        <div className="w-[1px] h-6 bg-white/20 mx-1" />

        {/* Skip */}
        <button
          onClick={onSkip}
          className="group p-3 rounded-full hover:bg-white/10 transition-all active:scale-90"
          aria-label="Skip to next scene"
          title="Skip (→)"
        >
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
          </svg>
        </button>

        {/* Exit */}
        <button
          onClick={onExit}
          className="group p-3 rounded-full hover:bg-red-500/20 transition-all active:scale-90"
          aria-label="Exit reveal"
          title="Exit (Esc)"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
