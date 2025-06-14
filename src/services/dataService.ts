// Data service for the application
// This provides a unified interface for fetching data,
// whether from the API or from mock data when needed

import mockDataService from './mockDataService';
import { supabase } from '../lib/supabaseClient';
import { 
  HealthMetrics, 
  SleepMetrics, 
  ActivityMetrics, 
  NutritionData, 
  Device, 
  ChatMessage,
  GlucoseDataPoint 
} from '../types/mockData';
import { Supplement } from '../types/supplements';

// Function to determine if we should use mock data
const shouldUseMockData = (userId?: string): boolean => {
  // Use mock data if no userId, or if it's the demo user ID
  return !userId || userId === '00000000-0000-0000-0000-000000000000';
};

// Get user profile
export const getUserProfile = async (userId?: string) => {
  if (shouldUseMockData(userId)) {
    return mockDataService.getUserProfile();
  }
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    
    return {
      firstName: data.first_name || '',
      lastName: data.last_name || '',
      email: data.email || '',
      mobile: data.mobile || '',
      onboardingCompleted: data.onboarding_completed || false
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return mockDataService.getUserProfile();
  }
};

// Get health metrics
export const getHealthMetrics = async (userId?: string): Promise<HealthMetrics> => {
  if (shouldUseMockData(userId)) {
    return mockDataService.getHealthMetrics();
  }
  
  try {
    // In a real implementation, you would fetch real data from your backend
    const { data, error } = await supabase
      .from('health_metrics')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(1);
    
    if (error) throw error;
    
    if (data && data.length > 0) {
      // Format the data to match HealthMetrics structure
      // This is a simplified example, real implementation would be more complex
      return {
        bwScore: data[0].health_score || mockDataService.getHealthMetrics().bwScore,
        metrics: {
          steps: data[0].steps || mockDataService.getHealthMetrics().metrics.steps,
          heartRate: data[0].heart_rate || mockDataService.getHealthMetrics().metrics.heartRate,
          sleepHours: data[0].sleep_hours || mockDataService.getHealthMetrics().metrics.sleepHours,
          deep_sleep: data[0].deep_sleep || mockDataService.getHealthMetrics().metrics.deep_sleep,
          rem_sleep: data[0].rem_sleep || mockDataService.getHealthMetrics().metrics.rem_sleep,
          calories: data[0].calories || mockDataService.getHealthMetrics().metrics.calories,
          bmi: data[0].bmi || mockDataService.getHealthMetrics().metrics.bmi,
        },
        timeInRange: data[0].time_in_range || mockDataService.getHealthMetrics().timeInRange,
        dailyAverage: data[0].daily_average || mockDataService.getHealthMetrics().dailyAverage,
        variability: data[0].variability || mockDataService.getHealthMetrics().variability,
        currentGlucose: data[0].current_glucose || mockDataService.getHealthMetrics().currentGlucose,
      };
    }
    
    return mockDataService.getHealthMetrics();
  } catch (error) {
    console.error('Error fetching health metrics:', error);
    return mockDataService.getHealthMetrics();
  }
};

// Get sleep data
export const getSleepData = async (userId?: string): Promise<SleepMetrics> => {
  if (shouldUseMockData(userId)) {
    return mockDataService.getSleepData();
  }
  
  try {
    // In a real implementation, you would fetch real data from your backend
    // For now, return mock data
    return mockDataService.getSleepData();
  } catch (error) {
    console.error('Error fetching sleep data:', error);
    return mockDataService.getSleepData();
  }
};

// Get activity data
export const getActivityData = async (userId?: string): Promise<ActivityMetrics> => {
  if (shouldUseMockData(userId)) {
    return mockDataService.getActivityData();
  }
  
  try {
    // In a real implementation, you would fetch real data from your backend
    // For now, return mock data
    return mockDataService.getActivityData();
  } catch (error) {
    console.error('Error fetching activity data:', error);
    return mockDataService.getActivityData();
  }
};

// Get nutrition data
export const getNutritionData = async (userId?: string): Promise<NutritionData> => {
  if (shouldUseMockData(userId)) {
    return mockDataService.getNutritionData();
  }
  
  try {
    // In a real implementation, you would fetch real data from your backend
    // For now, return mock data
    return mockDataService.getNutritionData();
  } catch (error) {
    console.error('Error fetching nutrition data:', error);
    return mockDataService.getNutritionData();
  }
};

