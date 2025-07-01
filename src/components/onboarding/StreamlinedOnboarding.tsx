import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Heart, 
  Activity, 
  Moon, 
  Utensils, 
  Brain, 
  Pill, 
  Settings,
  ChevronRight,
  ChevronLeft,
  Check,
  AlertCircle,
  Calendar,
  Shield,
  CheckCircle
} from 'lucide-react';
import { useUserProfileStore, UserProfile } from '../../store/useUserProfileStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import SuggestedQuestions from './SuggestedQuestions';

interface StreamlinedOnboardingProps {
  onComplete: () => void;
}

const StreamlinedOnboarding: React.FC<StreamlinedOnboardingProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [skipped, setSkipped] = useState<number[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  const { 
    profile, 
    onboardingProgress,
    saving,
    error,
    updateProfile,
    completeOnboarding,
    setOnboardingStep,
    markStepCompleted,
    updateStepProgress,
    clearError
  } = useUserProfileStore();
  
  // Create local state for form values
  const [formValues, setFormValues] = useState({
    firstName: profile?.firstName || '',
    lastName: profile?.lastName || '',
    email: profile?.email || '',
    mainGoal: '',
    primaryHealthGoals: profile?.primaryHealthGoals || [],
    age: profile?.age || '',
    gender: profile?.gender || '',
    activityLevel: profile?.activityLevel || '',
    dietPreference: profile?.dietPreference || ''
  });

  const STEPS = [
    {
      id: 1,
      title: "Welcome",
      icon: User,
      description: "Let's personalize your Biowell experience",
      required: true
    },
    {
      id: 2,
      title: "Personal Info",
      icon: User,
      description: "Tell us a bit about yourself",
      required: true
    },
    {
      id: 3,
      title: "Health Goals",
      icon: Heart,
      description: "What are you looking to achieve?",
      required: true
    },
    {
      id: 4,
      title: "Physical Profile",
      icon: Activity,
      description: "Your physical characteristics",
      required: false
    },
    {
      id: 5,
      title: "Lifestyle",
      icon: Calendar,
      description: "Your habits and preferences",
      required: false
    }
  ];
  
  const HEALTH_GOALS = [
    'Improve sleep quality',
    'Increase energy levels',
    'Reduce stress',
    'Optimize metabolic health',
    'Enhance cognitive performance',
    'Build muscle',
    'Lose weight',
    'Improve athletic performance'
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormValues(prev => ({ ...prev, [field]: value }));
  };

  const handleHealthGoalToggle = (goal: string) => {
    const currentGoals = [...formValues.primaryHealthGoals];
    const index = currentGoals.indexOf(goal);
    
    if (index === -1) {
      currentGoals.push(goal);
    } else {
      currentGoals.splice(index, 1);
    }
    
    setFormValues(prev => ({ ...prev, primaryHealthGoals: currentGoals }));
  };

  const handleNext = async () => {
    // Save current step data
    await updateProfile({
      ...formValues
    });
    
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    } else {
      // Show confirmation before completing
      setShowConfirmation(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    setSkipped(prev => [...prev, currentStep]);
    setCurrentStep(currentStep + 1);
  };

  const handleComplete = async () => {
    await completeOnboarding({
      ...formValues,
      onboardingCompleted: true,
      onboardingCompletedAt: new Date().toISOString()
    });
    onComplete();
  };

  const calculateProgress = () => {
    return Math.round((currentStep / STEPS.length) * 100);
  };

  // Render the step content based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Welcome
        return (
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <Brain className="h-10 w-10 text-primary" />
            </div>
            
            <h2 className="mb-4 text-xl font-bold">Welcome to Biowell</h2>
            <p className="mb-6 text-text-light">
              Let's set up your personalized health profile in just a few steps.
              This helps us tailor our recommendations specifically for you.
            </p>
            
            <div className="rounded-lg bg-[hsl(var(--color-surface-1))] p-4 text-left">
              <p className="mb-4 text-sm text-text-light">
                In the next few steps, we'll ask you about:
              </p>
              <ul className="space-y-2 text-sm">
                {STEPS.slice(1).map((step, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-success" aria-hidden="true" />
                    <span>{step.title} {!step.required && <span className="text-text-light">(optional)</span>}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
        
      case 2: // Personal Info
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="mb-1 block text-sm font-medium">
                  First Name <span aria-hidden="true" className="text-error">*</span>
                  <span className="sr-only">(required)</span>
                </label>
                <Input
                  id="firstName"
                  value={formValues.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  error={!formValues.firstName}
                  aria-required="true"
                />
                {!formValues.firstName && (
                  <p className="mt-1 text-xs text-error" id="firstName-error">
                    First name is required
                  </p>
                )}
              </div>
              
              <div>
                <label htmlFor="lastName" className="mb-1 block text-sm font-medium">
                  Last Name <span aria-hidden="true" className="text-error">*</span>
                  <span className="sr-only">(required)</span>
                </label>
                <Input
                  id="lastName"
                  value={formValues.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  error={!formValues.lastName}
                  aria-required="true"
                />
                {!formValues.lastName && (
                  <p className="mt-1 text-xs text-error" id="lastName-error">
                    Last name is required
                  </p>
                )}
              </div>
            </div>
            
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                value={formValues.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                aria-describedby="email-description"
              />
              <p id="email-description" className="mt-1 text-xs text-text-light">
                Used for account access and notifications
              </p>
            </div>
            
            <div className="flex items-start gap-2 rounded-lg bg-[hsl(var(--color-surface-1))] p-4">
              <Shield className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" aria-hidden="true" />
              <p className="text-xs text-text-light">
                Your information is kept private and secure. We use this information only to personalize your experience.
              </p>
            </div>
          </div>
        );
        
      case 3: // Health Goals
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="mainGoal" className="mb-1 block text-sm font-medium">
                What's your main health goal? <span aria-hidden="true" className="text-error">*</span>
                <span className="sr-only">(required)</span>
              </label>
              <select
                id="mainGoal"
                className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-2"
                value={formValues.mainGoal}
                onChange={(e) => handleInputChange('mainGoal', e.target.value)}
                aria-required="true"
              >
                <option value="">Select your main goal</option>
                <option value="Improve sleep">Improve sleep</option>
                <option value="Increase energy">Increase energy</option>
                <option value="Lose weight">Lose weight</option>
                <option value="Build muscle">Build muscle</option>
                <option value="Reduce stress">Reduce stress</option>
                <option value="Optimize metabolic health">Optimize metabolic health</option>
              </select>
              {!formValues.mainGoal && (
                <p className="mt-1 text-xs text-error">
                  Please select your main health goal
                </p>
              )}
            </div>
            
            <div>
              <p className="mb-3 text-sm font-medium">
                Select any additional health goals (optional)
              </p>
              <div className="grid grid-cols-2 gap-2" role="group" aria-label="Health goals">
                {HEALTH_GOALS.map((goal) => (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => handleHealthGoalToggle(goal)}
                    className={`flex items-center justify-between rounded-lg border p-3 text-sm text-left transition-colors ${
                      formValues.primaryHealthGoals.includes(goal)
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-[hsl(var(--color-border))] hover:border-primary/50'
                    }`}
                    aria-pressed={formValues.primaryHealthGoals.includes(goal) ? 'true' : 'false'}
                  >
                    <span>{goal}</span>
                    {formValues.primaryHealthGoals.includes(goal) && (
                      <CheckCircle className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Health Goal Suggestions */}
            <SuggestedQuestions
              questions={["I want to sleep better", "I need more energy", "I want to lose weight", "I want to build muscle"]}
              onSelect={(question) => {
                if (question.includes("sleep")) {
                  handleInputChange('mainGoal', 'Improve sleep');
                  if (!formValues.primaryHealthGoals.includes('Improve sleep quality')) {
                    handleHealthGoalToggle('Improve sleep quality');
                  }
                } else if (question.includes("energy")) {
                  handleInputChange('mainGoal', 'Increase energy');
                  if (!formValues.primaryHealthGoals.includes('Increase energy levels')) {
                    handleHealthGoalToggle('Increase energy levels');
                  }
                } else if (question.includes("weight")) {
                  handleInputChange('mainGoal', 'Lose weight');
                  if (!formValues.primaryHealthGoals.includes('Lose weight')) {
                    handleHealthGoalToggle('Lose weight');
                  }
                } else if (question.includes("muscle")) {
                  handleInputChange('mainGoal', 'Build muscle');
                  if (!formValues.primaryHealthGoals.includes('Build muscle')) {
                    handleHealthGoalToggle('Build muscle');
                  }
                }
              }}
            />
          </div>
        );
        
      case 4: // Physical Profile (Optional)
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-block rounded-full bg-primary/10 p-2">
                <Activity className="h-6 w-6 text-primary" aria-hidden="true" />
              </div>
              <p className="mt-2 text-sm text-text-light">
                These details help us provide more personalized recommendations.
                <br />
                <span className="font-medium">You can skip this step if you prefer.</span>
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="age" className="mb-1 block text-sm font-medium">
                  Age
                </label>
                <Input
                  id="age"
                  type="number"
                  min="18"
                  max="120"
                  value={formValues.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="gender" className="mb-1 block text-sm font-medium">
                  Gender
                </label>
                <select
                  id="gender"
                  className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-2"
                  value={formValues.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non-binary">Non-binary</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>
            </div>
            
            <div>
              <label htmlFor="activityLevel" className="mb-1 block text-sm font-medium">
                Activity Level
              </label>
              <select
                id="activityLevel"
                className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-2"
                value={formValues.activityLevel}
                onChange={(e) => handleInputChange('activityLevel', e.target.value)}
              >
                <option value="">Select activity level</option>
                <option value="sedentary">Sedentary (little/no exercise)</option>
                <option value="lightly-active">Lightly active (1-3 days/week)</option>
                <option value="moderately-active">Moderately active (3-5 days/week)</option>
                <option value="very-active">Very active (6-7 days/week)</option>
                <option value="extremely-active">Extremely active (physical job)</option>
              </select>
            </div>
          </div>
        );
        
      case 5: // Lifestyle (Optional)
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-block rounded-full bg-primary/10 p-2">
                <Calendar className="h-6 w-6 text-primary" aria-hidden="true" />
              </div>
              <p className="mt-2 text-sm text-text-light">
                These preferences help us tailor our recommendations for your lifestyle.
                <br />
                <span className="font-medium">You can skip this step if you prefer.</span>
              </p>
            </div>
            
            <div>
              <label htmlFor="dietPreference" className="mb-1 block text-sm font-medium">
                Dietary Preference
              </label>
              <select
                id="dietPreference"
                className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-2"
                value={formValues.dietPreference}
                onChange={(e) => handleInputChange('dietPreference', e.target.value)}
              >
                <option value="">Select dietary preference</option>
                <option value="omnivore">Omnivore</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="vegan">Vegan</option>
                <option value="pescatarian">Pescatarian</option>
                <option value="keto">Keto</option>
                <option value="paleo">Paleo</option>
                <option value="mediterranean">Mediterranean</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div className="flex items-start gap-2 rounded-lg bg-[hsl(var(--color-surface-1))] p-4">
              <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-success" aria-hidden="true" />
              <p className="text-sm">
                You're almost done! This information helps us create your personalized health plan.
              </p>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="mx-auto max-w-md p-4">
      {/* Progress Indicator */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-medium">{STEPS[currentStep - 1].title}</span>
            {!STEPS[currentStep - 1].required && (
              <span className="rounded-full bg-[hsl(var(--color-surface-2))] px-2 py-0.5 text-xs text-text-light">
                Optional
              </span>
            )}
          </div>
          <span className="text-sm text-text-light">Step {currentStep} of {STEPS.length}</span>
        </div>
        
        <div className="h-2 overflow-hidden rounded-full bg-[hsl(var(--color-surface-1))]">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${calculateProgress()}%` }}
            transition={{ duration: 0.3 }}
            aria-hidden="true"
          />
        </div>
        
        <div className="mt-2 flex justify-between">
          {STEPS.map((step) => (
            <div
              key={step.id}
              className={`relative flex flex-col items-center`}
              aria-hidden="true"
            >
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium
                  ${step.id === currentStep 
                    ? 'bg-primary text-white'
                    : step.id < currentStep || skipped.includes(step.id)
                    ? 'bg-success text-white'
                    : 'bg-[hsl(var(--color-surface-2))] text-text-light'
                  }`}
              >
                {step.id < currentStep || skipped.includes(step.id) ? (
                  <Check className="h-3 w-3" />
                ) : (
                  step.id
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-lg bg-error/10 p-3 text-sm text-error" role="alert">
          <AlertCircle className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
      
      {/* Content Area */}
      <Card className="p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.3 }}
            className="min-h-[280px]"
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>
        
        {/* Navigation Buttons */}
        <div className="mt-8 flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
            aria-label="Go back to previous step"
          >
            <ChevronLeft className="mr-1 h-4 w-4" aria-hidden="true" />
            Back
          </Button>
          
          <div className="flex gap-2">
            {!STEPS[currentStep - 1].required && currentStep < STEPS.length && (
              <Button
                variant="ghost"
                onClick={handleSkip}
                aria-label={`Skip ${STEPS[currentStep - 1].title} step`}
              >
                Skip for now
              </Button>
            )}
            
            <Button
              onClick={handleNext}
              disabled={
                (currentStep === 2 && (!formValues.firstName || !formValues.lastName)) || 
                (currentStep === 3 && !formValues.mainGoal) ||
                saving
              }
              aria-label={currentStep === STEPS.length ? 'Complete setup' : 'Continue to next step'}
            >
              {saving ? (
                'Saving...'
              ) : currentStep === STEPS.length ? (
                'Complete'
              ) : (
                <>
                  Continue
                  <ChevronRight className="ml-1 h-4 w-4" aria-hidden="true" />
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
      
      {/* Confirmation Dialog */}
      <AnimatePresence>
        {showConfirmation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-xl bg-[hsl(var(--color-card))] p-6"
            >
              <h2 className="mb-4 text-lg font-bold">Complete Your Setup</h2>
              <p className="mb-6 text-text-light">
                You've provided the essential information for your personalized health plan. 
                Would you like to complete your setup now?
              </p>
              
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmation(false)}
                  className="sm:order-1"
                >
                  Go Back
                </Button>
                <Button
                  onClick={handleComplete}
                  loading={saving}
                  className="sm:order-2"
                >
                  {saving ? 'Completing...' : 'Complete Setup'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StreamlinedOnboarding;