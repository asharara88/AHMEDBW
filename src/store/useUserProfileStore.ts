import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabaseClient';
import { cedOnboardingApi } from '../api/enhancedOnboardingApi';
import { logError, logInfo } from '../utils/logger';
// Enhanced user profile interface
export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  mobile?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';
  profilePictureUrl?: string;
  
  // Health & Demographics
  age?: number;
  height?: { value: number; unit: 'cm' | 'ft' };
  weight?: { value: number; unit: 'kg' | 'lbs' };
  activityLevel?: 'sedentary' | 'lightly-active' | 'moderately-active' | 'very-active' | 'extremely-active';
  
  // Health Goals & Preferences
  primaryHealthGoals: string[];
  secondaryHealthGoals?: string[];
  healthConcerns?: string[];
  fitnessGoals?: string[];
  
  // Lifestyle Information
  sleepHours?: number;
  bedTime?: string;
  wakeTime?: string;
  sleepQuality?: 'poor' | 'fair' | 'good' | 'excellent';
  
  // Exercise & Diet
  exerciseFrequency?: 'never' | 'rarely' | '1-2-times' | '3-4-times' | '5-6-times' | 'daily';
  exerciseTypes?: string[];
  dietPreference?: 'omnivore' | 'vegetarian' | 'vegan' | 'pescatarian' | 'keto' | 'paleo' | 'mediterranean' | 'other';
  dietaryRestrictions?: string[];
  allergies?: string[];
  
  // Mental Health & Stress
  stressLevel?: number; // 1-10 scale
  stressTriggers?: string[];
  mentalHealthGoals?: string[];
  meditationExperience?: 'none' | 'beginner' | 'intermediate' | 'advanced';
  
  // Supplement & Medical History
  currentSupplements?: string[];
  medicationList?: string[];
  medicalConditions?: string[];
  doctorConsultation?: boolean;
  
  // Preferences & Settings
  communicationPreferences?: {
    email: boolean;
    push: boolean;
    sms: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
  };
  privacySettings?: {
    shareAnonymousData: boolean;
    allowMarketing: boolean;
  };
  
  // Timestamps
  onboardingCompleted: boolean;
  onboardingCompletedAt?: string;
  lastUpdated: string;
  createdAt: string;
}

// Onboarding progress tracking
export interface OnboardingProgress {
  currentStep: number;
  completedSteps: number[];
  totalSteps: number;
  stepProgress: Record<number, number>; // Progress percentage for each step
}

interface UserProfileState {
  profile: UserProfile | null;
  onboardingProgress: OnboardingProgress;
  loading: boolean;
  saving: boolean;
  error: string | null;
  
  // Profile Actions
  loadProfile: (userId: string) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  completeOnboarding: (profileData: Partial<UserProfile>) => Promise<void>;
  
  // Onboarding Progress Actions
  setOnboardingStep: (step: number) => void;
  markStepCompleted: (step: number) => void;
  updateStepProgress: (step: number, progress: number) => void;
  resetOnboarding: () => void;
  
  // Utility Actions
  clearError: () => void;
  validateProfile: () => { isValid: boolean; missingFields: string[] };
}

const defaultOnboardingProgress: OnboardingProgress = {
  currentStep: 1,
  completedSteps: [],
  totalSteps: 6,
  stepProgress: {}
};

