import { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'time-based' | 'system';

interface ThemeContextType {
  theme: Theme;
  currentTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme as Theme) || 'time-based';
  });

  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    localStorage.setItem('theme', theme);

    const updateTheme = () => {
      if (theme === 'system') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setCurrentTheme(isDark ? 'dark' : 'light');
        document.documentElement.classList.toggle('dark', isDark);
      } else if (theme === 'time-based') {
        const currentHour = new Date().getHours();
        const isDayTime = currentHour >= 6 && currentHour < 18; // 6 AM to 6 PM
        setCurrentTheme(isDayTime ? 'light' : 'dark');
        document.documentElement.classList.toggle('dark', !isDayTime);
      } else {
        setCurrentTheme(theme);
        document.documentElement.classList.toggle('dark', theme === 'dark');
      }
    };

    // Initial setup
    updateTheme();

    // Set up interval for time-based theme
    const intervalId = setInterval(() => {
      if (theme === 'time-based') {
        updateTheme();
      }
    }, 60000); // Check every minute

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', updateTheme);
    
    return () => {
      clearInterval(intervalId);
      mediaQuery.removeEventListener('change', updateTheme);
    };
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, currentTheme, setTheme }}>
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