/**
 * Utility functions for speech synthesis and audio processing
 */

/**
 * Analyzes text to determine optimal chunking for speech synthesis
 * @param text The text to analyze
 * @returns An array of text chunks that can be processed separately
 */
export function chunkTextForSpeech(text: string, maxChunkLength: number = 300): string[] {
  if (!text) return [];
  if (text.length <= maxChunkLength) return [text];
  
  // Split text into sentences
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  
  const chunks: string[] = [];
  let currentChunk = '';
  
  for (const sentence of sentences) {
    // If adding this sentence would exceed the max length, start a new chunk
    if (currentChunk.length + sentence.length > maxChunkLength && currentChunk.length > 0) {
      chunks.push(currentChunk);
      currentChunk = sentence;
    } else {
      currentChunk += sentence;
    }
  }
  
  // Add the last chunk if it's not empty
  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }
  
  return chunks;
}

/**
 * Detects the language of a text
 * @param text The text to analyze
 * @returns The detected language code (e.g., 'en', 'es', 'fr')
 */
export function detectLanguage(text: string): string {
  // This is a simple implementation that could be replaced with a more sophisticated one
  // For now, we'll just check for common patterns in different languages
  
  // Spanish patterns
  const spanishPatterns = [
    /\b(el|la|los|las|un|una|unos|unas)\b/i,
    /\b(es|está|son|están)\b/i,
    /\b(y|o|pero|porque|como|cuando|donde|si)\b/i,
  ];
  
  // French patterns
  const frenchPatterns = [
    /\b(le|la|les|un|une|des)\b/i,
    /\b(est|sont|être|avoir)\b/i,
    /\b(et|ou|mais|parce que|comme|quand|où|si)\b/i,
  ];
  
  // Count matches for each language
  let spanishMatches = 0;
  let frenchMatches = 0;
  
  spanishPatterns.forEach(pattern => {
    if (pattern.test(text)) spanishMatches++;
  });
  
  frenchPatterns.forEach(pattern => {
    if (pattern.test(text)) frenchMatches++;
  });
  
  // Determine language based on matches
  if (spanishMatches > frenchMatches && spanishMatches > 1) return 'es';
  if (frenchMatches > spanishMatches && frenchMatches > 1) return 'fr';
  
  // Default to English
  return 'en';
}

/**
 * Converts a Blob to an ArrayBuffer
 * @param blob The Blob to convert
 * @returns Promise resolving to an ArrayBuffer
 */
export function blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(blob);
  });
}

/**
 * Concatenates multiple audio blobs into a single blob
 * @param blobs Array of audio blobs to concatenate
 * @param mimeType The MIME type of the resulting blob
 * @returns Promise resolving to a concatenated Blob
 */
export async function concatenateAudioBlobs(blobs: Blob[], mimeType: string = 'audio/mpeg'): Promise<Blob> {
  // Convert blobs to array buffers
  const arrayBuffers = await Promise.all(blobs.map(blobToArrayBuffer));
  
  // Calculate total length
  const totalLength = arrayBuffers.reduce((total, buffer) => total + buffer.byteLength, 0);
  
  // Create a new array buffer with the total length
  const result = new Uint8Array(totalLength);
  
  // Copy data from each array buffer
  let offset = 0;
  arrayBuffers.forEach(buffer => {
    result.set(new Uint8Array(buffer), offset);
    offset += buffer.byteLength;
  });
  
  // Create a new blob from the result
  return new Blob([result], { type: mimeType });
}

/**
 * Adjusts audio playback speed
 * @param audioBuffer The AudioBuffer to adjust
 * @param speed The playback speed (1.0 is normal)
 * @returns A new AudioBuffer with adjusted speed
 */
export function adjustAudioSpeed(audioContext: AudioContext, audioBuffer: AudioBuffer, speed: number): AudioBuffer {
  if (speed === 1.0) return audioBuffer;
  
  const channels = audioBuffer.numberOfChannels;
  const newLength = Math.floor(audioBuffer.length / speed);
  const newBuffer = audioContext.createBuffer(channels, newLength, audioBuffer.sampleRate);
  
  for (let channel = 0; channel < channels; channel++) {
    const oldData = audioBuffer.getChannelData(channel);
    const newData = newBuffer.getChannelData(channel);
    
    for (let i = 0; i < newLength; i++) {
      const oldIndex = Math.floor(i * speed);
      if (oldIndex < audioBuffer.length) {
        newData[i] = oldData[oldIndex];
      }
    }
  }
  
  return newBuffer;
}