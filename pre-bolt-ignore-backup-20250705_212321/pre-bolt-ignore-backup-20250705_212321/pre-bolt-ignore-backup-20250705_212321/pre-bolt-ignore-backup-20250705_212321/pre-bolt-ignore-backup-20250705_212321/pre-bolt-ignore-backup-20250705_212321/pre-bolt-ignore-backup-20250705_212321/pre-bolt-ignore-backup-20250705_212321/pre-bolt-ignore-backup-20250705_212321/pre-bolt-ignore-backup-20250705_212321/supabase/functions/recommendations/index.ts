import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openaiApiKey = Deno.env.get('OPENAI_API_KEY')!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function handler(req: Request): Promise<Response> {
  const { userId, userQuestion } = await req.json();

  const { data: userMetrics, error } = await supabase
    .from('user_metrics')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  }

  const prompt = `
  User metrics:
  - Sleep hours: ${userMetrics.sleep_hours}
  - Deep sleep: ${userMetrics.deep_sleep_minutes} minutes
  - Daily steps: ${userMetrics.daily_steps}
  - Calories burned: ${userMetrics.calories_burned}
  - BMI: ${userMetrics.bmi}
  - Activity goal: ${userMetrics.activity_goal}

  User question: "${userQuestion}"

  Provide clear, actionable, personalized recommendations based on the provided metrics.
  `;

  const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${openaiApiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300,
    }),
  });

  const gptData = await openaiResponse.json();

  return new Response(JSON.stringify({ reply: gptData.choices[0].message.content }), { status: 200 });
}

if (import.meta.main) {
  serve(handler);
}
