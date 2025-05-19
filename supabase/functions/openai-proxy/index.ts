 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/supabase/functions/openai-proxy/index.ts b/supabase/functions/openai-proxy/index.ts
index c124361..a3a9cf9 100644
--- a/supabase/functions/openai-proxy/index.ts
+++ b/supabase/functions/openai-proxy/index.ts
@@ -1,35 +1,36 @@
 // Follow this setup guide to integrate the Deno runtime and use the OpenAI API:
 // https://supabase.com/docs/guides/functions/openai-api
 
 import { createClient } from "npm:@supabase/supabase-js";
 
 const corsHeaders = {
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Methods": "POST, OPTIONS",
-  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
-  "Access-Control-Allow-Credentials": "true"
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
 
 Deno.serve(async (req) => {
   // Handle CORS preflight request
 
EOF
)