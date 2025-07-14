import React from 'react';
import { motion } from 'framer-motion';
import { X, AlertCircle, Check, Shield, Info } from 'lucide-react';
import { Supplement } from '../../types/supplements';
import ImageWithFallback from '../common/ImageWithFallback';
import { useCartStore } from '../../store/useCartStore';

interface SupplementCompareProps {
  supplements: Supplement[];
  compareItems: string[];
  onRemoveItem: (id: string) => void;
  onClearAll: () => void;
}

const SupplementCompare: React.FC<SupplementCompareProps> = ({
  supplements,
  compareItems,
  onRemoveItem,
  onClearAll
}) => {
  const { addItem } = useCartStore();
  
  // Get the supplements to compare
  const supplementsToCompare = supplements.filter(s => compareItems.includes(s.id));
  
  if (compareItems.length === 0) {
    return (
      <div className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-6 text-center">
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-primary/10 p-4">
            <AlertCircle className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h3 className="mb-2 text-lg font-medium">No Supplements to Compare</h3>
        <p className="mb-4 text-text-light">
          Add supplements to compare by clicking the compare button on supplement cards.
        </p>
        <a 
          href="#browse"
          className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
        >
          Browse Supplements
        </a>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold">Compare Supplements</h2>
        <button
          onClick={onClearAll}
          className="text-sm text-primary hover:underline"
        >
          Clear All
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] border-collapse">
          <thead>
            <tr>
              <th className="border-b border-[hsl(var(--color-border))] p-4 text-left">Feature</th>
              {supplementsToCompare.map(supplement => (
                <th key={supplement.id} className="border-b border-[hsl(var(--color-border))] p-4 text-left">
                  <div className="relative">
                    <button
                      onClick={() => onRemoveItem(supplement.id)}
                      className="absolute -right-2 -top-2 rounded-full bg-[hsl(var(--color-card-hover))] p-1 text-text-light hover:bg-[hsl(var(--color-border))] hover:text-text"
                      aria-label={`Remove ${supplement.name} from comparison`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                    <div className="h-16 w-16 overflow-hidden rounded-lg">
                      <ImageWithFallback
                        src={supplement.form_image_url || supplement.image_url}
                        alt={supplement.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <h3 className="mt-2 text-sm font-medium">{supplement.name}</h3>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Price */}
            <tr>
              <td className="border-b border-[hsl(var(--color-border))] p-4 font-medium">Price</td>
              {supplementsToCompare.map(supplement => (
                <td key={supplement.id} className="border-b border-[hsl(var(--color-border))] p-4">
                  <div className="font-bold text-primary">
                    AED {supplement.price_aed?.toFixed(2) || supplement.price?.toFixed(2) || "0.00"}
                  </div>
                </td>
              ))}
            </tr>
            
            {/* Evidence Level */}
            <tr>
              <td className="border-b border-[hsl(var(--color-border))] p-4 font-medium">Evidence Level</td>
              {supplementsToCompare.map(supplement => (
                <td key={supplement.id} className="border-b border-[hsl(var(--color-border))] p-4">
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
                </td>
              ))}
            </tr>
            
            {/* Form Type */}
            <tr>
              <td className="border-b border-[hsl(var(--color-border))] p-4 font-medium">Form</td>
              {supplementsToCompare.map(supplement => (
                <td key={supplement.id} className="border-b border-[hsl(var(--color-border))] p-4">
                  <span className="capitalize">{supplement.form_type?.replace('_', ' ') || 'N/A'}</span>
                </td>
              ))}
            </tr>
            
            {/* Dosage */}
            <tr>
              <td className="border-b border-[hsl(var(--color-border))] p-4 font-medium">Dosage</td>
              {supplementsToCompare.map(supplement => (
                <td key={supplement.id} className="border-b border-[hsl(var(--color-border))] p-4">
                  {supplement.dosage || 'N/A'}
                </td>
              ))}
            </tr>
            
            {/* Benefits */}
            <tr>
              <td className="border-b border-[hsl(var(--color-border))] p-4 font-medium">Benefits</td>
              {supplementsToCompare.map(supplement => (
                <td key={supplement.id} className="border-b border-[hsl(var(--color-border))] p-4">
                  {supplement.benefits && supplement.benefits.length > 0 ? (
                    <ul className="list-inside list-disc space-y-1 text-sm">
                      {supplement.benefits.map((benefit, index) => (
                        <li key={index}>{benefit}</li>
                      ))}
                    </ul>
                  ) : (
                    'N/A'
                  )}
                </td>
              ))}
            </tr>
            
            {/* Description */}
            <tr>
              <td className="border-b border-[hsl(var(--color-border))] p-4 font-medium">Description</td>
              {supplementsToCompare.map(supplement => (
                <td key={supplement.id} className="border-b border-[hsl(var(--color-border))] p-4 text-sm">
                  {supplement.description}
                </td>
              ))}
            </tr>
            
            {/* Ingredients */}
            <tr>
              <td className="border-b border-[hsl(var(--color-border))] p-4 font-medium">Ingredients</td>
              {supplementsToCompare.map(supplement => (
                <td key={supplement.id} className="border-b border-[hsl(var(--color-border))] p-4 text-sm">
                  {supplement.ingredients || 'N/A'}
                </td>
              ))}
            </tr>
            
            {/* Allergen Info */}
            <tr>
              <td className="border-b border-[hsl(var(--color-border))] p-4 font-medium">Allergen Info</td>
              {supplementsToCompare.map(supplement => (
                <td key={supplement.id} className="border-b border-[hsl(var(--color-border))] p-4 text-sm">
                  {supplement.allergen_info || 'None listed'}
                </td>
              ))}
            </tr>
            
            {/* Actions */}
            <tr>
              <td className="p-4 font-medium">Actions</td>
              {supplementsToCompare.map(supplement => (
                <td key={supplement.id} className="p-4">
                  <button
                    onClick={() => addItem(supplement)}
                    className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary-dark"
                  >
                    <Check className="h-4 w-4" />
                    Add to Cart
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SupplementCompare;