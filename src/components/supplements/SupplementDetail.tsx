import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, ArrowLeft, Check, Star, ExternalLink, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Supplement } from '../../types/supplements';
import { useCartStore } from '../../store/useCartStore';

interface SupplementDetailProps {
  supplement: Supplement;
  isInStack: boolean;
  onToggleSubscription: () => void;
  relatedSupplements?: Supplement[];
}

const SupplementDetail: React.FC<SupplementDetailProps> = ({
  supplement,
  isInStack,
  onToggleSubscription,
  relatedSupplements = []
}) => {
  const navigate = useNavigate();
  const { addItem, items } = useCartStore();
  const isInCart = items.some(item => item.supplement.id === supplement.id);

  const handleAddToCart = () => {
    addItem(supplement);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-2 text-text-light hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Supplements
      </button>
      
      <div className="grid gap-8 md:grid-cols-2">
        {/* Left Column - Image */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))]"
          >
            <img
              src={supplement.form_image_url || supplement.image_url || "https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg"}
              alt={supplement.name}
              className="h-full w-full object-cover"
            />
          </motion.div>
        </div>
        
        {/* Right Column - Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="mb-2 flex items-center gap-2">
            {supplement.evidence_level && (
              <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                supplement.evidence_level === 'Green' 
                  ? 'bg-success/20 text-success' 
                  : supplement.evidence_level === 'Yellow' 
                    ? 'bg-warning/20 text-warning' 
                    : 'bg-error/20 text-error'
              }`}>
                {supplement.evidence_level} Tier
              </span>
            )}
            {supplement.form_type && (
              <span className="rounded-full bg-[hsl(var(--color-surface-2))] px-2 py-1 text-xs text-text-light">
                {supplement.form_type.replace('_', ' ')}
              </span>
            )}
          </div>
          
          <h1 className="mb-2 text-2xl font-bold md:text-3xl">{supplement.name}</h1>
          
          <div className="mb-4 text-2xl font-bold text-primary">
            ${supplement.price_aed?.toFixed(2) || supplement.price?.toFixed(2) || "0.00"}
          </div>
          
          <p className="mb-6 text-text-light">{supplement.description}</p>
          
          <div className="mb-6 space-y-4">
            {supplement.dosage && (
              <div>
                <h3 className="mb-1 font-medium">Recommended Dosage</h3>
                <p className="text-text-light">{supplement.dosage}</p>
              </div>
            )}
            
            {supplement.benefits && supplement.benefits.length > 0 && (
              <div>
                <h3 className="mb-2 font-medium">Benefits</h3>
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
            
            {supplement.mechanism && (
              <div>
                <h3 className="mb-1 font-medium">How It Works</h3>
                <p className="text-text-light">{supplement.mechanism}</p>
              </div>
            )}
          </div>
          
          <div className="mb-6 flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={isInCart}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 font-medium transition-colors ${
                isInCart
                  ? 'bg-success/10 text-success cursor-not-allowed'
                  : 'bg-primary text-white hover:bg-primary-dark'
              }`}
            >
              {isInCart ? (
                <>
                  <Check className="h-5 w-5" />
                  Added to Cart
                </>
              ) : (
                <>
                  <ShoppingCart className="h-5 w-5" />
                  Add to Cart
                </>
              )}
            </button>
            
            <button
              onClick={onToggleSubscription}
              className={`flex items-center justify-center gap-2 rounded-lg px-4 py-3 font-medium transition-colors ${
                isInStack
                  ? 'bg-error/10 text-error hover:bg-error/20'
                  : 'bg-[hsl(var(--color-surface-1))] text-text-light hover:bg-[hsl(var(--color-card-hover))] hover:text-text'
              }`}
            >
              <Heart className={`h-5 w-5 ${isInStack ? 'fill-error' : ''}`} />
              {isInStack ? 'Remove from Stack' : 'Add to Stack'}
            </button>
          </div>
          
          {/* Evidence Summary */}
          {supplement.evidence_summary && (
            <div className="mb-6 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-4">
              <div className="mb-2 flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-5 w-5 text-primary" />
                <h3 className="font-medium">Evidence Summary</h3>
              </div>
              <p className="text-text-light">{supplement.evidence_summary}</p>
              
              {supplement.source_link && (
                <a
                  href={supplement.source_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  View Research Source
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          )}
        </motion.div>
      </div>
      
      {/* Related Supplements */}
      {relatedSupplements.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-6 text-xl font-bold">Related Supplements</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {relatedSupplements.map((relatedSupplement) => (
              <SupplementCard
                key={relatedSupplement.id}
                supplement={relatedSupplement}
                isInStack={userSupplements.includes(relatedSupplement.id)}
                onAddToStack={() => onToggleSubscription(relatedSupplement.id)}
                onRemoveFromStack={() => onToggleSubscription(relatedSupplement.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplementDetail;