import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { logError } from '../../utils/logger';

interface ActionFetchBlockProps {
  id: string;
  label: string;
  placeholder: string;
  variable: string;
  supabaseUrl: string;
}

const ActionFetchBlock = ({
  id,
  label,
  placeholder,
  variable,
  supabaseUrl
}: ActionFetchBlockProps) => {
  const [userInput, setUserInput] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(supabaseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: userInput,
          user_id: user?.id || 'anonymous',
          context: {
            steps: 8432,
            sleep_score: 82,
            goal: "improve deep sleep",
            device: "Apple Watch"
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setAiResponse(data.response || data.message || JSON.stringify(data));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      logError('Fetch error', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto my-4">
      <form onSubmit={handleSubmit} className="space-y-2">
        <label htmlFor={id} className="block text-sm font-medium text-text-light">
          {label}
        </label>
        <div className="flex gap-2">
          <input
            id={id}
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder={placeholder}
            className="flex-1 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-3 py-2 text-text placeholder:text-text-light focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            data-variable={variable}
          />
          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-2 text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!userInput.trim() || loading}
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>

      {error && (
        <div className="mb-2 flex items-center gap-2 rounded-lg bg-error/10 p-2 text-xs text-error">
          <AlertCircle className="h-3 w-3 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}
      
      {aiResponse && (
        <div className="mt-4 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-4">
          <h3 className="mb-2 text-sm font-medium">Response:</h3>
          <div className="text-sm whitespace-pre-wrap">{aiResponse}</div>
        </div>
      )}
    </div>
  );
};

export default ActionFetchBlock;