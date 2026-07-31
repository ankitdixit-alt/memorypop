# Premium Reveal Music

## Required File

Place the background music track here:
- **Filename:** `premium-reveal-track.mp3`
- **Format:** MP3 (widely supported across browsers)
- **Duration:** 2-3 minutes minimum (will loop if reveal is longer)
- **Mood:** Warm, uplifting, instrumental (no lyrics)
- **Tempo:** Moderate (not too fast, not too slow)
- **Volume:** Track should be normalized to reasonable volume (will be set to 60% in code)

## Royalty-Free Music Sources

### Recommended Sources:
1. **Pixabay Music** - https://pixabay.com/music/
   - Free for commercial use
   - No attribution required
   - Wide selection of high-quality tracks

2. **YouTube Audio Library** - https://studio.youtube.com/channel/UC.../music
   - Free music for creators
   - Filter by mood and genre
   - Some tracks require attribution

3. **Free Music Archive** - https://freemusicarchive.org/
   - Curated free music
   - Check license for each track
   - Good selection of instrumental tracks

### Search Keywords:
- "uplifting instrumental"
- "warm celebration music"
- "emotional piano background"
- "heartfelt acoustic"
- "gentle celebratory"

## Current Status

⚠️ **PLACEHOLDER NEEDED** - Add `premium-reveal-track.mp3` before testing Premium Reveal

The reveal will attempt to load this file. If missing, the reveal will continue without music (graceful degradation).

## Fallback Behavior

If music fails to load:
- Reveal continues normally
- No error shown to user
- Analytics logs the error
- Toast notification: "Music unavailable, continuing reveal"
