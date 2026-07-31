import { useRef, useState, useCallback } from 'react';

interface UseAudioDuckingReturn {
  backgroundMusicRef: React.RefObject<HTMLAudioElement | null>;
  startBackgroundMusic: () => void;
  pauseBackgroundMusic: () => void;
  resumeBackgroundMusic: () => void;
  duckForVideo: (videoElement: HTMLVideoElement) => void;
  unduckAfterVideo: () => void;
  duckForMessage: () => void;
  unduckAfterMessage: () => void;
  toggleMute: () => void;
  isMuted: boolean;
}

export function useAudioDucking(): UseAudioDuckingReturn {
  const backgroundMusicRef = useRef<HTMLAudioElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [originalVolume] = useState(0.6); // 60% volume for background music
  const [duckedVolume] = useState(0.15); // 15% volume during video

  const startBackgroundMusic = useCallback(() => {
    const audio = backgroundMusicRef.current;
    if (!audio) return;

    audio.volume = originalVolume;
    audio.muted = isMuted;

    audio.play().catch(err => {
      console.error('Background music autoplay failed:', err);
      // If autoplay fails, try muted
      audio.muted = true;
      audio.play().catch(err2 => {
        console.error('Muted autoplay also failed:', err2);
      });
    });
  }, [originalVolume, isMuted]);

  const pauseBackgroundMusic = useCallback(() => {
    const audio = backgroundMusicRef.current;
    if (!audio) return;
    audio.pause();
  }, []);

  const resumeBackgroundMusic = useCallback(() => {
    const audio = backgroundMusicRef.current;
    if (!audio) return;

    audio.play().catch(err => {
      console.error('Failed to resume background music:', err);
    });
  }, []);

  const duckForVideo = useCallback((videoElement: HTMLVideoElement) => {
    const audio = backgroundMusicRef.current;
    if (!audio) return;

    // Stop background music entirely during video
    audio.pause();
  }, []);

  const unduckAfterVideo = useCallback(() => {
    const audio = backgroundMusicRef.current;
    if (!audio) return;

    // Resume background music after video with fade in
    audio.volume = 0;
    audio.play().catch(err => {
      console.error('Failed to resume background music:', err);
    });

    const fadeInInterval = setInterval(() => {
      if (audio.volume < originalVolume) {
        audio.volume = Math.min(originalVolume, audio.volume + 0.05);
      } else {
        clearInterval(fadeInInterval);
      }
    }, 50);
  }, [originalVolume]);

  const duckForMessage = useCallback(() => {
    const audio = backgroundMusicRef.current;
    if (!audio) return;

    // Reduce background music volume to let message breathe
    const fadeOutInterval = setInterval(() => {
      if (audio.volume > duckedVolume) {
        audio.volume = Math.max(duckedVolume, audio.volume - 0.05);
      } else {
        clearInterval(fadeOutInterval);
      }
    }, 50);
  }, [duckedVolume]);

  const unduckAfterMessage = useCallback(() => {
    const audio = backgroundMusicRef.current;
    if (!audio) return;

    // Gradually increase background music volume back to original
    const fadeInInterval = setInterval(() => {
      if (audio.volume < originalVolume) {
        audio.volume = Math.min(originalVolume, audio.volume + 0.05);
      } else {
        clearInterval(fadeInInterval);
      }
    }, 50);
  }, [originalVolume]);

  const toggleMute = useCallback(() => {
    const audio = backgroundMusicRef.current;
    if (!audio) return;

    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    audio.muted = newMutedState;

    // Also mute any playing videos
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
      video.muted = newMutedState;
    });
  }, [isMuted]);

  return {
    backgroundMusicRef,
    startBackgroundMusic,
    pauseBackgroundMusic,
    resumeBackgroundMusic,
    duckForVideo,
    unduckAfterVideo,
    duckForMessage,
    unduckAfterMessage,
    toggleMute,
    isMuted,
  };
}
