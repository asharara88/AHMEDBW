import { useState, useEffect, useCallback } from 'react';
import { useError } from '../contexts/ErrorContext';
import { handleApiError, ErrorCode, createErrorObject } from '../utils/errorHandling';

interface FetchOptions extends RequestInit {
  timeout?: number; // Timeout in milliseconds
}

interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: (options?: FetchOptions) => Promise<T | null>;
}

export function useFetch<T>(url: string, options?: FetchOptions): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { addError } = useError();

  const fetchData = useCallback(async (fetchOptions?: FetchOptions) => {
    const mergedOptions = { ...options, ...fetchOptions };
    setLoading(true);
    setError(null);

    try {
      const controller = new AbortController();
      const { signal } = controller;
      
      // Set up timeout if specified
      let timeoutId: NodeJS.Timeout | undefined;
      if (mergedOptions?.timeout) {
        timeoutId = setTimeout(() => {
          controller.abort();
        }, mergedOptions.timeout);
      }
      
      // Add signal to options
      const fetchOptions = {
        ...mergedOptions,
        signal
      };
      
      const response = await fetch(url, fetchOptions);
      
      // Clear timeout if it was set
      if (timeoutId) clearTimeout(timeoutId);
      
      // Handle non-OK responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorObject = handleApiError({
          status: response.status,
          statusText: response.statusText,
          ...errorData
        });
        
        addError({
          ...errorObject,
          data: { url, status: response.status, ...errorData }
        });
        
        throw new Error(errorObject.message);
      }
      
      // Parse response data
      const responseData: T = await response.json();
      setData(responseData);
      return responseData;
    } catch (error: any) {
      // Handle specific abort error (timeout or user cancellation)
      if (error.name === 'AbortError') {
        const errorObject = createErrorObject(
          'Request timed out. Please try again.',
          'error',
          ErrorCode.API_TIMEOUT,
          'api',
          { url }
        );
        addError(errorObject);
        setError(new Error(errorObject.message));
      } else {
        // Handle all other errors
        const apiError = handleApiError(error);
        addError({
          ...apiError,
          data: { url, ...apiError.data }
        });
        setError(new Error(apiError.message));
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [url, options, addError]);

  useEffect(() => {
    if (url) {
      fetchData();
    }
  }, [fetchData, url]);

  return { data, loading, error, refetch: fetchData };
}