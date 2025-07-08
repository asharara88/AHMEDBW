import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ErrorBoundary from './ErrorBoundary';

function ProblemChild() {
  throw new Error('Test error');
}

describe('ErrorBoundary', () => {
  it('should render fallback when an error is thrown', () => {
    const fallbackText = 'Fallback UI';
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary fallback={<div>{fallbackText}</div>}>
        <ProblemChild />
      </ErrorBoundary>
    );

    expect(screen.getByText(fallbackText)).toBeInTheDocument();
    consoleError.mockRestore();
  });

  it('should render children when no error occurs', () => {
    // Arrange & Act
    render(
      <ErrorBoundary>
        <div>Child</div>
      </ErrorBoundary>
    );

    // Assert
    expect(screen.getByText('Child')).toBeInTheDocument();
  });
});
