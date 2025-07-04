import { isDevelopment } from './environment';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Get current log level based on environment
const getCurrentLogLevel = (): number => {
  return isDevelopment() ? levels.debug : levels.info;
};

// Check if log level should be displayed
const shouldLog = (level: number): boolean => {
  return level <= getCurrentLogLevel();
};

// Format log message with timestamp
const formatMessage = (level: string, message: string, data?: any): string => {
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, -5);
  const dataStr = data ? ` ${JSON.stringify(data, null, 2)}` : '';
  return `${timestamp} ${level.toUpperCase()}: ${message}${dataStr}`;
};

// Export logger functions
export const logError = (message: string, data?: any): void => {
  if (shouldLog(levels.error)) {
    console.error(formatMessage('error', message, data));
  }
};

export const logWarn = (message: string, data?: any): void => {
  if (shouldLog(levels.warn)) {
    console.warn(formatMessage('warn', message, data));
  }
};

export const logInfo = (message: string, data?: any): void => {
  if (shouldLog(levels.info)) {
    console.info(formatMessage('info', message, data));
  }
};

export const logDebug = (message: string, data?: any): void => {
  if (shouldLog(levels.debug)) {
    console.debug(formatMessage('debug', message, data));
  }
};

export const logHttp = (message: string, data?: any): void => {
  if (shouldLog(levels.http)) {
    console.log(formatMessage('http', message, data));
  }
};

// Export a simple logger object for direct use
export const logger = {
  error: logError,
  warn: logWarn,
  info: logInfo,
  debug: logDebug,
  http: logHttp,
};