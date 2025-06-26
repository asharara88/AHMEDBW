import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import SupplementCard from './SupplementCard';
import { Supplement } from '../../types/supplements';

interface SupplementFeaturedProps {
  supplements: Supplement[];
  userSupplements: string[];
  onToggleSubscription: (supplementId: string) => void;
  title: string;
  description?: string;
  viewAllLink?: string;
}

const SupplementFeatured: React.FC<SupplementFeaturedProps> = ({
  supplements,
  userSupplements,
  onToggleSubscription,
  title,
  description,
  viewAllLink
}) => {
  if (supplements.length === 0) return null;

  return (
    <div className="mb-12">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-xl font-bold">{title}</h2>
          {description && <p className="text-text-light">{description}</p>}
        </div>
        
        {viewAllLink && (
          <a
            href={viewAllLink}
            className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            View All
            <ArrowRight className="h-4 w-4" />
          </a>
        )}
      </div>
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {supplements.slice(0, 3).map((supplement, index) => (
          <motion.div
            key={supplement.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <SupplementCard
              supplement={supplement}
              isInStack={userSupplements.includes(supplement.id)}
              onAddToStack={() => onToggleSubscription(supplement.id)}
              onRemoveFromStack={() => onToggleSubscription(supplement.id)}
              isRecommended={index === 0}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SupplementFeatured;