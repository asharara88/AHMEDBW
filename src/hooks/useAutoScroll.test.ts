import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAutoScroll } from './useAutoScroll';

describe('useAutoScroll', () => {
  it('should call scrollIntoView when dependencies change', () => {
    // Arrange
    const ref = { current: { scrollIntoView: vi.fn() } };
    const dependencies = [1];
    
    // Act
    renderHook(() => useAutoScroll(ref, dependencies));
    
    // Assert
    expect(ref.current.scrollIntoView).toHaveBeenCalledTimes(1);
  });

  it('should not call scrollIntoView when ref is null', () => {
    // Arrange
    const ref = { current: null };
    const dependencies = [1];
    
    // Act
    renderHook(() => useAutoScroll(ref, dependencies));
    
    // Assert - no error should be thrown
    expect(true).toBe(true);
  });

  it('should call scrollIntoView with provided options', () => {
    // Arrange
    const ref = { current: { scrollIntoView: vi.fn() } };
    const dependencies = [1];
    const options = { behavior: 'auto' as const };
    
    // Act
    renderHook(() => useAutoScroll(ref, dependencies, options));
    
    // Assert
    expect(ref.current.scrollIntoView).toHaveBeenCalledWith(options);
  });

  it('should call scrollIntoView when dependencies change', () => {
    // Arrange
    const ref = { current: { scrollIntoView: vi.fn() } };
    const dependencies = [1];
    
    // Act
    const { rerender } = renderHook(
      ({ deps }) => useAutoScroll(ref, deps),
      { initialProps: { deps: dependencies } }
    );
    
    // Initial render should call scrollIntoView once
    expect(ref.current.scrollIntoView).toHaveBeenCalledTimes(1);
    
    // Reset mock to check if it's called again
    ref.current.scrollIntoView.mockReset();
    
    // Rerender with same dependencies
    rerender({ deps: [1] });
    
    // Should not call scrollIntoView again with same dependencies
    expect(ref.current.scrollIntoView).not.toHaveBeenCalled();
    
    // Rerender with different dependencies
    rerender({ deps: [2] });
    
    // Should call scrollIntoView again with different dependencies
    expect(ref.current.scrollIntoView).toHaveBeenCalledTimes(1);
  });
});