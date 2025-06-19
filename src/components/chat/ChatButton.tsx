import { useState } from 'react';
import { Loader, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { openaiApi } from '../../api/openaiApi';

export default function ChatButton() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { user, isDemo } = useAuth();

  const handleClick = async () => {
    setLoading(true);
    setResponse('');
    setError(null);

    try {
      const prompt = 'Give me a daily wellness tip.';
      const userId = user?.id || (isDemo ? '00000000-0000-0000-0000-000000000000' : undefined);
      
      const reply = await openaiApi.generateResponse(prompt, { userId });
      setResponse(reply || 'No response received.');
    } catch (err: any) {
      console.error('Error in chat:', err);
      
      // Provide user-friendly error messages
      let userMessage = 'Failed to fetch assistant reply.';
      
      if (err.message) {
        if (err.message.includes('API key')) {
          userMessage = 'AI service is not properly configured. Please contact support.';
        } else if (err.message.includes('rate limit')) {
          userMessage = 'Too many requests. Please try again in a moment.';
        } else if (err.message.includes('quota')) {
          userMessage = 'Service temporarily unavailable. Please try again later.';
        } else if (err.message.includes('network') || err.message.includes('connection')) {
          userMessage = 'Connection issue. Please check your internet and try again.';
        } else {
          userMessage = err.message;
        }
      }
      
      setError(userMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    handleClick();
  };

  return (
    <div className="p-6 space-y-4 border border-[hsl(var(--color-border))] rounded-lg shadow-sm bg-[hsl(var(--color-card))] max-w-md mx-auto">
      <button
        onClick={handleClick}
        disabled={loading}
        className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
      >
        {loading ? (
          <>
            <Loader className="h-4 w-4 animate-spin" />
            Getting your wellness tip...
          </>
        ) : (
          'Get Daily Wellness Tip'
        )}
      </button>
      
      {error && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 bg-error/10 p-3 rounded-lg text-sm text-error">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
          <button
            onClick={handleRetry}
            disabled={loading}
            className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        </div>
      )}
      
      {response && (
        <div className="bg-[hsl(var(--color-surface-1))] p-4 rounded-lg text-sm">
          <h3 className="font-medium mb-2">Today's Wellness Tip:</h3>
          <p className="text-text-light whitespace-pre-wrap">{response}</p>
        </div>
      )}
    </div>
  );
}