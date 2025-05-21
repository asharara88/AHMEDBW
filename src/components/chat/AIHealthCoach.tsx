import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader, AlertCircle, Info, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { logError } from '../../utils/logger';
import { useAutoScroll } from '../../hooks/useAutoScroll';
import ReactMarkdown from 'react-markdown';
import { useChatStore } from '../../store';
import ApiErrorDisplay from '../common/ApiErrorDisplay';

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
  
  const { user, isDemo } = useAuth();
  const { currentTheme } = useTheme();
  const { messages, loading, error, sendMessage } = useChatStore();

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
              title="About Health Coach"
            >
              <Info className="h-4 w-4" />
            </button>
          </div>
        </div>
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
                  {message.timestamp.toLocaleTimeString()}
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