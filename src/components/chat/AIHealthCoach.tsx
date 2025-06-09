import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader, AlertCircle, Info, User, Package, Brain, Moon, Heart, Zap } from 'lucide-react';
import { useChatApi } from '../../hooks/useChatApi';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
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
    icon: <Moon className="h-4 w-4" />,
    description: 'Improve sleep quality and recovery',
    supplements: ['Magnesium Glycinate', 'L-Theanine', 'Ashwagandha'],
    prompt: "What supplements should I take for better sleep and recovery?"
  },
  {
    id: 'focus-stack',
    name: 'Cognitive Performance',
    icon: <Brain className="h-4 w-4" />,
    description: 'Enhance mental clarity and focus',
    supplements: ["Lion's Mane", 'Alpha-GPC', 'Bacopa Monnieri'],
    prompt: "What supplements should I take to improve focus and cognitive performance?"
  },
  {
    id: 'metabolic-stack',
    name: 'Metabolic Health',
    icon: <Zap className="h-4 w-4" />,
    description: 'Support blood sugar and metabolism',
    supplements: ['Berberine', 'Alpha Lipoic Acid', 'Chromium Picolinate'],
    prompt: "What supplements should I take to improve metabolic health and blood sugar control?"
  },
  {
    id: 'immunity-stack',
    name: 'Immune Support',
    icon: <Heart className="h-4 w-4" />,
    description: 'Strengthen immune function',
    supplements: ['Vitamin D3+K2', 'Zinc', 'Vitamin C'],
    prompt: "What supplements should I take to support my immune system?"
  }
];

