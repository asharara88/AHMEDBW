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