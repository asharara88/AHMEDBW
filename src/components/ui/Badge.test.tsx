import { describe, it, expect } from 'vitest';
import { render, screen } from '../../test/utils';
import { Badge } from './Badge';

describe('Badge', () => {
  it('should render with default props', () => {
    // Arrange & Act
    render(<Badge>Default Badge</Badge>);
    
    // Assert
    const badge = screen.getByText('Default Badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('inline-flex');
    expect(badge).toHaveClass('items-center');
    expect(badge).toHaveClass('rounded-full');
    expect(badge).toHaveClass('bg-primary/10');
    expect(badge).toHaveClass('text-primary');
  });

  it('should render with success variant', () => {
    // Arrange & Act
    render(<Badge variant="success">Success Badge</Badge>);
    
    // Assert
    const badge = screen.getByText('Success Badge');
    expect(badge).toHaveClass('bg-success/10');
    expect(badge).toHaveClass('text-success');
  });

  it('should render with warning variant', () => {
    // Arrange & Act
    render(<Badge variant="warning">Warning Badge</Badge>);
    
    // Assert
    const badge = screen.getByText('Warning Badge');
    expect(badge).toHaveClass('bg-warning/10');
    expect(badge).toHaveClass('text-warning');
  });

  it('should render with error variant', () => {
    // Arrange & Act
    render(<Badge variant="error">Error Badge</Badge>);
    
    // Assert
    const badge = screen.getByText('Error Badge');
    expect(badge).toHaveClass('bg-error/10');
    expect(badge).toHaveClass('text-error');
  });

  it('should render with outline variant', () => {
    // Arrange & Act
    render(<Badge variant="outline">Outline Badge</Badge>);
    
    // Assert
    const badge = screen.getByText('Outline Badge');
    expect(badge).toHaveClass('border');
    expect(badge).toHaveClass('bg-transparent');
    expect(badge).toHaveClass('text-text-light');
  });

  it('should apply custom className', () => {
    // Arrange
    const customClass = 'custom-class';
    
    // Act
    render(<Badge className={customClass}>Custom Badge</Badge>);
    
    // Assert
    const badge = screen.getByText('Custom Badge');
    expect(badge).toHaveClass(customClass);
  });

  it('should pass through additional props', () => {
    // Arrange & Act
    render(<Badge data-testid="test-badge">Test Badge</Badge>);
    
    // Assert
    const badge = screen.getByTestId('test-badge');
    expect(badge).toHaveTextContent('Test Badge');
  });
});