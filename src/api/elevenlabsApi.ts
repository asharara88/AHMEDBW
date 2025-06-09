import { logError } from '../utils/logger';
import { ApiError, ErrorType } from './apiClient';
import { prepareTextForSpeech, truncateForSpeech } from '../utils/textProcessing';

// Default voice ID for Biowell coach (using "Rachel" voice)
const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM";

// Available voices
export const AVAILABLE_VOICES = [
  { id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel (Female)" },
  { id: "AZnzlk1XvdvUeBnXmlld", name: "Domi (Male)" },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Bella (Female)" },
  { id: "ErXwobaYiN019PkySvjV", name: "Antoni (Male)" },
];

// Voice quality settings
export const VOICE_SETTINGS = {
  STANDARD: {
    stability: 0.5,
    similarity_boost: 0.75
  },
  CLEAR: {
    stability: 0.75,
    similarity_boost: 0.5
  },
  EXPRESSIVE: {
    stability: 0.3,
    similarity_boost: 0.85
  }
};

// Cache for audio responses to reduce API calls
interface CacheEntry {
  blob: Blob;
  timestamp: number;
}

const audioCache = new Map<string, CacheEntry>();
const CACHE_EXPIRY = 1000 * 60 * 60; // 1 hour

export const elevenlabsApi = {
  /**
   * Convert text to speech using ElevenLabs API
   */
  async textToSpeech(text: string, voiceId: string = DEFAULT_VOICE_ID): Promise<Blob> {
    try {
      // Process text for better speech synthesis
      const processedText = prepareTextForSpeech(text);
      
      // Truncate text if it's too long (ElevenLabs has a character limit)
      const truncatedText = truncateForSpeech(processedText);
      
      const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
      
      if (!apiKey) {
        throw new Error('ElevenLabs API key is not configured');
      }
      
      // Generate cache key
      const cacheKey = `${voiceId}:${truncatedText}`;
      
      // Check cache first
      const now = Date.now();
      const cached = audioCache.get(cacheKey);
      
      if (cached && now - cached.timestamp < CACHE_EXPIRY) {
        return cached.blob;
      }
      
      // Clean up expired cache entries
      for (const [key, entry] of audioCache.entries()) {
        if (now - entry.timestamp > CACHE_EXPIRY) {
          audioCache.delete(key);
        }
      }

      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': apiKey
          },
          body: JSON.stringify({
            text: truncatedText,
            model_id: "eleven_monolingual_v1",
            voice_settings: VOICE_SETTINGS.STANDARD
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `ElevenLabs API error: ${response.status}`);
      }

      const blob = await response.blob();
      
      // Cache the result
      audioCache.set(cacheKey, {
        blob,
        timestamp: now
      });
      
      return blob;
    } catch (error: any) {
      logError('ElevenLabs API error', error);
      
      const apiError: ApiError = {
        type: ErrorType.SERVER,
        message: error.message || 'Failed to convert text to speech',
        originalError: error
      };
      
      throw apiError;
    }
  },

  /**
   * Get available voices from ElevenLabs
   */
  async getVoices(): Promise<any[]> {
    try {
      const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
      
      if (!apiKey) {
        return AVAILABLE_VOICES;
      }

      const response = await fetch(
        'https://api.elevenlabs.io/v1/voices',
        {
          headers: {
            'Accept': 'application/json',
            'xi-api-key': apiKey
          }
        }
      );

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }

      const data = await response.json();
      return data.voices || AVAILABLE_VOICES;
    } catch (error) {
      logError('Error fetching ElevenLabs voices', error);
      // Return default voices if API call fails
      return AVAILABLE_VOICES;
    }
  },

  /**
   * Check if the API key is configured
   */
  isConfigured(): boolean {
    return !!import.meta.env.VITE_ELEVENLABS_API_KEY;
  },
  
  /**
   * Clear the audio cache
   */
  clearCache(): void {
    audioCache.clear();
  }
};