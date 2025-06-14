import { useState, useEffect, useRef, useCallback } from 'react';
import { useError } from '../contexts/ErrorContext';
import { handleSpeechRecognitionError, ErrorCode, createErrorObject } from '../utils/errorHandling';
import { isIOS, isAndroid, isSafari } from '../utils/deviceDetection';

interface SpeechRecognitionOptions {
  continuous?: boolean;
  interimResults?: boolean;
  language?: string;
}

export const useSpeechRecognition = (options?: SpeechRecognitionOptions) => {
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const [browserSupportsSpeechRecognition, setBrowserSupportsSpeechRecognition] = useState(false);
  const [isMicrophoneAvailable, setIsMicrophoneAvailable] = useState(true);
  const { addError } = useError();
  
  // Check for browser support of MediaDevices (for microphone detection)
  const checkMicrophonePermission = useCallback(async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setIsMicrophoneAvailable(false);
      return false;
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop all audio tracks
      stream.getTracks().forEach(track => track.stop());
      setIsMicrophoneAvailable(true);
      return true;
    } catch (err) {
      console.error('Microphone permission error:', err);
      setIsMicrophoneAvailable(false);
      return false;
    }
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    // Check for browser support
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          setBrowserSupportsSpeechRecognition(true);
          
          // Check microphone permission
          checkMicrophonePermission();
        } catch (err) {
          const errorObj = createErrorObject(
            `Failed to initialize speech recognition: ${err instanceof Error ? err.message : String(err)}`,
            'error',
            ErrorCode.SPEECH_RECOGNITION_FAILED,
            'speech'
          );
          addError(errorObj);
          setError(errorObj.message);
          setBrowserSupportsSpeechRecognition(false);
        }
      } else {
        const errorObj = createErrorObject(
          'Speech recognition is not supported in this browser',
          'warning',
          ErrorCode.DEVICE_NOT_SUPPORTED,
          'speech'
        );
        // Don't add to global errors to avoid spamming - this is expected on some browsers
        setError(errorObj.message);
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
  }, [addError, checkMicrophonePermission]);

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
      
      // iOS Safari requires a different approach to audio handling
      if (isIOS() && isSafari()) {
        // Special handling for iOS Safari
        // We need shorter recognition periods for iOS Safari
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = true;
      }
      
      // Set up recognition event handlers
      recognitionInstance.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscriptText = '';
        
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscriptText += event.results[i][0].transcript;
          }
        }
        
        if (finalTranscript) {
          setTranscript(prev => (prev + ' ' + finalTranscript).trim());
        }
        
        if (interimTranscriptText) {
          setInterimTranscript(interimTranscriptText);
        }
      };
      
      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        const errorObj = handleSpeechRecognitionError(event);
        
        // Only add non-info errors to global context
        if (errorObj.severity !== 'info') {
          addError(errorObj);
        }
        
        setError(errorObj.message);
        
        // If error is no-speech, keep listening
        if (event.error !== 'no-speech') {
          setIsListening(false);
        }
      };
      
      recognitionInstance.onend = () => {
        // Add a small delay to finalize any pending transcripts
        setTimeout(() => {
          setIsListening(false);
          setInterimTranscript('');
          
          // iOS and Android special case: automatically restart listening
          // for continuous recognition (since continuous doesn't work well on mobile)
          if ((isIOS() || isAndroid()) && options?.continuous) {
            try {
              if (recognitionRef.current) {
                recognitionRef.current.start();
                setIsListening(true);
              }
            } catch (err) {
              console.error('Error restarting recognition on mobile:', err);
            }
          }
        }, 500);
      };
      
      // Save to ref
      recognitionRef.current = recognitionInstance;
    } catch (err) {
      console.error('Error creating speech recognition:', err);
      const errorObj = createErrorObject(
        `Failed to create speech recognition: ${err instanceof Error ? err.message : String(err)}`,
        'error',
        ErrorCode.SPEECH_RECOGNITION_FAILED,
        'speech'
      );
      addError(errorObj);
      setError(errorObj.message);
    }
  }, [options?.continuous, options?.interimResults, options?.language, browserSupportsSpeechRecognition, addError]);

  // Function to start listening
  const startListening = useCallback(async () => {
    if (!browserSupportsSpeechRecognition) {
      const errorObj = createErrorObject(
        'Speech recognition is not available',
        'warning',
        ErrorCode.DEVICE_NOT_SUPPORTED,
        'speech'
      );
      setError(errorObj.message);
      return;
    }
    
    // Check microphone permission
    const hasMicrophone = await checkMicrophonePermission();
    if (!hasMicrophone) {
      const errorObj = createErrorObject(
        'Microphone access is required for voice input',
        'warning',
        ErrorCode.DEVICE_PERMISSION_DENIED,
        'speech'
      );
      addError(errorObj);
      setError(errorObj.message);
      return;
    }

    try {
      if (recognitionRef.current) {
        setIsListening(true);
        setError(null);
        
        // Clear previous transcript when starting a new session
        if (!options?.continuous) {
          setTranscript('');
          setInterimTranscript('');
        }
        
        // Start recognition
        recognitionRef.current.start();
        
        // iOS Safari workaround - sometimes it doesn't start correctly
        if (isIOS() && isSafari()) {
          setTimeout(() => {
            if (recognitionRef.current) {
              try {
                recognitionRef.current.stop();
                recognitionRef.current.start();
              } catch (err) {
                console.error('iOS restart error:', err);
              }
            }
          }, 100);
        }
      } else {
        const errorObj = createErrorObject(
          'Speech recognition not initialized',
          'error',
          ErrorCode.SPEECH_RECOGNITION_FAILED,
          'speech'
        );
        addError(errorObj);
        setError(errorObj.message);
      }
    } catch (err) {
      const errorObj = createErrorObject(
        `Failed to start speech recognition: ${err instanceof Error ? err.message : String(err)}`,
        'error',
        ErrorCode.SPEECH_RECOGNITION_FAILED,
        'speech'
      );
      addError(errorObj);
      setError(errorObj.message);
      setIsListening(false);
    }
  }, [browserSupportsSpeechRecognition, options?.continuous, addError, checkMicrophonePermission]);

  // Function to stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
        setInterimTranscript('');
      } catch (err) {
        console.error('Error stopping recognition:', err);
      }
    }
  }, [isListening]);

  // Function to reset transcript
  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);
  
  // Function to clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    transcript,
    interimTranscript,
    isListening,
    error,
    clearError,
    startListening,
    stopListening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable
  };
};