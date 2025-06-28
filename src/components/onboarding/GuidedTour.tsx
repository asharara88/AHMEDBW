import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Info } from 'lucide-react';

interface TourStep {
  element: string;
  title: string;
  content: string;
  position?: 'top' | 'right' | 'bottom' | 'left';
}

interface GuidedTourProps {
  steps: TourStep[];
  onComplete: () => void;
  onSkip?: () => void;
  initialStep?: number;
}

const GuidedTour = ({ 
  steps, 
  onComplete, 
  onSkip,
  initialStep = 0
}: GuidedTourProps) => {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [userPaced, setUserPaced] = useState(true);
  const [visible, setVisible] = useState(true);
  
  useEffect(() => {
    // Highlight the current element
    const currentStepData = steps[currentStep];
    const element = document.querySelector(currentStepData.element);
    
    if (element) {
      // Add highlight class
      element.classList.add('tour-highlight');
      
      // Scroll element into view if needed
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Position the tooltip near the element
      const tooltip = document.getElementById('tour-tooltip');
      if (tooltip) {
        const rect = element.getBoundingClientRect();
        const position = currentStepData.position || 'bottom';
        
        switch (position) {
          case 'top':
            tooltip.style.top = `${rect.top - tooltip.offsetHeight - 10}px`;
            tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`;
            break;
          case 'right':
            tooltip.style.top = `${rect.top + rect.height / 2 - tooltip.offsetHeight / 2}px`;
            tooltip.style.left = `${rect.right + 10}px`;
            break;
          case 'bottom':
            tooltip.style.top = `${rect.bottom + 10}px`;
            tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`;
            break;
          case 'left':
            tooltip.style.top = `${rect.top + rect.height / 2 - tooltip.offsetHeight / 2}px`;
            tooltip.style.left = `${rect.left - tooltip.offsetWidth - 10}px`;
            break;
        }
      }
    }
    
    // Auto-advance if not user-paced
    let timeoutId: number;
    if (!userPaced) {
      timeoutId = window.setTimeout(() => {
        if (currentStep < steps.length - 1) {
          setCurrentStep(currentStep + 1);
        } else {
          onComplete();
        }
      }, 5000);
    }
    
    // Cleanup
    return () => {
      if (element) {
        element.classList.remove('tour-highlight');
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [currentStep, steps, userPaced, onComplete]);
  
  if (!visible) return null;
  
  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30 pointer-events-auto" />
      
      {/* Tooltip */}
      <motion.div
        id="tour-tooltip"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-4 right-4 z-50 w-80 rounded-xl bg-[hsl(var(--color-card))] p-4 shadow-lg pointer-events-auto"
      >
        <button
          onClick={() => setVisible(false)}
          className="absolute right-2 top-2 rounded-full p-1 text-text-light hover:bg-[hsl(var(--color-card-hover))] hover:text-text"
          aria-label="Close tour"
        >
          <X className="h-4 w-4" />
        </button>
        
        <div className="mb-1 flex items-center gap-2">
          <div className="rounded-full bg-primary/10 p-1 text-primary">
            <Info className="h-4 w-4" />
          </div>
          <span className="text-xs text-text-light">Step {currentStep + 1} of {steps.length}</span>
        </div>
        
        <h4 className="mb-2 text-lg font-bold">{steps[currentStep].title}</h4>
        <p className="mb-4 text-sm text-text-light">{steps[currentStep].content}</p>
        
        <div className="flex justify-between">
          <button
            onClick={() => currentStep > 0 && setCurrentStep(currentStep - 1)}
            disabled={currentStep === 0}
            className="rounded-lg border border-[hsl(var(--color-border))] px-3 py-1 text-sm disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="user-paced"
              checked={userPaced}
              onChange={() => setUserPaced(!userPaced)}
              className="mr-2 h-4 w-4 rounded border-[hsl(var(--color-border))] text-primary"
            />
            <label htmlFor="user-paced" className="text-xs">Self-paced</label>
          </div>
          
          {currentStep < steps.length - 1 ? (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              className="rounded-lg bg-primary px-3 py-1 text-sm text-white"
            >
              Next <ChevronRight className="ml-1 inline-block h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={onComplete}
              className="rounded-lg bg-primary px-3 py-1 text-sm text-white"
            >
              Finish
            </button>
          )}
        </div>
        
        {onSkip && (
          <button
            onClick={onSkip}
            className="mt-2 w-full text-center text-xs text-text-light hover:underline"
          >
            Skip tour
          </button>
        )}
      </motion.div>
    </div>
  );
};

export default GuidedTour;