import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useApi } from './useApi';
import { ErrorType } from '../api/apiClient';

describe('useApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    
    // Reset sessionStorage
    sessionStorage.clear();
  });

  it('should return initial state', () => {
    // Arrange
    const apiFunction = vi.fn();
    
    // Act
    const { result } = renderHook(() => useApi(apiFunction));
    
    // Assert
    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle successful API call', async () => {
    // Arrange
    const mockData = { id: '1', name: 'Test' };
    const apiFunction = vi.fn().mockResolvedValue(mockData);
    const onSuccess = vi.fn();
    
    // Act
    const { result } = renderHook(() => useApi(apiFunction, { onSuccess }));
    
    await act(async () => {
      const returnedData = await result.current.execute();
      expect(returnedData).toEqual(mockData);
    });
    
    // Assert
    expect(result.current.data).toEqual(mockData);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(apiFunction).toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalledWith(mockData);
  });

  it('should handle API error', async () => {
    // Arrange
    const apiError = {
      type: ErrorType.SERVER,
      message: 'Server error',
    };
    const apiFunction = vi.fn().mockRejectedValue(apiError);
    const onError = vi.fn();
    
    // Act
    const { result } = renderHook(() => useApi(apiFunction, { onError }));
    
    await act(async () => {
      try {
        await result.current.execute();
      } catch (error) {
        expect(error).toEqual(apiError);
      }
    });
    
    // Assert
    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toEqual(apiError);
    expect(apiFunction).toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith(apiError);
  });

  it('should use custom error message when provided', async () => {
    // Arrange
    const apiError = {
      type: ErrorType.UNKNOWN,
      message: '',
    };
    const customErrorMessage = 'Custom error message';
    const apiFunction = vi.fn().mockRejectedValue(apiError);
    
    // Act
    const { result } = renderHook(() => useApi(apiFunction, { errorMessage: customErrorMessage }));
    
    await act(async () => {
      try {
        await result.current.execute();
      } catch (error) {
        expect(error).toEqual({
          ...apiError,
          message: customErrorMessage,
        });
      }
    });
    
    // Assert
    expect(result.current.error).toEqual({
      ...apiError,
      message: customErrorMessage,
    });
  });

  it('should handle authentication errors by saving redirect URL', async () => {
    // Arrange
    const apiError = {
      type: ErrorType.AUTHENTICATION,
      message: 'Authentication required',
    };
    const apiFunction = vi.fn().mockRejectedValue(apiError);
    
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/dashboard',
      },
      writable: true,
    });
    
    // Act
    const { result } = renderHook(() => useApi(apiFunction));
    
    await act(async () => {
      try {
        await result.current.execute();
      } catch (error) {
        expect(error).toEqual(apiError);
      }
    });
    
    // Assert
    expect(sessionStorage.getItem('redirectUrl')).toBe('/dashboard');
  });

  it('should reset data and error when reset is called', async () => {
    // Arrange
    const mockData = { id: '1', name: 'Test' };
    const apiFunction = vi.fn().mockResolvedValue(mockData);
    
    // Act
    const { result } = renderHook(() => useApi(apiFunction));
    
    await act(async () => {
      await result.current.execute();
    });
    
    expect(result.current.data).toEqual(mockData);
    
    act(() => {
      result.current.reset();
    });
    
    // Assert
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should allow setting data manually', () => {
    // Arrange
    const apiFunction = vi.fn();
    const mockData = { id: '1', name: 'Test' };
    
    // Act
    const { result } = renderHook(() => useApi(apiFunction));
    
    act(() => {
      result.current.setData(mockData);
    });
    
    // Assert
    expect(result.current.data).toEqual(mockData);
  });
});