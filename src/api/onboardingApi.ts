import { supabase } from '../lib/supabaseClient';
import { logError } from '../utils/logger';
import { User } from '@supabase/supabase-js';

export interface OnboardingFormData {
  firstName: string;
  lastName: string;
  mobile?: string;
  age?: number;
  gender?: string;
  healthGoals?: string[];
  sleepHours?: number;
  exerciseFrequency?: string;
  dietPreference?: string;
  stressLevel?: string;
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
        email: user.email,
        first_name: data.firstName,
        last_name: data.lastName,
        mobile: data.mobile,
        onboarding_completed: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
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
        
        if (error) throw error;
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
          gender: data.gender
        }
      });
      
      if (error) throw error;
    } catch (err) {
      logError('Error updating user metadata', err);
      // Don't rethrow - allow this to fail without blocking the main flow
    }
  },

  /**
   * Complete the entire onboarding process with Promise.allSettled
   */
  async completeOnboarding(user: User, data: OnboardingFormData): Promise<void> {
    // Use Promise.allSettled to allow failures in quiz/meta without blocking main onboarding
    const results = await Promise.allSettled([
      this.saveProfile(user, data),
      this.saveQuizResponses(user, data),
      this.updateUserMetadata(user, data)
    ]);
    
    // Check for errors in the main profile update (first promise)
    if (results[0].status === 'rejected') {
      throw results[0].reason;
    }
    
    // Save to localStorage for future use
    localStorage.setItem('biowell-user-data', JSON.stringify({
      firstName: data.firstName,
      lastName: data.lastName,
      email: user.email,
      mobile: data.mobile,
      age: data.age,
      gender: data.gender,
      healthGoals: data.healthGoals,
      sleepHours: data.sleepHours,
      exerciseFrequency: data.exerciseFrequency,
      dietPreference: data.dietPreference,
      stressLevel: data.stressLevel,
      onboardingCompleted: true
    }));
  }
};