#!/bin/bash
# Create 5 minimal MP3 placeholders for development
# Each has a different tone frequency for testing purposes
# Duration: 10 seconds each (minimal for testing)

echo "Creating placeholder audio files..."

# 1. warm_acoustic.mp3 - 440Hz (A note) - warm feeling
ffmpeg -f lavfi -i "sine=frequency=440:duration=10" -c:a libmp3lame -b:a 128k warm_acoustic.mp3 -y 2>&1 | grep -i "error\|warning" || true

# 2. upbeat_celebration.mp3 - 523Hz (C note) - bright/happy
ffmpeg -f lavfi -i "sine=frequency=523:duration=10" -c:a libmp3lame -b:a 128k upbeat_celebration.mp3 -y 2>&1 | grep -i "error\|warning" || true

# 3. elegant_orchestral.mp3 - 392Hz (G note) - elegant
ffmpeg -f lavfi -i "sine=frequency=392:duration=10" -c:a libmp3lame -b:a 128k elegant_orchestral.mp3 -y 2>&1 | grep -i "error\|warning" || true

# 4. gentle_piano.mp3 - 349Hz (F note) - gentle/reflective  
ffmpeg -f lavfi -i "sine=frequency=349:duration=10" -c:a libmp3lame -b:a 128k gentle_piano.mp3 -y 2>&1 | grep -i "error\|warning" || true

# 5. simple_strings.mp3 - 293Hz (D note) - neutral/classic
ffmpeg -f lavfi -i "sine=frequency=293:duration=10" -c:a libmp3lame -b:a 128k simple_strings.mp3 -y 2>&1 | grep -i "error\|warning" || true

echo ""
echo "✅ Created 5 placeholder audio files (DEV ONLY - replace before production):"
ls -lh *.mp3
echo ""
echo "Note: These are simple tones for architectural testing only."
echo "Replace with licensed music before any user-facing testing."
