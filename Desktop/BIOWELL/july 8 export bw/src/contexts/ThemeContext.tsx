import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useThemeStore } from '../store';

// Create context with the same shape as the theme store
const ThemeContext = createContext<ReturnType<typeof useThemeStore.getState> | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const themeStore = useThemeStore();
  
  useEffect(() => {
    // Initial theme setup
    themeStore.updateCurrentTheme();
    
    // Set up interval for time-based theme
    const intervalId = setInterval(() => {
      if (themeStore.theme === 'time-based') {
        themeStore.updateCurrentTheme();
      }
    }, 60000); // Check every minute
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (themeStore.theme === 'system') {
        themeStore.updateCurrentTheme();
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      clearInterval(intervalId);
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [themeStore.theme]);

  return (
    <ThemeContext.Provider value={themeStore}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}