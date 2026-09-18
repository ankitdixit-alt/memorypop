'use client'

/**
 * Groq Pilot Comparison - Development Only
 *
 * Playable side-by-side comparison using the actual Plus cinematic renderer:
 * - Current Plus (generateDeterministicRevealPlan)
 * - Groq AI (saved pilot plans)
 *
 * Both rendered through identical Plus/Premium player (mode='director').
 * Uses ONLY synthetic fixtures and saved plans - no external API calls.
 */

import { notFound } from 'next/navigation'
import { useState, useEffect, useMemo, useRef } from 'react'
import type { RevealPlan, MemoryMetadata } from '@/lib/ai/types'
import type { Story, Occasion } from '@/app/ai-director-reveal/prototype'
import { generateDeterministicRevealPlan } from '@/lib/ai/deterministicPlanner'
import { adaptRevealPlanToStory } from '@/lib/ai/planAdapter'
import { validateRevealPlan } from '@/lib/ai/validation'
import { mediaUrl } from '@/app/ai-director-reveal/prototype'
import { MEMORYPOP_PLUS } from '@/config/plus'
import {
  syntheticAnniversaryMemoryPop,
  syntheticAnniversaryMemories
} from '../../../scripts/fixtures/anniversaryFixture'
import {
  syntheticSympathyMemoryPop,
  syntheticSympathyMemories
} from '../../../scripts/fixtures/sympathyFixture'
import RevealPreview from '@/app/ai-director-reveal/RevealPreview'

type PilotCase = 'anniversary-a' | 'anniversary-b' | 'sympathy-a' | 'sympathy-b'
type ComparisonMode = 'plus' | 'groq'
type FailureSimulation = 'none' | 'timeout' | 'rate-limit' | 'server-error' | 'invalid-plan'

interface CaseData {
  label: string
  occasion: Occasion
  recipientName: string
  memories: MemoryMetadata[]
  instructions?: string
  planFile: string
  status: 'available' | 'failed'
}

const PILOT_CASES: Record<PilotCase, CaseData> = {
  'anniversary-a': {
    label: 'Anniversary (no instructions)',
    occasion: 'anniversary',
    recipientName: syntheticAnniversaryMemoryPop.recipientName,
    memories: syntheticAnniversaryMemories,
    planFile: 'anniversary-test-a-attempt1-retry0-2026-09-17T08-26-00-675Z.json',
    status: 'available'
  },
  'anniversary-b': {
    label: 'Anniversary (with instructions)',
    occasion: 'anniversary',
    recipientName: syntheticAnniversaryMemoryPop.recipientName,
    memories: syntheticAnniversaryMemories,
    instructions: 'Open with fun memories and light teasing, transition to heartfelt relationship reflections, and finish with family messages',
    planFile: 'anniversary-test-b-attempt2-retry0-2026-09-17T08-26-05-846Z.json',
    status: 'available'
  },
  'sympathy-a': {
    label: 'Sympathy (no instructions)',
    occasion: 'sympathy',
    recipientName: syntheticSympathyMemoryPop.recipientName,
    memories: syntheticSympathyMemories,
    planFile: 'sympathy-test-a-attempt3-retry0-2026-09-17T08-26-10-253Z.json',
    status: 'available'
  },
  'sympathy-b': {
    label: 'Sympathy (with instructions)',
    occasion: 'sympathy',
    recipientName: syntheticSympathyMemoryPop.recipientName,
    memories: syntheticSympathyMemories,
    instructions: 'Begin with community memories, acknowledge the loss with care, and conclude with messages of faith and enduring love',
    planFile: '',
    status: 'failed'
  }
}

/**
 * Generate story from RevealPlan using same logic as ai-director-reveal
 */
