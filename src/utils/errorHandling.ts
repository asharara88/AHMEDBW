import { AppError } from '../contexts/ErrorContext';

// Error codes for different types of errors
export enum ErrorCode {
  // API Errors
  API_REQUEST_FAILED = 'API_REQUEST_FAILED',
  API_RESPONSE_INVALID = 'API_RESPONSE_INVALID',
  API_TIMEOUT = 'API_TIMEOUT',
  API_NETWORK_ERROR = 'API_NETWORK_ERROR',
  API_RATE_LIMIT = 'API_RATE_LIMIT',
  
  // Authentication Errors
  AUTH_INVALID_CREDENTIALS = 'AUTH_INVALID_CREDENTIALS',
  AUTH_EXPIRED_SESSION = 'AUTH_EXPIRED_SESSION',
  AUTH_UNAUTHORIZED = 'AUTH_UNAUTHORIZED',
  AUTH_FORBIDDEN = 'AUTH_FORBIDDEN',
  AUTH_USER_NOT_FOUND = 'AUTH_USER_NOT_FOUND',
  
  // Validation Errors
  VALIDATION_REQUIRED_FIELD = 'VALIDATION_REQUIRED_FIELD',
  VALIDATION_INVALID_FORMAT = 'VALIDATION_INVALID_FORMAT',
  VALIDATION_INVALID_VALUE = 'VALIDATION_INVALID_VALUE',
  
  // Resource Errors
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS = 'RESOURCE_ALREADY_EXISTS',
  RESOURCE_CONFLICT = 'RESOURCE_CONFLICT',
  
  // Data Errors
  DATA_NOT_FOUND = 'DATA_NOT_FOUND',
  DATA_INVALID = 'DATA_INVALID',
  DATA_CORRUPT = 'DATA_CORRUPT',
  
  // Device Errors
  DEVICE_CONNECTION_FAILED = 'DEVICE_CONNECTION_FAILED',
  DEVICE_NOT_SUPPORTED = 'DEVICE_NOT_SUPPORTED',
  DEVICE_PERMISSION_DENIED = 'DEVICE_PERMISSION_DENIED',
  
  // Audio/Speech Errors
  AUDIO_PLAYBACK_FAILED = 'AUDIO_PLAYBACK_FAILED',
  SPEECH_RECOGNITION_FAILED = 'SPEECH_RECOGNITION_FAILED',
  
  // Other Errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  RENDER_ERROR = 'RENDER_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR'
}

// Map API status codes to error codes
export function mapStatusCodeToErrorCode(statusCode: number): ErrorCode {
  switch (statusCode) {
    case 400: return ErrorCode.API_REQUEST_FAILED;
    case 401: return ErrorCode.AUTH_UNAUTHORIZED;
    case 403: return ErrorCode.AUTH_FORBIDDEN;
    case 404: return ErrorCode.RESOURCE_NOT_FOUND;
    case 409: return ErrorCode.RESOURCE_CONFLICT;
    case 422: return ErrorCode.VALIDATION_INVALID_VALUE;
    case 429: return ErrorCode.API_RATE_LIMIT;
    case 500: return ErrorCode.UNKNOWN_ERROR;
    default: return ErrorCode.API_REQUEST_FAILED;
  }
}

// Helper function to create an error object with the right structure
export function createErrorObject(
  message: string, 
  severity: AppError['severity'] = 'error',
  code: ErrorCode | string = ErrorCode.UNKNOWN_ERROR,
  source: string = 'application',
  data?: any,
  dismissable: boolean = true
): Omit<AppError, 'id' | 'timestamp'> {
  return {
    message,
    severity,
    code,
    source,
    data,
    dismissable
  };
}

// Function to extract error message from different types of errors
export function extractErrorMessage(error: any): string {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (error?.message && typeof error.message === 'string') {
    return error.message;
  }
  
  if (error?.error && typeof error.error === 'string') {
    return error.error;
  }
  
  if (error?.error?.message && typeof error.error.message === 'string') {
    return error.error.message;
  }
  
  return 'An unknown error occurred';
}

// Helper function to handle API errors
export function handleApiError(error: any, defaultMessage: string = 'An error occurred while fetching data'): Omit<AppError, 'id' | 'timestamp'> {
  const message = extractErrorMessage(error) || defaultMessage;
  
  // Determine if it's a network error
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    return createErrorObject(
      'Network error: unable to connect to the server. Please check your internet connection.',
      'error',
      ErrorCode.NETWORK_ERROR,
      'api'
    );
  }
  
  // Handle Supabase specific errors
  if (error?.code === 'PGRST301' || message.includes('JWT')) {
    return createErrorObject(
      'Your session has expired. Please sign in again.',
      'error',
      ErrorCode.AUTH_EXPIRED_SESSION,
      'auth'
    );
  }
  
  if (error?.status) {
    const code = mapStatusCodeToErrorCode(error.status);
    return createErrorObject(message, 'error', code, 'api', error);
  }
  
  return createErrorObject(message, 'error', ErrorCode.UNKNOWN_ERROR, 'api', error);
}

