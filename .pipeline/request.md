# Feature Request: Premium Directed Reveal Prototype

**Date:** 2026-07-28
**Requestor:** Founder
**Type:** Strategic Product Pivot - Premium Redefinition

---

## Raw Request

Transform Premium from "prettier UI with better spacing and animations" into a "beautifully directed recipient reveal experience" - a guided emotional journey that presents memories as an intentional story rather than a browsable collection.

---

## Problem Statement

**Current Premium Position:**
- Premium perceived as decorative improvements
- Better shadows, larger spacing, richer borders
- Essentially "a prettier version of the same page"
- No compelling value differentiation from Standard
- Visual polish doesn't justify price premium

**Core Issue:**
Premium is positioned as surface-level aesthetics rather than fundamental experience transformation.

---

## Product Vision

### Standard Experience
The recipient explores memories freely:
- Browse messages in any order
- View photos
- Watch videos
- React
- Return later
- Self-directed exploration

**Positioning:** "Here are your memories."

### Premium Experience
The recipient experiences a guided, directed reveal:
- 60-90 second cinematic journey
- Intentional pacing and emotional arc
- Music supporting the story
- Chapter-based narrative structure
- Deliberate climax and resolution
- Transitions into full browsable gallery

**Positioning:** "We created a story for you."

---

## Strategic Product Principle

**DO NOT think of Premium as:**
- A page with animations
- Better visual decoration
- Prettier cards
- Enhanced shadows

**THINK of Premium as:**
- A presentation engine
- A reveal director
- An emotional story architect
- A cinematic experience layer

The system decides:
- What appears first
- How long each memory stays visible
- When pace accelerates or slows
- When music changes intensity
- Where emotional climax occurs
- How the experience closes

**Value hierarchy:**
1. Emotion first
2. Story second
3. Technology third

---

## Prototype Scope

### Build ONE focused prototype:
**Emma's 30th Birthday**

### DO build:
- Complete 60-90 second guided reveal
- 7 chapter narrative structure
- Music integration with audio ducking
- Video memory integration
- Playback controls (pause, skip, mute, replay)
- Transition from reveal → browsable gallery
- Mobile-first responsive experience
- Accessibility support (reduced-motion, captions, keyboard)
- Realistic demo assets (no placeholders)
- Analytics instrumentation
- Extensible Reveal Engine architecture

### DO NOT build:
- Checkout or payment flow
- Subscription logic
- Entitlement system
- Multiple occasions
- Creator editing suite
- Theme marketplace
- Pricing pages
- Production music licensing
- Multiple reveal variants

### Goal:
Answer ONE question: **Does a guided reveal feel materially more special than Standard MemoryPop?**

---

## Prototype Story Structure

### Chapter 1: Invitation (5-8 seconds)
- First screen with no autoplay sound
- "You've been invited to experience Emma's 30th Birthday MemoryPop"
- Primary action: "Start the reveal" (initializes audio, complies with browser rules)
- Creates anticipation

### Chapter 2: The Celebration Begins (8-12 seconds)
- Emma's cover photo
- Scale reveal: "42 people came together to make this for Emma"
- Contributor avatars
- Opening music begins
- Calm title reveal
- Statistics support story, don't dominate

### Chapter 3: Joyful Memories (15-20 seconds)
- Increase energy
- Friendship photos
- Travel memories
- Funny messages
- Playful moments
- Quick transitions
- Slightly faster pacing
- Should feel alive and joyful

### Chapter 4: Voices (10-15 seconds)
- Introduce contributor video memories
- One best-friend video message
- One family video/voice-led moment
- Audio ducking (background music lowers)
- Captions/transcript support
- Video becomes the focus
- No simultaneous videos

### Chapter 5: Family and Heart (12-18 seconds)
- Slow the experience down
- Emma with father
- Emma with sister
- Heartfelt messages
- Spacious layouts
- Calmer transitions
- Reduced visual density
- Emotional contrast with joyful section

### Chapter 6: Emotional Climax (10-15 seconds)
- Most powerful moment
- One hero message or video
- Minimal UI
- No visual clutter
- Slower pacing
- Music reaching emotional peak, then softening
- Key line: "42 people wanted to remind you how loved you are"
- Goal: intimacy, not theatrical drama
- Visitor thinks: "I want to make someone feel like this"

### Chapter 7: Closing (6-10 seconds)
- Close warmly
- Final collective message
- Emma's reaction
- Gentle music ending
- Sense of completion
- Transition: "Explore the full MemoryPop"
- Dissolve into browsable Standard experience

**CRITICAL:** Premium adds directed reveal, doesn't replace access to complete memories.

---

## Required Realistic Media Assets

### Current Problem:
Demo contains empty gradients, camera icons, initials, placeholder reactions. These cannot remain.

### Required Coherent Asset Set:
All assets must feel like they belong to one real celebration.

**Photos (8-10 required):**
1. Emma's cover photo
2. Emma and Maya (friendship)
3. Emma and Sarah (family)
4. Emma with father
5. Portland/travel memory
6. Workplace memory
7. Birthday group photo
8. Candid celebration photo
9. Recipient reaction image

