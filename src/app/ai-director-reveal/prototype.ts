/** Local presentation model. No database types, validation proofs, AI providers or user inputs. */
import { MEMORYPOP_PLUS } from '../../config/plus'
import { syntheticMemories } from '../../../scripts/fixtures/premiumRevealFixture'
import { syntheticFarewellMemories } from '../../../scripts/fixtures/farewellFixture'
import { syntheticAnniversaryMemories } from '../../../scripts/fixtures/anniversaryFixture'
import { syntheticSympathyMemories } from '../../../scripts/fixtures/sympathyFixture'

export type Occasion = 'birthday' | 'retirement' | 'anniversary' | 'sympathy'
export type Mode = 'standard' | 'director'
export type Preset = 'same' | 'tier'
export type Asset = { id: string; url: string; poster?: string; kind: 'photo' | 'gif' | 'video'; alt: string; seconds?: number }
export type Contribution = { id: string; name: string; message: string; createdAt: number; assets: Asset[] }
export type Chapter = { title: string; subtitle: string; ids: string[] }
export type Story = { recipient: string; title: string; occasion: Occasion; chapters: Chapter[]; finale: string; highlights: string[]; memories: Contribution[] }
export type Transition = 'fade' | 'slide' | 'slideLeft' | 'slideRight' | 'crossfade' | 'zoom' | 'chapter' | 'chapterEnhanced' | 'finale' | 'closing' | 'tile' | 'tileFadeOut' | 'tileSlideOut' | 'tileDissolve' | 'tileFlipOut' | 'tileChapterReveal' | 'tileFinale'

export type Beat = {
  id: string; kind: 'opening' | 'chapter' | 'memory' | 'closing';
  chapter?: Chapter; chapterIndex?: number; memory?: Contribution; ordinal?: number;
  assets: Asset[]; presentation?: 'letter' | 'paired' | 'collection' | 'video';
  introducesMessage?: boolean; finale?: boolean; highlight?: boolean;
  durationMs: number; transition: Transition;
}
export const mediaUrl = (name: string) => '/ai-director-reveal/media/' + name

// Explicit fixture annotations, NOT new AI outputs or edits to historical experiment results.
const definitions = {
  birthday: {
    recipient: 'Emma', title: 'Thirty years. So many stories.', source: syntheticMemories,
    finale: 'mem_002', highlights: ['mem_009'],
    chapters: [
      { title: 'The good kind of chaos', subtitle: 'Inside jokes. Unforgettable adventures.', ids: ['mem_001','mem_003','mem_006','mem_008','mem_014'] },
      { title: 'Growing up together', subtitle: 'From the playground to the people you are today.', ids: ['mem_004','mem_009','mem_011','mem_005','mem_013'] },
      { title: 'Always in your corner', subtitle: 'A little love from home.', ids: ['mem_007','mem_015','mem_012','mem_010','mem_002'] },
    ],
  },
  retirement: {
    recipient: 'Michael', title: 'What you leave with us.', source: syntheticFarewellMemories,
    finale: 'mem_f12', highlights: ['mem_f10'],
    chapters: [
      { title: 'The difference you made', subtitle: 'Leadership remembered in people’s own words.', ids: ['mem_f04','mem_f01','mem_f06','mem_f08'] },
      { title: 'Beyond the job title', subtitle: 'Late nights, shared jokes, and friendship.', ids: ['mem_f02','mem_f03','mem_f05','mem_f07','mem_f09','mem_f11'] },
      { title: 'What stays with us', subtitle: 'Thank you, from all of us.', ids: ['mem_f10','mem_f12'] },
    ],
  },
  anniversary: {
    recipient: 'Alex & Jordan', title: 'A decade of choosing each other.', source: syntheticAnniversaryMemories,
    finale: 'mem_a10', highlights: ['mem_a09'],
    chapters: [
      { title: 'Everyone knew', subtitle: 'The beginnings, remembered with a smile.', ids: ['mem_a01','mem_a04'] },
      { title: 'A life, together', subtitle: 'The little things that add up to love.', ids: ['mem_a02','mem_a09','mem_a06','mem_a07','mem_a08'] },
      { title: 'Love, from your people', subtitle: 'A family celebrating with you.', ids: ['mem_a05','mem_a03','mem_a10'] },
    ],
  },
  sympathy: {
    recipient: 'The Martinez Family', title: 'Remembering Elena.', source: syntheticSympathyMemories,
    finale: 'mem_s08', highlights: [],
    chapters: [
      { title: 'A life that touched others', subtitle: 'Memories shared by her community.', ids: ['mem_s05','mem_s03','mem_s02'] },
      { title: 'Time we shared', subtitle: 'Small moments, lovingly remembered.', ids: ['mem_s01','mem_s06','mem_s04'] },
      { title: 'Here with you', subtitle: 'Words of comfort for her family.', ids: ['mem_s07','mem_s08'] },
    ],
  },
}

