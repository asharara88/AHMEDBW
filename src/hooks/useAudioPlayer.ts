import { useState, useEffect, useRef } from 'react';
import { logError } from '../utils/logger';

interface UseAudioPlayerOptions {
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onError?: (error: any) => void;
  autoPlay?: boolean;
}

interface UseAudioPlayerReturn {
  isPlaying: boolean;
  duration: number;
  currentTime: number;
  progress: number;
  play: () => void;
  pause: () => void;
  stop: () => void;
  restart: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  isMuted: boolean;
}

/**
 * Hook for audio playback control
 */
export function useAudioPlayer(
  src: string | null,
  options: UseAudioPlayerOptions = {}
): UseAudioPlayerReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Set up audio element when src changes
  useEffect(() => {
    if (!src) {
      // Clean up previous audio element
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      return;
    }
    
    const audio = new Audio(src);
    audioRef.current = audio;
    
    // Set up event listeners
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };
    
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      options.onEnded?.();
    };
    
    const handlePlay = () => {
      setIsPlaying(true);
      options.onPlay?.();
    };
    
    const handlePause = () => {
      setIsPlaying(false);
      options.onPause?.();
    };
    
    const handleError = (e: any) => {
      logError('Audio playback error', e);
      setIsPlaying(false);
      options.onError?.(e);
    };
    
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);
    
    // Auto-play if enabled
    if (options.autoPlay) {
      audio.play().catch(err => {
        logError('Auto-play error', err);
      });
    }
    
    // Clean up on unmount or when src changes
    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
    };
  }, [src, options.autoPlay, options.onEnded, options.onPlay, options.onPause, options.onError]);
  
  // Play function
  const play = () => {
    if (!audioRef.current) return;
    
    audioRef.current.play().catch(err => {
      logError('Error playing audio', err);
      options.onError?.(err);
    });
  };
  
  // Pause function
  const pause = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
  };
  
  // Stop function (pause and reset position)
  const stop = () => {
    if (!audioRef.current) return;
    
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
  };
  
  // Restart function
  const restart = () => {
    if (!audioRef.current) return;
    
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
    
    if (!isPlaying) {
      play();
    }
  };
  
  // Set volume function
  const setVolume = (volume: number) => {
    if (!audioRef.current) return;
    
    // Ensure volume is between 0 and 1
    const clampedVolume = Math.max(0, Math.min(1, volume));
    audioRef.current.volume = clampedVolume;
  };
  
  // Toggle mute function
  const toggleMute = () => {
    if (!audioRef.current) return;
    
    audioRef.current.muted = !audioRef.current.muted;
    setIsMuted(audioRef.current.muted);
  };
  
  // Calculate progress percentage
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  
  return {
    isPlaying,
    duration,
    currentTime,
    progress,
    play,
    pause,
    stop,
    restart,
    setVolume,
    toggleMute,
    isMuted
  };
}