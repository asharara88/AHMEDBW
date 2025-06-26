import React from 'react';
import { motion } from 'framer-motion';

interface SupplementCategoryCardProps {
  category: string;
  icon: string;
  isSelected: boolean;
  onClick: () => void;
}

const SupplementCategoryCard: React.FC<SupplementCategoryCardProps> = ({
  category,
  icon,
  isSelected,
  onClick
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={`cursor-pointer rounded-xl border ${
        isSelected
          ? 'border-primary bg-primary/5'
          : 'border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))]'
      } p-4 text-center transition-colors hover:border-primary/50`}
      onClick={onClick}
      aria-pressed={isSelected}
    >
      <div className="mb-2 text-2xl">{icon}</div>
      <div className="font-medium">{category}</div>
    </motion.div>
  );
};

export default SupplementCategoryCard;