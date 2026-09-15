/**
 * Standard Reveal Experience
 *
 * Simulates the current MemoryPop reveal:
 * - Chronological ordering (most recent first)
 * - Simple linear progression
 * - No chapters or narrative structure
 * - No intentional finale
 */

import type { MemoryMetadata } from '@/lib/ai/types'

interface StandardRevealExperienceProps {
  recipientName: string
  occasion: string
  memory: MemoryMetadata
  currentIndex: number
  totalCount: number
}

export function StandardRevealExperience({
  recipientName,
  occasion,
  memory,
  currentIndex,
  totalCount
}: StandardRevealExperienceProps) {
  return (
    <div className="min-h-[600px] flex flex-col">
      {/* Simple header */}
      <div className="bg-gradient-to-r from-gray-100 to-gray-50 border-b border-gray-200 p-6">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {occasion.charAt(0).toUpperCase() + occasion.slice(1)}
          </h1>
          <p className="text-gray-600">
            For {recipientName}
          </p>
        </div>
      </div>

      {/* Memory content - simple, utilitarian */}
      <div className="flex-1 bg-white p-8">
        <div className="max-w-2xl mx-auto">
          {/* Memory counter */}
          <div className="mb-6">
            <div className="inline-block px-3 py-1 bg-gray-100 rounded text-sm font-medium text-gray-600">
              Memory {currentIndex + 1} of {totalCount}
            </div>
          </div>

          {/* Contributor */}
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
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

          {/* Message */}
          <div className="mb-6">
            <p className="text-lg text-gray-800 leading-relaxed whitespace-pre-wrap">
              {memory.message}
            </p>
          </div>

          {/* Media indicators - simple */}
          {(memory.photoCount > 0 || memory.gifCount > 0 || memory.videoDuration) && (
            <div className="border-t border-gray-200 pt-4">
              <div className="flex flex-wrap gap-3 text-sm text-gray-600">
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

          {/* Note about chronological ordering */}
          <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded">
            <p className="text-xs text-gray-600 italic">
              Memories appear in the order they were contributed (most recent first).
              This is Memory #{totalCount - currentIndex} chronologically.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
