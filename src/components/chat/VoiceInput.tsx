import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Loader } from 'lucide-react';

interface VoiceInputProps {
  onTranscription: (text: string) => void;
  disabled?: boolean;
  className?: string;
}

const VoiceInput = ({ onTranscription, disabled = false, className = '' }: VoiceInputProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const recordingTimeoutRef = useRef<number | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      setError(null);
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // Create media recorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // Set up event handlers
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsProcessing(true);
        
        try {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          
          // In a real implementation, you would send this to a speech-to-text service
          // For now, we'll simulate a response after a delay
          setTimeout(() => {
            // Simulate different responses based on recording length
            const recordingLength = audioChunksRef.current.reduce((acc, chunk) => acc + chunk.size, 0);
            let simulatedText = "";
            
            if (recordingLength < 10000) {
              simulatedText = "How can I improve my sleep quality?";
            } else if (recordingLength < 20000) {
              simulatedText = "What supplements would you recommend for stress reduction?";
            } else {
              simulatedText = "I've been feeling low energy lately. What could be causing this and how can I improve it?";
            }
            
            onTranscription(simulatedText);
            setIsProcessing(false);
          }, 1500);
        } catch (err) {
          console.error('Error processing audio:', err);
          setError('Failed to process audio. Please try again.');
          setIsProcessing(false);
        }
        
        // Clean up
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        setIsRecording(false);
        
        if (recordingTimeoutRef.current) {
          clearTimeout(recordingTimeoutRef.current);
          recordingTimeoutRef.current = null;
        }
      };

      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      
      // Auto-stop after 30 seconds
      recordingTimeoutRef.current = window.setTimeout(() => {
        if (mediaRecorderRef.current && isRecording) {
          stopRecording();
        }
      }, 30000);
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Microphone access denied. Please check your browser permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  const toggleRecording = () => {
    if (disabled) return;
    
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className={className}>
      <button
        type="button"
        onClick={toggleRecording}
        disabled={disabled || isProcessing} 
        className={`flex items-center justify-center rounded-lg p-3 transition-colors min-h-[44px] min-w-[44px] ${
          isRecording 
            ? 'bg-error text-white animate-pulse' 
            : isProcessing
              ? 'bg-[hsl(var(--color-surface-2))] text-text-light'
              : 'bg-[hsl(var(--color-surface-1))] text-text-light hover:bg-[hsl(var(--color-card-hover))] hover:text-text'
        } disabled:cursor-not-allowed disabled:opacity-50`}
        aria-label={isRecording ? "Stop recording" : "Start voice recording"}
        aria-pressed={(isRecording).toString()}
        title={isRecording ? "Stop recording" : "Record voice message"}
      >
        {isProcessing ? (
          <Loader className="h-5 w-5 animate-spin" />
        ) : isRecording ? (
          <MicOff className="h-5 w-5" />
        ) : (
          <Mic className="h-5 w-5" />
        )}
      </button>
      
      {error && (
        <div className="absolute bottom-full mb-2 right-0 rounded-lg bg-error/10 p-2 text-xs text-error whitespace-nowrap">
          {error}
        </div>
      )}
      
      {isRecording && (
        <div className="absolute bottom-full mb-2 right-0 rounded-lg bg-[hsl(var(--color-card))] p-2 shadow-md whitespace-nowrap">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-error"></div>
            <span className="text-xs">Recording... (tap to stop)</span>
          </div>
        </div>
      )}
      
      {isProcessing && (
        <div className="absolute bottom-full mb-2 right-0 rounded-lg bg-[hsl(var(--color-card))] p-2 shadow-md whitespace-nowrap">
          <div className="flex items-center gap-2">
            <Loader className="h-3 w-3 animate-spin text-primary" />
            <span className="text-xs">Processing your voice...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceInput;