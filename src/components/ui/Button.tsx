import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-2xl font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-40 touch-manipulation transform-gpu',
  {
    variants: {
      variant: {
        primary: 'bg-gradient-to-r from-primary to-primary-light text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] dark:shadow-primary/40',
        secondary: 'bg-gradient-to-r from-secondary to-secondary-light text-white shadow-lg shadow-secondary/25 hover:shadow-xl hover:shadow-secondary/30 hover:scale-[1.02] active:scale-[0.98] dark:shadow-secondary/40',
        accent: 'bg-gradient-to-r from-accent to-accent-light text-white shadow-lg shadow-accent/25 hover:shadow-xl hover:shadow-accent/30 hover:scale-[1.02] active:scale-[0.98] dark:shadow-accent/40',
        outline: 'border-2 border-border bg-transparent text-text shadow-sm hover:bg-card-hover hover:shadow-md hover:scale-[1.02] active:scale-[0.98] backdrop-blur-sm',
        ghost: 'hover:bg-card-hover text-text-light hover:text-text hover:scale-[1.02] active:scale-[0.98]',
        glass: 'bg-glass border border-glass-border backdrop-blur-glass text-text shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] hover:bg-glass/80',
      },
      size: {
        sm: 'h-9 px-4 text-sm',
        md: 'h-11 px-6',
        lg: 'h-12 px-8 text-lg min-h-[44px]',
        xl: 'h-14 px-10 text-xl min-h-[48px]',
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