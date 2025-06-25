import { useState, useEffect } from 'react';
import { useCodex } from '../../../codex/useCodex';
import { motion } from 'framer-motion';
import { Zap, Brain, Moon, Activity, Heart } from 'lucide-react';

interface CodexPromptSuggestionsProps {
  onSelectPrompt: (prompt: string) => void;
}

const CodexPromptSuggestions = ({ onSelectPrompt }: CodexPromptSuggestionsProps) => {
  const { getAvailablePhenotypes, getPromptByPhenotype } = useCodex();
  const [phenotypes, setPhenotypes] = useState<string[]>([]);

  useEffect(() => {
    setPhenotypes(getAvailablePhenotypes());
  }, [getAvailablePhenotypes]);

  // Map phenotypes to icons
  const getPhenotypeIcon = (phenotype: string) => {
    switch (phenotype) {
      case 'low_dopamine':
        return <Brain className="h-4 w-4" />;
      case 'poor_sleep':
        return <Moon className="h-4 w-4" />;
      case 'high_performance':
        return <Zap className="h-4 w-4" />;
      case 'gut_issues':
        return <Heart className="h-4 w-4" />;
      case 'fat_loss':
        return <Activity className="h-4 w-4" />;
      default:
        return <Zap className="h-4 w-4" />;
    }
  };

  // Map phenotypes to user-friendly names
  const getPhenotypeName = (phenotype: string) => {
    return phenotype
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Get a user-friendly prompt from the phenotype
  const getPromptFromPhenotype = (phenotype: string) => {
    const rawPrompt = getPromptByPhenotype(phenotype);
    // Convert the internal prompt to a user-friendly question
    switch (phenotype) {
      case 'low_dopamine':
        return "How can I improve my focus and motivation?";
      case 'poor_sleep':
        return "What can I do to sleep better?";
      case 'high_performance':
        return "How can I optimize my workout performance?";
      case 'gut_issues':
        return "What supplements help with digestive health?";
      case 'fat_loss':
        return "What's the best approach for healthy weight loss?";
      default:
        return rawPrompt;
    }
  };

  return (
    <div className="mb-4">
      <p className="mb-2 text-sm font-medium text-text-light">Suggested questions:</p>
      <div className="flex flex-wrap gap-2">
        {phenotypes.map((phenotype, index) => (
          <motion.button
            key={phenotype}
            initial={{ opacity: 0, y: 10 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              transition: { delay: index * 0.1 }
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelectPrompt(getPromptFromPhenotype(phenotype))}
            className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs text-primary transition-colors hover:bg-primary/20"
          >
            {getPhenotypeIcon(phenotype)}
            {getPhenotypeName(phenotype)}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default CodexPromptSuggestions;