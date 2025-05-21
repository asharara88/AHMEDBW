import { apiClient } from './apiClient';
import { supabase } from '../lib/supabaseClient';

export interface QuizResponse {
  age?: number | null;
  gender?: string | null;
  health_goals?: string[] | null;
  sleep_hours?: number | null;
  exercise_frequency?: string | null;
  diet_preference?: string | null;
  stress_level?: string | null;
}

export const userApi = {
  /**
   * Save quiz responses
   */
  async saveQuizResponses(userId: string, responses: QuizResponse): Promise<void> {
    await apiClient.request(
      () => supabase
        .from('quiz_responses')
        .upsert({
          user_id: userId,
          ...responses,
          updated_at: new Date().toISOString()
        }),
      'Failed to save quiz responses'
    );
  },

  /**
   * Get quiz responses
   */
  async getQuizResponses(userId: string): Promise<QuizResponse | null> {
    return apiClient.request(
      () => supabase
        .from('quiz_responses')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle(),
      'Failed to fetch quiz responses'
    );
  },

  /**
   * Connect a wearable device
   */
  async connectWearable(userId: string, provider: string, accessToken: string, refreshToken?: string): Promise<void> {
    await apiClient.request(
      () => supabase
        .from('wearable_connections')
        .upsert({
          user_id: userId,
          provider,
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
        }),
      'Failed to connect wearable device'
    );
  },

  /**
   * Disconnect a wearable device
   */
  async disconnectWearable(userId: string, provider: string): Promise<void> {
    await apiClient.request(
      () => supabase
        .from('wearable_connections')
        .delete()
        .eq('user_id', userId)
        .eq('provider', provider),
      'Failed to disconnect wearable device'
    );
  },

  /**
   * Get connected wearable devices
   */
  async getConnectedWearables(userId: string): Promise<any[]> {
    return apiClient.request(
      () => supabase
        .from('wearable_connections')
        .select('provider, created_at')
        .eq('user_id', userId),
      'Failed to fetch connected wearables'
    );
  },

  /**
   * Save user feedback
   */
  async saveFeedback(userId: string, feedbackText: string): Promise<void> {
    await apiClient.request(
      () => supabase
        .from('user_feedback')
        .insert({
          user_id: userId,
          feedback_text: feedbackText
        }),
      'Failed to save feedback'
    );
  },

  /**
   * Update user preferences
   */
  async updatePreferences(userId: string, preferences: any): Promise<void> {
    await apiClient.request(
      () => supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          ...preferences,
          updated_at: new Date().toISOString()
        }),
      'Failed to update preferences'
    );
  },

  /**
   * Get user preferences
   */
  async getPreferences(userId: string): Promise<any> {
    return apiClient.request(
      () => supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle(),
      'Failed to fetch preferences'
    );
  }
};