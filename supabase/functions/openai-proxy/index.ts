diff --git a/src/supabase/functions/openai-proxy.ts b/src/supabase/functions/openai-proxy.ts
index 96410dc..d8154c9 100644
--- a/src/supabase/functions/openai-proxy.ts
+++ b/src/supabase/functions/openai-proxy.ts
@@ -1,34 +1,36 @@
 // Follow this setup guide to integrate the Deno runtime and use the OpenAI API:
 // https://supabase.com/docs/guides/functions/openai-api
 
 import { createClient } from "npm:@supabase/supabase-js";
 
 const corsHeaders = {
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Methods": "POST, OPTIONS",
-  "Access-Control-Allow-Headers": "Content-Type, Authorization",
+  "Access-Control-Allow-Headers":
+    "Content-Type, Authorization, apikey, accept-profile, x-client-info, x-api-key",
+  "Access-Control-Allow-Credentials": "true",
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
