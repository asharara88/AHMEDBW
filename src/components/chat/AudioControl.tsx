import { useState, useEffect } from 'react';
import { Volume2, VolumeX, Sliders, MusicIcon, Users, RefreshCcw } from 'lucide-react';
import TextToSpeechService from '../../services/TextToSpeechService';
import { isIOS, isSafari, isMobileDevice } from '../../utils/deviceDetection';

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
  const [selectedLanguage, setSelectedLanguage] = useState<string>(settings.language);
  const [filteredVoices, setFilteredVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [loadingVoices, setLoadingVoices] = useState(true);
  const ttsService = TextToSpeechService.getInstance();
  const isMobile = isMobileDevice();

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      setLoadingVoices(true);
      const voices = ttsService.getVoices();
      if (voices.length > 0) {
        setAvailableVoices(voices);
        
        // Get voices for current language
        const langVoices = voices.filter(voice => 
          voice.lang.startsWith(selectedLanguage.split('-')[0])
        );
        setFilteredVoices(langVoices.length > 0 ? langVoices : voices);
        setLoadingVoices(false);
      } else if (typeof window !== 'undefined' && window.speechSynthesis) {
        // Try to get voices after a delay (for Chrome)
        setTimeout(() => {
          const newVoices = window.speechSynthesis.getVoices();
          if (newVoices.length > 0) {
            setAvailableVoices(newVoices);
            const langVoices = newVoices.filter(voice => 
              voice.lang.startsWith(selectedLanguage.split('-')[0])
            );
            setFilteredVoices(langVoices.length > 0 ? langVoices : newVoices);
          }
          setLoadingVoices(false);
        }, 500);
      } else {
        setLoadingVoices(false);
      }
    };

    loadVoices();

    // Handle dynamically loaded voices (e.g., in Chrome)
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
      
      return () => {
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  }, [selectedLanguage]);

  // Handle language change
  const handleLanguageChange = (lang: string) => {
    setSelectedLanguage(lang);
    onChange('language', lang);
    
    // Filter voices based on selected language
    if (availableVoices.length > 0) {
      const langVoices = availableVoices.filter(voice => 
        voice.lang.startsWith(lang.split('-')[0])
      );
      setFilteredVoices(langVoices.length > 0 ? langVoices : availableVoices);
      
      // If current voice doesn't match language, reset it
      if (settings.voice) {
        const currentVoice = availableVoices.find(v => v.name === settings.voice);
        if (currentVoice && !currentVoice.lang.startsWith(lang.split('-')[0])) {
          onChange('voice', null);
        }
      }
    }
  };

  // Test current voice settings
  const testVoice = () => {
    const testPhrases: Record<string, string> = {
      'en': 'This is a test of your current voice settings. How does this sound?',
      'ar': 'هذا اختبار لإعدادات الصوت الحالية. كيف يبدو هذا؟',
      'fr': 'Ceci est un test de vos paramètres vocaux actuels. Comment cela sonne-t-il?',
      'de': 'Dies ist ein Test Ihrer aktuellen Spracheinstellungen. Wie klingt das?',
      'es': 'Esta es una prueba de su configuración de voz actual. ¿Cómo suena esto?'
    };
    
    // Get language code for test phrase
    const langCode = selectedLanguage.split('-')[0];
    const testPhrase = testPhrases[langCode] || testPhrases.en;
    
    ttsService.speak(testPhrase, {
      voice: settings.voice || undefined,
      rate: settings.rate,
      pitch: settings.pitch,
      language: settings.language
    });
  };

  // Get available language options
  const getLanguageOptions = () => {
    const langMap = new Map<string, string>();
    
    // Add common languages
    langMap.set('en-US', 'English (US)');
    langMap.set('en-GB', 'English (UK)');
    langMap.set('ar-AE', 'Arabic (UAE)');
    langMap.set('fr-FR', 'French');
    langMap.set('de-DE', 'German');
    langMap.set('es-ES', 'Spanish');
    
    // Add languages from available voices
    availableVoices.forEach(voice => {
      if (voice.lang && !langMap.has(voice.lang)) {
        // Try to get a nice language name
        try {
          const langName = new Intl.DisplayNames([navigator.language], { type: 'language' })
            .of(voice.lang.split('-')[0]);
          langMap.set(voice.lang, langName);
        } catch (e) {
          langMap.set(voice.lang, voice.lang);
        }
      }
    });
    
    return Array.from(langMap.entries()).map(([code, name]) => ({
      value: code,
      label: name
    }));
  };

  return (
    <>
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-base font-medium flex items-center gap-2">
          <Sliders className="h-4 w-4 text-primary" aria-hidden="true" />
          Voice Settings
        </h4>
        
        {/* Toggle audio button */}
        <button
          onClick={onToggleAudio}
          className={`flex items-center gap-1 rounded-lg px-2 py-1 text-sm transition-colors ${
            audioEnabled 
              ? 'bg-primary/10 text-primary' 
              : 'bg-[hsl(var(--color-card))] text-text-light hover:bg-[hsl(var(--color-card-hover))]'
          }`}
          aria-pressed={audioEnabled}
        >
          {audioEnabled ? (
            <>
              <Volume2 className="h-4 w-4" aria-hidden="true" />
              <span>Enabled</span>
            </>
          ) : (
            <>
              <VolumeX className="h-4 w-4" aria-hidden="true" />
              <span>Disabled</span>
            </>
          )}
        </button>
      </div>
      
      <div className="space-y-4 rounded-lg bg-[hsl(var(--color-card))] p-4">
        {/* Main settings section - only enabled when audio is turned on */}
        <div className={audioEnabled ? '' : 'opacity-50 pointer-events-none'}>
          {/* Language Selection */}
          <div className="mb-4">
            <label htmlFor="speech-language" className="mb-1 block text-sm font-medium text-text-light">
              <Users className="inline-block h-4 w-4 mr-1" aria-hidden="true" />
              Language
            </label>
            <select
              id="speech-language"
              value={selectedLanguage}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-3 py-2 text-base text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              aria-label="Select language for speech synthesis and recognition"
              disabled={!audioEnabled}
            >
              {getLanguageOptions().map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Voice Selection */}
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <label htmlFor="voice-select" className="mb-1 block text-sm font-medium text-text-light">
                <MusicIcon className="inline-block h-4 w-4 mr-1" aria-hidden="true" />
                Voice
              </label>
              
              {loadingVoices ? (
                <span className="text-xs text-text-light animate-pulse">Loading voices...</span>
              ) : (
                <button 
                  onClick={() => {
                    setLoadingVoices(true);
                    setTimeout(() => {
                      const voices = window.speechSynthesis.getVoices();
                      setAvailableVoices(voices);
                      const langVoices = voices.filter(voice => 
                        voice.lang.startsWith(selectedLanguage.split('-')[0])
                      );
                      setFilteredVoices(langVoices.length > 0 ? langVoices : voices);
                      setLoadingVoices(false);
                    }, 500);
                  }}
                  className="text-xs text-primary flex items-center gap-1 hover:text-primary-dark"
                  aria-label="Refresh voice list"
                >
                  <RefreshCcw className="h-3 w-3" aria-hidden="true" />
                  <span>Refresh</span>
                </button>
              )}
            </div>
            
            <select
              id="voice-select"
              value={settings.voice || ''}
              onChange={(e) => onChange('voice', e.target.value || null)}
              className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-3 py-2 text-base text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              aria-label="Select voice for text-to-speech"
              disabled={!audioEnabled || loadingVoices}
            >
              <option value="">Browser Default</option>
              {filteredVoices.map((voice) => (
                <option key={voice.name} value={voice.name}>
                  {voice.name} {voice.localService ? '(Local)' : ''}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-text-light">
              {loadingVoices 
                ? 'Loading available voices...' 
                : filteredVoices.length === 0 
                  ? 'No voices found for selected language. Using default.' 
                  : `${filteredVoices.length} voices available`
              }
            </p>
          </div>
          
          {/* Speech Rate */}
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <label htmlFor="speech-rate" className="block text-sm font-medium text-text-light">
                Speed: {settings.rate.toFixed(1)}x
              </label>
              <span className="text-sm text-text-light">{settings.rate.toFixed(1)}x</span>
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
              disabled={!audioEnabled}
            />
            <div className="mt-1 flex justify-between text-xs text-text-light">
              <span>Slower</span>
              <span>Faster</span>
            </div>
          </div>
          
          {/* Speech Pitch */}
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <label htmlFor="speech-pitch" className="block text-sm font-medium text-text-light">
                Pitch: {settings.pitch.toFixed(1)}
              </label>
              <span className="text-sm text-text-light">{settings.pitch.toFixed(1)}</span>
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
              disabled={!audioEnabled}
            />
            <div className="mt-1 flex justify-between text-xs text-text-light">
              <span>Lower</span>
              <span>Higher</span>
            </div>
          </div>
          
          {/* Auto-submit Toggle */}
          <div className="mb-4 flex items-center gap-2">
            <input
              type="checkbox"
              id="autoSubmit"
              checked={settings.autoSubmit}
              onChange={(e) => onChange('autoSubmit', e.target.checked)}
              className="h-4 w-4 rounded border-[hsl(var(--color-border))] accent-primary"
              aria-label="Automatically submit after voice input"
              disabled={!audioEnabled}
            />
            <label htmlFor="autoSubmit" className="text-sm text-text-light">
              Auto-submit after voice input
            </label>
          </div>
        </div>
        
        {/* Device-specific notes */}
        {audioEnabled && isMobile && (
          <div className="mt-2 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-2 text-xs text-text-light">
            <p>
              {isIOS() && isSafari() 
                ? "iOS may require tapping the microphone button again if recognition stops unexpectedly."
                : "For best results, speak clearly in a quiet environment."}
            </p>
          </div>
        )}
        
        {/* Action buttons */}
        <div className="flex justify-between">
          <button
            onClick={onClose}
            className="rounded bg-[hsl(var(--color-surface-1))] px-3 py-2 text-sm text-text-light hover:bg-[hsl(var(--color-card-hover))]"
            aria-label="Close settings"
          >
            Close
          </button>
          
          <button
            onClick={testVoice}
            disabled={!audioEnabled}
            className="flex items-center gap-1 rounded bg-primary px-3 py-2 text-sm text-white hover:bg-primary-dark disabled:opacity-50 disabled:hover:bg-primary"
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