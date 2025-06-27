import { supabase } from '../lib/supabaseClient';
import { logError } from '../utils/logger';

export const sendChatMessage = async (messages: any[]) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      throw new Error('Authentication required');
    }
    
    // Build proper headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
    };
    
    // SECURITY NOTE: OpenAI API key should be handled in the backend/edge function
    // Do not expose API keys in the frontend - they should be stored securely in the backend
    
    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-assistant`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({ messages }),
        credentials: 'include'
      }
    );
    
    if (!res.ok) {
      let errorData;
      try {
        errorData = await res.json();
      } catch (e) {
        errorData = { error: { message: `HTTP error! status: ${res.status}` } };
      }
      
      // Log detailed error for debugging
      logError('Chat assistant error', { 
        status: res.status, 
        statusText: res.statusText,
        errorData
      });
      
      // User-friendly error message
      let errorMessage = 'Request failed';
      if (errorData && errorData.error) {
        if (errorData.error.message.includes('API key')) {
          errorMessage = 'AI service is not configured properly. Please contact support.';
        } else if (errorData.error.message.includes('rate limit')) {
          errorMessage = 'Too many requests. Please try again shortly.';
        } else {
          errorMessage = errorData.error.message || `Error: ${res.status}`;
        }
      } else {
        errorMessage = `Request failed with status ${res.status}`;
      }
      
      throw new Error(errorMessage);
    }
    
    return await res.json();
  } catch (error) {
    // Re-throw with improved message if it's not already an Error object
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to communicate with the AI service');
  }
};