import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const cardVariants = cva(
  'rounded-3xl border border-border bg-card transition-all duration-300 dark:shadow-black/20 transform-gpu',
  {
    variants: {
      variant: {
        default: 'shadow-lg hover:shadow-xl hover:scale-[1.02] dark:hover:shadow-black/30',
        flat: 'shadow-sm hover:shadow-md hover:scale-[1.01] dark:hover:shadow-black/20',
        outline: 'shadow-none hover:shadow-sm hover:scale-[1.01] dark:hover:shadow-black/10',
        glass: 'bg-glass border-glass-border backdrop-blur-glass shadow-lg hover:shadow-xl hover:scale-[1.02] hover:bg-glass/80',
        floating: 'shadow-2xl hover:shadow-2xl hover:-translate-y-1 dark:hover:shadow-black/40',
      },
      padding: {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
        xl: 'p-10',
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