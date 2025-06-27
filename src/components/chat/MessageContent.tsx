import React from 'react';
import ReactMarkdown from 'react-markdown';
import { useRecommendationParser } from '../../hooks/useRecommendationParser';
import { PlusCircle, Check } from 'lucide-react';
import { useSupplementStore, useCartStore } from '../../store';

interface MessageContentProps {
  content: string;
}

// Component to render a recommendation with an add button
const SupplementRecommendation: React.FC<{
  name: string;
  supplementId?: string;
}> = ({ name, supplementId }) => {
  const { supplements } = useSupplementStore();
  const { addItem } = useCartStore();
  const [added, setAdded] = useState(false);
  
  const supplement = React.useMemo(() => {
    if (!supplementId || !supplements) return null;
    return supplements.find(s => s.id === supplementId);
  }, [supplementId, supplements]);
  
  if (!supplement) {
    return <span className="font-medium">{name}</span>;
  }
  
  const handleAddToStack = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addItem(supplement);
    setAdded(true);
    
    // Reset after 2 seconds for visual feedback
    setTimeout(() => setAdded(false), 2000);
  };
  
  return (
    <span className="relative inline-flex items-center">
      <span className="font-medium text-primary">{name}</span>
      <button 
        onClick={handleAddToStack}
        disabled={added}
        className={`ml-1 inline-flex items-center gap-1 rounded-full ${
          added 
            ? 'bg-success/10 text-success' 
            : 'bg-primary/10 text-primary hover:bg-primary/20'
        } px-2 py-0.5 text-xs font-medium transition-colors`}
        title={added ? "Added to stack" : "Add to stack"}
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

export const MessageContent: React.FC<MessageContentProps> = ({ content }) => {
  const { recommendations } = useRecommendationParser(content);
  
  // If no recommendations or has code blocks, just use regular markdown
  if (!recommendations.length || content.includes('```')) {
    return <ReactMarkdown>{content}</ReactMarkdown>;
  }
  
  // Process the content to add recommendation buttons
  const components = {
    p: ({ children }: { children: React.ReactNode }) => {
      if (typeof children !== 'string') {
        return <p>{children}</p>;
      }
      
      // For each recommendation, find mentions and add buttons
      let result = children;
      
      recommendations.forEach(rec => {
        if (!rec.supplementId) return;
        
        // Create a regex that matches the supplement name with word boundaries
        const regex = new RegExp(`\\b${rec.supplementName}\\b`, 'gi');
        
        // Check if this supplement is mentioned in this paragraph
        if (regex.test(result)) {
          // Replace occurrences with a marker we can split on
          result = result.replace(regex, `__SUPPLEMENT_${rec.supplementName}__`);
        }
      });
      
      // If no markers were added, just return the original paragraph
      if (!result.includes('__SUPPLEMENT_')) {
        return <p>{children}</p>;
      }
      
      // Split by our markers and build the result array
      const parts = result.split(/__SUPPLEMENT_([^_]+)__/);
      const elements: React.ReactNode[] = [];
      
      for (let i = 0; i < parts.length; i++) {
        // Add text part
        if (parts[i]) elements.push(parts[i]);
        
        // Add supplement button if this is a supplement name
        i++;
        if (i < parts.length) {
          const supplementName = parts[i];
          const recommendation = recommendations.find(r => 
            r.supplementName.toLowerCase() === supplementName.toLowerCase()
          );
          
          if (recommendation) {
            elements.push(
              <SupplementRecommendation 
                key={`rec-${i}`}
                name={supplementName}
                supplementId={recommendation.supplementId}
              />
            );
          }
        }
      }
      
      return <p>{elements}</p>;
    }
  };
  
  return <ReactMarkdown components={components}>{content}</ReactMarkdown>;
};