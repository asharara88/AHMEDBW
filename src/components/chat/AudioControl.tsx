import { useState, useEffect } from 'react';
import { Volume2 } from 'lucide-react';

interface AudioControlProps {
  settings: {
    rate: number;
    pitch: number;
    voice: string | null;
    autoSubmit: boolean;
    language: string;
  };
  onChange: (setting: string, value: any) => void;
  onClose: () => void;
  audioEnabled: boolean;
  onToggleAudio: () => void;
}

export default function AudioControl({ 
  settings, 
  onChange, 
  onClose, 
  audioEnabled,
  onToggleAudio
}: AudioControlProps) {
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
      }
    };

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      // Load voices on mount
      loadVoices();
      
      // And also when voices change
      window.speechSynthesis.onvoiceschanged = loadVoices;
      
      return () => {
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  }, []);

  return (
    <>
      <h4 className="mb-2 text-sm font-medium">Voice Settings</h4>
      
      <div className="space-y-3">
        {/* Voice Selection */}
        <div>
          <label htmlFor="voice-select" className="mb-1 block text-xs text-text-light">Voice</label>
          <select
            id="voice-select"
            value={settings.voice || ''}
            onChange={(e) => onChange('voice', e.target.value || null)}
            className="w-full rounded border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] px-2 py-1 text-sm"
            aria-label="Select voice for text-to-speech"
          >
            <option value="">Browser Default</option>
            {availableVoices.map((voice) => (
              <option key={voice.name} value={voice.name}>
                {voice.name} ({voice.lang})
              </option>
            ))}
          </select>
        </div>
        
        {/* Speech Rate */}
        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="speech-rate" className="block text-xs text-text-light">Speed: {settings.rate.toFixed(1)}x</label>
            <span className="text-xs text-text-light">{settings.rate.toFixed(1)}x</span>
          </div>
          <input
            id="speech-rate"
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={settings.rate}
            onChange={(e) => onChange('rate', parseFloat(e.target.value))}
            className="w-full accent-primary"
            aria-label={`Speech rate: ${settings.rate.toFixed(1)} times normal speed`}
          />
        </div>
        
        {/* Speech Pitch */}
        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="speech-pitch" className="block text-xs text-text-light">Pitch</label>
            <span className="text-xs text-text-light">{settings.pitch.toFixed(1)}</span>
          </div>
          <input
            id="speech-pitch"
            type="range"
            min="0.5"
            max="1.5"
            step="0.1"
            value={settings.pitch}
            onChange={(e) => onChange('pitch', parseFloat(e.target.value))}
            className="w-full accent-primary"
            aria-label={`Speech pitch: ${settings.pitch.toFixed(1)}`}
          />
        </div>
        
        {/* Language Selection */}
        <div>
          <label htmlFor="speech-language" className="mb-1 block text-xs text-text-light">Voice Recognition Language</label>
          <select
            id="speech-language"
            value={settings.language}
            onChange={(e) => onChange('language', e.target.value)}
            className="w-full rounded border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] px-2 py-1 text-sm"
            aria-label="Select language for speech recognition"
          >
            <option value="en-US">English (US)</option>
            <option value="en-GB">English (UK)</option>
            <option value="ar-AE">Arabic (UAE)</option>
            <option value="fr-FR">French</option>
            <option value="de-DE">German</option>
            <option value="es-ES">Spanish</option>
          </select>
        </div>
        
        {/* Auto-submit Toggle */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="autoSubmit"
            checked={settings.autoSubmit}
            onChange={(e) => onChange('autoSubmit', e.target.checked)}
            className="h-4 w-4 rounded border-[hsl(var(--color-border))] accent-primary"
            aria-label="Automatically submit after voice input"
          />
          <label htmlFor="autoSubmit" className="text-sm text-text-light">
            Auto-submit after voice input
          </label>
        </div>
        
        <div className="flex justify-between">
          <button
            onClick={onClose}
            className="rounded bg-[hsl(var(--color-card))] px-2 py-2 text-sm text-text-light"
            aria-label="Close settings"
          >
            Close
          </button>
          
          <button
            onClick={() => {
              // Test voice with current settings
              if (typeof window !== 'undefined' && window.speechSynthesis) {
                const utterance = new SpeechSynthesisUtterance("This is a test of your current voice settings. How does this sound?");
                utterance.rate = settings.rate;
                utterance.pitch = settings.pitch;
                
                if (settings.voice) {
                  const voices = window.speechSynthesis.getVoices();
                  const selectedVoice = voices.find(v => v.name === settings.voice);
                  if (selectedVoice) utterance.voice = selectedVoice;
                }
                
                window.speechSynthesis.speak(utterance);
              }
            }}
            className="flex items-center gap-1 rounded bg-primary px-3 py-2 text-sm text-white"
            aria-label="Test current voice settings"
          >
            <Volume2 className="h-4 w-4" aria-hidden="true" />
            Test Voice
          </button>
        </div>
      </div>
    </>
  );
}