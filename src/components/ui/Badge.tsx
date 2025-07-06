import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full font-medium transition-all duration-300 transform-gpu',
  {
    variants: {
      variant: {
        default: 'bg-surface-2 text-text-light border border-border hover:bg-surface-3 hover:scale-105',
        primary: 'bg-gradient-to-r from-primary/10 to-primary-light/10 text-primary border border-primary/20 hover:from-primary/20 hover:to-primary-light/20 hover:scale-105',
        secondary: 'bg-gradient-to-r from-secondary/10 to-secondary-light/10 text-secondary border border-secondary/20 hover:from-secondary/20 hover:to-secondary-light/20 hover:scale-105',
        accent: 'bg-gradient-to-r from-accent/10 to-accent-light/10 text-accent border border-accent/20 hover:from-accent/20 hover:to-accent-light/20 hover:scale-105',
        success: 'bg-success/10 text-success border border-success/20 hover:bg-success/20 hover:scale-105',
        warning: 'bg-warning/10 text-warning border border-warning/20 hover:bg-warning/20 hover:scale-105',
        error: 'bg-error/10 text-error border border-error/20 hover:bg-error/20 hover:scale-105',
        glass: 'bg-glass border border-glass-border backdrop-blur-glass text-text shadow-lg hover:shadow-xl hover:scale-105 hover:bg-glass/80',
        outline: 'border-2 border-border text-text hover:bg-card-hover hover:scale-105',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
        lg: 'px-4 py-1.5 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  as?: keyof JSX.IntrinsicElements;
}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, size, as: Component = 'div', ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(badgeVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';

export { Badge, badgeVariants };
