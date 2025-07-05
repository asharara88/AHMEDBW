import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Footprints, Moon, Flame, Scale, Zap, Brain, Droplet, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface MetricsOverviewProps {
  metrics: {
    steps: number;
    heartRate: number;
    sleepHours: number;
    deep_sleep?: number;
    rem_sleep?: number;
    calories?: number;
    bmi?: number;
  };
}

const MetricsOverview = ({ metrics }: MetricsOverviewProps) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  
  const primaryMetrics = [
    {
      id: 'steps',
      name: 'Daily Steps',
      value: metrics.steps,
      unit: '',
      target: '10,000',
      icon: <Footprints className="h-5 w-5 sm:h-6 sm:w-6" />,
      color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
      isGood: metrics.steps >= 8000,
    },
    {
      id: 'heart',
      name: 'Heart Rate',
      value: metrics.heartRate,
      unit: 'bpm',
      target: '60-70 bpm',
      icon: <Heart className="h-5 w-5 sm:h-6 sm:w-6" />,
      color: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
      isGood: metrics.heartRate < 70,
    },
    {
      id: 'sleep',
      name: 'Sleep',
      value: metrics.sleepHours,
      unit: 'hrs',
      target: '7-9 hrs',
      icon: <Moon className="h-5 w-5 sm:h-6 sm:w-6" />,
      color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400',
      isGood: metrics.sleepHours >= 7,
    },
  ];
  
  const secondaryMetrics = [
    {
      id: 'deep_sleep',
      name: 'Deep Sleep',
      value: metrics.deep_sleep || 1.8,
      unit: 'hrs',
      target: '1.5-2 hrs',
      icon: <Brain className="h-5 w-5 sm:h-6 sm:w-6" />,
      color: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
      isGood: (metrics.deep_sleep || 1.8) >= 1.5,
    },
    {
      id: 'calories',
      name: 'Active Calories',
      value: metrics.calories || 420,
      unit: 'kcal',
      target: '500+ kcal',
      icon: <Flame className="h-5 w-5 sm:h-6 sm:w-6" />,
      color: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
      isGood: (metrics.calories || 420) >= 400,
    },
    {
      id: 'bmi',
      name: 'BMI',
      value: metrics.bmi || 22.5,
      unit: '',
      target: '18.5-24.9',
      icon: <Scale className="h-5 w-5 sm:h-6 sm:w-6" />,
      color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
      isGood: (metrics.bmi || 22.5) >= 18.5 && (metrics.bmi || 22.5) <= 24.9,
    },
    {
      id: 'recovery',
      name: 'Recovery',
      value: 68,
      unit: '',
      target: '70+',
      icon: <Zap className="h-5 w-5 sm:h-6 sm:w-6" />,
      color: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
      isGood: 68 >= 70,
    },
    {
      id: 'hydration',
      name: 'Hydration',
      value: 85,
      unit: '%',
      target: '90%+',
      icon: <Droplet className="h-5 w-5 sm:h-6 sm:w-6" />,
      color: 'bg-sky-50 text-sky-600 dark:bg-sky-900/20 dark:text-sky-400',
      isGood: 85 >= 90,
    },
  ];

  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  return (
    <div className="h-full rounded-xl bg-[hsl(var(--color-card))] p-4 shadow-sm sm:p-6">
      <div className="mb-4">
        <h2 className="text-base font-bold text-text sm:text-lg">Today's Health Metrics</h2>
        <p className="text-xs text-text-light sm:text-sm">Your most recent biometric readings</p>
      </div>

      {/* Primary Metrics - Always Visible */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {primaryMetrics.map((metric, index) => (
          <motion.div
            key={metric.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="group rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-3 transition-shadow hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className={`rounded-lg p-2 ${metric.color}`}>
                {metric.icon}
              </div>
              {metric.isGood ? (
                <span className="text-xs font-medium text-success">
                  Good
                </span>
              ) : (
                <span className="text-xs font-medium text-amber-500">
                  Improve
                </span>
              )}
            </div>
            <div className="mt-2">
              <h3 className="text-xs font-medium text-text-light sm:text-sm">
                {metric.name}
              </h3>
              <div className="mt-1 flex items-baseline">
                <span className="text-base font-semibold text-text sm:text-xl">
                  {typeof metric.value === 'number'
                    ? metric.value.toLocaleString('en-US', {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 1
                      })
                    : metric.value}
                </span>
                {metric.unit && (
                  <span className="ml-1 text-xs text-text-light sm:text-sm">
                    {metric.unit}
                  </span>
                )}
              </div>
              {metric.target && (
                <div className="mt-1">
                  <span className="text-xs text-text-light">
                    Target: {metric.target}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Secondary Metrics Toggle Button */}
      <button 
        onClick={() => toggleSection('secondary')}
        className="mt-4 flex w-full items-center justify-center gap-1 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-3 py-2 text-xs text-text-light transition-colors hover:bg-[hsl(var(--color-card-hover))] hover:text-text"
      >
        {expandedSection === 'secondary' ? (
          <>
            Show Less <ChevronUp className="h-3.5 w-3.5" />
          </>
        ) : (
          <>
            Show More Metrics <ChevronDown className="h-3.5 w-3.5" />
          </>
        )}
      </button>

      {/* Secondary Metrics - Expandable */}
      <AnimatePresence>
        {expandedSection === 'secondary' && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 overflow-hidden"
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
              {secondaryMetrics.map((metric, index) => (
                <motion.div
                  key={metric.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="group rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-3 transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div className={`rounded-lg p-2 ${metric.color}`}>
                      {metric.icon}
                    </div>
                    {metric.isGood ? (
                      <span className="text-xs font-medium text-success">
                        Good
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-amber-500">
                        Improve
                      </span>
                    )}
                  </div>
                  <div className="mt-2">
                    <h3 className="text-xs font-medium text-text-light sm:text-sm">
                      {metric.name}
                    </h3>
                    <div className="mt-1 flex items-baseline">
                      <span className="text-base font-semibold text-text sm:text-xl">
                        {typeof metric.value === 'number'
                          ? metric.value.toLocaleString(undefined, {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 1
                            })
                          : metric.value}
                      </span>
                      {metric.unit && (
                        <span className="ml-1 text-xs text-text-light sm:text-sm">
                          {metric.unit}
                        </span>
                      )}
                    </div>
                    {metric.target && (
                      <div className="mt-1">
                        <span className="text-xs text-text-light">
                          Target: {metric.target}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MetricsOverview;