import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import ErrorDisplay from './ErrorDisplay';
import { useError } from '../../contexts/ErrorContext';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showReload?: boolean;
  errorComponent?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundaryBase extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Call onError prop if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      if (this.props.errorComponent) {
        return this.props.errorComponent;
      }
      
      return (
        <div className="flex min-h-[200px] flex-col items-center justify-center p-6">
          <AlertTriangle className="mb-4 h-12 w-12 text-error" />
          <h2 className="mb-2 text-xl font-bold">Something went wrong</h2>
          <p className="mb-4 text-text-light">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          {this.props.showReload !== false && (
            <button
              className="rounded-lg bg-primary px-4 py-2 font-medium text-white hover:bg-primary-dark"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </button>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrapper component that integrates with ErrorContext
export default function ErrorBoundary({ 
  children,
  onError,
  ...props
}: Props) {
  const { addError } = useError();
  
  // Custom onError handler that also adds to the global error state
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    // Add to global error context
    addError({
      message: error.message || 'An unexpected error occurred',
      severity: 'fatal',
      source: 'react-component',
      code: 'RENDER_ERROR',
      data: { 
        stack: error.stack,
        componentStack: errorInfo.componentStack
      }
    });
    
    // Call the original onError if provided
    if (onError) {
      onError(error, errorInfo);
    }
  };
  
  return (
    <ErrorBoundaryBase onError={handleError} {...props}>
      {children}
    </ErrorBoundaryBase>
  );
}