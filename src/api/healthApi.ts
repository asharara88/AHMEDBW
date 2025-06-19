import { apiClient } from './apiClient';
import { supabase } from '../lib/supabaseClient';
import type { HealthMetric } from '../store/useUserStore';

export const healthApi = {
  /**
   * Fetch health metrics for a user
   */
  async getHealthMetrics(userId: string, limit: number = 100): Promise<HealthMetric[]> {
    return apiClient.request(
      () => supabase
        .from('health_metrics')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(limit),
      'Failed to fetch health metrics'
    );
  },

  /**
   * Add a new health metric
   */
  async addHealthMetric(userId: string, metric: Omit<HealthMetric, 'user_id'>): Promise<HealthMetric> {
    const newMetric = {
      ...metric,
      user_id: userId,
      timestamp: metric.timestamp || new Date().toISOString()
    };
    
    return apiClient.request(
      () => supabase
        .from('health_metrics')
        .insert(newMetric)
        .select()
        .single(),
      'Failed to add health metric'
    );
  },

  /**
   * Update an existing health metric
   */
  async updateHealthMetric(metricId: string, updates: Partial<HealthMetric>): Promise<void> {
    await apiClient.request(
      () => supabase
        .from('health_metrics')
        .update(updates)
        .eq('id', metricId),
      'Failed to update health metric'
    );
  },

  /**
   * Delete a health metric
   */
  async deleteHealthMetric(metricId: string): Promise<void> {
    await apiClient.request(
      () => supabase
        .from('health_metrics')
        .delete()
        .eq('id', metricId),
      'Failed to delete health metric'
    );
  },

  /**
   * Get CGM data for a user
   */
  async getCGMData(userId: string, startDate?: string, endDate?: string): Promise<any[]> {
    let query = supabase
      .from('cgm_data')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: true });
    
    if (startDate) {
      query = query.gte('timestamp', startDate);
    }
    
    if (endDate) {
      query = query.lte('timestamp', endDate);
    }
    
    return apiClient.request(
      () => query,
      'Failed to fetch CGM data'
    );
  },

  /**
   * Get sleep data for a user
   */
  async getSleepData(userId: string, limit: number = 7): Promise<any[]> {
    return apiClient.request(
      () => supabase
        .from('health_metrics')
        .select('*')
        .eq('user_id', userId)
        .eq('metric_type', 'sleep')
        .order('timestamp', { ascending: false })
        .limit(limit),
      'Failed to fetch sleep data'
    );
  }
};