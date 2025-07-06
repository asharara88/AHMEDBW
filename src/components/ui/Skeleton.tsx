import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const skeletonVariants = cva(
  'animate-pulse rounded-2xl bg-gradient-to-r from-surface-2 via-surface-3 to-surface-2 bg-[length:200%_100%] animate-shimmer',
  {
    variants: {
      variant: {
        default: '',
        glass: 'bg-glass border border-glass-border backdrop-blur-glass',
        rounded: 'rounded-full',
      },
      size: {
        sm: 'h-4',
        md: 'h-6',
        lg: 'h-8',
        xl: 'h-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {
  width?: string;
  height?: string;
}

const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant, size, width, height, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(skeletonVariants({ variant, size, className }))}
        style={{
          width: width || '100%',
          height: height || undefined,
          ...style,
        }}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

export { Skeleton, skeletonVariants };