function generateStoryFromPlan(
  plan: RevealPlan,
  memories: MemoryMetadata[],
  occasion: Occasion,
  recipientName: string
): Story {
  const limits = MEMORYPOP_PLUS.plus
  const imageNumbers = occasion === 'sympathy' ? [1,2,3,4,5,7,8,9,10] : [1,2,3,4,5,6,7,8,9,10]

  const mediaUrlGenerator = (memory: MemoryMetadata, assetType: 'photo' | 'gif' | 'video', index: number): string => {
    if (assetType === 'photo') {
      const memoryIndex = memories.findIndex(m => m.id === memory.id)
      const number = imageNumbers[(memoryIndex + index) % imageNumbers.length]
      return mediaUrl('photo-' + String(number).padStart(2, '0') + (number <= 4 ? '.png' : '.svg'))
    }
    if (assetType === 'gif') {
      return mediaUrl('celebrate-' + (index + 1) + '.gif')
    }
    if (assetType === 'video') {
      const duration = memory.videoDuration || 90
      return mediaUrl('sample-' + duration + '.mp4')
    }
    return ''
  }

  const gifPosterGenerator = (gifUrl: string): string => {
    const match = gifUrl.match(/celebrate-(\d+)\.gif/)
    if (match) {
      return mediaUrl('celebrate-' + match[1] + '.png')
    }
    return ''
  }

  // Apply tier limits (full Plus capabilities)
  const limitedMemories = memories.map((m, index) => {
    // Birthday hero exercises every Premium limit
    const hero = occasion === 'birthday' && m.id === 'mem_001'
    return {
      ...m,
      photoCount: Math.min(hero ? 10 : m.photoCount, limits.photos),
      gifCount: Math.min(hero ? 3 : m.gifCount, limits.gifs),
      videoDuration: hero ? limits.videoSeconds :
                     m.videoDuration ? Math.min(m.videoDuration, limits.videoSeconds) : 0
    }
  })

  return adaptRevealPlanToStory({
    plan,
    memories: limitedMemories,
    occasion,
    recipientName,
    mediaUrlGenerator,
    gifPosterGenerator
  })
}

