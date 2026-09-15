/**
 * Developer Panel - Explains Experience Differences
 *
 * Shows why Standard and AI Director experiences differ
 * Development-only educational component
 */

interface DeveloperPanelProps {
  mode: 'standard' | 'ai-director'
}

export function DeveloperPanel({ mode }: DeveloperPanelProps) {
  return (
    <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <span className="text-2xl">💡</span>
        <div className="flex-1">
          <h3 className="font-bold text-blue-900 mb-2">
            {mode === 'standard' ? 'Standard Reveal' : 'AI Director Concept'}
          </h3>

          {mode === 'standard' ? (
            <div className="space-y-2 text-sm text-blue-800">
              <p>
                <strong>What you're experiencing:</strong> The current MemoryPop reveal.
              </p>
              <p>
                <strong>Design:</strong> Simple, chronological ordering (most recent first).
                Memories appear as a linear collection with no narrative structure.
              </p>
              <p>
                <strong>Emotional arc:</strong> Random. The order depends on when people
                contributed, not on emotional impact or storytelling.
              </p>
              <p>
                <strong>Finale:</strong> Arbitrary. The oldest contribution happens to be last.
              </p>
              <p>
                <strong>Creator control:</strong> None. The sequence is fixed by timestamps.
              </p>
            </div>
          ) : (
            <div className="space-y-2 text-sm text-blue-800">
              <p>
                <strong>What you're experiencing:</strong> A conceptual AI-powered reveal
                (using deterministic mock data, not real Gemini).
              </p>
              <p>
                <strong>Design:</strong> Story-like structure with AI-created chapters that
                group memories thematically (e.g., "Lifelong Bonds", "Adventures and Laughter").
              </p>
              <p>
                <strong>Emotional arc:</strong> Intentional. The AI sequences memories to
                build from lighter moments toward deeper emotions, ending with a powerful finale.
              </p>
              <p>
                <strong>Highlights:</strong> AI identifies especially meaningful memories
                and emphasizes them visually.
              </p>
              <p>
                <strong>Finale:</strong> Deliberate. AI selects the most emotionally appropriate
                memory to end the reveal (e.g., parent's message, team's gratitude).
              </p>
              <p>
                <strong>Creator control:</strong> Creator can provide instructions
                (e.g., "start professional, end heartfelt") and AI adapts sequencing.
              </p>
            </div>
          )}

          <div className="mt-3 pt-3 border-t border-blue-300">
            <p className="text-xs text-blue-700 italic">
              <strong>Note:</strong> This is a development-only concept preview. Premium Studio
              and production AI Director are not approved or implemented. This uses synthetic
              data and deterministic mock logic only.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
