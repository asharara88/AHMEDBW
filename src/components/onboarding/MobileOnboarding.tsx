import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check, AlertCircle } from 'lucide-react';
import { OnboardingFormData } from '../../api/onboardingApi';

interface MobileOnboardingProps {
  onComplete: (data: OnboardingFormData) => void;
}

const MobileOnboarding = ({ onComplete }: MobileOnboardingProps) => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingFormData>({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    gender: '',
    healthGoals: [],
    mainGoal: '',
  });
  
  const steps = [
    {
      id: 'welcome',
      title: 'Welcome to Biowell',
      component: ({ next }: { next: () => void }) => (
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold">Your Health Journey Starts Here</h2>
          <p className="mb-6 text-text-light">Swipe through to set up your personalized health profile</p>
          <button 
            onClick={next}
            className="w-full rounded-xl bg-primary py-4 text-white"
          >
            Get Started
          </button>
        </div>
      )
    },
    {
      id: 'personal',
      title: 'Personal Information',
      component: ({ next, prev, updateData }: { next: () => void, prev: () => void, updateData: (data: Partial<OnboardingFormData>) => void }) => (
        <div>
          <h2 className="mb-4 text-xl font-bold">Tell us about yourself</h2>
          
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium">First Name</label>
            <input
              type="text"
              value={data.firstName}
              onChange={(e) => updateData({ firstName: e.target.value })}
              className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-3 py-2"
              placeholder="Your first name"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium">Last Name</label>
            <input
              type="text"
              value={data.lastName}
              onChange={(e) => updateData({ lastName: e.target.value })}
              className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-3 py-2"
              placeholder="Your last name"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium">Gender</label>
            <select
              value={data.gender}
              onChange={(e) => updateData({ gender: e.target.value })}
              className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-3 py-2"
              required
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="not_specified">Prefer not to say</option>
            </select>
          </div>
          
          <div className="mt-6 flex justify-between">
            <button
              onClick={prev}
              className="rounded-lg border border-[hsl(var(--color-border))] px-4 py-2 text-text-light"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            <button
              onClick={next}
              disabled={!data.firstName || !data.lastName || !data.gender}
              className="rounded-lg bg-primary px-4 py-2 text-white disabled:opacity-50"
            >
              Continue
              <ChevronRight className="ml-1 inline-block h-5 w-5" />
            </button>
          </div>
        </div>
      )
    },
    {
      id: 'goals',
      title: 'Health Goals',
      component: ({ next, prev, updateData }: { next: () => void, prev: () => void, updateData: (data: Partial<OnboardingFormData>) => void }) => (
        <div>
          <h2 className="mb-4 text-xl font-bold">Your Health Goals</h2>
          
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium">Main Goal</label>
            <select
              value={data.mainGoal}
              onChange={(e) => updateData({ mainGoal: e.target.value })}
              className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-3 py-2"
              required
            >
              <option value="">Select your main goal</option>
              <option value="Improve sleep quality">Improve sleep quality</option>
              <option value="Increase energy levels">Increase energy levels</option>
              <option value="Reduce stress">Reduce stress</option>
              <option value="Build muscle">Build muscle</option>
              <option value="Lose weight">Lose weight</option>
              <option value="Improve metabolic health">Improve metabolic health</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium">Health Areas</label>
            <p className="mb-2 text-xs text-text-light">Select all that apply</p>
            
            <div className="space-y-2">
              {['Sleep', 'Energy', 'Stress', 'Fitness', 'Nutrition', 'Cognitive', 'Metabolic', 'Immunity'].map((goal) => (
                <label key={goal} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={data.healthGoals?.includes(goal) || false}
                    onChange={(e) => {
                      const currentGoals = data.healthGoals || [];
                      if (e.target.checked) {
                        updateData({ healthGoals: [...currentGoals, goal] });
                      } else {
                        updateData({ healthGoals: currentGoals.filter(g => g !== goal) });
                      }
                    }}
                    className="mr-2 h-4 w-4 rounded border-[hsl(var(--color-border))] text-primary"
                  />
                  {goal}
                </label>
              ))}
            </div>
          </div>
          
          <div className="mt-6 flex justify-between">
            <button
              onClick={prev}
              className="rounded-lg border border-[hsl(var(--color-border))] px-4 py-2 text-text-light"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            <button
              onClick={next}
              disabled={!data.mainGoal || !data.healthGoals?.length}
              className="rounded-lg bg-primary px-4 py-2 text-white disabled:opacity-50"
            >
              Continue
              <ChevronRight className="ml-1 inline-block h-5 w-5" />
            </button>
          </div>
        </div>
      )
    },
    {
      id: 'supplements',
      title: 'Current Supplements',
      component: ({ next, prev, updateData }: { next: () => void, prev: () => void, updateData: (data: Partial<OnboardingFormData>) => void }) => (
        <div>
          <h2 className="mb-4 text-xl font-bold">Current Supplements</h2>
          
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium">Are you currently taking any supplements?</label>
            <textarea
              value={data.supplementHabits?.join(', ') || ''}
              onChange={(e) => updateData({ supplementHabits: e.target.value.split(',').map(s => s.trim()).filter(s => s) })}
              className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-3 py-2"
              placeholder="List supplements separated by commas, or type 'none'"
              rows={4}
            />
          </div>
          
          <div className="mb-4 rounded-lg bg-[hsl(var(--color-surface-1))] p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 text-primary" />
              <p className="text-xs text-text-light">
                This information helps us provide more personalized supplement recommendations.
              </p>
            </div>
          </div>
          
          <div className="mt-6 flex justify-between">
            <button
              onClick={prev}
              className="rounded-lg border border-[hsl(var(--color-border))] px-4 py-2 text-text-light"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            <button
              onClick={next}
              className="rounded-lg bg-primary px-4 py-2 text-white"
            >
              Complete
              <Check className="ml-1 inline-block h-5 w-5" />
            </button>
          </div>
        </div>
      )
    },
    {
      id: 'complete',
      title: 'Profile Complete',
      component: ({ next }: { next: () => void }) => (
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
            <Check className="h-8 w-8 text-success" />
          </div>
          <h2 className="mb-2 text-xl font-bold">Profile Complete!</h2>
          <p className="mb-6 text-text-light">
            Your profile has been successfully set up. Let's get started on your health journey!
          </p>
          <button 
            onClick={next}
            className="w-full rounded-xl bg-primary py-4 text-white"
          >
            Go to Dashboard
          </button>
        </div>
      )
    }
  ];
  
  // Handle swipe gestures
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && step < steps.length - 1) {
        setStep(step + 1);
      } else if (e.key === 'ArrowLeft' && step > 0) {
        setStep(step - 1);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [step, steps.length]);
  
  const updateData = (newData: Partial<OnboardingFormData>) => {
    setData(prev => ({ ...prev, ...newData }));
  };
  
  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete(data);
    }
  };
  
  const handlePrev = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };
  
  const currentStep = steps[step];
  
  return (
    <div className="h-full">
      <div className="mb-4 flex justify-between">
        <div className="flex space-x-1">
          {steps.map((_, i) => (
            <div 
              key={i}
              className={`h-1 w-8 rounded-full ${
                i === step ? 'bg-primary' : 'bg-[hsl(var(--color-border))]'
              }`}
            />
          ))}
        </div>
        {step < steps.length - 1 && (
          <button 
            onClick={() => onComplete(data)}
            className="text-sm text-primary"
          >
            Skip
          </button>
        )}
      </div>
      
      <motion.div
        key={`step-${step}`}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="h-full"
      >
        {currentStep.component({
          next: handleNext,
          prev: handlePrev,
          updateData
        })}
      </motion.div>
    </div>
  );
};

export default MobileOnboarding;