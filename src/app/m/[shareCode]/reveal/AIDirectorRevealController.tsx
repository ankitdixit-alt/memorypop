'use client'

/**
 * AI Director Reveal Controller (Production)
 *
 * Plus experience controller that reuses the approved renderer from RevealPreview.
 * Converts production memories to Story format and passes to the Player component.
 *
 * Features:
 * - Chapters with title cards
 * - Highlight memory emphasis
 * - Finale special treatment
 * - Decorative overlays
 * - Tile transitions
 * - Plus media allowances (10 photos, 3 GIFs, 90s video)
 * - Music ducking during video
 * - Media viewer with modal inspection
 */

import { useMemo, useCallback, useState, useEffect, useRef } from 'react'
import { adaptRevealPlanToStory } from '@/lib/ai/planAdapter'
import { buildBeats } from '@/app/ai-director-reveal/prototype'
import { usePlayback } from '@/app/ai-director-reveal/usePlayback'
import { PreviewImage, VideoSample, useReducedMotion, type VideoStatus } from '@/app/ai-director-reveal/PreviewMedia'
import { DecorativeOverlay } from '@/components/DecorativeOverlay'
import { TileTransition, type TileVariant } from '@/app/ai-director-reveal/TileTransition'
import { getDecorationConfig } from '@/config/decorations'
import type { RevealPlan, MemoryMetadata } from '@/lib/ai/types'
import type { MediaItem, VideoMedia } from '@/components/memory-experience/types'
import type { Occasion, Story, Asset } from '@/app/ai-director-reveal/prototype'
import s from '@/app/ai-director-reveal/reveal.module.css'

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
  // URLs are already resolved by the server and embedded in the memory data
  const mediaUrlGenerator = useCallback((memory: MemoryMetadata, assetType: 'photo' | 'gif' | 'video', index: number): string => {
    const dbMemory = memories.find(m => m.id === memory.id)
    if (!dbMemory) return ''

    if (assetType === 'photo') {
      // First photo might be in legacy photo_url field
      if (index === 0 && dbMemory.photo_url && !dbMemory.photo_url.endsWith('.gif')) {
        return dbMemory.photo_url
      }
      // Additional photos in photos array
      const photoIndex = dbMemory.photo_url && !dbMemory.photo_url.endsWith('.gif') ? index - 1 : index
      if (dbMemory.photos && dbMemory.photos[photoIndex]) {
        return dbMemory.photos[photoIndex].url
      }
      return ''
    }

    if (assetType === 'gif') {
      // First GIF might be in legacy photo_url field
      if (index === 0 && dbMemory.photo_url?.endsWith('.gif')) {
        return dbMemory.photo_url
      }
      // Additional GIFs in gifs array
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

  // Build beats (Premium/Director mode)
  const beats = useMemo(() => buildBeats(story, 'director'), [story])

  // Playback state
  const [speed] = useState(1) // Fixed speed for production
  const player = usePlayback(beats, speed)
  const beat = player.beat
  const reduced = useReducedMotion()

  // Tile transition state
  const [showTileTransition, setShowTileTransition] = useState(false)
  const [tileVariant, setTileVariant] = useState<TileVariant>('tileFadeOut')
  const previousBeatRef = useRef(beat.id)

  // Video state
  const [videoStatus, setVideoStatus] = useState<VideoStatus>('ready')
  const videoRef = useRef<HTMLVideoElement | null>(null)

  // Modal state
  const [wall, setWall] = useState(false)
  const [inspected, setInspected] = useState<{assets: Asset[]; index: number; name: string} | null>(null)
  const dialogRef = useRef<HTMLDialogElement | null>(null)

  const isVideo = beat.presentation === 'video'
  const isClosing = beat.kind === 'closing'
  const modalOpen = wall || inspected !== null
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 850)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Trigger tile transition on beat change
  useEffect(() => {
    if (beat.id !== previousBeatRef.current && beat.kind !== 'opening') {
      const isTileTransition = beat.transition.startsWith('tile')
      if (isTileTransition && !reduced) {
        setTileVariant(beat.transition as TileVariant)
        setShowTileTransition(true)
      }
      previousBeatRef.current = beat.id
    }
  }, [beat.id, beat.transition, beat.kind, reduced])

  // Auto-advance on completion
  useEffect(() => {
    if (isClosing && !player.running) {
      const timer = setTimeout(onComplete, 2000)
      return () => clearTimeout(timer)
    }
  }, [isClosing, player.running, onComplete])

  // Music control (ducking during video)
  useEffect(() => {
    if (!audioRef.current) return

    const shouldPlay = player.running && !isClosing && !modalOpen
    const targetVolume = isMusicMuted ? 0 : (isVideo ? 0.03 : 0.12) // Duck during video

    if (shouldPlay && audioRef.current.paused) {
      audioRef.current.volume = 0
      audioRef.current.play().catch(() => {})
      // Fade in
      const fadeIn = setInterval(() => {
        if (audioRef.current && audioRef.current.volume < targetVolume) {
          audioRef.current.volume = Math.min(targetVolume, audioRef.current.volume + 0.01)
        } else {
          clearInterval(fadeIn)
        }
      }, 50)
      return () => clearInterval(fadeIn)
    } else if (!shouldPlay && !audioRef.current.paused) {
      // Fade out
      const fadeOut = setInterval(() => {
        if (audioRef.current && audioRef.current.volume > 0) {
          audioRef.current.volume = Math.max(0, audioRef.current.volume - 0.01)
        } else {
          clearInterval(fadeOut)
          audioRef.current?.pause()
        }
      }, 50)
      return () => clearInterval(fadeOut)
    } else if (!audioRef.current.paused) {
      audioRef.current.volume = targetVolume
    }
  }, [player.running, isClosing, isVideo, isMusicMuted, modalOpen, audioRef])

  // Handlers
  const pause = useCallback(() => {
    player.setRunning(false)
    videoRef.current?.pause()
  }, [player])

  const toggle = useCallback(() => {
    if (isVideo && videoRef.current) {
      if (!videoRef.current.paused) {
        videoRef.current.pause()
        player.setRunning(false)
      } else {
        void videoRef.current.play().catch(() => {
          setVideoStatus('error')
          player.setRunning(false)
        })
      }
    } else {
      player.setRunning(!player.running)
    }
  }, [isVideo, player])

  const openWall = () => { pause(); setWall(true); setInspected(null) }
  const openInspect = (asset: Asset) => {
    pause()
    const assets = beat.memory?.assets || [asset]
    setInspected({assets, index: Math.max(0, assets.findIndex(a => a.id === asset.id)), name: beat.memory?.name || story.recipient})
  }
  const closeModal = () => { setWall(false); setInspected(null) }

  // Render Plus experience
  return (
    <div className={s.player} data-mode="director">
      {/* Tile transitions */}
      {showTileTransition && !reduced && (
        <TileTransition
          variant={tileVariant}
          occasion={occasion as Occasion}
          onComplete={() => setShowTileTransition(false)}
          isMobile={isMobile}
        />
      )}

      {/* Main stage */}
      <section className={[s.stage, s.director, beat.finale ? s.finale : ''].join(' ')}
        data-beat={beat.id} data-kind={beat.kind}>

        {/* Decorative overlay */}
        {!reduced && (() => {
          const decorConfig = getDecorationConfig(occasion as Occasion, beat.finale || false)
          const sceneType = beat.kind === 'closing' ? 'closing'
            : beat.finale ? 'finale'
            : beat.presentation === 'video' ? 'video'
            : beat.presentation === 'letter' ? 'letter'
            : beat.kind
          return (
            <DecorativeOverlay
              elements={decorConfig.elements}
              intensity={decorConfig.intensity}
              speed={decorConfig.speed}
              enabled={true}
              sceneType={sceneType}
            />
          )
        })()}

        {/* Scene content - reused from RevealPreview Player */}
        {beat.kind === 'opening' && (
          <div key={player.key} className={s.opening + ' ' + s.fade}>
            <div className={s.openingCopy}>
              <h1>{story.title}</h1>
              <p className={s.dedication}>A story for {story.recipient}, from everyone who contributed.</p>
              <button className={s.primary} onClick={() => player.go(1, true)}>Begin <span>→</span></button>
            </div>
          </div>
        )}

        {beat.kind === 'chapter' && (
          <div key={player.key} className={s.chapterCard + ' ' + s.fade}>
            <span className={s.chapterNumber}>{String((beat.chapterIndex ?? 0) + 1).padStart(2,'0')}</span>
            <h2>{beat.chapter?.title}</h2>
            <p>{beat.chapter?.subtitle}</p>
          </div>
        )}

        {beat.kind === 'memory' && beat.memory && (
          <article key={beat.memory.id} className={[
            s.contribution,
            s.fade,
            !beat.introducesMessage && beat.assets.length > 0 ? s.mediaOnly : '',
            beat.assets.length === 0 ? s.letterOnly : ''
          ].join(' ')}>
            {beat.introducesMessage && (
              <div className={s.messagePanel}>
                <p className={s.eyebrow}>{beat.finale ? 'One last thing, with love' : 'A memory from'}</p>
                <h2>{beat.memory.name}</h2>
                <blockquote>{beat.memory.message}</blockquote>
                <div className={s.signature}>
                  <span>— {beat.memory.name}</span>
                  <span className={s.signatureEmoji}>{beat.finale ? '♡' : '—'}</span>
                </div>
              </div>
            )}
            <div className={s.mediaPanel}>
              {beat.assets.length > 0 && (
                <div key={beat.id} className={s.mediaFrame + ' ' + s.fade}>
                  {isVideo ? (
                    <VideoSample key={player.key} asset={beat.assets[0]} videoRef={videoRef} speed={speed} onStatus={setVideoStatus} onEnded={player.completeVideo}/>
                  ) : (
                    <div className={s.gallery} data-count={beat.assets.length}>
                      {beat.assets.map(a => <PreviewImage key={a.id} asset={a} animated={player.running && !reduced} onInspect={() => openInspect(a)}/>)}
                    </div>
                  )}
                </div>
              )}
            </div>
          </article>
        )}

        {isClosing && (
          <div key={player.key} className={s.closingCard + ' ' + s.closing}>
            <span className={s.heart}>♡</span>
            <h2>Thank you for being part of this story.</h2>
            <p>From everyone who helped make this — {story.memories.length} contributions.</p>
          </div>
        )}
      </section>

      {/* Playback controls */}
      <div className={s.transport}>
        <div className={s.controlRow}>
          <div className={s.navButtons}>
            <button disabled={player.index === 0} onClick={() => player.previous()}>←</button>
            <button className={s.playButton} disabled={isClosing} onClick={toggle}>
              {player.running ? 'Ⅱ Pause' : isVideo ? '▶ Play video' : '▶ Play'}
            </button>
            <button disabled={isClosing} onClick={() => player.next()}>→</button>
          </div>
          <div className={s.settings}>
            <button onClick={onMuteToggle}>Sound {isMusicMuted ? 'off' : 'on'}</button>
            <button onClick={openWall}>Browse memories ↗</button>
          </div>
        </div>
      </div>

      {/* Memory wall modal */}
      {modalOpen && (
        <dialog ref={dialogRef} className={s.dialog} open onClose={closeModal}>
          <div className={s.dialogHeader}>
            <h2>{inspected ? inspected.name : 'Your memory wall'}</h2>
            <button onClick={closeModal}>Close ×</button>
          </div>
          {inspected ? (
            <div className={s.assetInspector}>
              <PreviewImage asset={inspected.assets[inspected.index]} animated={true}/>
              <div className={s.inspectNav}>
                <button disabled={inspected.index === 0} onClick={() => setInspected({...inspected, index: inspected.index-1})}>← Previous</button>
                <span>{inspected.index+1} / {inspected.assets.length}</span>
                <button disabled={inspected.index === inspected.assets.length-1} onClick={() => setInspected({...inspected, index: inspected.index+1})}>Next →</button>
              </div>
            </div>
          ) : (
            <div className={s.wall}>
              {story.memories.map(m => (
                <article key={m.id}>
                  <h3>{m.name}</h3>
                  <p>{m.message}</p>
                  <div className={s.wallMedia}>
                    {m.assets.map(a => (
                      <button key={a.id} onClick={() => setInspected({assets:m.assets,index:m.assets.indexOf(a),name:m.name})}>
                        <img src={a.poster || a.url} alt={a.alt} loading="lazy"/>
                      </button>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          )}
        </dialog>
      )}
    </div>
  )
}
