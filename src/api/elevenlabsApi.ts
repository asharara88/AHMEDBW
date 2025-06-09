import { logError } from '../utils/logger';
import { ApiError, ErrorType } from './apiClient';

// Initialize with API key from environment variables
const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;

// Default voice ID for Biowell coach (using "Rachel" voice)
const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM";

// Available voices
export const AVAILABLE_VOICES = [
  { id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel (Female)" },
  { id: "AZnzlk1XvdvUeBnXmlld", name: "Domi (Male)" },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Bella (Female)" },
  { id: "ErXwobaYiN019PkySvjV", name: "Antoni (Male)" },
];

export const elevenlabsApi = {
  /**
   * Convert text to speech using ElevenLabs API
   */
  async textToSpeech(text: string, voiceId: string = DEFAULT_VOICE_ID): Promise<Blob> {
    try {
      if (!ELEVENLABS_API_KEY) {
        throw new Error('ElevenLabs API key is not configured');
      }

      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': ELEVENLABS_API_KEY
          },
          body: JSON.stringify({
            text,
            model_id: "eleven_monolingual_v1",
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75
            }
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `ElevenLabs API error: ${response.status}`);
      }

      return await response.blob();
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
      if (!ELEVENLABS_API_KEY) {
        return AVAILABLE_VOICES;
      }

      const response = await fetch(
        'https://api.elevenlabs.io/v1/voices',
        {
          headers: {
            'Accept': 'application/json',
            'xi-api-key': ELEVENLABS_API_KEY
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
    return !!ELEVENLABS_API_KEY;
  }
};