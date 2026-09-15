'use client'
import { useEffect, useRef, useState, type RefObject } from 'react'
import type { Asset } from './prototype'
import s from './reveal.module.css'

export type VideoStatus = 'ready' | 'playing' | 'paused' | 'buffering' | 'error'
export function VideoSample({asset, videoRef, speed, onStatus, onEnded}: {
  asset: Asset; videoRef: RefObject<HTMLVideoElement | null>; speed: number;
  onStatus: (status: VideoStatus) => void; onEnded: () => void;
}) {
  const [error, setError] = useState(false)
  const ended = useRef(false)
  const active = useRef(true)
  useEffect(() => {
    const video = videoRef.current
    if (video) video.playbackRate = speed
  }, [speed, videoRef])
  useEffect(() => {
    const video = videoRef.current
    active.current = true
    // React Strict Mode replays effect setup/cleanup in development. Restore a released source.
    if (video && !video.getAttribute('src')) { video.src = asset.url; video.load() }
    return () => {
      active.current = false
      if (video) {
        video.pause()
        video.currentTime = 0 // Reset playhead
        video.removeAttribute('src')
        video.load() // Flush and stop audio
      }
    }
  }, [videoRef, asset.url])
  return <div className={s.videoWrap}>
    <video ref={videoRef} src={asset.url} controls playsInline preload="metadata"
      aria-label={asset.alt}
      onPlay={() => { if (active.current) onStatus('playing') }} onPlaying={() => { if (active.current) onStatus('playing') }}
      onPause={() => { if (active.current && !ended.current) onStatus('paused') }}
      onWaiting={() => { if (active.current) onStatus('buffering') }} onStalled={() => { if (active.current) onStatus('buffering') }}
      onError={() => { if (active.current) { setError(true); onStatus('error') } }}
      onEnded={() => { if (active.current && !ended.current) { ended.current = true; onEnded() } }} />
    {error ? <p role="alert">This sample could not load. You can move to the next memory.</p>
      : <p className={s.mediaNote}>Synthetic playback sample · {asset.seconds} seconds · press play to hear it</p>}
  </div>
}

export function PreviewImage({asset, animated = true, onInspect}: {
  asset: Asset; animated?: boolean; onInspect?: () => void;
}) {
  const [failed, setFailed] = useState(false)
  const content = failed
    ? <span className={s.unavailable}>Image unavailable<br/><small>{asset.alt}</small></span>
    : <img src={asset.kind === 'gif' && !animated ? asset.poster : asset.url} alt={asset.alt} onError={() => setFailed(true)} draggable={false}/>
  return onInspect
    ? <button type="button" className={s.photo} onClick={onInspect} aria-label={'Inspect ' + asset.alt}>{content}</button>
    : <div className={s.photo}>{content}</div>
}

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const query = matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(query.matches)
    update(); query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  return reduced
}
