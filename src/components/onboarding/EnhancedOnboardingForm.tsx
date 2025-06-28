import React, { useState, useEffect } from 'react';
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
  AlertCircle
} from 'lucide-react';
import { useUserProfileStore, UserProfile } from '../../store/useUserProfileStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';

interface EnhancedOnboardingFormProps {
  onComplete: () => void;
  isLoading?: boolean;
}

const ONBOARDING_STEPS = [
  {
    id: 1,
    title: 'Personal Information',
    description: 'Tell us about yourself',
    icon: User,
    fields: ['firstName', 'lastName', 'email', 'mobile', 'dateOfBirth', 'gender']
  },
  {
    id: 2,
    title: 'Health Goals',
    description: 'What are your primary health objectives?',
    icon: Heart,
    fields: ['primaryHealthGoals', 'healthConcerns', 'fitnessGoals']
  },
  {
    id: 3,
    title: 'Physical Profile',
    description: 'Help us understand your physical characteristics',
    icon: Activity,
    fields: ['height', 'weight', 'activityLevel', 'exerciseFrequency', 'exerciseTypes']
  },
  {
    id: 4,
    title: 'Sleep & Recovery',
    description: 'Tell us about your sleep patterns',
    icon: Moon,
    fields: ['sleepHours', 'bedTime', 'wakeTime', 'sleepQuality']
  },
  {
    id: 5,
    title: 'Nutrition & Diet',
    description: 'Share your dietary preferences and restrictions',
    icon: Utensils,
    fields: ['dietPreference', 'dietaryRestrictions', 'allergies']
  },
  {
    id: 6,
    title: 'Mental Health & Stress',
    description: 'Help us understand your mental wellness',
    icon: Brain,
    fields: ['stressLevel', 'stressTriggers', 'mentalHealthGoals', 'meditationExperience']
  },
  {
    id: 7,
    title: 'Supplements & Medical',
    description: 'Current supplements and medical information',
    icon: Pill,
    fields: ['currentSupplements', 'medicationList', 'medicalConditions', 'doctorConsultation']
  },
  {
    id: 8,
    title: 'Preferences',
    description: 'Customize your experience',
    icon: Settings,
    fields: ['communicationPreferences', 'privacySettings']
  }
];

const HEALTH_GOALS_OPTIONS = [
  'Weight management',
  'Muscle building',
  'Cardiovascular health', 
  'Mental wellness',
  'Better sleep',
  'Increased energy',
  'Stress reduction',
  'Immune support',
  'Digestive health',
  'Skin health',
  'Brain health',
  'Anti-aging'
];

const FITNESS_GOALS_OPTIONS = [
  'Build muscle',
  'Lose weight',
  'Improve endurance',
  'Increase strength',
  'Better flexibility',
  'Injury recovery',
  'Athletic performance',
  'General fitness'
];


