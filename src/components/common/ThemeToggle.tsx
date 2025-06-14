import { Sun, Moon, Laptop } from 'lucide-react';
import { useThemeManager } from '../../hooks/useThemeManager';

interface ThemeToggleProps {
  className?: string;
}

export default function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { theme, currentTheme, setTheme, toggleLightDark } = useThemeManager();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={() => toggleLightDark()}
        className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
          theme === 'light' || theme === 'dark' 
            ? 'bg-primary/10 text-primary' 
            : 'text-text-light hover:bg-[hsl(var(--color-card-hover))]'
        }`}
        aria-label={currentTheme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      >
        {currentTheme === 'light' ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        )}
      </button>
      
      {/* Optional button to cycle through themes */}
      <button
        onClick={() => setTheme(theme === 'system' ? 'time-based' : 'system')}
        className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
          theme === 'system' || theme === 'time-based' 
            ? 'bg-primary/10 text-primary' 
            : 'text-text-light hover:bg-[hsl(var(--color-card-hover))]'
        }`}
        aria-label="Toggle auto theme"
      >
        <Laptop className="h-5 w-5" />
      </button>
    </div>
  );
}