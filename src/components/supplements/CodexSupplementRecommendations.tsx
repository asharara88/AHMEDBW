import { useState, useEffect } from 'react';
import { useCodex } from '../../../codex/useCodex';
import { motion } from 'framer-motion';
import { Package, Check, AlertCircle, Info } from 'lucide-react';
import type { SupplementRecommendation, Phenotype } from '../../../codex/types';
import ImageWithFallback from '../common/ImageWithFallback';

interface CodexSupplementRecommendationsProps {
  phenotype?: Phenotype;
  onAddToCart?: (supplement: any) => void;
}

const CodexSupplementRecommendations = ({ 
  phenotype, 
  onAddToCart 
}: CodexSupplementRecommendationsProps) => {
  const { 
    setPhenotype, 
    getSupplementRecommendations, 
    loading, 
    error,
    currentPhenotype
  } = useCodex();
  
  const [recommendations, setRecommendations] = useState<SupplementRecommendation[]>([]);

  useEffect(() => {
    if (phenotype && phenotype !== currentPhenotype) {
      setPhenotype(phenotype);
    }
  }, [phenotype, currentPhenotype, setPhenotype]);

  useEffect(() => {
    if (currentPhenotype) {
      const recs = getSupplementRecommendations();
      setRecommendations(recs);
    }
  }, [currentPhenotype, getSupplementRecommendations]);

  // Map phenotypes to user-friendly names
  const getPhenotypeName = (phenotype: string) => {
    return phenotype
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-error/10 p-4 text-error">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!currentPhenotype || recommendations.length === 0) {
    return (
      <div className="rounded-lg bg-[hsl(var(--color-surface-1))] p-6 text-center">
        <Package className="mx-auto mb-4 h-12 w-12 text-text-light" />
        <h3 className="mb-2 text-lg font-medium">No Recommendations Available</h3>
        <p className="text-text-light">
          {!currentPhenotype 
            ? "Select a health profile to see personalized supplement recommendations." 
            : "No supplement recommendations available for this profile."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">
          {getPhenotypeName(currentPhenotype)} Stack
        </h2>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          Personalized
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {recommendations.map((supplement, index) => (
          <motion.div
            key={`${supplement.name}-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-4 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="mb-3 flex items-center gap-3">
              <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md">
                <ImageWithFallback
                  src={`https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1`}
                  alt={supplement.name}
                  className="h-full w-full object-contain"
                />
              </div>
              <div>
                <h3 className="font-medium">{supplement.name}</h3>
                <p className="text-xs text-text-light">{supplement.dosage}</p>
              </div>
            </div>
            
            <div className="mb-3 flex items-center rounded-lg bg-[hsl(var(--color-surface-1))] p-2 text-xs">
              <Clock className="mr-2 h-4 w-4 text-primary" />
              Timing: {supplement.timing}
            </div>
            
            {supplement.benefits && (
              <div className="mb-3 flex flex-wrap gap-1">
                {supplement.benefits.map((benefit, i) => (
                  <span 
                    key={i}
                    className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary"
                  >
                    {benefit}
                  </span>
                ))}
              </div>
            )}
            
            {supplement.evidenceLevel && (
              <div className="mb-3 flex items-center justify-between text-xs">
                <span className="text-text-light">Evidence Level:</span>
                <span className={`rounded-full px-2 py-0.5 ${
                  supplement.evidenceLevel === 'Green' 
                    ? 'bg-success/10 text-success' 
                    : supplement.evidenceLevel === 'Yellow'
                    ? 'bg-warning/10 text-warning'
                    : 'bg-error/10 text-error'
                }`}>
                  {supplement.evidenceLevel}
                </span>
              </div>
            )}
            
            {onAddToCart && (
              <button
                onClick={() => onAddToCart(supplement)}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary-dark"
              >
                <ShoppingCart className="h-4 w-4" />
                Add to Cart
              </button>
            )}
          </motion.div>
        ))}
      </div>
      
      <div className="flex items-center gap-2 rounded-lg bg-[hsl(var(--color-surface-1))] p-4 text-sm text-text-light">
        <Info className="h-5 w-5 text-primary" />
        <p>
          These recommendations are personalized based on your {getPhenotypeName(currentPhenotype)} profile.
          Always consult with a healthcare professional before starting any new supplement regimen.
        </p>
      </div>
    </div>
  );
};

// Import the missing components
import { ShoppingCart, Clock } from 'lucide-react';

export default CodexSupplementRecommendations;