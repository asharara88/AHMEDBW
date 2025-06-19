import { useState, useCallback } from 'react';
import { ApiError, ErrorType } from '../api/apiClient';

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: ApiError) => void;
  errorMessage?: string;
}

/**
 * A hook for making API calls with loading and error states
 */
export function useApi<T>(
  apiFunction: (...args: any[]) => Promise<T>,
  options: UseApiOptions = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const execute = useCallback(
    async (...args: any[]) => {
      setLoading(true);
      setError(null);

      try {
        const result = await apiFunction(...args);
        setData(result);
        options.onSuccess?.(result);
        return result;
      } catch (err) {
        const apiError = err as ApiError;
        
        // Set a default error message if none is provided
        if (!apiError.message && options.errorMessage) {
          apiError.message = options.errorMessage;
        }
        
        setError(apiError);
        options.onError?.(apiError);
        
        // Handle authentication errors
        if (apiError.type === ErrorType.AUTHENTICATION) {
          // Redirect to login or refresh token
          if (window.location.pathname !== '/login') {
            sessionStorage.setItem('redirectUrl', window.location.pathname);
          }
        }
        
        throw apiError;
      } finally {
        setLoading(false);
      }
    },
    [apiFunction, options]
  );

  return {
    data,
    loading,
    error,
    execute,
    setData,
    reset: () => {
      setData(null);
      setError(null);
    }
  };
}