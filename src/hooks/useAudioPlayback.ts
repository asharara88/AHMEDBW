import { useState, useEffect, useCallback } from 'react';

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
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null);

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

  // Clean text for speech synthesis
  const cleanTextForSpeech = useCallback((text: string): string => {
    return text
      // Remove markdown
      .replace(/#{1,6}\s+/g, '') // Remove headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.*?)\*/g, '$1') // Remove italic
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links
      // Handle tables and lists
      .replace(/\|.*?\|/g, '') // Remove table rows
      .replace(/\-{3,}/g, '') // Remove table separators
      .replace(/^\s*[\-\*]\s+/gm, '') // Remove list bullets
      .replace(/^\s*\d+\.\s+/gm, '') // Remove numbered list markers
      // Clean up whitespace
      .replace(/\n\n+/g, '. ') // Replace multiple newlines with period
      .replace(/\n/g, ' ') // Replace single newlines with space
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      // Handle common symbols
      .replace(/&amp;/g, 'and')
      .replace(/&lt;/g, 'less than')
      .replace(/&gt;/g, 'greater than')
      // Add pauses for better speech flow
      .replace(/\./g, '. ')
      .replace(/\!/g, '! ')
      .replace(/\?/g, '? ')
      .replace(/:/g, ': ')
      .replace(/;/g, '; ')
      .trim();
  }, []);

  // Function to break text into sentences for better TTS experience
  const breakIntoSentences = useCallback((text: string): string[] => {
    // Split text by sentence endings (., !, ?) followed by a space or newline
    const sentences = text.match(/[^.!?]+[.!?]+[\s\n]*/g) || [];
    
    // If no sentences found or text is short, return the whole text
    if (sentences.length === 0 || text.length < 100) {
      return [text];
    }
    
    // Group sentences into chunks of reasonable length (200-300 chars)
    const chunks: string[] = [];
    let currentChunk = '';
    
    for (const sentence of sentences) {
      if (currentChunk.length + sentence.length > 300) {
        chunks.push(currentChunk.trim());
        currentChunk = sentence;
      } else {
        currentChunk += sentence;
      }
    }
    
    // Add the last chunk if it's not empty
    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }
    
    return chunks;
  }, []);

  // Function to speak text
  const speakText = useCallback((text: string) => {
    if (!speechSynthesis) {
      setError('Speech synthesis not available');
      return;
    }

    try {
      setIsPlaying(true);

      // Clean the text
      const cleanedText = cleanTextForSpeech(text);
      const textChunks = breakIntoSentences(cleanedText);
      
      // Function to speak each chunk sequentially
      const speakChunk = (index: number) => {
        if (index >= textChunks.length) {
          setIsPlaying(false);
          setAudioQueue(prev => prev.slice(1));
          return;
        }
        
        const chunk = textChunks[index];
        const utterance = new SpeechSynthesisUtterance(chunk);
        
        // Set options
        if (options) {
          utterance.rate = options.rate || 1.0;
          utterance.pitch = options.pitch || 1.0;
          utterance.volume = options.volume || 1.0;
        }

        // Try to use the specified voice if provided
        if (options?.voice && speechSynthesis) {
          const voices = speechSynthesis.getVoices();
          const selectedVoice = voices.find(voice => voice.name === options.voice);
          if (selectedVoice) {
            utterance.voice = selectedVoice;
          }
        }

        // Handle speech end event
        utterance.onend = () => {
          // Speak the next chunk
          speakChunk(index + 1);
        };

        // Handle speech error event
        utterance.onerror = (event) => {
          setError(`Speech synthesis error: ${event.error}`);
          setIsPlaying(false);
          setAudioQueue(prev => prev.slice(1));
        };

        // Save the current utterance for possible cancellation
        setCurrentUtterance(utterance);

        // Start speaking
        speechSynthesis.speak(utterance);
      };
      
      // Start with the first chunk
      speakChunk(0);
    } catch (err) {
      setError(`Failed to play audio: ${err instanceof Error ? err.message : String(err)}`);
      setIsPlaying(false);
      setAudioQueue(prev => prev.slice(1));
    }
  }, [speechSynthesis, options, cleanTextForSpeech, breakIntoSentences]);

  // Function to play audio from text
  const playAudio = useCallback((text: string) => {
    // Check if the audio is already playing
    if (isPlaying) {
      stopAudio();
    }
    
    setAudioQueue([text]);
  }, [isPlaying]);

  // Function to stop audio playback
  const stopAudio = useCallback(() => {
    if (speechSynthesis) {
      speechSynthesis.cancel();
      setIsPlaying(false);
      setAudioQueue([]);
      setCurrentUtterance(null);
    }
  }, [speechSynthesis]);

  return { playAudio, stopAudio, isPlaying, error };
};