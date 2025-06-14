import { useState } from 'react';
import { AlertCircle, Check } from 'lucide-react';

interface FormFieldProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  helperText?: string;
  options?: { value: string; label: string }[];
  className?: string;
  autoComplete?: string;
  validateFn?: (value: string) => string | undefined;
  isTextarea?: boolean;
  rows?: number;
  onBlur?: () => void;
  describedBy?: string;
  maxLength?: number;
}

export default function FormField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  helperText,
  options,
  className = '',
  autoComplete,
  validateFn,
  isTextarea = false,
  rows = 3,
  onBlur,
  describedBy,
  maxLength
}: FormFieldProps) {
  const [isTouched, setIsTouched] = useState(false);
  const [validationError, setValidationError] = useState<string | undefined>();

  // Create unique IDs for accessibility
  const errorId = `${id}-error`;
  const helperId = `${id}-helper`;
  
  // Determine which ID to use for aria-describedby
  const getAriaDescribedBy = () => {
    if (error || validationError) return errorId;
    if (helperText) return helperId;
    return describedBy || undefined;
  };

  const handleBlur = () => {
    setIsTouched(true);
    if (validateFn) {
      const validationResult = validateFn(value);
      setValidationError(validationResult);
    }
    if (onBlur) onBlur();
  };

  // Combine external and validation errors
  const errorMessage = error || validationError;
  const showError = isTouched && errorMessage;
  const isValid = isTouched && !errorMessage && value;

  // Common input classes
  const inputClasses = `w-full rounded-lg border text-lg ${
    showError 
      ? 'border-error bg-error/5 focus:border-error focus:ring-error/20' 
      : isValid
        ? 'border-success bg-success/5 focus:border-success focus:ring-success/20'
        : 'border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] focus:border-primary focus:ring-primary/20'
  } px-3 py-3 text-text placeholder:text-text-light focus:outline-none focus:ring-2 transition-all duration-200 ${
    disabled ? 'opacity-60 cursor-not-allowed' : ''
  }`;

  if (type === 'select' && options) {
    return (
      <div className={`mb-4 ${className}`}>
        <label htmlFor={id} className="block text-base font-medium text-text-light mb-2">
          {label}
          {required && <span className="ml-1 text-error" aria-hidden="true">*</span>}
          {required && <span className="sr-only"> (required)</span>}
        </label>
        <div className="relative">
          <select
            id={id}
            value={value}
            onChange={onChange as any}
            className={inputClasses}
            disabled={disabled}
            onBlur={handleBlur}
            required={required}
            aria-describedby={getAriaDescribedBy()}
            aria-invalid={showError}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {isValid && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2" aria-hidden="true">
              <Check className="h-5 w-5 text-success" />
            </div>
          )}
        </div>
        {showError ? (
          <p className="mt-2 flex items-center gap-1 text-base text-error" id={errorId}>
            <AlertCircle className="h-4 w-4" aria-hidden="true" /> {errorMessage}
          </p>
        ) : helperText ? (
          <p className="mt-2 text-base text-text-light" id={helperId}>{helperText}</p>
        ) : null}
      </div>
    );
  }

  if (isTextarea) {
    return (
      <div className={`mb-4 ${className}`}>
        <label htmlFor={id} className="block text-base font-medium text-text-light mb-2">
          {label}
          {required && <span className="ml-1 text-error" aria-hidden="true">*</span>}
          {required && <span className="sr-only"> (required)</span>}
        </label>
        <textarea
          id={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={inputClasses}
          disabled={disabled}
          onBlur={handleBlur}
          rows={rows}
          required={required}
          aria-describedby={getAriaDescribedBy()}
          aria-invalid={showError}
          maxLength={maxLength}
        />
        {showError ? (
          <p className="mt-2 flex items-center gap-1 text-base text-error" id={errorId}>
            <AlertCircle className="h-4 w-4" aria-hidden="true" /> {errorMessage}
          </p>
        ) : helperText ? (
          <p className="mt-2 text-base text-text-light" id={helperId}>{helperText}</p>
        ) : null}
        {maxLength && (
          <div className="mt-1 text-right text-sm text-text-light">
            {value.length}/{maxLength}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`mb-4 ${className}`}>
      <label htmlFor={id} className="block text-base font-medium text-text-light mb-2">
        {label}
        {required && <span className="ml-1 text-error" aria-hidden="true">*</span>}
        {required && <span className="sr-only"> (required)</span>}
      </label>
      <div className="relative">
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={inputClasses}
          disabled={disabled}
          onBlur={handleBlur}
          required={required}
          autoComplete={autoComplete}
          aria-describedby={getAriaDescribedBy()}
          aria-invalid={showError}
          maxLength={maxLength}
        />
        {isValid && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2" aria-hidden="true">
            <Check className="h-5 w-5 text-success" />
          </div>
        )}
      </div>
      {showError ? (
        <p className="mt-2 flex items-center gap-1 text-base text-error" id={errorId}>
          <AlertCircle className="h-4 w-4" aria-hidden="true" /> {errorMessage}
        </p>
      ) : helperText ? (
        <p className="mt-2 text-base text-text-light" id={helperId}>{helperText}</p>
      ) : null}
      {maxLength && (
        <div className="mt-1 text-right text-sm text-text-light">
          {value.length}/{maxLength}
        </div>
      )}
    </div>
  );
}