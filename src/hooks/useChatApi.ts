import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export function useChatApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (messages: { role: string; content: string }[], userId?: string) => {
    setLoading(true);
    setError(null);

    try {
      // Validate Supabase URL
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl) {
        throw new Error("Supabase URL is missing. Please check your environment variables.");
      }

      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      
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

      console.log("Sending chat request to:", endpoint);

      // Use a timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      try {
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
          try {
            const errorData = await response.json();
            if (errorData.error?.message) {
              errorMessage = errorData.error.message;
            }
          } catch (parseError) {
            console.error("Error parsing error response:", parseError);
          }

          console.error(`Chat API request failed with status ${response.status}`);
          // Handle specific status codes
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

      console.error(`Chat API request failed with status ${response.status}`);
        // Handle specific status codes
        switch (response.status) {
          case 401:
            throw new Error("Authentication failed. Please try logging in again.");
          case 404:
            throw new Error("Chat service endpoint not found. Please try again later.");
          case 429:
            throw new Error("Too many requests. Please wait a moment and try again.");
          default:
            throw new Error(errorMessage);
        }
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || "";
    } catch (err: any) {
      console.error("Chat API error:", err);
      
      let errorMessage: string;
      if (err.name === 'AbortError') {
        errorMessage = "Request timed out. The server took too long to respond.";
      } else if (err instanceof TypeError && err.message === "Failed to fetch") {
        errorMessage = "Network error: Unable to connect to the chat service. Please check your internet connection and ensure the Supabase Edge Function is deployed.";
      } else if (err.message.includes("Supabase URL") || err.message.includes("Anon Key")) {
        errorMessage = "Configuration error: Supabase settings are missing or invalid.";
      } else {
        errorMessage = err.message || "Failed to connect to chat service. Please try again.";
      }

      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { sendMessage, loading, error };
}