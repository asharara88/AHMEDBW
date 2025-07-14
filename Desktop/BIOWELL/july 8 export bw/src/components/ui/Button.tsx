import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-40',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-white shadow-lg shadow-primary/25 hover:bg-primary-dark hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] dark:bg-primary/90 dark:hover:bg-primary dark:hover:shadow-primary/40',
        secondary: 'bg-secondary text-white shadow-lg shadow-secondary/25 hover:bg-secondary-dark hover:shadow-xl hover:shadow-secondary/30 active:scale-[0.98] dark:bg-secondary/90 dark:hover:bg-secondary dark:hover:shadow-secondary/40',
        outline: 'border-2 border-[hsl(var(--color-border))] bg-transparent text-text shadow-sm hover:bg-[hsl(var(--color-card-hover))] hover:shadow-md active:scale-[0.98] dark:text-text dark:hover:bg-[hsl(var(--color-card-hover))]',
        ghost: 'hover:bg-[hsl(var(--color-card-hover))] text-text-light hover:text-text',
      },
      size: {
        sm: 'h-9 px-4 text-sm',
        md: 'h-11 px-6',
        lg: 'h-12 px-8 text-lg',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, loading, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            <span>Loading...</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };