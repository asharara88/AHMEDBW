import { describe, it, expect } from 'vitest';
import { render, screen } from '../../test/utils';
import ApiErrorDisplay from './ApiErrorDisplay';
import { ErrorType } from '../../api/apiClient';

describe('ApiErrorDisplay', () => {
  it('should not render anything when error is null', () => {
    // Arrange & Act
    const { container } = render(<ApiErrorDisplay error={null} />);
    
    // Assert
    expect(container.firstChild).toBeNull();
  });

  it('should display the error message', () => {
    // Arrange
    const error = {
      type: ErrorType.UNKNOWN,
      message: 'Test error message',
    };
    
    // Act
    render(<ApiErrorDisplay error={error} />);
    
    // Assert
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    // Arrange
    const error = {
      type: ErrorType.UNKNOWN,
      message: 'Test error message',
    };
    const customClass = 'custom-class';
    
    // Act
    const { container } = render(<ApiErrorDisplay error={error} className={customClass} />);
    
    // Assert
    expect(container.firstChild).toHaveClass(customClass);
  });

  it('should display default message for authentication error when no message provided', () => {
    // Arrange
    const error = {
      type: ErrorType.AUTHENTICATION,
      message: '',
    };
    
    // Act
    render(<ApiErrorDisplay error={error} />);
    
    // Assert
    expect(screen.getByText('Authentication error. Please sign in again.')).toBeInTheDocument();
  });

  it('should display default message for network error when no message provided', () => {
    // Arrange
    const error = {
      type: ErrorType.NETWORK,
      message: '',
    };
    
    // Act
    render(<ApiErrorDisplay error={error} />);
    
    // Assert
    expect(screen.getByText('Network error. Please check your connection.')).toBeInTheDocument();
  });

  it('should display default message for server error when no message provided', () => {
    // Arrange
    const error = {
      type: ErrorType.SERVER,
      message: '',
    };
    
    // Act
    render(<ApiErrorDisplay error={error} />);
    
    // Assert
    expect(screen.getByText('Server error. Please try again later.')).toBeInTheDocument();
  });

  it('should display default message for validation error when no message provided', () => {
    // Arrange
    const error = {
      type: ErrorType.VALIDATION,
      message: '',
    };
    
    // Act
    render(<ApiErrorDisplay error={error} />);
    
    // Assert
    expect(screen.getByText('Invalid data. Please check your input.')).toBeInTheDocument();
  });

  it('should display default message for unknown error when no message provided', () => {
    // Arrange
    const error = {
      type: ErrorType.UNKNOWN,
      message: '',
    };
    
    // Act
    render(<ApiErrorDisplay error={error} />);
    
    // Assert
    expect(screen.getByText('An unexpected error occurred.')).toBeInTheDocument();
  });
});