import { useState } from 'react';
import { Settings } from 'lucide-react';
import ChatSettings from './ChatSettings';
import VoicePreferences from './VoicePreferences';

interface ChatSettingsButtonProps {
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

const ChatSettingsButton = ({ 
  className = '',
  showVoiceSettings,
  onVoiceToggle,
  selectedVoice,
  onVoiceSelect,
  voiceSettings,
  onVoiceSettingsUpdate
}: ChatSettingsButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`rounded-full p-2 transition-colors ${
          isOpen ? 'bg-primary text-white' : 'text-text-light hover:bg-[hsl(var(--color-card-hover))] hover:text-text'
        }`}
        aria-label="Settings"
        aria-expanded={isOpen}
        type="button"
      >
        <Settings className="h-5 w-5" />
      </button>
      
      {isOpen && (
        <ChatSettings 
          onClose={() => setIsOpen(false)} 
          showVoiceSettings={showVoiceSettings}
          onVoiceToggle={onVoiceToggle}
          selectedVoice={selectedVoice}
          onVoiceSelect={onVoiceSelect}
          voiceSettings={voiceSettings}
          onVoiceSettingsUpdate={onVoiceSettingsUpdate}
        />
      )}
    </div>
  );
};

export default ChatSettingsButton;