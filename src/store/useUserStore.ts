import { create } from 'zustand';
import { healthApi } from '../api/healthApi';
import { logError } from '../utils/logger';

export interface HealthMetric {
  id?: string;
  user_id?: string;
  metric_type: string;
  value: number;
  unit: string;
  timestamp?: string;
  source: string;
  metadata?: Record<string, any>;
}

interface UserState {
  healthMetrics: HealthMetric[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchHealthMetrics: (userId: string) => Promise<void>;
  addHealthMetric: (userId: string, metric: Omit<HealthMetric, 'user_id'>) => Promise<void>;
  updateHealthMetric: (metricId: string, updates: Partial<HealthMetric>) => Promise<void>;
  deleteHealthMetric: (metricId: string) => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  healthMetrics: [],
  loading: false,
  error: null,
  
  fetchHealthMetrics: async (userId) => {
    if (!userId) return;
    
    set({ loading: true, error: null });
    
    try {
      const metrics = await healthApi.getHealthMetrics(userId);
      set({ healthMetrics: metrics, loading: false });
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch health metrics';
      logError('Error fetching health metrics', err);
      set({ error: errorMessage, loading: false });
    }
  },
  
  addHealthMetric: async (userId, metric) => {
    if (!userId) return;
    
    set({ loading: true, error: null });
    
    try {
      const newMetric = await healthApi.addHealthMetric(userId, metric);
      set({ 
        healthMetrics: [newMetric, ...get().healthMetrics],
        loading: false 
      });
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to add health metric';
      logError('Error adding health metric', err);
      set({ error: errorMessage, loading: false });
    }
  },
  
  updateHealthMetric: async (metricId, updates) => {
    set({ loading: true, error: null });
    
    try {
      await healthApi.updateHealthMetric(metricId, updates);
      
      set({ 
        healthMetrics: get().healthMetrics.map(metric => 
          metric.id === metricId ? { ...metric, ...updates } : metric
        ),
        loading: false 
      });
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update health metric';
      logError('Error updating health metric', err);
      set({ error: errorMessage, loading: false });
    }
  },
  
  deleteHealthMetric: async (metricId) => {
    set({ loading: true, error: null });
    
    try {
      await healthApi.deleteHealthMetric(metricId);
      
      set({ 
        healthMetrics: get().healthMetrics.filter(metric => metric.id !== metricId),
        loading: false 
      });
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete health metric';
      logError('Error deleting health metric', err);
      set({ error: errorMessage, loading: false });
    }
  }
}));