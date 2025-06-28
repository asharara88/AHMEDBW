import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface QuickTipCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}

const QuickTipCard = ({ title, description, icon, onClick }: QuickTipCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    // Call the onClick handler passed from the parent
    onClick();
    
    // Navigate to the chat page
    navigate('/chat');
  };

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className="cursor-pointer rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-4 hover:border-primary/50 hover:shadow-md transition-all"
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