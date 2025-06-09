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
  
  // Add pauses after sentences with proper SSML
  let processed = text.replace(/([.!?])\s+/g, '$1<break time="750ms"/> ');
  
  // Add pauses after commas
  processed = processed.replace(/,\s+/g, ',<break time="300ms"/> ');
  
  // Add pauses for bullet points and list items
  processed = processed.replace(/[-•*]\s+/g, '<break time="400ms"/>$& ');
  
  // Add pauses for colons and semicolons
  processed = processed.replace(/[:;]\s+/g, '$0<break time="400ms"/> ');
  
  // Add pauses for parentheses
  processed = processed.replace(/\)\s+/g, ')<break time="300ms"/> ');
  
  // Add emphasis to important health terms
  const healthTerms = [
    'magnesium', 'vitamin', 'supplement', 'protein', 'carbohydrate', 'fat',
    'sleep', 'exercise', 'recovery', 'metabolism', 'glucose', 'insulin',
    'cortisol', 'melatonin', 'circadian rhythm', 'omega-3', 'vitamin D',
    'zinc', 'iron', 'calcium', 'potassium', 'fiber', 'antioxidant',
    'inflammation', 'immune', 'gut health', 'microbiome', 'probiotics'
  ];
  
  // Create a regex pattern for all health terms with word boundaries
  const healthTermsPattern = new RegExp(`\\b(${healthTerms.join('|')})\\b`, 'gi');
  
  // Add slight emphasis to health terms
  processed = processed.replace(healthTermsPattern, '<emphasis level="moderate">$1</emphasis>');
  
  // Add prosody for questions to improve intonation
  processed = processed.replace(/([^.!?]*\?)/g, '<prosody rate="95%" pitch="+5%">$1</prosody>');
  
  // Wrap the entire text in speak tags for proper SSML
  processed = `<speak>${processed}</speak>`;
  
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
  
  // Remove any existing SSML tags for length calculation
  const textWithoutTags = text.replace(/<[^>]+>/g, '');
  
  // If the text without tags is already under the limit, return the original
  if (textWithoutTags.length <= maxLength) return text;
  
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

/**
 * Extracts key points from a longer text for summarized speech
 * @param text The full text to extract key points from
 * @param maxPoints Maximum number of key points to extract
 * @returns A shortened version focusing on key points
 */
export function extractKeyPointsForSpeech(text: string, maxPoints: number = 3): string {
  if (!text) return '';
  
  // Split text into sentences
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  
  if (sentences.length <= maxPoints) return text;
  
  // Look for sentences with key indicators
  const keyPhrases = [
    'important', 'key', 'critical', 'essential', 'crucial',
    'recommend', 'suggestion', 'advice', 'should', 'could',
    'benefit', 'improve', 'increase', 'decrease', 'reduce',
    'optimal', 'best', 'effective', 'efficient'
  ];
  
  // Score sentences based on key phrases
  const scoredSentences = sentences.map(sentence => {
    let score = 0;
    keyPhrases.forEach(phrase => {
      if (sentence.toLowerCase().includes(phrase)) {
        score += 1;
      }
    });
    return { sentence, score };
  });
  
  // Sort by score and take top sentences
  const topSentences = scoredSentences
    .sort((a, b) => b.score - a.score)
    .slice(0, maxPoints)
    .map(item => item.sentence);
  
  // Always include the first sentence for context
  if (!topSentences.includes(sentences[0])) {
    topSentences.unshift(sentences[0]);
    topSentences.pop(); // Remove the last one to maintain maxPoints
  }
  
  // Join sentences back together
  return topSentences.join(' ');
}