import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

export type ErrorSeverity = 'info' | 'warning' | 'error' | 'fatal';

export interface AppError {
  id: string;
  message: string;
  severity: ErrorSeverity;
  code?: string;
  source?: string;
  timestamp: Date;
  data?: any;
  dismissable?: boolean;
}

interface ErrorContextType {
  errors: AppError[];
  addError: (error: Omit<AppError, 'id' | 'timestamp'>) => string;
  removeError: (id: string) => void;
  clearErrors: () => void;
  hasErrors: (severity?: ErrorSeverity) => boolean;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export function ErrorProvider({ children }: { children: ReactNode }) {
  const [errors, setErrors] = useState<AppError[]>([]);

  const addError = useCallback((error: Omit<AppError, 'id' | 'timestamp'>): string => {
    const id = `error-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const timestamp = new Date();
    
    const newError: AppError = {
      ...error,
      id,
      timestamp,
      dismissable: error.dismissable !== false
    };
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`[${newError.severity.toUpperCase()}] ${newError.message}`, {
        code: newError.code,
        source: newError.source,
        data: newError.data
      });
    }
    
    // Remove old errors of the same type to prevent the list from growing too large
    setErrors(prev => {
      const filtered = prev.filter(e => 
        e.source !== error.source || 
        e.code !== error.code || 
        Date.now() - e.timestamp.getTime() < 5000
      );
      return [...filtered, newError];
    });
    
    // Auto-dismiss info and warning errors after a timeout
    if ((error.severity === 'info' || error.severity === 'warning') && error.dismissable !== false) {
      setTimeout(() => {
        removeError(id);
      }, error.severity === 'info' ? 5000 : 10000);
    }
    
    return id;
  }, []);

  const removeError = useCallback((id: string) => {
    setErrors(prev => prev.filter(error => error.id !== id));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const hasErrors = useCallback((severity?: ErrorSeverity) => {
    if (severity) {
      return errors.some(error => error.severity === severity);
    }
    return errors.length > 0;
  }, [errors]);

  return (
    <ErrorContext.Provider value={{ 
      errors, 
      addError, 
      removeError, 
      clearErrors,
      hasErrors
    }}>
      {children}
    </ErrorContext.Provider>
  );
}

export function useError() {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
}