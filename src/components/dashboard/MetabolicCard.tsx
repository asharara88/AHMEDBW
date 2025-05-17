import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Activity, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

interface MetabolicCardProps {
  currentGlucose: number;
  timeInRange: number;
  dailyAverage: number;
  variability: number;
  trend: 'up' | 'down' | 'stable';
}

const MetabolicCard = ({
  currentGlucose,
  timeInRange,
  dailyAverage,
  variability,
  trend,
}: MetabolicCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [isExpanded]);

  const getMetricColor = (value: number) => {
    if (value < 70) return 'text-error';
    if (value > 140) return 'text-warning';
    return 'text-success';
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-warning sm:h-5 sm:w-5" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-error sm:h-5 sm:w-5" />;
      default:
        return <Activity className="h-4 w-4 text-success sm:h-5 sm:w-5" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full overflow-hidden rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] shadow-sm transition-shadow hover:shadow-md"
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full flex-col p-3 text-left focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:p-4"
        aria-expanded={isExpanded}
      >
        <div className="mb-3 flex items-center justify-between sm:mb-4">
          <h2 className="text-base font-bold tracking-tight sm:text-lg md:text-xl">METABOLISM</h2>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown className="h-4 w-4 text-text-light sm:h-5 sm:w-5" />
          </motion.div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs text-text-light sm:text-sm">Current</span>
              {getTrendIcon()}
            </div>
            <div className={`text-sm font-bold sm:text-base md:text-lg ${getMetricColor(currentGlucose)}`}>
              {currentGlucose} mg/dL
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs text-text-light sm:text-sm">In Range</span>
              <Activity className="h-4 w-4 text-success sm:h-5 sm:w-5" />
            </div>
            <div className="text-sm font-bold text-success sm:text-base md:text-lg">
              {timeInRange}%
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs text-text-light sm:text-sm">Average</span>
              <Activity className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
            </div>
            <div className="text-sm font-bold text-primary sm:text-base md:text-lg">
              {dailyAverage} mg/dL
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs text-text-light sm:text-sm">Variability</span>
              <AlertCircle className="h-4 w-4 text-warning sm:h-5 sm:w-5" />
            </div>
            <div className="text-sm font-bold text-warning sm:text-base md:text-lg">
              ±{variability} mg/dL
            </div>
          </div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            ref={contentRef}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: contentHeight, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden border-t border-[hsl(var(--color-border))]"
          >
            <div className="space-y-3 bg-[hsl(var(--color-card-hover))] p-3 sm:space-y-4 sm:p-4">
              <div className="rounded-lg bg-[hsl(var(--color-card))] p-3 sm:p-4">
                <h3 className="mb-2 text-xs font-medium sm:text-sm">Metabolic Health Status</h3>
                <p className="text-xs text-text-light">
                  Your metabolic health is {timeInRange >= 80 ? 'good' : 'needs attention'}. 
                  You're maintaining glucose levels within target range {timeInRange}% of the time.
                </p>
              </div>

              <div className="rounded-lg bg-[hsl(var(--color-card))] p-3 sm:p-4">
                <h3 className="mb-2 text-xs font-medium sm:text-sm">Recommendations</h3>
                <ul className="space-y-2 text-xs text-text-light">
                  <li className="flex items-start gap-2">
                    <Activity className="mt-0.5 h-3 w-3 flex-shrink-0 text-success sm:h-4 sm:w-4" />
                    Consider a 10-minute walk after meals to improve glucose response
                  </li>
                  <li className="flex items-start gap-2">
                    <Activity className="mt-0.5 h-3 w-3 flex-shrink-0 text-success sm:h-4 sm:w-4" />
                    Add protein and fiber to meals to reduce glucose variability
                  </li>
                  <li className="flex items-start gap-2">
                    <Activity className="mt-0.5 h-3 w-3 flex-shrink-0 text-success sm:h-4 sm:w-4" />
                    Maintain consistent meal timing to stabilize daily patterns
                  </li>
                </ul>
              </div>

              <div className="rounded-lg bg-[hsl(var(--color-card))] p-3 sm:p-4">
                <h3 className="mb-2 text-xs font-medium sm:text-sm">Recent Trends</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-text-light">Morning Average</span>
                    <span className={getMetricColor(85)}>85 mg/dL</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-light">Post-meal Peaks</span>
                    <span className={getMetricColor(135)}>135 mg/dL</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-light">Overnight Stability</span>
                    <span className="text-success">Stable</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MetabolicCard;