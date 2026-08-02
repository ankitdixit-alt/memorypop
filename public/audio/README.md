# Premium Theme Audio

## Required File

This directory must contain:
- `premium-theme.mp3` - Instrumental background music for Premium Reveal experience

## Audio Requirements

The soundtrack should be:
- **Instrumental only** - No vocals
- **Calm and understated** - Not dramatic or cinematic
- **Gentle and emotional** - Matches the Premium Reveal mood
- **~2-5 minutes duration** - Loops seamlessly if needed
- **Royalty-free** - Licensed for commercial use

## Technical Specifications

- **Format:** MP3
- **Bitrate:** 128-192 kbps (balances quality and file size)
- **Sample Rate:** 44.1 kHz
- **Channels:** Stereo
- **Volume:** Mixed to allow easy adjustment (not heavily compressed)

## Integration

The audio automatically:
- Begins when Premium Reveal starts
- Plays at 60% volume (configurable in code)
- Ducks to 15% during video playback
- Fades out over 2 seconds when transitioning to gallery

## Swapping the Track

To change the soundtrack:
1. Replace `premium-theme.mp3` with your new track
2. Ensure the filename remains `premium-theme.mp3`
3. No code changes required

## Placeholder Track Sources (Royalty-Free)

Until the final track is selected, use a temporary placeholder from:
- **Pixabay** (https://pixabay.com/music/) - CC0 license
- **Free Music Archive** (https://freemusicarchive.org/) - Various licenses
- **Incompetech** (https://incompetech.com/) - CC BY license

**Search terms:** "calm piano," "gentle instrumental," "emotional ambient," "soft background"

## Current Status

⚠️ **No audio file present** - Add `premium-theme.mp3` to enable Premium Reveal music.
