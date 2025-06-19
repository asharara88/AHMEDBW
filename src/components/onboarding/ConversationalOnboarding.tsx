import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSupabase } from '../../contexts/SupabaseContext';
import { useAuthStore } from '../../store';
import { Send, User, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { useAutoScroll } from '../../hooks/useAutoScroll';
import { openaiApi } from '../../api/openaiApi';
import { logError } from '../../utils/logger';
import { onboardingApi, OnboardingFormData } from '../../api/onboardingApi';

interface Message {
  role: 'system' | 'user';
  content: string;
  timestamp: Date;
}

const ConversationalOnboarding = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<'greeting' | 'name' | 'gender' | 'mainGoal' | 'healthGoals' | 'supplementHabits' | 'complete'>('greeting');
  const [onboardingData, setOnboardingData] = useState<OnboardingFormData>({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    gender: '',
    healthGoals: [],
    supplementHabits: [],
    mainGoal: '',
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { supabase } = useSupabase();
  const { user, updateProfile } = useAuthStore();
  const navigate = useNavigate();

  // Use the auto-scroll hook with onlyScrollDown set to true
  useAutoScroll(messagesEndRef, [messages], { behavior: 'smooth' }, true);

  // Initial greeting message
  useEffect(() => {
    const initializeChat = async () => {
      setLoading(true);
      try {
        const initialResponse = await openaiApi.processOnboarding([]);
        
        const initialMessage: Message = {
          role: 'system',
          content: initialResponse,
          timestamp: new Date()
        };
        
        setMessages([initialMessage]);
        setCurrentStep('name');
      } catch (err) {
        logError('Error initializing onboarding chat', err);
        setError('Failed to start onboarding. Please try refreshing the page.');
      } finally {
        setLoading(false);
      }
    };
    
    initializeChat();
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

  const handleSubmit = async (e: React.FormEvent) => {
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
    
    // Process user input
    await processUserInput(input);
  };

  const processUserInput = async (userInput: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Format messages for OpenAI
      const formattedMessages = messages.map(msg => ({
        role: msg.role === 'system' ? 'assistant' : 'user',
        content: msg.content
      }));
      
      // Add the new user message
      formattedMessages.push({
        role: 'user',
        content: userInput
      });
      
      // Get response from OpenAI
      const response = await openaiApi.processOnboarding(formattedMessages);
      
      // Add system response
      const systemMessage: Message = {
        role: 'system',
        content: response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, systemMessage]);
      
      // Extract data and update onboarding progress
      await updateOnboardingProgress(formattedMessages);
      
    } catch (err: any) {
      logError('Error processing user input', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateOnboardingProgress = async (conversationHistory: any[]) => {
    try {
      // Extract structured data from the conversation
      const extractedData = await openaiApi.extractOnboardingData(conversationHistory);
      
      // Update onboarding data state
      setOnboardingData(prev => ({
        ...prev,
        ...extractedData
      }));
      
      // Determine current step based on extracted data
      if (extractedData.firstName && extractedData.lastName && !currentStep.match(/^(gender|mainGoal|healthGoals|supplementHabits|complete)$/)) {
        setCurrentStep('gender');
      } else if (extractedData.gender && !currentStep.match(/^(mainGoal|healthGoals|supplementHabits|complete)$/)) {
        setCurrentStep('mainGoal');
      } else if (extractedData.mainGoal && !currentStep.match(/^(healthGoals|supplementHabits|complete)$/)) {
        setCurrentStep('healthGoals');
      } else if (extractedData.healthGoals?.length > 0 && !currentStep.match(/^(supplementHabits|complete)$/)) {
        setCurrentStep('supplementHabits');
      } else if (extractedData.supplementHabits?.length > 0 && currentStep !== 'complete') {
        // All data collected, save to database
        await saveOnboardingData({
          ...onboardingData,
          ...extractedData
        });
      }
    } catch (err) {
      logError('Error updating onboarding progress', err);
    }
  };

  const saveOnboardingData = async (data: OnboardingFormData) => {
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    try {
      // Use the onboardingApi to handle all the steps
      await onboardingApi.completeOnboarding(user, data);
      
      // Update auth context with profile data
      await updateProfile({
        firstName: data.firstName,
        lastName: data.lastName,
        email: user.email || '',
        mobile: data.mobile,
        healthGoals: data.healthGoals,
        onboardingCompleted: true
      });
      
      // Add completion message
      const completionMessage: Message = {
        role: 'system',
        content: "Perfect! Your profile is now set up, and I'm ready to help you achieve your health goals. Let's get started with your health journey!",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, completionMessage]);
      
      setCurrentStep('complete');
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    } catch (err) {
      logError('Error saving onboarding data', err);
      throw err;
    }
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
            placeholder="Type your response..."
            className="flex-1 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-4 py-2 text-text placeholder:text-text-light focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            disabled={loading || currentStep === 'complete'}
          />
          <button
            type="submit"
            disabled={loading || !input.trim() || currentStep === 'complete'}
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