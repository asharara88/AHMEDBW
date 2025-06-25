import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const cardVariants = cva(
  'rounded-2xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] transition-all duration-300 dark:shadow-black/20',
  {
    variants: {
      variant: {
        default: 'shadow-lg hover:shadow-xl dark:hover:shadow-black/30',
        flat: 'shadow-sm hover:shadow-md dark:hover:shadow-black/20',
        outline: 'shadow-none hover:shadow-sm dark:hover:shadow-black/10',
      },
      padding: {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  as?: keyof JSX.IntrinsicElements;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, as: Component = 'div', ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(cardVariants({ variant, padding, className }))}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';

export { Card, cardVariants };