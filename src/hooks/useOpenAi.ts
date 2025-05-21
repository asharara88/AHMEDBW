import { useState } from 'react';
import { openaiApi } from '../api/openaiApi';

export function useOpenAi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateResponse = async (prompt: string, context?: Record<string, any>) => {
    setLoading(true);
    setError(null);

    try {
      const response = await openaiApi.generateResponse(prompt, context);
      return response;
    } catch (err) {
      console.error("OpenAI API error:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to generate response";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { generateResponse, loading, error };
}