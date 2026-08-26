# Music Licensing Documentation
# Standard MemoryPop Beta - Soundtrack Assets

**Status:** DEV PLACEHOLDERS - Requires replacement with licensed tracks
**Last Updated:** 2026-08-16

---

## CRITICAL: Production Requirements

Before production deployment, ALL soundtrack files must be replaced with properly licensed music:

1. **Commercial use permitted** OR royalty-free with explicit commercial license
2. **No copyrighted commercial songs** (Spotify/YouTube rips prohibited)
3. **Clear attribution requirements** documented
4. **Source URLs** recorded
5. **Download date** documented
6. **License terms** verified and saved

---

## Current Status: Development Placeholders

**Location:** `/public/soundtracks/`

The following 5 MP3 files are DEVELOPMENT PLACEHOLDERS ONLY:
- Silent or minimal audio for architectural testing
- NOT suitable for production use
- Must be replaced before public beta

---

## Required Soundtrack Assets (5 tracks)

### 1. warm_acoustic.mp3
**Emotional Category:** Warm, heartfelt, thoughtful
**Occasions:** Birthday (warm_heartfelt), Anniversary, Farewell
**Target Duration:** 2-4 minutes
**Mood:** Gentle acoustic guitar or piano, intimate, warm
**Current Status:** ⚠️ DEV PLACEHOLDER - Replace before production

**Production Requirements:**
- Warm acoustic instrumentation (guitar/piano)
- Gentle, intimate feel
- Loopable or natural fade
- Commercial license required

**Recommended Sources:**
- Epidemic Sound: Search "acoustic warm heartfelt"
- Artlist: Search "intimate acoustic"
- AudioJungle: Search "warm acoustic background"

---

### 2. upbeat_celebration.mp3
**Emotional Category:** Joyful, celebratory, playful
**Occasions:** Birthday (joyful/playful), Graduation, Promotion
**Target Duration:** 2-4 minutes
**Mood:** Upbeat, energetic, positive, celebratory
**Current Status:** ⚠️ DEV PLACEHOLDER - Replace before production

**Production Requirements:**
- Upbeat tempo (120-140 BPM)
- Major key, positive energy
- Suitable for celebrations
- Commercial license required

**Recommended Sources:**
- Epidemic Sound: Search "upbeat celebration"
- Artlist: Search "happy celebration"
- AudioJungle: Search "upbeat corporate"

---

### 3. elegant_orchestral.mp3
**Emotional Category:** Elegant, romantic, meaningful
**Occasions:** Wedding, Anniversary, Retirement
**Target Duration:** 2-4 minutes
**Mood:** Elegant orchestral, romantic, cinematic
**Current Status:** ⚠️ DEV PLACEHOLDER - Replace before production

**Production Requirements:**
- Orchestral instrumentation (strings, piano)
- Elegant, romantic feel
- Suitable for weddings/formal occasions
- Commercial license required

**Recommended Sources:**
- Epidemic Sound: Search "elegant orchestral wedding"
- Artlist: Search "romantic orchestral"
- AudioJungle: Search "wedding cinematic"

---

### 4. gentle_piano.mp3
**Emotional Category:** Nostalgic, reflective, gentle
**Occasions:** Farewell, Retirement (nostalgic)
**Target Duration:** 2-4 minutes
**Mood:** Gentle piano, reflective, emotional, bittersweet
**Current Status:** ⚠️ DEV PLACEHOLDER - Replace before production

**Production Requirements:**
- Solo piano or minimal instrumentation
- Reflective, gentle mood
- Suitable for farewells/nostalgia
- Commercial license required

**Recommended Sources:**
- Epidemic Sound: Search "gentle piano emotional"
- Artlist: Search "sad piano reflective"
- AudioJungle: Search "emotional piano"

---

### 5. simple_strings.mp3
**Emotional Category:** Classic, universal, simple
**Occasions:** All occasions (fallback)
**Target Duration:** 2-4 minutes
**Mood:** Simple string arrangement, versatile, timeless
**Current Status:** ⚠️ DEV PLACEHOLDER - Replace before production

