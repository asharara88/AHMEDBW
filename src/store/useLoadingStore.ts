import { create } from 'zustand';

interface LoadingState {
  loadingStates: Record<string, boolean>;
  setLoading: (key: string, loading: boolean) => void;
  isLoading: (key: string) => boolean;
  isAnyLoading: () => boolean;
  clearAll: () => void;
}

export const useLoadingStore = create<LoadingState>((set, get) => ({
  loadingStates: {},
  
  setLoading: (key: string, loading: boolean) => {
    set((state) => ({
      loadingStates: {
        ...state.loadingStates,
        [key]: loading
      }
    }));
  },
  
  isLoading: (key: string) => {
    return get().loadingStates[key] || false;
  },
  
  isAnyLoading: () => {
    const states = get().loadingStates;
    return Object.values(states).some(loading => loading);
  },
  
  clearAll: () => {
    set({ loadingStates: {} });
  }
}));

// Utility functions for common loading patterns
export const withLoading = async <T>(
  key: string,
  operation: () => Promise<T>
): Promise<T> => {
  const { setLoading } = useLoadingStore.getState();
  
  try {
    setLoading(key, true);
    const result = await operation();
    return result;
  } finally {
    setLoading(key, false);
  }
};

// Common loading keys
export const LOADING_KEYS = {
  CHAT_RESPONSE: 'chat_response',
  USER_PROFILE: 'user_profile',
  SUPPLEMENTS: 'supplements',
  SPEECH_SYNTHESIS: 'speech_synthesis',
  AUTHENTICATION: 'authentication',
  SAVE_PROFILE: 'save_profile',
  UPLOAD_FILE: 'upload_file',
} as const;

export type LoadingKey = typeof LOADING_KEYS[keyof typeof LOADING_KEYS];