// Function to handle authentication errors
export function handleAuthError(error: any): Omit<AppError, 'id' | 'timestamp'> {
  const message = extractErrorMessage(error);
  
  if (message.includes('Invalid login credentials')) {
    return createErrorObject(
      'Incorrect email or password. Please try again.',
      'error',
      ErrorCode.AUTH_INVALID_CREDENTIALS,
      'auth'
    );
  }
  
  if (message.includes('User not found')) {
    return createErrorObject(
      'User not found. Please check your email or sign up for a new account.',
      'error',
      ErrorCode.AUTH_USER_NOT_FOUND,
      'auth'
    );
  }
  
  if (message.includes('Email not confirmed')) {
    return createErrorObject(
      'Please confirm your email before signing in.',
      'warning',
      ErrorCode.AUTH_UNAUTHORIZED,
      'auth'
    );
  }
  
  if (message.includes('expired')) {
    return createErrorObject(
      'Your session has expired. Please sign in again.',
      'error',
      ErrorCode.AUTH_EXPIRED_SESSION,
      'auth'
    );
  }
  
  return createErrorObject(
    message || 'Authentication error',
    'error',
    ErrorCode.AUTH_UNAUTHORIZED,
    'auth',
    error
  );
}

// Function to format validation errors
export function handleValidationError(field: string, message: string): Omit<AppError, 'id' | 'timestamp'> {
  return createErrorObject(
    message,
    'warning',
    ErrorCode.VALIDATION_INVALID_VALUE,
    'validation',
    { field }
  );
}

// Error handler for device connection issues
export function handleDeviceError(error: any, deviceName?: string): Omit<AppError, 'id' | 'timestamp'> {
  const deviceInfo = deviceName ? ` to ${deviceName}` : '';
  
  if (error?.name === 'NotFoundError' || error?.name === 'DeviceNotFoundError') {
    return createErrorObject(
      `Device${deviceInfo} not found. Please make sure it's powered on and nearby.`,
      'error',
      ErrorCode.DEVICE_NOT_SUPPORTED,
      'device'
    );
  }
  
  if (error?.name === 'NotAllowedError' || error?.name === 'PermissionDeniedError') {
    return createErrorObject(
      `Permission denied${deviceInfo}. Please grant the necessary permissions and try again.`,
      'error',
      ErrorCode.DEVICE_PERMISSION_DENIED,
      'device'
    );
  }
  
  return createErrorObject(
    `Failed to connect${deviceInfo}. ${extractErrorMessage(error)}`,
    'error',
    ErrorCode.DEVICE_CONNECTION_FAILED,
    'device',
    error
  );
}

// Handle audio and speech errors
export function handleAudioError(error: any): Omit<AppError, 'id' | 'timestamp'> {
  if (error?.name === 'NotAllowedError') {
    return createErrorObject(
      'Microphone access denied. Please allow microphone access in your browser settings.',
      'error',
      ErrorCode.DEVICE_PERMISSION_DENIED,
      'audio'
    );
  }
  
  return createErrorObject(
    `Audio error: ${extractErrorMessage(error)}`,
    'error',
    ErrorCode.AUDIO_PLAYBACK_FAILED,
    'audio',
    error
  );
}

// Handle speech recognition errors
export function handleSpeechRecognitionError(error: any): Omit<AppError, 'id' | 'timestamp'> {
  if (error?.error === 'no-speech') {
    return createErrorObject(
      'No speech was detected. Please try again.',
      'info',
      ErrorCode.SPEECH_RECOGNITION_FAILED,
      'speech'
    );
  }
  
  if (error?.error === 'audio-capture') {
    return createErrorObject(
      'No microphone was found. Please ensure you have a working microphone.',
      'error',
      ErrorCode.DEVICE_NOT_SUPPORTED,
      'speech'
    );
  }
  
  if (error?.error === 'not-allowed') {
    return createErrorObject(
      'Microphone access denied. Please allow microphone access in your browser settings.',
      'error',
      ErrorCode.DEVICE_PERMISSION_DENIED,
      'speech'
    );
  }
  
  return createErrorObject(
    `Speech recognition error: ${extractErrorMessage(error)}`,
    'error',
    ErrorCode.SPEECH_RECOGNITION_FAILED,
    'speech',
    error
  );
}