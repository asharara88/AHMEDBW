// src/api/openaiApi.ts
import { ApiError, ErrorType } from './apiClient';
import { logError } from '../utils/logger';

export const openaiApi = {
  async createChatCompletion(messages: any[], options: any = {}) {
    // Get the Supabase URL and anon key from environment variables
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase configuration');
    }
    
    const response = await fetch(`${supabaseUrl}/functions/v1/openai-proxy`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey
      },
      body: JSON.stringify({
        messages,
        ...options
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error?.message || `OpenAI API request failed: ${response.statusText}`;
      } catch (e) {
        errorMessage = `OpenAI API request failed: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  },
  
  // Add the missing generateResponse function
  async generateResponse(prompt: string, context?: Record<string, any>): Promise<string> {
    try {
      // Format messages for the API
      const messages = [
        { role: 'system', content: 'You are a helpful health assistant that provides evidence-based advice.' }
      ];
      
      // Add context if provided
      if (context) {
        messages.push({ 
          role: 'system', 
          content: `Context: ${JSON.stringify(context)}` 
        });
      }
      
      // Add user message
      messages.push({ role: 'user', content: prompt });
      
      // Call the createChatCompletion method
      const data = await this.createChatCompletion(messages, { temperature: 0.7 });
      
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
      
      const allMessages = [systemMessage, ...messages];
      
      // Call the API
      const data = await this.createChatCompletion(allMessages, { temperature: 0.7 });
      
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