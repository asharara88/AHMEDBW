import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader, AlertCircle } from 'lucide-react';
import { openaiApi } from '../api/openaiApi';
import { useAuth } from '../contexts/AuthContext';

const TestOpenAI = () => {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, isDemo } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    setLoading(true);
    setError(null);
    setResponse('');

    try {
      // Pass the userId as context if available (for authenticated or demo users)
      const userId = user?.id || (isDemo ? '00000000-0000-0000-0000-000000000000' : undefined);
      const context = userId ? { userId, source: 'test-page' } : undefined;
      
      const result = await openaiApi.generateResponse(input, context);
      setResponse(result);
    } catch (err: any) {
      console.error("OpenAI API Error:", err);
      
      // Provide a more user-friendly error message based on error type
      let errorMessage = "Failed to get response from OpenAI API";
      
      if (err.message) {
        if (err.message.includes('API key')) {
          errorMessage = "OpenAI API key is not configured properly. Please check your Supabase settings.";
        } else if (err.message.includes('Authentication')) {
          errorMessage = "Authentication required. Please log in or use demo mode.";
        } else if (err.message.includes('rate limit')) {
          errorMessage = "Rate limit exceeded. Please try again later.";
        } else if (err.message.includes('network') || err.message.includes('fetch')) {
          errorMessage = "Network error. Please check your internet connection.";
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-2xl"
      >
        <div className="mb-6">
          <h1 className="text-2xl font-bold md:text-3xl">OpenAI API Test</h1>
          <p className="text-text-light">
            Test the OpenAI API integration by sending a message
          </p>
          
          {!user && !isDemo && (
            <div className="mt-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
              You are not logged in. The API may require authentication. Consider using the demo mode.
            </div>
          )}
          
          {isDemo && (
            <div className="mt-2 rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-300">
              You are in demo mode. The API should work with demo credentials.
            </div>
          )}
        </div>

        <div className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-6">
          <form onSubmit={handleSubmit} className="mb-4">
            <div className="mb-4">
              <label htmlFor="prompt" className="mb-2 block text-sm font-medium text-text-light">
                Enter your prompt:
              </label>
              <input
                id="prompt"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-4 py-2"
                placeholder="e.g., Tell me a health tip about sleeping better"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  Getting response...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  Send to OpenAI
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-error/10 p-3 text-sm text-error">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {response && (
            <div className="mt-6">
              <h2 className="mb-2 text-lg font-semibold">Response:</h2>
              <div className="rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-4">
                <p className="whitespace-pre-wrap">{response}</p>
              </div>
            </div>
          )}
          
          <div className="mt-6 rounded-lg bg-[hsl(var(--color-surface-1))] p-3">
            <h3 className="text-sm font-medium mb-2">API Information</h3>
            <div className="space-y-2 text-xs text-text-light">
              <p>Integration type: Supabase Edge Function Proxy</p>
              <p>Authentication: {user ? "Authenticated user" : isDemo ? "Demo user" : "Not authenticated"}</p>
              <p>User ID: {user?.id || (isDemo ? "00000000-0000-0000-0000-000000000000" : "Not available")}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TestOpenAI;