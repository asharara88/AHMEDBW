import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSupabase } from '../../contexts/SupabaseContext';
import { useAuth } from '../../contexts/AuthContext';
import { Send, User, Loader, CheckCircle, AlertCircle } from 'lucide-react';

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
  healthGoals: string[];
  completed: boolean;
}

const ConversationalOnboarding = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<'greeting' | 'name' | 'mobile' | 'goals' | 'complete'>('greeting');
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    healthGoals: [],
    completed: false
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { supabase } = useSupabase();
  const { user, updateUserProfile } = useAuth();
  const navigate = useNavigate();

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

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Check if onboarding is already completed
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('onboarding_completed, first_name, last_name')
          .eq('id', user.id)
          .maybeSingle();
        
        if (error) {
          console.error('Error checking onboarding status:', error);
          return;
        }
        
        // If onboarding is already completed, redirect to dashboard
        if (data?.onboarding_completed && data?.first_name && data?.last_name) {
          navigate('/dashboard');
        }
      } catch (err) {
        console.error('Error checking onboarding status:', err);
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
          
          systemResponse = `Great to meet you, ${firstName}! Could you please share your mobile number? This helps us send you important health notifications.`;
          setCurrentStep('mobile');
          break;
          
        case 'mobile':
          // Process mobile input
          setOnboardingData(prev => ({
            ...prev,
            mobile: userInput.trim()
          }));
          
          systemResponse = "Thanks! Now, what are your main health goals? For example: 'improve sleep', 'increase energy', 'reduce stress', etc.";
          setCurrentStep('goals');
          break;
          
        case 'goals':
          // Process health goals
          const goals = userInput
            .split(',')
            .map(goal => goal.trim())
            .filter(goal => goal.length > 0);
          
          setOnboardingData(prev => ({
            ...prev,
            healthGoals: goals,
            completed: true
          }));
          
          // Save onboarding data to Supabase
          await saveOnboardingData({
            ...onboardingData,
            healthGoals: goals,
            completed: true
          });
          
          systemResponse = `Perfect! I've noted your goals: ${goals.join(', ')}. Your profile is now set up, and I'm ready to help you achieve these goals. Let's get started with your health journey!`;
          setCurrentStep('complete');
          
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            navigate('/dashboard');
          }, 3000);
          
          break;
          
        default:
          systemResponse = "I didn't understand that. Could you please try again?";
      }
      
      // Add system response to chat
      const systemMessage: Message = {
        role: 'system',
        content: systemResponse,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, systemMessage]);
      
    } catch (err) {
      console.error('Error processing user input:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const saveOnboardingData = async (data: OnboardingData) => {
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    try {
      // Update user profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          first_name: data.firstName,
          last_name: data.lastName,
          mobile: data.mobile,
          onboarding_completed: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      // Save health goals to quiz_responses if the table exists
      try {
        await supabase
          .from('quiz_responses')
          .upsert({
            user_id: user.id,
            health_goals: data.healthGoals,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
      } catch (err) {
        // If quiz_responses table doesn't exist, just log the error but continue
        console.warn('Could not save health goals to quiz_responses:', err);
      }
      
      // Update auth context
      await updateUserProfile({
        firstName: data.firstName,
        lastName: data.lastName,
        email: user.email || '',
        mobile: data.mobile,
        healthGoals: data.healthGoals,
        onboardingCompleted: true
      });
      
    } catch (err) {
      console.error('Error saving onboarding data:', err);
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
              <div>{message.content}</div>
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
            placeholder={
              currentStep === 'name' ? "Enter your full name..." :
              currentStep === 'mobile' ? "Enter your mobile number..." :
              currentStep === 'goals' ? "Enter your health goals (comma separated)..." :
              "Type your message..."
            }
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