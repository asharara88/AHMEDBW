// Follow this setup guide to integrate the Deno runtime and use the OpenAI API:
// https://supabase.com/docs/guides/functions/openai-api

import { createClient } from "npm:@supabase/supabase-js";

function getCorsHeaders(origin: string | null) {
  return {
    "Access-Control-Allow-Origin": origin ?? "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, apikey, x-api-key, accept-profile, x-client-info",
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
    // Try to get OpenAI API key from environment, then from request headers as fallback
    let OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    
    // If not available in environment, check if it was passed in the request headers
    if (!OPENAI_API_KEY) {
      const apiKeyHeader = req.headers.get("x-openai-key");
      if (apiKeyHeader) {
        OPENAI_API_KEY = apiKeyHeader;
      } else {
        // As a last resort, try to get it from query parameters
        const url = new URL(req.url);
        OPENAI_API_KEY = url.searchParams.get("apiKey") || '';
      }
    }
    
    // If we still don't have an API key, throw an error
    if (!OPENAI_API_KEY) {
      throw new Error("Missing OpenAI API key");
    }

    // Get request data
    const { messages, context, options = {} } = await req.json();

    // Prepare messages for OpenAI API
    const formattedMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      // Add context if provided
      ...(context ? [{ role: "system", content: `Context: ${JSON.stringify(context)}` }] : []),
      ...messages,
    ];

    // Call OpenAI API
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
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || `OpenAI API call failed with status ${response.status}`);
    }

    // Return OpenAI response
    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Function error:", error);
    
    return new Response(
      JSON.stringify({ 
        error: {
          message: error.message || "An unexpected error occurred",
          type: error.name,
          status: 500
        }
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});