import OpenAI from 'openai';
import { apiClient, ApiError, ErrorType } from './apiClient';
import { logError } from '../utils/logger';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Only for development, in production use Edge Functions
});

// System prompt for the health coach
const SYSTEM_PROMPT = `You are Biowell AI, a personalized health coach focused on providing evidence-based health advice and supplement recommendations.

Your role is to:
- Provide personalized health advice based on user data and goals
- Make evidence-based supplement and lifestyle recommendations
- Help users understand their health metrics and trends
- Suggest actionable steps for health optimization

Guidelines:
- Always base recommendations on scientific research
- Consider the user's health data, goals, and conditions
- Be honest about limitations of current research
- Avoid making diagnostic or strong medical claims
- Defer to healthcare professionals for medical issues
- Focus on lifestyle, nutrition, exercise, and well-researched supplements
- Provide specific, actionable advice when possible
- Maintain a supportive and encouraging tone

Remember: You're a coach and guide, not a replacement for medical care.`;

// Onboarding system prompt
const ONBOARDING_PROMPT = `You are Biowell AI's onboarding assistant. Your goal is to collect essential information from new users in a conversational way.

Information to collect:
1. First name and last name
2. Gender (options: male, female, prefer not to say)
3. Main health goal (e.g., improve sleep, increase energy, reduce stress)
4. Health areas of focus (multiple selections allowed)
5. Current supplement usage (if any)

Guidelines:
- Be friendly, conversational, and concise
- Ask one question at a time
- Provide clear options when appropriate
- Acknowledge and confirm the user's responses
- If the user provides multiple pieces of information at once, process them all and move to the next question
- At the end, summarize the collected information and confirm it's correct

Remember: This is the user's first interaction with Biowell, so make it welcoming and helpful.`;

export const openaiApi = {
  /**
   * Generate a response using OpenAI
   */
  async generateResponse(prompt: string, context?: Record<string, any>): Promise<string> {
    try {
      const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ];
      
      // Add context if provided
      if (context) {
        messages.splice(1, 0, {
          role: 'system',
          content: `User Context: ${JSON.stringify(context)}`
        });
      }
      
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: messages as any,
        temperature: 0.7,
        max_tokens: 1000
      });
      
      return response.choices[0]?.message?.content || 'No response generated';
    } catch (error: any) {
      logError('OpenAI API error', error);
      
      const apiError: ApiError = {
        type: ErrorType.SERVER,
        message: error.message || 'Failed to generate response',
        originalError: error
      };
      
      throw apiError;
    }
  },
  
  /**
   * Process onboarding conversation
   */
  async processOnboarding(messages: any[]): Promise<string> {
    try {
      const formattedMessages = [
        { role: 'system', content: ONBOARDING_PROMPT },
        ...messages
      ];
      
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: formattedMessages as any,
        temperature: 0.7,
        max_tokens: 500
      });
      
      return response.choices[0]?.message?.content || 'No response generated';
    } catch (error: any) {
      logError('OpenAI API error during onboarding', error);
      
      const apiError: ApiError = {
        type: ErrorType.SERVER,
        message: error.message || 'Failed to process onboarding',
        originalError: error
      };
      
      throw apiError;
    }
  },
  
  /**
   * Extract structured data from onboarding conversation
   */
  async extractOnboardingData(messages: any[]): Promise<any> {
    try {
      const extractionPrompt = `
        Based on the conversation history, extract the following user information in JSON format:
        - firstName: string
        - lastName: string
        - gender: string (male, female, or not_specified)
        - mainGoal: string
        - healthGoals: string[] (array of health focus areas)
        - supplementHabits: string[] (array of supplements they currently take)
        
        Return ONLY valid JSON with these fields, nothing else.
      `;
      
      const formattedMessages = [
        ...messages,
        { role: 'user', content: extractionPrompt }
      ];
      
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: formattedMessages as any,
        temperature: 0,
        max_tokens: 500,
        response_format: { type: 'json_object' }
      });
      
      const content = response.choices[0]?.message?.content || '{}';
      return JSON.parse(content);
    } catch (error: any) {
      logError('OpenAI API error extracting onboarding data', error);
      
      const apiError: ApiError = {
        type: ErrorType.SERVER,
        message: error.message || 'Failed to extract onboarding data',
        originalError: error
      };
      
      throw apiError;
    }
  }
};