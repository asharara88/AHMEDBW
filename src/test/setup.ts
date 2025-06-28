import '@testing-library/jest-dom';
import { afterEach, vi, beforeEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Mock useAuthStore specifically
vi.mock('../store/useAuthStore', async (importOriginal) => {
  const actual = await importOriginal() as any;
  
  const mockStore = {
    user: null,
    session: null,
    profile: null,
    isDemo: false,
    loading: false,
    error: null,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    startDemo: vi.fn(),
    refreshSession: vi.fn(),
    updateProfile: vi.fn(),
    checkOnboardingStatus: vi.fn(),
    setLoading: vi.fn(),
    setError: vi.fn(),
  };

  const mockStoreFunction = Object.assign(vi.fn(() => mockStore), {
    setState: vi.fn(),
    getState: vi.fn(() => mockStore),
  });

  return {
    ...actual,
    useAuthStore: mockStoreFunction,
  };
});

// Global store mocks
vi.mock('../store', async (importOriginal) => {
  const actual = await importOriginal() as any;
  return {
    ...actual,
    useThemeStore: vi.fn(() => ({
      theme: 'light',
      setTheme: vi.fn(),
      toggleTheme: vi.fn(),
    })),
    useAuthStore: Object.assign(vi.fn(() => ({
      user: null,
      session: null,
      profile: null,
      isDemo: false,
      loading: false,
      error: null,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      startDemo: vi.fn(),
      refreshSession: vi.fn(),
      updateProfile: vi.fn(),
      checkOnboardingStatus: vi.fn(),
      setLoading: vi.fn(),
      setError: vi.fn(),
    })), {
      setState: vi.fn(),
      getState: vi.fn(() => ({
        user: null,
        session: null,
        profile: null,
        isDemo: false,
        loading: false,
        error: null,
      })),
    }),
    useCartStore: vi.fn(() => ({
      items: [],
      total: 0,
      itemCount: 0,
      addItem: vi.fn(),
      removeItem: vi.fn(),
      updateQuantity: vi.fn(),
      clearCart: vi.fn(),
    })),
  };
});

// Mock context providers
vi.mock('../contexts/ThemeContext', async (importOriginal) => {
  const actual = await importOriginal() as any;
  const React = await import('react');
  
  return {
    ...actual,
    ThemeProvider: ({ children }: { children: React.ReactNode }) => 
      React.createElement('div', { 'data-testid': 'theme-provider' }, children),
  };
});

vi.mock('../components/shopping/CartProvider', async (importOriginal) => {
  const actual = await importOriginal() as any;
  const React = await import('react');
  
  return {
    ...actual,
    CartProvider: ({ children }: { children: React.ReactNode }) => 
      React.createElement('div', { 'data-testid': 'cart-provider' }, children),
  };
});

// Mock Supabase client
vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
}));

// Mock session manager
vi.mock('../lib/sessionManager', () => ({
  restoreSession: vi.fn().mockResolvedValue(null),
  refreshSessionIfNeeded: vi.fn().mockResolvedValue(null),
}));

// Mock auth helpers
vi.mock('@supabase/auth-helpers-react', () => ({
  useSession: vi.fn(() => null),
  useUser: vi.fn(() => null),
}));

// Automatically cleanup after each test
afterEach(() => {
  cleanup();
});

// Setup store mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: localStorageMock,
});

// Mock scrollTo
window.scrollTo = vi.fn();