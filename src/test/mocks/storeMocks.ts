import { vi } from 'vitest';

// Mock store implementations
export const mockUseThemeStore = vi.fn(() => ({
  theme: 'light',
  setTheme: vi.fn(),
  toggleTheme: vi.fn(),
}));

export const mockUseAuthStore = vi.fn(() => ({
  user: null,
  session: null,
  profile: null,
  isDemo: false,
  loading: false,
  error: null,
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  refreshSession: vi.fn(),
  updateProfile: vi.fn(),
}));

export const mockUseCartStore = vi.fn(() => ({
  items: [],
  total: 0,
  itemCount: 0,
  addItem: vi.fn(),
  removeItem: vi.fn(),
  updateQuantity: vi.fn(),
  clearCart: vi.fn(),
}));

export const mockUseChatStore = vi.fn(() => ({
  messages: [],
  isLoading: false,
  error: null,
  addMessage: vi.fn(),
  clearMessages: vi.fn(),
  setLoading: vi.fn(),
  setError: vi.fn(),
}));

export const mockUseSupplementStore = vi.fn(() => ({
  supplements: [],
  loading: false,
  error: null,
  fetchSupplements: vi.fn(),
  addSupplement: vi.fn(),
  removeSupplement: vi.fn(),
}));

export const mockUseUserStore = vi.fn(() => ({
  userData: null,
  loading: false,
  error: null,
  updateUserData: vi.fn(),
  clearUserData: vi.fn(),
}));

// Store module mock
export const storeMock = {
  useThemeStore: mockUseThemeStore,
  useAuthStore: mockUseAuthStore,
  useCartStore: mockUseCartStore,
  useChatStore: mockUseChatStore,
  useSupplementStore: mockUseSupplementStore,
  useUserStore: mockUseUserStore,
};
