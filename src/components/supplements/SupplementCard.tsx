import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Info, Star, Check } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import type { Supplement } from '../../types/supplements';

interface SupplementCardProps {
  supplement: Supplement;
  className?: string;
  showAddToCart?: boolean;
  isRecommended?: boolean;
  isInStack?: boolean;
  onAddToStack?: () => void;
  onRemoveFromStack?: () => void;
  onViewDetails?: () => void;
}

const SupplementCard: React.FC<SupplementCardProps> = ({ 
  supplement, 
  className = '',
  showAddToCart = true,
  isRecommended = false,
  isInStack = false,
  onAddToStack,
  onRemoveFromStack,
  onViewDetails
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const { addItem, items } = useCartStore();

  const isInCart = items.some(item => item.supplement.id === supplement.id);

  const handleAddToCart = () => {
    addItem(supplement);
  };

  const handleToggleStack = () => {
    if (isInStack && onRemoveFromStack) {
      onRemoveFromStack();
    } else if (!isInStack && onAddToStack) {
      onAddToStack();
    }
  };

  const getFormImage = (formType: string | undefined) => {
    if (supplement.form_image_url) {
      return supplement.form_image_url;
    }
    
    // Fallback to image_url if form_image_url is not available
    if (supplement.image_url) {
      return supplement.image_url;
    }
    
    // Default fallback
    return "https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg";
  };

  return (
    <motion.div
      className={`group relative overflow-hidden rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] transition-all duration-300 hover:border-primary/50 hover:shadow-lg ${className}`}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -2 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Recommended Badge */}
      {isRecommended && (
        <div className="absolute left-3 top-3 z-10 rounded-full bg-primary px-2 py-1 text-xs font-medium text-white">
          <Star className="mr-1 inline h-3 w-3" aria-hidden="true" />
          <span>Recommended</span>
        </div>
      )}

      {/* Evidence Level Badge */}
      {supplement.evidence_level && (
        <div className={`absolute right-3 top-3 z-10 rounded-full px-2 py-1 text-xs font-medium 
          ${supplement.evidence_level === 'Green' 
            ? 'bg-success/20 text-success' 
            : supplement.evidence_level === 'Yellow' 
              ? 'bg-warning/20 text-warning' 
              : 'bg-error/20 text-error'
          }`}>
          {supplement.evidence_level}
        </div>
      )}

      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10">
        <img
          src={getFormImage(supplement.form_type)}
          alt={`${supplement.name} supplement`} 
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" 
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg";
          }}
        />
        
        {/* Overlay with quick actions */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
        >
          <div className="flex gap-2">
            <button
              onClick={() => setShowDetails(true)}
              className="rounded-full bg-white/20 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
              aria-label={`View details for ${supplement.name}`}
            >
              <Info className="h-4 w-4" aria-hidden="true" />
            </button>
            <button 
              className="rounded-full bg-white/20 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
              onClick={handleToggleStack}
              aria-label={isInStack ? `Remove ${supplement.name} from stack` : `Add ${supplement.name} to stack`}
            >
              <Heart className={`h-4 w-4 ${isInStack ? 'fill-white' : ''}`} aria-hidden="true" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Header */}
        <div className="mb-2">
          <h3 className="font-semibold text-text line-clamp-1">{supplement.name}</h3>
          {supplement.form_type && (
            <p className="text-xs text-text-light capitalize">{supplement.form_type.replace('_', ' ')}</p>
          )}
        </div>

        {/* Description */}
        <p className="mb-3 text-sm text-text-light line-clamp-2">
          {supplement.description}
        </p>

        {/* Benefits */}
        {supplement.benefits && supplement.benefits.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {supplement.benefits.slice(0, 2).map((benefit, index) => (
                <span
                  key={index}
                  className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary"
                >
                  {benefit}
                </span>
              ))}
              {supplement.benefits.length > 2 && (
                <span className="rounded-full bg-[hsl(var(--color-surface-2))] px-2 py-1 text-xs text-text-light">
                  +{supplement.benefits.length - 2} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Dosage */}
        {supplement.dosage && (
          <div className="mb-3 text-xs text-text-light">
            <span className="font-medium">Dosage:</span> {supplement.dosage}
          </div>
        )}

        {/* Price and Actions */}
        <div className="flex items-center justify-between">
          <div className="text-lg font-bold text-primary">
            ${supplement.price_aed?.toFixed(2) || supplement.price?.toFixed(2) || "0.00"}
          </div>
          
          {showAddToCart && (
            <button
              onClick={handleAddToCart}
              disabled={isInCart}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors min-h-[44px] ${
                isInCart
                  ? 'bg-success/10 text-success cursor-not-allowed'
                  : 'bg-primary text-white hover:bg-primary-dark'
              }`}
              aria-label={isInCart ? `${supplement.name} added to cart` : `Add ${supplement.name} to cart`}
            >
              {isInCart ? (
                <>
                  <Check className="h-4 w-4" aria-hidden="true" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4" aria-hidden="true" />
                  <span>Add</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby={`${supplement.id}-modal-title`}>
          <motion.div
            className="max-h-[80vh] w-full max-w-md overflow-y-auto rounded-xl bg-[hsl(var(--color-card))] p-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 id={`${supplement.id}-modal-title`} className="text-lg font-semibold">{supplement.name}</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="rounded-full p-2 text-text-light hover:bg-[hsl(var(--color-card-hover))] hover:text-text"
                aria-label="Close details"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {/* Image */}
              <img
                src={getFormImage(supplement.form_type)}
                alt={`${supplement.name} supplement`}
                className="h-32 w-full rounded-lg object-cover"
              />

              {/* Description */}
              <div>
                <h4 className="mb-2 font-medium">Description</h4>
                <p className="text-sm text-text-light">{supplement.description}</p>
              </div>

              {/* Benefits */}
              {supplement.benefits && supplement.benefits.length > 0 && (
                <div>
                  <h4 className="mb-2 font-medium">Benefits</h4>
                  <div className="flex flex-wrap gap-2">
                    {supplement.benefits.map((benefit, index) => (
                      <span
                        key={index}
                        className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
                      >
                        {benefit}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Info */}
              <div className="space-y-2 text-sm">
                {supplement.dosage && (
                  <div>
                    <span className="font-medium">Dosage:</span> {supplement.dosage}
                  </div>
                )}
                {supplement.form_type && (
                  <div>
                    <span className="font-medium">Form:</span> {supplement.form_type.replace('_', ' ')}
                  </div>
                )}
                {supplement.goal && (
                  <div>
                    <span className="font-medium">Goal:</span> {supplement.goal}
                  </div>
                )}
                {supplement.mechanism && (
                  <div>
                    <span className="font-medium">Mechanism:</span> {supplement.mechanism}
                  </div>
                )}
              </div>

              {/* Evidence Summary */}
              {supplement.evidence_summary && (
                <div>
                  <h4 className="mb-2 font-medium">Evidence Summary</h4>
                  <p className="text-sm text-text-light">{supplement.evidence_summary}</p>
                </div>
              )}

              {/* Source Link */}
              {supplement.source_link && (
                <div>
                  <a
                    href={supplement.source_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    View Source →
                  </a>
                </div>
              )}

              {/* Price and Add to Cart */}
              <div className="flex items-center justify-between border-t border-[hsl(var(--color-border))] pt-4">
                <div className="text-xl font-bold text-primary">
                  ${supplement.price_aed?.toFixed(2) || supplement.price?.toFixed(2) || "0.00"}
                </div>
                {showAddToCart && (
                  <button
                    onClick={handleAddToCart}
                    disabled={isInCart}
                    className={`flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors ${
                      isInCart
                        ? 'bg-success/10 text-success cursor-not-allowed'
                        : 'bg-primary text-white hover:bg-primary-dark'
                    }`}
                    aria-label={isInCart ? `${supplement.name} added to cart` : `Add ${supplement.name} to cart`}
                  >
                    {isInCart ? (
                      <>
                        <Check className="h-4 w-4" aria-hidden="true" />
                        <span>Added to Cart</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-4 w-4" aria-hidden="true" />
                        <span>Add to Cart</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default SupplementCard;