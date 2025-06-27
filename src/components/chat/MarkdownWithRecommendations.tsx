import React from 'react';
import ReactMarkdown from 'react-markdown';
import { PlusCircle, Check } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useSupplementStore } from '../../store';
import { useRecommendationParser } from '../../hooks/useRecommendationParser';

interface MarkdownWithRecommendationsProps {
  content: string;
}

/**
 * Component for rendering markdown content with "Add to Stack" buttons
 * for supplement recommendations
 */
export const MarkdownWithRecommendations: React.FC<MarkdownWithRecommendationsProps> = ({ 
  content 
}) => {
  const { recommendations } = useRecommendationParser(content);
  const { supplements } = useSupplementStore();
  
  // If no recommendations or if content has code blocks, use regular markdown
  if (!recommendations.length || content.includes('```')) {
    return <ReactMarkdown>{content}</ReactMarkdown>;
  }
  
  // Custom renderer for paragraphs to add recommendation buttons
  const components = {
    p: ({ children }: { children: React.ReactNode }) => {
      if (typeof children !== 'string') {
        return <p>{children}</p>;
      }
      
      // For each recommendation, find mentions in the paragraph
      let result = children as string;
      
      recommendations.forEach(rec => {
        // Skip if this supplement doesn't exist in our database
        if (!rec.supplementId) return;
        
        const regex = new RegExp(`\\b${rec.supplementName}\\b`, 'gi');
        if (regex.test(result)) {
          // Replace with custom component
          result = result.replace(regex, `__SUPPLEMENT_${rec.supplementName}__`);
        }
      });
      
      // Split by our custom markers and create elements
      const parts = result.split(/__SUPPLEMENT_([^_]+)__/g);
      const elements: React.ReactNode[] = [];
      
      for (let i = 0; i < parts.length; i++) {
        if (i % 2 === 0) {
          // Regular text
          elements.push(parts[i]);
        } else {
          // Supplement reference - add button
          const supplementName = parts[i];
          const recommendation = recommendations.find(r => 
            r.supplementName.toLowerCase() === supplementName.toLowerCase()
          );
          
          if (recommendation) {
            elements.push(
              <RecommendationButton 
                key={`rec-${i}`} 
                recommendation={recommendation}
              />
            );
          } else {
            elements.push(supplementName);
          }
        }
      }
      
      return <p>{elements}</p>;
    }
  };
  
  return <ReactMarkdown components={components}>{content}</ReactMarkdown>;
};

interface RecommendationButtonProps {
  recommendation: {
    supplementName: string;
    supplementId?: string;
    dosage?: string;
  };
}

const RecommendationButton: React.FC<RecommendationButtonProps> = ({ 
  recommendation 
}) => {
  const { addItem } = useCartStore();
  const { supplements } = useSupplementStore();
  const [added, setAdded] = useState(false);
  
  // Find the supplement in our store
  const supplement = supplements?.find(s => s.id === recommendation.supplementId);
  
  // If supplement not found, just render the name
  if (!supplement) {
    return <span className="font-medium">{recommendation.supplementName}</span>;
  }
  
  const handleAddToStack = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addItem(supplement);
    setAdded(true);
    
    // Reset after 2 seconds
    setTimeout(() => setAdded(false), 2000);
  };
  
  return (
    <span className="inline-flex items-center gap-1 group">
      <span className="font-medium text-primary">{recommendation.supplementName}</span>
      <button
        onClick={handleAddToStack}
        disabled={added}
        className={`ml-1 inline-flex items-center gap-1 rounded-full ${
          added 
            ? 'bg-success/10 text-success' 
            : 'bg-primary/10 text-primary hover:bg-primary/20'
        } px-2 py-0.5 text-xs font-medium transition-colors`}
        aria-label={added ? "Added to stack" : "Add to stack"}
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
    </span>
  );
};