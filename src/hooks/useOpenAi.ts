import { useState } from 'react';
import { callOpenAiFunction } from '../utils/openai';
import { logError } from '../utils/logger';

export function useOpenAi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateResponse = async (prompt: string, context?: Record<string, any>) => {
    setLoading(true);
    setError(null);

    try {
      const response = await callOpenAiFunction(prompt, context);
      return response;
    } catch (err) {
      logError('OpenAI API error', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate response';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { generateResponse, loading, error };
}