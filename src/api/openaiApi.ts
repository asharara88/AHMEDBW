// src/api/openaiApi.ts
import { ApiError, ErrorType } from './apiClient';
import { logError } from '../utils/logger';
import { supabase } from '../lib/supabaseClient';

export const openaiApi = {
  async createChatCompletion(messages: any[], options: any = {}) {
    try {
      // Get the current session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      // Prepare headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // Add authorization if we have a session
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      
      // Always include the anon key
      headers['apikey'] = import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      // Optional: Add OpenAI API key if available in frontend env
      const frontendApiKey = import.meta.env.VITE_OPENAI_API_KEY;
      if (frontendApiKey) {
        headers['x-openai-key'] = frontendApiKey;
      }
      
      const supabaseUrl = import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
      
      if (!supabaseUrl) {
        throw new Error('Missing Supabase URL configuration');
      }

      if (!import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        throw new Error('Missing Supabase anon key configuration');
      }
      
      let response;
      try {
        console.log('Making request to Edge Function:', `${supabaseUrl}/functions/v1/openai-proxy`);
        
        response = await fetch(
          `${supabaseUrl}/functions/v1/openai-proxy`,
          {
            method: 'POST',
            headers,
            body: JSON.stringify({
              messages,
              context: options.context,
              options: {
                temperature: options.temperature,
                max_tokens: options.max_tokens,
                model: options.model || 'gpt-4',
                response_format: options.response_format,
              },
            }),
          }
        );
      } catch (networkError) {
        console.error('Network request failed:', networkError);
        logError('Network request failed', networkError);
        
        // Provide more specific error messages based on the error type
        let errorMessage = 'Unable to reach AI service. Please check your connection.';
        
        if (networkError instanceof TypeError && networkError.message.includes('Failed to fetch')) {
          errorMessage = 'Connection failed. Please check if the Supabase Edge Function is deployed and your network connection is stable.';
        }
        
        throw {
          type: ErrorType.NETWORK,
          message: errorMessage,
          originalError: networkError,
        } as ApiError;
      }

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { error: { message: `HTTP error! status: ${response.status}` } };
        }
        
        let errorMessage = 'AI service request failed';
        
        if (errorData.error && errorData.error.message) {
          if (errorData.error.message.includes('API key')) {
            errorMessage = 'AI service is not properly configured. Please ensure the OpenAI API key is set correctly.';
          } else if (errorData.error.message.includes('rate limit')) {
            errorMessage = 'Too many requests. Please try again in a moment.';
          } else if (errorData.error.message.includes('quota')) {
            errorMessage = 'Service temporarily unavailable. Please try again later.';
          } else if (errorData.error.message.includes('timeout')) {
            errorMessage = 'Request timed out. Please try again.';
          } else {
            errorMessage = errorData.error.message;
          }
        }
        
        console.error('Edge Function error:', { 
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        
        logError('Edge Function error', { 
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        
        const apiError: ApiError = {
          type: ErrorType.SERVER,
          message: errorMessage,
          status: response.status,
          originalError: errorData,
        };

        // Convert certain status codes to authentication errors
        if (response.status === 401 || response.status === 403) {
          apiError.type = ErrorType.AUTHENTICATION;
        }

        throw apiError;
      }

      const data = await response.json();
      console.log('OpenAI API request successful');
      return data;
    } catch (err) {
      if (err instanceof Error || (err && typeof err === 'object' && 'type' in err)) {
        throw err; // Re-throw if already a proper Error object or ApiError
      }
      throw new Error('Unexpected error communicating with AI service');
    }
  },
  
  async generateResponse(prompt: string, context?: Record<string, any>): Promise<string> {
    try {
      // Format messages for the API
      const messages = [
        { role: 'user', content: prompt }
      ];
      
      // Call the createChatCompletion method with context in options
      const data = await this.createChatCompletion(messages, { context });
      
      // Extract and return the response
      if (!data || !data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response format from AI service');
      }
      
      return data.choices[0].message.content || 'No response generated';
    } catch (err) {
      console.error('Error in OpenAI API:', err);
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