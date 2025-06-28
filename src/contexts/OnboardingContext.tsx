import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { OnboardingFormData } from '../api/onboardingApi';

interface OnboardingContextType {
  data: OnboardingFormData;
  stage: string;
  isComplete: boolean;
  updateData: (newData: Partial<OnboardingFormData>) => void;
  setStage: (stage: string) => void;
  complete: () => Promise<OnboardingFormData>;
  trackTime: (step: string) => () => number;
  recordDropOff: (step: string, reason?: string) => void;
}

const OnboardingContext = createContext<OnboardingContextType | null>(null);

interface OnboardingProviderProps {
  children: ReactNode;
}

export const OnboardingProvider = ({ children }: OnboardingProviderProps) => {
  const [onboardingData, setOnboardingData] = useState<OnboardingFormData>({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    gender: '',
    healthGoals: [],
    mainGoal: '',
    supplementHabits: []
  });
  const [onboardingStage, setOnboardingStage] = useState('welcome');
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [metrics, setMetrics] = useState({
    startTime: Date.now(),
    stepTimes: {} as Record<string, number>,
    dropOffs: [] as Array<{step: string, reason?: string, timestamp: string}>
  });
  
  // Load saved data if available
  useEffect(() => {
    const savedData = localStorage.getItem('biowell-onboarding-data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setOnboardingData(parsed.data || {});
        setOnboardingStage(parsed.stage || 'welcome');
        setOnboardingComplete(parsed.complete || false);
      } catch (e) {
        console.error('Error parsing saved onboarding data', e);
      }
    }
  }, []);
  
  // Save data when it changes
  useEffect(() => {
    localStorage.setItem('biowell-onboarding-data', JSON.stringify({
      data: onboardingData,
      stage: onboardingStage,
      complete: onboardingComplete
    }));
  }, [onboardingData, onboardingStage, onboardingComplete]);
  
  const updateOnboardingData = (newData: Partial<OnboardingFormData>) => {
    setOnboardingData(prev => ({
      ...prev,
      ...newData
    }));
  };
  
  const completeOnboarding = async () => {
    // Calculate total time
    const totalTime = (Date.now() - metrics.startTime) / 1000;
    
    // In a real app, send metrics to analytics
    console.log('Onboarding completed', {
      totalTime,
      stepTimes: metrics.stepTimes,
      dropOffs: metrics.dropOffs
    });
    
    setOnboardingComplete(true);
    
    // Return the collected data
    return onboardingData;
  };
  
  const trackStepTime = (step: string) => {
    const startTime = Date.now();
    
    return () => {
      const timeSpent = (Date.now() - startTime) / 1000;
      setMetrics(prev => ({
        ...prev,
        stepTimes: {
          ...prev.stepTimes,
          [step]: (prev.stepTimes[step] || 0) + timeSpent
        }
      }));
      
      return timeSpent;
    };
  };
  
  const recordDropOff = (step: string, reason?: string) => {
    setMetrics(prev => ({
      ...prev,
      dropOffs: [
        ...prev.dropOffs,
        { step, reason, timestamp: new Date().toISOString() }
      ]
    }));
  };
  
  return (
    <OnboardingContext.Provider value={{
      data: onboardingData,
      stage: onboardingStage,
      isComplete: onboardingComplete,
      updateData: updateOnboardingData,
      setStage: setOnboardingStage,
      complete: completeOnboarding,
      trackTime: trackStepTime,
      recordDropOff
    }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};