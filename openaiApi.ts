// openaiApi.ts

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function createChatCompletion(messages: ChatMessage[]) {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    const apiKey = process.env.OPENAI_API_KEY || '';
    if (apiKey) {
      headers["x-openai-key"] = apiKey;
    }

    const res = await fetch("/api/openai-proxy", {
      method: "POST",
      headers,
      body: JSON.stringify({ messages }),
    });

    if (!res.ok) {
      throw new Error(`AI service failed: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();

    if (!data || !data.result) {
      throw new Error("Invalid response format from AI service");
    }

    return data.result;
  } catch (err) {
    if (err instanceof Error) {
      throw err;
    }
    throw new Error("Unexpected error communicating with AI service");
  }
}

export async function generateResponse(prompt: string): Promise<string> {
  const messages: ChatMessage[] = [
    { role: 'user', content: prompt }
  ];

  return await createChatCompletion(messages);
}
