 // Follow this setup guide to integrate the Deno runtime and use the OpenAI API:
 // https://supabase.com/docs/guides/functions/openai-api
 
 import { createClient } from "npm:@supabase/supabase-js";
 
 const corsHeaders = {
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Methods": "POST, OPTIONS",
+  "Access-Control-Allow-Headers":
+    "Content-Type, Authorization, apikey, x-api-key, accept-profile, x-client-info",
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
