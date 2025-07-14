import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
  stepNames?: string[];
}

/**
 * A progress indicator for the onboarding flow
 */
const OnboardingProgress = ({ 
  currentStep, 
  totalSteps,
  stepNames = []
}: OnboardingProgressProps) => {
  const progress = ((currentStep + 1) / totalSteps) * 100;
  
  return (
    <div className="mb-6">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium">
          {stepNames[currentStep] || `Step ${currentStep + 1} of ${totalSteps}`}
        </span>
        <span className="text-text-light">{Math.round(progress)}% complete</span>
      </div>
      
      <div className="relative">
        <div className="h-2 overflow-hidden rounded-full bg-[hsl(var(--color-surface-1))]">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        
        {/* Step indicators */}
        <div className="absolute top-0 w-full flex justify-between transform -translate-y-1/2">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div 
              key={index} 
              className={`flex items-center justify-center rounded-full transition-all ${
                index <= currentStep 
                  ? 'bg-primary text-white' 
                  : 'bg-[hsl(var(--color-surface-2))] text-text-light'
              } ${index === currentStep ? 'h-6 w-6 ring-4 ring-primary/20' : 'h-4 w-4'}`}
            >
              {index < currentStep ? (
                <CheckCircle className="h-3 w-3" />
              ) : (
                <span className="text-xs">{index + 1}</span>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {stepNames.length > 0 && (
        <div className="mt-6 flex justify-between">
          {stepNames.map((name, index) => (
            <div 
              key={index} 
              className={`text-xs ${index === currentStep ? 'text-primary font-medium' : 'text-text-light'}`}
              style={{ 
                width: `${100 / totalSteps}%`, 
                textAlign: index === 0 ? 'left' : index === totalSteps - 1 ? 'right' : 'center' 
              }}
            >
              {name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OnboardingProgress;