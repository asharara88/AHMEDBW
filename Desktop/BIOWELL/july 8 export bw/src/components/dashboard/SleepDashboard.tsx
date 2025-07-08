import { useState } from 'react';
import { motion } from 'framer-motion';
import { Moon, Clock, Activity, TrendingUp, TrendingDown, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
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

interface SleepDashboardProps {
  userId?: string;
}

const SleepDashboard = ({ userId }: SleepDashboardProps) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [showDetails, setShowDetails] = useState(false);
  
  // Mock sleep data
  const sleepData = {
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

  // Prepare chart data for sleep timeline
  const sleepTimelineData = {
    labels: sleepData.sleepTimeline.map(day => day.date),
    datasets: [
      {
        label: 'Deep Sleep',
        data: sleepData.sleepTimeline.map(day => day.deep),
        backgroundColor: '#8b5cf6', // Violet
        stack: 'Stack 0',
      },
      {
        label: 'REM Sleep',
        data: sleepData.sleepTimeline.map(day => day.rem),
        backgroundColor: '#3b82f6', // Blue
        stack: 'Stack 0',
      },
      {
        label: 'Light Sleep',
        data: sleepData.sleepTimeline.map(day => day.light),
        backgroundColor: '#93c5fd', // Light blue
        stack: 'Stack 0',
      },
    ],
  };

  // Prepare chart data for sleep quality
  const sleepQualityData = {
    labels: sleepData.sleepQuality.map(day => day.date),
    datasets: [
      {
        label: 'Sleep Score',
        data: sleepData.sleepQuality.map(day => day.score),
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
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
        stacked: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
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
        min: 50,
        max: 100,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-12">
        {/* Sleep Score Card */}
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
                  <Moon className="h-5 w-5 text-indigo-500" />
                  Sleep Score
                </h2>
                <div className="flex items-center text-success">
                  {sleepData.trend === 'up' ? (
                    <TrendingUp className="mr-1 h-4 w-4" />
                  ) : sleepData.trend === 'down' ? (
                    <TrendingDown className="mr-1 h-4 w-4 text-error" />
                  ) : null}
                  <span className="text-xs font-medium">
                    {sleepData.trend === 'up' ? '+' : sleepData.trend === 'down' ? '-' : ''}
                    {sleepData.change} pts
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
                    {/* Progress circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#8b5cf6"
                      strokeWidth="8"
                      strokeDasharray={2 * Math.PI * 45}
                      strokeDashoffset={2 * Math.PI * 45 * (1 - sleepData.sleepScore / 100)}
                    />
                  </svg>
                  {/* Score text */}
                  <div className="absolute flex flex-col items-center">
                    <span className="text-2xl font-bold sm:text-3xl">
                      {sleepData.sleepScore}
                    </span>
                    <span className="text-xs text-text-light">out of 100</span>
                  </div>
                </div>
                
                <div className="mt-3 text-center">
                  <h3 className="text-base font-semibold text-indigo-600 sm:text-lg">Good</h3>
                  <p className="mt-1 text-xs text-text-light sm:text-sm">
                    Your sleep quality is above average
                  </p>
                </div>
              </div>
              
              <div className="mt-4 rounded-lg bg-[hsl(var(--color-surface-1))] p-3 sm:mt-6">
                <h4 className="text-xs font-medium sm:text-sm">Top Recommendation</h4>
                <p className="mt-1 text-xs text-text-light">
                  Maintain your consistent bedtime routine to further improve deep sleep quality.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Sleep Metrics Overview */}
        <div className="md:col-span-8">
          <div className="h-full rounded-xl bg-[hsl(var(--color-card))] p-4 shadow-sm sm:p-6">
            <div className="mb-4">
              <h2 className="text-base font-bold text-text sm:text-lg">Sleep Metrics</h2>
              <p className="text-xs text-text-light sm:text-sm">Last night's sleep breakdown</p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-3 transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
                    <Clock className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium text-success">
                    Good
                  </span>
                </div>
                <div className="mt-2">
                  <h3 className="text-xs font-medium text-text-light sm:text-sm">
                    Total Sleep
                  </h3>
                  <div className="mt-1 flex items-baseline">
                    <span className="text-base font-semibold text-text sm:text-xl">
                      {sleepData.totalSleep}
                    </span>
                    <span className="ml-1 text-xs text-text-light sm:text-sm">
                      hrs
                    </span>
                  </div>
                  <div className="mt-1">
                    <span className="text-xs text-text-light">
                      Target: 7-9 hrs
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-3 transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div className="rounded-lg bg-purple-50 p-2 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400">
                    <Moon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium text-success">
                    Optimal
                  </span>
                </div>
                <div className="mt-2">
                  <h3 className="text-xs font-medium text-text-light sm:text-sm">
                    Deep Sleep
                  </h3>
                  <div className="mt-1 flex items-baseline">
                    <span className="text-base font-semibold text-text sm:text-xl">
                      {sleepData.deepSleep}
                    </span>
                    <span className="ml-1 text-xs text-text-light sm:text-sm">
                      hrs
                    </span>
                  </div>
                  <div className="mt-1">
                    <span className="text-xs text-text-light">
                      Target: 1.5-2 hrs
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-3 transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                    <Activity className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium text-success">
                    Good
                  </span>
                </div>
                <div className="mt-2">
                  <h3 className="text-xs font-medium text-text-light sm:text-sm">
                    REM Sleep
                  </h3>
                  <div className="mt-1 flex items-baseline">
                    <span className="text-base font-semibold text-text sm:text-xl">
                      {sleepData.remSleep}
                    </span>
                    <span className="ml-1 text-xs text-text-light sm:text-sm">
                      hrs
                    </span>
                  </div>
                  <div className="mt-1">
                    <span className="text-xs text-text-light">
                      Target: 1.5-2 hrs
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-3 transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div className="rounded-lg bg-amber-50 p-2 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
                    <Clock className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium text-amber-500">
                    Improve
                  </span>
                </div>
                <div className="mt-2">
                  <h3 className="text-xs font-medium text-text-light sm:text-sm">
                    Sleep Onset
                  </h3>
                  <div className="mt-1 flex items-baseline">
                    <span className="text-base font-semibold text-text sm:text-xl">
                      {sleepData.sleepOnset}
                    </span>
                    <span className="ml-1 text-xs text-text-light sm:text-sm">
                      min
                    </span>
                  </div>
                  <div className="mt-1">
                    <span className="text-xs text-text-light">
                      Target: &lt;15 min
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sleep Timeline Chart */}
      <div className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-4 sm:p-6">
        <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <h2 className="text-lg font-bold">Sleep Timeline</h2>
          
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
          <Bar data={sleepTimelineData} options={chartOptions} />
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg bg-[hsl(var(--color-surface-1))] p-3">
            <div className="text-xs text-text-light">Weekly Average</div>
            <div className="text-lg font-semibold">{sleepData.weeklyAverage} hrs</div>
          </div>
          <div className="rounded-lg bg-[hsl(var(--color-surface-1))] p-3">
            <div className="text-xs text-text-light">Best Night</div>
            <div className="text-lg font-semibold">8.2 hrs</div>
          </div>
          <div className="rounded-lg bg-[hsl(var(--color-surface-1))] p-3">
            <div className="text-xs text-text-light">Worst Night</div>
            <div className="text-lg font-semibold">6.8 hrs</div>
          </div>
          <div className="rounded-lg bg-[hsl(var(--color-surface-1))] p-3">
            <div className="text-xs text-text-light">Consistency</div>
            <div className="text-lg font-semibold">85%</div>
          </div>
        </div>
      </div>

      {/* Sleep Quality Chart */}
      <div className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-4 sm:p-6">
        <h2 className="mb-4 text-lg font-bold">Sleep Quality</h2>
        <div className="h-64">
          <Line data={sleepQualityData} options={lineChartOptions} />
        </div>
      </div>

      {/* Sleep Insights */}
      <div className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Sleep Insights</h2>
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
          {sleepData.insights.map((insight, index) => (
            <div key={index} className="flex items-start gap-3 rounded-lg bg-[hsl(var(--color-surface-1))] p-3">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-indigo-500" />
              <p className="text-sm">{insight}</p>
            </div>
          ))}
        </div>
        
        {showDetails && (
          <div className="mt-4 space-y-4 border-t border-[hsl(var(--color-border))] pt-4">
            <div className="rounded-lg bg-[hsl(var(--color-surface-1))] p-4">
              <h3 className="mb-2 text-sm font-medium">Sleep Environment</h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-lg bg-[hsl(var(--color-card))] p-2 text-center text-sm">
                  <div className="text-xs text-text-light">Temperature</div>
                  <div className="font-medium">68°F</div>
                  <div className="text-xs text-success">Optimal</div>
                </div>
                <div className="rounded-lg bg-[hsl(var(--color-card))] p-2 text-center text-sm">
                  <div className="text-xs text-text-light">Noise Level</div>
                  <div className="font-medium">Low</div>
                  <div className="text-xs text-success">Optimal</div>
                </div>
                <div className="rounded-lg bg-[hsl(var(--color-card))] p-2 text-center text-sm">
                  <div className="text-xs text-text-light">Light Level</div>
                  <div className="font-medium">Minimal</div>
                  <div className="text-xs text-success">Optimal</div>
                </div>
                <div className="rounded-lg bg-[hsl(var(--color-card))] p-2 text-center text-sm">
                  <div className="text-xs text-text-light">Humidity</div>
                  <div className="font-medium">45%</div>
                  <div className="text-xs text-success">Optimal</div>
                </div>
              </div>
            </div>
            
            <div className="rounded-lg bg-[hsl(var(--color-surface-1))] p-4">
              <h3 className="mb-2 text-sm font-medium">Sleep Factors</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Screen Time Before Bed</span>
                  <span className="text-sm text-amber-500">30 min</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Last Caffeine</span>
                  <span className="text-sm text-amber-500">2:00 PM</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Last Meal</span>
                  <span className="text-sm text-success">6:30 PM</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Exercise</span>
                  <span className="text-sm text-success">Morning</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SleepDashboard;