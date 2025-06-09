import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader, Info, User, Volume2, VolumeX, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { logError } from '../../utils/logger';
import { useAutoScroll } from '../../hooks/useAutoScroll';
import ReactMarkdown from 'react-markdown';
import { useChatStore } from '../../store';
import ApiErrorDisplay from '../common/ApiErrorDisplay';
import { AVAILABLE_VOICES } from '../../api/elevenlabsApi';

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
  const audioRef = useRef<HTMLAudioElement>(null);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  
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
    setSelectedVoice
  } = useChatStore();

  useAutoScroll(messagesEndRef, [messages]);

  useEffect(() => {
    // Select 5 random questions on component mount
    const shuffled = [...suggestedQuestions].sort(() => 0.5 - Math.random());
    setSelectedSuggestions(shuffled.slice(0, 5));
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
      audioRef.current.play().catch(err => {
        logError('Error playing audio', err);
      });
    }
  }, [audioUrl, preferSpeech]);

  const toggleSpeech = () => {
    setPreferSpeech(!preferSpeech);
  };

  return (
    <div className="flex h-full flex-col rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] shadow-lg">
      <div className="border-b border-[hsl(var(--color-border))] bg-[hsl(var(--color-card-hover))] p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <img 
                src="https://jvqweleqjkrgldeflnfr.supabase.co/storage/v1/object/sign/heroes/STACKDASH.svg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5XzFhYTRlZDEyLWU0N2QtNDcyNi05ZmI0LWQ3MWM5MGFlOTYyZSJ9.eyJ1cmwiOiJoZXJvZXMvU1RBQ0tEQVNILnN2ZyIsImlhdCI6MTc0NzAxNTM3MSwiZXhwIjoxNzc4NTUxMzcxfQ.fumrYJiZDGZ36gbwlOVcWHsqs5uFiYRBAhtaT_tnQlM" 
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
              className="rounded-full p-1 text-text-light hover:bg-[hsl(var(--color-card))] hover:text-text"
              title={preferSpeech ? "Turn off voice" : "Turn on voice"}
              onClick={toggleSpeech}
            >
              {preferSpeech ? <Volume2 className="h-4 w-4 text-primary" /> : <VolumeX className="h-4 w-4" />}
            </button>
            <button 
              className="rounded-full p-1 text-text-light hover:bg-[hsl(var(--color-card))] hover:text-text"
              title="Voice settings"
              onClick={() => setShowVoiceSettings(!showVoiceSettings)}
            >
              <Settings className="h-4 w-4" />
            </button>
            <button 
              className="rounded-full p-1 text-text-light hover:bg-[hsl(var(--color-card))] hover:text-text"
              title="About Health Coach"
            >
              <Info className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {/* Voice Settings Panel */}
        <AnimatePresence>
          {showVoiceSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-2 overflow-hidden rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-3"
            >
              <div className="mb-2 flex items-center justify-between">
                <h4 className="text-xs font-medium">Voice Settings</h4>
                <button
                  onClick={() => setShowVoiceSettings(false)}
                  className="rounded-full p-1 text-text-light hover:bg-[hsl(var(--color-card))] hover:text-text"
                >
                  <Info className="h-3 w-3" />
                </button>
              </div>
              
              <div className="mb-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="enable-speech"
                  checked={preferSpeech}
                  onChange={toggleSpeech}
                  className="h-4 w-4 rounded border-[hsl(var(--color-border))] text-primary focus:ring-primary"
                />
                <label htmlFor="enable-speech" className="text-xs">
                  Enable voice responses
                </label>
              </div>
              
              <div>
                <label htmlFor="voice-select" className="mb-1 block text-xs">
                  Select voice
                </label>
                <select
                  id="voice-select"
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-2 py-1 text-xs"
                  disabled={!preferSpeech}
                >
                  {AVAILABLE_VOICES.map((voice) => (
                    <option key={voice.id} value={voice.id}>
                      {voice.name}
                    </option>
                  ))}
                </select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 overscroll-contain">
        {error && <ApiErrorDisplay error={{ type: 'unknown', message: error }} />}

        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-4 rounded-full bg-primary/10 p-4">
              <img 
                src="https://jvqweleqjkrgldeflnfr.supabase.co/storage/v1/object/sign/heroes/STACKDASH.svg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5XzFhYTRlZDEyLWU0N2QtNDcyNi05ZmI0LWQ3MWM5MGFlOTYyZSJ9.eyJ1cmwiOiJoZXJvZXMvU1RBQ0tEQVNILnN2ZyIsImlhdCI6MTc0NzAxNTM3MSwiZXhwIjoxNzc4NTUxMzcxfQ.fumrYJiZDGZ36gbwlOVcWHsqs5uFiYRBAhtaT_tnQlM" 
                alt="Health Coach" 
                className="h-8 w-8 text-primary"
                loading="lazy"
              />
            </div>
            <h3 className="mb-2 text-lg font-medium">Welcome to your Health Coach</h3>
            <p className="mb-6 text-text-light">
              Ask me anything about your health and wellness goals.
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
                    src="https://jvqweleqjkrgldeflnfr.supabase.co/storage/v1/object/sign/heroes/STACKDASH.svg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5XzFhYTRlZDEyLWU0N2QtNDcyNi05ZmI0LWQ3MWM5MGFlOTYyZSJ9.eyJ1cmwiOiJoZXJvZXMvU1RBQ0tEQVNILnN2ZyIsImlhdCI6MTc0NzAxNTM3MSwiZXhwIjoxNzc4NTUxMzcxfQ.fumrYJiZDGZ36gbwlOVcWHsqs5uFiYRBAhtaT_tnQlM" 
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
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                ) : (
                  <div>{message.content}</div>
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
                src="https://jvqweleqjkrgldeflnfr.supabase.co/storage/v1/object/sign/heroes/STACKDASH.svg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5XzFhYTRlZDEyLWU0N2QtNDcyNi05ZmI0LWQ3MWM5MGFlOTYyZSJ9.eyJ1cmwiOiJoZXJvZXMvU1RBQ0tEQVNILnN2ZyIsImlhdCI6MTc0NzAxNTM3MSwiZXhwIjoxNzc4NTUxMzcxfQ.fumrYJiZDGZ36gbwlOVcWHsqs5uFiYRBAhtaT_tnQlM" 
                alt="Health Coach" 
                className="h-4 w-4"
                loading="lazy"
              />
            </div>
            <div className="max-w-[75%] rounded-lg bg-[hsl(var(--color-card-hover))] p-4">
              <Loader className="h-5 w-5 animate-spin text-primary" role="status" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Hidden audio element for playing speech */}
      <audio ref={audioRef} src={audioUrl || ''} className="hidden" />
      
      {/* Speech loading indicator */}
      {speechLoading && preferSpeech && (
        <div className="flex items-center justify-center border-t border-[hsl(var(--color-border))] bg-[hsl(var(--color-card-hover))] px-4 py-2">
          <div className="flex items-center gap-2 text-xs text-text-light">
            <Loader className="h-3 w-3 animate-spin" />
            <span>Generating voice response...</span>
          </div>
        </div>
      )}

      <div className="border-t border-[hsl(var(--color-border))] p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about your health..."
            className="flex-1 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-4 py-2 text-text placeholder:text-text-light focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
}