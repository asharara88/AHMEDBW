import { useState } from 'react';
import { Info } from 'lucide-react';
import { AVAILABLE_VOICES, VOICE_SETTINGS, elevenlabsApi } from '../../api/elevenlabsApi';

interface VoicePreferencesProps {
  preferSpeech: boolean;
  onToggleSpeech: () => void;
  selectedVoice: string;
  onSelectVoice: (voiceId: string) => void;
  voiceSettings: {
    stability: number;
    similarityBoost: number;
  };
  onUpdateVoiceSettings: (settings: { stability: number; similarityBoost: number }) => void;
  className?: string;
}

const VoicePreferences = ({
  preferSpeech,
  onToggleSpeech,
  selectedVoice,
  onSelectVoice,
  voiceSettings,
  onUpdateVoiceSettings,
  className = ''
}: VoicePreferencesProps) => {
  const [activeTab, setActiveTab] = useState<'voices' | 'settings'>('voices');
  const [testingVoice, setTestingVoice] = useState<string | null>(null);

  const testVoice = async (voiceId: string) => {
    setTestingVoice(voiceId);
    
    try {
      const testText = "Hello, I'm your Biowell health coach. How can I help you today?";
      const audioBlob = await elevenlabsApi.textToSpeech(testText, voiceId);
      const url = URL.createObjectURL(audioBlob);
      
      // Play the audio
      const audio = new Audio(url);
      audio.onended = () => {
        setTestingVoice(null);
        URL.revokeObjectURL(url);
      };
      audio.onerror = () => {
        setTestingVoice(null);
        URL.revokeObjectURL(url);
      };
      
      await audio.play();
    } catch (error) {
      console.error('Error testing voice:', error);
      setTestingVoice(null);
    }
  };

  const handleStabilityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const stability = parseFloat(e.target.value);
    onUpdateVoiceSettings({
      ...voiceSettings,
      stability
    });
  };

  const handleSimilarityBoostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const similarityBoost = parseFloat(e.target.value);
    onUpdateVoiceSettings({
      ...voiceSettings,
      similarityBoost
    });
  };

  const applyPreset = (preset: 'standard' | 'clear' | 'expressive') => {
    let settings;
    
    switch (preset) {
      case 'standard':
        settings = VOICE_SETTINGS.STANDARD;
        break;
      case 'clear':
        settings = VOICE_SETTINGS.CLEAR;
        break;
      case 'expressive':
        settings = VOICE_SETTINGS.EXPRESSIVE;
        break;
    }
    
    onUpdateVoiceSettings({
      stability: settings.stability,
      similarityBoost: settings.similarity_boost
    });
  };

  return (
    <div className={`rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-4 ${className}`}>
      <div className="mb-4">
        <h3 className="text-sm font-medium">Voice Preferences</h3>
        <p className="text-xs text-text-light mt-1">Customize how your health coach speaks to you</p>
      </div>
      
      <div className="mb-4 flex items-center gap-2">
        <input
          type="checkbox"
          id="enable-speech"
          checked={preferSpeech}
          onChange={onToggleSpeech}
          className="h-4 w-4 rounded border-[hsl(var(--color-border))] text-primary focus:ring-primary"
        />
        <label htmlFor="enable-speech" className="text-sm">
          Enable voice responses
        </label>
      </div>
      
      {/* Tabs */}
      <div className="mb-4 flex border-b border-[hsl(var(--color-border))]">
        <button
          onClick={() => setActiveTab('voices')}
          className={`px-4 py-2 text-sm transition-colors ${
            activeTab === 'voices'
              ? 'border-b-2 border-primary text-primary'
              : 'text-text-light hover:text-text'
          }`}
        >
          Voices
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 text-sm transition-colors ${
            activeTab === 'settings'
              ? 'border-b-2 border-primary text-primary'
              : 'text-text-light hover:text-text'
          }`}
        >
          Advanced Settings
        </button>
      </div>
      
      {/* Voice Selection Tab */}
      {activeTab === 'voices' && (
        <div className="space-y-2">
          {AVAILABLE_VOICES.map((voice) => (
            <div 
              key={voice.id}
              className={`flex items-center justify-between rounded-lg border p-2 transition-colors ${
                selectedVoice === voice.id 
                  ? 'border-primary bg-primary/5' 
                  : 'border-[hsl(var(--color-border))] hover:border-primary/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id={`voice-${voice.id}`}
                  name="voice-selection"
                  checked={selectedVoice === voice.id}
                  onChange={() => onSelectVoice(voice.id)}
                  className="h-4 w-4 text-primary focus:ring-primary"
                  disabled={!preferSpeech}
                />
                <label htmlFor={`voice-${voice.id}`} className="text-sm">
                  {voice.name}
                </label>
              </div>
              
              <button
                onClick={() => testVoice(voice.id)}
                disabled={!preferSpeech || testingVoice === voice.id}
                className={`rounded-lg px-2 py-1 text-xs transition-colors ${
                  testingVoice === voice.id
                    ? 'bg-primary/20 text-primary'
                    : 'bg-[hsl(var(--color-card))] text-text-light hover:bg-[hsl(var(--color-card-hover))] hover:text-text'
                } disabled:cursor-not-allowed disabled:opacity-50`}
              >
                {testingVoice === voice.id ? 'Playing...' : 'Test'}
              </button>
            </div>
          ))}
        </div>
      )}
      
      {/* Advanced Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="stability" className="text-sm">
                Stability: {voiceSettings.stability.toFixed(2)}
              </label>
              <span className="text-xs text-text-light">
                {voiceSettings.stability < 0.35 ? 'More variable' : 
                 voiceSettings.stability > 0.65 ? 'More stable' : 'Balanced'}
              </span>
            </div>
            <input
              id="stability"
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={voiceSettings.stability}
              onChange={handleStabilityChange}
              className="w-full h-2 bg-[hsl(var(--color-surface-2))] rounded-lg appearance-none cursor-pointer"
              disabled={!preferSpeech}
            />
            <p className="text-xs text-text-light mt-1">
              Lower values create more expressive and variable speech. Higher values make the voice more consistent.
            </p>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="similarity-boost" className="text-sm">
                Clarity: {voiceSettings.similarityBoost.toFixed(2)}
              </label>
              <span className="text-xs text-text-light">
                {voiceSettings.similarityBoost < 0.35 ? 'More unique' : 
                 voiceSettings.similarityBoost > 0.65 ? 'More clear' : 'Balanced'}
              </span>
            </div>
            <input
              id="similarity-boost"
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={voiceSettings.similarityBoost}
              onChange={handleSimilarityBoostChange}
              className="w-full h-2 bg-[hsl(var(--color-surface-2))] rounded-lg appearance-none cursor-pointer"
              disabled={!preferSpeech}
            />
            <p className="text-xs text-text-light mt-1">
              Higher values make the voice clearer and reduce artifacts. Lower values make the voice more unique.
            </p>
          </div>
          
          <div className="pt-2">
            <h4 className="text-sm font-medium mb-2">Presets</h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => applyPreset('standard')}
                className="rounded-lg border border-[hsl(var(--color-border))] px-3 py-1 text-xs hover:bg-[hsl(var(--color-card-hover))]"
                disabled={!preferSpeech}
              >
                Standard
              </button>
              <button
                onClick={() => applyPreset('clear')}
                className="rounded-lg border border-[hsl(var(--color-border))] px-3 py-1 text-xs hover:bg-[hsl(var(--color-card-hover))]"
                disabled={!preferSpeech}
              >
                Clear
              </button>
              <button
                onClick={() => applyPreset('expressive')}
                className="rounded-lg border border-[hsl(var(--color-border))] px-3 py-1 text-xs hover:bg-[hsl(var(--color-card-hover))]"
                disabled={!preferSpeech}
              >
                Expressive
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-4 rounded-lg bg-[hsl(var(--color-card))] p-3">
        <div className="flex items-start gap-2">
          <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
          <p className="text-xs text-text-light">
            Voice responses use ElevenLabs text-to-speech technology. Voice quality may vary based on your internet connection.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VoicePreferences;