export function getStory(occasion: Occasion, preset: Preset, mode: Mode): Story {
  const d = definitions[occasion]
  const limits = preset === 'tier' && mode === 'director' ? MEMORYPOP_PLUS.plus : MEMORYPOP_PLUS.standard
  const memories = d.source.map((m, index): Contribution => {
    // Birthday hero exercises every Premium limit; other contributions retain varied sizes.
    const hero = occasion === 'birthday' && m.id === 'mem_001'
    const photoCount = Math.min(hero ? 10 : m.photoCount, limits.photos)
    const gifCount = Math.min(hero ? 3 : m.gifCount, limits.gifs)
    const duration = hero ? limits.videoSeconds : m.videoDuration ? Math.min(m.videoDuration, limits.videoSeconds) : 0
    const imageNumbers = occasion === 'sympathy' ? [1,2,3,4,5,7,8,9,10] : [1,2,3,4,5,6,7,8,9,10]
    const assets: Asset[] = Array.from({ length: photoCount }, (_, i) => {
      const number = imageNumbers[(index + i) % imageNumbers.length]
      return {
        id: m.id + ':photo:' + i, kind: 'photo',
        url: mediaUrl('photo-' + String(number).padStart(2, '0') + (number <= 4 ? '.png' : '.svg')),
        alt: 'Fictional memory image ' + (i + 1) + ', shared by ' + m.contributorName,
      }
    })
    for (let i = 0; i < gifCount; i++) assets.push({
      id: m.id + ':gif:' + i, kind: 'gif', url: mediaUrl('celebrate-' + (i + 1) + '.gif'),
      poster: mediaUrl('celebrate-' + (i + 1) + '.png'), alt: 'Animated celebration ' + (i + 1) + ' from ' + m.contributorName,
    })
    if (duration) assets.push({
      id: m.id + ':video', kind: 'video', url: mediaUrl('sample-' + duration + '.mp4'),
      alt: 'Synthetic playback sample for ' + m.contributorName, seconds: duration,
    })
    return { id: m.id, name: m.contributorName, message: m.message, createdAt: m.createdAt.getTime(), assets }
  })
  return { recipient: d.recipient, title: d.title, occasion, chapters: d.chapters, finale: d.finale, highlights: d.highlights, memories }
}

export function readingMs(message: string) {
  const words = message.trim().split(/\s+/).filter(Boolean).length
  // Longer messages get more time: 300ms/word for short, 250ms/word for long
  const timePerWord = words > 50 ? 250 : 300
  return Math.max(3500, words * timePerWord + 1000)
}

// Hero first, then pairs/triptychs. Each photo is scheduled once and remains inspectable.
export function groupPhotos(assets: Asset[]): Asset[][] {
  if (!assets.length) return []
  if (assets.length <= 3) return [assets]
  const groups = [assets.slice(0, 1)]
  for (let i = 1; i < assets.length; i += 3) groups.push(assets.slice(i, i + 3))
  return groups
}

/** Select cinematic transition based on context */
function selectTransition(ctx: {
  mode: Mode
  occasion: Occasion
  isFirstInChapter: boolean
  isChapter: boolean
  isFinale: boolean
  isHighlight: boolean
  hasVideo: boolean
  hasMultiplePhotos: boolean
  groupIndex: number
  ordinal: number
}): Transition {
  if (ctx.mode === 'standard') return 'fade'

  // Sympathy uses gentle, respectful transitions
  if (ctx.occasion === 'sympathy') {
    if (ctx.isFinale) return 'tileFinale'
    if (ctx.isChapter) return 'fade'
    return 'fade' // No tile effects for sympathy except finale
  }

  // Chapter cards get tile-based chapter reveal
  if (ctx.isChapter) {
    return 'tileChapterReveal'
  }

  // Finale gets special cascade effect
  if (ctx.isFinale) {
    return ctx.groupIndex === 0 ? 'tileFinale' : 'fade'
  }

  // Highlights get dissolve emphasis
  if (ctx.isHighlight && ctx.groupIndex === 0) {
    return 'tileDissolve'
  }

  // Video moments get crossfade (no tiles to avoid interruption)
  if (ctx.hasVideo) {
    return 'crossfade'
  }

  // Subsequent groups within same memory use gentle fade
  if (ctx.groupIndex > 0) {
    return 'fade'
  }

  // Occasion-specific tile transitions for first beat of each memory
  switch (ctx.occasion) {
    case 'birthday':
      // Playful, energetic
      if (ctx.isFirstInChapter) return 'tileFlipOut'
      return ctx.ordinal % 2 === 0 ? 'tileSlideOut' : 'tileFlipOut'

    case 'anniversary':
      // Elegant, romantic
      if (ctx.isFirstInChapter) return 'tileFadeOut'
      return ctx.ordinal % 2 === 0 ? 'tileFadeOut' : 'tileDissolve'

    case 'retirement':
      // Warm, confident
      if (ctx.isFirstInChapter) return 'tileSlideOut'
      return ctx.ordinal % 2 === 0 ? 'tileSlideOut' : 'tileFadeOut'

    default:
      return 'tileFadeOut'
  }
}

