import { supabase } from '../lib/supabaseClient';
import { logError, logInfo } from '../utils/logger';
import { User } from '@supabase/supabase-js';
import { UserProfile } from '../store/useUserProfileStore';

export interface OnboardingFormData {
  firstName: string;
  lastName: string;
  email?: string;
  mobile?: string;
  age?: number | string;
  gender?: string;
  healthGoals?: string[];
  sleepHours?: number | string;
  exerciseFrequency?: string;
  dietPreference?: string;
  stressLevel?: string;
  mainGoal?: string;
  supplementHabits?: string[];
}

export const enhancedOnboardingApi = {
  /**
   * Save comprehensive profile data to the profiles table
   */
  async saveEnhancedProfile(user: User, profileData: Partial<UserProfile>): Promise<void> {
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email || profileData.email || '',
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          mobile: profileData.mobile,
          date_of_birth: profileData.dateOfBirth,
          gender: profileData.gender,
          profile_picture_url: profileData.profilePictureUrl,
          age: profileData.age,
          // Store complex data as JSON
          height: profileData.height ? JSON.stringify(profileData.height) : null,
          weight: profileData.weight ? JSON.stringify(profileData.weight) : null,
          activity_level: profileData.activityLevel,
          primary_health_goals: profileData.primaryHealthGoals || [],
          secondary_health_goals: profileData.secondaryHealthGoals || [],
          health_concerns: profileData.healthConcerns || [],
          fitness_goals: profileData.fitnessGoals || [],
          sleep_hours: profileData.sleepHours,
          bed_time: profileData.bedTime,
          wake_time: profileData.wakeTime,
          sleep_quality: profileData.sleepQuality,
          exercise_frequency: profileData.exerciseFrequency,
          exercise_types: profileData.exerciseTypes || [],
          diet_preference: profileData.dietPreference,
          dietary_restrictions: profileData.dietaryRestrictions || [],
          allergies: profileData.allergies || [],
          stress_level: profileData.stressLevel,
          stress_triggers: profileData.stressTriggers || [],
          mental_health_goals: profileData.mentalHealthGoals || [],
          meditation_experience: profileData.meditationExperience,
          current_supplements: profileData.currentSupplements || [],
          medication_list: profileData.medicationList || [],
          medical_conditions: profileData.medicalConditions || [],
          doctor_consultation: profileData.doctorConsultation,
          communication_preferences: profileData.communicationPreferences ? 
            JSON.stringify(profileData.communicationPreferences) : null,
          privacy_settings: profileData.privacySettings ? 
            JSON.stringify(profileData.privacySettings) : null,
          onboarding_completed: profileData.onboardingCompleted || false,
          onboarding_completed_at: profileData.onboardingCompleted ? 
            new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        });

      if (error) {
        logError('Error saving enhanced profile', error);
        throw error;
      }
      
      logInfo('Enhanced profile saved successfully');
    } catch (err) {
      logError('Error in saveEnhancedProfile', err);
      throw err;
    }
  },

  /**
   * Save enhanced quiz responses with more detailed data
   */
  async saveEnhancedQuizResponses(user: User, profileData: Partial<UserProfile>): Promise<void> {
    try {
      const { error } = await supabase
        .from('quiz_responses')
        .upsert({
          user_id: user.id,
          age: profileData.age,
          gender: profileData.gender,
          health_goals: profileData.primaryHealthGoals || [],
          secondary_health_goals: profileData.secondaryHealthGoals || [],
          health_concerns: profileData.healthConcerns || [],
          fitness_goals: profileData.fitnessGoals || [],
          sleep_hours: profileData.sleepHours,
          sleep_quality: profileData.sleepQuality,
          exercise_frequency: profileData.exerciseFrequency,
          exercise_types: profileData.exerciseTypes || [],
          diet_preference: profileData.dietPreference,
          dietary_restrictions: profileData.dietaryRestrictions || [],
          allergies: profileData.allergies || [],
          stress_level: profileData.stressLevel,
          stress_triggers: profileData.stressTriggers || [],
          mental_health_goals: profileData.mentalHealthGoals || [],
          meditation_experience: profileData.meditationExperience,
          current_supplements: profileData.currentSupplements || [],
          medication_list: profileData.medicationList || [],
          medical_conditions: profileData.medicalConditions || [],
          doctor_consultation: profileData.doctorConsultation,
          height: profileData.height ? JSON.stringify(profileData.height) : null,
          weight: profileData.weight ? JSON.stringify(profileData.weight) : null,
          activity_level: profileData.activityLevel,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (error) {
        logError('Error saving enhanced quiz responses', error);
        throw error;
      }
      
      logInfo('Enhanced quiz responses saved successfully');
    } catch (err) {
      logError('Error saving enhanced quiz responses', err);
      // Don't rethrow - allow this to fail without blocking the main flow
    }
  },

  /**
   * Update user metadata in Supabase Auth with enhanced data
   */
  async updateEnhancedUserMetadata(_user: User, profileData: Partial<UserProfile>): Promise<void> {
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          onboarding_completed: profileData.onboardingCompleted || false,
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          mobile: profileData.mobile,
          age: profileData.age,
          gender: profileData.gender,
          health_goals: profileData.primaryHealthGoals,
          fitness_goals: profileData.fitnessGoals,
          diet_preference: profileData.dietPreference,
          activity_level: profileData.activityLevel,
          sleep_hours: profileData.sleepHours,
          stress_level: profileData.stressLevel,
          onboarding_completed_at: profileData.onboardingCompleted ? 
            new Date().toISOString() : null
        }
      });
      
      if (error) {
        logError('Error updating enhanced user metadata', error);
        throw error;
      }
      
      logInfo('Enhanced user metadata updated successfully');
    } catch (err) {
      logError('Error updating enhanced user metadata', err);
      // Don't rethrow - allow this to fail without blocking the main flow
    }
  },

  /**
   * Load user profile data from database
   */
  async loadUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        logError('Error loading user profile', error);
        throw error;
      }

      if (!data) return null;

      // Transform database data to UserProfile format
      const profile: UserProfile = {
        id: data.id,
        email: data.email,
        firstName: data.first_name || '',
        lastName: data.last_name || '',
        mobile: data.mobile,
        dateOfBirth: data.date_of_birth,
        gender: data.gender,
        profilePictureUrl: data.profile_picture_url,
        age: data.age,
        height: data.height ? JSON.parse(data.height) : undefined,
        weight: data.weight ? JSON.parse(data.weight) : undefined,
        activityLevel: data.activity_level,
        primaryHealthGoals: data.primary_health_goals || [],
        secondaryHealthGoals: data.secondary_health_goals || [],
        healthConcerns: data.health_concerns || [],
        fitnessGoals: data.fitness_goals || [],
        sleepHours: data.sleep_hours,
        bedTime: data.bed_time,
        wakeTime: data.wake_time,
        sleepQuality: data.sleep_quality,
        exerciseFrequency: data.exercise_frequency,
        exerciseTypes: data.exercise_types || [],
        dietPreference: data.diet_preference,
        dietaryRestrictions: data.dietary_restrictions || [],
        allergies: data.allergies || [],
        stressLevel: data.stress_level,
        stressTriggers: data.stress_triggers || [],
        mentalHealthGoals: data.mental_health_goals || [],
        meditationExperience: data.meditation_experience,
        currentSupplements: data.current_supplements || [],
        medicationList: data.medication_list || [],
        medicalConditions: data.medical_conditions || [],
        doctorConsultation: data.doctor_consultation,
        communicationPreferences: data.communication_preferences ? 
          JSON.parse(data.communication_preferences) : undefined,
        privacySettings: data.privacy_settings ? 
          JSON.parse(data.privacy_settings) : undefined,
        onboardingCompleted: data.onboarding_completed || false,
        onboardingCompletedAt: data.onboarding_completed_at,
        lastUpdated: data.updated_at,
        createdAt: data.created_at
      };

      return profile;
    } catch (err) {
      logError('Error in loadUserProfile', err);
      throw err;
    }
  },

  /**
   * Complete the entire enhanced onboarding process
   */
  async completeEnhancedOnboarding(user: User, profileData: Partial<UserProfile>): Promise<void> {
    // Ensure required fields are present
    const completeData: Partial<UserProfile> = {
      ...profileData,
      email: user.email || profileData.email || '',
      onboardingCompleted: true,
      onboardingCompletedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
    
    // Use Promise.allSettled to allow failures in quiz/meta without blocking main onboarding
    const results = await Promise.allSettled([
      this.saveEnhancedProfile(user, completeData),
      this.saveEnhancedQuizResponses(user, completeData),
      this.updateEnhancedUserMetadata(user, completeData)
    ]);
    
    // Check for errors in the main profile update (first promise)
    if (results[0].status === 'rejected') {
      logError('Failed to save enhanced profile', results[0].reason);
      throw results[0].reason;
    }
    
    // Log any other failures but don't block completion
    if (results[1].status === 'rejected') {
      logError('Failed to save enhanced quiz responses', results[1].reason);
    }
    
    if (results[2].status === 'rejected') {
      logError('Failed to update enhanced user metadata', results[2].reason);
    }
    
    // Save to localStorage for future use
    localStorage.setItem('biowell-enhanced-user-profile', JSON.stringify(completeData));
    
    logInfo('Enhanced onboarding completed successfully');
  }
};

