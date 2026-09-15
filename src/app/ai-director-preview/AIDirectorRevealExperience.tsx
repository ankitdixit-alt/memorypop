/**
 * AI Director Reveal Experience
 *
 * Simulates a curated, story-like reveal:
 * - Opening moment with AI-written introduction
 * - Chapter transitions showing narrative structure
 * - Visual emphasis on highlighted memories
 * - Intentional finale with closing moment
 * - Better pacing and hierarchy
 */

import type { MemoryMetadata, RevealPlan } from '@/lib/ai/types'

interface AIDirectorRevealExperienceProps {
  recipientName: string
  occasion: string
  memory: MemoryMetadata
  plan: RevealPlan
  currentIndex: number
  totalCount: number
  currentChapterIndex: number
  currentChapterTitle: string
  memoryIndexInChapter: number
  chapterMemoryCount: number
  isHighlight: boolean
  isFinale: boolean
  isOpening: boolean
}

export function AIDirectorRevealExperience({
  recipientName,
  occasion,
  memory,
  plan,
  currentIndex,
  totalCount,
  currentChapterIndex,
  currentChapterTitle,
  memoryIndexInChapter,
  chapterMemoryCount,
  isHighlight,
  isFinale,
  isOpening
}: AIDirectorRevealExperienceProps) {
  // Show opening screen at index 0
  if (isOpening && currentIndex === 0) {
    return (
      <div className="min-h-[600px] flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="max-w-2xl mx-auto px-8 text-center">
          <div className="mb-8">
            <div className="inline-block p-4 bg-white rounded-full shadow-lg mb-6">
              <span className="text-4xl">
                {occasion === 'birthday' ? '🎂' :
                 occasion === 'retirement' ? '🎓' :
                 occasion === 'anniversary' ? '💕' :
                 '🕊️'}
              </span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {recipientName}
            </h1>
            <div className="inline-block px-4 py-2 bg-blue-100 rounded-full">
              <p className="text-sm font-semibold text-blue-900 uppercase tracking-wide">
                {occasion.charAt(0).toUpperCase() + occasion.slice(1)}
              </p>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur rounded-lg shadow-xl p-8 mb-8">
            <p className="text-lg text-gray-800 leading-relaxed italic">
              "{plan.opening}"
            </p>
          </div>

          <div className="text-sm text-gray-600">
            <p className="mb-2">{totalCount} memories organized into {plan.chapters.length} chapters</p>
            <p className="text-xs text-gray-500">
              AI-curated for emotional impact and narrative flow
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Show finale screen at last memory
  if (isFinale) {
    return (
      <div className="min-h-[600px] flex flex-col">
        {/* Finale header */}
        <div className="bg-gradient-to-r from-red-100 via-pink-100 to-purple-100 border-b-4 border-red-400 p-6">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-3">
              <span className="text-4xl">🎬</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Finale
            </h1>
            <p className="text-gray-700 font-medium">
              AI selected this as the perfect closing message
            </p>
          </div>
        </div>

        {/* Finale content - elevated presentation */}
        <div className="flex-1 bg-gradient-to-br from-white to-gray-50 p-8">
          <div className="max-w-2xl mx-auto">
            {/* Chapter context */}
            <div className="mb-6 text-center">
              <div className="inline-block px-4 py-2 bg-purple-100 rounded-full">
                <p className="text-sm font-semibold text-purple-900">
                  From "{currentChapterTitle}"
                </p>
              </div>
            </div>

            {/* Contributor - emphasized */}
            <div className="mb-6 text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {memory.contributorName}
              </h2>
              <p className="text-sm text-gray-500">
                {memory.createdAt.toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>

            {/* Message - featured */}
            <div className="bg-white shadow-2xl rounded-xl p-8 mb-6 border-4 border-red-200">
              <p className="text-xl text-gray-900 leading-relaxed whitespace-pre-wrap text-center">
                {memory.message}
              </p>
            </div>

            {/* Media indicators */}
            {(memory.photoCount > 0 || memory.gifCount > 0 || memory.videoDuration) && (
              <div className="text-center mb-6">
                <div className="inline-flex gap-4 text-sm text-gray-600 bg-gray-50 rounded-full px-6 py-2">
                  {memory.photoCount > 0 && (
                    <div className="flex items-center gap-2">
                      <span>📷</span>
                      <span>{memory.photoCount} photo{memory.photoCount > 1 ? 's' : ''}</span>
                    </div>
                  )}
                  {memory.gifCount > 0 && (
                    <div className="flex items-center gap-2">
                      <span>🎞️</span>
                      <span>{memory.gifCount} GIF{memory.gifCount > 1 ? 's' : ''}</span>
                    </div>
                  )}
                  {memory.videoDuration && (
                    <div className="flex items-center gap-2">
                      <span>🎬</span>
                      <span>{memory.videoDuration}s video</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Closing note */}
            <div className="text-center p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
              <p className="text-sm text-gray-700 italic">
                The end of a beautiful story, carefully curated by AI to leave you with
                the most meaningful message.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Regular memory display with chapter context
  return (
    <div className="min-h-[600px] flex flex-col">
      {/* Chapter header - shows narrative structure */}
      <div className={`border-b-2 p-6 ${
        isHighlight
          ? 'bg-gradient-to-r from-yellow-50 via-yellow-100 to-yellow-50 border-yellow-400'
          : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-300'
      }`}>
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                {currentChapterIndex + 1}
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                {currentChapterTitle}
              </h1>
            </div>
            {isHighlight && (
              <div className="flex items-center gap-2 px-3 py-1 bg-yellow-400 rounded-full">
                <span className="text-lg">⭐</span>
                <span className="text-sm font-bold text-yellow-900">Highlight</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>
              Chapter {currentChapterIndex + 1} of {plan.chapters.length}
            </span>
            <span>•</span>
            <span>
              Memory {memoryIndexInChapter + 1} of {chapterMemoryCount} in this chapter
            </span>
          </div>
        </div>
      </div>

      {/* Memory content - story-focused */}
      <div className={`flex-1 p-8 ${
        isHighlight ? 'bg-gradient-to-br from-yellow-50 to-white' : 'bg-white'
      }`}>
        <div className="max-w-2xl mx-auto">
          {/* Contributor */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {memory.contributorName}
            </h2>
            <p className="text-sm text-gray-500">
              {memory.createdAt.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
          </div>

          {/* Message - elevated presentation */}
          <div className={`rounded-lg p-6 mb-6 ${
            isHighlight
              ? 'bg-white shadow-xl border-2 border-yellow-300'
              : 'bg-gray-50 border border-gray-200'
          }`}>
            <p className="text-lg text-gray-900 leading-relaxed whitespace-pre-wrap">
              {memory.message}
            </p>
          </div>

          {/* Media indicators */}
          {(memory.photoCount > 0 || memory.gifCount > 0 || memory.videoDuration) && (
            <div className="border-t border-gray-200 pt-4 mb-6">
              <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                {memory.photoCount > 0 && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full">
                    <span>📷</span>
                    <span>{memory.photoCount} photo{memory.photoCount > 1 ? 's' : ''}</span>
                  </div>
                )}
                {memory.gifCount > 0 && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-purple-50 rounded-full">
                    <span>🎞️</span>
                    <span>{memory.gifCount} GIF{memory.gifCount > 1 ? 's' : ''}</span>
                  </div>
                )}
                {memory.videoDuration && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-pink-50 rounded-full">
                    <span>🎬</span>
                    <span>{memory.videoDuration}s video</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* AI Director note */}
          <div className={`p-4 rounded border ${
            isHighlight
              ? 'bg-yellow-50 border-yellow-300'
              : 'bg-blue-50 border-blue-200'
          }`}>
            <p className="text-xs text-gray-700">
              {isHighlight ? (
                <>
                  <strong>⭐ Why this is highlighted:</strong> AI identified this as an
                  especially meaningful memory that deserves extra emphasis.
                </>
              ) : (
                <>
                  <strong>📖 Chapter context:</strong> This memory is part of "{currentChapterTitle}",
                  where AI grouped thematically related messages to create narrative flow.
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
