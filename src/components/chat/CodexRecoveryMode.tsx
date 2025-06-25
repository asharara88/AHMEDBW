import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useCodex } from '../../../codex/useCodex';
import { AlertCircle, Check, ArrowRight } from 'lucide-react';

interface CodexRecoveryModeProps {
  userInput: string;
  sleepData?: any;
  onDismiss: () => void;
  onAccept: () => void;
}

const CodexRecoveryMode = ({ 
  userInput, 
  sleepData, 
  onDismiss, 
  onAccept 
}: CodexRecoveryModeProps) => {
  const { checkRecoveryMode, getRecoveryActions } = useCodex();
  const [shouldShow, setShouldShow] = useState(false);
  const [actions, setActions] = useState<string[]>([]);

  useEffect(() => {
    // Check if recovery mode should be triggered
    const shouldTrigger = checkRecoveryMode(userInput, sleepData);
    setShouldShow(shouldTrigger);
    
    if (shouldTrigger) {
      setActions(getRecoveryActions());
    }
  }, [userInput, sleepData, checkRecoveryMode, getRecoveryActions]);

  if (!shouldShow) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mb-6 rounded-lg border border-warning/20 bg-warning/5 p-4"
    >
      <div className="mb-4 flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-warning" />
        <div>
          <h3 className="mb-1 font-medium text-warning">Recovery Mode Recommended</h3>
          <p className="text-sm text-text-light">
            Based on your recent inputs and health data, we recommend activating Recovery Mode to help restore your energy and wellbeing.
          </p>
        </div>
      </div>
      
      {actions.length > 0 && (
        <div className="mb-4 rounded-lg bg-[hsl(var(--color-card))] p-3">
          <h4 className="mb-2 text-sm font-medium">Recovery Mode includes:</h4>
          <ul className="space-y-2">
            {actions.map((action, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-success" />
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="flex justify-end gap-3">
        <button
          onClick={onDismiss}
          className="rounded-lg border border-[hsl(var(--color-border))] px-4 py-2 text-sm text-text-light hover:bg-[hsl(var(--color-card-hover))] hover:text-text"
        >
          Not Now
        </button>
        <button
          onClick={onAccept}
          className="flex items-center gap-2 rounded-lg bg-warning px-4 py-2 text-sm font-medium text-white hover:bg-warning/90"
        >
          Activate Recovery Mode
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
};

export default CodexRecoveryMode;