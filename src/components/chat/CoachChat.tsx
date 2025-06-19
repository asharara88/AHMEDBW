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
 codex/fix-chat-error-handling
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

      const userId = user?.id || (isDemo ? '00000000-0000-0000-0000-000000000000' : undefined);
      
      const content = await openaiApi.generateResponse(input, { userId });
      setResponse(content);
      
      // Generate speech if preferred
      if (preferSpeech && elevenlabsApi.isConfigured()) {
        try {
          await generateSpeech(content);
        } catch (speechError) {
          // Log but don't block the response if speech fails
          console.error("Speech generation failed:", speechError);
        }
      }
    } catch (err: any) {
      console.error("Chat error:", err);
      
      // Create a user-friendly error
      const apiError: ApiError = {
        type: ErrorType.UNKNOWN,
        message: err.message || "Failed to fetch response"
      };
      
      // If it's already an ApiError type, use it directly
      if (err.type) {
        setError(err as ApiError);
      } else {
        setError(apiError);
      }
    } finally {
      setLoading(false);
 main
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
