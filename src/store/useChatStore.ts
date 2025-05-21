import { create } from 'zustand';
import { chatApi, ChatMessage } from '../api/chatApi';
import { logError } from '../utils/logger';

interface ChatState {
  messages: ChatMessage[];
  chatHistory: any[];
  loading: boolean;
  error: string | null;
  
  // Actions
  sendMessage: (message: string, userId?: string) => Promise<string | null>;
  clearMessages: () => void;
  fetchChatHistory: (userId: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  chatHistory: [],
  loading: false,
  error: null,
  
  sendMessage: async (message, userId) => {
    set({ loading: true, error: null });
    
    try {
      // Add user message to state
      const userMessage: ChatMessage = {
        role: 'user',
        content: message,
        timestamp: new Date()
      };
      
      set({ messages: [...get().messages, userMessage] });
      
      // Format messages for the API
      const apiMessages = get().messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      // Send message to API
      const response = await chatApi.sendMessage([...apiMessages, {
        role: 'user',
        content: message
      }], userId);
      
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
      
      return response;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to send message';
      logError('Error sending chat message', err);
      set({ error: errorMessage, loading: false });
      return null;
    }
  },
  
  clearMessages: () => {
    set({ messages: [] });
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
  }
}));