const EnhancedOnboardingForm: React.FC<EnhancedOnboardingFormProps> = ({
  onComplete,
  isLoading = false
}) => {
  const {
    profile,
    onboardingProgress,
    saving,
    error,
    updateProfile,
    completeOnboarding,
    setOnboardingStep,
    markStepCompleted,
    clearError
  } = useUserProfileStore();

  const [currentStepData, setCurrentStepData] = useState<Partial<UserProfile>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const currentStep = ONBOARDING_STEPS.find(step => step.id === onboardingProgress.currentStep) || ONBOARDING_STEPS[0];

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleFieldChange = (field: string, value: any) => {
    setCurrentStepData(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateCurrentStep = (): boolean => {
    const errors: Record<string, string> = {};
    
    // Add validation logic here for each step
    switch (currentStep.id) {
      case 1: // Personal Information
        if (!currentStepData.firstName && !profile?.firstName) {
          errors.firstName = 'First name is required';
        }
        if (!currentStepData.lastName && !profile?.lastName) {
          errors.lastName = 'Last name is required';
        }
        break;
      case 2: // Health Goals
        if ((!currentStepData.primaryHealthGoals || currentStepData.primaryHealthGoals.length === 0) && 
            (!profile?.primaryHealthGoals || profile.primaryHealthGoals.length === 0)) {
          errors.primaryHealthGoals = 'Please select at least one health goal';
        }
        break;
      // Add more validation as needed
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = async () => {
    if (!validateCurrentStep()) return;

    // Save current step data
    await updateProfile(currentStepData);

    if (currentStep.id === ONBOARDING_STEPS.length) {
      // Complete onboarding
      await completeOnboarding(currentStepData);
      onComplete();
    } else {
      // Move to next step
      markStepCompleted(currentStep.id);
      setOnboardingStep(currentStep.id + 1);
      setCurrentStepData({});
    }
  };

  const handlePrevious = () => {
    if (currentStep.id > 1) {
      setOnboardingStep(currentStep.id - 1);
      setCurrentStepData({});
    }
  };

  const toggleHealthGoal = (goal: string) => {
    const currentGoals = currentStepData.primaryHealthGoals || profile?.primaryHealthGoals || [];
    let updatedGoals: string[];
    
    if (currentGoals.includes(goal)) {
      updatedGoals = currentGoals.filter(g => g !== goal);
    } else {
      updatedGoals = [...currentGoals, goal];
    }
    
    handleFieldChange('primaryHealthGoals', updatedGoals);
  };

  const toggleFitnessGoal = (goal: string) => {
    const currentGoals = currentStepData.fitnessGoals || profile?.fitnessGoals || [];
    let updatedGoals: string[];
    
    if (currentGoals.includes(goal)) {
      updatedGoals = currentGoals.filter(g => g !== goal);
    } else {
      updatedGoals = [...currentGoals, goal];
    }
    
    handleFieldChange('fitnessGoals', updatedGoals);
  };

  const renderPersonalInfoStep = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">First Name</label>
          <Input
            type="text"
            value={currentStepData.firstName || profile?.firstName || ''}
            onChange={(e) => handleFieldChange('firstName', e.target.value)}
            error={!!validationErrors.firstName}
          />
          {validationErrors.firstName && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.firstName}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Last Name</label>
          <Input
            type="text"
            value={currentStepData.lastName || profile?.lastName || ''}
            onChange={(e) => handleFieldChange('lastName', e.target.value)}
            error={!!validationErrors.lastName}
          />
          {validationErrors.lastName && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.lastName}</p>
          )}
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Email</label>
        <Input
          type="email"
          value={currentStepData.email || profile?.email || ''}
          onChange={(e) => handleFieldChange('email', e.target.value)}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Mobile</label>
        <Input
          type="tel"
          value={currentStepData.mobile || profile?.mobile || ''}
          onChange={(e) => handleFieldChange('mobile', e.target.value)}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Date of Birth</label>
        <Input
          type="date"
          value={currentStepData.dateOfBirth || profile?.dateOfBirth || ''}
          onChange={(e) => handleFieldChange('dateOfBirth', e.target.value)}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Gender</label>
        <select
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          value={currentStepData.gender || profile?.gender || ''}
          onChange={(e) => handleFieldChange('gender', e.target.value)}
          aria-label="Gender"
        >
          <option value="">Select gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="non-binary">Non-binary</option>
          <option value="prefer-not-to-say">Prefer not to say</option>
        </select>
      </div>
    </div>
  );

  const renderHealthGoalsStep = () => {
    const selectedPrimaryGoals = currentStepData.primaryHealthGoals || profile?.primaryHealthGoals || [];
    const selectedFitnessGoals = currentStepData.fitnessGoals || profile?.fitnessGoals || [];
    
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-3">Primary Health Goals</h3>
          <p className="text-sm text-gray-500 mb-4">Select all that apply to you. There's no limit to how many you can choose.</p>
          
          {validationErrors.primaryHealthGoals && (
            <p className="text-red-500 text-sm mb-3">{validationErrors.primaryHealthGoals}</p>
          )}
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {HEALTH_GOALS_OPTIONS.map((goal) => (
              <button
                key={goal}
                type="button"
                onClick={() => toggleHealthGoal(goal)}
                className={`flex items-center justify-between p-3 rounded-lg text-sm text-left transition-all ${
                  selectedPrimaryGoals.includes(goal)
                    ? 'bg-primary text-white font-medium shadow-md'
                    : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600'
                }`}
              >
                <span>{goal}</span>
                {selectedPrimaryGoals.includes(goal) && (
                  <Check className="h-4 w-4 ml-2 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Fitness Goals</h3>
          <p className="text-sm text-gray-500 mb-4">Select your fitness priorities.</p>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {FITNESS_GOALS_OPTIONS.map((goal) => (
              <button
                key={goal}
                type="button"
                onClick={() => toggleFitnessGoal(goal)}
                className={`flex items-center justify-between p-3 rounded-lg text-sm text-left transition-all ${
                  selectedFitnessGoals.includes(goal)
                    ? 'bg-secondary text-white font-medium shadow-md'
                    : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600'
                }`}
              >
                <span>{goal}</span>
                {selectedFitnessGoals.includes(goal) && (
                  <Check className="h-4 w-4 ml-2 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderPhysicalProfileStep = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Height</label>
        <div className="flex space-x-2">
          <Input
            type="number"
            placeholder="Value"
            value={currentStepData.height?.value || profile?.height?.value || ''}
            onChange={(e) => handleFieldChange('height', {
              value: parseFloat(e.target.value) || 0,
              unit: currentStepData.height?.unit || profile?.height?.unit || 'cm'
            })}
            error={!!validationErrors.height}
          />
          <select
            className="px-3 py-2 border border-gray-300 rounded-md"
            value={currentStepData.height?.unit || profile?.height?.unit || 'cm'}
            onChange={(e) => handleFieldChange('height', {
              value: currentStepData.height?.value || profile?.height?.value || 0,
              unit: e.target.value as 'cm' | 'ft'
            })}
            aria-label="Height unit"
          >
            <option value="cm">cm</option>
            <option value="ft">ft</option>
          </select>
        </div>
        {validationErrors.height && (
          <p className="text-red-500 text-sm mt-1">{validationErrors.height}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Weight</label>
        <div className="flex space-x-2">
          <Input
            type="number"
            placeholder="Value"
            value={currentStepData.weight?.value || profile?.weight?.value || ''}
            onChange={(e) => handleFieldChange('weight', {
              value: parseFloat(e.target.value) || 0,
              unit: currentStepData.weight?.unit || profile?.weight?.unit || 'kg'
            })}
          />
          <select
            className="px-3 py-2 border border-gray-300 rounded-md"
            value={currentStepData.weight?.unit || profile?.weight?.unit || 'kg'}
            onChange={(e) => handleFieldChange('weight', {
              value: currentStepData.weight?.value || profile?.weight?.value || 0,
              unit: e.target.value as 'kg' | 'lbs'
            })}
            aria-label="Weight unit"
          >
            <option value="kg">kg</option>
            <option value="lbs">lbs</option>
          </select>
        </div>
        {validationErrors.weight && (
          <p className="text-red-500 text-sm mt-1">{validationErrors.weight}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Activity Level</label>
        <select
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          value={currentStepData.activityLevel || profile?.activityLevel || ''}
          onChange={(e) => handleFieldChange('activityLevel', e.target.value)}
          aria-label="Activity level"
        >
          <option value="">Select activity level</option>
          <option value="sedentary">Sedentary (little/no exercise)</option>
          <option value="lightly-active">Lightly active (light exercise 1-3 days/week)</option>
          <option value="moderately-active">Moderately active (moderate exercise 3-5 days/week)</option>
          <option value="very-active">Very active (hard exercise 6-7 days/week)</option>
          <option value="extremely-active">Extremely active (very hard exercise, physical job)</option>
        </select>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep.id) {
      case 1:
        return renderPersonalInfoStep();
      case 2:
        return renderHealthGoalsStep();
      case 3:
        return renderPhysicalProfileStep();
      default:
        return <div>Coming soon...</div>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Complete Your Profile</h2>
          <span className="text-sm text-gray-500">
            Step {currentStep.id} of {ONBOARDING_STEPS.length}
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep.id / ONBOARDING_STEPS.length) * 100}%` }}
          />
        </div>

        <div className="flex justify-between mt-4">
          {ONBOARDING_STEPS.map((step) => {
            const Icon = step.icon;
            const isCompleted = onboardingProgress.completedSteps.includes(step.id);
            const isCurrent = step.id === currentStep.id;
            
            return (
              <div
                key={step.id}
                className={`flex flex-col items-center text-center ${
                  isCurrent ? 'text-primary' : isCompleted ? 'text-success' : 'text-gray-400'
                }`}
              >
                <div className={`p-2 rounded-full mb-2 ${
                  isCurrent ? 'bg-primary/10' : isCompleted ? 'bg-success/10' : 'bg-gray-100'
                }`}>
                  {isCompleted ? <Check size={16} /> : <Icon size={16} />}
                </div>
                <span className="text-xs text-center max-w-14 overflow-hidden text-ellipsis">{step.title}</span>
              </div>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      <Card className="p-8">
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">{currentStep.title}</h3>
          <p className="text-gray-600">{currentStep.description}</p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep.id === 1}
          >
            <ChevronLeft size={16} className="mr-1" />
            Previous
          </Button>

          <Button
            onClick={handleNext}
            disabled={saving || isLoading}
            className="min-w-32"
          >
            {saving || isLoading ? (
              'Saving...'
            ) : currentStep.id === ONBOARDING_STEPS.length ? (
              'Complete'
            ) : (
              <>
                Next
                <ChevronRight size={16} className="ml-1" />
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default EnhancedOnboardingForm;