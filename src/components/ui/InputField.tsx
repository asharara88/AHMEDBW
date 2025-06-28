import React from 'react';
import { Input, InputProps } from './Input';
import { cn } from '../../utils/cn';

export interface InputFieldProps extends Omit<InputProps, 'error'> {
  label?: string;
  error?: string | boolean;
  required?: boolean;
  helperText?: string;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  error,
  required,
  helperText,
  className,
  ...props
}) => {
  const hasError = Boolean(error);
  const errorMessage = typeof error === 'string' ? error : undefined;

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <Input
        error={hasError}
        className={cn(className)}
        {...props}
      />
      
      {errorMessage && (
        <p className="text-sm text-red-600">{errorMessage}</p>
      )}
      
      {helperText && !errorMessage && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};
