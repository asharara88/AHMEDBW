// Remove direct OpenAI client initialization - use edge function proxy instead
export const openaiApi = {
  async createChatCompletion(messages: any[], options: any = {}) {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/openai-proxy`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        ...options
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API request failed: ${response.statusText}`);
    }

    return response.json();
  }
};