'use client'

/**
 * AI Director Reveal Controller (Production)
 *
 * Plus experience controller that uses the approved RevealPlayer component.
 * Converts production memories to Story format and passes to RevealPlayer.
 *
 * Features:
 * - Chapters with title cards
 * - Highlight memory emphasis
 * - Finale special treatment
 * - Decorative overlays
 * - Tile transitions
 * - Plus media allowances (10 photos, 3 GIFs, 90s video)
 * - Music ducking during video
 * - Speed selector for preview
 * - All approved presentation features from RevealPlayer
 */

import { useMemo, useCallback, useState, useEffect } from 'react'
import { adaptRevealPlanToStory } from '@/lib/ai/planAdapter'
import { RevealPlayer } from '@/app/ai-director-reveal/RevealPlayer'
import type { RevealPlan, MemoryMetadata } from '@/lib/ai/types'
import type { MediaItem, VideoMedia } from '@/components/memory-experience/types'
import type { Occasion, Story } from '@/app/ai-director-reveal/prototype'

interface Memory {
  id: string
  contributor_name: string
  message: string
  photo_url: string | null
  photos?: MediaItem[]
  gifs?: MediaItem[]
  video?: VideoMedia | null
}

interface Props {
  recipientName: string
  occasion: string
  memories: Memory[]
  plan: RevealPlan
  shareCode: string
  onComplete: () => void
  audioRef: React.MutableRefObject<HTMLAudioElement | null>
  isMusicMuted: boolean
  onMuteToggle: () => void
}

export default function AIDirectorRevealController({
  recipientName,
  occasion,
  memories,
  plan,
  shareCode,
  onComplete,
  audioRef,
  isMusicMuted,
  onMuteToggle
}: Props) {
  // Convert memories to MemoryMetadata
  const memoryMetadata = useMemo((): MemoryMetadata[] => {
    return memories.map(m => ({
      id: m.id,
      contributorName: m.contributor_name,
      message: m.message,
      photoCount: (m.photos?.length || 0) + (m.photo_url && !m.photo_url.endsWith('.gif') ? 1 : 0),
      gifCount: (m.gifs?.length || 0) + (m.photo_url?.endsWith('.gif') ? 1 : 0),
      videoDuration: m.video?.duration_seconds || 0,
      createdAt: new Date()
    }))
  }, [memories])

  // Media URL generator - extracts URLs from memory objects
  const mediaUrlGenerator = useCallback((memory: MemoryMetadata, assetType: 'photo' | 'gif' | 'video', index: number): string => {
    const dbMemory = memories.find(m => m.id === memory.id)
    if (!dbMemory) return ''

    if (assetType === 'photo') {
      if (index === 0 && dbMemory.photo_url && !dbMemory.photo_url.endsWith('.gif')) {
        return dbMemory.photo_url
      }
      const photoIndex = dbMemory.photo_url && !dbMemory.photo_url.endsWith('.gif') ? index - 1 : index
      if (dbMemory.photos && dbMemory.photos[photoIndex]) {
        return dbMemory.photos[photoIndex].url
      }
      return ''
    }

    if (assetType === 'gif') {
      if (index === 0 && dbMemory.photo_url?.endsWith('.gif')) {
        return dbMemory.photo_url
      }
      const gifIndex = dbMemory.photo_url?.endsWith('.gif') ? index - 1 : index
      if (dbMemory.gifs && dbMemory.gifs[gifIndex]) {
        return dbMemory.gifs[gifIndex].url
      }
      return ''
    }

    if (assetType === 'video' && dbMemory.video) {
      return dbMemory.video.url
    }

    return ''
  }, [memories])

  // Convert to Story format
  const story = useMemo((): Story => {
    return adaptRevealPlanToStory({
      plan,
      memories: memoryMetadata,
      occasion: occasion as Occasion,
      recipientName,
      mediaUrlGenerator
    })
  }, [plan, memoryMetadata, occasion, recipientName, mediaUrlGenerator])

  // Playback speed state
  const [speed, setSpeed] = useState(1)

  // Sound state managed by parent through props
  const [soundEnabled, setSoundEnabled] = useState(!isMusicMuted)

  // Sync local sound state when parent mute state changes
  useEffect(() => {
    setSoundEnabled(!isMusicMuted)
  }, [isMusicMuted])

  // Sync sound state with parent
  const handleSoundToggle = useCallback((enabled: boolean) => {
    setSoundEnabled(enabled)
    onMuteToggle()
  }, [onMuteToggle])

  // Use approved RevealPlayer component with production music integration
  return (
    <RevealPlayer
      story={story}
      mode="director"
      preset="same"
      speed={speed}
      onSpeed={setSpeed}
      soundEnabled={soundEnabled}
      onSound={handleSoundToggle}
      showSpeedSelector={false}
      onComplete={onComplete}
      audioRef={audioRef}
      shareCode={shareCode}
    />
  )
}
