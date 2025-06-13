import { describe, it, expect, vi, beforeEach } from 'vitest';
import { restoreSession, refreshSessionIfNeeded } from './sessionManager';
import { supabase } from './supabaseClient';

// Mock the supabase client
vi.mock('./supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      refreshSession: vi.fn(),
      signOut: vi.fn(),
    },
  },
}));

// Mock the logger
vi.mock('../utils/logger', () => ({
  logError: vi.fn(),
  logInfo: vi.fn(),
}));

// Mock window.location
const originalLocation = window.location;
beforeEach(() => {
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: { href: '' },
    writable: true,
  });
});

afterEach(() => {
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: originalLocation,
    writable: true,
  });
});

describe('sessionManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('restoreSession', () => {
    it('should return session when getSession succeeds', async () => {
      // Arrange
      const mockSession = { access_token: 'test-token' };
      vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
        data: { session: mockSession },
        error: null,
      } as any);

      // Act
      const result = await restoreSession();

      // Assert
      expect(result).toEqual(mockSession);
      expect(supabase.auth.getSession).toHaveBeenCalledTimes(1);
    });

    it('should return null when getSession fails', async () => {
      // Arrange
      vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
        data: { session: null },
        error: new Error('Test error'),
      } as any);

      // Act
      const result = await restoreSession();

      // Assert
      expect(result).toBeNull();
    });

    it('should return null when an unexpected error occurs', async () => {
      // Arrange
      vi.mocked(supabase.auth.getSession).mockRejectedValueOnce(new Error('Unexpected error'));

      // Act
      const result = await restoreSession();

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('refreshSessionIfNeeded', () => {
    it('should refresh session when valid refresh token exists', async () => {
      // Arrange
      const mockCurrentSession = { refresh_token: 'test-refresh-token' };
      const mockNewSession = { access_token: 'new-token' };
      
      vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
        data: { session: mockCurrentSession },
        error: null,
      } as any);
      
      vi.mocked(supabase.auth.refreshSession).mockResolvedValueOnce({
        data: { session: mockNewSession },
        error: null,
      } as any);

      // Act
      const result = await refreshSessionIfNeeded();

      // Assert
      expect(result).toEqual(mockNewSession);
      expect(supabase.auth.refreshSession).toHaveBeenCalledTimes(1);
    });

    it('should return null when no refresh token exists', async () => {
      // Arrange
      vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
        data: { session: { access_token: 'test-token' } },
        error: null,
      } as any);

      // Act
      const result = await refreshSessionIfNeeded();

      // Assert
      expect(result).toBeNull();
      expect(supabase.auth.refreshSession).not.toHaveBeenCalled();
    });

    it('should sign out and redirect when refresh token is invalid', async () => {
      // Arrange
      const mockCurrentSession = { refresh_token: 'test-refresh-token' };
      
      vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
        data: { session: mockCurrentSession },
        error: null,
      } as any);
      
      vi.mocked(supabase.auth.refreshSession).mockResolvedValueOnce({
        data: { session: null },
        error: new Error('Invalid Refresh Token'),
      } as any);

      // Act
      const result = await refreshSessionIfNeeded();

      // Assert
      expect(result).toBeNull();
      expect(supabase.auth.signOut).toHaveBeenCalledTimes(1);
      expect(window.location.href).toBe('/login');
      expect(localStorage.getItem('biowell-user-data')).toBeNull();
    });

    it('should return null when refresh fails with other error', async () => {
      // Arrange
      const mockCurrentSession = { refresh_token: 'test-refresh-token' };
      
      vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
        data: { session: mockCurrentSession },
        error: null,
      } as any);
      
      vi.mocked(supabase.auth.refreshSession).mockResolvedValueOnce({
        data: { session: null },
        error: new Error('Network error'),
      } as any);

      // Act
      const result = await refreshSessionIfNeeded();

      // Assert
      expect(result).toBeNull();
      expect(supabase.auth.signOut).not.toHaveBeenCalled();
    });
  });
});