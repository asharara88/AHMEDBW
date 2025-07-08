/**
 * Utility functions for environment-specific behavior
 */

/**
 * Check if the application is running in development mode
 * @returns {boolean} True if in development mode, false otherwise
 */
export function isDevelopment(): boolean {
  return import.meta.env.DEV || import.meta.env.MODE === 'development';
}

/**
 * Check if the application is running in production mode
 * @returns {boolean} True if in production mode, false otherwise
 */
export function isProduction(): boolean {
  return import.meta.env.PROD || import.meta.env.MODE === 'production';
}

/**
 * Check if the application is running in test mode
 * @returns {boolean} True if in test mode, false otherwise
 */
export function isTest(): boolean {
  return import.meta.env.MODE === 'test';
}