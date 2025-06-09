/**
 * Utility functions for processing text for speech synthesis
 */

/**
 * Prepares text for speech synthesis by adding pauses and improving pronunciation
 * @param text The text to prepare
 * @returns Processed text optimized for speech synthesis
 */
export function prepareTextForSpeech(text: string): string {
  if (!text) return '';
  
  // Add pauses after sentences
  let processed = text.replace(/([.!?])\s+/g, '$1<break time="500ms"/> ');
  
  // Add pauses after commas
  processed = processed.replace(/,\s+/g, ',<break time="300ms"/> ');
  
  // Add pauses for bullet points and list items
  processed = processed.replace(/[-•*]\s+/g, '<break time="300ms"/>$& ');
  
  // Add emphasis to important health terms
  const healthTerms = [
    'magnesium', 'vitamin', 'supplement', 'protein', 'carbohydrate', 'fat',
    'sleep', 'exercise', 'recovery', 'metabolism', 'glucose', 'insulin',
    'cortisol', 'melatonin', 'circadian rhythm'
  ];
  
  // Create a regex pattern for all health terms with word boundaries
  const healthTermsPattern = new RegExp(`\\b(${healthTerms.join('|')})\\b`, 'gi');
  
  // Add slight emphasis to health terms
  processed = processed.replace(healthTermsPattern, '<emphasis level="moderate">$1</emphasis>');
  
  return processed;
}

/**
 * Truncates text to a maximum length suitable for speech synthesis
 * @param text The text to truncate
 * @param maxLength Maximum length in characters
 * @returns Truncated text with proper sentence ending
 */
export function truncateForSpeech(text: string, maxLength: number = 4000): string {
  if (!text || text.length <= maxLength) return text;
  
  // Find the last sentence boundary before maxLength
  const truncated = text.substring(0, maxLength);
  const lastSentenceEnd = Math.max(
    truncated.lastIndexOf('.'),
    truncated.lastIndexOf('!'),
    truncated.lastIndexOf('?')
  );
  
  if (lastSentenceEnd === -1) {
    // If no sentence boundary found, find the last space
    const lastSpace = truncated.lastIndexOf(' ');
    return lastSpace === -1 ? truncated : truncated.substring(0, lastSpace) + '...';
  }
  
  return truncated.substring(0, lastSentenceEnd + 1);
}