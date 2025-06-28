import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, ArrowRight, Shield } from 'lucide-react';
import { OnboardingFormData } from '../../api/onboardingApi';

interface ValidationErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  mobile?: string;
  age?: string;
  gender?: string;
  healthGoals?: string;
}

interface OnboardingFormProps {
  onComplete: (formData: OnboardingFormData) => void;
  isLoading?: boolean;
}

const OnboardingForm = ({ onComplete, isLoading = false }: OnboardingFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<OnboardingFormData>({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    age: '',
    gender: '',
    healthGoals: [],
    sleepHours: '',
    exerciseFrequency: '',
    dietPreference: '',
    stressLevel: ''
  });

  const [errors, setErrors] = useState<ValidationErrors>({});

  // Calculate form completion percentage
  const calculateProgress = () => {
    const requiredFields = ['firstName', 'lastName', 'email'];
    const filledFields = requiredFields.filter(field => formData[field as keyof OnboardingFormData]?.toString().trim() !== '');
    return (filledFields.length / requiredFields.length) * 100;
  };

  // Validate form field in real-time
  const validateField = (name: keyof OnboardingFormData, value: any) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'firstName':
      case 'lastName':
        if (!value.toString().trim()) {
          newErrors[name] = `${name === 'firstName' ? 'First' : 'Last'} name is required`;
        } else if (value.toString().length < 2) {
          newErrors[name] = `${name === 'firstName' ? 'First' : 'Last'} name is too short`;
        } else {
          delete newErrors[name];
        }
        break;

      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value.toString().trim()) {
          newErrors.email = 'Email is required';
        } else if (!emailRegex.test(value.toString())) {
          newErrors.email = 'Please enter a valid email address';
        } else {
          delete newErrors.email;
        }
        break;

      case 'mobile':
        const phoneRegex = /^\+?[0-9\s()-]{10,}$/;
        if (value.toString().trim() && !phoneRegex.test(value.toString())) {
          newErrors.mobile = 'Please enter a valid phone number';
        } else {
          delete newErrors.mobile;
        }
        break;
        
      case 'age':
        if (value !== '' && (isNaN(Number(value)) || Number(value) < 18 || Number(value) > 120)) {
          newErrors.age = 'Please enter a valid age between 18 and 120';
        } else {
          delete newErrors.age;
        }
        break;
        
      case 'gender':
        if (!value) {
          newErrors.gender = 'Please select your gender';
        } else {
          delete newErrors.gender;
        }
        break;
        
      case 'healthGoals':
        if (Array.isArray(value) && value.length === 0) {
          newErrors.healthGoals = 'Please select at least one health goal';
        } else {
          delete newErrors.healthGoals;
        }
        break;
    }

    setErrors(newErrors);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const isChecked = (e.target as HTMLInputElement).checked;
      const goalValue = value;
      
      setFormData(prev => ({
        ...prev,
        healthGoals: isChecked 
          ? [...prev.healthGoals!, goalValue]
          : prev.healthGoals!.filter(goal => goal !== goalValue)
      }));
      
      validateField('healthGoals', isChecked 
        ? [...formData.healthGoals!, goalValue]
        : formData.healthGoals!.filter(goal => goal !== goalValue));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      validateField(name as keyof OnboardingFormData, value);
    }
  };

  const validateStep = (step: number) => {
    const newErrors: ValidationErrors = {};
    
    if (step === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
      if (!formData.email?.trim()) newErrors.email = 'Email is required';
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (formData.email?.trim() && !emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
      
      // Validate mobile format if provided
      const phoneRegex = /^\+?[0-9\s()-]{10,}$/;
      if (formData.mobile && formData.mobile.toString().trim() && !phoneRegex.test(formData.mobile.toString())) {
        newErrors.mobile = 'Please enter a valid phone number';
      }
    } else if (step === 2) {
      if (formData.age !== '' && (isNaN(Number(formData.age)) || Number(formData.age) < 18 || Number(formData.age) > 120)) {
        newErrors.age = 'Please enter a valid age between 18 and 120';
      }
      if (!formData.gender) newErrors.gender = 'Please select your gender';
      if (formData.healthGoals!.length === 0) newErrors.healthGoals = 'Please select at least one health goal';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateStep(currentStep)) {
      // Convert string values to appropriate types
      const processedData: OnboardingFormData = {
        ...formData,
        age: formData.age !== '' ? Number(formData.age) : undefined,
        sleepHours: formData.sleepHours !== '' ? Number(formData.sleepHours) : undefined
      };
      
      onComplete(processedData);
    }
  };

  const healthGoalOptions = [
    'Improve sleep quality',
    'Increase energy levels',
    'Reduce stress',
    'Optimize metabolic health',
    'Enhance cognitive performance',
    'Build muscle',
    'Lose weight',
    'Improve athletic performance',
    'Support immune function',
    'Balance hormones',
    'Support fertility',
    'Longevity and healthy aging'
  ];

  return (
    <div className="mx-auto max-w-md">
      <AnimatePresence mode="wait">
        <motion.div
          key={`step-${currentStep}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium">Complete your profile</span>
              <span className="text-text-light">{Math.round(calculateProgress())}% complete</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[hsl(var(--color-card))]">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${calculateProgress()}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {currentStep === 1 && (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="firstName" className="label">
                      First Name <span className="text-error">*</span>
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      className={`input ${errors.firstName ? 'border-error' : ''}`}
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="John"
                    />
                    {errors.firstName && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1 flex items-center gap-1 text-xs text-error"
                      >
                        <AlertCircle className="h-3 w-3" />
                        {errors.firstName}
                      </motion.p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="lastName" className="label">
                      Last Name <span className="text-error">*</span>
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      className={`input ${errors.lastName ? 'border-error' : ''}`}
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Doe"
                    />
                    {errors.lastName && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1 flex items-center gap-1 text-xs text-error"
                      >
                        <AlertCircle className="h-3 w-3" />
                        {errors.lastName}
                      </motion.p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="label">
                    Email Address <span className="text-error">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className={`input ${errors.email ? 'border-error' : ''}`}
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                  />
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-1 flex items-center gap-1 text-xs text-error"
                    >
                      <AlertCircle className="h-3 w-3" />
                      {errors.email}
                    </motion.p>
                  )}
                </div>

                <div>
                  <label htmlFor="mobile" className="label">
                    Mobile Number <span className="text-text-light">(Optional)</span>
                  </label>
                  <input
                    id="mobile"
                    name="mobile"
                    type="tel"
                    className={`input ${errors.mobile ? 'border-error' : ''}`}
                    value={formData.mobile}
                    onChange={handleChange}
                    placeholder="+971 (50) 000 0000"
                  />
                  {errors.mobile && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-1 flex items-center gap-1 text-xs text-error"
                    >
                      <AlertCircle className="h-3 w-3" />
                      {errors.mobile}
                    </motion.p>
                  )}
                </div>

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="btn-primary w-full"
                    disabled={Object.keys(errors).length > 0 || !formData.firstName || !formData.lastName || !formData.email}
                  >
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </div>
              </>
            )}

            {currentStep === 2 && (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="age" className="label">
                      Age
                    </label>
                    <input
                      id="age"
                      name="age"
                      type="number"
                      className={`input ${errors.age ? 'border-error' : ''}`}
                      value={formData.age}
                      onChange={handleChange}
                      placeholder="30"
                      min="18"
                      max="120"
                    />
                    {errors.age && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1 flex items-center gap-1 text-xs text-error"
                      >
                        <AlertCircle className="h-3 w-3" />
                        {errors.age}
                      </motion.p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="gender" className="label">
                      Gender
                    </label>
                    <select
                      id="gender"
                      name="gender"
                      className={`input ${errors.gender ? 'border-error' : ''}`}
                      value={formData.gender}
                      onChange={handleChange}
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="not_specified">Prefer not to say</option>
                    </select>
                    {errors.gender && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1 flex items-center gap-1 text-xs text-error"
                      >
                        <AlertCircle className="h-3 w-3" />
                        {errors.gender}
                      </motion.p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="label">
                    Health Goals <span className="text-error">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {healthGoalOptions.map((goal) => (
                      <label key={goal} className={`flex items-center gap-2 rounded-lg border p-2 text-sm transition-colors ${
                        formData.healthGoals!.includes(goal) 
                          ? 'border-primary bg-primary/5 text-primary' 
                          : 'border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] hover:bg-[hsl(var(--color-card-hover))]'
                      }`}>
                        <input
                          type="checkbox"
                          name="healthGoals"
                          value={goal}
                          checked={formData.healthGoals!.includes(goal)}
                          onChange={handleChange}
                          className="h-4 w-4 rounded border-[hsl(var(--color-border))] text-primary focus:ring-primary"
                        />
                        {goal}
                      </label>
                    ))}
                  </div>
                  {errors.healthGoals && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-1 flex items-center gap-1 text-xs text-error"
                    >
                      <AlertCircle className="h-3 w-3" />
                      {errors.healthGoals}
                    </motion.p>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="sleepHours" className="label">
                      Average Sleep (hours)
                    </label>
                    <input
                      id="sleepHours"
                      name="sleepHours"
                      type="number"
                      className="input"
                      value={formData.sleepHours}
                      onChange={handleChange}
                      placeholder="7.5"
                      min="1"
                      max="24"
                      step="0.5"
                    />
                  </div>

                  <div>
                    <label htmlFor="exerciseFrequency" className="label">
                      Exercise Frequency
                    </label>
                    <select
                      id="exerciseFrequency"
                      name="exerciseFrequency"
                      className="input"
                      value={formData.exerciseFrequency}
                      onChange={handleChange}
                    >
                      <option value="">Select frequency</option>
                      <option value="rarely">Rarely</option>
                      <option value="1-2_times_week">1-2 times per week</option>
                      <option value="3-4_times_week">3-4 times per week</option>
                      <option value="5+_times_week">5+ times per week</option>
                      <option value="daily">Daily</option>
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="dietPreference" className="label">
                      Diet Preference
                    </label>
                    <select
                      id="dietPreference"
                      name="dietPreference"
                      className="input"
                      value={formData.dietPreference}
                      onChange={handleChange}
                    >
                      <option value="">Select diet</option>
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

                  <div>
                    <label htmlFor="stressLevel" className="label">
                      Stress Level
                    </label>
                    <select
                      id="stressLevel"
                      name="stressLevel"
                      className="input"
                      value={formData.stressLevel}
                      onChange={handleChange}
                    >
                      <option value="">Select level</option>
                      <option value="low">Low</option>
                      <option value="moderate">Moderate</option>
                      <option value="high">High</option>
                      <option value="very_high">Very High</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-start gap-2 rounded-lg bg-[hsl(var(--color-card))] p-4">
                  <Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-text-light" />
                  <p className="text-xs text-text-light">
                    Your health information is private and secure. We use this data to personalize your experience and provide better recommendations.
                  </p>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="px-4 py-2 border border-[hsl(var(--color-border))] rounded-lg text-text-light hover:bg-[hsl(var(--color-card-hover))]"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={isLoading || formData.healthGoals!.length === 0}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                        Saving...
                      </span>
                    ) : (
                      'Complete Setup'
                    )}
                  </button>
                </div>
              </>
            )}
          </form>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default OnboardingForm;