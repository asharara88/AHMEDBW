import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader, User, CheckCircle, Info, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { logError } from '../../utils/logger';
import { useAutoScroll } from '../../hooks/useAutoScroll';
import ReactMarkdown from 'react-markdown';
import { useChatStore } from '../../store';
import ApiErrorDisplay from '../common/ApiErrorDisplay';
import VoicePreferences from './VoicePreferences';
import ChatSettingsButton from './ChatSettingsButton';
import AudioVisualizer from './AudioVisualizer';
import AudioPlayer from './AudioPlayer';
import SuggestedQuestions from '../onboarding/SuggestedQuestions';
import VoiceInput from './VoiceInput';
import { MessageContent } from './MessageContent';

const suggestedQuestions = [
  "What's my current health status?",
  "How can I improve my sleep quality?",
  "What supplements should I take?",
  "Analyze my nutrition habits",
  "Help me reduce stress",
  "How's my metabolic health?",
  "What's the best exercise for me?",
  "How can I improve my energy levels?",
  "What's my heart rate variability?",
  "How can I optimize my recovery?"
];

export default function HealthCoach() {
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  const { user, isDemo } = useAuth();
  const { currentTheme } = useTheme();
  const { 
    messages, 
    loading, 
    error, 
    sendMessage, 
    audioUrl,
    speechLoading,
    preferSpeech, 
    setPreferSpeech,
    selectedVoice,
    setSelectedVoice,
    voiceSettings,
    updateVoiceSettings
  } = useChatStore();

  // Use the updated useAutoScroll hook with the onlyScrollDown parameter set to true
  useAutoScroll(messagesEndRef, [messages], { behavior: 'smooth' }, true);

  useEffect(() => {
    // Select 5 random questions on component mount
    const shuffled = [...suggestedQuestions].sort(() => 0.5 - Math.random());
    setSelectedSuggestions(shuffled.slice(0, 5));
    
    // Reset scroll position to top when component mounts
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = 0;
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent | string) => {
    e?.preventDefault?.();
    const messageContent = typeof e === 'string' ? e : input;
    
    if (!messageContent.trim()) return;
    
    setInput('');
    setShowSuggestions(false);

    try {
      await sendMessage(messageContent, user?.id || (isDemo ? '00000000-0000-0000-0000-000000000000' : undefined));
    } catch (err: any) {
      logError('Error in chat submission', err);
    }
  };

  // Play audio when audioUrl changes
  useEffect(() => {
    if (audioUrl && audioRef.current && preferSpeech) {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onplay = () => setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
      audio.onpause = () => setIsPlaying(false);
      audio.onerror = (e) => {
        logError('Audio playback error', e);
        setIsPlaying(false);
      };
      
      audio.play().catch(err => {
        logError('Error playing audio', err);
        setIsPlaying(false);
      });
      
      return () => {
        audio.pause();
        audio.onplay = null;
        audio.onended = null;
        audio.onpause = null;
        audio.onerror = null;
      };
    }
  }, [audioUrl, preferSpeech]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Voice recording functionality
  const startRecording = async () => {
    try {
      setRecordingError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Here you would typically send the audio to a speech-to-text service
        // For now, we'll just simulate a response after a delay
        setTimeout(() => {
          const simulatedText = "How can I improve my sleep quality?";
          setInput(simulatedText);
          
          // Optional: Auto-submit after voice recognition
          // handleSubmit(simulatedText);
        }, 1000);
        
        // Clean up
        stream.getTracks().forEach(track => track.stop());
        setIsRecording(false);
        
        if (recordingTimeoutRef.current) {
          clearTimeout(recordingTimeoutRef.current);
          recordingTimeoutRef.current = null;
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error starting recording:', err);
      setRecordingError('Microphone access denied. Please check your browser permissions.');
      setIsRecording(false);
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
  
  // Handle voice input transcription
  const handleVoiceTranscription = (text: string) => {
    setInput(text);
    // Optionally auto-submit
    // handleSubmit(text);
  };

  return (
    <div className="flex h-full flex-col rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] shadow-lg">
      <div className="border-b border-[hsl(var(--color-border))] bg-[hsl(var(--color-card-hover))] p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <img 
                src="https://leznzqfezoofngumpiqf.supabase.co/storage/v1/object/sign/icons-favicons/stack%20dash%20metalic%20favicon.svg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82ZjcyOGVhMS1jMTdjLTQ2MTYtOWFlYS1mZmI3MmEyM2U5Y2EiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpY29ucy1mYXZpY29ucy9zdGFjayBkYXNoIG1ldGFsaWMgZmF2aWNvbi5zdmciLCJpYXQiOjE3NTAyMjE4NjgsImV4cCI6MTc4MTc1Nzg2OH0.k7wGfiV-4klxCyuBpz_MhVhF0ahuZZqNI-LQh8rLLJA" 
                alt="Health Coach" 
                className="h-5 w-5"
                loading="eager"
              />
            </div>
            <div>
              <h3 className="text-sm font-medium">Health Coach</h3>
              <p className="text-xs text-text-light">Personalized health guidance</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              className={`rounded-full p-1 ${preferSpeech ? 'text-primary' : 'text-text-light hover:bg-[hsl(var(--color-card-hover))] hover:text-text'}`}
              title={preferSpeech ? "Turn off voice" : "Turn on voice"}
              onClick={() => setPreferSpeech(!preferSpeech)}
              aria-pressed={preferSpeech}
            >
              {preferSpeech ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
            <button 
              className="rounded-full p-1 text-text-light hover:bg-[hsl(var(--color-card-hover))] hover:text-text"
              title="About Health Coach"
              aria-label="About Health Coach"
            >
              <Info className="h-4 w-4" />
            </button>
            <ChatSettingsButton 
              className="absolute right-2 top-2"
              showVoiceSettings={preferSpeech}
              onVoiceToggle={() => setPreferSpeech(!preferSpeech)}
              selectedVoice={selectedVoice}
              onVoiceSelect={setSelectedVoice}
              voiceSettings={voiceSettings}
              onVoiceSettingsUpdate={updateVoiceSettings}
            />
          </div>
        </div>
      </div>
      
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 overscroll-contain"
      >
        {error && <ApiErrorDisplay error={{ type: 'unknown', message: error }} />}

        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-4 rounded-full bg-primary/10 p-4">
              <img 
                src="https://leznzqfezoofngumpiqf.supabase.co/storage/v1/object/sign/icons-favicons/stack%20dash%20metalic%20favicon.svg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82ZjcyOGVhMS1jMTdjLTQ2MTYtOWFlYS1mZmI3MmEyM2U5Y2EiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpY29ucy1mYXZpY29ucy9zdGFjayBkYXNoIG1ldGFsaWMgZmF2aWNvbi5zdmciLCJpYXQiOjE3NTAyMjE4NjgsImV4cCI6MTc4MTc1Nzg2OH0.k7wGfiV-4klxCyuBpz_MhVhF0ahuZZqNI-LQh8rLLJA" 
                alt="Health Coach" 
                className="h-8 w-8 text-primary"
                loading="lazy"
              />
            </div>
            <h3 className="mb-2 text-lg font-medium">Welcome to your Health Coach</h3>
            <p className="mb-6 text-text-light">
              Ask me anything about your personal wellness.
            </p>
            
            {showSuggestions && (
              <div className="flex flex-wrap justify-center gap-3">
                {selectedSuggestions.map((question) => (
                  <button
                    key={question}
                    onClick={() => handleSubmit(question)}
                    className="rounded-full bg-primary/10 px-3 py-2 text-sm text-primary transition-colors hover:bg-primary/20"
                  >
                    {question}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="mr-2 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <img 
                    src="https://leznzqfezoofngumpiqf.supabase.co/storage/v1/object/sign/icons-favicons/stack%20dash%20metalic%20favicon.svg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82ZjcyOGVhMS1jMTdjLTQ2MTYtOWFlYS1mZmI3MmEyM2U5Y2EiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpY29ucy1mYXZpY29ucy9zdGFjayBkYXNoIG1ldGFsaWMgZmF2aWNvbi5zdmciLCJpYXQiOjE3NTAyMjE4NjgsImV4cCI6MTc4MTc1Nzg2OH0.k7wGfiV-4klxCyuBpz_MhVhF0ahuZZqNI-LQh8rLLJA" 
                    alt="Health Coach" 
                    className="h-4 w-4"
                    loading="lazy"
                  />
                </div>
              )}
              
              <div
                className={`max-w-[75%] rounded-lg px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-primary text-white'
                    : currentTheme === 'dark'
                    ? 'bg-[hsl(var(--color-card-hover))] text-text'
                    : 'bg-[hsl(var(--color-surface-1))] text-text'
                }`}
              >
                {message.role === 'assistant' ? (
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <MessageContent content={message.content} />
                  </div>
                ) : (
                  <div>{message.content}</div>
                )}
                {message.role === 'assistant' && preferSpeech && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-text-light">
                    <Volume2 className="h-3 w-3" />
                    <span>Voice response available</span>
                  </div>
                )}
                <div className="mt-1 text-xs opacity-70">
                  {message.timestamp?.toLocaleTimeString()}
                </div>
              </div>
              
              {message.role === 'user' && (
                <div className="ml-2 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[hsl(var(--color-card-hover))] text-text-light">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))
        )}

        {loading && (
          <div className="flex justify-start">
            <div className="mr-2 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <img 
                src="https://leznzqfezoofngumpiqf.supabase.co/storage/v1/object/sign/icons-favicons/stack%20dash%20metalic%20favicon.svg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82ZjcyOGVhMS1jMTdjLTQ2MTYtOWFlYS1mZmI3MmEyM2U5Y2EiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpY29ucy1mYXZpY29ucy9zdGFjayBkYXNoIG1ldGFsaWMgZmF2aWNvbi5zdmciLCJpYXQiOjE3NTAyMjE4NjgsImV4cCI6MTc4MTc1Nzg2OH0.k7wGfiV-4klxCyuBpz_MhVhF0ahuZZqNI-LQh8rLLJA" 
                alt="Health Coach" 
                className="h-4 w-4"
                loading="lazy"
              />
            </div>
            <div className="max-w-[75%] rounded-lg bg-[hsl(var(--color-card-hover))] p-4">
              <div className="flex space-x-2">
                <div className="h-2 w-2 animate-bounce rounded-full bg-primary"></div>
                <div className="h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: '0.2s' }}></div>
                <div className="h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Speech loading indicator */}
      {speechLoading && preferSpeech && (
        <div className="flex items-center justify-center border-t border-[hsl(var(--color-border))] bg-[hsl(var(--color-card-hover))] px-4 py-2">
          <div className="flex items-center gap-2 text-xs text-text-light w-full">
            <Loader className="h-3 w-3 animate-spin" />
            <span>Generating voice response...</span>
            <div className="flex-1">
              <div className="h-1 w-full rounded-full bg-[hsl(var(--color-surface-2))]">
                <div className="h-full w-1/3 animate-pulse rounded-full bg-primary"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Voice recording error message */}
      {recordingError && (
        <div className="border-t border-[hsl(var(--color-border))] bg-error/10 px-4 py-2 text-xs text-error">
          {recordingError}
        </div>
      )}

      {/* Audio controls when playing */}
      {audioUrl && preferSpeech && (
        <div className="border-t border-[hsl(var(--color-border))] bg-[hsl(var(--color-card-hover))] p-2 space-y-2">
          <AudioPlayer 
            src={audioUrl} 
            onEnded={() => setIsPlaying(false)} 
          />
          <AudioVisualizer 
            audioUrl={audioUrl} 
            isPlaying={isPlaying} 
          />
        </div>
      )}

      <div className="border-t border-[hsl(var(--color-border))] p-4">
        <form onSubmit={handleSubmit} className="flex gap-2 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about your health..."
            className="flex-1 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-4 py-2 text-text placeholder:text-text-light focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            disabled={loading}
            aria-label="Your message"
          />
          
          {/* Voice input component */}
          <div className="relative">
            <VoiceInput 
              onTranscription={handleVoiceTranscription}
              disabled={loading}
            />
          </div>
          
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Send message"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
}