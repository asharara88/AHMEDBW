// Mock data service for the application
// This provides consistent mock data that can be used throughout the app

import { User } from '@supabase/supabase-js';
import { Supplement } from '../types/supplements';
import { 
  HealthMetrics, 
  SleepMetrics, 
  ActivityMetrics, 
  NutritionData, 
  Device, 
  ChatMessage, 
  GlucoseDataPoint,
  DemoResponsesMap
} from '../types/mockData';

// Mock User Profile Data
export const mockUserProfile = {
  firstName: 'Demo',
  lastName: 'User',
  email: 'demo@example.com',
  mobile: '+971 (50) 123 4567',
  onboardingCompleted: true
};

// Demo user with a valid UUID for auth context
export const DEMO_USER: User = {
  id: '00000000-0000-0000-0000-000000000000',
  email: 'demo@example.com',
  phone: '',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  last_sign_in_at: new Date().toISOString(),
  role: 'authenticated',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
};

// Mock Health Metrics
export const mockHealthMetrics: HealthMetrics = {
  bwScore: 82,
  metrics: {
    steps: 8432,
    heartRate: 62,
    sleepHours: 7.2,
    deep_sleep: 1.8,
    rem_sleep: 1.5,
    calories: 420,
    bmi: 22.5,
  },
  timeInRange: 85,
  dailyAverage: 102,
  variability: 15,
  currentGlucose: 95,
};

// Mock Sleep Data
export const mockSleepData: SleepMetrics = {
  totalSleep: 7.2,
  deepSleep: 1.8,
  remSleep: 1.5,
  sleepOnset: 22,
  sleepScore: 82,
  trend: 'up',
  change: 4,
  weeklyAverage: 7.4,
  sleepTimeline: [
    { date: 'Mon', total: 7.5, deep: 1.9, rem: 1.6, light: 4.0 },
    { date: 'Tue', total: 6.8, deep: 1.5, rem: 1.3, light: 4.0 },
    { date: 'Wed', total: 7.2, deep: 1.8, rem: 1.5, light: 3.9 },
    { date: 'Thu', total: 7.0, deep: 1.7, rem: 1.4, light: 3.9 },
    { date: 'Fri', total: 7.8, deep: 2.0, rem: 1.7, light: 4.1 },
    { date: 'Sat', total: 8.2, deep: 2.1, rem: 1.8, light: 4.3 },
    { date: 'Sun', total: 7.2, deep: 1.8, rem: 1.5, light: 3.9 },
  ],
  sleepQuality: [
    { date: 'Mon', score: 85 },
    { date: 'Tue', score: 72 },
    { date: 'Wed', score: 78 },
    { date: 'Thu', score: 75 },
    { date: 'Fri', score: 88 },
    { date: 'Sat', score: 92 },
    { date: 'Sun', score: 82 },
  ],
  insights: [
    "Your deep sleep has improved by 12% this week",
    "Consistent bedtime (10:30 PM ± 15 min) is helping your sleep quality",
    "Screen time reduction before bed has improved sleep onset by 18%",
    "Consider reducing caffeine after 2 PM to further improve deep sleep"
  ]
};

// Mock Activity Data
export const mockActivityData: ActivityMetrics = {
  totalSteps: 8432,
  caloriesBurned: 420,
  activeMinutes: 68,
  workoutSessions: 3,
  avgHeartRate: 62,
  trend: 'up',
  change: 12,
  weeklyAverage: 7850,
  heartRateZones: {
    rest: 58,
    light: 95,
    moderate: 125,
    vigorous: 155,
    max: 175
  },
  dailyActivity: [
    { date: 'Mon', steps: 9200, calories: 450, active: 72 },
    { date: 'Tue', steps: 7800, calories: 380, active: 58 },
    { date: 'Wed', steps: 8500, calories: 420, active: 65 },
    { date: 'Thu', steps: 6500, calories: 320, active: 45 },
    { date: 'Fri', steps: 9800, calories: 480, active: 78 },
    { date: 'Sat', steps: 10200, calories: 520, active: 85 },
    { date: 'Sun', steps: 8432, calories: 420, active: 68 },
  ],
  workouts: [
    { type: 'Running', duration: 45, calories: 380, date: 'Mon' },
    { type: 'Strength', duration: 60, calories: 320, date: 'Wed' },
    { type: 'Cycling', duration: 30, calories: 280, date: 'Fri' },
  ],
  insights: [
    "Your active minutes have increased by 15% this week",
    "Morning workouts are showing better intensity metrics than evening sessions",
    "Your recovery heart rate has improved by 8% in the last month",
    "Consider adding one more strength training session per week"
  ]
};

