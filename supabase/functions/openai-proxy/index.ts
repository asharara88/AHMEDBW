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
    // Extract OpenAI API key from environment variables
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("Missing OpenAI API key");
    }

    // Get request data
    const requestData = await req.json().catch(() => {
      throw new Error("Invalid request body");
    });
    const { messages, context } = requestData;

    // Validate messages
    if (!messages || !Array.isArray(messages)) {
      throw new Error("Invalid or missing messages");
    }

    // Get auth info
    let userId = null;
    let userData = null;

    // Check for Authorization header
    const authHeader = req.headers.get("Authorization");
    const apiKey = req.headers.get("apikey") || req.headers.get("x-api-key");

    // If we have valid auth, try to get user data
    if (authHeader || apiKey) {
      try {
        // Create Supabase client
        const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
        
        if (!supabaseUrl || !supabaseKey) {
          console.error("Supabase configuration is missing");
        } else {
          const supabase = createClient(supabaseUrl, supabaseKey);

          // Try to get user from token if Authorization header is present
          if (authHeader && authHeader.startsWith("Bearer ")) {
            const token = authHeader.split(" ")[1];
            
            const { data: { user }, error } = await supabase.auth.getUser(token);
            
            if (!error && user) {
              userId = user.id;
              
              // Fetch user profile
              const { data: profile } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", userId)
                .single();
                
              if (profile) {
                userData = profile;
              }
            }
          }
        }
      } catch (error) {
        console.error("Error getting user data:", error);
        // Continue execution even if user data fetch fails
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
      // Add additional context if provided
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
        model: "gpt-4",
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `OpenAI API call failed: ${response.status}`);
    }

    // Return OpenAI response
    const data = await response.json();
    
    // Store the chat history if we have a valid user ID
    if (userId) {
      try {
        const userMessage = messages[messages.length - 1].content;
        const assistantResponse = data.choices?.[0]?.message?.content || "";
        
        // Create Supabase client
        const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
        
        if (supabaseUrl && supabaseKey) {
          const supabase = createClient(supabaseUrl, supabaseKey);
          
          await supabase.from("chat_history").insert({
            user_id: userId,
            message: userMessage,
            response: assistantResponse
          });
        }
      } catch (error) {
        console.error("Failed to store chat history:", error);
      }
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing request:", error);
    
    return new Response(
      JSON.stringify({ 
        error: {
          message: error.message || "Internal server error",
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