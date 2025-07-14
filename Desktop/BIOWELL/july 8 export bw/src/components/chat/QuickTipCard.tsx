import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface QuickTipCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

const QuickTipCard = ({ title, description, icon, onClick }: QuickTipCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    // Convert title to a query for the chat page
    const query = title === "Sleep Optimization" 
      ? "What are the best strategies to improve my sleep quality?"
      : title === "Stress Management"
      ? "What techniques can help reduce my daily stress levels?"
      : title === "Energy Boosters"
      ? "How can I naturally increase my energy levels throughout the day?"
      : title === "Nutrition Basics"
      ? "What are the fundamentals of healthy eating I should follow?"
      : title === "Workout Recovery"
      ? "How can I optimize my recovery after intense workouts?"
      : title === "Focus Enhancement"
      ? "What methods can help improve my concentration and mental clarity?"
      : title;
    
    // Navigate to chat page with the query
    navigate('/chat', { state: { initialQuestion: query } });
    
    // Call the onClick handler if provided
    if (onClick) {
      onClick();
    }
  };

  return (
    <motion.div
      className="cursor-pointer rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-4 hover:border-primary/50 hover:shadow-md transition-all"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
        <h3 className="font-medium text-sm leading-tight">{title}</h3>
      </div>
      <p className="text-sm text-text-light line-clamp-2">{description}</p>
    </motion.div>
  );
};

export default QuickTipCard;