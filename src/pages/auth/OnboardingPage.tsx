import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSupabase } from '../../contexts/SupabaseContext';
import { useAuthStore } from '../../store';
import OnboardingForm from '../../components/onboarding/OnboardingForm';
import ConversationalOnboarding from '../../components/onboarding/ConversationalOnboarding';
import { AlertCircle, CheckCircle, MessageSquare, ClipboardList } from 'lucide-react';
import Logo from '../../components/common/Logo';
import { logError } from '../../utils/logger';
import { onboardingApi, OnboardingFormData } from '../../api/onboardingApi';

const OnboardingPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [useConversational, setUseConversational] = useState(true);
  
  const { supabase } = useSupabase();
  const { user, checkOnboardingStatus, updateProfile } = useAuthStore();
  const navigate = useNavigate();
  
  // Check if user is logged in and has already completed onboarding
  useEffect(() => {
    const checkUserStatus = async () => {
      if (!user) {
        navigate('/login');
        return;
      }
      
      try {
        const onboardingCompleted = await checkOnboardingStatus();
        if (onboardingCompleted) {
          navigate('/dashboard');
        }
      } catch (err) {
        logError('Error checking onboarding status', err);
        setError('Error checking onboarding status. Please try again.');
      }
    };
    
    checkUserStatus();
  }, [user, navigate, checkOnboardingStatus]);
  
  const handleOnboardingComplete = async (formData: OnboardingFormData) => {
    if (!user) {
      setError('You must be logged in to complete onboarding');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Ensure email is included
      const completeFormData = {
        ...formData,
        email: user.email || ''
      };
      
      // Use the onboardingApi to handle all the steps
      await onboardingApi.completeOnboarding(user, completeFormData);
      
      // Update auth context with profile data
      await updateProfile({
        firstName: completeFormData.firstName,
        lastName: completeFormData.lastName,
        email: completeFormData.email,
        mobile: completeFormData.mobile,
        healthGoals: completeFormData.healthGoals,
        onboardingCompleted: true
      });
      
      setSuccess(true);
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err: any) {
      logError('Error completing onboarding', err);
      setError(err.message || 'An error occurred during onboarding');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-background-alt px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex justify-center">
            <Logo className="h-8" />
          </div>
          <h1 className="text-2xl font-bold text-text">Complete Your Profile</h1>
          <p className="mt-2 text-text-light">
            Let's personalize your health journey
          </p>
          
          <div className="mt-6 flex justify-center gap-4">
            <button
              onClick={() => setUseConversational(true)}
              className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${
                useConversational 
                  ? 'bg-primary text-white' 
                  : 'bg-[hsl(var(--color-card))] text-text-light hover:bg-[hsl(var(--color-card-hover))]'
              }`}
              aria-pressed={useConversational}
            >
              <MessageSquare className="h-4 w-4" />
              Chat Style
            </button>
            <button
              onClick={() => setUseConversational(false)}
              className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${
                !useConversational 
                  ? 'bg-primary text-white' 
                  : 'bg-[hsl(var(--color-card))] text-text-light hover:bg-[hsl(var(--color-card-hover))]'
              }`}
              aria-pressed={!useConversational}
            >
              <ClipboardList className="h-4 w-4" />
              Form Style
            </button>
          </div>
        </div>
        
        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-lg bg-error/10 p-3 text-sm text-error">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}
        
        {success ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl bg-[hsl(var(--color-card))] p-8 text-center shadow-lg dark:shadow-lg dark:shadow-black/10"
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
            <h2 className="mb-2 text-xl font-bold">Profile Complete!</h2>
            <p className="mb-4 text-text-light">
              Your profile has been successfully set up. Redirecting you to your dashboard...
            </p>
            <div className="h-1 w-full overflow-hidden rounded-full bg-[hsl(var(--color-surface-1))]">
              <motion.div 
                className="h-full bg-success"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 2 }}
              />
            </div>
          </motion.div>
        ) : (
          <div className="rounded-xl bg-[hsl(var(--color-card))] shadow-lg dark:shadow-lg dark:shadow-black/10">
            {useConversational ? (
              <div className="h-[600px]">
                <ConversationalOnboarding onComplete={handleOnboardingComplete} />
              </div>
            ) : (
              <div className="p-8">
                <OnboardingForm onComplete={handleOnboardingComplete} isLoading={loading} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingPage;