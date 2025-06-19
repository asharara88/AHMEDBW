import { useState } from 'react';
import { Send, Loader, AlertCircle } from 'lucide-react';
import { openaiApi } from '../api/openaiApi';

export default function TestOpenAI() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) return;
    
    setLoading(true);
    setError(null);
    setResponse('');

    try {
      const result = await openaiApi.generateResponse(prompt);
      setResponse(result);
    } catch (err: any) {
      console.error('OpenAI error:', err);
      setError(err.message || 'Failed to generate response');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">OpenAI API Test</h1>
      
      <div className="mb-8 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-6 shadow-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="prompt" className="mb-2 block font-medium">
              Enter a prompt for OpenAI
            </label>
            <textarea
              id="prompt"
              className="h-32 w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-3"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., Write a paragraph about the benefits of regular exercise"
            ></textarea>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  <span>Submit</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-error/10 p-4 text-error">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-medium">Error</p>
              <p>{error}</p>
            </div>
          </div>
          <div className="mt-2 rounded-lg bg-[hsl(var(--color-surface-1))] p-4 text-sm">
            <p className="font-medium">Troubleshooting Tips:</p>
            <ul className="mt-2 list-disc pl-5 text-text-light">
              <li>Check if the OpenAI API key is set as a Supabase secret</li>
              <li>Make sure the Edge Function is deployed</li>
              <li>Verify your API key has sufficient credits</li>
            </ul>
          </div>
        </div>
      )}

      {response && (
        <div className="rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-6 shadow-md">
          <h2 className="mb-4 text-xl font-bold">Response</h2>
          <div className="rounded-lg bg-[hsl(var(--color-surface-1))] p-4">
            <pre className="whitespace-pre-wrap text-text">{response}</pre>
          </div>
        </div>
      )}
    </div>
  );
}