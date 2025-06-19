import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader, MessageCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { openaiApi } from '../../api/openaiApi';
import ApiErrorDisplay from '../common/ApiErrorDisplay';
import { ApiError, ErrorType } from '../../api/apiClient';
import ChatSettingsButton from './ChatSettingsButton';
import { useChatStore } from '../../store';
import { elevenlabsApi } from '../../api/elevenlabsApi';

export default function CoachChat() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const { user, isDemo } = useAuth();
  const { generateSpeech, preferSpeech } = useChatStore();

  const handleSend = async () => {
    if (!input.trim()) return;
    
    setLoading(true);
    setError(null);
    setResponse('');

    try {
      const userId = user?.id || (isDemo ? '00000000-0000-0000-0000-000000000000' : undefined);
      
      const content = await openaiApi.generateResponse(input, { userId });
      setResponse(content);
      
      // Generate speech if preferred
      if (preferSpeech && elevenlabsApi.isConfigured()) {
        try {
          await generateSpeech(content);
        } catch (speechError) {
          // Log but don't block the response if speech fails
          console.error("Speech generation failed:", speechError);
        }
      }
    } catch (err: any) {
      console.error("Chat error:", err);
      
      // Create a user-friendly error
      const apiError: ApiError = {
        type: ErrorType.UNKNOWN,
        message: err.message || "Failed to fetch response"
      };
      
      // If it's already an ApiError type, use it directly
      if (err.type) {
        setError(err as ApiError);
      } else {
        setError(apiError);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] shadow-sm">
      <div className="border-b border-[hsl(var(--color-border))] bg-[hsl(var(--color-card-hover))] p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <MessageCircle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-medium">Quick Coach Chat</h3>
            <p className="text-xs text-text-light">Ask a health question</p>
          </div>
          </div>
          <ChatSettingsButton />
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

        {error && <ApiErrorDisplay error={error} className="mt-4" />}
        
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