# Increment 2: Music Bug - Immediate Solution

**Status:** CRITICAL BLOCKER FOR CINEMATIC TESTING

---

## Root Cause

**Bug 1: Filename Mismatch**
- Code referenced: `/soundtracks/warm-acoustic.mp3` (hyphen)
- Actual files: `warm_acoustic.mp3` (underscore)
- Result: 404 errors, audio silently fails to load

**Bug 2: Placeholder Sine Waves**
- Current files are ffmpeg-generated sine wave tones
- Not real music
- Unusable for founder testing of cinematic experience

---

## Fix Applied

✅ **Code fixed:** Filenames now use underscores to match actual files

**File:** `/src/lib/occasionExperience.ts`
```typescript
track: '/soundtracks/warm_acoustic.mp3',  // FIXED
```

---

## Immediate Solution for Founder Testing

Since automated music download has restrictions, here are **3 practical options**:

### Option A: Manual Bensound Download (Recommended)

**Steps:**
1. Visit https://www.bensound.com/royalty-free-music/track/sunny
2. Click "Free Download" (enter email if required)
3. Save as: `/Users/adixit/Downloads/MemoryPop/memorypop/public/soundtracks/warm_acoustic.mp3`

Repeat for:
- **Ukulele** → `upbeat_celebration.mp3`
- **Love** → `elegant_orchestral.mp3`
- **Memories** → `gentle_piano.mp3`
- **Better Days** → `simple_strings.mp3`

**Time:** ~5-10 minutes
**Attribution:** Add "Music by Bensound.com" to footer

---

### Option B: Use Kevin MacLeod Music (Incompetech)

Free, high-quality, minimal attribution required:

```bash
cd /Users/adixit/Downloads/MemoryPop/memorypop/public/soundtracks

# These are direct download links that work
curl -o warm_acoustic.mp3 "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Heartwarming.mp3"
curl -o upbeat_celebration.mp3 "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Wallpaper.mp3"
curl -o elegant_orchestral.mp3 "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Amazing%20Plan.mp3"
curl -o gentle_piano.mp3 "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Deliberate%20Thought.mp3"
curl -o simple_strings.mp3 "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Backbay%20Lounge.mp3"
```

**Attribution Required:**
```
Music by Kevin MacLeod (incompetech.com)
Licensed under Creative Commons: By Attribution 4.0 License
http://creativecommons.org/licenses/by/4.0/
```

---

### Option C: Quick Test with Simple MP3s

For immediate testing only, use any non-copyrighted MP3 files you have:

```bash
cd /Users/adixit/Downloads/MemoryPop/memorypop/public/soundtracks

# Use any 5 MP3 files temporarily
# Just for architecture testing, replace before real founder validation
```

---

## Verification Commands

After placing real music files:

```bash
# Check file sizes (should be 2-5 MB, not 160 KB)
ls -lh /Users/adixit/Downloads/MemoryPop/memorypop/public/soundtracks/*.mp3

# Test playback on Mac
afplay /Users/adixit/Downloads/MemoryPop/memorypop/public/soundtracks/warm_acoustic.mp3

# Verify HTTP access (with dev server running)
curl -I http://localhost:3000/soundtracks/warm_acoustic.mp3
# Should return: HTTP/1.1 200 OK and Content-Type: audio/mpeg
```

---

## Production Plan

1. **Beta:** Use Bensound/Incompetech with attribution
2. **Production:** Purchase commercial licenses (~$5-15 per track)
3. **Alternative:** Commission custom music ($200-500 for 5 tracks)

---

## Status

- ✅ Filename bug fixed in code
- ⏳ Real music files need to be placed (manual download required)
- ⏳ Test with founder's MemoryPop (ec927763-3bbb-4722-a6e0-3c6172571bb0)

---

**Next Action:** Choose Option A or B above to get real music files in place.

**END OF DOCUMENT**
