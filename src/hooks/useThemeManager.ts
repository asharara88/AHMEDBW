import { useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark' | 'time-based' | 'system';

interface ThemeInfo {
  currentTime?: string;
  isDayTime?: boolean;
  period?: string;
}

export function useThemeManager() {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme as Theme) || 'time-based';
  });

  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('dark');
  const [themeInfo, setThemeInfo] = useState<ThemeInfo>({});

  // Get current time info for time-based theme
  const getCurrentTimeInfo = useCallback(() => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const formattedTime = `${hours}:${minutes < 10 ? '0' + minutes : minutes}`;
    
    const isDayTime = hours >= 6 && hours < 18;
    
    const info = {
      currentTime: formattedTime,
      isDayTime,
      period: isDayTime ? 'Day' : 'Night'
    };
    
    setThemeInfo(info);
    return info;
  }, []);

  // Apply theme to document
  const applyTheme = useCallback((newTheme: 'light' | 'dark') => {
    setCurrentTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  }, []);

  // Update theme based on current settings
  const updateTheme = useCallback(() => {
    if (theme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      applyTheme(isDark ? 'dark' : 'light');
    } else if (theme === 'time-based') {
      const { isDayTime } = getCurrentTimeInfo();
      applyTheme(isDayTime ? 'light' : 'dark');
    } else {
      applyTheme(theme);
    }
  }, [theme, getCurrentTimeInfo, applyTheme]);

  // Toggle between light and dark themes
  const toggleLightDark = useCallback(() => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  }, [currentTheme]);
  
  // Cycle through available themes
  const cycleTheme = useCallback(() => {
    const themeOrder: Theme[] = ['light', 'dark', 'system', 'time-based'];
    const currentIndex = themeOrder.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themeOrder.length;
    setTheme(themeOrder[nextIndex]);
  }, [theme]);

  // Save theme to localStorage and update whenever theme changes
  useEffect(() => {
    localStorage.setItem('theme', theme);
    updateTheme();

    // Set up interval for time-based theme
    const intervalId = setInterval(() => {
      if (theme === 'time-based') {
        updateTheme();
      }
    }, 60000); // Check every minute

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMediaChange = () => {
      if (theme === 'system') {
        updateTheme();
      }
    };
    
    mediaQuery.addEventListener('change', handleMediaChange);
    
    return () => {
      clearInterval(intervalId);
      mediaQuery.removeEventListener('change', handleMediaChange);
    };
  }, [theme, updateTheme]);

  return {
    theme,
    currentTheme,
    themeInfo,
    setTheme,
    getCurrentTimeInfo,
    toggleLightDark,
    cycleTheme,
    isDark: currentTheme === 'dark',
    isLight: currentTheme === 'light'
  };
}