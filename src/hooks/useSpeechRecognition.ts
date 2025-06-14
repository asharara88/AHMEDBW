import { useState, useEffect } from 'react';

interface SpeechRecognitionOptions {
  continuous?: boolean;
  interimResults?: boolean;
  language?: string;
}

export const useSpeechRecognition = (options?: SpeechRecognitionOptions) => {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recognition, setRecognition] = useState<any>(null);
  const [browserSupportsSpeechRecognition, setBrowserSupportsSpeechRecognition] = useState(false);

  useEffect(() => {
    // Check for browser support
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const recognitionInstance = new SpeechRecognition();
          
          // Configure the recognition
          recognitionInstance.continuous = options?.continuous ?? false;
          recognitionInstance.interimResults = options?.interimResults ?? true;
          recognitionInstance.lang = options?.language ?? 'en-US';
          
          setRecognition(recognitionInstance);
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
  }, [options?.continuous, options?.interimResults, options?.language]);

  const startListening = () => {
    if (!recognition) {
      setError('Speech recognition is not available');
      return;
    }

    try {
      setIsListening(true);
      setTranscript('');
      
      // Set up recognition event handlers
      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcriptText = event.results[current][0].transcript;
        setTranscript(prev => prev + ' ' + transcriptText);
      };
      
      recognition.onerror = (event: any) => {
        setError(`Speech recognition error: ${event.error}`);
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      // Start recognition
      recognition.start();
    } catch (err) {
      setError(`Failed to start speech recognition: ${err instanceof Error ? err.message : String(err)}`);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognition) {
      try {
        recognition.stop();
      } catch (err) {
        console.error('Error stopping recognition:', err);
      }
      setIsListening(false);
    }
  };

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