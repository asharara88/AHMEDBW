import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSupabase } from '../../contexts/SupabaseContext';
import { useAuth } from '../../contexts/AuthContext';
import { Send, User, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { useAutoScroll } from '../../hooks/useAutoScroll';

interface Message {
  role: 'system' | 'user';
  content: string;
  timestamp: Date;
}

interface OnboardingData {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  gender: string;
  healthGoals: string[];
  supplementHabits: string[];
  mainGoal: string;
  completed: boolean;
}

const ConversationalOnboarding = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<'greeting' | 'name' | 'gender' | 'mainGoal' | 'healthGoals' | 'supplementHabits' | 'complete'>('greeting');
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    gender: '',
    healthGoals: [],
    supplementHabits: [],
    mainGoal: '',
    completed: false
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { supabase } = useSupabase();
  const { user, updateUserProfile } = useAuth();
  const navigate = useNavigate();

  // Use the auto-scroll hook
  useAutoScroll(messagesEndRef, [messages]);

  // Initial greeting message
  useEffect(() => {
    const initialMessage: Message = {
      role: 'system',
      content: "Hi there! I'm your Biowell Health Coach. Let's get to know each other better so I can personalize your health journey. What's your name?",
      timestamp: new Date()
    };
    setMessages([initialMessage]);
    setCurrentStep('name');
  }, []);

  // Check if onboarding is already completed
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) {
        console.log('No user found, skipping onboarding status check');
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        console.log('Checking onboarding status for user:', user.id);
        const { data, error } = await supabase
          .from('profiles')
          .select('onboarding_completed, first_name, last_name')
          .eq('id', user.id)
          .maybeSingle();
        
        if (error) {
          console.error('Supabase query error:', error);
          setError('Failed to check onboarding status. Please try refreshing the page.');
          return;
        }
        
        console.log('Onboarding status data:', data);
        
        // If onboarding is already completed, redirect to dashboard
        if (data?.onboarding_completed && data?.first_name && data?.last_name) {
          console.log('Onboarding already completed, redirecting to dashboard');
          navigate('/dashboard');
        }
      } catch (err) {
        console.error('Error checking onboarding status:', err);
        setError('Failed to check onboarding status. Please try refreshing the page.');
      } finally {
        setLoading(false);
      }
    };
    
    checkOnboardingStatus();
  }, [user, navigate, supabase]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    // Add user message to chat
    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    
    // Process user input based on current step
    processUserInput(input);
  };

  const processUserInput = async (userInput: string) => {
    setLoading(true);
    setError(null);
    
    try {
      let systemResponse = '';
      
      switch (currentStep) {
        case 'name':
          // Process name input
          const nameParts = userInput.trim().split(' ');
          const firstName = nameParts[0];
          const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
          
          setOnboardingData(prev => ({
            ...prev,
            firstName,
            lastName: lastName || prev.lastName,
            email: user?.email || prev.email
          }));
          
          systemResponse = `Great to meet you, ${firstName}! What's your gender?`;
          setCurrentStep('gender');
          
          // Add system response with buttons
          addSystemResponseWithButtons(systemResponse, [
            { label: 'Male', value: 'male' },
            { label: 'Female', value: 'female' },
            { label: 'Prefer not to say', value: 'not_specified' }
          ]);
          break;
          
        case 'gender':
          // This will be handled by handleButtonClick
          break;
          
        case 'mainGoal':
          // This will be handled by handleButtonClick
          break;
          
        case 'healthGoals':
          // This will be handled by handleButtonClick
          break;
          
        case 'supplementHabits':
          // This will be handled by handleButtonClick
          break;
          
        default:
          systemResponse = "I didn't understand that. Could you please try again?";
          addSystemResponse(systemResponse);
      }
    } catch (err) {
      console.error('Error processing user input:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleButtonClick = async (value: string, step: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Add user message to chat
      const userMessage: Message = {
        role: 'user',
        content: value,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      let systemResponse = '';
      
      switch (step) {
        case 'gender':
          setOnboardingData(prev => ({
            ...prev,
            gender: value
          }));
          
          systemResponse = "What's your main health goal?";
          setCurrentStep('mainGoal');
          
          addSystemResponseWithButtons(systemResponse, [
            { label: 'Improve Sleep', value: 'improve_sleep' },
            { label: 'Increase Energy', value: 'increase_energy' },
            { label: 'Lose Weight', value: 'lose_weight' },
            { label: 'Build Muscle', value: 'build_muscle' },
            { label: 'Reduce Stress', value: 'reduce_stress' },
            { label: 'Optimize Metabolism', value: 'optimize_metabolism' }
          ]);
          break;
          
        case 'mainGoal':
          setOnboardingData(prev => ({
            ...prev,
            mainGoal: value
          }));
          
          systemResponse = "What specific health areas would you like to focus on?";
          setCurrentStep('healthGoals');
          
          addSystemResponseWithButtons(systemResponse, [
            { label: 'Sleep Quality', value: 'sleep_quality' },
            { label: 'Energy Levels', value: 'energy_levels' },
            { label: 'Stress Management', value: 'stress_management' },
            { label: 'Metabolic Health', value: 'metabolic_health' },
            { label: 'Cognitive Performance', value: 'cognitive_performance' },
            { label: 'Fitness', value: 'fitness' },
            { label: 'Nutrition', value: 'nutrition' },
            { label: 'Longevity', value: 'longevity' }
          ], true);
          break;
          
        case 'healthGoals':
          // Toggle the health goal
          setOnboardingData(prev => {
            const updatedGoals = prev.healthGoals.includes(value)
              ? prev.healthGoals.filter(goal => goal !== value)
              : [...prev.healthGoals, value];
            
            return {
              ...prev,
              healthGoals: updatedGoals
            };
          });
          break;
          
        case 'supplementHabits':
          // Toggle the supplement habit
          setOnboardingData(prev => {
            const updatedHabits = prev.supplementHabits.includes(value)
              ? prev.supplementHabits.filter(habit => habit !== value)
              : [...prev.supplementHabits, value];
            
            return {
              ...prev,
              supplementHabits: updatedHabits
            };
          });
          break;
          
        case 'continueToSupplements':
          systemResponse = "Do you currently take any supplements?";
          setCurrentStep('supplementHabits');
          
          addSystemResponseWithButtons(systemResponse, [
            { label: 'Multivitamin', value: 'multivitamin' },
            { label: 'Vitamin D', value: 'vitamin_d' },
            { label: 'Omega-3', value: 'omega_3' },
            { label: 'Magnesium', value: 'magnesium' },
            { label: 'Protein', value: 'protein' },
            { label: 'Probiotics', value: 'probiotics' },
            { label: 'None', value: 'none' }
          ], true);
          break;
          
        case 'complete':
          await saveOnboardingData();
          break;
      }
    } catch (err) {
      console.error('Error handling button click:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addSystemResponse = (content: string) => {
    const systemMessage: Message = {
      role: 'system',
      content,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, systemMessage]);
  };

  const addSystemResponseWithButtons = (content: string, buttons: { label: string; value: string }[], isMultiSelect: boolean = false) => {
    const systemMessage: Message = {
      role: 'system',
      content: `<strong>${content}</strong>`,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, systemMessage]);
  };

  const saveOnboardingData = async () => {
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    try {
      // Update profile in database
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          first_name: onboardingData.firstName,
          last_name: onboardingData.lastName,
          mobile: onboardingData.mobile,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        });
      
      if (error) throw error;
      
      // Save health goals to quiz_responses if the table exists
      try {
        await supabase
          .from('quiz_responses')
          .upsert({
            user_id: user.id,
            health_goals: onboardingData.healthGoals,
            gender: onboardingData.gender,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
      } catch (err) {
        // If quiz_responses table doesn't exist, just log the error but continue
        console.warn('Could not save health goals to quiz_responses:', err);
      }
      
      // Update auth context
      await updateUserProfile({
        firstName: onboardingData.firstName,
        lastName: onboardingData.lastName,
        email: user.email || '',
        mobile: onboardingData.mobile,
        healthGoals: onboardingData.healthGoals,
        onboardingCompleted: true
      });
      
      // Add completion message
      addSystemResponse("Perfect! Your profile is now set up, and I'm ready to help you achieve your health goals. Let's get started with your health journey!");
      
      setOnboardingData(prev => ({
        ...prev,
        completed: true
      }));
      
      setCurrentStep('complete');
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    } catch (err) {
      console.error('Error saving onboarding data:', err);
      throw err;
    }
  };

  const handleContinueToSupplements = () => {
    if (onboardingData.healthGoals.length === 0) {
      setError('Please select at least one health goal');
      return;
    }
    
    setError(null);
    handleButtonClick('continue', 'continueToSupplements');
  };

  const handleComplete = () => {
    handleButtonClick('complete', 'complete');
  };

  return (
    <div className="flex h-full flex-col rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] shadow-lg">
      <div className="border-b border-[hsl(var(--color-border))] bg-[hsl(var(--color-card-hover))] p-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <img 
              src="https://jvqweleqjkrgldeflnfr.supabase.co/storage/v1/object/sign/heroes/STACKDASH.svg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5XzFhYTRlZDEyLWU0N2QtNDcyNi05ZmI0LWQ3MWM5MGFlOTYyZSJ9.eyJ1cmwiOiJoZXJvZXMvU1RBQ0tEQVNILnN2ZyIsImlhdCI6MTc0NzAxNTM3MSwiZXhwIjoxNzc4NTUxMzcxfQ.fumrYJiZDGZ36gbwlOVcWHsqs5uFiYRBAhtaT_tnQlM" 
              alt="Health Coach" 
              className="h-5 w-5"
              loading="eager"
            />
          </div>
          <div>
            <h3 className="text-sm font-medium">Biowell Onboarding</h3>
            <p className="text-xs text-text-light">Let's get to know you</p>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 overscroll-contain">
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-error/10 p-3 text-sm text-error">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'system' && (
              <div className="mr-2 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <img 
                  src="https://jvqweleqjkrgldeflnfr.supabase.co/storage/v1/object/sign/heroes/STACKDASH.svg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5XzFhYTRlZDEyLWU0N2QtNDcyNi05ZmI0LWQ3MWM5MGFlOTYyZSJ9.eyJ1cmwiOiJoZXJvZXMvU1RBQ0tEQVNILnN2ZyIsImlhdCI6MTc0NzAxNTM3MSwiZXhwIjoxNzc4NTUxMzcxfQ.fumrYJiZDGZ36gbwlOVcWHsqs5uFiYRBAhtaT_tnQlM" 
                  alt="Health Coach" 
                  className="h-4 w-4"
                  loading="lazy"
                />
              </div>
            )}
            
            <div
              className={`max-w-[75%] rounded-lg px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-primary text-white'
                  : 'bg-[hsl(var(--color-card-hover))] text-text'
              }`}
            >
              <div dangerouslySetInnerHTML={{ __html: message.content }}></div>
              <div className="mt-1 text-xs opacity-70">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
            
            {message.role === 'user' && (
              <div className="ml-2 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[hsl(var(--color-card-hover))] text-text-light">
                <User className="h-4 w-4" />
              </div>
            )}
          </div>
        ))}

        {/* Button options based on current step */}
        {currentStep === 'gender' && (
          <div className="mb-4 flex flex-col gap-2">
            <button
              onClick={() => handleButtonClick('Male', 'gender')}
              className="w-full rounded-lg bg-[hsl(var(--color-surface-1))] px-4 py-3 text-left font-medium hover:bg-primary/10"
            >
              Male
            </button>
            <button
              onClick={() => handleButtonClick('Female', 'gender')}
              className="w-full rounded-lg bg-[hsl(var(--color-surface-1))] px-4 py-3 text-left font-medium hover:bg-primary/10"
            >
              Female
            </button>
            <button
              onClick={() => handleButtonClick('Prefer not to say', 'gender')}
              className="w-full rounded-lg bg-[hsl(var(--color-surface-1))] px-4 py-3 text-left font-medium hover:bg-primary/10"
            >
              Prefer not to say
            </button>
          </div>
        )}

        {currentStep === 'mainGoal' && (
          <div className="mb-4 flex flex-col gap-2">
            <button
              onClick={() => handleButtonClick('Improve Sleep', 'mainGoal')}
              className="w-full rounded-lg bg-[hsl(var(--color-surface-1))] px-4 py-3 text-left font-medium hover:bg-primary/10"
            >
              Improve Sleep
            </button>
            <button
              onClick={() => handleButtonClick('Increase Energy', 'mainGoal')}
              className="w-full rounded-lg bg-[hsl(var(--color-surface-1))] px-4 py-3 text-left font-medium hover:bg-primary/10"
            >
              Increase Energy
            </button>
            <button
              onClick={() => handleButtonClick('Lose Weight', 'mainGoal')}
              className="w-full rounded-lg bg-[hsl(var(--color-surface-1))] px-4 py-3 text-left font-medium hover:bg-primary/10"
            >
              Lose Weight
            </button>
            <button
              onClick={() => handleButtonClick('Build Muscle', 'mainGoal')}
              className="w-full rounded-lg bg-[hsl(var(--color-surface-1))] px-4 py-3 text-left font-medium hover:bg-primary/10"
            >
              Build Muscle
            </button>
            <button
              onClick={() => handleButtonClick('Reduce Stress', 'mainGoal')}
              className="w-full rounded-lg bg-[hsl(var(--color-surface-1))] px-4 py-3 text-left font-medium hover:bg-primary/10"
            >
              Reduce Stress
            </button>
            <button
              onClick={() => handleButtonClick('Optimize Metabolism', 'mainGoal')}
              className="w-full rounded-lg bg-[hsl(var(--color-surface-1))] px-4 py-3 text-left font-medium hover:bg-primary/10"
            >
              Optimize Metabolism
            </button>
          </div>
        )}

        {currentStep === 'healthGoals' && (
          <div className="mb-4">
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleButtonClick('sleep_quality', 'healthGoals')}
                className={`w-full rounded-lg px-4 py-3 text-left font-medium ${
                  onboardingData.healthGoals.includes('sleep_quality')
                    ? 'bg-primary text-white'
                    : 'bg-[hsl(var(--color-surface-1))] hover:bg-primary/10'
                }`}
              >
                Sleep Quality
              </button>
              <button
                onClick={() => handleButtonClick('energy_levels', 'healthGoals')}
                className={`w-full rounded-lg px-4 py-3 text-left font-medium ${
                  onboardingData.healthGoals.includes('energy_levels')
                    ? 'bg-primary text-white'
                    : 'bg-[hsl(var(--color-surface-1))] hover:bg-primary/10'
                }`}
              >
                Energy Levels
              </button>
              <button
                onClick={() => handleButtonClick('stress_management', 'healthGoals')}
                className={`w-full rounded-lg px-4 py-3 text-left font-medium ${
                  onboardingData.healthGoals.includes('stress_management')
                    ? 'bg-primary text-white'
                    : 'bg-[hsl(var(--color-surface-1))] hover:bg-primary/10'
                }`}
              >
                Stress Management
              </button>
              <button
                onClick={() => handleButtonClick('metabolic_health', 'healthGoals')}
                className={`w-full rounded-lg px-4 py-3 text-left font-medium ${
                  onboardingData.healthGoals.includes('metabolic_health')
                    ? 'bg-primary text-white'
                    : 'bg-[hsl(var(--color-surface-1))] hover:bg-primary/10'
                }`}
              >
                Metabolic Health
              </button>
              <button
                onClick={() => handleButtonClick('cognitive_performance', 'healthGoals')}
                className={`w-full rounded-lg px-4 py-3 text-left font-medium ${
                  onboardingData.healthGoals.includes('cognitive_performance')
                    ? 'bg-primary text-white'
                    : 'bg-[hsl(var(--color-surface-1))] hover:bg-primary/10'
                }`}
              >
                Cognitive Performance
              </button>
              <button
                onClick={() => handleButtonClick('fitness', 'healthGoals')}
                className={`w-full rounded-lg px-4 py-3 text-left font-medium ${
                  onboardingData.healthGoals.includes('fitness')
                    ? 'bg-primary text-white'
                    : 'bg-[hsl(var(--color-surface-1))] hover:bg-primary/10'
                }`}
              >
                Fitness
              </button>
              <button
                onClick={() => handleButtonClick('nutrition', 'healthGoals')}
                className={`w-full rounded-lg px-4 py-3 text-left font-medium ${
                  onboardingData.healthGoals.includes('nutrition')
                    ? 'bg-primary text-white'
                    : 'bg-[hsl(var(--color-surface-1))] hover:bg-primary/10'
                }`}
              >
                Nutrition
              </button>
              <button
                onClick={() => handleButtonClick('longevity', 'healthGoals')}
                className={`w-full rounded-lg px-4 py-3 text-left font-medium ${
                  onboardingData.healthGoals.includes('longevity')
                    ? 'bg-primary text-white'
                    : 'bg-[hsl(var(--color-surface-1))] hover:bg-primary/10'
                }`}
              >
                Longevity
              </button>
            </div>
            
            <button
              onClick={handleContinueToSupplements}
              disabled={onboardingData.healthGoals.length === 0}
              className="mt-4 w-full rounded-lg bg-primary px-4 py-3 text-white disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        )}

        {currentStep === 'supplementHabits' && (
          <div className="mb-4">
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleButtonClick('multivitamin', 'supplementHabits')}
                className={`w-full rounded-lg px-4 py-3 text-left font-medium ${
                  onboardingData.supplementHabits.includes('multivitamin')
                    ? 'bg-primary text-white'
                    : 'bg-[hsl(var(--color-surface-1))] hover:bg-primary/10'
                }`}
              >
                Multivitamin
              </button>
              <button
                onClick={() => handleButtonClick('vitamin_d', 'supplementHabits')}
                className={`w-full rounded-lg px-4 py-3 text-left font-medium ${
                  onboardingData.supplementHabits.includes('vitamin_d')
                    ? 'bg-primary text-white'
                    : 'bg-[hsl(var(--color-surface-1))] hover:bg-primary/10'
                }`}
              >
                Vitamin D
              </button>
              <button
                onClick={() => handleButtonClick('omega_3', 'supplementHabits')}
                className={`w-full rounded-lg px-4 py-3 text-left font-medium ${
                  onboardingData.supplementHabits.includes('omega_3')
                    ? 'bg-primary text-white'
                    : 'bg-[hsl(var(--color-surface-1))] hover:bg-primary/10'
                }`}
              >
                Omega-3
              </button>
              <button
                onClick={() => handleButtonClick('magnesium', 'supplementHabits')}
                className={`w-full rounded-lg px-4 py-3 text-left font-medium ${
                  onboardingData.supplementHabits.includes('magnesium')
                    ? 'bg-primary text-white'
                    : 'bg-[hsl(var(--color-surface-1))] hover:bg-primary/10'
                }`}
              >
                Magnesium
              </button>
              <button
                onClick={() => handleButtonClick('protein', 'supplementHabits')}
                className={`w-full rounded-lg px-4 py-3 text-left font-medium ${
                  onboardingData.supplementHabits.includes('protein')
                    ? 'bg-primary text-white'
                    : 'bg-[hsl(var(--color-surface-1))] hover:bg-primary/10'
                }`}
              >
                Protein
              </button>
              <button
                onClick={() => handleButtonClick('probiotics', 'supplementHabits')}
                className={`w-full rounded-lg px-4 py-3 text-left font-medium ${
                  onboardingData.supplementHabits.includes('probiotics')
                    ? 'bg-primary text-white'
                    : 'bg-[hsl(var(--color-surface-1))] hover:bg-primary/10'
                }`}
              >
                Probiotics
              </button>
              <button
                onClick={() => handleButtonClick('none', 'supplementHabits')}
                className={`w-full rounded-lg px-4 py-3 text-left font-medium ${
                  onboardingData.supplementHabits.includes('none')
                    ? 'bg-primary text-white'
                    : 'bg-[hsl(var(--color-surface-1))] hover:bg-primary/10'
                }`}
              >
                None
              </button>
            </div>
            
            <button
              onClick={handleComplete}
              className="mt-4 w-full rounded-lg bg-primary px-4 py-3 text-white"
            >
              Complete Setup
            </button>
          </div>
        )}

        {loading && (
          <div className="flex justify-start">
            <div className="mr-2 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <img 
                src="https://jvqweleqjkrgldeflnfr.supabase.co/storage/v1/object/sign/heroes/STACKDASH.svg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5XzFhYTRlZDEyLWU0N2QtNDcyNi05ZmI0LWQ3MWM5MGFlOTYyZSJ9.eyJ1cmwiOiJoZXJvZXMvU1RBQ0tEQVNILnN2ZyIsImlhdCI6MTc0NzAxNTM3MSwiZXhwIjoxNzc4NTUxMzcxfQ.fumrYJiZDGZ36gbwlOVcWHsqs5uFiYRBAhtaT_tnQlM" 
                alt="Health Coach" 
                className="h-4 w-4"
                loading="lazy"
              />
            </div>
            <div className="max-w-[75%] rounded-lg bg-[hsl(var(--color-card-hover))] p-4">
              <Loader className="h-5 w-5 animate-spin text-primary" role="status" />
            </div>
          </div>
        )}

        {currentStep === 'complete' && (
          <div className="mt-6 flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center rounded-lg bg-success/10 p-4 text-success"
            >
              <CheckCircle className="mb-2 h-8 w-8" />
              <p className="text-center">Onboarding complete! Redirecting to your dashboard...</p>
            </motion.div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-[hsl(var(--color-border))] p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              currentStep === 'name' ? "Enter your full name..." :
              "Type your message..."
            }
            className="flex-1 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-4 py-2 text-text placeholder:text-text-light focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            disabled={loading || currentStep === 'complete' || currentStep !== 'name'}
          />
          <button
            type="submit"
            disabled={loading || !input.trim() || currentStep === 'complete' || currentStep !== 'name'}
            className="flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ConversationalOnboarding;