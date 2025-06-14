import React, { createContext, useContext, ReactNode } from 'react';
import { useThemeManager } from '../hooks/useThemeManager';

interface ThemeProviderProps {
  children: ReactNode;
}

// Create the context with the shape of what useThemeManager returns
type ThemeContextType = ReturnType<typeof useThemeManager>;

// Create the context with undefined as initial value
const ThemeManagerContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeManagerProvider({ children }: ThemeProviderProps) {
  const themeManager = useThemeManager();
  
  return (
    <ThemeManagerContext.Provider value={themeManager}>
      {children}
    </ThemeManagerContext.Provider>
  );
}

// Custom hook to use the theme context
export function useThemeManager() {
  const context = useContext(ThemeManagerContext);
  if (context === undefined) {
    throw new Error('useThemeManager must be used within a ThemeManagerProvider');
  }
  return context;
}