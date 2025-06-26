import React from 'react';
import { motion } from 'framer-motion';
import SupplementCategoryCard from './SupplementCategoryCard';

interface SupplementCategoriesProps {
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

const SupplementCategories: React.FC<SupplementCategoriesProps> = ({
  categories,
  selectedCategory,
  onSelectCategory
}) => {
  // Category icons mapping
  const getCategoryIcon = (category: string): string => {
    const iconMap: Record<string, string> = {
      'Sleep': '😴',
      'Recovery': '🔄',
      'Stress': '😌',
      'Energy': '⚡',
      'Cognitive': '🧠',
      'Focus': '🎯',
      'Immunity': '🛡️',
      'Gut Health': '🦠',
      'Heart': '❤️',
      'Metabolic': '🔥',
      'Performance': '💪',
      'Longevity': '⏳',
      'Fertility': '👶',
      'Bone Health': '🦴'
    };
    
    return iconMap[category] || '💊';
  };

  return (
    <div className="mb-8">
      <h2 className="mb-4 text-xl font-bold">Categories</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className={`cursor-pointer rounded-xl border ${
            selectedCategory === null
              ? 'border-primary bg-primary/5'
              : 'border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))]'
          } p-4 text-center transition-colors hover:border-primary/50`}
          onClick={() => onSelectCategory(null)}
        >
          <div className="mb-2 text-2xl">💊</div>
          <div className="font-medium">All</div>
        </motion.div>
        
        {categories.map((category) => (
          <SupplementCategoryCard
            key={category}
            category={category}
            icon={getCategoryIcon(category)}
            isSelected={selectedCategory === category}
            onClick={() => onSelectCategory(category)}
          />
        ))}
      </div>
    </div>
  );
};

export default SupplementCategories;