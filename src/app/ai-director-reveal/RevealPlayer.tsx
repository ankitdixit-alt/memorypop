'use client'

/**
 * Plus Reveal Player - Customer Integration
 *
 * Approved presentation (September 9, 2026) with customer integration:
 * - Removed developer inspector (prototype only)
 * - Uses parent audioRef for production music
 * - Music ducking during video (0.03 vs 0.12)
 * - Tile transitions and decorative overlays
 * - Generic customer-facing text
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { buildBeats, estimateSeconds, formatDuration, type Mode, type Preset, type Story, type Asset } from './prototype'
import { usePlayback } from './usePlayback'
import { PreviewImage, VideoSample, useReducedMotion, type VideoStatus } from './PreviewMedia'
import { DecorativeOverlay } from '../../components/DecorativeOverlay'
import { TileTransition, type TileVariant } from './TileTransition'
import { getDecorationConfig } from '../../config/decorations'
import s from './reveal.module.css'

interface RevealPlayerProps {
  story: Story
  mode: Mode
  preset?: Preset
  speed: number
  onSpeed: (speed: number) => void
  soundEnabled: boolean
  onSound: (enabled: boolean) => void
  showSpeedSelector?: boolean
  onComplete?: () => void
  // Production music integration
  audioRef?: React.MutableRefObject<HTMLAudioElement | null>
}

export function RevealPlayer({
  story,
  mode,
  preset = 'same',
  speed,
  onSpeed,
  soundEnabled,
  onSound,
  showSpeedSelector = true,
  onComplete,
  audioRef: externalAudioRef
}: RevealPlayerProps) {
  const beats = useMemo(() => buildBeats(story, mode), [story, mode])
  const player = usePlayback(beats, speed)
  const beat = player.beat
  const premium = mode === 'director'
  const reduced = useReducedMotion()
  const [videoStatus, setVideoStatus] = useState<VideoStatus>('ready')
  const [videoProgress, setVideoProgress] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [wall, setWall] = useState(false)
  const [inspected, setInspected] = useState<{assets: Asset[]; index: number; name: string} | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const isVideo = beat.presentation === 'video'
  const isClosing = beat.kind === 'closing'
  const modalOpen = wall || inspected !== null
  const [isMobile, setIsMobile] = useState(false)

  // Tile transition state
  const [showTileTransition, setShowTileTransition] = useState(false)
  const [tileVariant, setTileVariant] = useState<TileVariant>('tileFadeOut')
  const previousBeatRef = useRef(beat.id)

  // Decorative overlay state
  const [userInteracted, setUserInteracted] = useState(false)
  const decorationEnabled = premium && story.occasion !== 'sympathy' && !reduced && !isMobile

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
      if (isTileTransition && premium && !reduced) {
        setTileVariant(beat.transition as TileVariant)
        setShowTileTransition(true)
      }
      previousBeatRef.current = beat.id
    }
  }, [beat.id, beat.transition, beat.kind, premium, reduced])

  useEffect(() => {
    setVideoStatus('ready')
    setVideoProgress(0)
    const video = videoRef.current
    if (video && !isVideo) {
      video.pause()
      video.currentTime = 0
    }
  }, [player.key, isVideo])

  // Automatic video playback
  useEffect(() => {
    if (!userInteracted || !isVideo || !player.running) return
    const video = videoRef.current
    if (!video || !video.paused) return

    const timer = setTimeout(() => {
      if (video.paused && player.running) {
        void video.play().catch(() => {
          setVideoStatus('error')
          player.setRunning(false)
        })
      }
    }, 150)

    return () => clearTimeout(timer)
  }, [userInteracted, isVideo, player.running, player.key, player.setRunning])

  const onVideoStatus = useCallback((status: VideoStatus) => {
    setVideoStatus(status)
    if (status === 'playing') player.setRunning(true)
    if (status === 'paused' || status === 'error') player.setRunning(false)
  }, [player.setRunning])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const update = () => setVideoProgress(video.duration ? video.currentTime / video.duration : 0)
    video.addEventListener('timeupdate', update)
    return () => video.removeEventListener('timeupdate', update)
  }, [player.key])

  const pause = useCallback(() => {
    player.setRunning(false)
    videoRef.current?.pause()
  }, [player.setRunning])

  const toggle = useCallback(() => {
    setUserInteracted(true)
    if (isVideo) {
      const video = videoRef.current
      if (!video) return
      if (!video.paused) { video.pause(); player.setRunning(false) }
      else { void video.play().catch(() => { setVideoStatus('error'); player.setRunning(false) }) }
    } else player.setRunning(!player.running)
  }, [isVideo, player.running, player.setRunning])

  const openWall = () => { pause(); setWall(true); setInspected(null) }
  const openInspect = (asset: Asset) => {
    pause()
    const assets = beat.memory?.assets || [asset]
    setInspected({assets, index: Math.max(0, assets.findIndex(a => a.id === asset.id)), name: beat.memory?.name || story.recipient})
  }

  useEffect(() => {
    if (modalOpen && !dialogRef.current?.open) dialogRef.current?.showModal()
    if (!modalOpen && dialogRef.current?.open) dialogRef.current?.close()
  }, [modalOpen])

  const closeModal = () => { setWall(false); setInspected(null) }

  // Music with ducking during video (production integration)
  useEffect(() => {
    const audio = externalAudioRef?.current
    if (!audio) return

    const shouldPlay = soundEnabled && player.running && !isClosing && !modalOpen
    const targetVolume = isVideo ? 0.03 : 0.12

    let rafId: number | null = null
    const rampVolume = (current: number, target: number, duration: number) => {
      const start = performance.now()
      const startVol = current
      const step = () => {
        const elapsed = performance.now() - start
        const progress = Math.min(1, elapsed / duration)
        audio.volume = startVol + (target - startVol) * progress
        if (progress < 1) rafId = requestAnimationFrame(step)
      }
      rafId = requestAnimationFrame(step)
    }

    if (shouldPlay) {
      if (audio.paused) void audio.play().catch(() => {})
      if (Math.abs(audio.volume - targetVolume) > 0.01) {
        rampVolume(audio.volume, targetVolume, 800)
      }
    } else {
      if (rafId) cancelAnimationFrame(rafId)
      audio.pause()
    }

    return () => { if (rafId) cancelAnimationFrame(rafId) }
  }, [soundEnabled, player.running, isVideo, isClosing, modalOpen, externalAudioRef])

  useEffect(() => {
    const video = videoRef.current
    return () => { video?.pause() }
  }, [])

  useEffect(() => {
    const hide = () => { if (document.hidden) pause() }
    document.addEventListener('visibilitychange', hide)
    return () => document.removeEventListener('visibilitychange', hide)
  }, [pause])

  useEffect(() => {
    const keys = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (modalOpen || ['INPUT','SELECT','TEXTAREA','BUTTON','VIDEO','AUDIO','A'].includes(tag)) return
      if (e.key === ' ' && !isClosing) { e.preventDefault(); toggle() }
      if (e.key === 'ArrowRight') { e.preventDefault(); player.next() }
      if (e.key === 'ArrowLeft') { e.preventDefault(); player.previous() }
    }
    window.addEventListener('keydown', keys)
    return () => window.removeEventListener('keydown', keys)
  }, [modalOpen, isClosing, toggle, player])

  // Production completion callback
  useEffect(() => {
    if (isClosing && !player.running && onComplete) {
      const timer = setTimeout(onComplete, 2000)
      return () => clearTimeout(timer)
    }
  }, [isClosing, player.running, onComplete])

  const currentProgress = isVideo ? videoProgress : player.progress
  const overall = isClosing ? 100 : Math.round((player.index + currentProgress) / (beats.length - 1) * 100)
  const nowPlaying = isVideo ? videoStatus === 'playing' || videoStatus === 'buffering' : player.running
  const currentMemory = beat.memory
  const assetIndex = currentMemory && beat.assets.length ? currentMemory.assets.findIndex(a => a.id === beat.assets[0].id) : -1
  const nextContribution = () => {
    const next = beats.findIndex((b,i) => i > player.index && (b.kind === 'closing' || b.memory && b.memory.id !== beat.memory?.id))
    player.go(next >= 0 ? next : beats.length - 1)
  }

  return <div className={s.app}>
    <div className={s.player} data-mode={mode} data-preset={preset}>
      <div className={s.stageHeader}>
        <span>{premium ? 'A story for ' + story.recipient : 'Memories for ' + story.recipient}</span>
        <button onClick={openWall}>Browse memories ↗</button>
      </div>

      <section className={[s.stage, premium ? s.director : s.standard, story.occasion === 'sympathy' ? s.quiet : '', beat.finale ? s.finale : ''].join(' ')}
        aria-label={premium ? 'AI Director reveal' : 'Standard reveal'} data-beat={beat.id} data-kind={beat.kind} data-layout={beat.presentation}
        style={{'--motion-play': player.running ? 'running' : 'paused'} as React.CSSProperties}>

        {/* Tile transition overlay */}
        {showTileTransition && <TileTransition variant={tileVariant} occasion={story.occasion} isMobile={isMobile} onComplete={() => setShowTileTransition(false)} />}

        {/* Decorative overlay */}
        {decorationEnabled && (
          <DecorativeOverlay
            elements={['✦', '✧']}
            intensity="subtle"
            speed="slow"
            enabled={true}
            sceneType={beat.kind}
          />
        )}

        <div className={s.storyProgress} aria-live="polite">
          {beat.kind === 'opening' ? <span>{story.memories.length} voices. One gift.</span>
            : beat.kind === 'closing' ? <span>All {story.memories.length} memories, together.</span>
            : <><span>{currentMemory ? 'Memory ' + beat.ordinal + ' of ' + story.memories.length : 'Chapter ' + ((beat.chapterIndex ?? 0) + 1)}</span>
              {beat.chapter && <span>{beat.chapter.title}</span>}</>}
        </div>

        {beat.kind === 'opening' && <div key={player.key} className={s.opening + ' ' + s.fade}>
          <div className={s.openingCopy}><p className={s.eyebrow}>{story.occasion === 'sympathy' ? 'Shared with love' : 'Made of memories'}</p>
            <h1>{story.title}</h1><p className={s.dedication}>For {story.recipient},<br/>from your people.</p>
            <button className={s.primary} onClick={() => { player.go(1, true) }}>Begin the reveal <span>→</span></button>
          </div>
          <div className={s.coverPhotos} aria-hidden="true">
            {story.memories.flatMap(m => m.assets).filter(a => a.kind === 'photo').slice(0,2).map(a => <PreviewImage key={a.id} asset={a}/>)}
          </div>
        </div>}

        {beat.kind === 'chapter' && <div key={player.key} className={s.chapterCard + ' ' + s.chapter}>
          <span className={s.chapterNumber}>{String((beat.chapterIndex ?? 0) + 1).padStart(2,'0')}</span>
          <p className={s.eyebrow}>The next chapter</p><h2>{beat.chapter?.title}</h2>
          <p>{beat.chapter?.subtitle}</p><div className={s.chapterRule}/>
        </div>}

        {beat.kind === 'memory' && currentMemory && (premium
          ? <article key={currentMemory.id} className={[s.contribution, beat.finale ? s.closing : story.occasion === 'sympathy' ? s.fade : s.slide, !currentMemory.assets.length ? s.letterOnly : ''].join(' ')} data-memory={currentMemory.id}>
            <div className={s.messagePanel}>
              <p className={s.eyebrow}>{beat.finale ? 'One last thing, with love' : 'A memory from'}</p>
              <h2>{currentMemory.name}</h2>
              <blockquote data-testid="contribution-message">{currentMemory.message}</blockquote>
              <div className={s.signature}>— {currentMemory.name}<span aria-hidden="true">{beat.finale ? '♡' : '—'}</span></div>
              <p className={s.assetCount}>{currentMemory.assets.filter(a => a.kind === 'photo').length > 0 && currentMemory.assets.filter(a => a.kind === 'photo').length + ' photos · '}A part of your story</p>
            </div>
            <div className={s.mediaPanel}>
              {beat.assets.length > 0 && <div key={beat.id} className={s.mediaFrame + ' ' + s.fade}>
                {isVideo ? <VideoSample key={player.key} asset={beat.assets[0]} videoRef={videoRef} speed={speed} onStatus={onVideoStatus} onEnded={player.completeVideo}/>
                  : <div className={s.gallery} data-count={beat.assets.length}>
                    {beat.assets.map(a => <PreviewImage key={a.id} asset={a} animated={player.running && !reduced} onInspect={() => openInspect(a)}/>)}
                  </div>}
                <div className={s.photoCaption}><span>{beat.assets[0].kind === 'gif' ? 'A little celebration' : 'From ' + currentMemory.name}</span>
                  <span>{assetIndex + 1}{beat.assets.length > 1 ? '–' + (assetIndex + beat.assets.length) : ''} / {currentMemory.assets.length}</span></div>
              </div>}
              {!beat.assets.length && currentMemory.assets.length > 0 && <div className={s.readFirst}>A few words before the film.</div>}
            </div>
          </article>
          : <div key={beat.id} className={s.standardContent + ' ' + s.fade}>
            {isVideo ? <VideoSample key={player.key} asset={beat.assets[0]} videoRef={videoRef} speed={speed} onStatus={onVideoStatus} onEnded={player.completeVideo}/>
              : beat.assets.length ? <div className={s.standardPhoto}><PreviewImage asset={beat.assets[0]} animated={player.running && !reduced} onInspect={() => openInspect(beat.assets[0])}/></div> : null}
            {!isVideo && <div className={beat.assets.length ? s.standardCaption : s.standardMessage}>
              <p>{currentMemory.message}</p><p className={s.standardAttribution}>— {currentMemory.name}</p>
            </div>}
          </div>)}

        {isClosing && <div key={player.key} className={s.closingCard + ' ' + s.closing}>
          <span className={s.heart} aria-hidden="true">♡</span>
          <p className={s.eyebrow}>{story.occasion === 'sympathy' ? 'Held in memory' : 'Made together. Yours to revisit.'}</p>
          <h2>{story.occasion === 'sympathy' ? 'These memories are here for you.' : 'All these people. All this love.'}</h2>
          <p>{story.memories.length} contributions, ready to revisit whenever you like.</p>
          <div className={s.endActions}><button className={s.primary} onClick={() => player.go(0, true)}>Replay reveal ↻</button><button onClick={openWall}>Visit memory wall ↗</button></div>
        </div>}
      </section>

      <div className={s.transport} aria-label="Playback controls">
        <div className={s.track} role="progressbar" aria-label="Reveal progress" aria-valuenow={overall} aria-valuemin={0} aria-valuemax={100}><span style={{width: overall + '%'}}/></div>
        <div className={s.controlRow}>
          <div className={s.navButtons}>
            <button aria-label="Restart reveal" onClick={player.restart}>↻</button>
            <button aria-label="Previous scene" disabled={player.index === 0} onClick={player.previous}>←</button>
            <button className={s.playButton} disabled={isClosing} onClick={toggle}>{nowPlaying ? 'Ⅱ Pause' : isVideo ? '▶ Play video' : '▶ Play'}</button>
            <button aria-label="Next scene" disabled={isClosing} onClick={player.next}>→</button>
            {isVideo && <button onClick={nextContribution}>Next memory</button>}
          </div>
          <div className={s.settings}>
            <button aria-pressed={soundEnabled} onClick={() => onSound(!soundEnabled)}>Sound {soundEnabled ? 'on' : 'off'}</button>
            {showSpeedSelector && <label>Speed <select aria-label="Playback speed" value={speed} onChange={e => onSpeed(Number(e.target.value))}>
              <option value={0.75}>0.75×</option><option value={1}>1× · intended</option><option value={1.5}>1.5× · preview</option><option value={2}>2× · preview</option>
            </select></label>}
          </div>
        </div>
        <div className={s.playbackNote}><span>{isVideo ? videoStatus === 'buffering' ? 'Buffering — the reveal is waiting.' : 'Video uses its own playback clock. Speed also applies to video.' : isClosing ? 'Your memory wall is ready.' : speed === 1 ? 'Take your time. Pause whenever you like.' : 'Preview speed — use 1× to judge the intended experience.'}</span>
          <span>About {formatDuration(estimateSeconds(beats, speed))} at {speed}×, excluding pauses</span></div>
      </div>

      <dialog ref={dialogRef} className={s.dialog} onCancel={closeModal} onClose={closeModal}>
        <div className={s.dialogHeader}><h2>{inspected ? inspected.name : 'Your memory wall'}</h2><button onClick={closeModal} aria-label="Close">Close ×</button></div>
        {inspected ? <AssetInspector key={inspected.assets[inspected.index].id} assets={inspected.assets} index={inspected.index}
          onIndex={index => setInspected({...inspected, index})} reduced={reduced}/>
          : <div className={s.wall}>{story.memories.map(m => <article key={m.id}><h3>{m.name}</h3><p>{m.message}</p>
            <div className={s.wallMedia}>{m.assets.map(a => <button key={a.id} onClick={() => setInspected({assets:m.assets,index:m.assets.indexOf(a),name:m.name})}>
              {a.kind === 'video' ? <span>▶ {a.seconds}s video</span> : <img src={a.poster || a.url} alt={a.alt} loading="lazy"/>}
            </button>)}</div>
          </article>)}</div>}
        {inspected && wall && <button onClick={() => setInspected(null)}>← All memories</button>}
      </dialog>
    </div>
  </div>
}

function AssetInspector({assets, index, onIndex, reduced}: {assets: Asset[]; index: number; onIndex: (n: number) => void; reduced: boolean}) {
  const asset = assets[index]
  const video = useRef<HTMLVideoElement>(null)
  const [animate, setAnimate] = useState(!reduced)
  return <div className={s.assetInspector}>
    {asset.kind === 'video' ? <VideoSample asset={asset} videoRef={video} speed={1} onStatus={() => {}} onEnded={() => {}}/>
      : <PreviewImage asset={asset} animated={animate}/>}
    <p>{asset.alt}</p>
    {asset.kind === 'gif' && <button onClick={() => setAnimate(v => !v)}>{animate ? 'Pause animation' : 'Play animation'}</button>}
    <div className={s.inspectNav}><button disabled={index === 0} onClick={() => onIndex(index-1)}>← Previous asset</button><span>{index+1} / {assets.length}</span><button disabled={index === assets.length-1} onClick={() => onIndex(index+1)}>Next asset →</button></div>
  </div>
}
