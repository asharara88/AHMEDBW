import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader, AlertCircle, MessageCircle } from 'lucide-react';
import { useChatApi } from '../../hooks/useChatApi';
import { useAuth } from '../../contexts/AuthContext';

export default function CoachChat() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, isDemo } = useAuth();
  const { sendMessage } = useChatApi();

  const handleSend = async () => {
    if (!input.trim()) return;
    
    setLoading(true);
    setError('');
    setResponse('');

    try {
      const messages = [{ role: 'user', content: input }];
      const userId = user?.id || (isDemo ? '00000000-0000-0000-0000-000000000000' : undefined);
      
      const content = await sendMessage(messages, userId);
      setResponse(content);
    } catch (err: any) {
      setError(err.message || "Failed to fetch");
      console.error("Chat error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] shadow-sm">
      <div className="border-b border-[hsl(var(--color-border))] bg-[hsl(var(--color-card-hover))] p-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <img 
              src={currentTheme === 'dark' 
                ? 'https://leznzqfezoofngumpiqf.supabase.co/storage/v1/object/sign/logos/white%20Log%20trnspt%20bg.svg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5X2UyYTcyNGEyLTZkNTctNDk4YS04ZGU1LWY2Y2Q4MjAyNjA3YiJ9.eyJ1cmwiOiJsb2dvcy93aGl0ZSBMb2cgdHJuc3B0IGJnLnN2ZyIsImlhdCI6MTc0NzI3MzEwNywiZXhwIjoxNzc4ODA5MTA3fQ.GI2ed8ie67PgVxVEoJsSWQXsv_Zki1V5ub7jfQCW-hg'
                : 'https://leznzqfezoofngumpiqf.supabase.co/storage/v1/object/sign/logos/logo-light.svg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5X2UyYTcyNGEyLTZkNTctNDk4YS04ZGU1LWY2Y2Q4MjAyNjA3YiJ9.eyJ1cmwiOiJsb2dvcy9sb2dvLWxpZ2h0LnN2ZyIsImlhdCI6MTc0NzI3MzIwMSwiZXhwIjoxNzc4ODA5MjAxfQ.i8q67OTuH9eIiXxe8EaePs3JRxRuPhexJfsSzT4Q0iQ'
              }
              alt="Biowell Logo" 
              className="h-5 w-5"
              loading="lazy"
            />
          </div>
          <div>
            <h3 className="text-sm font-medium">Quick Coach Chat</h3>
            <p className="text-xs text-text-light">Ask a health question</p>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <div className="mb-4">
          <input
            className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-3 py-2 text-text placeholder:text-text-light focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="e.g. give me a supplement stack for sleep"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                <span>Thinking...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Ask</span>
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-error/10 p-3 text-sm text-error">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        )}
        
        {response && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-4"
          >
            <h4 className="mb-2 text-sm font-medium">Coach Response:</h4>
            <div className="prose prose-sm max-w-none whitespace-pre-wrap text-text-light">
              {response}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}