import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, ExternalLink, AlertCircle, Info, ChevronDown, ChevronUp, ShoppingCart, Heart, Star } from 'lucide-react';
import { Supplement } from '../../types/supplements';
import { useCart } from '../shopping/CartProvider';
import ImageWithFallback from '../common/ImageWithFallback';

interface SupplementCardProps {
  supplement: Supplement;
  onAddToStack?: () => void;
  onRemoveFromStack?: () => void;
  onViewDetails?: () => void;
  isInStack?: boolean;
}

const SupplementCard = ({ 
  supplement, 
  onAddToStack,
  onRemoveFromStack,
  onViewDetails,
  isInStack = false 
}: SupplementCardProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const { addItem } = useCart();
  
  // Safely access properties with fallbacks
  const categories = supplement?.categories || [];
  const useCases = supplement?.use_cases || [];
  const evidenceLevel = supplement?.evidence_level || 'Yellow';
  
  // Generate consistent rating for demo purposes
  const generateRating = (id: string): number => {
    // Use the supplement ID to generate a consistent rating between 3.5 and 5.0
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return Math.min(5, 3.5 + (hash % 15) / 10); // Between 3.5 and 5.0
  };
  
  const rating = generateRating(supplement.id);

  const handleAddToCart = () => {
    addItem(supplement);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex h-full flex-col rounded-xl shadow-sm transition-shadow hover:shadow-md overflow-hidden max-w-full"
    >
      {/* Card Content */}
      <div className="flex flex-1 flex-col border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-4 rounded-xl">
        <div className="mb-2">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-semibold cursor-pointer hover:text-primary truncate" onClick={onViewDetails}>
              {supplement?.name || 'Unnamed Supplement'}
            </h3>
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              evidenceLevel === 'Green' ? 'bg-success/20 text-success' :
              evidenceLevel === 'Yellow' ? 'bg-warning/20 text-warning' :
              'bg-error/20 text-error'
            }`}>
              {evidenceLevel}
            </span>
          </div>
          <div className="flex items-center mt-1">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => {
                // Full star
                if (star <= Math.floor(rating)) {
                  return <Star key={star} className="h-3 w-3 fill-warning text-warning" />;
                }
                // Partial star
                else if (star === Math.ceil(rating) && !Number.isInteger(rating)) {
                  // Calculate percentage for partial fill
                  const percentage = (rating % 1) * 100;
                  return (
                    <span key={star} className="relative">
                      <Star className="h-3 w-3 text-text-light" />
                      <span className="absolute top-0 left-0 overflow-hidden" style={{ width: `${percentage}%` }}>
                        <Star className="h-3 w-3 fill-warning text-warning" />
                      </span>
                    </span>
                  );
                }
                // Empty star
                else {
                  return <Star key={star} className="h-3 w-3 text-text-light" />;
                }
              })}
            </div>
            <span className="ml-1 text-xs text-text-light">{rating.toFixed(1)}</span>
          </div>
        </div>

        <div className="relative mb-3 h-32 w-full overflow-hidden rounded-lg">
          <ImageWithFallback
            src={supplement?.form_image_url || supplement?.image_url}
            alt={supplement?.name || 'Supplement'}
            className="h-full w-full object-contain"
            fallbackSrc="https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg"
          />
        </div>

        <p className="text-xs text-text-light mb-3 line-clamp-2">{supplement?.description || 'No description available'}</p>

        {/* Categories */}
        <div className="mb-3">
          <div className="mb-1 text-xs font-medium">Categories</div>
          <div className="flex flex-wrap gap-1.5">
            {categories && categories.length > 0 ? (
              categories.slice(0, 2).map((category, index) => (
                <span
                  key={index}
                  className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary truncate max-w-[120px]"
                >
                  {category}
                </span>
              ))
            ) : (
              <span className="rounded-full bg-[hsl(var(--color-surface-2))] px-2 py-0.5 text-xs text-text-light">
                General
              </span>
            )}
            {categories && categories.length > 2 && (
              <span className="rounded-full bg-[hsl(var(--color-surface-2))] px-2 py-0.5 text-xs text-text-light">
                +{categories.length - 2}
              </span>
            )}
          </div>
        </div>

        {/* Price and Action */}
        <div className="mt-auto flex items-center justify-between">
          <div className="text-base font-bold">AED {supplement?.price_aed?.toFixed(2) || 0}</div>
          <div className="flex gap-2">
            <button
              onClick={isInStack ? onRemoveFromStack : onAddToStack}
              className={`flex items-center justify-center rounded-lg p-2 transition-colors ${
                isInStack
                  ? 'bg-error/20 text-error hover:bg-error/30'
                  : 'bg-[hsl(var(--color-surface-1))] text-text-light hover:bg-[hsl(var(--color-card-hover))] hover:text-text'
              }`}
              title={isInStack ? "Remove from Stack" : "Add to Stack"}
              aria-label={isInStack ? "Remove from Stack" : "Add to Stack"}
            >
              <Heart className={`h-5 w-5 ${isInStack ? 'fill-error' : ''}`} />
            </button>
            
            <button
              onClick={handleAddToCart}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-dark"
              aria-label="Add to cart"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Add</span>
            </button>
          </div>
        </div>

        {/* Expand/Collapse Toggle */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg border border-[hsl(var(--color-border))] px-3 py-2 text-xs text-text-light transition-colors hover:bg-[hsl(var(--color-card-hover))] hover:text-text"
          aria-expanded={showDetails}
          aria-controls={`details-${supplement.id}`}
        >
          {showDetails ? (
            <>
              Show Less <ChevronUp className="h-3.5 w-3.5" />
            </>
          ) : (
            <>
              View Details <ChevronDown className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </div>

      {/* Expanded Details */}
      {showDetails && (
        <motion.div
          id={`details-${supplement.id}`}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="border-t border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-4 rounded-b-xl mt-[-1rem] overflow-hidden max-w-full"
        >
          {/* Use Cases */}
          <div className="mb-3">
            <div className="mb-1.5 text-xs font-medium">Use Cases</div>
            <div className="flex flex-wrap gap-1.5">
              {useCases && useCases.length > 0 ? (
                useCases.map((useCase, index) => (
                  <span
                    key={index}
                    className="rounded-full bg-[hsl(var(--color-surface-2))] px-2 py-0.5 text-xs text-text"
                  >
                    {useCase}
                  </span>
                ))
              ) : (
                <span className="text-xs text-text-light">No specific use cases listed</span>
              )}
            </div>
          </div>

          {/* Dosage */}
          <div className="mb-3 text-xs">
            <span className="font-medium">Dosage:</span> {supplement?.dosage || 'As directed'}
          </div>

          {/* Evidence Level Info */}
          <div className="rounded-lg bg-[hsl(var(--color-surface-2))] p-3">
            <div className="mb-1 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium">Evidence Level: {evidenceLevel}</span>
            </div>
            <p className="text-xs text-text-light">
              {evidenceLevel === 'Green' 
                ? 'Strong scientific evidence supports the use of this supplement.'
                : evidenceLevel === 'Yellow'
                ? 'Moderate evidence exists, more research may be needed.'
                : 'Limited evidence available, use with caution.'}
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default SupplementCard;