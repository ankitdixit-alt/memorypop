'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { Beat } from './prototype'

/** One timer owner. Remaining reading time survives pause and preview speed changes. */
export function usePlayback(beats: Beat[], speed: number) {
  const [state, setState] = useState({ index: 0, epoch: 0, running: false })
  const beat = beats[state.index]
  const key = state.index + ':' + state.epoch
  const clock = useRef({ key: '', remaining: 0 })
  const [progress, setProgress] = useState(0)
  const next = useCallback(() => {
    setState(s => s.index !== state.index || s.epoch !== state.epoch ? s : {
      ...s, index: Math.min(s.index + 1, beats.length - 1), epoch: s.epoch + 1,
      running: s.index + 1 < beats.length - 1 && s.running,
    })
  }, [state.index, state.epoch, beats.length])

  const completeVideo = useCallback(() => {
    setState(s => s.index !== state.index || s.epoch !== state.epoch ? s : {
      index: Math.min(s.index + 1, beats.length - 1), epoch: s.epoch + 1,
      running: s.index + 1 < beats.length - 1,
    })
  }, [state.index, state.epoch, beats.length])

  useEffect(() => {
    if (clock.current.key !== key) {
      clock.current = { key, remaining: beat.durationMs }
      setProgress(0)
    }
    if (!state.running || !beat.durationMs) return
    const start = performance.now()
    const remainingAtStart = clock.current.remaining
    const timer = setTimeout(next, remainingAtStart / speed)
    const tick = setInterval(() => setProgress(Math.min(1,
      (beat.durationMs - remainingAtStart + (performance.now() - start) * speed) / beat.durationMs)), 100)
    return () => {
      clearTimeout(timer)
      clearInterval(tick)
      clock.current.remaining = Math.max(0, remainingAtStart - (performance.now() - start) * speed)
    }
  }, [key, state.running, beat.durationMs, speed, next])

  const setRunning = useCallback((running: boolean) => setState(s => ({ ...s, running })), [])
  const go = useCallback((index: number, running?: boolean) => setState(s => ({
    index: Math.max(0, Math.min(beats.length - 1, index)), epoch: s.epoch + 1,
    running: running ?? s.running,
  })), [beats.length])
  return { ...state, key, beat, progress, next, completeVideo, go, setRunning,
    previous: () => go(state.index - 1), restart: () => go(0, false) }
}
