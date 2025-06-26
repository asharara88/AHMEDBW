import React from 'react';
import { motion } from 'framer-motion';
import SupplementCard from './SupplementCard';
import { Supplement } from '../../types/supplements';

interface SupplementGridProps {
  supplements: Supplement[];
  userSupplements: string[];
  onToggleSubscription: (supplementId: string) => void;
  loading?: boolean;
  emptyMessage?: string;
}

const SupplementGrid: React.FC<SupplementGridProps> = ({
  supplements,
  userSupplements,
  onToggleSubscription,
  loading = false,
  emptyMessage = "No supplements found matching your criteria."
}) => {
  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, index) => (
          <div 
            key={index}
            className="h-96 animate-pulse rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))]"
          >
            <div className="h-48 w-full bg-[hsl(var(--color-surface-2))]"></div>
            <div className="p-4 space-y-3">
              <div className="h-6 w-3/4 rounded bg-[hsl(var(--color-surface-2))]"></div>
              <div className="h-4 w-full rounded bg-[hsl(var(--color-surface-2))]"></div>
              <div className="h-4 w-2/3 rounded bg-[hsl(var(--color-surface-2))]"></div>
              <div className="flex justify-between pt-4">
                <div className="h-6 w-16 rounded bg-[hsl(var(--color-surface-2))]"></div>
                <div className="h-10 w-20 rounded bg-[hsl(var(--color-surface-2))]"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (supplements.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-8 text-center"
      >
        <p className="text-text-light">{emptyMessage}</p>
      </motion.div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {supplements.map((supplement) => (
        <SupplementCard
          key={supplement.id}
          supplement={supplement}
          isInStack={userSupplements.includes(supplement.id)}
          onAddToStack={() => onToggleSubscription(supplement.id)}
          onRemoveFromStack={() => onToggleSubscription(supplement.id)}
        />
      ))}
    </div>
  );
};

export default SupplementGrid;