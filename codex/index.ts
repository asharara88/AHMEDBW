// Export all Codex functionality from a single file
export * from './types';
export * from './useCodex';
export { default as codexRouter } from './codexRouter';

// Export individual functions from the router for direct use
export {
  getPromptByPhenotype,
  shouldTriggerRecovery,
  getRecoveryActions,
  getCodexFunctions,
  getFallbackLogic,
  getAvailablePhenotypes,
  generateSupplementStack
} from './codexRouter';