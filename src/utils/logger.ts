export interface ErrorContext {
  [key: string]: unknown;
}

/**
 * Logs detailed error information with optional context.
 * @param message Description of the error context
 * @param error The error object or value
 * @param context Additional contextual information
 */
export function logError(message: string, error: unknown, context: ErrorContext = {}): void {
  const timestamp = new Date().toISOString();
  if (error instanceof Error) {
    console.error(`[${timestamp}] ${message}`, { message: error.message, stack: error.stack, ...context });
  } else {
    console.error(`[${timestamp}] ${message}`, { error, ...context });
  }
}
