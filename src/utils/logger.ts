import winston from 'winston';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define log colors
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Add colors to winston
winston.addColors(colors);

// Define logger format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Define transport options
const transports = [
  new winston.transports.Console(),
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
  }),
  new winston.transports.File({ filename: 'logs/all.log' }),
];

// Create the logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  levels,
  format,
  transports,
});

// Export logger functions
export const logError = (message: string, data?: any): void => {
  logger.error(`${message} ${data ? JSON.stringify(data, null, 2) : ''}`);
};

export const logWarn = (message: string, data?: any): void => {
  logger.warn(`${message} ${data ? JSON.stringify(data, null, 2) : ''}`);
};

export const logInfo = (message: string, data?: any): void => {
  logger.info(`${message} ${data ? JSON.stringify(data, null, 2) : ''}`);
};

export const logDebug = (message: string, data?: any): void => {
  logger.debug(`${message} ${data ? JSON.stringify(data, null, 2) : ''}`);
};

export const logHttp = (message: string, data?: any): void => {
  logger.http(`${message} ${data ? JSON.stringify(data, null, 2) : ''}`);
};

// Export the logger for direct use
export { logger };