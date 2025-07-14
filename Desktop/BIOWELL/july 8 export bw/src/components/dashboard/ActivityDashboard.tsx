import { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Footprints, Flame, Heart, Clock, TrendingUp, TrendingDown, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ActivityDashboardProps {
  userId?: string;
}

const ActivityDashboard = ({ userId }: ActivityDashboardProps) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [showDetails, setShowDetails] = useState(false);
  
  // Mock activity data
  const activityData = {
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

  // Prepare chart data for daily activity
  const stepsData = {
    labels: activityData.dailyActivity.map(day => day.date),
    datasets: [
      {
        label: 'Steps',
        data: activityData.dailyActivity.map(day => day.steps),
        backgroundColor: '#3b82f6',
        borderColor: '#3b82f6',
        borderWidth: 1,
      },
    ],
  };

  // Prepare chart data for calories burned
  const caloriesData = {
    labels: activityData.dailyActivity.map(day => day.date),
    datasets: [
      {
        label: 'Calories',
        data: activityData.dailyActivity.map(day => day.calories),
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4,
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
          callback: (value: any) => `${value.toLocaleString()}`,
        },
      },
    },
  };

  const lineChartOptions = {
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
          callback: (value: any) => `${value} cal`,
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-12">
        {/* Activity Score Card */}
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
                  <Activity className="h-5 w-5 text-blue-500" />
                  Activity Score
                </h2>
                <div className="flex items-center text-success">
                  {activityData.trend === 'up' ? (
                    <TrendingUp className="mr-1 h-4 w-4" />
                  ) : activityData.trend === 'down' ? (
                    <TrendingDown className="mr-1 h-4 w-4 text-error" />
                  ) : null}
                  <span className="text-xs font-medium">
                    {activityData.trend === 'up' ? '+' : activityData.trend === 'down' ? '-' : ''}
                    {activityData.change}%
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
                    {/* Progress circle - steps percentage of 10,000 goal */}
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="8"
                      strokeDasharray={2 * Math.PI * 45}
                      strokeDashoffset={2 * Math.PI * 45 * (1 - activityData.totalSteps / 10000)}
                    />
                  </svg>
                  {/* Steps text */}
                  <div className="absolute flex flex-col items-center">
                    <span className="text-2xl font-bold sm:text-3xl">
                      {activityData.totalSteps.toLocaleString()}
                    </span>
                    <span className="text-xs text-text-light">steps today</span>
                  </div>
                </div>
                
                <div className="mt-3 text-center">
                  <h3 className="text-base font-semibold text-blue-600 sm:text-lg">Active</h3>
                  <p className="mt-1 text-xs text-text-light sm:text-sm">
                    {Math.round(activityData.totalSteps / 10000 * 100)}% of daily goal
                  </p>
                </div>
              </div>
              
              <div className="mt-4 rounded-lg bg-[hsl(var(--color-surface-1))] p-3 sm:mt-6">
                <h4 className="text-xs font-medium sm:text-sm">Top Recommendation</h4>
                <p className="mt-1 text-xs text-text-light">
                  Add a 15-minute evening walk to reach your 10,000 step goal.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Activity Metrics Overview */}
        <div className="md:col-span-8">
          <div className="h-full rounded-xl bg-[hsl(var(--color-card))] p-4 shadow-sm sm:p-6">
            <div className="mb-4">
              <h2 className="text-base font-bold text-text sm:text-lg">Activity Metrics</h2>
              <p className="text-xs text-text-light sm:text-sm">Today's activity breakdown</p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-3 transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                    <Footprints className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium text-amber-500">
                    {activityData.totalSteps < 10000 ? 'Improve' : 'Good'}
                  </span>
                </div>
                <div className="mt-2">
                  <h3 className="text-xs font-medium text-text-light sm:text-sm">
                    Daily Steps
                  </h3>
                  <div className="mt-1 flex items-baseline">
                    <span className="text-base font-semibold text-text sm:text-xl">
                      {activityData.totalSteps.toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-1">
                    <span className="text-xs text-text-light">
                      Target: 10,000
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-3 transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div className="rounded-lg bg-red-50 p-2 text-red-600 dark:bg-red-900/20 dark:text-red-400">
                    <Flame className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium text-success">
                    Good
                  </span>
                </div>
                <div className="mt-2">
                  <h3 className="text-xs font-medium text-text-light sm:text-sm">
                    Calories
                  </h3>
                  <div className="mt-1 flex items-baseline">
                    <span className="text-base font-semibold text-text sm:text-xl">
                      {activityData.caloriesBurned}
                    </span>
                    <span className="ml-1 text-xs text-text-light sm:text-sm">
                      kcal
                    </span>
                  </div>
                  <div className="mt-1">
                    <span className="text-xs text-text-light">
                      Target: 400+ kcal
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-3 transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div className="rounded-lg bg-green-50 p-2 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                    <Clock className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium text-success">
                    Good
                  </span>
                </div>
                <div className="mt-2">
                  <h3 className="text-xs font-medium text-text-light sm:text-sm">
                    Active Minutes
                  </h3>
                  <div className="mt-1 flex items-baseline">
                    <span className="text-base font-semibold text-text sm:text-xl">
                      {activityData.activeMinutes}
                    </span>
                    <span className="ml-1 text-xs text-text-light sm:text-sm">
                      min
                    </span>
                  </div>
                  <div className="mt-1">
                    <span className="text-xs text-text-light">
                      Target: 60+ min
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-3 transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div className="rounded-lg bg-purple-50 p-2 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400">
                    <Heart className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium text-success">
                    Excellent
                  </span>
                </div>
                <div className="mt-2">
                  <h3 className="text-xs font-medium text-text-light sm:text-sm">
                    Avg Heart Rate
                  </h3>
                  <div className="mt-1 flex items-baseline">
                    <span className="text-base font-semibold text-text sm:text-xl">
                      {activityData.avgHeartRate}
                    </span>
                    <span className="ml-1 text-xs text-text-light sm:text-sm">
                      bpm
                    </span>
                  </div>
                  <div className="mt-1">
                    <span className="text-xs text-text-light">
                      Target: 60-70 bpm
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Steps Chart */}
      <div className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-4 sm:p-6">
        <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <h2 className="text-lg font-bold">Daily Steps</h2>
          
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
          <Bar data={stepsData} options={barChartOptions} />
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg bg-[hsl(var(--color-surface-1))] p-3">
            <div className="text-xs text-text-light">Weekly Average</div>
            <div className="text-lg font-semibold">{activityData.weeklyAverage.toLocaleString()} steps</div>
          </div>
          <div className="rounded-lg bg-[hsl(var(--color-surface-1))] p-3">
            <div className="text-xs text-text-light">Best Day</div>
            <div className="text-lg font-semibold">10,200 steps</div>
          </div>
          <div className="rounded-lg bg-[hsl(var(--color-surface-1))] p-3">
            <div className="text-xs text-text-light">Goal Completion</div>
            <div className="text-lg font-semibold">78%</div>
          </div>
          <div className="rounded-lg bg-[hsl(var(--color-surface-1))] p-3">
            <div className="text-xs text-text-light">Weekly Trend</div>
            <div className="flex items-center text-lg font-semibold text-success">
              <TrendingUp className="mr-1 h-5 w-5" />
              +12%
            </div>
          </div>
        </div>
      </div>

      {/* Calories Chart */}
      <div className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-4 sm:p-6">
        <h2 className="mb-4 text-lg font-bold">Calories Burned</h2>
        <div className="h-64">
          <Line data={caloriesData} options={lineChartOptions} />
        </div>
      </div>

      {/* Workouts */}
      <div className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Recent Workouts</h2>
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
          {activityData.workouts.map((workout, index) => (
            <div key={index} className="flex items-center justify-between rounded-lg bg-[hsl(var(--color-surface-1))] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">{workout.type}</h3>
                  <p className="text-sm text-text-light">{workout.date} • {workout.duration} min</p>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium">{workout.calories} kcal</div>
                <div className="text-sm text-text-light">burned</div>
              </div>
            </div>
          ))}
        </div>
        
        {showDetails && (
          <div className="mt-4 space-y-4 border-t border-[hsl(var(--color-border))] pt-4">
            <div className="rounded-lg bg-[hsl(var(--color-surface-1))] p-4">
              <h3 className="mb-2 text-sm font-medium">Heart Rate Zones</h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                <div className="rounded-lg bg-[hsl(var(--color-card))] p-2 text-center text-sm">
                  <div className="text-xs text-text-light">Rest</div>
                  <div className="font-medium">{activityData.heartRateZones.rest} bpm</div>
                </div>
                <div className="rounded-lg bg-[hsl(var(--color-card))] p-2 text-center text-sm">
                  <div className="text-xs text-text-light">Light</div>
                  <div className="font-medium">{activityData.heartRateZones.light} bpm</div>
                </div>
                <div className="rounded-lg bg-[hsl(var(--color-card))] p-2 text-center text-sm">
                  <div className="text-xs text-text-light">Moderate</div>
                  <div className="font-medium">{activityData.heartRateZones.moderate} bpm</div>
                </div>
                <div className="rounded-lg bg-[hsl(var(--color-card))] p-2 text-center text-sm">
                  <div className="text-xs text-text-light">Vigorous</div>
                  <div className="font-medium">{activityData.heartRateZones.vigorous} bpm</div>
                </div>
                <div className="rounded-lg bg-[hsl(var(--color-card))] p-2 text-center text-sm">
                  <div className="text-xs text-text-light">Max</div>
                  <div className="font-medium">{activityData.heartRateZones.max} bpm</div>
                </div>
              </div>
            </div>
            
            <div className="rounded-lg bg-[hsl(var(--color-surface-1))] p-4">
              <h3 className="mb-2 text-sm font-medium">Activity Insights</h3>
              <div className="space-y-2">
                {activityData.insights.map((insight, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" />
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

export default ActivityDashboard;