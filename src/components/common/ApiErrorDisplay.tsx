import { AlertCircle } from 'lucide-react';
import { ApiError, ErrorType } from '../../api/apiClient';

interface ApiErrorDisplayProps {
  error: ApiError | null;
  className?: string;
}

/**
 * Component to display API errors with appropriate styling based on error type
 */
const ApiErrorDisplay = ({ error, className = '' }: ApiErrorDisplayProps) => {
  if (!error) return null;
  
  // Determine error message to display
  let displayMessage = error.message;
  
  // Customize message based on error type
  switch (error.type) {
    case ErrorType.AUTHENTICATION:
      displayMessage = error.message || 'Authentication error. Please sign in again.';
      break;
    case ErrorType.NETWORK:
      displayMessage = error.message || 'Network error. Please check your connection.';
      break;
    case ErrorType.SERVER:
      displayMessage = error.message || 'Server error. Please try again later.';
      break;
    case ErrorType.VALIDATION:
      displayMessage = error.message || 'Invalid data. Please check your input.';
      break;
    case ErrorType.UNKNOWN:
    default:
      displayMessage = error.message || 'An unexpected error occurred.';
      break;
  }
  
  return (
    <div className={`flex items-center gap-2 rounded-lg bg-error/10 p-3 text-sm text-error ${className}`}>
      <AlertCircle className="h-5 w-5 flex-shrink-0" />
      <p>{displayMessage}</p>
    </div>
  );
};

export default ApiErrorDisplay;