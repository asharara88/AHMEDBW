import React from 'react';
import { PlusCircle, Check } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useSupplementStore } from '../../store';

interface ParsedRecommendation {
  supplementName: string;
  dosage?: string;
  timing?: string;
}

/**
 * Extract supplement recommendations from AI message content
 */
export function parseRecommendations(content: string): ParsedRecommendation[] {
  const recommendations: ParsedRecommendation[] = [];
  
  // Common supplement patterns in AI responses
  const patterns = [
    // Pattern 1: "I recommend [supplement name] (dosage) for [benefit]"
    /I recommend\s+([A-Za-z0-9\s-]+)\s+\(([^)]+)\)/g,
    
    // Pattern 2: "[supplement name] (dosage) is effective for [benefit]"
    /([A-Za-z0-9\s-]+)\s+\(([^)]+)\)\s+is (effective|recommended|beneficial)/g,
    
    // Pattern 3: "Consider taking [supplement name]"
    /Consider taking\s+([A-Za-z0-9\s-]+)/g,
    
    // Pattern 4: "Try [supplement name] at [dosage]"
    /Try\s+([A-Za-z0-9\s-]+)\s+at\s+([0-9]+[a-zA-Z]+)/g,
    
    // Pattern 5: Green-tier or orange-tier mentions
    /([A-Za-z0-9\s-]+)\s+\((green|orange)-tier\)/gi
  ];
  
  // Apply each pattern to the content
  patterns.forEach(pattern => {
    const matches = [...content.matchAll(pattern)];
    matches.forEach(match => {
      // Extract the supplement name (first capturing group)
      const supplementName = match[1].trim();
      
      // Extract the dosage if available (usually second capturing group)
      const dosage = match[2]?.trim();
      
      // Avoid duplicates
      if (!recommendations.some(r => r.supplementName.toLowerCase() === supplementName.toLowerCase())) {
        recommendations.push({ supplementName, dosage });
      }
    });
  });
  
  // Search for Magnesium specifically which is commonly recommended
  if (content.includes('Magnesium') && !recommendations.some(r => r.supplementName.includes('Magnesium'))) {
    recommendations.push({ supplementName: 'Magnesium' });
  }
  
  return recommendations;
}

interface RecommendationButtonProps {
  recommendation: ParsedRecommendation;
}

/**
 * Button component for adding a recommended supplement to cart
 */
export const RecommendationButton: React.FC<RecommendationButtonProps> = ({ recommendation }) => {
  const { addItem } = useCartStore();
  const { supplements } = useSupplementStore();
  const [added, setAdded] = useState(false);
  
  // Find the supplement in the store that best matches the recommendation
  const findMatchingSupplement = () => {
    if (!supplements || supplements.length === 0) return null;
    
    // First try exact match
    const exactMatch = supplements.find(s => 
      s.name.toLowerCase() === recommendation.supplementName.toLowerCase()
    );
    
    if (exactMatch) return exactMatch;
    
    // Try partial match
    const partialMatch = supplements.find(s => 
      s.name.toLowerCase().includes(recommendation.supplementName.toLowerCase()) ||
      recommendation.supplementName.toLowerCase().includes(s.name.toLowerCase())
    );
    
    return partialMatch;
  };
  
  const handleAddToStack = () => {
    const supplement = findMatchingSupplement();
    if (supplement) {
      addItem(supplement);
      setAdded(true);
      
      // Reset "added" state after 2 seconds for visual feedback
      setTimeout(() => setAdded(false), 2000);
    }
  };
  
  const matchingSupplement = findMatchingSupplement();
  
  if (!matchingSupplement) return null;
  
  return (
    <button
      onClick={handleAddToStack}
      className={`ml-2 inline-flex items-center gap-1 rounded-full ${
        added 
          ? 'bg-success/10 text-success' 
          : 'bg-primary/10 text-primary hover:bg-primary/20'
      } px-2 py-0.5 text-xs font-medium transition-colors`}
      disabled={added}
    >
      {added ? (
        <>
          <Check className="h-3 w-3" />
          <span>Added</span>
        </>
      ) : (
        <>
          <PlusCircle className="h-3 w-3" />
          <span>Add to Stack</span>
        </>
      )}
    </button>
  );
};

interface ParsedMessageContentProps {
  content: string;
}

/**
 * Component to render message content with "Add to Stack" buttons
 */
export const ParsedMessageContent: React.FC<ParsedMessageContentProps> = ({ content }) => {
  const recommendations = parseRecommendations(content);
  
  if (recommendations.length === 0) {
    return <div>{content}</div>;
  }
  
  // Create a RegExp that matches any of the supplement names
  const supplementRegex = new RegExp(
    recommendations.map(r => 
      r.supplementName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') // Escape special regex characters
    ).join('|'),
    'gi'
  );
  
  // Split content by supplement names and intersperse with recommendation buttons
  const parts = content.split(supplementRegex);
  const matches = content.match(supplementRegex) || [];
  
  // Combine parts and matches
  const result: React.ReactNode[] = [];
  
  parts.forEach((part, i) => {
    result.push(part);
    
    if (i < matches.length) {
      const match = matches[i];
      const recommendation = recommendations.find(
        r => r.supplementName.toLowerCase() === match.toLowerCase()
      );
      
      if (recommendation) {
        result.push(
          <React.Fragment key={`rec-${i}`}>
            <span className="font-medium text-primary">{match}</span>
            <RecommendationButton recommendation={recommendation} />
          </React.Fragment>
        );
      } else {
        result.push(match);
      }
    }
  });
  
  return <div>{result}</div>;
};