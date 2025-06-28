import { useRef, useEffect, ReactNode } from 'react';

interface AccessibleOnboardingProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

/**
 * A wrapper component that adds accessibility features to the onboarding flow
 */
const AccessibleOnboarding = ({ 
  children, 
  title = "Biowell Onboarding",
  description = "Complete your profile to personalize your health journey"
}: AccessibleOnboardingProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Ensure keyboard navigation works properly
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        // Keep focus within the onboarding container
        const focusableElements = container.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
        
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };
    
    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  return (
    <div 
      ref={containerRef}
      className="onboarding-container"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      aria-describedby="onboarding-description"
    >
      <div id="onboarding-title" className="sr-only">{title}</div>
      <div id="onboarding-description" className="sr-only">{description}</div>
      {children}
    </div>
  );
};

export default AccessibleOnboarding;