import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const inputVariants = cva(
  'w-full rounded-2xl border-2 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 touch-manipulation transform-gpu',
  {
    variants: {
      variant: {
        default:
          'border-border bg-surface-1 text-text shadow-sm placeholder:text-text-disabled/75 hover:border-primary/50 hover:shadow-md focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:shadow-lg focus:scale-[1.01] dark:text-text dark:placeholder:text-text-disabled/50 dark:hover:border-primary/40',
        glass:
          'border-glass-border bg-glass backdrop-blur-glass text-text shadow-lg placeholder:text-text-disabled/75 hover:border-primary/50 hover:shadow-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:shadow-2xl focus:scale-[1.01] hover:bg-glass/80',
        error:
          'border-error bg-error/5 text-error placeholder:text-error/50 hover:border-error focus:border-error focus:outline-none focus:ring-2 focus:ring-error/20 focus:shadow-lg focus:scale-[1.01]',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-11 px-4 min-h-[44px]',
        lg: 'h-12 px-4 text-lg min-h-[44px]',
        xl: 'h-14 px-6 text-xl min-h-[48px]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
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