import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium shadow-sm transition-all duration-300',
  {
    variants: {
      variant: {
        default: 'bg-primary/10 text-primary shadow-primary/5 dark:bg-primary/20 dark:shadow-primary/10',
        success: 'bg-success/10 text-success shadow-success/5 dark:bg-success/20 dark:shadow-success/10',
        warning: 'bg-warning/10 text-warning shadow-warning/5 dark:bg-warning/20 dark:shadow-warning/10',
        error: 'bg-error/10 text-error shadow-error/5 dark:bg-error/20 dark:shadow-error/10',
        outline: 'border border-[hsl(var(--color-border))] bg-transparent text-text-light',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = ({ className, variant, ...props }: BadgeProps) => {
  return (
    <span className={cn(badgeVariants({ variant, className }))} {...props} />
  );
};

export { Badge, badgeVariants };