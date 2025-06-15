import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, StopCircle, Volume2, Command, Info } from 'lucide-react';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { useVoiceCommands } from '../../hooks/useVoiceCommands';
import { useVoiceSettings } from '../../hooks/useVoiceSettings';
import { useError } from '../../contexts/ErrorContext';
import { ErrorCode, createErrorObject } from '../../utils/errorHandling';
import AudioVisualizer from './AudioVisualizer';

interface EnhancedVoiceChatButtonProps {
  onTranscript: (transcript: string, wasCommand?: boolean) => void;
  onCommandExecuted?: (command: string, wasHandled: boolean) => void;
  isButtonOnly?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'secondary' | 'minimal';
  showHelpButton?: boolean;
  className?: string;
}

export default function EnhancedVoiceChatButton({
  onTranscript,
  onCommandExecuted,
  isButtonOnly = false,
  size = 'medium',
  variant = 'primary',
  showHelpButton = false,
  className = ''
}: EnhancedVoiceChatButtonProps) {
  const { settings } = useVoiceSettings();
  const [showTranscript, setShowTranscript] = useState(false);
  const [localTranscript, setLocalTranscript] = useState('');
  const [commandProcessing, setCommandProcessing] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { addError } = useError();
  
  // Voice command handling
  const { initCommands, handleVoiceInput, showVoiceHelp } = useVoiceCommands();
  
  // Initialize voice commands
  useEffect(() => {
    if (settings.commandsEnabled) {
      initCommands();
    }
  }, [initCommands, settings.commandsEnabled]);

  // Use speech recognition hook with settings
  const {
    transcript,
    interimTranscript,
    isListening,
    startListening,
    stopListening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable,
    clearError
  } = useSpeechRecognition({
    continuous: false,
    interimResults: true,
    language: settings.language
  });

  // Size mapping for button dimensions
  const sizeClasses = {
    small: 'h-10 w-10 text-sm',
    medium: 'h-12 w-12 text-base',
    large: 'h-16 w-16 text-lg'
  };

  // Variant mapping for button appearance
  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-primary-dark',
    secondary: 'bg-primary/10 text-primary hover:bg-primary/20',
    minimal: 'bg-[hsl(var(--color-surface-1))] text-text-light hover:bg-[hsl(var(--color-card-hover))]'
  };

  // Process transcript when it changes
  useEffect(() => {
    if (transcript) {
      setLocalTranscript(transcript);
      setShowTranscript(true);
      
      // Check if this is a voice command
      if (settings.commandsEnabled) {
        setCommandProcessing(true);
        const result = handleVoiceInput(transcript);
        
        // If it was a command and was handled, we don't need to send it to the chat
        if (result.wasCommand && result.handled) {
          if (onCommandExecuted) {
            onCommandExecuted(result.command || 'unknown', true);
          }
          
          // Reset for next input
          setTimeout(() => {
            resetTranscript();
            setLocalTranscript('');
            setShowTranscript(false);
            setCommandProcessing(false);
          }, 1500);
          
          return;
        }
      }
      
      // Not a command or command not handled, pass to chat interface
      onTranscript(transcript, false);
      setCommandProcessing(false);
      
      // Auto-submit will be handled by the parent component
      if (!settings.autoSubmit) {
        // If not auto-submitting, keep the transcript visible
        setShowTranscript(true);
      } else {
        // If auto-submitting, clear after a delay
        setTimeout(() => {
          resetTranscript();
          setLocalTranscript('');
          setShowTranscript(false);
        }, 2000);
      }
    }
  }, [transcript, settings.commandsEnabled, settings.autoSubmit, handleVoiceInput, onTranscript, onCommandExecuted, resetTranscript]);

  // Toggle speech recognition
  const toggleSpeechRecognition = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      // Clear any previous state
      clearError();
      resetTranscript();
      setLocalTranscript('');
      setShowTranscript(false);
      setCommandProcessing(false);
      
      // Start listening
      startListening();
    }
  }, [isListening, stopListening, startListening, clearError, resetTranscript]);

  // Show tooltip with help
  const handleShowHelp = () => {
    showVoiceHelp();
  };

  // If speech recognition is not supported, don't render the component
  if (!browserSupportsSpeechRecognition || !isMicrophoneAvailable) {
    // Could render a fallback here if needed
    return null;
  }

  // Button-only variant for compact display
  if (isButtonOnly) {
    return (
      <div className={`relative ${className}`}>
        <button
          ref={buttonRef}
          onClick={toggleSpeechRecognition}
          className={`flex items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 ${
            isListening 
              ? 'animate-pulse bg-error text-white hover:bg-error/90' 
              : variantClasses[variant]
          } ${sizeClasses[size]}`}
          aria-label={isListening ? "Stop voice recording" : "Start voice recording"}
          aria-pressed={isListening}
          title={isListening ? "Click to stop recording" : "Click to start voice input"}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onFocus={() => setShowTooltip(true)}
          onBlur={() => setShowTooltip(false)}
        >
          {isListening ? (
            <StopCircle className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Mic className="h-5 w-5" aria-hidden="true" />
          )}
          <span className="sr-only">{isListening ? "Stop recording" : "Start voice input"}</span>
        </button>
        
        {showHelpButton && (
          <button
            onClick={handleShowHelp}
            className={`ml-1 rounded-full p-1 text-text-light hover:bg-[hsl(var(--color-card-hover))] hover:text-text`}
            aria-label="Voice command help"
            title="Show voice command help"
          >
            <Command className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
        
        {/* Minimal tooltip on hover */}
        <AnimatePresence>
          {showTooltip && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              transition={{ duration: 0.2 }}
              className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-800 px-2 py-1 text-xs text-white shadow-lg dark:bg-gray-700"
            >
              {isListening ? "Stop voice recording" : "Start voice input"}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Show interim transcript while listening */}
        <AnimatePresence>
          {isListening && interimTranscript && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute left-0 right-0 top-full mt-2 rounded-lg bg-[hsl(var(--color-surface-1))] p-2 text-xs text-text-light shadow-md"
            >
              {interimTranscript}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Full component with visualization
  return (
    <div className={`flex flex-col items-center ${className}`} aria-live="polite">
      <div className="relative">
        <button
          ref={buttonRef}
          onClick={toggleSpeechRecognition}
          className={`flex items-center justify-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
            isListening 
              ? 'animate-pulse bg-error text-white hover:bg-error/90' 
              : 'bg-primary text-white hover:bg-primary-dark'
          } ${sizeClasses.large}`}
          aria-label={isListening ? "Stop voice recording" : "Start voice chat"}
          aria-pressed={isListening}
          title={isListening ? "Click to stop recording" : "Click to start voice input"}
        >
          {isListening ? (
            <StopCircle className="h-8 w-8" aria-hidden="true" />
          ) : (
            <Mic className="h-8 w-8" aria-hidden="true" />
          )}
        </button>
        
        {showHelpButton && (
          <button
            onClick={handleShowHelp}
            className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20"
            aria-label="Voice command help"
            title="Show voice command help"
          >
            <Info className="h-3 w-3" aria-hidden="true" />
          </button>
        )}
      </div>
      
      <div className="mt-2 text-base font-medium">
        {isListening 
          ? "Listening..." 
          : commandProcessing 
            ? "Processing..." 
            : "Voice Chat"}
      </div>
      
      {/* Audio visualization when active */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-3 w-full overflow-hidden rounded-lg"
          >
            <AudioVisualizer 
              active={isListening} 
              width={250} 
              height={48}
              className="mx-auto"
              barCount={15}
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
        {showTranscript && localTranscript && !isListening && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 w-full max-w-md rounded-lg bg-white p-3 text-left text-sm shadow-md dark:bg-gray-800"
          >
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-primary" aria-hidden="true" />
              <p>{localTranscript}</p>
            </div>
            
            {!settings.autoSubmit && (
              <div className="mt-2 flex justify-end">
                <button
                  onClick={() => {
                    onTranscript(localTranscript);
                    resetTranscript();
                    setLocalTranscript('');
                    setShowTranscript(false);
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
      
      {/* Command processing indicator */}
      <AnimatePresence>
        {commandProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-2 flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs text-primary"
          >
            <Command className="h-3 w-3" aria-hidden="true" />
            <span>Processing command...</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}