/**
 * Log levels for different types of messages
 */
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

/**
 * Enhanced logging utility with better error handling
 */
class Logger {
  private isDevelopment = import.meta.env.DEV;

  private formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    
    if (data) {
      return `${prefix} ${message}\n${JSON.stringify(data, null, 2)}`;
    }
    
    return `${prefix} ${message}`;
  }

  private safeStringify(data: any): string {
    try {
      return JSON.stringify(data, (key, value) => {
        // Handle circular references
        if (typeof value === 'object' && value !== null) {
          if (value instanceof Error) {
            return {
              name: value.name,
              message: value.message,
              stack: value.stack
            };
          }
        }
        return value;
      }, 2);
    } catch (error) {
      return `[Unable to stringify data: ${error instanceof Error ? error.message : String(error)}]`;
    }
  }

  error(message: string, data?: any): void {
    const formattedMessage = this.formatMessage(LogLevel.ERROR, message, data);
    
    if (this.isDevelopment) {
      console.error(formattedMessage);
      if (data) {
        console.error('Error data:', data);
      }
    }
    
    // In production, you might want to send errors to a logging service
    // Example: sendToLoggingService(LogLevel.ERROR, message, data);
  }

  warn(message: string, data?: any): void {
    const formattedMessage = this.formatMessage(LogLevel.WARN, message, data);
    
    if (this.isDevelopment) {
      console.warn(formattedMessage);
      if (data) {
        console.warn('Warning data:', data);
      }
    }
  }

  info(message: string, data?: any): void {
    const formattedMessage = this.formatMessage(LogLevel.INFO, message, data);
    
    if (this.isDevelopment) {
      console.info(formattedMessage);
      if (data) {
        console.info('Info data:', data);
      }
    }
  }

  debug(message: string, data?: any): void {
    if (!this.isDevelopment) return;
    
    const formattedMessage = this.formatMessage(LogLevel.DEBUG, message, data);
    console.debug(formattedMessage);
    
    if (data) {
      console.debug('Debug data:', data);
    }
  }
}

// Create singleton logger instance
const logger = new Logger();

// Export convenience functions
export const logError = (message: string, data?: any) => logger.error(message, data);
export const logWarn = (message: string, data?: any) => logger.warn(message, data);
export const logInfo = (message: string, data?: any) => logger.info(message, data);
export const logDebug = (message: string, data?: any) => logger.debug(message, data);

// Export the logger instance for advanced usage
export { logger };