// Mock Nutrition Data
export const mockNutritionData: NutritionData = {
  dailyCalories: 2150,
  macros: {
    protein: 125, // grams
    carbs: 220, // grams
    fat: 65, // grams
  },
  firstMealTime: '7:30 AM',
  lastMealTime: '7:15 PM',
  mealLoggingCount: 18, // out of 21 possible meals in a week
  hydration: 2.2, // liters
  trend: 'up',
  change: 8,
  weeklyAverage: 2080,
  dailyIntake: [
    { date: 'Mon', calories: 2250, protein: 130, carbs: 230, fat: 70 },
    { date: 'Tue', calories: 1950, protein: 120, carbs: 200, fat: 60 },
    { date: 'Wed', calories: 2100, protein: 125, carbs: 215, fat: 65 },
    { date: 'Thu', calories: 2000, protein: 115, carbs: 210, fat: 62 },
    { date: 'Fri', calories: 2300, protein: 135, carbs: 240, fat: 72 },
    { date: 'Sat', calories: 2400, protein: 140, carbs: 250, fat: 75 },
    { date: 'Sun', calories: 2150, protein: 125, carbs: 220, fat: 65 },
  ],
  meals: [
    { name: 'Breakfast', time: '7:30 AM', calories: 450, protein: 30, carbs: 45, fat: 15 },
    { name: 'Lunch', time: '12:45 PM', calories: 750, protein: 45, carbs: 80, fat: 25 },
    { name: 'Snack', time: '3:30 PM', calories: 200, protein: 10, carbs: 25, fat: 5 },
    { name: 'Dinner', time: '7:15 PM', calories: 750, protein: 40, carbs: 70, fat: 20 },
  ],
  insights: [
    "Your protein intake is consistently meeting your target of 1.8g/kg",
    "Eating within a 12-hour window is supporting your metabolic health",
    "Consider increasing fiber intake to support gut health",
    "Your hydration levels are optimal for your activity level"
  ]
};

// Mock Supplement Data
export const mockSupplements: Supplement[] = [
  {
    id: 'magnesium-glycinate',
    name: 'Magnesium Glycinate',
    description: 'Premium form of magnesium for optimal absorption and sleep support.',
    categories: ['Sleep', 'Recovery', 'Stress'],
    evidence_level: 'Green',
    use_cases: ['Sleep quality', 'Muscle recovery', 'Stress management'],
    stack_recommendations: ['Sleep Stack', 'Recovery Stack'],
    dosage: '300-400mg before bed',
    form: 'Capsule',
    form_type: 'capsule_powder',
    brand: 'Pure Encapsulations',
    availability: true,
    price_aed: 89,
    image_url: 'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg'
  },
  {
    id: 'vitamin-d3-k2',
    name: 'Vitamin D3 + K2',
    description: 'Synergistic combination for optimal calcium utilization and immune support.',
    categories: ['Immunity', 'Bone Health'],
    evidence_level: 'Green',
    use_cases: ['Immune support', 'Bone health', 'Cardiovascular health'],
    stack_recommendations: ['Immunity Stack', 'Bone Health Stack'],
    dosage: '5000 IU D3 / 100mcg K2',
    form: 'Softgel',
    form_type: 'softgel',
    brand: 'Thorne Research',
    availability: true,
    price_aed: 75,
    image_url: 'https://images.pexels.com/photos/4004612/pexels-photo-4004612.jpeg'
  },
  {
    id: 'omega-3',
    name: 'Omega-3 Fish Oil',
    description: 'High-potency EPA/DHA from sustainable sources for brain and heart health.',
    categories: ['Brain Health', 'Heart Health', 'Inflammation'],
    evidence_level: 'Green',
    use_cases: ['Cognitive function', 'Heart health', 'Joint health'],
    stack_recommendations: ['Brain Health Stack', 'Heart Health Stack'],
    dosage: '2-3g daily (1000mg EPA/DHA)',
    form: 'Softgel',
    form_type: 'softgel',
    brand: 'Nordic Naturals',
    availability: true,
    price_aed: 120,
    image_url: 'https://images.pexels.com/photos/4004626/pexels-photo-4004626.jpeg'
  },
  {
    id: 'berberine',
    name: 'Berberine HCl',
    description: 'Powerful compound for metabolic health and glucose management.',
    categories: ['Metabolic Health', 'Blood Sugar'],
    evidence_level: 'Green',
    use_cases: ['Blood sugar control', 'Metabolic health', 'Gut health'],
    stack_recommendations: ['Metabolic Stack'],
    dosage: '500mg 2-3x daily',
    form: 'Capsule',
    form_type: 'capsule_powder',
    brand: 'Thorne Research',
    availability: true,
    price_aed: 95,
    image_url: 'https://images.pexels.com/photos/3683098/pexels-photo-3683098.jpeg'
  },
  {
    id: 'lions-mane',
    name: "Lion's Mane Mushroom",
    description: 'Nootropic mushroom for cognitive enhancement and nerve health.',
    categories: ['Cognitive', 'Brain Health'],
    evidence_level: 'Yellow',
    use_cases: ['Mental clarity', 'Memory', 'Nerve health'],
    stack_recommendations: ['Cognitive Stack'],
    dosage: '1000mg 1-2x daily',
    form: 'Capsule',
    form_type: 'capsule_powder',
    brand: 'Host Defense',
    availability: true,
    price_aed: 110,
    image_url: 'https://images.pexels.com/photos/3683047/pexels-photo-3683047.jpeg'
  },
  {
    id: 'ashwagandha',
    name: 'Ashwagandha KSM-66',
    description: 'Premium ashwagandha extract for stress and anxiety support.',
    categories: ['Stress', 'Sleep', 'Recovery'],
    evidence_level: 'Green',
    use_cases: ['Stress reduction', 'Sleep quality', 'Recovery'],
    stack_recommendations: ['Stress Stack', 'Sleep Stack'],
    dosage: '600mg daily',
    form: 'Capsule',
    form_type: 'capsule_powder',
    brand: 'Jarrow Formulas',
    availability: true,
    price_aed: 85,
    image_url: 'https://images.pexels.com/photos/3683051/pexels-photo-3683051.jpeg'
  }
];

