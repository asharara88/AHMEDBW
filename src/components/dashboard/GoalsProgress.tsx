import { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Plus, Edit2, Trash2, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface Goal {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  deadline: Date;
}

const GoalsProgress = () => {
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: '1',
      title: 'Daily Steps',
      description: 'Reach daily step goal for better cardiovascular health',
      target: 10000,
      current: 8432,
      unit: 'steps',
      deadline: new Date('2025-12-31'),
    },
    {
      id: '2',
      title: 'Sleep Duration',
      description: 'Achieve optimal sleep duration for better recovery',
      target: 8,
      current: 6.5,
      unit: 'hours',
      deadline: new Date('2025-12-31'),
    },
  ]);
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);

  const calculateProgress = (goal: Goal) => {
    return Math.min(100, (goal.current / goal.target) * 100);
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-success';
    if (progress >= 75) return 'bg-primary';
    if (progress >= 50) return 'bg-warning';
    return 'bg-error';
  };

  return (
    <div className="h-full rounded-xl bg-[hsl(var(--color-card))] p-4 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold sm:text-lg">Health Goals</h2>
        <button className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-dark">
          <Plus className="h-3.5 w-3.5" />
          Add Goal
        </button>
      </div>

      <div className="space-y-3">
        {goals.map((goal) => {
          const progress = calculateProgress(goal);
          const progressColor = getProgressColor(progress);
          
          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-3"
            >
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-medium">{goal.title}</h3>
                  <div className="mt-1 text-xs text-text-light">{goal.description}</div>
                </div>
                <button
                  onClick={() => setExpandedGoal(expandedGoal === goal.id ? null : goal.id)}
                  className="rounded-full p-1 text-text-light hover:bg-[hsl(var(--color-card-hover))] hover:text-text"
                >
                  {expandedGoal === goal.id ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
              </div>

              <div className="mb-2 flex items-center justify-between text-xs">
                <div className="font-medium">
                  {goal.current.toLocaleString()} / {goal.target.toLocaleString()} {goal.unit}
                </div>
                <div className={progress >= 100 ? 'text-success' : 'text-text-light'}>
                  {Math.round(progress)}%
                  {progress >= 100 && <CheckCircle className="ml-1 inline-block h-3 w-3" />}
                </div>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-[hsl(var(--color-surface-2))]">
                <motion.div
                  className={`h-full ${progressColor}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>

              {expandedGoal === goal.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 space-y-3 border-t border-[hsl(var(--color-border))] pt-4"
                >
                  <div className="flex items-center justify-between text-xs text-text-light">
                    <div className="flex items-center gap-2">
                      <Target className="h-3.5 w-3.5" />
                      <span>Target Date</span>
                    </div>
                    <div>
                      {goal.deadline.toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button className="rounded-lg p-2 text-text-light transition-colors hover:bg-[hsl(var(--color-card-hover))] hover:text-text">
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button className="rounded-lg p-2 text-text-light transition-colors hover:bg-error/10 hover:text-error">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default GoalsProgress;