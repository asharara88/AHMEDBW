import { useState } from 'react';
import { Settings } from 'lucide-react';
import ChatSettings from './ChatSettings';

interface ChatSettingsButtonProps {
  className?: string;
}

const ChatSettingsButton = ({ className = '' }: ChatSettingsButtonProps) => {
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
      >
        <Settings className="h-5 w-5" />
      </button>
      
      {isOpen && <ChatSettings onClose={() => setIsOpen(false)} />}
    </div>
  );
};

export default ChatSettingsButton;