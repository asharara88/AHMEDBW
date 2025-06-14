import { useState, useEffect, useCallback } from 'react';
import { useError } from '../contexts/ErrorContext';
import { handleAudioError, ErrorCode, createErrorObject } from '../utils/errorHandling';
import TextToSpeechService, { TTSOptions } from '../services/TextToSpeechService';
import { isIOS, isSafari } from '../utils/deviceDetection';

export const useAudioPlayback = (options?: TTSOptions) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentText, setCurrentText] = useState<string | null>(null);
  const { addError } = useError();
  
  // Get TTS service instance
  const ttsService = TextToSpeechService.getInstance();
  const ttsSupported = TextToSpeechService.isSupported();
  
  // iOS Safari specific handling
  const isIOSSafari = isIOS() && isSafari();

  // Function to play audio from text
  const playAudio = useCallback((text: string, playbackOptions?: TTSOptions) => {
    if (!ttsSupported) {
      const errorObj = createErrorObject(
        'Text-to-speech is not supported in this browser',
        'warning',
        ErrorCode.AUDIO_PLAYBACK_FAILED,
        'audio'
      );
      addError(errorObj);
      setError(errorObj.message);
      return;
    }
    
    // Check if the audio is already playing
    if (isPlaying) {
      // If the same text is playing, stop it
      if (currentText === text) {
        stopAudio();
        return;
      }
      // Otherwise, stop current audio before playing new one
      stopAudio();
    }
    
    // Combine default options with provided ones
    const mergedOptions: TTSOptions = {
      ...options,
      ...playbackOptions
    };
    
    // Handle iOS Safari specific issues
    if (isIOSSafari) {
      // iOS Safari often requires user interaction before audio can play
      // We'll use a slightly slower rate for better compatibility
      mergedOptions.rate = Math.min(mergedOptions.rate || 1, 1.2);
    }
    
    setIsPlaying(true);
    setCurrentText(text);
    
    ttsService.speak(text, mergedOptions)
      .then(() => {
        // Successfully completed
        setIsPlaying(false);
        setCurrentText(null);
      })
      .catch((err) => {
        const errorObj = handleAudioError(err);
        addError(errorObj);
        setError(errorObj.message);
        setIsPlaying(false);
        setCurrentText(null);
      });
  }, [ttsSupported, isPlaying, currentText, options, ttsService, addError, isIOSSafari]);

  // Function to stop audio playback
  const stopAudio = useCallback(() => {
    if (!ttsSupported) return;
    
    ttsService.stop();
    setIsPlaying(false);
    setCurrentText(null);
  }, [ttsSupported, ttsService]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (ttsSupported && isPlaying) {
        ttsService.stop();
      }
    };
  }, [ttsSupported, isPlaying, ttsService]);

  return { 
    playAudio, 
    stopAudio, 
    isPlaying, 
    error, 
    isSupported: ttsSupported 
  };
};