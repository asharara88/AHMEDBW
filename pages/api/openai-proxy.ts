// pages/api/openai-proxy.ts
import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

function getApiKey(req: NextApiRequest): string | undefined {
  // Priority: env var -> header -> query param
  const envKey = process.env.OPENAI_API_KEY;
  if (envKey) return envKey;

  const headerKey = req.headers["x-openai-key"] as string | undefined;
  if (headerKey) return headerKey;

  if (req.query.apiKey && typeof req.query.apiKey === "string") {
    return req.query.apiKey;
  }

  return undefined;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = getApiKey(req);

  if (!apiKey) {
    console.error("OPENAI_API_KEY is missing");
    return res.status(500).json({ error: "OPENAI_API_KEY not configured" });
  }

  const openai = new OpenAI({ apiKey });

  const messages = req.body.messages;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages,
      temperature: 0.7,
    });
    res.status(200).json({ result: completion.choices[0].message.content });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("OpenAI Proxy Error:", error);
    res.status(500).json({ error: message || "Failed to fetch from OpenAI" });
  }
}

