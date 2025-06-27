import React from 'react';
import { PlusCircle, Check } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useSupplementStore } from '../../store';
import ReactMarkdown from 'react-markdown';
import { useRecommendationParser } from '../../hooks/useRecommendationParser';

interface EnhancedMessageContentProps {
  content: string;
}

export const EnhancedMessageContent: React.FC<EnhancedMessageContentProps> = ({ content }) => {
  // Skip enhancement for markdown code blocks
  if (content.includes('```')) {
    return <ReactMarkdown>{content}</ReactMarkdown>;
  }
  
  const { recommendations } = useRecommendationParser(content);
  
  // If no recommendations found, just render the markdown
  if (recommendations.length === 0) {
    return <ReactMarkdown>{content}</ReactMarkdown>;
  }
  
  // Create a custom renderer for supplements
  return (
    <ReactMarkdown
      components={{
        // Custom renderer for paragraphs
        p: ({ children }) => {
          // Process the children to add "Add to Stack" buttons
          const processedChildren = React.Children.map(children, child => {
            if (typeof child !== 'string') return child;
            
            // For each recommendation, check if it's mentioned in this paragraph
            let result = child;
            let parts: React.ReactNode[] = [result];
            
            recommendations.forEach(recommendation => {
              const newParts: React.ReactNode[] = [];
              
              // Process each existing part
              parts.forEach(part => {
                if (typeof part !== 'string') {
                  newParts.push(part);
                  return;
                }
                
                // Split by supplement name and intersperse with buttons
                const regex = new RegExp(`\\b${recommendation.supplementName}\\b`, 'i');
                const segments = part.split(regex);
                
                if (segments.length > 1) {
                  segments.forEach((segment, i) => {
                    if (i > 0) {
                      // This is after a match, add the supplement button
                      newParts.push(
                        <SupplementButton
                          key={`${recommendation.supplementName}-${i}`}
                          recommendation={recommendation}
                        />
                      );
                    }
                    if (segment) newParts.push(segment);
                  });
                } else {
                  newParts.push(part);
                }
              });
              
              parts = newParts;
            });
            
            return parts;
          });
          
          return <p>{processedChildren}</p>;
        }
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

interface SupplementButtonProps {
  recommendation: {
    supplementName: string;
    supplementId?: string;
  };
}

const SupplementButton: React.FC<SupplementButtonProps> = ({ recommendation }) => {
  const { addItem } = useCartStore();
  const { supplements } = useSupplementStore();
  const [added, setAdded] = useState(false);
  
  // Find the supplement in our database
  const supplement = React.useMemo(() => {
    if (!supplements || !recommendation.supplementId) return null;
    return supplements.find(s => s.id === recommendation.supplementId);
  }, [supplements, recommendation.supplementId]);
  
  // If we don't have this supplement in our database, just render the name
  if (!supplement) {
    return <span className="font-medium">{recommendation.supplementName}</span>;
  }
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addItem(supplement);
    setAdded(true);
    
    // Reset state after 2 seconds
    setTimeout(() => setAdded(false), 2000);
  };
  
  return (
    <span className="inline-flex items-center gap-1">
      <span className="font-medium text-primary">{recommendation.supplementName}</span>
      <button
        onClick={handleClick}
        className={`ml-1 inline-flex items-center gap-1 rounded-full ${
          added ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary hover:bg-primary/20'
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
    </span>
  );
};