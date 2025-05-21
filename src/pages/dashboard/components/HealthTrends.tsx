import { useState, useEffect } from 'react';
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
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useSupabase } from '../../../contexts/SupabaseContext';
import { useAuth } from '../../../contexts/AuthContext';
import { logError } from '../../../utils/logger';

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

const HealthTrends = ({ userId }: HealthTrendsProps) => {
  const [selectedMetric, setSelectedMetric] = useState('bw_score');
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const { supabase } = useSupabase();
  const { isDemo } = useAuth();
  
  const metricOptions = [
    { value: 'bw_score', label: 'BW Score' },
    { value: 'health_score', label: 'Health Score' },
    { value: 'deep_sleep', label: 'Deep Sleep' },
    { value: 'steps', label: 'Steps' },
    { value: 'heart_rate', label: 'Heart Rate' },
    { value: 'recovery', label: 'Recovery' },
  ];
  
  useEffect(() => {
    const fetchTrendData = async () => {
      if (!userId) return;
      
      setLoading(true);
      
      try {
        // For demo or if no real data exists, generate mock data
        const labels = [
          'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun',
        ];
        
        let mockData;
        
        switch (selectedMetric) {
          case 'bw_score':
            mockData = [68, 70, 69, 72, 74, 73, 76];
            break;
          case 'health_score':
            mockData = [72, 75, 74, 78, 76, 80, 82];
            break;
          case 'deep_sleep':
            mockData = [1.2, 1.5, 1.3, 1.4, 1.7, 1.8, 1.5];
            break;
          case 'steps':
            mockData = [5200, 7300, 6800, 8200, 7500, 9100, 8500];
            break;
          case 'heart_rate':
            mockData = [68, 72, 70, 67, 65, 66, 64];
            break;
          case 'recovery':
            mockData = [65, 68, 64, 70, 72, 75, 78];
            break;
          default:
            mockData = [72, 75, 74, 78, 76, 80, 82];
        }
        
        const chartData = {
          labels,
          datasets: [
            {
              label: getMetricLabel(selectedMetric),
              data: mockData,
              borderColor: getMetricColor(selectedMetric),
              backgroundColor: getMetricBackgroundColor(selectedMetric),
              fill: true,
              tension: 0.3,
            },
          ],
        };
        
        setChartData(chartData);
      } catch (error) {
        logError('Error fetching trend data', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTrendData();
  }, [userId, selectedMetric, supabase, isDemo]);
  
  const getMetricLabel = (metric: string) => {
    switch (metric) {
      case 'bw_score':
        return 'BW Score';
      case 'health_score':
        return 'Health Score';
      case 'deep_sleep':
        return 'Deep Sleep (hours)';
      case 'steps':
        return 'Steps';
      case 'heart_rate':
        return 'Heart Rate (bpm)';
      case 'recovery':
        return 'Recovery Score';
      default:
        return 'Value';
    }
  };
  
  const getMetricColor = (metric: string) => {
    switch (metric) {
      case 'bw_score':
        return '#6366f1'; // indigo-500
      case 'health_score':
        return '#3b82f6'; // blue-500
      case 'deep_sleep':
        return '#8b5cf6'; // violet-500
      case 'steps':
        return '#10b981'; // emerald-500
      case 'heart_rate':
        return '#ef4444'; // red-500
      case 'recovery':
        return '#0ea5e9'; // sky-500
      default:
        return '#3b82f6'; // blue-500
    }
  };
  
  const getMetricBackgroundColor = (metric: string) => {
    switch (metric) {
      case 'bw_score':
        return 'rgba(99, 102, 241, 0.1)'; // indigo-500 with opacity
      case 'health_score':
        return 'rgba(59, 130, 246, 0.1)'; // blue-500 with opacity
      case 'deep_sleep':
        return 'rgba(139, 92, 246, 0.1)'; // violet-500 with opacity
      case 'steps':
        return 'rgba(16, 185, 129, 0.1)'; // emerald-500 with opacity
      case 'heart_rate':
        return 'rgba(239, 68, 68, 0.1)'; // red-500 with opacity
      case 'recovery':
        return 'rgba(14, 165, 233, 0.1)'; // sky-500 with opacity
      default:
        return 'rgba(59, 130, 246, 0.1)'; // blue-500 with opacity
    }
  };
  
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#111827',
        bodyColor: '#4b5563',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 10,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          label: function (context: any) {
            let label = context.dataset.label || '';
            
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              if (selectedMetric === 'deep_sleep') {
                label += context.parsed.y.toFixed(1) + ' hrs';
              } else if (selectedMetric === 'steps') {
                label += context.parsed.y.toLocaleString();
              } else {
                label += context.parsed.y;
              }
            }
            return label;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          color: '#6b7280',
        },
        grid: {
          color: 'rgba(243, 244, 246, 1)',
        },
      },
      x: {
        ticks: {
          color: '#6b7280',
        },
        grid: {
          display: false,
        },
      },
    },
    elements: {
      point: {
        radius: 3,
        hoverRadius: 5,
      },
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
  };
  
  if (loading || !chartData) {
    return (
      <div className="rounded-xl bg-white p-6 shadow-md">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Health Trends</h2>
          <div className="h-10"></div>
        </div>
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="rounded-xl bg-white p-6 shadow-md">
      <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <h2 className="text-lg font-bold text-gray-900">Health Trends</h2>
        <div className="inline-flex rounded-md shadow-sm">
          {metricOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedMetric(option.value)}
              className={`relative inline-flex items-center px-3 py-2 text-sm font-medium focus:z-10 focus:outline-none
                ${option.value === selectedMetric
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
                }
                ${metricOptions[0].value === option.value ? 'rounded-l-md' : ''}
                ${metricOptions[metricOptions.length - 1].value === option.value ? 'rounded-r-md' : ''}
                ${option.value !== metricOptions[0].value && option.value !== metricOptions[metricOptions.length - 1].value ? 'border-t border-b' : ''}
                border border-gray-300
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="h-64">
        <Line data={chartData} options={chartOptions} />
      </div>
      
      <div className="mt-4 rounded-lg bg-gray-50 p-3 text-sm">
        <p className="font-medium text-gray-900">Weekly Summary</p>
        {selectedMetric === 'bw_score' && (
          <p className="mt-1 text-gray-600">
            Your BW Score has improved by 8 points over the last week. Your sleep quality and stress management are contributing positively.
          </p>
        )}
        {selectedMetric === 'health_score' && (
          <p className="mt-1 text-gray-600">
            Your health score has improved by 10 points over the last week. Keep up the good sleep habits!
          </p>
        )}
        {selectedMetric === 'deep_sleep' && (
          <p className="mt-1 text-gray-600">
            Your deep sleep is increasing. Average: 1.5 hrs/night. Optimal: 1.5-2 hrs/night.
          </p>
        )}
        {selectedMetric === 'steps' && (
          <p className="mt-1 text-gray-600">
            You've averaged 7,500 steps daily, just short of the 10,000 step goal.
          </p>
        )}
        {selectedMetric === 'heart_rate' && (
          <p className="mt-1 text-gray-600">
            Your resting heart rate is decreasing, indicating improved cardiovascular fitness.
          </p>
        )}
        {selectedMetric === 'recovery' && (
          <p className="mt-1 text-gray-600">
            Your recovery score is trending upward, showing improved resilience and adaptation.
          </p>
        )}
      </div>
    </div>
  );
};

export default HealthTrends;