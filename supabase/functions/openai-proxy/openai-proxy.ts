import OpenAI from "openai";

 codex/deploy-patched-openai-proxy-function
const apiKey = Deno.env.get("OPENAI_API_KEY");

if (!apiKey) {
  console.error("OPENAI_API_KEY is missing");
  throw new Error("OPENAI_API_KEY not configured");
}

const openai = new OpenAI({
  apiKey,
});

const OPENAI_KEY = Deno.env.get("OPENAI_API_KEY");

if (!OPENAI_KEY) {
  console.error("Missing OPENAI_API_KEY in Supabase environment.");
  throw new Error("OPENAI_API_KEY not set");
}

const openai = new OpenAI({ apiKey: OPENAI_KEY });
 main

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
 codex/deploy-patched-openai-proxy-function
    return new Response(
      JSON.stringify({ error: "AI service failure", details: message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );

    return new Response(JSON.stringify({
      error: "AI service failure",
      details: err instanceof Error ? err.message : "Unknown error",
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
 main
  }
});
