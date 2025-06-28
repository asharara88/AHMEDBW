import { useState } from 'react';
import { AlertCircle, Info } from 'lucide-react';

interface AccessibleInputProps {
  label: string;
  id: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  className?: string;
}

/**
 * An accessible input component with proper labeling and error handling
 */
const AccessibleInput = ({ 
  label, 
  id, 
  type = 'text', 
  value, 
  onChange, 
  error, 
  required = false,
  placeholder,
  helpText,
  className = ''
}: AccessibleInputProps) => {
  const [focused, setFocused] = useState(false);
  
  const errorId = error ? `${id}-error` : undefined;
  const helpId = helpText ? `${id}-help` : undefined;
  
  return (
    <div className={`mb-4 ${className}`}>
      <label 
        htmlFor={id}
        className="mb-1 block text-sm font-medium"
      >
        {label} {required && <span aria-hidden="true" className="text-error">*</span>}
        {required && <span className="sr-only">(required)</span>}
      </label>
      
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={[errorId, helpId].filter(Boolean).join(' ') || undefined}
        placeholder={placeholder}
        className={`w-full rounded-lg border ${
          error ? 'border-error' : focused ? 'border-primary' : 'border-[hsl(var(--color-border))]'
        } bg-[hsl(var(--color-surface-1))] px-4 py-2 transition-colors`}
      />
      
      {helpText && !error && (
        <div className="mt-1 flex items-center gap-1 text-xs text-text-light" id={helpId}>
          <Info className="h-3 w-3" />
          <span>{helpText}</span>
        </div>
      )}
      
      {error && (
        <div className="mt-1 flex items-center gap-1 text-xs text-error" id={errorId} aria-live="polite">
          <AlertCircle className="h-3 w-3" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default AccessibleInput;