import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import BWScoreCard from './BWScoreCard';
import MetricsOverview from './MetricsOverview';
import HealthTrends from './HealthTrends';
import SleepDashboard from './SleepDashboard';
import ActivityDashboard from './ActivityDashboard';
import NutritionDashboard from './NutritionDashboard';
import SupplementDashboard from './SupplementDashboard';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import { Calendar, Clock, Activity, Utensils, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const HealthDashboard = () => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('day');
  const [healthData] = useState({
    bwScore: 82,
    metrics: {
      steps: 8432,
      heartRate: 62,
      sleepHours: 7.2,
      deep_sleep: 1.8,
      rem_sleep: 1.5,
      calories: 420,
      bmi: 22.5,
    },
  });

  return (
    <div className="space-y-6 overflow-x-visible">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h2 className="text-xl font-bold">Health Dashboard</h2>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-light">Time Range:</span>
          <div className="flex rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))]">
            <button
              onClick={() => setTimeRange('day')}
              className={`flex items-center gap-1 px-3 py-1.5 text-sm transition-colors ${
                timeRange === 'day'
                  ? 'bg-primary text-white'
                  : 'text-text-light hover:bg-[hsl(var(--color-card-hover))] hover:text-text'
              }`}
              aria-pressed={(timeRange === 'day').toString()}
            >
              <Clock className="h-3.5 w-3.5" />
              Day
            </button>
            <button
              onClick={() => setTimeRange('week')}
              className={`flex items-center gap-1 px-3 py-1.5 text-sm transition-colors ${
                timeRange === 'week'
                  ? 'bg-primary text-white'
                  : 'text-text-light hover:bg-[hsl(var(--color-card-hover))] hover:text-text'
              }`}
              aria-pressed={(timeRange === 'week').toString()}
            >
              <Activity className="h-3.5 w-3.5" />
              Week
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`flex items-center gap-1 px-3 py-1.5 text-sm transition-colors ${
                timeRange === 'month'
                  ? 'bg-primary text-white'
                  : 'text-text-light hover:bg-[hsl(var(--color-card-hover))] hover:text-text'
              }`}
              aria-pressed={(timeRange === 'month').toString()}
            >
              <Calendar className="h-3.5 w-3.5" />
              Month
            </button>
          </div>
        </div>
      </div>

      {/* Nutrition & Recipes Highlight */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl bg-primary/10 p-4 border border-primary/20"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold flex items-center text-primary">
              <Utensils className="h-5 w-5 mr-2" />
              Nutrition & Recipes
            </h3>
            <p className="text-sm text-text-light mt-1">
              Personalized nutrition insights and healthy recipe recommendations
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-sm text-text-light">Daily Calories</span>
              <span className="text-lg font-semibold">2,150 kcal</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-text-light">Protein</span>
              <span className="text-lg font-semibold">125g</span>
            </div>
            <Link 
              to="/recipes" 
              className="flex items-center gap-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
            >
              Browse Recipes
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-12">
        {/* BW Score Card */}
        <div className="md:col-span-4 min-w-0 overflow-x-visible">
          <BWScoreCard score={healthData.bwScore} trend="up" change={4} />
        </div>

        {/* Metrics Overview */}
        <div className="md:col-span-8">
          <MetricsOverview metrics={healthData.metrics} />
        </div>
      </div>

      {/* Health Trends */}
      <div className="overflow-x-visible">
        <Tabs defaultValue="overview">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sleep">Sleep</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="nutrition" className="flex items-center gap-1">
              <Utensils className="h-4 w-4" />
              Nutrition
            </TabsTrigger>
            <TabsTrigger value="supplements">Supplements</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <HealthTrends userId={user?.id || ''} />
          </TabsContent>
          
          <TabsContent value="sleep">
            <SleepDashboard userId={user?.id || ''} />
          </TabsContent>
          
          <TabsContent value="activity">
            <ActivityDashboard userId={user?.id || ''} />
          </TabsContent>
          
          <TabsContent value="nutrition">
            <NutritionDashboard userId={user?.id || ''} />
          </TabsContent>
          
          <TabsContent value="supplements">
            <SupplementDashboard userId={user?.id || ''} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default HealthDashboard;