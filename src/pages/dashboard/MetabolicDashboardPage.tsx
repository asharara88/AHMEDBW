import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import MetabolicHealth from '../../components/dashboard/MetabolicHealth';
import MetabolicCard from '../../components/dashboard/MetabolicCard';
import { Activity, Brain, Heart } from 'lucide-react';
import DashboardSidebar from '../../components/dashboard/DashboardSidebar';

const MetabolicDashboardPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold md:text-3xl">Metabolic Health</h1>
        <p className="text-text-light">
          Monitor and optimize your metabolic health metrics
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Sidebar */}
        <div className="lg:col-span-3">
          <DashboardSidebar userId={user?.id || ''} />
        </div>

        {/* Main Content */}
        <div className="lg:col-span-9">
          {/* Quick Stats */}
          <div className="mb-8 grid gap-4 md:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-6"
            >
              <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3 text-primary">
                <Activity className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold">Metabolic Score</h3>
              <div className="mt-2 text-3xl font-bold text-primary">85</div>
              <p className="mt-1 text-sm text-text-light">Good metabolic health</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-6"
            >
              <div className="mb-4 inline-flex rounded-xl bg-success/10 p-3 text-success">
                <Brain className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold">Cognitive Impact</h3>
              <div className="mt-2 text-3xl font-bold text-success">92</div>
              <p className="mt-1 text-sm text-text-light">Optimal brain function</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-6"
            >
              <div className="mb-4 inline-flex rounded-xl bg-warning/10 p-3 text-warning">
                <Heart className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold">Recovery Status</h3>
              <div className="mt-2 text-3xl font-bold text-warning">78</div>
              <p className="mt-1 text-sm text-text-light">Room for improvement</p>
            </motion.div>
          </div>

          {/* Metabolic Card */}
          <div className="mb-8">
            <MetabolicCard
              currentGlucose={95}
              timeInRange={85}
              dailyAverage={102}
              variability={15}
              trend="stable"
            />
          </div>

          {/* Detailed Metabolic Health Section */}
          <div className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-6">
            <MetabolicHealth userId={user?.id || ''} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetabolicDashboardPage;