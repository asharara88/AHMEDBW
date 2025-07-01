import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store';
import EnhancedOnboardingForm from '../../components/onboarding/EnhancedOnboardingForm';
import ConversationalOnboarding from '../../components/onboarding/ConversationalOnboarding';
import OnboardingForm from '../../components/onboarding/OnboardingForm';
import StreamlinedOnboarding from '../../components/onboarding/StreamlinedOnboarding';
import { AlertCircle, CheckCircle, MessageSquare, ClipboardList, Layers, Sparkles } from 'lucide-react';
import Logo from '../../components/common/Logo';
import { logError } from '../../utils/logger';
import { onboardingApi, OnboardingFormData } from '../../api/onboardingApi';
import { useUserProfileStore } from '../../store/useUserProfileStore';

const OnboardingPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [onboardingType, setOnboardingType] = useState<'conversational' | 'form' | 'enhanced' | 'streamlined'>('streamlined');
  
  const { user, checkOnboardingStatus, updateProfile } = useAuthStore();
  const { completeOnboarding, loadProfile } = useUserProfileStore();
  const navigate = useNavigate();
  
  // Check if user is logged in and has already completed onboarding
  useEffect(() => {
    const checkUserStatus = async () => {
      if (!user) {
        navigate('/login');
        return;
      }
      
      try {
        // Load user profile for the enhanced onboarding form
        await loadProfile(user.id);
        
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
  }, [user, navigate, checkOnboardingStatus, loadProfile]);
  
  const handleOnboardingComplete = async (formData?: OnboardingFormData) => {
    if (!user) {
      setError('You must be logged in to complete onboarding');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      if (onboardingType === 'enhanced' || onboardingType === 'streamlined') {
        // Enhanced form handles its own completion through the user profile store
        await completeOnboarding({
          onboardingCompleted: true,
          onboardingCompletedAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        });
      } else if (formData) {
        // Legacy form handling
        const completeFormData = {
          ...formData,
          email: user.email || ''
        };
        
        await onboardingApi.completeOnboarding(user, completeFormData);
        
        await updateProfile({
          firstName: completeFormData.firstName,
          lastName: completeFormData.lastName,
          email: completeFormData.email,
          mobile: completeFormData.mobile,
          healthGoals: completeFormData.healthGoals,
          onboardingCompleted: true
        });
      }
      
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
          
          <div className="mt-6 flex justify-center gap-2">
            <button
              type="button"
              onClick={() => setOnboardingType('conversational')}
              className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                onboardingType === 'conversational'
                  ? 'bg-primary text-white' 
                  : 'bg-[hsl(var(--color-card))] text-text-light hover:bg-[hsl(var(--color-card-hover))]'
              }`}
              aria-pressed={onboardingType === 'conversational' ? 'true' : 'false'}
            >
              <MessageSquare className="h-4 w-4" aria-hidden="true" />
              <span>Chat</span>
            </button>
            <button
              type="button"
              onClick={() => setOnboardingType('form')}
              className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                onboardingType === 'form'
                  ? 'bg-primary text-white' 
                  : 'bg-[hsl(var(--color-card))] text-text-light hover:bg-[hsl(var(--color-card-hover))]'
              }`}
              aria-pressed={onboardingType === 'form' ? 'true' : 'false'}
            >
              <ClipboardList className="h-4 w-4" aria-hidden="true" />
              <span>Form</span>
            </button>
            <button
              type="button"
              onClick={() => setOnboardingType('enhanced')}
              className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                onboardingType === 'enhanced'
                  ? 'bg-primary text-white' 
                  : 'bg-[hsl(var(--color-card))] text-text-light hover:bg-[hsl(var(--color-card-hover))]'
              }`}
              aria-pressed={onboardingType === 'enhanced' ? 'true' : 'false'}
            >
              <Layers className="h-4 w-4" aria-hidden="true" />
              <span>Guided</span>
            </button>
            <button
              type="button"
              onClick={() => setOnboardingType('streamlined')}
              className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                onboardingType === 'streamlined'
                  ? 'bg-primary text-white' 
                  : 'bg-[hsl(var(--color-card))] text-text-light hover:bg-[hsl(var(--color-card-hover))]'
              }`}
              aria-pressed={onboardingType === 'streamlined' ? 'true' : 'false'}
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              <span>Simple</span>
            </button>
          </div>
        </div>
        
        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-lg bg-error/10 p-3 text-sm text-error" role="alert">
            <AlertCircle className="h-5 w-5" aria-hidden="true" />
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
              <CheckCircle className="h-8 w-8 text-success" aria-hidden="true" />
            </div>
            <h2 className="mb-2 text-xl font-bold">Profile Complete!</h2>
            <p className="mb-4 text-text-light">
              Your profile has been successfully set up. Redirecting you to your dashboard...
            </p>
            <div className="h-1 w-full overflow-hidden rounded-full bg-[hsl(var(--color-surface-1))]" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={100}>
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
            {onboardingType === 'conversational' ? (
              <div className="h-[600px]">
                <ConversationalOnboarding onComplete={handleOnboardingComplete} />
              </div>
            ) : onboardingType === 'enhanced' ? (
              <div className="p-8">
                <EnhancedOnboardingForm onComplete={handleOnboardingComplete} isLoading={loading} />
              </div>
            ) : onboardingType === 'streamlined' ? (
              <StreamlinedOnboarding onComplete={handleOnboardingComplete} />
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