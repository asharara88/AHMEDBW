import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon, Laptop } from 'lucide-react';

interface ThemeStatusProps {
  className?: string;
}

const ThemeStatus = ({ className = '' }: ThemeStatusProps) => {
  const { theme, currentTheme } = useTheme();
  
  const getCurrentTimeInfo = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const formattedTime = `${hours}:${minutes < 10 ? '0' + minutes : minutes}`;
    
    const isDayTime = hours >= 6 && hours < 18;
    
    return {
      time: formattedTime,
      isDayTime,
      period: isDayTime ? 'Day' : 'Night'
    };
  };
  
  const timeInfo = getCurrentTimeInfo();
  
  return (
    <div className={`rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {theme === 'light' && <Sun className="h-4 w-4 text-warning" />}
          {theme === 'dark' && <Moon className="h-4 w-4 text-primary" />}
          {theme === 'time-based' && (
            currentTheme === 'dark' ? 
              <Moon className="h-4 w-4 text-primary" /> : 
              <Sun className="h-4 w-4 text-warning" />
          )}
          {theme === 'system' && (
            currentTheme === 'dark' ? 
              <Moon className="h-4 w-4 text-primary" /> : 
              <Sun className="h-4 w-4 text-warning" />
          )}
          
          <span className="text-xs font-medium">
            {theme === 'light' && 'Light Mode'}
            {theme === 'dark' && 'Dark Mode'}
            {theme === 'time-based' && `Auto (${timeInfo.period})`}
            {theme === 'system' && 'Auto (System)'}
          </span>
        </div>
        
        {theme === 'time-based' && (
          <span className="text-xs text-text-light">
            Current time: {timeInfo.time}
          </span>
        )}
      </div>
    </div>
  );
};

export default ThemeStatus;