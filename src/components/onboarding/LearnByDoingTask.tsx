import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, AlertCircle } from 'lucide-react';

interface Task {
  selector: string;
  event: string;
  instruction: string;
}

interface LearnByDoingTaskProps {
  task: Task;
  onComplete: () => void;
}

const LearnByDoingTask = ({ task, onComplete }: LearnByDoingTaskProps) => {
  const [isCompleted, setIsCompleted] = useState(false);
  
  useEffect(() => {
    // Listen for the completion event
    const checkCompletion = () => {
      const element = document.querySelector(task.selector);
      if (element) {
        element.addEventListener(task.event, () => {
          setIsCompleted(true);
          onComplete();
        });
      }
    };
    
    checkCompletion();
    
    // Check again after a short delay in case elements are loaded dynamically
    const timeoutId = setTimeout(checkCompletion, 500);
    
    return () => {
      clearTimeout(timeoutId);
      const element = document.querySelector(task.selector);
      if (element) {
        element.removeEventListener(task.event, () => {});
      }
    };
  }, [task, onComplete]);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-lg p-3 ${
        isCompleted ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'
      }`}
    >
      <div className="flex items-center">
        {isCompleted ? (
          <Check className="mr-2 h-5 w-5" />
        ) : (
          <AlertCircle className="mr-2 h-5 w-5" />
        )}
        <span>{task.instruction}</span>
      </div>
      
      {isCompleted && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-2 text-sm"
        >
          Great job! Task completed.
        </motion.div>
      )}
    </motion.div>
  );
};

export default LearnByDoingTask;