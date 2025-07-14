import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiClient, ErrorType } from './apiClient';
import { supabase } from '../lib/supabaseClient';

// Mock the supabase client
vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
    },
    from: vi.fn(),
  },
}));

// Mock the logger
vi.mock('../utils/logger', () => ({
  logError: vi.fn(),
  logInfo: vi.fn(),
  logWarning: vi.fn(),
}));

describe('apiClient', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('request', () => {
    it('should return data when operation succeeds', async () => {
      // Arrange
      const mockData = { id: '1', name: 'Test' };
      const mockOperation = vi.fn().mockResolvedValue({ data: mockData, error: null });

      // Act
      const result = await apiClient.request(mockOperation);

      // Assert
      expect(result).toEqual(mockData);
      expect(mockOperation).toHaveBeenCalledTimes(1);
    });

    it('should throw an ApiError when operation fails with Supabase error', async () => {
      // Arrange
      const mockError = { message: 'Database error', code: 'PGRST123' };
      const mockOperation = vi.fn().mockResolvedValue({ data: null, error: mockError });

      // Act & Assert
      await expect(apiClient.request(mockOperation)).rejects.toMatchObject({
        type: ErrorType.SERVER,
        message: 'Database error',
        originalError: mockError,
      });
    });

    it('should throw an ApiError when operation returns null data', async () => {
      // Arrange
      const mockOperation = vi.fn().mockResolvedValue({ data: null, error: null });

      // Act & Assert
      await expect(apiClient.request(mockOperation)).rejects.toMatchObject({
        type: ErrorType.UNKNOWN,
        message: 'No data returned',
      });
    });

    it('should throw an ApiError with custom message when provided', async () => {
      // Arrange
      const mockError = { message: 'Database error', code: 'PGRST123' };
      const mockOperation = vi.fn().mockResolvedValue({ data: null, error: mockError });
      const customErrorMessage = 'Custom error message';

      // Act & Assert
      await expect(apiClient.request(mockOperation, customErrorMessage)).rejects.toMatchObject({
        message: 'Database error', // Error message from the operation takes precedence
        originalError: mockError,
      });
    });

    it('should handle network errors correctly', async () => {
      // Arrange
      const networkError = new Error('Failed to fetch');
      const mockOperation = vi.fn().mockRejectedValue(networkError);

      // Act & Assert
      await expect(apiClient.request(mockOperation)).rejects.toMatchObject({
        type: ErrorType.UNKNOWN,
        message: 'An error occurred',
        originalError: networkError,
      });
    });
  });

  describe('callFunction', () => {
    beforeEach(() => {
      // Mock fetch
      global.fetch = vi.fn();
      
      // Mock getSession
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: {
          session: {
            access_token: 'mock-token',
          },
        },
        error: null,
      } as any);
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should call the function with correct parameters', async () => {
      // Arrange
      const functionName = 'test-function';
      const payload = { test: 'data' };
      
      // Mock successful response
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ result: 'success' }),
      } as Response);

      // Set environment variables
      vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
      vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-key');

      // Act
      const result = await apiClient.callFunction(functionName, payload);

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        'https://test.supabase.co/functions/v1/test-function',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-token',
            'apikey': 'test-key',
          }),
          body: JSON.stringify(payload),
        })
      );
      expect(result).toEqual({ result: 'success' });
    });

    it('should throw an ApiError when function call fails', async () => {
      // Arrange
      const functionName = 'test-function';
      const payload = { test: 'data' };
      
      // Mock failed response
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ error: { message: 'Server error' } }),
      } as Response);

      // Set environment variables
      vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
      vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-key');

      // Act & Assert
      await expect(apiClient.callFunction(functionName, payload)).rejects.toMatchObject({
        type: ErrorType.SERVER,
        message: 'Server error',
        status: 500,
      });
    });

    it('should throw an authentication error when no session is available', async () => {
      // Arrange
      const functionName = 'test-function';
      const payload = { test: 'data' };
      
      // Mock no session
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null,
      } as any);

      // Act & Assert
      await expect(apiClient.callFunction(functionName, payload)).rejects.toMatchObject({
        type: ErrorType.AUTHENTICATION,
        message: 'Authentication required',
      });
    });
  });
});