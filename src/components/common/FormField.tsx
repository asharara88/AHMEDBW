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
  onBlur
}: FormFieldProps) {
  const [isTouched, setIsTouched] = useState(false);
  const [validationError, setValidationError] = useState<string | undefined>();

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
  const inputClasses = `w-full rounded-lg border ${
    showError 
      ? 'border-error bg-error/5 focus:border-error focus:ring-error/20' 
      : isValid
        ? 'border-success bg-success/5 focus:border-success focus:ring-success/20'
        : 'border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] focus:border-primary focus:ring-primary/20'
  } px-3 py-2 text-text placeholder:text-text-light focus:outline-none focus:ring-2 transition-all duration-200 ${
    disabled ? 'opacity-60 cursor-not-allowed' : ''
  }`;

  if (type === 'select' && options) {
    return (
      <div className={`mb-4 ${className}`}>
        <label htmlFor={id} className="block text-sm font-medium text-text-light mb-1">
          {label}
          {required && <span className="ml-1 text-error">*</span>}
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
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {isValid && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Check className="h-4 w-4 text-success" />
            </div>
          )}
        </div>
        {showError ? (
          <p className="mt-1 flex items-center gap-1 text-xs text-error">
            <AlertCircle className="h-3 w-3" /> {errorMessage}
          </p>
        ) : helperText ? (
          <p className="mt-1 text-xs text-text-light">{helperText}</p>
        ) : null}
      </div>
    );
  }

  if (isTextarea) {
    return (
      <div className={`mb-4 ${className}`}>
        <label htmlFor={id} className="block text-sm font-medium text-text-light mb-1">
          {label}
          {required && <span className="ml-1 text-error">*</span>}
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
        />
        {showError ? (
          <p className="mt-1 flex items-center gap-1 text-xs text-error">
            <AlertCircle className="h-3 w-3" /> {errorMessage}
          </p>
        ) : helperText ? (
          <p className="mt-1 text-xs text-text-light">{helperText}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className={`mb-4 ${className}`}>
      <label htmlFor={id} className="block text-sm font-medium text-text-light mb-1">
        {label}
        {required && <span className="ml-1 text-error">*</span>}
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
        />
        {isValid && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Check className="h-4 w-4 text-success" />
          </div>
        )}
      </div>
      {showError ? (
        <p className="mt-1 flex items-center gap-1 text-xs text-error">
          <AlertCircle className="h-3 w-3" /> {errorMessage}
        </p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-text-light">{helperText}</p>
      ) : null}
    </div>
  );
}