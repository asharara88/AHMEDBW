import React from 'react';
import { PlusCircle, Check } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useSupplementStore } from '../../store';

interface HighlightedSupplementProps {
  supplementName: string;
  children: React.ReactNode;
}

/**
 * Component to highlight a supplement name and add an "Add to Stack" button
 */
export const HighlightedSupplement: React.FC<HighlightedSupplementProps> = ({ 
  supplementName, 
  children 
}) => {
  const { addItem } = useCartStore();
  const { supplements } = useSupplementStore();
  const [added, setAdded] = useState(false);

  // Find matching supplement in the store
  const matchingSupplement = React.useMemo(() => {
    if (!supplements || supplements.length === 0) return null;
    
    // Try exact match first
    const exactMatch = supplements.find(s => 
      s.name.toLowerCase() === supplementName.toLowerCase()
    );
    
    if (exactMatch) return exactMatch;
    
    // Try partial match
    return supplements.find(s => 
      s.name.toLowerCase().includes(supplementName.toLowerCase()) ||
      supplementName.toLowerCase().includes(s.name.toLowerCase())
    );
  }, [supplements, supplementName]);

  // Don't render special highlighting if no matching supplement found
  if (!matchingSupplement) {
    return <>{children}</>;
  }

  const handleAddToStack = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addItem(matchingSupplement);
    setAdded(true);
    
    // Reset added state after 2 seconds
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <span className="relative inline-flex items-center group">
      <span className="font-medium text-primary">{children}</span>
      <button
        onClick={handleAddToStack}
        disabled={added}
        className={`ml-1 inline-flex items-center gap-1 rounded-full ${
          added 
            ? 'bg-success/10 text-success' 
            : 'bg-primary/10 text-primary hover:bg-primary/20'
        } px-2 py-0.5 text-xs font-medium transition-colors`}
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

/**
 * Function to wrap supplement names in the HighlightedSupplement component
 */
export function highlightSupplements(content: string, supplementNames: string[]): React.ReactNode {
  if (!supplementNames.length) return content;
  
  // Create a regex to match any of the supplement names
  const regex = new RegExp(`\\b(${supplementNames.join('|')})\\b`, 'gi');
  
  // Split the content by the regex and keep the separators
  const parts = content.split(regex);
  const result: React.ReactNode[] = [];
  
  let i = 0;
  let matchIndex = 0;
  
  // Build the result array with highlighted supplements
  while (i < parts.length) {
    // Add the regular text
    result.push(parts[i]);
    i++;
    
    // If there's a match (separator), add it with highlighting
    if (i < parts.length) {
      const match = content.match(regex)?.[matchIndex];
      
      if (match) {
        // Find the supplement that matches this name
        const supplementName = match;
        
        result.push(
          <HighlightedSupplement 
            key={`supplement-${matchIndex}`} 
            supplementName={supplementName}
          >
            {parts[i]}
          </HighlightedSupplement>
        );
        
        matchIndex++;
      } else {
        // Just add the text without highlighting
        result.push(parts[i]);
      }
      
      i++;
    }
  }
  
  return <>{result}</>;
}