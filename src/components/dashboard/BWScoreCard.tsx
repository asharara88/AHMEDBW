import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Activity, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

interface BWScoreCardProps {
  score: number;
  trend?: 'up' | 'down' | 'stable';
  change?: number;
}

const BWScoreCard = ({ 
  score = 82, 
  trend = 'up',
  change = 4
}: BWScoreCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [expanded]);
  
  // Determine score category and color
  let category = '';
  let colorClass = '';
  
  if (score >= 90) {
    category = 'Excellent';
    colorClass = 'text-success';
  } else if (score >= 75) {
    category = 'Good';
    colorClass = 'text-primary';
  } else if (score >= 60) {
    category = 'Fair';
    colorClass = 'text-amber-500';
  } else {
    category = 'Needs Improvement';
    colorClass = 'text-error';
  }
  
  // Animation values for the circular progress
  const circumference = 2 * Math.PI * 45;
  const progressOffset = circumference - (score / 100) * circumference;

  // Mock data for the detailed metrics
  const detailedMetrics = [
    { name: 'Nutrition Score', value: 78, trend: 'up', change: 3 },
    { name: 'Metabolism Score', value: 85, trend: 'up', change: 5 },
    { name: 'Supplementation Score', value: 72, trend: 'down', change: 2 },
    { name: 'Sleep Quality Score', value: 88, trend: 'up', change: 6 },
    { name: 'Recovery Score', value: 80, trend: 'stable', change: 0 },
  ];

  // Activity data
  const activityData = [
    { name: 'Outdoor Walk', duration: '45 min', calories: 220 },
    { name: 'Pool Swim', duration: '30 min', calories: 350 },
    { name: 'Padel Tennis', duration: '60 min', calories: 480 },
    { name: 'Strength Training', duration: '40 min', calories: 320 },
  ];

  // Movement data
  const movementData = {
    activeCalories: 750,
    totalCalories: 2450,
    standHours: 10,
    steps: 8432,
    nonExerciseActivity: '2.5 hrs'
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full h-full rounded-xl bg-[hsl(var(--color-card))] shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="p-4 sm:p-6 overflow-x-hidden">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-base font-bold sm:text-lg">
            <img 
              src="https://jvqweleqjkrgldeflnfr.supabase.co/storage/v1/object/sign/heroes/STACKDASH.svg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5XzFhYTRlZDEyLWU0N2QtNDcyNi05ZmI0LWQ3MWM5MGFlOTYyZSJ9.eyJ1cmwiOiJoZXJvZXMvU1RBQ0tEQVNILnN2ZyIsImlhdCI6MTc0NzAxNTM3MSwiZXhwIjoxNzc4NTUxMzcxfQ.fumrYJiZDGZ36gbwlOVcWHsqs5uFiYRBAhtaT_tnQlM" 
              alt="BW Score" 
              className="h-5 w-5 text-primary"
            />
            BW Score™
            <div className="group relative">
              <AlertCircle className="h-4 w-4 cursor-help text-text-light" />
              <div className="absolute bottom-full left-1/2 mb-2 hidden w-64 -translate-x-1/2 rounded-lg bg-gray-900 p-3 text-xs text-white shadow-lg group-hover:block">
                <p className="font-normal">
                  Your BW Score™ is a comprehensive health index calculated from your sleep, activity, recovery, and other biomarkers. Higher scores indicate better overall health.
                </p>
                <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 transform bg-gray-900"></div>
              </div>
            </div>
          </h2>
          <div className="flex items-center text-success">
            {trend === 'up' ? (
              <TrendingUp className="mr-1 h-4 w-4" />
            ) : trend === 'down' ? (
              <TrendingDown className="mr-1 h-4 w-4 text-error" />
            ) : null}
            <span className="text-xs font-medium">{trend === 'up' ? '+' : trend === 'down' ? '-' : ''}{change} pts</span>
          </div>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="text-center mb-4">
            <h3 className={`text-base font-semibold sm:text-lg ${colorClass}`}>{category}</h3>
            <p className="mt-1 text-xs text-text-light sm:text-sm">
              Your overall health index based on all metrics
            </p>
          </div>
          
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
              <motion.circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: progressOffset }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className={colorClass}
              />
            </svg>
            {/* Score text */}
            <div className="absolute flex flex-col items-center">
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="text-2xl font-bold sm:text-3xl"
              >
                {score}
              </motion.span>
              <span className="text-xs text-text-light">out of 100</span>
            </div>
          </div>
        </div>
        
        <div className="mt-4 rounded-lg bg-[hsl(var(--color-surface-1))] p-3 sm:mt-6">
          <h4 className="text-xs font-medium sm:text-sm">Top Recommendation</h4>
          <p className="mt-1 text-xs text-text-light">
            Increase deep sleep by reducing screen time 1 hour before bed to improve your recovery and BW Score.
          </p>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-4 flex w-full items-center justify-center gap-1 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-3 py-2 text-xs text-text-light transition-colors hover:bg-[hsl(var(--color-card-hover))] hover:text-text"
        >
          {expanded ? (
            <>
              Hide Details <ChevronDown className="h-3.5 w-3.5 rotate-180 transform" />
            </>
          ) : (
            <>
              View Details <ChevronDown className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden border-t border-[hsl(var(--color-border))]"
            ref={contentRef}
          >
            <div className="space-y-4 p-4 sm:space-y-4 sm:p-6 overflow-x-hidden w-full">
              <h3 className="mb-4 text-base font-medium sm:text-lg">Score Breakdown</h3>
              
              <div className="space-y-4">
                {/* Detailed Metrics */}
                {detailedMetrics.map((metric, index) => (
                  <div key={index} className="rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-medium">{metric.name}</span>
                      <div className="flex items-center">
                        {metric.trend === 'up' ? (
                          <TrendingUp className="mr-1 h-3.5 w-3.5 text-success" />
                        ) : metric.trend === 'down' ? (
                          <TrendingDown className="mr-1 h-3.5 w-3.5 text-error" />
                        ) : (
                          <span className="mr-1">→</span>
                        )}
                        <span className={`text-xs ${
                          metric.trend === 'up' ? 'text-success' : 
                          metric.trend === 'down' ? 'text-error' : 
                          'text-text-light'
                        }`}>
                          {metric.trend === 'up' ? '+' : metric.trend === 'down' ? '-' : ''}
                          {metric.change}
                        </span>
                      </div>
                    </div>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="text-text-light">Score</span>
                      <span className="font-medium">{metric.value}/100</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-[hsl(var(--color-surface-2))]">
                      <div 
                        className={`h-full ${
                          metric.value >= 80 ? 'bg-success' : 
                          metric.value >= 70 ? 'bg-primary' : 
                          metric.value >= 60 ? 'bg-warning' : 
                          'bg-error'
                        }`}
                        style={{ width: `${metric.value}%` }}
                      ></div>
                    </div>
                  </div>
                ))}

                {/* Activity Score (Expandable) */}
                <div className="rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-medium">Activity Score</span>
                    <div className="flex items-center">
                      <TrendingUp className="mr-1 h-3.5 w-3.5 text-success" />
                      <span className="text-xs text-success">+7</span>
                    </div>
                  </div>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-text-light">Score</span>
                    <span className="font-medium">85/100</span>
                  </div>
                  <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-[hsl(var(--color-surface-2))]">
                    <div className="h-full bg-success" style={{ width: '85%' }}></div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium">Today's Activities</h4>
                    {activityData.map((activity, index) => (
                      <div key={index} className="flex items-center justify-between rounded-lg bg-[hsl(var(--color-card))] p-2 text-xs">
                        <span>{activity.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-text-light">{activity.duration}</span>
                          <span>{activity.calories} cal</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Movement Score */}
                <div className="rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-medium">Movement Score</span>
                    <div className="flex items-center">
                      <TrendingUp className="mr-1 h-3.5 w-3.5 text-success" />
                      <span className="text-xs text-success">+5</span>
                    </div>
                  </div>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-text-light">Score</span>
                    <span className="font-medium">78/100</span>
                  </div>
                  <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-[hsl(var(--color-surface-2))]">
                    <div className="h-full bg-primary" style={{ width: '78%' }}></div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg bg-[hsl(var(--color-card))] p-2 text-xs">
                      <div className="text-text-light">Active Calories</div>
                      <div className="font-medium">{movementData.activeCalories} cal</div>
                    </div>
                    <div className="rounded-lg bg-[hsl(var(--color-card))] p-2 text-xs">
                      <div className="text-text-light">Total Calories</div>
                      <div className="font-medium">{movementData.totalCalories} cal</div>
                    </div>
                  </div>
                </div>

                {/* Additional Metrics */}
                <div className="rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-3">
                  <h4 className="mb-3 text-xs font-medium">Additional Metrics</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-lg bg-[hsl(var(--color-card))] p-2 text-xs">
                      <div className="text-text-light">Stand Hours</div>
                      <div className="font-medium">{movementData.standHours}/12</div>
                    </div>
                    <div className="rounded-lg bg-[hsl(var(--color-card))] p-2 text-xs">
                      <div className="text-text-light">Daily Steps</div>
                      <div className="font-medium">{movementData.steps}</div>
                    </div>
                    <div className="rounded-lg bg-[hsl(var(--color-card))] p-2 text-xs">
                      <div className="text-text-light">Non-Exercise</div>
                      <div className="font-medium">{movementData.nonExerciseActivity}</div>
                    </div>
                  </div>
                </div>

                {/* Last Updated */}
                <div className="text-center text-xs text-text-light">
                  Last updated: {new Date().toLocaleString()}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default BWScoreCard;