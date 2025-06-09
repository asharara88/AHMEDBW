import { logError } from '../utils/logger';
import { ApiError, ErrorType } from './apiClient';
import { prepareTextForSpeech, truncateForSpeech } from '../utils/textProcessing';
import { chunkTextForSpeech, concatenateAudioBlobs } from '../utils/speechUtils';
import { audioCacheApi } from './audioCacheApi';
import { supabase } from '../lib/supabaseClient';
import { chunkTextForSpeech, concatenateAudioBlobs } from '../utils/speechUtils';
import { audioCacheApi } from './audioCacheApi';

// Default voice ID for Biowell coach (using "Rachel" voice)
const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM";

// Available voices
export const AVAILABLE_VOICES = [
  { id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel (Female)" },
  { id: "AZnzlk1XvdvUeBnXmlld", name: "Domi (Male)" },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Bella (Female)" },
  { id: "ErXwobaYiN019PkySvjV", name: "Antoni (Male)" }
];

// Voice quality settings
export const VOICE_SETTINGS = {
  STANDARD: {
    stability: 0.5,
    similarity_boost: 0.75,
    style: 0.0,
    use_speaker_boost: true
  },
  CLEAR: {
    stability: 0.75,
    similarity_boost: 0.5,
    style: 0.0,
    use_speaker_boost: true
  },
  EXPRESSIVE: {
    stability: 0.3,
    similarity_boost: 0.85,
    style: 0.7,
    use_speaker_boost: true
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
   * Convert text to speech using ElevenLabs API with caching
   */
  async textToSpeech(
    text: string, 
    voiceId: string = DEFAULT_VOICE_ID, 
    voiceSettings = VOICE_SETTINGS.STANDARD
  ): Promise<Blob> {
    try {
      // Process text for better speech synthesis
      const processedText = prepareTextForSpeech(text);
      
      const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
      
      if (!apiKey) {
        throw new Error('ElevenLabs API key is not configured');
      }
      
      // Check if user has remaining character quota
      const userInfo = await this.getUserInfo().catch(() => null);
      if (userInfo && userInfo.character_limit && userInfo.character_count >= userInfo.character_limit) {
        throw new Error('Character limit exceeded. Please try again later.');
      }
      
      // Check if text is too long and needs chunking
      if (processedText.length > 5000) {
        // Split into chunks and process each separately
        const chunks = chunkTextForSpeech(processedText);
        const audioBlobs: Blob[] = [];
        
        for (const chunk of chunks) {
          // Generate cache key for this chunk
          const chunkCacheKey = `voice:${voiceId}:${chunk.substring(0, 50)}`;
          
          // Check memory cache first
          const now = Date.now();
          const cached = audioCache.get(chunkCacheKey);
          
          if (cached && now - cached.timestamp < CACHE_EXPIRY) {
            audioBlobs.push(cached.blob);
            continue;
          }
          
          // Try to get from database cache if user is authenticated
          const userId = supabase.auth.getUser().then(({ data }) => data.user?.id).catch(() => null);
          try {
            if (userId) {
              const cachedBlob = await audioCacheApi.getAudio(await userId, chunkCacheKey);
              if (cachedBlob) {
                audioCache.set(chunkCacheKey, { blob: cachedBlob, timestamp: now });
                audioBlobs.push(cachedBlob);
                continue;
              }
            }
          } catch (err) { 
            /* Continue if cache retrieval fails */ 
          }
          
          // Generate speech for this chunk
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
                text: chunk,
                model_id: "eleven_monolingual_v1",
                voice_settings: voiceSettings
              })
            }
          );
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `ElevenLabs API error: ${response.status}`);
          }
          
          const blob = await response.blob();
          
          // Cache the chunk
          audioCache.set(chunkCacheKey, { blob, timestamp: now });
          audioBlobs.push(blob);
          
          // Store in database cache if user is authenticated
          try {
            if (userId) {
              await audioCacheApi.storeAudio(await userId, chunkCacheKey, blob, 60);
            }
          } catch (err) { 
            /* Ignore storage errors */ 
          }
        }
        
        // Concatenate all audio blobs
        return concatenateAudioBlobs(audioBlobs);
      }
      
      // For shorter text, process normally
      // Check if user has remaining character quota
      const userInfo = await this.getUserInfo().catch(() => null);
      if (userInfo && userInfo.character_limit && userInfo.character_count >= userInfo.character_limit) {
        throw new Error('Character limit exceeded. Please try again later.');
      }
      
      // Check if text is too long and needs chunking
      if (processedText.length > 5000) {
        // Split into chunks and process each separately
        const chunks = chunkTextForSpeech(processedText);
        const audioBlobs: Blob[] = [];
        
        for (const chunk of chunks) {
          // Generate cache key for this chunk
          const chunkCacheKey = `voice:${voiceId}:${chunk.substring(0, 50)}`;
          
          // Check memory cache first
          const now = Date.now();
          const cached = audioCache.get(chunkCacheKey);
          
          if (cached && now - cached.timestamp < CACHE_EXPIRY) {
            audioBlobs.push(cached.blob);
            continue;
          }
          
          // Try to get from database cache if user is authenticated
          const userId = supabase.auth.getUser().then(({ data }) => data.user?.id).catch(() => null);
          try {
            if (userId) {
              const cachedBlob = await audioCacheApi.getAudio(await userId, chunkCacheKey);
              if (cachedBlob) {
                audioCache.set(chunkCacheKey, { blob: cachedBlob, timestamp: now });
                audioBlobs.push(cachedBlob);
                continue;
              }
            }
          } catch (err) { 
            /* Continue if cache retrieval fails */ 
          }
          
          // Generate speech for this chunk
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
                text: chunk,
                model_id: "eleven_monolingual_v1",
                voice_settings: voiceSettings
              })
            }
          );
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `ElevenLabs API error: ${response.status}`);
          }
          
          const blob = await response.blob();
          
          // Cache the chunk
          audioCache.set(chunkCacheKey, { blob, timestamp: now });
          audioBlobs.push(blob);
          
          // Store in database cache if user is authenticated
          try {
            if (userId) {
              await audioCacheApi.storeAudio(await userId, chunkCacheKey, blob, 60);
            }
          } catch (err) { 
            /* Ignore storage errors */ 
          }
        }
        
        // Concatenate all audio blobs
        return concatenateAudioBlobs(audioBlobs);
      }
      
      // For shorter text, process normally
      const truncatedText = truncateForSpeech(processedText);
      const cacheKey = `voice:${voiceId}:${truncatedText.substring(0, 50)}`;
      
      // Check memory cache first
      const now = Date.now();
      const cached = audioCache.get(cacheKey);
      
      if (cached && now - cached.timestamp < CACHE_EXPIRY) {
        return cached.blob;
      }
      
      // Try to get from database cache if user is authenticated
      const userId = supabase.auth.getUser().then(({ data }) => data.user?.id).catch(() => null);
      try {
        if (userId) {
          const cachedBlob = await audioCacheApi.getAudio(await userId, cacheKey);
          if (cachedBlob) {
            audioCache.set(cacheKey, { blob: cachedBlob, timestamp: now });
          }
        }
      } catch (err) {
        /* Continue if cache retrieval fails */
      }
      
      // Try to get from database cache if user is authenticated
      const userId = supabase.auth.getUser().then(({ data }) => data.user?.id).catch(() => null);
      try {
        if (userId) {
          const cachedBlob = await audioCacheApi.getAudio(await userId, cacheKey);
          if (cachedBlob) {
            audioCache.set(cacheKey, { blob: cachedBlob, timestamp: now });
            return cachedBlob;
          }
        }
      } catch (err) {
        /* Continue if cache retrieval fails */
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
            voice_settings: voiceSettings
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `ElevenLabs API error: ${response.status}`);
      }

      const blob = await response.blob();
      
      // Cache the result in memory
      audioCache.set(cacheKey, {
        blob,
        timestamp: now
      });
      
      // Store in database cache if user is authenticated
      try {
        if (userId) {
          await audioCacheApi.storeAudio(await userId, cacheKey, blob, 60);
        }
      } catch (err) {
        /* Ignore storage errors */
      }
      
      
      // Store in database cache if user is authenticated
      try {
        if (userId) {
          await audioCacheApi.storeAudio(await userId, cacheKey, blob, 60);
        }
      } catch (err) {
        /* Ignore storage errors */
      }
      
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
   * Get user information including character limits
   */
  async getUserInfo(): Promise<any> {
    const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
    
    if (!apiKey) {
      throw new Error('ElevenLabs API key is not configured');
    }

    const response = await fetch('https://api.elevenlabs.io/v1/user', {
      headers: {
        'Accept': 'application/json',
        'xi-api-key': apiKey
      }
    });

    if (!response.ok) throw new Error(`ElevenLabs API error: ${response.status}`);
    return response.json();
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
   * Get voice settings for a specific voice
   */
  async getVoiceSettings(voiceId: string): Promise<any> {
    try {
      const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
      if (!apiKey) return VOICE_SETTINGS.STANDARD;

      const response = await fetch(`https://api.elevenlabs.io/v1/voices/${voiceId}/settings`, {
        headers: { 'xi-api-key': apiKey }
      });

      if (!response.ok) return VOICE_SETTINGS.STANDARD;
      return await response.json();
    } catch (error) {
      return VOICE_SETTINGS.STANDARD;
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