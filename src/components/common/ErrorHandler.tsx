import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiError, ErrorType } from '../../api/apiClient';
import { useAuthStore } from '../../store';
import { logError } from '../../utils/logger';
import { refreshSessionIfNeeded } from '../../lib/sessionManager';
import { onConnectionError } from '../../utils/supabaseConnection';

/**
 * Global error handler component that handles API errors
 * This should be mounted at the app level
 */
const ErrorHandler = () => {
  const { refreshSession } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    // Create a global error handler for unhandled promise rejections
    const handleUnhandledRejection = async (event: PromiseRejectionEvent) => {
      const error = event.reason;
      
      // Check if it's an API error
      if (error && typeof error === 'object' && 'type' in error) {
        const apiError = error as ApiError;
        
        // Handle authentication errors
        if (apiError.type === ErrorType.AUTHENTICATION) {
          logError('Authentication error detected', apiError);
          
          // Try to refresh the session
          try {
            const session = await refreshSessionIfNeeded();
            if (!session) {
              // If refresh fails, redirect to login
              // Save the current URL to redirect back after login
              if (window.location.pathname !== '/login') {
                sessionStorage.setItem('redirectUrl', window.location.pathname);
              }
              
              navigate('/login', { replace: true });
            }
          } catch (refreshError) {
            logError('Session refresh failed', refreshError);
            navigate('/login', { replace: true });
          }
        }
        
        // Handle network errors
        if (apiError.type === ErrorType.NETWORK) {
          // Could show a toast notification here
          logError('Network error detected', apiError);
        }
        
        // Handle server errors
        if (apiError.type === ErrorType.SERVER) {
          // Could show a toast notification here
          logError('Server error detected', apiError);
        }
      }
    };

    // Add event listener for Supabase connection errors
    const handleConnectionError = (event: CustomEvent) => {
      // Show a user-friendly notification
      const notification = document.createElement('div');
      notification.style.position = 'fixed';
      notification.style.bottom = '20px';
      notification.style.right = '20px';
      notification.style.backgroundColor = '#f8d7da';
      notification.style.color = '#721c24';
      notification.style.padding = '10px 20px';
      notification.style.borderRadius = '4px';
      notification.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
      notification.style.zIndex = '9999';
      notification.textContent = event.detail.message || 'Connection error. The app will continue in offline mode.';
      
      document.body.appendChild(notification);
      
      // Remove after 5 seconds
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 5000);
    };

    // Add event listeners
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    const removeConnectionListener = onConnectionError(handleConnectionError);

    // Cleanup
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      removeConnectionListener();
    };
  }, [refreshSession, navigate]);

  // This component doesn't render anything
  return null;
};

export default ErrorHandler;