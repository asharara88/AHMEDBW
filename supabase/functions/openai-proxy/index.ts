import { serve } from 'https://deno.land/std/http/server.ts';

const openaiApiKey = Deno.env.get('OPENAI_API_KEY'); // stored in .env or Supabase secrets

serve(async (req) => {
  const auth = req.headers.get('authorization');
  
  // Optional: verify Supabase JWT if you want role-level control
  if (!auth || !auth.startsWith('Bearer ')) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Optional: Check custom bearer token if you want stricter control
  // if (auth !== `Bearer ${YOUR_PRIVATE_API_TOKEN}`) {
  //   return new Response('Forbidden', { status: 403 });
  // }

  const payload = await req.json();

  const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: payload.messages
    })
  });

  const result = await openaiResponse.json();

  return new Response(JSON.stringify(result), {
    headers: { 'Content-Type': 'application/json' }
  });
});