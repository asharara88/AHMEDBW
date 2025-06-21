import codex from './codex_biowell_export_v1.json'

/**
 * Get the appropriate prompt based on user phenotype
 * @param phenotype The user's health phenotype
 * @returns Prompt string for the given phenotype or fallback message
 */
export function getPromptByPhenotype(phenotype: string): string {
  return codex.phenotype_to_prompt_map[phenotype] || codex.fallback_logic.no_stack_match
}

/**
 * Determine if recovery mode should be triggered based on user input and sleep data
 * @param userInput The user's message text
 * @param sleepData Sleep metrics data
 * @returns Boolean indicating if recovery mode should be triggered
 */
export function shouldTriggerRecovery(
  userInput: string,
  sleepData: { deepSleep: number; remSleep: number }
): boolean {
  const inputKeywords = ['burnout', 'tired', 'demotivated', "can't focus"]
  const matchesInput = inputKeywords.some(word =>
    userInput.toLowerCase().includes(word)
  )
  const lowSleep = sleepData.deepSleep < 40 && sleepData.remSleep < 60

  return matchesInput || lowSleep
}

/**
 * Get recovery mode actions from the codex
 * @returns Array of action strings for recovery mode
 */
export function getRecoveryActions(): string[] {
  return codex.recovery_mode_trigger.actions;
}

/**
 * Get available codex functions
 * @returns Array of function names
 */
export const codexFunctions = codex.modular_functions

/**
 * Get fallback logic for a specific scenario
 * @param scenario The fallback scenario (missing_quiz, no_stack_match, data_sync_error)
 * @returns Fallback message for the given scenario
 */
export function getFallbackLogic(scenario: 'missing_quiz' | 'no_stack_match' | 'data_sync_error'): string {
  const fallbackLogic = codex.fallback_logic as Record<string, string>;
  return fallbackLogic[scenario] || 'Please try again later.';
}

/**
 * Get all available phenotypes from the codex
 * @returns Array of phenotype strings
 */
export function getAvailablePhenotypes(): string[] {
  return Object.keys(codex.phenotype_to_prompt_map);
}

/**
 * Generate a supplement stack based on phenotype
 * @param phenotype The user's health phenotype
 * @returns Object containing supplement recommendations
 */
export function generateSupplementStack(phenotype: string): any {
  // This is a placeholder implementation
  // In a real implementation, this would use the phenotype to generate
  // a personalized supplement stack based on the user's needs
  
  const stacks = {
    'low_dopamine': [
      { name: 'Tyrosine', dosage: '500-1000mg', timing: 'Morning, empty stomach' },
      { name: 'Rhodiola Rosea', dosage: '300-500mg', timing: 'Morning' },
      { name: 'Vitamin B Complex', dosage: 'As directed', timing: 'With breakfast' }
    ],
    'poor_sleep': [
      { name: 'Magnesium Glycinate', dosage: '300-400mg', timing: 'Before bed' },
      { name: 'Ashwagandha', dosage: '600mg', timing: 'Evening' },
      { name: 'L-Theanine', dosage: '200mg', timing: 'Before bed' }
    ],
    'high_performance': [
      { name: 'Rhodiola', dosage: '300mg', timing: 'Morning' },
      { name: 'Creatine Monohydrate', dosage: '5g', timing: 'Daily, any time' },
      { name: 'L-Theanine', dosage: '200mg', timing: 'As needed' }
    ],
    'gut_issues': [
      { name: 'Probiotics', dosage: '10-30 billion CFU', timing: 'Morning, empty stomach' },
      { name: 'L-Glutamine', dosage: '5g', timing: 'Between meals' },
      { name: 'Digestive Enzymes', dosage: '1-2 capsules', timing: 'With meals' }
    ],
    'fat_loss': [
      { name: 'Berberine', dosage: '500mg', timing: 'With meals' },
      { name: 'Alpha Lipoic Acid', dosage: '600mg', timing: 'With meals' },
      { name: 'Green Tea Extract', dosage: '500mg', timing: 'Morning' }
    ]
  };
  
  return stacks[phenotype] || [];
}

export default {
  getPromptByPhenotype,
  shouldTriggerRecovery,
  getRecoveryActions,
  codexFunctions,
  getFallbackLogic,
  getAvailablePhenotypes,
  generateSupplementStack
};