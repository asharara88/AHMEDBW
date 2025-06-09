import { describe, it, expect } from 'vitest';
import { render, screen } from '../../test/utils';
import { Skeleton } from './Skeleton';

describe('Skeleton', () => {
  it('should render with default props', () => {
    // Arrange & Act
    const { container } = render(<Skeleton />);
    
    // Assert
    const skeleton = container.firstChild;
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveClass('animate-pulse');
    expect(skeleton).toHaveClass('rounded-md');
    expect(skeleton).toHaveClass('bg-[hsl(var(--color-border))]');
  });

  it('should apply custom className', () => {
    // Arrange
    const customClass = 'h-10 w-20 custom-class';
    
    // Act
    const { container } = render(<Skeleton className={customClass} />);
    
    // Assert
    const skeleton = container.firstChild;
    expect(skeleton).toHaveClass('h-10');
    expect(skeleton).toHaveClass('w-20');
    expect(skeleton).toHaveClass('custom-class');
  });

  it('should pass through additional props', () => {
    // Arrange & Act
    render(<Skeleton data-testid="test-skeleton" />);
    
    // Assert
    const skeleton = screen.getByTestId('test-skeleton');
    expect(skeleton).toBeInTheDocument();
  });

  it('should render with custom dimensions', () => {
    // Arrange & Act
    const { container } = render(
      <Skeleton className="h-24 w-full" />
    );
    
    // Assert
    const skeleton = container.firstChild;
    expect(skeleton).toHaveClass('h-24');
    expect(skeleton).toHaveClass('w-full');
  });
});