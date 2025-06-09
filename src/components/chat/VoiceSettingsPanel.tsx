import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Info, Headphones } from 'lucide-react';
import { AVAILABLE_VOICES, elevenlabsApi } from '../../api/elevenlabsApi';

interface VoiceSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  preferSpeech: boolean;
  onToggleSpeech: () => void;
  selectedVoice: string;
  onSelectVoice: (voiceId: string) => void;
  className?: string;
}

const VoiceSettingsPanel = ({
  isOpen,
  onClose,
  preferSpeech,
  onToggleSpeech,
  selectedVoice,
  className = '',
  onSelectVoice
}: VoiceSettingsPanelProps) => {
  const [voices, setVoices] = useState(AVAILABLE_VOICES);
  const [loading, setLoading] = useState(false);
  const [testAudio, setTestAudio] = useState<string | null>(null);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);

  // Fetch available voices when panel opens
  useEffect(() => {
    if (isOpen && elevenlabsApi.isConfigured()) {
      fetchVoices();
    }
    
    // Cleanup audio on unmount
    return () => {
      if (testAudio) {
        URL.revokeObjectURL(testAudio);
      }
    };
  }, [isOpen]);

  const fetchVoices = async () => {
    setLoading(true);
    try {
      const availableVoices = await elevenlabsApi.getVoices();
      setVoices(availableVoices);
    } catch (error) {
      console.error('Failed to fetch voices:', error);
    } finally {
      setLoading(false);
    }
  };

  const testVoice = async (voiceId: string) => {
    // Stop any currently playing audio
    if (testAudio) {
      URL.revokeObjectURL(testAudio);
      setTestAudio(null);
    }
    
    setPlayingVoiceId(voiceId);
    
    try {
      const testText = "Hello, I'm your Biowell health coach. How can I help you today?";
      const audioBlob = await elevenlabsApi.textToSpeech(testText, voiceId);
      const url = URL.createObjectURL(audioBlob);
      setTestAudio(url);
      
      // Play the audio
      const audio = new Audio(url);
      audio.onended = () => setPlayingVoiceId(null);
      audio.play();
    } catch (error) {
      console.error('Error testing voice:', error);
      setPlayingVoiceId(null);
    }
  };

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className={`overflow-hidden rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-4 ${className}`}
    >
      <div className="mb-4 flex items-center justify-between">
        <h4 className="text-sm font-medium">Voice Settings</h4>
        <button
          onClick={onClose}
          className="rounded-full p-1 text-text-light hover:bg-[hsl(var(--color-card))] hover:text-text"
        >
          <X className="h-4 w-4" />
        </button>
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

      
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <label htmlFor="voice-select" className="mb-1 block text-sm">
            Select voice
          </label>
          {loading && <span className="text-xs text-text-light">Loading voices...</span>}
        </div>
        
        <div className="mt-2 space-y-2">
          {voices.map((voice) => (
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
                <label htmlFor={`voice-${voice.id}`} className="text-sm flex items-center gap-1">
                  {voice.name}
                </label>
              </div>
              
              <button
                onClick={() => testVoice(voice.id)}
                disabled={!preferSpeech || playingVoiceId === voice.id}
                className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs transition-colors ${
                  playingVoiceId === voice.id
                    ? 'bg-primary/20 text-primary'
                    : 'bg-[hsl(var(--color-card))] text-text-light hover:bg-[hsl(var(--color-card-hover))] hover:text-text'
                } disabled:cursor-not-allowed disabled:opacity-50`}
              >
                <Headphones className="h-3 w-3" />
                {playingVoiceId === voice.id ? 'Playing...' : 'Preview'}
              </button>
            </div>
          ))}
        </div>
      </div>
      
      <div className="rounded-lg bg-[hsl(var(--color-card))] p-3">
        <div className="flex items-start gap-2">
          <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
          <p className="text-xs text-text-light">
            Voice responses use ElevenLabs text-to-speech technology. Voice quality may vary based on your internet connection.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default VoiceSettingsPanel;