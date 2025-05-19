import { useState } from 'react';
import { useChatApi } from '../../hooks/useChatApi';

export default function ChatButton() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState('');
  const { sendMessage, error } = useChatApi();

  const handleClick = async () => {
    setLoading(true);
    setResponse('');

    try {
      const messages = [
        { role: 'user', content: 'Give me a daily wellness tip.' }
      ];

      const reply = await sendMessage(messages);
      setResponse(reply || 'No response received.');
    } catch (err) {
      console.error('Error in chat:', err);
      setResponse('Failed to fetch assistant reply.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4 border border-[hsl(var(--color-border))] rounded-lg shadow-sm bg-[hsl(var(--color-card))] max-w-md mx-auto mt-10">
      <button
        onClick={handleClick}
        disabled={loading}
        className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 w-full"
      >
        {loading ? 'Thinking...' : 'Get Wellness Tip'}
      </button>
      
      {error && (
        <div className="bg-error/10 p-3 rounded-lg text-sm text-error">
          {error}
        </div>
      )}
      
      {response && (
        <div className="bg-[hsl(var(--color-surface-1))] p-3 rounded-lg text-sm">
          <strong>Coach:</strong> {response}
        </div>
      )}
    </div>
  );
}