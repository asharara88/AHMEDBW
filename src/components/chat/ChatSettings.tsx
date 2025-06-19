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
            <div className="space-y-4">
              <div>
                <h4 className="mb-2 text-sm font-medium">Chat Preferences</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="auto-scroll"
                      checked={true}
                      className="h-4 w-4 rounded border-[hsl(var(--color-border))] text-primary focus:ring-primary"
                    />
                    <label htmlFor="auto-scroll" className="text-sm">
                      Auto-scroll to new messages
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="show-timestamps"
                      checked={true}
                      className="h-4 w-4 rounded border-[hsl(var(--color-border))] text-primary focus:ring-primary"
                    />
                    <label htmlFor="show-timestamps" className="text-sm">
                      Show message timestamps
                    </label>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="mb-2 text-sm font-medium">Coach Style</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="style-balanced"
                      name="coach-style"
                      checked={true}
                      className="h-4 w-4 text-primary focus:ring-primary"
                    />
                    <label htmlFor="style-balanced" className="text-sm">
                      Balanced
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="style-detailed"
                      name="coach-style"
                      className="h-4 w-4 text-primary focus:ring-primary"
                    />
                    <label htmlFor="style-detailed" className="text-sm">
                      Detailed
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="style-concise"
                      name="coach-style"
                      className="h-4 w-4 text-primary focus:ring-primary"
                    />
                    <label htmlFor="style-concise" className="text-sm">
                      Concise
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="rounded-lg bg-[hsl(var(--color-surface-1))] p-3">
                <div className="flex items-start gap-2">
                  <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                  <p className="text-xs text-text-light">
                    Your chat history is stored securely and used to provide personalized recommendations.
                  </p>
                </div>
              </div>
            </div>
          )}
    </motion.div>
  );
};

export default ChatSettings;