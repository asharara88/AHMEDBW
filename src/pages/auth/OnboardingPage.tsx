import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSupabase } from '../../contexts/SupabaseContext';
import { useAuthStore } from '../../store';
import OnboardingForm from '../../components/auth/OnboardingForm';
import ConversationalOnboarding from '../../components/onboarding/ConversationalOnboarding';
import { AlertCircle, CheckCircle } from 'lucide-react';
import Logo from '../../components/common/Logo';

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
        console.error('Error checking onboarding status:', err);
        setError('Error checking onboarding status. Please try again.');
      }
    };
    
    checkUserStatus();
  }, [user, navigate, checkOnboardingStatus]);
  
  const handleOnboardingComplete = async (formData: any) => {
    if (!user) {
      setError('You must be logged in to complete onboarding');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // First check if profile exists
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();
      
      if (profileError && !profileError.message.includes('contains 0 rows')) {
        throw profileError;
      }
      
      // Update the profile with onboarding data
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          first_name: formData.firstName,
          last_name: formData.lastName,
          mobile: formData.mobile,
          onboarding_completed: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (updateError) throw updateError;
      
      // Save quiz responses if applicable
      if (formData.healthGoals?.length > 0 || formData.age || formData.gender) {
        const { error: quizError } = await supabase
          .from('quiz_responses')
          .insert({
            user_id: user.id,
            age: formData.age || null,
            gender: formData.gender || null,
            health_goals: formData.healthGoals || [],
            sleep_hours: formData.sleepHours || null,
            exercise_frequency: formData.exerciseFrequency || null,
            diet_preference: formData.dietPreference || null,
            stress_level: formData.stressLevel || null
          });
        
        if (quizError) {
          console.error('Error saving quiz responses:', quizError);
          // Continue even if quiz responses fail
        }
      }
      
      // Update user metadata
      const { error: metadataError } = await supabase.auth.updateUser({
        data: { 
          onboarding_completed: true,
          first_name: formData.firstName,
          last_name: formData.lastName,
          mobile: formData.mobile,
          age: formData.age,
          gender: formData.gender
        }
      });
      
      if (metadataError) {
        console.error('Error updating user metadata:', metadataError);
        // Continue even if metadata update fails
      }
      
      // Update auth context with profile data
      await updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: user.email || '',
        mobile: formData.mobile,
        healthGoals: formData.healthGoals,
        onboardingCompleted: true
      });
      
      // Save user data to localStorage for persistence
      localStorage.setItem('biowell-user-data', JSON.stringify({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: user.email,
        mobile: formData.mobile,
        age: formData.age,
        gender: formData.gender,
        healthGoals: formData.healthGoals,
        sleepHours: formData.sleepHours,
        exerciseFrequency: formData.exerciseFrequency,
        dietPreference: formData.dietPreference,
        stressLevel: formData.stressLevel,
        onboardingCompleted: true
      }));
      
      setSuccess(true);
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err: any) {
      console.error('Error completing onboarding:', err);
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
          
          <div className="mt-4 flex justify-center gap-4">
            <button
              onClick={() => setUseConversational(true)}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                useConversational 
                  ? 'bg-primary text-white' 
                  : 'bg-[hsl(var(--color-card))] text-text-light hover:bg-[hsl(var(--color-card-hover))]'
              }`}
            >
              Chat Style
            </button>
            <button
              onClick={() => setUseConversational(false)}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                !useConversational 
                  ? 'bg-primary text-white' 
                  : 'bg-[hsl(var(--color-card))] text-text-light hover:bg-[hsl(var(--color-card-hover))]'
              }`}
            >
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
          </motion.div>
        ) : (
          <div className="rounded-xl bg-[hsl(var(--color-card))] shadow-lg dark:shadow-lg dark:shadow-black/10">
            {useConversational ? (
              <div className="h-[600px]">
                <ConversationalOnboarding />
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