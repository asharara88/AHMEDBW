import { supabase } from '../lib/supabaseClient';
import { logError, logInfo } from '../utils/logger';
import { User } from '@supabase/supabase-js';

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

export const onboardingApi = {
  /**
   * Save profile data to the profiles table
   */
  async saveProfile(user: User, data: OnboardingFormData): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email || data.email || '',
        first_name: data.firstName,
        last_name: data.lastName,
        mobile: data.mobile,
        onboarding_completed: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (error) {
      logError('Error saving profile', error);
      throw error;
    }
    
    logInfo('Profile saved successfully');
  },

  /**
   * Save quiz responses to the quiz_responses table
   */
  async saveQuizResponses(user: User, data: OnboardingFormData): Promise<void> {
    try {
      if (data.healthGoals?.length || data.age || data.gender) {
        const { error } = await supabase
          .from('quiz_responses')
          .upsert({
            user_id: user.id,
            age: data.age ?? null,
            gender: data.gender ?? null,
            health_goals: data.healthGoals ?? [],
            sleep_hours: data.sleepHours ?? null,
            exercise_frequency: data.exerciseFrequency ?? null,
            diet_preference: data.dietPreference ?? null,
            stress_level: data.stressLevel ?? null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        
        if (error) {
          logError('Error saving quiz responses', error);
          throw error;
        }
        
        logInfo('Quiz responses saved successfully');
      }
    } catch (err) {
      logError('Error saving quiz responses', err);
      // Don't rethrow - allow this to fail without blocking the main flow
    }
  },

  /**
   * Update user metadata in Supabase Auth
   */
  async updateUserMetadata(user: User, data: OnboardingFormData): Promise<void> {
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          onboarding_completed: true,
          first_name: data.firstName,
          last_name: data.lastName,
          mobile: data.mobile,
          age: data.age,
          gender: data.gender,
          health_goals: data.healthGoals,
          main_goal: data.mainGoal
        }
      });
      
      if (error) {
        logError('Error updating user metadata', error);
        throw error;
      }
      
      logInfo('User metadata updated successfully');
    } catch (err) {
      logError('Error updating user metadata', err);
      // Don't rethrow - allow this to fail without blocking the main flow
    }
  },

  /**
   * Complete the entire onboarding process with Promise.allSettled
   */
  async completeOnboarding(user: User, data: OnboardingFormData): Promise<void> {
    // Ensure email is included
    const completeData = {
      ...data,
      email: user.email || data.email || ''
    };
    
    // Use Promise.allSettled to allow failures in quiz/meta without blocking main onboarding
    const results = await Promise.allSettled([
      this.saveProfile(user, completeData),
      this.saveQuizResponses(user, completeData),
      this.updateUserMetadata(user, completeData)
    ]);
    
    // Check for errors in the main profile update (first promise)
    if (results[0].status === 'rejected') {
      logError('Failed to save profile', results[0].reason);
      throw results[0].reason;
    }
    
    // Log any other failures but don't block completion
    if (results[1].status === 'rejected') {
      logError('Failed to save quiz responses', results[1].reason);
    }
    
    if (results[2].status === 'rejected') {
      logError('Failed to update user metadata', results[2].reason);
    }
    
    // Save to localStorage for future use
    localStorage.setItem('biowell-user-data', JSON.stringify({
      firstName: completeData.firstName,
      lastName: completeData.lastName,
      email: completeData.email,
      mobile: completeData.mobile,
      age: completeData.age,
      gender: completeData.gender,
      healthGoals: completeData.healthGoals,
      sleepHours: completeData.sleepHours,
      exerciseFrequency: completeData.exerciseFrequency,
      dietPreference: completeData.dietPreference,
      stressLevel: completeData.stressLevel,
      mainGoal: completeData.mainGoal,
      supplementHabits: completeData.supplementHabits,
      onboardingCompleted: true
    }));
    
    logInfo('Onboarding completed successfully');
  }
};