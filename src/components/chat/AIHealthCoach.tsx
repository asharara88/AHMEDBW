import { useState, useRef, useEffect, lazy, Suspense, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader, AlertCircle, Info, User, Package, Brain, Moon, Heart, Zap, Volume2, VolumeX, Settings } from 'lucide-react';
import { useChatApi } from '../../hooks/useChatApi';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useError } from '../../contexts/ErrorContext';
import ErrorDisplay from '../common/ErrorDisplay';
import { ErrorCode, createErrorObject } from '../../utils/errorHandling';
import LoadingSpinner from '../common/LoadingSpinner';
import TextToSpeechService from '../../services/TextToSpeechService';
import Mic from './Mic';

// Lazy-loaded components
const ReactMarkdown = lazy(() => import('react-markdown'));
const AudioControl = lazy(() => import('./AudioControl'));

// Load VoiceChatButton component only when needed - this prevents any microphone initialization
// until the user explicitly interacts with it
const VoiceChatButton = lazy(() => import('./VoiceChatButton'));

interface Message {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface VoiceSettings {
  rate: number;
  pitch: number;
  voice: string | null;
  autoSubmit: boolean;
  language: string;
}

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

// Predefined supplement stacks
const supplementStacks = [
  {
    id: 'sleep-stack',
    name: 'Sleep & Recovery',
    icon: <Moon className="h-4 w-4" aria-hidden="true" />,
    description: 'Improve sleep quality and recovery',
    supplements: ['Magnesium Glycinate', 'L-Theanine', 'Ashwagandha'],
    prompt: "What supplements should I take for better sleep and recovery?"
  },
  {
    id: 'focus-stack',
    name: 'Cognitive Performance',
    icon: <Brain className="h-4 w-4" aria-hidden="true" />,
    description: 'Enhance mental clarity and focus',
    supplements: ["Lion's Mane", 'Alpha-GPC', 'Bacopa Monnieri'],
    prompt: "What supplements should I take to improve focus and cognitive performance?"
  },
  {
    id: 'metabolic-stack',
    name: 'Metabolic Health',
    icon: <Zap className="h-4 w-4" aria-hidden="true" />,
    description: 'Support blood sugar and metabolism',
    supplements: ['Berberine', 'Alpha Lipoic Acid', 'Chromium Picolinate'],
    prompt: "What supplements should I take to improve metabolic health and blood sugar control?"
  },
  {
    id: 'immunity-stack',
    name: 'Immune Support',
    icon: <Heart className="h-4 w-4" aria-hidden="true" />,
    description: 'Strengthen immune function',
    supplements: ['Vitamin D3+K2', 'Zinc', 'Vitamin C'],
    prompt: "What supplements should I take to support my immune system?"
  }
];

// Create a placeholder component for markdown content while loading
const MarkdownPlaceholder = () => (
  <div className="animate-pulse space-y-2">
    <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
    <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700"></div>
    <div className="h-4 w-5/6 rounded bg-gray-200 dark:bg-gray-700"></div>
  </div>
);

export default function HealthCoach() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([]);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    rate: 1.0,
    pitch: 1.0,
    voice: null,
    autoSubmit: true,
    language: 'en-US'
  });
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentlySpeakingMessageId, setCurrentlySpeakingMessageId] = useState<string | null>(null);
  const [voiceChatActive, setVoiceChatActive] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { sendMessage, loading, error: apiError, clearError } = useChatApi();
  const { user, isDemo } = useAuth();
  const { currentTheme } = useTheme();
  const [localError, setLocalError] = useState<string | null>(null);
  const { addError } = useError();

  // Initialize TTS service
  const ttsService = TextToSpeechService.getInstance();
  const ttsSupported = TextToSpeechService.isSupported();

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Select random suggested questions on component mount
  useEffect(() => {
    const shuffled = [...suggestedQuestions].sort(() => 0.5 - Math.random());
    setSelectedSuggestions(shuffled.slice(0, 5));
  }, []);

  // Update local error state when API error changes
  useEffect(() => {
    if (apiError) {
      setLocalError(apiError);
      
      // Add to global error context if it's a significant error
      addError({
        message: apiError,
        severity: 'warning',
        source: 'chat',
        code: ErrorCode.API_REQUEST_FAILED
      });
    } else {
      setLocalError(null);
    }
  }, [apiError, addError]);

  // Handle speech for assistant responses
  const handleMessageSpeech = useCallback((messageContent: string, messageId: string) => {
    if (!audioEnabled || !ttsSupported) return;
    
    if (isSpeaking && currentlySpeakingMessageId === messageId) {
      // Stop current speech
      ttsService.stop();
      setIsSpeaking(false);
      setCurrentlySpeakingMessageId(null);
      return;
    }
    
    // Stop any current speech
    ttsService.stop();
    
    // Start speaking new content
    setIsSpeaking(true);
    setCurrentlySpeakingMessageId(messageId);
    
    ttsService.speak(messageContent, {
      rate: voiceSettings.rate,
      pitch: voiceSettings.pitch,
      voice: voiceSettings.voice || undefined,
      language: voiceSettings.language
    }).catch(error => {
      console.error('TTS error:', error);
      addError(createErrorObject(
        `Error playing audio: ${error.message}`,
        'warning',
        ErrorCode.AUDIO_PLAYBACK_FAILED,
        'tts'
      ));
    }).finally(() => {
      setIsSpeaking(false);
      setCurrentlySpeakingMessageId(null);
    });
  }, [audioEnabled, isSpeaking, currentlySpeakingMessageId, ttsSupported, voiceSettings, addError]);
  
  // Auto-play latest assistant message when audioEnabled is on
  useEffect(() => {
    if (audioEnabled && messages.length > 0 && !isSpeaking) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant') {
        const messageId = lastMessage.id || String(messages.length - 1);
        handleMessageSpeech(lastMessage.content, messageId);
      }
    }
  }, [messages, audioEnabled, isSpeaking, handleMessageSpeech]);
  
  // Stop speech when audioEnabled is turned off
  useEffect(() => {
    if (!audioEnabled && isSpeaking) {
      ttsService.stop();
      setIsSpeaking(false);
      setCurrentlySpeakingMessageId(null);
    }
  }, [audioEnabled, isSpeaking]);

  const handleSubmit = async (e: React.FormEvent | string) => {
    e?.preventDefault?.();
    const messageContent = typeof e === 'string' ? e : input;
    
    if (!messageContent.trim()) return;

    // Clear any previous errors
    if (clearError) clearError();
    setLocalError(null);
    
    // Generate a unique ID for this message
    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const userMessage: Message = {
      id: messageId,
      role: 'user',
      content: messageContent,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setShowSuggestions(false);

    try {
      if (!sendMessage) {
        throw new Error("Chat service is not available");
      }

      const apiMessages = messages.concat(userMessage).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await sendMessage(apiMessages, user?.id || (isDemo ? '00000000-0000-0000-0000-000000000000' : undefined));
      
      if (response) {
        const responseId = `resp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        setMessages(prev => [
          ...prev, 
          {
            id: responseId,
            role: 'assistant',
            content: response,
            timestamp: new Date()
          }
        ]);
      }
    } catch (err: any) {
      // Error is handled by the useChatApi hook and propagated to the global error context
      console.error("Error in chat submission:", err);
    }
  };

  const toggleAudio = () => {
    // If turning off audio while speaking, stop the current speech
    if (audioEnabled && isSpeaking) {
      ttsService.stop();
      setIsSpeaking(false);
      setCurrentlySpeakingMessageId(null);
    }
    
    setAudioEnabled(!audioEnabled);
  };
  
  const handleVoiceSettingsChange = (setting: keyof VoiceSettings, value: any) => {
    setVoiceSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };
  
  // Handle voice input
  const handleVoiceInput = (transcript: string) => {
    // Set the transcript in the input field
    setInput(transcript);
    
    // Set flag to indicate voice chat was used
    setVoiceChatActive(true);
    
    // If auto-submit is enabled and transcript is valid, submit it
    if (voiceSettings.autoSubmit && transcript.trim()) {
      handleSubmit(transcript);
    }
  };

  return (
    <div 
      className="flex h-full flex-col rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] shadow-lg"
      role="region"
      aria-label="Health Coach Chat"
    >
      <div className="border-b border-[hsl(var(--color-border))] bg-[hsl(var(--color-card-hover))] p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <img
                src="https://leznzqfezoofngumpiqf.supabase.co/storage/v1/object/sign/biowelllogos/white%20Log%20trnspt%20bg.svg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82ZjcyOGVhMS1jMTdjLTQ2MTYtOWFlYS1mZmI3MmEyM2U5Y2EiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJiaW93ZWxsbG9nb3Mvd2hpdGUgTG9nIHRybnNwdCBiZy5zdmciLCJpYXQiOjE3NDk0MzUyNTksImV4cCI6MTc4MDk3MTI1OX0.lnxK8zhka2S8Dwvuxl3uyPFCpwdCU42zFTepIJ9VVpk"
                alt="" 
                className="h-5 w-5"
                loading="eager"
                aria-hidden="true"
              />
            </div>
            <div>
              <h3 className="text-base font-medium">Health Coach</h3>
              <p className="text-xs text-text-light">Personalized health guidance</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              className={`rounded-full p-1 ${audioEnabled ? 'bg-primary/10 text-primary' : 'text-text-light hover:bg-[hsl(var(--color-card))] hover:text-text'}`}
              title={audioEnabled ? "Turn voice off" : "Turn voice on"}
              onClick={toggleAudio}
              aria-label={audioEnabled ? "Disable text-to-speech" : "Enable text-to-speech"}
              aria-pressed={audioEnabled}
            >
              {audioEnabled ? (
                <Volume2 className="h-4 w-4" aria-hidden="true" />
              ) : (
                <VolumeX className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
            <button 
              className={`rounded-full p-1 ${showSettings ? 'bg-primary/10 text-primary' : 'text-text-light hover:bg-[hsl(var(--color-card))] hover:text-text'}`}
              title="Voice Settings"
              onClick={() => setShowSettings(!showSettings)}
              aria-label="Voice settings"
              aria-expanded={showSettings}
              aria-controls="voice-settings-panel"
            >
              <Settings className="h-4 w-4" aria-hidden="true" />
            </button>
            <button 
              className="rounded-full p-1 text-text-light hover:bg-[hsl(var(--color-card))] hover:text-text"
              title="About Health Coach"
              aria-label="About Health Coach"
            >
              <Info className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
        
        {/* Lazy load voice settings panel */}
        <AnimatePresence>
          {showSettings && (
            <Suspense fallback={<div className="mt-3 h-40 animate-pulse rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-3"></div>}>
              <motion.div
                id="voice-settings-panel"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-3 overflow-hidden rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-3"
                role="region"
                aria-label="Voice settings"
              >
                <AudioControl 
                  settings={voiceSettings}
                  onChange={handleVoiceSettingsChange}
                  onClose={() => setShowSettings(false)}
                  audioEnabled={audioEnabled}
                  onToggleAudio={toggleAudio}
                />
              </motion.div>
            </Suspense>
          )}
        </AnimatePresence>
      </div>
      
      <div 
        className="flex-1 overflow-y-auto p-4 overscroll-contain"
        role="log"
        aria-live="polite"
        aria-atomic="false"
        aria-relevant="additions"
      >
        {localError && (
          <ErrorDisplay 
            error={{
              id: 'local-error',
              message: localError,
              severity: 'error',
              source: 'chat',
              timestamp: new Date(),
              dismissable: true
            }}
          />
        )}

        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-4 rounded-full bg-primary/10 p-4" aria-hidden="true">
              <img 
                src="https://leznzqfezoofngumpiqf.supabase.co/storage/v1/object/sign/biowelllogos/white%20Log%20trnspt%20bg.svg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82ZjcyOGVhMS1jMTdjLTQ2MTYtOWFlYS1mZmI3MmEyM2U5Y2EiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJiaW93ZWxsbG9nb3Mvd2hpdGUgTG9nIHRybnNwdCBiZy5zdmciLCJpYXQiOjE3NDk0MzUyNTksImV4cCI6MTc4MDk3MTI1OX0.lnxK8zhka2S8Dwvuxl3uyPFCpwdCU42zFTepIJ9VVpk"
                alt="" 
                className="h-8 w-8 text-primary"
                loading="lazy"
                aria-hidden="true"
              />
            </div>
            <h3 className="mb-2 text-xl font-medium">Welcome to your Health Coach</h3>
            <p className="mb-6 text-text-light">
              Ask me anything about your health and wellness goals.
            </p>
            
            {/* Supplement Stack Shortcuts */}
            <div className="mb-6">
              <h4 className="mb-3 text-base font-medium">Supplement Stacks</h4>
              <div className="grid grid-cols-2 gap-3">
                {supplementStacks.map((stack) => (
                  <button
                    key={stack.id}
                    onClick={() => handleSubmit(stack.prompt)}
                    className="flex flex-col items-start rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-3 text-left transition-colors hover:border-primary/50 hover:bg-[hsl(var(--color-card-hover))]"
                    aria-label={`Ask about ${stack.name} supplements`}
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary" aria-hidden="true">
                        {stack.icon}
                      </div>
                      <span className="font-medium">{stack.name}</span>
                    </div>
                    <p className="text-sm text-text-light">{stack.description}</p>
                  </button>
                ))}
              </div>
            </div>
            
            {showSuggestions && (
              <div className="flex flex-wrap justify-center gap-3" role="group" aria-label="Suggested questions">
                {selectedSuggestions.map((question) => (
                  <button
                    key={question}
                    onClick={() => handleSubmit(question)}
                    className="rounded-full bg-primary/10 px-3 py-2 text-base text-primary transition-colors hover:bg-primary/20"
                    aria-label={`Ask: ${question}`}
                  >
                    {question}
                  </button>
                ))}
              </div>
            )}
            
            {/* Voice chat button shown on welcome screen only when needed */}
            {voiceChatActive && (
              <Suspense fallback={<div className="mt-6 h-12 animate-pulse rounded-lg bg-[hsl(var(--color-surface-1))]"></div>}>
                <VoiceChatButton 
                  onTranscript={handleVoiceInput}
                  language={voiceSettings.language}
                  autoSubmit={voiceSettings.autoSubmit}
                />
              </Suspense>
            )}
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={message.id || index}
              className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              role={message.role === 'user' ? 'complementary' : 'region'}
              aria-label={message.role === 'user' ? 'Your message' : 'Assistant response'}
            >
              {message.role === 'assistant' && (
                <div 
                  className="mr-2 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
                  aria-hidden="true"
                >
                  <img 
                    src="https://leznzqfezoofngumpiqf.supabase.co/storage/v1/object/sign/biowelllogos/white%20Log%20trnspt%20bg.svg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82ZjcyOGVhMS1jMTdjLTQ2MTYtOWFlYS1mZmI3MmEyM2U5Y2EiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJiaW93ZWxsbG9nb3Mvd2hpdGUgTG9nIHRybnNwdCBiZy5zdmciLCJpYXQiOjE3NDk0MzUyNTksImV4cCI6MTc4MDk3MTI1OX0.lnxK8zhka2S8Dwvuxl3uyPFCpwdCU42zFTepIJ9VVpk"
                    alt="" 
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
                  <Suspense fallback={<MarkdownPlaceholder />}>
                    <div className="prose prose-base max-w-none dark:prose-invert">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                      
                      {/* Audio playback button for assistant messages */}
                      {ttsSupported && (
                        <button 
                          onClick={() => handleMessageSpeech(
                            message.content, 
                            message.id || String(index)
                          )}
                          className={`mt-2 flex items-center gap-1 rounded-full ${
                            isSpeaking && currentlySpeakingMessageId === (message.id || String(index))
                              ? 'bg-error/10 text-error'
                              : 'bg-primary/10 text-primary'
                          } px-2 py-1 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2`}
                          aria-label={
                            isSpeaking && currentlySpeakingMessageId === (message.id || String(index))
                              ? "Stop speaking this message"
                              : "Listen to this message"
                          }
                        >
                          {isSpeaking && currentlySpeakingMessageId === (message.id || String(index)) ? (
                            <>
                              <VolumeX className="h-4 w-4" aria-hidden="true" />
                              <span>Stop</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="h-4 w-4" aria-hidden="true" />
                              <span>Listen</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </Suspense>
                ) : (
                  <div>{message.content}</div>
                )}
                <div className="mt-1 text-sm opacity-70">
                  {message.timestamp.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              
              {message.role === 'user' && (
                <div 
                  className="ml-2 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[hsl(var(--color-card-hover))] text-text-light"
                  aria-hidden="true"
                >
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))
        )}

        {loading && (
          <div className="flex justify-start" aria-live="polite">
            <div className="mr-2 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary" aria-hidden="true">
              <img
                src="https://leznzqfezoofngumpiqf.supabase.co/storage/v1/object/sign/biowelllogos/white%20Log%20trnspt%20bg.svg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82ZjcyOGVhMS1jMTdjLTQ2MTYtOWFlYS1mZmI3MmEyM2U5Y2EiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJiaW93ZWxsbG9nb3Mvd2hpdGUgTG9nIHRybnNwdCBiZy5zdmciLCJpYXQiOjE3NDk0MzUyNTksImV4cCI6MTc4MDk3MTI1OX0.lnxK8zhka2S8Dwvuxl3uyPFCpwdCU42zFTepIJ9VVpk"
                alt="" 
                className="h-4 w-4"
                loading="lazy"
              />
            </div>
            <div className="max-w-[75%] rounded-lg bg-[hsl(var(--color-card-hover))] p-4">
              <Loader className="h-5 w-5 animate-spin text-primary" role="status" />
              <span className="sr-only">Health coach is thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} aria-hidden="true" />
      </div>

      <div className="border-t border-[hsl(var(--color-border))] p-4">
        <form 
          onSubmit={handleSubmit} 
          className="flex gap-2"
          aria-label="Chat message form"
        >
          <div className="relative flex-1">
            <label htmlFor="chat-input" className="sr-only">Type your message</label>
            <input
              id="chat-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about your health..."
              className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-4 py-3 text-base text-text placeholder:text-text-light focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              disabled={loading}
              aria-label="Ask me anything about your health"
            />
          </div>
          
          {/* Voice Chat Button - Only load the component when clicked to prevent premature mic initialization */}
          {!voiceChatActive ? (
            <button
              type="button"
              onClick={() => setVoiceChatActive(true)}
              className="flex h-[50px] min-w-[50px] items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors hover:bg-primary/20"
              aria-label="Enable voice chat"
            >
              <Mic className="h-5 w-5" />
              <span className="sr-only">Enable voice input</span>
            </button>
          ) : (
            <Suspense fallback={<div className="h-[50px] w-[50px] animate-pulse rounded-lg bg-primary/20"></div>}>
              <VoiceChatButton 
                onTranscript={handleVoiceInput}
                language={voiceSettings.language}
                autoSubmit={voiceSettings.autoSubmit}
                isButtonOnly={true}
                variant="primary"
              />
            </Suspense>
          )}
          
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="flex h-[50px] min-w-[50px] items-center justify-center rounded-lg bg-primary px-4 py-3 text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Send message"
          >
            <Send className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
}