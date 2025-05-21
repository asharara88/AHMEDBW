import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../test/utils';
import { Button } from './Button';

describe('Button', () => {
  it('should render with default props', () => {
    // Arrange & Act
    render(<Button>Click me</Button>);
    
    // Assert
    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-primary');
    expect(button).not.toHaveClass('w-full');
  });

  it('should render with primary variant', () => {
    // Arrange & Act
    render(<Button variant="primary">Primary Button</Button>);
    
    // Assert
    const button = screen.getByRole('button', { name: 'Primary Button' });
    expect(button).toHaveClass('bg-primary');
    expect(button).toHaveClass('text-white');
  });

  it('should render with secondary variant', () => {
    // Arrange & Act
    render(<Button variant="secondary">Secondary Button</Button>);
    
    // Assert
    const button = screen.getByRole('button', { name: 'Secondary Button' });
    expect(button).toHaveClass('bg-secondary');
    expect(button).toHaveClass('text-white');
  });

  it('should render with outline variant', () => {
    // Arrange & Act
    render(<Button variant="outline">Outline Button</Button>);
    
    // Assert
    const button = screen.getByRole('button', { name: 'Outline Button' });
    expect(button).toHaveClass('border-2');
    expect(button).toHaveClass('bg-transparent');
  });

  it('should render with ghost variant', () => {
    // Arrange & Act
    render(<Button variant="ghost">Ghost Button</Button>);
    
    // Assert
    const button = screen.getByRole('button', { name: 'Ghost Button' });
    expect(button).toHaveClass('text-text-light');
    expect(button).not.toHaveClass('bg-primary');
  });

  it('should render with different sizes', () => {
    // Arrange & Act
    const { rerender } = render(<Button size="sm">Small Button</Button>);
    
    // Assert
    let button = screen.getByRole('button', { name: 'Small Button' });
    expect(button).toHaveClass('h-9');
    expect(button).toHaveClass('text-sm');
    
    // Rerender with medium size
    rerender(<Button size="md">Medium Button</Button>);
    button = screen.getByRole('button', { name: 'Medium Button' });
    expect(button).toHaveClass('h-11');
    
    // Rerender with large size
    rerender(<Button size="lg">Large Button</Button>);
    button = screen.getByRole('button', { name: 'Large Button' });
    expect(button).toHaveClass('h-12');
    expect(button).toHaveClass('text-lg');
  });

  it('should render full width button', () => {
    // Arrange & Act
    render(<Button fullWidth>Full Width Button</Button>);
    
    // Assert
    const button = screen.getByRole('button', { name: 'Full Width Button' });
    expect(button).toHaveClass('w-full');
  });

  it('should render loading state', () => {
    // Arrange & Act
    render(<Button loading>Loading Button</Button>);
    
    // Assert
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByText('Loading Button')).not.toBeInTheDocument();
    
    // Check for spinner
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('should be disabled when loading', () => {
    // Arrange & Act
    render(<Button loading>Loading Button</Button>);
    
    // Assert
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('should be disabled when disabled prop is true', () => {
    // Arrange & Act
    render(<Button disabled>Disabled Button</Button>);
    
    // Assert
    const button = screen.getByRole('button', { name: 'Disabled Button' });
    expect(button).toBeDisabled();
  });

  it('should call onClick when clicked', () => {
    // Arrange
    const onClickMock = vi.fn();
    
    // Act
    render(<Button onClick={onClickMock}>Clickable Button</Button>);
    
    fireEvent.click(screen.getByRole('button', { name: 'Clickable Button' }));
    
    // Assert
    expect(onClickMock).toHaveBeenCalledTimes(1);
  });

  it('should not call onClick when disabled', () => {
    // Arrange
    const onClickMock = vi.fn();
    
    // Act
    render(<Button onClick={onClickMock} disabled>Disabled Button</Button>);
    
    fireEvent.click(screen.getByRole('button', { name: 'Disabled Button' }));
    
    // Assert
    expect(onClickMock).not.toHaveBeenCalled();
  });

  it('should not call onClick when loading', () => {
    // Arrange
    const onClickMock = vi.fn();
    
    // Act
    render(<Button onClick={onClickMock} loading>Loading Button</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    
    // Assert
    expect(onClickMock).not.toHaveBeenCalled();
  });

  it('should apply custom className', () => {
    // Arrange
    const customClass = 'custom-class';
    
    // Act
    render(<Button className={customClass}>Custom Button</Button>);
    
    // Assert
    const button = screen.getByRole('button', { name: 'Custom Button' });
    expect(button).toHaveClass(customClass);
  });
});