**Production Requirements:**
- String quartet or chamber ensemble
- Simple, clean arrangement
- Universal appropriateness
- Commercial license required

**Recommended Sources:**
- Epidemic Sound: Search "simple strings classical"
- Artlist: Search "minimal strings"
- AudioJungle: Search "simple orchestral"

---

## Licensing Template (Fill for each track)

When sourcing production tracks, document as follows:

```markdown
### [Track Name]
**File:** [filename].mp3
**Source:** [Platform name, e.g., Epidemic Sound]
**Source URL:** [Direct link to track]
**Track Title:** [Official track title]
**Artist/Composer:** [Creator name]
**Download Date:** [YYYY-MM-DD]
**License Type:** [e.g., "Royalty-free commercial use" or "Standard License"]
**License URL:** [Link to license terms]
**Attribution Required:** [Yes/No - if yes, specify format]
**Usage Restrictions:** [Any noted restrictions]
**License Cost:** [Free / $XX]
**License Expiration:** [None / Date]
```

---

## Recommended Royalty-Free Platforms

### Option 1: Epidemic Sound (Subscription)
- **URL:** https://www.epidemicsound.com
- **Pricing:** ~$15-50/month subscription
- **License:** Commercial use included in subscription
- **Quality:** High-quality production music
- **Search:** Excellent mood/genre filters
- **Recommendation:** ⭐ Best for quality + licensing clarity

### Option 2: Artlist (Subscription)
- **URL:** https://artlist.io
- **Pricing:** ~$199/year
- **License:** Unlimited commercial use, perpetual
- **Quality:** High-quality cinematic music
- **Recommendation:** ⭐ Good for cinematic feel

### Option 3: AudioJungle (Per-track)
- **URL:** https://audiojungle.net
- **Pricing:** $1-50 per track
- **License:** Standard or Extended (choose Standard for web use)
- **Quality:** Variable (check reviews)
- **Recommendation:** ⭐ Good for one-time purchases

### Option 4: Free Music Archive
- **URL:** https://freemusicarchive.org
- **Pricing:** Free
- **License:** Varies (check per-track, ensure commercial use allowed)
- **Quality:** Variable
- **Recommendation:** ⚠️ Verify licensing carefully

### Option 5: YouTube Audio Library
- **URL:** https://studio.youtube.com (requires YouTube account)
- **Pricing:** Free
- **License:** Free to use, some require attribution
- **Quality:** Good selection
- **Recommendation:** ⭐ Good for free options with clear licensing

---

## Architecture Notes

**Trivial Replacement Process:**
1. Download/create licensed track
2. Convert to MP3 if needed
3. Name file exactly as shown above (e.g., `warm_acoustic.mp3`)
4. Place in `/public/soundtracks/`
5. Update this documentation with licensing details
6. No code changes required

**File Requirements:**
- Format: MP3
- Bitrate: 128-192 kbps (sufficient for web)
- Sample Rate: 44.1 kHz
- Duration: 2-4 minutes minimum
- File size: <5MB per track (for reasonable loading)

---

## Current Placeholder Implementation

**Method:** Minimal valid MP3 files for development testing
**Duration:** ~5-10 seconds (silent or simple tone)
**Purpose:** Architectural verification only
**Status:** NOT SUITABLE FOR USER TESTING

**Founder must replace these files before beta user validation.**

---

## Production Deployment Checklist

Before deploying to production:

- [ ] All 5 MP3 files replaced with licensed tracks
- [ ] Each track documented in this file with:
  - [ ] Source URL
  - [ ] Track title and artist
  - [ ] License type and URL
  - [ ] Attribution requirements (if any)
  - [ ] Download date
- [ ] Attribution implemented if required (footer or credits page)
- [ ] File sizes optimized (<5MB each)
- [ ] Tracks tested on actual reveal experience
- [ ] Looping/fade behavior verified
- [ ] Mobile playback tested (iOS Safari, Chrome Android)

---

**REMINDER:** Do NOT deploy to production or public beta with placeholder audio.
