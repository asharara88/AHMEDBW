import { useEffect } from 'react';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { useError } from '../../contexts/ErrorContext';
import { ErrorCode, createErrorObject } from '../../utils/errorHandling';
import { isMobileDevice } from '../../utils/deviceDetection';

// Note: This component is kept as a fallback but is no longer used directly in the UI
// VoiceChatButton is now the primary interface for voice interaction

interface SpeechInputProps {
  isCompact?: boolean;
  onTranscriptChange?: (transcript: string) => void;
  onSubmit?: (transcript: string) => void;
  language?: string;
  autoSubmit?: boolean;
}

export default function SpeechInput({ 
  onTranscriptChange,
  onSubmit,
  language = 'en-US',
  autoSubmit = true
}: SpeechInputProps) {
  const { addError } = useError();
  const isMobile = isMobileDevice();
  
  const { 
    transcript, 
    interimTranscript, 
    isListening, 
    error, 
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable
  } = useSpeechRecognition({
    continuous: false,
    interimResults: true,
    language
  });

  // Update parent component when transcript changes
  useEffect(() => {
    if (onTranscriptChange) {
      onTranscriptChange(transcript);
    }
  }, [transcript, onTranscriptChange]);

  // Handle errors
  useEffect(() => {
    if (error) {
      addError(createErrorObject(
        error,
        'warning',
        ErrorCode.SPEECH_RECOGNITION_FAILED,
        'speech-input'
      ));
    }
  }, [error, addError]);

  // Auto-submit when speech recognition ends if transcript is available
  useEffect(() => {
    if (!isListening && transcript && autoSubmit && onSubmit) {
      const timer = setTimeout(() => {
        onSubmit(transcript);
      }, 1000); // Small delay to allow the user to see what was transcribed
      
      return () => clearTimeout(timer);
    }
  }, [isListening, transcript, autoSubmit, onSubmit]);

  // Determine if we should show the speech input component at all
  if (!browserSupportsSpeechRecognition || !isMicrophoneAvailable) {
    return null;
  }

  return null; // This component is kept for backward compatibility but is not rendered directly
}