// Get supplements
export const getSupplements = async (): Promise<Supplement[]> => {
  try {
    const { data, error } = await supabase
      .from('supplements')
      .select('*');
    
    if (error) throw error;
    
    return data.length > 0 ? data : mockDataService.getSupplements();
  } catch (error) {
    console.error('Error fetching supplements:', error);
    return mockDataService.getSupplements();
  }
};

// Get user supplements
export const getUserSupplements = async (userId?: string): Promise<string[]> => {
  if (shouldUseMockData(userId)) {
    return mockDataService.getUserSupplements();
  }
  
  try {
    const { data, error } = await supabase
      .from('user_supplements')
      .select('supplement_id')
      .eq('user_id', userId);
    
    if (error) throw error;
    
    return data.map(item => item.supplement_id);
  } catch (error) {
    console.error('Error fetching user supplements:', error);
    return mockDataService.getUserSupplements();
  }
};

// Get supplement stacks
export const getSupplementStacks = async () => {
  try {
    const { data, error } = await supabase
      .from('supplement_stacks')
      .select('*');
    
    if (error) throw error;
    
    return data.length > 0 ? data : mockDataService.getSupplementStacks();
  } catch (error) {
    console.error('Error fetching supplement stacks:', error);
    return mockDataService.getSupplementStacks();
  }
};

// Get devices
export const getDevices = async (userId?: string): Promise<Device[]> => {
  if (shouldUseMockData(userId)) {
    return mockDataService.getDevices();
  }
  
  try {
    // In a real implementation, you would fetch connected devices from your backend
    const { data, error } = await supabase
      .from('wearable_connections')
      .select('provider')
      .eq('user_id', userId);
    
    if (error) throw error;
    
    if (data && data.length > 0) {
      // Get all devices and mark the connected ones
      const devices = mockDataService.getDevices();
      const connectedDeviceIds = data.map(d => d.provider);
      
      return devices.map(device => ({
        ...device,
        connected: connectedDeviceIds.includes(device.id)
      }));
    }
    
    return mockDataService.getDevices();
  } catch (error) {
    console.error('Error fetching devices:', error);
    return mockDataService.getDevices();
  }
};

// Get chat history
export const getChatHistory = async (userId?: string): Promise<ChatMessage[]> => {
  if (shouldUseMockData(userId)) {
    return mockDataService.getChatHistory();
  }
  
  try {
    const { data, error } = await supabase
      .from('chat_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data.length > 0 ? data : mockDataService.getChatHistory();
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return mockDataService.getChatHistory();
  }
};

// Generate AI response
export const getAIResponse = async (query: string, userId?: string) => {
  if (shouldUseMockData(userId)) {
    return mockDataService.getAIResponse(query);
  }
  
  try {
    // In a production app, this would call your AI service via Edge Function
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const endpoint = `${supabaseUrl}/functions/v1/openai-proxy`;
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabase.auth.getSession()}`
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: query }],
        userId
      })
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error getting AI response:', error);
    // Fall back to mock response
    return mockDataService.getAIResponse(query);
  }
};

// Generate glucose data
export const getGlucoseData = async (userId?: string, timeRange: '24h' | '7d' | '30d' = '24h'): Promise<GlucoseDataPoint[]> => {
  if (shouldUseMockData(userId)) {
    return mockDataService.generateGlucoseData(timeRange);
  }
  
  try {
    const { data, error } = await supabase
      .from('cgm_data')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: true });
    
    if (error) throw error;
    
    if (data && data.length > 0) {
      // Format the data to match GlucoseDataPoint
      return data.map(item => ({
        timestamp: new Date(item.timestamp),
        glucose: item.glucose,
        events: item.events || []
      }));
    }
    
    return mockDataService.generateGlucoseData(timeRange);
  } catch (error) {
    console.error('Error fetching glucose data:', error);
    return mockDataService.generateGlucoseData(timeRange);
  }
};

// Export the service functions
export default {
  getUserProfile,
  getHealthMetrics,
  getSleepData,
  getActivityData,
  getNutritionData,
  getSupplements,
  getUserSupplements,
  getSupplementStacks,
  getDevices,
  getChatHistory,
  getAIResponse,
  getGlucoseData
};