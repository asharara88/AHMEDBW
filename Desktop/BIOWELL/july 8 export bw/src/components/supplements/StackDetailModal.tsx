import React from 'react';
import { motion } from 'framer-motion';
import { X, Check, Package, AlertCircle, Info } from 'lucide-react';
import ImageWithFallback from '../common/ImageWithFallback';
import { Supplement } from '../../types/supplements';

interface StackDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  stack: {
    id: string;
    name: string;
    description: string;
    category: string;
    supplements: string[];
    total_price: number;
    isActive?: boolean;
  } | null;
  supplementsData: Supplement[];
  userSupplements: string[];
  onActivate: () => void;
}

const StackDetailModal: React.FC<StackDetailModalProps> = ({
  isOpen,
  onClose,
  stack,
  supplementsData,
  userSupplements,
  onActivate
}) => {
  if (!isOpen || !stack) return null;

  // Get the supplements in this stack - add null check for stack.supplements
  const stackSupplements = (stack.supplements ?? [])
    .map(id => supplementsData.find(s => s.id === id))
    .filter(Boolean) as Supplement[];

  // Calculate how many supplements the user already has
  const userHasCount = stackSupplements.filter(s => 
    userSupplements.includes(s.id)
  ).length;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-[hsl(var(--color-card))] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative border-b border-[hsl(var(--color-border))] p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">{stack.name}</h2>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {stack.category}
                </span>
                {stack.isActive && (
                  <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                    Active
                  </span>
                )}
              </div>
              <p className="mt-1 text-text-light">{stack.description}</p>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-text-light transition-colors hover:bg-[hsl(var(--color-card-hover))] hover:text-text"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <div className="rounded-lg bg-[hsl(var(--color-surface-1))] px-3 py-1.5">
              <span className="text-sm text-text-light">Total Price:</span>
              <span className="ml-2 font-bold text-primary">AED {stack.total_price.toFixed(2)}</span>
            </div>
            
            <div className="rounded-lg bg-[hsl(var(--color-surface-1))] px-3 py-1.5">
              <span className="text-sm text-text-light">Supplements:</span>
              <span className="ml-2 font-medium">{stackSupplements.length}</span>
            </div>
            
            <div className="rounded-lg bg-[hsl(var(--color-surface-1))] px-3 py-1.5">
              <span className="text-sm text-text-light">In Your Stack:</span>
              <span className="ml-2 font-medium">{userHasCount} of {stackSupplements.length}</span>
            </div>
          </div>
        </div>
        
        {/* Supplements List */}
        <div className="p-6">
          <h3 className="mb-4 text-lg font-medium">Stack Components</h3>
          
          <div className="space-y-4">
            {stackSupplements.map((supplement) => (
              <div 
                key={supplement.id}
                className="flex flex-col rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-4 sm:flex-row sm:items-center"
              >
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
                    <ImageWithFallback
                      src={supplement.form_image_url || supplement.image_url}
                      alt={supplement.name}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{supplement.name}</h4>
                      {userSupplements.includes(supplement.id) ? (
                        <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                          In Your Stack
                        </span>
                      ) : (
                        <span className="rounded-full bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">
                          Not Added
                        </span>
                      )}
                    </div>
                    
                    <p className="mt-1 text-sm text-text-light line-clamp-2">
                      {supplement.description}
                    </p>
                    
                    <div className="mt-2 flex flex-wrap gap-2">
                      {supplement.evidence_level && (
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium 
                          ${supplement.evidence_level === 'Green' 
                            ? 'bg-success/10 text-success' 
                            : supplement.evidence_level === 'Yellow' 
                              ? 'bg-warning/10 text-warning' 
                              : 'bg-error/10 text-error'
                          }`}>
                          {supplement.evidence_level} Tier
                        </span>
                      )}
                      
                      {supplement.dosage && (
                        <span className="rounded-full bg-[hsl(var(--color-card))] px-2 py-0.5 text-xs">
                          Dosage: {supplement.dosage}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4 text-right sm:mt-0">
                    <div className="font-bold text-primary">
                      AED {supplement.price_aed?.toFixed(2) || '0.00'}
                    </div>
                    
                    {userSupplements.includes(supplement.id) ? (
                      <div className="mt-2 flex items-center justify-end gap-1 text-xs text-success">
                        <Check className="h-3 w-3" />
                        <span>Added</span>
                      </div>
                    ) : (
                      <div className="mt-2 flex items-center justify-end gap-1 text-xs text-warning">
                        <AlertCircle className="h-3 w-3" />
                        <span>Not Added</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Action Buttons */}
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:justify-between">
            <button
              onClick={onClose}
              className="flex items-center justify-center gap-2 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-4 py-2 font-medium text-text-light hover:bg-[hsl(var(--color-card-hover))] hover:text-text"
            >
              Close
            </button>
            
            <div className="flex flex-col gap-2 sm:flex-row">
              <a
                href="/supplements"
                className="flex items-center justify-center gap-2 rounded-lg border border-primary bg-[hsl(var(--color-card))] px-4 py-2 font-medium text-primary hover:bg-primary/5"
              >
                Browse Supplements
              </a>
              
              <button
                onClick={onActivate}
                disabled={stack.isActive}
                className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2 font-medium ${
                  stack.isActive
                    ? 'bg-success/10 text-success'
                    : 'bg-primary text-white hover:bg-primary-dark'
                }`}
              >
                {stack.isActive ? (
                  <>
                    <Check className="h-4 w-4" />
                    Active Stack
                  </>
                ) : (
                  <>
                    <Package className="h-4 w-4" />
                    Activate Stack
                  </>
                )}
              </button>
            </div>
          </div>
          
          {/* Info Box */}
          <div className="mt-6 flex items-start gap-3 rounded-lg bg-primary/5 p-4 text-sm text-text-light">
            <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
            <p>
              Activating this stack will add all the supplements to your personal stack. 
              You can customize your stack further by adding or removing individual supplements.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default StackDetailModal;