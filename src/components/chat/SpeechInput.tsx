import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, StopCircle, X, Info, Volume2 } from 'lucide-react';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { useError } from '../../contexts/ErrorContext';
import { ErrorCode, createErrorObject } from '../../utils/errorHandling';
import { isMobileDevice, isIOS } from '../../utils/deviceDetection';

interface SpeechInputProps {
  isCompact?: boolean;
  onTranscriptChange?: (transcript: string) => void;
  onSubmit?: (transcript: string) => void;
  language?: string;
  autoSubmit?: boolean;
}

export default function SpeechInput({ 
  isCompact = false, 
  onTranscriptChange,
  onSubmit,
  language = 'en-US',
  autoSubmit = true
}: SpeechInputProps) {
  const [audioLevel, setAudioLevel] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const visualizerRef = useRef<HTMLDivElement>(null);
  const { addError } = useError();
  const isMobile = isMobileDevice();
  
  const { 
    transcript, 
    interimTranscript, 
    isListening, 
    error, 
    startListening, 
    stopListening, 
    resetTranscript, 
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
        resetTranscript();
      }, 1000); // Small delay to allow the user to see what was transcribed
      
      return () => clearTimeout(timer);
    }
  }, [isListening, transcript, autoSubmit, onSubmit, resetTranscript]);

  // Handle audio visualization
  useEffect(() => {
    if (!isListening) {
      setAudioLevel(0);
      return;
    }
    
    // Simulate audio levels with a pulsing animation
    let interval: NodeJS.Timeout;
    
    const simulatePulse = () => {
      interval = setInterval(() => {
        setAudioLevel(Math.random() * 0.5 + 0.2); // Between 0.2 and 0.7
      }, 100);
    };
    
    simulatePulse();
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isListening]);

  const handleToggleListen = () => {
    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      startListening();
    }
  };

  // Determine if we should show the speech input component at all
  if (!browserSupportsSpeechRecognition) {
    if (!isCompact) {
      return (
        <div className="mt-6 p-3 text-xs rounded-lg bg-[hsl(var(--color-surface-1))] text-text-light">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-warning" aria-hidden="true" />
            <p>Voice input is not supported in your browser. Try using Chrome, Edge, or Safari.</p>
          </div>
        </div>
      );
    }
    return null;
  }

  // Compact version (for input field)
  if (isCompact) {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={handleToggleListen}
          className={`absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 transition-all ${
            isListening 
              ? 'animate-pulse bg-error/10 text-error' 
              : 'bg-primary/10 text-primary hover:bg-primary/20'
          }`}
          title={isListening ? "Stop recording" : "Start voice input"}
          aria-label={isListening ? "Stop voice recording" : "Start voice recording"}
          aria-pressed={isListening}
        >
          {isListening ? (
            <StopCircle className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Mic className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
        
        {/* Voice level indicator */}
        <AnimatePresence>
          {isListening && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className={`absolute ${isIOS() ? '-top-8' : '-bottom-8'} left-0 right-0 mx-auto w-32 rounded-full bg-[hsl(var(--color-surface-1))] px-3 py-1 text-center text-sm shadow-md`}
              aria-live="polite"
              role="status"
            >
              <div className="relative h-1 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <motion.div
                  ref={visualizerRef}
                  className="absolute top-0 h-full bg-primary"
                  animate={{ width: `${audioLevel * 100}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
              <span className="mt-1 block text-xs font-medium">Listening...</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Full version (for empty chat state)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative mt-6 rounded-lg bg-[hsl(var(--color-surface-1))] p-4 text-base"
    >
      <div className="mb-2 flex justify-between items-center">
        <h4 className="flex items-center gap-2 text-base font-medium">
          <Mic className="h-5 w-5 text-primary" aria-hidden="true" />
          Voice Input
        </h4>
        <button
          type="button"
          onClick={() => setShowHelp(!showHelp)}
          className="rounded-full p-1 text-text-light hover:bg-[hsl(var(--color-card-hover))] hover:text-text"
          aria-expanded={showHelp}
          aria-controls="voice-help-text"
        >
          <Info className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">{showHelp ? "Hide" : "Show"} voice input help</span>
        </button>
      </div>

      <AnimatePresence>
        {showHelp && (
          <motion.div
            id="voice-help-text"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 overflow-hidden rounded-lg bg-[hsl(var(--color-card))] p-3 text-sm"
          >
            <ul className="list-inside list-disc space-y-1 text-text-light">
              <li>Click the microphone button to start recording</li>
              <li>Speak clearly and at a normal pace</li>
              <li>Click the stop button when you're done</li>
              <li>Your message will be automatically sent</li>
              <li>For best results, use in a quiet environment</li>
              {isMobile && (
                <li>Make sure you've granted microphone permissions to this site</li>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleToggleListen}
          className={`flex h-12 w-12 items-center justify-center rounded-full ${
            isListening 
              ? 'bg-error text-white' 
              : 'bg-primary text-white hover:bg-primary-dark'
          } transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary`}
          aria-label={isListening ? "Stop recording" : "Start recording"}
          aria-pressed={isListening}
        >
          {isListening ? (
            <StopCircle className="h-6 w-6" aria-hidden="true" />
          ) : (
            <Mic className="h-6 w-6" aria-hidden="true" />
          )}
        </button>
        
        <div className="flex-1">
          {isListening ? (
            <>
              <div className="mb-1 font-medium text-primary">Listening...</div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <motion.div
                  className="h-full bg-primary"
                  animate={{ width: `${audioLevel * 100}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
              {interimTranscript && (
                <div className="mt-2 italic text-sm text-text-light">
                  {interimTranscript}
                </div>
              )}
            </>
          ) : transcript ? (
            <div className="rounded-lg border border-[hsl(var(--color-border))] bg-white p-3 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <p className="text-sm">{transcript}</p>
                <button 
                  onClick={resetTranscript} 
                  className="ml-2 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
                  aria-label="Clear transcript"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              {transcript && !isListening && (
                <button
                  onClick={() => {
                    if (onSubmit) {
                      onSubmit(transcript);
                      resetTranscript();
                    }
                  }}
                  className="mt-2 w-full rounded-lg bg-primary px-3 py-1 text-sm text-white hover:bg-primary-dark"
                  aria-label="Send voice message"
                >
                  Send
                </button>
              )}
            </div>
          ) : (
            <p className="text-sm text-text-light">Click the microphone to start speaking...</p>
          )}
        </div>
      </div>
      
      {/* Browser compatibility notice for iOS */}
      {isIOS() && (
        <div className="mt-3 rounded-lg bg-blue-50/50 p-2 text-xs text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
          <div className="flex items-start gap-1.5">
            <Info className="mt-0.5 h-3 w-3 flex-shrink-0" aria-hidden="true" />
            <p>
              For best results on iOS, speak clearly and use short phrases. 
              Speech recognition works best in Safari.
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}