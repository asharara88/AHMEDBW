// Logger utility for consistent error logging across the application

/**
 * Log an error with a message and optional error object
 * @param message The error message
 * @param error Optional error object or additional details
 */
export function logError(message: string, error?: any): void {
  if (error) {
    // Handle different types of error objects
    if (error instanceof Error) {
      console.error(`[ERROR] ${message}:`, {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    } else if (typeof error === 'object') {
      // For objects like Supabase errors, try to extract useful information
      console.error(`[ERROR] ${message}:`, {
        error: error,
        message: error.message || 'No message',
        code: error.code || 'No code',
        details: error.details || 'No details',
        hint: error.hint || 'No hint'
      });
    } else {
      console.error(`[ERROR] ${message}:`, error);
    }
  } else {
    console.error(`[ERROR] ${message}`);
  }
  
  // In a production environment, you could send errors to a monitoring service
  // Example: sendToErrorMonitoring(message, error);
}

/**
 * Log a warning with a message and optional details
 * @param message The warning message
 * @param details Optional additional details
 */
export function logWarning(message: string, details?: any): void {
  console.warn(`[WARNING] ${message}:`, details);
}

/**
 * Log an informational message with optional details
 * @param message The info message
 * @param details Optional additional details
 */
export function logInfo(message: string, details?: any): void {
  console.info(`[INFO] ${message}:`, details);
}

/**
 * Log a debug message (only in development)
 * @param message The debug message
 * @param details Optional additional details
 */
export function logDebug(message: string, details?: any): void {
  if (import.meta.env.DEV) {
    console.debug(`[DEBUG] ${message}:`, details);
  }
}
