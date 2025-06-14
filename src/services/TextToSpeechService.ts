import { ErrorCode, createErrorObject } from '../utils/errorHandling';

export interface TTSOptions {
  voice?: string;
  rate?: number;
  pitch?: number;
  language?: string;
  volume?: number;
}

export class TextToSpeechService {
  private static instance: TextToSpeechService;
  private synthesis: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  
  private constructor() {
    if (typeof window !== 'undefined') {
      this.synthesis = window.speechSynthesis;
      this.loadVoices();
      
      // Set up voice change listener
      if (this.synthesis) {
        this.synthesis.onvoiceschanged = this.loadVoices.bind(this);
      }
    }
  }
  
  public static getInstance(): TextToSpeechService {
    if (!TextToSpeechService.instance) {
      TextToSpeechService.instance = new TextToSpeechService();
    }
    return TextToSpeechService.instance;
  }
  
  private loadVoices(): void {
    if (this.synthesis) {
      this.voices = this.synthesis.getVoices();
    }
  }
  
  public getVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }
  
  public getVoicesByLanguage(language: string): SpeechSynthesisVoice[] {
    return this.voices.filter(voice => voice.lang.startsWith(language));
  }
  
  // Clean text for better speech synthesis
  private cleanTextForSpeech(text: string): string {
    return text
      // Remove markdown formatting
      .replace(/#{1,6}\s+/g, '') // Remove headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.*?)\*/g, '$1') // Remove italic
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links
      .replace(/`{1,3}([\s\S]*?)`{1,3}/g, '$1') // Remove code blocks
      // Handle tables and lists
      .replace(/\|.*?\|/g, '') // Remove table rows
      .replace(/\-{3,}/g, '') // Remove table separators
      .replace(/^\s*[\-\*]\s+/gm, '') // Remove list bullets
      .replace(/^\s*\d+\.\s+/gm, '') // Remove numbered list markers
      // Clean up whitespace
      .replace(/\n\n+/g, '. ') // Replace multiple newlines with period
      .replace(/\n/g, ' ') // Replace single newlines with space
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      // Handle common symbols
      .replace(/&/g, 'and')
      .replace(/</g, 'less than')
      .replace(/>/g, 'greater than')
      // Add pauses for better speech flow
      .replace(/\./g, '. ')
      .replace(/\!/g, '! ')
      .replace(/\?/g, '? ')
      .replace(/:/g, ': ')
      .replace(/;/g, '; ')
      .trim();
  }
  
  // Function to break text into sentences for better TTS experience
  private breakIntoSentences(text: string): string[] {
    // Split text by sentence endings (., !, ?) followed by a space or newline
    const sentences = text.match(/[^.!?]+[.!?]+[\s\n]*/g) || [];
    
    // If no sentences found or text is short, return the whole text
    if (sentences.length === 0 || text.length < 100) {
      return [text];
    }
    
    // Group sentences into chunks of reasonable length (200-300 chars)
    const chunks: string[] = [];
    let currentChunk = '';
    
    for (const sentence of sentences) {
      if (currentChunk.length + sentence.length > 300) {
        chunks.push(currentChunk.trim());
        currentChunk = sentence;
      } else {
        currentChunk += sentence;
      }
    }
    
    // Add the last chunk if it's not empty
    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }
    
    return chunks;
  }
  
  // Speak text with given options
  public speak(text: string, options?: TTSOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error('Speech synthesis not available'));
        return;
      }
      
      try {
        // Cancel any ongoing speech
        this.stop();
        
        // Clean the text
        const cleanedText = this.cleanTextForSpeech(text);
        const textChunks = this.breakIntoSentences(cleanedText);
        
        let currentChunkIndex = 0;
        
        // Function to speak each chunk sequentially
        const speakNextChunk = () => {
          if (currentChunkIndex >= textChunks.length) {
            resolve();
            return;
          }
          
          const chunk = textChunks[currentChunkIndex];
          const utterance = new SpeechSynthesisUtterance(chunk);
          
          // Set options
          if (options) {
            if (options.rate !== undefined) utterance.rate = options.rate;
            if (options.pitch !== undefined) utterance.pitch = options.pitch;
            if (options.volume !== undefined) utterance.volume = options.volume;
            if (options.language) utterance.lang = options.language;
            
            // Set voice if provided
            if (options.voice) {
              const selectedVoice = this.voices.find(v => v.name === options.voice);
              if (selectedVoice) {
                utterance.voice = selectedVoice;
              }
            }
          }
          
          // Set up events
          utterance.onend = () => {
            currentChunkIndex++;
            speakNextChunk();
          };
          
          utterance.onerror = (event) => {
            reject(new Error(`Speech synthesis error: ${event.error}`));
          };
          
          // Save current utterance for potential cancellation
          this.currentUtterance = utterance;
          
          // Start speaking
          this.synthesis.speak(utterance);
          
          // Handle iOS Safari issues with auto-play policies
          if (this.synthesis.paused) {
            this.synthesis.resume();
          }
        };
        
        // Start with the first chunk
        speakNextChunk();
        
        // Safari/iOS workaround - reissue the speak command if nothing happens
        setTimeout(() => {
          if (!this.synthesis?.speaking && !this.synthesis?.pending) {
            speakNextChunk();
          }
        }, 250);
        
      } catch (error) {
        reject(error);
      }
    });
  }
  
  // Stop speaking
  public stop(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
      this.currentUtterance = null;
    }
  }
  
  // Pause speaking
  public pause(): void {
    if (this.synthesis) {
      this.synthesis.pause();
    }
  }
  
  // Resume speaking
  public resume(): void {
    if (this.synthesis) {
      this.synthesis.resume();
    }
  }
  
  // Check if speech synthesis is supported
  public static isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }
  
  // Check if currently speaking
  public isSpeaking(): boolean {
    return this.synthesis?.speaking || false;
  }
}

export default TextToSpeechService;