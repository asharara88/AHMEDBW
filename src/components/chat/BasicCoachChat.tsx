import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

interface Message {
  role: 'user' | 'coach';
  text: string;
}

export default function BasicCoachChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', text: input } as Message;
    setMessages((m) => [...m, userMsg]);

    const { data } = await supabase
      .from('supplements')
      .select('*')
      .ilike('goal', `%${input}%`);

    if (data && data.length > 0) {
      const s = data[0];
      const coachText = `Got it! Based on your goal, I suggest ${s.name}. ${s.evidence_summary}. [link](${s.source_link})`;
      setMessages((m) => [...m, { role: 'coach', text: coachText }]);
    } else {
      setMessages((m) => [...m, { role: 'coach', text: 'No matching supplements found.' }]);
    }

    setInput('');
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {messages.map((m, idx) => (
          <div key={idx} className={m.role === 'user' ? 'text-right' : ''}>
            <span className="inline-block rounded px-3 py-2" style={{background:m.role==='user'? '#4f46e5':'#e5e7eb', color:m.role==='user'?'#fff':'#000'}}>
              {m.text}
            </span>
          </div>
        ))}
      </div>
      <div className="border-t p-2">
        <div className="flex gap-2">
          <input
            className="flex-1 rounded border p-2"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message"
          />
          <button
            className="rounded bg-primary px-4 py-2 text-white"
            onClick={handleSend}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
