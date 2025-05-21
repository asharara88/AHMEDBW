import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';
import { logError } from '../utils/logger';

export interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

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
      
      // Get the current session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      // Construct headers with proper authorization
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      // If we have a session, use the access token
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }

      // Always include the anon key
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      if (anonKey) {
        headers["apikey"] = anonKey;
      }

      // Use the chat-assistant endpoint
      const endpoint = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-assistant`;
      
      // Format messages for the API
      const apiMessages = get().messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      // Add the new user message
      apiMessages.push({
        role: 'user',
        content: message
      });

      const response = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({ 
          messages: apiMessages, 
          userId: userId || session?.user?.id,
          context: {
            steps: 8432,
            sleep_score: 82,
            goal: "improve deep sleep",
            device: "Apple Watch"
          }
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        // Try to get detailed error message from response
        let errorMessage = `Request failed with status ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData.error?.message) {
            errorMessage = errorData.error.message;
          }
        } catch (parseError) {
          // If we can't parse the error, use the default message
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      const assistantResponse = data.choices?.[0]?.message?.content || "";
      
      // Add assistant response to state
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: assistantResponse,
        timestamp: new Date()
      };
      
      set({ 
        messages: [...get().messages, assistantMessage],
        loading: false 
      });
      
      return assistantResponse;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
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
      const { data, error } = await supabase
        .from('chat_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      
      set({ chatHistory: data || [], loading: false });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch chat history';
      logError('Error fetching chat history', err);
      set({ error: errorMessage, loading: false });
    }
  }
}));