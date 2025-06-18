// src/api/openaiApi.ts
import { ApiError, ErrorType } from './apiClient';
import { logError } from '../utils/logger';
import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from '../store';

export const openaiApi = {
  async createChatCompletion(messages: any[], options: any = {}) {
    try {
      // Get the current user session for proper authentication
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      const isDemo = useAuthStore.getState().isDemo;
      
      // Set up the request headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // Add authentication if we have a session or we're in demo mode
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      } else if (!isDemo) {
        // Only throw auth error if not in demo mode
        throw new Error('Authentication required');
      }
      
      // Always include the apikey for Supabase
      headers['apikey'] = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      // Prepare the request body
      const body: any = {
        messages,
        ...options
      };
      
      // Add user ID if available
      if (session?.user?.id) {
        body.userId = session.user.id;
      } else if (isDemo) {
        body.userId = '00000000-0000-0000-0000-000000000000';
      }

      // Make the API call
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/openai-proxy`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `OpenAI API request failed: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      // Log the error for debugging
      logError('OpenAI API error', error);
      
      // If we're in demo mode, return a mock response
      if (useAuthStore.getState().isDemo) {
        return mockDemoResponse(messages[messages.length - 1]?.content);
      }
      
      // Re-throw with appropriate error type
      throw error;
    }
  },
  
  // Add the missing generateResponse function
  async generateResponse(prompt: string, context?: Record<string, any>): Promise<string> {
    try {
      // Format messages for the API
      const messages = [];
      
      // Add context if provided
      if (context) {
        messages.push({ 
          role: 'system', 
          content: `Context: ${JSON.stringify(context)}` 
        });
      }
      
      // Add the user's prompt
      messages.push({ role: 'user', content: prompt });
      
      // Call the createChatCompletion method
      const data = await this.createChatCompletion(messages);
      
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

// Helper function to generate demo responses
function mockDemoResponse(prompt: string): any {
  const defaultResponse = {
    choices: [
      {
        message: {
          content: "I'm here to help with your health and wellness questions. Since you're in demo mode, I'm providing a simulated response. In the full version, you'll get personalized advice based on your health data."
        }
      }
    ]
  };

  // Map of common questions to canned responses for demo mode
  const demoResponses: Record<string, string> = {
    "health status": "Based on your demo data, your overall health score is 82/100. Your sleep quality has improved by 15% this week, and your recovery score is strong at 88/100. Your daily step count (8,432) is approaching the recommended 10,000 steps. Consider adding a morning walk to reach this goal.",
    "improve sleep": "To improve your sleep quality, I recommend: 1) Maintain a consistent sleep schedule, 2) Avoid screens 1 hour before bed, 3) Consider magnesium glycinate (300-400mg) before bedtime, and 4) Keep your bedroom cool (65-68°F) and dark.",
    "supplements": "Based on your demo profile, I recommend considering: 1) Magnesium glycinate for sleep quality, 2) Vitamin D3+K2 for immune support, and 3) Omega-3 for cognitive function. All these are green-tier supplements with strong clinical evidence.",
    "metabolism": "Your metabolic health metrics show good glucose control with 85% time-in-range. To further optimize, consider: 1) Taking a 10-minute walk after meals, 2) Starting your meal with protein and fiber before carbs, and 3) Maintaining your 12-hour eating window.",
  };

  // Check if the prompt contains any keywords from our demo responses
  for (const [keyword, response] of Object.entries(demoResponses)) {
    if (prompt.toLowerCase().includes(keyword)) {
      return {
        choices: [
          {
            message: {
              content: response
            }
          }
        ]
      };
    }
  }

  // Default response if no keywords match
  return defaultResponse;
}