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
    <div className="p-4 space-y-2">
      {messages.map((m, i) => (
        <div key={i}>
          <p className="font-semibold">{m.role === 'user' ? 'You' : 'Coach'}:</p>
          <p>
            {m.text}{' '}
            {m.link && (
              <a
                href={m.link}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 underline"
              >
                Study ↗
              </a>
            )}
          </p>
        </div>
      ))}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="What's your goal?"
        className="border p-2 rounded w-full"
      />
      <button
        onClick={handleSend}
        className="p-2 mt-2 bg-blue-500 text-white rounded w-full"
      >
        Send
      </button>
    </div>
  );
}
