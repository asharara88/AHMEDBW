import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import { Activity, TrendingUp, TrendingDown, Clock, Coffee, Utensils, Moon, AlertCircle } from 'lucide-react';

interface MetabolicHealthProps {
  userId: string;
}

interface GlucoseData {
  timestamp: string;
  value: number;
  event?: {
    type: 'meal' | 'exercise' | 'sleep' | 'stress';
    description: string;
  };
}

interface MetabolicInsight {
  type: 'success' | 'warning' | 'info';
  title: string;
  description: string;
  recommendation: string;
}

const MetabolicHealth = ({ userId }: MetabolicHealthProps) => {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');
  const [glucoseData, setGlucoseData] = useState<GlucoseData[]>([]);
  const [insights, setInsights] = useState<MetabolicInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [showChartDetails, setShowChartDetails] = useState(false);
  const [showInsightDetails, setShowInsightDetails] = useState(false);

  // Demo data generation
  useEffect(() => {
    const generateDemoData = () => {
      const now = new Date();
      const data: GlucoseData[] = [];
      const hours = timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : 720;
      
      for (let i = hours; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000).toISOString();
        let value = 85 + Math.sin(i / 4) * 15 + Math.random() * 10;

        // Add meal spikes
        if (i % 6 === 0) {
          value += 25;
          data.push({
            timestamp,
            value,
            event: {
              type: 'meal',
              description: 'Meal time',
            },
          });
        } else {
          data.push({ timestamp, value });
        }
      }

      setGlucoseData(data);
      
      // Generate insights
      setInsights([
        {
          type: 'success',
          title: 'Stable Morning Glucose',
          description: 'Your morning glucose levels have been consistently stable between 80-95 mg/dL.',
          recommendation: 'Continue your current morning routine, including protein-rich breakfast.',
        },
        {
          type: 'warning',
          title: 'Post-Lunch Spike Detected',
          description: 'Your glucose shows significant spikes after lunch, averaging +45 mg/dL.',
          recommendation: 'Try eating protein and fiber before carbs to flatten the curve.',
        },
        {
          type: 'info',
          title: 'Exercise Impact',
          description: 'Walking after meals reduces glucose spikes by 30% on average.',
          recommendation: 'Take a 10-minute walk after meals to improve glucose response.',
        },
      ]);

      setLoading(false);
    };

    generateDemoData();
  }, [timeRange]);

  const chartData = {
    labels: glucoseData.map(d => new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })),
    datasets: [
      {
        label: 'Glucose (mg/dL)',
        data: glucoseData.map(d => d.value),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
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
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#111827',
        bodyColor: '#4b5563',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (context: any) => {
            const dataPoint = glucoseData[context.dataIndex];
            let label = `Glucose: ${context.parsed.y.toFixed(0)} mg/dL`;
            if (dataPoint.event) {
              label += ` (${dataPoint.event.description})`;
            }
            return label;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxTicksLimit: 6,
          color: '#6b7280',
          font: {
            size: 10,
          },
        },
      },
      y: {
        min: 60,
        max: 160,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          stepSize: 20,
          color: '#6b7280',
          font: {
            size: 10,
          },
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center sm:h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const currentGlucose = glucoseData[glucoseData.length - 1].value;
  const timeInRange = 85;
  const dailyAverage = 102;
  const variability = 15;

  return (
    <div className="space-y-4">
      {/* Primary Metrics - Always Visible */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs text-text-light sm:text-sm">Current</span>
            <Activity className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
          </div>
          <div className="text-sm font-bold text-primary sm:text-base">{currentGlucose.toFixed(0)} mg/dL</div>
        </div>

        <div className="rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs text-text-light sm:text-sm">In Range</span>
            <Activity className="h-4 w-4 text-success sm:h-5 sm:w-5" />
          </div>
          <div className="text-sm font-bold text-success sm:text-base">{timeInRange}%</div>
        </div>

        <div className="rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs text-text-light sm:text-sm">Average</span>
            <Activity className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
          </div>
          <div className="text-sm font-bold text-primary sm:text-base">{dailyAverage} mg/dL</div>
        </div>

        <div className="rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs text-text-light sm:text-sm">Variability</span>
            <Activity className="h-4 w-4 text-warning sm:h-5 sm:w-5" />
          </div>
          <div className="text-sm font-bold text-warning sm:text-base">±{variability} mg/dL</div>
        </div>
      </div>

      {/* Primary Insight - Always Visible */}
      {insights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-warning/20 bg-warning/5 p-3 sm:p-4"
        >
          <div className="mb-2 flex items-start justify-between">
            <span className="text-sm font-medium sm:text-base">{insights[0].title}</span>
            <AlertCircle className="h-4 w-4 text-warning sm:h-5 sm:w-5" />
          </div>
          <p className="text-xs text-text-light sm:text-sm">{insights[0].recommendation}</p>
        </motion.div>
      )}

      {/* Expandable Chart Section */}
      <div className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))]">
        <button
          onClick={() => setShowChartDetails(!showChartDetails)}
          className="flex w-full items-center justify-between p-4"
        >
          <h3 className="text-sm font-semibold sm:text-base">Glucose Trends</h3>
          {showChartDetails ? (
            <ChevronUp className="h-5 w-5 text-text-light" />
          ) : (
            <ChevronDown className="h-5 w-5 text-text-light" />
          )}
        </button>

        {showChartDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-[hsl(var(--color-border))] p-4"
          >
            <div className="mb-4 flex gap-2">
              {(['24h', '7d', '30d'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`min-h-[32px] rounded-lg px-3 py-1 text-xs font-medium transition-colors sm:min-h-[36px] ${
                    timeRange === range
                      ? 'bg-primary text-white'
                      : 'bg-[hsl(var(--color-card-hover))] text-text-light hover:text-text'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
            <div className="h-48 sm:h-64">
              <Line data={chartData} options={chartOptions} />
            </div>
          </motion.div>
        )}
      </div>

      {/* Expandable Additional Insights */}
      {insights.length > 1 && (
        <div className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))]">
          <button
            onClick={() => setShowInsightDetails(!showInsightDetails)}
            className="flex w-full items-center justify-between p-4"
          >
            <h3 className="text-sm font-semibold sm:text-base">Additional Insights</h3>
            {showInsightDetails ? (
              <ChevronUp className="h-5 w-5 text-text-light" />
            ) : (
              <ChevronDown className="h-5 w-5 text-text-light" />
            )}
          </button>

          {showInsightDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-3 border-t border-[hsl(var(--color-border))] p-4"
            >
              {insights.slice(1).map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`rounded-lg border p-3 ${
                    insight.type === 'success'
                      ? 'border-success/20 bg-success/5'
                      : insight.type === 'warning'
                      ? 'border-warning/20 bg-warning/5'
                      : 'border-primary/20 bg-primary/5'
                  }`}
                >
                  <div className="mb-2 flex items-start justify-between">
                    <span className="text-sm font-medium">{insight.title}</span>
                    <AlertCircle className={`h-4 w-4 ${
                      insight.type === 'success'
                        ? 'text-success'
                        : insight.type === 'warning'
                        ? 'text-warning'
                        : 'text-primary'
                    }`} />
                  </div>
                  <p className="mb-2 text-xs text-text-light">{insight.description}</p>
                  <p className="text-xs font-medium">
                    Recommendation: {insight.recommendation}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};

export default MetabolicHealth;