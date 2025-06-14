import { useState, useEffect, useRef } from 'react';

interface SpeechRecognitionOptions {
  continuous?: boolean;
  interimResults?: boolean;
  language?: string;
}

export const useSpeechRecognition = (options?: SpeechRecognitionOptions) => {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const [browserSupportsSpeechRecognition, setBrowserSupportsSpeechRecognition] = useState(false);

  // Initialize speech recognition
  useEffect(() => {
    // Check for browser support
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          setBrowserSupportsSpeechRecognition(true);
        } catch (err) {
          setError(`Failed to initialize speech recognition: ${err instanceof Error ? err.message : String(err)}`);
          setBrowserSupportsSpeechRecognition(false);
        }
      } else {
        setError('Speech recognition is not supported in this browser');
        setBrowserSupportsSpeechRecognition(false);
      }
    }
    
    // Clean up
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (err) {
          console.error('Error stopping recognition:', err);
        }
      }
    };
  }, []);

  // Update recognition instance when options change
  useEffect(() => {
    if (!browserSupportsSpeechRecognition) return;
    
    // Create a new instance with the updated options
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      // Configure the recognition
      recognitionInstance.continuous = options?.continuous ?? false;
      recognitionInstance.interimResults = options?.interimResults ?? true;
      recognitionInstance.lang = options?.language ?? 'en-US';
      
      // Set up recognition event handlers
      recognitionInstance.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcriptText = event.results[current][0].transcript;
        
        if (event.results[current].isFinal) {
          setTranscript(prev => (prev + ' ' + transcriptText).trim());
        } else {
          // For interim results, we could show them differently if needed
          setTranscript((prev => (prev + ' ' + transcriptText).trim()));
        }
      };
      
      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setError(`Speech recognition error: ${event.error}`);
        setIsListening(false);
      };
      
      recognitionInstance.onend = () => {
        setIsListening(false);
      };
      
      // Save to ref
      recognitionRef.current = recognitionInstance;
    } catch (err) {
      console.error('Error creating speech recognition:', err);
      setError(`Failed to create speech recognition: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [options?.continuous, options?.interimResults, options?.language, browserSupportsSpeechRecognition]);

  // Function to start listening
  const startListening = () => {
    if (!browserSupportsSpeechRecognition) {
      setError('Speech recognition is not available');
      return;
    }

    try {
      if (recognitionRef.current) {
        setIsListening(true);
        recognitionRef.current.start();
      } else {
        setError('Speech recognition not initialized');
      }
    } catch (err) {
      setError(`Failed to start speech recognition: ${err instanceof Error ? err.message : String(err)}`);
      setIsListening(false);
    }
  };

  // Function to stop listening
  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.error('Error stopping recognition:', err);
      }
      setIsListening(false);
    }
  };

  // Function to reset transcript
  const resetTranscript = () => {
    setTranscript('');
  };

  return {
    transcript,
    isListening,
    error,
    startListening,
    stopListening,
    resetTranscript,
    browserSupportsSpeechRecognition
  };
};