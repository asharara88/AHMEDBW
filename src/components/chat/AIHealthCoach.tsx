import { useState, useRef, useEffect, lazy, Suspense, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader, AlertCircle, Info, User, Package, Brain, Moon, Heart, Zap } from 'lucide-react';
import { useChatApi } from '../../hooks/useChatApi';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useError } from '../../contexts/ErrorContext';
import ErrorDisplay from '../common/ErrorDisplay';
import { ErrorCode, createErrorObject } from '../../utils/errorHandling';
import LoadingSpinner from '../common/LoadingSpinner';

// Lazy-loaded components
const ReactMarkdown = lazy(() => import('react-markdown'));

interface Message {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

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

// Get suggested questions for health queries
const getSuggestedQuestions = () => {
  const questions = [
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
  
  // Shuffle and return 5 random questions
  return [...questions]
    .sort(() => 0.5 - Math.random())
    .slice(0, 5);
};

export default function HealthCoach() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { sendMessage, loading, error: apiError, clearError } = useChatApi();
  const { user, isDemo } = useAuth();
  const { currentTheme } = useTheme();
  const [localError, setLocalError] = useState<string | null>(null);
  const { addError } = useError();
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Select random suggested questions on component mount
  useEffect(() => {
    setSelectedSuggestions(getSuggestedQuestions());
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
  
  // Listen for clear chat events
  useEffect(() => {
    const handleClearChat = () => {
      setMessages([]);
      setShowSuggestions(true);
      setSelectedSuggestions(getSuggestedQuestions());
    };
    
    document.addEventListener('clearChat', handleClearChat);
    
    return () => {
      document.removeEventListener('clearChat', handleClearChat);
    };
  }, []);

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
              className="rounded-full p-1 text-text-light hover:bg-[hsl(var(--color-card))] hover:text-text"
              title="About Health Coach"
              aria-label="About Health Coach"
            >
              <Info className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
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