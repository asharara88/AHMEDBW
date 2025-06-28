import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const inputVariants = cva(
  'w-full rounded-xl border-2 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] text-text shadow-sm placeholder:text-text-disabled/75 hover:border-primary/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:text-text dark:placeholder:text-text-disabled/50 dark:hover:border-primary/40',
        error:
          'border-error bg-error/5 text-error placeholder:text-error/50 hover:border-error focus:border-error focus:outline-none focus:ring-2 focus:ring-error/20',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-11 px-4',
        lg: 'h-12 px-4 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  error?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, size, error, ...props }, ref) => {
    return (
      <input
        className={cn(
          inputVariants({
            variant: error ? 'error' : variant,
            size,
            className,
          })
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export { Input, inputVariants };