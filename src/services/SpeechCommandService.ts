import { useError } from '../contexts/ErrorContext';
import { ErrorCode, createErrorObject } from '../utils/errorHandling';

// Define types of commands that can be recognized
export enum CommandType {
  NAVIGATION = 'navigation',
  ACTION = 'action',
  QUERY = 'query',
  CONTROL = 'control'
}

export interface CommandDefinition {
  name: string;
  type: CommandType;
  patterns: string[];
  description: string;
  action: (params?: string) => void;
  examples?: string[];
}

export class SpeechCommandService {
  private static instance: SpeechCommandService;
  private commands: Map<string, CommandDefinition> = new Map();
  private language: string = 'en-US';
  private debug: boolean = false;

  private constructor() {
    // Initialize with empty command set
    this.commands = new Map();
  }

  public static getInstance(): SpeechCommandService {
    if (!SpeechCommandService.instance) {
      SpeechCommandService.instance = new SpeechCommandService();
    }
    return SpeechCommandService.instance;
  }

  // Set language for pattern matching
  public setLanguage(language: string): void {
    this.language = language;
  }

  // Enable/disable debug mode
  public setDebug(debug: boolean): void {
    this.debug = debug;
  }

  // Register a new command
  public registerCommand(command: CommandDefinition): void {
    this.commands.set(command.name, command);
    if (this.debug) {
      console.log(`Command registered: ${command.name}`);
    }
  }

  // Register multiple commands at once
  public registerCommands(commands: CommandDefinition[]): void {
    commands.forEach(command => this.registerCommand(command));
  }

  // Remove a command
  public removeCommand(name: string): void {
    this.commands.delete(name);
  }

  // Clear all commands
  public clearCommands(): void {
    this.commands.clear();
  }

  // Get all registered commands
  public getAllCommands(): CommandDefinition[] {
    return Array.from(this.commands.values());
  }

  // Get commands by type
  public getCommandsByType(type: CommandType): CommandDefinition[] {
    return Array.from(this.commands.values()).filter(cmd => cmd.type === type);
  }

  // Process speech input and execute matching command
  public processInput(input: string): { executed: boolean; command?: CommandDefinition; params?: string } {
    if (!input) return { executed: false };

    const normalizedInput = input.toLowerCase().trim();
    
    if (this.debug) {
      console.log(`Processing input: "${normalizedInput}"`);
    }

    // Look for matching command patterns
    for (const command of this.commands.values()) {
      for (const pattern of command.patterns) {
        // Create a regex pattern from the command pattern
        // Replace placeholders like {param} with regex capture groups
        const regexPattern = pattern
          .replace(/\{(\w+)\}/g, '([\\w\\s]+)')
          .replace(/\s+/g, '\\s+');
        
        const regex = new RegExp(`^${regexPattern}$`, 'i');
        const match = normalizedInput.match(regex);

        if (match) {
          if (this.debug) {
            console.log(`Command match found: ${command.name}`);
          }
          
          // Extract parameters from the match if any
          let params = undefined;
          if (match.length > 1) {
            params = match[1];
          }
          
          try {
            // Execute the command action
            command.action(params);
            return { executed: true, command, params };
          } catch (error) {
            console.error(`Error executing command ${command.name}:`, error);
            return { executed: false, command };
          }
        }
      }
    }

    // No matching command found
    if (this.debug) {
      console.log("No matching command found");
    }
    
    return { executed: false };
  }

  // Get help information for available commands
  public getHelp(): string {
    const helpText: string[] = ['Available voice commands:'];
    
    // Group commands by type
    const commandsByType = new Map<CommandType, CommandDefinition[]>();
    for (const cmd of this.commands.values()) {
      if (!commandsByType.has(cmd.type)) {
        commandsByType.set(cmd.type, []);
      }
      commandsByType.get(cmd.type)!.push(cmd);
    }
    
    // Add commands to help text by type
    for (const [type, commands] of commandsByType.entries()) {
      helpText.push(`\n${type.toUpperCase()}:`);
      commands.forEach(cmd => {
        helpText.push(`- ${cmd.description}`);
        if (cmd.examples && cmd.examples.length > 0) {
          helpText.push(`  Examples: "${cmd.examples.join('", "')}"`);
        }
      });
    }
    
    return helpText.join('\n');
  }
}

// Initialize default commands
export function useDefaultSpeechCommands(navigate: (path: string) => void) {
  const { addError } = useError();
  const commandService = SpeechCommandService.getInstance();

  // Define default commands
  const defaultCommands: CommandDefinition[] = [
    {
      name: 'navigateHome',
      type: CommandType.NAVIGATION,
      patterns: ['go home', 'go to home', 'navigate to home', 'take me home'],
      description: 'Navigate to the home page',
      action: () => navigate('/'),
      examples: ['go home', 'navigate to home']
    },
    {
      name: 'navigateDashboard',
      type: CommandType.NAVIGATION,
      patterns: ['go to dashboard', 'navigate to dashboard', 'show dashboard', 'open dashboard'],
      description: 'Navigate to the dashboard page',
      action: () => navigate('/dashboard'),
      examples: ['go to dashboard', 'show dashboard']
    },
    {
      name: 'navigateChat',
      type: CommandType.NAVIGATION,
      patterns: ['go to chat', 'navigate to chat', 'open chat', 'show chat'],
      description: 'Navigate to the chat page',
      action: () => navigate('/chat'),
      examples: ['go to chat', 'open chat']
    },
    {
      name: 'navigateSupplements',
      type: CommandType.NAVIGATION,
      patterns: ['go to supplements', 'navigate to supplements', 'show supplements', 'open supplements'],
      description: 'Navigate to the supplements page',
      action: () => navigate('/supplements'),
      examples: ['go to supplements', 'show supplements']
    },
    {
      name: 'navigateProfile',
      type: CommandType.NAVIGATION,
      patterns: ['go to profile', 'navigate to profile', 'show profile', 'open profile', 'go to my profile'],
      description: 'Navigate to the profile page',
      action: () => navigate('/profile'),
      examples: ['go to profile', 'show profile']
    },
    {
      name: 'helpCommand',
      type: CommandType.CONTROL,
      patterns: ['show commands', 'available commands', 'what can I say', 'voice commands', 'help with commands'],
      description: 'Show available voice commands',
      action: () => {
        addError({
          message: 'Voice Commands: Say "go to [page name]" to navigate, or ask health questions directly.',
          severity: 'info',
          source: 'speech-commands',
          code: 'HELP_INFO',
          dismissable: true
        });
      },
      examples: ['show commands', 'what can I say']
    },
    {
      name: 'clearChat',
      type: CommandType.ACTION,
      patterns: ['clear chat', 'clear messages', 'clear conversation', 'start new chat'],
      description: 'Clear the current chat conversation',
      action: () => {
        // This will be implemented in the ChatContext
        document.dispatchEvent(new CustomEvent('clearChat'));
      },
      examples: ['clear chat', 'start new chat']
    }
  ];

  // Register commands
  const registerCommands = () => {
    commandService.registerCommands(defaultCommands);
  };

  // Process speech input
  const processCommand = (input: string) => {
    return commandService.processInput(input);
  };

  return {
    registerCommands,
    processCommand,
    getHelp: () => commandService.getHelp()
  };
}

export default SpeechCommandService;