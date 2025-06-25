import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useCodex } from '../../../codex/useCodex';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import { Brain, Moon, Activity, Heart, Zap } from 'lucide-react';
import CodexSupplementRecommendations from '../../components/supplements/CodexSupplementRecommendations';
import type { Phenotype } from '../../../codex/types';

const CodexDashboard = () => {
  const { user } = useAuth();
  const { setPhenotype, currentPhenotype } = useCodex();
  const [selectedPhenotype, setSelectedPhenotype] = useState<Phenotype | null>(null);

  // Set initial phenotype based on user data or default to poor_sleep
  useEffect(() => {
    if (!currentPhenotype) {
      // In a real app, this would come from user data
      const defaultPhenotype: Phenotype = 'poor_sleep';
      setPhenotype(defaultPhenotype);
      setSelectedPhenotype(defaultPhenotype);
    } else {
      setSelectedPhenotype(currentPhenotype);
    }
  }, [currentPhenotype, setPhenotype]);

  const handlePhenotypeChange = (phenotype: Phenotype) => {
    setPhenotype(phenotype);
    setSelectedPhenotype(phenotype);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-2xl font-bold md:text-3xl">Codex Health Dashboard</h1>
          <p className="text-text-light">
            Personalized health recommendations based on your phenotype
          </p>
        </div>

        <div className="mb-8 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-6">
          <h2 className="mb-4 text-xl font-bold">Your Health Profile</h2>
          
          <Tabs defaultValue={selectedPhenotype || 'poor_sleep'} onValueChange={(value) => handlePhenotypeChange(value as Phenotype)}>
            <TabsList className="mb-6">
              <TabsTrigger value="low_dopamine" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                <span className="hidden sm:inline">Low Dopamine</span>
              </TabsTrigger>
              <TabsTrigger value="poor_sleep" className="flex items-center gap-2">
                <Moon className="h-4 w-4" />
                <span className="hidden sm:inline">Poor Sleep</span>
              </TabsTrigger>
              <TabsTrigger value="high_performance" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                <span className="hidden sm:inline">High Performance</span>
              </TabsTrigger>
              <TabsTrigger value="gut_issues" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                <span className="hidden sm:inline">Gut Issues</span>
              </TabsTrigger>
              <TabsTrigger value="fat_loss" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                <span className="hidden sm:inline">Fat Loss</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="low_dopamine">
              <div className="mb-6 rounded-lg bg-[hsl(var(--color-surface-1))] p-4">
                <h3 className="mb-2 font-medium">Low Dopamine Profile</h3>
                <p className="text-text-light">
                  This profile focuses on supporting dopamine production, motivation, and focus. 
                  The recommendations aim to improve mood, energy, and cognitive function.
                </p>
              </div>
              <CodexSupplementRecommendations phenotype="low_dopamine" />
            </TabsContent>
            
            <TabsContent value="poor_sleep">
              <div className="mb-6 rounded-lg bg-[hsl(var(--color-surface-1))] p-4">
                <h3 className="mb-2 font-medium">Poor Sleep Profile</h3>
                <p className="text-text-light">
                  This profile focuses on improving sleep quality, duration, and consistency.
                  The recommendations aim to support your circadian rhythm and sleep architecture.
                </p>
              </div>
              <CodexSupplementRecommendations phenotype="poor_sleep" />
            </TabsContent>
            
            <TabsContent value="high_performance">
              <div className="mb-6 rounded-lg bg-[hsl(var(--color-surface-1))] p-4">
                <h3 className="mb-2 font-medium">High Performance Profile</h3>
                <p className="text-text-light">
                  This profile focuses on optimizing physical and mental performance.
                  The recommendations aim to enhance energy, recovery, and cognitive function.
                </p>
              </div>
              <CodexSupplementRecommendations phenotype="high_performance" />
            </TabsContent>
            
            <TabsContent value="gut_issues">
              <div className="mb-6 rounded-lg bg-[hsl(var(--color-surface-1))] p-4">
                <h3 className="mb-2 font-medium">Gut Health Profile</h3>
                <p className="text-text-light">
                  This profile focuses on supporting digestive health and gut function.
                  The recommendations aim to improve gut microbiome, digestion, and nutrient absorption.
                </p>
              </div>
              <CodexSupplementRecommendations phenotype="gut_issues" />
            </TabsContent>
            
            <TabsContent value="fat_loss">
              <div className="mb-6 rounded-lg bg-[hsl(var(--color-surface-1))] p-4">
                <h3 className="mb-2 font-medium">Fat Loss Profile</h3>
                <p className="text-text-light">
                  This profile focuses on supporting healthy metabolism and fat loss.
                  The recommendations aim to optimize metabolic health and energy balance.
                </p>
              </div>
              <CodexSupplementRecommendations phenotype="fat_loss" />
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>
    </div>
  );
};

export default CodexDashboard;