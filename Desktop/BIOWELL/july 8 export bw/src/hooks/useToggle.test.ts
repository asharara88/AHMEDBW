import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useToggle } from './useToggle';

describe('useToggle', () => {
  it('should initialize with default value (false)', () => {
    // Arrange & Act
    const { result } = renderHook(() => useToggle());
    
    // Assert
    expect(result.current.value).toBe(false);
  });

  it('should initialize with provided value', () => {
    // Arrange & Act
    const { result } = renderHook(() => useToggle(true));
    
    // Assert
    expect(result.current.value).toBe(true);
  });

  it('should toggle value when toggle is called', () => {
    // Arrange
    const { result } = renderHook(() => useToggle(false));
    
    // Act
    act(() => {
      result.current.toggle();
    });
    
    // Assert
    expect(result.current.value).toBe(true);
    
    // Act again
    act(() => {
      result.current.toggle();
    });
    
    // Assert
    expect(result.current.value).toBe(false);
  });

  it('should set value to true when setOn is called', () => {
    // Arrange
    const { result } = renderHook(() => useToggle(false));
    
    // Act
    act(() => {
      result.current.setOn();
    });
    
    // Assert
    expect(result.current.value).toBe(true);
    
    // Act again (should remain true)
    act(() => {
      result.current.setOn();
    });
    
    // Assert
    expect(result.current.value).toBe(true);
  });

  it('should set value to false when setOff is called', () => {
    // Arrange
    const { result } = renderHook(() => useToggle(true));
    
    // Act
    act(() => {
      result.current.setOff();
    });
    
    // Assert
    expect(result.current.value).toBe(false);
    
    // Act again (should remain false)
    act(() => {
      result.current.setOff();
    });
    
    // Assert
    expect(result.current.value).toBe(false);
  });
});