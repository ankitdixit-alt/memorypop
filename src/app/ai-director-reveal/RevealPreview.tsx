'use client'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getStory, buildBeats, estimateSeconds, formatDuration, mediaUrl, type Mode, type Preset, type Occasion, type Story, type Asset } from './prototype'
import { usePlayback } from './usePlayback'
import { PreviewImage, VideoSample, useReducedMotion, type VideoStatus } from './PreviewMedia'
import { DecorativeOverlay } from '../../components/DecorativeOverlay'
import { TileTransition, type TileVariant } from './TileTransition'
import { getDecorationConfig } from '../../config/decorations'
import s from './reveal.module.css'

export default function RevealPreview() {
  const [occasion, setOccasion] = useState<Occasion>('birthday')
  const [mode, setMode] = useState<Mode>('director')
  const [preset, setPreset] = useState<Preset>('same')
  const [speed, setSpeed] = useState(1)
  const [soundEnabled, setSoundEnabled] = useState(false)
  const story = useMemo(() => getStory(occasion, preset, mode), [occasion, preset, mode])
  return <main className={s.app}>
    <header className={s.header}>
      <a className={s.brand} href="/ai-director-reveal" aria-label="Restart MemoryPop preview">
        <svg viewBox="0 0 24 24" fill="currentColor" className={s.sparkles} aria-hidden="true">
          <path d="M12 2l1.6 4.4L18 8l-4.4 1.6L12 14l-1.6-4.4L6 8l4.4-1.6L12 2z" />
          <path d="M19 13l.8 2.2L22 16l-2.2.8L19 19l-.8-2.2L16 16l2.2-.8L19 13z" />
        </svg>
        MemoryPop
      </a>
      <span className={s.synthetic}>Synthetic preview · local only</span>
      <label className={s.occasion}>Occasion
        <select aria-label="Occasion" value={occasion} onChange={e => setOccasion(e.target.value as Occasion)}>
          <option value="birthday">Birthday</option><option value="retirement">Retirement</option>
          <option value="anniversary">Anniversary</option><option value="sympathy">Sympathy</option>
        </select>
      </label>
    </header>
    <div className={s.comparison}>
      <div className={s.tabs} aria-label="Reveal style">
        <button aria-pressed={mode === 'standard'} onClick={() => setMode('standard')}>Standard reveal</button>
        <button aria-pressed={mode === 'director'} onClick={() => setMode('director')}>AI Director concept <span>✦</span></button>
      </div>
      <label>Compare
        <select aria-label="Comparison preset" value={preset} onChange={e => setPreset(e.target.value as Preset)}>
          <option value="same">Same content</option><option value="tier">Full tier experience</option>
        </select>
      </label>
    </div>
    <p className={s.comparisonNote}>{preset === 'same'
      ? 'Identical memories and media in both modes. Compare the storytelling.'
      : 'Same fictional story. Standard: up to 3 photos, 1 GIF, 15s video. Premium concept: up to 10 photos, 3 GIFs, 90s video per contribution.'}</p>
    <Player key={occasion + ':' + mode + ':' + preset} story={story} mode={mode} preset={preset} speed={speed} onSpeed={setSpeed} soundEnabled={soundEnabled} onSound={setSoundEnabled}/>
  </main>
}

