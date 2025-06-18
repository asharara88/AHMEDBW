import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader, AlertCircle } from 'lucide-react';
import { openaiApi } from '../api/openaiApi';

const TestOpenAI = () => {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    setLoading(true);
    setError(null);
    setResponse('');

    try {
      const result = await openaiApi.generateResponse(input);
      setResponse(result);
    } catch (err: any) {
      console.error("OpenAI API Error:", err);
      setError(err.message || "Failed to get response from OpenAI API");
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
        </div>
      </motion.div>
    </div>
  );
};

export default TestOpenAI;