// Mock Supplement Stacks
export const mockSupplementStacks = [
  {
    id: 'sleep-stack',
    name: 'Sleep & Recovery Stack',
    description: 'Comprehensive support for sleep quality and recovery',
    category: 'Sleep',
    supplements: ['magnesium-glycinate', 'ashwagandha'],
    total_price: 174
  },
  {
    id: 'brain-stack',
    name: 'Brain Health Stack',
    description: 'Optimize cognitive function and mental clarity',
    category: 'Brain Health',
    supplements: ['lions-mane', 'omega-3'],
    total_price: 230
  },
  {
    id: 'metabolic-stack',
    name: 'Metabolic Health Stack',
    description: 'Support healthy blood sugar and metabolism',
    category: 'Metabolic Health',
    supplements: ['berberine', 'vitamin-d3-k2'],
    total_price: 170
  }
];

// Mock Device Data
export const mockDevices: Device[] = [
  {
    id: 'apple-watch',
    name: 'Apple Watch',
    description: 'Sync activity, heart rate, sleep, and more',
    category: 'wearable',
    connected: true,
    image_url: 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg'
  },
  {
    id: 'oura-ring',
    name: 'Oura Ring',
    description: 'Track sleep, readiness, and activity scores',
    category: 'wearable',
    connected: false,
    image_url: 'https://images.pexels.com/photos/1191531/pexels-photo-1191531.jpeg'
  },
  {
    id: 'freestyle-libre',
    name: 'FreeStyle Libre',
    description: 'Continuous glucose monitoring system',
    category: 'cgm',
    connected: false,
    image_url: 'https://images.pexels.com/photos/4226119/pexels-photo-4226119.jpeg'
  },
  {
    id: 'apple-health',
    name: 'Apple Health',
    description: 'Sync data from multiple sources',
    category: 'health-app',
    connected: false,
    image_url: 'https://images.pexels.com/photos/4226122/pexels-photo-4226122.jpeg'
  },
  {
    id: 'fitbit',
    name: 'Fitbit',
    description: 'Track steps, sleep, and heart rate',
    category: 'wearable',
    connected: false,
    image_url: 'https://images.pexels.com/photos/4498482/pexels-photo-4498482.jpeg'
  }
];