export default function GroqComparisonPage() {
  if (process.env.NODE_ENV !== 'development') {
    notFound()
  }

  const [selectedCase, setSelectedCase] = useState<PilotCase>('anniversary-a')
  const [mode, setMode] = useState<ComparisonMode>('plus')
  const [groqPlan, setGroqPlan] = useState<RevealPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [failureSimulation, setFailureSimulation] = useState<FailureSimulation>('none')
  const [usedFallback, setUsedFallback] = useState(false)
  const latestRequestIdRef = useRef(0)

  const caseData = PILOT_CASES[selectedCase]

  // Load Groq plan from saved file, with optional failure simulation
  useEffect(() => {
    const requestId = ++latestRequestIdRef.current
    const abortController = new AbortController()
    let timeoutId: NodeJS.Timeout | null = null

    async function loadGroqPlan() {
      setLoading(true)
      setError(null)
      setUsedFallback(false)

      if (caseData.status === 'failed') {
        setError('This case failed during pilot (rate limit → internal server error)')
        setGroqPlan(null)
        setUsedFallback(false)
        setLoading(false)
        return
      }

      try {
        // Bounded timeout covering fetch + parse (10 seconds total)
        timeoutId = setTimeout(() => abortController.abort(new Error('Request timeout')), 10000)

        let response: Response

        // Simulate failures through mock responses that go through actual error handling
        if (failureSimulation !== 'none') {
          await new Promise(resolve => setTimeout(resolve, 800)) // Network delay

          // Simulate timeout: never-resolving promise that respects abort signal
          if (failureSimulation === 'timeout') {
            await new Promise((_, reject) => {
              abortController.signal.addEventListener('abort', () => {
                reject(abortController.signal.reason || new Error('Aborted'))
              })
            })
          }

          response = new Response(
            failureSimulation === 'rate-limit' ? JSON.stringify({ error: 'Rate limit exceeded' }) :
            failureSimulation === 'server-error' ? JSON.stringify({ error: 'Internal server error' }) :
            failureSimulation === 'invalid-plan' ? JSON.stringify({ plan: { opening: 'test', chapters: [], finaleMemoryId: 'invalid' } }) :
            null,
            {
              status: failureSimulation === 'rate-limit' ? 429 :
                     failureSimulation === 'server-error' ? 500 : 200,
              headers: { 'Content-Type': 'application/json' }
            }
          )
        } else {
          response = await fetch(`/api/groq-pilot-plan?file=${caseData.planFile}`, {
            signal: abortController.signal
          })
        }

        if (abortController.signal.aborted) {
          throw abortController.signal.reason || new Error('Request aborted')
        }

        if (!response.ok) {
          if (response.status === 429) {
            throw new Error('Rate limit exceeded')
          } else if (response.status === 500) {
            throw new Error('Internal server error')
          } else {
            throw new Error(`HTTP ${response.status}: Failed to load plan`)
          }
        }

        const result = await response.json()

        if (abortController.signal.aborted) {
          throw abortController.signal.reason || new Error('Request aborted')
        }

        // Basic structure check
        if (!result.plan) {
          throw new Error('No plan in response')
        }

        // Validate plan against input memories
        const validation = validateRevealPlan(result.plan, caseData.memories)
        if (!validation.valid) {
          throw new Error(`Invalid plan: ${validation.errors.join('; ')}`)
        }

        // Only update state if this is still the current request (prevent stale updates)
        if (requestId === latestRequestIdRef.current && !abortController.signal.aborted) {
          setGroqPlan(result.plan)
          setUsedFallback(false)
        }
      } catch (err) {
        if (timeoutId) clearTimeout(timeoutId)

        // Check if this is a timeout error (not cleanup/navigation abort)
        const isTimeoutError = abortController.signal.aborted &&
                              abortController.signal.reason instanceof Error &&
                              abortController.signal.reason.message === 'Request timeout'

        // Report errors from current request, including timeout errors
        // Ignore errors from obsolete requests (cleanup/navigation)
        if (requestId === latestRequestIdRef.current && (!abortController.signal.aborted || isTimeoutError)) {
          setError(err instanceof Error ? err.message : 'Failed to load')
          setGroqPlan(null)
          setUsedFallback(true)
        }
      } finally {
        if (timeoutId) clearTimeout(timeoutId)
        if (requestId === latestRequestIdRef.current) {
          setLoading(false)
        }
      }
    }

    loadGroqPlan()

    return () => {
      abortController.abort(new Error('Request obsolete'))
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [selectedCase, caseData.planFile, caseData.status, caseData.memories, failureSimulation])

  // Generate stories using actual Plus logic
  const { plusStory, groqStory } = useMemo(() => {
    // Generate Current Plus story using generateDeterministicRevealPlan
    const plusPlan = generateDeterministicRevealPlan({
      memoryPopId: 'comparison-plus-' + selectedCase,
      recipientName: caseData.recipientName,
      occasion: caseData.occasion,
      tone: 'warm',
      story: 'Comparison baseline for ' + caseData.occasion,
      memories: caseData.memories
    })

    const plusStory = generateStoryFromPlan(
      plusPlan,
      caseData.memories,
      caseData.occasion,
      caseData.recipientName
    )

    // Generate Groq story if plan loaded, otherwise use fallback deterministic planner
    let groqStory: Story | null = null
    if (groqPlan) {
      groqStory = generateStoryFromPlan(
        groqPlan,
        caseData.memories,
        caseData.occasion,
        caseData.recipientName
      )
    } else if (usedFallback) {
      // Use deterministic planner as fallback
      const fallbackPlan = generateDeterministicRevealPlan({
        memoryPopId: 'comparison-fallback-' + selectedCase,
        recipientName: caseData.recipientName,
        occasion: caseData.occasion,
        tone: 'warm',
        story: 'Fallback for ' + caseData.occasion,
        memories: caseData.memories
      })
      groqStory = generateStoryFromPlan(
        fallbackPlan,
        caseData.memories,
        caseData.occasion,
        caseData.recipientName
      )
    }

    return { plusStory, groqStory }
  }, [caseData, groqPlan, selectedCase, usedFallback])

  // Reset to plus mode when switching cases
  useEffect(() => {
    setMode('plus')
  }, [selectedCase])

  // Select active story based on mode
  const activeStory = mode === 'plus' ? plusStory : groqStory

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FFF8F2' }}>
      {/* Comparison Header */}
      <div style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #E5D5C5',
        padding: '1.5rem 2rem'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#2B1E18',
            marginBottom: '0.5rem'
          }}>
            Groq Pilot Comparison
          </h1>
          <p style={{
            fontSize: '0.875rem',
            color: '#6B5B52',
            marginBottom: '1.5rem'
          }}>
            Playable comparison using actual Plus/Premium renderer (mode='director')
          </p>

          {/* Case selector */}
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            flexWrap: 'wrap',
            marginBottom: '1rem'
          }}>
            {(Object.keys(PILOT_CASES) as PilotCase[]).map((caseKey) => (
              <button
                key={caseKey}
                onClick={() => setSelectedCase(caseKey)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  border: 'none',
                  cursor: PILOT_CASES[caseKey].status === 'failed' ? 'not-allowed' : 'pointer',
                  backgroundColor: selectedCase === caseKey ? '#FF6B57' : '#F5EDE5',
                  color: selectedCase === caseKey ? 'white' : '#2B1E18',
                  opacity: PILOT_CASES[caseKey].status === 'failed' ? 0.5 : 1,
                  transition: 'all 0.2s'
                }}
              >
                {PILOT_CASES[caseKey].label}
                {PILOT_CASES[caseKey].status === 'failed' && ' (Failed)'}
              </button>
            ))}
          </div>

          {/* Creator instructions */}
          {caseData.instructions && (
            <div style={{
              padding: '0.75rem',
              backgroundColor: '#E8F4F8',
              border: '1px solid #B8D8E8',
              borderRadius: '0.5rem',
              marginBottom: '1rem'
            }}>
              <p style={{ fontSize: '0.875rem', color: '#2B1E18' }}>
                <strong>Creator Instructions:</strong> {caseData.instructions}
              </p>
            </div>
          )}

          {/* Mode toggle */}
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            padding: '0.5rem',
            backgroundColor: '#F5EDE5',
            borderRadius: '0.5rem',
            width: 'fit-content'
          }}>
            <button
              onClick={() => setMode('plus')}
              disabled={!activeStory}
              style={{
                padding: '0.5rem 1.5rem',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                border: 'none',
                cursor: activeStory ? 'pointer' : 'not-allowed',
                backgroundColor: mode === 'plus' ? '#2B1E18' : 'transparent',
                color: mode === 'plus' ? 'white' : '#6B5B52',
                transition: 'all 0.2s'
              }}
            >
              Current Plus
            </button>
            <button
              onClick={() => setMode('groq')}
              disabled={!groqStory || loading || caseData.status === 'failed'}
              style={{
                padding: '0.5rem 1.5rem',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                border: 'none',
                cursor: groqStory && !loading ? 'pointer' : 'not-allowed',
                backgroundColor: mode === 'groq' ? '#2B1E18' : 'transparent',
                color: mode === 'groq' ? 'white' : '#6B5B52',
                transition: 'all 0.2s',
                opacity: groqStory && !loading ? 1 : 0.5
              }}
            >
              {usedFallback ? 'Groq AI (Fallback)' : 'Groq AI'}
            </button>
          </div>

          {/* Mode description */}
          <p style={{
            fontSize: '0.75rem',
            color: '#6B5B52',
            marginTop: '0.75rem'
          }}>
            {mode === 'plus' ? (
              'Deterministic planner: chronological baseline with smart finale and chapter grouping'
            ) : usedFallback ? (
              <span style={{ color: '#C05621' }}>
                ⚠ Using deterministic fallback (simulated AI failure) – Same Plus renderer, transitions, and capabilities
              </span>
            ) : (
              'AI-curated storytelling: Groq-planned chapters, highlights, and emotional progression'
            )}
          </p>

          {/* Failure simulation (development only) */}
          <details style={{ marginTop: '1rem' }}>
            <summary style={{
              fontSize: '0.75rem',
              color: '#6B5B52',
              cursor: 'pointer',
              padding: '0.5rem 0'
            }}>
              Developer: Simulate AI Failures
            </summary>
            <div style={{
              marginTop: '0.5rem',
              padding: '1rem',
              backgroundColor: '#F5EDE5',
              borderRadius: '0.5rem'
            }}>
              <p style={{ fontSize: '0.75rem', color: '#2B1E18', marginBottom: '0.5rem' }}>
                Simulate various AI failure scenarios to demonstrate fallback behavior:
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setFailureSimulation('none')}
                  disabled={caseData.status === 'failed'}
                  style={{
                    padding: '0.375rem 0.75rem',
                    fontSize: '0.75rem',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: caseData.status === 'failed' ? 'not-allowed' : 'pointer',
                    backgroundColor: failureSimulation === 'none' ? '#2B1E18' : 'white',
                    color: failureSimulation === 'none' ? 'white' : '#6B5B52',
                    opacity: caseData.status === 'failed' ? 0.5 : 1
                  }}
                >
                  No simulation
                </button>
                <button
                  onClick={() => setFailureSimulation('timeout')}
                  style={{
                    padding: '0.375rem 0.75rem',
                    fontSize: '0.75rem',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    backgroundColor: failureSimulation === 'timeout' ? '#2B1E18' : 'white',
                    color: failureSimulation === 'timeout' ? 'white' : '#6B5B52'
                  }}
                >
                  Timeout
                </button>
                <button
                  onClick={() => setFailureSimulation('rate-limit')}
                  style={{
                    padding: '0.375rem 0.75rem',
                    fontSize: '0.75rem',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    backgroundColor: failureSimulation === 'rate-limit' ? '#2B1E18' : 'white',
                    color: failureSimulation === 'rate-limit' ? 'white' : '#6B5B52'
                  }}
                >
                  Rate limit
                </button>
                <button
                  onClick={() => setFailureSimulation('server-error')}
                  style={{
                    padding: '0.375rem 0.75rem',
                    fontSize: '0.75rem',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    backgroundColor: failureSimulation === 'server-error' ? '#2B1E18' : 'white',
                    color: failureSimulation === 'server-error' ? 'white' : '#6B5B52'
                  }}
                >
                  Server error
                </button>
                <button
                  onClick={() => setFailureSimulation('invalid-plan')}
                  style={{
                    padding: '0.375rem 0.75rem',
                    fontSize: '0.75rem',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    backgroundColor: failureSimulation === 'invalid-plan' ? '#2B1E18' : 'white',
                    color: failureSimulation === 'invalid-plan' ? 'white' : '#6B5B52'
                  }}
                >
                  Invalid plan
                </button>
              </div>
              {failureSimulation !== 'none' && (
                <p style={{
                  fontSize: '0.75rem',
                  color: '#C05621',
                  marginTop: '0.75rem',
                  fontStyle: 'italic'
                }}>
                  Active: Simulating {failureSimulation.replace('-', ' ')} – Groq mode will use deterministic fallback
                </p>
              )}
            </div>
          </details>
        </div>
      </div>

      {/* Player */}
      {caseData.status === 'failed' ? (
        <div style={{
          maxWidth: '1400px',
          margin: '4rem auto',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <div style={{
            backgroundColor: '#FFF4E6',
            border: '1px solid #FFD6A5',
            borderRadius: '0.5rem',
            padding: '2rem'
          }}>
            <p style={{ fontWeight: '600', color: '#C05621', marginBottom: '0.5rem' }}>
              Generation Failed
            </p>
            <p style={{ fontSize: '0.875rem', color: '#92400E' }}>
              This case encountered API errors during pilot (rate limit → internal server error).
              No Groq plan available for comparison.
            </p>
          </div>
        </div>
      ) : loading ? (
        <div style={{
          maxWidth: '1400px',
          margin: '4rem auto',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <p style={{ color: '#6B5B52' }}>Loading Groq plan...</p>
        </div>
      ) : error && !usedFallback ? (
        <div style={{
          maxWidth: '1400px',
          margin: '4rem auto',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <div style={{
            backgroundColor: '#FEF2F2',
            border: '1px solid #FCA5A5',
            borderRadius: '0.5rem',
            padding: '2rem'
          }}>
            <p style={{ fontWeight: '600', color: '#991B1B', marginBottom: '0.5rem' }}>
              Error Loading Plan
            </p>
            <p style={{ fontSize: '0.875rem', color: '#7F1D1D' }}>{error}</p>
          </div>
        </div>
      ) : activeStory ? (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <RevealPreview
            storyOverride={activeStory}
            modeOverride="director"
            presetOverride="tier"
          />
        </div>
      ) : null}

      {/* Footer note */}
      <div style={{
        maxWidth: '1400px',
        margin: '2rem auto',
        padding: '0 2rem 2rem'
      }}>
        <div style={{
          backgroundColor: '#F5EDE5',
          borderRadius: '0.5rem',
          padding: '1rem',
          fontSize: '0.75rem',
          color: '#6B5B52'
        }}>
          <p>
            <strong>Note:</strong> Both modes use identical Plus/Premium renderer with full cinematic capabilities.
            Comparison shows plan quality only - both use generateDeterministicRevealPlan baseline vs Groq AI curation.
            All content from synthetic fixtures and saved pilot plans. No external API calls during playback.
          </p>
        </div>
      </div>
    </div>
  )
}
