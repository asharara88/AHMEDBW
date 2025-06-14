import { useState, useEffect } from 'react';

interface AudioPlaybackOptions {
  rate?: number;  // Speech rate, default is 1.0
  pitch?: number; // Speech pitch, default is 1.0
  volume?: number; // Speech volume, default is 1.0
  voice?: string; // Voice name to use, default is browser's default voice
}

export const useAudioPlayback = (options?: AudioPlaybackOptions) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioQueue, setAudioQueue] = useState<string[]>([]);
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null);

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      setSpeechSynthesis(window.speechSynthesis);
    } else {
      setError('Speech synthesis is not supported in this browser');
    }

    // Clean up on unmount
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Process audio queue when it changes
  useEffect(() => {
    if (audioQueue.length > 0 && !isPlaying && speechSynthesis) {
      const text = audioQueue[0];
      speakText(text);
    }
  }, [audioQueue, isPlaying]);

  // Function to speak text
  const speakText = (text: string) => {
    if (!speechSynthesis) {
      setError('Speech synthesis not available');
      return;
    }

    try {
      setIsPlaying(true);

      // Create a SpeechSynthesisUtterance instance
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set options
      if (options) {
        utterance.rate = options.rate || 1.0;
        utterance.pitch = options.pitch || 1.0;
        utterance.volume = options.volume || 1.0;
      }

      // Try to use the specified voice if provided
      if (options?.voice) {
        const voices = speechSynthesis.getVoices();
        const selectedVoice = voices.find(voice => voice.name === options.voice);
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      }

      // Handle speech end event
      utterance.onend = () => {
        setIsPlaying(false);
        setAudioQueue(prev => prev.slice(1));
      };

      // Handle speech error event
      utterance.onerror = (event) => {
        setError(`Speech synthesis error: ${event.error}`);
        setIsPlaying(false);
        setAudioQueue(prev => prev.slice(1));
      };

      // Start speaking
      speechSynthesis.speak(utterance);
    } catch (err) {
      setError(`Failed to play audio: ${err instanceof Error ? err.message : String(err)}`);
      setIsPlaying(false);
      setAudioQueue(prev => prev.slice(1));
    }
  };

  // Function to play audio from text
  const playAudio = (text: string) => {
    // Clean text for speech synthesis
    // Remove markdown formatting and other elements that might not read well
    const cleanText = text
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.*?)\*/g, '$1')     // Remove italic
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links
      .replace(/\|.*?\|/g, '')         // Remove table formatting
      .replace(/\n\n/g, '. ')          // Replace double newlines with period
      .replace(/\n/g, ' ')             // Replace single newlines with space
      .replace(/\s+/g, ' ');           // Replace multiple spaces with single space

    // Check if the audio is already in the queue or currently playing
    if (isPlaying) {
      stopAudio();
    }
    
    setAudioQueue([cleanText]);
  };

  // Function to stop audio playback
  const stopAudio = () => {
    if (speechSynthesis) {
      speechSynthesis.cancel();
      setIsPlaying(false);
      setAudioQueue([]);
    }
  };

  return { playAudio, stopAudio, isPlaying, error };
};