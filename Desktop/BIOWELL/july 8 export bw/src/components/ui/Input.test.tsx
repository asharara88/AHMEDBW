import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../test/utils';
import { Input } from './Input';

describe('Input', () => {
  it('should render with default props', () => {
    // Arrange & Act
    render(<Input placeholder="Default Input" />);
    
    // Assert
    const input = screen.getByPlaceholderText('Default Input');
    expect(input).toBeInTheDocument();
    expect(input).toHaveClass('w-full');
    expect(input).toHaveClass('rounded-xl');
    expect(input).toHaveClass('border-2');
    expect(input).toHaveClass('border-[hsl(var(--color-border))]');
    expect(input).toHaveClass('bg-[hsl(var(--color-surface-1))]');
  });

  it('should render with error variant', () => {
    // Arrange & Act
    render(<Input error placeholder="Error Input" />);
    
    // Assert
    const input = screen.getByPlaceholderText('Error Input');
    expect(input).toHaveClass('border-error');
    expect(input).toHaveClass('bg-error/5');
    expect(input).toHaveClass('text-error');
  });

  it('should render with different sizes', () => {
    // Arrange & Act
    const { rerender } = render(<Input size="sm" placeholder="Small Input" />);
    
    // Assert
    let input = screen.getByPlaceholderText('Small Input');
    expect(input).toHaveClass('h-9');
    expect(input).toHaveClass('px-3');
    expect(input).toHaveClass('text-sm');
    
    // Rerender with medium size
    rerender(<Input size="md" placeholder="Medium Input" />);
    input = screen.getByPlaceholderText('Medium Input');
    expect(input).toHaveClass('h-11');
    expect(input).toHaveClass('px-4');
    
    // Rerender with large size
    rerender(<Input size="lg" placeholder="Large Input" />);
    input = screen.getByPlaceholderText('Large Input');
    expect(input).toHaveClass('h-12');
    expect(input).toHaveClass('px-4');
    expect(input).toHaveClass('text-lg');
  });

  it('should be disabled when disabled prop is true', () => {
    // Arrange & Act
    render(<Input disabled placeholder="Disabled Input" />);
    
    // Assert
    const input = screen.getByPlaceholderText('Disabled Input');
    expect(input).toBeDisabled();
  });

  it('should handle value changes', () => {
    // Arrange
    const onChangeMock = vi.fn();
    
    // Act
    render(<Input placeholder="Test Input" onChange={onChangeMock} />);
    
    const input = screen.getByPlaceholderText('Test Input');
    fireEvent.change(input, { target: { value: 'test value' } });
    
    // Assert
    expect(onChangeMock).toHaveBeenCalledTimes(1);
    expect(input).toHaveValue('test value');
  });

  it('should apply custom className', () => {
    // Arrange
    const customClass = 'custom-class';
    
    // Act
    render(<Input placeholder="Custom Input" className={customClass} />);
    
    // Assert
    const input = screen.getByPlaceholderText('Custom Input');
    expect(input).toHaveClass(customClass);
  });

  it('should pass through additional props', () => {
    // Arrange & Act
    render(<Input placeholder="Test Input" data-testid="test-input" maxLength={10} />);
    
    // Assert
    const input = screen.getByTestId('test-input');
    expect(input).toHaveAttribute('maxlength', '10');
  });
});