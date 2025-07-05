// Follow this setup guide to integrate the Deno runtime and use the OpenAI API:
// https://supabase.com/docs/guides/functions/openai-api

import { createClient } from "npm:@supabase/supabase-js";

function getCorsHeaders(origin: string | null) {
  return {
    "Access-Control-Allow-Origin": origin ?? "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, apikey, x-api-key, accept-profile, x-client-info, x-openai-key",
    "Access-Control-Max-Age": "86400",
    "Access-Control-Allow-Credentials": "true",
    "Vary": "Origin",
  };
}

// System prompt to enforce evidence-based recommendations
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

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req.headers.get("origin"));

  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Try to get OpenAI API key from different sources in priority order:
    // 1. Environment variable (set on Supabase)
    // 2. Request header (sent from frontend)
    // 3. Request parameters
    let OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    
    if (!OPENAI_API_KEY) {
      // Try to get from request header
      OPENAI_API_KEY = req.headers.get("x-openai-key");
      
      // If still not found, check URL parameters
      if (!OPENAI_API_KEY) {
        const url = new URL(req.url);
        OPENAI_API_KEY = url.searchParams.get("apiKey");
      }
    }
    
    if (!OPENAI_API_KEY) {
      console.error("Missing OpenAI API key. Available env vars:", Object.keys(Deno.env.toObject()));
      throw new Error("Missing OpenAI API key. Please set the OPENAI_API_KEY secret in your Supabase project using: supabase secrets set OPENAI_API_KEY=your-key");
    }

    // Validate API key format
    if (!OPENAI_API_KEY.startsWith('sk-')) {
      console.error("Invalid OpenAI API key format. Key should start with 'sk-'");
      throw new Error("Invalid OpenAI API key format. Please check your API key.");
    }

    // Get request data
    const { messages, context, options = {} } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      throw new Error("Invalid request: messages array is required");
    }

    // Create Supabase client if we need user data
    let userData = null;
    if (context && context.userId) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      
      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", context.userId)
            .maybeSingle();

          if (!error) {
            userData = data;
          }
        } catch (e) {
          console.error("Error fetching user data:", e);
        }
      }
    }

    // Prepare messages for OpenAI API
    const formattedMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      // Add user context if available
      ...(userData
        ? [
            {
              role: "system",
              content: `User Context: ${JSON.stringify({
                name: userData.first_name
                  ? `${userData.first_name} ${userData.last_name || ""}`
                  : "Anonymous",
                email: userData.email,
                onboarding_completed: userData.onboarding_completed,
              })}`,
            },
          ]
        : []),
      // Add general context if provided
      ...(context ? [{ role: "system", content: `Context: ${JSON.stringify(context)}` }] : []),
      ...messages,
    ];

    console.log("Making request to OpenAI API...");

    // Call OpenAI API with timeout and better error handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: options.model || "gpt-4",
          messages: formattedMessages,
          temperature: options.temperature !== undefined ? options.temperature : 0.7,
          max_tokens: options.max_tokens || 1000,
          response_format: options.response_format,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: { message: errorText } };
        }
        
        console.error("OpenAI API error:", {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });

        // Provide more specific error messages
        if (response.status === 401) {
          throw new Error("Invalid OpenAI API key. Please check your API key configuration.");
        } else if (response.status === 429) {
          throw new Error("OpenAI API rate limit exceeded. Please try again later.");
        } else if (response.status === 402) {
          throw new Error("OpenAI API quota exceeded. Please check your billing and usage limits.");
        } else {
          throw new Error(errorData.error?.message || `OpenAI API call failed with status ${response.status}`);
        }
      }

      // Return OpenAI response
      const data = await response.json();
      console.log("OpenAI API request successful");
      
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        throw new Error("Request timeout: OpenAI API took too long to respond");
      }
      
      throw fetchError;
    }

  } catch (error) {
    console.error("Function error:", error);
    
    // Determine error type and provide helpful message
    let errorMessage = "An unexpected error occurred";
    let statusCode = 500;
    
    if (error.message.includes("API key")) {
      errorMessage = error.message;
      statusCode = 401;
    } else if (error.message.includes("rate limit") || error.message.includes("quota")) {
      errorMessage = error.message;
      statusCode = 429;
    } else if (error.message.includes("timeout")) {
      errorMessage = error.message;
      statusCode = 408;
    } else if (error.message.includes("Invalid request")) {
      errorMessage = error.message;
      statusCode = 400;
    } else {
      errorMessage = error.message || "An unexpected error occurred";
    }
    
    return new Response(
      JSON.stringify({ 
        error: {
          message: errorMessage,
          type: error.name || "UnknownError",
          status: statusCode
        }
      }),
      {
        status: statusCode,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});