/**
 * Developer Controls for AI Director Reveal Concept
 *
 * Provides:
 * - Mode toggle (Standard vs AI Director)
 * - Playback controls
 * - Timeline visualization
 * - Decoration toggle
 * - Why This Differs panel
 */

'use client'

interface DeveloperControlsProps {
  mode: 'standard' | 'ai-director'
  onModeChange: (mode: 'standard' | 'ai-director') => void
  currentScene: number
  totalScenes: number
  isPlaying: boolean
  onPlayPause: () => void
  onNext: () => void
  onPrevious: () => void
  onRestart: () => void
  onSkipToFinale: () => void
  decorationsEnabled: boolean
  onToggleDecorations: () => void
  transitionsVisible: boolean
  onToggleTransitions: () => void
  playbackSpeed: number
  onPlaybackSpeedChange: (speed: number) => void
  showTimingInfo: boolean
  onToggleTimingInfo: () => void
  occasion: string
  chapterInfo?: {
    currentChapter?: number
    totalChapters?: number
    chapterTitle?: string
  }
}

export function DeveloperControls({
  mode,
  onModeChange,
  currentScene,
  totalScenes,
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  onRestart,
  onSkipToFinale,
  decorationsEnabled,
  onToggleDecorations,
  transitionsVisible,
  onToggleTransitions,
  playbackSpeed,
  onPlaybackSpeedChange,
  showTimingInfo,
  onToggleTimingInfo,
  occasion,
  chapterInfo
}: DeveloperControlsProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/90 text-white p-4 z-50 border-t-2 border-yellow-500">
      <div className="max-w-6xl mx-auto space-y-3">
        {/* Dev Badge */}
        <div className="text-center">
          <div className="inline-block px-3 py-1 bg-yellow-500 text-black text-xs font-bold rounded">
            🔬 SYNTHETIC AI DIRECTOR REVEAL CONCEPT — DEVELOPMENT ONLY
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => onModeChange('standard')}
            className={`px-6 py-2 rounded font-medium transition-all ${
              mode === 'standard'
                ? 'bg-gray-600 text-white scale-105'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Standard Reveal
          </button>
          <button
            onClick={() => onModeChange('ai-director')}
            className={`px-6 py-2 rounded font-medium transition-all ${
              mode === 'ai-director'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white scale-105'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            AI Director Concept
          </button>
        </div>

        {/* Timeline & Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Scene {currentScene + 1} of {totalScenes}</span>
            {chapterInfo && mode === 'ai-director' && chapterInfo.chapterTitle && (
              <span className="text-blue-400">
                Chapter {(chapterInfo.currentChapter || 0) + 1}/{chapterInfo.totalChapters}: {chapterInfo.chapterTitle}
              </span>
            )}
            <span>{Math.round(((currentScene + 1) / totalScenes) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentScene + 1) / totalScenes) * 100}%` }}
            />
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={onRestart}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm"
            title="Restart"
          >
            ↺
          </button>
          <button
            onClick={onPrevious}
            disabled={currentScene === 0}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            title="Previous"
          >
            ←
          </button>
          <button
            onClick={onPlayPause}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded font-medium"
          >
            {isPlaying ? '⏸ Pause' : '▶ Play'}
          </button>
          <button
            onClick={onNext}
            disabled={currentScene === totalScenes - 1}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            title="Next"
          >
            →
          </button>
          <button
            onClick={onSkipToFinale}
            className="px-4 py-2 bg-red-700 hover:bg-red-600 rounded text-sm"
            title="Skip to Finale"
          >
            🎬 Finale
          </button>
        </div>

        {/* Playback Speed Controls */}
        <div className="flex items-center justify-center gap-2 text-sm">
          <span className="text-gray-400">Speed:</span>
          {[0.75, 1, 1.5, 2].map(speed => (
            <button
              key={speed}
              onClick={() => onPlaybackSpeedChange(speed)}
              className={`px-3 py-1 rounded transition-all ${
                playbackSpeed === speed
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>

        {/* Options */}
        <div className="flex items-center justify-center gap-6 text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showTimingInfo}
              onChange={() => onToggleTimingInfo()}
              className="w-4 h-4"
            />
            <span>Show timing info</span>
          </label>
          {mode === 'ai-director' && (
            <>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={decorationsEnabled}
                  onChange={(e) => onToggleDecorations()}
                  className="w-4 h-4"
                />
                <span>Show decorative overlays</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={transitionsVisible}
                  onChange={(e) => onToggleTransitions()}
                  className="w-4 h-4"
                />
                <span>Show transition names</span>
              </label>
            </>
          )}
        </div>

        {/* Why This Differs */}
        <details className="bg-gray-800 rounded p-3">
          <summary className="cursor-pointer font-medium text-sm">
            💡 Why This Differs
          </summary>
          <div className="mt-2 text-xs text-gray-300 space-y-1">
            {mode === 'standard' ? (
              <>
                <p><strong>Standard Reveal:</strong> Chronological baseline</p>
                <p>• Simple chronological ordering (newest first)</p>
                <p>• No AI curation, chapters, or highlights</p>
                <p>• Consistent simple fade transitions</p>
                <p>• Standard pacing for all memories</p>
                <p>• Each memory message renders exactly once (no repetition)</p>
                <p>• Arbitrary ending (last in chronological order)</p>
                <p className="mt-2 text-blue-400">
                  <strong>Matches production Standard Reveal behavior</strong>
                </p>
              </>
            ) : (
              <>
                <p><strong>AI Director:</strong> Story-driven sequencing</p>
                <p>• Opening title + AI-written introduction</p>
                <p>• Emotional chapters group related memories</p>
                <p>• Carefully selected transitions (gentle-fade, crossfade, slow-zoom, etc.)</p>
                <p>• Highlight moments get +30% viewing time</p>
                <p>• Deliberate finale selection (most impactful)</p>
                <p>• Closing message ties the story together</p>
                <p>• Optional subtle decorative theme ({occasion})</p>
                <p>• Each memory message renders exactly once (no repetition)</p>
                <p className="mt-2 text-yellow-400">
                  <strong>Note:</strong> Uses deterministic mock logic, not real Gemini
                </p>
              </>
            )}
          </div>
        </details>
      </div>
    </div>
  )
}
