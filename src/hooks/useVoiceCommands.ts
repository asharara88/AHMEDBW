import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVoiceSettings } from './useVoiceSettings';
import { SpeechCommandService, useDefaultSpeechCommands, CommandType } from '../services/SpeechCommandService';
import { useError } from '../contexts/ErrorContext';
import { ErrorCode, createErrorObject } from '../utils/errorHandling';

export function useVoiceCommands() {
  const navigate = useNavigate();
  const { addError } = useError();
  const { settings } = useVoiceSettings();
  const commandService = SpeechCommandService.getInstance();
  const { registerCommands, processCommand } = useDefaultSpeechCommands(navigate);

  // Set the command service language
  commandService.setLanguage(settings.language);

  // Initialize commands
  const initCommands = useCallback(() => {
    registerCommands();

    // Register custom application-specific commands
    commandService.registerCommands([
      {
        name: 'showSleepRecommendations',
        type: CommandType.QUERY,
        patterns: [
          'sleep recommendations', 
          'how can I improve my sleep',
          'help me sleep better'
        ],
        description: 'Get sleep improvement recommendations',
        action: () => {
          // Dispatch a custom event to be handled by the chat component
          document.dispatchEvent(new CustomEvent('queryHealthCoach', {
            detail: { query: 'How can I improve my sleep quality?' }
          }));
        },
        examples: ['sleep recommendations', 'help me sleep better']
      },
      {
        name: 'showMetabolicHealth',
        type: CommandType.QUERY,
        patterns: [
          'metabolic health', 
          'blood sugar',
          'check my metabolism',
          'how is my glucose'
        ],
        description: 'Get metabolic health information',
        action: () => {
          document.dispatchEvent(new CustomEvent('queryHealthCoach', {
            detail: { query: "How's my metabolic health?" }
          }));
        },
        examples: ['check my metabolism', 'how is my glucose']
      },
      {
        name: 'supplementRecommendations',
        type: CommandType.QUERY,
        patterns: [
          'supplement recommendations',
          'what supplements should I take',
          'recommend supplements'
        ],
        description: 'Get supplement recommendations',
        action: () => {
          document.dispatchEvent(new CustomEvent('queryHealthCoach', {
            detail: { query: 'What supplements should I take?' }
          }));
        },
        examples: ['supplement recommendations', 'what supplements should I take']
      }
    ]);
  }, [registerCommands, settings.language]);

  // Process a voice input
  const handleVoiceInput = useCallback((transcript: string) => {
    // Process the voice command
    const result = processCommand(transcript);

    // If no command was executed, it might be a general query for the health coach
    if (!result.executed) {
      return {
        wasCommand: false,
        transcript,
        handled: false
      };
    }

    return {
      wasCommand: true,
      command: result.command?.name,
      transcript,
      handled: true
    };
  }, [processCommand]);

  // Show voice command help
  const showVoiceHelp = useCallback(() => {
    addError(createErrorObject(
      'Available voice commands: Try "go to dashboard", "sleep recommendations", or just ask a health question.',
      'info',
      ErrorCode.HELP_REQUEST,
      'voice-commands',
      null,
      true
    ));
  }, [addError]);

  return {
    initCommands,
    handleVoiceInput,
    showVoiceHelp,
    getAvailableCommands: () => commandService.getAllCommands()
  };
}