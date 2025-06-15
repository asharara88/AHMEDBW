import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Settings, Command, Mic, Info, Sliders } from 'lucide-react';
import { useVoice } from '../../providers/VoiceProvider';
import AudioControl from './AudioControl';
import VoiceCommandsGuide from './VoiceCommandsGuide';
import EnhancedVoiceChatButton from './EnhancedVoiceChatButton';

interface VoicePanelProps {
  expanded?: boolean;
  onToggleExpand?: () => void;
  className?: string;
  onTranscript?: (transcript: string, wasCommand?: boolean) => void;
}

export default function VoicePanel({
  expanded = false,
  onToggleExpand,
  className = '',
  onTranscript
}: VoicePanelProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [commandsGuideOpen, setCommandsGuideOpen] = useState(false);
  const { 
    settings, 
    updateSetting, 
    toggleVoice, 
    isVoiceSupported,
    processCommand
  } = useVoice();

  // Handle voice input
  const handleVoiceTranscript = (text: string, wasCommand?: boolean) => {
    if (onTranscript) {
      onTranscript(text, wasCommand);
    }
  };

  // Handle command execution
  const handleCommandExecuted = (command: string, wasHandled: boolean) => {
    console.log(`Command executed: ${command}, handled: ${wasHandled}`);
    // Additional handling if needed
  };

  // If voice is not supported, show an error message
  if (!isVoiceSupported) {
    return (
      <div className={`rounded-lg bg-[hsl(var(--color-card-hover))] p-2 ${className}`}>
        <div className="flex items-center gap-2 text-sm text-text-light">
          <Info className="h-4 w-4 text-warning" aria-hidden="true" />
          <span>Voice features are not supported in this browser</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] ${className}`}>
      {/* Header with toggle controls */}
      <div className="flex items-center justify-between border-b border-[hsl(var(--color-border))] bg-[hsl(var(--color-card-hover))] p-2">
        <h3 className="flex items-center gap-1 text-sm font-medium">
          <Mic className="h-4 w-4 text-primary" aria-hidden="true" />
          <span>Voice Controls</span>
        </h3>

        <div className="flex items-center gap-2">
          {/* Voice on/off toggle */}
          <button
            onClick={toggleVoice}
            className={`rounded-full p-1.5 transition-colors ${
              settings.enabled 
                ? 'bg-primary/10 text-primary' 
                : 'text-text-light hover:bg-[hsl(var(--color-card))] hover:text-text'
            }`}
            aria-label={settings.enabled ? "Turn voice off" : "Turn voice on"}
            aria-pressed={settings.enabled}
          >
            {settings.enabled ? (
              <Volume2 className="h-4 w-4" aria-hidden="true" />
            ) : (
              <VolumeX className="h-4 w-4" aria-hidden="true" />
            )}
          </button>

          {/* Settings button */}
          <button
            onClick={() => setSettingsOpen(!settingsOpen)}
            className={`rounded-full p-1.5 transition-colors ${
              settingsOpen 
                ? 'bg-primary/10 text-primary' 
                : 'text-text-light hover:bg-[hsl(var(--color-card))] hover:text-text'
            }`}
            aria-label="Voice settings"
            aria-expanded={settingsOpen}
            aria-controls="voice-settings-panel"
          >
            <Sliders className="h-4 w-4" aria-hidden="true" />
          </button>

          {/* Commands guide button */}
          <button
            onClick={() => setCommandsGuideOpen(true)}
            className="rounded-full p-1.5 text-text-light hover:bg-[hsl(var(--color-card))] hover:text-text"
            aria-label="Voice commands guide"
          >
            <Command className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Settings panel */}
      <AnimatePresence>
        {settingsOpen && (
          <motion.div
            id="voice-settings-panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="border-b border-[hsl(var(--color-border))] p-3">
              <AudioControl
                settings={{
                  rate: settings.rate,
                  pitch: settings.pitch,
                  voice: settings.voice,
                  autoSubmit: settings.autoSubmit,
                  language: settings.language
                }}
                onChange={(setting, value) => updateSetting(setting as any, value)}
                onClose={() => setSettingsOpen(false)}
                audioEnabled={settings.enabled}
                onToggleAudio={toggleVoice}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice controls - always visible */}
      <div className="p-4">
        <EnhancedVoiceChatButton
          onTranscript={handleVoiceTranscript}
          onCommandExecuted={handleCommandExecuted}
          showHelpButton={true}
          className="mx-auto"
        />
      </div>

      {/* Voice commands guide modal */}
      <VoiceCommandsGuide
        isOpen={commandsGuideOpen}
        onClose={() => setCommandsGuideOpen(false)}
      />
    </div>
  );
}