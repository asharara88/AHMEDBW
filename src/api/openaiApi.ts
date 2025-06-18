// src/api/openaiApi.ts
import { ApiError, ErrorType } from './apiClient';
import { logError } from '../utils/logger';

export const openaiApi = {
  async createChatCompletion(messages: any[], options: any = {}) {
    try {
      // We'll use the Supabase Edge Function to proxy requests to OpenAI
      // This way we don't need the API key in the frontend
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("Missing Supabase configuration");
      }

      // Prepare headers
      const headers: Record<string, string> = {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      };
      
      // If we have an OpenAI API key in the frontend, add it as fallback
      const frontendApiKey = import.meta.env.VITE_OPENAI_API_KEY;
      if (frontendApiKey) {
        headers['x-openai-key'] = frontendApiKey;
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/openai-proxy`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          messages,
          context: options.context,
          options: {
            temperature: options.temperature,
            max_tokens: options.max_tokens,
            model: options.model || "gpt-4",
            response_format: options.response_format,
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `OpenAI API request failed: ${response.statusText}`);
      }

      return response.json();
    } catch (err) {
      logError('Error in OpenAI API createChatCompletion', err);
      throw err;
    }
  },
  
  // Add the missing generateResponse function
  async generateResponse(prompt: string, context?: Record<string, any>): Promise<string> {
    try {
      // Format messages for the API
      const messages = [
        { role: 'user', content: prompt }
      ];
      
      // Call the createChatCompletion method with context in options
      const data = await this.createChatCompletion(messages, { context });
      
      // Extract and return the response
      return data.choices?.[0]?.message?.content || 'No response generated';
    } catch (err) {
      logError('Error in OpenAI API', err);
      const apiError: ApiError = {
        type: ErrorType.SERVER,
        message: err instanceof Error ? err.message : 'Failed to generate response',
        originalError: err,
      };
      throw apiError;
    }
  },
  
  async processOnboarding(messages: any[]): Promise<string> {
    try {
      // Add system message for onboarding
      const systemMessage = { 
        role: 'system', 
        content: 'You are a friendly onboarding assistant for Biowell. Ask questions one at a time to help the user complete their profile. Be conversational and engaging.' 
      };
      
      const formattedMessages = [systemMessage, ...messages];
      
      // Call the API
      const data = await this.createChatCompletion(formattedMessages, { temperature: 0.7 });
      
      // Return the response
      return data.choices?.[0]?.message?.content || 'What is your name?';
    } catch (err) {
      logError('Error processing onboarding', err);
      throw err;
    }
  },
  
  async extractOnboardingData(messages: any[]): Promise<any> {
    try {
      // Create a system prompt for data extraction
      const systemPrompt = {
        role: 'system',
        content: `Extract structured data from the conversation. Return a JSON object with the following fields:
          - firstName: User's first name
          - lastName: User's last name
          - gender: User's gender (if mentioned)
          - mainGoal: User's main health goal (if mentioned)
          - healthGoals: Array of health goals (if mentioned)
          - supplementHabits: Array of supplements they currently take (if mentioned)
          
          Only include fields that you have information for. If a field is not mentioned in the conversation, don't include it.`
      };
      
      // Call the API with the system prompt and conversation history
      const data = await this.createChatCompletion(
        [systemPrompt, ...messages],
        { 
          temperature: 0,
          response_format: { type: 'json_object' }
        }
      );
      
      // Parse the JSON response
      const content = data.choices?.[0]?.message?.content || '{}';
      return JSON.parse(content);
    } catch (err) {
      logError('Error extracting onboarding data', err);
      throw err;
    }
  }
};