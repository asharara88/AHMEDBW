import { useState, useEffect } from 'react';
import { useSupplementStore } from '../store';

// Types for recommendation data
export interface Recommendation {
  supplementName: string;
  supplementId?: string;
  dosage?: string;
  timing?: string;
  evidence?: 'green' | 'yellow' | 'red';
}

/**
 * Hook to parse chat messages and extract supplement recommendations
 */
export function useRecommendationParser(message: string) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const { supplements } = useSupplementStore();
  
  // Parse message for recommendations when message or supplements change
  useEffect(() => {
    if (!message) {
      setRecommendations([]);
      return;
    }
    
    const foundRecommendations: Recommendation[] = [];
    
    // Common patterns for supplement recommendations in AI responses
    const patterns = [
      // "I recommend [supplement] (dosage)"
      /I recommend\s+([A-Za-z0-9\s\-]+)\s+\(([^)]+)\)/gi,
      
      // "[Supplement] ([dosage]) would be beneficial"
      /([A-Za-z0-9\s\-]+)\s+\(([^)]+)\)\s+would be beneficial/gi,
      
      // "Consider taking [supplement] at [dosage]"
      /Consider taking\s+([A-Za-z0-9\s\-]+)\s+at\s+([0-9]+(?:\.[0-9]+)?\s*[a-zA-Z]+)/gi,
      
      // "Try [supplement]"
      /Try\s+([A-Za-z0-9\s\-]+)/gi,
      
      // Green-tier or yellow-tier indications
      /([A-Za-z0-9\s\-]+)\s+\((green|yellow)-tier\)/gi
    ];
    
    // Apply each pattern to extract recommendations
    patterns.forEach(pattern => {
      const matches = [...message.matchAll(pattern)];
      
      matches.forEach(match => {
        const supplementName = match[1].trim();
        const dosage = match[2]?.trim();
        const evidence = match[2] === 'green' ? 'green' : match[2] === 'yellow' ? 'yellow' : undefined;
        
        // Avoid duplicates
        if (!foundRecommendations.some(r => 
          r.supplementName.toLowerCase() === supplementName.toLowerCase()
        )) {
          foundRecommendations.push({
            supplementName,
            dosage,
            evidence
          });
        }
      });
    });
    
    // For each recommendation, try to match it to a supplement in the store
    if (supplements?.length) {
      foundRecommendations.forEach(rec => {
        // Try exact match first
        const exactMatch = supplements.find(s => 
          s.name.toLowerCase() === rec.supplementName.toLowerCase()
        );
        
        if (exactMatch) {
          rec.supplementId = exactMatch.id;
          return;
        }
        
        // Try partial match
        const partialMatch = supplements.find(s => 
          s.name.toLowerCase().includes(rec.supplementName.toLowerCase()) ||
          rec.supplementName.toLowerCase().includes(s.name.toLowerCase())
        );
        
        if (partialMatch) {
          rec.supplementId = partialMatch.id;
        }
      });
    }
    
    setRecommendations(foundRecommendations);
  }, [message, supplements]);
  
  return { recommendations };
}