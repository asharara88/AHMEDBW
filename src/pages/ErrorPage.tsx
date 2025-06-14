import { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AlertOctagon, Home, RefreshCw, ArrowLeft } from 'lucide-react';
import Logo from '../components/common/Logo';

const ErrorPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract error information from location state if available
  const errorInfo = location.state?.error || {
    title: 'Something went wrong',
    message: 'We encountered an unexpected error. Please try again later.',
    code: 'UNKNOWN_ERROR'
  };

  useEffect(() => {
    // Log the error for debugging
    console.error('Error page loaded with error:', errorInfo);
  }, [errorInfo]);

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background-alt p-4">
      <div className="w-full max-w-md rounded-xl bg-background p-8 shadow-lg">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        
        <div className="mb-8 flex justify-center">
          <div className="rounded-full bg-error/10 p-6">
            <AlertOctagon className="h-16 w-16 text-error" />
          </div>
        </div>
        
        <h1 className="mb-2 text-center text-2xl font-bold">
          {errorInfo.title || 'Something went wrong'}
        </h1>
        
        <p className="mb-6 text-center text-text-light">
          {errorInfo.message || 'We encountered an unexpected error. Please try again later.'}
        </p>

        {errorInfo.code && (
          <div className="mb-6 rounded-lg bg-[hsl(var(--color-surface-1))] p-3">
            <p className="text-center text-sm text-text-light">
              Error code: <code className="rounded bg-[hsl(var(--color-surface-2))] px-2 py-1 font-mono">{errorInfo.code}</code>
            </p>
          </div>
        )}
        
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={handleGoBack}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-4 py-3 font-medium text-text transition-colors hover:bg-[hsl(var(--color-card-hover))]"
          >
            <ArrowLeft className="h-5 w-5" />
            Go Back
          </button>
          
          <button
            onClick={handleRefresh}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-4 py-3 font-medium text-text transition-colors hover:bg-[hsl(var(--color-card-hover))]"
          >
            <RefreshCw className="h-5 w-5" />
            Refresh
          </button>
        </div>
        
        <div className="mt-4 text-center">
          <Link to="/" className="flex items-center justify-center gap-2 text-sm text-primary hover:text-primary-dark">
            <Home className="h-4 w-4" />
            Return to Home
          </Link>
        </div>
      </div>
      
      <p className="mt-8 text-center text-sm text-text-light">
        If the problem persists, please contact support.
      </p>
    </div>
  );
};

export default ErrorPage;