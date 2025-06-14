import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader, AlertCircle, Info, User, Package, Brain, Moon, Heart, Zap, Mic, Volume2, VolumeX } from 'lucide-react';
import { useChatApi } from '../../hooks/useChatApi';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import ReactMarkdown from 'react-markdown'; 
import { useAudioPlayback } from '../../hooks/useAudioPlayback';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';

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
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { sendMessage, loading, error: apiError } = useChatApi();
  const { user, isDemo } = useAuth();
  const { currentTheme } = useTheme();
  const [error, setError] = useState<string | null>(null);
  
  const { playAudio, stopAudio, isPlaying, error: audioError } = useAudioPlayback();
  const { startListening, stopListening, transcript, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

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
    setError(apiError || audioError);
  }, [apiError, audioError]);

  useEffect(() => {
    // Set input when transcript changes
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

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
        const assistantMessage: Message = {
          role: 'assistant',
          content: response,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        
        // Play audio if enabled
        if (audioEnabled && response) {
          playAudio(response);
        }
      }
    } catch (err: any) {
      console.error("Error in chat submission:", err);
      setError(err.message || "Failed to get a response. Please try again.");
    }
  };

  const handleVoiceInput = () => {
    if (isRecording) {
      stopListening();
      setIsRecording(false);
    } else {
      resetTranscript();
      startListening();
      setIsRecording(true);
    }
  };

  const toggleAudio = () => {
    if (isPlaying) {
      stopAudio();
    }
    setAudioEnabled(!audioEnabled);
  };

  return (
    <div className="flex h-full flex-col rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] shadow-lg">
      <div className="border-b border-[hsl(var(--color-border))] bg-[hsl(var(--color-card-hover))] p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <img
                src="https://leznzqfezoofngumpiqf.supabase.co/storage/v1/object/sign/biowelllogos/white%20Log%20trnspt%20bg.svg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82ZjcyOGVhMS1jMTdjLTQ2MTYtOWFlYS1mZmI3MmEyM2U5Y2EiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJiaW93ZWxsbG9nb3Mvd2hpdGUgTG9nIHRybnNwdCBiZy5zdmciLCJpYXQiOjE3NDk0MzUyNTksImV4cCI6MTc4MDk3MTI1OX0.lnxK8zhka2S8Dwvuxl3uyPFCpwdCU42zFTepIJ9VVpk"
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
              className={`rounded-full p-1 ${audioEnabled ? 'bg-primary/10 text-primary' : 'text-text-light hover:bg-[hsl(var(--color-card))] hover:text-text'}`}
              title={audioEnabled ? "Turn voice off" : "Turn voice on"}
              onClick={toggleAudio}
            >
              {audioEnabled ? (
                <Volume2 className="h-4 w-4" />
              ) : (
                <VolumeX className="h-4 w-4" />
              )}
            </button>
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
                src="https://leznzqfezoofngumpiqf.supabase.co/storage/v1/object/sign/biowelllogos/white%20Log%20trnspt%20bg.svg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82ZjcyOGVhMS1jMTdjLTQ2MTYtOWFlYS1mZmI3MmEyM2U5Y2EiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJiaW93ZWxsbG9nb3Mvd2hpdGUgTG9nIHRybnNwdCBiZy5zdmciLCJpYXQiOjE3NDk0MzUyNTksImV4cCI6MTc4MDk3MTI1OX0.lnxK8zhka2S8Dwvuxl3uyPFCpwdCU42zFTepIJ9VVpk"
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
                    src="https://leznzqfezoofngumpiqf.supabase.co/storage/v1/object/sign/biowelllogos/white%20Log%20trnspt%20bg.svg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82ZjcyOGVhMS1jMTdjLTQ2MTYtOWFlYS1mZmI3MmEyM2U5Y2EiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJiaW93ZWxsbG9nb3Mvd2hpdGUgTG9nIHRybnNwdCBiZy5zdmciLCJpYXQiOjE3NDk0MzUyNTksImV4cCI6MTc4MDk3MTI1OX0.lnxK8zhka2S8Dwvuxl3uyPFCpwdCU42zFTepIJ9VVpk"
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
                    
                    {/* Audio playback button for assistant messages */}
                    {audioEnabled && message.role === 'assistant' && (
                      <button 
                        onClick={() => playAudio(message.content)} 
                        className="mt-2 flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs text-primary"
                        title="Play message audio"
                      >
                        <Volume2 className="h-3 w-3" />
                        <span>Listen</span>
                      </button>
                    )}
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
                src="https://leznzqfezoofngumpiqf.supabase.co/storage/v1/object/sign/biowelllogos/white%20Log%20trnspt%20bg.svg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82ZjcyOGVhMS1jMTdjLTQ2MTYtOWFlYS1mZmI3MmEyM2U5Y2EiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJiaW93ZWxsbG9nb3Mvd2hpdGUgTG9nIHRybnNwdCBiZy5zdmciLCJpYXQiOjE3NDk0MzUyNTksImV4cCI6MTc4MDk3MTI1OX0.lnxK8zhka2S8Dwvuxl3uyPFCpwdCU42zFTepIJ9VVpk"
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
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about your health..."
              className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-4 py-2 text-text placeholder:text-text-light focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              disabled={loading || isRecording}
            />
            {browserSupportsSpeechRecognition && (
              <button
                type="button"
                onClick={handleVoiceInput}
                className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 ${
                  isRecording ? 'bg-error/10 text-error' : 'bg-primary/10 text-primary hover:bg-primary/20'
                }`}
              >
                <Mic className="h-4 w-4" />
              </button>
            )}
            {isRecording && (
              <div className="absolute left-0 top-full mt-1 text-xs text-primary">
                Listening... Say your message and click again to stop.
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={loading || (!input.trim() && !isRecording)}
            className="flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
}