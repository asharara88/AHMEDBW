import { describe, it, expect } from 'vitest';
import { render, screen } from '../../test/utils';
import { Card } from './Card';

describe('Card', () => {
  it('should render with default props', () => {
    // Arrange & Act
    render(<Card>Card Content</Card>);
    
    // Assert
    const card = screen.getByText('Card Content');
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('rounded-2xl');
    expect(card).toHaveClass('border');
    expect(card).toHaveClass('bg-[hsl(var(--color-card))]');
    expect(card).toHaveClass('shadow-lg');
    expect(card).toHaveClass('p-6'); // Default padding is md
  });

  it('should render with flat variant', () => {
    // Arrange & Act
    render(<Card variant="flat">Flat Card</Card>);
    
    // Assert
    const card = screen.getByText('Flat Card');
    expect(card).toHaveClass('shadow-sm');
    expect(card).toHaveClass('hover:shadow-md');
  });

  it('should render with outline variant', () => {
    // Arrange & Act
    render(<Card variant="outline">Outline Card</Card>);
    
    // Assert
    const card = screen.getByText('Outline Card');
    expect(card).toHaveClass('shadow-none');
    expect(card).toHaveClass('hover:shadow-sm');
  });

  it('should render with different padding sizes', () => {
    // Arrange & Act
    const { rerender } = render(<Card padding="none">No Padding</Card>);
    
    // Assert
    let card = screen.getByText('No Padding');
    expect(card).not.toHaveClass('p-4');
    expect(card).not.toHaveClass('p-6');
    expect(card).not.toHaveClass('p-8');
    
    // Rerender with small padding
    rerender(<Card padding="sm">Small Padding</Card>);
    card = screen.getByText('Small Padding');
    expect(card).toHaveClass('p-4');
    
    // Rerender with medium padding
    rerender(<Card padding="md">Medium Padding</Card>);
    card = screen.getByText('Medium Padding');
    expect(card).toHaveClass('p-6');
    
    // Rerender with large padding
    rerender(<Card padding="lg">Large Padding</Card>);
    card = screen.getByText('Large Padding');
    expect(card).toHaveClass('p-8');
  });

  it('should render as a different element when as prop is provided', () => {
    // Arrange & Act
    render(<Card as="section">Section Card</Card>);
    
    // Assert
    const card = screen.getByText('Section Card');
    expect(card.tagName).toBe('SECTION');
  });

  it('should apply custom className', () => {
    // Arrange
    const customClass = 'custom-class';
    
    // Act
    render(<Card className={customClass}>Custom Card</Card>);
    
    // Assert
    const card = screen.getByText('Custom Card');
    expect(card).toHaveClass(customClass);
  });

  it('should pass through additional props', () => {
    // Arrange & Act
    render(<Card data-testid="test-card">Test Card</Card>);
    
    // Assert
    const card = screen.getByTestId('test-card');
    expect(card).toHaveTextContent('Test Card');
  });
});