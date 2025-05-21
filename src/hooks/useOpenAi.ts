import { useApi } from './useApi';
import { supplementApi } from '../api/supplementApi';

/**
 * Hook for generating AI responses
 */
export function useOpenAi() {
  const { loading, error, execute } = useApi(
    supplementApi.getRecommendations,
    { errorMessage: 'Failed to generate response' }
  );

  const generateResponse = async (prompt: string, context?: Record<string, any>) => {
    return execute(prompt, context?.userId);
  };

  return { generateResponse, loading, error };
}