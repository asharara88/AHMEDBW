import { createClient } from "npm:@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
  "Access-Control-Max-Age": "86400",
  "Access-Control-Allow-Credentials": "true"
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

// Demo responses based on user's health data
const DEMO_RESPONSES = {
  "what's my current health status": `Here's an analysis of your current health metrics:

| Metric | Value | Status | Trend |
|--------|--------|--------|--------|
| Health Score | 82/100 | Good | ↑ +4% |
| Sleep Quality | 85% | Optimal | ↑ +15% |
| Recovery Score | 88/100 | Excellent | ↑ +5% |
| Daily Steps | 8,432 | Near Target | → |

### Key Insights
1. Sleep quality has improved significantly
2. Recovery metrics show good adaptation
3. Activity level is approaching targets

### Recommendations
1. Morning Activity
   - Add 1,500 steps to reach 10,000 goal
   - Consider morning walk routine

2. Recovery Optimization
   - Maintain current sleep schedule
   - Continue stress management practices`,

  "how can i improve my sleep quality": `Based on your sleep data, here are structured recommendations:

| Current Metric | Your Value | Target Range | Status |
|---------------|------------|--------------|---------|
| Deep Sleep | 1.8 hrs | 1.5-2.0 hrs | ✓ Good |
| Sleep Duration | 7.2 hrs | 7-9 hrs | ! Improve |
| Sleep Timing | 11:30 PM | 10:00-10:30 PM | ! Adjust |

### Recommended Protocol

1. Pre-Sleep Routine
   | Time | Activity | Purpose |
   |------|----------|----------|
   | 2 hrs before | Reduce blue light | Melatonin production |
   | 1 hr before | Light stretching | Physical relaxation |
   | 30 min before | Meditation | Mental relaxation |

2. Environment Optimization
   - Temperature: 65-68°F
   - Lighting: Blackout curtains
   - Sound: White noise or silence

3. Supplement Support
   | Supplement | Dosage | Timing |
   |------------|---------|---------|
   | Magnesium | 300-400mg | 1 hr before bed |
   | L-Theanine | 200mg | 30 min before bed |`,

  "what supplements should i take": `Based on your health profile, here are evidence-based recommendations:

### Core Supplements
| Supplement | Daily Dosage | Benefits | Timing |
|------------|--------------|-----------|---------|
| Vitamin D3+K2 | 5000 IU D3, 100mcg K2 | Immune & bone health | With breakfast |
| Magnesium | 300-400mg | Sleep & stress | Evening |
| Omega-3 | 2-3g | Heart & brain health | With meals |

### Goal-Specific Supplements
| Goal | Supplement | Dosage | Timing |
|------|------------|---------|---------|
| Sleep | Magnesium Glycinate | 300-400mg | 1 hr before bed |
| Recovery | L-Glutamine | 5g | Post-workout |
| Focus | Alpha-GPC | 300mg | Morning |

### Usage Protocol
1. Morning Stack
   - Vitamin D3+K2 with breakfast
   - Alpha-GPC (if focus is priority)

2. Post-Workout
   - L-Glutamine
   - Electrolytes as needed

3. Evening
   - Magnesium Glycinate
   - Omega-3 with dinner`,

  "analyze my nutrition habits": `Based on your recent data:

### Meal Timing Analysis
| Meal | Current Time | Ideal Time | Impact |
|------|--------------|------------|---------|
| Breakfast | 8:30 AM | 7:30 AM | Glucose spike |
| Lunch | 2:00 PM | 1:00 PM | Energy dip |
| Dinner | 8:00 PM | 6:30 PM | Sleep quality |

### Blood Sugar Response
| Metric | Value | Target | Status |
|--------|--------|--------|--------|
| Fasting Glucose | 95 mg/dL | <100 mg/dL | ✓ Good |
| Post-meal Spike | +45 mg/dL | <30 mg/dL | ! High |
| Recovery Time | 3 hours | 2 hours | ! Improve |

### Recommendations
1. Meal Timing
   - Shift dinner earlier by 90 minutes
   - Maintain 4-5 hour gaps between meals

2. Composition Improvements
   | Meal | Current | Recommended Change |
   |------|----------|-------------------|
   | Breakfast | High carb | Add protein first |
   | Lunch | Mixed | More fiber & fats |
   | Dinner | Heavy | Lighter, low carb |`,

  "help me reduce stress": `Here's your personalized stress management plan:

### Current Status
| Metric | Value | Target | Status |
|--------|--------|--------|--------|
| HRV | 45ms | >50ms | ! Improve |
| Resting HR | 68bpm | <65bpm | ! Monitor |
| Sleep Quality | 85% | >85% | ✓ Good |
| Steps | 8,432 | 10,000 | ! Increase |

### Recommended Protocol
1. Morning Routine
   | Time | Activity | Duration |
   |------|----------|----------|
   | Wake | Deep breathing | 5 mins |
   | +15min | Meditation | 10 mins |
   | +30min | Light exercise | 20 mins |

2. Stress Management Tools
   | Technique | Frequency | Duration |
   |-----------|-----------|----------|
   | Box breathing | 3x daily | 5 mins |
   | Walking | 2x daily | 10 mins |
   | Meditation | 1-2x daily | 10 mins |

3. Supplement Support
   | Supplement | Dosage | Timing |
   |------------|---------|---------|
   | Magnesium | 300mg | Evening |
   | L-Theanine | 200mg | As needed |
   | Ashwagandha | 600mg | Morning |`,

  "default": `I understand you're interested in improving your health. Based on your recent metrics, your overall health score is 82/100, with good sleep quality and recovery. Your daily step count is 8,432, approaching the recommended 10,000 steps. What specific aspect of your health would you like to focus on today?`
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
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
      throw new Error("OpenAI API key is not configured");
    }

    // Get request data
    const { messages, userId, context } = await req.json();

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
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

    // For demo mode or development, use predefined responses
    const userMessage = messages[messages.length - 1].content.toLowerCase().trim();
    
    // Find the closest matching demo response
    let responseContent = DEMO_RESPONSES.default;
    for (const [key, value] of Object.entries(DEMO_RESPONSES)) {
      if (userMessage.includes(key) || key.includes(userMessage)) {
        responseContent = value;
        break;
      }
    }

    // Store the chat history if we have a valid user ID
    if (userId) {
      try {
        await supabase.from("chat_history").insert({
          user_id: userId,
          message: messages[messages.length - 1].content,
          response: responseContent
        });
      } catch (error) {
        console.error("Failed to store chat history:", error);
      }
    }

    return new Response(
      JSON.stringify({
        choices: [
          {
            message: {
              role: "assistant",
              content: responseContent,
            },
          },
        ],
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      }
    );
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