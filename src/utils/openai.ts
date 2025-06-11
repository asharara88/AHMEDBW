import { useState } from 'react';
import { callOpenAiFunction } from '../utils/openai';

export function useOpenAi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateResponse = async (prompt: string, context?: Record<string, any>) => {
    setLoading(true);
    setError(null);

    try {
      const response = await callOpenAiFunction(prompt, context);
      return response;
    } catch (err) {
      console.error("OpenAI API error:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to generate response";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { generateResponse, loading, error };
}

export async function callOpenAiFunction(prompt: string, context?: Record<string, any>) {
  try {
    // Validate Supabase URL
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl) {
      throw new Error("Supabase URL is missing. Please check your environment variables.");
    }

    // Construct headers
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Include the anon key
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!anonKey) {
      console.warn("Supabase Anon Key is missing. This will cause authentication to fail.");
    } else {
      headers["apikey"] = anonKey;
    }

    // Use the openai-proxy endpoint
    const endpoint = `${supabaseUrl}/functions/v1/openai-proxy`;

    // Use a timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({ 
          prompt,
          context
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // Try to get detailed error message from response
        let errorMessage = `Request failed with status ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData.error?.message) {
            errorMessage = errorData.error.message;
          }
        } catch (parseError) {
          console.error("Error parsing error response:", parseError);
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data.response || data.content || "No response received";
    } catch (err: any) {
      console.error("OpenAI API error:", err);
      
      let errorMessage: string;
      if (err.name === 'AbortError') {
        errorMessage = "Request timed out. The server took too long to respond.";
      } else if (err instanceof TypeError && err.message === "Failed to fetch") {
        errorMessage = "Network error: Unable to connect to the OpenAI proxy.";
      } else {
        errorMessage = err.message || "Failed to generate response";
      }

      throw new Error(errorMessage);
    }
  } catch (err: any) {
    console.error("Error in callOpenAiFunction:", err);
    throw err;
  }
}