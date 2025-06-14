// Mock data type definitions for the application

export interface HealthMetrics {
  bwScore: number;
  metrics: {
    steps: number;
    heartRate: number;
    sleepHours: number;
    deep_sleep?: number;
    rem_sleep?: number;
    calories?: number;
    bmi?: number;
  };
  timeInRange?: number;
  dailyAverage?: number;
  variability?: number;
  currentGlucose?: number;
}

export interface SleepMetrics {
  totalSleep: number;
  deepSleep: number;
  remSleep: number;
  sleepOnset: number;
  sleepScore: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
  weeklyAverage: number;
  sleepTimeline: Array<{
    date: string;
    total: number;
    deep: number;
    rem: number;
    light: number;
  }>;
  sleepQuality: Array<{
    date: string;
    score: number;
  }>;
  insights: string[];
}

export interface ActivityMetrics {
  totalSteps: number;
  caloriesBurned: number;
  activeMinutes: number;
  workoutSessions: number;
  avgHeartRate: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
  weeklyAverage: number;
  heartRateZones: {
    rest: number;
    light: number;
    moderate: number;
    vigorous: number;
    max: number;
  };
  dailyActivity: Array<{
    date: string;
    steps: number;
    calories: number;
    active: number;
  }>;
  workouts: Array<{
    type: string;
    duration: number;
    calories: number;
    date: string;
  }>;
  insights: string[];
}

export interface NutritionData {
  dailyCalories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  firstMealTime: string;
  lastMealTime: string;
  mealLoggingCount: number;
  hydration: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
  weeklyAverage: number;
  dailyIntake: Array<{
    date: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }>;
  meals: Array<{
    name: string;
    time: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }>;
  insights: string[];
}

export interface Device {
  id: string;
  name: string;
  description: string;
  category: string;
  connected: boolean;
  image_url: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  message: string;
  response: string;
  created_at: string;
}

export interface GlucoseDataPoint {
  timestamp: Date;
  glucose: number;
  events?: Array<{
    type: string;
    label: string;
  }>;
}

// Demo response type for AI coach
export interface DemoResponsesMap {
  [key: string]: string;
}