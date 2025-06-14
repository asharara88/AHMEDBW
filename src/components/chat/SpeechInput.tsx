import { useState, useEffect, useRef } from 'react';
import { Mic, Store as Stop } from 'lucide-react';

interface SpeechInputProps {
  isCompact?: boolean;
  onTranscriptChange?: (transcript: string) => void;
  onSubmit?: (transcript: string) => void;
  language?: string;
}

export default function SpeechInput({ 
  isCompact = false, 
  onTranscriptChange,
  onSubmit,
  language = 'en-US'
}: SpeechInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [browserSupported, setBrowserSupported] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  
  // Reference to the speech recognition instance
  const recognitionRef = useRef<any>(null);

  // Check for browser support and set up speech recognition
  useEffect(() => {
    // Check if the browser supports speech recognition
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        setBrowserSupported(true);
        
        // Create speech recognition instance
        try {
          const recognition = new SpeechRecognition();
          
          // Configure settings
          recognition.continuous = false;
          recognition.interimResults = true;
          recognition.lang = language;
          
          // Set up event handlers
          recognition.onresult = (event: any) => {
            const current = event.resultIndex;
            const transcriptText = event.results[current][0].transcript;
            
            const newTranscript = (transcript + ' ' + transcriptText).trim();
            setTranscript(newTranscript);
            if (onTranscriptChange) onTranscriptChange(newTranscript);
          };
          
          recognition.onerror = () => {
            setIsListening(false);
          };
          
          recognition.onend = () => {
            setIsListening(false);
            
            // Auto-submit if we have a transcript
            if (onSubmit && transcript.trim()) {
              onSubmit(transcript);
              setTranscript('');
            }
          };
          
          // Save to ref
          recognitionRef.current = recognition;
        } catch (err) {
          console.error('Error initializing speech recognition:', err);
          setBrowserSupported(false);
        }
      }
    }
    
    return () => {
      if (recognitionRef.current && isListening) {
        try {
          recognitionRef.current.stop();
        } catch (err) {
          console.error('Error stopping speech recognition:', err);
        }
      }
    };
  }, [language]);

  // Update when transcript changes
  useEffect(() => {
    if (onTranscriptChange && transcript) {
      onTranscriptChange(transcript);
    }
  }, [transcript, onTranscriptChange]);

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

  const toggleListening = () => {
    if (isListening) {
      // Stop listening
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (err) {
          console.error('Error stopping speech recognition:', err);
        }
      }
      setIsListening(false);
    } else {
      // Start listening
      if (recognitionRef.current) {
        // Reset transcript first
        setTranscript('');
        if (onTranscriptChange) onTranscriptChange('');
        
        try {
          recognitionRef.current.start();
          setIsListening(true);
        } catch (err) {
          console.error('Error starting speech recognition:', err);
        }
      }
    }
  };

  if (!browserSupported) {
    return null; // Don't render anything if speech recognition isn't supported
  }

  if (isCompact) {
    return (
      <button
        type="button"
        onClick={toggleListening}
        className={`absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 ${
          isListening 
            ? 'animate-pulse bg-error/10 text-error' 
            : 'bg-primary/10 text-primary hover:bg-primary/20'
        }`}
        title={isListening ? "Stop recording" : "Start voice input"}
        aria-label={isListening ? "Stop voice recording" : "Start voice recording"}
        aria-pressed={isListening}
      >
        {isListening ? (
          <Stop className="h-5 w-5" aria-hidden="true" />
        ) : (
          <Mic className="h-5 w-5" aria-hidden="true" />
        )}
        <span className="sr-only">{isListening ? "Stop recording" : "Start voice recording"}</span>
        
        {/* Voice level indicator */}
        {isListening && (
          <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-primary">
            Listening...
          </span>
        )}
      </button>
    );
  }

  // Full version for empty chat state
  return (
    <div className="mt-6 flex items-center gap-2 rounded-lg bg-[hsl(var(--color-surface-1))] p-3 text-base text-text-light">
      <Mic className="h-4 w-4 text-primary" aria-hidden="true" />
      <p>Try using voice input! Click the microphone icon to speak to your coach.</p>
    </div>
  );
}