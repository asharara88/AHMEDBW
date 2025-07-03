import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { AlertCircle, Utensils, Dumbbell, Moon } from 'lucide-react';
import HealthDashboard from '../../components/dashboard/HealthDashboard';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import RecipesPage from '../recipes/RecipesPage';
import FitnessPage from '../fitness/FitnessPage';
import SleepDashboard from '../../components/dashboard/SleepDashboard';

const DashboardPage = () => {
  const { user, isDemo } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="container mx-auto overflow-x-visible">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="overflow-x-visible"
      >
        <div className="mb-6">
          <h1 className="text-2xl font-bold md:text-3xl">
            Welcome{user?.email ? `, ${user.email.split('@')[0]}` : ''}
          </h1>
          <p className="text-text-light">Here's an overview of your health today</p>
        </div>

        {isDemo && (
          <div className="mb-6 flex items-center gap-3 rounded-xl bg-primary/10 p-4 text-primary">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p>You're viewing demo data. Connect your devices to see your actual health metrics.</p>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="overflow-x-visible">
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="nutrition" className="flex items-center gap-1">
              <Utensils className="h-4 w-4" />
              <span>Nutrition</span>
            </TabsTrigger>
            <TabsTrigger value="fitness" className="flex items-center gap-1">
              <Dumbbell className="h-4 w-4" />
              <span>Fitness</span>
            </TabsTrigger>
            <TabsTrigger value="sleep" className="flex items-center gap-1">
              <Moon className="h-4 w-4" />
              <span>Sleep</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="overflow-x-visible">
            <div className="grid gap-6 md:grid-cols-12">
              <div className="md:col-span-12 min-w-0 overflow-x-visible">
                <HealthDashboard />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="nutrition">
            <RecipesPage />
          </TabsContent>

          <TabsContent value="fitness">
            <FitnessPage />
          </TabsContent>

          <TabsContent value="sleep">
            <SleepDashboard userId={user?.id || ''} />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}

export default DashboardPage;