import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, XCircle, AlertTriangle, Info, X, XSquare } from 'lucide-react';
import { useError, AppError, ErrorSeverity } from '../../contexts/ErrorContext';

interface ErrorDisplayProps {
  error?: AppError;
  dismissable?: boolean;
  className?: string;
  showIcon?: boolean;
  compact?: boolean;
  variant?: 'toast' | 'inline' | 'banner';
  onDismiss?: () => void;
}

function getErrorIcon(severity: ErrorSeverity) {
  switch (severity) {
    case 'info':
      return <Info />;
    case 'warning':
      return <AlertTriangle />;
    case 'error':
    case 'fatal':
      return <XCircle />;
    default:
      return <AlertCircle />;
  }
}

function getErrorColor(severity: ErrorSeverity) {
  switch (severity) {
    case 'info':
      return 'bg-blue-500/10 text-blue-500 dark:bg-blue-500/20 dark:text-blue-400';
    case 'warning':
      return 'bg-amber-500/10 text-amber-500 dark:bg-amber-500/20 dark:text-amber-400';
    case 'error':
      return 'bg-error/10 text-error dark:bg-error/20 dark:text-error';
    case 'fatal':
      return 'bg-red-900/10 text-red-900 dark:bg-red-900/20 dark:text-red-500';
    default:
      return 'bg-gray-500/10 text-gray-500 dark:bg-gray-500/20 dark:text-gray-400';
  }
}

// Component to display a single error
export function SingleErrorDisplay({ 
  error, 
  dismissable = true, 
  className = '', 
  showIcon = true, 
  compact = false,
  variant = 'inline',
  onDismiss 
}: ErrorDisplayProps) {
  const { removeError } = useError();

  if (!error) return null;

  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss();
    } else if (error.id) {
      removeError(error.id);
    }
  };

  const errorColor = getErrorColor(error.severity);
  const Icon = () => {
    const iconComponent = getErrorIcon(error.severity);
    return React.cloneElement(iconComponent, { 
      className: `${compact ? 'h-4 w-4' : 'h-5 w-5'} flex-shrink-0` 
    });
  };

  // Determine styles based on the variant
  let variantStyles = '';
  switch (variant) {
    case 'toast':
      variantStyles = 'fixed top-4 right-4 z-50 max-w-md shadow-lg';
      break;
    case 'banner':
      variantStyles = 'w-full';
      break;
    default:
      variantStyles = '';
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex items-start gap-2 rounded-lg p-3 ${compact ? 'py-2 text-xs' : 'p-3 text-sm'} ${errorColor} ${variantStyles} ${className}`}
    >
      {showIcon && <Icon />}
      <div className="flex-1 pr-6">
        <p>{error.message}</p>
        {error.code && !compact && (
          <p className="mt-1 text-xs opacity-80">Error code: {error.code}</p>
        )}
      </div>
      {(dismissable || error.dismissable) && (
        <button
          onClick={handleDismiss}
          className="rounded-full p-1 hover:bg-black/10"
          aria-label="Dismiss error"
        >
          <X className={compact ? "h-3 w-3" : "h-4 w-4"} />
        </button>
      )}
    </motion.div>
  );
}

// Component to display all active errors
export default function ErrorDisplay({ 
  className = '', 
  variant = 'inline',
  showIcon = true,
  compact = false
}: Omit<ErrorDisplayProps, 'error' | 'dismissable' | 'onDismiss'>) {
  const { errors, removeError, clearErrors } = useError();

  if (errors.length === 0) return null;

  // If there's only one error, just display it
  if (errors.length === 1) {
    return (
      <SingleErrorDisplay
        error={errors[0]}
        className={className}
        variant={variant}
        showIcon={showIcon}
        compact={compact}
      />
    );
  }

  // For multiple errors, display them in a container with a clear all button
  return (
    <div className={`space-y-2 ${className}`}>
      {variant === 'banner' && errors.length > 1 && (
        <div className="flex items-center justify-between bg-gray-100 p-2 dark:bg-gray-800">
          <span className="text-sm font-medium">{errors.length} errors</span>
          <button
            onClick={clearErrors}
            className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Clear all
          </button>
        </div>
      )}

      <AnimatePresence>
        {errors.map(error => (
          <SingleErrorDisplay
            key={error.id}
            error={error}
            className={className}
            variant={variant}
            showIcon={showIcon}
            compact={compact}
          />
        ))}
      </AnimatePresence>

      {variant !== 'banner' && errors.length > 1 && (
        <div className="flex justify-end">
          <button
            onClick={clearErrors}
            className="flex items-center gap-1 rounded-md bg-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            <XSquare className="h-3 w-3" />
            <span>Clear all errors</span>
          </button>
        </div>
      )}
    </div>
  );
}