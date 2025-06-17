import { useState, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { useError } from "../contexts/ErrorContext";
import { handleApiError, ErrorCode, createErrorObject } from "../utils/errorHandling";

export function useChatApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addError } = useError();

  const sendMessage = async (messages: { role: string; content: string }[], userId?: string) => {
    setLoading(true);
    setError(null);

    try {
      // Validate Supabase URL
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl) {
        const configError = createErrorObject(
          "Supabase URL is missing. Please check your environment variables.",
          'error',
          ErrorCode.API_REQUEST_FAILED,
          'chat-api'
        );
        addError(configError);
        throw new Error(configError.message);
      }

      // Get the current session
      const { data } = await supabase.auth.getSession();
      const session = data?.session;
      
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
      if (!anonKey) {
        console.warn("Supabase Anon Key is missing. This will cause authentication to fail.");
      } else {
        headers["apikey"] = anonKey;
      }

      // Use the chat-assistant endpoint
      const endpoint = `${supabaseUrl}/functions/v1/chat-assistant`;

      // Use a timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      try {
        // Fallback to demo mode data if we can't connect to Supabase
        if (!supabaseUrl || !anonKey) {
          // Wait a moment to simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Return mock response
          const demoResponse = "I'm your health coach. I can help you optimize your health based on your data. What would you like to know?";
          clearTimeout(timeoutId);
          return demoResponse;
        }
        
        const response = await fetch(endpoint, {
          method: "POST",
          headers,
          body: JSON.stringify({ 
            messages, 
            userId: userId || session?.user?.id,
            context: {
              steps: 8432,
              sleep_score: 82,
              goal: "improve deep sleep",
              device: "Apple Watch"
            }
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          // Try to get detailed error message from response
          let errorMessage = `Request failed with status ${response.status}`;
          let errorData = {};
          
          try {
            errorData = await response.json();
            if (errorData.error?.message) {
              errorMessage = errorData.error.message;
            }
          } catch (parseError) {
            console.error("Error parsing error response:", parseError);
          }

          const errorObj = handleApiError({
            status: response.status,
            message: errorMessage,
            ...errorData
          });
          
          addError({
            ...errorObj,
            source: 'chat-api',
            data: { endpoint, status: response.status, ...errorData }
          });

          throw new Error(errorObj.message);
        }

        const data = await response.json();
        return data.choices?.[0]?.message?.content || "";
      } catch (err: any) {
        let errorObj;
        
        if (err.name === 'AbortError') {
          errorObj = createErrorObject(
            "Request timed out. The server took too long to respond.",
            'error',
            ErrorCode.API_TIMEOUT,
            'chat-api'
          );
        } else if (err instanceof TypeError && err.message === "Failed to fetch") {
          // If we can't connect, return a mock response instead of an error for better UX
          clearTimeout(timeoutId);
          console.warn("Network error, falling back to demo mode");
          return "I'm your health coach. I can help you optimize your health based on your data. Due to connection issues, I'm operating in limited mode. What would you like to know?";
        } else if (err.message.includes("Supabase URL") || err.message.includes("Anon Key")) {
          errorObj = createErrorObject(
            "Configuration error: Supabase settings are missing or invalid.",
            'error',
            ErrorCode.API_REQUEST_FAILED,
            'chat-api'
          );
        } else {
          errorObj = handleApiError(err);
        }

        addError({
          ...errorObj,
          source: 'chat-api'
        });
        
        setError(errorObj.message);
        throw new Error(errorObj.message);
      }
    } catch (err: any) {
      console.error("Error in useChatApi:", err);
      setError(err.message || "An unexpected error occurred");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { sendMessage, loading, error, clearError };
}