**Videos (2 required):**
1. Best-friend video message (10-15 seconds)
2. Family video or voice-led message (10-15 seconds)

**Optional:**
- Short looping memory clip

**Requirements:**
- All assets feel cohesive (same person, family, friend group)
- Not visibly unrelated stock imagery
- Visitor believes these belong to one real celebration
- Proper dimensions, aspect ratios, compression
- Clear ownership and licensing
- Fallback strategy if asset unavailable

---

## Music Strategy

### Constraints:
- No unrequested autoplay with sound
- First user interaction initializes audio
- Browser autoplay compliance

### Prototype Approach:
- ONE approved royalty-free or owned music track
- Design experience around single track with clear emotional phases
- Fade in gently
- Raise intensity during joyful montage
- Duck during contributor videos
- Reduce intensity during emotional climax
- End with soft reverb or fade

### DO NOT:
- Integrate Spotify
- Use arbitrary third-party music
- Build production licensing infrastructure

### Future Direction:
May support curated Mood Packs:
- Warm
- Joyful
- Nostalgic
- Hopeful
- Reflective
- Celebratory

---

## Playback Controls

Recipient must remain in control.

**Required Controls:**
- Start
- Pause
- Resume
- Mute / Unmute
- Skip forward
- Skip chapter
- Replay
- Exit reveal
- Explore all memories

**Design Principles:**
- Visually quiet but accessible
- Don't hide essential controls
- Don't force user to watch entire reveal
- Controls present without dominating

---

## Video Treatment

**Requirements:**
- playsInline attribute
- Captions or transcript
- Visible pause and mute controls
- Background music ducks during speech
- Graceful fallback if video fails
- Preload metadata only
- Maximum one active video at a time
- Mobile-safe dimensions and compression

**Goal:**
Video should feel like a memory, not an embedded media player. Avoid heavy browser chrome.

---

## Transition and Motion Direction

### Use motion to direct attention and emotion.

**Appropriate Techniques:**
- Gentle cross-dissolves
- Subtle 1.00 to 1.04 micro-zoom
- Controlled fades
- Clip-path text reveals
- Layout morphs
- Soft directional movement
- Staggered media reveals
- Smooth reveal → gallery transition

**Avoid:**
- Excessive particles
- Fake 3D page turns
- Aggressive zooms
- Random wipes
- Bouncing UI
- Heavy blur layers
- Decorative animation without purpose

**Test:** Every transition must answer: "What emotional or narrative purpose does this serve?"

If no purpose, remove it.

---

## Pacing

**Target Total Duration:** 60-90 seconds

**Suggested Breakdown:**
- Invitation: 5-8 seconds
- Opening: 8-12 seconds
- Joyful memories: 15-20 seconds
- Voices: 10-15 seconds
- Family and heart: 12-18 seconds
- Emotional climax: 10-15 seconds
- Closing: 6-10 seconds

**Principles:**
- Don't cut strictly on every beat
- Use musical phrases
- Allow emotional pauses
- Create contrast
- Text must remain visible long enough to read comfortably

---

## Accessibility Requirements

**Must Support:**
- prefers-reduced-motion (preserve story, remove non-essential animation)
- Keyboard navigation
- Captions/transcript for video
- Visible focus states
- Pause and mute controls
- Sufficient contrast
- Screen-reader labels
- No essential information through motion alone
- Static fallback presentation if reveal can't run
- Mobile-friendly touch targets

---

## Mobile and Performance

**Primary Device Target:** Phones

**Required Techniques:**
- 100dvh (not 100vh)
- Hardware-accelerated transforms
- Opacity and transform-based animation
- Image preloading (two scenes ahead)
- Responsive media
- Compressed images and video
- One active video at a time
- Unmount distant scenes
- Graceful fallback for slow networks

**Avoid:**
- Large uncompressed images
- Multiple simultaneous video decoders
- Heavy real-time blur
- Excessive DOM layers
- WebGL unless proven necessary

**Performance Budget Targets:**
- Initial load
- First interaction latency
- Dropped frames
- Memory usage
- Mobile Safari stability
- Lighthouse performance score

---

## Technical Architecture: Reveal Engine

Design an **extensible Reveal Engine** supporting:

### Core Concepts:
```
Reveal
  → Chapters
    → Scenes
      → Media + Copy + Timing + Transition + Audio behavior
```

### Scene Definitions:
- Scene type
- Scene duration
- Media asset reference
- Message content
- Contributor metadata
- Transition type
- Audio behavior (music volume, ducking)
- Reduced-motion alternative
- Analytics hooks

