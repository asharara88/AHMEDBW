import { useState } from 'react';

export default function CoachChat() {
  const [messages, setMessages] = useState<any[]>([]);
  const [userInput, setUserInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    if (!userInput.trim()) return;

    const newMessages = [...messages, { role: 'user', content: userInput }];
    setMessages(newMessages);
    setUserInput('');
    setError(null);

    try {
      const res = await fetch('/api/openai-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok) throw new Error('Server error');

      const data = await res.json();
      setMessages([...newMessages, { role: 'assistant', content: data.result }]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setError(err.message || 'There was an issue generating a response. Please try again later.');
    }
  };

  return (
    <div>
      <div className="chat-window">
        {messages.map((msg, i) => (
          <div key={i} className={msg.role}>{msg.content}</div>
        ))}
        {error && <div className="error">{error}</div>}
      </div>
      <input
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        placeholder="Type your question..."
      />
      <button onClick={handleSend}>Send</button>
    </div>
  );
}
