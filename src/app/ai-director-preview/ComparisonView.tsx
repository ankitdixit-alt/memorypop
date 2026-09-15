/**
 * Comparison View Component
 *
 * Displays side-by-side comparison of Standard, Test A, and Test B reveal plans
 * Uses only synthetic data - no production data access
 */

import type { RevealPlan, MemoryMetadata } from '@/lib/ai/types'

interface ComparisonViewProps {
  occasion: string
  recipientName: string
  memories: MemoryMetadata[]
  standardPlan: RevealPlan
  testAPlan: RevealPlan
  testBPlan: RevealPlan
  creatorInstruction?: string
  standardDiff: number
  testADiff: number
  testBDiff: number
}

export function ComparisonView({
  occasion,
  recipientName,
  memories,
  standardPlan,
  testAPlan,
  testBPlan,
  creatorInstruction,
  standardDiff,
  testADiff,
  testBDiff
}: ComparisonViewProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {occasion.charAt(0).toUpperCase() + occasion.slice(1)}
        </h2>
        <p className="text-gray-600">
          <span className="font-medium">Recipient:</span> {recipientName}
        </p>
        <p className="text-gray-600">
          <span className="font-medium">Total Memories:</span> {memories.length}
        </p>
      </div>

      {/* Three-column comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Standard Baseline */}
        <RevealPlanCard
          title="Standard Baseline"
          subtitle="Chronological (createdAt DESC)"
          plan={standardPlan}
          memories={memories}
          badgeColor="bg-gray-500"
          diffLabel={`vs Test A: ${standardDiff}% differ`}
        />

        {/* Test A */}
        <RevealPlanCard
          title="Test A"
          subtitle="AI Director (no instructions)"
          plan={testAPlan}
          memories={memories}
          badgeColor="bg-blue-500"
          diffLabel={`vs Standard: ${standardDiff}% differ`}
        />

        {/* Test B */}
        <RevealPlanCard
          title="Test B"
          subtitle="AI Director (with instructions)"
          plan={testBPlan}
          memories={memories}
          badgeColor="bg-purple-500"
          diffLabel={`vs Test A: ${testBDiff}% differ`}
          creatorInstruction={creatorInstruction}
        />
      </div>
    </div>
  )
}

interface RevealPlanCardProps {
  title: string
  subtitle: string
  plan: RevealPlan
  memories: MemoryMetadata[]
  badgeColor: string
  diffLabel: string
  creatorInstruction?: string
}

function RevealPlanCard({
  title,
  subtitle,
  plan,
  memories,
  badgeColor,
  diffLabel,
  creatorInstruction
}: RevealPlanCardProps) {
  const memoryMap = new Map(memories.map(m => [m.id, m]))

  return (
    <div className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden flex flex-col">
      {/* Header */}
      <div className={`${badgeColor} text-white p-4`}>
        <h3 className="text-lg font-bold">{title}</h3>
        <p className="text-sm opacity-90">{subtitle}</p>
      </div>

      <div className="p-4 flex-1 overflow-y-auto space-y-4">
        {/* Creator Instruction (Test B only) */}
        {creatorInstruction && (
          <div className="bg-purple-50 border border-purple-200 rounded p-3">
            <p className="text-xs font-semibold text-purple-700 mb-1">
              Creator Instruction:
            </p>
            <p className="text-sm text-purple-900 italic">
              "{creatorInstruction}"
            </p>
          </div>
        )}

        {/* Opening */}
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-1">OPENING</p>
          <p className="text-sm text-gray-700 italic border-l-4 border-gray-300 pl-3">
            "{plan.opening}"
          </p>
        </div>

        {/* Chapters */}
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-2">
            CHAPTERS ({plan.chapters.length})
          </p>
          <div className="space-y-3">
            {plan.chapters.map((chapter, idx) => (
              <div key={idx} className="border border-gray-200 rounded p-3">
                <p className="font-semibold text-gray-900 mb-2">
                  {idx + 1}. {chapter.title}
                </p>
                <div className="space-y-2">
                  {chapter.memoryIds.map((memoryId, memIdx) => {
                    const memory = memoryMap.get(memoryId)
                    if (!memory) return null

                    const isHighlight = plan.highlightMemoryIds.includes(memoryId)
                    const isFinale = plan.finaleMemoryId === memoryId

                    return (
                      <div
                        key={memoryId}
                        className={`text-xs p-2 rounded ${
                          isHighlight
                            ? 'bg-yellow-50 border border-yellow-300'
                            : isFinale
                            ? 'bg-red-50 border border-red-300'
                            : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {isHighlight && <span className="text-yellow-600">★</span>}
                          {isFinale && <span className="text-red-600">🎬</span>}
                          <span className="font-medium text-gray-900">
                            {memory.contributorName}
                          </span>
                        </div>
                        <p className="text-gray-600 line-clamp-2">
                          {memory.message.length > 100
                            ? memory.message.substring(0, 100) + '...'
                            : memory.message}
                        </p>
                        {(memory.photoCount > 0 ||
                          memory.gifCount > 0 ||
                          memory.videoDuration) && (
                          <p className="text-gray-500 mt-1">
                            {memory.photoCount > 0 && `${memory.photoCount} photo${memory.photoCount > 1 ? 's' : ''}`}
                            {memory.gifCount > 0 && `, ${memory.gifCount} GIF${memory.gifCount > 1 ? 's' : ''}`}
                            {memory.videoDuration && `, ${memory.videoDuration}s video`}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Highlights Summary */}
        {plan.highlightMemoryIds.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">
              HIGHLIGHTS ({plan.highlightMemoryIds.length})
            </p>
            <div className="text-xs text-gray-600">
              {plan.highlightMemoryIds.map(id => {
                const memory = memoryMap.get(id)
                return memory ? memory.contributorName : id
              }).join(', ')}
            </div>
          </div>
        )}

        {/* Finale */}
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-1">FINALE</p>
          <div className="text-xs text-gray-700">
            {memoryMap.get(plan.finaleMemoryId)?.contributorName || plan.finaleMemoryId}
          </div>
        </div>

        {/* Reasoning */}
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-1">REASONING</p>
          <p className="text-xs text-gray-600 italic">
            {plan.reasoningSummary}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 border-t border-gray-200 p-3">
        <p className="text-xs text-gray-600 text-center font-medium">
          {diffLabel}
        </p>
      </div>
    </div>
  )
}