export default function HealthCoach() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { sendMessage, loading, error: apiError } = useChatApi();
  const { user, isDemo } = useAuth();
  const { currentTheme } = useTheme();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Select 5 random questions on component mount
    const shuffled = [...suggestedQuestions].sort(() => 0.5 - Math.random());
    setSelectedSuggestions(shuffled.slice(0, 5));
  }, []);

  useEffect(() => {
    // Update local error state when API error changes
    setError(apiError);
  }, [apiError]);

  const handleSubmit = async (e: React.FormEvent | string) => {
    e?.preventDefault?.();
    const messageContent = typeof e === 'string' ? e : input;
    
    if (!messageContent.trim()) return;

    setError(null); // Clear any previous errors

    const userMessage: Message = {
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
        setMessages(prev => [
          ...prev, 
          {
            role: 'assistant',
            content: response,
            timestamp: new Date()
          }
        ]);
      }
    } catch (err: any) {
      console.error("Error in chat submission:", err);
      setError(err.message || "Failed to get a response. Please try again.");
    }
  };

  return (
    <div className="flex h-full flex-col rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] shadow-lg">
      <div className="border-b border-[hsl(var(--color-border))] bg-[hsl(var(--color-card-hover))] p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <img 
                src={currentTheme === 'dark' 
                  ? 'https://leznzqfezoofngumpiqf.supabase.co/storage/v1/object/sign/logos/white%20Log%20trnspt%20bg.svg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5X2UyYTcyNGEyLTZkNTctNDk4YS04ZGU1LWY2Y2Q4MjAyNjA3YiJ9.eyJ1cmwiOiJsb2dvcy93aGl0ZSBMb2cgdHJuc3B0IGJnLnN2ZyIsImlhdCI6MTc0NzI3MzEwNywiZXhwIjoxNzc4ODA5MTA3fQ.GI2ed8ie67PgVxVEoJsSWQXsv_Zki1V5ub7jfQCW-hg'
                  : 'https://leznzqfezoofngumpiqf.supabase.co/storage/v1/object/sign/logos/logo-light.svg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5X2UyYTcyNGEyLTZkNTctNDk4YS04ZGU1LWY2Y2Q4MjAyNjA3YiJ9.eyJ1cmwiOiJsb2dvcy9sb2dvLWxpZ2h0LnN2ZyIsImlhdCI6MTc0NzI3MzIwMSwiZXhwIjoxNzc4ODA5MjAxfQ.i8q67OTuH9eIiXxe8EaePs3JRxRuPhexJfsSzT4Q0iQ'
                }
                alt="Biowell Logo" 
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
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-error/10 p-3 text-sm text-error">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        )}

        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-4 rounded-full bg-primary/10 p-4">
              <img 
                src={currentTheme === 'dark' 
                  ? 'https://leznzqfezoofngumpiqf.supabase.co/storage/v1/object/sign/logos/white%20Log%20trnspt%20bg.svg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5X2UyYTcyNGEyLTZkNTctNDk4YS04ZGU1LWY2Y2Q4MjAyNjA3YiJ9.eyJ1cmwiOiJsb2dvcy93aGl0ZSBMb2cgdHJuc3B0IGJnLnN2ZyIsImlhdCI6MTc0NzI3MzEwNywiZXhwIjoxNzc4ODA5MTA3fQ.GI2ed8ie67PgVxVEoJsSWQXsv_Zki1V5ub7jfQCW-hg'
                  : 'https://leznzqfezoofngumpiqf.supabase.co/storage/v1/object/sign/logos/logo-light.svg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5X2UyYTcyNGEyLTZkNTctNDk4YS04ZGU1LWY2Y2Q4MjAyNjA3YiJ9.eyJ1cmwiOiJsb2dvcy9sb2dvLWxpZ2h0LnN2ZyIsImlhdCI6MTc0NzI3MzIwMSwiZXhwIjoxNzc4ODA5MjAxfQ.i8q67OTuH9eIiXxe8EaePs3JRxRuPhexJfsSzT4Q0iQ'
                }
                alt="Biowell Logo" 
                className="h-8 w-8 text-primary"
                loading="lazy"
              />
            </div>
            <h3 className="mb-2 text-lg font-medium">Welcome to your Health Coach</h3>
            <p className="mb-6 text-text-light">
              Ask me anything about your health and wellness goals.
            </p>
            
            {/* Supplement Stack Shortcuts */}
            <div className="mb-6">
              <h4 className="mb-3 text-sm font-medium">Supplement Stacks</h4>
              <div className="grid grid-cols-2 gap-3">
                {supplementStacks.map((stack) => (
                  <button
                    key={stack.id}
                    onClick={() => handleSubmit(stack.prompt)}
                    className="flex flex-col items-start rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-3 text-left transition-colors hover:border-primary/50 hover:bg-[hsl(var(--color-card-hover))]"
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                        {stack.icon}
                      </div>
                      <span className="font-medium">{stack.name}</span>
                    </div>
                    <p className="text-xs text-text-light">{stack.description}</p>
                  </button>
                ))}
              </div>
            </div>
            
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
                    src={currentTheme === 'dark' 
                      ? 'https://leznzqfezoofngumpiqf.supabase.co/storage/v1/object/sign/logos/white%20Log%20trnspt%20bg.svg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5X2UyYTcyNGEyLTZkNTctNDk4YS04ZGU1LWY2Y2Q4MjAyNjA3YiJ9.eyJ1cmwiOiJsb2dvcy93aGl0ZSBMb2cgdHJuc3B0IGJnLnN2ZyIsImlhdCI6MTc0NzI3MzEwNywiZXhwIjoxNzc4ODA5MTA3fQ.GI2ed8ie67PgVxVEoJsSWQXsv_Zki1V5ub7jfQCW-hg'
                      : 'https://leznzqfezoofngumpiqf.supabase.co/storage/v1/object/sign/logos/logo-light.svg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5X2UyYTcyNGEyLTZkNTctNDk4YS04ZGU1LWY2Y2Q4MjAyNjA3YiJ9.eyJ1cmwiOiJsb2dvcy9sb2dvLWxpZ2h0LnN2ZyIsImlhdCI6MTc0NzI3MzIwMSwiZXhwIjoxNzc4ODA5MjAxfQ.i8q67OTuH9eIiXxe8EaePs3JRxRuPhexJfsSzT4Q0iQ'
                    }
                    alt="Biowell Logo" 
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
                src={currentTheme === 'dark' 
                  ? 'https://leznzqfezoofngumpiqf.supabase.co/storage/v1/object/sign/logos/white%20Log%20trnspt%20bg.svg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5X2UyYTcyNGEyLTZkNTctNDk4YS04ZGU1LWY2Y2Q4MjAyNjA3YiJ9.eyJ1cmwiOiJsb2dvcy93aGl0ZSBMb2cgdHJuc3B0IGJnLnN2ZyIsImlhdCI6MTc0NzI3MzEwNywiZXhwIjoxNzc4ODA5MTA3fQ.GI2ed8ie67PgVxVEoJsSWQXsv_Zki1V5ub7jfQCW-hg'
                  : 'https://leznzqfezoofngumpiqf.supabase.co/storage/v1/object/sign/logos/logo-light.svg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5X2UyYTcyNGEyLTZkNTctNDk4YS04ZGU1LWY2Y2Q4MjAyNjA3YiJ9.eyJ1cmwiOiJsb2dvcy9sb2dvLWxpZ2h0LnN2ZyIsImlhdCI6MTc0NzI3MzIwMSwiZXhwIjoxNzc4ODA5MjAxfQ.i8q67OTuH9eIiXxe8EaePs3JRxRuPhexJfsSzT4Q0iQ'
                }
                alt="Biowell Logo" 
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