import { useState, useCallback } from 'react';
import codexRouter from './codexRouter';
import type { Phenotype, SleepData, SupplementRecommendation } from './types';

/**
 * Hook for interacting with the Codex system
 */
export function useCodex() {
  const [currentPhenotype, setCurrentPhenotype] = useState<Phenotype | null>(null);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Set the user's phenotype
   */
  const setPhenotype = useCallback((phenotype: Phenotype) => {
    setCurrentPhenotype(phenotype);
    setIsRecoveryMode(false);
  }, []);

  /**
   * Get prompt based on current phenotype
   */
  const getPrompt = useCallback(() => {
    if (!currentPhenotype) {
      return codexRouter.getFallbackLogic('missing_quiz');
    }
    return codexRouter.getPromptByPhenotype(currentPhenotype);
  }, [currentPhenotype]);

  /**
   * Check if recovery mode should be triggered based on user input and sleep data
   */
  const checkRecoveryMode = useCallback((userInput: string, sleepData?: SleepData) => {
    const shouldTrigger = codexRouter.shouldTriggerRecovery(userInput, sleepData || {});
    setIsRecoveryMode(shouldTrigger);
    return shouldTrigger;
  }, []);

  /**
   * Get recovery mode actions
   */
  const getRecoveryActions = useCallback(() => {
    return codexRouter.getRecoveryActions();
  }, []);

  /**
   * Get supplement recommendations based on phenotype
   */
  const getSupplementRecommendations = useCallback((): SupplementRecommendation[] => {
    if (!currentPhenotype) return [];
    
    setLoading(true);
    setError(null);
    
    try {
      const recommendations = codexRouter.generateSupplementStack(currentPhenotype);
      return recommendations;
    } catch (err) {
      setError('Failed to generate supplement recommendations');
      return [];
    } finally {
      setLoading(false);
    }
  }, [currentPhenotype]);

  /**
   * Get all available phenotypes
   */
  const getAvailablePhenotypes = useCallback(() => {
    return codexRouter.getAvailablePhenotypes();
  }, []);

  return {
    currentPhenotype,
    isRecoveryMode,
    loading,
    error,
    setPhenotype,
    getPrompt,
    checkRecoveryMode,
    getRecoveryActions,
    getSupplementRecommendations,
    getAvailablePhenotypes
  };
}