function Player({story, mode, preset, speed, onSpeed, soundEnabled, onSound}: {story: Story; mode: Mode; preset: Preset; speed: number; onSpeed: (speed: number) => void; soundEnabled: boolean; onSound: (enabled: boolean) => void}) {
  const beats = useMemo(() => buildBeats(story, mode), [story, mode])
  const player = usePlayback(beats, speed)
  const beat = player.beat
  const premium = mode === 'director'
  const reduced = useReducedMotion()
  const [decorations, setDecorations] = useState(true)
  const [userInteracted, setUserInteracted] = useState(false)
  const [soundError, setSoundError] = useState(false)
  const [videoStatus, setVideoStatus] = useState<VideoStatus>('ready')
  const [videoProgress, setVideoProgress] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
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
      // Check if this transition should use tiles
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
    // Ensure previous video audio stops when changing beats
    const video = videoRef.current
    if (video && !isVideo) {
      video.pause()
      video.currentTime = 0
    }
  }, [player.key, isVideo])

  // Automatic video playback: after initial interaction, play videos automatically when reveal advances to them
  useEffect(() => {
    if (!userInteracted || !isVideo || !player.running) return
    const video = videoRef.current
    if (!video || !video.paused) return

    // Small delay to allow video element to be ready
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
  // Listen to the actual media clock, never use a timeout to skip a video.
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

  // The soundbed is shared by BOTH modes and starts only after an explicit sound toggle.
  // Duck (lower volume) during video, fade in/out on state changes for smooth audio transitions.
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const shouldPlay = soundEnabled && player.running && !isClosing && !modalOpen
    const targetVolume = isVideo ? 0.03 : 0.12 // Duck to 25% during video, full volume otherwise

    // Smooth volume ramping using RAF for natural fade
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
      if (audio.paused) {
        audio.volume = 0
        void audio.play().catch(() => setSoundError(true))
        rampVolume(0, targetVolume, 800) // 800ms fade-in
      } else {
        // Smoothly adjust volume if already playing (ducking)
        if (Math.abs(audio.volume - targetVolume) > 0.01) {
          rampVolume(audio.volume, targetVolume, 400) // 400ms duck/restore
        }
      }
    } else {
      if (!audio.paused) {
        rampVolume(audio.volume, 0, 600) // 600ms fade-out
        setTimeout(() => audio.pause(), 650)
      }
    }

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId)
      audio.pause()
    }
  }, [soundEnabled, player.running, isVideo, isClosing, modalOpen])
  useEffect(() => {
    const video = videoRef.current
    const audio = audioRef.current
    return () => { video?.pause(); audio?.pause() }
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

  const finaleIndex = beats.findIndex(b => b.finale && b.introducesMessage)
  const lastMemoryIndex = beats.findIndex(b => b.memory?.id === beats[beats.length - 2]?.memory?.id)
  const currentProgress = isVideo ? videoProgress : player.progress
  const overall = isClosing ? 100 : Math.round((player.index + currentProgress) / (beats.length - 1) * 100)
  const nowPlaying = isVideo ? videoStatus === 'playing' || videoStatus === 'buffering' : player.running
  const currentMemory = beat.memory
  const assetIndex = currentMemory && beat.assets.length ? currentMemory.assets.findIndex(a => a.id === beat.assets[0].id) : -1
  const nextContribution = () => {
    const next = beats.findIndex((b,i) => i > player.index && (b.kind === 'closing' || b.memory && b.memory.id !== beat.memory?.id))
    player.go(next >= 0 ? next : beats.length - 1)
  }

  return <div className={s.player} data-mode={mode} data-preset={preset}>
    <div className={s.stageHeader}>
      <span>{premium ? 'A story for ' + story.recipient : 'Memories for ' + story.recipient}</span>
      <button onClick={openWall}>Browse memories ↗</button>
    </div>
    <section className={[s.stage, premium ? s.director : s.standard, story.occasion === 'sympathy' ? s.quiet : '', beat.finale ? s.finale : ''].join(' ')}
      aria-label={premium ? 'AI Director reveal' : 'Standard reveal'} data-beat={beat.id} data-kind={beat.kind} data-layout={beat.presentation}
      style={{'--motion-play': player.running ? 'running' : 'paused'} as React.CSSProperties}>
      {premium && decorations && !reduced && (() => {
        const decorConfig = getDecorationConfig(story.occasion, beat.finale || false)
        // Determine scene type for decoration behavior
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
      {showTileTransition && premium && !reduced && (
        <TileTransition
          variant={tileVariant}
          occasion={story.occasion}
          onComplete={() => setShowTileTransition(false)}
          isMobile={isMobile}
        />
      )}
      <div className={s.storyProgress} aria-live="polite">
        {beat.kind === 'opening' ? <span>{story.memories.length} voices. One gift.</span>
          : beat.kind === 'closing' ? <span>All {story.memories.length} memories, together.</span>
          : <><span>{currentMemory ? 'Memory ' + beat.ordinal + ' of ' + story.memories.length : 'Chapter ' + ((beat.chapterIndex ?? 0) + 1)}</span>
            {beat.chapter && <span>{beat.chapter.title}</span>}</>}
      </div>

      {beat.kind === 'opening' && <div key={player.key} className={s.opening + ' ' + s.fade}>
        <div className={s.openingCopy}><p className={s.eyebrow}>{story.occasion === 'sympathy' ? 'Shared with love' : 'Made with love'}</p>
          <h1>{story.title}</h1><p className={s.dedication}>{story.recipient?.trim()
            ? `A story for ${story.recipient}, from everyone who contributed.`
            : `A story made together, from everyone who contributed.`}</p>
          <button className={s.primary} onClick={() => { setUserInteracted(true); player.go(1, true) }}>Begin <span>→</span></button>
        </div>
        <div className={s.coverPhotos} aria-hidden="true">
          {story.memories.flatMap(m => m.assets).filter(a => a.kind === 'photo').slice(0,2).map(a => <PreviewImage key={a.id} asset={a}/>)}
        </div>
      </div>}

      {beat.kind === 'chapter' && <div key={player.key} className={s.chapterCard + ' ' + s[beat.transition]}>
        <span className={s.chapterNumber}>{String((beat.chapterIndex ?? 0) + 1).padStart(2,'0')}</span>
        <p className={s.eyebrow}>{story.occasion === 'birthday' ? 'Your story continues' :
          story.occasion === 'anniversary' ? 'The next chapter' :
          story.occasion === 'retirement' ? 'Another chapter' :
          'Continuing on'}</p><h2>{beat.chapter?.title}</h2>
        <p>{beat.chapter?.subtitle}</p><div className={s.chapterRule}/>
      </div>}

      {beat.kind === 'memory' && currentMemory && (premium
        ? <article key={currentMemory.id} className={[s.contribution, s[beat.transition], !beat.introducesMessage && beat.assets.length > 0 ? s.mediaOnly : '', !currentMemory.assets.length ? s.letterOnly : ''].join(' ')} data-memory={currentMemory.id}>
          {beat.introducesMessage && (
            <div className={s.messagePanel}>
              <p className={s.eyebrow}>{beat.finale ? 'One last thing, with love' : 'A memory from'}</p>
              <h2>{currentMemory.name}</h2>
              <blockquote data-testid="contribution-message">{currentMemory.message}</blockquote>
              <div className={s.signature}>— {currentMemory.name}<span aria-hidden="true">{beat.finale ? '♡' : '—'}</span></div>
              <p className={s.assetCount}>{currentMemory.assets.filter(a => a.kind === 'photo').length > 0 && currentMemory.assets.filter(a => a.kind === 'photo').length + ' photos · '}A part of your story</p>
            </div>
          )}
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
        <p className={s.eyebrow}>{story.occasion === 'sympathy' ? 'Held in memory' : 'With love'}</p>
        <h2>{story.occasion === 'birthday' ? `Happy birthday${story.recipient?.trim() ? ', ' + story.recipient.trim() : ''}.` :
          story.occasion === 'anniversary' ? (story.recipient?.trim() ? `${story.recipient.trim()}, here's to many more years together.` : `Here's to many more years together.`) :
          story.occasion === 'retirement' ? `Thank you for everything${story.recipient?.trim() ? ', ' + story.recipient.trim() : ''}.` :
          story.occasion === 'sympathy' ? `These memories are here for you.` :
          `Thank you for being part of this story.`}</h2>
        <p>{story.occasion === 'sympathy'
          ? `From everyone who contributed.`
          : `From everyone who helped make this — ${story.memories.length} contributions, ready to revisit whenever you like.`}</p>
        <div className={s.endActions}><button className={s.primary} onClick={() => player.go(0, true)}>Replay reveal ↻</button><button onClick={openWall}>Visit memory wall ↗</button></div>
      </div>}
    </section>

    <div className={s.transport} aria-label="Playback controls">
      <div className={s.track} role="progressbar" aria-label="Reveal progress" aria-valuenow={overall} aria-valuemin={0} aria-valuemax={100}><span style={{width: overall + '%'}}/></div>
      <div className={s.controlRow}>
        <div className={s.navButtons}>
          <button aria-label="Restart reveal" onClick={player.restart}>↻</button>
          <button aria-label="Previous scene" disabled={player.index === 0} onClick={() => { setUserInteracted(true); player.previous() }}>←</button>
          <button className={s.playButton} disabled={isClosing} onClick={toggle}>{nowPlaying ? 'Ⅱ Pause' : isVideo ? '▶ Play video' : '▶ Play'}</button>
          <button aria-label="Next scene" disabled={isClosing} onClick={() => { setUserInteracted(true); player.next() }}>→</button>
          {isVideo && <button onClick={nextContribution}>Next memory</button>}
        </div>
        <div className={s.settings}>
          <button aria-pressed={soundEnabled} onClick={() => { setSoundError(false); onSound(!soundEnabled) }}>Sound {soundEnabled ? 'on' : 'off'}</button>
          <label>Speed <select aria-label="Playback speed" value={speed} onChange={e => onSpeed(Number(e.target.value))}>
            <option value={0.75}>0.75×</option><option value={1}>1× · intended</option><option value={1.5}>1.5× · preview</option><option value={2}>2× · preview</option>
          </select></label>
        </div>
      </div>
      <div className={s.playbackNote}><span>{isVideo ? videoStatus === 'buffering' ? 'Buffering — the reveal is waiting.' : 'Video uses its own playback clock. Speed also applies to video.' : isClosing ? 'Your memory wall is ready.' : speed === 1 ? 'Take your time. Pause whenever you like.' : 'Preview speed — use 1× to judge the intended experience.'}</span>
        <span>About {formatDuration(estimateSeconds(beats, speed))} at {speed}×, excluding pauses</span></div>
      {soundError && <p role="status">The optional sample soundbed could not play. The reveal still works with sound off.</p>}
    </div>

    <details className={s.inspector}>
      <summary>Developer inspector</summary>
      <div className={s.inspectorBody}>
        <p><strong>Local concept, deterministic fixtures.</strong> No live AI generation, Supabase or production memories. Premium Studio is still unapproved.</p>
        <p>Scene {player.index + 1} of {beats.length} · {beat.id} · {beat.transition} · {beat.presentation || beat.kind} · {Math.round(beat.durationMs / speed)}ms nominal hold</p>
        <p>Standard uses the exported dev baseline: newest-first, one message scene, then individual media scenes; 200ms/word (minimum 3s), 2.5s photos, 3s GIFs. Its existing captions are preserved. This is not verified parity with the absent production player. Both modes share playback, asset inspection, sound and closing actions.</p>
        <p>Premium uses hand-authored fixture chapters, one continuous message per contribution, a hero plus groups of up to three photos, and a relocated finale. Photo grouping is deterministic. These choices are not new Gemini results.</p>
        <p>Media are local synthetic portraits, illustrated test images, animated motifs, and generated video/audio playback samples. They test the mechanics; they are not a realistic emotional video message. Sound is a quiet synthetic test bed, not the production soundtrack. There is no video export or upload feature.</p>
        {preset === 'tier' && <p>The birthday contribution from Sarah demonstrates 10 photos + 3 GIFs + 90 seconds in Premium; Standard receives the explicit 3 / 1 / 15 sample variant. This preset changes media quantity, so use Same content to compare presentation fairly.</p>}
        <div className={s.inspectorActions}>
          <button onClick={() => player.go(finaleIndex >= 0 ? finaleIndex : lastMemoryIndex, false)}>{premium ? 'Jump to finale' : 'Jump to last memory'}</button>
          <label>Go to contribution <select aria-label="Go to contribution" value={beat.memory?.id || ''} onChange={e => {
            const index = beats.findIndex(b => b.memory?.id === e.target.value); if (index >= 0) player.go(index, false)
          }}><option value="">Choose a memory</option>{story.memories.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select></label>
          {premium && story.occasion !== 'sympathy' && <label><input type="checkbox" checked={decorations} onChange={e => setDecorations(e.target.checked)}/> Subtle decorative motif</label>}
        </div>
        {reduced && <p>Reduced motion active: transitions disabled; animated GIFs use their still poster. Inspect a GIF to play it explicitly.</p>}
        <a href="/ai-director-preview">Open existing experiment evidence view ↗</a>
      </div>
    </details>
    <audio ref={audioRef} src={mediaUrl('ambient.wav')} loop preload="none" aria-hidden="true"/>

    <dialog ref={dialogRef} className={s.dialog} onCancel={closeModal} onClose={closeModal}>
      <div className={s.dialogHeader}><h2>{inspected ? inspected.name : 'Your memory wall'}</h2><button onClick={closeModal} aria-label="Close memory browser">Close ×</button></div>
      <p className={s.modalNote}>Synthetic memories · reveal paused while you browse</p>
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
