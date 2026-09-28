'use client'
import { useMemo, useState } from 'react'
import { getStory, type Mode, type Preset, type Occasion, type Story } from './prototype'
import { RevealPlayer } from './RevealPlayer'
import s from './reveal.module.css'

export default function RevealPreview({ storyOverride, modeOverride, presetOverride }: { storyOverride?: Story; modeOverride?: Mode; presetOverride?: Preset } = {}) {
  const [occasion, setOccasion] = useState<Occasion>('birthday')
  const [mode, setMode] = useState<Mode>(modeOverride || 'director')
  const [preset, setPreset] = useState<Preset>(presetOverride || 'same')
  const [speed, setSpeed] = useState(1)
  const [soundEnabled, setSoundEnabled] = useState(false)
  const story = useMemo(() => storyOverride || getStory(occasion, preset, mode), [storyOverride, occasion, preset, mode])
  const isComparison = !!storyOverride
  return <main className={s.app}>
    {!isComparison && <header className={s.header}>
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
    </header>}
    <RevealPlayer
      key={occasion + ':' + mode + ':' + preset}
      story={story}
      mode={mode}
      preset={preset}
      speed={speed}
      onSpeed={setSpeed}
      soundEnabled={soundEnabled}
      onSound={setSoundEnabled}
      showSpeedSelector={true}
    />
  </main>
}
