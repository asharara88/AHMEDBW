import { useState, useEffect } from 'react';
import { isMobileDevice } from '../utils/deviceDetection';

export interface VoiceSettings {
  enabled: boolean;
  rate: number;
  pitch: number;
  voice: string | null;
  autoSubmit: boolean;
  language: string;
  commandsEnabled: boolean;
  volume: number;
}

const defaultSettings: VoiceSettings = {
  enabled: false,
  rate: 1.0,
  pitch: 1.0,
  voice: null,
  autoSubmit: true,
  language: 'en-US',
  commandsEnabled: true,
  volume: 1.0
};

export function useVoiceSettings() {
  const [settings, setSettings] = useState<VoiceSettings>(() => {
    // Try to load settings from localStorage
    const savedSettings = localStorage.getItem('biowell-voice-settings');
    if (savedSettings) {
      try {
        return { ...defaultSettings, ...JSON.parse(savedSettings) };
      } catch (e) {
        console.error('Error parsing voice settings:', e);
      }
    }
    return defaultSettings;
  });

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('biowell-voice-settings', JSON.stringify(settings));
  }, [settings]);

  // Update a single setting
  const updateSetting = <K extends keyof VoiceSettings>(key: K, value: VoiceSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // Toggle voice enablement
  const toggleVoice = () => {
    setSettings(prev => ({ ...prev, enabled: !prev.enabled }));
  };

  // Toggle auto-submit
  const toggleAutoSubmit = () => {
    setSettings(prev => ({ ...prev, autoSubmit: !prev.autoSubmit }));
  };

  // Toggle voice commands
  const toggleVoiceCommands = () => {
    setSettings(prev => ({ ...prev, commandsEnabled: !prev.commandsEnabled }));
  };

  // Reset settings to defaults
  const resetSettings = () => {
    // On mobile, keep autoSubmit true for better UX
    const mobileDefaults = isMobileDevice() 
      ? { ...defaultSettings, autoSubmit: true }
      : defaultSettings;
    
    setSettings(mobileDefaults);
  };

  // Detect optimal settings for the current device/browser
  const optimizeSettings = () => {
    const newSettings = { ...settings };
    
    if (isMobileDevice()) {
      // Mobile-optimized settings
      newSettings.rate = 0.9; // Slightly slower for mobile speakers
      newSettings.pitch = 1.0;
      newSettings.autoSubmit = true; // Auto-submit is better on mobile
    } else {
      // Desktop-optimized settings
      newSettings.rate = 1.0;
      newSettings.pitch = 1.0;
      newSettings.autoSubmit = true;
    }
    
    setSettings(newSettings);
  };

  // Return the current settings and methods to update them
  return {
    settings,
    updateSetting,
    toggleVoice,
    toggleAutoSubmit,
    toggleVoiceCommands,
    resetSettings,
    optimizeSettings
  };
}