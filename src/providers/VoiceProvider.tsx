import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVoiceSettings } from '../hooks/useVoiceSettings';
import { useVoiceCommands } from '../hooks/useVoiceCommands';
import TextToSpeechService from '../services/TextToSpeechService';
import { ErrorCode, createErrorObject } from '../utils/errorHandling';
import { useError } from '../contexts/ErrorContext';

interface VoiceContextType {
  // State
  isListening: boolean;
  isSpeaking: boolean;
  transcript: string;
  interimTranscript: string;
  lastCommand: string | null;
  isVoiceSupported: boolean;
  
  // Settings 
  settings: ReturnType<typeof useVoiceSettings>['settings'];
  updateSetting: <K extends keyof ReturnType<typeof useVoiceSettings>['settings']>(
    key: K, 
    value: ReturnType<typeof useVoiceSettings>['settings'][K]
  ) => void;
  toggleVoice: () => void;
  
  // Actions
  startListening: () => void;
  stopListening: () => void;
  speak: (text: string, options?: any) => Promise<void>;
  stopSpeaking: () => void;
  processCommand: (text: string) => boolean;
  
  // Voice commands
  executeVoiceQuery: (query: string) => void;
  showCommandHelp: () => void;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export const VoiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  }
  const navigate = useNavigate();
  const { addError } = useError();
  const { 
    settings, 
    updateSetting: updateSettingOriginal, 
    toggleVoice 
  } = useVoiceSettings();
  
  const { 
    initCommands, 
    handleVoiceInput, 
    showVoiceHelp 
  } = useVoiceCommands();
  
  // Voice state
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [lastCommand, setLastCommand] = useState<string | null>(null);
  
  // Check for browser support
  const isVoiceSupported = useMemo(() => {
    return typeof window !== 'undefined' && (
      ('SpeechRecognition' in window) || 
      ('webkitSpeechRecognition' in window)
    );
  }, []);
  
  // Initialize TTS service
  const ttsService = useMemo(() => TextToSpeechService.getInstance(), []);
  const ttsSupported = TextToSpeechService.isSupported();
  
  // Initialize voice commands
  useEffect(() => {
    if (settings.commandsEnabled) {
      initCommands();
    }
  }, [initCommands, settings.commandsEnabled]);
  
  // Update a setting with type safety
  const updateSetting = <K extends keyof typeof settings>(
    key: K, 
    value: (typeof settings)[K]
  ) => {
    updateSettingOriginal(key, value);
  };
  
  // Start speech recognition
  const startListening = () => {
    if (!isVoiceSupported) {
      addError(createErrorObject(
        'Speech recognition is not supported in this browser',
        'warning',
        ErrorCode.DEVICE_NOT_SUPPORTED,
        'voice'
      ));
      return;
    }
    
    // Request microphone permission and start recognition
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => {
        setIsListening(true);
        // In a real implementation, we would start the SpeechRecognition API here
        // For now, we'll just set the state for demo purposes
      })
      .catch(err => {
        addError(createErrorObject(
          'Microphone access is required for voice input',
          'warning',
          ErrorCode.DEVICE_PERMISSION_DENIED,
          'voice',
          err
        ));
      });
  };
  
  // Stop speech recognition
  const stopListening = () => {
    setIsListening(false);
    // In a real implementation, we would stop the SpeechRecognition API here
  };
  
  // Speak text using TTS
  const speak = async (text: string, options?: any) => {
    if (!ttsSupported || !settings.enabled) return;
    
    try {
      setIsSpeaking(true);
      
      await ttsService.speak(text, {
        rate: settings.rate,
        pitch: settings.pitch,
        voice: settings.voice || undefined,
        language: settings.language,
        ...options
      });
      
    } catch (error) {
      addError(createErrorObject(
        `Error playing audio: ${error instanceof Error ? error.message : String(error)}`,
        'warning',
        ErrorCode.AUDIO_PLAYBACK_FAILED,
        'tts'
      ));
    } finally {
      setIsSpeaking(false);
    }
  };
  
  // Stop speaking
  const stopSpeaking = () => {
    if (ttsSupported) {
      ttsService.stop();
      setIsSpeaking(false);
    }
  };
  
  // Process a voice command
  const processCommand = (text: string) => {
    if (!settings.commandsEnabled) return false;
    
    const result = handleVoiceInput(text);
    
    if (result.wasCommand && result.handled) {
      setLastCommand(result.command || null);
      return true;
    }
    
    return false;
  };
  
  // Execute a voice query (directly to chat)
  const executeVoiceQuery = (query: string) => {
    document.dispatchEvent(new CustomEvent('queryHealthCoach', {
      detail: { query }
    }));
  };
  
  // Show available commands help
  const showCommandHelp = () => {
    showVoiceHelp();
  };
  
  const contextValue: VoiceContextType = {
    // State
    isListening,
    isSpeaking,
    transcript,
    interimTranscript,
    lastCommand,
    isVoiceSupported,
    
    // Settings
    settings,
    updateSetting,
    toggleVoice,
    
    // Actions
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    processCommand,
    
    // Voice commands
    executeVoiceQuery,
    showCommandHelp
  };
  
  return (
    <VoiceContext.Provider value={contextValue}>
      {children}
    </VoiceContext.Provider>
  );
}; // <-- function closes here
}

export const useVoice = () => {
  const context = useContext(VoiceContext);
  if (context === undefined) {
    throw new Error('useVoice must be used within a VoiceProvider');
  }
  return context;
};