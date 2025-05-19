// Follow this setup guide to integrate the Deno runtime and use the OpenAI API:
// https://supabase.com/docs/guides/functions/openai-api

import { createClient } from "npm:@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-api-key",
  "Access-Control-Max-Age": "86400",
  "Access-Control-Allow-Credentials": "true",
};

// System prompt to enforce evidence-based recommendations
const SYSTEM_PROMPT = `You are Biowell AI, a personalized health coach focused on providing evidence-based health advice and supplement recommendations.

Your role is to:
- Provide personalized health advice based on user data and goals
- Make evidence-based supplement and lifestyle recommendations
- Help users understand their health metrics and trends
- Suggest actionable steps for health optimization

Response Format Guidelines:
1. For metric analysis or comparisons, use markdown tables
2. For recommendations, use numbered lists with clear categories
3. For supplement suggestions, structure as:
   | Supplement | Dosage | Benefits | Timing |
   |------------|---------|-----------|---------|
4. For health insights, break down into clear sections using markdown headers

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
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Get the authorization header and apikey
    const authHeader = req.headers.get('Authorization');
    const apiKey = req.headers.get('apikey') || req.headers.get('x-api-key');

    if (!authHeader && !apiKey) {
      return new Response(
        JSON.stringify({ error: { message: "Authorization header or API key is required" } }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse the request body
    const { messages, userId, context } = await req.json();

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase configuration is missing");
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user data if userId is provided
    let userData = null;
    if (userId) {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (!error) {
        userData = data;
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
      ...messages,
    ];

    // Get OpenAI API key from environment variables
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("Missing OpenAI API key");
    }

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "OpenAI API call failed");
    }

    // Get the response from OpenAI
    const data = await response.json();
    const responseContent = data.choices?.[0]?.message?.content || "";

    // Store the chat history if we have a valid user ID
    if (userId) {
      try {
        await supabase.from("chat_history").insert({
          user_id: userId,
          message: messages[messages.length - 1].content,
          response: responseContent
        });
        console.log("Chat history saved for user:", userId);
      } catch (error) {
        console.error("Failed to store chat history:", error);
      }
    }

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