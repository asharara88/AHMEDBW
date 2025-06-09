import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'time-based' | 'system';

interface ThemeState {
  theme: Theme;
  currentTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  updateCurrentTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'time-based',
      currentTheme: 'dark',
      
      setTheme: (theme) => {
        set({ theme });
        
        // Update the current theme immediately
        const { updateCurrentTheme } = get();
        updateCurrentTheme();
      },
      
      updateCurrentTheme: () => {
        const { theme } = get();
        
        if (theme === 'system') {
          const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          set({ currentTheme: isDark ? 'dark' : 'light' });
          document.documentElement.classList.toggle('dark', isDark);
        } else if (theme === 'time-based') {
          const currentHour = new Date().getHours();
          const isDayTime = currentHour >= 6 && currentHour < 18; // 6 AM to 6 PM
          set({ currentTheme: isDayTime ? 'light' : 'dark' });
          document.documentElement.classList.toggle('dark', !isDayTime);
        } else {
          set({ currentTheme: theme });
          document.documentElement.classList.toggle('dark', theme === 'dark');
        }
      }
    }),
    {
      name: 'biowell-theme-storage',
    }
  )
);