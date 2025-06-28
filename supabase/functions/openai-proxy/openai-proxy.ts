/// <reference types="https://deno.land/x/deno@v1.28.0/cli/dts/lib.deno.d.ts" />

import OpenAI from "openai";

const apiKey = Deno.env.get("OPENAI_API_KEY");

if (!apiKey) {
  console.error("OPENAI_API_KEY is missing");
  throw new Error("OPENAI_API_KEY not configured");
}

const openai = new OpenAI({
  apiKey,
});

Deno.serve(async (req) => {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Invalid messages format" }), { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages,
      temperature: 0.7,
    });

    const content = completion.choices?.[0]?.message?.content;

    if (!content) {
      return new Response(JSON.stringify({ error: "No response from AI" }), { status: 502 });
    }

    return new Response(JSON.stringify({ result: content }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Proxy error:", err);
    
    return new Response(
      JSON.stringify({ error: "AI service failure", details: message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
});
