import { useState } from 'react';
import { Volume2, VolumeX, Settings } from 'lucide-react';
import VoiceSettingsPanel from './VoiceSettingsPanel';

interface VoiceControlsProps {
  preferSpeech: boolean;
  onToggleSpeech: () => void;
  selectedVoice: string;
  onSelectVoice: (voiceId: string) => void;
  className?: string;
}

const VoiceControls = ({
  preferSpeech,
  onToggleSpeech,
  selectedVoice,
  onSelectVoice,
  className = ''
}: VoiceControlsProps) => {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className={className}>
      <div className="flex items-center gap-1">
        <button 
          className={`rounded-full p-1 ${preferSpeech ? 'text-primary' : 'text-text-light hover:bg-[hsl(var(--color-card))] hover:text-text'}`}
          title={preferSpeech ? "Turn off voice" : "Turn on voice"}
          onClick={onToggleSpeech}
          aria-pressed={preferSpeech}
        >
          {preferSpeech ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </button>
        <button 
          className={`rounded-full p-1 ${showSettings ? 'text-primary' : 'text-text-light hover:bg-[hsl(var(--color-card))] hover:text-text'}`}
          title="Voice settings"
          onClick={() => setShowSettings(!showSettings)}
          aria-expanded={showSettings}
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>
      
      {showSettings && (
        <VoiceSettingsPanel
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          preferSpeech={preferSpeech}
          onToggleSpeech={onToggleSpeech}
          selectedVoice={selectedVoice}
          onSelectVoice={onSelectVoice}
        />
      )}
    </div>
  );
};

export default VoiceControls;