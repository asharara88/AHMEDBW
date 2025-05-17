// Follow this setup guide to integrate the Deno runtime and use the OpenAI API:
// https://supabase.com/docs/guides/functions/openai-api

import { createClient } from "npm:@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

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

const DEMO_RESPONSES = {
  "what's my current health status": "Based on your recent metrics, your overall health score is 82/100. Your sleep quality has improved by 15% this week, and your recovery score is strong at 88/100. Your daily step count (8,432) is approaching the recommended 10,000 steps. Consider adding a morning walk to reach this goal.",
  "how can i improve my sleep quality": "Looking at your sleep data, here are personalized recommendations:\n\n1. Optimize your sleep timing:\n   - Your deep sleep is currently 1.8 hours\n   - Aim for consistent bedtime around 10:30 PM\n\n2. Pre-sleep routine:\n   - Reduce blue light exposure 2 hours before bed\n   - Consider magnesium supplementation\n   - Practice relaxation techniques\n\n3. Environment:\n   - Keep bedroom temperature between 65-68°F\n   - Use blackout curtains\n   - Minimize noise disruptions\n\nWould you like more specific details about any of these recommendations?",
  "what supplements should i take": "Based on your health profile and goals, here are evidence-based recommendations:\n\n1. Core Supplements:\n   - Vitamin D3 + K2: Support immune function and bone health\n   - Magnesium: Improve sleep and stress management\n   - Omega-3: Support heart and brain health\n\n2. Goal-Specific:\n   - For sleep: Magnesium glycinate (300-400mg) before bed\n   - For recovery: L-Glutamine (5g post-workout)\n\nWould you like more details about dosages or specific products?",
  "analyze my nutrition habits": "Based on your recent data:\n\n1. Meal Timing:\n   - Late evening meals may be affecting sleep quality\n   - Consider eating dinner 3 hours before bedtime\n\n2. Blood Sugar Response:\n   - Morning glucose spikes noted\n   - Try adding protein to breakfast\n\n3. Recommendations:\n   - Increase fiber intake\n   - Add more lean protein\n   - Consider tracking meals in the app\n\nWould you like a more detailed nutrition plan?",
  "help me reduce stress": "Here's a personalized stress management plan:\n\n1. Current Status:\n   - Your HRV indicates moderate stress levels\n   - Sleep quality is impacted\n\n2. Recommendations:\n   - Morning meditation (start with 5 minutes)\n   - Regular exercise (you're at 8,432 steps - great!)\n   - Deep breathing exercises\n   - Consider adaptogenic supplements\n\nWould you like to explore any of these strategies in detail?",
  "default": "I understand you're interested in improving your health. Could you provide more specific details about your goals or concerns? This will help me give you more targeted advice based on your health data and personal objectives."
};

Deno.serve(async (req) => {
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
    const { messages, userId } = await req.json();

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
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

    // For demo mode, use predefined responses
    if (userData?.is_demo) {
      const userMessage = messages[messages.length - 1].content.toLowerCase().trim();
      const response = DEMO_RESPONSES[userMessage] || DEMO_RESPONSES.default;

      return new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                role: "assistant",
                content: response,
              },
            },
          ],
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
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

    // Return OpenAI response
    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});