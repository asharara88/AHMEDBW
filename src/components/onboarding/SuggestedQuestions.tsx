import { motion } from 'framer-motion';

interface SuggestedQuestionsProps {
  questions: string[];
  onSelect: (question: string) => void;
}

const SuggestedQuestions = ({ questions, onSelect }: SuggestedQuestionsProps) => {
  return (
    <div className="mt-4">
      <p className="mb-2 text-sm font-medium text-text-light">Suggested responses:</p>
      <div className="flex flex-wrap gap-2">
        {questions.map((question, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              transition: { delay: index * 0.1 }
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(question)}
            className="rounded-full bg-primary/10 px-3 py-1.5 text-xs text-primary transition-colors hover:bg-primary/20"
          >
            {question}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default SuggestedQuestions;