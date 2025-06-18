import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { chatApi, ChatMessage } from '../api/chatApi';
import { logError } from '../utils/logger';
import { openaiApi } from '../api/openaiApi'; 
import { elevenlabsApi } from '../api/elevenlabsApi';

export interface ChatState {
  messages: ChatMessage[];
  chatHistory: any[];
  loading: boolean;
  speechLoading: boolean;
  error: string | null;
  audioUrl: string | null;
  preferSpeech: boolean;
  voiceSettings: {
    stability: number;
    similarityBoost: number;
  };
  selectedVoice: string;
  
  // Actions
  sendMessage: (message: string, userId?: string) => Promise<string | null>;
  generateSpeech: (text: string) => Promise<string | null>;
  clearMessages: () => void;
  fetchChatHistory: (userId: string) => Promise<void>;
  setPreferSpeech: (prefer: boolean) => void;
  setSelectedVoice: (voiceId: string) => void;
  updateVoiceSettings: (settings: { stability: number; similarityBoost: number }) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messages: [],
      chatHistory: [],
      loading: false,
      speechLoading: false,
      error: null,
      audioUrl: null,
      preferSpeech: false,
      voiceSettings: {
        stability: 0.5,
        similarityBoost: 0.75
      },
      selectedVoice: "21m00Tcm4TlvDq8ikWAM", // Default voice ID (Rachel)
      
      sendMessage: async (message, userId) => {
        set({ loading: true, error: null });
        
        // Revoke any existing audio URL to free memory
        if (get().audioUrl) {
          URL.revokeObjectURL(get().audioUrl);
        }
        
        try {
          // Add user message to state
          const userMessage: ChatMessage = {
            role: 'user',
            content: message,
            timestamp: new Date()
          };
          
          set({ messages: [...get().messages, userMessage], audioUrl: null });
          
          // Use OpenAI API directly with error handling
          const response = await openaiApi.generateResponse(message, { userId });
          
          // Add assistant response to state
          const assistantMessage: ChatMessage = {
            role: 'assistant',
            content: response,
            timestamp: new Date()
          };
          
          set({ 
            messages: [...get().messages, assistantMessage],
            loading: false 
          });
          
          // Generate speech if preferred
          if (get().preferSpeech) {
            await get().generateSpeech(response);
          }
          
          // Save to chat history if userId is provided
          if (userId) {
            try {
              await chatApi.saveChatMessage(userId, message, response);
            } catch (error) {
              logError('Failed to save chat message', error);
              // Continue even if saving fails
            }
          }
          
          return response;
        } catch (err: any) {
          const errorMessage = err.message || 'Failed to send message';
          logError('Error sending chat message', err);
          set({ error: errorMessage, loading: false });
          return null;
        }
      },
      
      generateSpeech: async (text: string) => {
        // Clear previous audio URL
        if (get().audioUrl) {
          URL.revokeObjectURL(get().audioUrl);
        }
        
        set({ speechLoading: true, audioUrl: null });
        
        try {
          // Check if ElevenLabs is configured
          if (!elevenlabsApi.isConfigured()) {
            throw new Error('Text-to-speech is not configured');
          }
          
          // Get selected voice ID
          const voiceId = get().selectedVoice;
          
          // Generate speech from text
          const audioBlob = await elevenlabsApi.textToSpeech(
            text,
            voiceId,
            {
              stability: get().voiceSettings.stability,
              similarity_boost: get().voiceSettings.similarityBoost,
              style: 0.0,
              use_speaker_boost: true
            }
          );
          
          // Create URL for the audio blob
          const url = URL.createObjectURL(audioBlob);
          set({ audioUrl: url, speechLoading: false });
          
          return url;
        } catch (err: any) {
          logError('Error generating speech', err);
          set({ speechLoading: false });
          return null;
        }
      },
      
      clearMessages: () => {
        // Revoke any existing audio URL to free memory
        if (get().audioUrl) {
          URL.revokeObjectURL(get().audioUrl);
        }
        
        set({ 
          messages: [],
          audioUrl: null
        });
      },
      
      fetchChatHistory: async (userId) => {
        if (!userId) return;
        
        set({ loading: true, error: null });
        
        try {
          const history = await chatApi.getChatHistory(userId);
          set({ chatHistory: history, loading: false });
        } catch (err: any) {
          const errorMessage = err.message || 'Failed to fetch chat history';
          logError('Error fetching chat history', err);
          set({ error: errorMessage, loading: false });
        }
      },
      
      setPreferSpeech: (prefer: boolean) => {
        set({ preferSpeech: prefer });
        
        // If turning off speech, revoke any existing audio URL
        if (!prefer && get().audioUrl) {
          URL.revokeObjectURL(get().audioUrl);
          set({ audioUrl: null });
        }
      },
      
      setSelectedVoice: (voiceId: string) => {
        set({ selectedVoice: voiceId });
      },
      
      updateVoiceSettings: (settings) => {
        set({ voiceSettings: settings });
      }
    }),
    {
      name: 'biowell-chat-storage',
      partialize: (state) => ({
        preferSpeech: state.preferSpeech,
        selectedVoice: state.selectedVoice,
        voiceSettings: state.voiceSettings
      }),
    }
  )
);