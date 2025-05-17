// Follow this setup guide to integrate the Deno runtime and use the OpenAI API:
// https://supabase.com/docs/guides/functions/openai-api

import { createClient } from "npm:@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
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

  "how's my metabolic health": `Your metabolic health metrics show:

### Glucose Metrics
| Metric | Your Value | Target Range | Status |
|--------|------------|--------------|--------|
| Time in Range | 85% | >70% | ✓ Good |
| Average Glucose | 102 mg/dL | 70-120 mg/dL | ✓ Good |
| Variability | ±15 mg/dL | <20 mg/dL | ✓ Good |
| Fasting Glucose | 95 mg/dL | <100 mg/dL | ✓ Good |

### Patterns Identified
1. Post-Meal Responses
   - Breakfast spike: +45 mg/dL (target: <30 mg/dL)
   - Lunch response: +35 mg/dL
   - Dinner response: +25 mg/dL (good)

2. Recommendations
   | Meal | Current | Suggested Improvement |
   |------|---------|----------------------|
   | Breakfast | High carb first | Protein before carbs |
   | All meals | Sedentary after | 10-min walk after eating |
   | Evening | Late snacking | Cut off eating by 8pm |

3. Supplement Considerations
   - Berberine: 500mg with meals
   - Chromium: 200mcg daily
   - Apple cider vinegar: 1 tbsp before meals`,

  "what's my heart rate variability": `Your HRV data shows:

### Current Status
| Metric | Value | Previous | Change | Status |
|--------|-------|----------|--------|--------|
| Average HRV | 45ms | 53ms | -8ms | ! Declining |
| Nighttime Peak | 62ms | 75ms | -13ms | ! Declining |
| Morning Readiness | 68/100 | 75/100 | -7 | ! Monitor |

### Factors Affecting Your HRV
1. Identified Stressors
   - Work stress (calendar correlation)
   - Late meals (after 8pm)
   - Screen time before bed

2. Positive Influences
   - Morning exercise sessions
   - Meditation practice (though inconsistent)
   - Good hydration levels

### Improvement Protocol
1. Daily Practices
   | Time | Activity | Duration | Impact |
   |------|----------|----------|--------|
   | Morning | Box breathing | 5 mins | +5ms |
   | Evening | Cold shower | 2-3 mins | +8ms |
   | Bedtime | No screens | 1 hour | +10ms |

2. Supplement Support
   - Magnesium glycinate: 300mg evening
   - Ashwagandha: 600mg morning
   - Omega-3: 2g daily`,

  "how can i improve my energy levels": `Based on your data, here's how to boost your energy:

### Current Energy Patterns
| Time | Energy Level | Factors |
|------|--------------|---------|
| Morning | Moderate (6/10) | Delayed cortisol peak |
| Afternoon | Low (4/10) | Post-lunch dip at 2-3pm |
| Evening | Variable (5-8/10) | Depends on day's stress |

### Root Causes Identified
1. Circadian Rhythm
   - Late sleep onset (11:45pm average)
   - Insufficient morning light exposure
   - Evening blue light exposure

2. Metabolic Factors
   - Post-meal glucose crashes (+45mg/dL then -25mg/dL)
   - Hydration below optimal (tracking shows 1.2L daily)

### Energy Optimization Protocol
1. Morning Routine
   | Time | Activity | Purpose |
   |------|----------|---------|
   | Wake | Sunlight exposure | Cortisol regulation |
   | +30min | Protein-rich breakfast | Stable glucose |
   | +60min | Movement | Circulation & alertness |

2. Supplement Strategy
   | Supplement | Timing | Dosage |
   |------------|--------|--------|
   | B-Complex | Morning | As directed |
   | CoQ10 | With breakfast | 100-200mg |
   | Rhodiola | Mid-morning | 200-400mg |`,

  "what's my sleep quality like": `Your sleep metrics show:

### Current Sleep Profile
| Metric | Your Value | Target Range | Status |
|--------|------------|--------------|--------|
| Total Sleep | 7.2 hrs | 7.5-8.5 hrs | ! Improve |
| Deep Sleep | 1.8 hrs | 1.5-2.0 hrs | ✓ Good |
| REM Sleep | 1.5 hrs | 1.5-2.0 hrs | ! Low End |
| Sleep Efficiency | 85% | >90% | ! Improve |
| Sleep Onset | 32 mins | <20 mins | ! Improve |

### Disruption Patterns
1. Identified Issues
   - Screen time until 30 mins before bed
   - Bedroom temperature too warm (72°F)
   - Late caffeine (2pm coffee)
   - Inconsistent bedtime (varies by 75 mins)

2. Improvement Protocol
   | Factor | Current | Recommended |
   |--------|---------|-------------|
   | Bedtime | 11:30pm ±40min | 10:30pm ±15min |
   | Screen cutoff | 30min before | 90min before |
   | Temperature | 72°F | 65-68°F |
   | Caffeine | Until 2pm | Before 12pm |

3. Supplement Support
   | Supplement | Dosage | Timing | Purpose |
   |------------|--------|--------|---------|
   | Magnesium | 300-400mg | 1hr before bed | Sleep onset |
   | L-theanine | 200mg | 30min before bed | Relaxation |`,

  "how's my recovery": `Your recovery metrics indicate:

### Current Recovery Status
| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Recovery Score | 68/100 | >75/100 | ! Improve |
| Resting HR | 62 BPM | <65 BPM | ✓ Good |
| HRV | 45ms | >50ms | ! Improve |
| Sleep Quality | 85% | >85% | ✓ Good |

### Recovery Patterns
1. Weekly Trends
   - Lower recovery after Tuesday/Thursday workouts
   - Weekend recovery peaks (Saturday morning)
   - Work stress impact visible (calendar correlation)

2. Nutrition Factors
   - Protein intake: 0.7g/kg (target: 1.6g/kg)
   - Hydration: 1.8L daily (target: 3L)
   - Post-workout nutrition often delayed >60 mins

### Optimization Protocol
1. Training Adjustments
   | Day | Current | Recommended |
   |-----|---------|-------------|
   | Mon | High intensity | Keep as is |
   | Tue | Rest | Active recovery |
   | Wed | Moderate | Keep as is |
   | Thu | High intensity | Keep as is |
   | Fri | Moderate | Low intensity |

2. Recovery Support
   - Immediate post-workout protein (within 30 mins)
   - Cold exposure therapy (3 mins, 3x/week)
   - Compression therapy after workouts`,

  "default": `I understand you're interested in improving your health. Based on your recent metrics, your overall health score is 82/100, with good sleep quality and recovery. Your daily step count is 8,432, approaching the recommended 10,000 steps. What specific aspect of your health would you like to focus on today?`
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("Missing OpenAI API key");
    }

    const { messages, userId, context } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    const supabase = createClient(supabaseUrl, supabaseKey);

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

    // For demo mode or regular users, use predefined responses
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
        console.log("Chat history saved for user:", userId);
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
      }
    );
  } catch (error) {
    console.error("Function error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});