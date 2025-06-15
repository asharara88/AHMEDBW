import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Command, X, Navigation, Sparkles, HelpCircle, ArrowRightLeft, MessagesSquare } from 'lucide-react';
import { CommandType } from '../../services/SpeechCommandService';
import { useVoiceCommands } from '../../hooks/useVoiceCommands';

interface VoiceCommandsGuideProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export default function VoiceCommandsGuide({
  isOpen,
  onClose,
  className = ''
}: VoiceCommandsGuideProps) {
  const [activeTab, setActiveTab] = useState<CommandType | 'all'>(CommandType.NAVIGATION);
  const { getAvailableCommands } = useVoiceCommands();
  const commands = getAvailableCommands();
  
  // Group commands by type
  const commandsByType = {
    [CommandType.NAVIGATION]: commands.filter(cmd => cmd.type === CommandType.NAVIGATION),
    [CommandType.ACTION]: commands.filter(cmd => cmd.type === CommandType.ACTION),
    [CommandType.QUERY]: commands.filter(cmd => cmd.type === CommandType.QUERY),
    [CommandType.CONTROL]: commands.filter(cmd => cmd.type === CommandType.CONTROL),
  };
  
  // Get the icon for each command type
  const getTabIcon = (type: CommandType | 'all') => {
    switch (type) {
      case CommandType.NAVIGATION:
        return <Navigation className="h-4 w-4" />;
      case CommandType.ACTION:
        return <Sparkles className="h-4 w-4" />;
      case CommandType.QUERY:
        return <MessagesSquare className="h-4 w-4" />;
      case CommandType.CONTROL:
        return <ArrowRightLeft className="h-4 w-4" />;
      default:
        return <Command className="h-4 w-4" />;
    }
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 ${className}`}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            className="w-full max-w-lg rounded-xl bg-background p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Command className="h-5 w-5 text-primary" aria-hidden="true" />
                <h2 className="text-xl font-bold">Voice Commands Guide</h2>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-text-light hover:bg-[hsl(var(--color-card-hover))] hover:text-text"
                aria-label="Close guide"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Tabs for command categories */}
            <div className="mb-4 flex flex-wrap gap-2">
              {Object.values(CommandType).map((type) => (
                <button
                  key={type}
                  onClick={() => setActiveTab(type)}
                  className={`flex items-center gap-1 rounded-full px-3 py-1 text-sm transition-colors ${
                    activeTab === type
                      ? 'bg-primary text-white'
                      : 'bg-[hsl(var(--color-surface-1))] text-text-light hover:bg-[hsl(var(--color-card-hover))]'
                  }`}
                >
                  {getTabIcon(type)}
                  <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                </button>
              ))}
            </div>

            {/* Commands for selected tab */}
            <div className="max-h-[400px] overflow-y-auto rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))]">
              {commandsByType[activeTab].length > 0 ? (
                <div className="p-4">
                  <h3 className="mb-3 text-lg font-semibold">
                    {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Commands
                  </h3>
                  <div className="space-y-3">
                    {commandsByType[activeTab].map((command) => (
                      <div key={command.name} className="rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-3">
                        <div className="mb-2 text-base font-medium">{command.description}</div>
                        <div className="space-y-1">
                          <div className="text-sm text-text-light">Try saying:</div>
                          <div className="flex flex-wrap gap-2">
                            {(command.examples || []).map((example, i) => (
                              <span key={i} className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                                "{example}"
                              </span>
                            ))}
                            {!command.examples && command.patterns.slice(0, 2).map((pattern, i) => (
                              <span key={i} className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                                "{pattern}"
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex h-32 flex-col items-center justify-center text-center">
                  <HelpCircle className="mb-2 h-8 w-8 text-text-light" aria-hidden="true" />
                  <p className="text-text-light">No commands in this category</p>
                </div>
              )}
            </div>

            <div className="mt-4 rounded-lg bg-[hsl(var(--color-surface-1))] p-4 text-sm text-text-light">
              <p>
                <strong>Tip:</strong> For the best experience, speak clearly and use natural phrases. 
                Voice commands work best in a quiet environment. You can also type your questions directly.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}