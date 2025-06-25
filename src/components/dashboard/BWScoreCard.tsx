import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  ChevronDown, 
  ChevronUp,
  Activity,
  Heart,
  Moon,
  Zap,
  Brain,
  Shield
} from 'lucide-react';

interface BWScoreCardProps {
  className?: string;
}

const BWScoreCard: React.FC<BWScoreCardProps> = ({ className = '' }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Mock data for demonstration
  const overallScore = 82;
  const scoreChange = 5;
  const scoreChangeDirection = 'up';

  const metrics = [
    {
      name: 'Sleep Quality',
      value: 85,
      change: 3,
      trend: 'up',
      icon: Moon,
      color: 'text-blue-500'
    },
    {
      name: 'Heart Rate Variability',
      value: 78,
      change: 2,
      trend: 'up',
      icon: Heart,
      color: 'text-red-500'
    },
    {
      name: 'Energy Level',
      value: 90,
      change: 7,
      trend: 'up',
      icon: Zap,
      color: 'text-yellow-500'
    },
    {
      name: 'Stress Management',
      value: 75,
      change: 1,
      trend: 'down',
      icon: Brain,
      color: 'text-purple-500'
    },
    {
      name: 'Recovery Score',
      value: 88,
      change: 4,
      trend: 'up',
      icon: Shield,
      color: 'text-green-500'
    }
  ];

  const activityData = [
    { name: 'Morning Walk', duration: '30 min', calories: 120 },
    { name: 'Strength Training', duration: '45 min', calories: 280 },
    { name: 'Yoga Session', duration: '20 min', calories: 80 }
  ];

  const movementData = {
    activeCalories: 480,
    totalCalories: 2240,
    standHours: 10,
    steps: 8420,
    nonExerciseActivity: '2.5 hrs'
  };

  return (
    <motion.div 
      className={`rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-6 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-primary/10 p-2">
            <Activity className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">BioWell Score</h3>
            <p className="text-sm text-text-light">Your overall wellness score</p>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="rounded-full p-2 text-text-light transition-colors hover:bg-[hsl(var(--color-card-hover))] hover:text-text"
        >
          {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </button>
      </div>

      {/* Main Score */}
      <div className="mb-6 text-center">
        <div className="mb-2 text-4xl font-bold text-primary">{overallScore}</div>
        <div className="flex items-center justify-center gap-2">
          {scoreChangeDirection === 'up' ? (
            <TrendingUp className="h-4 w-4 text-success" />
          ) : (
            <TrendingDown className="h-4 w-4 text-error" />
          )}
          <span className={`text-sm font-medium ${
            scoreChangeDirection === 'up' ? 'text-success' : 'text-error'
          }`}>
            {scoreChangeDirection === 'up' ? '+' : '-'}{scoreChange} from last week
          </span>
        </div>
      </div>

      {/* Progress Ring */}
      <div className="mb-6 flex justify-center">
        <div className="relative h-32 w-32">
          <svg className="h-32 w-32 -rotate-90 transform" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="50"
              stroke="hsl(var(--color-surface-2))"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="60"
              cy="60"
              r="50"
              stroke="hsl(var(--color-primary))"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${(overallScore / 100) * 314} 314`}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-semibold">{overallScore}%</span>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="space-y-4 border-t border-[hsl(var(--color-border))] pt-4">
              {/* Individual Metrics */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Health Metrics</h4>
                {metrics.map((metric, index) => (
                  <div key={index} className="rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <metric.icon className={`h-4 w-4 ${metric.color}`} />
                        <span className="font-medium">{metric.name}</span>
                      </div>
                      <div className="flex items-center">
                        {metric.trend === 'up' ? (
                          <TrendingUp className="mr-1 h-3.5 w-3.5 text-success" />
                        ) : (
                          <TrendingDown className="mr-1 h-3.5 w-3.5 text-error" />
                        )}
                        <span className={`text-xs ${metric.trend === 'up' ? 'text-success' : 'text-error'}`}>
                          {metric.trend === 'up' ? '+' : '-'}{metric.change}
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