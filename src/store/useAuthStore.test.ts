import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuthStore } from './useAuthStore';
import { authApi } from '../api/authApi';

// Mock the auth API
vi.mock('../api/authApi', () => ({
  authApi: {
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    refreshSession: vi.fn(),
    getUserProfile: vi.fn(),
    updateProfile: vi.fn(),
    checkOnboardingStatus: vi.fn(),
  },
}));

// Mock localStorage
vi.mock('../utils/logger', () => ({
  logError: vi.fn(),
  logInfo: vi.fn(),
  logWarning: vi.fn(),
}));

describe('useAuthStore', () => {
  beforeEach(() => {
    // Reset the store before each test
    useAuthStore.setState({
      user: null,
      session: null,
      profile: null,
      isDemo: false,
      loading: false,
      error: null,
    });
    
    // Clear all mocks
    vi.clearAllMocks();
    
    // Clear localStorage
    localStorage.clear();
  });

  describe('signIn', () => {
    it('should update state on successful sign in', async () => {
      // Arrange
      const mockUser = { id: '123', email: 'test@example.com' };
      const mockSession = { access_token: 'token' };
      vi.mocked(authApi.signIn).mockResolvedValueOnce({
        user: mockUser,
        session: mockSession,
      } as any);
      
      vi.mocked(authApi.getUserProfile).mockResolvedValueOnce({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
      });

      // Act
      await useAuthStore.getState().signIn('test@example.com', 'password');

      // Assert
      expect(useAuthStore.getState().user).toEqual(mockUser);
      expect(useAuthStore.getState().session).toEqual(mockSession);
      expect(useAuthStore.getState().loading).toBe(false);
      expect(useAuthStore.getState().error).toBeNull();
    });

    it('should set error state when sign in fails', async () => {
      // Arrange
      const errorMessage = 'Invalid credentials';
      vi.mocked(authApi.signIn).mockRejectedValueOnce(new Error(errorMessage));

      // Act
      await useAuthStore.getState().signIn('test@example.com', 'wrong-password');

      // Assert
      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().session).toBeNull();
      expect(useAuthStore.getState().loading).toBe(false);
      expect(useAuthStore.getState().error).toBe(errorMessage);
    });
  });

  describe('signOut', () => {
    it('should clear state on sign out', async () => {
      // Arrange
      useAuthStore.setState({
        user: { id: '123' } as any,
        session: { access_token: 'token' } as any,
        profile: { firstName: 'Test', lastName: 'User' },
        isDemo: false,
      });

      // Act
      await useAuthStore.getState().signOut();

      // Assert
      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().session).toBeNull();
      expect(useAuthStore.getState().profile).toBeNull();
      expect(useAuthStore.getState().isDemo).toBe(false);
      expect(vi.mocked(authApi.signOut)).toHaveBeenCalled();
    });

    it('should clear state even if sign out API call fails', async () => {
      // Arrange
      useAuthStore.setState({
        user: { id: '123' } as any,
        session: { access_token: 'token' } as any,
        profile: { firstName: 'Test', lastName: 'User' },
        isDemo: false,
      });
      
      vi.mocked(authApi.signOut).mockRejectedValueOnce(new Error('Network error'));

      // Act
      await useAuthStore.getState().signOut();

      // Assert
      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().session).toBeNull();
      expect(useAuthStore.getState().profile).toBeNull();
      expect(useAuthStore.getState().isDemo).toBe(false);
    });
  });

  describe('startDemo', () => {
    it('should set demo state', () => {
      // Act
      useAuthStore.getState().startDemo();

      // Assert
      expect(useAuthStore.getState().isDemo).toBe(true);
      expect(useAuthStore.getState().user).not.toBeNull();
      expect(useAuthStore.getState().user?.id).toBe('00000000-0000-0000-0000-000000000000');
      expect(useAuthStore.getState().profile).toEqual({
        firstName: 'Demo',
        lastName: 'User',
        email: 'demo@example.com',
        mobile: '+971 (50) 123 4567',
        onboardingCompleted: true,
      });
      
      // Check localStorage
      const savedData = localStorage.getItem('biowell-user-data');
      expect(savedData).not.toBeNull();
      expect(JSON.parse(savedData!)).toEqual({
        firstName: 'Demo',
        lastName: 'User',
        email: 'demo@example.com',
        mobile: '+971 (50) 123 4567',
        onboardingCompleted: true,
      });
    });
  });

  describe('updateProfile', () => {
    it('should update profile data', async () => {
      // Arrange
      const userId = '123';
      useAuthStore.setState({
        user: { id: userId } as any,
        isDemo: false,
      });
      
      const profileData = {
        firstName: 'Updated',
        lastName: 'User',
        email: 'test@example.com',
      };
      
      vi.mocked(authApi.updateProfile).mockResolvedValueOnce();

      // Act
      await useAuthStore.getState().updateProfile(profileData);

      // Assert
      expect(vi.mocked(authApi.updateProfile)).toHaveBeenCalledWith(userId, profileData);
      expect(useAuthStore.getState().profile).toEqual({
        ...profileData,
        email: 'test@example.com',
        onboardingCompleted: true,
      });
      
      // Check localStorage
      const savedData = localStorage.getItem('biowell-user-data');
      expect(savedData).not.toBeNull();
      expect(JSON.parse(savedData!)).toEqual({
        ...profileData,
        email: 'test@example.com',
        onboardingCompleted: true,
      });
    });

    it('should return error when user is not authenticated', async () => {
      // Arrange
      useAuthStore.setState({
        user: null,
        isDemo: false,
      });
      
      const profileData = {
        firstName: 'Updated',
        lastName: 'User',
      };

      // Act
      const result = await useAuthStore.getState().updateProfile(profileData);

      // Assert
      expect(result.error).toBe('User not authenticated or in demo mode');
      expect(vi.mocked(authApi.updateProfile)).not.toHaveBeenCalled();
    });

    it('should return error when in demo mode', async () => {
      // Arrange
      useAuthStore.setState({
        user: { id: '123' } as any,
        isDemo: true,
      });
      
      const profileData = {
        firstName: 'Updated',
        lastName: 'User',
      };

      // Act
      const result = await useAuthStore.getState().updateProfile(profileData);

      // Assert
      expect(result.error).toBe('User not authenticated or in demo mode');
      expect(vi.mocked(authApi.updateProfile)).not.toHaveBeenCalled();
    });
  });
});