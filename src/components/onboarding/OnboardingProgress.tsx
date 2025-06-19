import { motion } from 'framer-motion';

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
      <div className="h-2 overflow-hidden rounded-full bg-[hsl(var(--color-surface-1))]">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      
      {stepNames.length > 0 && (
        <div className="mt-2 flex justify-between">
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