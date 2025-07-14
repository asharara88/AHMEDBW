import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Info, Star, Check, Shield, Award, Zap, Clock, Pill, X, Plus, Minus } from 'lucide-react';
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
  const [quantity, setQuantity] = useState(1);
  const { addItem, items } = useCartStore();

  const isInCart = items.some(item => item.id === supplement.id);

  const handleAddToCart = () => {
    addItem({
      ...supplement,
      quantity
    });
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

  const incrementQuantity = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuantity(prev => prev + 1);
  };

  const decrementQuantity = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const getEvidenceBadge = () => {
    switch(supplement.evidence_level) {
      case 'Green':
        return (
          <div className="absolute right-3 top-3 z-10 rounded-full bg-success/20 px-2 py-1 text-xs font-medium text-success flex items-center">
            <Shield className="mr-1 h-3 w-3" />
            Strong Evidence
          </div>
        );
      case 'Yellow':
        return (
          <div className="absolute right-3 top-3 z-10 rounded-full bg-warning/20 px-2 py-1 text-xs font-medium text-warning flex items-center">
            <Info className="mr-1 h-3 w-3" />
            Moderate Evidence
          </div>
        );
      case 'Red':
        return (
          <div className="absolute right-3 top-3 z-10 rounded-full bg-error/20 px-2 py-1 text-xs font-medium text-error flex items-center">
            <AlertCircle className="mr-1 h-3 w-3" />
            Limited Evidence
          </div>
        );
      default:
        return null;
    }
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
        <div className="absolute left-3 top-3 z-10 rounded-full bg-primary px-2 py-1 text-xs font-medium text-white flex items-center">
          <Star className="mr-1 h-3 w-3" aria-hidden="true" />
          <span>Recommended</span>
        </div>
      )}

      {/* Evidence Level Badge */}
      {getEvidenceBadge()}

      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10">
        <img
          src={getFormImage(supplement.form_type)}
          alt={`${supplement.name} supplement`}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
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
            AED {supplement.price_aed?.toFixed(2) || supplement.price?.toFixed(2) || "0.00"}
          </div>
          
          {showAddToCart && (
            <div className="flex items-center gap-2">
              {!isInCart && (
                <div className="flex items-center rounded-l-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))]">
                  <button 
                    onClick={decrementQuantity}
                    className="px-2 py-1 text-text-light hover:text-text"
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-2 py-1 text-sm">{quantity}</span>
                  <button 
                    onClick={incrementQuantity}
                    className="px-2 py-1 text-text-light hover:text-text"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              )}
              <button
                onClick={handleAddToCart}
                disabled={isInCart}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
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
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby={`${supplement.id}-modal-title`}>
          <motion.div
            className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-[hsl(var(--color-card))] shadow-xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <div className="h-64 w-full overflow-hidden">
                <img
                  src={getFormImage(supplement.form_type)}
                  alt={`${supplement.name} supplement`}
                  className="h-full w-full object-cover"
                />
                <button
                  onClick={() => setShowDetails(false)}
                  className="absolute right-4 top-4 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                  aria-label="Close details"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6">
                <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 id={`${supplement.id}-modal-title`} className="text-2xl font-bold">{supplement.name}</h2>
                    <p className="text-text-light">{supplement.brand}</p>
                    
                    <div className="mt-2 flex flex-wrap gap-2">
                      {supplement.evidence_level && (
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          supplement.evidence_level === 'Green' 
                            ? 'bg-success/10 text-success' 
                            : supplement.evidence_level === 'Yellow' 
                              ? 'bg-warning/10 text-warning' 
                              : 'bg-error/10 text-error'
                        }`}>
                          {supplement.evidence_level === 'Green' && <Shield className="mr-1 h-3 w-3" />}
                          {supplement.evidence_level === 'Yellow' && <Info className="mr-1 h-3 w-3" />}
                          {supplement.evidence_level === 'Red' && <AlertCircle className="mr-1 h-3 w-3" />}
                          {supplement.evidence_level === 'Green' ? 'Strong Evidence' : 
                           supplement.evidence_level === 'Yellow' ? 'Moderate Evidence' : 'Limited Evidence'}
                        </span>
                      )}
                      
                      {supplement.form_type && (
                        <span className="inline-flex items-center rounded-full bg-[hsl(var(--color-surface-2))] px-2.5 py-0.5 text-xs font-medium text-text-light">
                          <Pill className="mr-1 h-3 w-3" />
                          {supplement.form_type.replace('_', ' ')}
                        </span>
                      )}
                      
                      {supplement.category && (
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                          {supplement.category}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      AED {supplement.price_aed?.toFixed(2) || supplement.price?.toFixed(2) || "0.00"}
                    </div>
                    {supplement.compare_at_price && (
                      <div className="text-sm text-text-light line-through">
                        AED {supplement.compare_at_price.toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-8 grid gap-6 md:grid-cols-2">
                  <div>
                    <h3 className="mb-2 text-lg font-medium">Description</h3>
                    <p className="text-text-light">{supplement.description}</p>
                    
                    {supplement.detailed_description && (
                      <p className="mt-2 text-text-light">{supplement.detailed_description}</p>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="mb-2 text-lg font-medium">Key Benefits</h3>
                    <ul className="space-y-2">
                      {supplement.benefits ? (
                        supplement.benefits.map((benefit, index) => (
                          <li key={index} className="flex items-start">
                            <Check className="mr-2 h-5 w-5 flex-shrink-0 text-success" />
                            <span>{benefit}</span>
                          </li>
                        ))
                      ) : (
                        <li className="flex items-start">
                          <Check className="mr-2 h-5 w-5 flex-shrink-0 text-success" />
                          <span>General health support</span>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>

                <div className="mb-8 grid gap-6 md:grid-cols-3">
                  {supplement.dosage && (
                    <div className="rounded-lg bg-[hsl(var(--color-surface-1))] p-4">
                      <h4 className="mb-2 flex items-center text-sm font-medium">
                        <Pill className="mr-2 h-4 w-4 text-primary" />
                        Recommended Dosage
                      </h4>
                      <p className="text-sm text-text-light">{supplement.dosage}</p>
                    </div>
                  )}
                  
                  {supplement.serving_size && (
                    <div className="rounded-lg bg-[hsl(var(--color-surface-1))] p-4">
                      <h4 className="mb-2 flex items-center text-sm font-medium">
                        <Zap className="mr-2 h-4 w-4 text-primary" />
                        Serving Size
                      </h4>
                      <p className="text-sm text-text-light">{supplement.serving_size}</p>
                    </div>
                  )}
                  
                  {supplement.directions_for_use && (
                    <div className="rounded-lg bg-[hsl(var(--color-surface-1))] p-4">
                      <h4 className="mb-2 flex items-center text-sm font-medium">
                        <Clock className="mr-2 h-4 w-4 text-primary" />
                        Directions for Use
                      </h4>
                      <p className="text-sm text-text-light">{supplement.directions_for_use}</p>
                    </div>
                  )}
                </div>

                {supplement.ingredients && (
                  <div className="mb-8">
                    <h3 className="mb-2 text-lg font-medium">Ingredients</h3>
                    <div className="rounded-lg bg-[hsl(var(--color-surface-1))] p-4">
                      <p className="text-sm text-text-light">{supplement.ingredients}</p>
                    </div>
                  </div>
                )}

                {supplement.warnings && (
                  <div className="mb-8">
                    <h3 className="mb-2 text-lg font-medium">Warnings</h3>
                    <div className="rounded-lg bg-error/5 p-4">
                      <p className="text-sm text-error">{supplement.warnings}</p>
                    </div>
                  </div>
                )}

                {supplement.allergen_info && (
                  <div className="mb-8">
                    <h3 className="mb-2 text-lg font-medium">Allergen Information</h3>
                    <div className="rounded-lg bg-warning/5 p-4">
                      <p className="text-sm text-warning">{supplement.allergen_info}</p>
                    </div>
                  </div>
                )}

                {supplement.certifications && (
                  <div className="mb-8">
                    <h3 className="mb-2 text-lg font-medium">Certifications</h3>
                    <div className="flex flex-wrap gap-2">
                      {supplement.certifications.split(',').map((cert, index) => (
                        <span key={index} className="inline-flex items-center rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">
                          <Award className="mr-1 h-3 w-3" />
                          {cert.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t border-[hsl(var(--color-border))] pt-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center rounded-l-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))]">
                        <button 
                          onClick={decrementQuantity}
                          className="px-3 py-2 text-text-light hover:text-text"
                          disabled={quantity <= 1}
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="px-4 py-2 text-sm">{quantity}</span>
                        <button 
                          onClick={incrementQuantity}
                          className="px-3 py-2 text-text-light hover:text-text"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div className="text-sm text-text-light">
                        {supplement.servings_per_container && (
                          <span>{supplement.servings_per_container} servings per container</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={handleToggleStack}
                        className={`flex items-center gap-2 rounded-lg border px-4 py-2 font-medium transition-colors ${
                          isInStack
                            ? 'border-error/50 bg-error/10 text-error hover:bg-error/20'
                            : 'border-primary/50 bg-[hsl(var(--color-card))] text-primary hover:bg-primary/5'
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${isInStack ? 'fill-error' : ''}`} />
                        {isInStack ? 'Remove from Stack' : 'Add to Stack'}
                      </button>
                      
                      <button
                        onClick={handleAddToCart}
                        disabled={isInCart}
                        className={`flex items-center gap-2 rounded-lg px-6 py-2 font-medium transition-colors ${
                          isInCart
                            ? 'bg-success/10 text-success cursor-not-allowed'
                            : 'bg-primary text-white hover:bg-primary-dark'
                        }`}
                      >
                        {isInCart ? (
                          <>
                            <Check className="h-4 w-4" />
                            Added to Cart
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="h-4 w-4" />
                            Add to Cart
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default SupplementCard;

// Missing components for TypeScript
const AlertCircle = (props: any) => <Info {...props} />;