// Mock Chat History
export const mockChatHistory: ChatMessage[] = [
  {
    id: '1',
    user_id: '00000000-0000-0000-0000-000000000000',
    message: 'What supplements should I take for better sleep?',
    response: 'Based on your sleep patterns, I recommend trying magnesium glycinate (300-400mg) before bed. It helps with muscle relaxation and sleep quality.',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: '2',
    user_id: '00000000-0000-0000-0000-000000000000',
    message: 'How can I improve my heart rate variability?',
    response: 'To improve HRV, focus on consistent sleep schedule, breath work (try 4-7-8 breathing), and reduced alcohol consumption.',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: '3',
    user_id: '00000000-0000-0000-0000-000000000000',
    message: "What's causing my afternoon energy crash?",
    response: 'Your glucose monitoring shows spikes after lunch. Try adding protein and fiber to meals, and consider a 10-minute walk after eating.',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
];

// Mock Demo Responses for the AI coach
export const DEMO_RESPONSES: DemoResponsesMap = {
  "what's my current health status": `Here's an analysis of your current health metrics:

| Metric | Value | Status | Trend |
|--------|--------|--------|--------|
| Health Score | 82/100 | Good | ↑ +4% |
| Sleep Quality | 85% | Optimal | ↑ +15% |
| Recovery Score | 88/100 | Excellent | ↑ +5% |
| Daily Steps | 8,432 | Near Target | → |

### Key Insights
1. Sleep quality has improved significantly
2. Recovery metrics show good adaptation
3. Activity level is approaching targets

### Recommendations
1. Morning Activity
   - Add 1,500 steps to reach 10,000 goal
   - Consider morning walk routine

2. Recovery Optimization
   - Maintain current sleep schedule
   - Continue stress management practices`,

  "how can i improve my sleep quality": `Based on your sleep data, here are structured recommendations:

| Current Metric | Your Value | Target Range | Status |
|---------------|------------|--------------|---------|
| Deep Sleep | 1.8 hrs | 1.5-2.0 hrs | ✓ Good |
| Sleep Duration | 7.2 hrs | 7-9 hrs | ! Improve |
| Sleep Timing | 11:30 PM | 10:00-10:30 PM | ! Adjust |

### Recommended Protocol

1. Pre-Sleep Routine
   | Time | Activity | Purpose |
   |------|----------|----------|
   | 2 hrs before | Reduce blue light | Melatonin production |
   | 1 hr before | Light stretching | Physical relaxation |
   | 30 min before | Meditation | Mental relaxation |

2. Environment Optimization
   - Temperature: 65-68°F
   - Lighting: Blackout curtains
   - Sound: White noise or silence

3. Supplement Support
   | Supplement | Dosage | Timing |
   |------------|---------|---------|
   | Magnesium | 300-400mg | 1 hr before bed |
   | L-Theanine | 200mg | 30 min before bed |`,

  "what supplements should i take": `Based on your health profile, here are evidence-based recommendations:

### Core Supplements
| Supplement | Daily Dosage | Benefits | Timing |
|------------|--------------|-----------|---------|
| Vitamin D3+K2 | 5000 IU D3, 100mcg K2 | Immune & bone health | With breakfast |
| Magnesium | 300-400mg | Sleep & stress | Evening |
| Omega-3 | 2-3g | Heart & brain health | With meals |

### Goal-Specific Supplements
| Goal | Supplement | Dosage | Timing |
|------|------------|---------|---------|
| Sleep | Magnesium Glycinate | 300-400mg | 1 hr before bed |
| Recovery | L-Glutamine | 5g | Post-workout |
| Focus | Alpha-GPC | 300mg | Morning |

### Usage Protocol
1. Morning Stack
   - Vitamin D3+K2 with breakfast
   - Alpha-GPC (if focus is priority)

2. Post-Workout
   - L-Glutamine
   - Electrolytes as needed

3. Evening
   - Magnesium Glycinate
   - Omega-3 with dinner`,

  // Default response when no specific match is found
  "default": `I understand you're interested in improving your health. Based on your recent metrics, your overall health score is 82/100, with good sleep quality and recovery. Your daily step count is 8,432, approaching the recommended 10,000 steps. What specific aspect of your health would like to focus on today?`
};

// Function to generate glucose data for metabolic health
export const generateMockGlucoseData = (timeRange: '24h' | '7d' | '30d'): GlucoseDataPoint[] => {
  const data: GlucoseDataPoint[] = [];
  const now = new Date();
  let points: number;
  let interval: number;
  
  // Determine number of data points and interval based on time range
  switch (timeRange) {
    case '24h':
      points = 24;
      interval = 60 * 60 * 1000; // 1 hour in milliseconds
      break;
    case '7d':
      points = 7 * 24;
      interval = 60 * 60 * 1000; // 1 hour in milliseconds
      break;
    case '30d':
      points = 30;
      interval = 24 * 60 * 60 * 1000; // 1 day in milliseconds
      break;
  }
  
  // Generate base glucose pattern with natural variation
  for (let i = points - 1; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * interval);
    
    // Create a natural daily pattern with some randomness
    const hourOfDay = timestamp.getHours();
    let baseGlucose = 85; // Baseline glucose level
    
    // Morning rise
    if (hourOfDay >= 6 && hourOfDay < 9) {
      baseGlucose += 10;
    }
    // After breakfast spike
    else if (hourOfDay >= 9 && hourOfDay < 11) {
      baseGlucose += 30;
    }
    // Lunch spike
    else if (hourOfDay >= 12 && hourOfDay < 14) {
      baseGlucose += 35;
    }
    // Afternoon dip
    else if (hourOfDay >= 15 && hourOfDay < 17) {
      baseGlucose -= 5;
    }
    // Dinner spike
    else if (hourOfDay >= 18 && hourOfDay < 20) {
      baseGlucose += 25;
    }
    // Evening decline
    else if (hourOfDay >= 21) {
      baseGlucose -= 10;
    }
    // Overnight stable
    else if (hourOfDay < 6) {
      baseGlucose -= 5;
    }
    
    // Add some random variation
    const randomVariation = Math.random() * 15 - 7.5; // -7.5 to +7.5
    const glucose = Math.round(baseGlucose + randomVariation);
    
    const dataPoint: GlucoseDataPoint = {
      timestamp,
      glucose,
      events: []
    };
    
    // Add meal events
    if (hourOfDay === 8) {
      dataPoint.events = [{
        type: 'meal',
        label: 'Breakfast'
      }];
    } else if (hourOfDay === 12) {
      dataPoint.events = [{
        type: 'meal',
        label: 'Lunch'
      }];
    } else if (hourOfDay === 18) {
      dataPoint.events = [{
        type: 'meal',
        label: 'Dinner'
      }];
    }
    
    // Add exercise event
    if (hourOfDay === 17 && timestamp.getDay() % 2 === 0) {
      dataPoint.events = [{
        type: 'exercise',
        label: 'Workout'
      }];
    }
    
    // Add medication event
    if (hourOfDay === 9 && timestamp.getDay() % 3 === 0) {
      dataPoint.events = [{
        type: 'medication',
        label: 'Medication'
      }];
    }
    
    // Add sleep event
    if (hourOfDay === 23) {
      dataPoint.events = [{
        type: 'sleep',
        label: 'Bedtime'
      }];
    }
    
    data.push(dataPoint);
  }
  
  return data;
};

