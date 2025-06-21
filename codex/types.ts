/**
 * Types for the Codex system
 */

export interface CodexData {
  version: string;
  exported_at: string;
  phenotype_to_prompt_map: Record<string, string>;
  fallback_logic: FallbackLogic;
  modular_functions: string[];
  recovery_mode_trigger: RecoveryModeTrigger;
}

export interface FallbackLogic {
  missing_quiz: string;
  no_stack_match: string;
  data_sync_error: string;
}

export interface RecoveryModeTrigger {
  conditions: string[];
  actions: string[];
}

export interface SleepData {
  deepSleep?: number;
  remSleep?: number;
  totalSleep?: number;
  sleepScore?: number;
  sleepOnset?: number;
}

export interface SupplementRecommendation {
  name: string;
  dosage: string;
  timing: string;
  evidenceLevel?: 'Green' | 'Yellow' | 'Red';
  benefits?: string[];
}

export type Phenotype = 
  | 'low_dopamine'
  | 'poor_sleep'
  | 'high_performance'
  | 'gut_issues'
  | 'fat_loss';