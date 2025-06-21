// pages/chat.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function ChatCoach() {
  const [messages, setMessages] = useState([] as any[]);
  const [input, setInput] = useState('');

  const fetchSupplement = async (keyword: string) => {
    const { data } = await supabase
      .from('supplements')
      .select('*')
      .ilike('goal', `%${keyword.toLowerCase()}%`);

    if (data && data.length > 0) {
      const s = data[0];
      setMessages((prev) => [
        ...prev,
        {
          role: 'coach',
          text: `Got it! Based on your goal, I suggest ${s.name}. ${s.evidence_summary}.`,
          link: s.source_link,
        },
      ]);
    } else {
      setMessages((prev) => [
        ...prev,
        { role: 'coach', text: "Hmm, I couldn't find a supplement for that goal yet." },
      ]);
    }
  };

  useEffect(() => {
    const storedGoal = localStorage.getItem('goal');
    if (storedGoal && messages.length === 0) {
      fetchSupplement(storedGoal);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    setMessages([...messages, { role: 'user', text: input }]);
    await fetchSupplement(input);
    setInput('');
  };

  return (
    <div className="p-4 space-y-4">
      {messages.map((m, i) => (
        <div
          key={i}
          className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-xs rounded-lg px-3 py-2 text-sm ${
              m.role === 'user'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            <span>
              {m.text}{' '}
              {m.link && (
                <a
                  href={m.link}
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  Study ↗
                </a>
              )}
            </span>
          </div>
        </div>
      ))}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What's your goal?"
          className="flex-1 rounded border p-2"
        />
        <button
          onClick={handleSend}
          className="rounded bg-blue-500 px-4 py-2 text-white"
        >
          Send
        </button>
      </div>
    </div>
  );
}