// Maintain backward compatibility
export const onboardingApi = {
  async saveProfile(user: User, data: OnboardingFormData): Promise<void> {
    const profileData: Partial<UserProfile> = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      mobile: data.mobile,
      age: typeof data.age === 'string' ? parseInt(data.age) : data.age,
      gender: data.gender as any,
      primaryHealthGoals: data.healthGoals || [],
      sleepHours: typeof data.sleepHours === 'string' ? parseFloat(data.sleepHours) : data.sleepHours,
      exerciseFrequency: data.exerciseFrequency as any,
      dietPreference: data.dietPreference as any,
      stressLevel: data.stressLevel ? parseInt(data.stressLevel) : undefined,
      currentSupplements: data.supplementHabits || []
    };
    
    return enhancedOnboardingApi.saveEnhancedProfile(user, profileData);
  },

  async saveQuizResponses(user: User, data: OnboardingFormData): Promise<void> {
    const profileData: Partial<UserProfile> = {
      age: typeof data.age === 'string' ? parseInt(data.age) : data.age,
      gender: data.gender as any,
      primaryHealthGoals: data.healthGoals || [],
      sleepHours: typeof data.sleepHours === 'string' ? parseFloat(data.sleepHours) : data.sleepHours,
      exerciseFrequency: data.exerciseFrequency as any,
      dietPreference: data.dietPreference as any,
      stressLevel: data.stressLevel ? parseInt(data.stressLevel) : undefined,
      currentSupplements: data.supplementHabits || []
    };
    
    return enhancedOnboardingApi.saveEnhancedQuizResponses(user, profileData);
  },

  async updateUserMetadata(user: User, data: OnboardingFormData): Promise<void> {
    const profileData: Partial<UserProfile> = {
      firstName: data.firstName,
      lastName: data.lastName,
      mobile: data.mobile,
      age: typeof data.age === 'string' ? parseInt(data.age) : data.age,
      gender: data.gender as any,
      primaryHealthGoals: data.healthGoals || []
    };
    
    return enhancedOnboardingApi.updateEnhancedUserMetadata(user, profileData);
  },

  async completeOnboarding(user: User, data: OnboardingFormData): Promise<void> {
    const profileData: Partial<UserProfile> = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      mobile: data.mobile,
      age: typeof data.age === 'string' ? parseInt(data.age) : data.age,
      gender: data.gender as any,
      primaryHealthGoals: data.healthGoals || [],
      sleepHours: typeof data.sleepHours === 'string' ? parseFloat(data.sleepHours) : data.sleepHours,
      exerciseFrequency: data.exerciseFrequency as any,
      dietPreference: data.dietPreference as any,
      stressLevel: data.stressLevel ? parseInt(data.stressLevel) : undefined,
      currentSupplements: data.supplementHabits || []
    };
    
    return enhancedOnboardingApi.completeEnhancedOnboarding(user, profileData);
  }
};