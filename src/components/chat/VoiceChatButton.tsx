import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, StopCircle, Volume2 } from 'lucide-react';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { useError } from '../../contexts/ErrorContext';
import { ErrorCode, createErrorObject } from '../../utils/errorHandling';
import AudioVisualizer from './AudioVisualizer';

interface VoiceChatButtonProps {
  onTranscript?: (transcript: string) => void;
  onSubmit?: (transcript: string) => void;
  language?: string;
  autoSubmit?: boolean;
  isButtonOnly?: boolean;
  variant?: 'primary' | 'default';
  size?: 'small' | 'medium' | 'large';
}

export default function VoiceChatButton({
  onTranscript,
  onSubmit,
  language = 'en-US',
  autoSubmit = true,
  isButtonOnly = false,
  variant = 'default',
  size = 'medium'
}: VoiceChatButtonProps) {
  const [transcript, setLocalTranscript] = useState('');
  const [showTranscript, setShowTranscript] = useState(false);
  const { addError } = useError();
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Size mapping
  const sizeMap = {
    small: 'h-10 w-10 text-sm',
    medium: 'h-12 w-12 text-base',
    large: 'h-14 w-14 text-lg'
  };

  // Variant mapping
  const variantMap = {
    primary: 'bg-primary text-white hover:bg-primary-dark',
    default: 'bg-primary/10 text-primary hover:bg-primary/20'
  };

  // Use speech recognition hook
  const {
    transcript: hookTranscript,
    interimTranscript,
    isListening,
    error: recognitionError,
    startListening,
    stopListening,
    resetTranscript: resetHookTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition({
    continuous: false,
    interimResults: true,
    language
  });

  // Handle recognition errors
  useEffect(() => {
    if (recognitionError) {
      addError(createErrorObject(
        recognitionError,
        'warning',
        ErrorCode.SPEECH_RECOGNITION_FAILED,
        'voice-chat'
      ));
    }
  }, [recognitionError, addError]);

  // Update local transcript from hook
  useEffect(() => {
    if (hookTranscript) {
      setLocalTranscript(hookTranscript);
      if (onTranscript) {
        onTranscript(hookTranscript);
      }
    }
  }, [hookTranscript, onTranscript]);

  // Handle auto submission when speech recognition completes
  useEffect(() => {
    if (!isListening && transcript && autoSubmit && onSubmit) {
      // Small delay to let user see what was transcribed
      const timer = setTimeout(() => {
        onSubmit(transcript);
        resetHookTranscript();
        setLocalTranscript('');
        setShowTranscript(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isListening, transcript, autoSubmit, onSubmit, resetHookTranscript]);

  // Toggle speech recognition
  const toggleSpeechRecognition = () => {
    if (isListening) {
      stopListening();
      setShowTranscript(true);
    } else {
      resetHookTranscript();
      setLocalTranscript('');
      startListening();
      setShowTranscript(false);
    }
  };

  // If speech recognition is not supported, don't render the component
  if (!browserSupportsSpeechRecognition) {
    return null;
  }

  // Button-only variant for compact display
  if (isButtonOnly) {
    return (
      <button
        ref={buttonRef}
        onClick={toggleSpeechRecognition}
        className={`flex items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 ${
          isListening 
            ? 'animate-pulse bg-error text-white hover:bg-error/90' 
            : variantMap[variant]
        } ${sizeMap[size]}`}
        aria-label={isListening ? "Stop voice recording" : "Start voice recording"}
        aria-pressed={isListening}
      >
        {isListening ? (
          <StopCircle className="h-5 w-5" aria-hidden="true" />
        ) : (
          <Mic className="h-5 w-5" aria-hidden="true" />
        )}
      </button>
    );
  }

  // Full component with visualization
  return (
    <div className="mt-8 text-center">
      <div className="inline-flex flex-col items-center">
        <button
          ref={buttonRef}
          onClick={toggleSpeechRecognition}
          className={`flex h-16 w-16 items-center justify-center rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 ${
            isListening 
              ? 'animate-pulse bg-error text-white hover:bg-error/90' 
              : 'bg-primary text-white hover:bg-primary-dark'
          }`}
          aria-label={isListening ? "Stop voice recording" : "Start voice chat"}
          aria-pressed={isListening}
        >
          {isListening ? (
            <StopCircle className="h-8 w-8" aria-hidden="true" />
          ) : (
            <Mic className="h-8 w-8" aria-hidden="true" />
          )}
        </button>
        
        <div className="mt-2 text-base font-medium">
          {isListening ? "Listening..." : "Voice Chat"}
        </div>
        
        {/* Audio visualization when active */}
        <AnimatePresence>
          {isListening && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-2 overflow-hidden"
            >
              <AudioVisualizer 
                active={isListening} 
                width={220} 
                height={40}
                className="mx-auto rounded-lg"
              />
              
              {interimTranscript && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2 max-w-xs text-sm text-text-light"
                >
                  {interimTranscript}
                </motion.p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Show transcript after completion */}
        <AnimatePresence>
          {showTranscript && transcript && !isListening && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 w-full max-w-md rounded-lg bg-white p-3 text-left text-sm shadow-md dark:bg-gray-800"
            >
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-primary" aria-hidden="true" />
                <p>{transcript}</p>
              </div>
              
              {!autoSubmit && (
                <div className="mt-2 flex justify-end">
                  <button
                    onClick={() => {
                      if (onSubmit) {
                        onSubmit(transcript);
                        resetHookTranscript();
                        setLocalTranscript('');
                        setShowTranscript(false);
                      }
                    }}
                    className="rounded-lg bg-primary px-3 py-1 text-sm text-white hover:bg-primary-dark"
                  >
                    Send
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}