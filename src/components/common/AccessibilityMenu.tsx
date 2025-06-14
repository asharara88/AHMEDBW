import { useState, useRef, useEffect } from 'react';
import { 
  Accessibility, 
  ZoomIn, 
  ZoomOut, 
  Type, 
  Sun, 
  Moon, 
  X,
  MessageSquareText, 
  MousePointer2, 
  Scaling
} from 'lucide-react';

export default function AccessibilityMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [textSize, setTextSize] = useState(100); // 100% is default
  const [highContrast, setHighContrast] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node) && 
          buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);
  
  // Apply text size changes
  useEffect(() => {
    document.documentElement.style.fontSize = `${textSize}%`;
  }, [textSize]);
  
  // Apply high contrast mode
  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [highContrast]);
  
  // Handle keyboard navigation
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);
  
  const increaseTextSize = () => {
    setTextSize(prev => Math.min(prev + 10, 150)); // Max 150%
  };
  
  const decreaseTextSize = () => {
    setTextSize(prev => Math.max(prev - 10, 80)); // Min 80%
  };
  
  const resetTextSize = () => {
    setTextSize(100); // Reset to 100%
  };
  
  const toggleHighContrast = () => {
    setHighContrast(prev => !prev);
  };
  
  return (
    <>
      {/* Floating button */}
      <button 
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 left-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        aria-label="Accessibility options"
        aria-expanded={isOpen}
      >
        <Accessibility className="h-6 w-6" aria-hidden="true" />
      </button>
      
      {/* Accessibility menu */}
      {isOpen && (
        <div 
          ref={menuRef}
          className="fixed bottom-20 left-6 z-50 w-64 rounded-lg border border-[hsl(var(--color-border))] bg-background p-4 shadow-lg"
          role="dialog"
          aria-labelledby="a11y-menu-title"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 id="a11y-menu-title" className="text-lg font-semibold flex items-center gap-2">
              <Accessibility className="h-5 w-5 text-primary" aria-hidden="true" />
              <span>Accessibility</span>
            </h2>
            <button 
              onClick={() => setIsOpen(false)} 
              className="rounded-full p-1 text-text-light hover:bg-[hsl(var(--color-card-hover))] hover:text-text"
              aria-label="Close accessibility menu"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          
          <div className="space-y-4">
            {/* Text Size Controls */}
            <div>
              <h3 className="mb-2 text-sm font-medium text-text-light flex items-center gap-1">
                <Type className="h-4 w-4" aria-hidden="true" />
                <span>Text Size</span>
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={decreaseTextSize}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] text-text-light hover:bg-[hsl(var(--color-card-hover))] hover:text-text"
                  aria-label="Decrease text size"
                >
                  <ZoomOut className="h-4 w-4" aria-hidden="true" />
                </button>
                
                <div className="flex-1 text-center text-sm">
                  <span className="font-medium">{textSize}%</span>
                </div>
                
                <button
                  onClick={increaseTextSize}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] text-text-light hover:bg-[hsl(var(--color-card-hover))] hover:text-text"
                  aria-label="Increase text size"
                >
                  <ZoomIn className="h-4 w-4" aria-hidden="true" />
                </button>
                
                <button
                  onClick={resetTextSize}
                  className="flex h-8 items-center justify-center rounded-full border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-2 text-xs text-text-light hover:bg-[hsl(var(--color-card-hover))] hover:text-text"
                  aria-label="Reset text size"
                >
                  <Scaling className="h-3 w-3 mr-1" aria-hidden="true" />
                  Reset
                </button>
              </div>
            </div>
            
            {/* High Contrast Mode */}
            <div>
              <button
                onClick={toggleHighContrast}
                className="flex w-full items-center justify-between rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-3 text-sm hover:bg-[hsl(var(--color-card-hover))]"
                aria-pressed={highContrast}
              >
                <div className="flex items-center gap-2">
                  {highContrast ? (
                    <Moon className="h-4 w-4 text-primary" aria-hidden="true" />
                  ) : (
                    <Sun className="h-4 w-4 text-text-light" aria-hidden="true" />
                  )}
                  <span>High Contrast Mode</span>
                </div>
                
                <div className={`h-5 w-9 rounded-full p-1 ${highContrast ? 'bg-primary' : 'bg-[hsl(var(--color-card-hover))]'}`}>
                  <div 
                    className={`h-3 w-3 rounded-full bg-white transition-transform ${
                      highContrast ? 'translate-x-4' : 'translate-x-0'
                    }`} 
                  />
                </div>
              </button>
            </div>
            
            {/* Motion Sensitivity */}
            <div>
              <h3 className="mb-2 text-sm font-medium text-text-light flex items-center gap-1">
                <MousePointer2 className="h-4 w-4" aria-hidden="true" />
                <span>Motion Sensitivity</span>
              </h3>
              <div className="flex items-center gap-2">
                <button
                  className="flex w-full items-center gap-2 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-2 text-sm hover:bg-[hsl(var(--color-card-hover))]"
                  aria-pressed="false"
                >
                  <span>Reduce Animations</span>
                </button>
              </div>
            </div>
            
            {/* Screen Reader Guide */}
            <div>
              <h3 className="mb-2 text-sm font-medium text-text-light flex items-center gap-1">
                <MessageSquareText className="h-4 w-4" aria-hidden="true" />
                <span>Screen Reader Help</span>
              </h3>
              <button
                className="flex w-full items-center gap-2 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-2 text-sm hover:bg-[hsl(var(--color-card-hover))]"
              >
                <span>Screen Reader Guide</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}