import { useState, useEffect, useCallback, useRef } from 'react';
import { elevenlabsApi } from '../api/elevenlabsApi';
import { logError } from '../utils/logger';

interface UseSpeechSynthesisOptions {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: any) => void;
  voiceId?: string;
}

interface UseSpeechSynthesisReturn {
  speak: (text: string) => Promise<void>;
  stop: () => void;
  isPlaying: boolean;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook for text-to-speech synthesis using ElevenLabs
 */
export function useSpeechSynthesis(options: UseSpeechSynthesisOptions = {}): UseSpeechSynthesisReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  
  // Cleanup function to release resources
  const cleanup = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onplay = null;
      audioRef.current.onended = null;
      audioRef.current.onpause = null;
      audioRef.current.onerror = null;
      audioRef.current = null;
    }
    
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
  }, []);
  
  // Clean up on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);
  
  // Function to speak text
  const speak = useCallback(async (text: string) => {
    if (!text.trim()) return;
    
    // Clean up previous audio
    cleanup();
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if ElevenLabs is configured
      if (!elevenlabsApi.isConfigured()) {
        throw new Error('Text-to-speech is not configured');
      }
      
      // Generate speech from text
      const audioBlob = await elevenlabsApi.textToSpeech(
        text, 
        options.voiceId || "21m00Tcm4TlvDq8ikWAM" // Default to Rachel voice
      );
      
      // Create URL for the audio blob
      const url = URL.createObjectURL(audioBlob);
      audioUrlRef.current = url;
      
      // Create and configure audio element
      const audio = new Audio(url);
      audioRef.current = audio;
      
      // Set up event handlers
      audio.onplay = () => {
        setIsPlaying(true);
        options.onStart?.();
      };
      
      audio.onended = () => {
        setIsPlaying(false);
        options.onEnd?.();
      };
      
      audio.onpause = () => {
        setIsPlaying(false);
      };
      
      audio.onerror = (e) => {
        setIsPlaying(false);
        setError(new Error('Error playing audio'));
        options.onError?.(e);
      };
      
      // Play the audio
      await audio.play();
    } catch (err) {
      logError('Error in speech synthesis', err);
      setError(err instanceof Error ? err : new Error('Unknown error in speech synthesis'));
      options.onError?.(err);
    } finally {
      setIsLoading(false);
    }
  }, [options, cleanup]);
  
  // Function to stop playback
  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);
  
  return {
    speak,
    stop,
    isPlaying,
    isLoading,
    error
  };
}