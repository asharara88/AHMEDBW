import { apiClient } from './apiClient';
import { supabase } from '../lib/supabaseClient';
import type { Supplement, SupplementStack } from '../types/supplements';

export const supplementApi = {
  /**
   * Fetch all supplements
   */
  async getSupplements(): Promise<Supplement[]> {
    return apiClient.request(
      () => supabase
        .from('supplements')
        .select('*')
        .eq('is_active', true),
      'Failed to fetch supplements'
    );
  },

  /**
   * Fetch a single supplement by ID
   */
  async getSupplement(supplementId: string): Promise<Supplement> {
    return apiClient.request(
      () => supabase
        .from('supplements')
        .select('*')
        .eq('id', supplementId)
        .single(),
      'Failed to fetch supplement'
    );
  },

  /**
   * Fetch user's subscribed supplements
   */
  async getUserSupplements(userId: string): Promise<string[]> {
    return apiClient.request(
      () => supabase
        .from('user_supplements')
        .select('supplement_id')
        .eq('user_id', userId),
      'Failed to fetch user supplements'
    ).then(data => data.map(item => item.supplement_id));
  },

  /**
   * Toggle a user's subscription to a supplement
   */
  async toggleSubscription(userId: string, supplementId: string): Promise<void> {
    // First check if the user is already subscribed
    const { data } = await supabase
      .from('user_supplements')
      .select('id')
      .eq('user_id', userId)
      .eq('supplement_id', supplementId)
      .maybeSingle();
    
    if (data) {
      // User is subscribed, so unsubscribe
      await apiClient.request(
        () => supabase
          .from('user_supplements')
          .delete()
          .eq('user_id', userId)
          .eq('supplement_id', supplementId),
        'Failed to unsubscribe from supplement'
      );
    } else {
      // User is not subscribed, so subscribe
      await apiClient.request(
        () => supabase
          .from('user_supplements')
          .insert({
            user_id: userId,
            supplement_id: supplementId,
            subscription_active: true
          }),
        'Failed to subscribe to supplement'
      );
    }
  },

  /**
   * Fetch all supplement stacks
   */
  async getStacks(): Promise<SupplementStack[]> {
    return apiClient.request(
      () => supabase
        .from('supplement_stacks')
        .select('*'),
      'Failed to fetch supplement stacks'
    );
  },

  /**
   * Create a new supplement stack
   */
  async createStack(stack: Partial<SupplementStack>): Promise<SupplementStack> {
    return apiClient.request(
      () => supabase
        .from('supplement_stacks')
        .insert(stack)
        .select()
        .single(),
      'Failed to create supplement stack'
    );
  },

  /**
   * Delete a supplement stack
   */
  async deleteStack(stackId: string): Promise<void> {
    await apiClient.request(
      () => supabase
        .from('supplement_stacks')
        .delete()
        .eq('id', stackId),
      'Failed to delete supplement stack'
    );
  },

  /**
   * Get AI-generated supplement recommendations
   */
  async getRecommendations(goal: string, userId?: string): Promise<string> {
    const prompt = `Based on my goal to "${goal}", what supplements would you recommend? Please provide a detailed breakdown with dosages and timing.`;
    
    const context = {
      userId,
      goal,
      userType: 'health optimizer'
    };
    
    return apiClient.callFunction<any>(
      'openai-proxy',
      { 
        messages: [{ role: 'user', content: prompt }],
        context
      },
      'Failed to get supplement recommendations'
    ).then(data => data.choices?.[0]?.message?.content || '');
  }
};