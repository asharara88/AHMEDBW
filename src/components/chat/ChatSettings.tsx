import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, MessageSquare, Sliders, Headphones, Info } from 'lucide-react';
import { useChatStore } from '../../store';
import VoicePreferences from './VoicePreferences';

interface ChatSettingsProps {
  onClose?: () => void;
  className?: string;
  showVoiceSettings?: boolean;
  onVoiceToggle?: () => void;
  selectedVoice?: string;
  onVoiceSelect?: (voiceId: string) => void;
  voiceSettings?: {
    stability: number;
    similarityBoost: number;
  };
  onVoiceSettingsUpdate?: (settings: { stability: number; similarityBoost: number }) => void;
}

const ChatSettings = ({
  onClose,
  className = '',
  showVoiceSettings,
  onVoiceToggle,
  selectedVoice,
  onVoiceSelect,
  voiceSettings,
  onVoiceSettingsUpdate
}: ChatSettingsProps) => {
  const [activeTab, setActiveTab] = useState<'voice' | 'chat'>(showVoiceSettings ? 'voice' : 'chat');
  const [autoScroll, setAutoScroll] = useState(true);
  const [showTimestamps, setShowTimestamps] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [coachStyle, setCoachStyle] = useState<'balanced' | 'detailed' | 'concise'>('balanced');
  
  const { 
    preferSpeech, 
    setPreferSpeech, 
    selectedVoice: storeSelectedVoice, 
    setSelectedVoice: storeSetSelectedVoice,
    voiceSettings: storeVoiceSettings,
    updateVoiceSettings: storeUpdateVoiceSettings
  } = useChatStore();

  // Use props if provided, otherwise fall back to store values
  const actualPreferSpeech = typeof showVoiceSettings !== 'undefined' ? showVoiceSettings : preferSpeech;
  const actualToggleSpeech = onVoiceToggle || (() => setPreferSpeech(!preferSpeech));
  const actualSelectedVoice = selectedVoice || storeSelectedVoice;
  const actualSetSelectedVoice = onVoiceSelect || storeSetSelectedVoice;
  const actualVoiceSettings = voiceSettings || storeVoiceSettings;
  const actualUpdateVoiceSettings = onVoiceSettingsUpdate || storeUpdateVoiceSettings;

  // Toggle switch component
  const ToggleSwitch = ({ 
    id, 
    label, 
    checked, 
    onChange, 
    disabled = false 
  }: { 
    id: string; 
    label: string; 
    checked: boolean; 
    onChange: () => void; 
    disabled?: boolean 
  }) => (
    <div className="flex items-center justify-between">
      <label htmlFor={id} className="text-sm cursor-pointer">{label}</label>
      <button 
        id={id}
        role="switch"
        aria-checked={checked}
        className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors ${
          checked 
            ? 'bg-primary' 
            : 'bg-[hsl(var(--color-surface-2))]'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onClick={!disabled ? onChange : undefined}
        disabled={disabled}
        type="button"
      >
        <span 
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`absolute right-0 top-full z-10 mt-2 w-80 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-4 shadow-lg ${className}`}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-medium">Settings</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-full p-1 text-text-light hover:bg-[hsl(var(--color-surface-1))] hover:text-text"
            type="button"
            aria-label="Close settings"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
          
      <div className="mb-4 flex border-b border-[hsl(var(--color-border))]">
        <button
          onClick={() => setActiveTab('voice')}
          className={`flex items-center gap-1 px-4 py-2 text-sm transition-colors ${
            activeTab === 'voice'
              ? 'border-b-2 border-primary text-primary'
              : 'text-text-light hover:text-text'
          }`}
          type="button"
        >
          <Headphones className="h-4 w-4" />
          Voice
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center gap-1 px-4 py-2 text-sm transition-colors ${
            activeTab === 'chat'
              ? 'border-b-2 border-primary text-primary'
              : 'text-text-light hover:text-text'
          }`}
          type="button"
        >
          <MessageSquare className="h-4 w-4" />
          Chat
        </button>
      </div>
          
      {activeTab === 'voice' && (
        <VoicePreferences
          preferSpeech={actualPreferSpeech}
          onToggleSpeech={actualToggleSpeech}
          selectedVoice={actualSelectedVoice}
          onSelectVoice={actualSetSelectedVoice}
          voiceSettings={actualVoiceSettings}
          onUpdateVoiceSettings={actualUpdateVoiceSettings}
        />
      )}
          
      {activeTab === 'chat' && (
        <div className="space-y-5">
          <div>
            <h4 className="mb-3 text-sm font-medium">Chat Preferences</h4>
            <div className="space-y-3 rounded-lg bg-[hsl(var(--color-surface-1))] p-4">
              <ToggleSwitch
                id="auto-scroll"
                label="Auto-scroll to new messages"
                checked={autoScroll}
                onChange={() => setAutoScroll(!autoScroll)}
              />
              
              <ToggleSwitch
                id="show-timestamps"
                label="Show message timestamps"
                checked={showTimestamps}
                onChange={() => setShowTimestamps(!showTimestamps)}
              />
              
              <ToggleSwitch
                id="show-suggestions"
                label="Show suggested questions"
                checked={showSuggestions}
                onChange={() => setShowSuggestions(!showSuggestions)}
              />
            </div>
          </div>
          
          <div>
            <h4 className="mb-3 text-sm font-medium">Coach Style</h4>
            <div className="space-y-3 rounded-lg bg-[hsl(var(--color-surface-1))] p-4">
              <div className="space-y-2">
                <div 
                  className={`flex cursor-pointer items-center justify-between rounded-lg p-2.5 transition-colors ${
                    coachStyle === 'balanced' 
                      ? 'bg-primary/10 text-primary' 
                      : 'hover:bg-[hsl(var(--color-surface-2))]'
                  }`}
                  onClick={() => setCoachStyle('balanced')}
                >
                  <div className="flex items-center gap-2">
                    <Sliders className="h-4 w-4" />
                    <span className="text-sm">Balanced</span>
                  </div>
                  <div className={`h-4 w-4 rounded-full border ${
                    coachStyle === 'balanced' 
                      ? 'border-primary bg-primary' 
                      : 'border-[hsl(var(--color-border))]'
                  }`}>
                    {coachStyle === 'balanced' && (
                      <span className="flex h-full items-center justify-center">
                        <span className="block h-2 w-2 rounded-full bg-white"></span>
                      </span>
                    )}
                  </div>
                </div>
                
                <div 
                  className={`flex cursor-pointer items-center justify-between rounded-lg p-2.5 transition-colors ${
                    coachStyle === 'detailed' 
                      ? 'bg-primary/10 text-primary' 
                      : 'hover:bg-[hsl(var(--color-surface-2))]'
                  }`}
                  onClick={() => setCoachStyle('detailed')}
                >
                  <div className="flex items-center gap-2">
                    <Sliders className="h-4 w-4" />
                    <span className="text-sm">Detailed</span>
                  </div>
                  <div className={`h-4 w-4 rounded-full border ${
                    coachStyle === 'detailed' 
                      ? 'border-primary bg-primary' 
                      : 'border-[hsl(var(--color-border))]'
                  }`}>
                    {coachStyle === 'detailed' && (
                      <span className="flex h-full items-center justify-center">
                        <span className="block h-2 w-2 rounded-full bg-white"></span>
                      </span>
                    )}
                  </div>
                </div>
                
                <div 
                  className={`flex cursor-pointer items-center justify-between rounded-lg p-2.5 transition-colors ${
                    coachStyle === 'concise' 
                      ? 'bg-primary/10 text-primary' 
                      : 'hover:bg-[hsl(var(--color-surface-2))]'
                  }`}
                  onClick={() => setCoachStyle('concise')}
                >
                  <div className="flex items-center gap-2">
                    <Sliders className="h-4 w-4" />
                    <span className="text-sm">Concise</span>
                  </div>
                  <div className={`h-4 w-4 rounded-full border ${
                    coachStyle === 'concise' 
                      ? 'border-primary bg-primary' 
                      : 'border-[hsl(var(--color-border))]'
                  }`}>
                    {coachStyle === 'concise' && (
                      <span className="flex h-full items-center justify-center">
                        <span className="block h-2 w-2 rounded-full bg-white"></span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="rounded-lg bg-[hsl(var(--color-surface-1))] p-3">
            <div className="flex items-start gap-2">
              <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
              <p className="text-xs text-text-light">
                Your chat history is stored securely and used to provide personalized recommendations. We never share your data with third parties.
              </p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ChatSettings;