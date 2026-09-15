/**
 * Navigation Controls
 *
 * Provides Next, Back, Restart, Skip to Finale controls
 * for the experience simulator
 */

interface NavigationControlsProps {
  currentIndex: number
  totalCount: number
  onNext: () => void
  onPrevious: () => void
  onRestart: () => void
  onSkipToFinale: () => void
  isFinale: boolean
  disabled?: boolean
}

export function NavigationControls({
  currentIndex,
  totalCount,
  onNext,
  onPrevious,
  onRestart,
  onSkipToFinale,
  isFinale,
  disabled = false
}: NavigationControlsProps) {
  const canGoBack = currentIndex > 0 && !disabled
  const canGoNext = currentIndex < totalCount - 1 && !disabled

  return (
    <div className="bg-white border-t-2 border-gray-300 p-4">
      <div className="max-w-3xl mx-auto">
        {/* Progress indicator */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              {isFinale ? '🎬 Finale' : `Memory ${currentIndex + 1} of ${totalCount}`}
            </span>
            <span className="text-xs text-gray-500">
              {Math.round(((currentIndex + 1) / totalCount) * 100)}% complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / totalCount) * 100}%` }}
            />
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-center gap-3">
          {/* Restart */}
          <button
            onClick={onRestart}
            disabled={disabled || currentIndex === 0}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Restart from beginning"
          >
            ↺ Restart
          </button>

          {/* Previous */}
          <button
            onClick={onPrevious}
            disabled={!canGoBack}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Previous memory"
          >
            ← Back
          </button>

          {/* Next */}
          <button
            onClick={onNext}
            disabled={!canGoNext}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Next memory"
          >
            {isFinale ? 'Restart' : 'Next →'}
          </button>

          {/* Skip to Finale */}
          {!isFinale && (
            <button
              onClick={onSkipToFinale}
              disabled={disabled}
              className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-300 rounded hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Jump to finale"
            >
              🎬 Finale
            </button>
          )}
        </div>

        {/* Keyboard hints */}
        <div className="mt-3 text-center text-xs text-gray-500">
          Use ← → arrow keys to navigate
        </div>
      </div>
    </div>
  )
}