// Fetch mock supplements
export const getMockSupplements = (): Supplement[] => {
  return mockSupplements;
};

// Fetch mock user supplements
export const getMockUserSupplements = (): string[] => {
  return ['vitamin-d3-k2', 'magnesium-glycinate']; // Supplement IDs the user has subscribed to
};

// Fetch mock health metrics
export const getHealthMetrics = (): HealthMetrics => {
  return mockHealthMetrics;
};

// Fetch mock sleep data
export const getSleepData = (): SleepMetrics => {
  return mockSleepData;
};

// Fetch mock activity data
export const getActivityData = (): ActivityMetrics => {
  return mockActivityData;
};

// Fetch mock nutrition data
export const getNutritionData = (): NutritionData => {
  return mockNutritionData;
};

// Fetch mock devices
export const getDevices = (): Device[] => {
  return mockDevices;
};

// Fetch mock chat history
export const getChatHistory = (): ChatMessage[] => {
  return mockChatHistory;
};

// Get AI coach response for a given query
export const getAIResponse = (query: string): string => {
  const normalizedQuery = query.toLowerCase().trim();
  
  // Find exact match or similar query in demo responses
  for (const [key, value] of Object.entries(DEMO_RESPONSES)) {
    if (normalizedQuery.includes(key) || key.includes(normalizedQuery)) {
      return value;
    }
  }
  
  // Default response
  return DEMO_RESPONSES.default;
};

// Create a service object for export
export default {
  getUserProfile: () => mockUserProfile,
  getDemoUser: () => DEMO_USER,
  getHealthMetrics,
  getSleepData,
  getActivityData,
  getNutritionData,
  getSupplements: getMockSupplements,
  getUserSupplements: getMockUserSupplements,
  getSupplementStacks: () => mockSupplementStacks,
  getDevices,
  getChatHistory,
  getAIResponse,
  generateGlucoseData: generateMockGlucoseData
};