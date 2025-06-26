import { assertEquals } from 'https://deno.land/std@0.168.0/testing/asserts.ts';
import { stub } from 'https://deno.land/std@0.168.0/testing/mock.ts';

Deno.test({ name: 'handler returns recommendation from OpenAI', sanitizeOps: false, sanitizeResources: false }, async () => {
  // Stub Supabase createClient
  const metrics = {
    sleep_hours: 7,
    deep_sleep_minutes: 90,
    daily_steps: 8000,
    calories_burned: 2100,
    bmi: 23,
    activity_goal: 'maintenance'
  };
  const supabaseData = metrics;

  // Stub fetch for OpenAI
  const originalFetch = globalThis.fetch;
  globalThis.fetch = ((input: any) => {
    const url = typeof input === 'string' ? input : input.url;
    if (url.includes('api.openai.com')) {
      return Promise.resolve(new Response(
        JSON.stringify({ choices: [{ message: { content: 'do more exercise' } }] }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      ));
    }
    // supabase metrics request
    return Promise.resolve(new Response(
      JSON.stringify(supabaseData),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    ));
  }) as typeof fetch;

  const { handler } = await import('./index.ts');

  const req = new Request('http://localhost', {
    method: 'POST',
    body: JSON.stringify({ userId: '1', userQuestion: 'how to improve health?' })
  });

  const res = await handler(req);
  const body = await res.json();

  assertEquals(body.reply, 'do more exercise');

  globalThis.fetch = originalFetch;
});
