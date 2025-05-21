import { apiClient } from './apiClient';
import { supabase } from '../lib/supabaseClient';
import { logError } from '../utils/logger';
import { openaiApi } from './openaiApi';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

export const chatApi = {
  /**
   * Send a message to the AI assistant
   */
  async sendMessage(messages: ChatMessage[], userId?: string): Promise<string> {
    try {
      // Format messages for the API
      const formattedMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      // Add context data
      const context = {
        steps: 8432,
        sleep_score: 82,
        goal: "improve deep sleep",
        device: "Apple Watch"
      };
      
      // Use OpenAI API directly instead of Supabase Edge Function
      const lastMessage = formattedMessages[formattedMessages.length - 1].content;
      const response = await openaiApi.generateResponse(lastMessage, context);
      
      // Save to chat history if userId is provided
      if (userId) {
        try {
          await this.saveChatMessage(userId, lastMessage, response);
        } catch (error) {
          logError('Failed to save chat message', error);
          // Continue even if saving fails
        }
      }
      
      return response;
    } catch (error) {
      logError('Error in chat message', error);
      throw error;
    }
  },

  /**
   * Fetch chat history for a user
   */
  async getChatHistory(userId: string, limit: number = 10): Promise<any[]> {
    return apiClient.request(
      () => supabase
        .from('chat_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit),
      'Failed to fetch chat history'
    );
  },

  /**
   * Save a chat message and response
   */
  async saveChatMessage(userId: string, message: string, response: string): Promise<void> {
    await apiClient.request(
      () => supabase
        .from('chat_history')
        .insert({
          user_id: userId,
          message,
          response
        }),
      'Failed to save chat message'
    );
  }
};