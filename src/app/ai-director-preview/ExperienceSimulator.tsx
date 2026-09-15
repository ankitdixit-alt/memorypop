/**
 * Experience Simulator
 *
 * Compares Standard vs AI Director reveal experiences
 * Uses keyboard navigation and provides mode toggle
 */

'use client'

import { useState, useEffect } from 'react'
import type { MemoryMetadata, RevealPlan } from '@/lib/ai/types'
import { StandardRevealExperience } from './StandardRevealExperience'
import { AIDirectorRevealExperience } from './AIDirectorRevealExperience'
import { NavigationControls } from './NavigationControls'
import { DeveloperPanel } from './DeveloperPanel'

interface ExperienceSimulatorProps {
  occasion: string
  recipientName: string
  memories: MemoryMetadata[]
  standardPlan: RevealPlan
  aiPlan: RevealPlan
  creatorInstruction: string
}

export function ExperienceSimulator({
  occasion,
  recipientName,
  memories,
  standardPlan,
  aiPlan,
  creatorInstruction
}: ExperienceSimulatorProps) {
  const [mode, setMode] = useState<'standard' | 'ai-director'>('standard')
  const [currentIndex, setCurrentIndex] = useState(0)

  // Get ordered memories for current mode
  const orderedMemories = mode === 'standard'
    ? getStandardOrderedMemories(memories)
    : getAIOrderedMemories(memories, aiPlan)

  const currentMemory = orderedMemories[currentIndex]
  const totalCount = orderedMemories.length

  // AI Director specific info
  const { chapterIndex, chapterTitle, memoryIndexInChapter, chapterMemoryCount } =
    getChapterInfo(currentMemory.id, aiPlan)
  const isHighlight = aiPlan.highlightMemoryIds.includes(currentMemory.id)
  const isFinale = aiPlan.finaleMemoryId === currentMemory.id
  const isOpening = currentIndex === 0

  // Navigation handlers
  const handleNext = () => {
    if (currentIndex < totalCount - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleRestart = () => {
    setCurrentIndex(0)
  }

  const handleSkipToFinale = () => {
    const finaleIndex = orderedMemories.findIndex(m => m.id === aiPlan.finaleMemoryId)
    if (finaleIndex !== -1) {
      setCurrentIndex(finaleIndex)
    }
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        handleNext()
      } else if (e.key === 'ArrowLeft') {
        handlePrevious()
      } else if (e.key === 'Home') {
        handleRestart()
      } else if (e.key === 'End') {
        handleSkipToFinale()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, totalCount])

  // Reset index when mode changes
  useEffect(() => {
    setCurrentIndex(0)
  }, [mode])

  return (
    <div className="space-y-6">
      {/* Mode toggle */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="font-bold text-gray-900 mb-1">Experience Mode</h3>
            <p className="text-sm text-gray-600">
              Compare how the same memories feel in different reveal styles
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setMode('standard')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                mode === 'standard'
                  ? 'bg-gray-600 text-white shadow-lg scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Standard Reveal
            </button>
            <button
              onClick={() => setMode('ai-director')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                mode === 'ai-director'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              AI Director Concept
            </button>
          </div>
        </div>
      </div>

      {/* Creator instruction (AI Director mode only) */}
      {mode === 'ai-director' && (
        <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-xl">💬</span>
            <div>
              <h3 className="font-bold text-purple-900 mb-1">Creator Instruction</h3>
              <p className="text-sm text-purple-800 italic">
                "{creatorInstruction}"
              </p>
              <p className="text-xs text-purple-700 mt-2">
                The mock AI Director used this guidance to sequence memories and create chapters.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Experience container */}
      <div className="bg-white border-2 border-gray-300 rounded-lg overflow-hidden shadow-xl">
        {mode === 'standard' ? (
          <StandardRevealExperience
            recipientName={recipientName}
            occasion={occasion}
            memory={currentMemory}
            currentIndex={currentIndex}
            totalCount={totalCount}
          />
        ) : (
          <AIDirectorRevealExperience
            recipientName={recipientName}
            occasion={occasion}
            memory={currentMemory}
            plan={aiPlan}
            currentIndex={currentIndex}
            totalCount={totalCount}
            currentChapterIndex={chapterIndex}
            currentChapterTitle={chapterTitle}
            memoryIndexInChapter={memoryIndexInChapter}
            chapterMemoryCount={chapterMemoryCount}
            isHighlight={isHighlight}
            isFinale={isFinale}
            isOpening={isOpening}
          />
        )}

        {/* Navigation controls */}
        <NavigationControls
          currentIndex={currentIndex}
          totalCount={totalCount}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onRestart={handleRestart}
          onSkipToFinale={handleSkipToFinale}
          isFinale={isFinale && mode === 'ai-director'}
        />
      </div>

      {/* Developer panel */}
      <DeveloperPanel mode={mode} />
    </div>
  )
}

/**
 * Get memories in standard chronological order (createdAt DESC)
 */
function getStandardOrderedMemories(memories: MemoryMetadata[]): MemoryMetadata[] {
  return [...memories].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  )
}

/**
 * Get memories in AI Director order (following chapter structure)
 */
function getAIOrderedMemories(memories: MemoryMetadata[], plan: RevealPlan): MemoryMetadata[] {
  const memoryMap = new Map(memories.map(m => [m.id, m]))
  const ordered: MemoryMetadata[] = []

  for (const chapter of plan.chapters) {
    for (const memoryId of chapter.memoryIds) {
      const memory = memoryMap.get(memoryId)
      if (memory) {
        ordered.push(memory)
      }
    }
  }

  return ordered
}

/**
 * Get chapter information for a memory
 */
function getChapterInfo(
  memoryId: string,
  plan: RevealPlan
): {
  chapterIndex: number
  chapterTitle: string
  memoryIndexInChapter: number
  chapterMemoryCount: number
} {
  for (let i = 0; i < plan.chapters.length; i++) {
    const chapter = plan.chapters[i]
    const indexInChapter = chapter.memoryIds.indexOf(memoryId)
    if (indexInChapter !== -1) {
      return {
        chapterIndex: i,
        chapterTitle: chapter.title,
        memoryIndexInChapter: indexInChapter,
        chapterMemoryCount: chapter.memoryIds.length
      }
    }
  }

  return {
    chapterIndex: 0,
    chapterTitle: 'Memories',
    memoryIndexInChapter: 0,
    chapterMemoryCount: 0
  }
}
