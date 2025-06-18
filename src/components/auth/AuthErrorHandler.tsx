import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { logError } from '../../utils/logger';

/**
 * Component to handle authentication errors globally
 * This component should be mounted at the app level to catch and handle auth errors
 */
const AuthErrorHandler = () => {
  const { refreshSession } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Function to handle API response errors
    const handleApiResponse = async (response: Response) => {
      // Check if the response is from Supabase auth endpoint
      if (response.url.includes('/auth/v1/') && !response.ok) {
        try {
          const errorData = await response.clone().json();
          
          // Handle specific auth errors
          if (response.status === 400 && 
              (errorData.error?.includes('Invalid Refresh Token') || 
               errorData.error?.includes('Refresh Token Not Found'))) {
            logError('Auth error detected', errorData.error);
            
            // Try to refresh the session
            try {
              await refreshSession();
            } catch (refreshError) {
              // If refresh fails, redirect to login
              logError('Session refresh failed', refreshError);
              navigate('/login', { replace: true });
            }
          }
        } catch (parseError) {
          logError('Error parsing API response', parseError);
        }
      }
    };

    // Create a fetch interceptor
    const originalFetch = window.fetch;
    window.fetch = async function(input, init) {
      // Add credentials to all requests
      const modifiedInit = {
        ...init,
        credentials: 'include'
      };

      try {
        const response = await originalFetch(input, modifiedInit);
        await handleApiResponse(response);
        return response;
      } catch (error) {
        // Log network errors for easier debugging
        logError('Network request failed', error);
        throw error;
      }
    };

    // Cleanup function to restore original fetch
    return () => {
      window.fetch = originalFetch;
    };
  }, [refreshSession, navigate]);

  // This component doesn't render anything
  return null;
};

export default AuthErrorHandler;