export const useUserProfileStore = create<UserProfileState>()(
  persist(
    (set, get) => ({
      profile: null,
      onboardingProgress: defaultOnboardingProgress,
      loading: false,
      saving: false,
      error: null,

      loadProfile: async (userId: string) => {
        set({ loading: true, error: null });
        
        try {
          const profile = await cedOnboardingApi.loadUserProfile(userId);
          
          if (profile) {
            set({ 
              profile,
              onboardingProgress: {
                ...defaultOnboardingProgress,
                currentStep: profile.onboardingCompleted ? 8 : 1,
                completedSteps: profile.onboardingCompleted ? [1, 2, 3, 4, 5, 6, 7, 8] : []
              }
            });
          }
          
          logInfo('Profile loaded successfully');
        } catch (error) {
          logError('Error loading profile:', error);
          set({ error: 'Failed to load profile' });
        } finally {
          set({ loading: false });
        }
      },

      updateProfile: async (updates: Partial<UserProfile>) => {
        const { profile } = get();
        if (!profile) {
          set({ error: 'No profile loaded' });
          return;
        }

        set({ saving: true, error: null });

        try {
          const updatedProfile = { ...profile, ...updates, lastUpdated: new Date().toISOString() };

          // Update profiles table
          const profileUpdates = {
            email: updatedProfile.email,
            first_name: updatedProfile.firstName,
            last_name: updatedProfile.lastName,
            mobile: updatedProfile.mobile,
            date_of_birth: updatedProfile.dateOfBirth,
            gender: updatedProfile.gender,
            profile_picture_url: updatedProfile.profilePictureUrl,
            communication_preferences: updatedProfile.communicationPreferences,
            privacy_settings: updatedProfile.privacySettings,
            onboarding_completed: updatedProfile.onboardingCompleted,
            onboarding_completed_at: updatedProfile.onboardingCompletedAt,
            updated_at: updatedProfile.lastUpdated
          };

          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({ id: profile.id, ...profileUpdates });

          if (profileError) throw profileError;

          // Update quiz_responses table
          const quizUpdates = {
            user_id: profile.id,
            age: updatedProfile.age,
            height: updatedProfile.height,
            weight: updatedProfile.weight,
            activity_level: updatedProfile.activityLevel,
            health_goals: updatedProfile.primaryHealthGoals,
            secondary_health_goals: updatedProfile.secondaryHealthGoals,
            health_concerns: updatedProfile.healthConcerns,
            fitness_goals: updatedProfile.fitnessGoals,
            sleep_hours: updatedProfile.sleepHours,
            bed_time: updatedProfile.bedTime,
            wake_time: updatedProfile.wakeTime,
            sleep_quality: updatedProfile.sleepQuality,
            exercise_frequency: updatedProfile.exerciseFrequency,
            exercise_types: updatedProfile.exerciseTypes,
            diet_preference: updatedProfile.dietPreference,
            dietary_restrictions: updatedProfile.dietaryRestrictions,
            allergies: updatedProfile.allergies,
            stress_level: updatedProfile.stressLevel,
            stress_triggers: updatedProfile.stressTriggers,
            mental_health_goals: updatedProfile.mentalHealthGoals,
            meditation_experience: updatedProfile.meditationExperience,
            current_supplements: updatedProfile.currentSupplements,
            medication_list: updatedProfile.medicationList,
            medical_conditions: updatedProfile.medicalConditions,
            doctor_consultation: updatedProfile.doctorConsultation,
            updated_at: updatedProfile.lastUpdated
          };

          const { error: quizError } = await supabase
            .from('quiz_responses')
            .upsert(quizUpdates);

          if (quizError) {
            logError('Error updating quiz responses', quizError);
            // Don't fail the entire operation for quiz update errors
          }

          set({ profile: updatedProfile, saving: false });
          logInfo('Profile updated successfully');

        } catch (error) {
          logError('Error updating profile', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update profile',
            saving: false 
          });
        }
      },

      completeOnboarding: async (profileData: Partial<UserProfile>) => {
        const { profile } = get();
        if (!profile) {
          set({ error: 'No profile loaded' });
          return;
        }

        set({ saving: true, error: null });

        try {
          // Get current user from Supabase auth
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            throw new Error('User not authenticated');
          }

          const completedProfile = {
            ...profile,
            ...profileData,
            onboardingCompleted: true,
            onboardingCompletedAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
          };

          // Use enhanced API to complete onboarding
          await cedOnboardingApi.completecedOnboarding(user, completedProfile);

          // Update local state
          set({ 
            profile: completedProfile,
            onboardingProgress: { 
              ...defaultOnboardingProgress, 
              completedSteps: Array.from({ length: defaultOnboardingProgress.totalSteps }, (_, i) => i + 1),
              currentStep: defaultOnboardingProgress.totalSteps
            },
            saving: false 
          });

          logInfo('Onboarding completed successfully');

        } catch (error) {
          logError('Error completing onboarding', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to complete onboarding',
            saving: false 
          });
        }
      },

      setOnboardingStep: (step: number) => {
        set((state) => ({
          onboardingProgress: { ...state.onboardingProgress, currentStep: step }
        }));
      },

      markStepCompleted: (step: number) => {
        set((state) => ({
          onboardingProgress: {
            ...state.onboardingProgress,
            completedSteps: [...new Set([...state.onboardingProgress.completedSteps, step])],
            stepProgress: { ...state.onboardingProgress.stepProgress, [step]: 100 }
          }
        }));
      },

      updateStepProgress: (step: number, progress: number) => {
        set((state) => ({
          onboardingProgress: {
            ...state.onboardingProgress,
            stepProgress: { ...state.onboardingProgress.stepProgress, [step]: progress }
          }
        }));
      },

      resetOnboarding: () => {
        set({ onboardingProgress: defaultOnboardingProgress });
      },

      clearError: () => {
        set({ error: null });
      },

      validateProfile: () => {
        const { profile } = get();
        if (!profile) return { isValid: false, missingFields: ['profile'] };

        const requiredFields = ['firstName', 'lastName', 'email'];
        const missingFields = requiredFields.filter(field => !profile[field as keyof UserProfile]);

        return {
          isValid: missingFields.length === 0,
          missingFields
        };
      }
    }),
    {
      name: 'biowell-user-profile',
      partialize: (state) => ({
        profile: state.profile,
        onboardingProgress: state.onboardingProgress
      })
    }
  )
);