### Architecture Principles:
- Same underlying MemoryPop data powers both Standard and Premium
- Reveal interprets memories differently (doesn't duplicate data)
- Extensible for future occasions and moods
- Clean separation: data model → reveal engine → presentation

### Future Extensibility:
- Multiple occasion variants
- Multiple mood variants
- Creator customization
- Theme system
- Music packs

---

## Analytics Events

**Track:**
- reveal_page_viewed
- reveal_started
- audio_enabled
- chapter_viewed (with chapter_name)
- video_played
- video_completed
- reveal_paused
- reveal_skipped
- reveal_muted
- reveal_completed
- explore_full_memorypop_clicked
- create_cta_clicked
- replay_clicked
- exit_reveal_clicked

**DO NOT track:**
- Sensitive message content
- Personal media details

**Goal: Answer:**
- Do people start the reveal?
- Where do they stop?
- Which chapter loses attention?
- Do they watch the video?
- Do they finish?
- Does reveal increase creation intent?
- Do they explore full MemoryPop afterward?

---

## Product Positioning

### DO NOT describe Premium as:
- More animations
- Better spacing
- More polished cards
- More effects

### Position Premium as:
"A beautifully directed reveal"

**Internal Working Name:**
Reveal Engine

**User-Facing Phrasing:**
"Experience the celebration as a guided reveal"

Keep public wording simple. Don't invent large marketing labels yet.

---

## Deliverables Before Coding

Please provide:

1. **Product Owner recommendation** - Build now vs defer vs reject
2. **Standard vs Premium recipient journey** - Side-by-side comparison
3. **Complete chapter-by-chapter storyboard** - Visual flow
4. **Scene-level timing table** - Exact durations and transitions
5. **Exact media asset list and specifications** - Dimensions, formats, compression
6. **Music strategy** - Track selection, licensing, integration
7. **Audio ducking behavior** - Timing and volume curves
8. **Video treatment** - Technical specs and UX
9. **Transition library and usage rules** - When to use each transition type
10. **Playback controls** - UI placement and behavior
11. **Accessibility model** - Reduced-motion, captions, keyboard
12. **Mobile interaction model** - Touch targets, gestures, performance
13. **Technical Reveal Engine architecture** - Components, data flow
14. **Proposed data model** - Schema changes, if any
15. **Analytics events** - Complete instrumentation plan
16. **Performance budget** - Load time, FPS, memory targets
17. **Files likely to change** - Implementation scope
18. **MVP acceptance criteria** - What defines success
19. **Risks** - Technical, UX, content, timeline
20. **Deferred work** - What's explicitly out of scope
21. **Prototype vs production distinction** - Clear boundaries

Then **STOP for Founder approval.**

---

## Success Criteria

The prototype succeeds if it proves:

**Primary Goal:**
A guided reveal feels materially more special than Standard MemoryPop browsing.

**Validation Questions:**
1. Does the reveal create stronger emotional response than Standard?
2. Do test viewers want to create one after experiencing it?
3. Does the Premium value proposition become immediately clear?
4. Does the reveal → gallery transition feel natural?
5. Can the Reveal Engine architecture extend to other occasions?

**Failure Signals:**
- Reveal feels gimmicky or forced
- Viewers skip or abandon mid-reveal
- Premium differentiation still unclear
- Technical complexity outweighs benefit
- Can't source coherent realistic assets

---

## Constraints

**Timeline:**
- Prototype, not production feature
- Must answer strategic question quickly

**Technical:**
- Must work on phones (primary device)
- Must respect accessibility
- Must comply with browser autoplay
- Must perform well
- Must use existing MemoryPop infrastructure

**Content:**
- Realistic assets required (no placeholders)
- One cohesive demo story
- Proper licensing

**Scope:**
- Emma's 30th Birthday only
- No payment or entitlement logic
- No creator customization
- Single music track

---

## Open Questions

**Product:**
1. Should reveal be skippable at any time or only at chapter boundaries?
2. What happens if user pauses mid-reveal and never resumes?
3. Should Standard users see any preview/teaser of Premium reveal?
4. How does replay work - restart or resume?
5. What's the minimum viable reveal duration?

**Technical:**
6. What data model changes required for scenes/chapters?
7. How to preload next chapter without blocking current?
8. What's the fallback if music fails to load?
9. Graceful degradation on slow networks or block reveal?
10. Server-side rendering for reveal structure?

**Assets:**
11. Can we source realistic, cohesive demo assets?
12. Licensing strategy for prototype music?
13. Professional video production or authentic amateur quality?
14. Asset hosting and CDN strategy?

**Validation:**
15. What success metrics validate this direction?
16. How many test viewers needed?
17. What feedback would invalidate this approach?
18. When do we decide to productionize or abandon?

---

## User Impact

**Current State:**
- Premium = prettier UI
- No clear value differentiation
- Weak conversion case
- Same experience, nicer styling

**Desired State:**
- Premium = guided emotional story
- Clear experiential differentiation
- Strong "I want this" response
- Same content, transformed presentation
- Justified price premium

---

## The Goal

This is NOT about building a prettier MemoryPop.

This is about proving MemoryPop can transform a collection of contributed memories into a beautifully directed emotional experience.

If this prototype works, it becomes the foundation for Premium positioning.

If it doesn't work, we learn that quickly and pivot strategy.
