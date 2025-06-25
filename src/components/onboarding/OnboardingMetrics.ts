/**
 * Utility functions for tracking onboarding metrics
 */

/**
 * Track completion of an onboarding step
 * @param step The step name
 * @param completed Whether the step was completed
 * @returns The current completion rate
 */
export const trackOnboardingStep = (step: string, completed = false): number => {
  // In a real implementation, send to analytics
  console.log(`Onboarding step: ${step}, completed: ${completed}`);
  
  // Store in localStorage for demo purposes
  const onboardingData = JSON.parse(localStorage.getItem('onboarding-metrics') || '{}');
  const updatedData = {
    ...onboardingData,
    steps: {
      ...(onboardingData.steps || {}),
      [step]: {
        visited: true,
        completed: completed,
        timestamp: new Date().toISOString()
      }
    }
  };
  
  localStorage.setItem('onboarding-metrics', JSON.stringify(updatedData));
  
  // Calculate completion rate
  const steps = Object.values(updatedData.steps || {}) as any[];
  const completedSteps = steps.filter(s => s.completed).length;
  const completionRate = steps.length > 0 ? (completedSteps / steps.length) * 100 : 0;
  
  return completionRate;
};

/**
 * Start tracking time spent on a section
 * @param section The section name
 * @returns A function to stop tracking and get the time spent
 */
export const startTimeTracking = (section: string): () => number => {
  const startTime = new Date();
  
  return () => {
    const endTime = new Date();
    const timeSpent = (endTime.getTime() - startTime.getTime()) / 1000; // in seconds
    
    // In a real implementation, send to analytics
    console.log(`Time spent on ${section}: ${timeSpent} seconds`);
    
    // Store in localStorage for demo purposes
    const timeData = JSON.parse(localStorage.getItem('onboarding-time-metrics') || '{}');
    localStorage.setItem('onboarding-time-metrics', JSON.stringify({
      ...timeData,
      [section]: (timeData[section] || 0) + timeSpent
    }));
    
    return timeSpent;
  };
};

/**
 * Track a drop-off point in the onboarding flow
 * @param step The step where the user dropped off
 * @param reason Optional reason for dropping off
 * @returns Analysis of drop-off patterns
 */
export const trackDropOff = (step: string, reason: string | null = null): { 
  mostProblematicStep: string | null; 
  dropOffCounts: Record<string, number>;
} => {
  // In a real implementation, send to analytics
  console.log(`Drop-off at step: ${step}, reason: ${reason || 'unknown'}`);
  
  // Store in localStorage for demo purposes
  const dropOffData = JSON.parse(localStorage.getItem('onboarding-dropoffs') || '[]');
  dropOffData.push({
    step,
    reason,
    timestamp: new Date().toISOString()
  });
  
  localStorage.setItem('onboarding-dropoffs', JSON.stringify(dropOffData));
  
  // Analyze drop-off patterns
  const dropOffCounts = dropOffData.reduce((acc: Record<string, number>, item: any) => {
    acc[item.step] = (acc[item.step] || 0) + 1;
    return acc;
  }, {});
  
  // Find the step with the most drop-offs
  const entries = Object.entries(dropOffCounts);
  const mostProblematicStep = entries.length > 0 
    ? entries.sort((a, b) => b[1] - a[1])[0][0] 
    : null;
  
  return { mostProblematicStep, dropOffCounts };
};