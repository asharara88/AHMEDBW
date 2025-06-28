// Input validation and sanitization utilities

// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

// Password strength validation
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (password.length > 128) {
    errors.push('Password must be less than 128 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Sanitize HTML to prevent XSS
export const sanitizeHtml = (input: string): string => {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Validate and sanitize text input
export const sanitizeTextInput = (input: string, maxLength: number = 1000): string => {
  if (typeof input !== 'string') {
    return '';
  }
  
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[^\w\s\-.,!?@#$%&*()+=[\]{};:'"\\|`~]/g, ''); // Allow common characters
};

// URL validation
export const isValidUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
};

// Phone number validation (basic)
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.replace(/[\s\-()]/g, ''));
};

// SQL injection prevention for search queries
export const sanitizeSearchQuery = (query: string): string => {
  return query
    .replace(/['"`;\\]/g, '') // Remove dangerous SQL characters
    .trim()
    .slice(0, 100); // Limit length
};

// Validate file upload
export const validateFileUpload = (file: File, allowedTypes: string[], maxSizeMB: number) => {
  const errors: string[] = [];
  
  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} is not allowed`);
  }
  
  if (file.size > maxSizeMB * 1024 * 1024) {
    errors.push(`File size must be less than ${maxSizeMB}MB`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Rate limiting key generation
export const createSecureKey = (userId: string, action: string): string => {
  return btoa(`${userId}:${action}:${Date.now()}`).slice(0, 32);
};

// Input length validation
export const validateLength = (input: string, min: number, max: number): boolean => {
  return input.length >= min && input.length <= max;
};

// Common validation patterns
export const VALIDATION_PATTERNS = {
  USERNAME: /^[a-zA-Z0-9_]{3,20}$/,
  SLUG: /^[a-z0-9-]+$/,
  HEX_COLOR: /^#[0-9A-Fa-f]{6}$/,
  NUMERIC: /^\d+$/,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
} as const;