export function buildBeats(story: Story, mode: Mode): Beat[] {
  const beats: Beat[] = []
  const byId = new Map(story.memories.map(m => [m.id, m]))
  if (byId.size !== story.memories.length) throw new Error('Duplicate contribution IDs in synthetic fixture')
  if (!story.memories.length) return [{ id: 'closing', kind: 'closing', assets: [], durationMs: 0, transition: 'closing' }]
  const chapters = story.chapters.map(c => ({ ...c, ids: c.ids.filter(id => id !== story.finale) }))
  const assigned = new Set<string>()
  // Normalize overlapping IDs, preserve unassigned contributions, relocate the finale once.
  for (const chapter of chapters) chapter.ids = chapter.ids.filter(id => {
    if (!byId.has(id) || assigned.has(id)) return false
    assigned.add(id); return true
  })
  if (!chapters.length) chapters.push({ title: 'Your memories', subtitle: '', ids: [] })
  for (const m of story.memories) if (!assigned.has(m.id) && m.id !== story.finale) chapters[chapters.length - 1].ids.push(m.id)
  if (byId.has(story.finale)) chapters[chapters.length - 1].ids.push(story.finale)
  const sequence = mode === 'director'
    ? chapters.filter(c => c.ids.length)
    : [{ title: '', subtitle: '', ids: [...story.memories].sort((a,b) => b.createdAt - a.createdAt).map(m => m.id) }]
  if (mode === 'director') beats.push({ id: 'opening', kind: 'opening', assets: [], durationMs: 3400, transition: 'fade' })
  let ordinal = 0
  sequence.forEach((chapter, chapterIndex) => {
    if (mode === 'director') beats.push({
      id: 'chapter:' + chapterIndex, kind: 'chapter', chapter, chapterIndex, assets: [], durationMs: 2200,
      transition: selectTransition({ mode, occasion: story.occasion, isFirstInChapter: false, isChapter: true, isFinale: false, isHighlight: false, hasVideo: false, hasMultiplePhotos: false, groupIndex: 0, ordinal: chapterIndex })
    })
    for (let memIdx = 0; memIdx < chapter.ids.length; memIdx++) {
      const id = chapter.ids[memIdx]
      const memory = byId.get(id)!
      ordinal++
      const isFirstInChapter = memIdx === 0
      const photos = memory.assets.filter(a => a.kind === 'photo')
      const rest = memory.assets.filter(a => a.kind !== 'photo').map(a => [a])
      const groups: Asset[][] = mode === 'director'
        ? [...groupPhotos(photos), ...rest]
        : [[], ...photos.map(a => [a]), ...rest]
      if (!groups.length) groups.push([])
      const finale = mode === 'director' && id === story.finale
      const highlight = mode === 'director' && story.highlights.includes(id)
      groups.forEach((assets, groupIndex) => {
        const video = assets[0]?.kind === 'video'
        // Read video-only contributions before speech starts.
        if (groupIndex === 0 && video) beats.push({
          id: id + ':letter', kind: 'memory', memory, ordinal, chapter, chapterIndex, assets: [], presentation: 'letter',
          introducesMessage: true, finale, highlight, durationMs: readingMs(memory.message),
          transition: selectTransition({ mode, occasion: story.occasion, isFirstInChapter, isChapter: false, isFinale: finale, isHighlight: highlight, hasVideo: video, hasMultiplePhotos: false, groupIndex: 0, ordinal }),
        })
        const introducesMessage = groupIndex === 0 && !video
        const base = introducesMessage
          ? mode === 'director' ? readingMs(memory.message) : Math.max(3000, memory.message.split(/\s+/).length * 200)
          : assets[0]?.kind === 'gif' ? 2400 : assets.length > 1 ? 2800 : 1800 // Faster media-only scenes
        beats.push({
          id: id + ':group:' + groupIndex, kind: 'memory', memory, ordinal,
          chapter: mode === 'director' ? chapter : undefined, chapterIndex: mode === 'director' ? chapterIndex : undefined,
          assets, introducesMessage, finale, highlight,
          presentation: video ? 'video' : !assets.length ? 'letter' : assets.length > 1 ? 'collection' : 'paired',
          durationMs: video ? 0 : mode === 'director' ? base + (finale && introducesMessage ? 1000 : 0) : introducesMessage ? base : assets[0]?.kind === 'gif' ? 2400 : 1800, // Match base calculation
          transition: selectTransition({ mode, occasion: story.occasion, isFirstInChapter, isChapter: false, isFinale: finale, isHighlight: highlight, hasVideo: video, hasMultiplePhotos: assets.length > 1, groupIndex, ordinal }),
        })
      })
    }
  })
  beats.push({ id: 'closing', kind: 'closing', assets: [], durationMs: 0, transition: 'closing' })
  return beats
}

export function estimateSeconds(beats: Beat[], speed: number) {
  return Math.ceil(beats.reduce((sum, b) => sum + (b.presentation === 'video' ? (b.assets[0].seconds || 0) * 1000 : b.durationMs), 0) / 1000 / speed)
}
export function formatDuration(seconds: number) { return Math.floor(seconds / 60) + ':' + String(seconds % 60).padStart(2, '0') }
