'use client'

/**
 * AI Director Preview - Development Only
 *
 * Experience simulator and evidence view for AI Director concept
 * - Uses ONLY synthetic fixture data
 * - Makes NO Gemini API calls
 * - Makes NO Supabase queries
 * - Deterministic mock output matching documented experiment results
 *
 * BLOCKED in production via layout guard and page guard
 */

import { notFound } from 'next/navigation'
import { useState } from 'react'
import { ExperienceSimulator } from './ExperienceSimulator'
import { ComparisonView } from './ComparisonView'
import {
  generateMockRevealPlan,
  generateStandardRevealPlan,
  calculateDifference
} from '@/lib/ai/mockRevealPlanner'
import type { MemoryMetadata } from '@/lib/ai/types'

// Import synthetic fixtures
import {
  syntheticMemoryPop as birthdayMemoryPop,
  syntheticMemories as birthdayMemories
} from '../../../scripts/fixtures/premiumRevealFixture'
import {
  syntheticFarewellMemoryPop,
  syntheticFarewellMemories
} from '../../../scripts/fixtures/farewellFixture'
import {
  syntheticAnniversaryMemoryPop,
  syntheticAnniversaryMemories
} from '../../../scripts/fixtures/anniversaryFixture'
import {
  syntheticSympathyMemoryPop,
  syntheticSympathyMemories
} from '../../../scripts/fixtures/sympathyFixture'
import {
  birthdayExperiment,
  farewellExperiment,
  anniversaryExperiment,
  sympathyExperiment
} from '@/data/ai-experiments/experimentResults'

type OccasionType = 'birthday' | 'retirement' | 'anniversary' | 'sympathy'

interface OccasionData {
  recipientName: string
  memories: MemoryMetadata[]
  creatorInstruction: string
}

const OCCASIONS: Record<OccasionType, OccasionData> = {
  birthday: {
    recipientName: birthdayMemoryPop.recipientName,
    memories: birthdayMemories,
    creatorInstruction: birthdayExperiment.testB.creatorInstruction
  },
  retirement: {
    recipientName: syntheticFarewellMemoryPop.recipientName,
    memories: syntheticFarewellMemories,
    creatorInstruction: farewellExperiment.testB.creatorInstruction
  },
  anniversary: {
    recipientName: syntheticAnniversaryMemoryPop.recipientName,
    memories: syntheticAnniversaryMemories,
    creatorInstruction: anniversaryExperiment.testB.creatorInstruction
  },
  sympathy: {
    recipientName: syntheticSympathyMemoryPop.recipientName,
    memories: syntheticSympathyMemories,
    creatorInstruction: sympathyExperiment.testB.creatorInstruction
  }
}

export default function AIDirectorPreviewPage() {
  // Runtime guard - belt and suspenders with layout guard
  if (process.env.NODE_ENV !== 'development') {
    notFound()
  }

  const [selectedOccasion, setSelectedOccasion] = useState<OccasionType>('birthday')
  const [activeTab, setActiveTab] = useState<'simulator' | 'evidence'>('simulator')

  const occasionData = OCCASIONS[selectedOccasion]

  // Generate all three reveal plans
  const standardPlan = generateStandardRevealPlan(
    occasionData.memories,
    selectedOccasion
  )

  const testAPlan = generateMockRevealPlan(
    occasionData.memories,
    selectedOccasion,
    'test-a'
  )

  const testBPlan = generateMockRevealPlan(
    occasionData.memories,
    selectedOccasion,
    'test-b'
  )

  // Calculate differences
  const standardVsTestA = calculateDifference(standardPlan, testAPlan)
  const testAVsTestB = calculateDifference(testAPlan, testBPlan)

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Warning Banner */}
      <div className="bg-yellow-100 border-b-2 border-yellow-400">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔬</span>
            <div>
              <p className="font-bold text-yellow-900">
                Synthetic AI Director Preview — Development Only
              </p>
              <p className="text-sm text-yellow-800">
                Using deterministic mock data. No Gemini API calls. No production data.
                Route blocked in production.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI Director Concept Preview
          </h1>
          <p className="text-gray-600">
            {activeTab === 'simulator'
              ? 'Experience how Standard and AI Director reveals feel different'
              : 'Compare ordering differences and experiment evidence'
            }
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b-2 border-gray-300">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('simulator')}
              className={`px-6 py-3 font-medium border-b-4 transition-colors ${
                activeTab === 'simulator'
                  ? 'border-blue-600 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              🎬 Experience Simulator
            </button>
            <button
              onClick={() => setActiveTab('evidence')}
              className={`px-6 py-3 font-medium border-b-4 transition-colors ${
                activeTab === 'evidence'
                  ? 'border-blue-600 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              📊 Evidence View
            </button>
          </div>
        </div>
      </div>

      {/* Occasion Selector */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4 flex-wrap">
            <label className="font-semibold text-gray-700">Occasion:</label>
            <div className="flex gap-2 flex-wrap">
              {(Object.keys(OCCASIONS) as OccasionType[]).map(occasion => (
                <button
                  key={occasion}
                  onClick={() => setSelectedOccasion(occasion)}
                  className={`px-4 py-2 rounded font-medium transition-colors ${
                    selectedOccasion === occasion
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {occasion.charAt(0).toUpperCase() + occasion.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'simulator' ? (
          <ExperienceSimulator
            occasion={selectedOccasion}
            recipientName={occasionData.recipientName}
            memories={occasionData.memories}
            standardPlan={standardPlan}
            aiPlan={testBPlan}
            creatorInstruction={occasionData.creatorInstruction}
          />
        ) : (
          <ComparisonView
            occasion={selectedOccasion}
            recipientName={occasionData.recipientName}
            memories={occasionData.memories}
            standardPlan={standardPlan}
            testAPlan={testAPlan}
            testBPlan={testBPlan}
            creatorInstruction={occasionData.creatorInstruction}
            standardDiff={standardVsTestA}
            testADiff={standardVsTestA}
            testBDiff={testAVsTestB}
          />
        )}
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Legend</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p><span className="text-yellow-600">★</span> = Highlighted memory</p>
                <p><span className="text-red-600">🎬</span> = Selected finale</p>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Experiment Details</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p><strong>Standard Baseline:</strong> Chronological ordering (createdAt DESC)</p>
                <p><strong>Test A:</strong> AI Director with no creator instructions</p>
                <p><strong>Test B:</strong> AI Director with creator instructions</p>
                <p><strong>Data Source:</strong> Synthetic fixtures (100% fictional)</p>
                <p><strong>Generator:</strong> Deterministic mock (no Gemini API calls)</p>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Documentation</h3>
              <p className="text-sm text-gray-600">
                Full experiment results: <code className="bg-gray-100 px-1">AI-DIRECTOR-EXPERIMENT-RESULTS.md</code>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
