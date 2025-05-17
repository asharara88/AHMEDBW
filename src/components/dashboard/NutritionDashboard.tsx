import { useState } from 'react';
import { motion } from 'framer-motion';
import { Utensils, Coffee, Droplet, Clock, TrendingUp, TrendingDown, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface NutritionDashboardProps {
  userId?: string;
}

const NutritionDashboard = ({ userId }: NutritionDashboardProps) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [showDetails, setShowDetails] = useState(false);
  
  // Mock nutrition data
  const nutritionData = {
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

  // Prepare chart data for daily calories
  const caloriesData = {
    labels: nutritionData.dailyIntake.map(day => day.date),
    datasets: [
      {
        label: 'Calories',
        data: nutritionData.dailyIntake.map(day => day.calories),
        backgroundColor: '#10b981',
        borderColor: '#10b981',
        borderWidth: 1,
      },
    ],
  };

  // Prepare chart data for macronutrients
  const macrosData = {
    labels: ['Protein', 'Carbs', 'Fat'],
    datasets: [
      {
        data: [
          nutritionData.macros.protein * 4, // 4 calories per gram of protein
          nutritionData.macros.carbs * 4,   // 4 calories per gram of carbs
          nutritionData.macros.fat * 9,     // 9 calories per gram of fat
        ],
        backgroundColor: [
          '#3b82f6', // Blue for protein
          '#f59e0b', // Amber for carbs
          '#ef4444', // Red for fat
        ],
        borderWidth: 1,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          callback: (value: any) => `${value} kcal`,
        },
      },
    },
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${percentage}% (${value} kcal)`;
          }
        }
      },
    },
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-12">
        {/* Nutrition Score Card */}
        <div className="md:col-span-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="h-full rounded-xl bg-[hsl(var(--color-card))] shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="p-4 sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-base font-bold sm:text-lg">
                  <Utensils className="h-5 w-5 text-emerald-500" />
                  Nutrition Score
                </h2>
                <div className="flex items-center text-success">
                  {nutritionData.trend === 'up' ? (
                    <TrendingUp className="mr-1 h-4 w-4" />
                  ) : nutritionData.trend === 'down' ? (
                    <TrendingDown className="mr-1 h-4 w-4 text-error" />
                  ) : null}
                  <span className="text-xs font-medium">
                    {nutritionData.trend === 'up' ? '+' : nutritionData.trend === 'down' ? '-' : ''}
                    {nutritionData.change}%
                  </span>
                </div>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="relative flex h-32 w-32 items-center justify-center sm:h-40 sm:w-40">
                  <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                    {/* Background circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="hsl(var(--color-surface-1))"
                      strokeWidth="8"
                    />
                    {/* Progress circle - meal logging percentage */}
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="8"
                      strokeDasharray={2 * Math.PI * 45}
                      strokeDashoffset={2 * Math.PI * 45 * (1 - nutritionData.mealLoggingCount / 21)}
                    />
                  </svg>
                  {/* Meal logging text */}
                  <div className="absolute flex flex-col items-center">
                    <span className="text-2xl font-bold sm:text-3xl">
                      {Math.round(nutritionData.mealLoggingCount / 21 * 100)}%
                    </span>
                    <span className="text-xs text-text-light">logged meals</span>
                  </div>
                </div>
                
                <div className="mt-3 text-center">
                  <h3 className="text-base font-semibold text-emerald-600 sm:text-lg">Good</h3>
                  <p className="mt-1 text-xs text-text-light sm:text-sm">
                    {nutritionData.mealLoggingCount} of 21 meals logged this week
                  </p>
                </div>
              </div>
              
              <div className="mt-4 rounded-lg bg-[hsl(var(--color-surface-1))] p-3 sm:mt-6">
                <h4 className="text-xs font-medium sm:text-sm">Top Recommendation</h4>
                <p className="mt-1 text-xs text-text-light">
                  Try logging your snacks to get a more complete picture of your nutrition.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Nutrition Metrics Overview */}
        <div className="md:col-span-8">
          <div className="h-full rounded-xl bg-[hsl(var(--color-card))] p-4 shadow-sm sm:p-6">
            <div className="mb-4">
              <h2 className="text-base font-bold text-text sm:text-lg">Nutrition Metrics</h2>
              <p className="text-xs text-text-light sm:text-sm">Today's nutrition breakdown</p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-3 transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                    <Utensils className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium text-success">
                    Good
                  </span>
                </div>
                <div className="mt-2">
                  <h3 className="text-xs font-medium text-text-light sm:text-sm">
                    Daily Calories
                  </h3>
                  <div className="mt-1 flex items-baseline">
                    <span className="text-base font-semibold text-text sm:text-xl">
                      {nutritionData.dailyCalories.toLocaleString()}
                    </span>
                    <span className="ml-1 text-xs text-text-light sm:text-sm">
                      kcal
                    </span>
                  </div>
                  <div className="mt-1">
                    <span className="text-xs text-text-light">
                      Target: 2000-2200
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-3 transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                    <Utensils className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium text-success">
                    Optimal
                  </span>
                </div>
                <div className="mt-2">
                  <h3 className="text-xs font-medium text-text-light sm:text-sm">
                    Protein
                  </h3>
                  <div className="mt-1 flex items-baseline">
                    <span className="text-base font-semibold text-text sm:text-xl">
                      {nutritionData.macros.protein}
                    </span>
                    <span className="ml-1 text-xs text-text-light sm:text-sm">
                      g
                    </span>
                  </div>
                  <div className="mt-1">
                    <span className="text-xs text-text-light">
                      Target: 120-140g
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-3 transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div className="rounded-lg bg-amber-50 p-2 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
                    <Clock className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium text-success">
                    Good
                  </span>
                </div>
                <div className="mt-2">
                  <h3 className="text-xs font-medium text-text-light sm:text-sm">
                    Eating Window
                  </h3>
                  <div className="mt-1 flex items-baseline">
                    <span className="text-base font-semibold text-text sm:text-xl">
                      11.75
                    </span>
                    <span className="ml-1 text-xs text-text-light sm:text-sm">
                      hrs
                    </span>
                  </div>
                  <div className="mt-1">
                    <span className="text-xs text-text-light">
                      Target: &lt;12 hrs
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-3 transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div className="rounded-lg bg-sky-50 p-2 text-sky-600 dark:bg-sky-900/20 dark:text-sky-400">
                    <Droplet className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium text-success">
                    Optimal
                  </span>
                </div>
                <div className="mt-2">
                  <h3 className="text-xs font-medium text-text-light sm:text-sm">
                    Hydration
                  </h3>
                  <div className="mt-1 flex items-baseline">
                    <span className="text-base font-semibold text-text sm:text-xl">
                      {nutritionData.hydration}
                    </span>
                    <span className="ml-1 text-xs text-text-light sm:text-sm">
                      L
                    </span>
                  </div>
                  <div className="mt-1">
                    <span className="text-xs text-text-light">
                      Target: 2-3 L
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calories Chart */}
      <div className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-4 sm:p-6">
        <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <h2 className="text-lg font-bold">Daily Calorie Intake</h2>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-light">Time Range:</span>
            <div className="flex rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))]">
              <button
                onClick={() => setTimeRange('7d')}
                className={`flex items-center gap-1 px-3 py-1.5 text-sm transition-colors ${
                  timeRange === '7d'
                    ? 'bg-primary text-white'
                    : 'text-text-light hover:bg-[hsl(var(--color-card-hover))] hover:text-text'
                }`}
              >
                7D
              </button>
              <button
                onClick={() => setTimeRange('30d')}
                className={`flex items-center gap-1 px-3 py-1.5 text-sm transition-colors ${
                  timeRange === '30d'
                    ? 'bg-primary text-white'
                    : 'text-text-light hover:bg-[hsl(var(--color-card-hover))] hover:text-text'
                }`}
              >
                30D
              </button>
              <button
                onClick={() => setTimeRange('90d')}
                className={`flex items-center gap-1 px-3 py-1.5 text-sm transition-colors ${
                  timeRange === '90d'
                    ? 'bg-primary text-white'
                    : 'text-text-light hover:bg-[hsl(var(--color-card-hover))] hover:text-text'
                }`}
              >
                90D
              </button>
            </div>
          </div>
        </div>
        
        <div className="h-64">
          <Bar data={caloriesData} options={barChartOptions} />
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg bg-[hsl(var(--color-surface-1))] p-3">
            <div className="text-xs text-text-light">Weekly Average</div>
            <div className="text-lg font-semibold">{nutritionData.weeklyAverage.toLocaleString()} kcal</div>
          </div>
          <div className="rounded-lg bg-[hsl(var(--color-surface-1))] p-3">
            <div className="text-xs text-text-light">Highest Day</div>
            <div className="text-lg font-semibold">2,400 kcal</div>
          </div>
          <div className="rounded-lg bg-[hsl(var(--color-surface-1))] p-3">
            <div className="text-xs text-text-light">Lowest Day</div>
            <div className="text-lg font-semibold">1,950 kcal</div>
          </div>
          <div className="rounded-lg bg-[hsl(var(--color-surface-1))] p-3">
            <div className="text-xs text-text-light">Weekly Trend</div>
            <div className="flex items-center text-lg font-semibold text-success">
              <TrendingUp className="mr-1 h-5 w-5" />
              +8%
            </div>
          </div>
        </div>
      </div>

      {/* Macronutrient Breakdown */}
      <div className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-4 sm:p-6">
        <h2 className="mb-4 text-lg font-bold">Macronutrient Breakdown</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-64">
            <Pie data={macrosData} options={pieChartOptions} />
          </div>
          <div className="flex flex-col justify-center space-y-4">
            <div className="rounded-lg bg-[hsl(var(--color-surface-1))] p-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                <h3 className="font-medium">Protein: {nutritionData.macros.protein}g</h3>
              </div>
              <p className="mt-1 text-sm text-text-light">
                {Math.round(nutritionData.macros.protein * 4 / nutritionData.dailyCalories * 100)}% of total calories
              </p>
            </div>
            <div className="rounded-lg bg-[hsl(var(--color-surface-1))] p-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-amber-500"></div>
                <h3 className="font-medium">Carbs: {nutritionData.macros.carbs}g</h3>
              </div>
              <p className="mt-1 text-sm text-text-light">
                {Math.round(nutritionData.macros.carbs * 4 / nutritionData.dailyCalories * 100)}% of total calories
              </p>
            </div>
            <div className="rounded-lg bg-[hsl(var(--color-surface-1))] p-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <h3 className="font-medium">Fat: {nutritionData.macros.fat}g</h3>
              </div>
              <p className="mt-1 text-sm text-text-light">
                {Math.round(nutritionData.macros.fat * 9 / nutritionData.dailyCalories * 100)}% of total calories
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Meal Timing */}
      <div className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Meal Timing</h2>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-1 rounded-lg border border-[hsl(var(--color-border))] px-3 py-1.5 text-sm text-text-light transition-colors hover:bg-[hsl(var(--color-card-hover))] hover:text-text"
          >
            {showDetails ? (
              <>
                Hide Details <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                View Details <ChevronDown className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg bg-[hsl(var(--color-surface-1))] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                <Coffee className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium">First Meal</h3>
                <p className="text-sm text-text-light">{nutritionData.firstMealTime}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium">Breakfast</div>
              <div className="text-sm text-success">Optimal timing</div>
            </div>
          </div>
          
          <div className="flex items-center justify-between rounded-lg bg-[hsl(var(--color-surface-1))] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <Utensils className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium">Last Meal</h3>
                <p className="text-sm text-text-light">{nutritionData.lastMealTime}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium">Dinner</div>
              <div className="text-sm text-success">Optimal timing</div>
            </div>
          </div>
          
          <div className="flex items-center justify-between rounded-lg bg-[hsl(var(--color-surface-1))] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium">Eating Window</h3>
                <p className="text-sm text-text-light">11 hours, 45 minutes</p>
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium">12-hour target</div>
              <div className="text-sm text-success">Within target</div>
            </div>
          </div>
        </div>
        
        {showDetails && (
          <div className="mt-4 space-y-4 border-t border-[hsl(var(--color-border))] pt-4">
            <div className="rounded-lg bg-[hsl(var(--color-surface-1))] p-4">
              <h3 className="mb-2 text-sm font-medium">Today's Meals</h3>
              <div className="space-y-2">
                {nutritionData.meals.map((meal, index) => (
                  <div key={index} className="rounded-lg bg-[hsl(var(--color-card))] p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{meal.name}</h4>
                        <p className="text-xs text-text-light">{meal.time}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{meal.calories} kcal</div>
                        <div className="text-xs text-text-light">
                          P: {meal.protein}g • C: {meal.carbs}g • F: {meal.fat}g
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="rounded-lg bg-[hsl(var(--color-surface-1))] p-4">
              <h3 className="mb-2 text-sm font-medium">Nutrition Insights</h3>
              <div className="space-y-2">
                {nutritionData.insights.map((insight, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                    <p className="text-sm">{insight}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NutritionDashboard;