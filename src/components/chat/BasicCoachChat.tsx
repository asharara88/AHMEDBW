import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'coach';
  text: string;
}

export default function BasicCoachChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', text: input } as Message;
    setMessages((m) => [...m, userMsg]);
    setLoading(true);

    try {
      const res = await fetch('/functions/v1/match_supplement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: input }),
      });

      if (!res.ok) throw new Error('Request failed');

      const data = await res.json();
      const results = data.results as any[] | undefined;

      if (results && results.length > 0) {
        const s = results[0];
        const coachText = `Got it! I suggest **${s.name}**. ${s.evidence_summary} [Study ↗](${s.source_link})`;
        setMessages((m) => [...m, { role: 'coach', text: coachText }]);
      } else {
        setMessages((m) => [
          ...m,
          { role: 'coach', text: 'Hmm, I couldn\u2019t find a perfect match for that goal yet.' },
        ]);
      }
    } catch (error) {
      setMessages((m) => [
        ...m,
        { role: 'coach', text: 'Hmm, I couldn\u2019t find a perfect match for that goal yet.' },
      ]);
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-xs rounded-lg px-3 py-2 text-sm ${
                m.role === 'user'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-white'
              }`}
            >
              {m.role === 'coach' ? (
                <ReactMarkdown className="prose prose-sm break-words">
                  {m.text}
                </ReactMarkdown>
              ) : (
                <span>{m.text}</span>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="max-w-xs rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-500 dark:bg-gray-700 dark:text-gray-400">
              thinking...
            </div>
          </div>
        )}
      </div>
      <div className="border-t p-2">
        <div className="flex gap-2">
          <input
            className="flex-1 rounded-lg border p-2"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message"
            disabled={loading}
          />
          <button
            className="rounded-lg bg-primary px-4 py-2 text-white disabled:opacity-50"
            onClick={handleSend}
            disabled={loading || !input.trim()}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
