import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
  ChartData,
  TooltipItem
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useSupabase } from '../../contexts/SupabaseContext';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Activity, TrendingUp, TrendingDown, Clock, Coffee, Utensils, Moon, AlertCircle, ChevronDown, ChevronUp, Zap, Heart } from 'lucide-react';

// Register the required Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface HealthTrendsProps {
  userId: string;
}

interface GlucoseDataPoint {
  timestamp: Date;
  glucose: number;
  events?: {
    type: string;
    label: string;
  }[];
}

interface GlucoseStats {
  average: number;
  timeInRange: number;
  peak: number;
  trough: number;
  variability: number;
}

const HealthTrends = ({ userId }: HealthTrendsProps) => {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [showChartDetails, setShowChartDetails] = useState(false);
  const [showInsightDetails, setShowInsightDetails] = useState(false);
  const [glucoseData, setGlucoseData] = useState<GlucoseDataPoint[]>([]);
  const [glucoseStats, setGlucoseStats] = useState<GlucoseStats>({
    average: 0,
    timeInRange: 0,
    peak: 0,
    trough: 0,
    variability: 0
  });
  const [chartData, setChartData] = useState<ChartData<'line'> | null>(null);
  const chartRef = useRef<ChartJS | null>(null);
  const { currentTheme } = useTheme();

  const { supabase } = useSupabase();
  const { isDemo } = useAuth();

  // Event type to color mapping
  const eventColors = {
    meal: 'rgba(234, 88, 12, 0.8)', // Orange
    exercise: 'rgba(22, 163, 74, 0.8)', // Green
    sleep: 'rgba(79, 70, 229, 0.8)', // Indigo
    medication: 'rgba(219, 39, 119, 0.8)', // Pink
    stress: 'rgba(202, 138, 4, 0.8)', // Yellow
    default: 'rgba(107, 114, 128, 0.8)' // Gray
  };

  // Event type to icon mapping
  const eventIcons = {
    meal: <Utensils className="h-4 w-4" />,
    exercise: <Zap className="h-4 w-4" />,
    sleep: <Moon className="h-4 w-4" />,
    medication: <Activity className="h-4 w-4" />,
    stress: <Heart className="h-4 w-4" />,
    default: <Activity className="h-4 w-4" />
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // In a real app, fetch data from Supabase
        if (!isDemo) {
          const { data, error } = await supabase
            .from('cgm_data')
            .select('*')
            .eq('user_id', userId)
            .order('timestamp', { ascending: true });
          
          if (error) throw error;
          
          if (data && data.length > 0) {
            const formattedData = data.map(item => ({
              timestamp: new Date(item.timestamp),
              glucose: item.glucose,
              events: item.events || []
            }));
            
            processGlucoseData(formattedData);
            return;
          }
        }
        
        // Generate demo data if no real data exists or in demo mode
        const demoData = generateDemoGlucoseData(timeRange);
        processGlucoseData(demoData);
      } catch (error) {
        console.error('Error fetching glucose data:', error);
        // Fallback to demo data on error
        const demoData = generateDemoGlucoseData(timeRange);
        processGlucoseData(demoData);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, timeRange, supabase, isDemo]);

  const generateDemoGlucoseData = (range: '24h' | '7d' | '30d'): GlucoseDataPoint[] => {
    const data: GlucoseDataPoint[] = [];
    const now = new Date();
    let points: number;
    let interval: number;
    
    // Determine number of data points and interval based on time range
    switch (range) {
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

  const processGlucoseData = (data: GlucoseDataPoint[]) => {
    if (data.length === 0) return;
    
    // Calculate statistics
    const glucoseValues = data.map(d => d.glucose);
    const average = Math.round(glucoseValues.reduce((sum, val) => sum + val, 0) / glucoseValues.length);
    const peak = Math.max(...glucoseValues);
    const trough = Math.min(...glucoseValues);
    const inRange = glucoseValues.filter(val => val >= 70 && val <= 140).length;
    const timeInRange = Math.round((inRange / glucoseValues.length) * 100);
    
    // Calculate variability (standard deviation)
    const variance = glucoseValues.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / glucoseValues.length;
    const variability = Math.round(Math.sqrt(variance));
    
    setGlucoseStats({
      average,
      timeInRange,
      peak,
      trough,
      variability
    });
    
    setGlucoseData(data);
    
    // Format data for Chart.js
    const formattedData = formatChartData(data);
    setChartData(formattedData);
  };

  const formatChartData = (data: GlucoseDataPoint[]): ChartData<'line'> => {
    // Format timestamps based on time range
    const labels = data.map(d => {
      const date = new Date(d.timestamp);
      if (timeRange === '24h') {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else if (timeRange === '7d') {
        return `${date.toLocaleDateString([], { weekday: 'short' })} ${date.toLocaleTimeString([], { hour: '2-digit' })}`;
      } else {
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      }
    });
    
    // Create datasets
    const datasets = [
      {
        label: 'Glucose (mg/dL)',
        data: data.map(d => d.glucose),
        borderColor: currentTheme === 'dark' ? 'rgba(59, 130, 246, 0.8)' : 'rgba(37, 99, 235, 0.8)',
        backgroundColor: currentTheme === 'dark' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(37, 99, 235, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: (ctx: any) => {
          const index = ctx.dataIndex;
          return data[index].events && data[index].events!.length > 0 ? 6 : 2;
        },
        pointBackgroundColor: (ctx: any) => {
          const index = ctx.dataIndex;
          if (data[index].events && data[index].events!.length > 0) {
            const eventType = data[index].events![0].type;
            return eventColors[eventType as keyof typeof eventColors] || eventColors.default;
          }
          return currentTheme === 'dark' ? 'rgba(59, 130, 246, 0.8)' : 'rgba(37, 99, 235, 0.8)';
        },
        pointBorderColor: (ctx: any) => {
          const index = ctx.dataIndex;
          if (data[index].events && data[index].events!.length > 0) {
            return '#ffffff';
          }
          return currentTheme === 'dark' ? 'rgba(59, 130, 246, 0.8)' : 'rgba(37, 99, 235, 0.8)';
        },
        pointBorderWidth: (ctx: any) => {
          const index = ctx.dataIndex;
          return data[index].events && data[index].events!.length > 0 ? 2 : 1;
        },
        pointHoverRadius: 8,
      }
    ];
    
    return { labels, datasets };
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: currentTheme === 'dark' ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        titleColor: currentTheme === 'dark' ? '#ffffff' : '#111827',
        bodyColor: currentTheme === 'dark' ? '#cbd5e1' : '#4b5563',
        borderColor: currentTheme === 'dark' ? 'rgba(71, 85, 105, 0.5)' : 'rgba(229, 231, 235, 0.8)',
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (context: TooltipItem<'line'>) => {
            let label = `Glucose: ${context.parsed.y} mg/dL`;
            
            // Add event information if available
            const index = context.dataIndex;
            const dataPoint = glucoseData[index];
            if (dataPoint?.events && dataPoint.events.length > 0) {
              dataPoint.events.forEach(event => {
                label += `\n${event.type.charAt(0).toUpperCase() + event.type.slice(1)}: ${event.label}`;
              });
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
          color: currentTheme === 'dark' ? 'rgba(71, 85, 105, 0.2)' : 'rgba(229, 231, 235, 0.6)',
        },
        ticks: {
          maxTicksLimit: 8,
          color: currentTheme === 'dark' ? '#94a3b8' : '#6b7280',
          font: {
            size: 10,
          },
        },
      },
      y: {
        min: 60,
        max: 180,
        grid: {
          color: currentTheme === 'dark' ? 'rgba(71, 85, 105, 0.2)' : 'rgba(229, 231, 235, 0.6)',
        },
        ticks: {
          stepSize: 30,
          color: currentTheme === 'dark' ? '#94a3b8' : '#6b7280',
          font: {
            size: 10,
          },
          callback: (value) => `${value} mg/dL`,
        },
        // Add target range bands
        afterDraw: (chart) => {
          const ctx = chart.ctx;
          const yAxis = chart.scales.y;
          const width = chart.width;
          
          // Target range (70-140 mg/dL)
          const targetRangeBottom = yAxis.getPixelForValue(70);
          const targetRangeTop = yAxis.getPixelForValue(140);
          const targetRangeHeight = targetRangeBottom - targetRangeTop;
          
          ctx.save();
          ctx.fillStyle = currentTheme === 'dark' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.1)';
          ctx.fillRect(0, targetRangeTop, width, targetRangeHeight);
          ctx.restore();
        },
      },
    },
    elements: {
      line: {
        borderWidth: 2,
      },
      point: {
        hitRadius: 8,
      },
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
  };

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center sm:h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Primary Metrics - Always Visible */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs text-text-light sm:text-sm">Current</span>
            <Activity className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
          </div>
          <div className="text-sm font-bold text-primary sm:text-base">
            {glucoseData.length > 0 ? `${glucoseData[glucoseData.length - 1].glucose} mg/dL` : 'N/A'}
          </div>
        </div>

        <div className="rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs text-text-light sm:text-sm">In Range</span>
            <Activity className="h-4 w-4 text-success sm:h-5 sm:w-5" />
          </div>
          <div className="text-sm font-bold text-success sm:text-base">{glucoseStats.timeInRange}%</div>
        </div>

        <div className="rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs text-text-light sm:text-sm">Average</span>
            <Activity className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
          </div>
          <div className="text-sm font-bold text-primary sm:text-base">{glucoseStats.average} mg/dL</div>
        </div>

        <div className="rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs text-text-light sm:text-sm">Variability</span>
            <Activity className="h-4 w-4 text-warning sm:h-5 sm:w-5" />
          </div>
          <div className="text-sm font-bold text-warning sm:text-base">±{glucoseStats.variability} mg/dL</div>
        </div>
      </div>

      {/* Primary Insight - Always Visible */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-lg border border-warning/20 bg-warning/5 p-3 sm:p-4"
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-warning sm:h-5 sm:w-5" />
          <div>
            <h3 className="text-sm font-medium text-warning sm:text-base">Post-Meal Glucose Response</h3>
            <p className="mt-1 text-xs text-text-light sm:text-sm">
              Your blood sugar shows significant variability after meals. Consider implementing pre-bolusing and adding more fiber to your meals to flatten the curve.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Expandable Chart Section */}
      <div className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))]">
        <button
          onClick={() => setShowChartDetails(!showChartDetails)}
          className="flex w-full items-center justify-between p-4"
          aria-expanded={showChartDetails}
          aria-controls="glucose-chart-details"
        >
          <h3 className="text-sm font-semibold sm:text-base">Glucose Trends</h3>
          {showChartDetails ? (
            <ChevronUp className="h-5 w-5 text-text-light" />
          ) : (
            <ChevronDown className="h-5 w-5 text-text-light" />
          )}
        </button>

        <AnimatePresence>
          {showChartDetails && (
            <motion.div
              id="glucose-chart-details"
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
                    aria-pressed={timeRange === range}
                  >
                    {range}
                  </button>
                ))}
              </div>
              
              {/* CGM Chart with Annotations */}
              <div className="h-64 sm:h-80" aria-label="Continuous Glucose Monitor data visualization">
                {chartData && (
                  <Line 
                    data={chartData} 
                    options={chartOptions}
                    ref={(ref) => {
                      if (ref) {
                        chartRef.current = ref.chart;
                      }
                    }}
                  />
                )}
              </div>
              
              {/* Event Legend */}
              <div className="mt-4 flex flex-wrap gap-3 border-t border-[hsl(var(--color-border))] pt-4">
                <div className="text-xs font-medium text-text-light">Events:</div>
                {Object.entries(eventIcons).map(([type, icon]) => (
                  <div key={type} className="flex items-center gap-1 text-xs">
                    <span 
                      className="inline-block h-3 w-3 rounded-full" 
                      style={{ backgroundColor: eventColors[type as keyof typeof eventColors] }}
                    ></span>
                    <span className="flex items-center gap-1">
                      {icon}
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </span>
                  </div>
                ))}
              </div>
              
              {/* Glucose Statistics */}
              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[hsl(var(--color-border))] pt-4 sm:grid-cols-5">
                <div className="rounded-lg bg-[hsl(var(--color-surface-1))] p-2 text-center">
                  <div className="text-xs text-text-light">Average</div>
                  <div className="text-sm font-semibold">{glucoseStats.average} mg/dL</div>
                </div>
                <div className="rounded-lg bg-[hsl(var(--color-surface-1))] p-2 text-center">
                  <div className="text-xs text-text-light">Time in Range</div>
                  <div className="text-sm font-semibold">{glucoseStats.timeInRange}%</div>
                </div>
                <div className="rounded-lg bg-[hsl(var(--color-surface-1))] p-2 text-center">
                  <div className="text-xs text-text-light">Peak</div>
                  <div className="text-sm font-semibold">{glucoseStats.peak} mg/dL</div>
                </div>
                <div className="rounded-lg bg-[hsl(var(--color-surface-1))] p-2 text-center">
                  <div className="text-xs text-text-light">Lowest</div>
                  <div className="text-sm font-semibold">{glucoseStats.trough} mg/dL</div>
                </div>
                <div className="rounded-lg bg-[hsl(var(--color-surface-1))] p-2 text-center">
                  <div className="text-xs text-text-light">Variability</div>
                  <div className="text-sm font-semibold">±{glucoseStats.variability} mg/dL</div>
                </div>
              </div>
              
              {/* Analysis Summary */}
              <div className="mt-4 rounded-lg bg-[hsl(var(--color-surface-1))] p-3">
                <h4 className="mb-2 text-xs font-medium">Analysis</h4>
                <p className="text-xs text-text-light">
                  Your glucose patterns show significant spikes after meals, especially breakfast (+45 mg/dL) and lunch (+35 mg/dL).
                  Consider adding protein and fiber before carbs, and taking a 10-minute walk after meals to reduce these spikes.
                  Your fasting glucose is stable at 85 mg/dL, which is excellent.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Expandable Additional Insights */}
      <div className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))]">
        <button
          onClick={() => setShowInsightDetails(!showInsightDetails)}
          className="flex w-full items-center justify-between p-4"
          aria-expanded={showInsightDetails}
          aria-controls="glucose-insights"
        >
          <h3 className="text-sm font-semibold sm:text-base">Additional Insights</h3>
          {showInsightDetails ? (
            <ChevronUp className="h-5 w-5 text-text-light" />
          ) : (
            <ChevronDown className="h-5 w-5 text-text-light" />
          )}
        </button>

        <AnimatePresence>
          {showInsightDetails && (
            <motion.div
              id="glucose-insights"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-3 border-t border-[hsl(var(--color-border))] p-4"
            >
              <div className="flex items-center gap-3">
                <TrendingUp className="h-4 w-4 text-success sm:h-5 sm:w-5" />
                <p className="text-xs sm:text-sm">Morning walks have reduced your post-breakfast glucose spike by 22% on average</p>
              </div>
              <div className="flex items-center gap-3">
                <Coffee className="h-4 w-4 text-warning sm:h-5 sm:w-5" />
                <p className="text-xs sm:text-sm">Caffeine intake after 2 PM appears to increase your evening glucose levels by 8-12 mg/dL</p>
              </div>
              <div className="flex items-center gap-3">
                <TrendingDown className="h-4 w-4 text-error sm:h-5 sm:w-5" />
                <p className="text-xs sm:text-sm">Late evening meals (after 8 PM) are associated with higher overnight glucose and poorer sleep quality</p>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
                <p className="text-xs sm:text-sm">Your optimal meal timing appears to be: Breakfast 7-8 AM, Lunch 12-1 PM, Dinner 6-7 PM</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default HealthTrends;