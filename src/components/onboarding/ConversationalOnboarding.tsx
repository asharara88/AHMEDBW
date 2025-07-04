import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, User, CheckCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { logError } from '../../utils/logger';
import { useAutoScroll } from '../../hooks/useAutoScroll';
import { OnboardingFormData } from '../../api/onboardingApi';
import SuggestedQuestions from './SuggestedQuestions';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ConversationalOnboardingProps {
  onComplete?: (formData: OnboardingFormData) => void;
}

const ConversationalOnboarding = ({ onComplete }: ConversationalOnboardingProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<'greeting' | 'name' | 'gender' | 'mainGoal' | 'healthGoals' | 'supplements' | 'complete'>('greeting');
  const [onboardingData, setOnboardingData] = useState<OnboardingFormData>({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    gender: '',
    healthGoals: [],
    mainGoal: '',
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  
  // Use the auto-scroll hook with onlyScrollDown set to true
  useAutoScroll(messagesEndRef, [messages], { behavior: 'smooth' }, true);

  // Initial greeting message - only add once when component mounts
  useEffect(() => {
    if (messages.length === 0) {
      const hour = new Date().getHours();
      let greeting = "Hello there! ";
      
      if (hour < 12) greeting = "Good morning! ";
      else if (hour < 18) greeting = "Good afternoon! ";
      else greeting = "Good evening! ";
      
      addBotMessage(`${greeting}I'm your Biowell health coach. Ask me anything about your personal wellness.`);
      setCurrentStep('name');
    }
  }, []);

  const addBotMessage = (content: string) => {
    // Simulate typing
    setLoading(true);
    
    // Calculate typing delay based on message length (50-100ms per word)
    const words = content.split(' ').length;
    const typingDelay = Math.min(Math.max(words * 75, 500), 2000);
    
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content,
        timestamp: new Date()
      }]);
      setLoading(false);
    }, typingDelay);
  };

  const handleSubmit = async (e: React.FormEvent | string) => {
    if (typeof e !== 'string') {
      e?.preventDefault?.();
    }
    const messageContent = typeof e === 'string' ? e : input;
    
    if (!messageContent.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: messageContent,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Process based on current step
    processUserInput(messageContent);
    
    // Clear input
    setInput('');
  };

  const processUserInput = (userInput: string) => {
    try {
      switch(currentStep) {
        case 'name': {
          // Extract name
          const nameParts = userInput.trim().split(' ');
          const firstName = nameParts[0];
          const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
          
          setOnboardingData(prev => ({ ...prev, firstName, lastName }));
          setCurrentStep('gender');
          
          // Next question
          addBotMessage(`Nice to meet you, ${firstName}! To help personalize your experience, could you tell me your gender?`);
          break;
        }
          
        case 'gender':
          // Process gender
          let gender = userInput.toLowerCase();
          if (gender.includes('male')) gender = 'male';
          else if (gender.includes('female')) gender = 'female';
          else gender = 'not_specified';
          
          setOnboardingData(prev => ({ ...prev, gender }));
          setCurrentStep('mainGoal');
          
          addBotMessage(`Thanks! What's your primary health goal right now? For example: improve sleep, increase energy, reduce stress, etc.`);
          break;
          
        case 'mainGoal':
          setOnboardingData(prev => ({ ...prev, mainGoal: userInput }));
          setCurrentStep('healthGoals');
          
          addBotMessage(`Great goal! What specific health areas would you like to focus on? You can list multiple areas like sleep, energy, stress, fitness, etc.`);
          break;
          
        case 'healthGoals':
          // Extract health goals
          const healthGoals = userInput
            .split(/[,;]/)
            .map(goal => goal.trim())
            .filter(goal => goal.length > 0);
          
          setOnboardingData(prev => ({ ...prev, healthGoals }));
          setCurrentStep('supplements');
          
          addBotMessage(`Got it. Are you currently taking any supplements? If yes, please list them.`);
          break;
          
        case 'supplements': {
          // Extract supplements
          const supplements = userInput
            .split(/[,;]/)
            .map(supp => supp.trim())
            .filter(supp => supp.length > 0);
          
          setOnboardingData(prev => ({ ...prev, supplementHabits: supplements }));
          setCurrentStep('complete');
          
          // Final message
          const firstName = onboardingData.firstName || 'there';
          addBotMessage(`Thank you, ${firstName}! Based on your responses, I've created a personalized health plan for you. Let's get started on your journey to better health!`);
          
          // Complete onboarding after a delay
          setTimeout(() => {
            if (onComplete) {
              onComplete({
                ...onboardingData,
                supplementHabits: supplements,
                email: user?.email || ''
              });
            }
          }, 2000);
          break;
        }
          
        default:
          break;
      }
    } catch (err) {
      logError('Error processing user input', err);
      setError('Something went wrong processing your response. Please try again.');
    }
  };

  const suggestedResponses = () => {
    switch(currentStep) {
      case 'name':
        return ['John Smith', 'Jane Doe', 'Alex Johnson'];
      case 'gender':
        return ['Male', 'Female', 'Prefer not to say'];
      case 'mainGoal':
        return ['Improve sleep', 'Increase energy', 'Reduce stress', 'Build muscle'];
      case 'healthGoals':
        return ['Sleep, Energy, Stress', 'Fitness, Nutrition', 'Cognitive, Focus', 'Weight, Metabolism'];
      case 'supplements':
        return ['None currently', 'Multivitamin, Fish Oil', 'Protein, Creatine', 'Vitamin D, Magnesium'];
      default:
        return [];
    }
  };

  return (
    <div className="flex h-full flex-col rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] shadow-lg">
      <div className="border-b border-[hsl(var(--color-border))] bg-[hsl(var(--color-card-hover))] p-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <img 
              src="https://leznzqfezoofngumpiqf.supabase.co/storage/v1/object/sign/icons-favicons/stack%20dash%20metalic%20favicon.svg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82ZjcyOGVhMS1jMTdjLTQ2MTYtOWFlYS1mZmI3MmEyM2U5Y2EiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpY29ucy1mYXZpY29ucy9zdGFjayBkYXNoIG1ldGFsaWMgZmF2aWNvbi5zdmciLCJpYXQiOjE3NTAyMjE4NjgsImV4cCI6MTc4MTc1Nzg2OH0.k7wGfiV-4klxCyuBpz_MhVhF0ahuZZqNI-LQh8rLLJA" 
              alt="MyCoach" 
              className="h-5 w-5"
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
            <CheckCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'assistant' && (
              <div className="mr-2 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <img 
                  src="https://leznzqfezoofngumpiqf.supabase.co/storage/v1/object/sign/icons-favicons/stack%20dash%20metalic%20favicon.svg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82ZjcyOGVhMS1jMTdjLTQ2MTYtOWFlYS1mZmI3MmEyM2U5Y2EiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpY29ucy1mYXZpY29ucy9zdGFjayBkYXNoIG1ldGFsaWMgZmF2aWNvbi5zdmciLCJpYXQiOjE3NTAyMjE4NjgsImV4cCI6MTc4MTc1Nzg2OH0.k7wGfiV-4klxCyuBpz_MhVhF0ahuZZqNI-LQh8rLLJA" 
                  alt="MyCoach" 
                  className="h-4 w-4"
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
                {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
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
                src="https://leznzqfezoofngumpiqf.supabase.co/storage/v1/object/sign/icons-favicons/stack%20dash%20metalic%20favicon.svg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82ZjcyOGVhMS1jMTdjLTQ2MTYtOWFlYS1mZmI3MmEyM2U5Y2EiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpY29ucy1mYXZpY29ucy9zdGFjayBkYXNoIG1ldGFsaWMgZmF2aWNvbi5zdmciLCJpYXQiOjE3NTAyMjE4NjgsImV4cCI6MTc4MTc1Nzg2OH0.k7wGfiV-4klxCyuBpz_MhVhF0ahuZZqNI-LQh8rLLJA" 
                alt="MyCoach" 
                className="h-4 w-4"
                loading="lazy"
              />
            </div>
            <div className="max-w-[75%] rounded-lg bg-[hsl(var(--color-card-hover))] p-4">
              <div className="flex space-x-2">
                <div className="h-2 w-2 animate-bounce rounded-full bg-primary"></div>
                <div className="h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: '0.2s' }}></div>
                <div className="h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 'complete' && (
          <div className="mt-6 flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-xl bg-success/10 p-4 text-center text-success"
            >
              <CheckCircle className="mx-auto mb-2 h-8 w-8" />
              <p className="text-center">Profile complete! Redirecting to your dashboard...</p>
            </motion.div>
          </div>
        )}

        {/* Suggested responses */}
        {!loading && currentStep !== 'complete' && (
          <SuggestedQuestions 
            questions={suggestedResponses()} 
            onSelect={(question) => handleSubmit(question)}
          />
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
            aria-label="Your response"
          />
          <button
            type="submit"
            disabled={loading || !input.trim() || currentStep === 'complete'}
            className="flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Send message"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ConversationalOnboarding;