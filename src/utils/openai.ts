import { supabase } from '../lib/supabaseClient';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000;

async function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function callOpenAiFunction(prompt: string, context?: Record<string, any>): Promise<string> {
  let retries = 0;
  let lastError: Error | null = null;
  console.log("Calling OpenAI function with prompt:", prompt.substring(0, 50) + "...");

  while (retries < MAX_RETRIES) {
    try {
      // Get the current session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      // Construct headers with proper authorization
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "Accept": "application/json"
      };

      // If we have a session, use the access token
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }

      // Always include the anon key as a fallback
      headers["apikey"] = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      // Validate URL format
      try {
        new URL(endpoint);
      } catch (error) {
        throw new Error(`Invalid Supabase URL format: ${supabaseUrl}`);
      }
      
      console.log("Sending OpenAI request to:", endpoint);
      
      // Use the openai-proxy endpoint
      const endpoint = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/openai-proxy`;
      
      const response = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({ 
          messages: [{ role: 'user', content: prompt }],
          context
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
          error: `OpenAI request failed with status ${response.status}` 
        }));
        console.error("OpenAI API error:", errorData);
        throw new Error(errorData.error || errorData.message || `Request failed with status ${response.status}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || "No response received.";
    } catch (error) {
      console.error(`Attempt ${retries + 1} failed:`, error);
      lastError = error instanceof Error ? error : new Error('Unknown error occurred');
      
      // If we get a 429 (rate limit) error, wait and retry
      if (error instanceof Error && error.message.includes('429')) {
        retries++;
        await wait(INITIAL_RETRY_DELAY * Math.pow(2, retries));
        continue;
      }
      
      if (retries >= MAX_RETRIES - 1) break;
      
      retries++;
      await wait(INITIAL_RETRY_DELAY * Math.pow(2, retries));
    }
  }

  throw lastError || new Error('Failed to get response after retries');
}

export async function sendChatMessage(message: string, userId?: string, context?: Record<string, any>): Promise<ChatMessage> {
  try {
    const content = await callOpenAiFunction(message, context);
    
    // Store the chat history if we have a valid user ID
    if (userId) {
      try {
        await supabase.from("chat_history").insert({
          user_id: userId,
          message: message,
          response: content
        });
      } catch (error) {
        console.error("Failed to store chat history:", error);
      }
    }
    
    return {
      role: 'assistant',
      content,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error("Error in chat message:", error);
    throw error;
  }
}