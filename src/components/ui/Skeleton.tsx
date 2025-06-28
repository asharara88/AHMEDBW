import { cn } from '../../utils/cn';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const Skeleton = ({ className, ...props }: SkeletonProps) => {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-[hsl(var(--color-border))] dark:bg-[hsl(var(--color-card-hover))]',
        className
      )}
      {...props}
    />
  );
};

export { Skeleton };